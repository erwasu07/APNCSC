export interface SarkariItem {
  id: string;
  title: string;
  category: 'jobs' | 'admit_cards' | 'results' | 'answer_keys' | 'syllabus' | 'admissions';
  postDate: string;
  lastDate?: string;
  shortInfo: string;
  ageLimit?: string;
  eligibility?: string;
  fees?: {
    genObc: string;
    scSt: string;
  };
  advertisementNo?: string;
  isNew?: boolean;
}

export const SARKARI_CATEGORIES = {
  jobs: { label: 'Latest Jobs', color: 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
  admit_cards: { label: 'Admit Cards', color: 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
  results: { label: 'Results', color: 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
  answer_keys: { label: 'Answer Keys', color: 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
  syllabus: { label: 'Syllabus', color: 'border-pink-500 text-pink-600 bg-pink-50 dark:bg-pink-950/30' },
  admissions: { label: 'Admissions', color: 'border-teal-500 text-teal-600 bg-teal-50 dark:bg-teal-950/30' }
};

export const SARKARI_DATA: SarkariItem[] = [
  // LATEST JOBS (Extracted from SarkariResult.com.cm Portal)
  {
    id: 'job-ssc-cgl-2026',
    title: 'SSC CGL 2026 Recruitment Online Application (17,727 Posts)',
    category: 'jobs',
    postDate: '01/08/2026',
    lastDate: '30/08/2026',
    advertisementNo: 'SSC-CGL-2026-EXAM',
    shortInfo: 'Staff Selection Commission (SSC) invites online application forms for Combined Graduate Level CGL 2026 for Group B & C Inspector, Assistant Section Officer, Auditor, and Tax Assistant posts.',
    ageLimit: '18 - 30 Years (Age relaxation as per govt rules)',
    eligibility: 'Bachelor Degree in any stream from a recognized university in India.',
    fees: { genObc: '₹100', scSt: '₹0 (Female Exempted)' },
    isNew: true
  },
  {
    id: 'job-rrb-ntpc-2026',
    title: 'Railway RRB NTPC Graduate & Under Graduate Posts 2026',
    category: 'jobs',
    postDate: '31/07/2026',
    lastDate: '31/08/2026',
    advertisementNo: 'CEN 05/2026 & 06/2026',
    shortInfo: 'Railway Recruitment Boards (RRB) Non-Technical Popular Categories (NTPC) recruitment for Station Master, Goods Guard, Senior Clerk, Junior Clerk, and Commercial Apprentice.',
    ageLimit: '18 - 33 Years (UG Posts) / 18 - 36 Years (Graduate Posts)',
    eligibility: 'Class 12th Intermediate for UG Level / Bachelor Degree for Graduate Level Posts.',
    fees: { genObc: '₹500 (₹400 Refundable)', scSt: '₹250 (Full Refundable)' },
    isNew: true
  },
  {
    id: 'job-ssc-mts-2026',
    title: 'SSC MTS & Havildar 9,583 Posts Registration 2026',
    category: 'jobs',
    postDate: '30/07/2026',
    lastDate: '28/08/2026',
    advertisementNo: 'SSC-MTS-HAVILDAR-2026',
    shortInfo: 'Staff Selection Commission (SSC) Multi Tasking (Non-Technical) Staff and Havildar (CBIC & CBN) Examination 2026 online application portal.',
    ageLimit: '18 - 25 Years for MTS, 18 - 27 Years for Havildar',
    eligibility: 'Class 10th High School Pass from any recognized board in India.',
    fees: { genObc: '₹100', scSt: '₹0' },
    isNew: true
  },
  {
    id: 'job-ibps-po-2026',
    title: 'IBPS PO XVI Officer Scale-I Recruitment 2026 (3,955 Posts)',
    category: 'jobs',
    postDate: '29/07/2026',
    lastDate: '25/08/2026',
    advertisementNo: 'IBPS-CRP-PO/MT-XVI',
    shortInfo: 'Institute of Banking Personnel Selection (IBPS) invites applications for Probationary Officer / Management Trainee in participating public sector banks.',
    ageLimit: '20 - 30 Years (As on 01/08/2026)',
    eligibility: 'Any Graduation Degree in any discipline from recognized University.',
    fees: { genObc: '₹850', scSt: '₹175' },
    isNew: true
  },
  {
    id: 'job-navy-ssr-mr-2026',
    title: 'Indian Navy Agniveer SSR & MR 02/2026 Online Form',
    category: 'jobs',
    postDate: '28/07/2026',
    lastDate: '20/08/2026',
    advertisementNo: 'NAVY-AGNIVEER-02/2026',
    shortInfo: 'Join Indian Navy Agniveer Senior Secondary Recruits (SSR) & Musician / Chef / Steward (MR) 02/2026 batch online application portal.',
    ageLimit: 'Born between 01/11/2005 and 30/04/2009',
    eligibility: 'Class 12th Intermediate with Math & Physics for SSR / Class 10th Pass for MR.',
    fees: { genObc: '₹550', scSt: '₹550' },
    isNew: true
  },
  {
    id: 'job-up-police-si-2026',
    title: 'UP Police Sub Inspector SI & Platoon Commander 2026',
    category: 'jobs',
    postDate: '26/07/2026',
    lastDate: '22/08/2026',
    advertisementNo: 'UPPRPB-SI-2026',
    shortInfo: 'Uttar Pradesh Police Recruitment Board (UPPRPB) for 9,217 Sub Inspector Civilian Police and Fire Station Officer.',
    ageLimit: '21 - 28 Years',
    eligibility: 'Bachelor Degree in any stream for SI / B.Sc Degree for Fire Officer.',
    fees: { genObc: '₹400', scSt: '₹400' }
  },
  {
    id: 'job-upsc-nda',
    title: 'UPSC NDA / NA II Examination 2026 Notification',
    category: 'jobs',
    postDate: '10/07/2026',
    lastDate: '05/08/2026',
    advertisementNo: 'UPSC-NDA-II-2026',
    shortInfo: 'Union Public Service Commission (UPSC) recruitment for National Defence Academy & Naval Academy Examination II 2026.',
    ageLimit: 'Born between 02/01/2007 and 01/01/2010',
    eligibility: 'Class 12th Intermediate pass / appearing. For Navy & Air Force, Physics & Math mandatory.',
    fees: { genObc: '₹100', scSt: '₹0' }
  },
  {
    id: 'job-agniveer-army',
    title: 'Indian Army Agniveer Recruitment Rally Scheme 2026',
    category: 'jobs',
    postDate: '08/07/2026',
    lastDate: '12/08/2026',
    advertisementNo: 'ARMY-AGNIVEER-2026',
    shortInfo: 'Join Indian Army Agniveer General Duty (GD), Technical, Clerk, Store Keeper, and Tradesmen 8th / 10th Pass entry.',
    ageLimit: '17.5 - 21 Years',
    eligibility: 'Class 8th / 10th / 12th Pass as per designated post requirements.',
    fees: { genObc: '₹250', scSt: '₹250' }
  },

  // ADMIT CARDS
  {
    id: 'admit-neet-ug',
    title: 'NTA NEET UG 2026 Admit Card / Hall Ticket',
    category: 'admit_cards',
    postDate: '25/07/2026',
    shortInfo: 'National Testing Agency (NTA) download link for National Eligibility cum Entrance Test (NEET UG) admit cards.',
    eligibility: 'Download using Application Number, Password / DOB & Security Pin.',
    isNew: true
  },
  {
    id: 'admit-ssc-chsl',
    title: 'SSC CHSL 10+2 Tier-I Admit Card & Exam Status',
    category: 'admit_cards',
    postDate: '23/07/2026',
    shortInfo: 'Staff Selection Commission (SSC) regional hall tickets and roll number verification for Combined Higher Secondary Level Tier 1.',
    isNew: true
  },
  {
    id: 'admit-rpf-constable',
    title: 'Railway RPF Constable & SI CBT Exam Admit Card',
    category: 'admit_cards',
    postDate: '20/07/2026',
    shortInfo: 'RRB RPF City Intimation slip and E-Call Letter download portal for Computer Based Test.',
    isNew: true
  },
  {
    id: 'admit-jee-mains',
    title: 'NTA JEE Mains Session II Call Letter 2026',
    category: 'admit_cards',
    postDate: '15/07/2026',
    shortInfo: 'National Testing Agency JEE Mains Session II engineering exam call letter and self-declaration form download.'
  },
  {
    id: 'admit-upsc-pre',
    title: 'UPSC Civil Services IAS / IFS Prelims Admit Card',
    category: 'admit_cards',
    postDate: '12/07/2026',
    shortInfo: 'Union Public Service Commission (UPSC) Civil Services (IAS) and Forest Service (IFS) preliminary exam e-Admit Card.'
  },
  {
    id: 'admit-ctet-july',
    title: 'CBSE CTET July Exam Admit Card & City Slip',
    category: 'admit_cards',
    postDate: '10/07/2026',
    shortInfo: 'Central Board of Secondary Education CTET Paper I and Paper II pre-admit card city intimation download.'
  },

  // RESULTS
  {
    id: 'res-cbse-12th',
    title: 'CBSE Board Class 12th & 10th Result 2026',
    category: 'results',
    postDate: '26/07/2026',
    shortInfo: 'Central Board of Secondary Education (CBSE) Senior School Certificate Examination results online with DigiLocker pin.',
    isNew: true
  },
  {
    id: 'res-ssc-gd',
    title: 'SSC GD Constable Written Test Merit List & Scorecard',
    category: 'results',
    postDate: '22/07/2026',
    shortInfo: 'Written exam cut-off marks and qualified list for Physical Efficiency Test (PET / PST) in BSF, CISF, CRPF & SSB.',
    isNew: true
  },
  {
    id: 'res-jee-adv',
    title: 'IIT JEE Advanced Final Result & AIR Rank List',
    category: 'results',
    postDate: '18/07/2026',
    shortInfo: 'Joint Entrance Examination Advanced results with category-wise cutoff marks and JoSAA counseling registration link.'
  },
  {
    id: 'res-up-police',
    title: 'UP Police Constable Result & Cutoff Marks 2026',
    category: 'results',
    postDate: '14/07/2026',
    shortInfo: 'Uttar Pradesh Police Recruitment Board (UPPRPB) constable written exam scorecards and physical test call letters.'
  },
  {
    id: 'res-cuet-ug',
    title: 'NTA CUET UG Scorecard & Normalised Percentile',
    category: 'results',
    postDate: '10/07/2026',
    shortInfo: 'Common University Entrance Test Undergraduate exam subject-wise percentile scorecards for university admissions.'
  },

  // ANSWER KEYS
  {
    id: 'key-ugc-net',
    title: 'NTA UGC NET June Official Answer Key & OMR Sheet',
    category: 'answer_keys',
    postDate: '25/07/2026',
    shortInfo: 'Provisional answer keys, question papers, and recorded responses for Assistant Professor and JRF fellowship test.',
    isNew: true
  },
  {
    id: 'key-ssc-cpo',
    title: 'SSC CPO SI Paper I Official Answer Key 2026',
    category: 'answer_keys',
    postDate: '21/07/2026',
    shortInfo: 'Sub-Inspector in Delhi Police & CAPF computer-based exam answer key challenge link.',
    isNew: true
  },
  {
    id: 'key-ctet-july',
    title: 'CTET July Official Provisional Answer Key',
    category: 'answer_keys',
    postDate: '17/07/2026',
    shortInfo: 'CBSE Central Teacher Eligibility Test Paper I (Primary) & Paper II (Elementary) answer key and response sheet.'
  },
  {
    id: 'key-neet-ug',
    title: 'NTA NEET UG Official Answer Key & Scanned OMR',
    category: 'answer_keys',
    postDate: '12/07/2026',
    shortInfo: 'Medical entrance exam official code-wise answer keys (Q, R, S, T) and objection submission window.'
  },

  // SYLLABUS
  {
    id: 'syl-ssc-mts',
    title: 'SSC MTS & Havildar New Exam Pattern & Detailed Syllabus',
    category: 'syllabus',
    postDate: '24/07/2026',
    shortInfo: 'Session-I (Math & Reasoning) and Session-II (General Awareness & English) updated syllabus and physical PST/PET standards.',
    isNew: true
  },
  {
    id: 'syl-railway-alp',
    title: 'RRB Assistant Loco Pilot (ALP) CBT 1 & 2 Syllabus PDF',
    category: 'syllabus',
    postDate: '19/07/2026',
    shortInfo: 'Complete subject-wise topic list, engineering trade specifications, and computer-based aptitude test (CBAT) guidelines.'
  },
  {
    id: 'syl-upsc-cse',
    title: 'UPSC Civil Services IAS Prelims & Mains Syllabus PDF',
    category: 'syllabus',
    postDate: '15/07/2026',
    shortInfo: 'General Studies Papers I to IV, CSAT aptitude topics, Essay guidelines, and official optional subject catalogs.'
  },

  // ADMISSIONS
  {
    id: 'adm-du-ug',
    title: 'Delhi University CSAS UG Admission Portal 2026',
    category: 'admissions',
    postDate: '25/07/2026',
    lastDate: '15/08/2026',
    shortInfo: 'Common Seat Allocation System (CSAS) registration for entry into DU undergraduate degree colleges based on CUET scores.',
    isNew: true
  },
  {
    id: 'adm-ignou-july',
    title: 'IGNOU July Session Open & Distance Learning Online Form',
    category: 'admissions',
    postDate: '20/07/2026',
    lastDate: '31/08/2026',
    shortInfo: 'Indira Gandhi National Open University (IGNOU) fresh admission for BA, B.Com, B.Sc, MA, MBA, and Diploma courses.',
    isNew: true
  },
  {
    id: 'adm-up-deled',
    title: 'UP D.El.Ed (BTC) Online Admission Registration 2026',
    category: 'admissions',
    postDate: '16/07/2026',
    lastDate: '20/08/2026',
    shortInfo: 'Uttar Pradesh Diploma in Elementary Education 2-year teacher training course state merit list & choice filling.'
  }
];
