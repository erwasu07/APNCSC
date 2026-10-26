export const THUMBNAIL_WIDTH = 2048;
export const THUMBNAIL_HEIGHT = 677;

export interface ThumbnailSpec {
  mainHeadingLeft: string;       // e.g. "JKSSB", "IGNOU", "JKBOSE", "INDIAN ARMY"
  redBadgeText: string;          // e.g. "CLASS IV", "ADMISSION", "TES-57 (10+2)"
  secondHeading: string;         // e.g. "ONLINE APPLICATION", "ONLINE REGISTRATION"
  yellowBannerPrefix: string;    // e.g. "Apply Through ", "Admission ", "Check Result "
  yellowBannerHighlight: string; // e.g. "CSC DOST", "Assistance", "Details"
  fourIcons: [string, string, string, string]; // 4 short 2-3 word service labels
  laptopTitle: string;           // e.g. "JKSSB", "JOIN ARMY", "RRB APPLY"
  laptopSubtitle: string;        // e.g. "Online Application Form", "TES-57 Online Application"
  footerLine1: string;           // e.g. "Get Easy and Reliable Online Assistance"
  footerLine2: string;           // e.g. "for Indian Army TES-57 Course Application"
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

export function escapeXml(unsafe: string): string {
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
    return [`${words[0]} ${words[1]}`, words[2]];
  }
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

/**
 * Deterministic rule-based extractor that converts any CSC DOST post input
 * into the exact reference ThumbnailSpec.
 */
export function buildDeterministicThumbnailSpec(input: ThumbnailInputPayload): ThumbnailSpec {
  const rawTitle = (input.title || '').trim();
  const titleUpper = rawTitle.toUpperCase();
  const category = (input.category || '').toLowerCase();
  const postType = (input.postType || '').toLowerCase();
  const statusLower = (input.status || '').toLowerCase();

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

  // Generic heuristic fallback
  let mainHeadingLeft = 'CSC DOST';
  if (titleUpper.includes('JKSSB')) mainHeadingLeft = 'JKSSB';
  else if (titleUpper.includes('SSC')) mainHeadingLeft = 'SSC';
  else if (titleUpper.includes('RRB') || titleUpper.includes('RAILWAY')) mainHeadingLeft = 'RRB';
  else if (titleUpper.includes('ARMY')) mainHeadingLeft = 'INDIAN ARMY';
  else if (titleUpper.includes('UPSC')) mainHeadingLeft = 'UPSC';
  else if (titleUpper.includes('KASHMIR UNIV') || titleUpper.includes('KU')) mainHeadingLeft = 'KASHMIR UNIV';
  else if (titleUpper.includes('CLUSTER')) mainHeadingLeft = 'CLUSTER UNIV';
  else if (titleUpper.includes('IGNOU')) mainHeadingLeft = 'IGNOU';
  else if (titleUpper.includes('NTA') || titleUpper.includes('NEET') || titleUpper.includes('JEE')) mainHeadingLeft = 'NTA';

  let redBadgeText = 'RECRUITMENT';
  if (category === 'admissions' || postType === 'admission') redBadgeText = 'ADMISSION';
  else if (category === 'results' || postType === 'result') redBadgeText = 'RESULT';
  else if (category === 'exam_forms') redBadgeText = 'EXAM FORM';
  else if (titleUpper.includes('OFFICER') || titleUpper.includes('CONSTABLE')) redBadgeText = 'NEW POSTS';

  let secondHeading = 'ONLINE APPLICATION';
  if (category === 'admissions') secondHeading = 'ONLINE REGISTRATION';
  else if (category === 'results') secondHeading = 'RESULT UPDATE';
  else if (category === 'exam_forms') secondHeading = 'EXAMINATION FORM';

  let ctaButtonText: 'APPLY NOW' | 'CHECK RESULT' | 'READ DETAILS' = 'APPLY NOW';
  if (statusLower === 'closed') ctaButtonText = 'READ DETAILS';
  else if (category === 'results') ctaButtonText = 'CHECK RESULT';

  return {
    mainHeadingLeft,
    redBadgeText,
    secondHeading,
    yellowBannerPrefix: 'Apply Through ',
    yellowBannerHighlight: 'CSC DOST',
    fourIcons: [
      'Form Assistance',
      'Document Upload',
      'Fee Verification',
      'Candidate Support',
    ],
    laptopTitle: mainHeadingLeft.slice(0, 11),
    laptopSubtitle: 'Online Service Portal',
    footerLine1: 'Get Easy and Reliable Assistance',
    footerLine2: `for ${mainHeadingLeft} ${redBadgeText} Online`,
    ctaButtonText,
    ...input.customOverrides,
  };
}

/**
 * Generates a complete standalone 2048 x 677 Master Reference Thumbnail as vector SVG.
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
  <g transform="translate(1380, 200)">
    <ellipse cx="280" cy="180" rx="220" ry="140" fill="#2563EB" opacity="0.12" />
    <polygon points="120,230 350,225 390,270 90,275" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
    <polygon points="100,270 380,266 385,273 95,277" fill="#64748B" />
    <polygon points="135,100 335,95 345,225 125,230" fill="#0B1A3A" stroke="#CBD5E1" stroke-width="3" filter="url(#softShadow)" />
    <polygon points="142,108 328,103 337,218 133,222" fill="#FFFFFF" />
    <polygon points="142,108 328,103 330,135 140,140" fill="#092556" />
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

  <!-- LEFT SIDE: ROW 1 — MAIN HEADING + RED ROUNDED RECTANGLE -->
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

  <!-- LEFT SIDE: ROW 2 — SECOND LARGE HEADLINE -->
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

  <!-- LEFT SIDE: ROW 3 — BRIGHT YELLOW ROUNDED BANNER PILL -->
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

  <!-- LEFT SIDE: ROW 4 — 4 CIRCULAR SERVICE ICONS & 3 VERTICAL DIVIDERS -->
  <line x1="327" y1="358" x2="327" y2="520" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />
  <line x1="616" y1="358" x2="616" y2="520" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />
  <line x1="908" y1="358" x2="908" y2="520" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />

  ${iconCentersX
    .map((cx, idx) => {
      const [l1, l2] = iconLines[idx];
      const iconSymbols = [
        `<path d="M ${cx - 14} 390 L ${cx + 8} 390 L ${cx + 16} 398 L ${cx + 16} 424 L ${cx - 14} 424 Z" fill="#2563EB" opacity="0.18" /><path d="M ${cx - 14} 390 L ${cx + 8} 390 L ${cx + 16} 398 L ${cx + 16} 424 L ${cx - 14} 424 Z" fill="none" stroke="#2563EB" stroke-width="2.6" /><line x1="${cx - 8}" y1="402" x2="${cx + 10}" y2="402" stroke="#2563EB" stroke-width="2.2" /><line x1="${cx - 8}" y1="410" x2="${cx + 10}" y2="410" stroke="#2563EB" stroke-width="2.2" /><line x1="${cx - 8}" y1="418" x2="${cx + 3}" y2="418" stroke="#2563EB" stroke-width="2.2" />`,
        `<path d="M ${cx - 18} 416 C ${cx - 24} 416 ${cx - 24} 404 ${cx - 16} 402 C ${cx - 14} 392 ${cx - 2} 390 ${cx + 4} 395 C ${cx + 10} 390 ${cx + 22} 394 ${cx + 20} 404 C ${cx + 26} 406 ${cx + 26} 416 ${cx + 18} 416 Z" fill="#2563EB" opacity="0.18" stroke="#2563EB" stroke-width="2.4" /><path d="M ${cx} 404 L ${cx} 422 M ${cx - 6} 410 L ${cx} 404 L ${cx + 6} 410" fill="none" stroke="#2563EB" stroke-width="2.6" stroke-linecap="round" />`,
        `<circle cx="${cx}" cy="407" r="18" fill="#2563EB" opacity="0.18" stroke="#2563EB" stroke-width="2.4" /><path d="M ${cx - 8} 407 L ${cx - 2} 413 L ${cx + 8} 401" fill="none" stroke="#2563EB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
        `<path d="M ${cx - 18} 408 A 18 18 0 0 1 ${cx + 18} 408 L ${cx + 18} 416 A 4 4 0 0 1 ${cx + 14} 420 L ${cx + 14} 420 A 4 4 0 0 1 ${cx + 10} 416 L ${cx + 10} 408 M ${cx - 18} 408 L ${cx - 18} 416 A 4 4 0 0 0 ${cx - 14} 420 L ${cx - 14} 420 A 4 4 0 0 0 ${cx - 10} 416 L ${cx - 10} 408" fill="none" stroke="#2563EB" stroke-width="2.6" /><path d="M ${cx + 10} 418 L ${cx + 4} 424 L ${cx - 4} 424" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" />`
      ];

      return `
        <g filter="url(#softShadow)">
          <circle cx="${cx}" cy="407" r="48" fill="url(#iconCircleGrad)" stroke="#93C5FD" stroke-width="3" />
          ${iconSymbols[idx]}
        </g>
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

  <!-- BOTTOM SECTION: FULL-WIDTH CURVED NAVY BANNER -->
  <g filter="url(#softShadow)">
    <path
      d="M 0 550 C 350 540, 850 540, 2048 550 L 2048 677 L 0 677 Z"
      fill="url(#bottomBannerGrad)"
    />
  </g>

  <!-- Yellow Circular Checkmark Icon -->
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

  <!-- Large Red Rounded CTA Button -->
  <g transform="translate(1480, 560)">
    <rect x="0" y="0" width="470" height="74" rx="37" fill="url(#redBadgeGrad)" stroke="#B91217" stroke-width="2" filter="url(#badgeShadow)" />
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
    <circle cx="415" cy="37" r="24" fill="#FFFFFF" />
    <path d="M 408 30 L 420 37 L 408 44" fill="none" stroke="#D32F2F" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;
}
