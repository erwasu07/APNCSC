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
  // LATEST JOBS
  {
    id: 'job-ssc-cgl',
    title: 'SSC CGL 2026 Online Application Form',
    category: 'jobs',
    postDate: '10/07/2026',
    lastDate: '15/08/2026',
    advertisementNo: 'SSC-CGL-2026-I',
    shortInfo: 'Staff Selection Commission (SSC) invites online applications for Combined Graduate Level CGL Recruitment 2026. Grp B and C Inspector, Assistant, and Executive positions.',
    ageLimit: '18 - 30 Years (As on 01/08/2026)',
    eligibility: 'Bachelor Degree in any stream from recognized university in India.',
    fees: { genObc: '₹100', scSt: '₹0' },
    isNew: true
  },
  {
    id: 'job-rpf-constable',
    title: 'Railway Protection Force (RPF) Constable Post',
    category: 'jobs',
    postDate: '08/07/2026',
    lastDate: '10/08/2026',
    advertisementNo: 'CEN RPF 02/2026',
    shortInfo: 'Railway Recruitment Board (RRB) invites online applications for the recruitment of Constable & Sub-Inspector SI posts in Railway Protection Force (RPF).',
    ageLimit: '18 - 28 Years',
    eligibility: 'Class 10th (High School) passed from any recognized board in India.',
    fees: { genObc: '₹500', scSt: '₹250' },
    isNew: true
  },
  {
    id: 'job-upsc-nda',
    title: 'UPSC NDA / NA II Examination 2026',
    category: 'jobs',
    postDate: '01/07/2026',
    lastDate: '30/07/2026',
    advertisementNo: 'UPSC-NDA-II-2026',
    shortInfo: 'Union Public Service Commission (UPSC) recruitment for National Defence Academy & Naval Academy Examination II.',
    ageLimit: 'Born between 02/01/2007 and 01/01/2010',
    eligibility: 'Class 12th Intermediate pass / appearing. For Navy/Airforce, Physics & Math mandatory.',
    fees: { genObc: '₹100', scSt: '₹0' }
  },
  {
    id: 'job-ibps-po',
    title: 'IBPS PO XVI Officer Scale-I Registration',
    category: 'jobs',
    postDate: '11/07/2026',
    lastDate: '25/08/2026',
    advertisementNo: 'IBPS-CRP-PO-MT-XVI',
    shortInfo: 'Institute of Banking Personnel Selection (IBPS) invites applications for Probationary Officer (PO) posts in participating public sector banks.',
    ageLimit: '20 - 30 Years',
    eligibility: 'Any Bachelor Degree from a recognized board/university.',
    fees: { genObc: '₹850', scSt: '₹175' },
    isNew: true
  },
  {
    id: 'job-delhi-police',
    title: 'Delhi Police SI (Sub-Inspector) Application',
    category: 'jobs',
    postDate: '28/06/2026',
    lastDate: '24/07/2026',
    advertisementNo: 'SSC-CPO-2026',
    shortInfo: 'Staff Selection Commission (SSC) invites applications for Sub-Inspector in Delhi Police and Central Armed Police Forces (CAPF).',
    ageLimit: '20 - 25 Years',
    eligibility: 'Bachelor Degree in any stream. For Delhi SI, valid LMV Driving Licence is mandatory.',
    fees: { genObc: '₹100', scSt: '₹0' }
  },

  // ADMIT CARDS
  {
    id: 'admit-neet-ug',
    title: 'NTA NEET UG 2026 Admit Card / Hall Ticket',
    category: 'admit_cards',
    postDate: '11/07/2026',
    shortInfo: 'National Testing Agency (NTA) is hosting download link for National Eligibility cum Entrance Test (NEET UG) admit cards.',
    eligibility: 'Requires Application Number, Date of Birth &amp; Security Pin to download.',
    isNew: true
  },
  {
    id: 'admit-ssc-chsl',
    title: 'SSC CHSL 10+2 Tier-I Admit Card',
    category: 'admit_cards',
    postDate: '09/07/2026',
    shortInfo: 'Staff Selection Commission (SSC) released regional exam status &amp; call letter downloads for Combined Higher Secondary Level (10+2) Tier 1 Exam.',
    isNew: true
  },
  {
    id: 'admit-jee-mains',
    title: 'JEE Mains Session II Call Letter',
    category: 'admit_cards',
    postDate: '05/07/2026',
    shortInfo: 'NTA JEE Mains Session II engineering exam hall ticket. Carry original passport photo &amp; Aadhaar Card proof to the center.'
  },
  {
    id: 'admit-upsc-pre',
    title: 'UPSC Civil Services Prelims Exam Admit Card',
    category: 'admit_cards',
    postDate: '30/06/2026',
    shortInfo: 'Union Public Service Commission UPSC IAS / IFS exam admit cards. Read rules on photo IDs carefully.'
  },

  // RESULTS
  {
    id: 'res-cbse-12th',
    title: 'CBSE Board Class 12th Result 2026',
    category: 'results',
    postDate: '11/07/2026',
    shortInfo: 'Central Board of Secondary Education (CBSE) declares Class 12 Senior School Certificate results online.',
    isNew: true
  },
  {
    id: 'res-ssc-gd',
    title: 'SSC GD Constable Written Test Merit List',
    category: 'results',
    postDate: '08/07/2026',
    shortInfo: 'Written exam scores and cutoff marks released for General Duty (GD) Constable in CAPF &amp; Assam Rifles.',
    isNew: true
  },
  {
    id: 'res-jee-adv',
    title: 'JEE Advanced Exam Final Selection List',
    category: 'results',
    postDate: '26/06/2026',
    shortInfo: 'IIT JEE Advanced results with Category rank lists, cutoffs &amp; counseling registration links.'
  },
  {
    id: 'res-up-police',
    title: 'UP Police Constable Result & Cutoff 2026',
    category: 'results',
    postDate: '15/06/2026',
    shortInfo: 'Uttar Pradesh Police Recruitment Board (UPPRPB) constable results. Physical test (PET) scheduling details inside.'
  },

  // ANSWER KEYS
  {
    id: 'key-ugc-net',
    title: 'NTA UGC NET June Answer Key with Response Sheet',
    category: 'answer_keys',
    postDate: '11/07/2026',
    shortInfo: 'National Testing Agency has uploaded provisional answer key &amp; marked responses for Assistant Professor and JRF exam.',
    isNew: true
  },
  {
    id: 'key-ssc-cpo',
    title: 'SSC CPO SI Paper I Official Answer Key',
    category: 'answer_keys',
    postDate: '07/07/2026',
    shortInfo: 'Answer key along with question paper for Sub-Inspector Paper I exam. Challenges can be submitted online.',
    isNew: true
  },
  {
    id: 'key-ctet-july',
    title: 'CTET July Provisional Answer Key 2026',
    category: 'answer_keys',
    postDate: '04/07/2026',
    shortInfo: 'Central Teacher Eligibility Test (CTET) provisional answers keys for Paper I &amp; II.'
  },

  // SYLLABUS
  {
    id: 'syl-ssc-mts',
    title: 'SSC MTS & Havildar New Exam Pattern & Syllabus',
    category: 'syllabus',
    postDate: '10/07/2026',
    shortInfo: 'Staff Selection Commission Multitasking Staff (MTS) scheme of exam, syllabus breakdown, and physical standard test guidelines.',
    isNew: true
  },
  {
    id: 'syl-railway-alp',
    title: 'RRB Assistant Loco Pilot (ALP) Stage I & II Syllabus',
    category: 'syllabus',
    postDate: '05/07/2026',
    shortInfo: 'Detailed engineering subject topics list, mathematics, and psychological aptitude test specifications.'
  },
  {
    id: 'syl-upsc-cse',
    title: 'UPSC Civil Services IAS Mains Written Exam Syllabus',
    category: 'syllabus',
    postDate: '20/06/2026',
    shortInfo: 'Complete guidelines for GS papers I to IV, Essay writing metrics, and official optional subject catalogs.'
  },

  // ADMISSIONS
  {
    id: 'adm-du-ug',
    title: 'Delhi University CSAS UG Admission Portal',
    category: 'admissions',
    postDate: '10/07/2026',
    lastDate: '31/07/2026',
    shortInfo: 'Common Seat Allocation System (CSAS) for entry into DU undergraduate programs based on CUET scores.',
    isNew: true
  },
  {
    id: 'adm-ignou-july',
    title: 'IGNOU July Cycle Distance Admission Online Form',
    category: 'admissions',
    postDate: '06/07/2026',
    lastDate: '15/08/2026',
    shortInfo: 'Indira Gandhi National Open University (IGNOU) offers fresh admission to all online &amp; distance learning courses.',
    isNew: true
  },
  {
    id: 'adm-cuet-pg',
    title: 'NTA CUET PG Post Graduate College Counseling',
    category: 'admissions',
    postDate: '01/07/2026',
    shortInfo: 'Common University Entrance Test PG registration & counseling guidance across central universities.'
  }
];
