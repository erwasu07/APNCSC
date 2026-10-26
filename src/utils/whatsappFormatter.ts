import { SarkariItem, SARKARI_CATEGORIES } from '../data/sarkariData';
import { ServiceItem, CATEGORY_LABELS } from '../servicesData';

export type WhatsAppNotificationCategory =
  | 'job'
  | 'admission'
  | 'result'
  | 'scholarship'
  | 'scheme'
  | 'generic';

export interface WhatsAppFormattedField {
  icon: string;
  label: string;
  value: string;
}

export interface WhatsAppNotificationOverrides {
  customTitle?: string;
  customOrganization?: string;
  customQualification?: string;
  customVacancies?: string;
  customLastDate?: string;
  customCourse?: string;
  customSession?: string;
  customExamination?: string;
  customResultStatus?: string;
  customDepartment?: string;
  customApplicationStatus?: string;
  customUrl?: string;
  forceCategoryType?: WhatsAppNotificationCategory;
}

export interface WhatsAppMessagePayload {
  categoryType: WhatsAppNotificationCategory;
  heading: string;
  shortTitle: string;
  fields: WhatsAppFormattedField[];
  canonicalUrl: string;
  message: string;
  whatsappShareUrl: string;
  whatsappWebShareUrl: string;
  nativeShareData: {
    title: string;
    text: string;
  };
}

const SEPARATOR_LINE = '━━━━━━━━━━━━━━━━━━';
const PORTAL_SIGNATURE = '_CSC DOST — Citizen Service Portal_';
const CANONICAL_DOMAIN = 'https://www.cscdost.com';

const INVALID_VALUE_PATTERNS = new Set([
  'undefined',
  'null',
  'n/a',
  'na',
  'none',
  'nil',
  '[object object]',
  '-',
  '--',
]);

const GENERIC_PLACEHOLDER_PATTERNS = [
  /^check\s+(?:official\s+)?notification$/i,
  /^refer\s+to\s+(?:official\s+)?notification/i,
  /^as\s+per\s+(?:official\s+)?notification/i,
  /^not\s+applicable$/i,
  /^various\s+posts$/i,
  /^open\s+for\s+eligible\s+candidates$/i,
  /^eligible\s+candidates$/i,
];

/**
 * Cleans and validates a dynamic value so undefined, null, N/A, HTML tags,
 * or [object Object] are never emitted into a WhatsApp message.
 */
export function sanitizeWhatsAppText(
  raw: unknown,
  rejectGenericPlaceholders = false
): string {
  if (raw === undefined || raw === null) return '';
  if (typeof raw === 'object') return '';

  const cleaned = String(raw)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return '';
  if (INVALID_VALUE_PATTERNS.has(cleaned.toLowerCase())) return '';

  if (rejectGenericPlaceholders) {
    for (const pattern of GENERIC_PLACEHOLDER_PATTERNS) {
      if (pattern.test(cleaned)) return '';
    }
  }

  return cleaned;
}

/**
 * Generates a single, clean canonical URL for a post or service.
 * Permanently prevents duplicate URLs or malformed slugs.
 */
export function getCanonicalPostUrl(
  slugOrUrl?: string | null,
  type: 'post' | 'service' = 'post'
): string {
  if (!slugOrUrl || typeof slugOrUrl !== 'string') {
    return CANONICAL_DOMAIN;
  }

  // Take only the first non-empty line/token in case a caller accidentally passed duplicated lines
  const firstToken = slugOrUrl
    .split(/[\r\n\s]+/)
    .map((s) => s.trim())
    .find(Boolean);

  if (!firstToken) return CANONICAL_DOMAIN;

  // If a full URL was passed, extract its pathname or validate it
  if (/^https?:\/\//i.test(firstToken)) {
    try {
      const parsed = new URL(firstToken);
      const pathMatch = parsed.pathname.match(
        /^\/(?:post|job|jobs|sarkari|notice|admissions|notification|service)\/([^/?#]+)/i
      );
      if (pathMatch && pathMatch[1]) {
        const cleanSlug = decodeURIComponent(pathMatch[1])
          .trim()
          .replace(/[^a-zA-Z0-9-_]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        const prefix = /^\/service\//i.test(parsed.pathname) ? 'service' : type;
        return cleanSlug ? `${CANONICAL_DOMAIN}/${prefix}/${cleanSlug}` : CANONICAL_DOMAIN;
      }
      const hashMatch = parsed.hash.match(/^#\/?(post|job|service)\/([^/?#]+)/i);
      if (hashMatch && hashMatch[2]) {
        const prefix = hashMatch[1].toLowerCase() === 'service' ? 'service' : 'post';
        const cleanSlug = decodeURIComponent(hashMatch[2])
          .trim()
          .replace(/[^a-zA-Z0-9-_]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        return cleanSlug ? `${CANONICAL_DOMAIN}/${prefix}/${cleanSlug}` : CANONICAL_DOMAIN;
      }
      if (parsed.hostname.includes('cscdost.com')) {
        const cleanPath = parsed.pathname.replace(/\/+$/, '');
        return `${CANONICAL_DOMAIN}${cleanPath}`;
      }
    } catch {
      // Fall through to slug sanitizer
    }
  }

  const rawSlug = firstToken
    .replace(/^#\/?(?:post|job|service)\//i, '')
    .replace(/^\/?(?:post|job|jobs|sarkari|notice|admissions|notification|service)\//i, '')
    .split(/[?#]/)[0]
    .trim();

  const safeSlug = rawSlug
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!safeSlug || INVALID_VALUE_PATTERNS.has(safeSlug.toLowerCase())) {
    return CANONICAL_DOMAIN;
  }

  return `${CANONICAL_DOMAIN}/${type}/${safeSlug}`;
}

/**
 * Generates a compact, factual WhatsApp title that preserves:
 * - Department / Authority
 * - Recruitment or Exam name
 * - Course / Advertisement / Notification number
 * - Year
 * Example:
 * "Indian Army 10+2 Technical Entry Scheme (TES-57 Course) Online Form 2026"
 * -> "Indian Army TES-57 Recruitment 2026"
 */
export function generateShortWhatsAppTitle(rawTitle?: string, category?: string): string {
  const cleaned = sanitizeWhatsAppText(rawTitle);
  if (!cleaned) return 'CSC DOST Official Notification';

  // 1. Specific pattern: Indian Army 10+2 Technical Entry Scheme (TES-XX Course) Online Form YYYY
  const tesMatch = cleaned.match(
    /Indian\s+Army.*?\b(TES[-\s]?\d+)\b.*?(20\d{2})/i
  );
  if (tesMatch) {
    const tesCode = tesMatch[1].toUpperCase().replace(/\s+/g, '-');
    const year = tesMatch[2];
    return `Indian Army ${tesCode} Recruitment ${year}`;
  }

  // 2. Specific pattern: SSC Combined Higher Secondary (10+2) Level (CHSL) Examination YYYY ...
  const chslMatch = cleaned.match(/SSC\b.*?\b(CHSL)\b.*?\b(Examination|Recruitment)\s*(20\d{2})/i);
  if (chslMatch) {
    return `SSC ${chslMatch[1].toUpperCase()} ${chslMatch[2]} ${chslMatch[3]}`;
  }

  // 3. Specific pattern: SSC Combined Graduate Level (CGL) Examination YYYY ...
  const cglMatch = cleaned.match(/SSC\b.*?\b(CGL)\b.*?\b(Examination|Recruitment)\s*(20\d{2})/i);
  if (cglMatch) {
    return `SSC ${cglMatch[1].toUpperCase()} ${cglMatch[2]} ${cglMatch[3]}`;
  }

  // 4. Specific pattern: RRB NTPC Undergraduate / Graduate ...
  const rrbNtpcMatch = cleaned.match(
    /^(RRB\s+NTPC\s+(?:Undergraduate|Graduate))\s*(?:\([^)]+\))?\s*(?:Level\s+Posts\s+)?(Recruitment\s+20\d{2})(?:\s*(\(CEN\s+[^)]+\)))?/i
  );
  if (rrbNtpcMatch) {
    return `${rrbNtpcMatch[1]} ${rrbNtpcMatch[2]}${rrbNtpcMatch[3] ? ` ${rrbNtpcMatch[3]}` : ''}`;
  }

  // 5. Specific pattern: IGNOU ... Session Open & Distance Learning Online Form
  if (/^IGNOU\b/i.test(cleaned) && /Online\s+Form$/i.test(cleaned)) {
    const ignouShort = cleaned.replace(/\s+Online\s+(?:Application\s+)?Form$/i, ' Admission');
    const yearMatch = cleaned.match(/\b20\d{2}\b/);
    return yearMatch ? ignouShort : `${ignouShort} 2026`;
  }

  // 6. Specific pattern: JKSSB Advt XX of YYYY: [Recruitment for] [NNN] <Post Name> Posts in <Department>
  const jkssbAdvtMatch = cleaned.match(
    /^JKSSB\s+(Advt(?:\s+No\.?)?\s+\d+\s+of\s+(20\d{2})):\s*(?:(?:Mega\s+)?Recruitment\s+for\s+)?(?:\d[\d,]*\s+)?(.+?)\s+Posts\s+in\s+.+$/i
  );
  if (jkssbAdvtMatch) {
    return `JKSSB ${jkssbAdvtMatch[3]} Recruitment ${jkssbAdvtMatch[2]} (${jkssbAdvtMatch[1]})`;
  }

  // 7. General safe shortening of verbose filler phrases while keeping all identifiers & years intact
  let concise = cleaned
    .replace(/\s+Online\s+Application\s+Form(?=\s+20\d{2}|$)/i, ' Recruitment')
    .replace(
      /\s+Online\s+Form(?=\s+20\d{2}|$)/i,
      category === 'admissions' || category === 'exam_forms' || category === 'cluster_univ'
        ? ''
        : ' Recruitment'
    )
    .replace(/\s+Online\s+Registration$/i, '')
    .replace(/\s*&\s*Revised\s+Vacancy\s+Notice/i, '')
    .replace(/\s+Online\s+Examination\s+Form\s+Notice/i, ' Exam Form')
    .replace(/\s+Online\s+Exam\s+Form\s+Notice/i, ' Exam Form')
    .replace(/\s+Online\s+Admission\s+Notification/i, ' Admission')
    .replace(/\s+Admission\s+Notification/i, ' Admission')
    .replace(/\s+/g, ' ')
    .trim();

  // If the resulting title is still very long (> 78 chars) and has a trailing parenthetical cadre list like "(UT, Divisional & District Cadres)", strip only the generic cadre parenthetical
  if (concise.length > 78) {
    concise = concise
      .replace(/\s*\((?:UT,\s*Divisional\s*&\s*District\s*Cadres|All\s+Arms)\)/i, '')
      .replace(/\bMega\s+Recruitment\s+for\s+/i, '')
      .replace(/\bRecruitment\s+for\s+/i, '')
      .trim();
  }

  return concise || cleaned;
}

/**
 * Automatically classifies a post into the appropriate notification category:
 * - 'job' (JOBS AND RECRUITMENT)
 * - 'admission' (ADMISSIONS)
 * - 'result' (RESULTS)
 * - 'scholarship' (SCHOLARSHIPS)
 * - 'scheme' (GOVERNMENT SCHEMES)
 * - 'generic' (ALL OTHER CATEGORIES)
 */
export function detectWhatsAppNotificationCategory(
  item: Partial<SarkariItem>
): WhatsAppNotificationCategory {
  const cat = (item.category || '').toLowerCase().trim();
  const postType = (item.postType || '').toLowerCase().trim();
  const title = (item.title || '').toLowerCase();
  const shortInfo = (item.shortInfo || '').toLowerCase();
  const combined = `${title} ${shortInfo}`;

  // 1. Check explicit Scholarships first
  if (
    postType === 'scholarship' ||
    cat === 'scholarship' ||
    cat === 'scholarships' ||
    /\b(scholarship|nsp|pmsss|post[-\s]?matric|pre[-\s]?matric|fellowship|pragati\s+scholarship|saksham\s+scholarship)\b/i.test(
      title
    )
  ) {
    return 'scholarship';
  }

  // 2. Check Government Schemes
  if (
    postType === 'scheme' ||
    cat === 'scheme' ||
    cat === 'schemes' ||
    cat === 'central scheme' ||
    /\b(pm[-\s]?kisan|ayushman\s+bharat|pm[-\s]?jay|sehat\s+golden|yojana|e[-\s]?shram|vishwakarma|jan\s+dhan|ujjwala|surya\s+ghar|ladli\s+beti|pension\s+scheme)\b/i.test(
      title
    )
  ) {
    return 'scheme';
  }

  // 3. Check Results (including JKBOSE, CBSE, University results, Scorecards, Merit Lists)
  if (
    cat === 'results' ||
    postType === 'result' ||
    /\b(result|results|scorecard|score\s+card|cutoff\s+marks|merit\s+list|rank\s+list|jkbose.*result|cbse.*result)\b/i.test(
      title
    )
  ) {
    // Note: If it's a "Selection List & Counseling Notice for Admission", treat as admission if category is admissions
    if (cat === 'admissions' && /\badmission\b/i.test(title) && !/\bresult\b/i.test(title)) {
      return 'admission';
    }
    return 'result';
  }

  // 4. Check Admissions (University admissions, IGNOU, CUET/NEET admission portals, counselling, degree/diploma admissions)
  if (
    cat === 'admissions' ||
    postType === 'admission' ||
    /\b(admission|admissions|ignou|csas|d\.el\.ed|b\.ed.*admission|pg\s+diploma|spot\s+round|stray\s+round|counseling|counselling)\b/i.test(
      title
    )
  ) {
    return 'admission';
  }

  // 5. Check Cluster Univ / Exam Forms / NTA
  if (cat === 'cluster_univ' || cat === 'exam_forms' || cat === 'nta') {
    if (/\b(result|scorecard|answer\s+key)\b/i.test(title)) {
      return 'result';
    }
    return 'admission';
  }

  // 6. Check Jobs & Recruitment
  if (
    cat === 'army_jobs' ||
    cat === 'jkssb' ||
    cat === 'ssc_jobs' ||
    cat === 'rrb_jobs' ||
    cat === 'jobs' ||
    postType === 'job' ||
    /\b(recruitment|vacancies|vacancy|constable|sub[-\s]?inspector|junior\s+engineer|patwari|agniveer|tes[-\s]?\d+|ntpc|chsl|cgl|mts|clerk|stenographer|teacher|nurse)\b/i.test(
      combined
    )
  ) {
    return 'job';
  }

  return 'generic';
}

/**
 * Resolves the clean Organization / Authority / University / Board name from a post.
 */
export function resolvePostOrganization(item: Partial<SarkariItem>): string {
  const explicitDept = sanitizeWhatsAppText(item.department, true);
  if (explicitDept) return explicitDept;

  const title = sanitizeWhatsAppText(item.title);
  const shortInfo = sanitizeWhatsAppText(item.shortInfo);
  const combined = `${title} ${shortInfo}`;
  const cat = (item.category || '').toLowerCase();

  if (/\bJKBOSE\b|J&K\s+Board\s+of\s+School\s+Education/i.test(combined)) {
    return 'J&K Board of School Education (JKBOSE)';
  }
  if (/\bIGNOU\b|Indira\s+Gandhi\s+National\s+Open\s+University/i.test(combined)) {
    return 'Indira Gandhi National Open University (IGNOU)';
  }
  if (cat === 'army_jobs' || /\bIndian\s+Army\b|\bAgniveer\b/i.test(title)) {
    return 'Indian Army';
  }
  if (cat === 'jkssb' || /\bJKSSB\b/i.test(title)) {
    return 'J&K Services Selection Board (JKSSB)';
  }
  if (cat === 'ssc_jobs' || /\bSSC\b/i.test(title)) {
    return 'Staff Selection Commission (SSC)';
  }
  if (cat === 'rrb_jobs' || /\bRRB\b|\bRailway\b|\bRPF\b/i.test(title)) {
    return 'Railway Recruitment Board (RRB)';
  }
  if (cat === 'cluster_univ' || /\bCluster\s+University\s+Srinagar\b/i.test(combined)) {
    return 'Cluster University Srinagar';
  }
  if (
    cat === 'admissions' ||
    cat === 'exam_forms' ||
    /\bKashmir\s+University\b|\bUniversity\s+of\s+Kashmir\b/i.test(combined)
  ) {
    if (/\bDelhi\s+University\b|\bDU\b|\bCSAS\b/i.test(title)) {
      return 'University of Delhi';
    }
    if (/\bUP\s+D\.El\.Ed\b|\bUttar\s+Pradesh\b/i.test(combined)) {
      return 'Examination Regulatory Authority, UP';
    }
    return 'University of Kashmir';
  }
  if (cat === 'nta' || /\bNTA\b|\bCUET\b|\bNEET\b|\bJEE\s+Main\b/i.test(title)) {
    return 'National Testing Agency (NTA)';
  }
  if (/\bCBSE\b|\bCTET\b/i.test(title)) {
    return 'Central Board of Secondary Education (CBSE)';
  }
  if (/\bUPSC\b/i.test(title)) {
    return 'Union Public Service Commission (UPSC)';
  }
  if (/\bIBPS\b/i.test(title)) {
    return 'Institute of Banking Personnel Selection (IBPS)';
  }
  if (/\bSBI\b|State\s+Bank\s+of\s+India/i.test(title)) {
    return 'State Bank of India (SBI)';
  }
  if (/\bRBI\b|Reserve\s+Bank\s+of\s+India/i.test(title)) {
    return 'Reserve Bank of India (RBI)';
  }
  if (/\bUP\s+Police\b|\bUPPRPB\b/i.test(title)) {
    return 'UP Police Recruitment Board (UPPRPB)';
  }
  if (/\bIndia\s+Post\b|\bGDS\b/i.test(title)) {
    return 'Department of Posts (India Post)';
  }
  if (/\bDRDO\b/i.test(title)) {
    return 'Defence Research & Development Organisation (DRDO)';
  }
  if (/\bISRO\b/i.test(title)) {
    return 'Indian Space Research Organisation (ISRO)';
  }
  if (/\bIIT\s+JEE\s+Advanced\b/i.test(title)) {
    return 'Joint Admission Board (IITs)';
  }
  if (/\bNational\s+Scholarship\s+Portal\b|\bNSP\b/i.test(combined)) {
    return 'National Scholarship Portal (NSP)';
  }

  const catLabel = SARKARI_CATEGORIES[cat as keyof typeof SARKARI_CATEGORIES]?.label;
  return sanitizeWhatsAppText(catLabel, true);
}

/**
 * Extracts a concise, factual 1-line Qualification string from `item.eligibility`
 * without dumping long eligibility paragraphs or inventing data.
 */
export function extractCompactQualification(rawEligibility?: string, rawTitle?: string): string {
  const clean = sanitizeWhatsAppText(rawEligibility, true);
  if (!clean) return '';

  // Specific concise patterns for well-known verbose eligibility strings
  if (/Physics,\s*Chemistry.*Mathematics\s*\(PCM\).*Class\s*12th\s*\(10\+2\).*JEE\s*\(Mains\)/i.test(clean)) {
    return '10+2 (PCM) with 60% Marks & JEE (Mains)';
  }
  if (/12th\s*\(\+2\s*Stage\)\s*or\s*its\s*equivalent\s*examination\s*passed\s*with\s*minimum\s*50%\s*marks/i.test(clean)) {
    return '12th (+2) Pass with Min 50% Marks';
  }
  if (/passed\s*12th\s*Standard\s*or\s*equivalent\s*examination\s*from\s*a\s*recognized\s*Board/i.test(clean)) {
    return '12th Standard (10+2) Pass';
  }

  if (/Three\s+Years\s+Diploma\s+in\s+Mechanical\s+Engineering.*B\.E\.\/B\.Tech/i.test(clean)) {
    return '3-Year Diploma or B.E./B.Tech in Mechanical Engineering';
  }

  // If already compact (<= 88 characters), return first sentence or full string
  if (clean.length <= 88) {
    return clean.replace(/\.$/, '');
  }

  // Extract the first sentence if it is concise
  const firstSentence = clean.split(/\.\s+/)[0].trim();
  if (firstSentence.length <= 88) {
    return firstSentence
      .replace(/^Candidates\s+must\s+have\s+passed\s+/i, '')
      .replace(/^Candidates\s+must\s+possess\s+/i, '')
      .replace(/^Minimum\s+/i, 'Min ')
      .replace(/\.$/, '');
  }

  // Extract concise clause before secondary clauses ("from a recognized", ";")
  const clause = firstSentence
    .replace(/^Candidates\s+must\s+have\s+passed\s+/i, '')
    .replace(/^Candidates\s+must\s+possess\s+/i, '')
    .split(/\s+from\s+(?:a|any)\s+(?:Government\s+)?recognized\b|\s*;\s*/i)[0]
    .trim();

  if (clause.length <= 88) {
    return clause.replace(/\.$/, '');
  }

  // Safe word-boundary trim without cutting key qualification terms
  const words = clause.split(' ');
  let acc = '';
  for (const w of words) {
    if ((acc + ' ' + w).trim().length > 84) break;
    acc = (acc + ' ' + w).trim();
  }
  return acc || rawTitle ? acc : '';
}

/**
 * Extracts a clean, factual Vacancies string (omitting non-vacancy student enrollment counts on exam/result posts).
 */
export function extractCompactVacancies(
  rawTotalPosts?: string | number,
  categoryType: WhatsAppNotificationCategory = 'job'
): string {
  if (categoryType === 'result' || categoryType === 'scholarship' || categoryType === 'scheme') {
    return '';
  }

  const clean = sanitizeWhatsAppText(rawTotalPosts, true);
  if (!clean) return '';

  // Reject student exam-form enrollment figures or fee strings that aren't job vacancies
  if (/\b(?:enrolled|admitted\s+students|open\s+for\s+all|per\s+paper|semester\s+fee)\b/i.test(clean)) {
    return '';
  }

  if (/^\d+$/.test(clean)) {
    return `${clean} Posts`;
  }

  // Trim verbose trailing geographic clauses and long category-wise breakdowns like "(OM: 51 | SC: 11 ...)"
  return clean
    .replace(/\s*\((?:OM|Gen|UR)\s*:\s*\d+[^)]*\)/i, '')
    .replace(/\s+Across\s+All\s+RRB\s+Zones$/i, '')
    .replace(/\s+Across\s+All\s+Zones$/i, '')
    .trim();
}

/**
 * Extracts a clean Last Date string, omitting generic placeholders like "Check Notification".
 */
export function extractCompactLastDate(
  rawLastDate?: string,
  categoryType: WhatsAppNotificationCategory = 'job'
): string {
  if (categoryType === 'result') return '';

  const clean = sanitizeWhatsAppText(rawLastDate, true);
  if (!clean) return '';

  if (/^(?:result\s+declared|published|declared|not\s+applicable|closed)$/i.test(clean)) {
    return '';
  }

  // If the date string has multiple slash-separated fee tiers like "22/08/2026 (Without Late Fee) / 28/08/2026 (With Late Fee ₹500)", keep the primary date cleanly
  const primaryDateMatch = clean.match(/^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})(?:\s*\(Without\s+Late\s+Fee\))?/i);
  if (primaryDateMatch && clean.length > 36) {
    return primaryDateMatch[1];
  }

  return clean;
}

/**
 * Extracts Course / Programme name for Admission notifications.
 */
export function extractCourseOrProgramme(item: Partial<SarkariItem>): string {
  const title = sanitizeWhatsAppText(item.title);
  const shortInfo = sanitizeWhatsAppText(item.shortInfo);
  const combined = `${title} ${shortInfo}`;

  // Look for explicit courses in parentheses or known degree lists
  const courseListMatch = combined.match(
    /\b((?:BA|B\.A\.|B\.Sc|B\.Com|BBA|BCA|MA|M\.A\.|M\.Sc|M\.Com|MBA|MCA|B\.Ed|M\.Ed|B\.Tech|Ph\.D|LL\.B|BA-LLB)(?:(?:,\s*|\s+and\s+|\s*&\s*)(?:BA|B\.A\.|B\.Sc|B\.Com|BBA|BCA|MA|M\.A\.|M\.Sc|M\.Com|MBA|MCA|B\.Ed|M\.Ed|B\.Tech|Ph\.D|LL\.B|PG\s+Diplomas?|Diplomas?(?:\s+courses)?))+)/i
  );
  if (courseListMatch) {
    return courseListMatch[1]
      .replace(/\s+and\s+/gi, ' & ')
      .replace(/,\s*&/g, ' &')
      .replace(/\bcourses$/i, 'Courses')
      .trim();
  }

  if (/\bUG\s+Honours\b|\bFYUGP\b/i.test(combined)) {
    return '4-Year UG Honours Programmes (FYUGP)';
  }
  if (/\bCSAS\s+UG\b|\bundergraduate\s+degree\b/i.test(combined)) {
    return 'Undergraduate (UG) Degree Programmes';
  }
  if (/\bD\.El\.Ed\b/i.test(combined)) {
    return '2-Year Diploma in Elementary Education (D.El.Ed)';
  }
  if (/\b5-Year\s+Integrated\s+BA-LLB\b/i.test(combined)) {
    return '5-Year Integrated BA-LLB';
  }
  if (/\bPG\s+Diploma\s+in\s+([^()]+)/i.test(title)) {
    const m = title.match(/\b(PG\s+Diploma\s+in\s+[^()]+)/i);
    if (m) return m[1].trim();
  }
  if (/\bPG\s+Diploma\s*&\s*Certificate\s+Courses\b/i.test(combined)) {
    return '1-Year PG Diploma & Certificate Courses';
  }
  if (/\b2-Year\s+B\.Ed\b|\bB\.Ed\b/i.test(title)) {
    return 'Bachelor of Education (B.Ed)';
  }
  if (/\bPh\.D\.\s+Research\s+Programme\b/i.test(title)) {
    return 'Ph.D. Research Programme';
  }

  return '';
}

/**
 * Extracts Admission Session (e.g., "July 2026 Session", "2026-27") from post data.
 */
export function extractAdmissionSession(item: Partial<SarkariItem>): string {
  const title = sanitizeWhatsAppText(item.title);
  const shortInfo = sanitizeWhatsAppText(item.shortInfo);
  const combined = `${title} ${shortInfo}`;

  const monthSessionMatch = combined.match(/\b((?:January|July|Autumn|Spring|Winter|Summer)\s+(?:20\d{2}\s+)?Session(?:\s+20\d{2})?)\b/i);
  if (monthSessionMatch) {
    const raw = monthSessionMatch[1].trim();
    if (!/\b20\d{2}\b/.test(raw)) {
      const yr = (item.postDate || '').match(/\b(20\d{2})\b/)?.[1] || '2026';
      return raw.replace(/\s+Session/i, ` ${yr} Session`);
    }
    return raw;
  }

  const rangeMatch = combined.match(/\b(20\d{2}\s*[-–]\s*(?:20)?\d{2})\b/);
  if (rangeMatch) {
    return `Academic Session ${rangeMatch[1].replace(/\s+/g, '')}`;
  }

  const batchMatch = combined.match(/\b(Session\s+20\d{2}|Batch\s+20\d{2})\b/i);
  if (batchMatch) {
    return batchMatch[1];
  }

  const yearMatch = title.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    return `Academic Session ${yearMatch[1]}`;
  }

  return '';
}

/**
 * Extracts Examination Name and Result Status for Result notifications.
 */
export function extractResultDetails(item: Partial<SarkariItem>): {
  examination: string;
  resultStatus: string;
} {
  const title = sanitizeWhatsAppText(item.title);
  const postDate = sanitizeWhatsAppText(item.postDate, true);

  const examName = title
    .replace(/\s*(?:Final\s+)?Result(?:s)?\s*(?:&\s*Cutoff\s+Marks|\s*&\s*AIR\s+Rank\s+List|\s*&\s*Scorecard)?/i, ' ')
    .replace(/\s*Written\s+Test\s+Merit\s+List\s*&\s*Scorecard/i, ' Written Examination')
    .replace(/\s*Scorecard\s*&\s*Normalised\s+Percentile/i, ' Examination')
    .replace(/\s+/g, ' ')
    .trim();

  const statusText = postDate ? `Declared (${postDate})` : 'Result Declared — Available Online';

  return {
    examination: examName || title,
    resultStatus: statusText,
  };
}

/**
 * Builds the Option 1 Professional WhatsApp Notification payload for any CSC DOST post.
 * Guarantees:
 * - Category-specific heading & fields
 * - WhatsApp single-asterisk bold & underscore italic formatting
 * - Omission of missing fields (never outputs undefined, null, N/A, or [object Object])
 * - Exactly ONE canonical post URL
 * - Single encodeURIComponent encoding
 */
export function buildWhatsAppNotification(
  item: Partial<SarkariItem>,
  overrides: WhatsAppNotificationOverrides = {}
): WhatsAppMessagePayload {
  const categoryType =
    overrides.forceCategoryType || detectWhatsAppNotificationCategory(item);

  const rawTitle = overrides.customTitle || item.title || 'CSC DOST Official Update';
  const shortTitle = generateShortWhatsAppTitle(rawTitle, item.category);
  const canonicalUrl = getCanonicalPostUrl(overrides.customUrl || item.id, 'post');

  const organization = sanitizeWhatsAppText(
    overrides.customOrganization ?? resolvePostOrganization(item),
    true
  );

  let heading = '📢 *CSC DOST | NEW JOB ALERT*';
  const fields: WhatsAppFormattedField[] = [];

  if (categoryType === 'job') {
    heading = '📢 *CSC DOST | NEW JOB ALERT*';
    const qualification = sanitizeWhatsAppText(
      overrides.customQualification ?? extractCompactQualification(item.eligibility, rawTitle),
      true
    );
    const vacancies = sanitizeWhatsAppText(
      overrides.customVacancies ?? extractCompactVacancies(item.totalPosts, 'job'),
      true
    );
    const lastDate = sanitizeWhatsAppText(
      overrides.customLastDate ?? extractCompactLastDate(item.lastDate, 'job'),
      true
    );

    if (organization) fields.push({ icon: '📌', label: 'Organization', value: organization });
    if (qualification) fields.push({ icon: '🎓', label: 'Qualification', value: qualification });
    if (vacancies) fields.push({ icon: '👥', label: 'Vacancies', value: vacancies });
    if (lastDate) fields.push({ icon: '📅', label: 'Last Date', value: lastDate });
  } else if (categoryType === 'admission') {
    heading = '🎓 *CSC DOST | ADMISSION UPDATE*';
    const course = sanitizeWhatsAppText(
      overrides.customCourse ?? extractCourseOrProgramme(item),
      true
    );
    const session = sanitizeWhatsAppText(
      overrides.customSession ?? extractAdmissionSession(item),
      true
    );
    const lastDate = sanitizeWhatsAppText(
      overrides.customLastDate ?? extractCompactLastDate(item.lastDate, 'admission'),
      true
    );

    if (organization) {
      fields.push({ icon: '🏛️', label: 'University/Institution', value: organization });
    }
    if (course) {
      fields.push({ icon: '📘', label: 'Course/Programme', value: course });
    }
    if (session) {
      fields.push({ icon: '🗓️', label: 'Admission Session', value: session });
    }
    if (lastDate) {
      fields.push({ icon: '📅', label: 'Last Date', value: lastDate });
    }
  } else if (categoryType === 'result') {
    heading = '📢 *CSC DOST | RESULT UPDATE*';
    const resDetails = extractResultDetails(item);
    const examination = sanitizeWhatsAppText(
      overrides.customExamination ?? resDetails.examination,
      true
    );
    const resultStatus = sanitizeWhatsAppText(
      overrides.customResultStatus ?? resDetails.resultStatus,
      true
    );

    if (organization) {
      fields.push({ icon: '🏛️', label: 'Board/University', value: organization });
    }
    if (examination) {
      fields.push({ icon: '📝', label: 'Examination', value: examination });
    }
    if (resultStatus) {
      fields.push({ icon: '📊', label: 'Result Status', value: resultStatus });
    }
  } else if (categoryType === 'scholarship') {
    heading = '🎓 *CSC DOST | SCHOLARSHIP ALERT*';
    const cleanSchemeTitle = shortTitle
      .replace(/\s+Online\s+(?:Registration|Form|Application).*$/i, '')
      .trim();
    const schemeName = sanitizeWhatsAppText(
      overrides.customOrganization || cleanSchemeTitle || rawTitle,
      true
    );
    const eligibleCandidates = sanitizeWhatsAppText(
      overrides.customQualification ??
        (extractCompactQualification(item.eligibility, rawTitle) ||
          extractCompactQualification(item.shortInfo, rawTitle)),
      true
    );
    const lastDate = sanitizeWhatsAppText(
      overrides.customLastDate ?? extractCompactLastDate(item.lastDate, 'scholarship'),
      true
    );

    if (schemeName) {
      fields.push({ icon: '🏅', label: 'Scheme Name', value: schemeName });
    }
    if (eligibleCandidates) {
      fields.push({ icon: '🎓', label: 'Eligible Candidates', value: eligibleCandidates });
    }
    if (lastDate) {
      fields.push({ icon: '📅', label: 'Last Date', value: lastDate });
    }
  } else if (categoryType === 'scheme') {
    heading = '📢 *CSC DOST | SCHEME UPDATE*';
    const schemeName = sanitizeWhatsAppText(shortTitle, true);
    const department = sanitizeWhatsAppText(
      overrides.customDepartment ?? organization,
      true
    );
    const eligibility = sanitizeWhatsAppText(
      overrides.customQualification ?? extractCompactQualification(item.eligibility, rawTitle),
      true
    );
    const appStatus = sanitizeWhatsAppText(
      overrides.customApplicationStatus ?? (item.status || 'Active / Open for Registration'),
      true
    );

    if (schemeName) {
      fields.push({ icon: '🏛️', label: 'Scheme Name', value: schemeName });
    }
    if (department) {
      fields.push({ icon: '📌', label: 'Department', value: department });
    }
    if (eligibility) {
      fields.push({ icon: '✅', label: 'Eligibility', value: eligibility });
    }
    if (appStatus) {
      fields.push({ icon: '📋', label: 'Application Status', value: appStatus });
    }
  } else {
    heading = '📢 *CSC DOST | OFFICIAL UPDATE*';
    const lastDate = sanitizeWhatsAppText(
      overrides.customLastDate ?? extractCompactLastDate(item.lastDate, 'generic'),
      true
    );
    if (organization) {
      fields.push({ icon: '📌', label: 'Organization', value: organization });
    }
    if (lastDate) {
      fields.push({ icon: '📅', label: 'Last Date', value: lastDate });
    }
  }

  return assembleWhatsAppPayload({
    categoryType,
    heading,
    shortTitle,
    fields,
    canonicalUrl,
  });
}

/**
 * Builds a structured WhatsApp notification payload for a Citizen Service item.
 */
export function buildServiceWhatsAppNotification(service: ServiceItem): WhatsAppMessagePayload {
  const shortTitle = sanitizeWhatsAppText(service.name) || 'CSC Citizen Service';
  const canonicalUrl = getCanonicalPostUrl(service.id, 'service');
  const categoryLabel = sanitizeWhatsAppText(
    CATEGORY_LABELS[service.category] || 'Citizen E-Governance Service',
    true
  );
  const fee = sanitizeWhatsAppText(service.price, true);
  const turnaround = sanitizeWhatsAppText(service.estimatedTime, true);

  const fields: WhatsAppFormattedField[] = [];
  if (categoryLabel) {
    fields.push({ icon: '📌', label: 'Category', value: categoryLabel });
  }
  if (fee) {
    fields.push({ icon: '💳', label: 'Service Fee', value: fee });
  }
  if (turnaround) {
    fields.push({ icon: '⏱️', label: 'Processing Time', value: turnaround });
  }

  return assembleWhatsAppPayload({
    categoryType: 'generic',
    heading: '📢 *CSC DOST | CITIZEN SERVICE*',
    shortTitle,
    fields,
    canonicalUrl,
  });
}

/**
 * Assembles the final WhatsApp message string and guarantees:
 * 1. Exact Option 1 layout & line breaks
 * 2. Exactly one canonical URL in the message
 * 3. Single encodeURIComponent encoding for WhatsApp share links
 * 4. Safe nativeShareData without duplicate URL fields
 */
function assembleWhatsAppPayload({
  categoryType,
  heading,
  shortTitle,
  fields,
  canonicalUrl,
}: {
  categoryType: WhatsAppNotificationCategory;
  heading: string;
  shortTitle: string;
  fields: WhatsAppFormattedField[];
  canonicalUrl: string;
}): WhatsAppMessagePayload {
  const validFields = fields.filter(
    (f) => f && f.label && f.value && !INVALID_VALUE_PATTERNS.has(f.value.toLowerCase())
  );

  const fieldLines = validFields.map((f) => `${f.icon} *${f.label}:* ${f.value}`);

  const blocks: string[] = [
    `${heading}\n${SEPARATOR_LINE}`,
    `🇮🇳 *${shortTitle}*`,
    ...fieldLines,
    `${SEPARATOR_LINE}\n🔗 *Apply & View Details:*\n\n${canonicalUrl}\n\n${PORTAL_SIGNATURE}`,
  ];

  const message = blocks.join('\n\n');

  // Encode the complete message exactly once
  const encodedMessage = encodeURIComponent(message);
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
  const whatsappWebShareUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;

  return {
    categoryType,
    heading,
    shortTitle,
    fields: validFields,
    canonicalUrl,
    message,
    whatsappShareUrl,
    whatsappWebShareUrl,
    // IMPORTANT: Do NOT pass a separate `url` property alongside `text` when `text` already contains
    // the canonical URL, as Android/iOS native share sheets concatenate `text` + `url` and cause a duplicate URL.
    nativeShareData: {
      title: `${shortTitle} | CSC DOST`,
      text: message,
    },
  };
}
