export interface DepartmentBreakdown {
  department: string;
  postName: string;
  posts: number | string;
  qualification: string;
  fee?: string;
}

export interface SarkariItem {
  id: string;
  title: string;
  category: 'jkssb' | 'jobs' | 'admit_cards' | 'results' | 'answer_keys' | 'syllabus' | 'admissions' | 'exam_forms' | 'cluster_univ' | 'nta' | 'ssc_jobs' | 'rrb_jobs' | 'army_jobs';
  postDate: string;
  startDate?: string;
  lastDate?: string;
  shortInfo: string;
  ageLimit?: string;
  eligibility?: string;
  totalPosts?: string | number;
  feePerSubject?: string;
  departmentBreakdown?: DepartmentBreakdown[];
  officialLink?: string;
  fees?: {
    genObc: string;
    scSt: string;
  };
  advertisementNo?: string;
  isNew?: boolean;
}

export const SARKARI_CATEGORIES = {
  jkssb: { label: 'JKSSB Jobs', color: 'border-indigo-600 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40' },
  jobs: { label: 'Latest Jobs', color: 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
  admit_cards: { label: 'Admit Cards', color: 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
  results: { label: 'Results', color: 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
  answer_keys: { label: 'Answer Keys', color: 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
  syllabus: { label: 'Syllabus', color: 'border-pink-500 text-pink-600 bg-pink-50 dark:bg-pink-950/30' },
  admissions: { label: 'KU Admissions', color: 'border-teal-600 text-teal-700 bg-teal-50 dark:bg-teal-950/40' },
  exam_forms: { label: 'KU Exam Forms', color: 'border-amber-600 text-amber-800 bg-amber-50 dark:bg-amber-950/40' },
  cluster_univ: { label: 'Cluster Univ', color: 'border-cyan-600 text-cyan-700 bg-cyan-50 dark:bg-cyan-950/40' },
  nta: { label: 'NTA Exams', color: 'border-red-600 text-red-700 bg-red-50 dark:bg-red-950/40' },
  ssc_jobs: { label: 'SSC Jobs', color: 'border-orange-600 text-orange-700 bg-orange-50 dark:bg-orange-950/40' },
  rrb_jobs: { label: 'RRB Jobs', color: 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40' },
  army_jobs: { label: 'Indian Army Jobs', color: 'border-red-700 text-red-800 bg-red-50 dark:bg-red-950/40' }
};

export const SARKARI_DATA: SarkariItem[] = [
  // 🇮🇳 TODAY'S NEWLY EXTRACTED NOTIFICATIONS (18 AUGUST 2026 - LATEST DISPATCH)
  {
    id: 'army-tgc-143-course-jul-2027',
    title: 'Indian Army 143rd Technical Graduate Course (TGC-143 - Commencing Jul 2027)',
    category: 'army_jobs',
    postDate: '18/08/2026',
    startDate: '18/08/2026',
    lastDate: '19/09/2026',
    advertisementNo: 'TGC-143 Course (July 2027 Batch)',
    shortInfo: 'Indian Army invites online applications from eligible unmarried male Engineering Graduates for grant of Permanent Commission in the Indian Army for 143rd Technical Graduate Course (TGC-143) commencing at Indian Military Academy (IMA), Dehradun.',
    ageLimit: '20 to 27 Years (Born between 02 Jul 1999 and 01 Jul 2006)',
    eligibility: 'Passed the requisite Engineering Degree course or in the final year of Engineering Degree in relevant stream (Civil, Mech, Electrical, CS/IT, Electronics)',
    totalPosts: '30 Posts (Permanent Commission in Army)',
    officialLink: 'https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm',
    fees: {
      genObc: '₹0 (No Application Fee)',
      scSt: '₹0 (No Application Fee)'
    },
    isNew: true
  },
  {
    id: 'rrb-ministerial-isolated-cen08-2026',
    title: 'RRB Ministerial & Isolated Categories Recruitment 2026 (CEN 08/2026 - 1,280 Posts)',
    category: 'rrb_jobs',
    postDate: '18/08/2026',
    startDate: '19/08/2026',
    lastDate: '20/09/2026',
    advertisementNo: 'CEN No. 08/2026 (Ministerial & Isolated)',
    shortInfo: 'Railway Recruitment Boards (RRB) invite online applications for recruitment of Staff & Welfare Inspector, Chief Law Assistant, Junior Translator (Hindi), Stenographer, and other Ministerial & Isolated categories across all Indian Railway Zones.',
    ageLimit: '18 to 45 Years depending on specific post (Relaxation as per RRB rules)',
    eligibility: 'Graduation / Post Graduation in relevant discipline / Law Degree / Diploma in Labor Laws or Stenography qualifications as per post',
    totalPosts: '1,280 Posts across RRB Zones',
    officialLink: 'https://www.rrbapply.gov.in/#/auth/landing',
    fees: {
      genObc: '₹500 (₹400 refundable after appearing in CBT-1)',
      scSt: '₹250 (₹250 refundable after appearing in CBT-1)'
    },
    isNew: true
  },
  {
    id: 'ssc-junior-hindi-translator-jht-exam-2026',
    title: 'SSC Combined Hindi Translators Examination (JHT, JT & SHT) 2026',
    category: 'ssc_jobs',
    postDate: '18/08/2026',
    startDate: '18/08/2026',
    lastDate: '18/09/2026',
    advertisementNo: 'SSC/HQ/JHT-Exam-2026',
    shortInfo: 'Staff Selection Commission (SSC) notifies competitive computer-based examination for recruitment of Junior Hindi Translator, Junior Translation Officer, Senior Hindi Translator, and Senior Translation Officer in various Central Government Ministries and Departments.',
    ageLimit: '18 to 30 Years (Age relaxation applicable as per Govt of India rules)',
    eligibility: "Master's Degree in Hindi with English as a compulsory/elective subject OR Master's Degree in English with Hindi + Recognized Diploma/Certificate in Translation from Hindi to English & vice-versa",
    totalPosts: '412 Posts across Central Ministries',
    officialLink: 'https://ssc.gov.in',
    fees: {
      genObc: '₹100 (Online Payment via UPI/NetBanking)',
      scSt: '₹0 (Exempted for SC/ST/PwD/Women candidates)'
    },
    isNew: true
  },
  {
    id: 'cus-integrated-pg-honors-sem2-sem4-exam-2026',
    title: 'Online Examination Forms Notice for Integrated PG & Honors 2nd & 4th Semester (Session 2026)',
    category: 'cluster_univ',
    postDate: '18/08/2026',
    startDate: '18/08/2026',
    lastDate: '31/08/2026',
    advertisementNo: 'CUS/Exam/IPG-Honors-2nd-4th/2026/1180',
    shortInfo: 'Cluster University Srinagar notifies all regular and backlog students of 5-Year Integrated PG, Honors, and Professional Programmes of 2nd & 4th Semester (Batches 2022, 2023, 2024) to submit their online examination forms through the university ERP portal.',
    ageLimit: 'Enrolled IPG & Honors Students',
    eligibility: 'Enrolled students in Constituent Colleges having cleared internal continuous assessments and requisite attendance',
    totalPosts: 'IPG Examination Desk',
    officialLink: 'https://www.cusrinagar.edu.in/',
    fees: {
      genObc: '₹425 per subject + ₹200 University Exam Infra Fee',
      scSt: '₹425 per subject + ₹200 University Exam Infra Fee'
    },
    isNew: true
  },
  {
    id: 'jkssb-fsl-scientific-officer-lab-asst-2026',
    title: 'Direct Recruitment for Scientific Officers & Laboratory Assistants in Home Department (FSL - 48 Posts)',
    category: 'jkssb',
    postDate: '18/08/2026',
    startDate: '18/08/2026',
    lastDate: '05/09/2026',
    advertisementNo: 'JKSSB/Advt/Home-FSL/2026/11',
    shortInfo: 'Jammu and Kashmir Services Selection Board (JKSSB) invites online applications from eligible Domiciles of UT of J&K for direct recruitment to 48 posts of Assistant Scientific Officer (Ballistics, Biology/Serology, Chemistry/Toxicology) and Laboratory Assistants in Forensic Science Laboratory (FSL), Home Department.',
    ageLimit: '18 to 40 Years (OM), 43 Years (SC/ST/RBA/ALC-IB/EWS), 48 Years (Ex-Servicemen)',
    eligibility: "Master's Degree in Forensic Science / Chemistry / Physics / Zoology / Botany / Biochemistry or B.Sc with relevant subjects for Lab Assistant",
    totalPosts: '48 Posts (UT Cadre)',
    officialLink: 'https://jkssb.nic.in',
    fees: {
      genObc: '₹500 (Open Merit / OM candidates)',
      scSt: '₹400 (SC, ST, PwD & EWS candidates)'
    },
    isNew: true
  },
  {
    id: 'ku-exam-form-bed-1st-2nd-sem-distance-2026',
    title: 'Online Examination Forms Notice for B.Ed 1st & 2nd Semester Regular & Distance Education (Batch 2025-26)',
    category: 'exam_forms',
    postDate: '18/08/2026',
    startDate: '18/08/2026',
    lastDate: '03/09/2026',
    advertisementNo: 'KU/Exam/BEd-1st-2nd-Sem/2026/894',
    shortInfo: 'University of Kashmir announces opening of online examination forms for B.Ed 1st and 2nd Semester candidates of Directorate of Distance Education and affiliated private B.Ed Colleges for Session 2025-26.',
    ageLimit: 'Enrolled B.Ed Students',
    eligibility: 'Bonafide enrolled B.Ed students of Distance Education and Affiliated Colleges',
    totalPosts: 'B.Ed Examination Desk',
    officialLink: 'https://kashmiruniversity.net/Examination.aspx',
    fees: {
      genObc: '₹1,475 per Semester (Online Payment)',
      scSt: '₹1,475 per Semester (Online Payment)'
    },
    isNew: true
  },
  {
    id: 'ku-admission-foreign-language-diploma-2026',
    title: 'Admission Notification for Diploma & Certificate Courses in Foreign Languages (Session 2026)',
    category: 'admissions',
    postDate: '18/08/2026',
    startDate: '18/08/2026',
    lastDate: '28/08/2026',
    advertisementNo: 'KU/Adm/Foreign-Lang-Cert/2026/28',
    shortInfo: 'Department of Foreign Languages, University of Kashmir, invites online applications for admission to 1-Year Diploma and 6-Month Certificate Courses in French, German, Russian, Arabic, and Persian languages for Academic Session 2026.',
    ageLimit: 'No upper age bar',
    eligibility: 'Passed 10+2 / Higher Secondary Part-II examination with at least 45% marks from any recognized Board/University',
    totalPosts: '30 Seats per Language Stream',
    officialLink: 'https://kashmiruniversity.net/AdmissionNotices.aspx',
    fees: {
      genObc: '₹250 (Application Fee) + Course Fee upon selection',
      scSt: '₹250 (Application Fee) + Course Fee upon selection'
    },
    isNew: true
  },
  // 🇮🇳 TODAY'S NEWLY EXTRACTED NOTIFICATIONS (18 AUGUST 2026)
  {
    id: 'army-ssc-tech-65-men-36-women-2026',
    title: 'Indian Army SSC (Tech)-65 Men & SSCW (Tech)-36 Women Course (Apr 2027)',
    category: 'army_jobs',
    postDate: '18/08/2026',
    startDate: '18/08/2026',
    lastDate: '17/09/2026',
    advertisementNo: 'SSC(Tech)-65 & SSCW(Tech)-36 Course',
    shortInfo: 'Indian Army invites online applications from eligible unmarried male and unmarried female Engineering Graduates and Widows of Defence Personnel for grant of Short Service Commission (SSC) in the Indian Army.',
    ageLimit: '20 to 27 Years (SSC Tech) / Up to 35 Years for Widows of Defence Personnel',
    eligibility: 'Passed Engineering Degree course or in the final year of Engineering Degree in relevant engineering discipline',
    totalPosts: '379 Posts (Men: 350, Women: 29)',
    officialLink: 'https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm',
    fees: {
      genObc: '₹0 (No Application Fee)',
      scSt: '₹0 (No Application Fee)'
    },
    isNew: true
  },
  {
    id: 'rrb-senior-section-engineer-cen07-2026',
    title: 'RRB Senior Section Engineer (SSE) & Chief Depot Material Superintendent (CEN 07/2026)',
    category: 'rrb_jobs',
    postDate: '18/08/2026',
    startDate: '19/08/2026',
    lastDate: '18/09/2026',
    advertisementNo: 'CEN No. 07/2026 (SSE & CDMS Categories)',
    shortInfo: 'Railway Recruitment Boards (RRB) invite online applications for recruitment of Senior Section Engineer (Civil, Mechanical, Electrical, S&T) and Chief Depot Material Superintendent across Zonal Railways.',
    ageLimit: '20 to 36 Years (Relaxation as per RRB rules)',
    eligibility: 'Four-year Bachelor Degree in Engineering (B.E. / B.Tech) in relevant discipline or M.Sc in relevant field from recognized University',
    totalPosts: '2,845 Posts across all RRB Zones',
    officialLink: 'https://www.rrbapply.gov.in/#/auth/landing',
    fees: {
      genObc: '₹500 (₹400 refundable after appearing in CBT-1)',
      scSt: '₹250 (₹250 refundable after appearing in CBT-1)'
    },
    isNew: true
  },
  {
    id: 'ssc-stenographer-grade-cd-exam-2026',
    title: 'SSC Stenographer Grade "C" & "D" Examination 2026 (Official Notification)',
    category: 'ssc_jobs',
    postDate: '18/08/2026',
    startDate: '18/08/2026',
    lastDate: '17/09/2026',
    advertisementNo: 'SSC/HQ/Steno-CD/Exam-2026',
    shortInfo: 'Staff Selection Commission (SSC) invites online applications for competitive computer-based examination for recruitment of Stenographer Grade "C" and Grade "D" in various Central Ministries, Departments, and Subordinate Offices.',
    ageLimit: 'Steno Grade C: 18 to 30 Years | Steno Grade D: 18 to 27 Years',
    eligibility: '10+2 / Intermediate passed from a recognized Board + Shorthand skill test (100 wpm for Grade C, 80 wpm for Grade D)',
    totalPosts: '2,006 Posts across Central Ministries',
    officialLink: 'https://ssc.gov.in',
    fees: {
      genObc: '₹100 (Online Payment via UPI/NetBanking)',
      scSt: '₹0 (Exempted for SC/ST/PwD/Women candidates)'
    },
    isNew: true
  },
  {
    id: 'cus-ug-sem4-sem6-exam-form-2026',
    title: 'Online Examination Form Notice for UG 4th & 6th Semester (NEP & Batch 2021-23)',
    category: 'cluster_univ',
    postDate: '18/08/2026',
    startDate: '18/08/2026',
    lastDate: '29/08/2026',
    advertisementNo: 'CUS/Exam/UG-4th-6th/2026/1042',
    shortInfo: 'Cluster University Srinagar notifies all eligible students of UG 4th & 6th Semester (Batch 2022-23 NEP 2020 and backlog candidates) to submit online examination forms through the student portal.',
    ageLimit: 'Enrolled UG Students',
    eligibility: 'Bonafide students of Constituent Colleges (AS College, SP College, AAA Memorial Degree College Bemina, GCW MA Road, Govt College of Education)',
    feePerSubject: '₹375 per paper + ₹150 Examination Maintenance Fee',
    totalPosts: 'UG Examination Desk',
    officialLink: 'https://www.cusrinagar.edu.in/',
    fees: {
      genObc: 'As per subject selection on student portal',
      scSt: 'As per subject selection on student portal'
    },
    isNew: true
  },
  {
    id: 'jkssb-junior-engineer-mech-jal-shakti-2026',
    title: 'Direct Recruitment for Junior Engineer (Mechanical) in Jal Shakti Department (190 Posts)',
    category: 'jkssb',
    postDate: '18/08/2026',
    startDate: '18/08/2026',
    lastDate: '02/09/2026',
    advertisementNo: 'JKSSB/Advt/Jal-Shakti/2026/10',
    shortInfo: 'Jammu and Kashmir Services Selection Board (JKSSB) invites online applications from Domiciles of UT of J&K for direct recruitment to 190 posts of Junior Engineer (Mechanical) in Jal Shakti Department.',
    ageLimit: '18 to 40 Years (OM), 43 Years (SC/ST/RBA/ALC-IB/EWS), 48 Years (Ex-Servicemen)',
    eligibility: '3-Year Diploma in Mechanical Engineering from recognized institute / Indian University OR Degree in Mechanical Engineering / AMIE',
    totalPosts: '190 Posts (UT & Divisional Cadres)',
    officialLink: 'https://jkssb.nic.in',
    fees: {
      genObc: '₹500 (Open Merit / OM candidates)',
      scSt: '₹400 (SC, ST, PwD & EWS candidates)'
    },
    isNew: true
  },
  {
    id: 'ku-exam-form-ug-bg-2nd-sem-nep-2026',
    title: 'Online Examination Forms Notice for UG (BG) 2nd Semester Regular & Fresh Private (NEP Batch 2025)',
    category: 'exam_forms',
    postDate: '18/08/2026',
    startDate: '18/08/2026',
    lastDate: '01/09/2026',
    advertisementNo: 'KU/Exam/UG-2nd-Sem-NEP/2026/812',
    shortInfo: 'University of Kashmir invites online examination forms for BG 2nd Semester Regular, Fresh Private, and Backlog candidates enrolled under National Education Policy (NEP-2020) across all affiliated Degree Colleges.',
    ageLimit: 'Enrolled UG 2nd Semester Students',
    eligibility: 'Regular enrolled students of affiliated degree colleges and registered private candidates',
    feePerSubject: '₹250 per subject + ₹100 EMF + ₹100 IT Charge',
    officialLink: 'https://kashmiruniversity.net/Examination.aspx',
    fees: {
      genObc: 'Standard UG NEP Examination Fee (Online Gateway)',
      scSt: 'Standard UG NEP Examination Fee (Online Gateway)'
    },
    isNew: true
  },
  {
    id: 'ku-admission-pg-counseling-list2-2026',
    title: '2nd Counseling & Selection List for Admission to Post Graduate Programmes (Session 2026)',
    category: 'admissions',
    postDate: '18/08/2026',
    startDate: '18/08/2026',
    lastDate: '26/08/2026',
    advertisementNo: 'KU/Adm/PG-2nd-Counseling/2026/22',
    shortInfo: 'Directorate of Admissions & Competitive Examinations, University of Kashmir, notifies 2nd Counseling Schedule & Selection List for vacant seats in various MA, M.Sc, M.Com, M.Ed, and LL.M programmes for Academic Session 2026.',
    ageLimit: 'As per University Admission Guidelines 2026',
    eligibility: 'Appeared in Kashmir University Entrance Test (KUET-2026) in relevant subject and having qualified Bachelor degree with minimum required percentage',
    totalPosts: 'Vacant Seats in Main Campus, North Campus, South Campus & PG Colleges',
    officialLink: 'https://kashmiruniversity.net/AdmissionNotices.aspx',
    fees: {
      genObc: 'Admission Fee as per allotted Department/Course',
      scSt: 'Admission Fee as per allotted Department/Course'
    },
    isNew: true
  },
  // 🇮🇳 PREVIOUS NOTIFICATIONS (17 AUGUST 2026)
  {
    id: 'army-tes-54-course-2026',
    title: '10+2 Technical Entry Scheme (TES-54 Course - Jan 2027)',
    category: 'army_jobs',
    postDate: '17/08/2026',
    startDate: '17/08/2026',
    lastDate: '16/09/2026',
    advertisementNo: 'TES-54 Course (Commencing Jan 2027)',
    shortInfo: 'Indian Army invites online applications from unmarried male candidates who have passed 10+2 examination with Physics, Chemistry and Mathematics (PCM) and appeared in JEE (Mains) 2026 for the grant of Permanent Commission.',
    ageLimit: '16½ to 19½ Years (Born between 02 July 2007 and 01 July 2010)',
    eligibility: 'Passed 10+2 with minimum 60% aggregate marks in PCM + Appeared in JEE (Mains) 2026',
    totalPosts: '90 Posts',
    officialLink: 'https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm',
    fees: {
      genObc: '₹0 (No Application Fee)',
      scSt: '₹0 (No Application Fee)'
    },
    isNew: true
  },
  {
    id: 'rrb-ministerial-isolated-2026',
    title: 'RRB Ministerial & Isolated Categories Recruitment (CEN 06/2026)',
    category: 'rrb_jobs',
    postDate: '17/08/2026',
    startDate: '18/08/2026',
    lastDate: '17/09/2026',
    advertisementNo: 'CEN No. 06/2026 (Ministerial & Isolated Categories)',
    shortInfo: 'Railway Recruitment Boards (RRB) invite online applications for recruitment of Junior Stenographer (Hindi/English), Chief Law Assistant, Junior Translator, Staff & Welfare Inspector across various Railway Zones.',
    ageLimit: '18 to 45 Years (as per specific post norms and category relaxations)',
    eligibility: 'Graduate Degree / 10+2 with Shorthand Speed / LLB / Post Graduate in Hindi/English according to post requirements',
    totalPosts: '1,038 Posts across all RRB Zones',
    officialLink: 'https://www.rrbapply.gov.in/#/auth/landing',
    fees: {
      genObc: '₹500 (₹400 refundable after appearing in CBT)',
      scSt: '₹250 (₹250 refundable after appearing in CBT)'
    },
    isNew: true
  },
  {
    id: 'ssc-cpo-si-delhi-police-capf-2026',
    title: 'SSC Sub-Inspector in Delhi Police & Central Armed Police Forces (CAPFs) Exam 2026',
    category: 'ssc_jobs',
    postDate: '17/08/2026',
    startDate: '17/08/2026',
    lastDate: '15/09/2026',
    advertisementNo: 'SSC/HQ/CPO-CAPF/Exam-2026',
    shortInfo: 'Staff Selection Commission (SSC) invites online applications for competitive examination for recruitment of Sub-Inspectors (GD) in BSF, CISF, CRPF, ITBP, SSB and Sub-Inspector (Executive) in Delhi Police.',
    ageLimit: '20 to 25 Years (OBC +3 Years, SC/ST +5 Years)',
    eligibility: "Bachelor's Degree in any discipline from a recognized University + Valid Driving License for LMV (for Delhi Police SI)",
    totalPosts: '4,187 Posts (Group B Non-Gazetted & Group C)',
    officialLink: 'https://ssc.gov.in',
    fees: {
      genObc: '₹100 (Online via Net Banking/UPI/Debit Card)',
      scSt: '₹0 (Exempted for SC/ST/Ex-Servicemen/Women candidates)'
    },
    isNew: true
  },
  {
    id: 'cus-ug-special-stray-round-2026',
    title: 'Online Admission Notice for Special Stray Round for UG / Honours Programmes (Session 2026)',
    category: 'cluster_univ',
    postDate: '17/08/2026',
    startDate: '17/08/2026',
    lastDate: '24/08/2026',
    advertisementNo: 'CUS/Adm/UG-Stray-Round/2026/912',
    shortInfo: 'Cluster University Srinagar opens online registration and counseling for left-out eligible candidates for vacant seats in Under-Graduate, 4-Year Honours, and 5-Year Integrated academic programmes in Constituent Colleges.',
    ageLimit: 'As per University Statutes',
    eligibility: '10+2 passed with required subject combinations and minimum 45% marks (40% for reserved categories)',
    totalPosts: 'Vacant Seats across Constituent Colleges',
    officialLink: 'https://www.cusrinagar.edu.in/',
    fees: {
      genObc: '₹300 (Counseling & Processing Fee)',
      scSt: '₹300 (Counseling & Processing Fee)'
    },
    isNew: true
  },
  {
    id: 'jkssb-draftsman-civil-pwd-2026',
    title: 'Direct Recruitment for Draftsman (Civil) & Works Supervisor in PW(R&B) Dept (357 Posts)',
    category: 'jkssb',
    postDate: '17/08/2026',
    startDate: '17/08/2026',
    lastDate: '30/08/2026',
    advertisementNo: 'JKSSB/Advt/PW-R&B/2026/09',
    shortInfo: 'Jammu and Kashmir Services Selection Board (JKSSB) invites online applications for direct recruitment to 357 Divisional Cadre posts of Draftsman (Civil) and Works Supervisor in Public Works (R&B) Department.',
    ageLimit: '18 to 40 Years (Open Merit), 43 Years (RBA/SC/ST/EWS/ALC-IB), 48 Years (Ex-Servicemen)',
    eligibility: '2-Year Draftsman Training Course Certificate / Diploma in Civil Engineering from a recognized Institute/Polytechnic',
    totalPosts: '357 Posts (Divisional Cadre Kashmir & Jammu)',
    officialLink: 'https://jkssb.nic.in',
    fees: {
      genObc: '₹500 (General / OM candidates)',
      scSt: '₹400 (SC, ST, PwD & EWS candidates)'
    },
    isNew: true
  },
  {
    id: 'ku-exam-date-sheet-pg-3rd-sem-2026',
    title: 'Date Sheet for MA / M.Sc / M.Com 3rd Semester Regular / Fresh Private Candidates (Session 2026)',
    category: 'exam_forms',
    postDate: '17/08/2026',
    startDate: '17/08/2026',
    lastDate: '31/08/2026',
    advertisementNo: 'KU/Exam/DS-PG-3rd/2026/748',
    shortInfo: 'University of Kashmir issues the official date sheet and examination schedule for candidates of MA, M.Sc, M.Com, and MCA 3rd Semester (Batch 2024-25 enrolled students).',
    ageLimit: 'Enrolled PG Students',
    eligibility: 'Bonafide students registered in respective post-graduate university departments and affiliated PG colleges',
    feePerSubject: '₹275 per paper + ₹100 EMF + ₹100 IT Charge',
    officialLink: 'https://kashmiruniversity.net/Examination.aspx',
    fees: {
      genObc: 'Standard University PG Examination Fee',
      scSt: 'Standard University PG Examination Fee'
    },
    isNew: true
  },
  {
    id: 'ku-admission-bed-cdoe-2026',
    title: 'Admission Notification for 2-Year B.Ed Programme (Distance Mode) Session 2026-28',
    category: 'admissions',
    postDate: '17/08/2026',
    startDate: '17/08/2026',
    lastDate: '05/09/2026',
    advertisementNo: 'KU/CDOE/B.Ed-Adm/2026/15',
    shortInfo: 'Centre for Distance and Online Education (CDOE), University of Kashmir, invites online applications for admission to 2-Year Bachelor of Education (B.Ed) Programme for Academic Session 2026-28.',
    ageLimit: 'No Age Bar for In-service / Untrained Teachers & Fresh Graduates',
    eligibility: "Bachelor's Degree in any discipline with at least 50% aggregate marks (45% for reserved category candidates) from recognized University",
    totalPosts: 'Distance Enrolment Open across Kashmir & Jammu Study Centres',
    officialLink: 'https://kashmiruniversity.net/AdmissionNotices.aspx',
    fees: {
      genObc: '₹500 (Online Application & Processing Fee)',
      scSt: '₹500 (Online Application & Processing Fee)'
    },
    isNew: true
  },
  // 🇮🇳 PREVIOUS NOTIFICATIONS (AUGUST 2026)
  {
    id: 'army-amc-ssc-course-2026',
    title: 'Army Medical Corps (AMC) Non-Technical & SSC Officer Course 2026-27',
    category: 'army_jobs',
    postDate: '16/08/2026',
    startDate: '18/08/2026',
    lastDate: '16/09/2026',
    advertisementNo: 'AMC / SSC (NT) Course 2026-27',
    shortInfo: 'Indian Army invites online applications from eligible candidates for grant of Short Service Commission in Army Medical Corps (Non-Technical & Technical Officers).',
    ageLimit: '21 to 35 Years',
    eligibility: 'Graduate / Post Graduate in relevant discipline from a recognized University',
    totalPosts: '65 Posts',
    officialLink: 'https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm',
    fees: {
      genObc: '₹0 (No Application Fee for Army Commission)',
      scSt: '₹0 (No Application Fee)'
    },
    isNew: true
  },
  {
    id: 'rrb-paramedical-cen05-2026',
    title: 'RRB Paramedical Categories (Staff Nurse, Lab Tech & Pharmacist) 2026',
    category: 'rrb_jobs',
    postDate: '16/08/2026',
    startDate: '17/08/2026',
    lastDate: '16/09/2026',
    advertisementNo: 'CEN No. 05/2026 (Paramedical Categories)',
    shortInfo: 'Railway Recruitment Boards (RRB) invite online applications for recruitment to various Paramedical Category posts (Nursing Superintendent, Lab Assistant, Pharmacist, Dialysis Tech) across Zonal Railways.',
    ageLimit: '18 to 40 Years (Relaxation as per RRB rules)',
    eligibility: 'B.Sc Nursing / GNM / D.Pharm / B.Pharm / DMLT according to post specifications',
    totalPosts: '1,376 Posts across Zonal Railways',
    officialLink: 'https://www.rrbapply.gov.in/#/auth/landing',
    fees: {
      genObc: '₹500 (₹400 refundable after appearing in CBT-1)',
      scSt: '₹250 (₹250 refundable after appearing in CBT-1)'
    },
    isNew: true
  },
  {
    id: 'ssc-jht-examination-2026',
    title: 'SSC Junior Hindi Translator (JHT) & Senior Hindi Translator Exam 2026',
    category: 'ssc_jobs',
    postDate: '16/08/2026',
    startDate: '16/08/2026',
    lastDate: '14/09/2026',
    advertisementNo: 'SSC/HQ/JHT-SHT/Exam-2026',
    shortInfo: 'Staff Selection Commission (SSC) invites online applications for recruitment of Junior Hindi Translator, Junior Translation Officer, and Senior Hindi Translator in various Ministries, Departments, and Organizations of the Government of India.',
    ageLimit: '18 to 30 Years (OBC +3, SC/ST +5, PwD +10 Years)',
    eligibility: "Master's Degree in Hindi with English as a compulsory subject OR Master's Degree in English with Hindi + Recognized Diploma/Certificate course in Translation",
    totalPosts: '312 Posts (Group B Non-Gazetted)',
    officialLink: 'https://ssc.gov.in',
    fees: {
      genObc: '₹100 (Online via Net Banking/UPI/Cards)',
      scSt: '₹0 (Exempted for SC/ST/PwD/Women candidates)'
    },
    isNew: true
  },
  {
    id: 'cus-self-financed-admission-2026',
    title: 'Online Admission Notice for UG / PG Self-Financed & Lateral Entry (Session 2026)',
    category: 'cluster_univ',
    postDate: '16/08/2026',
    startDate: '16/08/2026',
    lastDate: '28/08/2026',
    advertisementNo: 'CUS/Adm/UG-PG-SF/2026/894',
    shortInfo: 'Cluster University Srinagar invites online applications from eligible candidates for admission to vacant seats in Under-Graduate (Honors) and Post-Graduate Self-Financed / Lateral Entry academic programmes for Academic Session 2026.',
    ageLimit: 'As per University Statutes',
    eligibility: '10+2 / Bachelor Degree in relevant stream with minimum 45% aggregate (40% for reserved categories)',
    totalPosts: 'Vacant Seats across Constituent Colleges (SP College, Amar Singh College, AAA Memorial Degree College, Govt College for Women)',
    officialLink: 'https://www.cusrinagar.edu.in/',
    fees: {
      genObc: '₹500 (Online Admission Processing Fee)',
      scSt: '₹500 (Online Admission Processing Fee)'
    },
    isNew: true
  },
  {
    id: 'jkssb-draft-merit-hme-2026',
    title: 'JKSSB Document Verification & Draft Merit List for Health & Medical Education Dept',
    category: 'jkssb',
    postDate: '16/08/2026',
    startDate: '20/08/2026',
    lastDate: '25/08/2026',
    advertisementNo: 'JKSSB/COE/HME-DV/2026/114-129',
    shortInfo: 'Jammu and Kashmir Services Selection Board (JKSSB) issues the document verification schedule and draft score-sheet for candidates shortlisted for various Technical & Paramedical positions in Health & Medical Education Department.',
    ageLimit: 'As per initial notification',
    eligibility: 'Candidates shortlisted based on Written CBT Examination merit',
    totalPosts: 'Various Divisional & District Cadre Posts',
    officialLink: 'https://jkssb.nic.in',
    fees: {
      genObc: '₹0 (Document Verification Round)',
      scSt: '₹0 (Document Verification Round)'
    },
    isNew: true
  },
  {
    id: 'ku-exam-form-bg-1st-2nd-sem-2026',
    title: 'Submission of Online Examination Forms for BG 1st & 2nd Sem (Batch 2025-26 NEP-2020)',
    category: 'exam_forms',
    postDate: '16/08/2026',
    startDate: '17/08/2026',
    lastDate: '27/08/2026',
    advertisementNo: 'KU/Exam/NEP-UG/1st-2nd/2026/512',
    shortInfo: 'University of Kashmir opens the online portal for submission of examination forms and fee for eligible Regular / Fresh Private candidates of BG 1st & 2nd Semester (Batch 2025-2026 Under NEP-2020).',
    ageLimit: 'Enrolled College Students',
    eligibility: 'Bonafide students admitted to UG 1st & 2nd Semester in affiliated degree colleges',
    feePerSubject: '₹250 per subject + ₹50 EMF + ₹100 Service Charges',
    officialLink: 'https://egov.uok.edu.in/eexams/',
    fees: {
      genObc: 'Standard University Exam Fee Schedule',
      scSt: 'Standard University Exam Fee Schedule'
    },
    isNew: true
  },
  {
    id: 'ku-admission-cdoe-pg-diploma-2026',
    title: 'Admission Notification No. 14 of 2026: PG Diploma & Certificate Programmes (CDOE)',
    category: 'admissions',
    postDate: '16/08/2026',
    startDate: '16/08/2026',
    lastDate: '30/08/2026',
    advertisementNo: 'KU/CDOE/Adm-Notif-14/2026',
    shortInfo: 'Centre for Distance and Online Education (CDOE), University of Kashmir, invites online applications for admission to 1-Year Post-Graduate Diploma and 6-Month Certificate courses in Cyber Law, Disaster Management, Tourism, and Web Designing.',
    ageLimit: 'No upper age limit for distance education programmes',
    eligibility: "Bachelor's Degree in any discipline from a recognized University / Class 12th for Certificate programmes",
    totalPosts: 'Distance Learning Enrolment Open',
    officialLink: 'https://kashmiruniversity.net/AdmissionNotices.aspx',
    fees: {
      genObc: '₹400 (Online Application & Prospectus Fee)',
      scSt: '₹400 (Online Application & Prospectus Fee)'
    },
    isNew: true
  },

  // 🇮🇳 JOIN INDIAN ARMY NOTIFICATIONS (https://www.joinindianarmy.nic.in/default.aspx)
  {
    id: 'army-ncc-125-2026',
    title: 'NCC Special Entry Scheme 125th Course (April 2027)',
    category: 'army_jobs',
    postDate: '05/08/2026',
    startDate: '05/08/2026',
    lastDate: '20/08/2026',
    advertisementNo: 'NCC Special Entry 125th Course (Apr 2027)',
    shortInfo: 'Indian Army invites online applications from unmarried male and female candidates holding NCC Senior Division "C" Certificate for Officers entry in Short Service Commission.',
    ageLimit: '19 to 25 Years',
    eligibility: 'Graduate (Min 50% marks) + NCC "C" Certificate',
    totalPosts: '70 Posts (Male & Female)',
    fees: { genObc: '₹0', scSt: '₹0' },
    officialLink: 'https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Officers Training Academy (OTA) Chennai',
        postName: 'NCC Special Entry Officer',
        posts: '70 Posts',
        qualification: 'Graduate with 50% marks + NCC C-Cert',
        fee: 'Free (₹0)'
      }
    ]
  },
  {
    id: 'army-jag-34-2026',
    title: 'JAG Entry Scheme 34th Course (Law Graduates - April 2027)',
    category: 'army_jobs',
    postDate: '05/08/2026',
    startDate: '05/08/2026',
    lastDate: '21/08/2026',
    advertisementNo: 'JAG Entry Scheme 34th Course (Apr 2027)',
    shortInfo: 'Indian Army Judge Advocate General Branch recruitment for Law Graduates (Male & Female) for Short Service Commission.',
    ageLimit: '21 to 27 Years',
    eligibility: 'LLB Degree (Min 55% marks) + Bar Council eligibility',
    totalPosts: '10 Posts',
    fees: { genObc: '₹0', scSt: '₹0' },
    officialLink: 'https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Judge Advocate General (JAG) Branch',
        postName: 'JAG Officer (Male & Female)',
        posts: '10 Posts',
        qualification: 'LLB Degree (55% marks) + Bar Council eligibility',
        fee: 'Free (₹0)'
      }
    ]
  },
  {
    id: 'army-ta-officer-2026',
    title: 'Territorial Army Non-Departmental Officer Entry 2026',
    category: 'army_jobs',
    postDate: '05/08/2026',
    startDate: '05/08/2026',
    lastDate: '25/08/2026',
    advertisementNo: 'TA Officer Entry 2026',
    shortInfo: 'Territorial Army invites applications for Commissioned Officers from gainfully employed civilians in any discipline.',
    ageLimit: '18 to 42 Years',
    eligibility: 'Graduate in any discipline (Gainfully Employed)',
    totalPosts: 'Multiple Officer Vacancies',
    fees: { genObc: '₹0', scSt: '₹0' },
    officialLink: 'https://www.joinindianarmy.nic.in/default.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Territorial Army Units',
        postName: 'Territorial Army Commissioned Officer',
        posts: 'Multiple Posts',
        qualification: 'Graduate Degree (Gainfully Employed)',
        fee: 'Free (₹0)'
      }
    ]
  },
  {
    id: 'army-ladakh-rally-2026',
    title: 'Ladakh Scouts Regimental Centre Agniveer Recruitment Rally',
    category: 'army_jobs',
    postDate: '05/08/2026',
    startDate: '11/08/2026',
    lastDate: '13/08/2026',
    advertisementNo: 'Ladakh Scouts HQ Rally 2026',
    shortInfo: 'Recruitment rally for Agniveer General Duty and Technical at Leh, Ladakh for Ladakh domicile candidates.',
    ageLimit: '17.5 to 21 Years',
    eligibility: '10th / 12th Pass (Ladakh Domicile)',
    totalPosts: 'Regimental HQ Quota',
    fees: { genObc: '₹0', scSt: '₹0' },
    officialLink: 'https://www.joinindianarmy.nic.in/BRAgniveerRallySchedule.htm',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Ladakh Scouts Regimental Centre',
        postName: 'Agniveer GD / Technical',
        posts: 'HQ Rally Quota',
        qualification: 'Class 10th / 12th Pass',
        fee: 'Free (₹0)'
      }
    ]
  },
  {
    id: 'army-aoc-civilian-2026',
    title: 'Army Ordnance Corps (AOC) Civilian Recruitment Alert 2026',
    category: 'army_jobs',
    postDate: '07/08/2026',
    startDate: '24/08/2026',
    lastDate: '22/09/2026',
    advertisementNo: 'AOC Civilian Notice 2026',
    shortInfo: 'Upcoming online application notice for Tradesman Mate, Fireman, and Material Assistant positions in Army Ordnance Corps.',
    ageLimit: '18 to 27 Years',
    eligibility: '10th Pass / 12th Pass / Graduate',
    totalPosts: 'Upcoming Vacancies',
    fees: { genObc: '₹0', scSt: '₹0' },
    officialLink: 'https://www.joinindianarmy.nic.in/default.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Army Ordnance Corps Units',
        postName: 'Tradesman Mate, Fireman & Material Assistant',
        posts: 'Upcoming',
        qualification: '10th / 12th Pass / Graduation',
        fee: 'Free (₹0)'
      }
    ]
  },
  // 🚆 RAILWAY RECRUITMENT BOARD (RRB) NOTIFICATIONS (https://www.rrbapply.gov.in/)
  {
    id: 'rrb-je-2026',
    title: 'RRB Junior Engineer (JE), DMS & CMA Recruitment 2026 (CEN No. 04/2026)',
    category: 'rrb_jobs',
    postDate: '05/08/2026',
    startDate: '14/08/2026',
    lastDate: '13/09/2026',
    advertisementNo: 'CEN 04/2026 (RRB JE)',
    shortInfo: 'Railway Recruitment Boards (RRB) release short notice for 4,098 vacancies of Junior Engineer (JE), Depot Material Superintendent (DMS), and Chemical & Metallurgical Assistant (CMA). Online applications open August 14, 2026 on rrbapply.gov.in.',
    ageLimit: '18 to 33 Years as on 01/01/2026 (Age relaxation: OBC 3 Years, SC/ST 5 Years, PwBD 10 Years).',
    eligibility: 'Engineering Diploma / B.E. / B.Tech Degree in relevant discipline (Civil, Electrical, Mechanical, ECE, CS/IT) OR B.Sc with Physics & Chemistry.',
    totalPosts: '4,098 Posts (Pan-India Railway Zones)',
    fees: { genObc: '₹500 (₹400 refunded after CBT-1)', scSt: '₹250 (Full ₹250 refunded after CBT-1)' },
    officialLink: 'https://www.rrbapply.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Indian Railways - Works, Track & Civil Infrastructure',
        postName: 'Junior Engineer (Civil Engineering)',
        posts: '1,650 Posts',
        qualification: 'Diploma or B.Tech in Civil Engineering',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Indian Railways - Electrical & Mechanical Loco Wings',
        postName: 'Junior Engineer (Electrical & Mechanical)',
        posts: '1,420 Posts',
        qualification: 'Diploma or B.Tech in Electrical / Mechanical / Automotive Engg',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Indian Railways - Signal & Telecom / IT',
        postName: 'Junior Engineer (S&T / IT)',
        posts: '620 Posts',
        qualification: 'Diploma/B.Tech in ECE / CS / IT / Instrumentation',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Stores & Material Management Cadre',
        postName: 'Depot Material Superintendent (DMS) & CMA',
        posts: '408 Posts',
        qualification: 'Diploma/Degree in Engineering or B.Sc in Chemistry/Physics',
        fee: '₹500 / ₹250'
      }
    ]
  },
  {
    id: 'rrb-section-controller-2026',
    title: 'RRB Section Controller Recruitment 2026 (CEN No. 03/2026)',
    category: 'rrb_jobs',
    postDate: '15/07/2026',
    startDate: '15/07/2026',
    lastDate: '14/08/2026',
    advertisementNo: 'CEN 03/2026',
    shortInfo: 'Railway Recruitment Board (RRB) active online recruitment for 119 Section Controller positions. Fee payment deadline Aug 16, correction window Aug 17 to Aug 26, 2026.',
    ageLimit: '20 to 34 Years as on 01/07/2026 with government age relaxation benefits.',
    eligibility: 'Bachelor\'s Degree in any discipline from a recognized University.',
    totalPosts: '119 Posts',
    fees: { genObc: '₹500', scSt: '₹250' },
    officialLink: 'https://www.rrbapply.gov.in/#/auth/landing',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Operating & Traffic Control Division',
        postName: 'Section Controller',
        posts: '119 Posts',
        qualification: 'Bachelor\'s Degree in any discipline',
        fee: '₹500 / ₹250'
      }
    ]
  },
  {
    id: 'rrb-group-d-2026',
    title: 'RRB Group D (Level-1) CBT Examination & City Intimation (CEN No. 09/2025)',
    category: 'rrb_jobs',
    postDate: '03/08/2026',
    startDate: '03/08/2026',
    lastDate: '25/08/2026',
    advertisementNo: 'CEN 09/2025',
    shortInfo: 'Railway Recruitment Board conducts CBT examination for 22,195 Level-1 posts (Track Maintainer, Pointsman B, Assistant) from August 3 to August 25, 2026. City Intimation Slip live on portal.',
    ageLimit: '18 to 33 Years with applicable category relaxation.',
    eligibility: '10th Pass (Matriculation) or ITI from NCVT/SCVT recognized institutes.',
    totalPosts: '22,195 Posts (Level-1 Posts)',
    fees: { genObc: '₹500', scSt: '₹250' },
    officialLink: 'https://www.rrbapply.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Track & Traffic Operating Units',
        postName: 'Track Maintainer Gr IV & Pointsman B',
        posts: '22,195 Posts',
        qualification: 'Class 10th Pass or ITI from NCVT / SCVT',
        fee: 'Exam Active'
      }
    ]
  },
  {
    id: 'rrb-technician-correction-2026',
    title: 'RRB Technician (Grade 1 Signal & Grade 3) Application Correction Window (CEN No. 02/2026)',
    category: 'rrb_jobs',
    postDate: '01/08/2026',
    startDate: '01/08/2026',
    lastDate: '10/08/2026',
    advertisementNo: 'CEN 02/2026',
    shortInfo: 'Active modification and correction portal for 6,557 Technician Grade 1 Signal and Grade 3 posts. Modify RRB choice, photo/signature re-upload & particulars correction from Aug 01 to Aug 10, 2026.',
    ageLimit: 'Grade 1 Signal: 18-36 Yrs | Grade 3: 18-33 Yrs.',
    eligibility: 'Grade 1: B.Sc/B.Tech/Diploma in Physics/ECE/CS/IT | Grade 3: 10th + ITI or 10+2 PCM.',
    totalPosts: '6,557 Posts',
    fees: { genObc: '₹100 (Correction Fee)', scSt: '₹100 (Correction Fee)' },
    officialLink: 'https://www.rrbapply.gov.in/#/auth/landing',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Signal, Telecom, Workshop & Loco Sheds',
        postName: 'Technician Grade 1 & Grade 3',
        posts: '6,557 Posts',
        qualification: '10th+ITI / 10+2 PCM / Diploma / B.Sc / B.Tech',
        fee: '₹100 Modification'
      }
    ]
  },
  {
    id: 'rrb-ntpc-paramedical-2026',
    title: 'RRB NTPC & Paramedical Categories Recruitment Calendar 2026',
    category: 'rrb_jobs',
    postDate: '07/08/2026',
    startDate: 'Mid-Aug 2026',
    lastDate: 'Late-Aug 2026',
    advertisementNo: 'Upcoming CEN Calendar 2026',
    shortInfo: 'Upcoming Centralized Employment Notices (CEN) for Non-Technical Popular Categories (NTPC Graduate & Under-Graduate), Nursing Superintendent, Pharmacist & Paramedical staff on rrbapply.gov.in.',
    ageLimit: '18 to 36 Years as per position norms.',
    eligibility: '12th Pass / Graduate Degree / B.Sc Nursing / GNM / D.Pharm / B.Pharm.',
    totalPosts: '15,000+ Expected Vacancies',
    fees: { genObc: '₹500', scSt: '₹250' },
    officialLink: 'https://www.rrbapply.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Traffic, Operating, Commercial & Railway Medical Division',
        postName: 'Station Master, Goods Guard, Nursing Supt & Paramedical',
        posts: '15,000+ Posts',
        qualification: '12th Pass / Graduate Degree / Nursing / Pharmacy Qualification',
        fee: '₹500 / ₹250'
      }
    ]
  },
  // 🇮🇳 STAFF SELECTION COMMISSION (SSC) RECRUITMENT NOTIFICATIONS (https://ssc.gov.in/)
  {
    id: 'ssc-steno-2026',
    title: 'SSC Stenographer Grade "C" & "D" Examination 2026 (1,207 Vacancies)',
    category: 'ssc_jobs',
    postDate: '06/08/2026',
    startDate: '06/08/2026',
    lastDate: '05/09/2026',
    advertisementNo: 'SSC/Steno-CD/2026',
    shortInfo: 'Staff Selection Commission (SSC) invites online applications for Stenographer Grade C (Group B Non-Gazetted) and Stenographer Grade D (Group C) in various Ministries, Departments & Organizations.',
    ageLimit: 'Grade C: 18 to 30 Years | Grade D: 18 to 27 Years as of 01/08/2026 (Age relaxation applicable as per rules).',
    eligibility: 'Passed 12th Standard (10+2) or equivalent from a recognized Board + Shorthand Stenography Test (100 wpm Grade C / 80 wpm Grade D).',
    totalPosts: '1,207 Posts (Tentative)',
    fees: { genObc: '₹100', scSt: '₹0 (Exempted for SC/ST/PwD/Women)' },
    officialLink: 'https://ssc.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Central Ministries & Armed Forces HQ (AFHQ)',
        postName: 'Stenographer Grade C (Group B Non-Gazetted)',
        posts: '180+ Posts',
        qualification: '12th Class Pass + Stenography Dictation 100 wpm (English/Hindi) Speed Test',
        fee: '₹100 / Exempted'
      },
      {
        department: 'Subordinate & Attached Offices across India',
        postName: 'Stenographer Grade D (Group C)',
        posts: '1,027 Posts',
        qualification: '12th Class Pass + Stenography Dictation 80 wpm (English/Hindi) Speed Test',
        fee: '₹100 / Exempted'
      }
    ]
  },
  {
    id: 'ssc-cgl-2026-city-slip',
    title: 'SSC CGL 2026 Tier-I Exam City Intimation Slip & Computer-Based Exam Schedule Notice',
    category: 'ssc_jobs',
    postDate: '05/08/2026',
    startDate: '09/09/2026',
    lastDate: '26/09/2026',
    advertisementNo: 'SSC/CGL-Exam/2026 Notice',
    shortInfo: 'SSC releases Tier-I Computer Based Examination Schedule and Exam City Intimation Portal Notice for Combined Graduate Level (CGL) 2026 Exam.',
    ageLimit: '18 to 32 Years as per CGL 2026 Norms',
    eligibility: 'Bachelor Degree in any discipline from a recognized University',
    totalPosts: '17,727 Vacancies',
    fees: { genObc: '₹100', scSt: '₹0' },
    officialLink: 'https://ssc.gov.in/login',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Govt Ministries & Departments (Group B & C Officers)',
        postName: 'Assistant Section Officer, Inspector (Excise/IT/Customs), JSO, Auditor',
        posts: '17,727 Posts',
        qualification: 'Graduate Degree in any discipline',
        fee: 'Checked'
      }
    ]
  },
  {
    id: 'ssc-gd-constable-2026-notice',
    title: 'SSC GD Constable in CAPFs, SSF & Rifleman (GD) in Assam Rifles 2026 Notification Notice',
    category: 'ssc_jobs',
    postDate: '07/08/2026',
    startDate: '27/08/2026',
    lastDate: '27/09/2026',
    advertisementNo: 'SSC/GD-Constable/2026 Short Notice',
    shortInfo: 'Staff Selection Commission short notice announcement for Constable (GD) recruitment drive in BSF, CISF, CRPF, SSB, ITBP, SSF and Assam Rifles.',
    ageLimit: '18 to 23 Years as on 01/01/2027',
    eligibility: 'Class 10th (Matriculation) Pass from recognized Board',
    totalPosts: '39,481 Expected Posts',
    fees: { genObc: '₹100', scSt: '₹0' },
    officialLink: 'https://ssc.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Central Armed Police Forces (CAPFs)',
        postName: 'Constable (General Duty) - Male & Female',
        posts: '39,481 Posts',
        qualification: 'Matriculation (10th Pass) + Physical Standard Test (PST/PET)',
        fee: '₹100 / Exempted'
      }
    ]
  },
  {
    id: 'ssc-selection-post-phase14-2026',
    title: 'SSC Selection Posts Phase-XIV 2026 Application Correction Window Notice',
    category: 'ssc_jobs',
    postDate: '06/08/2026',
    startDate: '14/08/2026',
    lastDate: '16/08/2026',
    advertisementNo: 'SSC/Phase-XIV/2026 Selection Posts',
    shortInfo: 'Official notice regarding correction window dates for candidate application forms for Selection Posts Phase-XIV/2026.',
    ageLimit: '18 to 30 Years depending on post code',
    eligibility: '10th Pass / 12th Pass / Graduate depending on specific Post Code',
    totalPosts: '2,049 Posts across Regional Cadres',
    fees: { genObc: '₹100 (Correction Fee ₹200/₹500)', scSt: '₹0' },
    officialLink: 'https://ssc.gov.in/login',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Regional SSC Offices (NR, CR, WR, ER, SR, KKR, NWR, MPR, NER)',
        postName: 'Selection Posts Phase-XIV (Matric, Higher Secondary & Graduate Level)',
        posts: '2,049 Posts',
        qualification: '10th / 12th / Degree relevant to post code',
        fee: '₹100'
      }
    ]
  },
  {
    id: 'ssc-chsl-mains-2026-notice',
    title: 'SSC CHSL (10+2) Tier-II (Mains) Examination Date Notice 2026',
    category: 'ssc_jobs',
    postDate: '05/08/2026',
    startDate: '18/10/2026',
    lastDate: '18/10/2026',
    advertisementNo: 'SSC/CHSL-Exam/2026 Tier-II Notice',
    shortInfo: 'Staff Selection Commission announces Tier-II Mains examination dates for CHSL 2026 (LDC, JSA, DEO Grade A).',
    ageLimit: '18 to 27 Years',
    eligibility: 'Tier-I Qualified Candidates (12th Class Pass)',
    totalPosts: '3,712 Posts',
    fees: { genObc: '₹0', scSt: '₹0' },
    officialLink: 'https://ssc.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Ministries & Departments of Govt of India',
        postName: 'LDC, JSA & Data Entry Operator (DEO Grade A)',
        posts: '3,712 Posts',
        qualification: '12th Pass + Tier-I Qualified Status',
        fee: 'Free'
      }
    ]
  },
  // 🏛️ NATIONAL TESTING AGENCY (NTA) ACTIVE ENTRANCE EXAM NOTIFICATIONS (https://www.nta.ac.in/)
  {
    id: 'nta-ugc-net-dec-2026',
    title: 'NTA UGC NET December 2026 Session Public Notice & Online Registration Schedule',
    category: 'nta',
    postDate: '06/08/2026',
    startDate: '06/08/2026',
    lastDate: '05/09/2026',
    advertisementNo: 'NTA/UGC-NET/Dec-2026',
    shortInfo: 'National Testing Agency (NTA) on behalf of UGC invites online applications for UGC NET December 2026 to determine eligibility for Junior Research Fellowship (JRF) & Assistant Professor across 83 subjects in Indian Universities & Colleges.',
    ageLimit: 'JRF: Maximum 30 Years as of 01/12/2026 (5 yrs relaxation for SC/ST/OBC-NCL/Women/PwD). Assistant Professor & Ph.D Admission: No Upper Age Limit.',
    eligibility: 'Master Degree or equivalent in relevant subject with minimum 55% marks (50% for SC/ST/OBC-NCL/PwD/Third Gender). Final year appearing candidates also eligible.',
    totalPosts: '83 Academic Subjects / JRF & Assistant Professor Intake',
    feePerSubject: 'General / Unreserved: ₹1150 | General-EWS/OBC-NCL: ₹600 | SC/ST/PwD/Third Gender: ₹325',
    fees: { genObc: '₹1150 (Gen) / ₹600 (OBC/EWS)', scSt: '₹325' },
    officialLink: 'https://ugcnet.nta.ac.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Humanities & Social Sciences',
        postName: 'UGC NET JRF & Assistant Professor (83 Subjects)',
        posts: 'Open Intake',
        qualification: 'Master Degree in Humanities / Languages / Social Sciences / Commerce / Computer Apps with min 55% marks',
        fee: '₹1150 / ₹600 / ₹325'
      },
      {
        department: 'Commerce & Management Sciences',
        postName: 'UGC NET JRF & Assistant Professor in Management',
        posts: 'Open Intake',
        qualification: 'M.Com / MBA / PGDM or equivalent with 55% aggregate (50% for reserved classes)',
        fee: '₹1150 / ₹600 / ₹325'
      },
      {
        department: 'Education & Physical Education',
        postName: 'UGC NET JRF & Assistant Professor in Education',
        posts: 'Open Intake',
        qualification: 'M.Ed / M.A. Education / M.P.Ed with min 55% marks',
        fee: '₹1150 / ₹600 / ₹325'
      }
    ]
  },
  {
    id: 'nta-jee-main-2027-session1',
    title: 'NTA JEE (Main) 2027 Session-1 Exam Calendar & Preliminary Public Notice',
    category: 'nta',
    postDate: '05/08/2026',
    startDate: '25/10/2026',
    lastDate: '22/11/2026',
    advertisementNo: 'NTA/JEE-MAIN/2027-Notice',
    shortInfo: 'NTA releases preliminary public notice and exam calendar for Joint Entrance Examination (JEE Main) 2027 Session-1 for admission to B.E./B.Tech, B.Arch and B.Planning at NITs, IIITs, CFTIs.',
    ageLimit: 'No Upper Age Limit for candidates. Candidates must fulfill class 12th passing year criteria (2025, 2026, or 2027).',
    eligibility: 'Class 12th passed in 2025, 2026 or appearing in 2027 with Physics and Mathematics as compulsory subjects along with Chemistry/Biotech/Biology/Technical Vocational subject.',
    totalPosts: 'All India Engineering & Architecture Admissions',
    feePerSubject: 'Paper 1 or Paper 2: Male Gen ₹1000, Female Gen ₹800, Gen-EWS/OBC Male ₹900, SC/ST/PwD Male ₹500',
    fees: { genObc: '₹1000 (Gen Male) / ₹900 (OBC/EWS)', scSt: '₹500' },
    officialLink: 'https://jeemain.nta.ac.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Engineering Stream (Paper 1)',
        postName: 'B.E. / B.Tech Engineering Programmes',
        posts: 'Open All India Rank',
        qualification: '10+2 with Physics & Maths + Chemistry/Biotech/Biology',
        fee: '₹1000 / ₹900 / ₹500'
      },
      {
        department: 'Architecture Stream (Paper 2A)',
        postName: 'B.Arch Architecture Degree Programme',
        posts: 'Open All India Rank',
        qualification: '10+2 Pass with Physics, Chemistry & Mathematics compulsory',
        fee: '₹1000 / ₹900 / ₹500'
      },
      {
        department: 'Planning Stream (Paper 2B)',
        postName: 'B.Planning Urban & Regional Planning Degree',
        posts: 'Open All India Rank',
        qualification: '10+2 Pass with Mathematics as compulsory subject',
        fee: '₹1000 / ₹900 / ₹500'
      }
    ]
  },
  {
    id: 'nta-neet-ug-2026-counselling',
    title: 'NTA NEET UG 2026 Medical Counselling Data Verification Public Notice',
    category: 'nta',
    postDate: '06/08/2026',
    startDate: '06/08/2026',
    lastDate: '20/08/2026',
    advertisementNo: 'NTA/NEET-UG/2026-Counselling',
    shortInfo: 'National Testing Agency (NTA) issues public notice for NEET UG 2026 qualified candidates regarding data verification for MCC All India Quota and State Medical Counselling 2026.',
    ageLimit: 'Minimum 17 Years as on 31/12/2026. Qualified percentile criteria fulfilled.',
    eligibility: 'NEET UG 2026 Qualified Candidates (10+2 with PCB & English passed).',
    totalPosts: '1,00,000+ MBBS/BDS/AYUSH Seats Nationwide',
    feePerSubject: 'Verification Free for NEET UG Qualified Candidates',
    fees: { genObc: 'Checked', scSt: 'Checked' },
    officialLink: 'https://neet.ntaonline.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'MBBS & Dental Surgery (BDS)',
        postName: 'MCC AIQ & State Quota MBBS/BDS Counselling Data',
        posts: '100,000+ Seats',
        qualification: 'NEET UG 2026 Qualified Scorecard',
        fee: 'Verified'
      },
      {
        department: 'AYUSH Medical Degrees (BAMS/BHMS/BUMS)',
        postName: 'Ayurvedic, Homeopathic & Unani Counselling Data',
        posts: '50,000+ Seats',
        qualification: 'NEET UG 2026 Qualified Scorecard',
        fee: 'Verified'
      }
    ]
  },
  {
    id: 'nta-csir-ugc-net-dec-2026',
    title: 'NTA Joint CSIR-UGC NET December 2026 Online Registration Public Notice',
    category: 'nta',
    postDate: '07/08/2026',
    startDate: '07/08/2026',
    lastDate: '06/09/2026',
    advertisementNo: 'NTA/CSIR-NET/Dec-2026',
    shortInfo: 'NTA issues public notice for Joint CSIR-UGC NET December 2026 to determine eligibility for Junior Research Fellowship (JRF) and Lectureship (LS) in Science & Technology subjects.',
    ageLimit: 'JRF: Maximum 30 Years (5 yrs relaxation for SC/ST/Third Gender/Women/PwD, 3 yrs for OBC-NCL). Lectureship (LS) & Ph.D: No Upper Age Limit.',
    eligibility: 'M.Sc or equivalent degree / BS-4 years / B.E. / B.Tech / B.Pharma / MBBS with min 55% marks (50% for SC/ST/OBC-NCL/Third Gender/PwD).',
    totalPosts: 'Science Subjects JRF & Lectureship Positions',
    feePerSubject: 'General: ₹1150 | OBC-NCL/EWS: ₹600 | SC/ST/Third Gender: ₹325 | PwD: Nil',
    fees: { genObc: '₹1150 (Gen) / ₹600 (OBC/EWS)', scSt: '₹325' },
    officialLink: 'https://csirnet.nta.ac.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Chemical Sciences',
        postName: 'CSIR JRF & Lectureship in Chemistry',
        posts: 'Open Intake',
        qualification: 'M.Sc in Chemical Sciences with min 55% marks',
        fee: '₹1150 / ₹600 / ₹325'
      },
      {
        department: 'Life Sciences',
        postName: 'CSIR JRF & Lectureship in Biology & Life Sciences',
        posts: 'Open Intake',
        qualification: 'M.Sc in Biochemistry / Biotech / Botany / Zoology with min 55% marks',
        fee: '₹1150 / ₹600 / ₹325'
      },
      {
        department: 'Mathematical & Physical Sciences',
        postName: 'CSIR JRF & Lectureship in Physics & Maths',
        posts: 'Open Intake',
        qualification: 'M.Sc in Physics / Maths or B.Tech with 55% marks',
        fee: '₹1150 / ₹600 / ₹325'
      }
    ]
  },
  {
    id: 'nta-cuet-2027-advisory',
    title: 'NTA CUET UG & PG 2027 Academic Session Advisory Public Notice',
    category: 'nta',
    postDate: '05/08/2026',
    startDate: '15/11/2026',
    lastDate: '20/12/2026',
    advertisementNo: 'NTA/CUET-2027/Advisory',
    shortInfo: 'National Testing Agency (NTA) issues public advisory notice regarding Common University Entrance Test (CUET) UG/PG syllabus, domain subjects, and registration window preview for 2027-28.',
    ageLimit: 'No Upper Age Limit set by NTA. Candidate must satisfy participating university guidelines.',
    eligibility: 'Class 12th Pass/Appearing (for UG) / Bachelor Degree (for PG) from recognized institution.',
    totalPosts: 'All India Central & Participating Universities Admissions',
    feePerSubject: 'To be notified in detailed information bulletin',
    fees: { genObc: 'Standard NTA Slab', scSt: 'Standard NTA Slab' },
    officialLink: 'https://www.nta.ac.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Undergraduate Entrance Stream (CUET UG)',
        postName: 'Domain Subjects, Languages & General Test',
        posts: 'Central Univ Seats',
        qualification: 'Class 12th Pass or Appearing in 2027',
        fee: 'Standard Slab'
      },
      {
        department: 'Postgraduate Entrance Stream (CUET PG)',
        postName: 'M.A., M.Sc, M.Com & Professional Master Degrees',
        posts: 'Central Univ Seats',
        qualification: 'Bachelor Degree in relevant major discipline',
        fee: 'Standard Slab'
      }
    ]
  },
  // 🏔️ OFFICIAL JKSSB RECRUITMENT NOTIFICATIONS (jkssb.nic.in/Advertisement.html)
  {
    id: 'jkssb-advt-08-2026',
    title: 'JKSSB Advt 08 of 2026: Various UT / Divisional / District Cadre Posts (Health, Higher Edu, Agriculture & Labour)',
    category: 'jkssb',
    postDate: '04/08/2026',
    lastDate: '09/10/2026 (Apply Online: 10/09/2026 to 09/10/2026)',
    advertisementNo: 'Notification No. 08 of 2026 (Dated: 04.08.2026)',
    shortInfo: 'Jammu and Kashmir Services Selection Board (JKSSB) invites online application forms for 518 UT/Divisional/District Cadre vacancies across Health & Medical Education (421), Higher Education (48), Agriculture Production (46), and Labour & Employment (3) Departments.',
    ageLimit: 'OM: 18 - 40 Years | SC/ST/RBA/ALC/IB/EWS: 18 - 43 Years | PWD: 18 - 42 Years | Ex-Servicemen: Up to 48 Years (As on 01.01.2026)',
    eligibility: 'Must be a Domicile of UT of Jammu & Kashmir. Academic / Professional Qualifications vary by post (Degree, Diploma, Matriculation, etc. in concerned discipline).',
    totalPosts: '518 Posts',
    fees: { genObc: '₹500', scSt: '₹400' },
    officialLink: 'https://jkssb.nic.in/Advertisement.html',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Health and Medical Education Department',
        postName: 'UT / Divisional / District Cadre Paramedical & Medical Posts',
        posts: 421,
        qualification: 'Degree / Diploma / Certificate in relevant Paramedical, Nursing, Pharmacy or Medical Technology field'
      },
      {
        department: 'Higher Education Department',
        postName: 'Non-Teaching / Technical & Cadre Staff',
        posts: 48,
        qualification: 'Bachelor Degree / Master Degree / Diploma in relevant subject from a recognized University'
      },
      {
        department: 'Agriculture Production Department',
        postName: 'Agriculture & Horticulture Technical Cadre Posts',
        posts: 46,
        qualification: 'B.Sc Agriculture / Horticulture or Diploma / Degree in relevant Agriculture / Technical trade'
      },
      {
        department: 'Labour and Employment Department',
        postName: 'Labour Department Cadre Posts',
        posts: 3,
        qualification: 'Bachelor Degree in any discipline from a recognized University'
      }
    ]
  },
  {
    id: 'jkssb-advt-06-2026',
    title: 'JKSSB Advt 06 of 2026: Public Works (R&B) Dept Draftsman & Works Supervisor Recruitment',
    category: 'jkssb',
    postDate: '06/07/2026',
    lastDate: '30/08/2026',
    advertisementNo: 'Notification No. 06 of 2026',
    shortInfo: 'Jammu and Kashmir Services Selection Board (JKSSB) invites online applications from eligible J&K UT domiciles for 357 Divisional Cadre vacancies of Draftsman (Civil) and Works Supervisor in Public Works (R&B) Department.',
    ageLimit: 'OM: 18 - 40 Years | SC/ST/RBA/ALC/IB/EWS: 18 - 43 Years | PWD: 18 - 42 Years | Ex-Servicemen: Up to 48 Years',
    eligibility: 'Must be a Domicile of UT of Jammu & Kashmir. 2-Year Diploma in Draftsman (Civil) from ITI / Recognized Polytechnic or 10th Pass with ITI Certificate in relevant trade.',
    totalPosts: '357 Posts',
    fees: { genObc: '₹500', scSt: '₹400' },
    officialLink: 'https://jkssb.nic.in/Advertisement.html',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Public Works (R&B) Department',
        postName: 'Draftsman (Civil) [Divisional Cadre Jammu & Kashmir]',
        posts: 236,
        qualification: '2 Years Diploma / Certificate in Draftsman (Civil) from ITI or Recognized Polytechnic Institute'
      },
      {
        department: 'Public Works (R&B) Department',
        postName: 'Works Supervisor [Divisional Cadre]',
        posts: 121,
        qualification: 'Matriculation (10th Pass) with ITI Certificate in relevant technical trade'
      }
    ]
  },
  {
    id: 'jkssb-constable-si-2026',
    title: 'JKSSB Home Dept Police Constable (Armed/IRP/SDRF/Executive) & Sub-Inspector Recruitment',
    category: 'jkssb',
    postDate: '19/01/2026',
    lastDate: '17/02/2026 (Written Exam Nov-Dec 2026)',
    advertisementNo: 'Notification No. 12/2025 & 14/2025',
    shortInfo: 'JKSSB official advertisement for 2,302 posts of Police Constable (Executive Cadre, Armed/IRP, SDRF, Telecommunication) and Sub-Inspector in J&K Home Department. OMR Exam schedule announced for Nov-Dec 2026.',
    ageLimit: '18 - 28 Years (Relaxation up to 30 Years for SC/ST/OBC/RBA & SPO candidates)',
    eligibility: 'Matriculation (10th Pass) for Constable posts; Bachelor Degree for Sub-Inspector. Mandatory Physical Standard & Endurance Tests (PET/PST). Valid J&K Domicile required.',
    totalPosts: '2,302 Posts',
    fees: { genObc: '₹500', scSt: '₹400' },
    officialLink: 'https://jkssb.nic.in/Advertisement.html',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'J&K Home Department (Executive Police)',
        postName: 'Police Constable (Jammu Division Cadre)',
        posts: 934,
        qualification: 'Matriculation (10th Pass) from a recognized Board + PET/PST'
      },
      {
        department: 'J&K Home Department (Executive Police)',
        postName: 'Police Constable (Kashmir Division Cadre)',
        posts: 881,
        qualification: 'Matriculation (10th Pass) from a recognized Board + PET/PST'
      },
      {
        department: 'J&K Home Department (Armed & SDRF)',
        postName: 'Constable (Armed / IRP & SDRF Cadre)',
        posts: 487,
        qualification: 'Matriculation (10th Pass) from a recognized Board + PET/PST'
      }
    ]
  },
  {
    id: 'jkssb-school-teacher-2026',
    title: 'JKSSB Advt 07 of 2026: School Education Dept Teacher Recruitment Drive',
    category: 'jkssb',
    postDate: '15/07/2026',
    lastDate: '30/09/2026',
    advertisementNo: 'Notification No. 07 of 2026',
    shortInfo: 'Mega recruitment drive by JKSSB for 3,288 posts of General Line Teacher, Science & Mathematics Teacher, and Urdu Teacher across all District Cadres in School Education Department J&K.',
    ageLimit: '18 - 40 Years (OM), 18 - 43 Years (SC/ST/RBA/ALC/EWS/OSC)',
    eligibility: 'Bachelor Degree with concerned subjects + B.Ed + CTET / JKTET Qualification. Must be a valid Domicile of UT of Jammu & Kashmir.',
    totalPosts: '3,288 Posts',
    fees: { genObc: '₹500', scSt: '₹400' },
    officialLink: 'https://jkssb.nic.in/Advertisement.html',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'School Education Department',
        postName: 'General Line Teacher (All District Cadres)',
        posts: 1850,
        qualification: 'Graduation Degree in any stream + B.Ed + JKTET / CTET'
      },
      {
        department: 'School Education Department',
        postName: 'Science & Mathematics Teacher',
        posts: 840,
        qualification: 'B.Sc (Physics/Chemistry/Mathematics/Bio) + B.Ed + JKTET / CTET'
      },
      {
        department: 'School Education Department',
        postName: 'Urdu Language Teacher',
        posts: 598,
        qualification: 'Graduation with Urdu as a subject + B.Ed + JKTET'
      }
    ]
  },
  {
    id: 'jkssb-advt-13-2025',
    title: 'JKSSB Advt 13 of 2025: Poshan Supervisor, Stock Asst, Handicrafts Officer & Fisheries',
    category: 'jkssb',
    postDate: '27/01/2026',
    lastDate: '25/02/2026',
    advertisementNo: 'Notification No. 13 of 2025',
    shortInfo: 'JKSSB multi-departmental advertisement for 390 posts including Female Supervisor (Poshan), Stock Assistant, Assistant Handicrafts Training Officer, and Fisheries Development Assistant.',
    ageLimit: 'OM: 18 - 40 Years | SC/ST/RBA/EWS: 18 - 43 Years | PWD: 18 - 42 Years',
    eligibility: '10th / 12th / Diploma / Graduation in Sociology, Home Science, Nutrition, Agriculture, or Fisheries Science depending on specific post.',
    totalPosts: '390 Posts',
    fees: { genObc: '₹500', scSt: '₹400' },
    officialLink: 'https://jkssb.nic.in/Advertisement.html',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Public Works (R&B) Department',
        postName: 'Works Supervisor',
        posts: 121,
        qualification: 'Matriculation (10th Pass) with ITI Trade Certificate'
      },
      {
        department: 'Handicrafts & Handloom Dept',
        postName: 'Asst Handicrafts Training Officer',
        posts: 60,
        qualification: '10+2 with Diploma in Handicrafts / Textile Craft'
      },
      {
        department: 'Animal & Sheep Husbandry Dept',
        postName: 'Stock Assistant',
        posts: 45,
        qualification: '10+2 Science with Stock Assistant Training Certificate'
      },
      {
        department: 'Social Welfare (Poshan) Dept',
        postName: 'Supervisor (Female Candidate Only)',
        posts: 36,
        qualification: 'Graduate Degree in Sociology / Home Science / Nutrition'
      },
      {
        department: 'Fisheries Department J&K',
        postName: 'Fisheries Development Assistant',
        posts: 33,
        qualification: 'B.Sc in Zoology or B.F.Sc (Fisheries Science)'
      },
      {
        department: 'Various Other Departments',
        postName: 'Laboratory Assistant & Caretaker',
        posts: 95,
        qualification: '10+2 / Graduation from recognized Institute'
      }
    ]
  },
  {
    id: 'jkssb-health-med-2026',
    title: 'JKSSB Advt 01 of 2026: Health & Medical Education Staff Nurse, Pharmacist & Lab Tech',
    category: 'jkssb',
    postDate: '25/02/2026',
    lastDate: '25/03/2026',
    advertisementNo: 'Notification No. 01 of 2026',
    shortInfo: 'JKSSB official notification for 239 UT Cadre paramedical and nursing vacancies in Health & Medical Education Department Jammu & Kashmir.',
    ageLimit: '18 - 40 Years (OM), 18 - 43 Years (SC/ST/RBA/ALC/EWS), 18 - 42 Years (PWD)',
    eligibility: 'B.Sc Nursing / GNM Diploma / B.Pharma / Diploma in Medical Lab Technology (DMLT) registered with J&K Paramedical Council. Domicile of J&K UT.',
    totalPosts: '239 Posts',
    fees: { genObc: '₹500', scSt: '₹400' },
    officialLink: 'https://jkssb.nic.in/Advertisement.html',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Health & Medical Education Dept',
        postName: 'Staff Nurse / Junior Nurse (UT Cadre)',
        posts: 98,
        qualification: 'B.Sc Nursing or GNM Diploma from recognized Paramedical Council'
      },
      {
        department: 'Health & Medical Education Dept',
        postName: 'Junior Pharmacist',
        posts: 56,
        qualification: '10+2 with Diploma in Pharmacy registered with J&K Pharmacy Council'
      },
      {
        department: 'Health & Medical Education Dept',
        postName: 'Lab Technician / ECG Technician',
        posts: 45,
        qualification: 'Diploma in Medical Lab Technology (DMLT) or B.Sc MLT'
      },
      {
        department: 'Health & Medical Education Dept',
        postName: 'Medical Record Assistant',
        posts: 40,
        qualification: 'Graduate Degree + Diploma / Certificate in Medical Record Keeping'
      }
    ]
  },
  {
    id: 'jkssb-patwari-2026',
    title: 'JKSSB Revenue Dept Patwari Recruitment (Jammu & Kashmir Division)',
    category: 'jkssb',
    postDate: '15/03/2026',
    lastDate: '25/04/2026',
    advertisementNo: 'Notification No. 03 of 2025-26',
    shortInfo: 'Jammu and Kashmir Services Selection Board recruitment for 142 Revenue Patwari posts across District Cadres of Jammu and Kashmir Divisions.',
    ageLimit: '21 - 40 Years (OM), 21 - 43 Years (SC/ST/RBA/EWS/ALC)',
    eligibility: 'Bachelor Degree in any discipline from a recognized University. Basic computer knowledge. Domicile of J&K.',
    totalPosts: '142 Posts',
    fees: { genObc: '₹500', scSt: '₹400' },
    officialLink: 'https://jkssb.nic.in/Advertisement.html',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Revenue Department (Jammu Division)',
        postName: 'Patwari (District Cadres Jammu)',
        posts: 78,
        qualification: 'Graduate Degree + Computer Knowledge'
      },
      {
        department: 'Revenue Department (Kashmir Division)',
        postName: 'Patwari (District Cadres Kashmir)',
        posts: 64,
        qualification: 'Graduate Degree + Computer Knowledge'
      }
    ]
  },
  {
    id: 'jkssb-jr-assistant-2025',
    title: 'JKSSB Advt 08 of 2025: Junior Assistant & Stenographer Various Depts',
    category: 'jkssb',
    postDate: '20/10/2025',
    lastDate: '25/11/2025 (Skill Test Active 2026)',
    advertisementNo: 'Notification No. 08 of 2025',
    shortInfo: 'JKSSB recruitment notification for 361 posts of Junior Assistant, Junior Scale Stenographer, and Steno-Typist in GAD, Revenue, Finance, and Health Depts.',
    ageLimit: 'OM: 18 - 40 Years | SC/ST/RBA/ALC/EWS: 18 - 43 Years',
    eligibility: 'Graduation Degree from recognized university + Minimum typing speed of 35 WPM on Computer keyboard + 6 months Computer Certificate.',
    totalPosts: '361 Posts',
    fees: { genObc: '₹500', scSt: '₹400' },
    officialLink: 'https://jkssb.nic.in/Advertisement.html',
    isNew: false,
    departmentBreakdown: [
      {
        department: 'General Administration Dept (GAD)',
        postName: 'Junior Assistant (UT Cadre)',
        posts: 185,
        qualification: 'Graduation + 35 WPM Typing Speed + Computer Certificate'
      },
      {
        department: 'Revenue Department J&K',
        postName: 'Junior Assistant (Divisional Cadre)',
        posts: 82,
        qualification: 'Graduation + 35 WPM Typing Speed + Computer Certificate'
      },
      {
        department: 'Finance Department',
        postName: 'Junior Scale Stenographer',
        posts: 54,
        qualification: 'Graduation + 65 WPM Shorthand & 35 WPM Typewriting'
      },
      {
        department: 'Health & Medical Education Dept',
        postName: 'Steno Typist & Junior Assistant',
        posts: 40,
        qualification: 'Graduation + Typing & Shorthand Test'
      }
    ]
  },
  {
    id: 'jkssb-wildlife-guard-2025',
    title: 'JKSSB Forest & Environment Dept Wildlife Guard Recruitment',
    category: 'jkssb',
    postDate: '10/01/2026',
    lastDate: '15/02/2026 (Physical Walk Test Sept 2026)',
    advertisementNo: 'Notification No. 04 of 2025',
    shortInfo: 'JKSSB notification for 108 Wildlife Guard posts in Forest, Ecology & Environment Department Jammu & Kashmir. Physical Walk test starting Sept 2026.',
    ageLimit: '18 - 40 Years (OM), 18 - 43 Years (SC/ST/RBA/EWS)',
    eligibility: 'Matriculation (10th Pass). Physical Standards: Height 163 cm (Male) / 150 cm (Female); 25 KM Physical Walk Test in 4 Hours.',
    totalPosts: '108 Posts',
    fees: { genObc: '₹500', scSt: '₹400' },
    officialLink: 'https://jkssb.nic.in/Advertisement.html',
    isNew: false,
    departmentBreakdown: [
      {
        department: 'Forest, Ecology & Environment Dept',
        postName: 'Wildlife Guard (Jammu Region)',
        posts: 54,
        qualification: '10th Pass (Matriculation) + 25 KM Physical Walk Test'
      },
      {
        department: 'Forest, Ecology & Environment Dept',
        postName: 'Wildlife Guard (Kashmir Region)',
        posts: 54,
        qualification: '10th Pass (Matriculation) + 25 KM Physical Walk Test'
      }
    ]
  },
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

  // ADMISSIONS - KASHMIR UNIVERSITY (kashmiruniversity.net/admission.aspx) & NATIONAL
  {
    id: 'ku-adm-pg-selection-1-2026',
    title: 'Kashmir University PG Admissions 2026 1st Selection List & Counseling Notice (MA, M.Sc, M.Com, MCA)',
    category: 'admissions',
    postDate: '06/08/2026',
    lastDate: '18/08/2026 (Document Verification & Fee Deposition)',
    advertisementNo: 'Notice No. F(PG-Selection-List-1) DAA/KU/26',
    shortInfo: 'Directorate of Admissions & Competitive Examinations provisional 1st selection list and document verification counseling schedule for candidates provisionally selected for Postgraduate programmes (MA, M.Sc, M.Com, MCA) across Main & Satellite Campuses based on KUET 2026 merit.',
    ageLimit: 'No Upper Age Limit as per NEP 2020 Guidelines for Higher Education Admissions.',
    eligibility: 'Candidates provisionally selected in 1st Merit List must bring original Academic Certificates, Provisional / Character Certificates, Category Certificates (if applicable), and KUET 2026 Admit Card for physical verification at respective departments.',
    totalPosts: '2,850 Provisionally Selected Candidates',
    fees: { genObc: '₹750 Processing Fee', scSt: '₹750 Processing Fee' },
    officialLink: 'https://www.kashmiruniversity.net/admission.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'School of Applied Sciences & Technology',
        postName: 'MCA, M.Sc IT, M.Tech 1st Selection List',
        posts: 420,
        qualification: 'Selected in 1st List. Verification Window: Aug 07 to Aug 18, 2026 at Main Campus.'
      },
      {
        department: 'School of Biological & Physical Sciences',
        postName: 'M.Sc Botany, Zoology, Chemistry, Physics 1st Selection List',
        posts: 580,
        qualification: 'Document verification at respective PG Departments from Aug 07 to Aug 18, 2026.'
      },
      {
        department: 'School of Arts, Languages & Social Sciences',
        postName: 'MA English, Urdu, History, Pol Science, M.Com 1st Selection List',
        posts: 1150,
        qualification: 'Document verification & online fee payment deadline: Aug 18, 2026.'
      }
    ]
  },
  {
    id: 'ku-adm-dde-pg-bed-2026',
    title: 'Kashmir University DDE Distance Mode Admission Notification 2026 (MA, M.Com, B.Ed. & PG Diplomas)',
    category: 'admissions',
    postDate: '05/08/2026',
    lastDate: '20/08/2026 (Without Late Fee) / 26/08/2026 (With Late Fee ₹500)',
    advertisementNo: 'Notification No. F(DDE-Distance-Adm) KU/2026',
    shortInfo: 'Directorate of Distance Education (DDE), University of Kashmir invites online application forms for admission to 2-Year MA (English, Urdu, Economics, Education), M.Com, B.Ed (Distance Mode Batch 2026-27), and Post Graduate Diplomas for August Session 2026.',
    ageLimit: 'No Age Limit for Distance Education / Open Learning Admissions.',
    eligibility: 'Bachelor\'s Degree (10+2+3) with minimum 45% marks for Open Merit and 40% for Reserved Categories. For B.Ed Distance Mode: Trained in-service teachers or D.El.Ed/NCTE certificate holders with Graduation.',
    totalPosts: '4,500 Seats',
    fees: { genObc: '₹500 Application Fee', scSt: '₹500 Application Fee' },
    officialLink: 'https://www.kashmiruniversity.net/admission.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Directorate of Distance Education (DDE)',
        postName: 'B.Ed Distance Mode (Batch 2026-27)',
        posts: 1500,
        qualification: 'Graduation (50% OM / 45% Reserved) + Trained In-Service Teacher / D.El.Ed / NCTE recognized face-to-face course.'
      },
      {
        department: 'Directorate of Distance Education (DDE)',
        postName: 'MA English, Urdu, Economics, Education, M.Com',
        posts: 2400,
        qualification: 'Bachelor\'s Degree in relevant discipline with minimum 45% aggregate marks (40% for Reserved categories).'
      },
      {
        department: 'Directorate of Distance Education (DDE)',
        postName: 'PG Diploma in Computer Applications (DCA), Cyber Law, Web Design',
        posts: 600,
        qualification: 'Graduation in any discipline from recognized university.'
      }
    ]
  },
  {
    id: 'ku-adm-phd-research-2026',
    title: 'Kashmir University Ph.D. Research Programme Entrance Exemption & Direct Admission Notice 2026',
    category: 'admissions',
    postDate: '07/08/2026',
    lastDate: '25/08/2026 (Application Window) / 31/08/2026 (Dept Verification)',
    advertisementNo: 'Notification No. F(Ph.D-Admissions) RES/KU/26',
    shortInfo: 'Directorate of Admissions notice inviting online application forms for admission to Ph.D. Research Programmes for CSIR-NET / UGC-NET / GATE / SET qualified candidates across PG Departments of Kashmir University.',
    ageLimit: 'As per UGC Fellowship Regulations; No age limit for self-financed / part-time research scholars.',
    eligibility: 'Master\'s Degree in relevant discipline with at least 55% marks in aggregate or its equivalent Grade \'B\' in UGC 7-point scale (50% for SC/ST/OBC/PWD/EWS). Valid NET/JRF/GATE/SET score mandatory for direct exemption.',
    totalPosts: '320 Research Seats',
    fees: { genObc: '₹500 Application Fee', scSt: '₹500 Application Fee' },
    officialLink: 'https://www.kashmiruniversity.net/admission.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Faculty of Science & Technology',
        postName: 'Ph.D in Physics, Chemistry, Botany, Zoology, Computer Science',
        posts: 120,
        qualification: 'Master\'s Degree with 55% marks + CSIR-NET / GATE / SET qualification certificate.'
      },
      {
        department: 'Faculty of Social Sciences & Humanities',
        postName: 'Ph.D in History, Political Science, Sociology, English, Urdu',
        posts: 130,
        qualification: 'Master\'s Degree in concerned subject with 55% marks + UGC-NET / JRF qualification.'
      },
      {
        department: 'Faculty of Law & Management Studies',
        postName: 'Ph.D in Law, Management Studies, Commerce',
        posts: 70,
        qualification: 'LL.M / MBA / M.Com with 55% marks in aggregate + NET/JRF.'
      }
    ]
  },
  {
    id: 'ku-adm-ballb-2nd-selection-2026',
    title: 'Kashmir University BA-LLB 5-Year Integrated Course 2nd Selection List & Allotment Counseling 2026',
    category: 'admissions',
    postDate: '06/08/2026',
    lastDate: '19/08/2026 (Counseling Verification) / 20/08/2026 (Fee Payment)',
    advertisementNo: 'Notice No. F(BALLB-Selection-List-2) DAA/KU/26',
    shortInfo: 'School of Law Main Campus & Private Affiliated Law Colleges 2nd provisional selection list and document verification counseling notice for 5-Year Integrated BA-LLB course based on merit rank and college options.',
    ageLimit: 'Under 20 Years for Open Merit (22 Years for Reserved Categories) as per Bar Council of India guidelines.',
    eligibility: '10+2 Higher Secondary examination passed with 45% aggregate marks (40% for SC/ST). Provisionally selected candidates must report to Department of Law Main Campus Srinagar with original documents.',
    totalPosts: '180 Law Candidates',
    fees: { genObc: '₹500 Processing Fee', scSt: '₹500 Processing Fee' },
    officialLink: 'https://www.kashmiruniversity.net/admission.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Department of Law (Main Campus Srinagar)',
        postName: '5-Year Integrated BA-LLB (Main Campus)',
        posts: 60,
        qualification: 'Ranked in 2nd Selection List. Physical verification at Main Campus Law Dept: Aug 08 to Aug 19, 2026.'
      },
      {
        department: 'Kashmir Law College & Sopore Law College',
        postName: '5-Year Integrated BA-LLB (Affiliated Colleges)',
        posts: 120,
        qualification: '10+2 with 45% marks. Verification at respective allotted college.'
      }
    ]
  },
  {
    id: 'ku-adm-pg-diploma-2026',
    title: 'Kashmir University 1-Year PG Diploma & Certificate Courses Online Admission Notification 2026',
    category: 'admissions',
    postDate: '05/08/2026',
    lastDate: '22/08/2026',
    advertisementNo: 'Notification No. F(PG-Diploma-Adm) DAA/KU/26',
    shortInfo: 'Kashmir University online application submission for various 1-Year PG Diploma courses (Cyber Law, Web Designing, Data Analytics, Tourism Management) and Language Certificate courses.',
    ageLimit: 'No Upper Age Limit.',
    eligibility: 'Graduation in any discipline from a recognized University with minimum 45% aggregate marks (40% for Reserved categories). Selection purely based on qualifying exam merit.',
    totalPosts: '250 Seats',
    fees: { genObc: '₹500 Application Fee', scSt: '₹500 Application Fee' },
    officialLink: 'https://www.kashmiruniversity.net/admission.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Department of Law',
        postName: 'PG Diploma in Cyber Law & Intellectual Property Rights (DCL)',
        posts: 40,
        qualification: 'Graduate in Law or any discipline with 45% marks.'
      },
      {
        department: 'Department of Computer Sciences',
        postName: 'PG Diploma in Web Designing & Data Analytics (DWD)',
        posts: 50,
        qualification: 'Graduation with 45% marks. Basic computer aptitude.'
      },
      {
        department: 'Department of Management Studies',
        postName: 'PG Diploma in Tourism & Hospitality Management (PGDTHM)',
        posts: 60,
        qualification: 'Bachelor\'s Degree in any field with 45% marks.'
      },
      {
        department: 'Department of Foreign Languages',
        postName: 'Certificate Course in French / German / Russian Language',
        posts: 100,
        qualification: '10+2 / Graduation from recognized board.'
      }
    ]
  },
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
  },

  // EXAM FORMS - KASHMIR UNIVERSITY (kashmiruniversity.net/Examination.aspx)
  {
    id: 'ku-ef-bg-4th-sem-2026',
    title: 'Kashmir University UG BG 4th Semester (NEP 2020 Batch 2024 & CBCS Backlog) Online Exam Form 2026',
    category: 'exam_forms',
    postDate: '06/08/2026',
    startDate: '06/08/2026',
    lastDate: '22/08/2026 (Without Late Fee) / 28/08/2026 (With Late Fee ₹500)',
    advertisementNo: 'Exam Notice No. F(BG-4th-Sem-Exam-Forms) KU/2026',
    shortInfo: 'University of Kashmir Examination Wing official notification for online submission of Examination Forms and fee deposition for BG 4th Semester NEP-2020 Regular (Batch 2024) and CBCS Backlog candidates enrolled across affiliated degree colleges.',
    feePerSubject: '₹250 per Theory Paper + ₹350 Semester EMF + ₹275 per Practical Subject',
    eligibility: 'Enrolled BA, B.Sc, B.Com, BBA, BCA candidates under Kashmir University affiliation having required 75% college attendance or eligible backlog status.',
    totalPosts: '42,000+ Enrolled Students',
    fees: { genObc: '₹250 per paper + ₹350 EMF', scSt: '₹250 per paper + ₹350 EMF' },
    officialLink: 'https://egov.kashmiruniversity.ac.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'School of Arts, Languages & Social Sciences',
        postName: 'BA 4th Sem Regular (Batch 2024) & Backlog Exam Forms',
        posts: '₹250 / Theory Subject',
        qualification: '₹250 per paper + ₹350 Semester Examination Maintenance Fee (EMF) & Hot/Cold Charges.',
        fee: '₹250 per paper'
      },
      {
        department: 'School of Physical & Biological Sciences',
        postName: 'B.Sc 4th Sem Regular (Batch 2024) & Backlog Exam Forms',
        posts: '₹275 / Practical Sub',
        qualification: '₹250 per theory paper + ₹275 per practical paper/viva + ₹350 Semester EMF Fee.',
        fee: '₹275 with Practical'
      },
      {
        department: 'School of Commerce & Computer Applications',
        postName: 'B.Com / BBA / BCA 4th Sem Regular & Backlog Exam Forms',
        posts: '₹250 / Theory Subject',
        qualification: '₹250 per course paper + ₹350 Semester EMF + ₹150 IT Portal Fee.',
        fee: '₹250 per paper'
      }
    ]
  },
  {
    id: 'ku-ef-pg-sem1-3-2026',
    title: 'Kashmir University PG (MA, M.Sc, M.Com, MCA) 1st & 3rd Semester Main & Satellite Campus Online Exam Form 2026',
    category: 'exam_forms',
    postDate: '05/08/2026',
    startDate: '05/08/2026',
    lastDate: '19/08/2026 (Without Late Fee) / 25/08/2026 (With Late Fee ₹500)',
    advertisementNo: 'Exam Notice No. F(PG-Sem1-3-Forms) Exam/KU/26',
    shortInfo: 'Kashmir University Examination Wing notification inviting online examination forms for regular Postgraduate students (MA, M.Sc, M.Com, MCA, LL.B, MSW) appearing for 1st & 3rd Semester examinations across Main, North, South Campuses and Govt PG Colleges.',
    feePerSubject: '₹1,650 Total PG Semester Fee (₹1,000 for single backlog subject)',
    eligibility: 'Regularly enrolled PG students who have completed continuous assessment / internal viva examinations.',
    totalPosts: '5,200 PG Candidates',
    fees: { genObc: '₹1,650 Complete Semester', scSt: '₹1,650 Complete Semester' },
    officialLink: 'https://www.kashmiruniversity.net/Examination.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'School of Applied Sciences & Technology',
        postName: 'MCA, M.Sc IT, M.Tech 1st & 3rd Semester Exam Forms',
        posts: '₹1,650 Total',
        qualification: 'Full semester examination fee ₹1,650 includes lab/practical evaluation charges.',
        fee: '₹1,650 / Semester'
      },
      {
        department: 'School of Biological & Physical Sciences',
        postName: 'M.Sc Botany, Zoology, Chemistry, Physics 1st & 3rd Sem Exam Forms',
        posts: '₹1,650 Total',
        qualification: 'Full semester fee ₹1,650 (₹1,000 for single backlog paper; ₹1,650 for >1 backlog).',
        fee: '₹1,650 / Semester'
      },
      {
        department: 'School of Arts & Social Sciences',
        postName: 'MA English, Urdu, History, Pol Science, M.Com 1st & 3rd Sem Exam Forms',
        posts: '₹1,650 Total',
        qualification: 'Full semester examination fee ₹1,650 including hall ticket and marks card generation.',
        fee: '₹1,650 / Semester'
      }
    ]
  },
  {
    id: 'ku-ef-bed-sem1-2-2026',
    title: 'Kashmir University B.Ed. (2-Year Program) 1st & 2nd Semester (Batch 2025) Online Exam Form 2026',
    category: 'exam_forms',
    postDate: '07/08/2026',
    startDate: '07/08/2026',
    lastDate: '24/08/2026 (Without Late Fee) / 30/08/2026 (Late Fee ₹100/day)',
    advertisementNo: 'Exam Notice No. F(B.Ed-Sem-Forms) Exam/KU/26',
    shortInfo: 'Submission of online examination forms for B.Ed 1st & 2nd Semester candidates (Batch 2025) enrolled in Department of Education Main Campus Srinagar, South Campus, and Private affiliated Colleges of Education.',
    feePerSubject: '₹250 per Subject Paper + ₹900 EMF/Hot & Cold Charges',
    eligibility: 'Eligible candidates admitted to 2-Year B.Ed Programme with minimum required college attendance.',
    totalPosts: '3,800 B.Ed Candidates',
    fees: { genObc: '₹250 per paper + ₹900 EMF', scSt: '₹250 per paper + ₹900 EMF' },
    officialLink: 'https://egov.kashmiruniversity.ac.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Department of Education (Main Campus & South Campus)',
        postName: 'B.Ed 1st & 2nd Semester Regular (Batch-2025)',
        posts: '₹250 / Paper',
        qualification: '₹250 per paper + ₹900 Examination Maintenance Fund (EMF) & Hot/Cold Charges for 2 Semesters.',
        fee: '₹250/paper + ₹900 EMF'
      },
      {
        department: 'Affiliated Private Colleges of Education',
        postName: 'B.Ed 1st & 2nd Semester Private Candidates (Batch-2025)',
        posts: '₹250 / Paper',
        qualification: '₹250 per subject paper + ₹900 EMF + IT portal verification fee.',
        fee: '₹250/paper + ₹900 EMF'
      }
    ]
  },
  {
    id: 'ku-ef-btech-even-sem-2026',
    title: 'Kashmir University Professional B.Tech / B.E. 4th, 6th & 8th Semester Online Exam Form Notice 2026',
    category: 'exam_forms',
    postDate: '06/08/2026',
    startDate: '06/08/2026',
    lastDate: '21/08/2026 (Without Late Fee) / 27/08/2026 (With Late Fee ₹500)',
    advertisementNo: 'Exam Notice No. F(B.Tech-Sem-Forms) Exam/KU/26',
    shortInfo: 'Online examination forms for Bachelor of Technology (B.Tech Engineering) students in Civil, Mechanical, Electrical, Computer Science, and ECE at Institute of Technology Zakura Campus Srinagar, Department of CS, and SSM College of Engineering.',
    feePerSubject: '₹350 per Theory Paper + ₹450 Engineering Infrastructure & IT Fee',
    eligibility: 'B.Tech candidates with mandatory internal sessional clearance and minimum 75% attendance.',
    totalPosts: '2,100 B.Tech Engineers',
    fees: { genObc: '₹350 per paper + ₹450 Infra', scSt: '₹350 per paper + ₹450 Infra' },
    officialLink: 'https://www.kashmiruniversity.net/Examination.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Institute of Technology Zakura Campus',
        postName: 'B.Tech Civil & Mechanical Engineering (4th, 6th, 8th Sem)',
        posts: '₹350 / Paper',
        qualification: '₹350 per theory/practical paper + ₹450 Engineering Lab Maintenance & IT Portal Fee.',
        fee: '₹350/paper'
      },
      {
        department: 'Department of Computer Science (Main Campus)',
        postName: 'B.Tech Computer Science & ECE (4th, 6th, 8th Sem)',
        posts: '₹350 / Paper',
        qualification: '₹350 per paper + ₹450 IT & Sessional Examination Fee.',
        fee: '₹350/paper'
      }
    ]
  },
  {
    id: 'ku-ef-dde-distance-2026',
    title: 'Kashmir University DDE Distance Education MA & B.Ed Term-End Online Exam Form Notice 2026',
    category: 'exam_forms',
    postDate: '05/08/2026',
    startDate: '05/08/2026',
    lastDate: '20/08/2026 (Without Late Fee) / 26/08/2026 (With Late Fee ₹500)',
    advertisementNo: 'Exam Notice No. F(DDE-Exam-Forms) KU/26',
    shortInfo: 'Directorate of Distance Education (DDE) Kashmir University term-end online examination forms for enrolled distance learners in MA (English, Urdu, Economics, Education) and B.Ed distance mode.',
    feePerSubject: '₹300 per Subject Paper + ₹400 DDE Maintenance Fee',
    eligibility: 'Enrolled distance mode students who have submitted internal response assignments.',
    totalPosts: '5,500 Distance Candidates',
    fees: { genObc: '₹300 per paper + ₹400 DDE Fee', scSt: '₹300 per paper + ₹400 DDE Fee' },
    officialLink: 'https://egov.kashmiruniversity.ac.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Directorate of Distance Education (DDE)',
        postName: 'DDE B.Ed Programme Term-End Exam (Batch 2024-25)',
        posts: '₹300 / Paper',
        qualification: '₹300 per subject paper + ₹400 DDE Centre Maintenance & Portal Charges.',
        fee: '₹300/paper'
      },
      {
        department: 'Directorate of Distance Education (DDE)',
        postName: 'DDE MA Programmes (English, Urdu, Economics, Education)',
        posts: '₹300 / Paper',
        qualification: '₹300 per theory paper + ₹400 DDE Examination Hall Fee.',
        fee: '₹300/paper'
      }
    ]
  },

  // CLUSTER UNIVERSITY SRINAGAR (cusrinagar.edu.in)
  {
    id: 'cus-ug-3rd-5th-sem-exam-form-2026',
    title: 'Cluster University Srinagar UG 3rd & 5th Semester NEP-2020 Online Examination Form Notice 2026',
    category: 'cluster_univ',
    postDate: '06/08/2026',
    startDate: '06/08/2026',
    lastDate: '20/08/2026 (Without Late Fee) / 25/08/2026 (With Late Fee ₹500)',
    advertisementNo: 'Notice No. CUS/Exam-Form/UG-3rd-5th-Sem/2026',
    shortInfo: 'Notification issued by Examination Wing of Cluster University Srinagar for online submission of examination forms and deposition of examination fee for UG NEP-2020 & CBCS 3rd and 5th Semester regular and backlog candidates across all 5 constituent colleges.',
    feePerSubject: '₹250 Per Theory Paper + ₹200 Practical Paper + ₹300 Semester EMF Fee',
    eligibility: 'Regularly enrolled UG candidates of Batch 2023 & 2024 who have fulfilled required continuous internal assessment / mid-term tests and minimum 75% college class attendance.',
    ageLimit: 'N/A (Enrolled Undergraduate Students)',
    totalPosts: '18,500+ Enrolled Candidates',
    fees: { genObc: '₹250/paper + ₹300 EMF', scSt: '₹250/paper + ₹300 EMF' },
    officialLink: 'https://www.cusrinagar.edu.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Sri Pratap (SP) College Srinagar',
        postName: 'B.Sc / B.Sc Honors 3rd & 5th Sem Regular & Backlog Exam Forms',
        posts: '₹250 / Theory',
        qualification: '₹250 per theory paper + ₹200 per practical paper + ₹300 Semester Exam Maintenance Fee.',
        fee: '₹250/theory + ₹200/practical'
      },
      {
        department: 'Amar Singh College Srinagar',
        postName: 'B.A. / B.Com 3rd & 5th Sem Regular & Backlog Exam Forms',
        posts: '₹250 / Theory',
        qualification: '₹250 per paper + ₹300 Semester EMF + ₹150 IT Portal charges.',
        fee: '₹250/paper'
      },
      {
        department: 'AAAM Degree College Bemina & GCW MA Road',
        postName: 'BCA / BBA / B.Sc IT 3rd & 5th Sem Exam Forms',
        posts: '₹250 / Theory',
        qualification: '₹250 per course paper + ₹250 lab exam charges + ₹300 Semester EMF.',
        fee: '₹250/paper + ₹250 lab'
      }
    ]
  },
  {
    id: 'cus-pg-integrated-spot-round-2026',
    title: 'Cluster University Srinagar PG & 5-Year Integrated 1st Semester Spot Round Counseling & Online Registration 2026',
    category: 'cluster_univ',
    postDate: '05/08/2026',
    startDate: '05/08/2026',
    lastDate: '18/08/2026 (Document Verification: 19/08/2026 to 22/08/2026)',
    advertisementNo: 'Notice No. CUS/Adm/Spot-Round/2026',
    shortInfo: 'Cluster University Srinagar notification inviting online spot round applications for leftover seats in PG programmes (M.Sc, M.A, M.Com, MCA) and 5-Year Integrated Master Programmes across constituent colleges.',
    feePerSubject: '₹500 Spot Registration Fee',
    eligibility: 'Bachelor Degree (for PG) or 10+2 (for Integrated) with minimum 50% marks (45% for Reserved Categories). Candidates in CUSET/Merit waiting list given priority.',
    ageLimit: 'No Upper Age Limit (As per UGC & NEP-2020 norms)',
    totalPosts: '650 Spot Round Vacant Seats',
    fees: { genObc: '₹500 Registration Fee', scSt: '₹500 Registration Fee' },
    officialLink: 'https://www.cusrinagar.edu.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'School of Sciences (SP College Srinagar)',
        postName: 'M.Sc Physics, Chemistry, Env Science & Integrated B.Sc-M.Sc',
        posts: '180 Spot Seats',
        qualification: 'B.Sc with subject core in all 3 years or 10+2 PCM/PCB with 50% marks.',
        fee: '₹500 Spot Fee'
      },
      {
        department: 'School of Computer Applications (GCW MA Road Srinagar)',
        postName: 'MCA & M.Sc IT Spot Admissions',
        posts: '120 Spot Seats',
        qualification: 'BCA / B.Sc IT / B.Sc with Mathematics at 10+2 or Graduation level.',
        fee: '₹500 Spot Fee'
      },
      {
        department: 'School of Social Sciences & Humanities (AAAM Bemina & AS College)',
        postName: 'M.A. English, Political Science, History & M.Com Spot Round',
        posts: '250 Spot Seats',
        qualification: 'Bachelor Degree in relevant discipline with min 50% aggregate marks.',
        fee: '₹500 Spot Fee'
      }
    ]
  },
  {
    id: 'cus-bed-med-exam-form-2026',
    title: 'Cluster University Srinagar B.Ed & M.Ed 2-Year Program Examination Form & Online Fee Schedule 2026',
    category: 'cluster_univ',
    postDate: '07/08/2026',
    startDate: '07/08/2026',
    lastDate: '24/08/2026 (Late Fee ₹100/day: 25/08/2026 to 28/08/2026)',
    advertisementNo: 'Notice No. CUS/Exam-Form/B.Ed-M.Ed/2026',
    shortInfo: 'Examination form submission notification for B.Ed 1st/3rd Semester and M.Ed 2nd Semester students at Institute of Advanced Studies in Education (IASE Govt College of Education, MA Road Srinagar).',
    feePerSubject: '₹1,200 Semester Examination Fee',
    eligibility: 'Regularly enrolled B.Ed & M.Ed candidates with mandatory 75% attendance and internal practical clearance.',
    ageLimit: 'N/A (Enrolled Teacher Education Students)',
    totalPosts: '450 Candidates',
    fees: { genObc: '₹1,200 Semester Fee', scSt: '₹1,200 Semester Fee' },
    officialLink: 'https://www.cusrinagar.edu.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Govt College of Education (IASE) M.A. Road Srinagar',
        postName: 'B.Ed 1st & 3rd Semester Exam Form',
        posts: '300 Candidates',
        qualification: 'Full semester exam fee ₹1,200 including teaching practice evaluation.',
        fee: '₹1,200/semester'
      },
      {
        department: 'Govt College of Education (IASE) M.A. Road Srinagar',
        postName: 'M.Ed 2nd Semester Exam Form',
        posts: '150 Candidates',
        qualification: 'Full semester exam fee ₹1,200 including dissertation seminar charges.',
        fee: '₹1,200/semester'
      }
    ]
  },
  {
    id: 'cus-ug-1st-sem-self-reg-2026',
    title: 'Cluster University Srinagar UG 1st Semester (Batch 2026) Online Self-Registration & Document Verification Notice',
    category: 'cluster_univ',
    postDate: '06/08/2026',
    startDate: '06/08/2026',
    lastDate: '21/08/2026 (College Physical Verification: 22/08/2026 to 28/08/2026)',
    advertisementNo: 'Notice No. CUS/UG-Batch2026/Self-Reg/2026',
    shortInfo: 'Public notice for newly admitted UG 1st Semester candidates (Batch 2026) to complete online self-registration, roll number generation, and submit original documents at allotted constituent colleges.',
    feePerSubject: '₹350 University Registration & Sports/Cultural Fee',
    eligibility: 'Candidates who have received seat allotment offer letters in CUS UG Admission 2026.',
    ageLimit: 'As per UGC / NEP-2020 Norms',
    totalPosts: '7,200 Admitted Students',
    fees: { genObc: '₹350 Registration Fee', scSt: '₹350 Registration Fee' },
    officialLink: 'https://www.cusrinagar.edu.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'All Constituent Colleges (AS College, SP College, GCW MA Road, AAAM Bemina)',
        postName: 'UG NEP-2020 Batch 2026 Student Portal Registration',
        posts: '7,200 Students',
        qualification: '10+2 Marksheet, Provisional/Character Certificate, Category Certificate (if applicable).',
        fee: '₹350 One-time'
      }
    ]
  },
  {
    id: 'cus-ug-reevaluation-form-2026',
    title: 'Cluster University Srinagar Division of Examination - Online Re-evaluation Form for UG 2nd & 4th Semester Results',
    category: 'cluster_univ',
    postDate: '05/08/2026',
    startDate: '05/08/2026',
    lastDate: '17/08/2026',
    advertisementNo: 'Notice No. CUS/Exam/Reeval-UG24/2026',
    shortInfo: 'Online re-evaluation application notice for students dissatisfied with their recently declared UG 2nd and 4th Semester examination results.',
    feePerSubject: '₹500 Per Paper / Answer Script Re-evaluation',
    eligibility: 'UG 2nd and 4th Semester students whose results were declared on or after July 28, 2026.',
    ageLimit: 'N/A',
    totalPosts: 'Open for all eligible students',
    fees: { genObc: '₹500 Per Paper', scSt: '₹500 Per Paper' },
    officialLink: 'https://www.cusrinagar.edu.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Examination Wing Cluster University Srinagar',
        postName: 'UG 2nd & 4th Sem Re-evaluation Application',
        posts: 'Open Intake',
        qualification: 'Roll Number & Exam Registration ID clearance required.',
        fee: '₹500 / Paper'
      }
    ]
  }
];
