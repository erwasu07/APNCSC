import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { GoogleGenAI, Type } from '@google/genai';
import { SarkariItem } from './data/sarkariData';

export const THUMBNAIL_WIDTH = 2048;
export const THUMBNAIL_HEIGHT = 677;

export interface ThumbnailSpec {
  mainHeadingLeft: string;       // e.g. "JKSSB", "IGNOU", "JKBOSE"
  redBadgeText: string;          // e.g. "CLASS IV", "ADMISSION", "CLASS 10"
  secondHeading: string;         // e.g. "ONLINE APPLICATION", "ONLINE REGISTRATION", "RESULT UPDATE"
  yellowBannerPrefix: string;    // e.g. "Apply Through ", "Admission ", "Check Result "
  yellowBannerHighlight: string; // e.g. "CSC", "Assistance", "Details"
  fourIcons: [string, string, string, string]; // 4 short 2-word/3-word labels
  laptopTitle: string;           // e.g. "JKSSB", "IGNOU", "JKBOSE"
  laptopSubtitle: string;        // e.g. "Online Application Form", "Admission Portal", "Online Result Portal"
  footerLine1: string;           // e.g. "Get Easy and Reliable Assistance"
  footerLine2: string;           // e.g. "for JKSSB Class IV Application"
  ctaButtonText: 'APPLY NOW' | 'CHECK RESULT' | 'READ DETAILS';
}

export interface ThumbnailInputPayload {
  id?: string;
  title: string;
  category?: string;
  department?: string;
  postType?: 'Job' | 'Admission' | 'Result' | 'Scheme' | 'Service' | 'Guide' | string;
  shortInfo?: string;
  startDate?: string;
  lastDate?: string;
  status?: 'Open' | 'Closed' | 'Result' | 'Informational' | string;
  customOverrides?: Partial<ThumbnailSpec>;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Splits a 2-4 word icon label into 2 balanced lines for the 4 circular service icons.
 */
export function splitIconLabelTwoLines(label: string): [string, string] {
  const clean = (label || '').trim().replace(/\s+/g, ' ');
  if (!clean) return ['Service', 'Support'];
  const words = clean.split(' ');
  if (words.length === 1) return [words[0], 'Support'];
  if (words.length === 2) return [words[0], words[1]];
  if (words.length === 3) {
    // e.g. "Form Filling Assistance" -> ["Form Filling", "Assistance"]
    // e.g. "Guidance & Support" -> ["Guidance &", "Support"]
    return [`${words[0]} ${words[1]}`, words[2]];
  }
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

/**
 * Deterministic rule-based extractor that converts any CSC DOST post input
 * into the exact reference ThumbnailSpec (and handles the 3 master presets with 100% fidelity).
 */
export function buildDeterministicThumbnailSpec(input: ThumbnailInputPayload): ThumbnailSpec {
  const rawTitle = (input.title || '').trim();
  const titleUpper = rawTitle.toUpperCase();
  const category = (input.category || '').toLowerCase();
  const postType = (input.postType || '').toLowerCase();
  const statusLower = (input.status || '').toLowerCase();

  // Check for exact canonical patterns first
  // 1. Indian Army 10+2 Technical Entry Scheme (TES-57 Course)
  if (
    titleUpper.includes('TES-57') ||
    (titleUpper.includes('ARMY') && (titleUpper.includes('TECHNICAL ENTRY') || titleUpper.includes('TES'))) ||
    input.id === 'army-tes-57-course-2026'
  ) {
    return {
      mainHeadingLeft: 'INDIAN ARMY',
      redBadgeText: 'TES-57 (10+2)',
      secondHeading: 'ONLINE APPLICATION',
      yellowBannerPrefix: 'Apply Through ',
      yellowBannerHighlight: 'CSC DOST',
      fourIcons: [
        'Form Filling Assistance',
        'PCM Marks Upload',
        'JEE Merit Guidance',
        'Registration Support',
      ],
      laptopTitle: 'JOIN ARMY',
      laptopSubtitle: 'TES-57 Online Application',
      footerLine1: 'Get Easy and Reliable Online Assistance',
      footerLine2: 'for Indian Army TES-57 Course Application',
      ctaButtonText: statusLower === 'closed' ? 'READ DETAILS' : 'APPLY NOW',
      ...input.customOverrides,
    };
  }

  // 2. RRB NTPC Undergraduate (CEN 07/2026)
  if (
    (titleUpper.includes('RRB') && titleUpper.includes('NTPC')) ||
    input.id === 'rrb-ntpc-undergraduate-cen-07-2026'
  ) {
    return {
      mainHeadingLeft: 'RRB NTPC',
      redBadgeText: '3,445 POSTS',
      secondHeading: 'ONLINE APPLICATION',
      yellowBannerPrefix: 'Apply Through ',
      yellowBannerHighlight: 'CSC DOST',
      fourIcons: [
        'CEN 07/2026 Filing',
        'Zone Selection',
        'Photo / Sign Upload',
        'Application Support',
      ],
      laptopTitle: 'RRB APPLY',
      laptopSubtitle: 'NTPC Online Registration',
      footerLine1: 'Get Easy and Reliable Online Assistance',
      footerLine2: 'for Railway Recruitment Board NTPC Application',
      ctaButtonText: statusLower === 'closed' ? 'READ DETAILS' : 'APPLY NOW',
      ...input.customOverrides,
    };
  }

  // 3. SSC CHSL 10+2 Exam 2026
  if (
    (titleUpper.includes('SSC') && titleUpper.includes('CHSL')) ||
    input.id === 'ssc-chsl-10-plus-2-exam-2026-tier1'
  ) {
    return {
      mainHeadingLeft: 'SSC CHSL',
      redBadgeText: '10+2 LEVEL',
      secondHeading: 'ONLINE REGISTRATION',
      yellowBannerPrefix: 'Apply Through ',
      yellowBannerHighlight: 'CSC DOST',
      fourIcons: [
        'OTR Registration',
        'Post Preference',
        'Live Photo Capture',
        'Application Support',
      ],
      laptopTitle: 'SSC PORTAL',
      laptopSubtitle: 'CHSL Online Application Form',
      footerLine1: 'Get Easy and Reliable Online Assistance',
      footerLine2: 'for SSC CHSL (10+2) Tier-1 Application',
      ctaButtonText: statusLower === 'closed' ? 'READ DETAILS' : 'APPLY NOW',
      ...input.customOverrides,
    };
  }

  // 4. Cluster University Srinagar B.Ed / DYD Notice
  if (
    (titleUpper.includes('CLUSTER') || titleUpper.includes('CUS')) &&
    (titleUpper.includes('B.ED') || titleUpper.includes('EXAM')) ||
    input.id === 'cus-bed-supplementary-4th-sem-exam-dyd-2026'
  ) {
    return {
      mainHeadingLeft: 'CLUSTER UNIV',
      redBadgeText: 'B.ED 4TH SEM',
      secondHeading: 'EXAM FORM 2026',
      yellowBannerPrefix: 'Submit Through ',
      yellowBannerHighlight: 'CSC DOST',
      fourIcons: [
        'Exam Form Filing',
        'Fee Verification',
        'DYD NEP Guidance',
        'Student Support',
      ],
      laptopTitle: 'CUS EXAMS',
      laptopSubtitle: 'Examination Portal Srinagar',
      footerLine1: 'Get Easy and Reliable Online Assistance',
      footerLine2: 'for Cluster University Srinagar Examination Forms',
      ctaButtonText: 'APPLY NOW',
      ...input.customOverrides,
    };
  }

  // 5. JKSSB Class IV Recruitment
  if (
    (titleUpper.includes('JKSSB') && (titleUpper.includes('CLASS IV') || titleUpper.includes('CLASS-IV') || titleUpper.includes('CLASS 4'))) ||
    input.id === 'preset-jkssb-class-iv' ||
    input.id === 'jkssb-class-iv-recruitment-2026'
  ) {
    return {
      mainHeadingLeft: 'JKSSB',
      redBadgeText: 'CLASS IV',
      secondHeading: 'ONLINE APPLICATION',
      yellowBannerPrefix: 'Apply Through ',
      yellowBannerHighlight: 'CSC DOST',
      fourIcons: [
        'Form Filling Assistance',
        'Document Upload',
        'Application Submission',
        'Guidance & Support',
      ],
      laptopTitle: 'JKSSB',
      laptopSubtitle: 'Online Application Form',
      footerLine1: 'Get Easy and Reliable Assistance',
      footerLine2: 'for JKSSB Class IV Application',
      ctaButtonText: statusLower === 'closed' ? 'READ DETAILS' : 'APPLY NOW',
      ...input.customOverrides,
    };
  }

  // 6. IGNOU Admission
  if (
    (titleUpper.includes('IGNOU') && (titleUpper.includes('ADMISSION') || titleUpper.includes('REGISTRATION') || category === 'admissions')) ||
    input.id === 'preset-ignou-admission' ||
    input.id === 'ignou-admission-2026-july-session'
  ) {
    return {
      mainHeadingLeft: 'IGNOU',
      redBadgeText: 'ADMISSION',
      secondHeading: 'ONLINE REGISTRATION',
      yellowBannerPrefix: 'Admission ',
      yellowBannerHighlight: 'Assistance',
      fourIcons: [
        'Registration Help',
        'Document Upload',
        'Fee Payment Guidance',
        'Admission Support',
      ],
      laptopTitle: 'IGNOU',
      laptopSubtitle: 'Online Registration Form',
      footerLine1: 'Get Easy and Reliable Assistance',
      footerLine2: 'for IGNOU Admission Application',
      ctaButtonText: statusLower === 'closed' ? 'READ DETAILS' : 'APPLY NOW',
      ...input.customOverrides,
    };
  }

  // 7. JKBOSE Class 10 Result
  if (
    (titleUpper.includes('JKBOSE') && (titleUpper.includes('CLASS 10') || titleUpper.includes('10TH')) && (titleUpper.includes('RESULT') || category === 'results' || postType === 'result')) ||
    input.id === 'preset-jkbose-class-10-result' ||
    input.id === 'jkbose-class-10-result-2026'
  ) {
    return {
      mainHeadingLeft: 'JKBOSE',
      redBadgeText: 'CLASS 10',
      secondHeading: 'RESULT UPDATE',
      yellowBannerPrefix: 'Check Result ',
      yellowBannerHighlight: 'Details',
      fourIcons: [
        'Result Information',
        'Roll Number Guidance',
        'Result Access',
        'Student Support',
      ],
      laptopTitle: 'JKBOSE',
      laptopSubtitle: 'Online Result Portal',
      footerLine1: 'Get Easy and Reliable Assistance',
      footerLine2: 'for JKBOSE Class 10 Result',
      ctaButtonText: 'CHECK RESULT',
      ...input.customOverrides,
    };
  }

  // General intelligent extraction for any post
  const isResult =
    postType === 'result' ||
    category === 'results' ||
    /\b(RESULT|SCORE\s*CARD|MERIT\s*LIST|MARKS)\b/i.test(rawTitle);

  const isAdmission =
    !isResult &&
    (postType === 'admission' ||
      category === 'admissions' ||
      category === 'cluster_univ' ||
      /\b(ADMISSION|COUNSELLING|ENTRANCE|ENROLLMENT|SEMESTER\s*ADMISSION)\b/i.test(rawTitle));

  const isExamForm =
    !isResult &&
    !isAdmission &&
    (category === 'exam_forms' || /\b(EXAM\s*FORM|DATE\s*SHEET|ADMIT\s*CARD|BACKLOG)\b/i.test(rawTitle));

  const isScheme =
    postType === 'scheme' ||
    /\b(YOJANA|SCHEME|SCHOLARSHIP|KISAN|AYUSHMAN|PENSION|RATION)\b/i.test(rawTitle);

  const isService =
    postType === 'service' ||
    /\b(PAN\s*CARD|AADHAAR|PASSPORT|DOMICILE|VOTER|DRIVING\s*LICENCE|INCOME\s*CERTIFICATE)\b/i.test(rawTitle);

  const isGuide =
    postType === 'guide' ||
    statusLower === 'informational' ||
    statusLower === 'closed' ||
    category === 'syllabus' ||
    category === 'answer_keys';

  // Determine mainHeadingLeft (Department / Organisation short code, 4-10 chars)
  let mainHeadingLeft = 'CSC DOST';
  if (input.department && input.department.trim().length <= 10) {
    mainHeadingLeft = input.department.trim().toUpperCase();
  } else if (titleUpper.includes('JKSSB') || category === 'jkssb') {
    mainHeadingLeft = 'JKSSB';
  } else if (titleUpper.includes('JKBOSE')) {
    mainHeadingLeft = 'JKBOSE';
  } else if (titleUpper.includes('IGNOU')) {
    mainHeadingLeft = 'IGNOU';
  } else if (titleUpper.includes('SSC') || category === 'ssc_jobs') {
    mainHeadingLeft = 'SSC';
  } else if (titleUpper.includes('RRB') || titleUpper.includes('RAILWAY') || category === 'rrb_jobs') {
    mainHeadingLeft = 'RRB';
  } else if (titleUpper.includes('ARMY') || titleUpper.includes('AGNIVEER') || category === 'army_jobs') {
    mainHeadingLeft = 'ARMY';
  } else if (titleUpper.includes('KASHMIR UNIVERSITY') || titleUpper.includes('KU ') || category === 'exam_forms' || category === 'admissions') {
    mainHeadingLeft = 'KASHMIR UNIV';
  } else if (titleUpper.includes('CLUSTER UNIV') || titleUpper.includes('CUS') || category === 'cluster_univ') {
    mainHeadingLeft = 'CLUSTER UNIV';
  } else if (titleUpper.includes('NTA') || titleUpper.includes('NEET') || titleUpper.includes('CUET') || titleUpper.includes('JEE') || category === 'nta') {
    mainHeadingLeft = 'NTA';
  } else if (titleUpper.includes('UPSC')) {
    mainHeadingLeft = 'UPSC';
  } else if (titleUpper.includes('IBPS')) {
    mainHeadingLeft = 'IBPS';
  } else if (titleUpper.includes('JK BANK') || titleUpper.includes('J&K BANK')) {
    mainHeadingLeft = 'J&K BANK';
  } else if (titleUpper.includes('PM KISAN')) {
    mainHeadingLeft = 'PM KISAN';
  } else if (titleUpper.includes('AYUSHMAN')) {
    mainHeadingLeft = 'AYUSHMAN';
  } else if (titleUpper.includes('PAN CARD')) {
    mainHeadingLeft = 'PAN CARD';
  } else if (titleUpper.includes('AADHAAR')) {
    mainHeadingLeft = 'AADHAAR';
  } else if (titleUpper.includes('PASSPORT')) {
    mainHeadingLeft = 'PASSPORT';
  } else {
    const firstWord = rawTitle.split(/[\s–—-]+/)[0]?.replace(/[^A-Za-z0-9&]/g, '').toUpperCase();
    if (firstWord && firstWord.length >= 2 && firstWord.length <= 10) {
      mainHeadingLeft = firstWord;
    }
  }

  // Determine redBadgeText (Short 1-2 word badge inside red rounded rectangle, max 12 chars)
  let redBadgeText = 'RECRUITMENT';
  const classMatch = rawTitle.match(/\b(CLASS\s*(?:IV|10|12|10TH|12TH|VIII|XI)|10\+2|TES-\d+|CHSL|CGL|MTS|GD|NTPC|CONSTABLE|SI|PATWARI|JUNIOR\s*ASSISTANT|NAIB\s*TEHSILDAR|FORESTER|B\.ED|PG|UG|BG\s*\d\w*\s*SEM)\b/i);
  if (classMatch) {
    redBadgeText = classMatch[1].toUpperCase().replace(/\s+/g, ' ');
    if (redBadgeText.length > 13) {
      redBadgeText = redBadgeText.slice(0, 13).trim();
    }
  } else if (isResult) {
    redBadgeText = 'RESULT 2026';
  } else if (isAdmission) {
    redBadgeText = 'ADMISSION';
  } else if (isExamForm) {
    redBadgeText = 'EXAM FORM';
  } else if (isScheme) {
    redBadgeText = 'GOVT SCHEME';
  } else if (isService) {
    redBadgeText = 'E-SERVICE';
  } else if (isGuide) {
    redBadgeText = 'UPDATE';
  }

  // Determine secondHeading, yellow banner, 4 icons, CTA button
  let secondHeading = 'ONLINE APPLICATION';
  let yellowBannerPrefix = 'Apply Through ';
  let yellowBannerHighlight = 'CSC';
  let fourIcons: [string, string, string, string] = [
    'Form Filling Assistance',
    'Document Upload',
    'Application Submission',
    'Guidance & Support',
  ];
  let laptopSubtitle = 'Online Application Form';
  let ctaButtonText: 'APPLY NOW' | 'CHECK RESULT' | 'READ DETAILS' = 'APPLY NOW';

  if (isResult) {
    secondHeading = 'RESULT UPDATE';
    yellowBannerPrefix = 'Check Result ';
    yellowBannerHighlight = 'Details';
    fourIcons = [
      'Result Information',
      'Roll Number Guidance',
      'Result Access',
      'Student Support',
    ];
    laptopSubtitle = 'Online Result Portal';
    ctaButtonText = 'CHECK RESULT';
  } else if (isAdmission) {
    secondHeading = 'ONLINE REGISTRATION';
    yellowBannerPrefix = 'Admission ';
    yellowBannerHighlight = 'Assistance';
    fourIcons = [
      'Registration Help',
      'Document Upload',
      'Fee Payment Guidance',
      'Admission Support',
    ];
    laptopSubtitle = 'Online Registration Form';
    ctaButtonText = statusLower === 'closed' ? 'READ DETAILS' : 'APPLY NOW';
  } else if (isExamForm) {
    secondHeading = 'EXAMINATION FORM';
    yellowBannerPrefix = 'Submit Form At ';
    yellowBannerHighlight = 'CSC';
    fourIcons = [
      'Exam Form Filling',
      'Subject Selection',
      'Fee Submission',
      'Student Support',
    ];
    laptopSubtitle = 'Online Examination Form';
    ctaButtonText = statusLower === 'closed' ? 'READ DETAILS' : 'APPLY NOW';
  } else if (isScheme) {
    secondHeading = 'BENEFICIARY REGISTRATION';
    yellowBannerPrefix = 'Apply Through ';
    yellowBannerHighlight = 'CSC';
    fourIcons = [
      'Eligibility Check',
      'Document Upload',
      'e-KYC & Filing',
      'Citizen Support',
    ];
    laptopSubtitle = 'Citizen Scheme Portal';
    ctaButtonText = statusLower === 'closed' ? 'READ DETAILS' : 'APPLY NOW';
  } else if (isService) {
    secondHeading = 'CITIZEN E-SERVICE';
    yellowBannerPrefix = 'Apply Through ';
    yellowBannerHighlight = 'CSC';
    fourIcons = [
      'Form Filling Assistance',
      'Document Upload',
      'Fast Processing',
      'Receipt & Tracking',
    ];
    laptopSubtitle = 'Digital Service Portal';
    ctaButtonText = 'APPLY NOW';
  } else if (isGuide) {
    secondHeading = 'OFFICIAL NOTIFICATION';
    yellowBannerPrefix = 'Complete Guide & ';
    yellowBannerHighlight = 'Details';
    fourIcons = [
      'Official Notice Info',
      'Eligibility Guide',
      'Document Checklist',
      'Guidance & Support',
    ];
    laptopSubtitle = 'Official Notice Portal';
    ctaButtonText = 'READ DETAILS';
  }

  if (statusLower === 'closed' || statusLower === 'informational') {
    ctaButtonText = 'READ DETAILS';
  } else if (statusLower === 'result') {
    ctaButtonText = 'CHECK RESULT';
  }

  const conciseSubject = `${mainHeadingLeft} ${redBadgeText}`
    .replace(/\s+/g, ' ')
    .trim();

  const footerSuffix = isResult
    ? `for ${conciseSubject} Result`
    : isAdmission
    ? `for ${conciseSubject} Application`
    : `for ${conciseSubject} Application`;

  return {
    mainHeadingLeft,
    redBadgeText,
    secondHeading,
    yellowBannerPrefix,
    yellowBannerHighlight,
    fourIcons,
    laptopTitle: mainHeadingLeft.slice(0, 12),
    laptopSubtitle,
    footerLine1: 'Get Easy and Reliable Assistance',
    footerLine2: footerSuffix.slice(0, 42),
    ctaButtonText,
    ...input.customOverrides,
  };
}

/**
 * Uses Gemini 3.8 Flash on the server to refine post metadata into concise banner text
 * while strictly adhering to the master reference layout constraints, falling back
 * seamlessly to `buildDeterministicThumbnailSpec`.
 */
export async function extractThumbnailSpecWithAI(
  input: ThumbnailInputPayload
): Promise<ThumbnailSpec> {
  const baseSpec = buildDeterministicThumbnailSpec(input);

  // If this is one of the 3 exact presets or customOverrides are already complete, return immediately
  const titleUpper = (input.title || '').toUpperCase();
  if (
    input.id === 'preset-jkssb-class-iv' ||
    input.id === 'preset-ignou-admission' ||
    input.id === 'preset-jkbose-class-10-result' ||
    (titleUpper === 'JKSSB CLASS IV RECRUITMENT') ||
    (titleUpper === 'IGNOU ADMISSION') ||
    (titleUpper === 'JKBOSE CLASS 10 RESULT')
  ) {
    return baseSpec;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return baseSpec;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are generating structured copy for a fixed-layout 2048x677 CSC DOST portal banner thumbnail.
Summarize the following post into ultra-concise, high-impact banner text that fits the fixedJKSSB Class IV master template:
Post Title: ${input.title}
Category: ${input.category || ''}
Department/Organization: ${input.department || ''}
Post Type: ${input.postType || ''}
Short Description: ${input.shortInfo || ''}
Important Dates: Start ${input.startDate || 'N/A'}, Last Date ${input.lastDate || 'N/A'}
Status: ${input.status || 'Open'}

Rules:
- mainHeadingLeft: Short uppercase organization/board acronym (2 to 10 characters max, e.g. "JKSSB", "IGNOU", "JKBOSE", "SSC", "RRB", "ARMY", "KU").
- redBadgeText: Short uppercase category/class/post badge (2 to 12 characters max, e.g. "CLASS IV", "ADMISSION", "CLASS 10", "CHSL 2026", "TES-57", "NTPC UG").
- secondHeading: Uppercase 2-word headline (e.g. "ONLINE APPLICATION", "ONLINE REGISTRATION", "RESULT UPDATE", "EXAMINATION FORM").
- yellowBannerPrefix: 1-2 words with trailing space (e.g. "Apply Through ", "Admission ", "Check Result ").
- yellowBannerHighlight: 1 highlighted word (e.g. "CSC", "Assistance", "Details").
- fourIcons: Exactly 4 short 2-3 word service labels matching the post type.
- laptopTitle: Same short organization acronym (max 10 chars).
- laptopSubtitle: 2-3 words (e.g. "Online Application Form", "Online Registration Form", "Online Result Portal").
- footerLine1: Always "Get Easy and Reliable Assistance"
- footerLine2: "for <Short Post Name> Application" or "for <Short Post Name> Result" (max 38 chars).
- ctaButtonText: Must be "APPLY NOW" for active applications, "CHECK RESULT" for results, or "READ DETAILS" for informational/closed posts.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mainHeadingLeft: { type: Type.STRING },
            redBadgeText: { type: Type.STRING },
            secondHeading: { type: Type.STRING },
            yellowBannerPrefix: { type: Type.STRING },
            yellowBannerHighlight: { type: Type.STRING },
            fourIcons: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            laptopTitle: { type: Type.STRING },
            laptopSubtitle: { type: Type.STRING },
            footerLine1: { type: Type.STRING },
            footerLine2: { type: Type.STRING },
            ctaButtonText: { type: Type.STRING },
          },
          required: [
            'mainHeadingLeft',
            'redBadgeText',
            'secondHeading',
            'yellowBannerPrefix',
            'yellowBannerHighlight',
            'fourIcons',
            'laptopTitle',
            'laptopSubtitle',
            'footerLine1',
            'footerLine2',
            'ctaButtonText',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const validCta =
      parsed.ctaButtonText === 'CHECK RESULT' || parsed.ctaButtonText === 'READ DETAILS'
        ? parsed.ctaButtonText
        : 'APPLY NOW';

    const iconsArr =
      Array.isArray(parsed.fourIcons) && parsed.fourIcons.length >= 4
        ? ([
            String(parsed.fourIcons[0]),
            String(parsed.fourIcons[1]),
            String(parsed.fourIcons[2]),
            String(parsed.fourIcons[3]),
          ] as [string, string, string, string])
        : baseSpec.fourIcons;

    return {
      mainHeadingLeft: (parsed.mainHeadingLeft || baseSpec.mainHeadingLeft).toUpperCase().slice(0, 11),
      redBadgeText: (parsed.redBadgeText || baseSpec.redBadgeText).toUpperCase().slice(0, 13),
      secondHeading: (parsed.secondHeading || baseSpec.secondHeading).toUpperCase().slice(0, 24),
      yellowBannerPrefix: parsed.yellowBannerPrefix || baseSpec.yellowBannerPrefix,
      yellowBannerHighlight: parsed.yellowBannerHighlight || baseSpec.yellowBannerHighlight,
      fourIcons: iconsArr,
      laptopTitle: (parsed.laptopTitle || parsed.mainHeadingLeft || baseSpec.laptopTitle).toUpperCase().slice(0, 10),
      laptopSubtitle: (parsed.laptopSubtitle || baseSpec.laptopSubtitle).slice(0, 26),
      footerLine1: 'Get Easy and Reliable Assistance',
      footerLine2: (parsed.footerLine2 || baseSpec.footerLine2).slice(0, 42),
      ctaButtonText: validCta,
      ...input.customOverrides,
    };
  } catch (err) {
    console.warn('[ThumbnailGenerator] AI extraction notice, using deterministic spec:', err);
    return baseSpec;
  }
}

// Cache the cleaned 2048x677 master base image buffer in memory so generation takes < 40ms
let cachedCleanBaseRaw: { data: Buffer; width: number; height: number; channels: number } | null = null;

const MASTER_REFERENCE_PATH = path.join(
  process.cwd(),
  'public',
  'assets',
  'aistudio',
  'JKSSB_Class_IV_CSC_Application_Assistance_60a01722.png'
);

/**
 * Prepares the 2048x677 master reference photographic base by keeping:
 * - The right-side realistic CSC operator working on the laptop
 * - The sweeping two-tone blue S-curve divider
 * - The yellow rounded banner pill (with text cleanly interpolated out)
 * - The 4 pastel circular service icons & 3 vertical dividers (with old text labels below them cleared)
 * - The top-right 3D white card (with old emblem inside cleared for CSC DOST branding)
 * - The laptop screen (with old "JKSSB / Online Application Form" cleared while keeping the grey form bars & red Submit button)
 * - The bottom dark-blue curved banner (with old footer text & CTA text cleanly interpolated out while keeping the yellow checkmark & red 3D pill + white arrow circle)
 */
async function getCleanMasterBaseBuffer(): Promise<{
  data: Buffer;
  width: number;
  height: number;
  channels: number;
}> {
  if (cachedCleanBaseRaw) {
    return {
      data: Buffer.from(cachedCleanBaseRaw.data),
      width: cachedCleanBaseRaw.width,
      height: cachedCleanBaseRaw.height,
      channels: cachedCleanBaseRaw.channels,
    };
  }

  const { data, info } = await sharp(MASTER_REFERENCE_PATH)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;
  const C = info.channels;

  const setPixel = (x: number, y: number, r: number, g: number, b: number) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const idx = (y * W + x) * C;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
  };

  const getPixel = (x: number, y: number): [number, number, number] => {
    const cx = Math.max(0, Math.min(W - 1, x));
    const cy = Math.max(0, Math.min(H - 1, y));
    const idx = (cy * W + cx) * C;
    return [data[idx], data[idx + 1], data[idx + 2]];
  };

  const fillRectSolid = (x1: number, y1: number, x2: number, y2: number, r: number, g: number, b: number) => {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        setPixel(x, y, r, g, b);
      }
    }
  };

  const inpaintRectHorizontal = (x1: number, y1: number, x2: number, y2: number) => {
    const span = Math.max(1, x2 - x1);
    for (let y = y1; y <= y2; y++) {
      const [r1, g1, b1] = getPixel(x1 - 2, y);
      const [r2, g2, b2] = getPixel(x2 + 2, y);
      for (let x = x1; x <= x2; x++) {
        const t = (x - x1) / span;
        setPixel(
          x,
          y,
          Math.round(r1 * (1 - t) + r2 * t),
          Math.round(g1 * (1 - t) + g2 * t),
          Math.round(b1 * (1 - t) + b2 * t)
        );
      }
    }
  };

  // 1. Clear Top-Left Main Heading + Red Badge + Second Headline area (x: 70..1162, y: 18..228)
  // Interpolate from clean left margin (x=68) to right margin (x=1164) so background matches 100% seamlessly
  inpaintRectHorizontal(70, 18, 1162, 228);

  // 2. Clear text inside the Yellow Rounded Banner (x: 205..1035, y: 244..328)
  // Sampling at x=203 and x=1037 is completely outside the text "Apply Through CSC" inside the yellow pill
  inpaintRectHorizontal(205, 244, 1035, 328);

  // 3. Clear the 4 text labels below the 4 pastel circular icons while preserving the 4 icons (y: 345..454)
  // and preserving the 3 vertical dividers at x=327, x=616, x=908!
  inpaintRectHorizontal(75, 456, 321, 532);
  inpaintRectHorizontal(333, 456, 610, 532);
  inpaintRectHorizontal(621, 456, 902, 532);
  inpaintRectHorizontal(914, 456, 1152, 532);

  // 4. Note: Top-Right 3D White Card already displays clean "CSC - Common Service Centre" branding in the master reference.

  // 5. Clear the text ("JKSSB", underline, "Online Application Form") on the angled laptop screen (x: 1380..1624, y: 238..324)
  inpaintRectHorizontal(1380, 238, 1624, 324);

  // 6. Clear the 2-line white supporting text in the bottom navy banner (x: 198..925, y: 558..664)
  inpaintRectHorizontal(198, 558, 925, 664);

  // 7. Clear the "APPLY NOW" text inside the bottom-right red CTA button (x: 1525..1862, y: 560..634)
  // Sample the clean red button fill at x=1520 so we don't hit the white arrow circle at x=1868+
  for (let y = 560; y <= 634; y++) {
    const [r, g, b] = getPixel(1520, y);
    for (let x = 1525; x <= 1862; x++) {
      setPixel(x, y, r, g, b);
    }
  }

  cachedCleanBaseRaw = { data: Buffer.from(data), width: W, height: H, channels: C };
  return { data, width: W, height: H, channels: C };
}

/**
 * Builds the 2048x677 vector SVG overlay with crisp typography for all dynamic regions.
 */
export function buildMasterOverlaySvg(spec: ThumbnailSpec): string {
  const mainLeft = (spec.mainHeadingLeft || 'JKSSB').toUpperCase().trim();
  const badgeText = (spec.redBadgeText || 'CLASS IV').toUpperCase().trim();
  const secondLine = (spec.secondHeading || 'ONLINE APPLICATION').toUpperCase().trim();

  // Compute balanced font size and box geometry for Row 1 (mainHeadingLeft + red rounded rectangle)
  // Left content column center is x = 621 ( spanning x = 95 .. 1147 )
  const totalCharsRow1 = mainLeft.length + badgeText.length;
  const row1FontSize = totalCharsRow1 > 16 ? 72 : totalCharsRow1 > 13 ? 82 : 94;
  const badgeFontSize = totalCharsRow1 > 16 ? 68 : totalCharsRow1 > 13 ? 76 : 84;

  // Approximate character width for bold Liberation Sans (0.72 * fontSize for wide uppercase letters + stroke)
  const mainLeftWidth = Math.round(mainLeft.length * row1FontSize * 0.72);
  const badgeTextWidth = Math.round(badgeText.length * badgeFontSize * 0.65);
  const badgePadX = 44;
  const badgeBoxWidth = Math.max(280, badgeTextWidth + badgePadX * 2);
  const badgeBoxHeight = 108;
  const gapBetween = 34;

  const totalGroupWidth = mainLeftWidth + gapBetween + badgeBoxWidth;
  const groupStartX = Math.max(85, Math.round(621 - totalGroupWidth / 2));
  const badgeBoxX = groupStartX + mainLeftWidth + gapBetween;
  const badgeBoxY = 28;
  const row1BaselineY = 114;

  // Second headline font size (auto-scales if longer)
  const secondFontSize =
    secondLine.length > 22 ? 56 : secondLine.length > 18 ? 64 : 70;

  // Yellow banner text
  const yellowPrefixClean = (spec.yellowBannerPrefix || 'Apply Through').trim();
  const yellowHighlightClean = (spec.yellowBannerHighlight || 'CSC').trim();

  // Four circular icon 2-line labels centered at x = 188, 471, 761, 1044
  const iconCentersX = [188, 471, 761, 1044];
  const iconLines = spec.fourIcons.map((lbl) => splitIconLabelTwoLines(lbl));

  // CTA button font size (centered at x = 1692, y = 610 inside the red pill left of the white arrow circle)
  const ctaText = (spec.ctaButtonText || 'APPLY NOW').toUpperCase().trim();
  const ctaFontSize = ctaText.length > 10 ? 38 : 45;

  // Laptop screen text (centered and slightly skewed to match the angled laptop screen perspective)
  const laptopTitle = (spec.laptopTitle || mainLeft).toUpperCase().slice(0, 11);
  const laptopSubtitle = spec.laptopSubtitle || 'Online Application Form';

  return `<svg width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" viewBox="0 0 ${THUMBNAIL_WIDTH} ${THUMBNAIL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Red Rounded Rectangle Gradient matching reference -->
    <linearGradient id="redBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E31E24" />
      <stop offset="55%" stop-color="#D6181E" />
      <stop offset="100%" stop-color="#B91217" />
    </linearGradient>

    <filter id="badgeShadow" x="-8%" y="-8%" width="120%" height="125%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#7F1D1D" flood-opacity="0.28" />
    </filter>

    <filter id="footerTextShadow" x="-5%" y="-10%" width="110%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#041E42" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- ===================================================================== -->
  <!-- 1. TOP LEFT: MAIN DEPARTMENT TITLE + RED ROUNDED CATEGORY RECTANGLE   -->
  <!-- ===================================================================== -->
  <text
    x="${groupStartX}"
    y="${row1BaselineY}"
    font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
    font-weight="bold"
    font-size="${row1FontSize}"
    fill="#092556"
    stroke="#092556"
    stroke-width="3"
    paint-order="stroke fill"
    letter-spacing="1"
  >${escapeXml(mainLeft)}</text>

  <g filter="url(#badgeShadow)">
    <rect
      x="${badgeBoxX}"
      y="${badgeBoxY}"
      width="${badgeBoxWidth}"
      height="${badgeBoxHeight}"
      rx="20"
      fill="url(#redBadgeGrad)"
    />
    <text
      x="${Math.round(badgeBoxX + badgeBoxWidth / 2)}"
      y="${row1BaselineY - 2}"
      font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
      font-weight="bold"
      font-size="${badgeFontSize}"
      fill="#FFFFFF"
      stroke="#FFFFFF"
      stroke-width="2.2"
      paint-order="stroke fill"
      text-anchor="middle"
      letter-spacing="1.5"
    >${escapeXml(badgeText)}</text>
  </g>

  <!-- ===================================================================== -->
  <!-- 2. SECOND LARGE HEADLINE (e.g. ONLINE APPLICATION / RESULT UPDATE)    -->
  <!-- ===================================================================== -->
  <text
    x="621"
    y="211"
    font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
    font-weight="bold"
    font-size="${secondFontSize}"
    fill="#092556"
    stroke="#092556"
    stroke-width="2.2"
    paint-order="stroke fill"
    text-anchor="middle"
    letter-spacing="1.5"
  >${escapeXml(secondLine)}</text>

  <!-- ===================================================================== -->
  <!-- 3. YELLOW ROUNDED BANNER TEXT (e.g. Apply Through CSC)                -->
  <!-- ===================================================================== -->
  <text
    x="612"
    y="305"
    font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
    font-weight="bold"
    font-size="56"
    text-anchor="middle"
  >
    <tspan fill="#092556" stroke="#092556" stroke-width="1.2" paint-order="stroke fill">${escapeXml(yellowPrefixClean)}</tspan><tspan dx="18" fill="#0C4DA2" stroke="#0C4DA2" stroke-width="1.8" paint-order="stroke fill">${escapeXml(yellowHighlightClean)}</tspan>
  </text>

  <!-- ===================================================================== -->
  <!-- 4. FOUR CIRCULAR SERVICE ICON 2-LINE LABELS                           -->
  <!-- ===================================================================== -->
  ${iconLines
    .map(
      ([line1, line2], idx) => `
  <g>
    <text
      x="${iconCentersX[idx]}"
      y="482"
      font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
      font-weight="bold"
      font-size="25"
      fill="#0F2952"
      text-anchor="middle"
    >${escapeXml(line1)}</text>
    <text
      x="${iconCentersX[idx]}"
      y="513"
      font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
      font-weight="bold"
      font-size="25"
      fill="#0F2952"
      text-anchor="middle"
    >${escapeXml(line2)}</text>
  </g>`
    )
    .join('')}

  <!-- ===================================================================== -->
  <!-- 5. ANGLED LAPTOP SCREEN: POST TITLE & FORM SUBTITLE                   -->
  <!-- ===================================================================== -->
  <g transform="translate(1500, 273) rotate(-4) skewX(6)">
    <text
      x="0"
      y="0"
      font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
      font-weight="bold"
      font-size="${laptopTitle.length > 7 ? 24 : 30}"
      fill="#092556"
      stroke="#092556"
      stroke-width="0.8"
      paint-order="stroke fill"
      text-anchor="middle"
    >${escapeXml(laptopTitle)}</text>
    <line x1="-88" y1="8" x2="88" y2="8" stroke="#CBD5E1" stroke-width="1.5" />
    <text
      x="0"
      y="27"
      font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
      font-weight="bold"
      font-size="16"
      fill="#1E3A8A"
      text-anchor="middle"
    >${escapeXml(laptopSubtitle)}</text>
  </g>

  <!-- ===================================================================== -->
  <!-- 6. BOTTOM CURVED NAVY BANNER: 2-LINE SUPPORT TEXT & RED CTA TEXT      -->
  <!-- ===================================================================== -->
  <g filter="url(#footerTextShadow)">
    <text
      x="208"
      y="606"
      font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
      font-size="33"
      fill="#FFFFFF"
    >${escapeXml(spec.footerLine1)}</text>
    <text
      x="208"
      y="646"
      font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
      font-weight="bold"
      font-size="35"
      fill="#FFFFFF"
      stroke="#FFFFFF"
      stroke-width="0.8"
      paint-order="stroke fill"
    >${escapeXml(spec.footerLine2)}</text>
  </g>

  <!-- Red CTA Button Text (Centered left of the white right-arrow circle) -->
  <text
    x="1692"
    y="610"
    font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
    font-weight="bold"
    font-size="${ctaFontSize}"
    fill="#FFFFFF"
    stroke="#FFFFFF"
    stroke-width="1.4"
    paint-order="stroke fill"
    text-anchor="middle"
    letter-spacing="1"
  >${escapeXml(ctaText)}</text>
</svg>`;
}

/**
 * Generates a complete standalone 2048 x 677 Master Reference Thumbnail as vector SVG.
 * Can be rendered directly in DOM or served over HTTP without requiring raster image files.
 */
export function renderStandaloneMasterThumbnailSvg(spec: ThumbnailSpec): string {
  const mainLeft = (spec.mainHeadingLeft || 'JKSSB').toUpperCase().trim();
  const badgeText = (spec.redBadgeText || 'CLASS IV').toUpperCase().trim();
  const secondLine = (spec.secondHeading || 'ONLINE APPLICATION').toUpperCase().trim();

  const totalCharsRow1 = mainLeft.length + badgeText.length;
  const row1FontSize = totalCharsRow1 > 16 ? 72 : totalCharsRow1 > 13 ? 82 : 94;
  const badgeFontSize = totalCharsRow1 > 16 ? 68 : totalCharsRow1 > 13 ? 76 : 84;

  const mainLeftWidth = Math.round(mainLeft.length * row1FontSize * 0.72);
  const badgeTextWidth = Math.round(badgeText.length * badgeFontSize * 0.65);
  const badgePadX = 44;
  const badgeBoxWidth = Math.max(280, badgeTextWidth + badgePadX * 2);
  const badgeBoxHeight = 108;
  const gapBetween = 34;

  const totalGroupWidth = mainLeftWidth + gapBetween + badgeBoxWidth;
  const groupStartX = Math.max(85, Math.round(621 - totalGroupWidth / 2));
  const badgeBoxX = groupStartX + mainLeftWidth + gapBetween;
  const badgeBoxY = 28;
  const row1BaselineY = 114;

  const secondFontSize =
    secondLine.length > 22 ? 56 : secondLine.length > 18 ? 64 : 70;

  const yellowPrefixClean = (spec.yellowBannerPrefix || 'Apply Through').trim();
  const yellowHighlightClean = (spec.yellowBannerHighlight || 'CSC').trim();

  const iconCentersX = [188, 471, 761, 1044];
  const iconLines = spec.fourIcons.map((lbl) => splitIconLabelTwoLines(lbl));

  const ctaText = (spec.ctaButtonText || 'APPLY NOW').toUpperCase().trim();
  const ctaFontSize = ctaText.length > 10 ? 38 : 45;

  const laptopTitle = (spec.laptopTitle || mainLeft).toUpperCase().slice(0, 11);
  const laptopSubtitle = spec.laptopSubtitle || 'Online Application Form';

  return `<svg width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" viewBox="0 0 ${THUMBNAIL_WIDTH} ${THUMBNAIL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="rightBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F2856" />
      <stop offset="50%" stop-color="#091E44" />
      <stop offset="100%" stop-color="#051026" />
    </linearGradient>

    <linearGradient id="waveGradOuter" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>

    <linearGradient id="waveGradInner" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0A2454" />
      <stop offset="100%" stop-color="#061838" />
    </linearGradient>

    <linearGradient id="redBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E31E24" />
      <stop offset="55%" stop-color="#D6181E" />
      <stop offset="100%" stop-color="#B91217" />
    </linearGradient>

    <linearGradient id="yellowPillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFDD00" />
      <stop offset="50%" stop-color="#FFCC00" />
      <stop offset="100%" stop-color="#F5B800" />
    </linearGradient>

    <linearGradient id="iconCircleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2EEFF" />
    </linearGradient>

    <linearGradient id="bottomBannerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#082250" />
      <stop offset="60%" stop-color="#0A2960" />
      <stop offset="100%" stop-color="#061838" />
    </linearGradient>

    <filter id="softShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.22" />
    </filter>

    <filter id="badgeShadow" x="-8%" y="-8%" width="120%" height="125%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#7F1D1D" flood-opacity="0.35" />
    </filter>

    <filter id="glowYellow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#D97706" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- 1. BASE CANVAS: Left White Background -->
  <rect width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" fill="#FFFFFF" />

  <!-- 2. RIGHT SIDE: Deep Blue Tech Backdrop -->
  <path d="M 1240 0 L 2048 0 L 2048 677 L 1180 677 C 1220 540, 1160 410, 1260 260 C 1320 170, 1310 70, 1240 0 Z" fill="url(#rightBgGrad)" />

  <!-- Flowing Curved Two-Tone Blue Dividing Waves -->
  <path d="M 1210 0 C 1290 80, 1300 180, 1230 270 C 1130 410, 1190 540, 1150 677 L 1185 677 C 1225 540, 1165 410, 1265 260 C 1325 170, 1315 70, 1245 0 Z" fill="url(#waveGradOuter)" opacity="0.85" />
  <path d="M 1225 0 C 1305 80, 1315 180, 1245 270 C 1145 410, 1205 540, 1165 677 L 1180 677 C 1220 540, 1160 410, 1260 260 C 1320 170, 1310 70, 1240 0 Z" fill="url(#waveGradInner)" />

  <!-- RIGHT SIDE TECH WORKSPACE ILLUSTRATION -->
  <!-- Subtle Desk & Laptop -->
  <g transform="translate(1380, 200)">
    <!-- Operator Ambient Glow -->
    <ellipse cx="280" cy="180" rx="220" ry="140" fill="#2563EB" opacity="0.12" />

    <!-- Angled Laptop Body -->
    <polygon points="120,230 350,225 390,270 90,275" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
    <polygon points="100,270 380,266 385,273 95,277" fill="#64748B" />

    <!-- Laptop Screen (Angled Display) -->
    <polygon points="135,100 335,95 345,225 125,230" fill="#0B1A3A" stroke="#CBD5E1" stroke-width="3" filter="url(#softShadow)" />
    <!-- Screen Inner Display -->
    <polygon points="142,108 328,103 337,218 133,222" fill="#FFFFFF" />

    <!-- Header bar on laptop screen -->
    <polygon points="142,108 328,103 330,135 140,140" fill="#092556" />

    <!-- Screen Title & Subtitle -->
    <text x="235" y="126" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle">${escapeXml(laptopTitle)}</text>
    <text x="235" y="152" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="bold" font-size="9" fill="#092556" text-anchor="middle">${escapeXml(laptopSubtitle)}</text>
    <line x1="165" y1="160" x2="305" y2="160" stroke="#E2E8F0" stroke-width="1.5" />
    <rect x="165" y="167" width="140" height="9" rx="2" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="0.8" />
    <rect x="165" y="181" width="140" height="9" rx="2" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="0.8" />
    <rect x="205" y="196" width="60" height="12" rx="3" fill="#E31E24" />
    <text x="235" y="205" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="bold" font-size="7" fill="#FFFFFF" text-anchor="middle">SUBMIT</text>
  </g>

  <!-- Top Right CSC DOST Authorization Seal Card -->
  <g transform="translate(1730, 36)" filter="url(#softShadow)">
    <rect x="0" y="0" width="260" height="66" rx="12" fill="#FFFFFF" stroke="#DBEAFE" stroke-width="1.5" />
    <circle cx="34" cy="33" r="22" fill="#092556" />
    <text x="34" y="38" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="12" fill="#FFCC00" text-anchor="middle">CSC</text>
    <text x="70" y="29" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="16" fill="#092556">CSC DOST</text>
    <text x="70" y="48" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="700" font-size="11" fill="#2563EB">Citizen Service Portal</text>
  </g>

  <!-- ===================================================================== -->
  <!-- LEFT SIDE: ROW 1 — MAIN HEADING + RED ROUNDED RECTANGLE               -->
  <!-- ===================================================================== -->
  <g>
    <text
      x="${groupStartX}"
      y="${row1BaselineY}"
      font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
      font-weight="900"
      font-size="${row1FontSize}"
      fill="#092556"
      stroke="#092556"
      stroke-width="1.8"
      paint-order="stroke fill"
      letter-spacing="0.5"
    >${escapeXml(mainLeft)}</text>

    <!-- Red Rounded Rectangle -->
    <rect
      x="${badgeBoxX}"
      y="${badgeBoxY}"
      width="${badgeBoxWidth}"
      height="${badgeBoxHeight}"
      rx="24"
      fill="url(#redBadgeGrad)"
      filter="url(#badgeShadow)"
    />

    <text
      x="${badgeBoxX + badgeBoxWidth / 2}"
      y="${badgeBoxY + 77}"
      font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
      font-weight="900"
      font-size="${badgeFontSize}"
      fill="#FFFFFF"
      stroke="#FFFFFF"
      stroke-width="1.6"
      paint-order="stroke fill"
      text-anchor="middle"
      letter-spacing="1"
    >${escapeXml(badgeText)}</text>
  </g>

  <!-- ===================================================================== -->
  <!-- LEFT SIDE: ROW 2 — SECOND LARGE HEADLINE                              -->
  <!-- ===================================================================== -->
  <text
    x="621"
    y="218"
    font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
    font-weight="900"
    font-size="${secondFontSize}"
    fill="#092556"
    stroke="#092556"
    stroke-width="1.6"
    paint-order="stroke fill"
    text-anchor="middle"
    letter-spacing="1.2"
  >${escapeXml(secondLine)}</text>

  <!-- ===================================================================== -->
  <!-- LEFT SIDE: ROW 3 — BRIGHT YELLOW ROUNDED BANNER PILL                  -->
  <!-- ===================================================================== -->
  <g filter="url(#glowYellow)">
    <rect
      x="200"
      y="242"
      width="842"
      height="88"
      rx="44"
      fill="url(#yellowPillGrad)"
      stroke="#E5A800"
      stroke-width="2"
    />
    <text
      x="621"
      y="302"
      font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
      font-weight="900"
      font-size="44"
      text-anchor="middle"
      letter-spacing="0.5"
    >
      <tspan fill="#092556" stroke="#092556" stroke-width="1.2" paint-order="stroke fill">${escapeXml(yellowPrefixClean)} </tspan>
      <tspan fill="#D32F2F" stroke="#D32F2F" stroke-width="1.4" paint-order="stroke fill">${escapeXml(yellowHighlightClean)}</tspan>
    </text>
  </g>

  <!-- ===================================================================== -->
  <!-- LEFT SIDE: ROW 4 — 4 CIRCULAR SERVICE ICONS & 3 VERTICAL DIVIDERS      -->
  <!-- ===================================================================== -->
  <!-- 3 Subtle Vertical Dividers -->
  <line x1="327" y1="358" x2="327" y2="520" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />
  <line x1="616" y1="358" x2="616" y2="520" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />
  <line x1="908" y1="358" x2="908" y2="520" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />

  <!-- 4 Circular Service Icons -->
  ${iconCentersX
    .map((cx, idx) => {
      const [l1, l2] = iconLines[idx];
      const iconSymbols = [
        // Icon 1: Form / Document
        `<path d="M ${cx - 14} 390 L ${cx + 8} 390 L ${cx + 16} 398 L ${cx + 16} 424 L ${cx - 14} 424 Z" fill="#2563EB" opacity="0.18" /><path d="M ${cx - 14} 390 L ${cx + 8} 390 L ${cx + 16} 398 L ${cx + 16} 424 L ${cx - 14} 424 Z" fill="none" stroke="#2563EB" stroke-width="2.6" /><line x1="${cx - 8}" y1="402" x2="${cx + 10}" y2="402" stroke="#2563EB" stroke-width="2.2" /><line x1="${cx - 8}" y1="410" x2="${cx + 10}" y2="410" stroke="#2563EB" stroke-width="2.2" /><line x1="${cx - 8}" y1="418" x2="${cx + 3}" y2="418" stroke="#2563EB" stroke-width="2.2" />`,
        // Icon 2: Cloud / Upload
        `<path d="M ${cx - 18} 416 C ${cx - 24} 416 ${cx - 24} 404 ${cx - 16} 402 C ${cx - 14} 392 ${cx - 2} 390 ${cx + 4} 395 C ${cx + 10} 390 ${cx + 22} 394 ${cx + 20} 404 C ${cx + 26} 406 ${cx + 26} 416 ${cx + 18} 416 Z" fill="#2563EB" opacity="0.18" stroke="#2563EB" stroke-width="2.4" /><path d="M ${cx} 404 L ${cx} 422 M ${cx - 6} 410 L ${cx} 404 L ${cx + 6} 410" fill="none" stroke="#2563EB" stroke-width="2.6" stroke-linecap="round" />`,
        // Icon 3: Verified / Submit
        `<circle cx="${cx}" cy="407" r="18" fill="#2563EB" opacity="0.18" stroke="#2563EB" stroke-width="2.4" /><path d="M ${cx - 8} 407 L ${cx - 2} 413 L ${cx + 8} 401" fill="none" stroke="#2563EB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
        // Icon 4: Headset / Support
        `<path d="M ${cx - 18} 408 A 18 18 0 0 1 ${cx + 18} 408 L ${cx + 18} 416 A 4 4 0 0 1 ${cx + 14} 420 L ${cx + 14} 420 A 4 4 0 0 1 ${cx + 10} 416 L ${cx + 10} 408 M ${cx - 18} 408 L ${cx - 18} 416 A 4 4 0 0 0 ${cx - 14} 420 L ${cx - 14} 420 A 4 4 0 0 0 ${cx - 10} 416 L ${cx - 10} 408" fill="none" stroke="#2563EB" stroke-width="2.6" /><path d="M ${cx + 10} 418 L ${cx + 4} 424 L ${cx - 4} 424" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" />`
      ];

      return `
        <!-- Circular Service Icon ${idx + 1} -->
        <g filter="url(#softShadow)">
          <circle cx="${cx}" cy="407" r="48" fill="url(#iconCircleGrad)" stroke="#93C5FD" stroke-width="3" />
          ${iconSymbols[idx]}
        </g>
        <!-- Icon 2-Line Label -->
        <text
          x="${cx}"
          y="488"
          font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
          font-weight="bold"
          font-size="22"
          fill="#092556"
          stroke="#092556"
          stroke-width="0.5"
          paint-order="stroke fill"
          text-anchor="middle"
        >${escapeXml(l1)}</text>
        <text
          x="${cx}"
          y="514"
          font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
          font-weight="bold"
          font-size="22"
          fill="#092556"
          stroke="#092556"
          stroke-width="0.5"
          paint-order="stroke fill"
          text-anchor="middle"
        >${escapeXml(l2)}</text>
      `;
    })
    .join('')}

  <!-- ===================================================================== -->
  <!-- BOTTOM SECTION: FULL-WIDTH CURVED NAVY BANNER                         -->
  <!-- ===================================================================== -->
  <g filter="url(#softShadow)">
    <path
      d="M 0 550 C 350 540, 850 540, 2048 550 L 2048 677 L 0 677 Z"
      fill="url(#bottomBannerGrad)"
    />
  </g>

  <!-- Yellow Circular Checkmark Icon on Bottom Left -->
  <g transform="translate(138, 613)">
    <circle cx="0" cy="0" r="28" fill="#FFCC00" stroke="#E5A800" stroke-width="2" />
    <path d="M -11 -1 L -3 8 L 12 -7" fill="none" stroke="#092556" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- 2-Line White Supporting Text -->
  <text
    x="208"
    y="606"
    font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
    font-size="33"
    fill="#FFFFFF"
  >${escapeXml(spec.footerLine1)}</text>
  <text
    x="208"
    y="646"
    font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
    font-weight="bold"
    font-size="35"
    fill="#FFFFFF"
    stroke="#FFFFFF"
    stroke-width="0.8"
    paint-order="stroke fill"
  >${escapeXml(spec.footerLine2)}</text>

  <!-- Large Red Rounded CTA Button (Right) -->
  <g transform="translate(1480, 560)">
    <rect x="0" y="0" width="470" height="74" rx="37" fill="url(#redBadgeGrad)" stroke="#B91217" stroke-width="2" filter="url(#badgeShadow)" />
    <!-- Centered Button Text -->
    <text
      x="205"
      y="50"
      font-family="'Liberation Sans', Arial, Helvetica, sans-serif"
      font-weight="bold"
      font-size="${ctaFontSize}"
      fill="#FFFFFF"
      stroke="#FFFFFF"
      stroke-width="1.4"
      paint-order="stroke fill"
      text-anchor="middle"
      letter-spacing="1"
    >${escapeXml(ctaText)}</text>
    <!-- White Circle with Red Right-Arrow -->
    <circle cx="415" cy="37" r="24" fill="#FFFFFF" />
    <path d="M 408 30 L 420 37 L 408 44" fill="none" stroke="#D32F2F" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;
}

/**
 * Renders the exact 2048 x 677 Master Reference Thumbnail as a high-res PNG or WebP Buffer.
 * Seamlessly falls back to rasterizing the standalone SVG if the photographic base cannot be accessed.
 */
export async function renderMasterThumbnailBuffer(
  spec: ThumbnailSpec,
  format: 'png' | 'webp' = 'png'
): Promise<Buffer> {
  try {
    const base = await getCleanMasterBaseBuffer();
    const svgOverlay = buildMasterOverlaySvg(spec);

    let pipeline = sharp(base.data, {
      raw: {
        width: base.width,
        height: base.height,
        channels: base.channels as 3,
      },
    }).composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ]);

    if (format === 'webp') {
      return await pipeline.webp({ quality: 94, effort: 4 }).toBuffer();
    }
    return await pipeline.png({ quality: 95, compressionLevel: 7 }).toBuffer();
  } catch (err) {
    console.warn('[ThumbnailGenerator] Base compositing notice, falling back to standalone SVG:', err);
    const fallbackSvg = renderStandaloneMasterThumbnailSvg(spec);
    let fallbackPipeline = sharp(Buffer.from(fallbackSvg), { density: 150 });
    if (format === 'webp') {
      return await fallbackPipeline.webp({ quality: 94 }).toBuffer();
    }
    return await fallbackPipeline.png({ quality: 95 }).toBuffer();
  }
}

/**
 * Convenience helper to generate a 2048x677 PNG buffer directly from a SarkariItem or ThumbnailInputPayload.
 */
export async function generatePostThumbnailPng(
  itemOrInput: Partial<SarkariItem> | ThumbnailInputPayload,
  useAi = false
): Promise<{ buffer: Buffer; spec: ThumbnailSpec }> {
  const payload: ThumbnailInputPayload = {
    id: (itemOrInput as any)?.id,
    title: itemOrInput?.title || 'CSC DOST Online Application Assistance',
    category: (itemOrInput as any)?.category,
    department: (itemOrInput as any)?.department,
    postType: (itemOrInput as any)?.postType,
    shortInfo: (itemOrInput as any)?.shortInfo,
    startDate: (itemOrInput as any)?.startDate,
    lastDate: (itemOrInput as any)?.lastDate,
    status: (itemOrInput as any)?.status,
    customOverrides: (itemOrInput as any)?.customOverrides,
  };

  const spec = useAi
    ? await extractThumbnailSpecWithAI(payload)
    : buildDeterministicThumbnailSpec(payload);

  const buffer = await renderMasterThumbnailBuffer(spec, 'png');
  return { buffer, spec };
}
