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
  // 🇮🇳 JOIN INDIAN ARMY NOTIFICATIONS (https://www.joinindianarmy.nic.in/default.aspx)
  {
    id: 'army-ssc-tech-68-2026',
    title: 'Indian Army SSC Tech 68th Course (Men & Women) 2026: 380 Officers Posts (April 2027 Entry)',
    category: 'army_jobs',
    postDate: '09/07/2026',
    startDate: '09/07/2026',
    lastDate: '07/08/2026',
    advertisementNo: 'SSC (Tech)-68 Men & SSCW (Tech)-39 Women Course',
    shortInfo: 'Join Indian Army invites online applications from unmarried Male and Female Engineering Graduates, as well as Widows of Defence Personnel, for grant of Short Service Commission (SSC) in the Indian Army Officers Cadre via www.joinindianarmy.nic.in.',
    ageLimit: '20 to 27 Years as on 01/04/2027 (Born between 02/04/2000 and 01/04/2007). Widows of Defence Personnel: Up to 35 Years.',
    eligibility: 'Candidates must have passed Engineering Degree or be in the final year of Engineering Degree in notified streams (Civil, Electrical, Mechanical, CS/IT, ECE, Aeronautical/Aerospace). Final year candidates must finish degree before 01/04/2027.',
    totalPosts: '380 Posts (350 Men, 30 Women + Widows of Defence Personnel)',
    fees: { genObc: '₹0 (No Application Fee)', scSt: '₹0 (No Application Fee)' },
    officialLink: 'https://www.joinindianarmy.nic.in/default.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Corps of Engineers & Combat Engineering Support',
        postName: 'SSC Tech Civil & Building Construction Stream (Men & Women)',
        posts: '105 Posts',
        qualification: 'B.E. / B.Tech in Civil Engineering / Structural / Construction Tech',
        fee: 'Free (₹0)'
      },
      {
        department: 'Corps of Signals & IT/Cyber Operations Division',
        postName: 'SSC Tech Computer Science, IT & Electronics Stream',
        posts: '120 Posts',
        qualification: 'B.E. / B.Tech in Computer Science / IT / ECE / Telecommunication Engg',
        fee: 'Free (₹0)'
      },
      {
        department: 'Corps of Electronics & Mechanical Engineers (EME)',
        postName: 'SSC Tech Mechanical, Electrical & Automobile Stream',
        posts: '125 Posts',
        qualification: 'B.E. / B.Tech in Mechanical / Electrical / Power / Automobile Engineering',
        fee: 'Free (₹0)'
      },
      {
        department: 'Army Aviation, Missile Tech & Miscellaneous Wings',
        postName: 'SSC Tech Aeronautical, Chemical, Production & Widows Entry',
        posts: '30 Posts',
        qualification: 'Engineering Degree in Aeronautical / Production / Chemical or Any Graduation (Widows)',
        fee: 'Free (₹0)'
      }
    ]
  },
  {
    id: 'army-ncc-125-2026',
    title: 'Indian Army NCC Special Entry Scheme 125th Course 2026: 70 Vacancies (April 2027 Entry)',
    category: 'army_jobs',
    postDate: '20/07/2026',
    startDate: '20/07/2026',
    lastDate: '20/08/2026',
    advertisementNo: 'NCC Special Entry Scheme 125th Course (Apr 2027)',
    shortInfo: 'Indian Army invites online applications from unmarried male and female candidates holding NCC Senior Division "C" Certificate and Wards of Battle Casualties for Officers entry through NCC Special Entry 125th Course commencing April 2027 at OTA Chennai.',
    ageLimit: '19 to 25 Years as of 01/01/2027 (Candidates born not earlier than 02/01/2002 and not later than 01/01/2008).',
    eligibility: 'Degree of a recognized University or equivalent with aggregate of minimum 50% marks + NCC "C" Certificate with minimum "B" Grade. (NCC "C" certificate is NOT mandatory for Wards of Battle Casualties of Army Personnel).',
    totalPosts: '70 Posts (63 General Category, 07 Wards of Battle Casualties)',
    fees: { genObc: '₹0 (No Application Fee)', scSt: '₹0 (No Application Fee)' },
    officialLink: 'https://www.joinindianarmy.nic.in/default.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Officers Training Academy (OTA) Chennai - General Male Cadre',
        postName: 'NCC Special Entry (Men - General Category)',
        posts: '56 Posts',
        qualification: 'Graduation Degree with min 50% marks + NCC "C" Certificate with "B" Grade',
        fee: 'Free (₹0)'
      },
      {
        department: 'Officers Training Academy (OTA) Chennai - General Female Cadre',
        postName: 'NCC Special Entry (Women - General Category)',
        posts: '07 Posts',
        qualification: 'Graduation Degree with min 50% marks + NCC "C" Certificate with "B" Grade',
        fee: 'Free (₹0)'
      },
      {
        department: 'Indian Army Wards of Battle Casualties Personnel Entry',
        postName: 'NCC Special Entry (Wards of Battle Casualties - Men & Women)',
        posts: '07 Posts',
        qualification: 'Graduation Degree with min 50% aggregate marks (NCC C-Cert Exempted)',
        fee: 'Free (₹0)'
      }
    ]
  },
  {
    id: 'army-jag-125-2026',
    title: 'Indian Army JAG Entry Scheme 125th Course 2026: Law Graduates Men & Women Officers Entry',
    category: 'army_jobs',
    postDate: '29/07/2026',
    startDate: '29/07/2026',
    lastDate: '17/08/2026',
    advertisementNo: 'JAG Entry Scheme 125th Course (Apr 2027)',
    shortInfo: 'Indian Army invites applications for Short Service Commission (NT) in Judge Advocate General (JAG) Department from unmarried male and female Law Graduates. Selection based on CLAT PG score and SSB Interview at Selection Centres.',
    ageLimit: '21 to 27 Years as of 01/01/2027 (Born not earlier than 02/01/2000 and not later than 01/01/2006).',
    eligibility: 'Minimum 55% aggregate marks in LLB Degree (3 years course after graduation or 5 years integrated after 10+2). Candidate must be eligible for registration as an Advocate with Bar Council of India/State + Must have appeared in CLAT PG 2026.',
    totalPosts: '10 Posts (05 Men, 05 Women)',
    fees: { genObc: '₹0 (No Application Fee)', scSt: '₹0 (No Application Fee)' },
    officialLink: 'https://www.joinindianarmy.nic.in/default.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Judge Advocate General (JAG) Legal Directorate',
        postName: 'JAG Officer (Men Law Graduates)',
        posts: '05 Posts',
        qualification: 'LLB Degree (min 55% marks) + Valid CLAT PG 2026 Score + Bar Council Registration Eligibility',
        fee: 'Free (₹0)'
      },
      {
        department: 'Judge Advocate General (JAG) Legal Directorate',
        postName: 'JAG Officer (Women Law Graduates)',
        posts: '05 Posts',
        qualification: 'LLB Degree (min 55% marks) + Valid CLAT PG 2026 Score + Bar Council Registration Eligibility',
        fee: 'Free (₹0)'
      }
    ]
  },
  {
    id: 'army-tgc-144-2026',
    title: 'Indian Army TGC-144 Course 2026: 144th Technical Graduate Course (January 2027 Batch)',
    category: 'army_jobs',
    postDate: '05/08/2026',
    startDate: '05/08/2026',
    lastDate: '05/09/2026',
    advertisementNo: '144th Technical Graduate Course (TGC-144 Jan 2027)',
    shortInfo: 'Indian Army invites online applications from unmarried Male Engineering Graduates for grant of Permanent Commission in the Indian Army through 144th Technical Graduate Course commencing January 2027 at Indian Military Academy (IMA) Dehradun.',
    ageLimit: '20 to 27 Years as on 01/01/2027 (Born between 02/01/2000 and 01/01/2007).',
    eligibility: 'B.E. / B.Tech Engineering Degree in notified engineering disciplines (Civil, Computer Science, Electrical, Electronics, Mechanical, Architecture) or final year students who can produce degree proof before 01/01/2027.',
    totalPosts: '30 Posts (Permanent Commission at IMA Dehradun)',
    fees: { genObc: '₹0 (No Application Fee)', scSt: '₹0 (No Application Fee)' },
    officialLink: 'https://www.joinindianarmy.nic.in/default.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Indian Military Academy (IMA) Dehradun Engineering Cadre',
        postName: 'TGC-144 Permanent Commission Officer (Civil, CS & Electrical)',
        posts: '18 Posts',
        qualification: 'B.E. / B.Tech Degree in Civil / Computer Science / IT / Electrical Engineering',
        fee: 'Free (₹0)'
      },
      {
        department: 'Indian Military Academy (IMA) Dehradun Engineering Cadre',
        postName: 'TGC-144 Permanent Commission Officer (Mechanical, ECE & Misc)',
        posts: '12 Posts',
        qualification: 'B.E. / B.Tech Degree in Mechanical / Production / Electronics & Comm Engineering',
        fee: 'Free (₹0)'
      }
    ]
  },
  {
    id: 'army-agniveer-rally-2026',
    title: 'Indian Army Agniveer Recruitment Rally 2026 Phase-II: GD, Technical, Clerk, Tradesman & Nursing Asst',
    category: 'army_jobs',
    postDate: '01/08/2026',
    startDate: '01/08/2026',
    lastDate: '15/09/2026',
    advertisementNo: 'Agniveer Recruitment Scheme 2026-27 Phase-II Rallies',
    shortInfo: 'Join Indian Army releases nationwide Agniveer recruitment notifications for General Duty (GD), Technical, Office Assistant / Clerk, Tradesmen (8th & 10th Pass), Tech Nursing Assistant, and Women Military Police across all AROs / ZROs via joinindianarmy.nic.in.',
    ageLimit: 'Agniveer GD/Tech/Clerk/Tradesmen: 17.5 to 21 Years (Born between 01/10/2005 and 01/04/2009). Nursing Asst: 17.5 to 23 Years. Sepoy Pharma: 19 to 25 Years.',
    eligibility: 'Agniveer GD: 10th Pass with 45% aggregate (33% in each subject). Agniveer Tech: 10+2 with PCM & English (min 50% aggregate). Agniveer Clerk/SKT: 10+2 Arts/Comm/Sci with 60% aggregate. Tradesmen: 8th/10th Simple Pass.',
    totalPosts: '25,000+ Vacancies (Pan-India ZRO / ARO Divisions)',
    fees: { genObc: '₹250 (Online Computer Based Examination Fee)', scSt: '₹250 (Online Examination Fee)' },
    officialLink: 'https://www.joinindianarmy.nic.in/default.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'All Zonal Recruitment Offices (ZRO) & Army Recruiting Offices (ARO)',
        postName: 'Agniveer General Duty (GD) - All Arms',
        posts: '15,000+ Posts',
        qualification: 'Class 10th / Matriculation pass with 45% aggregate marks and 33% in each subject',
        fee: '₹250 CEE Fee'
      },
      {
        department: 'Corps of Signals, EME, Artillery & Technical Battalions',
        postName: 'Agniveer Technical & Aviation / Ammunition Examiner',
        posts: '4,500 Posts',
        qualification: '10+2 / Intermediate Pass in Science with Physics, Chemistry, Maths & English (50% marks)',
        fee: '₹250 CEE Fee'
      },
      {
        department: 'Army Ordnance Corps & Supply Depots',
        postName: 'Agniveer Office Assistant / Store Keeper Technical (SKT)',
        posts: '2,500 Posts',
        qualification: '10+2 / Intermediate pass in any stream (Arts, Commerce, Science) with 60% marks',
        fee: '₹250 CEE Fee'
      },
      {
        department: 'Army Medical Corps & Veterinary Cadre',
        postName: 'Soldier Technical Nursing Assistant & Sepoy Pharma',
        posts: '1,200 Posts',
        qualification: '10+2 Science with Physics, Chemistry, Biology & English (50% marks) or D.Pharm',
        fee: '₹250 CEE Fee'
      },
      {
        department: 'Army Support Services & Pioneer Units',
        postName: 'Agniveer Tradesmen (10th Pass & 8th Pass Category)',
        posts: '2,000+ Posts',
        qualification: 'Class 10th or Class 8th Simple Pass with 33% in each subject',
        fee: '₹250 CEE Fee'
      }
    ]
  },
  // 🚆 RAILWAY RECRUITMENT BOARD (RRB) NOTIFICATIONS (https://www.rrbapply.gov.in/)
  {
    id: 'rrb-je-2026',
    title: 'RRB JE 2026 Recruitment: Junior Engineer (JE), DMS & CMA 4,098 Posts (CEN 04/2026)',
    category: 'rrb_jobs',
    postDate: '01/08/2026',
    startDate: '14/08/2026',
    lastDate: '13/09/2026',
    advertisementNo: 'CEN 04/2026 (RRB JE)',
    shortInfo: 'Railway Recruitment Boards (RRB) invite online applications for 4,098 vacancies of Junior Engineer (JE), Depot Material Superintendent (DMS), and Chemical & Metallurgical Assistant (CMA) across all Railway Zones via rrbapply.gov.in portal.',
    ageLimit: '18 to 33 Years as on 01/01/2026 (Age relaxation: OBC 3 Years, SC/ST 5 Years, PwBD 10 Years).',
    eligibility: '3-Year Engineering Diploma or B.E. / B.Tech Degree in relevant discipline (Civil, Electrical, Mechanical, Electronics, Computer Science / IT, Chemical Engineering) from a recognized University/Institute.',
    totalPosts: '4,098 Posts (Pan-India Railway Zones)',
    fees: { genObc: '₹500 (₹400 refunded after CBT-1)', scSt: '₹250 (Full ₹250 refunded after CBT-1)' },
    officialLink: 'https://www.rrbapply.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Indian Railways - Works, Track, P-Way & Bridges',
        postName: 'Junior Engineer (Civil Engineering Cadre)',
        posts: '1,650 Posts',
        qualification: '3-Year Diploma or B.Tech in Civil Engineering from recognized Institute',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Indian Railways - Traction, Locomotives & Power Supply',
        postName: 'Junior Engineer (Electrical & Mechanical Engineering)',
        posts: '1,420 Posts',
        qualification: 'Diploma or B.Tech in Electrical / Mechanical / Production / Automotive Engineering',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Indian Railways - Signal & Telecommunication (S&T)',
        postName: 'Junior Engineer (S&T / IT)',
        posts: '620 Posts',
        qualification: 'Diploma/B.Tech in ECE / CS / IT / Instrumentation Engineering',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Railway Stores & Material Management Cadre',
        postName: 'Depot Material Superintendent (DMS) & CMA',
        posts: '408 Posts',
        qualification: 'Diploma/Degree in Engineering or B.Sc with Physics & Chemistry (min 55% marks)',
        fee: '₹500 / ₹250'
      }
    ]
  },
  {
    id: 'rrb-paramedical-2026',
    title: 'RRB Paramedical Staff 2026: Nursing Superintendent, Pharmacist, Lab Asst & Radiographer (CEN 05/2026)',
    category: 'rrb_jobs',
    postDate: '02/08/2026',
    startDate: '18/08/2026',
    lastDate: '28/09/2026',
    advertisementNo: 'CEN 05/2026 (RRB Paramedical)',
    shortInfo: 'Railway Recruitment Board (RRB) announces recruitment for 600 approved Paramedical staff posts including Nursing Superintendent, Pharmacist, Health Inspector, Radiographer, Lab Technician across Zonal Railway Hospitals via rrbapply.gov.in.',
    ageLimit: 'Nursing Superintendent: 20 to 40 Years | Pharmacist & Lab Asst: 18 to 35 Years as of 01/01/2026 with Govt relaxation norms.',
    eligibility: 'Nursing: B.Sc Nursing / General Nursing & Midwifery (GNM). Pharmacist: B.Pharm / D.Pharm registered with Pharmacy Council. Lab Asst / Radiographer: Diploma/B.Sc in Medical Lab Technology / Radiology.',
    totalPosts: '600 Posts (Zonal Railway Medical Division)',
    fees: { genObc: '₹500 (₹400 refundable)', scSt: '₹250 (Full ₹250 refundable)' },
    officialLink: 'https://www.rrbapply.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Railway Divisional Hospitals & Medical Units',
        postName: 'Nursing Superintendent',
        posts: '372 Posts',
        qualification: 'B.Sc (Nursing) or Registered Nurse and Midwife (GNM) with 3 yrs course from recognized Nursing Council',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Railway Hospital Pharmacies & Health Posts',
        postName: 'Pharmacist Grade III',
        posts: '120 Posts',
        qualification: '10+2 in Science + Diploma in Pharmacy (D.Pharm) or Bachelor in Pharmacy (B.Pharm) & Council Registration',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Railway Sanitation & Health Inspection Wing',
        postName: 'Health & Malaria Inspector Grade II',
        posts: '43 Posts',
        qualification: 'B.Sc in Chemistry/Bio + National Trade Certificate/Diploma in Health Sanitary Inspector',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Railway Hospital Diagnostic Labs & Radiology',
        postName: 'Lab Assistant Gr II, Radiographer & ECG Technician',
        posts: '65 Posts',
        qualification: '10+2 with Science + Diploma in DMLT / Radiography / ECG Technology',
        fee: '₹500 / ₹250'
      }
    ]
  },
  {
    id: 'rrb-alp-2026',
    title: 'RRB Assistant Loco Pilot (ALP) 2026: 11,127 Vacancies for Loco Pilots across Railway Zones (CEN 01/2026)',
    category: 'rrb_jobs',
    postDate: '15/05/2026',
    startDate: '15/05/2026',
    lastDate: '25/08/2026',
    advertisementNo: 'CEN 01/2026 (RRB ALP)',
    shortInfo: 'Railway Recruitment Boards (RRB) conduct nationwide recruitment for 11,127 Assistant Loco Pilots (ALP) in Level-2 (7th CPC) pay scale across all 21 RRB Regional Zones. Active phase-2 portal open on rrbapply.gov.in.',
    ageLimit: '18 to 30 Years as of 01/07/2026 (Relaxation: 3 Years for OBC, 5 Years for SC/ST).',
    eligibility: 'Matriculation / 10th Pass + ITI in Fitter, Electrician, Wireman, Instrument Mechanic, Motor Vehicle Mechanic, Millwright, Tractor Mechanic OR Diploma / B.E. / B.Tech in Mechanical, Electrical, Electronics, Automobile Engg.',
    totalPosts: '11,127 Posts (All 21 RRB Regional Divisions)',
    fees: { genObc: '₹500 (₹400 refunded after CBT-1)', scSt: '₹250 (Fully refunded after CBT-1)' },
    officialLink: 'https://www.rrbapply.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Western Railway, Central Railway & Northern Railway',
        postName: 'Assistant Loco Pilot (Electrical & Diesel Locomotive)',
        posts: '4,850 Posts',
        qualification: '10th + ITI in relevant trade or 3-Year Diploma in Electrical/Mechanical/Automobile Engg',
        fee: '₹500 / ₹250'
      },
      {
        department: 'South Central, Southern & South Eastern Railway',
        postName: 'Assistant Loco Pilot (Loco Running Cadre)',
        posts: '3,920 Posts',
        qualification: 'Matriculation + ITI / Engineering Diploma / Degree in Mechanical/Electrical Streams',
        fee: '₹500 / ₹250'
      },
      {
        department: 'East Central, North Eastern & NF Railway Zones',
        postName: 'Assistant Loco Pilot (Traction Operations)',
        posts: '2,357 Posts',
        qualification: '10th Class Pass with NCVT/SCVT ITI in prescribed trades or B.Tech',
        fee: '₹500 / ₹250'
      }
    ]
  },
  {
    id: 'rrb-technician-2026',
    title: 'RRB Technician Grade I Signal & Grade III 2026: 6,557 Vacancies across All Railway Zones (CEN 02/2026)',
    category: 'rrb_jobs',
    postDate: '30/06/2026',
    startDate: '30/06/2026',
    lastDate: '31/08/2026',
    advertisementNo: 'CEN 02/2026 (RRB Tech)',
    shortInfo: 'Railway Recruitment Boards announce 6,557 Technician Grade I (Signal - Level 5) and Technician Grade III (Level 2) posts in Signal & Telecom, Carriage & Wagon, Electrical Workshop, Track Machine, and Loco Sheds.',
    ageLimit: 'Grade I Signal: 18 to 36 Years | Grade III: 18 to 33 Years as on 01/07/2026 (Age relaxation applicable as per rules).',
    eligibility: 'Grade I Signal: B.Sc in Physics / Electronics / Computer Science / IT / Instrumentation OR B.Tech / Diploma. Grade III: Matriculation / 10th + ITI in Trade OR 10+2 with Physics & Mathematics.',
    totalPosts: '6,557 Posts (Grade I: 323, Grade III: 6,234)',
    fees: { genObc: '₹500 (₹400 refund)', scSt: '₹250 (₹250 refund)' },
    officialLink: 'https://www.rrbapply.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Signal & Telecommunication (S&T) Department',
        postName: 'Technician Grade I (Signal - Level 5)',
        posts: '323 Posts',
        qualification: 'B.Sc / B.Tech / Diploma in Physics, Electronics, CS, IT, Instrumentation Engineering',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Mechanical Workshops, Carriage & Wagon (C&W)',
        postName: 'Technician Grade III (C&W, Workshop, Mechanical)',
        posts: '3,210 Posts',
        qualification: '10th Pass + ITI in Fitter, Welder, Machinist, Turner, Carpenter or Sheet Metal Worker',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Electrical Loco Shed, TRD & Power Supply',
        postName: 'Technician Grade III (Electrical & TRD)',
        posts: '2,024 Posts',
        qualification: '10th Pass + ITI in Electrician, Wireman, Armature Winder, Lineman or 12th with PCM',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Track Machine & Diesel Loco Maintenance Wing',
        postName: 'Technician Grade III (Track Machine & Diesel Shed)',
        posts: '1,000 Posts',
        qualification: '10th Pass + ITI in Mechanic Diesel, Motor Vehicle Mechanic, Fitter',
        fee: '₹500 / ₹250'
      }
    ]
  },
  {
    id: 'rrb-ntpc-2026',
    title: 'RRB NTPC Graduate & Undergraduate Recruitment 2026: Station Master, Goods Train Manager & Clerks (CEN 06/2026 & 07/2026)',
    category: 'rrb_jobs',
    postDate: '10/07/2026',
    startDate: '10/07/2026',
    lastDate: '15/10/2026',
    advertisementNo: 'CEN 06/2026 & CEN 07/2026',
    shortInfo: 'Railway Recruitment Boards conduct NTPC 2026 examination for recruitment of Station Master, Goods Train Manager, Senior Clerk, Junior Account Assistant, Commercial cum Ticket Clerk, and Account Clerk across 21 RRB Regional Zones.',
    ageLimit: 'Graduate Level Posts: 18 to 36 Years | Undergraduate Level Posts: 18 to 33 Years as on 01/01/2026 with relaxation.',
    eligibility: 'Graduate Level: Bachelor Degree in any discipline from a recognized University. Undergraduate Level: 12th Pass (10+2) with at least 50% aggregate marks (50% relaxation for SC/ST/ExSM).',
    totalPosts: '11,926 Posts (Graduate & Undergraduate Cadre)',
    fees: { genObc: '₹500 (₹400 refund)', scSt: '₹250 (Full refund)' },
    officialLink: 'https://www.rrbapply.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Traffic, Operating & Commercial Department',
        postName: 'Station Master & Goods Train Manager (Level 6 & 5)',
        posts: '4,200 Posts',
        qualification: 'Bachelor Degree in any discipline from a recognized University + Computer Based Aptitude Test',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Accounts, Personnel & Commercial Branch',
        postName: 'Senior Clerk cum Typist, Sr Commercial Clerk & JAA',
        posts: '3,800 Posts',
        qualification: 'Graduate Degree in any discipline + English/Hindi Computer Typing Proficiency',
        fee: '₹500 / ₹250'
      },
      {
        department: 'Commercial, Ticket Checking & Accounts Clerical Wing',
        postName: 'Commercial cum Ticket Clerk & Account Clerk (12th Pass Level)',
        posts: '3,926 Posts',
        qualification: '12th Pass (10+2) or equivalent with minimum 50% marks in aggregate',
        fee: '₹500 / ₹250'
      }
    ]
  },
  // 🇮🇳 STAFF SELECTION COMMISSION (SSC) RECRUITMENT NOTIFICATIONS (https://ssc.gov.in/)
  {
    id: 'ssc-cgl-2026',
    title: 'SSC CGL 2026 Recruitment: Combined Graduate Level Group B & C Posts in Govt Ministries',
    category: 'ssc_jobs',
    postDate: '21/05/2026',
    startDate: '21/05/2026',
    lastDate: '25/06/2026',
    advertisementNo: 'SSC/CGL-Exam/2026',
    shortInfo: 'Staff Selection Commission (SSC) invites online applications for Combined Graduate Level (CGL) Examination 2026 to recruit Group B & C Officers across Central Govt Ministries, Departments & Organizations.',
    ageLimit: '18 to 32 Years as on 01/08/2026 (Age relaxation: OBC - 3 yrs, SC/ST - 5 yrs, PwBD - 10 yrs).',
    eligibility: 'Bachelor Degree in any discipline from a recognized University. (Specific degree/maths criteria for JSO & Assistant Audit Officer).',
    totalPosts: '12,256 Posts (Tentative Group B & C Vacancies)',
    fees: { genObc: '₹100', scSt: '₹0 (Exempted for SC/ST/PwD/Women)' },
    officialLink: 'https://ssc.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Indian Audit & Accounts Dept (CAG)',
        postName: 'Assistant Audit Officer / Assistant Accounts Officer (Group B Gazetted)',
        posts: '650+ Posts',
        qualification: 'Bachelor Degree in any discipline. Desirable: CA / CMA / CS / M.Com / MBA Finance',
        fee: '₹100 / Exempted'
      },
      {
        department: 'Central Secretariat Service (CSS) / MEA / IB',
        postName: 'Assistant Section Officer (ASO) (Group B)',
        posts: '1,800+ Posts',
        qualification: 'Bachelor Degree from recognized university + Computer Proficiency Test',
        fee: '₹100 / Exempted'
      },
      {
        department: 'Central Board of Indirect Taxes & Customs (CBIC) / CBDT',
        postName: 'Inspector (Central Excise, Income Tax, Preventive Officer, Examiner)',
        posts: '3,200+ Posts',
        qualification: 'Bachelor Degree in any discipline with requisite physical standards',
        fee: '₹100 / Exempted'
      },
      {
        department: 'Enforcement Directorate (ED) / CBI / NCB',
        postName: 'Assistant Enforcement Officer / Sub Inspector (CBI/NCB)',
        posts: '450+ Posts',
        qualification: 'Bachelor Degree in any subject from a recognized University',
        fee: '₹100 / Exempted'
      },
      {
        department: 'Ministry of Statistics & Programme Implementation (MoSPI)',
        postName: 'Junior Statistical Officer (JSO)',
        posts: '500+ Posts',
        qualification: 'Bachelor Degree with at least 60% marks in Maths at 12th standard or Bachelor Degree with Statistics as subject',
        fee: '₹100 / Exempted'
      }
    ]
  },
  {
    id: 'ssc-chsl-2026',
    title: 'SSC CHSL 2026: Combined Higher Secondary Level (10+2) LDC, JSA & Data Entry Operator (DEO)',
    category: 'ssc_jobs',
    postDate: '30/04/2026',
    startDate: '30/04/2026',
    lastDate: '31/05/2026',
    advertisementNo: 'SSC/CHSL-Exam/2026',
    shortInfo: 'Staff Selection Commission (SSC) conducts CHSL (10+2) Examination 2026 for recruitment of Lower Division Clerk (LDC), Junior Secretariat Assistant (JSA), and Data Entry Operators (DEO) in various Ministries & Departments.',
    ageLimit: '18 to 27 Years as of 01/01/2026 (Relaxation: OBC 3 Years, SC/ST 5 Years, PwD 10 Years).',
    eligibility: 'Must have passed 12th Standard / Senior Secondary examination from a recognized Board. For DEO Grade A in C&AG: 12th in Science stream with Mathematics.',
    totalPosts: '3,712 Posts (Expected National Vacancies)',
    fees: { genObc: '₹100', scSt: '₹0 (Exempted)' },
    officialLink: 'https://ssc.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Various Ministries & Offices of Govt of India',
        postName: 'Lower Division Clerk (LDC) / Junior Secretariat Assistant (JSA)',
        posts: '2,200+ Posts',
        qualification: '12th Class Pass from recognized Board + Typing Speed of 35 wpm in English or 30 wpm in Hindi',
        fee: '₹100 / Exempted'
      },
      {
        department: 'Comptroller & Auditor General of India (CAG)',
        postName: 'Data Entry Operator (DEO Grade A)',
        posts: '450+ Posts',
        qualification: '12th Standard Pass in Science stream with Mathematics as subject + Data Entry Speed Test',
        fee: '₹100 / Exempted'
      },
      {
        department: 'Central Govt Offices & Attached Subordinate Offices',
        postName: 'Data Entry Operator (DEO Pay Level 4 & 5)',
        posts: '1,062 Posts',
        qualification: '12th Class Pass or equivalent + Data Entry Speed 8,000 Key Depressions per hour',
        fee: '₹100 / Exempted'
      }
    ]
  },
  {
    id: 'ssc-mts-2026',
    title: 'SSC MTS & Havaldar 2026: Multi-Tasking Staff (Non-Technical) & Havaldar (CBIC/CBN)',
    category: 'ssc_jobs',
    postDate: '30/06/2026',
    startDate: '30/06/2026',
    lastDate: '31/07/2026',
    advertisementNo: 'SSC/MTS-Havaldar/2026',
    shortInfo: 'Staff Selection Commission (SSC) invites online applications for Multi-Tasking (Non-Technical) Staff (MTS) and Havaldar in Central Board of Indirect Taxes and Customs (CBIC) & Central Bureau of Narcotics (CBN).',
    ageLimit: 'MTS Posts: 18 to 25 Years. Havaldar (CBIC/CBN) & Few MTS Posts: 18 to 27 Years. Age relaxation per Govt rules.',
    eligibility: '10th Class / Matriculation Examination pass or equivalent from a recognized Board of Education.',
    totalPosts: '7,948+ Vacancies Across All India Cadres',
    fees: { genObc: '₹100', scSt: '₹0 (Exempted)' },
    officialLink: 'https://ssc.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Central Board of Indirect Taxes & Customs (CBIC) & CBN',
        postName: 'Havaldar (Pay Level-1)',
        posts: '3,439 Posts',
        qualification: '10th Pass + Physical Efficiency Test (Walking: 1600m in 15 mins for Males, 1km in 20 mins for Females)',
        fee: '₹100 / Exempted'
      },
      {
        department: 'Central Govt Ministries, Union Territories & Constitutional Bodies',
        postName: 'Multi-Tasking Staff (MTS Non-Technical)',
        posts: '4,509 Posts',
        qualification: 'Matriculation (10th Class) Pass from a recognized Board of Education',
        fee: '₹100 / Exempted'
      }
    ]
  },
  {
    id: 'ssc-cpo-2026',
    title: 'SSC CPO 2026: Sub-Inspector in Delhi Police & Central Armed Police Forces (CAPFs)',
    category: 'ssc_jobs',
    postDate: '15/07/2026',
    startDate: '15/07/2026',
    lastDate: '15/08/2026',
    advertisementNo: 'SSC/CPO-SI/2026',
    shortInfo: 'SSC conducts Central Police Organization (CPO) SI Examination 2026 to recruit Sub-Inspectors (Executive) in Delhi Police and Sub-Inspectors (General Duty) in BSF, CISF, CRPF, ITBP & SSB.',
    ageLimit: '20 to 25 Years as on 01/08/2026 (Relaxation: OBC 3 Years, SC/ST 5 Years).',
    eligibility: 'Bachelor Degree in any discipline from a recognized University. For SI in Delhi Police (Male): Valid Driving License for LMV (Motorcycle and Car).',
    totalPosts: '4,187 Posts in Delhi Police & CAPFs',
    fees: { genObc: '₹100', scSt: '₹0 (Exempted)' },
    officialLink: 'https://ssc.gov.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Delhi Police (Executive Cadre)',
        postName: 'Sub-Inspector (Executive) - Male & Female',
        posts: '186 Posts',
        qualification: 'Graduate Degree + Valid LMV Driving License for Male Candidates + Physical Endurance Test',
        fee: '₹100 / Exempted'
      },
      {
        department: 'Border Security Force (BSF) & CISF',
        postName: 'Sub-Inspector (General Duty) - BSF & CISF',
        posts: '1,860 Posts',
        qualification: 'Bachelor Degree in any discipline from recognized University + PST/PET Standard Compliance',
        fee: '₹100 / Exempted'
      },
      {
        department: 'CRPF, ITBP & Sashastra Seema Bal (SSB)',
        postName: 'Sub-Inspector (General Duty) - CRPF/ITBP/SSB',
        posts: '2,141 Posts',
        qualification: 'Graduate Degree from recognized board/university + Physical Standards',
        fee: '₹100 / Exempted'
      }
    ]
  },
  {
    id: 'ssc-steno-2026',
    title: 'SSC Stenographer Grade C & D Examination 2026: Stenographers in Govt Departments',
    category: 'ssc_jobs',
    postDate: '24/04/2026',
    startDate: '24/04/2026',
    lastDate: '15/05/2026',
    advertisementNo: 'SSC/Steno-CD/2026',
    shortInfo: 'Staff Selection Commission (SSC) invites online applications for Stenographer Grade C (Group B Non-Gazetted) and Stenographer Grade D (Group C) in various Ministries & Departments.',
    ageLimit: 'Grade C: 18 to 30 Years | Grade D: 18 to 27 Years as of 01/08/2026 (Age relaxation applicable as per rules).',
    eligibility: 'Passed 12th Standard (10+2) or equivalent from a recognized Board + Shorthand Stenography Test.',
    totalPosts: '1,170 Posts (Grade C: 149, Grade D: 1,021)',
    fees: { genObc: '₹100', scSt: '₹0 (Exempted)' },
    officialLink: 'https://ssc.gov.in/',
    isNew: false,
    departmentBreakdown: [
      {
        department: 'Central Ministries & Armed Forces HQ (AFHQ)',
        postName: 'Stenographer Grade C (Group B Non-Gazetted)',
        posts: '149 Posts',
        qualification: '12th Class Pass + Stenography Dictation 100 wpm (English/Hindi) Speed Test',
        fee: '₹100 / Exempted'
      },
      {
        department: 'Subordinate & Attached Offices across India',
        postName: 'Stenographer Grade D (Group C)',
        posts: '1,021 Posts',
        qualification: '12th Class Pass + Stenography Dictation 80 wpm (English/Hindi) Speed Test',
        fee: '₹100 / Exempted'
      }
    ]
  },
  {
    id: 'ssc-je-2026',
    title: 'SSC Junior Engineer (JE) 2026: Civil, Mechanical & Electrical Engineering Cadre',
    category: 'ssc_jobs',
    postDate: '28/03/2026',
    startDate: '28/03/2026',
    lastDate: '18/04/2026',
    advertisementNo: 'SSC/JE-Engg/2026',
    shortInfo: 'SSC invites online applications for Junior Engineer (Civil, Mechanical & Electrical) Examination 2026 for recruitment in CPWD, CWP&RRS, MES, FBP, and DGQA.',
    ageLimit: 'Up to 30 Years (CPWD/CWP&RRS up to 32 Years) as on 01/08/2026. Age relaxation as per Govt norms.',
    eligibility: 'Degree or 3-Year Diploma in Civil / Electrical / Mechanical Engineering from a recognized University or Institute + 2 Years relevant experience for Diploma holders.',
    totalPosts: '1,767 Posts (Group B Non-Gazetted Technical)',
    fees: { genObc: '₹100', scSt: '₹0 (Exempted)' },
    officialLink: 'https://ssc.gov.in/',
    isNew: false,
    departmentBreakdown: [
      {
        department: 'Central Public Works Department (CPWD)',
        postName: 'Junior Engineer (Civil & Electrical)',
        posts: '820 Posts',
        qualification: 'Diploma or Degree in Civil / Electrical Engineering from recognized university',
        fee: '₹100 / Exempted'
      },
      {
        department: 'Military Engineer Services (MES)',
        postName: 'Junior Engineer (Civil, Electrical & Mechanical)',
        posts: '510 Posts',
        qualification: 'Degree in Engineering or 3-Year Diploma + 2 Years Experience in Planning / Execution',
        fee: '₹100 / Exempted'
      },
      {
        department: 'Central Water Commission (CWC) & FBP',
        postName: 'Junior Engineer (Civil & Mechanical)',
        posts: '437 Posts',
        qualification: 'Degree or Diploma in Civil / Mechanical Engineering',
        fee: '₹100 / Exempted'
      }
    ]
  },
  // 🏛️ NATIONAL TESTING AGENCY (NTA) ACTIVE ENTRANCE EXAM NOTIFICATIONS (https://www.nta.ac.in/)
  {
    id: 'nta-ugc-net-2026',
    title: 'NTA UGC NET June 2026: National Eligibility Test for JRF & Assistant Professor',
    category: 'nta',
    postDate: '29/04/2026',
    startDate: '29/04/2026',
    lastDate: '24/05/2026',
    advertisementNo: 'NTA/UGC-NET/June-2026',
    shortInfo: 'National Testing Agency (NTA) on behalf of UGC invites online applications for UGC NET June 2026 to determine eligibility for Junior Research Fellowship (JRF) & Assistant Professor across 83 subjects in Indian Universities & Colleges.',
    ageLimit: 'JRF: Maximum 30 Years as of 01/06/2026 (5 yrs relaxation for SC/ST/OBC-NCL/Women/PwD). Assistant Professor & Ph.D Admission: No Upper Age Limit.',
    eligibility: 'Master Degree or equivalent in relevant subject with minimum 55% marks (50% for SC/ST/OBC-NCL/PwD/Third Gender). Final year appearing candidates also eligible.',
    totalPosts: '83 Academic Subjects / JRF & Assistant Professor Posts',
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
    id: 'nta-cuet-ug-2026',
    title: 'NTA CUET UG 2026: Common University Entrance Test for Central & Participating Universities Admissions',
    category: 'nta',
    postDate: '02/01/2026',
    startDate: '02/01/2026',
    lastDate: '26/02/2026',
    advertisementNo: 'NTA/CUET-UG/2026',
    shortInfo: 'National Testing Agency (NTA) conducts CUET (UG) 2026 for admission into Undergraduate Programmes in all Central Universities and participating State/Deemed/Private Universities across India.',
    ageLimit: 'No Upper Age Limit set by NTA. Candidates must satisfy university specific age & course eligibility norms.',
    eligibility: 'Passed Class 12th / Senior Secondary examination or appearing in 2026 from any recognized Central / State Board of Education.',
    totalPosts: 'All India Central & Partner Universities UG Seats',
    feePerSubject: 'Up to 3 Subjects: Gen ₹1000, OBC ₹900, SC/ST ₹800 | Additional per subject: Gen ₹400, OBC ₹375, SC/ST ₹350',
    fees: { genObc: '₹1000 (Gen) / ₹900 (OBC)', scSt: '₹800' },
    officialLink: 'https://cuetug.ntaonline.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Language Papers Section 1A & 1B',
        postName: '33 Indian & Foreign Languages Choice',
        posts: 'Open Intake',
        qualification: 'Class 12th Pass or appearing in relevant language stream',
        fee: 'Included in Base Subject Slab'
      },
      {
        department: 'Domain Specific Subjects Section 2',
        postName: '27 Domain Subjects (Science, Commerce, Arts)',
        posts: 'Open Intake',
        qualification: 'Class 12th appearing or passed with relevant domain subject combination',
        fee: 'Included in Base Subject Slab'
      },
      {
        department: 'General Test Section 3',
        postName: 'General Awareness, Reasoning & Numerical Ability',
        posts: 'Open Intake',
        qualification: 'Class 12th Pass / Appearing for General Degree & Professional Courses',
        fee: 'Included in Base Subject Slab'
      }
    ]
  },
  {
    id: 'nta-neet-ug-2026',
    title: 'NTA NEET UG 2026: National Eligibility Cum Entrance Test for MBBS, BDS, BAMS, BHMS & Nursing',
    category: 'nta',
    postDate: '08/02/2026',
    startDate: '08/02/2026',
    lastDate: '08/03/2026',
    advertisementNo: 'NTA/NEET-UG/2026',
    shortInfo: 'National Testing Agency (NTA) conducts NEET (UG) 2026 as the single uniform entrance test for admission to MBBS, BDS, BAMS, BUMS, BHMS, BSMS and B.Sc Nursing courses across all Medical Institutes in India.',
    ageLimit: 'Must have completed Minimum 17 Years of age on or before 31st December 2026. No Upper Age Limit for NEET UG.',
    eligibility: '10+2 / Higher Secondary with Physics, Chemistry, Biology/Biotechnology & English as core subjects with min 50% aggregate marks (40% for SC/ST/OBC, 45% for PwD).',
    totalPosts: '1,00,000+ MBBS/BDS/AYUSH Seats Nationwide',
    feePerSubject: 'General: ₹1700 | General-EWS/OBC-NCL: ₹1600 | SC/ST/PwBD/Third Gender: ₹1000',
    fees: { genObc: '₹1700 (Gen) / ₹1600 (OBC/EWS)', scSt: '₹1000' },
    officialLink: 'https://neet.ntaonline.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'MBBS & Dental Surgery (BDS)',
        postName: 'Bachelor of Medicine & Bachelor of Surgery / Dental',
        posts: '100,000+ All India Seats',
        qualification: '10+2 with PCB & English (50% aggregate for Gen, 40% for SC/ST/OBC)',
        fee: '₹1700 / ₹1600 / ₹1000'
      },
      {
        department: 'AYUSH Medical Degrees (BAMS/BHMS/BUMS)',
        postName: 'Ayurvedic, Homeopathic & Unani Medicine Courses',
        posts: '50,000+ Seats',
        qualification: '10+2 with PCB & English from recognized board',
        fee: '₹1700 / ₹1600 / ₹1000'
      },
      {
        department: 'B.Sc Nursing (Military & Central Institutes)',
        postName: 'B.Sc (Honours) Nursing Programmes',
        posts: '10,000+ Seats',
        qualification: '10+2 Pass with Physics, Chemistry, Biology and English',
        fee: '₹1700 / ₹1600 / ₹1000'
      }
    ]
  },
  {
    id: 'nta-jee-main-2026',
    title: 'NTA JEE Main 2026: Joint Entrance Examination for B.E. / B.Tech, B.Arch & B.Planning (Session 1 & 2)',
    category: 'nta',
    postDate: '01/02/2026',
    startDate: '01/02/2026',
    lastDate: '25/02/2026',
    advertisementNo: 'NTA/JEE-MAIN/2026',
    shortInfo: 'National Testing Agency (NTA) conducts JEE (Main) 2026 for admission to B.E./B.Tech, B.Arch and B.Planning courses at NITs, IIITs, CFTIs and participating State Govt Institutions, and eligibility test for JEE (Advanced).',
    ageLimit: 'No Upper Age Limit for candidates. Candidates must fulfill class 12th passing year criteria (2024, 2025, or 2026).',
    eligibility: 'Class 12th passed in 2024, 2025 or appearing in 2026 with Physics and Mathematics as compulsory subjects along with Chemistry/Biotech/Biology/Technical Vocational subject. 75% marks required in Class 12th (65% for SC/ST) for NIT/IIIT admission.',
    totalPosts: 'All India Engineering & Architecture Seats',
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
    id: 'nta-csir-ugc-net-2026',
    title: 'NTA Joint CSIR UGC NET June 2026: JRF & Lectureship / Assistant Professor in Science & Technology',
    category: 'nta',
    postDate: '01/05/2026',
    startDate: '01/05/2026',
    lastDate: '30/05/2026',
    advertisementNo: 'NTA/CSIR-NET/2026',
    shortInfo: 'NTA conducts Joint CSIR-UGC NET 2026 to determine eligibility for Junior Research Fellowship (JRF) and Lectureship (LS) / Assistant Professor in Science & Technology subjects in Indian Universities.',
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
        qualification: 'M.Sc in Chemical Sciences / Organic / Inorganic / Physical Chemistry with min 55% marks',
        fee: '₹1150 / ₹600 / ₹325'
      },
      {
        department: 'Life Sciences',
        postName: 'CSIR JRF & Lectureship in Biology & Life Sciences',
        posts: 'Open Intake',
        qualification: 'M.Sc in Biochemistry / Biotechnology / Botany / Zoology / Life Sciences with min 55% marks',
        fee: '₹1150 / ₹600 / ₹325'
      },
      {
        department: 'Mathematical & Physical Sciences',
        postName: 'CSIR JRF & Lectureship in Physics & Maths',
        posts: 'Open Intake',
        qualification: 'M.Sc in Physics / Applied Physics / Mathematics / Statistics or B.Tech with 55% marks',
        fee: '₹1150 / ₹600 / ₹325'
      }
    ]
  },
  {
    id: 'nta-cuet-pg-2026',
    title: 'NTA CUET PG 2026: Common University Entrance Test for Post Graduate Admissions',
    category: 'nta',
    postDate: '26/12/2025',
    startDate: '26/12/2025',
    lastDate: '10/02/2026',
    advertisementNo: 'NTA/CUET-PG/2026',
    shortInfo: 'National Testing Agency (NTA) conducts CUET (PG) for admission into Post Graduate Degree / Diploma programmes across Central, State and Participating Universities.',
    ageLimit: 'No Upper Age Limit set by NTA for CUET PG. Candidates must fulfill participating university guidelines.',
    eligibility: 'Bachelor Degree in relevant discipline from a recognized University / Institution with minimum 50% aggregate marks (45% for SC/ST/PwD).',
    totalPosts: 'All India Central Universities Master Degree Seats',
    feePerSubject: 'Up to 2 Papers: Gen ₹1200, OBC ₹1000, SC/ST ₹900 | Additional Paper: Gen ₹600, OBC/SC/ST ₹500',
    fees: { genObc: '₹1200 (Gen) / ₹1000 (OBC)', scSt: '₹900' },
    officialLink: 'https://pgcuet.samarth.ac.in/',
    isNew: false,
    departmentBreakdown: [
      {
        department: 'Post Graduate Science Stream',
        postName: 'M.Sc Programmes (Physics, Chemistry, Maths, Bio)',
        posts: 'Central Univ Seats',
        qualification: 'B.Sc in relevant major subject with minimum 50% marks',
        fee: '₹1200 / ₹1000 / ₹900'
      },
      {
        department: 'Humanities & Social Sciences PG',
        postName: 'M.A. Programmes (English, History, Pol Sc, Econ)',
        posts: 'Central Univ Seats',
        qualification: 'Bachelor Degree B.A. or equivalent with 50% aggregate marks',
        fee: '₹1200 / ₹1000 / ₹900'
      },
      {
        department: 'Commerce & Management PG',
        postName: 'M.Com & MBA Master Degree Programmes',
        posts: 'Central Univ Seats',
        qualification: 'B.Com / BBA / Graduate Degree in any discipline with min 50% marks',
        fee: '₹1200 / ₹1000 / ₹900'
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
    id: 'ku-adm-pg-kuet-2026',
    title: 'Kashmir University KUET PG Admission Notification 2026 (MA, M.Sc, M.Com, MCA, LL.B, M.Tech, MBA)',
    category: 'admissions',
    postDate: '09/06/2026',
    lastDate: '30/06/2026 (Entrance Exam Conducted July-Aug 2026)',
    advertisementNo: 'Notification No. F(PG-Admissions) DAA/KU/26',
    shortInfo: 'University of Kashmir official notification inviting online applications from eligible candidates for Kashmir University Entrance Test (KUET 2026) for admission into 2-Year & 1-Year Master\'s Programmes, 3-Year LL.B., M.Tech, and MCA across Main Campus Srinagar, South Campus Anantnag, North Campus Baramulla, and Affiliated Colleges.',
    ageLimit: 'No Upper Age Limit as per NEP 2020 Guidelines for Higher Education Admissions.',
    eligibility: 'Bachelor\'s Degree (10+2+3 pattern) in relevant discipline from a recognized University with minimum 55% aggregate marks for Open Merit (50% for SC/ST/OBC/RBA/ALC/PWD) or at least 24 credits in Core/Generic Electives in concerned subject at UG level.',
    totalPosts: '4,250 Seats (Main & Satellite Campuses)',
    fees: { genObc: '₹750', scSt: '₹750' },
    officialLink: 'https://www.kashmiruniversity.net/admission.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'School of Applied Sciences & Technology',
        postName: 'MCA, M.Sc IT, M.Tech, M.Pharm, M.Sc Food Technology',
        posts: 480,
        qualification: 'BCA / B.Sc Computer Science / B.Tech / B.Pharm / B.Sc Food Tech with 55% aggregate marks (50% for reserved categories).'
      },
      {
        department: 'School of Biological Sciences',
        postName: 'M.Sc Botany, Zoology, Biotechnology, Biochemistry, Clinical Biochemistry, Bioresources',
        posts: 360,
        qualification: 'B.Sc with concerned biological subject as Core Course (24 credits minimum) with 55% aggregate marks.'
      },
      {
        department: 'School of Physical & Mathematical Sciences',
        postName: 'M.Sc Physics, Chemistry, Mathematics, Statistics',
        posts: 320,
        qualification: 'B.Sc / BA with Physics / Chemistry / Mathematics / Statistics as Core subject with minimum 55% aggregate.'
      },
      {
        department: 'School of Earth & Environmental Sciences',
        postName: 'M.Sc Earth Sciences, Geo-Informatics, Environmental Science, Geography',
        posts: 280,
        qualification: 'B.Sc / BA with Earth Science / Geology / Environmental Science / Geography with 55% aggregate marks.'
      },
      {
        department: 'School of Arts, Languages & Literature',
        postName: 'MA English, Kashmiri, Urdu, Arabic, Persian, Hindi, Linguistics',
        posts: 620,
        qualification: 'Graduation in any discipline / BA with concerned language subject (24 credits) with 55% marks.'
      },
      {
        department: 'School of Social Sciences',
        postName: 'MA History, Political Science, Sociology, Social Work (MSW), MERC Mass Comm, MLIS',
        posts: 740,
        qualification: 'Bachelor\'s Degree in any discipline with minimum 55% aggregate marks (Open eligibility for MSW, MERC, MLIS).'
      },
      {
        department: 'School of Law & Business Studies',
        postName: 'LL.B 3-Year, LL.M, MBA, M.Com, MTTM (Tourism)',
        posts: 850,
        qualification: 'Graduation in any stream with 55% marks for LL.B / MBA (Valid CMAT score required) / M.Com.'
      }
    ]
  },
  {
    id: 'ku-adm-bed-regular-2026',
    title: 'Kashmir University B.Ed. Regular Admission Notification 2026-27 (Main Campus, South Campus & Affiliated Colleges)',
    category: 'admissions',
    postDate: '02/07/2026',
    lastDate: '24/07/2026',
    advertisementNo: 'Notification No. F(B.Ed-Regular) DAA/KU/26',
    shortInfo: 'Kashmir University official admission notice for 2-Year Regular Bachelor of Education (B.Ed.) Programme for academic session 2026-27 offered at Department of Education Main Campus, South Campus Anantnag, and affiliated Private Govt-recognized Colleges of Education.',
    ageLimit: 'Minimum 20 Years. No Upper Age Limit for in-service graduate teachers.',
    eligibility: 'Bachelor Degree (10+2+3 pattern) in BA, B.Sc, B.Com, B.B.A, B.C.A or B.Tech with at least 50% marks for Open Merit and 45% for Reserved Categories (SC/ST/OBC/RBA/ALC/PWD), OR Master\'s Degree with 55% marks.',
    totalPosts: '3,200 Seats',
    fees: { genObc: '₹800', scSt: '₹800' },
    officialLink: 'https://www.kashmiruniversity.net/admission.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Department of Education (Main Campus Srinagar)',
        postName: 'B.Ed 2-Year Regular (University Main Campus)',
        posts: 100,
        qualification: 'Bachelor\'s / Master\'s Degree with minimum 50% marks (45% for Reserved categories). Merit based on qualifying exam.'
      },
      {
        department: 'South Campus Anantnag Education Dept',
        postName: 'B.Ed 2-Year Regular (South Campus)',
        posts: 50,
        qualification: 'Graduation with 50% marks (45% for SC/ST/RBA/ALC/PWD).'
      },
      {
        department: 'Affiliated Private Colleges of Education (Kashmir Valley)',
        postName: 'B.Ed 2-Year Regular (Affiliated B.Ed Colleges)',
        posts: 3050,
        qualification: 'Bachelor\'s / Master\'s Degree in Arts/Science/Commerce with 50% marks (45% for Reserved Categories).'
      }
    ]
  },
  {
    id: 'ku-adm-dde-pg-bed-2026',
    title: 'Kashmir University DDE Distance Mode Admission Notification 2026 (MA, M.Com, B.Ed. & PG Diplomas)',
    category: 'admissions',
    postDate: '29/07/2026',
    lastDate: '15/08/2026',
    advertisementNo: 'Notification No. F(DDE-Distance-Adm) KU/2026',
    shortInfo: 'Directorate of Distance Education (DDE), University of Kashmir invites online application forms for admission to 2-Year MA (English, Urdu, Economics, Education), M.Com, B.Ed (Distance Mode Batch 2025-26), and Post Graduate Diplomas for July Session 2026.',
    ageLimit: 'No Age Limit for Distance Education / Open Learning Admissions.',
    eligibility: 'Bachelor\'s Degree (10+2+3) with minimum 45% marks for Open Merit and 40% for Reserved Categories. For B.Ed Distance Mode: Trained in-service teachers or D.El.Ed/NCTE certificate holders with Graduation.',
    totalPosts: '4,500 Seats',
    fees: { genObc: '₹500', scSt: '₹500' },
    officialLink: 'https://www.kashmiruniversity.net/admission.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Directorate of Distance Education (DDE)',
        postName: 'B.Ed Distance Mode (Batch 2025-26)',
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
    id: 'ku-adm-phd-research-2025-26',
    title: 'Kashmir University Ph.D. Research Programme Admission Notification 2025-26 (Cycle I & II)',
    category: 'admissions',
    postDate: '01/10/2025',
    lastDate: '15/10/2025 (Next Entrance Cycle Open)',
    advertisementNo: 'Notification No. F(Ph.D-Admissions) RES/KU/25-26',
    shortInfo: 'Official advertisement for admission to Ph.D. Research Programmes across various Faculties & Post-Graduate Departments of University of Kashmir for Academic Sessions 2025-2026.',
    ageLimit: 'As per UGC Fellowship Regulations; No age limit for self-financed / part-time research scholars.',
    eligibility: 'Master\'s Degree in relevant discipline with at least 55% marks in aggregate or its equivalent Grade \'B\' in UGC 7-point scale (50% for SC/ST/OBC/PWD/EWS). NET/JRF/GATE/SET qualified candidates exempted from entrance test.',
    totalPosts: '300 Seats',
    fees: { genObc: '₹500', scSt: '₹500' },
    officialLink: 'https://www.kashmiruniversity.net/admission.aspx',
    isNew: false,
    departmentBreakdown: [
      {
        department: 'Faculty of Science & Technology',
        postName: 'Ph.D in Physics, Chemistry, Botany, Zoology, Computer Science',
        posts: 110,
        qualification: 'Master\'s Degree with 55% marks (50% for Reserved Categories) or M.Phil / CSIR-NET / GATE.'
      },
      {
        department: 'Faculty of Social Sciences & Humanities',
        postName: 'Ph.D in History, Political Science, Sociology, English, Urdu',
        posts: 120,
        qualification: 'Master\'s Degree in concerned subject with 55% marks + UGC-NET/JRF or KU Research Entrance Test.'
      },
      {
        department: 'Faculty of Law & Management Studies',
        postName: 'Ph.D in Law, Management Studies, Commerce',
        posts: 70,
        qualification: 'LL.M / MBA / M.Com with 55% marks in aggregate.'
      }
    ]
  },
  {
    id: 'ku-adm-intg-bed-med-2026',
    title: 'Kashmir University Integrated B.Ed-M.Ed 3-Year Special Admission Notification 2026',
    category: 'admissions',
    postDate: '10/06/2026',
    lastDate: '05/07/2026',
    advertisementNo: 'Notification No. F(Intg-BEd-MEd) DAA/KU/26',
    shortInfo: 'Admission notification for 3-Year Integrated B.Ed.-M.Ed. Programme under Choice Based Credit System (CBCS) at Department of Education, Main Campus Srinagar for session 2026.',
    ageLimit: '18 - 35 Years for General Open Merit; Up to 38 Years for Reserved Categories.',
    eligibility: 'Post Graduation (Master\'s Degree) in Science, Social Science, or Humanities from a recognized University with at least 55% marks in aggregate or equivalent grade.',
    totalPosts: '50 Seats',
    fees: { genObc: '₹750', scSt: '₹750' },
    officialLink: 'https://www.kashmiruniversity.net/admission.aspx',
    isNew: false,
    departmentBreakdown: [
      {
        department: 'Department of Education (Main Campus Srinagar)',
        postName: '3-Year Integrated B.Ed.-M.Ed. Programme',
        posts: 50,
        qualification: 'Master\'s Degree in Science/Social Science/Humanities with 55% marks (50% for SC/ST/PWD). Merit based on Entrance Test.'
      }
    ]
  },
  {
    id: 'ku-adm-pg-diploma-2026',
    title: 'Kashmir University PG Diploma & Certificate Courses Admission Notification 2026',
    category: 'admissions',
    postDate: '03/08/2026',
    lastDate: '25/08/2026',
    advertisementNo: 'Notification No. F(PG-Diploma-Adm) DAA/KU/26',
    shortInfo: 'Kashmir University online application submission for various 1-Year PG Diploma courses (Cyber Law, Web Designing, Data Analytics, Tourism Management) and Language Certificate courses.',
    ageLimit: 'No Upper Age Limit.',
    eligibility: 'Graduation in any discipline from a recognized University with minimum 45% aggregate marks (40% for Reserved categories). Selection purely based on qualifying exam merit.',
    totalPosts: '250 Seats',
    fees: { genObc: '₹500', scSt: '₹500' },
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
    id: 'ku-ef-bg-semesters-2026',
    title: 'Kashmir University UG BG (1st, 2nd, 3rd, 4th, 5th & 6th Sem) Regular / Backlog Online Exam Form 2026',
    category: 'exam_forms',
    postDate: '16/12/2025',
    startDate: '16/12/2025 (Phase I) / 12/01/2026 (NEP Backlog)',
    lastDate: '18/01/2026 (Without Late Fee) / 25/01/2026 (With Late Fee)',
    advertisementNo: 'Exam Notice No. F(BG-Sem-Exam-Forms) KU/2026',
    shortInfo: 'University of Kashmir Examination Wing official notification for online submission of Examination Forms for BG (Undergraduate) Choice Based Credit System (CBCS) and NEP 2020 1st to 6th Semester Regular, Private & Backlog candidates enrolled across affiliated degree colleges.',
    feePerSubject: '₹250 per Theory Paper + ₹350 Semester EMF + ₹275 per Practical Subject',
    eligibility: 'Candidates enrolled in BA, B.Sc, B.Com, BBA, BCA, B.Sc IT under Kashmir University affiliation having required 75% attendance or eligible backlog status.',
    totalPosts: '65,000+ Enrolled Students',
    fees: { genObc: '₹250 per paper + ₹350 EMF', scSt: '₹250 per paper + ₹350 EMF' },
    officialLink: 'https://www.kashmiruniversity.net/Examination.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'School of Arts, Languages & Literature',
        postName: 'BA 1st - 6th Sem (English, Kashmiri, Urdu, Arabic, Persian)',
        posts: '₹250 / Theory Subject',
        qualification: '₹250 per paper + ₹350 Semester Examination Maintenance Fee (EMF) & Hot/Cold Charges.',
        fee: '₹250 per paper'
      },
      {
        department: 'School of Physical & Biological Sciences',
        postName: 'B.Sc 1st - 6th Sem (Physics, Chemistry, Botany, Zoology, Biotech)',
        posts: '₹275 / Practical Sub',
        qualification: '₹250 per theory paper + ₹275 per practical paper/viva + ₹350 Semester EMF Fee.',
        fee: '₹275 with Practical'
      },
      {
        department: 'School of Social Sciences',
        postName: 'BA 1st - 6th Sem (History, Political Science, Sociology, Economics)',
        posts: '₹250 / Theory Subject',
        qualification: '₹250 per subject paper + ₹350 Examination Maintenance & IT Service Fee.',
        fee: '₹250 per paper'
      },
      {
        department: 'School of Commerce & Computer Applications',
        postName: 'B.Com / BBA / BCA / B.Sc IT (1st to 6th Semesters)',
        posts: '₹250 / Theory Subject',
        qualification: '₹250 per course paper + ₹350 Semester EMF + ₹150 Annual IT Portal Fee.',
        fee: '₹250 per paper'
      },
      {
        department: 'School of Earth & Environmental Sciences',
        postName: 'B.Sc 1st - 6th Sem (Geography, Geology, Disaster Management)',
        posts: '₹275 / Practical Sub',
        qualification: '₹250 theory + ₹275 practical paper + ₹350 EMF Fee.',
        fee: '₹275 with Practical'
      }
    ]
  },
  {
    id: 'ku-ef-bed-sem-2026',
    title: 'Kashmir University B.Ed. 1st/2nd Sem (Batch 2024) & 3rd/4th Sem (Batch 2023) Online Examination Form 2026',
    category: 'exam_forms',
    postDate: '17/10/2025',
    startDate: '17/10/2025',
    lastDate: '23/10/2025 (Extended up to 30/10/2025)',
    advertisementNo: 'Exam Notice No. F(B.Ed-Sem-Forms) Exam/KU/25',
    shortInfo: 'Submission of online examination forms for B.Ed 1st, 2nd, 3rd and 4th Semester candidates enrolled in Department of Education Main Campus Srinagar, South Campus, and Private affiliated Colleges of Education.',
    feePerSubject: '₹250 per Subject Paper + ₹900 EMF/Hot & Cold Charges + ₹750 Degree Certificate Fee',
    eligibility: 'Eligible candidates admitted to 2-Year B.Ed Programme with minimum required college attendance.',
    totalPosts: '3,500+ B.Ed Candidates',
    fees: { genObc: '₹250 per paper + ₹900 EMF', scSt: '₹250 per paper + ₹900 EMF' },
    officialLink: 'https://www.kashmiruniversity.net/Examination.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Department of Education (Main Campus & South Campus)',
        postName: 'B.Ed 1st & 2nd Semester Regular (Batch-2024)',
        posts: '₹250 / Paper',
        qualification: '₹250 per paper + ₹900 Examination Maintenance Fund (EMF) & Hot/Cold Charges for 2 Semesters.',
        fee: '₹250/paper + ₹900 EMF'
      },
      {
        department: 'Affiliated Private Colleges of Education',
        postName: 'B.Ed 3rd & 4th Semester Regular (Batch-2023)',
        posts: '₹250 / Paper',
        qualification: '₹250 per subject paper + ₹900 EMF + ₹750 Degree Certificate Fee (Final Semester).',
        fee: '₹250/paper + ₹750 Degree'
      }
    ]
  },
  {
    id: 'ku-ef-pg-master-2026',
    title: 'Kashmir University Postgraduate (PG) 1st & 3rd Semester Main & Satellite Campus Online Exam Form 2026',
    category: 'exam_forms',
    postDate: '05/01/2026',
    startDate: '05/01/2026',
    lastDate: '20/01/2026',
    advertisementNo: 'Exam Notice No. F(PG-Sem1-3-Forms) Exam/KU/26',
    shortInfo: 'Kashmir University Examination Wing notification inviting online examination forms for regular Postgraduate students (MA, M.Sc, M.Com, MCA, LL.B, MSW, MLIS) appearing for 1st & 3rd Semester examinations across Main, North, South Campuses and Govt PG Colleges.',
    feePerSubject: '₹1,650 Total PG Semester Fee (₹1,000 for single backlog subject)',
    eligibility: 'Regularly enrolled PG students who have completed continuous assessment / internal viva examinations.',
    totalPosts: '4,800 PG Candidates',
    fees: { genObc: '₹1,650 Complete Semester', scSt: '₹1,650 Complete Semester' },
    officialLink: 'https://www.kashmiruniversity.net/Examination.aspx',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'School of Applied Sciences & Technology',
        postName: 'MCA, M.Sc IT, M.Tech 1st & 3rd Semester',
        posts: '₹1,650 Total',
        qualification: 'Full semester examination fee ₹1,650 includes lab/practical evaluation charges.',
        fee: '₹1,650 / Semester'
      },
      {
        department: 'School of Biological & Physical Sciences',
        postName: 'M.Sc Botany, Zoology, Chemistry, Physics 1st & 3rd Sem',
        posts: '₹1,650 Total',
        qualification: 'Full semester fee ₹1,650 (₹1,000 for single backlog paper; ₹1,650 for >1 backlog).',
        fee: '₹1,650 / Semester'
      },
      {
        department: 'School of Arts, Languages & Social Sciences',
        postName: 'MA English, Urdu, History, Pol Science, MSW, MERC 1st & 3rd Sem',
        posts: '₹1,650 Total',
        qualification: 'Full semester examination fee ₹1,650 including hall ticket and marks card generation.',
        fee: '₹1,650 / Semester'
      },
      {
        department: 'School of Law & Business Studies',
        postName: 'LL.B 3-Year, LL.M, MBA, M.Com 1st & 3rd Semester',
        posts: '₹1,650 Total',
        qualification: 'Full semester fee ₹1,650 for regular candidates.',
        fee: '₹1,650 / Semester'
      }
    ]
  },
  {
    id: 'ku-ef-btech-sem-2026',
    title: 'Kashmir University B.Tech / B.E. 3rd, 5th & 7th Semester Regular / Backlog Examination Form 2026',
    category: 'exam_forms',
    postDate: '10/02/2026',
    startDate: '10/02/2026',
    lastDate: '25/02/2026',
    advertisementNo: 'Exam Notice No. F(B.Tech-Sem-Forms) Exam/KU/26',
    shortInfo: 'Online examination forms for Bachelor of Technology (B.Tech Engineering) students in Civil, Mechanical, Electrical, Computer Science, and ECE at Institute of Technology Zakura Campus Srinagar, Department of CS, and SSM College of Engineering.',
    feePerSubject: '₹350 per Theory Paper + ₹450 Engineering Infrastructure & IT Fee',
    eligibility: 'B.Tech candidates with mandatory internal sessional clearance and attendance.',
    totalPosts: '1,800 B.Tech Engineers',
    fees: { genObc: '₹350 per paper + ₹450 Infra', scSt: '₹350 per paper + ₹450 Infra' },
    officialLink: 'https://www.kashmiruniversity.net/Examination.aspx',
    isNew: false,
    departmentBreakdown: [
      {
        department: 'Institute of Technology Zakura Campus',
        postName: 'B.Tech Civil & Mechanical Engineering (3rd, 5th, 7th Sem)',
        posts: '₹350 / Paper',
        qualification: '₹350 per theory/practical paper + ₹450 Engineering Lab Maintenance & IT Portal Fee.',
        fee: '₹350/paper'
      },
      {
        department: 'Department of Computer Science (Main Campus)',
        postName: 'B.Tech Computer Science & ECE (3rd, 5th, 7th Sem)',
        posts: '₹350 / Paper',
        qualification: '₹350 per paper + ₹450 IT & Sessional Examination Fee.',
        fee: '₹350/paper'
      },
      {
        department: 'SSM College of Engineering Parihaspora',
        postName: 'B.Tech Electrical & Civil Engg (3rd, 5th, 7th Sem)',
        posts: '₹350 / Paper',
        qualification: '₹350 per paper + ₹450 University Infrastructure Fee.',
        fee: '₹350/paper'
      }
    ]
  },
  {
    id: 'ku-ef-mbbs-bds-2026',
    title: 'Kashmir University MBBS & BDS Professional Phase I, II & Final Year Exam Form Notice 2026',
    category: 'exam_forms',
    postDate: '01/03/2026',
    startDate: '01/03/2026',
    lastDate: '15/03/2026',
    advertisementNo: 'Exam Notice No. F(MBBS-BDS-Exam-Forms) KU/26',
    shortInfo: 'Annual examination form submission for MBBS and BDS professional medical students at Govt Medical College (GMC Srinagar), GMC Anantnag, GMC Baramulla, and Govt Dental College (GDC Srinagar).',
    feePerSubject: '₹1,300 Minimum Course Paper Fee + ₹500 Practical & Clinical Viva Fee',
    eligibility: 'Enrolled medical & dental students with certified clinical logbooks and attendance certificates.',
    totalPosts: '1,200 Medical Students',
    fees: { genObc: '₹1,300 Course Fee + ₹500 Practical', scSt: '₹1,300 Course Fee + ₹500 Practical' },
    officialLink: 'https://www.kashmiruniversity.net/Examination.aspx',
    isNew: false,
    departmentBreakdown: [
      {
        department: 'Govt Medical College (GMC Srinagar)',
        postName: 'MBBS Professional Phase I, II & Final Phase',
        posts: '₹1,300 Course',
        qualification: '₹1,300 minimum course fee + ₹500 clinical viva / practical examination fee.',
        fee: '₹1,300 + ₹500'
      },
      {
        department: 'Govt Dental College (GDC Srinagar)',
        postName: 'BDS 1st, 2nd, 3rd & 4th Professional Year',
        posts: '₹1,300 Course',
        qualification: '₹1,300 course paper fee + ₹500 dental clinical evaluation fee.',
        fee: '₹1,300 + ₹500'
      },
      {
        department: 'GMC Anantnag & GMC Baramulla',
        postName: 'MBBS 1st & 2nd Professional Phase',
        posts: '₹1,300 Course',
        qualification: '₹1,300 course fee + ₹500 practical exam fee.',
        fee: '₹1,300 + ₹500'
      }
    ]
  },
  {
    id: 'ku-ef-dde-distance-2026',
    title: 'Kashmir University DDE Distance Education MA & B.Ed Term-End Online Exam Form 2026',
    category: 'exam_forms',
    postDate: '01/04/2026',
    startDate: '01/04/2026',
    lastDate: '20/04/2026',
    advertisementNo: 'Exam Notice No. F(DDE-Exam-Forms) KU/26',
    shortInfo: 'Directorate of Distance Education (DDE) Kashmir University term-end online examination forms for enrolled distance learners in MA (English, Urdu, Economics, Education) and B.Ed distance mode.',
    feePerSubject: '₹300 per Subject Paper + ₹400 DDE Maintenance Fee',
    eligibility: 'Enrolled distance mode students who have submitted internal response assignments.',
    totalPosts: '5,000 Distance Candidates',
    fees: { genObc: '₹300 per paper + ₹400 DDE Fee', scSt: '₹300 per paper + ₹400 DDE Fee' },
    officialLink: 'https://www.kashmiruniversity.net/Examination.aspx',
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
    id: 'cus-ug-integrated-honors-2026',
    title: 'Cluster University Srinagar (CUS) 5-Year Integrated, 3-Year Honors & UG NEP-2020 Admission 2026',
    category: 'cluster_univ',
    postDate: '09/05/2026',
    startDate: '09/05/2026',
    lastDate: '31/07/2026 (Final Deadline)',
    advertisementNo: 'Notice No. CUS/Adm/UG-Integrated/2026',
    shortInfo: 'Centralized admission notification issued by Cluster University Srinagar for 5-Year Integrated, 3-Year Honors, and UG degree programmes under NEP-2020 across constituent colleges (Amar Singh College, SP College, AAAM Degree College Bemina, Govt College for Women MA Road, and IASE Govt College of Education Srinagar).',
    feePerSubject: '₹500 Application Fee + ₹250 Per Course Option',
    eligibility: '10+2 / Higher Secondary Part-II passed from JKBOSE / CBSE / ICSE with minimum 55% marks for Open Merit (50% for SC/ST/OBC/ALC/IB/PSP/EWS reserved categories). Admissions governed by CUET UG score and academic merit.',
    ageLimit: 'No Upper Age Limit (As per UGC & NEP-2020 flexible learning norms)',
    totalPosts: '8,500+ Seat Intake',
    fees: { genObc: '₹500 Registration Fee', scSt: '₹500 Registration Fee' },
    officialLink: 'https://www.cusrinagar.edu.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'School of Sciences (SP College & AS College Srinagar)',
        postName: '5-Year Integrated M.Sc / B.Sc Honors (Physics, Chemistry, Botany, Zoology, Env Science)',
        posts: '1,800 Seats',
        qualification: '10+2 Science stream (PCM/PCB) with min 55% marks (50% for reserved categories).',
        fee: '₹500 App Fee'
      },
      {
        department: 'School of Humanities & Social Sciences (AAAM Degree College Bemina)',
        postName: '5-Year Integrated M.A. / B.A. Honors (Economics, Political Science, History, Sociology)',
        posts: '2,200 Seats',
        qualification: '10+2 in any stream (Arts/Science/Commerce) with min 55% marks (50% for reserved).',
        fee: '₹500 App Fee'
      },
      {
        department: 'School of Computer Applications & IT (Govt College for Women MA Road)',
        postName: 'Integrated MCA, B.Sc IT, BCA & Data Science',
        posts: '1,100 Seats',
        qualification: '10+2 with Mathematics or Computer Science subject at 10+2 level with min 55% marks.',
        fee: '₹500 App Fee'
      },
      {
        department: 'School of Commerce & Management (Amar Singh College)',
        postName: '5-Year Integrated M.Com / B.Com Honors & BBA',
        posts: '1,500 Seats',
        qualification: '10+2 Commerce or Science/Arts background with minimum 55% aggregate marks.',
        fee: '₹500 App Fee'
      },
      {
        department: 'School of Teacher Education (Govt College of Education IASE)',
        postName: '4-Year Integrated ITEP (B.A.-B.Ed / B.Sc.-B.Ed)',
        posts: '400 Seats',
        qualification: '10+2 passed in relevant stream with min 50% aggregate marks as per NCTE rules.',
        fee: '₹500 App Fee'
      }
    ]
  },
  {
    id: 'cus-pg-cuset-entrance-2026',
    title: 'Cluster University Srinagar (CUS) PG 1-Year & 2-Year Master Degree Programmes & CUSET Entrance 2026',
    category: 'cluster_univ',
    postDate: '10/05/2026',
    startDate: '10/05/2026',
    lastDate: '09/06/2026 (CUSET Exam: 20/06/2026 to 30/06/2026)',
    advertisementNo: 'Notice No. CUS/PG-CUSET/Adm/2026',
    shortInfo: 'Cluster University Srinagar notification inviting online application forms for admission to Postgraduate programmes (M.Sc, M.A, M.Com, MCA, M.Ed) through the Cluster University Srinagar Entrance Test (CUSET 2026). Classes starting August 1, 2026.',
    feePerSubject: '₹750 CUSET Entrance Test & Online Form Fee',
    eligibility: 'Bachelor Degree (3-Year or 4-Year) in relevant or allied discipline from a recognized university with minimum 50% marks (45% for Reserved Categories). Candidates appearing in final semester (6th/8th sem) exams eligible provisionally.',
    ageLimit: 'Minimum 20 Years | Maximum 28 Years (Relaxable by 3 years for OBC/RBA/PSP and 5 years for SC/ST/PWD as per UT J&K norms)',
    totalPosts: '2,400 PG Seats',
    fees: { genObc: '₹750 Entrance Fee', scSt: '₹750 Entrance Fee' },
    officialLink: 'https://www.cusrinagar.edu.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Department of Physics, Chemistry & Env Science',
        postName: 'M.Sc Physics, M.Sc Chemistry, M.Sc Env Science',
        posts: '320 Seats',
        qualification: 'B.Sc with subject as core/major in all 3 years with 50% aggregate marks.',
        fee: '₹750 Entrance'
      },
      {
        department: 'Department of Computer Applications',
        postName: 'MCA (Master of Computer Applications) & M.Sc IT',
        posts: '240 Seats',
        qualification: 'BCA / B.Sc IT / B.Sc with Mathematics or CS at 10+2 or Graduation level.',
        fee: '₹750 Entrance'
      },
      {
        department: 'Department of English, History & Political Science',
        postName: 'M.A. English, M.A. History, M.A. Political Science',
        posts: '450 Seats',
        qualification: 'Bachelor Degree in relevant subject or any Bachelor Degree with 50% aggregate.',
        fee: '₹750 Entrance'
      },
      {
        department: 'Department of Commerce & Business Studies',
        postName: 'M.Com & MBA (Master of Business Administration)',
        posts: '280 Seats',
        qualification: 'B.Com / BBA / Bachelor Degree in any discipline with min 50% marks.',
        fee: '₹750 Entrance'
      }
    ]
  },
  {
    id: 'cus-ug-odd-sem-exam-form-2026',
    title: 'Cluster University Srinagar UG (1st, 3rd & 5th Sem) Regular / Backlog Online Exam Form Notice 2026',
    category: 'cluster_univ',
    postDate: '15/05/2026',
    startDate: '15/05/2026',
    lastDate: '05/06/2026 (Without Late Fee) / 12/06/2026 (With Late Fee ₹500)',
    advertisementNo: 'Notice No. CUS/Exam-Form/UG-Odd-Sem/2026',
    shortInfo: 'Notification from Examination Wing Cluster University Srinagar for online submission of examination forms and fee deposition for UG NEP-2020 & CBCS 1st, 3rd, and 5th Semester regular, private, and backlog students across all 5 constituent colleges.',
    feePerSubject: '₹250 Per Theory Paper + ₹200 Practical Paper + ₹300 Semester EMF Fee',
    eligibility: 'Regularly enrolled UG candidates who have completed required continuous internal assessment / mid-term tests and have 75% college class attendance.',
    ageLimit: 'N/A (Enrolled Undergraduate Students)',
    totalPosts: '38,000+ Enrolled Candidates',
    fees: { genObc: '₹250/paper + ₹300 EMF', scSt: '₹250/paper + ₹300 EMF' },
    officialLink: 'https://www.cusrinagar.edu.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Sri Pratap (SP) College Srinagar',
        postName: 'B.Sc / B.Sc Honors 1st, 3rd, 5th Sem Regular & Backlog',
        posts: '₹250 / Theory',
        qualification: '₹250 per theory paper + ₹200 per practical paper + ₹300 Semester Exam Maintenance Fee.',
        fee: '₹250/theory + ₹200/practical'
      },
      {
        department: 'Amar Singh College Srinagar',
        postName: 'B.A. / B.Com 1st, 3rd, 5th Sem Regular & Backlog',
        posts: '₹250 / Theory',
        qualification: '₹250 per paper + ₹300 Semester EMF + ₹150 IT Portal Portal charges.',
        fee: '₹250/paper'
      },
      {
        department: 'AAAM Degree College Bemina & GCW MA Road',
        postName: 'BCA / BBA / B.Sc IT 1st, 3rd, 5th Sem Exam Forms',
        posts: '₹250 / Theory',
        qualification: '₹250 per course paper + ₹250 lab exam charges + ₹300 Semester EMF.',
        fee: '₹250/paper + ₹250 lab'
      }
    ]
  },
  {
    id: 'cus-phd-research-adm-2025-26',
    title: 'Cluster University Srinagar Doctorate of Philosophy (Ph.D) Research Admission 2025-26 Selection List',
    category: 'cluster_univ',
    postDate: '01/09/2025',
    startDate: '01/09/2025',
    lastDate: '13/09/2025 (Verification & Formalities: 18/03/2026)',
    advertisementNo: 'Notice No. CUS/Ph.D-Research/Adm/2025-26',
    shortInfo: 'Notification regarding Doctorate of Philosophy (Ph.D.) research admission selection list, document verification, supervisor allocation, and course work enrolment across Faculties of Science, Social Science, Humanities, and Commerce.',
    feePerSubject: '₹1,000 Application Fee + ₹12,000 Annual Ph.D Research Enrolment Fee',
    eligibility: 'Master Degree in relevant or allied subject with minimum 55% marks (50% for SC/ST/OBC/Differently-abled). Candidates qualifying UGC-NET / CSIR-NET / JRF / GATE / SLET or holding M.Phil exempted from entrance exam.',
    ageLimit: 'Maximum 35 Years (Relaxable up to 40 Years for SC/ST/Differently-abled/In-service Teachers as per J&K Govt rules)',
    totalPosts: '120 Research Scholar Seats',
    fees: { genObc: '₹1,000 App Fee', scSt: '₹1,000 App Fee' },
    officialLink: 'https://www.cusrinagar.edu.in/',
    isNew: false,
    departmentBreakdown: [
      {
        department: 'Faculty of Science (Botany, Chemistry, Physics, Env Science)',
        postName: 'Ph.D Research Scholar Seats in Science Disciplines',
        posts: '45 Seats',
        qualification: 'M.Sc in relevant subject with 55% marks + NET/SET/GATE qualification.',
        fee: '₹1,000 App Fee'
      },
      {
        department: 'Faculty of Humanities & Social Sciences (English, Urdu, History)',
        postName: 'Ph.D Research Scholar Seats in Arts & Humanities',
        posts: '40 Seats',
        qualification: 'M.A. in relevant subject with 55% marks (50% for reserved categories).',
        fee: '₹1,000 App Fee'
      },
      {
        department: 'Faculty of Commerce & Management Studies',
        postName: 'Ph.D Research Scholar Seats in Commerce & Management',
        posts: '35 Seats',
        qualification: 'M.Com / MBA with 55% marks + valid research entrance score or NET.',
        fee: '₹1,000 App Fee'
      }
    ]
  },
  {
    id: 'cus-bed-2yr-itep-2026',
    title: 'Cluster University Srinagar 2-Year B.Ed & 4-Year ITEP Integrated Teacher Education Admission 2026',
    category: 'cluster_univ',
    postDate: '01/06/2026',
    startDate: '01/06/2026',
    lastDate: '30/06/2026',
    advertisementNo: 'Notice No. CUS/IASE-BEd/Adm/2026',
    shortInfo: 'Admission notification for 2-Year B.Ed Programme and 4-Year Integrated Teacher Education Programme (ITEP B.A.-B.Ed / B.Sc.-B.Ed) conducted at Govt College of Education (IASE) M.A. Road Srinagar under Cluster University affiliation.',
    feePerSubject: '₹500 Application Form Fee + ₹250 Per Exam Paper Fee',
    eligibility: 'For 2-Year B.Ed: Bachelor or Master Degree in Arts/Science/Commerce with minimum 50% marks (45% for SC/ST/OBC/PWD). For 4-Year ITEP: 10+2 passed with 50% aggregate marks.',
    ageLimit: 'Minimum Age: 19 Years | Upper Age Limit: No Upper Age Limit (NCTE Guidelines)',
    totalPosts: '350 Seats (250 B.Ed + 100 ITEP)',
    fees: { genObc: '₹500 Registration Fee', scSt: '₹500 Registration Fee' },
    officialLink: 'https://www.cusrinagar.edu.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'Govt College of Education (IASE) M.A. Road Srinagar',
        postName: '2-Year B.Ed Programme (Session 2026-28)',
        posts: '250 Seats',
        qualification: 'Graduation degree with min 50% marks (45% for reserved categories).',
        fee: '₹500 Registration'
      },
      {
        department: 'Govt College of Education (IASE) M.A. Road Srinagar',
        postName: '4-Year Integrated ITEP (B.A.-B.Ed & B.Sc.-B.Ed)',
        posts: '100 Seats',
        qualification: '10+2 passed from recognized board with 50% aggregate marks.',
        fee: '₹500 Registration'
      }
    ]
  },
  {
    id: 'cus-pg-even-sem-exam-form-2026',
    title: 'Cluster University Srinagar PG (2nd & 4th Semester) Regular / Backlog Online Exam Form Notice 2026',
    category: 'cluster_univ',
    postDate: '01/07/2026',
    startDate: '01/07/2026',
    lastDate: '20/07/2026',
    advertisementNo: 'Notice No. CUS/Exam-Form/PG-Even-Sem/2026',
    shortInfo: 'Online examination form filling and examination fee deposition notice for PG 2nd and 4th Semester regular and backlog candidates across all postgraduate schools of Cluster University Srinagar.',
    feePerSubject: '₹1,500 Full Semester Exam Fee (₹900 for single backlog subject)',
    eligibility: 'Regularly enrolled PG students who have fulfilled mandatory 75% attendance and passed internal continuous assessments.',
    ageLimit: 'N/A (Enrolled Postgraduate Students)',
    totalPosts: '3,200 PG Candidates',
    fees: { genObc: '₹1,500 Semester Exam Fee', scSt: '₹1,500 Semester Exam Fee' },
    officialLink: 'https://www.cusrinagar.edu.in/',
    isNew: true,
    departmentBreakdown: [
      {
        department: 'School of Sciences & Information Technology',
        postName: 'M.Sc (Physics, Chem, Env Science, Botany) & MCA 2nd & 4th Sem',
        posts: '₹1,500 / Sem',
        qualification: 'Full semester fee ₹1,500 including lab practical evaluation and hall ticket charges.',
        fee: '₹1,500/semester'
      },
      {
        department: 'School of Humanities, Social Sciences & Commerce',
        postName: 'M.A. (English, History, Pol Science) & M.Com 2nd & 4th Sem',
        posts: '₹1,500 / Sem',
        qualification: 'Full semester fee ₹1,500 (₹900 for single backlog paper; ₹1,500 for >1 backlog).',
        fee: '₹1,500/semester'
      }
    ]
  }
];
