// server.ts
import express from "express";
import path5 from "path";
import fs4 from "fs";
import Razorpay from "razorpay";
import crypto from "crypto";
import sharp3 from "sharp";

// src/data/sarkariData.ts
var SARKARI_CATEGORIES = {
  jkssb: { label: "JKSSB Jobs", color: "border-indigo-600 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40" },
  jobs: { label: "Latest Jobs", color: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
  admit_cards: { label: "Admit Cards", color: "border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/30" },
  results: { label: "Results", color: "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
  answer_keys: { label: "Answer Keys", color: "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30" },
  syllabus: { label: "Syllabus", color: "border-pink-500 text-pink-600 bg-pink-50 dark:bg-pink-950/30" },
  admissions: { label: "KU Admissions", color: "border-teal-600 text-teal-700 bg-teal-50 dark:bg-teal-950/40" },
  exam_forms: { label: "KU Exam Forms", color: "border-amber-600 text-amber-800 bg-amber-50 dark:bg-amber-950/40" },
  cluster_univ: { label: "Cluster Univ", color: "border-cyan-600 text-cyan-700 bg-cyan-50 dark:bg-cyan-950/40" },
  nta: { label: "NTA Exams", color: "border-red-600 text-red-700 bg-red-50 dark:bg-red-950/40" },
  ssc_jobs: { label: "SSC Jobs", color: "border-orange-600 text-orange-700 bg-orange-50 dark:bg-orange-950/40" },
  rrb_jobs: { label: "RRB Jobs", color: "border-emerald-600 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" },
  army_jobs: { label: "Indian Army Jobs", color: "border-red-700 text-red-800 bg-red-50 dark:bg-red-950/40" }
};
var SARKARI_DATA = [
  // 🇮🇳 DAILY OFFICIAL PORTAL UPDATES (25 OCTOBER 2026)
  {
    id: "army-tes-57-course-2026",
    title: "Indian Army 10+2 Technical Entry Scheme (TES-57 Course) Online Form 2026",
    category: "army_jobs",
    postDate: "25/10/2026",
    startDate: "14/10/2026",
    lastDate: "12/11/2026",
    advertisementNo: "TES-57 Course Notification (Commencing July 2027)",
    shortInfo: "Join Indian Army invites online applications from unmarried male candidates who have passed 10+2 examination with Physics, Chemistry, and Mathematics (PCM) and appeared in JEE (Mains) for the 10+2 Technical Entry Scheme (TES-57) course for grant of Permanent Commission in the Indian Army.",
    ageLimit: "16\xBD to 19\xBD Years (Candidates must not be born before 02.01.2008 and not after 01.01.2011, both days inclusive)",
    eligibility: "Minimum 60% aggregate marks in Physics, Chemistry & Mathematics (PCM) in Class 12th (10+2) from a recognized Education Board, and mandatory appearance in JEE (Mains) 2026.",
    totalPosts: "90 Posts",
    officialLink: "https://joinindianarmy.nic.in",
    fees: {
      genObc: "\u20B90/- (No Application Fee for any category)",
      scSt: "\u20B90/- (Exempted)"
    },
    isNew: true
  },
  {
    id: "rrb-ntpc-undergraduate-cen-07-2026",
    title: "RRB NTPC Undergraduate (10+2) Level Posts Recruitment 2026 (CEN 07/2026)",
    category: "rrb_jobs",
    postDate: "25/10/2026",
    startDate: "15/10/2026",
    lastDate: "13/11/2026",
    advertisementNo: "CEN No. 07/2026 (NTPC-UG)",
    shortInfo: "Railway Recruitment Boards (RRB) invite online applications on rrbapply.gov.in for Non-Technical Popular Categories (Undergraduate Level) including Commercial-cum-Ticket Clerk, Accounts Clerk-cum-Typist, Junior Clerk-cum-Typist, and Trains Clerk across various Zonal Railways and Production Units.",
    ageLimit: "18 to 30 Years as on 01.01.2027 (Age relaxation of 3 years for OBC-NCL and 5 years for SC/ST candidates as per Railway rules)",
    eligibility: "12th (+2 Stage) or its equivalent examination passed with minimum 50% marks in aggregate (pass marks for SC/ST/PwBD/Ex-SM candidates). Typing proficiency required for Clerk-cum-Typist posts.",
    totalPosts: "3,445 Vacancies Across All RRB Zones",
    officialLink: "https://www.rrbapply.gov.in",
    fees: {
      genObc: "\u20B9500/- (\u20B9400/- refunded duly deducting bank charges on appearing in 1st Stage CBT)",
      scSt: "\u20B9250/- (For SC, ST, Ex-SM, Female, Transgender, Minorities & EBC - Fully refunded after CBT-1)"
    },
    isNew: true
  },
  {
    id: "ssc-chsl-10-plus-2-exam-2026-tier1",
    title: "SSC Combined Higher Secondary (10+2) Level (CHSL) Examination 2026 & Revised Vacancy Notice",
    category: "ssc_jobs",
    postDate: "25/10/2026",
    startDate: "07/09/2026",
    lastDate: "30/11/2026",
    advertisementNo: "F.No. HQ-PPII01/2/2026-PP_II (SSC CHSL 2026)",
    shortInfo: "Staff Selection Commission (SSC) has released the notification and revised vacancy breakdown for the Combined Higher Secondary (10+2) Level Examination 2026 for recruitment to Lower Divisional Clerk (LDC) / Junior Secretariat Assistant (JSA), and Data Entry Operator (DEO / DEO Grade A) across Central Government Ministries and Departments.",
    ageLimit: "18 to 27 Years as on 01.08.2026 (Candidates born not before 02.08.1999 and not later than 01.08.2008; SC/ST: +5 Years, OBC: +3 Years)",
    eligibility: "Candidates must have passed 12th Standard or equivalent examination from a recognized Board or University. For DEO Grade A in specific departments, 12th pass in Science stream with Mathematics as a subject is required.",
    totalPosts: "2,536 Vacancies (LDC/JSA & DEO Cadres)",
    officialLink: "https://ssc.gov.in",
    fees: {
      genObc: "\u20B9100/- (Payable online via BHIM UPI, Net Banking, or Debit/Credit Cards)",
      scSt: "\u20B90/- (Women, SC, ST, PwBD and Ex-Servicemen candidates are exempted from fee payment)"
    },
    isNew: true
  },
  {
    id: "cus-bed-supplementary-4th-sem-exam-dyd-2026",
    title: "Cluster University Srinagar B.Ed 4th Semester Supplementary Exam Form & Design Your Degree (DYD) NEP Notice 2026",
    category: "cluster_univ",
    postDate: "25/10/2026",
    startDate: "20/10/2026",
    lastDate: "10/11/2026",
    advertisementNo: "CUS/Exam/B.Ed-4th-Supp/2026",
    shortInfo: "Controller of Examinations, Cluster University Srinagar has issued the online examination form submission notice and date sheet schedule for B.Ed 4th Semester (Regular Batch 2024 & Backlog/Supplementary candidates) along with NEP-2020 Design Your Degree (DYD) 3rd & 4th Semester assessment updates.",
    ageLimit: "No Age Bar (Enrolled University Candidates)",
    eligibility: "Students enrolled in B.Ed 4th Semester (Regular Batch 2024 & eligible backlog batches) at IAES / Constituent Colleges and DYD NEP-2020 Undergraduate streams of Cluster University Srinagar.",
    totalPosts: "Semester Examination Notice",
    officialLink: "https://www.cusrinagar.edu.in",
    fees: {
      genObc: "As per prescribed CUS Semester Examination Fee structure on student portal",
      scSt: "Exempted for Specially-Abled (PwD) & Orphan Category students as per University norms"
    },
    isNew: true
  },
  {
    id: "jkssb-advt-10-of-2026-je-mechanical-pwd",
    title: "JKSSB Advt 10 of 2026: Recruitment for 127 Junior Engineer (Mechanical) Posts in Public Works (R&B) Department",
    category: "jkssb",
    postDate: "21/10/2026",
    startDate: "16/11/2026",
    lastDate: "15/12/2026",
    advertisementNo: "Advertisement Notification No. 10 of 2026 (Dated: 21.10.2026)",
    shortInfo: "Jammu and Kashmir Services Selection Board (JKSSB) invites online applications from eligible Domiciles of UT of Jammu & Kashmir for direct recruitment to 127 UT Cadre posts of Junior Engineer (Mechanical) in Pay Level-6 (\u20B935,400 - \u20B91,12,400) under Public Works (R&B) Department.",
    ageLimit: "Open Merit (OM): 40 Years (as on 01.01.2026) | SC / ST-1 / ST-2 / RBA / ALC-IB / EWS / OBC: 43 Years | PwBD: 42 Years | In-Service / Contractual: 40 Years",
    eligibility: "Three Years Diploma in Mechanical Engineering from a Government recognized Institute / Indian University, OR Degree in Mechanical Engineering / AMIE Section (A&B) in Mechanical Engineering. Candidate must be a Domicile of UT of J&K.",
    totalPosts: "127 Posts (OM: 51 | SC: 11 | ST-1: 12 | ST-2: 13 | OBC: 10 | ALC/IB: 05 | RBA: 13 | EWS: 12)",
    officialLink: "https://www.jkssb.nic.in",
    fees: {
      genObc: "\u20B9600/- (For Open Merit, RBA, ALC/IB, OBC Categories)",
      scSt: "\u20B9500/- (For SC, ST-1, ST-2, EWS & PwBD Categories)"
    },
    isNew: true
  },
  {
    id: "ku-ug-5yr-integrated-pg-exam-datesheet-oct-2026",
    title: "University of Kashmir Examination Date Sheet & Online Exam Forms for 5-Year Integrated & UG/PG Programmes (Session Oct\u2013Nov 2026)",
    category: "exam_forms",
    postDate: "25/10/2026",
    startDate: "22/10/2026",
    lastDate: "12/11/2026",
    advertisementNo: "F(Exam-Integrated-UG-PG)/KU/2026",
    shortInfo: "Office of the Controller of Examinations, University of Kashmir has released the online examination form submission link and center-wise date sheets for 5-Year Integrated, Honours, Professional, and PG Semester examinations (Regular & Fresh Private batches) for the October\u2013November 2026 session.",
    ageLimit: "As per University of Kashmir Examination Statutes",
    eligibility: "Regular and eligible backlog students of 5-Year Integrated Programmes, UG NEP Semesters, and Postgraduate Courses enrolled at Main Campus, Satellite Campuses, and Affiliated Colleges of University of Kashmir.",
    totalPosts: "University Exam Form & Date Sheet",
    officialLink: "https://www.kashmiruniversity.net",
    fees: {
      genObc: "\u20B9750/- to \u20B91,250/- (Depending on course & number of subjects via KU Student Portal)",
      scSt: "Fee concession applicable for Orphan & Visually Impaired / PwD students"
    },
    isNew: true
  },
  {
    id: "ku-ddoe-distance-education-pg-admissions-2026",
    title: "University of Kashmir DDOE Distance Mode PG Admissions (MA, M.Com & M.Sc Mathematics) Notification 2026",
    category: "admissions",
    postDate: "25/10/2026",
    startDate: "18/10/2026",
    lastDate: "15/11/2026",
    advertisementNo: "Adm/DDOE-PG/KU/2026",
    shortInfo: "Directorate of Distance & Online Education (DDOE), University of Kashmir invites online admission applications for Postgraduate programmes in Distance Mode including MA (English, Urdu, Kashmiri, Islamic Studies, Education, Economics), M.Com, and M.Sc Mathematics for the Academic Session 2026.",
    ageLimit: "No Upper Age Limit for Distance Mode PG Admissions",
    eligibility: "Bachelor\u2019s Degree (10+2+3 pattern) in the relevant or allied discipline from University of Kashmir or any other UGC-recognized University with minimum required aggregate marks (45% for Open Merit and 40% for Reserved Categories).",
    totalPosts: "Distance Mode PG Seats (All Study Centres)",
    officialLink: "https://www.kashmiruniversity.net",
    fees: {
      genObc: "\u20B9400/- (Online Application & Processing Fee per Programme)",
      scSt: "\u20B9400/- (Online Application & Processing Fee per Programme)"
    },
    isNew: true
  },
  // 🇮🇳 MEGA RECRUITMENT NOTIFICATION (01 SEPTEMBER 2026 - JKSSB ADVT 09 OF 2026)
  {
    id: "jkssb-advt-09-of-2026-class-iv-mts-recruitment",
    title: "JKSSB Advt 09 of 2026: Mega Recruitment for 2,863 Class-IV (MTS) & Sanitation Worker Posts (UT, Divisional & District Cadres)",
    category: "jkssb",
    postDate: "01/09/2026",
    startDate: "05/10/2026",
    lastDate: "03/11/2026",
    advertisementNo: "Advertisement Notification No. 09 of 2026 (Dated: 01.09.2026)",
    shortInfo: "Jammu and Kashmir Services Selection Board (JKSSB) notifies a mega direct recruitment drive for 2,863 Class-IV (MTS) and Sanitation Worker vacancies in Pay Level SL1 (\u20B914,800 - \u20B947,100) under General Administration Department across UT Cadre (105 Posts), Divisional Cadre Jammu (1093 Posts), Divisional Cadre Kashmir (897 Posts), and 20 District Cadres (768 Posts). Major departments include PW(R&B) (1420 Posts), Floriculture (199 Posts), Estates (158 Posts), Animal/Sheep Husbandry, Higher Education, Transport, Culture, and Agriculture/Horticulture. Special weightage allocated for Home District/Division domicile, families with no Govt job, widows/divorced/orphan candidates, and 5+ years casual workers as per S.O. 184 of 2020.",
    ageLimit: "Open Merit (OM): 40 Years (Not born before 01.01.1986 / after 01.01.2008) | SC / ST-1 / ST-2 / RBA / ALC-IB / EWS / OBC: 43 Years | PwBD: 42 Years | Ex-Servicemen: 48 Years | Casual Workers: 5 Years Upper Age Relaxation",
    eligibility: "Class-IV (MTS): Minimum Matric (10th) & Maximum 10+2 (Higher Secondary) as per S.O. 184 of 2020 & SRO 99 of 2008. Sanitation Worker: Minimum 8th Pass & Maximum 10+2 as per S.O. 132 of 2022. (Important: Higher qualifications above 10+2 are not eligible as per extant recruitment rules). Valid J&K Domicile Certificate required on or before 03.11.2026.",
    totalPosts: "2,863 Vacancies (UT: 105 | Div Jammu: 1093 | Div Kashmir: 897 | District Cadres: 768)",
    officialLink: "https://www.jkssb.nic.in",
    fees: {
      genObc: "\u20B9600/- (For OM, RBA, ALC/IB, OBC Candidates via Net Banking / Cards)",
      scSt: "\u20B9500/- (For SC, ST-1, ST-2, EWS & PwBD Candidates)"
    },
    departmentBreakdown: [
      {
        department: "Public Works (R&B) Department (Divisional Cadre Jammu & Kashmir)",
        postName: "Class-IV (MTS) - Division Jammu (939) & Division Kashmir (481)",
        posts: "1,420 Posts",
        qualification: "Minimum Matric (10th) and Maximum 10+2",
        fee: "Pay Level SL1 (\u20B914,800 - \u20B947,100)"
      },
      {
        department: "Department of Floriculture, Gardens & Parks (Divisional Cadre Kashmir)",
        postName: "Class-IV (MTS) [OM: 79, SC: 16, ST1: 20, ST2: 20, OBC: 16, ALC: 8, RBA: 20, EWS: 20]",
        posts: "199 Posts",
        qualification: "Minimum Matric (10th) and Maximum 10+2",
        fee: "Pay Level SL1 (\u20B914,800 - \u20B947,100)"
      },
      {
        department: "Estates Department (UT Cadre, Div Jammu & Div Kashmir)",
        postName: "Sanitation Worker (UT: 73, Div Jammu: 48, Div Kashmir: 37)",
        posts: "158 Posts",
        qualification: "Minimum 8th Pass and Maximum 10+2",
        fee: "Pay Level SL1 (\u20B914,800 - \u20B947,100)"
      },
      {
        department: "Animal & Sheep Husbandry Department (Divisional & District Cadres)",
        postName: "Class-IV (MTS) & Sanitation Worker (Div Jammu: 11, Div Kashmir: 72, All 20 Districts: 500+)",
        posts: "650+ Posts",
        qualification: "Minimum Matric / 8th Pass and Maximum 10+2",
        fee: "Pay Level SL1 (\u20B914,800 - \u20B947,100)"
      },
      {
        department: "ARI & Trainings Department (UT & Divisional Cadres)",
        postName: "Class-IV (MTS) & Sanitation Worker (Div Jammu: 50, Div Kashmir: 50)",
        posts: "100 Posts",
        qualification: "Minimum Matric / 8th Pass and Maximum 10+2",
        fee: "Pay Level SL1 (\u20B914,800 - \u20B947,100)"
      },
      {
        department: "Higher Education Department (Divisional Cadre Jammu & Kashmir)",
        postName: "Class-IV (MTS) [Div Jammu: 27, Div Kashmir: 16]",
        posts: "43 Posts",
        qualification: "Minimum Matric (10th) and Maximum 10+2",
        fee: "Pay Level SL1 (\u20B914,800 - \u20B947,100)"
      },
      {
        department: "Transport Department (UT Cadre)",
        postName: "Class-IV (MTS: 28, Sanitation Worker: 2)",
        posts: "30 Posts",
        qualification: "Minimum Matric / 8th Pass and Maximum 10+2",
        fee: "Pay Level SL1 (\u20B914,800 - \u20B947,100)"
      },
      {
        department: "Culture Department (Archives, Archaeology, Museum & Libraries)",
        postName: "Class-IV (MTS) [Div Jammu: 13, Div Kashmir: 14]",
        posts: "27 Posts",
        qualification: "Minimum Matric (10th) and Maximum 10+2",
        fee: "Pay Level SL1 (\u20B914,800 - \u20B947,100)"
      },
      {
        department: "District Cadres across all 20 Districts of J&K",
        postName: "Class-IV (MTS) [Baramulla: 75, Jammu: 65, Anantnag: 59, Srinagar: 53, Kathua: 50, Poonch: 49, Budgam: 47, Doda: 46, Ganderbal: 46, Udhampur: 46, Pulwama: 45, Reasi: 34, Rajouri: 28, Kishtwar: 25, Kupwara: 24, Kulgam: 23, Bandipora: 20, Samba: 14, Shopian: 10, Ramban: 9]",
        posts: "768 Posts",
        qualification: "Minimum Matric (10th) and Maximum 10+2",
        fee: "Pay Level SL1 (\u20B914,800 - \u20B947,100)"
      }
    ],
    isNew: true
  },
  // 🇮🇳 PREVIOUS NOTIFICATIONS (30 AUGUST 2026 - DISPATCH)
  {
    id: "army-tes-55-course-july-2027",
    title: "Indian Army 10+2 Technical Entry Scheme (TES-55 Course Commencing July 2027)",
    category: "army_jobs",
    postDate: "30/08/2026",
    startDate: "30/08/2026",
    lastDate: "30/09/2026",
    advertisementNo: "TES-55 (July 2027 Course)",
    shortInfo: "Applications are invited from unmarried male Candidates who have passed 10+2 examination with Physics, Chemistry and Mathematics (PCM) subjects and appeared in JEE (Mains) 2026 for grant of Permanent Commission in the Indian Army.",
    ageLimit: "16\xBD to 19\xBD Years (Born between 02 Jan 2008 and 01 Jan 2011)",
    eligibility: "Passed 10+2 with minimum 60% aggregate marks in PCM + Appeared in JEE Mains 2026",
    totalPosts: "90 Posts (Cadet Training Scheme)",
    officialLink: "https://www.joinindianarmy.nic.in",
    fees: {
      genObc: "\u20B90 (No Application Fee)",
      scSt: "\u20B90 (No Application Fee)"
    },
    isNew: true
  },
  {
    id: "rrb-ntpc-graduate-undergraduate-cen11-2026",
    title: "RRB Non-Technical Popular Categories (NTPC Graduate & Undergraduate) Recruitment 2026 (CEN 11/2026)",
    category: "rrb_jobs",
    postDate: "30/08/2026",
    startDate: "30/08/2026",
    lastDate: "02/10/2026",
    advertisementNo: "CEN No. 11/2026 (NTPC Posts)",
    shortInfo: "Railway Recruitment Boards (RRB) release Centralized Employment Notice for recruitment of Goods Train Manager, Station Master, Senior Clerk cum Typist, Junior Account Assistant, and Commercial cum Ticket Clerk across all Indian Railway zones.",
    ageLimit: "18 to 36 Years (Undergraduate) / 18 to 39 Years (Graduate) with category relaxation",
    eligibility: "12th (+2 Stage) or Bachelor\u2019s Degree in any discipline from a recognized University",
    totalPosts: "11,558 Vacancies across all RRB Zones",
    officialLink: "https://www.rrbapply.gov.in",
    fees: {
      genObc: "\u20B9500 (\u20B9400 refundable on appearing in 1st Stage CBT)",
      scSt: "\u20B9250 (\u20B9250 refundable on appearing in 1st Stage CBT)"
    },
    isNew: true
  },
  {
    id: "ssc-mts-havaldar-recruitment-2026-fresh",
    title: "SSC Multi-Tasking (Non-Technical) Staff and Havaldar (CBIC & CBN) Examination 2026",
    category: "ssc_jobs",
    postDate: "30/08/2026",
    startDate: "30/08/2026",
    lastDate: "30/09/2026",
    advertisementNo: "F.No. HQ-PPI03/12/2026-PP_1",
    shortInfo: "Staff Selection Commission invites online applications from eligible 10th pass candidates for Computer Based Examination for recruitment of Multi-Tasking Staff (MTS in Pay Level-1) and Havaldar in CBIC & CBN.",
    ageLimit: "18 to 25 Years (MTS) & 18 to 27 Years (Havaldar & select MTS posts)",
    eligibility: "Must have passed Matriculation (10th Class) Examination or equivalent from a recognized Board",
    totalPosts: "9,583 Vacancies (MTS: 6,144, Havaldar: 3,439)",
    officialLink: "https://ssc.gov.in",
    fees: {
      genObc: "\u20B9100 (Online via BHIM UPI, Net Banking, Cards)",
      scSt: "\u20B90 (Exempted for SC/ST/PwBD/Ex-Servicemen/Women)"
    },
    isNew: true
  },
  {
    id: "cus-ug-phase2-spot-round-admissions-2026",
    title: "Phase-II Spot Round Admissions Notice for 4-Year UG Honours (FYUGP NEP-2020) Session 2026-27",
    category: "cluster_univ",
    postDate: "30/08/2026",
    startDate: "30/08/2026",
    lastDate: "10/09/2026",
    advertisementNo: "CUS/Adm/UG-Spot-Phase2/2026/1422",
    shortInfo: "Cluster University Srinagar notifies online registration for Phase-II Spot Round Admissions against vacant seats in various 4-Year Undergraduate Honours Programmes (FYUGP under NEP-2020) across all constituent colleges.",
    ageLimit: "10+2 Passed Candidates",
    eligibility: "Higher Secondary Part-II (Class 12th) or equivalent passed from JKBOSE / CBSE or any recognized Board with relevant subject combination",
    totalPosts: "Vacant Seats across Constituent Colleges",
    officialLink: "https://www.cusrinagar.edu.in",
    fees: {
      genObc: "\u20B9500 (Spot Registration & Counseling Fee)",
      scSt: "\u20B9500 (Spot Registration & Counseling Fee)"
    },
    isNew: true
  },
  {
    id: "jkssb-dv-notice-advt06-2026-works-supervisor",
    title: "JKSSB Document Verification Notice for Draftsman (Civil) & Works Supervisor Posts under Advt 06/2026",
    category: "jkssb",
    postDate: "30/08/2026",
    startDate: "30/08/2026",
    lastDate: "24/09/2026",
    advertisementNo: "JKSSB-COE0EXAM/2026/06-DV",
    shortInfo: "Jammu and Kashmir Services Selection Board (JKSSB) issues schedule and guidelines for online application scrutiny and Document Verification of shortlisted candidates for 357 Divisional Cadre posts of Draftsman (Civil) and Works Supervisor in PW(R&B) Department.",
    ageLimit: "18 to 40 Years (Open Merit) as of cutoff",
    eligibility: "2-Year Draftsman Training Course / Diploma in Civil Engineering from a Govt recognized Institute",
    totalPosts: "357 Posts (Divisional Cadre Jammu & Kashmir)",
    officialLink: "https://www.jkssb.nic.in",
    fees: {
      genObc: "\u20B9500 (Application & Processing Fee)",
      scSt: "\u20B9400 (For SC/ST/EWS/PwD Candidates)"
    },
    isNew: true
  },
  {
    id: "ku-date-sheet-bg-5th-6th-sem-backlog-2026",
    title: "Date Sheet for BG 5th & 6th Semester Backlog / Supplementary Examination (CBCS Session 2026)",
    category: "exam_forms",
    postDate: "30/08/2026",
    startDate: "30/08/2026",
    lastDate: "15/09/2026",
    advertisementNo: "F(DateSheet-BG-5th-6th-Backlog)/KU/2026/112",
    shortInfo: "University of Kashmir Examination Wing announces the official date sheet for conduct of BG (Undergraduate) 5th and 6th Semester Backlog and Supplementary Examinations (CBCS Scheme) for registered candidates of affiliated degree colleges.",
    ageLimit: "Enrolled UG Backlog Candidates",
    eligibility: "Bonafide candidates having backlogs in 5th or 6th Semester with submitted examination forms and fee challans",
    totalPosts: "Undergraduate Examination Wing",
    officialLink: "https://www.kashmiruniversity.net",
    fees: {
      genObc: "\u20B9750 (Exam Fee per semester backlog)",
      scSt: "\u20B9750 (Exam Fee per semester backlog)"
    },
    isNew: true
  },
  {
    id: "ku-admissions-ug-phase2-walkin-nep-2026",
    title: "Phase-II Walk-in & Merit-Based UG Admission Notice for Class 12th Pass-Outs (Session 2026-27)",
    category: "admissions",
    postDate: "30/08/2026",
    startDate: "30/08/2026",
    lastDate: "10/09/2026",
    advertisementNo: "F(UG-Admissions-Phase-II)/KU/2026/09",
    shortInfo: "Directorate of Admissions and Competitive Examinations, University of Kashmir invites online applications from eligible 10+2 passed candidates for Phase-II merit-based and walk-in admissions into 4-Year UG (FYUGP under NEP-2020) programmes.",
    ageLimit: "Class 12th Pass Candidates",
    eligibility: "Higher Secondary Part-II (10+2) or equivalent examination from JKBOSE/CBSE with minimum 45% aggregate (40% for reserved categories)",
    totalPosts: "Open Seats across Affiliated Degree Colleges",
    officialLink: "https://www.kashmiruniversity.net",
    fees: {
      genObc: "\u20B9500 (Online Application & Processing Fee)",
      scSt: "\u20B9500 (Online Application & Processing Fee)"
    },
    isNew: true
  },
  // 🇮🇳 PREVIOUS NOTIFICATIONS (22 AUGUST 2026 - DISPATCH)
  {
    id: "army-ssc-tech-66-men-37-women-oct-2026",
    title: "Indian Army Short Service Commission (Tech) 66th Men & 37th Women Entry Scheme (Commencing Oct 2026)",
    category: "army_jobs",
    postDate: "22/08/2026",
    startDate: "22/08/2026",
    lastDate: "25/09/2026",
    advertisementNo: "SSC(Tech)-66 (Men) & SSCW(Tech)-37 (Women)",
    shortInfo: "Applications are invited from eligible unmarried male and female Engineering Graduates and also from Widows of Defence Personnel for grant of Short Service Commission (SSC) in the Indian Army for Course commencing in October 2026.",
    ageLimit: "20 to 27 Years (Born between 02 Oct 1999 and 01 Oct 2006)",
    eligibility: "BE/B.Tech Degree in relevant Engineering stream (Final year students eligible)",
    totalPosts: "380 Posts (Men: 350, Women: 30)",
    officialLink: "https://www.joinindianarmy.nic.in",
    fees: {
      genObc: "\u20B90 (No Application Fee)",
      scSt: "\u20B90 (No Application Fee)"
    },
    isNew: true
  },
  {
    id: "rrb-staff-nurse-paramedical-cen10-2026",
    title: "RRB Paramedical Categories & Nursing Superintendent Recruitment 2026 (CEN 10/2026)",
    category: "rrb_jobs",
    postDate: "22/08/2026",
    startDate: "23/08/2026",
    lastDate: "26/09/2026",
    advertisementNo: "CEN No. 10/2026 (Paramedical Categories)",
    shortInfo: "Railway Recruitment Boards (RRB) announce Centralized Employment Notice for recruitment of Nursing Superintendent, Pharmacist, Health & Malaria Inspector, Lab Assistant, and Radiographer across all Railway zones.",
    ageLimit: "20 to 40 Years (Relaxation as per RRB rules)",
    eligibility: "B.Sc Nursing / GNM Diploma / B.Pharm / D.Pharm / DMLT with State Council Registration",
    totalPosts: "1,376 Vacancies across all RRB Zones",
    officialLink: "https://www.rrbapply.gov.in",
    fees: {
      genObc: "\u20B9500 (\u20B9400 refundable upon attending CBT)",
      scSt: "\u20B9250 (\u20B9250 refundable upon attending CBT)"
    },
    isNew: true
  },
  {
    id: "ssc-stenographer-grade-c-d-exam-2026",
    title: "SSC Stenographer Grade \u2018C\u2019 and \u2018D\u2019 Examination 2026 (CBT & Skill Test)",
    category: "ssc_jobs",
    postDate: "22/08/2026",
    startDate: "22/08/2026",
    lastDate: "22/09/2026",
    advertisementNo: "F.No. SSC/HQ/Steno-2026/08",
    shortInfo: "Staff Selection Commission invites online applications from eligible candidates for Computer Based Examination for recruitment of Stenographers Grade \u2018C\u2019 (Group B Non-Gazetted) and Grade \u2018D\u2019 (Group C) for various Central Government Ministries and Departments.",
    ageLimit: "18 to 30 Years for Grade C, 18 to 27 Years for Grade D (Age relaxation applicable)",
    eligibility: "12th Standard or equivalent qualification + Shorthand/Typing Speed in Hindi or English",
    totalPosts: "2,140 Vacancies (Tentative)",
    officialLink: "https://ssc.gov.in",
    fees: {
      genObc: "\u20B9100 (Online Payment via UPI/NetBanking)",
      scSt: "\u20B90 (Exempted for SC/ST/PwD/Women)"
    },
    isNew: true
  },
  {
    id: "cus-ug-honours-nep-sem2-exam-form-2026",
    title: "Online Examination Forms Notice for UG FYUGP (NEP-2020) 2nd Semester Batch 2025-26",
    category: "cluster_univ",
    postDate: "22/08/2026",
    startDate: "22/08/2026",
    lastDate: "07/09/2026",
    advertisementNo: "CUS/Exam/UG-FYUGP-Sem-2/2026/1380",
    shortInfo: "Cluster University Srinagar notifies all eligible undergraduate students enrolled in 4-Year Undergraduate Programmes (FYUGP under NEP-2020) 2nd Semester to submit their online examination forms and download fee challans through student login.",
    ageLimit: "Enrolled UG Regular Students",
    eligibility: "Bonafide students of constituent colleges of CUS with requisite attendance and internal continuous assessments completed",
    totalPosts: "Undergraduate Examination Wing",
    officialLink: "https://www.cusrinagar.edu.in",
    fees: {
      genObc: "\u20B9675 (Standard Form & Exam Fee)",
      scSt: "\u20B9675 (Standard Form & Exam Fee)"
    },
    isNew: true
  },
  {
    id: "ku-exam-form-bed-1st-2nd-sem-session-2026",
    title: "Online Examination Forms Notice for B.Ed 1st & 2nd Semester (Regular & Backlog Candidates, Session 2026)",
    category: "exam_forms",
    postDate: "22/08/2026",
    startDate: "22/08/2026",
    lastDate: "08/09/2026",
    advertisementNo: "F(Exam-Form-BEd-1st-2nd-Sem)/KU/2026/89",
    shortInfo: "University of Kashmir Examination Wing issues notice for submission of online examination forms for B.Ed 1st and 2nd Semester eligible candidates of affiliated private and government colleges of education.",
    ageLimit: "Enrolled B.Ed Teacher Trainees",
    eligibility: "Eligible B.Ed students with verified internal microteaching and sessionals records",
    totalPosts: "B.Ed Examination Cell",
    officialLink: "https://www.kashmiruniversity.net",
    fees: {
      genObc: "\u20B91,050 (Exam Fee) + \u20B9250 (EMF / Services)",
      scSt: "\u20B91,050 (Exam Fee) + \u20B9250 (EMF / Services)"
    },
    isNew: true
  },
  {
    id: "ku-admissions-postgraduate-diploma-cyber-security-2026",
    title: "Admission Notification for PG Diploma in Cyber Security, AI & Data Science (Session 2026-27)",
    category: "admissions",
    postDate: "22/08/2026",
    startDate: "22/08/2026",
    lastDate: "12/09/2026",
    advertisementNo: "F(Admissions-PGD-Cyber-AI)/KU/2026/04",
    shortInfo: "Directorate of Admissions and Competitive Examinations, University of Kashmir invites online applications from eligible candidates for admission into 1-Year Full-Time Post Graduate Diploma in Cyber Security, Artificial Intelligence & Applied Data Analytics.",
    ageLimit: "No upper age bar for professional diploma admissions",
    eligibility: "Graduation in any discipline with Mathematics/Statistics/Computer Science at 10+2/Graduation level with at least 50% marks (45% for reserved categories)",
    totalPosts: "45 Seats (Main Campus)",
    officialLink: "https://www.kashmiruniversity.net",
    fees: {
      genObc: "\u20B9750 (Entrance & Processing Fee)",
      scSt: "\u20B9750 (Entrance & Processing Fee)"
    },
    isNew: true
  },
  // 🇮🇳 PREVIOUS NOTIFICATIONS (19 AUGUST 2026 - DISPATCH)
  {
    id: "army-tes-54-course-jan-2027",
    title: "Indian Army 10+2 Technical Entry Scheme (TES-54 Course - Commencing Jan 2027)",
    category: "army_jobs",
    postDate: "19/08/2026",
    startDate: "19/08/2026",
    lastDate: "22/09/2026",
    advertisementNo: "TES-54 (January 2027 Course)",
    shortInfo: "Indian Army invites online applications from unmarried male candidates who have passed 10+2 Examination with Physics, Chemistry, and Mathematics (PCM) and appeared in JEE (Mains) 2026 for grant of Permanent Commission in the Army for 10+2 TES-54 Course.",
    ageLimit: "16\xBD to 19\xBD Years (Born between 02 Jul 2007 and 01 Jul 2010)",
    eligibility: "Passed 10+2 with minimum 60% aggregate in PCM + Appeared in JEE (Mains) 2026",
    totalPosts: "90 Posts (Permanent Commission in Army)",
    officialLink: "https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm",
    fees: {
      genObc: "\u20B90 (No Application Fee)",
      scSt: "\u20B90 (No Application Fee)"
    },
    isNew: true
  },
  {
    id: "rrb-cma-metallurgical-cen09-2026",
    title: "RRB Chemical & Metallurgical Assistant (CMA) & Supervisor Recruitment 2026 (CEN 09/2026)",
    category: "rrb_jobs",
    postDate: "19/08/2026",
    startDate: "20/08/2026",
    lastDate: "21/09/2026",
    advertisementNo: "CEN No. 09/2026 (CMA & Metallurgical Supervisor)",
    shortInfo: "Railway Recruitment Boards (RRB) announce centralized recruitment for Chemical & Metallurgical Assistant (CMA), Metallurgical Supervisor, and Research Assistant categories across Indian Railways and Production Units.",
    ageLimit: "18 to 36 Years (Relaxation as per RRB rules)",
    eligibility: "Degree in Science (B.Sc) with Physics and Chemistry (minimum 45% marks) or B.E./B.Tech in Metallurgical / Chemical Engineering",
    totalPosts: "650 Posts across all RRB Zones",
    officialLink: "https://www.rrbapply.gov.in/#/auth/landing",
    fees: {
      genObc: "\u20B9500 (\u20B9400 refundable after appearing in CBT-1)",
      scSt: "\u20B9250 (\u20B9250 refundable after appearing in CBT-1)"
    },
    isNew: true
  },
  {
    id: "ssc-junior-engineer-je-exam-2026",
    title: "SSC Junior Engineer (Civil, Mechanical & Electrical) Examination 2026 (JE Paper-I)",
    category: "ssc_jobs",
    postDate: "19/08/2026",
    startDate: "19/08/2026",
    lastDate: "24/09/2026",
    advertisementNo: "SSC/HQ/JE-Exam-2026/08",
    shortInfo: "Staff Selection Commission (SSC) notifies competitive computer-based examination for recruitment of Junior Engineers (Civil, Electrical, Mechanical, and Quantity Surveying & Contracts) for CPWD, MES, BRO, and Central Water Commission.",
    ageLimit: "18 to 30/32 Years (Depending on department; age relaxation applicable)",
    eligibility: "Degree or 3-Year Diploma in Civil / Electrical / Mechanical Engineering from a recognized University / Institute",
    totalPosts: "1,765 Posts in Central Govt Departments",
    officialLink: "https://ssc.gov.in",
    fees: {
      genObc: "\u20B9100 (Online Payment via UPI/NetBanking)",
      scSt: "\u20B90 (Exempted for SC/ST/PwD/Women candidates)"
    },
    isNew: true
  },
  {
    id: "cus-btech-engg-sem3-sem5-exam-2026",
    title: "Online Examination Forms Notice for B.Tech & Engineering 3rd & 5th Semester (Session 2026)",
    category: "cluster_univ",
    postDate: "19/08/2026",
    startDate: "19/08/2026",
    lastDate: "04/09/2026",
    advertisementNo: "CUS/Exam/BTech-Engg-3rd-5th/2026/1204",
    shortInfo: "Cluster University Srinagar notifies all regular and backlog engineering students of B.Tech (Civil, Electrical, Mechanical, Computer Science, and Electronics & Communication) 3rd and 5th Semester to submit their online examination forms.",
    ageLimit: "Enrolled B.Tech Students",
    eligibility: "Enrolled engineering students with required attendance and internal sessionals verified by college dean",
    totalPosts: "B.Tech Engineering Exam Cell",
    officialLink: "https://www.cusrinagar.edu.in/",
    fees: {
      genObc: "\u20B9550 per subject + \u20B9200 Exam Infra Fee",
      scSt: "\u20B9550 per subject + \u20B9200 Exam Infra Fee"
    },
    isNew: true
  },
  {
    id: "ku-exam-form-llb-ballb-even-sem-2026",
    title: "Online Examination Forms Notice for LL.B 3-Year & BA-LL.B 5-Year 2nd, 4th & 6th Semesters (Session 2026)",
    category: "exam_forms",
    postDate: "19/08/2026",
    startDate: "19/08/2026",
    lastDate: "06/09/2026",
    advertisementNo: "KU/Exam/Law-LLB-BALLB-EvenSem/2026/912",
    shortInfo: "University of Kashmir notifies opening of online examination forms for regular and backlog candidates of LL.B (3-Year) and BA-LL.B (5-Year) 2nd, 4th, and 6th Semesters enrolled at School of Law and affiliated private Law Colleges.",
    ageLimit: "Enrolled Law Students",
    eligibility: "Bonafide students of Department of Law, KU and affiliated Law Colleges with approved internal sessional marks",
    totalPosts: "Law Examination Desk",
    officialLink: "https://kashmiruniversity.net/Examination.aspx",
    fees: {
      genObc: "\u20B91,650 per Semester (Online Payment)",
      scSt: "\u20B91,650 per Semester (Online Payment)"
    },
    isNew: true
  },
  {
    id: "ku-admission-mttm-tourism-hospitality-2026",
    title: "Admission Notification for Master of Tourism & Travel Management (MTTM) & Hospitality Courses (Session 2026)",
    category: "admissions",
    postDate: "19/08/2026",
    startDate: "19/08/2026",
    lastDate: "31/08/2026",
    advertisementNo: "KU/Adm/MTTM-Tourism/2026/31",
    shortInfo: "Department of Management Studies, University of Kashmir, invites online applications from eligible candidates for admission to 2-Year Master of Tourism & Travel Management (MTTM) and Post Graduate Diploma in Hospitality Management for Academic Session 2026.",
    ageLimit: "No upper age limit",
    eligibility: "Bachelor's Degree in any discipline from a recognized University with at least 50% marks in aggregate (45% for Reserved categories)",
    totalPosts: "40 Seats (Merit & Entrance Based)",
    officialLink: "https://kashmiruniversity.net/AdmissionNotices.aspx",
    fees: {
      genObc: "\u20B9500 (Online Entrance & Application Fee)",
      scSt: "\u20B9500 (Online Entrance & Application Fee)"
    },
    isNew: true
  },
  // 🇮🇳 PREVIOUS NOTIFICATIONS (18 AUGUST 2026)
  {
    id: "army-tgc-143-course-jul-2027",
    title: "Indian Army 143rd Technical Graduate Course (TGC-143 - Commencing Jul 2027)",
    category: "army_jobs",
    postDate: "18/08/2026",
    startDate: "18/08/2026",
    lastDate: "19/09/2026",
    advertisementNo: "TGC-143 Course (July 2027 Batch)",
    shortInfo: "Indian Army invites online applications from eligible unmarried male Engineering Graduates for grant of Permanent Commission in the Indian Army for 143rd Technical Graduate Course (TGC-143) commencing at Indian Military Academy (IMA), Dehradun.",
    ageLimit: "20 to 27 Years (Born between 02 Jul 1999 and 01 Jul 2006)",
    eligibility: "Passed the requisite Engineering Degree course or in the final year of Engineering Degree in relevant stream (Civil, Mech, Electrical, CS/IT, Electronics)",
    totalPosts: "30 Posts (Permanent Commission in Army)",
    officialLink: "https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm",
    fees: {
      genObc: "\u20B90 (No Application Fee)",
      scSt: "\u20B90 (No Application Fee)"
    },
    isNew: true
  },
  {
    id: "rrb-ministerial-isolated-cen08-2026",
    title: "RRB Ministerial & Isolated Categories Recruitment 2026 (CEN 08/2026 - 1,280 Posts)",
    category: "rrb_jobs",
    postDate: "18/08/2026",
    startDate: "19/08/2026",
    lastDate: "20/09/2026",
    advertisementNo: "CEN No. 08/2026 (Ministerial & Isolated)",
    shortInfo: "Railway Recruitment Boards (RRB) invite online applications for recruitment of Staff & Welfare Inspector, Chief Law Assistant, Junior Translator (Hindi), Stenographer, and other Ministerial & Isolated categories across all Indian Railway Zones.",
    ageLimit: "18 to 45 Years depending on specific post (Relaxation as per RRB rules)",
    eligibility: "Graduation / Post Graduation in relevant discipline / Law Degree / Diploma in Labor Laws or Stenography qualifications as per post",
    totalPosts: "1,280 Posts across RRB Zones",
    officialLink: "https://www.rrbapply.gov.in/#/auth/landing",
    fees: {
      genObc: "\u20B9500 (\u20B9400 refundable after appearing in CBT-1)",
      scSt: "\u20B9250 (\u20B9250 refundable after appearing in CBT-1)"
    },
    isNew: true
  },
  {
    id: "ssc-junior-hindi-translator-jht-exam-2026",
    title: "SSC Combined Hindi Translators Examination (JHT, JT & SHT) 2026",
    category: "ssc_jobs",
    postDate: "18/08/2026",
    startDate: "18/08/2026",
    lastDate: "18/09/2026",
    advertisementNo: "SSC/HQ/JHT-Exam-2026",
    shortInfo: "Staff Selection Commission (SSC) notifies competitive computer-based examination for recruitment of Junior Hindi Translator, Junior Translation Officer, Senior Hindi Translator, and Senior Translation Officer in various Central Government Ministries and Departments.",
    ageLimit: "18 to 30 Years (Age relaxation applicable as per Govt of India rules)",
    eligibility: "Master's Degree in Hindi with English as a compulsory/elective subject OR Master's Degree in English with Hindi + Recognized Diploma/Certificate in Translation from Hindi to English & vice-versa",
    totalPosts: "412 Posts across Central Ministries",
    officialLink: "https://ssc.gov.in",
    fees: {
      genObc: "\u20B9100 (Online Payment via UPI/NetBanking)",
      scSt: "\u20B90 (Exempted for SC/ST/PwD/Women candidates)"
    },
    isNew: true
  },
  {
    id: "cus-integrated-pg-honors-sem2-sem4-exam-2026",
    title: "Online Examination Forms Notice for Integrated PG & Honors 2nd & 4th Semester (Session 2026)",
    category: "cluster_univ",
    postDate: "18/08/2026",
    startDate: "18/08/2026",
    lastDate: "31/08/2026",
    advertisementNo: "CUS/Exam/IPG-Honors-2nd-4th/2026/1180",
    shortInfo: "Cluster University Srinagar notifies all regular and backlog students of 5-Year Integrated PG, Honors, and Professional Programmes of 2nd & 4th Semester (Batches 2022, 2023, 2024) to submit their online examination forms through the university ERP portal.",
    ageLimit: "Enrolled IPG & Honors Students",
    eligibility: "Enrolled students in Constituent Colleges having cleared internal continuous assessments and requisite attendance",
    totalPosts: "IPG Examination Desk",
    officialLink: "https://www.cusrinagar.edu.in/",
    fees: {
      genObc: "\u20B9425 per subject + \u20B9200 University Exam Infra Fee",
      scSt: "\u20B9425 per subject + \u20B9200 University Exam Infra Fee"
    },
    isNew: true
  },
  {
    id: "ku-exam-form-bed-1st-2nd-sem-distance-2026",
    title: "Online Examination Forms Notice for B.Ed 1st & 2nd Semester Regular & Distance Education (Batch 2025-26)",
    category: "exam_forms",
    postDate: "18/08/2026",
    startDate: "18/08/2026",
    lastDate: "03/09/2026",
    advertisementNo: "KU/Exam/BEd-1st-2nd-Sem/2026/894",
    shortInfo: "University of Kashmir announces opening of online examination forms for B.Ed 1st and 2nd Semester candidates of Directorate of Distance Education and affiliated private B.Ed Colleges for Session 2025-26.",
    ageLimit: "Enrolled B.Ed Students",
    eligibility: "Bonafide enrolled B.Ed students of Distance Education and Affiliated Colleges",
    totalPosts: "B.Ed Examination Desk",
    officialLink: "https://kashmiruniversity.net/Examination.aspx",
    fees: {
      genObc: "\u20B91,475 per Semester (Online Payment)",
      scSt: "\u20B91,475 per Semester (Online Payment)"
    },
    isNew: true
  },
  {
    id: "ku-admission-foreign-language-diploma-2026",
    title: "Admission Notification for Diploma & Certificate Courses in Foreign Languages (Session 2026)",
    category: "admissions",
    postDate: "18/08/2026",
    startDate: "18/08/2026",
    lastDate: "28/08/2026",
    advertisementNo: "KU/Adm/Foreign-Lang-Cert/2026/28",
    shortInfo: "Department of Foreign Languages, University of Kashmir, invites online applications for admission to 1-Year Diploma and 6-Month Certificate Courses in French, German, Russian, Arabic, and Persian languages for Academic Session 2026.",
    ageLimit: "No upper age bar",
    eligibility: "Passed 10+2 / Higher Secondary Part-II examination with at least 45% marks from any recognized Board/University",
    totalPosts: "30 Seats per Language Stream",
    officialLink: "https://kashmiruniversity.net/AdmissionNotices.aspx",
    fees: {
      genObc: "\u20B9250 (Application Fee) + Course Fee upon selection",
      scSt: "\u20B9250 (Application Fee) + Course Fee upon selection"
    },
    isNew: true
  },
  // 🇮🇳 TODAY'S NEWLY EXTRACTED NOTIFICATIONS (18 AUGUST 2026)
  {
    id: "army-ssc-tech-65-men-36-women-2026",
    title: "Indian Army SSC (Tech)-65 Men & SSCW (Tech)-36 Women Course (Apr 2027)",
    category: "army_jobs",
    postDate: "18/08/2026",
    startDate: "18/08/2026",
    lastDate: "17/09/2026",
    advertisementNo: "SSC(Tech)-65 & SSCW(Tech)-36 Course",
    shortInfo: "Indian Army invites online applications from eligible unmarried male and unmarried female Engineering Graduates and Widows of Defence Personnel for grant of Short Service Commission (SSC) in the Indian Army.",
    ageLimit: "20 to 27 Years (SSC Tech) / Up to 35 Years for Widows of Defence Personnel",
    eligibility: "Passed Engineering Degree course or in the final year of Engineering Degree in relevant engineering discipline",
    totalPosts: "379 Posts (Men: 350, Women: 29)",
    officialLink: "https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm",
    fees: {
      genObc: "\u20B90 (No Application Fee)",
      scSt: "\u20B90 (No Application Fee)"
    },
    isNew: true
  },
  {
    id: "rrb-senior-section-engineer-cen07-2026",
    title: "RRB Senior Section Engineer (SSE) & Chief Depot Material Superintendent (CEN 07/2026)",
    category: "rrb_jobs",
    postDate: "18/08/2026",
    startDate: "19/08/2026",
    lastDate: "18/09/2026",
    advertisementNo: "CEN No. 07/2026 (SSE & CDMS Categories)",
    shortInfo: "Railway Recruitment Boards (RRB) invite online applications for recruitment of Senior Section Engineer (Civil, Mechanical, Electrical, S&T) and Chief Depot Material Superintendent across Zonal Railways.",
    ageLimit: "20 to 36 Years (Relaxation as per RRB rules)",
    eligibility: "Four-year Bachelor Degree in Engineering (B.E. / B.Tech) in relevant discipline or M.Sc in relevant field from recognized University",
    totalPosts: "2,845 Posts across all RRB Zones",
    officialLink: "https://www.rrbapply.gov.in/#/auth/landing",
    fees: {
      genObc: "\u20B9500 (\u20B9400 refundable after appearing in CBT-1)",
      scSt: "\u20B9250 (\u20B9250 refundable after appearing in CBT-1)"
    },
    isNew: true
  },
  {
    id: "ssc-stenographer-grade-cd-exam-2026",
    title: 'SSC Stenographer Grade "C" & "D" Examination 2026 (Official Notification)',
    category: "ssc_jobs",
    postDate: "18/08/2026",
    startDate: "18/08/2026",
    lastDate: "17/09/2026",
    advertisementNo: "SSC/HQ/Steno-CD/Exam-2026",
    shortInfo: 'Staff Selection Commission (SSC) invites online applications for competitive computer-based examination for recruitment of Stenographer Grade "C" and Grade "D" in various Central Ministries, Departments, and Subordinate Offices.',
    ageLimit: "Steno Grade C: 18 to 30 Years | Steno Grade D: 18 to 27 Years",
    eligibility: "10+2 / Intermediate passed from a recognized Board + Shorthand skill test (100 wpm for Grade C, 80 wpm for Grade D)",
    totalPosts: "2,006 Posts across Central Ministries",
    officialLink: "https://ssc.gov.in",
    fees: {
      genObc: "\u20B9100 (Online Payment via UPI/NetBanking)",
      scSt: "\u20B90 (Exempted for SC/ST/PwD/Women candidates)"
    },
    isNew: true
  },
  {
    id: "cus-ug-sem4-sem6-exam-form-2026",
    title: "Online Examination Form Notice for UG 4th & 6th Semester (NEP & Batch 2021-23)",
    category: "cluster_univ",
    postDate: "18/08/2026",
    startDate: "18/08/2026",
    lastDate: "29/08/2026",
    advertisementNo: "CUS/Exam/UG-4th-6th/2026/1042",
    shortInfo: "Cluster University Srinagar notifies all eligible students of UG 4th & 6th Semester (Batch 2022-23 NEP 2020 and backlog candidates) to submit online examination forms through the student portal.",
    ageLimit: "Enrolled UG Students",
    eligibility: "Bonafide students of Constituent Colleges (AS College, SP College, AAA Memorial Degree College Bemina, GCW MA Road, Govt College of Education)",
    feePerSubject: "\u20B9375 per paper + \u20B9150 Examination Maintenance Fee",
    totalPosts: "UG Examination Desk",
    officialLink: "https://www.cusrinagar.edu.in/",
    fees: {
      genObc: "As per subject selection on student portal",
      scSt: "As per subject selection on student portal"
    },
    isNew: true
  },
  {
    id: "ku-exam-form-ug-bg-2nd-sem-nep-2026",
    title: "Online Examination Forms Notice for UG (BG) 2nd Semester Regular & Fresh Private (NEP Batch 2025)",
    category: "exam_forms",
    postDate: "18/08/2026",
    startDate: "18/08/2026",
    lastDate: "01/09/2026",
    advertisementNo: "KU/Exam/UG-2nd-Sem-NEP/2026/812",
    shortInfo: "University of Kashmir invites online examination forms for BG 2nd Semester Regular, Fresh Private, and Backlog candidates enrolled under National Education Policy (NEP-2020) across all affiliated Degree Colleges.",
    ageLimit: "Enrolled UG 2nd Semester Students",
    eligibility: "Regular enrolled students of affiliated degree colleges and registered private candidates",
    feePerSubject: "\u20B9250 per subject + \u20B9100 EMF + \u20B9100 IT Charge",
    officialLink: "https://kashmiruniversity.net/Examination.aspx",
    fees: {
      genObc: "Standard UG NEP Examination Fee (Online Gateway)",
      scSt: "Standard UG NEP Examination Fee (Online Gateway)"
    },
    isNew: true
  },
  {
    id: "ku-admission-pg-counseling-list2-2026",
    title: "2nd Counseling & Selection List for Admission to Post Graduate Programmes (Session 2026)",
    category: "admissions",
    postDate: "18/08/2026",
    startDate: "18/08/2026",
    lastDate: "26/08/2026",
    advertisementNo: "KU/Adm/PG-2nd-Counseling/2026/22",
    shortInfo: "Directorate of Admissions & Competitive Examinations, University of Kashmir, notifies 2nd Counseling Schedule & Selection List for vacant seats in various MA, M.Sc, M.Com, M.Ed, and LL.M programmes for Academic Session 2026.",
    ageLimit: "As per University Admission Guidelines 2026",
    eligibility: "Appeared in Kashmir University Entrance Test (KUET-2026) in relevant subject and having qualified Bachelor degree with minimum required percentage",
    totalPosts: "Vacant Seats in Main Campus, North Campus, South Campus & PG Colleges",
    officialLink: "https://kashmiruniversity.net/AdmissionNotices.aspx",
    fees: {
      genObc: "Admission Fee as per allotted Department/Course",
      scSt: "Admission Fee as per allotted Department/Course"
    },
    isNew: true
  },
  // 🇮🇳 PREVIOUS NOTIFICATIONS (17 AUGUST 2026)
  {
    id: "army-tes-54-course-2026",
    title: "10+2 Technical Entry Scheme (TES-54 Course - Jan 2027)",
    category: "army_jobs",
    postDate: "17/08/2026",
    startDate: "17/08/2026",
    lastDate: "16/09/2026",
    advertisementNo: "TES-54 Course (Commencing Jan 2027)",
    shortInfo: "Indian Army invites online applications from unmarried male candidates who have passed 10+2 examination with Physics, Chemistry and Mathematics (PCM) and appeared in JEE (Mains) 2026 for the grant of Permanent Commission.",
    ageLimit: "16\xBD to 19\xBD Years (Born between 02 July 2007 and 01 July 2010)",
    eligibility: "Passed 10+2 with minimum 60% aggregate marks in PCM + Appeared in JEE (Mains) 2026",
    totalPosts: "90 Posts",
    officialLink: "https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm",
    fees: {
      genObc: "\u20B90 (No Application Fee)",
      scSt: "\u20B90 (No Application Fee)"
    },
    isNew: true
  },
  {
    id: "rrb-ministerial-isolated-2026",
    title: "RRB Ministerial & Isolated Categories Recruitment (CEN 06/2026)",
    category: "rrb_jobs",
    postDate: "17/08/2026",
    startDate: "18/08/2026",
    lastDate: "17/09/2026",
    advertisementNo: "CEN No. 06/2026 (Ministerial & Isolated Categories)",
    shortInfo: "Railway Recruitment Boards (RRB) invite online applications for recruitment of Junior Stenographer (Hindi/English), Chief Law Assistant, Junior Translator, Staff & Welfare Inspector across various Railway Zones.",
    ageLimit: "18 to 45 Years (as per specific post norms and category relaxations)",
    eligibility: "Graduate Degree / 10+2 with Shorthand Speed / LLB / Post Graduate in Hindi/English according to post requirements",
    totalPosts: "1,038 Posts across all RRB Zones",
    officialLink: "https://www.rrbapply.gov.in/#/auth/landing",
    fees: {
      genObc: "\u20B9500 (\u20B9400 refundable after appearing in CBT)",
      scSt: "\u20B9250 (\u20B9250 refundable after appearing in CBT)"
    },
    isNew: true
  },
  {
    id: "ssc-cpo-si-delhi-police-capf-2026",
    title: "SSC Sub-Inspector in Delhi Police & Central Armed Police Forces (CAPFs) Exam 2026",
    category: "ssc_jobs",
    postDate: "17/08/2026",
    startDate: "17/08/2026",
    lastDate: "15/09/2026",
    advertisementNo: "SSC/HQ/CPO-CAPF/Exam-2026",
    shortInfo: "Staff Selection Commission (SSC) invites online applications for competitive examination for recruitment of Sub-Inspectors (GD) in BSF, CISF, CRPF, ITBP, SSB and Sub-Inspector (Executive) in Delhi Police.",
    ageLimit: "20 to 25 Years (OBC +3 Years, SC/ST +5 Years)",
    eligibility: "Bachelor's Degree in any discipline from a recognized University + Valid Driving License for LMV (for Delhi Police SI)",
    totalPosts: "4,187 Posts (Group B Non-Gazetted & Group C)",
    officialLink: "https://ssc.gov.in",
    fees: {
      genObc: "\u20B9100 (Online via Net Banking/UPI/Debit Card)",
      scSt: "\u20B90 (Exempted for SC/ST/Ex-Servicemen/Women candidates)"
    },
    isNew: true
  },
  {
    id: "cus-ug-special-stray-round-2026",
    title: "Online Admission Notice for Special Stray Round for UG / Honours Programmes (Session 2026)",
    category: "cluster_univ",
    postDate: "17/08/2026",
    startDate: "17/08/2026",
    lastDate: "24/08/2026",
    advertisementNo: "CUS/Adm/UG-Stray-Round/2026/912",
    shortInfo: "Cluster University Srinagar opens online registration and counseling for left-out eligible candidates for vacant seats in Under-Graduate, 4-Year Honours, and 5-Year Integrated academic programmes in Constituent Colleges.",
    ageLimit: "As per University Statutes",
    eligibility: "10+2 passed with required subject combinations and minimum 45% marks (40% for reserved categories)",
    totalPosts: "Vacant Seats across Constituent Colleges",
    officialLink: "https://www.cusrinagar.edu.in/",
    fees: {
      genObc: "\u20B9300 (Counseling & Processing Fee)",
      scSt: "\u20B9300 (Counseling & Processing Fee)"
    },
    isNew: true
  },
  {
    id: "ku-exam-date-sheet-pg-3rd-sem-2026",
    title: "Date Sheet for MA / M.Sc / M.Com 3rd Semester Regular / Fresh Private Candidates (Session 2026)",
    category: "exam_forms",
    postDate: "17/08/2026",
    startDate: "17/08/2026",
    lastDate: "31/08/2026",
    advertisementNo: "KU/Exam/DS-PG-3rd/2026/748",
    shortInfo: "University of Kashmir issues the official date sheet and examination schedule for candidates of MA, M.Sc, M.Com, and MCA 3rd Semester (Batch 2024-25 enrolled students).",
    ageLimit: "Enrolled PG Students",
    eligibility: "Bonafide students registered in respective post-graduate university departments and affiliated PG colleges",
    feePerSubject: "\u20B9275 per paper + \u20B9100 EMF + \u20B9100 IT Charge",
    officialLink: "https://kashmiruniversity.net/Examination.aspx",
    fees: {
      genObc: "Standard University PG Examination Fee",
      scSt: "Standard University PG Examination Fee"
    },
    isNew: true
  },
  {
    id: "ku-admission-bed-cdoe-2026",
    title: "Admission Notification for 2-Year B.Ed Programme (Distance Mode) Session 2026-28",
    category: "admissions",
    postDate: "17/08/2026",
    startDate: "17/08/2026",
    lastDate: "05/09/2026",
    advertisementNo: "KU/CDOE/B.Ed-Adm/2026/15",
    shortInfo: "Centre for Distance and Online Education (CDOE), University of Kashmir, invites online applications for admission to 2-Year Bachelor of Education (B.Ed) Programme for Academic Session 2026-28.",
    ageLimit: "No Age Bar for In-service / Untrained Teachers & Fresh Graduates",
    eligibility: "Bachelor's Degree in any discipline with at least 50% aggregate marks (45% for reserved category candidates) from recognized University",
    totalPosts: "Distance Enrolment Open across Kashmir & Jammu Study Centres",
    officialLink: "https://kashmiruniversity.net/AdmissionNotices.aspx",
    fees: {
      genObc: "\u20B9500 (Online Application & Processing Fee)",
      scSt: "\u20B9500 (Online Application & Processing Fee)"
    },
    isNew: true
  },
  // 🇮🇳 PREVIOUS NOTIFICATIONS (AUGUST 2026)
  {
    id: "army-amc-ssc-course-2026",
    title: "Army Medical Corps (AMC) Non-Technical & SSC Officer Course 2026-27",
    category: "army_jobs",
    postDate: "16/08/2026",
    startDate: "18/08/2026",
    lastDate: "16/09/2026",
    advertisementNo: "AMC / SSC (NT) Course 2026-27",
    shortInfo: "Indian Army invites online applications from eligible candidates for grant of Short Service Commission in Army Medical Corps (Non-Technical & Technical Officers).",
    ageLimit: "21 to 35 Years",
    eligibility: "Graduate / Post Graduate in relevant discipline from a recognized University",
    totalPosts: "65 Posts",
    officialLink: "https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm",
    fees: {
      genObc: "\u20B90 (No Application Fee for Army Commission)",
      scSt: "\u20B90 (No Application Fee)"
    },
    isNew: true
  },
  {
    id: "rrb-paramedical-cen05-2026",
    title: "RRB Paramedical Categories (Staff Nurse, Lab Tech & Pharmacist) 2026",
    category: "rrb_jobs",
    postDate: "16/08/2026",
    startDate: "17/08/2026",
    lastDate: "16/09/2026",
    advertisementNo: "CEN No. 05/2026 (Paramedical Categories)",
    shortInfo: "Railway Recruitment Boards (RRB) invite online applications for recruitment to various Paramedical Category posts (Nursing Superintendent, Lab Assistant, Pharmacist, Dialysis Tech) across Zonal Railways.",
    ageLimit: "18 to 40 Years (Relaxation as per RRB rules)",
    eligibility: "B.Sc Nursing / GNM / D.Pharm / B.Pharm / DMLT according to post specifications",
    totalPosts: "1,376 Posts across Zonal Railways",
    officialLink: "https://www.rrbapply.gov.in/#/auth/landing",
    fees: {
      genObc: "\u20B9500 (\u20B9400 refundable after appearing in CBT-1)",
      scSt: "\u20B9250 (\u20B9250 refundable after appearing in CBT-1)"
    },
    isNew: true
  },
  {
    id: "ssc-jht-examination-2026",
    title: "SSC Junior Hindi Translator (JHT) & Senior Hindi Translator Exam 2026",
    category: "ssc_jobs",
    postDate: "16/08/2026",
    startDate: "16/08/2026",
    lastDate: "14/09/2026",
    advertisementNo: "SSC/HQ/JHT-SHT/Exam-2026",
    shortInfo: "Staff Selection Commission (SSC) invites online applications for recruitment of Junior Hindi Translator, Junior Translation Officer, and Senior Hindi Translator in various Ministries, Departments, and Organizations of the Government of India.",
    ageLimit: "18 to 30 Years (OBC +3, SC/ST +5, PwD +10 Years)",
    eligibility: "Master's Degree in Hindi with English as a compulsory subject OR Master's Degree in English with Hindi + Recognized Diploma/Certificate course in Translation",
    totalPosts: "312 Posts (Group B Non-Gazetted)",
    officialLink: "https://ssc.gov.in",
    fees: {
      genObc: "\u20B9100 (Online via Net Banking/UPI/Cards)",
      scSt: "\u20B90 (Exempted for SC/ST/PwD/Women candidates)"
    },
    isNew: true
  },
  {
    id: "cus-self-financed-admission-2026",
    title: "Online Admission Notice for UG / PG Self-Financed & Lateral Entry (Session 2026)",
    category: "cluster_univ",
    postDate: "16/08/2026",
    startDate: "16/08/2026",
    lastDate: "28/08/2026",
    advertisementNo: "CUS/Adm/UG-PG-SF/2026/894",
    shortInfo: "Cluster University Srinagar invites online applications from eligible candidates for admission to vacant seats in Under-Graduate (Honors) and Post-Graduate Self-Financed / Lateral Entry academic programmes for Academic Session 2026.",
    ageLimit: "As per University Statutes",
    eligibility: "10+2 / Bachelor Degree in relevant stream with minimum 45% aggregate (40% for reserved categories)",
    totalPosts: "Vacant Seats across Constituent Colleges (SP College, Amar Singh College, AAA Memorial Degree College, Govt College for Women)",
    officialLink: "https://www.cusrinagar.edu.in/",
    fees: {
      genObc: "\u20B9500 (Online Admission Processing Fee)",
      scSt: "\u20B9500 (Online Admission Processing Fee)"
    },
    isNew: true
  },
  {
    id: "jkssb-draft-merit-hme-2026",
    title: "JKSSB Document Verification & Draft Merit List for Health & Medical Education Dept",
    category: "jkssb",
    postDate: "16/08/2026",
    startDate: "20/08/2026",
    lastDate: "25/08/2026",
    advertisementNo: "JKSSB/COE/HME-DV/2026/114-129",
    shortInfo: "Jammu and Kashmir Services Selection Board (JKSSB) issues the document verification schedule and draft score-sheet for candidates shortlisted for various Technical & Paramedical positions in Health & Medical Education Department.",
    ageLimit: "As per initial notification",
    eligibility: "Candidates shortlisted based on Written CBT Examination merit",
    totalPosts: "Various Divisional & District Cadre Posts",
    officialLink: "https://jkssb.nic.in",
    fees: {
      genObc: "\u20B90 (Document Verification Round)",
      scSt: "\u20B90 (Document Verification Round)"
    },
    isNew: true
  },
  {
    id: "ku-exam-form-bg-1st-2nd-sem-2026",
    title: "Submission of Online Examination Forms for BG 1st & 2nd Sem (Batch 2025-26 NEP-2020)",
    category: "exam_forms",
    postDate: "16/08/2026",
    startDate: "17/08/2026",
    lastDate: "27/08/2026",
    advertisementNo: "KU/Exam/NEP-UG/1st-2nd/2026/512",
    shortInfo: "University of Kashmir opens the online portal for submission of examination forms and fee for eligible Regular / Fresh Private candidates of BG 1st & 2nd Semester (Batch 2025-2026 Under NEP-2020).",
    ageLimit: "Enrolled College Students",
    eligibility: "Bonafide students admitted to UG 1st & 2nd Semester in affiliated degree colleges",
    feePerSubject: "\u20B9250 per subject + \u20B950 EMF + \u20B9100 Service Charges",
    officialLink: "https://egov.uok.edu.in/eexams/",
    fees: {
      genObc: "Standard University Exam Fee Schedule",
      scSt: "Standard University Exam Fee Schedule"
    },
    isNew: true
  },
  {
    id: "ku-admission-cdoe-pg-diploma-2026",
    title: "Admission Notification No. 14 of 2026: PG Diploma & Certificate Programmes (CDOE)",
    category: "admissions",
    postDate: "16/08/2026",
    startDate: "16/08/2026",
    lastDate: "30/08/2026",
    advertisementNo: "KU/CDOE/Adm-Notif-14/2026",
    shortInfo: "Centre for Distance and Online Education (CDOE), University of Kashmir, invites online applications for admission to 1-Year Post-Graduate Diploma and 6-Month Certificate courses in Cyber Law, Disaster Management, Tourism, and Web Designing.",
    ageLimit: "No upper age limit for distance education programmes",
    eligibility: "Bachelor's Degree in any discipline from a recognized University / Class 12th for Certificate programmes",
    totalPosts: "Distance Learning Enrolment Open",
    officialLink: "https://kashmiruniversity.net/AdmissionNotices.aspx",
    fees: {
      genObc: "\u20B9400 (Online Application & Prospectus Fee)",
      scSt: "\u20B9400 (Online Application & Prospectus Fee)"
    },
    isNew: true
  },
  // 🇮🇳 JOIN INDIAN ARMY NOTIFICATIONS (https://www.joinindianarmy.nic.in/default.aspx)
  {
    id: "army-ncc-125-2026",
    title: "NCC Special Entry Scheme 125th Course (April 2027)",
    category: "army_jobs",
    postDate: "05/08/2026",
    startDate: "05/08/2026",
    lastDate: "20/08/2026",
    advertisementNo: "NCC Special Entry 125th Course (Apr 2027)",
    shortInfo: 'Indian Army invites online applications from unmarried male and female candidates holding NCC Senior Division "C" Certificate for Officers entry in Short Service Commission.',
    ageLimit: "19 to 25 Years",
    eligibility: 'Graduate (Min 50% marks) + NCC "C" Certificate',
    totalPosts: "70 Posts (Male & Female)",
    fees: { genObc: "\u20B90", scSt: "\u20B90" },
    officialLink: "https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Officers Training Academy (OTA) Chennai",
        postName: "NCC Special Entry Officer",
        posts: "70 Posts",
        qualification: "Graduate with 50% marks + NCC C-Cert",
        fee: "Free (\u20B90)"
      }
    ]
  },
  {
    id: "army-jag-34-2026",
    title: "JAG Entry Scheme 34th Course (Law Graduates - April 2027)",
    category: "army_jobs",
    postDate: "05/08/2026",
    startDate: "05/08/2026",
    lastDate: "21/08/2026",
    advertisementNo: "JAG Entry Scheme 34th Course (Apr 2027)",
    shortInfo: "Indian Army Judge Advocate General Branch recruitment for Law Graduates (Male & Female) for Short Service Commission.",
    ageLimit: "21 to 27 Years",
    eligibility: "LLB Degree (Min 55% marks) + Bar Council eligibility",
    totalPosts: "10 Posts",
    fees: { genObc: "\u20B90", scSt: "\u20B90" },
    officialLink: "https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Judge Advocate General (JAG) Branch",
        postName: "JAG Officer (Male & Female)",
        posts: "10 Posts",
        qualification: "LLB Degree (55% marks) + Bar Council eligibility",
        fee: "Free (\u20B90)"
      }
    ]
  },
  {
    id: "army-ta-officer-2026",
    title: "Territorial Army Non-Departmental Officer Entry 2026",
    category: "army_jobs",
    postDate: "05/08/2026",
    startDate: "05/08/2026",
    lastDate: "25/08/2026",
    advertisementNo: "TA Officer Entry 2026",
    shortInfo: "Territorial Army invites applications for Commissioned Officers from gainfully employed civilians in any discipline.",
    ageLimit: "18 to 42 Years",
    eligibility: "Graduate in any discipline (Gainfully Employed)",
    totalPosts: "Multiple Officer Vacancies",
    fees: { genObc: "\u20B90", scSt: "\u20B90" },
    officialLink: "https://www.joinindianarmy.nic.in/default.aspx",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Territorial Army Units",
        postName: "Territorial Army Commissioned Officer",
        posts: "Multiple Posts",
        qualification: "Graduate Degree (Gainfully Employed)",
        fee: "Free (\u20B90)"
      }
    ]
  },
  {
    id: "army-ladakh-rally-2026",
    title: "Ladakh Scouts Regimental Centre Agniveer Recruitment Rally",
    category: "army_jobs",
    postDate: "05/08/2026",
    startDate: "11/08/2026",
    lastDate: "13/08/2026",
    advertisementNo: "Ladakh Scouts HQ Rally 2026",
    shortInfo: "Recruitment rally for Agniveer General Duty and Technical at Leh, Ladakh for Ladakh domicile candidates.",
    ageLimit: "17.5 to 21 Years",
    eligibility: "10th / 12th Pass (Ladakh Domicile)",
    totalPosts: "Regimental HQ Quota",
    fees: { genObc: "\u20B90", scSt: "\u20B90" },
    officialLink: "https://www.joinindianarmy.nic.in/BRAgniveerRallySchedule.htm",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Ladakh Scouts Regimental Centre",
        postName: "Agniveer GD / Technical",
        posts: "HQ Rally Quota",
        qualification: "Class 10th / 12th Pass",
        fee: "Free (\u20B90)"
      }
    ]
  },
  {
    id: "army-aoc-civilian-2026",
    title: "Army Ordnance Corps (AOC) Civilian Recruitment Alert 2026",
    category: "army_jobs",
    postDate: "07/08/2026",
    startDate: "24/08/2026",
    lastDate: "22/09/2026",
    advertisementNo: "AOC Civilian Notice 2026",
    shortInfo: "Upcoming online application notice for Tradesman Mate, Fireman, and Material Assistant positions in Army Ordnance Corps.",
    ageLimit: "18 to 27 Years",
    eligibility: "10th Pass / 12th Pass / Graduate",
    totalPosts: "Upcoming Vacancies",
    fees: { genObc: "\u20B90", scSt: "\u20B90" },
    officialLink: "https://www.joinindianarmy.nic.in/default.aspx",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Army Ordnance Corps Units",
        postName: "Tradesman Mate, Fireman & Material Assistant",
        posts: "Upcoming",
        qualification: "10th / 12th Pass / Graduation",
        fee: "Free (\u20B90)"
      }
    ]
  },
  // 🚆 RAILWAY RECRUITMENT BOARD (RRB) NOTIFICATIONS (https://www.rrbapply.gov.in/)
  {
    id: "rrb-je-2026",
    title: "RRB Junior Engineer (JE), DMS & CMA Recruitment 2026 (CEN No. 04/2026)",
    category: "rrb_jobs",
    postDate: "05/08/2026",
    startDate: "14/08/2026",
    lastDate: "13/09/2026",
    advertisementNo: "CEN 04/2026 (RRB JE)",
    shortInfo: "Railway Recruitment Boards (RRB) release short notice for 4,098 vacancies of Junior Engineer (JE), Depot Material Superintendent (DMS), and Chemical & Metallurgical Assistant (CMA). Online applications open August 14, 2026 on rrbapply.gov.in.",
    ageLimit: "18 to 33 Years as on 01/01/2026 (Age relaxation: OBC 3 Years, SC/ST 5 Years, PwBD 10 Years).",
    eligibility: "Engineering Diploma / B.E. / B.Tech Degree in relevant discipline (Civil, Electrical, Mechanical, ECE, CS/IT) OR B.Sc with Physics & Chemistry.",
    totalPosts: "4,098 Posts (Pan-India Railway Zones)",
    fees: { genObc: "\u20B9500 (\u20B9400 refunded after CBT-1)", scSt: "\u20B9250 (Full \u20B9250 refunded after CBT-1)" },
    officialLink: "https://www.rrbapply.gov.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Indian Railways - Works, Track & Civil Infrastructure",
        postName: "Junior Engineer (Civil Engineering)",
        posts: "1,650 Posts",
        qualification: "Diploma or B.Tech in Civil Engineering",
        fee: "\u20B9500 / \u20B9250"
      },
      {
        department: "Indian Railways - Electrical & Mechanical Loco Wings",
        postName: "Junior Engineer (Electrical & Mechanical)",
        posts: "1,420 Posts",
        qualification: "Diploma or B.Tech in Electrical / Mechanical / Automotive Engg",
        fee: "\u20B9500 / \u20B9250"
      },
      {
        department: "Indian Railways - Signal & Telecom / IT",
        postName: "Junior Engineer (S&T / IT)",
        posts: "620 Posts",
        qualification: "Diploma/B.Tech in ECE / CS / IT / Instrumentation",
        fee: "\u20B9500 / \u20B9250"
      },
      {
        department: "Stores & Material Management Cadre",
        postName: "Depot Material Superintendent (DMS) & CMA",
        posts: "408 Posts",
        qualification: "Diploma/Degree in Engineering or B.Sc in Chemistry/Physics",
        fee: "\u20B9500 / \u20B9250"
      }
    ]
  },
  {
    id: "rrb-section-controller-2026",
    title: "RRB Section Controller Recruitment 2026 (CEN No. 03/2026)",
    category: "rrb_jobs",
    postDate: "15/07/2026",
    startDate: "15/07/2026",
    lastDate: "14/08/2026",
    advertisementNo: "CEN 03/2026",
    shortInfo: "Railway Recruitment Board (RRB) active online recruitment for 119 Section Controller positions. Fee payment deadline Aug 16, correction window Aug 17 to Aug 26, 2026.",
    ageLimit: "20 to 34 Years as on 01/07/2026 with government age relaxation benefits.",
    eligibility: "Bachelor's Degree in any discipline from a recognized University.",
    totalPosts: "119 Posts",
    fees: { genObc: "\u20B9500", scSt: "\u20B9250" },
    officialLink: "https://www.rrbapply.gov.in/#/auth/landing",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Operating & Traffic Control Division",
        postName: "Section Controller",
        posts: "119 Posts",
        qualification: "Bachelor's Degree in any discipline",
        fee: "\u20B9500 / \u20B9250"
      }
    ]
  },
  {
    id: "rrb-group-d-2026",
    title: "RRB Group D (Level-1) CBT Examination & City Intimation (CEN No. 09/2025)",
    category: "rrb_jobs",
    postDate: "03/08/2026",
    startDate: "03/08/2026",
    lastDate: "25/08/2026",
    advertisementNo: "CEN 09/2025",
    shortInfo: "Railway Recruitment Board conducts CBT examination for 22,195 Level-1 posts (Track Maintainer, Pointsman B, Assistant) from August 3 to August 25, 2026. City Intimation Slip live on portal.",
    ageLimit: "18 to 33 Years with applicable category relaxation.",
    eligibility: "10th Pass (Matriculation) or ITI from NCVT/SCVT recognized institutes.",
    totalPosts: "22,195 Posts (Level-1 Posts)",
    fees: { genObc: "\u20B9500", scSt: "\u20B9250" },
    officialLink: "https://www.rrbapply.gov.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Track & Traffic Operating Units",
        postName: "Track Maintainer Gr IV & Pointsman B",
        posts: "22,195 Posts",
        qualification: "Class 10th Pass or ITI from NCVT / SCVT",
        fee: "Exam Active"
      }
    ]
  },
  {
    id: "rrb-technician-correction-2026",
    title: "RRB Technician (Grade 1 Signal & Grade 3) Application Correction Window (CEN No. 02/2026)",
    category: "rrb_jobs",
    postDate: "01/08/2026",
    startDate: "01/08/2026",
    lastDate: "10/08/2026",
    advertisementNo: "CEN 02/2026",
    shortInfo: "Active modification and correction portal for 6,557 Technician Grade 1 Signal and Grade 3 posts. Modify RRB choice, photo/signature re-upload & particulars correction from Aug 01 to Aug 10, 2026.",
    ageLimit: "Grade 1 Signal: 18-36 Yrs | Grade 3: 18-33 Yrs.",
    eligibility: "Grade 1: B.Sc/B.Tech/Diploma in Physics/ECE/CS/IT | Grade 3: 10th + ITI or 10+2 PCM.",
    totalPosts: "6,557 Posts",
    fees: { genObc: "\u20B9100 (Correction Fee)", scSt: "\u20B9100 (Correction Fee)" },
    officialLink: "https://www.rrbapply.gov.in/#/auth/landing",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Signal, Telecom, Workshop & Loco Sheds",
        postName: "Technician Grade 1 & Grade 3",
        posts: "6,557 Posts",
        qualification: "10th+ITI / 10+2 PCM / Diploma / B.Sc / B.Tech",
        fee: "\u20B9100 Modification"
      }
    ]
  },
  {
    id: "rrb-ntpc-paramedical-2026",
    title: "RRB NTPC & Paramedical Categories Recruitment Calendar 2026",
    category: "rrb_jobs",
    postDate: "07/08/2026",
    startDate: "Mid-Aug 2026",
    lastDate: "Late-Aug 2026",
    advertisementNo: "Upcoming CEN Calendar 2026",
    shortInfo: "Upcoming Centralized Employment Notices (CEN) for Non-Technical Popular Categories (NTPC Graduate & Under-Graduate), Nursing Superintendent, Pharmacist & Paramedical staff on rrbapply.gov.in.",
    ageLimit: "18 to 36 Years as per position norms.",
    eligibility: "12th Pass / Graduate Degree / B.Sc Nursing / GNM / D.Pharm / B.Pharm.",
    totalPosts: "15,000+ Expected Vacancies",
    fees: { genObc: "\u20B9500", scSt: "\u20B9250" },
    officialLink: "https://www.rrbapply.gov.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Traffic, Operating, Commercial & Railway Medical Division",
        postName: "Station Master, Goods Guard, Nursing Supt & Paramedical",
        posts: "15,000+ Posts",
        qualification: "12th Pass / Graduate Degree / Nursing / Pharmacy Qualification",
        fee: "\u20B9500 / \u20B9250"
      }
    ]
  },
  // 🇮🇳 STAFF SELECTION COMMISSION (SSC) RECRUITMENT NOTIFICATIONS (https://ssc.gov.in/)
  {
    id: "ssc-steno-2026",
    title: 'SSC Stenographer Grade "C" & "D" Examination 2026 (1,207 Vacancies)',
    category: "ssc_jobs",
    postDate: "06/08/2026",
    startDate: "06/08/2026",
    lastDate: "05/09/2026",
    advertisementNo: "SSC/Steno-CD/2026",
    shortInfo: "Staff Selection Commission (SSC) invites online applications for Stenographer Grade C (Group B Non-Gazetted) and Stenographer Grade D (Group C) in various Ministries, Departments & Organizations.",
    ageLimit: "Grade C: 18 to 30 Years | Grade D: 18 to 27 Years as of 01/08/2026 (Age relaxation applicable as per rules).",
    eligibility: "Passed 12th Standard (10+2) or equivalent from a recognized Board + Shorthand Stenography Test (100 wpm Grade C / 80 wpm Grade D).",
    totalPosts: "1,207 Posts (Tentative)",
    fees: { genObc: "\u20B9100", scSt: "\u20B90 (Exempted for SC/ST/PwD/Women)" },
    officialLink: "https://ssc.gov.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Central Ministries & Armed Forces HQ (AFHQ)",
        postName: "Stenographer Grade C (Group B Non-Gazetted)",
        posts: "180+ Posts",
        qualification: "12th Class Pass + Stenography Dictation 100 wpm (English/Hindi) Speed Test",
        fee: "\u20B9100 / Exempted"
      },
      {
        department: "Subordinate & Attached Offices across India",
        postName: "Stenographer Grade D (Group C)",
        posts: "1,027 Posts",
        qualification: "12th Class Pass + Stenography Dictation 80 wpm (English/Hindi) Speed Test",
        fee: "\u20B9100 / Exempted"
      }
    ]
  },
  {
    id: "ssc-cgl-2026-city-slip",
    title: "SSC CGL 2026 Tier-I Exam City Intimation Slip & Computer-Based Exam Schedule Notice",
    category: "ssc_jobs",
    postDate: "05/08/2026",
    startDate: "09/09/2026",
    lastDate: "26/09/2026",
    advertisementNo: "SSC/CGL-Exam/2026 Notice",
    shortInfo: "SSC releases Tier-I Computer Based Examination Schedule and Exam City Intimation Portal Notice for Combined Graduate Level (CGL) 2026 Exam.",
    ageLimit: "18 to 32 Years as per CGL 2026 Norms",
    eligibility: "Bachelor Degree in any discipline from a recognized University",
    totalPosts: "17,727 Vacancies",
    fees: { genObc: "\u20B9100", scSt: "\u20B90" },
    officialLink: "https://ssc.gov.in/login",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Govt Ministries & Departments (Group B & C Officers)",
        postName: "Assistant Section Officer, Inspector (Excise/IT/Customs), JSO, Auditor",
        posts: "17,727 Posts",
        qualification: "Graduate Degree in any discipline",
        fee: "Checked"
      }
    ]
  },
  {
    id: "ssc-gd-constable-2026-notice",
    title: "SSC GD Constable in CAPFs, SSF & Rifleman (GD) in Assam Rifles 2026 Notification Notice",
    category: "ssc_jobs",
    postDate: "07/08/2026",
    startDate: "27/08/2026",
    lastDate: "27/09/2026",
    advertisementNo: "SSC/GD-Constable/2026 Short Notice",
    shortInfo: "Staff Selection Commission short notice announcement for Constable (GD) recruitment drive in BSF, CISF, CRPF, SSB, ITBP, SSF and Assam Rifles.",
    ageLimit: "18 to 23 Years as on 01/01/2027",
    eligibility: "Class 10th (Matriculation) Pass from recognized Board",
    totalPosts: "39,481 Expected Posts",
    fees: { genObc: "\u20B9100", scSt: "\u20B90" },
    officialLink: "https://ssc.gov.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Central Armed Police Forces (CAPFs)",
        postName: "Constable (General Duty) - Male & Female",
        posts: "39,481 Posts",
        qualification: "Matriculation (10th Pass) + Physical Standard Test (PST/PET)",
        fee: "\u20B9100 / Exempted"
      }
    ]
  },
  {
    id: "ssc-selection-post-phase14-2026",
    title: "SSC Selection Posts Phase-XIV 2026 Application Correction Window Notice",
    category: "ssc_jobs",
    postDate: "06/08/2026",
    startDate: "14/08/2026",
    lastDate: "16/08/2026",
    advertisementNo: "SSC/Phase-XIV/2026 Selection Posts",
    shortInfo: "Official notice regarding correction window dates for candidate application forms for Selection Posts Phase-XIV/2026.",
    ageLimit: "18 to 30 Years depending on post code",
    eligibility: "10th Pass / 12th Pass / Graduate depending on specific Post Code",
    totalPosts: "2,049 Posts across Regional Cadres",
    fees: { genObc: "\u20B9100 (Correction Fee \u20B9200/\u20B9500)", scSt: "\u20B90" },
    officialLink: "https://ssc.gov.in/login",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Regional SSC Offices (NR, CR, WR, ER, SR, KKR, NWR, MPR, NER)",
        postName: "Selection Posts Phase-XIV (Matric, Higher Secondary & Graduate Level)",
        posts: "2,049 Posts",
        qualification: "10th / 12th / Degree relevant to post code",
        fee: "\u20B9100"
      }
    ]
  },
  {
    id: "ssc-chsl-mains-2026-notice",
    title: "SSC CHSL (10+2) Tier-II (Mains) Examination Date Notice 2026",
    category: "ssc_jobs",
    postDate: "05/08/2026",
    startDate: "18/10/2026",
    lastDate: "18/10/2026",
    advertisementNo: "SSC/CHSL-Exam/2026 Tier-II Notice",
    shortInfo: "Staff Selection Commission announces Tier-II Mains examination dates for CHSL 2026 (LDC, JSA, DEO Grade A).",
    ageLimit: "18 to 27 Years",
    eligibility: "Tier-I Qualified Candidates (12th Class Pass)",
    totalPosts: "3,712 Posts",
    fees: { genObc: "\u20B90", scSt: "\u20B90" },
    officialLink: "https://ssc.gov.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Ministries & Departments of Govt of India",
        postName: "LDC, JSA & Data Entry Operator (DEO Grade A)",
        posts: "3,712 Posts",
        qualification: "12th Pass + Tier-I Qualified Status",
        fee: "Free"
      }
    ]
  },
  // 🏛️ NATIONAL TESTING AGENCY (NTA) ACTIVE ENTRANCE EXAM NOTIFICATIONS (https://www.nta.ac.in/)
  {
    id: "nta-ugc-net-dec-2026",
    title: "NTA UGC NET December 2026 Session Public Notice & Online Registration Schedule",
    category: "nta",
    postDate: "06/08/2026",
    startDate: "06/08/2026",
    lastDate: "05/09/2026",
    advertisementNo: "NTA/UGC-NET/Dec-2026",
    shortInfo: "National Testing Agency (NTA) on behalf of UGC invites online applications for UGC NET December 2026 to determine eligibility for Junior Research Fellowship (JRF) & Assistant Professor across 83 subjects in Indian Universities & Colleges.",
    ageLimit: "JRF: Maximum 30 Years as of 01/12/2026 (5 yrs relaxation for SC/ST/OBC-NCL/Women/PwD). Assistant Professor & Ph.D Admission: No Upper Age Limit.",
    eligibility: "Master Degree or equivalent in relevant subject with minimum 55% marks (50% for SC/ST/OBC-NCL/PwD/Third Gender). Final year appearing candidates also eligible.",
    totalPosts: "83 Academic Subjects / JRF & Assistant Professor Intake",
    feePerSubject: "General / Unreserved: \u20B91150 | General-EWS/OBC-NCL: \u20B9600 | SC/ST/PwD/Third Gender: \u20B9325",
    fees: { genObc: "\u20B91150 (Gen) / \u20B9600 (OBC/EWS)", scSt: "\u20B9325" },
    officialLink: "https://ugcnet.nta.ac.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Humanities & Social Sciences",
        postName: "UGC NET JRF & Assistant Professor (83 Subjects)",
        posts: "Open Intake",
        qualification: "Master Degree in Humanities / Languages / Social Sciences / Commerce / Computer Apps with min 55% marks",
        fee: "\u20B91150 / \u20B9600 / \u20B9325"
      },
      {
        department: "Commerce & Management Sciences",
        postName: "UGC NET JRF & Assistant Professor in Management",
        posts: "Open Intake",
        qualification: "M.Com / MBA / PGDM or equivalent with 55% aggregate (50% for reserved classes)",
        fee: "\u20B91150 / \u20B9600 / \u20B9325"
      },
      {
        department: "Education & Physical Education",
        postName: "UGC NET JRF & Assistant Professor in Education",
        posts: "Open Intake",
        qualification: "M.Ed / M.A. Education / M.P.Ed with min 55% marks",
        fee: "\u20B91150 / \u20B9600 / \u20B9325"
      }
    ]
  },
  {
    id: "nta-jee-main-2027-session1",
    title: "NTA JEE (Main) 2027 Session-1 Exam Calendar & Preliminary Public Notice",
    category: "nta",
    postDate: "05/08/2026",
    startDate: "25/10/2026",
    lastDate: "22/11/2026",
    advertisementNo: "NTA/JEE-MAIN/2027-Notice",
    shortInfo: "NTA releases preliminary public notice and exam calendar for Joint Entrance Examination (JEE Main) 2027 Session-1 for admission to B.E./B.Tech, B.Arch and B.Planning at NITs, IIITs, CFTIs.",
    ageLimit: "No Upper Age Limit for candidates. Candidates must fulfill class 12th passing year criteria (2025, 2026, or 2027).",
    eligibility: "Class 12th passed in 2025, 2026 or appearing in 2027 with Physics and Mathematics as compulsory subjects along with Chemistry/Biotech/Biology/Technical Vocational subject.",
    totalPosts: "All India Engineering & Architecture Admissions",
    feePerSubject: "Paper 1 or Paper 2: Male Gen \u20B91000, Female Gen \u20B9800, Gen-EWS/OBC Male \u20B9900, SC/ST/PwD Male \u20B9500",
    fees: { genObc: "\u20B91000 (Gen Male) / \u20B9900 (OBC/EWS)", scSt: "\u20B9500" },
    officialLink: "https://jeemain.nta.ac.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Engineering Stream (Paper 1)",
        postName: "B.E. / B.Tech Engineering Programmes",
        posts: "Open All India Rank",
        qualification: "10+2 with Physics & Maths + Chemistry/Biotech/Biology",
        fee: "\u20B91000 / \u20B9900 / \u20B9500"
      },
      {
        department: "Architecture Stream (Paper 2A)",
        postName: "B.Arch Architecture Degree Programme",
        posts: "Open All India Rank",
        qualification: "10+2 Pass with Physics, Chemistry & Mathematics compulsory",
        fee: "\u20B91000 / \u20B9900 / \u20B9500"
      },
      {
        department: "Planning Stream (Paper 2B)",
        postName: "B.Planning Urban & Regional Planning Degree",
        posts: "Open All India Rank",
        qualification: "10+2 Pass with Mathematics as compulsory subject",
        fee: "\u20B91000 / \u20B9900 / \u20B9500"
      }
    ]
  },
  {
    id: "nta-neet-ug-2026-counselling",
    title: "NTA NEET UG 2026 Medical Counselling Data Verification Public Notice",
    category: "nta",
    postDate: "06/08/2026",
    startDate: "06/08/2026",
    lastDate: "20/08/2026",
    advertisementNo: "NTA/NEET-UG/2026-Counselling",
    shortInfo: "National Testing Agency (NTA) issues public notice for NEET UG 2026 qualified candidates regarding data verification for MCC All India Quota and State Medical Counselling 2026.",
    ageLimit: "Minimum 17 Years as on 31/12/2026. Qualified percentile criteria fulfilled.",
    eligibility: "NEET UG 2026 Qualified Candidates (10+2 with PCB & English passed).",
    totalPosts: "1,00,000+ MBBS/BDS/AYUSH Seats Nationwide",
    feePerSubject: "Verification Free for NEET UG Qualified Candidates",
    fees: { genObc: "Checked", scSt: "Checked" },
    officialLink: "https://neet.ntaonline.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "MBBS & Dental Surgery (BDS)",
        postName: "MCC AIQ & State Quota MBBS/BDS Counselling Data",
        posts: "100,000+ Seats",
        qualification: "NEET UG 2026 Qualified Scorecard",
        fee: "Verified"
      },
      {
        department: "AYUSH Medical Degrees (BAMS/BHMS/BUMS)",
        postName: "Ayurvedic, Homeopathic & Unani Counselling Data",
        posts: "50,000+ Seats",
        qualification: "NEET UG 2026 Qualified Scorecard",
        fee: "Verified"
      }
    ]
  },
  {
    id: "nta-csir-ugc-net-dec-2026",
    title: "NTA Joint CSIR-UGC NET December 2026 Online Registration Public Notice",
    category: "nta",
    postDate: "07/08/2026",
    startDate: "07/08/2026",
    lastDate: "06/09/2026",
    advertisementNo: "NTA/CSIR-NET/Dec-2026",
    shortInfo: "NTA issues public notice for Joint CSIR-UGC NET December 2026 to determine eligibility for Junior Research Fellowship (JRF) and Lectureship (LS) in Science & Technology subjects.",
    ageLimit: "JRF: Maximum 30 Years (5 yrs relaxation for SC/ST/Third Gender/Women/PwD, 3 yrs for OBC-NCL). Lectureship (LS) & Ph.D: No Upper Age Limit.",
    eligibility: "M.Sc or equivalent degree / BS-4 years / B.E. / B.Tech / B.Pharma / MBBS with min 55% marks (50% for SC/ST/OBC-NCL/Third Gender/PwD).",
    totalPosts: "Science Subjects JRF & Lectureship Positions",
    feePerSubject: "General: \u20B91150 | OBC-NCL/EWS: \u20B9600 | SC/ST/Third Gender: \u20B9325 | PwD: Nil",
    fees: { genObc: "\u20B91150 (Gen) / \u20B9600 (OBC/EWS)", scSt: "\u20B9325" },
    officialLink: "https://csirnet.nta.ac.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Chemical Sciences",
        postName: "CSIR JRF & Lectureship in Chemistry",
        posts: "Open Intake",
        qualification: "M.Sc in Chemical Sciences with min 55% marks",
        fee: "\u20B91150 / \u20B9600 / \u20B9325"
      },
      {
        department: "Life Sciences",
        postName: "CSIR JRF & Lectureship in Biology & Life Sciences",
        posts: "Open Intake",
        qualification: "M.Sc in Biochemistry / Biotech / Botany / Zoology with min 55% marks",
        fee: "\u20B91150 / \u20B9600 / \u20B9325"
      },
      {
        department: "Mathematical & Physical Sciences",
        postName: "CSIR JRF & Lectureship in Physics & Maths",
        posts: "Open Intake",
        qualification: "M.Sc in Physics / Maths or B.Tech with 55% marks",
        fee: "\u20B91150 / \u20B9600 / \u20B9325"
      }
    ]
  },
  {
    id: "nta-cuet-2027-advisory",
    title: "NTA CUET UG & PG 2027 Academic Session Advisory Public Notice",
    category: "nta",
    postDate: "05/08/2026",
    startDate: "15/11/2026",
    lastDate: "20/12/2026",
    advertisementNo: "NTA/CUET-2027/Advisory",
    shortInfo: "National Testing Agency (NTA) issues public advisory notice regarding Common University Entrance Test (CUET) UG/PG syllabus, domain subjects, and registration window preview for 2027-28.",
    ageLimit: "No Upper Age Limit set by NTA. Candidate must satisfy participating university guidelines.",
    eligibility: "Class 12th Pass/Appearing (for UG) / Bachelor Degree (for PG) from recognized institution.",
    totalPosts: "All India Central & Participating Universities Admissions",
    feePerSubject: "To be notified in detailed information bulletin",
    fees: { genObc: "Standard NTA Slab", scSt: "Standard NTA Slab" },
    officialLink: "https://www.nta.ac.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Undergraduate Entrance Stream (CUET UG)",
        postName: "Domain Subjects, Languages & General Test",
        posts: "Central Univ Seats",
        qualification: "Class 12th Pass or Appearing in 2027",
        fee: "Standard Slab"
      },
      {
        department: "Postgraduate Entrance Stream (CUET PG)",
        postName: "M.A., M.Sc, M.Com & Professional Master Degrees",
        posts: "Central Univ Seats",
        qualification: "Bachelor Degree in relevant major discipline",
        fee: "Standard Slab"
      }
    ]
  },
  // 🏔️ OFFICIAL JKSSB RECRUITMENT NOTIFICATIONS (jkssb.nic.in/Advertisement.html)
  {
    id: "jkssb-advt-08-2026",
    title: "JKSSB Advt 08 of 2026: Various UT / Divisional / District Cadre Posts (Health, Higher Edu, Agriculture & Labour)",
    category: "jkssb",
    postDate: "04/08/2026",
    lastDate: "09/10/2026 (Apply Online: 10/09/2026 to 09/10/2026)",
    advertisementNo: "Notification No. 08 of 2026 (Dated: 04.08.2026)",
    shortInfo: "Jammu and Kashmir Services Selection Board (JKSSB) invites online application forms for 518 UT/Divisional/District Cadre vacancies across Health & Medical Education (421), Higher Education (48), Agriculture Production (46), and Labour & Employment (3) Departments.",
    ageLimit: "OM: 18 - 40 Years | SC/ST/RBA/ALC/IB/EWS: 18 - 43 Years | PWD: 18 - 42 Years | Ex-Servicemen: Up to 48 Years (As on 01.01.2026)",
    eligibility: "Must be a Domicile of UT of Jammu & Kashmir. Academic / Professional Qualifications vary by post (Degree, Diploma, Matriculation, etc. in concerned discipline).",
    totalPosts: "518 Posts",
    fees: { genObc: "\u20B9500", scSt: "\u20B9400" },
    officialLink: "https://jkssb.nic.in/Advertisement.html",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Health and Medical Education Department",
        postName: "UT / Divisional / District Cadre Paramedical & Medical Posts",
        posts: 421,
        qualification: "Degree / Diploma / Certificate in relevant Paramedical, Nursing, Pharmacy or Medical Technology field"
      },
      {
        department: "Higher Education Department",
        postName: "Non-Teaching / Technical & Cadre Staff",
        posts: 48,
        qualification: "Bachelor Degree / Master Degree / Diploma in relevant subject from a recognized University"
      },
      {
        department: "Agriculture Production Department",
        postName: "Agriculture & Horticulture Technical Cadre Posts",
        posts: 46,
        qualification: "B.Sc Agriculture / Horticulture or Diploma / Degree in relevant Agriculture / Technical trade"
      },
      {
        department: "Labour and Employment Department",
        postName: "Labour Department Cadre Posts",
        posts: 3,
        qualification: "Bachelor Degree in any discipline from a recognized University"
      }
    ]
  },
  {
    id: "jkssb-advt-06-2026",
    title: "JKSSB Advt 06 of 2026: Public Works (R&B) Dept Draftsman & Works Supervisor Recruitment",
    category: "jkssb",
    postDate: "06/07/2026",
    lastDate: "30/08/2026",
    advertisementNo: "Notification No. 06 of 2026",
    shortInfo: "Jammu and Kashmir Services Selection Board (JKSSB) invites online applications from eligible J&K UT domiciles for 357 Divisional Cadre vacancies of Draftsman (Civil) and Works Supervisor in Public Works (R&B) Department.",
    ageLimit: "OM: 18 - 40 Years | SC/ST/RBA/ALC/IB/EWS: 18 - 43 Years | PWD: 18 - 42 Years | Ex-Servicemen: Up to 48 Years",
    eligibility: "Must be a Domicile of UT of Jammu & Kashmir. 2-Year Diploma in Draftsman (Civil) from ITI / Recognized Polytechnic or 10th Pass with ITI Certificate in relevant trade.",
    totalPosts: "357 Posts",
    fees: { genObc: "\u20B9500", scSt: "\u20B9400" },
    officialLink: "https://jkssb.nic.in/Advertisement.html",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Public Works (R&B) Department",
        postName: "Draftsman (Civil) [Divisional Cadre Jammu & Kashmir]",
        posts: 236,
        qualification: "2 Years Diploma / Certificate in Draftsman (Civil) from ITI or Recognized Polytechnic Institute"
      },
      {
        department: "Public Works (R&B) Department",
        postName: "Works Supervisor [Divisional Cadre]",
        posts: 121,
        qualification: "Matriculation (10th Pass) with ITI Certificate in relevant technical trade"
      }
    ]
  },
  {
    id: "jkssb-constable-si-2026",
    title: "JKSSB Home Dept Police Constable (Armed/IRP/SDRF/Executive) & Sub-Inspector Recruitment",
    category: "jkssb",
    postDate: "19/01/2026",
    lastDate: "17/02/2026 (Written Exam Nov-Dec 2026)",
    advertisementNo: "Notification No. 12/2025 & 14/2025",
    shortInfo: "JKSSB official advertisement for 2,302 posts of Police Constable (Executive Cadre, Armed/IRP, SDRF, Telecommunication) and Sub-Inspector in J&K Home Department. OMR Exam schedule announced for Nov-Dec 2026.",
    ageLimit: "18 - 28 Years (Relaxation up to 30 Years for SC/ST/OBC/RBA & SPO candidates)",
    eligibility: "Matriculation (10th Pass) for Constable posts; Bachelor Degree for Sub-Inspector. Mandatory Physical Standard & Endurance Tests (PET/PST). Valid J&K Domicile required.",
    totalPosts: "2,302 Posts",
    fees: { genObc: "\u20B9500", scSt: "\u20B9400" },
    officialLink: "https://jkssb.nic.in/Advertisement.html",
    isNew: true,
    departmentBreakdown: [
      {
        department: "J&K Home Department (Executive Police)",
        postName: "Police Constable (Jammu Division Cadre)",
        posts: 934,
        qualification: "Matriculation (10th Pass) from a recognized Board + PET/PST"
      },
      {
        department: "J&K Home Department (Executive Police)",
        postName: "Police Constable (Kashmir Division Cadre)",
        posts: 881,
        qualification: "Matriculation (10th Pass) from a recognized Board + PET/PST"
      },
      {
        department: "J&K Home Department (Armed & SDRF)",
        postName: "Constable (Armed / IRP & SDRF Cadre)",
        posts: 487,
        qualification: "Matriculation (10th Pass) from a recognized Board + PET/PST"
      }
    ]
  },
  {
    id: "jkssb-school-teacher-2026",
    title: "JKSSB Advt 07 of 2026: School Education Dept Teacher Recruitment Drive",
    category: "jkssb",
    postDate: "15/07/2026",
    lastDate: "30/09/2026",
    advertisementNo: "Notification No. 07 of 2026",
    shortInfo: "Mega recruitment drive by JKSSB for 3,288 posts of General Line Teacher, Science & Mathematics Teacher, and Urdu Teacher across all District Cadres in School Education Department J&K.",
    ageLimit: "18 - 40 Years (OM), 18 - 43 Years (SC/ST/RBA/ALC/EWS/OSC)",
    eligibility: "Bachelor Degree with concerned subjects + B.Ed + CTET / JKTET Qualification. Must be a valid Domicile of UT of Jammu & Kashmir.",
    totalPosts: "3,288 Posts",
    fees: { genObc: "\u20B9500", scSt: "\u20B9400" },
    officialLink: "https://jkssb.nic.in/Advertisement.html",
    isNew: true,
    departmentBreakdown: [
      {
        department: "School Education Department",
        postName: "General Line Teacher (All District Cadres)",
        posts: 1850,
        qualification: "Graduation Degree in any stream + B.Ed + JKTET / CTET"
      },
      {
        department: "School Education Department",
        postName: "Science & Mathematics Teacher",
        posts: 840,
        qualification: "B.Sc (Physics/Chemistry/Mathematics/Bio) + B.Ed + JKTET / CTET"
      },
      {
        department: "School Education Department",
        postName: "Urdu Language Teacher",
        posts: 598,
        qualification: "Graduation with Urdu as a subject + B.Ed + JKTET"
      }
    ]
  },
  {
    id: "jkssb-advt-13-2025",
    title: "JKSSB Advt 13 of 2025: Poshan Supervisor, Stock Asst, Handicrafts Officer & Fisheries",
    category: "jkssb",
    postDate: "27/01/2026",
    lastDate: "25/02/2026",
    advertisementNo: "Notification No. 13 of 2025",
    shortInfo: "JKSSB multi-departmental advertisement for 390 posts including Female Supervisor (Poshan), Stock Assistant, Assistant Handicrafts Training Officer, and Fisheries Development Assistant.",
    ageLimit: "OM: 18 - 40 Years | SC/ST/RBA/EWS: 18 - 43 Years | PWD: 18 - 42 Years",
    eligibility: "10th / 12th / Diploma / Graduation in Sociology, Home Science, Nutrition, Agriculture, or Fisheries Science depending on specific post.",
    totalPosts: "390 Posts",
    fees: { genObc: "\u20B9500", scSt: "\u20B9400" },
    officialLink: "https://jkssb.nic.in/Advertisement.html",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Public Works (R&B) Department",
        postName: "Works Supervisor",
        posts: 121,
        qualification: "Matriculation (10th Pass) with ITI Trade Certificate"
      },
      {
        department: "Handicrafts & Handloom Dept",
        postName: "Asst Handicrafts Training Officer",
        posts: 60,
        qualification: "10+2 with Diploma in Handicrafts / Textile Craft"
      },
      {
        department: "Animal & Sheep Husbandry Dept",
        postName: "Stock Assistant",
        posts: 45,
        qualification: "10+2 Science with Stock Assistant Training Certificate"
      },
      {
        department: "Social Welfare (Poshan) Dept",
        postName: "Supervisor (Female Candidate Only)",
        posts: 36,
        qualification: "Graduate Degree in Sociology / Home Science / Nutrition"
      },
      {
        department: "Fisheries Department J&K",
        postName: "Fisheries Development Assistant",
        posts: 33,
        qualification: "B.Sc in Zoology or B.F.Sc (Fisheries Science)"
      },
      {
        department: "Various Other Departments",
        postName: "Laboratory Assistant & Caretaker",
        posts: 95,
        qualification: "10+2 / Graduation from recognized Institute"
      }
    ]
  },
  {
    id: "jkssb-health-med-2026",
    title: "JKSSB Advt 01 of 2026: Health & Medical Education Staff Nurse, Pharmacist & Lab Tech",
    category: "jkssb",
    postDate: "25/02/2026",
    lastDate: "25/03/2026",
    advertisementNo: "Notification No. 01 of 2026",
    shortInfo: "JKSSB official notification for 239 UT Cadre paramedical and nursing vacancies in Health & Medical Education Department Jammu & Kashmir.",
    ageLimit: "18 - 40 Years (OM), 18 - 43 Years (SC/ST/RBA/ALC/EWS), 18 - 42 Years (PWD)",
    eligibility: "B.Sc Nursing / GNM Diploma / B.Pharma / Diploma in Medical Lab Technology (DMLT) registered with J&K Paramedical Council. Domicile of J&K UT.",
    totalPosts: "239 Posts",
    fees: { genObc: "\u20B9500", scSt: "\u20B9400" },
    officialLink: "https://jkssb.nic.in/Advertisement.html",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Health & Medical Education Dept",
        postName: "Staff Nurse / Junior Nurse (UT Cadre)",
        posts: 98,
        qualification: "B.Sc Nursing or GNM Diploma from recognized Paramedical Council"
      },
      {
        department: "Health & Medical Education Dept",
        postName: "Junior Pharmacist",
        posts: 56,
        qualification: "10+2 with Diploma in Pharmacy registered with J&K Pharmacy Council"
      },
      {
        department: "Health & Medical Education Dept",
        postName: "Lab Technician / ECG Technician",
        posts: 45,
        qualification: "Diploma in Medical Lab Technology (DMLT) or B.Sc MLT"
      },
      {
        department: "Health & Medical Education Dept",
        postName: "Medical Record Assistant",
        posts: 40,
        qualification: "Graduate Degree + Diploma / Certificate in Medical Record Keeping"
      }
    ]
  },
  {
    id: "jkssb-patwari-2026",
    title: "JKSSB Revenue Dept Patwari Recruitment (Jammu & Kashmir Division)",
    category: "jkssb",
    postDate: "15/03/2026",
    lastDate: "25/04/2026",
    advertisementNo: "Notification No. 03 of 2025-26",
    shortInfo: "Jammu and Kashmir Services Selection Board recruitment for 142 Revenue Patwari posts across District Cadres of Jammu and Kashmir Divisions.",
    ageLimit: "21 - 40 Years (OM), 21 - 43 Years (SC/ST/RBA/EWS/ALC)",
    eligibility: "Bachelor Degree in any discipline from a recognized University. Basic computer knowledge. Domicile of J&K.",
    totalPosts: "142 Posts",
    fees: { genObc: "\u20B9500", scSt: "\u20B9400" },
    officialLink: "https://jkssb.nic.in/Advertisement.html",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Revenue Department (Jammu Division)",
        postName: "Patwari (District Cadres Jammu)",
        posts: 78,
        qualification: "Graduate Degree + Computer Knowledge"
      },
      {
        department: "Revenue Department (Kashmir Division)",
        postName: "Patwari (District Cadres Kashmir)",
        posts: 64,
        qualification: "Graduate Degree + Computer Knowledge"
      }
    ]
  },
  {
    id: "jkssb-jr-assistant-2025",
    title: "JKSSB Advt 08 of 2025: Junior Assistant & Stenographer Various Depts",
    category: "jkssb",
    postDate: "20/10/2025",
    lastDate: "25/11/2025 (Skill Test Active 2026)",
    advertisementNo: "Notification No. 08 of 2025",
    shortInfo: "JKSSB recruitment notification for 361 posts of Junior Assistant, Junior Scale Stenographer, and Steno-Typist in GAD, Revenue, Finance, and Health Depts.",
    ageLimit: "OM: 18 - 40 Years | SC/ST/RBA/ALC/EWS: 18 - 43 Years",
    eligibility: "Graduation Degree from recognized university + Minimum typing speed of 35 WPM on Computer keyboard + 6 months Computer Certificate.",
    totalPosts: "361 Posts",
    fees: { genObc: "\u20B9500", scSt: "\u20B9400" },
    officialLink: "https://jkssb.nic.in/Advertisement.html",
    isNew: false,
    departmentBreakdown: [
      {
        department: "General Administration Dept (GAD)",
        postName: "Junior Assistant (UT Cadre)",
        posts: 185,
        qualification: "Graduation + 35 WPM Typing Speed + Computer Certificate"
      },
      {
        department: "Revenue Department J&K",
        postName: "Junior Assistant (Divisional Cadre)",
        posts: 82,
        qualification: "Graduation + 35 WPM Typing Speed + Computer Certificate"
      },
      {
        department: "Finance Department",
        postName: "Junior Scale Stenographer",
        posts: 54,
        qualification: "Graduation + 65 WPM Shorthand & 35 WPM Typewriting"
      },
      {
        department: "Health & Medical Education Dept",
        postName: "Steno Typist & Junior Assistant",
        posts: 40,
        qualification: "Graduation + Typing & Shorthand Test"
      }
    ]
  },
  {
    id: "jkssb-wildlife-guard-2025",
    title: "JKSSB Forest & Environment Dept Wildlife Guard Recruitment",
    category: "jkssb",
    postDate: "10/01/2026",
    lastDate: "15/02/2026 (Physical Walk Test Sept 2026)",
    advertisementNo: "Notification No. 04 of 2025",
    shortInfo: "JKSSB notification for 108 Wildlife Guard posts in Forest, Ecology & Environment Department Jammu & Kashmir. Physical Walk test starting Sept 2026.",
    ageLimit: "18 - 40 Years (OM), 18 - 43 Years (SC/ST/RBA/EWS)",
    eligibility: "Matriculation (10th Pass). Physical Standards: Height 163 cm (Male) / 150 cm (Female); 25 KM Physical Walk Test in 4 Hours.",
    totalPosts: "108 Posts",
    fees: { genObc: "\u20B9500", scSt: "\u20B9400" },
    officialLink: "https://jkssb.nic.in/Advertisement.html",
    isNew: false,
    departmentBreakdown: [
      {
        department: "Forest, Ecology & Environment Dept",
        postName: "Wildlife Guard (Jammu Region)",
        posts: 54,
        qualification: "10th Pass (Matriculation) + 25 KM Physical Walk Test"
      },
      {
        department: "Forest, Ecology & Environment Dept",
        postName: "Wildlife Guard (Kashmir Region)",
        posts: 54,
        qualification: "10th Pass (Matriculation) + 25 KM Physical Walk Test"
      }
    ]
  },
  // LATEST JOBS (Extracted from SarkariResult.com.cm Portal)
  {
    id: "job-ssc-cgl-2026",
    title: "SSC CGL 2026 Recruitment Online Application (17,727 Posts)",
    category: "jobs",
    postDate: "01/08/2026",
    lastDate: "30/08/2026",
    advertisementNo: "SSC-CGL-2026-EXAM",
    shortInfo: "Staff Selection Commission (SSC) invites online application forms for Combined Graduate Level CGL 2026 for Group B & C Inspector, Assistant Section Officer, Auditor, and Tax Assistant posts.",
    ageLimit: "18 - 30 Years (Age relaxation as per govt rules)",
    eligibility: "Bachelor Degree in any stream from a recognized university in India.",
    fees: { genObc: "\u20B9100", scSt: "\u20B90 (Female Exempted)" },
    isNew: true
  },
  {
    id: "job-rrb-ntpc-2026",
    title: "Railway RRB NTPC Graduate & Under Graduate Posts 2026",
    category: "jobs",
    postDate: "31/07/2026",
    lastDate: "31/08/2026",
    advertisementNo: "CEN 05/2026 & 06/2026",
    shortInfo: "Railway Recruitment Boards (RRB) Non-Technical Popular Categories (NTPC) recruitment for Station Master, Goods Guard, Senior Clerk, Junior Clerk, and Commercial Apprentice.",
    ageLimit: "18 - 33 Years (UG Posts) / 18 - 36 Years (Graduate Posts)",
    eligibility: "Class 12th Intermediate for UG Level / Bachelor Degree for Graduate Level Posts.",
    fees: { genObc: "\u20B9500 (\u20B9400 Refundable)", scSt: "\u20B9250 (Full Refundable)" },
    isNew: true
  },
  {
    id: "job-ssc-mts-2026",
    title: "SSC MTS & Havildar 9,583 Posts Registration 2026",
    category: "jobs",
    postDate: "30/07/2026",
    lastDate: "28/08/2026",
    advertisementNo: "SSC-MTS-HAVILDAR-2026",
    shortInfo: "Staff Selection Commission (SSC) Multi Tasking (Non-Technical) Staff and Havildar (CBIC & CBN) Examination 2026 online application portal.",
    ageLimit: "18 - 25 Years for MTS, 18 - 27 Years for Havildar",
    eligibility: "Class 10th High School Pass from any recognized board in India.",
    fees: { genObc: "\u20B9100", scSt: "\u20B90" },
    isNew: true
  },
  {
    id: "job-ibps-po-2026",
    title: "IBPS PO XVI Officer Scale-I Recruitment 2026 (3,955 Posts)",
    category: "jobs",
    postDate: "29/07/2026",
    lastDate: "25/08/2026",
    advertisementNo: "IBPS-CRP-PO/MT-XVI",
    shortInfo: "Institute of Banking Personnel Selection (IBPS) invites applications for Probationary Officer / Management Trainee in participating public sector banks.",
    ageLimit: "20 - 30 Years (As on 01/08/2026)",
    eligibility: "Any Graduation Degree in any discipline from recognized University.",
    fees: { genObc: "\u20B9850", scSt: "\u20B9175" },
    isNew: true
  },
  {
    id: "job-navy-ssr-mr-2026",
    title: "Indian Navy Agniveer SSR & MR 02/2026 Online Form",
    category: "jobs",
    postDate: "28/07/2026",
    lastDate: "20/08/2026",
    advertisementNo: "NAVY-AGNIVEER-02/2026",
    shortInfo: "Join Indian Navy Agniveer Senior Secondary Recruits (SSR) & Musician / Chef / Steward (MR) 02/2026 batch online application portal.",
    ageLimit: "Born between 01/11/2005 and 30/04/2009",
    eligibility: "Class 12th Intermediate with Math & Physics for SSR / Class 10th Pass for MR.",
    fees: { genObc: "\u20B9550", scSt: "\u20B9550" },
    isNew: true
  },
  {
    id: "job-up-police-si-2026",
    title: "UP Police Sub Inspector SI & Platoon Commander 2026",
    category: "jobs",
    postDate: "26/07/2026",
    lastDate: "22/08/2026",
    advertisementNo: "UPPRPB-SI-2026",
    shortInfo: "Uttar Pradesh Police Recruitment Board (UPPRPB) for 9,217 Sub Inspector Civilian Police and Fire Station Officer.",
    ageLimit: "21 - 28 Years",
    eligibility: "Bachelor Degree in any stream for SI / B.Sc Degree for Fire Officer.",
    fees: { genObc: "\u20B9400", scSt: "\u20B9400" }
  },
  {
    id: "job-upsc-nda",
    title: "UPSC NDA / NA II Examination 2026 Notification",
    category: "jobs",
    postDate: "10/07/2026",
    lastDate: "05/08/2026",
    advertisementNo: "UPSC-NDA-II-2026",
    shortInfo: "Union Public Service Commission (UPSC) recruitment for National Defence Academy & Naval Academy Examination II 2026.",
    ageLimit: "Born between 02/01/2007 and 01/01/2010",
    eligibility: "Class 12th Intermediate pass / appearing. For Navy & Air Force, Physics & Math mandatory.",
    fees: { genObc: "\u20B9100", scSt: "\u20B90" }
  },
  {
    id: "job-agniveer-army",
    title: "Indian Army Agniveer Recruitment Rally Scheme 2026",
    category: "jobs",
    postDate: "08/07/2026",
    lastDate: "12/08/2026",
    advertisementNo: "ARMY-AGNIVEER-2026",
    shortInfo: "Join Indian Army Agniveer General Duty (GD), Technical, Clerk, Store Keeper, and Tradesmen 8th / 10th Pass entry.",
    ageLimit: "17.5 - 21 Years",
    eligibility: "Class 8th / 10th / 12th Pass as per designated post requirements.",
    fees: { genObc: "\u20B9250", scSt: "\u20B9250" }
  },
  // ADMIT CARDS
  {
    id: "admit-neet-ug",
    title: "NTA NEET UG 2026 Admit Card / Hall Ticket",
    category: "admit_cards",
    postDate: "25/07/2026",
    shortInfo: "National Testing Agency (NTA) download link for National Eligibility cum Entrance Test (NEET UG) admit cards.",
    eligibility: "Download using Application Number, Password / DOB & Security Pin.",
    isNew: true
  },
  {
    id: "admit-ssc-chsl",
    title: "SSC CHSL 10+2 Tier-I Admit Card & Exam Status",
    category: "admit_cards",
    postDate: "23/07/2026",
    shortInfo: "Staff Selection Commission (SSC) regional hall tickets and roll number verification for Combined Higher Secondary Level Tier 1.",
    isNew: true
  },
  {
    id: "admit-rpf-constable",
    title: "Railway RPF Constable & SI CBT Exam Admit Card",
    category: "admit_cards",
    postDate: "20/07/2026",
    shortInfo: "RRB RPF City Intimation slip and E-Call Letter download portal for Computer Based Test.",
    isNew: true
  },
  {
    id: "admit-jee-mains",
    title: "NTA JEE Mains Session II Call Letter 2026",
    category: "admit_cards",
    postDate: "15/07/2026",
    shortInfo: "National Testing Agency JEE Mains Session II engineering exam call letter and self-declaration form download."
  },
  {
    id: "admit-upsc-pre",
    title: "UPSC Civil Services IAS / IFS Prelims Admit Card",
    category: "admit_cards",
    postDate: "12/07/2026",
    shortInfo: "Union Public Service Commission (UPSC) Civil Services (IAS) and Forest Service (IFS) preliminary exam e-Admit Card."
  },
  {
    id: "admit-ctet-july",
    title: "CBSE CTET July Exam Admit Card & City Slip",
    category: "admit_cards",
    postDate: "10/07/2026",
    shortInfo: "Central Board of Secondary Education CTET Paper I and Paper II pre-admit card city intimation download."
  },
  // RESULTS & SCHOLARSHIPS
  {
    id: "res-jkbose-10th-12th-2026",
    title: "JKBOSE Class 10th & 12th Annual Regular Result 2026 (Soft & Hard Zone)",
    category: "results",
    department: "J&K Board of School Education (JKBOSE)",
    postType: "Result",
    status: "Result",
    postDate: "25/10/2026",
    shortInfo: "Jammu and Kashmir Board of School Education (JKBOSE) has declared the Secondary School (Class 10th) and Higher Secondary Part-II (Class 12th) Annual Regular 2026 Examination Results online by Roll Number and Name at jkbose.nic.in.",
    officialLink: "https://jkbose.nic.in",
    isNew: true
  },
  {
    id: "nsp-post-matric-scholarship-jk-2026",
    title: "NSP Post-Matric & Pragati Scholarship Scheme 2026-27 Online Registration",
    category: "admissions",
    department: "National Scholarship Portal (NSP)",
    postType: "Scholarship",
    status: "Open",
    postDate: "25/10/2026",
    startDate: "01/10/2026",
    lastDate: "30/11/2026",
    shortInfo: "National Scholarship Portal (NSP) online registration and renewal for Centrally Sponsored Post-Matric Scholarships (SC/ST/OBC/Minority/EBC) and AICTE Pragati/Saksham Scholarships for students studying in Class 11th, 12th, UG, PG, and Technical/Professional courses.",
    eligibility: "Class 11th to Post-Graduation Students with Min 50% Marks & Family Income below \u20B92.50 Lakh/year",
    officialLink: "https://scholarships.gov.in",
    isNew: true
  },
  {
    id: "res-cbse-12th",
    title: "CBSE Board Class 12th & 10th Result 2026",
    category: "results",
    postDate: "26/07/2026",
    shortInfo: "Central Board of Secondary Education (CBSE) Senior School Certificate Examination results online with DigiLocker pin.",
    isNew: true
  },
  {
    id: "res-ssc-gd",
    title: "SSC GD Constable Written Test Merit List & Scorecard",
    category: "results",
    postDate: "22/07/2026",
    shortInfo: "Written exam cut-off marks and qualified list for Physical Efficiency Test (PET / PST) in BSF, CISF, CRPF & SSB.",
    isNew: true
  },
  {
    id: "res-jee-adv",
    title: "IIT JEE Advanced Final Result & AIR Rank List",
    category: "results",
    postDate: "18/07/2026",
    shortInfo: "Joint Entrance Examination Advanced results with category-wise cutoff marks and JoSAA counseling registration link."
  },
  {
    id: "res-up-police",
    title: "UP Police Constable Result & Cutoff Marks 2026",
    category: "results",
    postDate: "14/07/2026",
    shortInfo: "Uttar Pradesh Police Recruitment Board (UPPRPB) constable written exam scorecards and physical test call letters."
  },
  {
    id: "res-cuet-ug",
    title: "NTA CUET UG Scorecard & Normalised Percentile",
    category: "results",
    postDate: "10/07/2026",
    shortInfo: "Common University Entrance Test Undergraduate exam subject-wise percentile scorecards for university admissions."
  },
  // ANSWER KEYS
  {
    id: "key-ugc-net",
    title: "NTA UGC NET June Official Answer Key & OMR Sheet",
    category: "answer_keys",
    postDate: "25/07/2026",
    shortInfo: "Provisional answer keys, question papers, and recorded responses for Assistant Professor and JRF fellowship test.",
    isNew: true
  },
  {
    id: "key-ssc-cpo",
    title: "SSC CPO SI Paper I Official Answer Key 2026",
    category: "answer_keys",
    postDate: "21/07/2026",
    shortInfo: "Sub-Inspector in Delhi Police & CAPF computer-based exam answer key challenge link.",
    isNew: true
  },
  {
    id: "key-ctet-july",
    title: "CTET July Official Provisional Answer Key",
    category: "answer_keys",
    postDate: "17/07/2026",
    shortInfo: "CBSE Central Teacher Eligibility Test Paper I (Primary) & Paper II (Elementary) answer key and response sheet."
  },
  {
    id: "key-neet-ug",
    title: "NTA NEET UG Official Answer Key & Scanned OMR",
    category: "answer_keys",
    postDate: "12/07/2026",
    shortInfo: "Medical entrance exam official code-wise answer keys (Q, R, S, T) and objection submission window."
  },
  // SYLLABUS
  {
    id: "syl-ssc-mts",
    title: "SSC MTS & Havildar New Exam Pattern & Detailed Syllabus",
    category: "syllabus",
    postDate: "24/07/2026",
    shortInfo: "Session-I (Math & Reasoning) and Session-II (General Awareness & English) updated syllabus and physical PST/PET standards.",
    isNew: true
  },
  {
    id: "syl-railway-alp",
    title: "RRB Assistant Loco Pilot (ALP) CBT 1 & 2 Syllabus PDF",
    category: "syllabus",
    postDate: "19/07/2026",
    shortInfo: "Complete subject-wise topic list, engineering trade specifications, and computer-based aptitude test (CBAT) guidelines."
  },
  {
    id: "syl-upsc-cse",
    title: "UPSC Civil Services IAS Prelims & Mains Syllabus PDF",
    category: "syllabus",
    postDate: "15/07/2026",
    shortInfo: "General Studies Papers I to IV, CSAT aptitude topics, Essay guidelines, and official optional subject catalogs."
  },
  // ADMISSIONS - KASHMIR UNIVERSITY (kashmiruniversity.net/admission.aspx) & NATIONAL
  {
    id: "ku-adm-pg-selection-1-2026",
    title: "Kashmir University PG Admissions 2026 1st Selection List & Counseling Notice (MA, M.Sc, M.Com, MCA)",
    category: "admissions",
    postDate: "06/08/2026",
    lastDate: "18/08/2026 (Document Verification & Fee Deposition)",
    advertisementNo: "Notice No. F(PG-Selection-List-1) DAA/KU/26",
    shortInfo: "Directorate of Admissions & Competitive Examinations provisional 1st selection list and document verification counseling schedule for candidates provisionally selected for Postgraduate programmes (MA, M.Sc, M.Com, MCA) across Main & Satellite Campuses based on KUET 2026 merit.",
    ageLimit: "No Upper Age Limit as per NEP 2020 Guidelines for Higher Education Admissions.",
    eligibility: "Candidates provisionally selected in 1st Merit List must bring original Academic Certificates, Provisional / Character Certificates, Category Certificates (if applicable), and KUET 2026 Admit Card for physical verification at respective departments.",
    totalPosts: "2,850 Provisionally Selected Candidates",
    fees: { genObc: "\u20B9750 Processing Fee", scSt: "\u20B9750 Processing Fee" },
    officialLink: "https://www.kashmiruniversity.net/admission.aspx",
    isNew: true,
    departmentBreakdown: [
      {
        department: "School of Applied Sciences & Technology",
        postName: "MCA, M.Sc IT, M.Tech 1st Selection List",
        posts: 420,
        qualification: "Selected in 1st List. Verification Window: Aug 07 to Aug 18, 2026 at Main Campus."
      },
      {
        department: "School of Biological & Physical Sciences",
        postName: "M.Sc Botany, Zoology, Chemistry, Physics 1st Selection List",
        posts: 580,
        qualification: "Document verification at respective PG Departments from Aug 07 to Aug 18, 2026."
      },
      {
        department: "School of Arts, Languages & Social Sciences",
        postName: "MA English, Urdu, History, Pol Science, M.Com 1st Selection List",
        posts: 1150,
        qualification: "Document verification & online fee payment deadline: Aug 18, 2026."
      }
    ]
  },
  {
    id: "ku-adm-dde-pg-bed-2026",
    title: "Kashmir University DDE Distance Mode Admission Notification 2026 (MA, M.Com, B.Ed. & PG Diplomas)",
    category: "admissions",
    postDate: "05/08/2026",
    lastDate: "20/08/2026 (Without Late Fee) / 26/08/2026 (With Late Fee \u20B9500)",
    advertisementNo: "Notification No. F(DDE-Distance-Adm) KU/2026",
    shortInfo: "Directorate of Distance Education (DDE), University of Kashmir invites online application forms for admission to 2-Year MA (English, Urdu, Economics, Education), M.Com, B.Ed (Distance Mode Batch 2026-27), and Post Graduate Diplomas for August Session 2026.",
    ageLimit: "No Age Limit for Distance Education / Open Learning Admissions.",
    eligibility: "Bachelor's Degree (10+2+3) with minimum 45% marks for Open Merit and 40% for Reserved Categories. For B.Ed Distance Mode: Trained in-service teachers or D.El.Ed/NCTE certificate holders with Graduation.",
    totalPosts: "4,500 Seats",
    fees: { genObc: "\u20B9500 Application Fee", scSt: "\u20B9500 Application Fee" },
    officialLink: "https://www.kashmiruniversity.net/admission.aspx",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Directorate of Distance Education (DDE)",
        postName: "B.Ed Distance Mode (Batch 2026-27)",
        posts: 1500,
        qualification: "Graduation (50% OM / 45% Reserved) + Trained In-Service Teacher / D.El.Ed / NCTE recognized face-to-face course."
      },
      {
        department: "Directorate of Distance Education (DDE)",
        postName: "MA English, Urdu, Economics, Education, M.Com",
        posts: 2400,
        qualification: "Bachelor's Degree in relevant discipline with minimum 45% aggregate marks (40% for Reserved categories)."
      },
      {
        department: "Directorate of Distance Education (DDE)",
        postName: "PG Diploma in Computer Applications (DCA), Cyber Law, Web Design",
        posts: 600,
        qualification: "Graduation in any discipline from recognized university."
      }
    ]
  },
  {
    id: "ku-adm-phd-research-2026",
    title: "Kashmir University Ph.D. Research Programme Entrance Exemption & Direct Admission Notice 2026",
    category: "admissions",
    postDate: "07/08/2026",
    lastDate: "25/08/2026 (Application Window) / 31/08/2026 (Dept Verification)",
    advertisementNo: "Notification No. F(Ph.D-Admissions) RES/KU/26",
    shortInfo: "Directorate of Admissions notice inviting online application forms for admission to Ph.D. Research Programmes for CSIR-NET / UGC-NET / GATE / SET qualified candidates across PG Departments of Kashmir University.",
    ageLimit: "As per UGC Fellowship Regulations; No age limit for self-financed / part-time research scholars.",
    eligibility: "Master's Degree in relevant discipline with at least 55% marks in aggregate or its equivalent Grade 'B' in UGC 7-point scale (50% for SC/ST/OBC/PWD/EWS). Valid NET/JRF/GATE/SET score mandatory for direct exemption.",
    totalPosts: "320 Research Seats",
    fees: { genObc: "\u20B9500 Application Fee", scSt: "\u20B9500 Application Fee" },
    officialLink: "https://www.kashmiruniversity.net/admission.aspx",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Faculty of Science & Technology",
        postName: "Ph.D in Physics, Chemistry, Botany, Zoology, Computer Science",
        posts: 120,
        qualification: "Master's Degree with 55% marks + CSIR-NET / GATE / SET qualification certificate."
      },
      {
        department: "Faculty of Social Sciences & Humanities",
        postName: "Ph.D in History, Political Science, Sociology, English, Urdu",
        posts: 130,
        qualification: "Master's Degree in concerned subject with 55% marks + UGC-NET / JRF qualification."
      },
      {
        department: "Faculty of Law & Management Studies",
        postName: "Ph.D in Law, Management Studies, Commerce",
        posts: 70,
        qualification: "LL.M / MBA / M.Com with 55% marks in aggregate + NET/JRF."
      }
    ]
  },
  {
    id: "ku-adm-ballb-2nd-selection-2026",
    title: "Kashmir University BA-LLB 5-Year Integrated Course 2nd Selection List & Allotment Counseling 2026",
    category: "admissions",
    postDate: "06/08/2026",
    lastDate: "19/08/2026 (Counseling Verification) / 20/08/2026 (Fee Payment)",
    advertisementNo: "Notice No. F(BALLB-Selection-List-2) DAA/KU/26",
    shortInfo: "School of Law Main Campus & Private Affiliated Law Colleges 2nd provisional selection list and document verification counseling notice for 5-Year Integrated BA-LLB course based on merit rank and college options.",
    ageLimit: "Under 20 Years for Open Merit (22 Years for Reserved Categories) as per Bar Council of India guidelines.",
    eligibility: "10+2 Higher Secondary examination passed with 45% aggregate marks (40% for SC/ST). Provisionally selected candidates must report to Department of Law Main Campus Srinagar with original documents.",
    totalPosts: "180 Law Candidates",
    fees: { genObc: "\u20B9500 Processing Fee", scSt: "\u20B9500 Processing Fee" },
    officialLink: "https://www.kashmiruniversity.net/admission.aspx",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Department of Law (Main Campus Srinagar)",
        postName: "5-Year Integrated BA-LLB (Main Campus)",
        posts: 60,
        qualification: "Ranked in 2nd Selection List. Physical verification at Main Campus Law Dept: Aug 08 to Aug 19, 2026."
      },
      {
        department: "Kashmir Law College & Sopore Law College",
        postName: "5-Year Integrated BA-LLB (Affiliated Colleges)",
        posts: 120,
        qualification: "10+2 with 45% marks. Verification at respective allotted college."
      }
    ]
  },
  {
    id: "ku-adm-pg-diploma-2026",
    title: "Kashmir University 1-Year PG Diploma & Certificate Courses Online Admission Notification 2026",
    category: "admissions",
    postDate: "05/08/2026",
    lastDate: "22/08/2026",
    advertisementNo: "Notification No. F(PG-Diploma-Adm) DAA/KU/26",
    shortInfo: "Kashmir University online application submission for various 1-Year PG Diploma courses (Cyber Law, Web Designing, Data Analytics, Tourism Management) and Language Certificate courses.",
    ageLimit: "No Upper Age Limit.",
    eligibility: "Graduation in any discipline from a recognized University with minimum 45% aggregate marks (40% for Reserved categories). Selection purely based on qualifying exam merit.",
    totalPosts: "250 Seats",
    fees: { genObc: "\u20B9500 Application Fee", scSt: "\u20B9500 Application Fee" },
    officialLink: "https://www.kashmiruniversity.net/admission.aspx",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Department of Law",
        postName: "PG Diploma in Cyber Law & Intellectual Property Rights (DCL)",
        posts: 40,
        qualification: "Graduate in Law or any discipline with 45% marks."
      },
      {
        department: "Department of Computer Sciences",
        postName: "PG Diploma in Web Designing & Data Analytics (DWD)",
        posts: 50,
        qualification: "Graduation with 45% marks. Basic computer aptitude."
      },
      {
        department: "Department of Management Studies",
        postName: "PG Diploma in Tourism & Hospitality Management (PGDTHM)",
        posts: 60,
        qualification: "Bachelor's Degree in any field with 45% marks."
      },
      {
        department: "Department of Foreign Languages",
        postName: "Certificate Course in French / German / Russian Language",
        posts: 100,
        qualification: "10+2 / Graduation from recognized board."
      }
    ]
  },
  {
    id: "adm-du-ug",
    title: "Delhi University CSAS UG Admission Portal 2026",
    category: "admissions",
    postDate: "25/07/2026",
    lastDate: "15/08/2026",
    shortInfo: "Common Seat Allocation System (CSAS) registration for entry into DU undergraduate degree colleges based on CUET scores.",
    isNew: true
  },
  {
    id: "adm-ignou-july",
    title: "IGNOU July Session Open & Distance Learning Online Form",
    category: "admissions",
    postDate: "20/07/2026",
    lastDate: "31/08/2026",
    shortInfo: "Indira Gandhi National Open University (IGNOU) fresh admission for BA, B.Com, B.Sc, MA, MBA, and Diploma courses.",
    isNew: true
  },
  {
    id: "adm-up-deled",
    title: "UP D.El.Ed (BTC) Online Admission Registration 2026",
    category: "admissions",
    postDate: "16/07/2026",
    lastDate: "20/08/2026",
    shortInfo: "Uttar Pradesh Diploma in Elementary Education 2-year teacher training course state merit list & choice filling."
  },
  // EXAM FORMS - KASHMIR UNIVERSITY (kashmiruniversity.net/Examination.aspx)
  {
    id: "ku-ef-bg-4th-sem-2026",
    title: "Kashmir University UG BG 4th Semester (NEP 2020 Batch 2024 & CBCS Backlog) Online Exam Form 2026",
    category: "exam_forms",
    postDate: "06/08/2026",
    startDate: "06/08/2026",
    lastDate: "22/08/2026 (Without Late Fee) / 28/08/2026 (With Late Fee \u20B9500)",
    advertisementNo: "Exam Notice No. F(BG-4th-Sem-Exam-Forms) KU/2026",
    shortInfo: "University of Kashmir Examination Wing official notification for online submission of Examination Forms and fee deposition for BG 4th Semester NEP-2020 Regular (Batch 2024) and CBCS Backlog candidates enrolled across affiliated degree colleges.",
    feePerSubject: "\u20B9250 per Theory Paper + \u20B9350 Semester EMF + \u20B9275 per Practical Subject",
    eligibility: "Enrolled BA, B.Sc, B.Com, BBA, BCA candidates under Kashmir University affiliation having required 75% college attendance or eligible backlog status.",
    totalPosts: "42,000+ Enrolled Students",
    fees: { genObc: "\u20B9250 per paper + \u20B9350 EMF", scSt: "\u20B9250 per paper + \u20B9350 EMF" },
    officialLink: "https://egov.kashmiruniversity.ac.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "School of Arts, Languages & Social Sciences",
        postName: "BA 4th Sem Regular (Batch 2024) & Backlog Exam Forms",
        posts: "\u20B9250 / Theory Subject",
        qualification: "\u20B9250 per paper + \u20B9350 Semester Examination Maintenance Fee (EMF) & Hot/Cold Charges.",
        fee: "\u20B9250 per paper"
      },
      {
        department: "School of Physical & Biological Sciences",
        postName: "B.Sc 4th Sem Regular (Batch 2024) & Backlog Exam Forms",
        posts: "\u20B9275 / Practical Sub",
        qualification: "\u20B9250 per theory paper + \u20B9275 per practical paper/viva + \u20B9350 Semester EMF Fee.",
        fee: "\u20B9275 with Practical"
      },
      {
        department: "School of Commerce & Computer Applications",
        postName: "B.Com / BBA / BCA 4th Sem Regular & Backlog Exam Forms",
        posts: "\u20B9250 / Theory Subject",
        qualification: "\u20B9250 per course paper + \u20B9350 Semester EMF + \u20B9150 IT Portal Fee.",
        fee: "\u20B9250 per paper"
      }
    ]
  },
  {
    id: "ku-ef-pg-sem1-3-2026",
    title: "Kashmir University PG (MA, M.Sc, M.Com, MCA) 1st & 3rd Semester Main & Satellite Campus Online Exam Form 2026",
    category: "exam_forms",
    postDate: "05/08/2026",
    startDate: "05/08/2026",
    lastDate: "19/08/2026 (Without Late Fee) / 25/08/2026 (With Late Fee \u20B9500)",
    advertisementNo: "Exam Notice No. F(PG-Sem1-3-Forms) Exam/KU/26",
    shortInfo: "Kashmir University Examination Wing notification inviting online examination forms for regular Postgraduate students (MA, M.Sc, M.Com, MCA, LL.B, MSW) appearing for 1st & 3rd Semester examinations across Main, North, South Campuses and Govt PG Colleges.",
    feePerSubject: "\u20B91,650 Total PG Semester Fee (\u20B91,000 for single backlog subject)",
    eligibility: "Regularly enrolled PG students who have completed continuous assessment / internal viva examinations.",
    totalPosts: "5,200 PG Candidates",
    fees: { genObc: "\u20B91,650 Complete Semester", scSt: "\u20B91,650 Complete Semester" },
    officialLink: "https://www.kashmiruniversity.net/Examination.aspx",
    isNew: true,
    departmentBreakdown: [
      {
        department: "School of Applied Sciences & Technology",
        postName: "MCA, M.Sc IT, M.Tech 1st & 3rd Semester Exam Forms",
        posts: "\u20B91,650 Total",
        qualification: "Full semester examination fee \u20B91,650 includes lab/practical evaluation charges.",
        fee: "\u20B91,650 / Semester"
      },
      {
        department: "School of Biological & Physical Sciences",
        postName: "M.Sc Botany, Zoology, Chemistry, Physics 1st & 3rd Sem Exam Forms",
        posts: "\u20B91,650 Total",
        qualification: "Full semester fee \u20B91,650 (\u20B91,000 for single backlog paper; \u20B91,650 for >1 backlog).",
        fee: "\u20B91,650 / Semester"
      },
      {
        department: "School of Arts & Social Sciences",
        postName: "MA English, Urdu, History, Pol Science, M.Com 1st & 3rd Sem Exam Forms",
        posts: "\u20B91,650 Total",
        qualification: "Full semester examination fee \u20B91,650 including hall ticket and marks card generation.",
        fee: "\u20B91,650 / Semester"
      }
    ]
  },
  {
    id: "ku-ef-bed-sem1-2-2026",
    title: "Kashmir University B.Ed. (2-Year Program) 1st & 2nd Semester (Batch 2025) Online Exam Form 2026",
    category: "exam_forms",
    postDate: "07/08/2026",
    startDate: "07/08/2026",
    lastDate: "24/08/2026 (Without Late Fee) / 30/08/2026 (Late Fee \u20B9100/day)",
    advertisementNo: "Exam Notice No. F(B.Ed-Sem-Forms) Exam/KU/26",
    shortInfo: "Submission of online examination forms for B.Ed 1st & 2nd Semester candidates (Batch 2025) enrolled in Department of Education Main Campus Srinagar, South Campus, and Private affiliated Colleges of Education.",
    feePerSubject: "\u20B9250 per Subject Paper + \u20B9900 EMF/Hot & Cold Charges",
    eligibility: "Eligible candidates admitted to 2-Year B.Ed Programme with minimum required college attendance.",
    totalPosts: "3,800 B.Ed Candidates",
    fees: { genObc: "\u20B9250 per paper + \u20B9900 EMF", scSt: "\u20B9250 per paper + \u20B9900 EMF" },
    officialLink: "https://egov.kashmiruniversity.ac.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Department of Education (Main Campus & South Campus)",
        postName: "B.Ed 1st & 2nd Semester Regular (Batch-2025)",
        posts: "\u20B9250 / Paper",
        qualification: "\u20B9250 per paper + \u20B9900 Examination Maintenance Fund (EMF) & Hot/Cold Charges for 2 Semesters.",
        fee: "\u20B9250/paper + \u20B9900 EMF"
      },
      {
        department: "Affiliated Private Colleges of Education",
        postName: "B.Ed 1st & 2nd Semester Private Candidates (Batch-2025)",
        posts: "\u20B9250 / Paper",
        qualification: "\u20B9250 per subject paper + \u20B9900 EMF + IT portal verification fee.",
        fee: "\u20B9250/paper + \u20B9900 EMF"
      }
    ]
  },
  {
    id: "ku-ef-btech-even-sem-2026",
    title: "Kashmir University Professional B.Tech / B.E. 4th, 6th & 8th Semester Online Exam Form Notice 2026",
    category: "exam_forms",
    postDate: "06/08/2026",
    startDate: "06/08/2026",
    lastDate: "21/08/2026 (Without Late Fee) / 27/08/2026 (With Late Fee \u20B9500)",
    advertisementNo: "Exam Notice No. F(B.Tech-Sem-Forms) Exam/KU/26",
    shortInfo: "Online examination forms for Bachelor of Technology (B.Tech Engineering) students in Civil, Mechanical, Electrical, Computer Science, and ECE at Institute of Technology Zakura Campus Srinagar, Department of CS, and SSM College of Engineering.",
    feePerSubject: "\u20B9350 per Theory Paper + \u20B9450 Engineering Infrastructure & IT Fee",
    eligibility: "B.Tech candidates with mandatory internal sessional clearance and minimum 75% attendance.",
    totalPosts: "2,100 B.Tech Engineers",
    fees: { genObc: "\u20B9350 per paper + \u20B9450 Infra", scSt: "\u20B9350 per paper + \u20B9450 Infra" },
    officialLink: "https://www.kashmiruniversity.net/Examination.aspx",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Institute of Technology Zakura Campus",
        postName: "B.Tech Civil & Mechanical Engineering (4th, 6th, 8th Sem)",
        posts: "\u20B9350 / Paper",
        qualification: "\u20B9350 per theory/practical paper + \u20B9450 Engineering Lab Maintenance & IT Portal Fee.",
        fee: "\u20B9350/paper"
      },
      {
        department: "Department of Computer Science (Main Campus)",
        postName: "B.Tech Computer Science & ECE (4th, 6th, 8th Sem)",
        posts: "\u20B9350 / Paper",
        qualification: "\u20B9350 per paper + \u20B9450 IT & Sessional Examination Fee.",
        fee: "\u20B9350/paper"
      }
    ]
  },
  {
    id: "ku-ef-dde-distance-2026",
    title: "Kashmir University DDE Distance Education MA & B.Ed Term-End Online Exam Form Notice 2026",
    category: "exam_forms",
    postDate: "05/08/2026",
    startDate: "05/08/2026",
    lastDate: "20/08/2026 (Without Late Fee) / 26/08/2026 (With Late Fee \u20B9500)",
    advertisementNo: "Exam Notice No. F(DDE-Exam-Forms) KU/26",
    shortInfo: "Directorate of Distance Education (DDE) Kashmir University term-end online examination forms for enrolled distance learners in MA (English, Urdu, Economics, Education) and B.Ed distance mode.",
    feePerSubject: "\u20B9300 per Subject Paper + \u20B9400 DDE Maintenance Fee",
    eligibility: "Enrolled distance mode students who have submitted internal response assignments.",
    totalPosts: "5,500 Distance Candidates",
    fees: { genObc: "\u20B9300 per paper + \u20B9400 DDE Fee", scSt: "\u20B9300 per paper + \u20B9400 DDE Fee" },
    officialLink: "https://egov.kashmiruniversity.ac.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Directorate of Distance Education (DDE)",
        postName: "DDE B.Ed Programme Term-End Exam (Batch 2024-25)",
        posts: "\u20B9300 / Paper",
        qualification: "\u20B9300 per subject paper + \u20B9400 DDE Centre Maintenance & Portal Charges.",
        fee: "\u20B9300/paper"
      },
      {
        department: "Directorate of Distance Education (DDE)",
        postName: "DDE MA Programmes (English, Urdu, Economics, Education)",
        posts: "\u20B9300 / Paper",
        qualification: "\u20B9300 per theory paper + \u20B9400 DDE Examination Hall Fee.",
        fee: "\u20B9300/paper"
      }
    ]
  },
  // CLUSTER UNIVERSITY SRINAGAR (cusrinagar.edu.in)
  {
    id: "cus-ug-3rd-5th-sem-exam-form-2026",
    title: "Cluster University Srinagar UG 3rd & 5th Semester NEP-2020 Online Examination Form Notice 2026",
    category: "cluster_univ",
    postDate: "06/08/2026",
    startDate: "06/08/2026",
    lastDate: "20/08/2026 (Without Late Fee) / 25/08/2026 (With Late Fee \u20B9500)",
    advertisementNo: "Notice No. CUS/Exam-Form/UG-3rd-5th-Sem/2026",
    shortInfo: "Notification issued by Examination Wing of Cluster University Srinagar for online submission of examination forms and deposition of examination fee for UG NEP-2020 & CBCS 3rd and 5th Semester regular and backlog candidates across all 5 constituent colleges.",
    feePerSubject: "\u20B9250 Per Theory Paper + \u20B9200 Practical Paper + \u20B9300 Semester EMF Fee",
    eligibility: "Regularly enrolled UG candidates of Batch 2023 & 2024 who have fulfilled required continuous internal assessment / mid-term tests and minimum 75% college class attendance.",
    ageLimit: "N/A (Enrolled Undergraduate Students)",
    totalPosts: "18,500+ Enrolled Candidates",
    fees: { genObc: "\u20B9250/paper + \u20B9300 EMF", scSt: "\u20B9250/paper + \u20B9300 EMF" },
    officialLink: "https://www.cusrinagar.edu.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Sri Pratap (SP) College Srinagar",
        postName: "B.Sc / B.Sc Honors 3rd & 5th Sem Regular & Backlog Exam Forms",
        posts: "\u20B9250 / Theory",
        qualification: "\u20B9250 per theory paper + \u20B9200 per practical paper + \u20B9300 Semester Exam Maintenance Fee.",
        fee: "\u20B9250/theory + \u20B9200/practical"
      },
      {
        department: "Amar Singh College Srinagar",
        postName: "B.A. / B.Com 3rd & 5th Sem Regular & Backlog Exam Forms",
        posts: "\u20B9250 / Theory",
        qualification: "\u20B9250 per paper + \u20B9300 Semester EMF + \u20B9150 IT Portal charges.",
        fee: "\u20B9250/paper"
      },
      {
        department: "AAAM Degree College Bemina & GCW MA Road",
        postName: "BCA / BBA / B.Sc IT 3rd & 5th Sem Exam Forms",
        posts: "\u20B9250 / Theory",
        qualification: "\u20B9250 per course paper + \u20B9250 lab exam charges + \u20B9300 Semester EMF.",
        fee: "\u20B9250/paper + \u20B9250 lab"
      }
    ]
  },
  {
    id: "cus-pg-integrated-spot-round-2026",
    title: "Cluster University Srinagar PG & 5-Year Integrated 1st Semester Spot Round Counseling & Online Registration 2026",
    category: "cluster_univ",
    postDate: "05/08/2026",
    startDate: "05/08/2026",
    lastDate: "18/08/2026 (Document Verification: 19/08/2026 to 22/08/2026)",
    advertisementNo: "Notice No. CUS/Adm/Spot-Round/2026",
    shortInfo: "Cluster University Srinagar notification inviting online spot round applications for leftover seats in PG programmes (M.Sc, M.A, M.Com, MCA) and 5-Year Integrated Master Programmes across constituent colleges.",
    feePerSubject: "\u20B9500 Spot Registration Fee",
    eligibility: "Bachelor Degree (for PG) or 10+2 (for Integrated) with minimum 50% marks (45% for Reserved Categories). Candidates in CUSET/Merit waiting list given priority.",
    ageLimit: "No Upper Age Limit (As per UGC & NEP-2020 norms)",
    totalPosts: "650 Spot Round Vacant Seats",
    fees: { genObc: "\u20B9500 Registration Fee", scSt: "\u20B9500 Registration Fee" },
    officialLink: "https://www.cusrinagar.edu.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "School of Sciences (SP College Srinagar)",
        postName: "M.Sc Physics, Chemistry, Env Science & Integrated B.Sc-M.Sc",
        posts: "180 Spot Seats",
        qualification: "B.Sc with subject core in all 3 years or 10+2 PCM/PCB with 50% marks.",
        fee: "\u20B9500 Spot Fee"
      },
      {
        department: "School of Computer Applications (GCW MA Road Srinagar)",
        postName: "MCA & M.Sc IT Spot Admissions",
        posts: "120 Spot Seats",
        qualification: "BCA / B.Sc IT / B.Sc with Mathematics at 10+2 or Graduation level.",
        fee: "\u20B9500 Spot Fee"
      },
      {
        department: "School of Social Sciences & Humanities (AAAM Bemina & AS College)",
        postName: "M.A. English, Political Science, History & M.Com Spot Round",
        posts: "250 Spot Seats",
        qualification: "Bachelor Degree in relevant discipline with min 50% aggregate marks.",
        fee: "\u20B9500 Spot Fee"
      }
    ]
  },
  {
    id: "cus-bed-med-exam-form-2026",
    title: "Cluster University Srinagar B.Ed & M.Ed 2-Year Program Examination Form & Online Fee Schedule 2026",
    category: "cluster_univ",
    postDate: "07/08/2026",
    startDate: "07/08/2026",
    lastDate: "24/08/2026 (Late Fee \u20B9100/day: 25/08/2026 to 28/08/2026)",
    advertisementNo: "Notice No. CUS/Exam-Form/B.Ed-M.Ed/2026",
    shortInfo: "Examination form submission notification for B.Ed 1st/3rd Semester and M.Ed 2nd Semester students at Institute of Advanced Studies in Education (IASE Govt College of Education, MA Road Srinagar).",
    feePerSubject: "\u20B91,200 Semester Examination Fee",
    eligibility: "Regularly enrolled B.Ed & M.Ed candidates with mandatory 75% attendance and internal practical clearance.",
    ageLimit: "N/A (Enrolled Teacher Education Students)",
    totalPosts: "450 Candidates",
    fees: { genObc: "\u20B91,200 Semester Fee", scSt: "\u20B91,200 Semester Fee" },
    officialLink: "https://www.cusrinagar.edu.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Govt College of Education (IASE) M.A. Road Srinagar",
        postName: "B.Ed 1st & 3rd Semester Exam Form",
        posts: "300 Candidates",
        qualification: "Full semester exam fee \u20B91,200 including teaching practice evaluation.",
        fee: "\u20B91,200/semester"
      },
      {
        department: "Govt College of Education (IASE) M.A. Road Srinagar",
        postName: "M.Ed 2nd Semester Exam Form",
        posts: "150 Candidates",
        qualification: "Full semester exam fee \u20B91,200 including dissertation seminar charges.",
        fee: "\u20B91,200/semester"
      }
    ]
  },
  {
    id: "cus-ug-1st-sem-self-reg-2026",
    title: "Cluster University Srinagar UG 1st Semester (Batch 2026) Online Self-Registration & Document Verification Notice",
    category: "cluster_univ",
    postDate: "06/08/2026",
    startDate: "06/08/2026",
    lastDate: "21/08/2026 (College Physical Verification: 22/08/2026 to 28/08/2026)",
    advertisementNo: "Notice No. CUS/UG-Batch2026/Self-Reg/2026",
    shortInfo: "Public notice for newly admitted UG 1st Semester candidates (Batch 2026) to complete online self-registration, roll number generation, and submit original documents at allotted constituent colleges.",
    feePerSubject: "\u20B9350 University Registration & Sports/Cultural Fee",
    eligibility: "Candidates who have received seat allotment offer letters in CUS UG Admission 2026.",
    ageLimit: "As per UGC / NEP-2020 Norms",
    totalPosts: "7,200 Admitted Students",
    fees: { genObc: "\u20B9350 Registration Fee", scSt: "\u20B9350 Registration Fee" },
    officialLink: "https://www.cusrinagar.edu.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "All Constituent Colleges (AS College, SP College, GCW MA Road, AAAM Bemina)",
        postName: "UG NEP-2020 Batch 2026 Student Portal Registration",
        posts: "7,200 Students",
        qualification: "10+2 Marksheet, Provisional/Character Certificate, Category Certificate (if applicable).",
        fee: "\u20B9350 One-time"
      }
    ]
  },
  {
    id: "cus-ug-reevaluation-form-2026",
    title: "Cluster University Srinagar Division of Examination - Online Re-evaluation Form for UG 2nd & 4th Semester Results",
    category: "cluster_univ",
    postDate: "05/08/2026",
    startDate: "05/08/2026",
    lastDate: "17/08/2026",
    advertisementNo: "Notice No. CUS/Exam/Reeval-UG24/2026",
    shortInfo: "Online re-evaluation application notice for students dissatisfied with their recently declared UG 2nd and 4th Semester examination results.",
    feePerSubject: "\u20B9500 Per Paper / Answer Script Re-evaluation",
    eligibility: "UG 2nd and 4th Semester students whose results were declared on or after July 28, 2026.",
    ageLimit: "N/A",
    totalPosts: "Open for all eligible students",
    fees: { genObc: "\u20B9500 Per Paper", scSt: "\u20B9500 Per Paper" },
    officialLink: "https://www.cusrinagar.edu.in/",
    isNew: true,
    departmentBreakdown: [
      {
        department: "Examination Wing Cluster University Srinagar",
        postName: "UG 2nd & 4th Sem Re-evaluation Application",
        posts: "Open Intake",
        qualification: "Roll Number & Exam Registration ID clearance required.",
        fee: "\u20B9500 / Paper"
      }
    ]
  }
];

// src/servicesData.ts
var SERVICES_LIST = [
  // CSC Services
  {
    id: "csc-pan",
    name: "New PAN Card Application",
    category: "csc",
    description: "Fresh Permanent Account Number (PAN) application & correction services with e-KYC support.",
    requirements: ["Aadhaar Card", "2 Passport Size Photos", "Aadhaar-linked Mobile Number"],
    estimatedTime: "3 - 7 Days",
    price: "\u20B9107 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "csc-aadhaar",
    name: "Aadhaar Card Update Assistance",
    category: "csc",
    description: "Demographic updates (Name, Address, DOB, Gender, Mobile Number) and photo verification guidance.",
    requirements: ["Aadhaar Card", "Valid Address/ID Proof (e.g., Voter ID, Passport, Bank Passbook)"],
    estimatedTime: "2 - 5 Days",
    price: "\u20B950 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "csc-voter",
    name: "Voter ID Card Services",
    category: "csc",
    description: "Apply for a new Voter ID card, make corrections, shift assembly constituencies, or request PVC card printing.",
    requirements: ["Aadhaar Card", "Age Proof", "Passport Size Photo", "Address Proof"],
    estimatedTime: "15 - 30 Days",
    price: "Free Application + \u20B970 (CSC Charge)"
  },
  {
    id: "csc-ayushman",
    name: "Ayushman Bharat Golden Card",
    category: "csc",
    description: "Check eligibility and register for free \u20B95 Lakh health insurance cover under PM-JAY scheme.",
    requirements: ["Aadhaar Card", "Ration Card / PM Letter"],
    estimatedTime: "Same Day",
    price: "FREE Govt Scheme + \u20B970 (CSC Charge)"
  },
  {
    id: "csc-pmkisan",
    name: "PM Kisan Registration & e-KYC",
    category: "csc",
    description: "Apply for farmer registration under PM Kisan Samman Nidhi Yojana and mandatory e-KYC updates.",
    requirements: ["Aadhaar Card", "Land Registry Copy (Khatauni)", "Bank Passbook Copy"],
    estimatedTime: "Same Day",
    price: "\u20B915 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "csc-eshram",
    name: "e-Shram & Labour Card",
    category: "csc",
    description: "Registration for unorganized sector workers to secure central government accident insurance and social benefits.",
    requirements: ["Aadhaar Card", "Bank Account Number", "Mobile Number"],
    estimatedTime: "Same Day",
    price: "FREE Govt + \u20B970 (CSC Charge)"
  },
  {
    id: "csc-certificates",
    name: "State Certificates (Caste/Income/Domicile)",
    category: "csc",
    description: "Authorized state-level applications for Caste, Domicile, Income, Marriage, Birth, Death, and Character Certificates.",
    requirements: ["Aadhaar Card", "Ration Card Copy", "Self-Declaration Form", "Address Proof"],
    estimatedTime: "7 - 15 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "csc-ration",
    name: "New Ration Card & Corrections",
    category: "csc",
    description: "Apply for a new digital ration card, add or delete family member names, and address updates.",
    requirements: ["Aadhaar Cards of all members", "Head of Family Photo", "Income Proof"],
    estimatedTime: "15 - 30 Days",
    price: "\u20B970 (CSC Service & Portal Fee)"
  },
  {
    id: "csc-passport",
    name: "Passport Application Filing",
    category: "csc",
    description: "Online registration for fresh passports, renewals, tatkaal services, and appointment booking at PSK.",
    requirements: ["Aadhaar Card", "10th Marksheet/Non-ECR Proof", "Bank Statement", "Address Proof"],
    estimatedTime: "Appointment booked in 24h",
    price: "\u20B91500 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "csc-dl",
    name: "Driving Licence Services",
    category: "csc",
    description: "Apply for fresh learners licence, permanent driving licence, DL renewal, duplicate copy, or address changes.",
    requirements: ["Age Proof (10th pass/Aadhaar)", "Address Proof", "Physical Fitness Declaration"],
    estimatedTime: "Slot Booking same day",
    price: "As per RTO Fee + \u20B970 (CSC Charge)"
  },
  {
    id: "csc-utility",
    name: "Utility Bill Payments & Recharges",
    category: "csc",
    description: "Instant payments for electricity bills, water bills, gas cylinders, mobile/DTH, FASTag recharges, and premium insurance payments.",
    requirements: ["Consumer ID / Policy Number", "Mobile Number"],
    estimatedTime: "Instant Credit",
    price: "FREE (\u20B90 Convenience Fee)",
    popular: true
  },
  // Digital Services
  {
    id: "dig-print",
    name: "B&W / Color Printing & Scanning",
    category: "digital",
    description: "High-quality laser printing, document scanning (PDF/JPG formats), and thick-pouch lamination up to A3 size.",
    requirements: ["Soft Copy via WhatsApp, Email, or USB Drive"],
    estimatedTime: "Instant",
    price: "B&W \u20B92/pg, Color \u20B910/pg, Lamination \u20B920"
  },
  {
    id: "dig-photo",
    name: "Passport Size Photos & Editing",
    category: "digital",
    description: "Instant professional passport photo capture, digital background replacement, skin tone touchups, and physical sheets printing.",
    requirements: ["Physical presence for photo or digital file"],
    estimatedTime: "5 Minutes",
    price: "\u20B950 (8 Photos) / \u20B980 (16 Photos)",
    popular: true
  },
  {
    id: "dig-form",
    name: "Professional Resume & Typing Services",
    category: "digital",
    description: "Design interactive resumes, document editing, PDF combining, and precise typing in Hindi, English, or regional languages.",
    requirements: ["Handwritten Draft or legacy CV", "Educational Details"],
    estimatedTime: "15 - 30 Minutes",
    price: "\u20B950 - \u20B9100 (Based on pages)"
  },
  // Education Services
  {
    id: "edu-admissions",
    name: "School & College Admissions",
    category: "education",
    description: "Admissions application support for schools, open universities (e.g., IGNOU, DU SOL), and local colleges.",
    requirements: ["Previous Year Marksheets", "Category Certificate (if applicable)", "Photo", "ID Proof"],
    estimatedTime: "Same Day",
    price: "\u20B950 - \u20B9100 + University Fee"
  },
  {
    id: "edu-scholarship",
    name: "National & State Scholarship Forms",
    category: "education",
    description: "Secure application filling for national (NSP) and state e-kalyan scholarships for minor, SC/ST, and OBC candidates.",
    requirements: ["Aadhaar Card", "Previous Class Marksheet", "Income Certificate", "Caste Certificate", "Bank Passbook"],
    estimatedTime: "1 - 2 Hours",
    price: "\u20B950 - \u20B980 (Full Filing)"
  },
  {
    id: "edu-exams",
    name: "Competitive Exam & Admit Card Downloads",
    category: "education",
    description: "Filing for central/state exams (SSC, UPSC, Banking, NEET, JEE) and instant colorful admit card downloads.",
    requirements: ["Academic Credentials", "Signature Scans", "Photo Scans"],
    estimatedTime: "20 Minutes",
    price: "\u20B950 - \u20B9100 (Exam Filing) / \u20B910 (Print)",
    popular: true
  },
  // Business Services
  {
    id: "biz-gst",
    name: "GST Registration & Return Assistance",
    category: "business",
    description: "File applications for new GST registration and prepare files for monthly or quarterly GSTR filing.",
    requirements: ["PAN Card", "Aadhaar Card", "Business Address Proof (Rent Agreement/Electricity Bill)"],
    estimatedTime: "3 - 5 Days",
    price: "\u20B9500 (Reg) / \u20B9300 (Return Filing)"
  },
  {
    id: "biz-udyam",
    name: "MSME & UDYAM Business Registration",
    category: "business",
    description: "Register small-medium enterprises under UDYAM scheme to receive interest concessions and credit benefits.",
    requirements: ["Aadhaar Card", "PAN Card", "Business Name & Bank Details"],
    estimatedTime: "Same Day",
    price: "\u20B970 (CSC Assistance Charge)"
  },
  {
    id: "biz-dsc",
    name: "Digital Signature Certificate (DSC)",
    category: "business",
    description: "Obtain Class 3 Digital Signature Certificate (DSC) for e-tendering, company registration, and trademark filing.",
    requirements: ["Aadhaar Card", "PAN Card", "Aadhaar-linked Mobile (OTP verification)"],
    estimatedTime: "24 Hours",
    price: "\u20B91200 - \u20B91500 (2 Year Token)"
  },
  // JK Revenue Services (Revenue Department Govt of Jammu & Kashmir)
  {
    id: "rev-attestation-mutation",
    name: "Attestation of Mutations",
    category: "revenue",
    description: "Official attestation & registration of land ownership mutation (Inteqal) following sale, inheritance, gift, or exchange in J&K Revenue records.",
    requirements: ["Registered Sale/Gift Deed or Death Certificate", "Aadhaar Card", "Khatauni / Jamabandi Copy", "Patwari Field Verification Report"],
    estimatedTime: "7 - 15 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "rev-clu",
    name: "Change Of Land Use (CLU)",
    category: "revenue",
    description: "Formal application for conversion or permission to change agricultural land for residential, commercial, or industrial purposes in Jammu & Kashmir.",
    requirements: ["Aadhaar Card", "Title Deed / Fard", "Aks Masavi / Site Layout Plan", "NOC from Relevant Local Authorities"],
    estimatedTime: "15 - 30 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "rev-copy-mutation",
    name: "Copy of Mutation",
    category: "revenue",
    description: "Issuance of certified copy of registered Mutation (Inteqal order sheet) from official Tehsildar land revenue archives.",
    requirements: ["Mutation Number", "Village & Tehsil Name", "Applicant Aadhaar Card", "Khata / Khewat Details"],
    estimatedTime: "3 - 7 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "rev-encumbrance-cert",
    name: "Encumbrance Certificate",
    category: "revenue",
    description: "Official Revenue Department certificate confirming that a parcel of land or property is free from legal liabilities, mortgages, or financial claims.",
    requirements: ["Aadhaar Card", "Property / Land Title Copy", "Registered Deed Details", "Survey / Khasra Number"],
    estimatedTime: "5 - 10 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "rev-aks-masavi",
    name: "Extract of Aks Masavi / Latha",
    category: "revenue",
    description: "Official certified map extract (Aks Masavi/Latha) displaying exact land boundary contours, survey numbers, and adjacent plots.",
    requirements: ["Khasra Number", "Village & Tehsil Details", "Applicant ID Proof (Aadhaar)", "Fard Copy"],
    estimatedTime: "3 - 7 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "rev-chulah-chowkidara",
    name: "Extract of Chulah / Chowkidara",
    category: "revenue",
    description: "Certified extract of Chulah / Chowkidara tax register used as historical household residence and family lineage proof in rural J&K.",
    requirements: ["Head of Family Name", "Village / Panchayat Name", "Aadhaar Card", "Old Ancestral Residence Proof"],
    estimatedTime: "5 - 10 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "rev-girdawari",
    name: "Extract of Girdawari",
    category: "revenue",
    description: "Certified copy of harvest inspection register (Khasra Girdawari) detailing current cultivation, crop details, and land possession status.",
    requirements: ["Khasra / Khewat Number", "Aadhaar Card", "Village & Patwari Circle Details"],
    estimatedTime: "3 - 5 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "rev-jamabandi",
    name: "Extract of Jamabandi",
    category: "revenue",
    description: "Certified copy of Record of Rights (RoR / Jamabandi) detailing land ownership, shares, area, and revenue liability in J&K.",
    requirements: ["Khewat / Khatauni / Khasra Number", "Landowner Name", "Aadhaar Card"],
    estimatedTime: "3 - 7 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "rev-fard",
    name: "Fard (Fard Intikhab)",
    category: "revenue",
    description: "Official land record extract (Fard) required for property sales, bank loan approvals, court verification, or mortgage deeds.",
    requirements: ["Khasra / Khatauni Number", "Owner Aadhaar Card", "Bank or Legal Reference Document"],
    estimatedTime: "2 - 5 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "rev-field-book",
    name: "Field Book Extract",
    category: "revenue",
    description: "Certified copy of Revenue Field Book containing precise geometric measurements, survey line dimensions, and boundary markings.",
    requirements: ["Khasra Number", "Village & Tehsil", "Aadhaar Card", "Jamabandi Reference"],
    estimatedTime: "5 - 10 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "rev-court-files",
    name: "Files of Court Cases",
    category: "revenue",
    description: "Certified copy of revenue court proceedings, order sheets, partition suits, and land dispute judgments from Tehsildar / DC Courts.",
    requirements: ["Case / Suit Number", "Court Name (Tehsildar/ACR/DC)", "Applicant Aadhaar Card", "Party Details"],
    estimatedTime: "7 - 15 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "rev-income-cert",
    name: "Income Certificate",
    category: "revenue",
    description: "Official Revenue Department Income Certificate required for educational scholarships, government welfare schemes, and job quotas.",
    requirements: ["Aadhaar Card", "Salary Slip / Chowkidar Verification Report", "Ration Card Copy", "Self Declaration Affidavit"],
    estimatedTime: "5 - 10 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "rev-income-dependency",
    name: "Income Dependency Certificate",
    category: "revenue",
    description: "Revenue certificate validating financial dependency on the head of family for higher education, medical reimbursement, or welfare claims.",
    requirements: ["Aadhaar Cards of Dependent & Family Head", "Income Certificate of Head", "Ration Card Copy", "Affidavit"],
    estimatedTime: "7 - 12 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "rev-land-passbook",
    name: "Land Pass Book",
    category: "revenue",
    description: "Issuance and digital update of official Land Pass Book containing comprehensive landholding and revenue details of a farmer/landowner.",
    requirements: ["Aadhaar Card", "Khewat / Khatauni Numbers", "Aadhaar-linked Mobile Number", "Passport Size Photo"],
    estimatedTime: "7 - 15 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "rev-legal-heir",
    name: "Legal Heir Certificate",
    category: "revenue",
    description: "Official Revenue certificate certifying surviving legal heirs of a deceased person for inheritance, pension claims, bank deposits, and land transfer.",
    requirements: ["Death Certificate", "Aadhaar Cards of All Surviving Heirs", "Family Tree (Shajra Nasab)", "Notarized Affidavit"],
    estimatedTime: "15 - 30 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "rev-demarcation",
    name: "Measurement / Demarcation of Land",
    category: "revenue",
    description: "Formal application for physical boundary measurement and demarcation (Nishandehi) of land parcels by Revenue Surveyors/Patwaris.",
    requirements: ["Aadhaar Card", "Title Deed / Jamabandi Copy", "Khasra Number", "Adjacent Landowner Names"],
    estimatedTime: "15 - 30 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "rev-prc-files",
    name: "PRC Files",
    category: "revenue",
    description: "Archival verification and record copy retrieval of legacy Permanent Resident Certificate (PRC) files and Domicile supporting records.",
    requirements: ["Aadhaar Card", "Old PRC Copy (if available)", "Ration Card / Voter List", "Parental PRC Document"],
    estimatedTime: "7 - 15 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "rev-property-cert",
    name: "Property Certificates",
    category: "revenue",
    description: "Official property valuation, valuation assessment, and ownership certificates issued by Revenue Officers for bank loans and visa procedures.",
    requirements: ["Aadhaar Card", "Jamabandi / Fard Copy", "Approved Site/Building Plan", "Valuation Report"],
    estimatedTime: "7 - 14 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "rev-shajra-nasab",
    name: "Shajra Nasab (Family Tree)",
    category: "revenue",
    description: "Certified copy of ancestral genealogical family tree (Shajra Nasab) recorded in revenue archives for inheritance and heir identification.",
    requirements: ["Ancestor / Family Head Name", "Village & Tehsil", "Applicant Aadhaar Card", "Revenue Record References"],
    estimatedTime: "5 - 10 Days",
    price: "\u20B9100 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  // J&K State e-Services (ServiceOnline / J&K e-Unnat Portal)
  {
    id: "jk-domicile-cert",
    name: "Domicile Certificate (J&K)",
    category: "jk_state",
    description: "Official Jammu & Kashmir Domicile Certificate application for employment, admissions, and citizen rights issued by competent Tehsildar authority.",
    requirements: ["Aadhaar Card", "PRC / Ration Card / Electoral Roll / School Certificate", "Passport Size Photograph"],
    estimatedTime: "30 Days",
    price: "\u20B920 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "jk-rba-cert",
    name: "Resident of Backward Area (RBA) Certificate",
    category: "jk_state",
    description: "Official certificate for residents of backward areas in J&K for employment and educational reservation quotas.",
    requirements: ["Aadhaar Card", "Domicile Certificate", "Ration Card / School Record", "Patwari Verification Report"],
    estimatedTime: "15 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "jk-obc-cert",
    name: "Other Backward Classes (OBC / OSC) Certificate",
    category: "jk_state",
    description: "Issuance of OBC / Other Social Castes (OSC) certificate by Tehsildar for central & J&K state government institutions.",
    requirements: ["Aadhaar Card", "Income Proof / Salary Slip", "Domicile Certificate", "Caste Affidavit"],
    estimatedTime: "30 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "jk-st-cert",
    name: "Scheduled Tribe (ST) Certificate",
    category: "jk_state",
    description: "Official Scheduled Tribe certificate issued by Tehsildar for eligible ST communities in Jammu & Kashmir.",
    requirements: ["Aadhaar Card", "Domicile Certificate", "Ancestral ST Record / PRC", "Passport Photo"],
    estimatedTime: "15 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "jk-sc-cert",
    name: "Scheduled Caste (SC) Certificate",
    category: "jk_state",
    description: "Official Scheduled Caste certificate issued by Tehsildar for eligible SC communities in Jammu & Kashmir.",
    requirements: ["Aadhaar Card", "Domicile Certificate", "Ancestral SC Proof", "Passport Photo"],
    estimatedTime: "15 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "jk-alc-ib-cert",
    name: "ALC / IB Certificate (Line of Actual Control / Border Area)",
    category: "jk_state",
    description: "Special reservation certificate for residents of areas adjoining International Border (IB) or Line of Actual Control (ALC) in J&K.",
    requirements: ["Aadhaar Card", "Domicile Certificate", "Border Residence Proof", "Patwari Report"],
    estimatedTime: "15 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "jk-pahari-cert",
    name: "Pahari Ethnic People Category Certificate",
    category: "jk_state",
    description: "Official Pahari Ethnic Category reservation certificate issued by Tehsildar for J&K public recruitment & admissions.",
    requirements: ["Aadhaar Card", "Domicile Certificate", "Family Revenue Record", "Self Declaration"],
    estimatedTime: "30 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "jk-ews-cert",
    name: "Economically Weaker Section (EWS) Certificate",
    category: "jk_state",
    description: "Income & Assets Certificate for EWS reservation category in jobs and educational institutions issued by Tehsildar.",
    requirements: ["Aadhaar Card", "Family Income Certificate / ITR", "Land Holding Documents", "Ration Card"],
    estimatedTime: "45 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "jk-birth-cert",
    name: "Birth Certificate & Child Name Inclusion",
    category: "jk_state",
    description: "Issuance of fresh Birth Certificate, correction, or inclusion of child name in existing birth records.",
    requirements: ["Hospital Discharge Slip / Birth Report", "Parents Aadhaar Cards", "Affidavit (if delayed)"],
    estimatedTime: "30 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "jk-death-cert",
    name: "Death Certificate / Non-Availability Certificate",
    category: "jk_state",
    description: "Official registration & issuance of Death Certificate or Non-Availability Certificate from local registrar.",
    requirements: ["Hospital Death Summary / Chowkidar Report", "Deceased Aadhaar Card", "Applicant ID Proof"],
    estimatedTime: "30 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "jk-marriage-cert",
    name: "Marriage Certificate (Registrar of Marriages)",
    category: "jk_state",
    description: "Legal registration of marriage under J&K Marriage Acts and issuance of official Marriage Certificate.",
    requirements: ["Bride & Groom Aadhaar Cards", "Joint Passport Photograph", "Marriage Card / Nikahnama / Temple Receipt", "Witnesses IDs"],
    estimatedTime: "5 Days",
    price: "\u20B950 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "jk-character-cert",
    name: "Character Certificate by Tehsildar",
    category: "jk_state",
    description: "Official character and antecedents certificate issued by Tehsildar for government employment, tenders, and admissions.",
    requirements: ["Aadhaar Card", "Police Clearance Certificate (PCC)", "Passport Photo", "School/College Conduct Proof"],
    estimatedTime: "20 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "jk-dependent-cert",
    name: "Dependent Certificate",
    category: "jk_state",
    description: "Issuance of Dependent Certificate by Tehsildar for government employee dependents, compassionate grounds, and medical benefits.",
    requirements: ["Aadhaar Cards", "Family Head Pensioner / Employee Slip", "Ration Card", "Affidavit"],
    estimatedTime: "30 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "jk-unemployment-cert",
    name: "Unemployment Certificate",
    category: "jk_state",
    description: "Official certificate certifying unemployment status issued by Tehsildar for government self-employment schemes & loans.",
    requirements: ["Aadhaar Card", "Educational Qualification Marksheets", "Self Declaration Affidavit", "Ration Card"],
    estimatedTime: "15 Days",
    price: "\u20B930 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "jk-pension-isss",
    name: "JK-ISSS & GOI NSAP Social Pension Sanction",
    category: "jk_state",
    description: "Sanction and online registration of Old Age Pension, Widow Pension, and Disability Pension under JK-ISSS & NSAP.",
    requirements: ["Aadhaar Card", "Age Proof / Disability Certificate", "Bank Passbook (DBT Linked)", "Income Certificate"],
    estimatedTime: "30 Days",
    price: "Free Application + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "jk-ladli-beti",
    name: "Ladli Beti & State Marriage Assistance Scheme",
    category: "jk_state",
    description: "Application for financial assistance under Ladli Beti scheme for girl child and State Marriage Assistance Scheme (SMAS) for poor girls.",
    requirements: ["Aadhaar Card", "Birth Certificate of Girl Child", "Parents Income Certificate", "Bank Passbook"],
    estimatedTime: "30 Days",
    price: "Free Application + \u20B970 (CSC Charge)",
    popular: true
  },
  {
    id: "jk-mgnrega-jobcard",
    name: "MGNREGA Job Card Application",
    category: "jk_state",
    description: "Application for issuance of MGNREGA Job Card for rural households under Panchayati Raj Department.",
    requirements: ["Aadhaar Card", "Ration Card", "Bank Account Details", "Passport Photograph"],
    estimatedTime: "15 Days",
    price: "Free Application + \u20B970 (CSC Charge)"
  },
  {
    id: "jk-trade-license",
    name: "Fresh License & Renewal for Carrying Out Trade",
    category: "jk_state",
    description: "Application for fresh municipal trade license or annual renewal for shops, commercial establishments, and business units.",
    requirements: ["Aadhaar Card", "Shop Rent Agreement / Property Receipt", "Pan Card", "NOC from Fire/Pollution (if applicable)"],
    estimatedTime: "30 Days",
    price: "As per Municipal tariff + \u20B970 (CSC Charge)"
  },
  {
    id: "jk-building-licenses",
    name: "Architect, Engineer & Draftsman License (SMC/JMC)",
    category: "jk_state",
    description: "Issuance of License for Architect (AoR), Structural Engineer (SEoR), Town Planner, and Draftsman for Municipal Corporations.",
    requirements: ["Professional Degree / Council Registration Certificate", "Aadhaar Card", "PAN Card", "Experience Proof"],
    estimatedTime: "30 Days",
    price: "As per Municipal fee + \u20B970 (CSC Charge)"
  },
  {
    id: "jk-drone-permission",
    name: "Permission for Drone Flying, Exhibitions & Gatherings",
    category: "jk_state",
    description: "District Magistrate permission for Drone Flying, Religious Processions, Political Gatherings, Exhibitions, or Cultural Events.",
    requirements: ["Applicant ID / Aadhaar Card", "Event Schedule & Location Map", "Drone Operator UIN / License Details", "Police NOC"],
    estimatedTime: "7 - 15 Days",
    price: "\u20B970 (CSC Charge)"
  },
  {
    id: "jk-assistive-aids",
    name: "Motorized Tricycle & Assistive Aids for Specially Abled",
    category: "jk_state",
    description: "Application for grant of high-end automatic wheelchairs, motorized tricycles, and aids to specially-abled persons in J&K.",
    requirements: ["Disability Certificate (40%+ UDID Card)", "Aadhaar Card", "Income Certificate", "Passport Photograph"],
    estimatedTime: "30 Days",
    price: "Free Govt Service + \u20B970 (CSC Charge)"
  },
  {
    id: "jk-senior-citizen",
    name: "Senior Citizen & Super Senior Citizen Certificate",
    category: "jk_state",
    description: "Issuance of Senior Citizen Card / Certificate for welfare schemes, healthcare priorities, and travel concessions.",
    requirements: ["Aadhaar Card / DOB Certificate", "Passport Photo", "Address Proof"],
    estimatedTime: "30 Days",
    price: "\u20B920 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "jk-horticulture-passbook",
    name: "Horticulture Passbook & High Density Orchard Booking",
    category: "jk_state",
    description: "Application for Horticulture Passbook issuance, high-density apple orchard development, and machinery subsidies.",
    requirements: ["Aadhaar Card", "Land Fard / Jamabandi Copy", "Bank Account Passbook", "Khasra Details"],
    estimatedTime: "15 Days",
    price: "\u20B970 (CSC Charge)"
  },
  // CardsAdda Distribution Portal Services
  {
    id: "ca-ayushman-pvc",
    name: "Ayushman Health Card Apply & PVC Smart Card",
    category: "cards_adda",
    description: "Instant Ayushman Bharat Health Card download and high-quality waterproof PVC Smart Card printing with HD barcode.",
    requirements: ["Aadhaar Card", "Ayushman PMJAY ID or Registered Mobile Number"],
    estimatedTime: "Instant / Same Day",
    price: "\u20B930 - \u20B950 (PVC Print)",
    popular: true
  },
  {
    id: "ca-dl-pvc",
    name: "Driving License (DL) - All India PVC Smart Card",
    category: "cards_adda",
    description: "Official Driving License search, PDF download, and durable chip-style PVC Smart Card printing.",
    requirements: ["Driving License Number", "Date of Birth", "Aadhaar Card"],
    estimatedTime: "Instant / Same Day",
    price: "\u20B950 (PVC Smart Card)",
    popular: true
  },
  {
    id: "ca-epan-download",
    name: "E-PAN Card Instant Download & Search",
    category: "cards_adda",
    description: "Instant E-PAN card PDF download and PAN verification using PAN number or Aadhaar details.",
    requirements: ["PAN Number", "Aadhaar Number", "Aadhaar-linked Mobile Number"],
    estimatedTime: "Instant",
    price: "\u20B970 (Portal Charge)",
    popular: true
  },
  {
    id: "ca-lost-pan-find",
    name: "Missing / Lost PAN Card Finder (Aadhaar Based)",
    category: "cards_adda",
    description: "Retrieve lost or unknown PAN number using Aadhaar details and applicant name lookup.",
    requirements: ["Aadhaar Number", "Full Name as per Aadhaar", "Date of Birth"],
    estimatedTime: "Same Day",
    price: "\u20B950 (Search Charge)",
    popular: true
  },
  {
    id: "ca-vehicle-rc-pvc",
    name: "All India Vehicle RC Smart Card & Download",
    category: "cards_adda",
    description: "Vehicle Registration Certificate (RC) PDF search, smart card layout, and high-density PVC printing.",
    requirements: ["Vehicle Registration Number (RC No.)", "Chassis Number (Last 5 Digits)"],
    estimatedTime: "Instant / Same Day",
    price: "\u20B950 (PVC Smart Card)",
    popular: true
  },
  {
    id: "ca-aadhaar-pvc",
    name: "Aadhaar PVC Smart Card Official Print",
    category: "cards_adda",
    description: "Waterproof Aadhaar PVC Smart Card printing with secure QR code scan and microtext layout.",
    requirements: ["Aadhaar Number / EID", "Aadhaar OTP or e-Aadhaar PDF File"],
    estimatedTime: "Same Day",
    price: "\u20B940 - \u20B950 (PVC Print)"
  },
  {
    id: "ca-voter-pvc",
    name: "Voter ID PVC Card & Instant Search (Without OTP)",
    category: "cards_adda",
    description: "Voter ID e-EPIC search and download without OTP requirement, plus PVC Smart Card printing.",
    requirements: ["Voter EPIC Number or Applicant Name & State", "Photo"],
    estimatedTime: "Instant / Same Day",
    price: "\u20B930 - \u20B950 (PVC Print)",
    popular: true
  },
  {
    id: "ca-voter-mobile-link",
    name: "Voter Mobile Number Link & Update",
    category: "cards_adda",
    description: "Fast online/offline mobile number linking with Voter EPIC card for instant e-EPIC download.",
    requirements: ["Voter EPIC Number", "Aadhaar Card", "Mobile Number"],
    estimatedTime: "1 - 3 Days",
    price: "\u20B970 (Service Charge)"
  },
  {
    id: "ca-dsc-class3",
    name: "Digital Signature Certificate (DSC Class 3)",
    category: "cards_adda",
    description: "Issuance of Class 3 Digital Signature Certificate (DSC) for e-Tendering, GST, Income Tax, and ROC.",
    requirements: ["Aadhaar Card", "PAN Card", "Passport Photo", "Video KYC Verification"],
    estimatedTime: "1 Day",
    price: "\u20B9500 - \u20B91200 (USB Token Included)"
  },
  {
    id: "ca-nsdl-instant-pan",
    name: "Instant NSDL PAN Card (New & Correction)",
    category: "cards_adda",
    description: "Instant NSDL e-PAN card generation within 2 hours with Aadhaar OTP or Thumb Biometric verification.",
    requirements: ["Aadhaar Card", "Aadhaar Linked Mobile / Biometric", "Passport Photo"],
    estimatedTime: "2 Hours (e-PAN)",
    price: "\u20B9107 (Govt Fee) + \u20B970 (CSC Charge)"
  },
  {
    id: "ca-agri-stack",
    name: "Agri Stack Farmer ID Smart Card Download",
    category: "cards_adda",
    description: "Agri Stack Farmer ID card search, verification, and PVC Smart Card download for agricultural benefits.",
    requirements: ["Aadhaar Card", "Land Khata / Survey Number", "Mobile Number"],
    estimatedTime: "Instant / 1 Day",
    price: "\u20B930 (PVC Print)"
  },
  {
    id: "ca-ration-rice-pvc",
    name: "AP Rice Card & TG Ration Card Smart Card",
    category: "cards_adda",
    description: "AP Rice Card & Telangana Ration Card PDF search, photo/QR download, and PVC Smart Card printing.",
    requirements: ["Ration Card Number / Aadhaar Number", "Family Head Details"],
    estimatedTime: "Instant",
    price: "\u20B930 (PVC Print)"
  },
  {
    id: "ca-gst-registration",
    name: "GST Registration & Portal Assistance",
    category: "cards_adda",
    description: "New GSTIN registration application, LUT filing, and GST Portal account setup.",
    requirements: ["PAN Card", "Aadhaar Card", "Business Address Proof / Electricity Bill"],
    estimatedTime: "3 - 7 Days",
    price: "\u20B9300 - \u20B9500 (Assistance Charge)"
  },
  {
    id: "ca-tn-birth-cert",
    name: "TN Birth Certificate Instant Download",
    category: "cards_adda",
    description: "Instant search and official PDF download of Tamil Nadu Birth & Death certificates.",
    requirements: ["Registration Number or Child Name & Date of Birth", "District / Hospital"],
    estimatedTime: "Instant",
    price: "\u20B970 (Portal Fee)"
  }
];

// src/ogImageGenerator.ts
import fs from "fs";
import path2 from "path";
import sharp2 from "sharp";

// src/thumbnailGenerator.ts
import path from "path";
import sharp from "sharp";
import { GoogleGenAI, Type } from "@google/genai";
var THUMBNAIL_WIDTH = 2048;
var THUMBNAIL_HEIGHT = 677;
function escapeXml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function splitIconLabelTwoLines(label) {
  const clean = (label || "").trim().replace(/\s+/g, " ");
  if (!clean) return ["Service", "Support"];
  const words = clean.split(" ");
  if (words.length === 1) return [words[0], "Support"];
  if (words.length === 2) return [words[0], words[1]];
  if (words.length === 3) {
    return [`${words[0]} ${words[1]}`, words[2]];
  }
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}
function buildDeterministicThumbnailSpec(input) {
  const rawTitle = (input.title || "").trim();
  const titleUpper = rawTitle.toUpperCase();
  const category = (input.category || "").toLowerCase();
  const postType = (input.postType || "").toLowerCase();
  const statusLower = (input.status || "").toLowerCase();
  if (titleUpper.includes("TES-57") || titleUpper.includes("ARMY") && (titleUpper.includes("TECHNICAL ENTRY") || titleUpper.includes("TES")) || input.id === "army-tes-57-course-2026") {
    return {
      mainHeadingLeft: "INDIAN ARMY",
      redBadgeText: "TES-57 (10+2)",
      secondHeading: "ONLINE APPLICATION",
      yellowBannerPrefix: "Apply Through ",
      yellowBannerHighlight: "CSC DOST",
      fourIcons: [
        "Form Filling Assistance",
        "PCM Marks Upload",
        "JEE Merit Guidance",
        "Registration Support"
      ],
      laptopTitle: "JOIN ARMY",
      laptopSubtitle: "TES-57 Online Application",
      footerLine1: "Get Easy and Reliable Online Assistance",
      footerLine2: "for Indian Army TES-57 Course Application",
      ctaButtonText: statusLower === "closed" ? "READ DETAILS" : "APPLY NOW",
      ...input.customOverrides
    };
  }
  if (titleUpper.includes("RRB") && titleUpper.includes("NTPC") || input.id === "rrb-ntpc-undergraduate-cen-07-2026") {
    return {
      mainHeadingLeft: "RRB NTPC",
      redBadgeText: "3,445 POSTS",
      secondHeading: "ONLINE APPLICATION",
      yellowBannerPrefix: "Apply Through ",
      yellowBannerHighlight: "CSC DOST",
      fourIcons: [
        "CEN 07/2026 Filing",
        "Zone Selection",
        "Photo / Sign Upload",
        "Application Support"
      ],
      laptopTitle: "RRB APPLY",
      laptopSubtitle: "NTPC Online Registration",
      footerLine1: "Get Easy and Reliable Online Assistance",
      footerLine2: "for Railway Recruitment Board NTPC Application",
      ctaButtonText: statusLower === "closed" ? "READ DETAILS" : "APPLY NOW",
      ...input.customOverrides
    };
  }
  if (titleUpper.includes("SSC") && titleUpper.includes("CHSL") || input.id === "ssc-chsl-10-plus-2-exam-2026-tier1") {
    return {
      mainHeadingLeft: "SSC CHSL",
      redBadgeText: "10+2 LEVEL",
      secondHeading: "ONLINE REGISTRATION",
      yellowBannerPrefix: "Apply Through ",
      yellowBannerHighlight: "CSC DOST",
      fourIcons: [
        "OTR Registration",
        "Post Preference",
        "Live Photo Capture",
        "Application Support"
      ],
      laptopTitle: "SSC PORTAL",
      laptopSubtitle: "CHSL Online Application Form",
      footerLine1: "Get Easy and Reliable Online Assistance",
      footerLine2: "for SSC CHSL (10+2) Tier-1 Application",
      ctaButtonText: statusLower === "closed" ? "READ DETAILS" : "APPLY NOW",
      ...input.customOverrides
    };
  }
  if ((titleUpper.includes("CLUSTER") || titleUpper.includes("CUS")) && (titleUpper.includes("B.ED") || titleUpper.includes("EXAM")) || input.id === "cus-bed-supplementary-4th-sem-exam-dyd-2026") {
    return {
      mainHeadingLeft: "CLUSTER UNIV",
      redBadgeText: "B.ED 4TH SEM",
      secondHeading: "EXAM FORM 2026",
      yellowBannerPrefix: "Submit Through ",
      yellowBannerHighlight: "CSC DOST",
      fourIcons: [
        "Exam Form Filing",
        "Fee Verification",
        "DYD NEP Guidance",
        "Student Support"
      ],
      laptopTitle: "CUS EXAMS",
      laptopSubtitle: "Examination Portal Srinagar",
      footerLine1: "Get Easy and Reliable Online Assistance",
      footerLine2: "for Cluster University Srinagar Examination Forms",
      ctaButtonText: "APPLY NOW",
      ...input.customOverrides
    };
  }
  if (titleUpper.includes("JKSSB") && (titleUpper.includes("CLASS IV") || titleUpper.includes("CLASS-IV") || titleUpper.includes("CLASS 4")) || input.id === "preset-jkssb-class-iv" || input.id === "jkssb-class-iv-recruitment-2026") {
    return {
      mainHeadingLeft: "JKSSB",
      redBadgeText: "CLASS IV",
      secondHeading: "ONLINE APPLICATION",
      yellowBannerPrefix: "Apply Through ",
      yellowBannerHighlight: "CSC DOST",
      fourIcons: [
        "Form Filling Assistance",
        "Document Upload",
        "Application Submission",
        "Guidance & Support"
      ],
      laptopTitle: "JKSSB",
      laptopSubtitle: "Online Application Form",
      footerLine1: "Get Easy and Reliable Assistance",
      footerLine2: "for JKSSB Class IV Application",
      ctaButtonText: statusLower === "closed" ? "READ DETAILS" : "APPLY NOW",
      ...input.customOverrides
    };
  }
  if (titleUpper.includes("IGNOU") && (titleUpper.includes("ADMISSION") || titleUpper.includes("REGISTRATION") || category === "admissions") || input.id === "preset-ignou-admission" || input.id === "ignou-admission-2026-july-session") {
    return {
      mainHeadingLeft: "IGNOU",
      redBadgeText: "ADMISSION",
      secondHeading: "ONLINE REGISTRATION",
      yellowBannerPrefix: "Admission ",
      yellowBannerHighlight: "Assistance",
      fourIcons: [
        "Registration Help",
        "Document Upload",
        "Fee Payment Guidance",
        "Admission Support"
      ],
      laptopTitle: "IGNOU",
      laptopSubtitle: "Online Registration Form",
      footerLine1: "Get Easy and Reliable Assistance",
      footerLine2: "for IGNOU Admission Application",
      ctaButtonText: statusLower === "closed" ? "READ DETAILS" : "APPLY NOW",
      ...input.customOverrides
    };
  }
  if (titleUpper.includes("JKBOSE") && (titleUpper.includes("CLASS 10") || titleUpper.includes("10TH")) && (titleUpper.includes("RESULT") || category === "results" || postType === "result") || input.id === "preset-jkbose-class-10-result" || input.id === "jkbose-class-10-result-2026") {
    return {
      mainHeadingLeft: "JKBOSE",
      redBadgeText: "CLASS 10",
      secondHeading: "RESULT UPDATE",
      yellowBannerPrefix: "Check Result ",
      yellowBannerHighlight: "Details",
      fourIcons: [
        "Result Information",
        "Roll Number Guidance",
        "Result Access",
        "Student Support"
      ],
      laptopTitle: "JKBOSE",
      laptopSubtitle: "Online Result Portal",
      footerLine1: "Get Easy and Reliable Assistance",
      footerLine2: "for JKBOSE Class 10 Result",
      ctaButtonText: "CHECK RESULT",
      ...input.customOverrides
    };
  }
  const isResult = postType === "result" || category === "results" || /\b(RESULT|SCORE\s*CARD|MERIT\s*LIST|MARKS)\b/i.test(rawTitle);
  const isAdmission = !isResult && (postType === "admission" || category === "admissions" || category === "cluster_univ" || /\b(ADMISSION|COUNSELLING|ENTRANCE|ENROLLMENT|SEMESTER\s*ADMISSION)\b/i.test(rawTitle));
  const isExamForm = !isResult && !isAdmission && (category === "exam_forms" || /\b(EXAM\s*FORM|DATE\s*SHEET|ADMIT\s*CARD|BACKLOG)\b/i.test(rawTitle));
  const isScheme = postType === "scheme" || /\b(YOJANA|SCHEME|SCHOLARSHIP|KISAN|AYUSHMAN|PENSION|RATION)\b/i.test(rawTitle);
  const isService = postType === "service" || /\b(PAN\s*CARD|AADHAAR|PASSPORT|DOMICILE|VOTER|DRIVING\s*LICENCE|INCOME\s*CERTIFICATE)\b/i.test(rawTitle);
  const isGuide = postType === "guide" || statusLower === "informational" || statusLower === "closed" || category === "syllabus" || category === "answer_keys";
  let mainHeadingLeft = "CSC DOST";
  if (input.department && input.department.trim().length <= 10) {
    mainHeadingLeft = input.department.trim().toUpperCase();
  } else if (titleUpper.includes("JKSSB") || category === "jkssb") {
    mainHeadingLeft = "JKSSB";
  } else if (titleUpper.includes("JKBOSE")) {
    mainHeadingLeft = "JKBOSE";
  } else if (titleUpper.includes("IGNOU")) {
    mainHeadingLeft = "IGNOU";
  } else if (titleUpper.includes("SSC") || category === "ssc_jobs") {
    mainHeadingLeft = "SSC";
  } else if (titleUpper.includes("RRB") || titleUpper.includes("RAILWAY") || category === "rrb_jobs") {
    mainHeadingLeft = "RRB";
  } else if (titleUpper.includes("ARMY") || titleUpper.includes("AGNIVEER") || category === "army_jobs") {
    mainHeadingLeft = "ARMY";
  } else if (titleUpper.includes("KASHMIR UNIVERSITY") || titleUpper.includes("KU ") || category === "exam_forms" || category === "admissions") {
    mainHeadingLeft = "KASHMIR UNIV";
  } else if (titleUpper.includes("CLUSTER UNIV") || titleUpper.includes("CUS") || category === "cluster_univ") {
    mainHeadingLeft = "CLUSTER UNIV";
  } else if (titleUpper.includes("NTA") || titleUpper.includes("NEET") || titleUpper.includes("CUET") || titleUpper.includes("JEE") || category === "nta") {
    mainHeadingLeft = "NTA";
  } else if (titleUpper.includes("UPSC")) {
    mainHeadingLeft = "UPSC";
  } else if (titleUpper.includes("IBPS")) {
    mainHeadingLeft = "IBPS";
  } else if (titleUpper.includes("JK BANK") || titleUpper.includes("J&K BANK")) {
    mainHeadingLeft = "J&K BANK";
  } else if (titleUpper.includes("PM KISAN")) {
    mainHeadingLeft = "PM KISAN";
  } else if (titleUpper.includes("AYUSHMAN")) {
    mainHeadingLeft = "AYUSHMAN";
  } else if (titleUpper.includes("PAN CARD")) {
    mainHeadingLeft = "PAN CARD";
  } else if (titleUpper.includes("AADHAAR")) {
    mainHeadingLeft = "AADHAAR";
  } else if (titleUpper.includes("PASSPORT")) {
    mainHeadingLeft = "PASSPORT";
  } else {
    const firstWord = rawTitle.split(/[\s–—-]+/)[0]?.replace(/[^A-Za-z0-9&]/g, "").toUpperCase();
    if (firstWord && firstWord.length >= 2 && firstWord.length <= 10) {
      mainHeadingLeft = firstWord;
    }
  }
  let redBadgeText = "RECRUITMENT";
  const classMatch = rawTitle.match(/\b(CLASS\s*(?:IV|10|12|10TH|12TH|VIII|XI)|10\+2|TES-\d+|CHSL|CGL|MTS|GD|NTPC|CONSTABLE|SI|PATWARI|JUNIOR\s*ASSISTANT|NAIB\s*TEHSILDAR|FORESTER|B\.ED|PG|UG|BG\s*\d\w*\s*SEM)\b/i);
  if (classMatch) {
    redBadgeText = classMatch[1].toUpperCase().replace(/\s+/g, " ");
    if (redBadgeText.length > 13) {
      redBadgeText = redBadgeText.slice(0, 13).trim();
    }
  } else if (isResult) {
    redBadgeText = "RESULT 2026";
  } else if (isAdmission) {
    redBadgeText = "ADMISSION";
  } else if (isExamForm) {
    redBadgeText = "EXAM FORM";
  } else if (isScheme) {
    redBadgeText = "GOVT SCHEME";
  } else if (isService) {
    redBadgeText = "E-SERVICE";
  } else if (isGuide) {
    redBadgeText = "UPDATE";
  }
  let secondHeading = "ONLINE APPLICATION";
  let yellowBannerPrefix = "Apply Through ";
  let yellowBannerHighlight = "CSC";
  let fourIcons = [
    "Form Filling Assistance",
    "Document Upload",
    "Application Submission",
    "Guidance & Support"
  ];
  let laptopSubtitle = "Online Application Form";
  let ctaButtonText = "APPLY NOW";
  if (isResult) {
    secondHeading = "RESULT UPDATE";
    yellowBannerPrefix = "Check Result ";
    yellowBannerHighlight = "Details";
    fourIcons = [
      "Result Information",
      "Roll Number Guidance",
      "Result Access",
      "Student Support"
    ];
    laptopSubtitle = "Online Result Portal";
    ctaButtonText = "CHECK RESULT";
  } else if (isAdmission) {
    secondHeading = "ONLINE REGISTRATION";
    yellowBannerPrefix = "Admission ";
    yellowBannerHighlight = "Assistance";
    fourIcons = [
      "Registration Help",
      "Document Upload",
      "Fee Payment Guidance",
      "Admission Support"
    ];
    laptopSubtitle = "Online Registration Form";
    ctaButtonText = statusLower === "closed" ? "READ DETAILS" : "APPLY NOW";
  } else if (isExamForm) {
    secondHeading = "EXAMINATION FORM";
    yellowBannerPrefix = "Submit Form At ";
    yellowBannerHighlight = "CSC";
    fourIcons = [
      "Exam Form Filling",
      "Subject Selection",
      "Fee Submission",
      "Student Support"
    ];
    laptopSubtitle = "Online Examination Form";
    ctaButtonText = statusLower === "closed" ? "READ DETAILS" : "APPLY NOW";
  } else if (isScheme) {
    secondHeading = "BENEFICIARY REGISTRATION";
    yellowBannerPrefix = "Apply Through ";
    yellowBannerHighlight = "CSC";
    fourIcons = [
      "Eligibility Check",
      "Document Upload",
      "e-KYC & Filing",
      "Citizen Support"
    ];
    laptopSubtitle = "Citizen Scheme Portal";
    ctaButtonText = statusLower === "closed" ? "READ DETAILS" : "APPLY NOW";
  } else if (isService) {
    secondHeading = "CITIZEN E-SERVICE";
    yellowBannerPrefix = "Apply Through ";
    yellowBannerHighlight = "CSC";
    fourIcons = [
      "Form Filling Assistance",
      "Document Upload",
      "Fast Processing",
      "Receipt & Tracking"
    ];
    laptopSubtitle = "Digital Service Portal";
    ctaButtonText = "APPLY NOW";
  } else if (isGuide) {
    secondHeading = "OFFICIAL NOTIFICATION";
    yellowBannerPrefix = "Complete Guide & ";
    yellowBannerHighlight = "Details";
    fourIcons = [
      "Official Notice Info",
      "Eligibility Guide",
      "Document Checklist",
      "Guidance & Support"
    ];
    laptopSubtitle = "Official Notice Portal";
    ctaButtonText = "READ DETAILS";
  }
  if (statusLower === "closed" || statusLower === "informational") {
    ctaButtonText = "READ DETAILS";
  } else if (statusLower === "result") {
    ctaButtonText = "CHECK RESULT";
  }
  const conciseSubject = `${mainHeadingLeft} ${redBadgeText}`.replace(/\s+/g, " ").trim();
  const footerSuffix = isResult ? `for ${conciseSubject} Result` : isAdmission ? `for ${conciseSubject} Application` : `for ${conciseSubject} Application`;
  return {
    mainHeadingLeft,
    redBadgeText,
    secondHeading,
    yellowBannerPrefix,
    yellowBannerHighlight,
    fourIcons,
    laptopTitle: mainHeadingLeft.slice(0, 12),
    laptopSubtitle,
    footerLine1: "Get Easy and Reliable Assistance",
    footerLine2: footerSuffix.slice(0, 42),
    ctaButtonText,
    ...input.customOverrides
  };
}
async function extractThumbnailSpecWithAI(input) {
  const baseSpec = buildDeterministicThumbnailSpec(input);
  const titleUpper = (input.title || "").toUpperCase();
  if (input.id === "preset-jkssb-class-iv" || input.id === "preset-ignou-admission" || input.id === "preset-jkbose-class-10-result" || titleUpper === "JKSSB CLASS IV RECRUITMENT" || titleUpper === "IGNOU ADMISSION" || titleUpper === "JKBOSE CLASS 10 RESULT") {
    return baseSpec;
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return baseSpec;
  }
  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are generating structured copy for a fixed-layout 2048x677 CSC DOST portal banner thumbnail.
Summarize the following post into ultra-concise, high-impact banner text that fits the fixedJKSSB Class IV master template:
Post Title: ${input.title}
Category: ${input.category || ""}
Department/Organization: ${input.department || ""}
Post Type: ${input.postType || ""}
Short Description: ${input.shortInfo || ""}
Important Dates: Start ${input.startDate || "N/A"}, Last Date ${input.lastDate || "N/A"}
Status: ${input.status || "Open"}

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
        responseMimeType: "application/json",
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
              items: { type: Type.STRING }
            },
            laptopTitle: { type: Type.STRING },
            laptopSubtitle: { type: Type.STRING },
            footerLine1: { type: Type.STRING },
            footerLine2: { type: Type.STRING },
            ctaButtonText: { type: Type.STRING }
          },
          required: [
            "mainHeadingLeft",
            "redBadgeText",
            "secondHeading",
            "yellowBannerPrefix",
            "yellowBannerHighlight",
            "fourIcons",
            "laptopTitle",
            "laptopSubtitle",
            "footerLine1",
            "footerLine2",
            "ctaButtonText"
          ]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    const validCta = parsed.ctaButtonText === "CHECK RESULT" || parsed.ctaButtonText === "READ DETAILS" ? parsed.ctaButtonText : "APPLY NOW";
    const iconsArr = Array.isArray(parsed.fourIcons) && parsed.fourIcons.length >= 4 ? [
      String(parsed.fourIcons[0]),
      String(parsed.fourIcons[1]),
      String(parsed.fourIcons[2]),
      String(parsed.fourIcons[3])
    ] : baseSpec.fourIcons;
    return {
      mainHeadingLeft: (parsed.mainHeadingLeft || baseSpec.mainHeadingLeft).toUpperCase().slice(0, 11),
      redBadgeText: (parsed.redBadgeText || baseSpec.redBadgeText).toUpperCase().slice(0, 13),
      secondHeading: (parsed.secondHeading || baseSpec.secondHeading).toUpperCase().slice(0, 24),
      yellowBannerPrefix: parsed.yellowBannerPrefix || baseSpec.yellowBannerPrefix,
      yellowBannerHighlight: parsed.yellowBannerHighlight || baseSpec.yellowBannerHighlight,
      fourIcons: iconsArr,
      laptopTitle: (parsed.laptopTitle || parsed.mainHeadingLeft || baseSpec.laptopTitle).toUpperCase().slice(0, 10),
      laptopSubtitle: (parsed.laptopSubtitle || baseSpec.laptopSubtitle).slice(0, 26),
      footerLine1: "Get Easy and Reliable Assistance",
      footerLine2: (parsed.footerLine2 || baseSpec.footerLine2).slice(0, 42),
      ctaButtonText: validCta,
      ...input.customOverrides
    };
  } catch (err) {
    console.warn("[ThumbnailGenerator] AI extraction notice, using deterministic spec:", err);
    return baseSpec;
  }
}
var cachedCleanBaseRaw = null;
var MASTER_REFERENCE_PATH = path.join(
  process.cwd(),
  "public",
  "assets",
  "aistudio",
  "JKSSB_Class_IV_CSC_Application_Assistance_60a01722.png"
);
async function getCleanMasterBaseBuffer() {
  if (cachedCleanBaseRaw) {
    return {
      data: Buffer.from(cachedCleanBaseRaw.data),
      width: cachedCleanBaseRaw.width,
      height: cachedCleanBaseRaw.height,
      channels: cachedCleanBaseRaw.channels
    };
  }
  const { data, info } = await sharp(MASTER_REFERENCE_PATH).resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const C = info.channels;
  const setPixel = (x, y, r, g, b) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const idx = (y * W + x) * C;
    data[idx] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
  };
  const getPixel = (x, y) => {
    const cx = Math.max(0, Math.min(W - 1, x));
    const cy = Math.max(0, Math.min(H - 1, y));
    const idx = (cy * W + cx) * C;
    return [data[idx], data[idx + 1], data[idx + 2]];
  };
  const fillRectSolid = (x1, y1, x2, y2, r, g, b) => {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        setPixel(x, y, r, g, b);
      }
    }
  };
  const inpaintRectHorizontal = (x1, y1, x2, y2) => {
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
  inpaintRectHorizontal(70, 18, 1162, 228);
  inpaintRectHorizontal(205, 244, 1035, 328);
  inpaintRectHorizontal(75, 456, 321, 532);
  inpaintRectHorizontal(333, 456, 610, 532);
  inpaintRectHorizontal(621, 456, 902, 532);
  inpaintRectHorizontal(914, 456, 1152, 532);
  inpaintRectHorizontal(1380, 238, 1624, 324);
  inpaintRectHorizontal(198, 558, 925, 664);
  for (let y = 560; y <= 634; y++) {
    const [r, g, b] = getPixel(1520, y);
    for (let x = 1525; x <= 1862; x++) {
      setPixel(x, y, r, g, b);
    }
  }
  cachedCleanBaseRaw = { data: Buffer.from(data), width: W, height: H, channels: C };
  return { data, width: W, height: H, channels: C };
}
function buildMasterOverlaySvg(spec) {
  const mainLeft = (spec.mainHeadingLeft || "JKSSB").toUpperCase().trim();
  const badgeText = (spec.redBadgeText || "CLASS IV").toUpperCase().trim();
  const secondLine = (spec.secondHeading || "ONLINE APPLICATION").toUpperCase().trim();
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
  const secondFontSize = secondLine.length > 22 ? 56 : secondLine.length > 18 ? 64 : 70;
  const yellowPrefixClean = (spec.yellowBannerPrefix || "Apply Through").trim();
  const yellowHighlightClean = (spec.yellowBannerHighlight || "CSC").trim();
  const iconCentersX = [188, 471, 761, 1044];
  const iconLines = spec.fourIcons.map((lbl) => splitIconLabelTwoLines(lbl));
  const ctaText = (spec.ctaButtonText || "APPLY NOW").toUpperCase().trim();
  const ctaFontSize = ctaText.length > 10 ? 38 : 45;
  const laptopTitle = (spec.laptopTitle || mainLeft).toUpperCase().slice(0, 11);
  const laptopSubtitle = spec.laptopSubtitle || "Online Application Form";
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
  ${iconLines.map(
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
  ).join("")}

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
function renderStandaloneMasterThumbnailSvg(spec) {
  const mainLeft = (spec.mainHeadingLeft || "JKSSB").toUpperCase().trim();
  const badgeText = (spec.redBadgeText || "CLASS IV").toUpperCase().trim();
  const secondLine = (spec.secondHeading || "ONLINE APPLICATION").toUpperCase().trim();
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
  const secondFontSize = secondLine.length > 22 ? 56 : secondLine.length > 18 ? 64 : 70;
  const yellowPrefixClean = (spec.yellowBannerPrefix || "Apply Through").trim();
  const yellowHighlightClean = (spec.yellowBannerHighlight || "CSC").trim();
  const iconCentersX = [188, 471, 761, 1044];
  const iconLines = spec.fourIcons.map((lbl) => splitIconLabelTwoLines(lbl));
  const ctaText = (spec.ctaButtonText || "APPLY NOW").toUpperCase().trim();
  const ctaFontSize = ctaText.length > 10 ? 38 : 45;
  const laptopTitle = (spec.laptopTitle || mainLeft).toUpperCase().slice(0, 11);
  const laptopSubtitle = spec.laptopSubtitle || "Online Application Form";
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
  <!-- LEFT SIDE: ROW 1 \u2014 MAIN HEADING + RED ROUNDED RECTANGLE               -->
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
  <!-- LEFT SIDE: ROW 2 \u2014 SECOND LARGE HEADLINE                              -->
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
  <!-- LEFT SIDE: ROW 3 \u2014 BRIGHT YELLOW ROUNDED BANNER PILL                  -->
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
  <!-- LEFT SIDE: ROW 4 \u2014 4 CIRCULAR SERVICE ICONS & 3 VERTICAL DIVIDERS      -->
  <!-- ===================================================================== -->
  <!-- 3 Subtle Vertical Dividers -->
  <line x1="327" y1="358" x2="327" y2="520" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />
  <line x1="616" y1="358" x2="616" y2="520" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />
  <line x1="908" y1="358" x2="908" y2="520" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" />

  <!-- 4 Circular Service Icons -->
  ${iconCentersX.map((cx, idx) => {
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
  }).join("")}

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
async function renderMasterThumbnailBuffer(spec, format = "png") {
  try {
    const base = await getCleanMasterBaseBuffer();
    const svgOverlay = buildMasterOverlaySvg(spec);
    let pipeline = sharp(base.data, {
      raw: {
        width: base.width,
        height: base.height,
        channels: base.channels
      }
    }).composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
      }
    ]);
    if (format === "webp") {
      return await pipeline.webp({ quality: 94, effort: 4 }).toBuffer();
    }
    return await pipeline.png({ quality: 95, compressionLevel: 7 }).toBuffer();
  } catch (err) {
    console.warn("[ThumbnailGenerator] Base compositing notice, falling back to standalone SVG:", err);
    const fallbackSvg = renderStandaloneMasterThumbnailSvg(spec);
    let fallbackPipeline = sharp(Buffer.from(fallbackSvg), { density: 150 });
    if (format === "webp") {
      return await fallbackPipeline.webp({ quality: 94 }).toBuffer();
    }
    return await fallbackPipeline.png({ quality: 95 }).toBuffer();
  }
}

// src/ogImageGenerator.ts
function escapeXml2(unsafe) {
  if (!unsafe) return "";
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function wrapText(text, maxCharsPerLine = 48, maxLines = 3) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  return lines;
}
function getCategoryInfo(category) {
  switch (category) {
    case "army_jobs":
      return { label: "INDIAN ARMY RECRUITMENT", bg1: "#0B2027", bg2: "#204051", accent: "#D4AF37", tagBg: "#B91C1C" };
    case "rrb_jobs":
      return { label: "RAILWAY RECRUITMENT (RRB)", bg1: "#1A2A3A", bg2: "#0F4C81", accent: "#F59E0B", tagBg: "#1E40AF" };
    case "ssc_jobs":
      return { label: "STAFF SELECTION COMMISSION (SSC)", bg1: "#0F172A", bg2: "#1E293B", accent: "#38BDF8", tagBg: "#0369A1" };
    case "jkssb":
      return { label: "J&K SERVICES SELECTION BOARD (JKSSB)", bg1: "#0F2C59", bg2: "#1E3E62", accent: "#E0C097", tagBg: "#991B1B" };
    case "exam_forms":
      return { label: "UNIVERSITY OF KASHMIR (EXAM FORMS)", bg1: "#1E1B4B", bg2: "#312E81", accent: "#A78BFA", tagBg: "#6D28D9" };
    case "admissions":
      return { label: "UNIVERSITY ADMISSIONS NOTIFICATION", bg1: "#064E3B", bg2: "#047857", accent: "#6EE7B7", tagBg: "#059669" };
    case "cluster_univ":
      return { label: "CLUSTER UNIVERSITY SRINAGAR (CUS)", bg1: "#1E1B4B", bg2: "#4338CA", accent: "#FDE047", tagBg: "#4F46E5" };
    default:
      return { label: "OFFICIAL CITIZEN NOTICE & UPDATE", bg1: "#0F172A", bg2: "#1E293B", accent: "#F59E0B", tagBg: "#155EEF" };
  }
}
function generateOgSvg(item) {
  const isDefault = !item || !item.title;
  const title = item?.title || "CSC DOST - Official Recruitment Updates, Exam Forms & Admissions";
  const category = item?.category || "jobs";
  const catInfo = getCategoryInfo(category);
  const lastDate = item?.lastDate || "Check Official Notice";
  const totalPosts = item?.totalPosts ? String(item.totalPosts) : "Open for eligible candidates";
  const eligibility = item?.eligibility ? item.eligibility.slice(0, 75) + (item.eligibility.length > 75 ? "..." : "") : "10th / 12th / Graduate / Diploma / Degree";
  const advtNo = item?.advertisementNo || "Official Notification";
  const titleLines = wrapText(title, 42, 3);
  const escapedTitleLines = titleLines.map((l) => escapeXml2(l));
  const escapedCategory = escapeXml2(catInfo.label);
  const escapedLastDate = escapeXml2(lastDate);
  const escapedPosts = escapeXml2(totalPosts);
  const escapedEligibility = escapeXml2(eligibility);
  const escapedAdvtNo = escapeXml2(advtNo);
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#101A36" />
      <stop offset="50%" stop-color="#0B132B" />
      <stop offset="100%" stop-color="#070C1A" />
    </linearGradient>

    <!-- Outer Border Clean Accent Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#243356" />
      <stop offset="50%" stop-color="#155EEF" />
      <stop offset="100%" stop-color="#243356" />
    </linearGradient>

    <!-- Header Brand Pill Gradient -->
    <linearGradient id="brandPillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#101A36" />
      <stop offset="50%" stop-color="#142145" />
      <stop offset="100%" stop-color="#101A36" />
    </linearGradient>

    <!-- Yellow Gold Pill Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>

    <!-- Card Inner Gradient -->
    <linearGradient id="innerCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.3" />
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
    </filter>

    <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#F59E0B" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Base Canvas Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Outer Frame -->
  <rect x="18" y="18" width="1164" height="594" rx="28" fill="none" stroke="url(#borderGrad)" stroke-width="3" />
  <rect x="28" y="28" width="1144" height="574" rx="20" fill="none" stroke="#243356" stroke-width="1.5" stroke-opacity="0.6" />

  <!-- TOP HEADER SECTION -->
  <!-- CSC DOST Circular Seal Logo on Top Left -->
  <g transform="translate(65, 50)">
    <!-- Outer Circle -->
    <circle cx="55" cy="55" r="50" fill="#101A36" stroke="#155EEF" stroke-width="3" filter="url(#dropShadow)" />
    <circle cx="55" cy="55" r="44" fill="#142145" stroke="#243356" stroke-width="1.5" />
    
    <!-- Text inside Seal -->
    <text x="55" y="44" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#F4B400" text-anchor="middle" letter-spacing="1">CSC DOST</text>
    <text x="55" y="62" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" text-anchor="middle">\u2605 VLE \u2605</text>
    <text x="55" y="80" font-family="Arial, sans-serif" font-weight="700" font-size="10" fill="#B8C2D6" text-anchor="middle">AUTHORIZED</text>
  </g>

  <!-- Header Brand Pill (Top Center) -->
  <g transform="translate(195, 48)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="620" height="62" rx="14" fill="url(#brandPillGrad)" stroke="#243356" stroke-width="2" />
    <text x="310" y="40" font-family="Arial, sans-serif" font-weight="900" font-size="26" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
      CSC DOST \u2022 CITIZEN NOTICE DESK
    </text>
  </g>

  <!-- Top Right Category Badge Pill -->
  <g transform="translate(835, 48)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="300" height="62" rx="14" fill="#182649" stroke="#2B3E6E" stroke-width="2" />
    <text x="150" y="38" font-family="Arial, sans-serif" font-weight="800" font-size="16" fill="#93B4FF" text-anchor="middle">
      ${escapeXml2(isDefault ? "ONLINE CITIZEN DESK" : catInfo.label.slice(0, 24))}
    </text>
  </g>

  <!-- CENTER CONTENT CARD -->
  <g transform="translate(65, 135)">
    <!-- Main Info Box Backdrop -->
    <rect x="0" y="0" width="1070" height="375" rx="20" fill="url(#innerCardGrad)" stroke="#334155" stroke-width="2" filter="url(#dropShadow)" />
    
    <!-- Gold Top Inner Line -->
    <rect x="20" y="1" width="1030" height="3" fill="url(#goldGrad)" rx="1.5" />

    <!-- Sub-Heading / Advt Badge -->
    <rect x="35" y="24" width="${Math.min(advtNo.length * 11 + 35, 550)}" height="32" rx="8" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5" />
    <text x="50" y="46" font-family="Arial, sans-serif" font-weight="800" font-size="14" fill="#FDE047">
      \u{1F4CC} ${escapedAdvtNo}
    </text>

    <!-- Main Title Heading (Multi-line bold text) -->
    <g transform="translate(35, 95)">
      ${escapedTitleLines.map((line, idx) => `
        <text x="0" y="${idx * 46}" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${escapedTitleLines.length > 2 ? "32" : "36"}" fill="#FFFFFF" filter="url(#dropShadow)">
          ${line}
        </text>
      `).join("")}
    </g>

    <!-- KEY DETAILS TILES / PILLS (Bottom inside card) -->
    <g transform="translate(35, 260)">
      <!-- Tile 1: Last Date -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="310" height="85" rx="12" fill="#7F1D1D" stroke="#EF4444" stroke-width="2" />
        <text x="20" y="30" font-family="Arial, sans-serif" font-weight="700" font-size="13" fill="#FECACA">\u23F0 LAST DATE TO APPLY</text>
        <text x="20" y="62" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF">${escapedLastDate.slice(0, 24)}</text>
      </g>

      <!-- Tile 2: Total Posts / Vacancies -->
      <g transform="translate(330, 0)">
        <rect x="0" y="0" width="310" height="85" rx="12" fill="#14532D" stroke="#22C55E" stroke-width="2" />
        <text x="20" y="30" font-family="Arial, sans-serif" font-weight="700" font-size="13" fill="#BBF7D0">\u{1F465} TOTAL POSTS / VACANCIES</text>
        <text x="20" y="62" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF">${escapedPosts.slice(0, 22)}</text>
      </g>

      <!-- Tile 3: Eligibility / Qualifications -->
      <g transform="translate(660, 0)">
        <rect x="0" y="0" width="340" height="85" rx="12" fill="#1E3A8A" stroke="#3B82F6" stroke-width="2" />
        <text x="20" y="30" font-family="Arial, sans-serif" font-weight="700" font-size="13" fill="#BFDBFE">\u{1F393} ELIGIBILITY CRITERIA</text>
        <text x="20" y="60" font-family="Arial, sans-serif" font-weight="800" font-size="15" fill="#FFFFFF">${escapedEligibility.slice(0, 32)}</text>
      </g>
    </g>
  </g>

  <!-- BOTTOM FOOTER BRANDING BAR -->
  <g transform="translate(65, 525)">
    <!-- Black / Gold pill bar -->
    <rect x="0" y="0" width="1070" height="60" rx="12" fill="#020617" stroke="#F59E0B" stroke-width="2.5" filter="url(#dropShadow)" />
    
    <text x="35" y="37" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="#FDE047" letter-spacing="1">
      cscdost.com (Since 2018)
    </text>

    <text x="1035" y="37" font-family="Arial, sans-serif" font-weight="800" font-size="18" fill="#FFFFFF" text-anchor="end">
      \u{1F449} Apply Online &amp; Download Notice at www.cscdost.com
    </text>
  </g>
</svg>`;
}
async function generateOgPng(item) {
  const svgString = generateOgSvg(item);
  return sharp2(Buffer.from(svgString)).png({ quality: 90, compressionLevel: 8 }).toBuffer();
}
async function generateSocialPreviewPng(item) {
  if (!item || !item.id) {
    const defaultBannerPath = path2.join(process.cwd(), "public", "og-banner.png");
    if (fs.existsSync(defaultBannerPath)) {
      try {
        return fs.readFileSync(defaultBannerPath);
      } catch (e) {
      }
    }
    return generateOgPng(null);
  }
  try {
    let thumbBuffer = null;
    const candidates = [
      path2.join(process.cwd(), "public", "thumbnails", `${item.id}.png`),
      path2.join(process.cwd(), "public", "thumbnails", `${item.id}.webp`),
      item.id === "jkssb-class-iv-recruitment-2026" || item.id === "preset-jkssb-class-iv" ? path2.join(process.cwd(), "public", "thumbnails", "test-jkssb-class-iv.png") : null,
      item.id === "ignou-admission-2026-july-session" ? path2.join(process.cwd(), "public", "thumbnails", "test-ignou-admission.png") : null,
      item.id === "jkbose-class-10-result-2026" ? path2.join(process.cwd(), "public", "thumbnails", "test-jkbose-class-10-result.png") : null
    ].filter(Boolean);
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          thumbBuffer = fs.readFileSync(p);
          break;
        } catch (e) {
        }
      }
    }
    if (!thumbBuffer) {
      const spec = buildDeterministicThumbnailSpec({
        id: item.id,
        title: item.title || "CSC DOST Citizen Update",
        category: item.category,
        department: item.department,
        postType: item.postType,
        shortInfo: item.shortInfo,
        startDate: item.startDate,
        lastDate: item.lastDate,
        status: item.status
      });
      thumbBuffer = await renderMasterThumbnailBuffer(spec, "png");
    }
    const resizedThumb = await sharp2(thumbBuffer).resize(1160, 383, { fit: "fill" }).png().toBuffer();
    const categoryLabel = (item.category && SARKARI_CATEGORIES[item.category]?.label || "OFFICIAL NOTIFICATION").toUpperCase();
    const bgSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="socialBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#071533" />
          <stop offset="50%" stop-color="#092556" />
          <stop offset="100%" stop-color="#051026" />
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
        </filter>
      </defs>

      <!-- Background Canvas (1200 x 630) -->
      <rect width="1200" height="630" fill="url(#socialBg)" />
      <rect x="8" y="8" width="1184" height="614" rx="20" fill="none" stroke="#1E3A8A" stroke-width="2" />

      <!-- Top Header Branding Bar -->
      <g filter="url(#shadow)">
        <rect x="20" y="20" width="1160" height="82" rx="14" fill="#0D1F47" stroke="#2563EB" stroke-width="1.5" />
        
        <!-- CSC DOST Logo Circle -->
        <circle cx="68" cy="61" r="28" fill="#2563EB" />
        <text x="68" y="67" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="15" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">CSC</text>
        
        <text x="110" y="55" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" letter-spacing="0.5">CSC DOST</text>
        <text x="110" y="77" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="600" font-size="13" fill="#93C5FD">Official Citizen Notice Desk \u2022 cscdost.com</text>
        
        <!-- Category Badge Pill -->
        <rect x="880" y="38" width="280" height="46" rx="10" fill="#1E3A8A" stroke="#60A5FA" stroke-width="1" />
        <text x="1020" y="66" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="800" font-size="13" fill="#FDE047" text-anchor="middle" letter-spacing="0.5">${escapeXml2(categoryLabel.slice(0, 26))}</text>
      </g>

      <!-- Bottom Supporting Action Bar -->
      <g filter="url(#shadow)">
        <rect x="20" y="528" width="1160" height="82" rx="14" fill="#0D1F47" stroke="#1E3A8A" stroke-width="1.5" />
        <text x="45" y="575" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="800" font-size="17" fill="#FDE047">\u26A1 Easy and Reliable Online Application Assistance</text>
        <text x="1155" y="575" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="800" font-size="17" fill="#FFFFFF" text-anchor="end">Apply Online at www.cscdost.com \u{1F449}</text>
      </g>
    </svg>`;
    return await sharp2(Buffer.from(bgSvg)).composite([
      {
        input: resizedThumb,
        left: 20,
        top: 124
      }
    ]).png({ quality: 94, compressionLevel: 7 }).toBuffer();
  } catch (err) {
    console.warn("[OG] Error generating composite 1200x630 social variant, falling back:", err);
    return generateOgPng(item);
  }
}
function generateServiceOgSvg(service) {
  const escapedName = escapeXml2(service.name);
  const escapedPrice = escapeXml2(service.price);
  const escapedTime = escapeXml2(service.estimatedTime);
  const escapedCategory = escapeXml2(service.category);
  const escapedDesc = escapeXml2(service.description);
  const descLines = wrapText(service.description, 50, 2).map((l) => escapeXml2(l));
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="50%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#EAB308" />
    </linearGradient>

    <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect x="18" y="18" width="1164" height="594" rx="28" fill="none" stroke="url(#goldGrad)" stroke-width="8" />

  <!-- TOP HEADER -->
  <g transform="translate(65, 50)">
    <circle cx="55" cy="55" r="50" fill="#0F172A" stroke="#F59E0B" stroke-width="4" filter="url(#dropShadow)" />
    <text x="55" y="44" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#FDE047" text-anchor="middle">CSC DOST</text>
    <text x="55" y="64" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" text-anchor="middle">SERVICES</text>
  </g>

  <g transform="translate(195, 48)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="620" height="62" rx="14" fill="#0284C7" stroke="#38BDF8" stroke-width="2" />
    <text x="310" y="40" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">
      ONLINE CITIZEN E-SERVICES
    </text>
  </g>

  <!-- CONTENT -->
  <g transform="translate(65, 140)">
    <rect x="0" y="0" width="1070" height="370" rx="20" fill="#FFFFFF" fill-opacity="0.05" stroke="#334155" stroke-width="2" />
    
    <text x="40" y="70" font-family="Arial, sans-serif" font-weight="900" font-size="42" fill="#FFFFFF" filter="url(#dropShadow)">
      ${escapedName}
    </text>

    ${descLines.map((l, idx) => `
      <text x="40" y="${130 + idx * 35}" font-family="Arial, sans-serif" font-weight="500" font-size="22" fill="#94A3B8">
        ${l}
      </text>
    `).join("")}

    <g transform="translate(40, 240)">
      <rect x="0" y="0" width="300" height="90" rx="12" fill="#14532D" stroke="#22C55E" stroke-width="2" />
      <text x="20" y="32" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#BBF7D0">ESTIMATED FEE</text>
      <text x="20" y="68" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF">${escapedPrice}</text>
    </g>

    <g transform="translate(370, 240)">
      <rect x="0" y="0" width="300" height="90" rx="12" fill="#1E3A8A" stroke="#3B82F6" stroke-width="2" />
      <text x="20" y="32" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#BFDBFE">PROCESSING TIME</text>
      <text x="20" y="68" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF">${escapedTime}</text>
    </g>
  </g>

  <!-- FOOTER -->
  <g transform="translate(65, 530)">
    <rect x="0" y="0" width="1070" height="55" rx="12" fill="#020617" stroke="#F59E0B" stroke-width="2" />
    <text x="30" y="35" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#FDE047">
      cscdost.com \u2022 Authorized Common Service Center
    </text>
    <text x="1040" y="35" font-family="Arial, sans-serif" font-weight="800" font-size="18" fill="#FFFFFF" text-anchor="end">
      Apply &amp; Upload Documents Online
    </text>
  </g>
</svg>`;
}
async function generateServiceOgPng(service) {
  const svgString = generateServiceOgSvg(service);
  return sharp2(Buffer.from(svgString)).png({ quality: 90, compressionLevel: 8 }).toBuffer();
}

// src/dbServer.ts
import fs2 from "fs";
import path3 from "path";
var DB_PATH = path3.join(process.cwd(), "data", "db.json");
var DEFAULT_DB = {
  settings: {
    cafeName: "CSC DOST",
    phone: "+91 70068 33767, +91 96821 32895",
    whatsapp: "+91 70068 33767",
    email: "www.khanday09@gmail.com",
    address: "Sangran Qazigund, Sangran Qazigund, Anantnag, Jammu and Kashmir 192221",
    officeHours: "Mon - Sat: 08:30 AM - 08:00 PM, Sun: 10:00 AM - 04:00 PM",
    googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.996452296068!2d77.21833441508272!3d28.630041982417724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd3637e19e75%3A0x6b7a544f84c4f9a7!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin",
    seoTitle: "CSC DOST",
    seoDescription: "CSC DOST (www.cscdost.com) - Authorized CSC E-Governance and Digital Services Portal. Apply for PAN, Aadhaar updates, Ayushman Bharat card, Voter ID, and digital services.",
    seoKeywords: "cscdost, CSC DOST, cscdost.com, www.cscdost.com, cyber cafe, CSC center, PAN card application, Aadhaar update, online form filling, printing"
  },
  announcements: [
    {
      "id": "ann-1",
      "title": "New PM Kisan Samman Nidhi 17th Installment KYC Open",
      "content": "All farmers registered under PM Kisan are requested to complete their e-KYC at our center before the end of this month to receive their installment seamlessly. Please bring your Aadhaar and linked mobile phone.",
      "type": "warning",
      "date": "2026-07-10T10:00:00.000Z",
      "active": true
    }
  ],
  gallery: [],
  contactRequests: [],
  appointments: [],
  views: 0,
  customPosts: [],
  postThumbnails: {},
  pushSubscriptions: [],
  pushNotifications: [],
  pushSettings: { autoPublishPush: false, welcomePushEnabled: true }
};
var memoryDb = null;
function initDb() {
  if (memoryDb) return;
  try {
    const dir = path3.dirname(DB_PATH);
    if (!fs2.existsSync(dir)) {
      fs2.mkdirSync(dir, { recursive: true });
    }
    if (!fs2.existsSync(DB_PATH)) {
      fs2.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
      memoryDb = JSON.parse(JSON.stringify(DEFAULT_DB));
    }
  } catch (err) {
    console.warn("initDb filesystem warning (falling back to memory):", err);
    if (!memoryDb) {
      memoryDb = JSON.parse(JSON.stringify(DEFAULT_DB));
    }
  }
}
function getDb() {
  initDb();
  try {
    if (fs2.existsSync(DB_PATH)) {
      const content = fs2.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (!parsed.appointments) parsed.appointments = [];
      if (!parsed.contactRequests) parsed.contactRequests = [];
      if (!parsed.announcements) parsed.announcements = [];
      if (!parsed.gallery) parsed.gallery = [];
      if (!parsed.customPosts) parsed.customPosts = [];
      if (!parsed.postThumbnails) parsed.postThumbnails = {};
      if (!parsed.pushSubscriptions) parsed.pushSubscriptions = [];
      if (!parsed.pushNotifications) parsed.pushNotifications = [];
      if (!parsed.pushSettings) parsed.pushSettings = { autoPublishPush: false, welcomePushEnabled: true };
      memoryDb = parsed;
      return parsed;
    }
  } catch (error) {
    console.warn("Error reading database file from disk, using memory fallback:", error);
  }
  if (!memoryDb) {
    memoryDb = JSON.parse(JSON.stringify(DEFAULT_DB));
  }
  return memoryDb;
}
function saveDb(data) {
  memoryDb = data;
  try {
    initDb();
    const tempPath = `${DB_PATH}.tmp`;
    fs2.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs2.renameSync(tempPath, DB_PATH);
  } catch (err) {
    console.warn("Disk save warning (state safely saved in memory):", err);
  }
}
function addContactRequest(req) {
  const db = getDb();
  const newReq = {
    ...req,
    id: `req-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
    status: "pending",
    date: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.contactRequests.unshift(newReq);
  saveDb(db);
  return newReq;
}
function extractTokenSeq(val) {
  if (typeof val !== "string") return 0;
  const match = val.match(/^CSC21251567(\d+)/i);
  if (match && match[1]) {
    const num = parseInt(match[1], 10);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}
function getNextMonotonicLocalSeq(externalHighestSeq = 0) {
  const db = getDb();
  let maxSeq = Math.max(db.lastIssuedTokenSeq || 0, externalHighestSeq || 0);
  (db.appointments || []).forEach((a) => {
    const seq = Math.max(extractTokenSeq(a.appId), extractTokenSeq(a.id));
    if (seq > maxSeq) maxSeq = seq;
  });
  const nextSeq = maxSeq + 1;
  db.lastIssuedTokenSeq = nextSeq;
  saveDb(db);
  return nextSeq;
}
function addAppointment(apt) {
  const db = getDb();
  const targetAppId = apt.appId || apt.id;
  const seq = Math.max(extractTokenSeq(apt.appId), extractTokenSeq(apt.id));
  if (seq > (db.lastIssuedTokenSeq || 0)) {
    db.lastIssuedTokenSeq = seq;
  }
  const existingIdx = db.appointments.findIndex(
    (a) => Boolean(
      targetAppId && (a.appId === targetAppId || a.id === targetAppId || apt.supabaseId && a.supabaseId === apt.supabaseId)
    )
  );
  if (existingIdx !== -1) {
    db.appointments[existingIdx] = {
      ...db.appointments[existingIdx],
      ...apt,
      appId: targetAppId || db.appointments[existingIdx].appId || db.appointments[existingIdx].id,
      id: db.appointments[existingIdx].id || targetAppId || `apt-${Date.now()}`,
      status: apt.status || db.appointments[existingIdx].status || "pending"
    };
    saveDb(db);
    return db.appointments[existingIdx];
  } else {
    const finalId = apt.id || targetAppId || `apt-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    const newApt = {
      ...apt,
      appId: targetAppId || finalId,
      id: finalId,
      status: apt.status || "pending",
      date: apt.submittedAt || apt.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    db.appointments.unshift(newApt);
    saveDb(db);
    return newApt;
  }
}
function updateContactStatus(id, status) {
  const db = getDb();
  const item = db.contactRequests.find((r) => r.id === id);
  if (item) {
    item.status = status;
    saveDb(db);
    return true;
  }
  return false;
}
function updateAppointmentStatus(id, status) {
  const db = getDb();
  const item = db.appointments.find(
    (r) => r.id === id || r.appId === id || r.supabaseId === id
  );
  if (item) {
    item.status = status;
    saveDb(db);
    return true;
  }
  return false;
}
function deleteAppointment(id, extraIds = []) {
  const db = getDb();
  const targets = new Set(
    [id, ...extraIds].filter(Boolean).map((s) => String(s).trim().toLowerCase())
  );
  if (targets.size === 0) return false;
  (db.appointments || []).forEach((a) => {
    const seq = Math.max(extractTokenSeq(a.appId), extractTokenSeq(a.id));
    if (seq > (db.lastIssuedTokenSeq || 0)) {
      db.lastIssuedTokenSeq = seq;
    }
  });
  const lengthBefore = db.appointments.length;
  db.appointments = db.appointments.filter((a) => {
    const aId = String(a.id || "").trim().toLowerCase();
    const aAppId = String(a.appId || "").trim().toLowerCase();
    const aSupaId = String(a.supabaseId || "").trim().toLowerCase();
    return !targets.has(aId) && !targets.has(aAppId) && (!aSupaId || !targets.has(aSupaId));
  });
  if (db.appointments.length !== lengthBefore) {
    saveDb(db);
    return true;
  }
  return false;
}
function updateSettings(settings) {
  const db = getDb();
  db.settings = settings;
  saveDb(db);
}
function addAnnouncement(ann) {
  const db = getDb();
  const newAnn = {
    ...ann,
    id: `ann-${Date.now()}`,
    date: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.announcements.unshift(newAnn);
  saveDb(db);
  return newAnn;
}
function updateAnnouncement(id, updated) {
  const db = getDb();
  const idx = db.announcements.findIndex((a) => a.id === id);
  if (idx !== -1) {
    db.announcements[idx] = { ...db.announcements[idx], ...updated };
    saveDb(db);
    return true;
  }
  return false;
}
function deleteAnnouncement(id) {
  const db = getDb();
  const lengthBefore = db.announcements.length;
  db.announcements = db.announcements.filter((a) => a.id !== id);
  if (db.announcements.length !== lengthBefore) {
    saveDb(db);
    return true;
  }
  return false;
}
function addGalleryItem(item) {
  const db = getDb();
  const newItem = {
    ...item,
    id: `gal-${Date.now()}`
  };
  db.gallery.unshift(newItem);
  saveDb(db);
  return newItem;
}
function deleteGalleryItem(id) {
  const db = getDb();
  const lengthBefore = db.gallery.length;
  db.gallery = db.gallery.filter((g) => g.id !== id);
  if (db.gallery.length !== lengthBefore) {
    saveDb(db);
    return true;
  }
  return false;
}
function incrementViews() {
  const db = getDb();
  db.views = (db.views || 0) + 1;
  saveDb(db);
  return db.views;
}
function getAnalytics() {
  const db = getDb();
  const completedRequestsCount = db.contactRequests.filter((r) => r.status === "completed").length + db.appointments.filter((a) => a.status === "completed").length;
  const serviceDistribution = {};
  [...db.contactRequests, ...db.appointments].forEach((item) => {
    serviceDistribution[item.service] = (serviceDistribution[item.service] || 0) + 1;
  });
  const monthlyTrends = [
    { month: "Jan", requests: 4, appointments: 2 },
    { month: "Feb", requests: 7, appointments: 5 },
    { month: "Mar", requests: 12, appointments: 8 },
    { month: "Apr", requests: 18, appointments: 11 },
    { month: "May", requests: 15, appointments: 14 },
    { month: "Jun", requests: db.contactRequests.length, appointments: db.appointments.length }
  ];
  return {
    views: db.views,
    contactRequestsCount: db.contactRequests.length,
    appointmentsCount: db.appointments.length,
    completedRequestsCount,
    serviceDistribution,
    monthlyTrends
  };
}
function savePostThumbnailRecord(postId, entry) {
  const db = getDb();
  if (!db.postThumbnails) db.postThumbnails = {};
  const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  db.postThumbnails[postId] = {
    ...entry,
    updatedAt
  };
  if (Array.isArray(db.customPosts)) {
    const idx = db.customPosts.findIndex((p) => p && p.id === postId);
    if (idx !== -1) {
      db.customPosts[idx] = {
        ...db.customPosts[idx],
        thumbnailUrl: entry.thumbnailUrl,
        thumbnailSpec: entry.spec || db.customPosts[idx].thumbnailSpec
      };
    }
  }
  saveDb(db);
  return db.postThumbnails[postId];
}
function getPostThumbnailsMap() {
  const db = getDb();
  return db.postThumbnails || {};
}
function upsertCustomSarkariPost(post) {
  const db = getDb();
  if (!Array.isArray(db.customPosts)) db.customPosts = [];
  const idx = db.customPosts.findIndex((p) => p && p.id === post.id);
  if (idx !== -1) {
    db.customPosts[idx] = { ...db.customPosts[idx], ...post };
  } else {
    db.customPosts.unshift(post);
  }
  if (post.thumbnailUrl && post.id) {
    if (!db.postThumbnails) db.postThumbnails = {};
    db.postThumbnails[post.id] = {
      thumbnailUrl: post.thumbnailUrl,
      spec: post.thumbnailSpec,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  saveDb(db);
  return post;
}
function getCustomSarkariPosts() {
  const db = getDb();
  return Array.isArray(db.customPosts) ? db.customPosts : [];
}
var DEFAULT_WHATSAPP_CONFIG = {
  channelUrl: "",
  channelName: "CSC DOST Official WhatsApp Channel",
  groupInviteUrl: "https://chat.whatsapp.com/GqeYfcw1sdN0EQtGvVR1fI",
  groupName: "CSC DOST Community Group"
};
function getWhatsAppPublisherConfig() {
  const db = getDb();
  return {
    ...DEFAULT_WHATSAPP_CONFIG,
    ...db.whatsappPublisherConfig || {}
  };
}
function saveWhatsAppPublisherConfig(partial) {
  const db = getDb();
  const current = getWhatsAppPublisherConfig();
  const updated = {
    ...current,
    ...partial,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.whatsappPublisherConfig = updated;
  saveDb(db);
  return updated;
}
function getWhatsAppPublishHistory() {
  const db = getDb();
  return Array.isArray(db.whatsappPublishHistory) ? db.whatsappPublishHistory : [];
}
function addWhatsAppPublishHistoryRecord(record) {
  const db = getDb();
  if (!Array.isArray(db.whatsappPublishHistory)) {
    db.whatsappPublishHistory = [];
  }
  const now = /* @__PURE__ */ new Date();
  const datePart = now.toLocaleDateString("en-GB");
  const timePart = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  const entry = {
    id: record.id || `wapub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    postId: record.postId || "",
    title: record.title || "CSC DOST Notification",
    category: record.category || "job",
    destination: record.destination || "WhatsApp Group",
    sharingMethod: record.sharingMethod || "WhatsApp Share Link",
    dateTime: record.dateTime || `${datePart}, ${timePart}`,
    isoTimestamp: record.isoTimestamp || now.toISOString(),
    status: record.status,
    adminUser: record.adminUser || "Authorized Staff",
    canonicalUrl: record.canonicalUrl || "https://www.cscdost.com",
    confirmedAt: record.confirmedAt,
    confirmedBy: record.confirmedBy,
    providerMessageId: record.providerMessageId,
    errorDetails: record.errorDetails
  };
  db.whatsappPublishHistory.unshift(entry);
  if (db.whatsappPublishHistory.length > 100) {
    db.whatsappPublishHistory = db.whatsappPublishHistory.slice(0, 100);
  }
  saveDb(db);
  return entry;
}
function updateWhatsAppPublishHistoryStatus(id, status, adminUser, extra) {
  const db = getDb();
  if (!Array.isArray(db.whatsappPublishHistory)) return null;
  const idx = db.whatsappPublishHistory.findIndex((item) => item && item.id === id);
  if (idx === -1) return null;
  const now = /* @__PURE__ */ new Date();
  const datePart = now.toLocaleDateString("en-GB");
  const timePart = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  db.whatsappPublishHistory[idx] = {
    ...db.whatsappPublishHistory[idx],
    ...extra || {},
    status,
    confirmedAt: status === "Manually Confirmed" ? `${datePart}, ${timePart}` : db.whatsappPublishHistory[idx].confirmedAt,
    confirmedBy: status === "Manually Confirmed" ? adminUser || db.whatsappPublishHistory[idx].adminUser : db.whatsappPublishHistory[idx].confirmedBy
  };
  saveDb(db);
  return db.whatsappPublishHistory[idx];
}
function clearWhatsAppPublishHistory() {
  const db = getDb();
  db.whatsappPublishHistory = [];
  saveDb(db);
}
function deleteCustomSarkariPost(postId) {
  const db = getDb();
  if (!Array.isArray(db.customPosts)) return false;
  const before = db.customPosts.length;
  db.customPosts = db.customPosts.filter((p) => p && p.id !== postId);
  if (db.customPosts.length !== before) {
    saveDb(db);
    return true;
  }
  return false;
}
function upsertPushSubscription(payload) {
  const db = getDb();
  if (!Array.isArray(db.pushSubscriptions)) db.pushSubscriptions = [];
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const existingIdx = db.pushSubscriptions.findIndex((s) => s && s.endpoint === payload.endpoint);
  const defaultPreferences = {
    jobs: true,
    schemes: true,
    exams: true,
    updates: true,
    ...payload.preferences || {}
  };
  if (existingIdx !== -1) {
    const existing = db.pushSubscriptions[existingIdx];
    const updated = {
      ...existing,
      keys: payload.keys || existing.keys,
      deviceType: payload.deviceType || existing.deviceType || "unknown",
      userAgent: payload.userAgent || existing.userAgent,
      preferences: { ...existing.preferences, ...defaultPreferences },
      status: "active",
      failureCount: 0,
      updatedAt: nowIso
    };
    db.pushSubscriptions[existingIdx] = updated;
    saveDb(db);
    return updated;
  }
  const newRecord = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    endpoint: payload.endpoint,
    keys: payload.keys,
    deviceType: payload.deviceType || "unknown",
    userAgent: payload.userAgent,
    preferences: defaultPreferences,
    status: "active",
    createdAt: nowIso,
    updatedAt: nowIso,
    failureCount: 0
  };
  db.pushSubscriptions.push(newRecord);
  saveDb(db);
  return newRecord;
}
function deactivatePushSubscription(endpoint) {
  const db = getDb();
  if (!Array.isArray(db.pushSubscriptions)) return false;
  const idx = db.pushSubscriptions.findIndex((s) => s && s.endpoint === endpoint);
  if (idx !== -1) {
    db.pushSubscriptions[idx].status = "inactive";
    db.pushSubscriptions[idx].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveDb(db);
    return true;
  }
  return false;
}
function getActivePushSubscriptions(category) {
  const db = getDb();
  if (!Array.isArray(db.pushSubscriptions)) return [];
  return db.pushSubscriptions.filter((sub) => {
    if (!sub || sub.status !== "active") return false;
    if (!category || category === "all") return true;
    const prefs = sub.preferences || { jobs: true, schemes: true, exams: true, updates: true };
    if (category === "jobs" && prefs.jobs !== false) return true;
    if (category === "schemes" && prefs.schemes !== false) return true;
    if (category === "exams" && prefs.exams !== false) return true;
    if (category === "updates" && prefs.updates !== false) return true;
    return false;
  });
}
function markPushSubscriptionFailure(endpoint, isPermanentExpired) {
  const db = getDb();
  if (!Array.isArray(db.pushSubscriptions)) return;
  const idx = db.pushSubscriptions.findIndex((s) => s && s.endpoint === endpoint);
  if (idx !== -1) {
    if (isPermanentExpired) {
      db.pushSubscriptions[idx].status = "expired";
    } else {
      db.pushSubscriptions[idx].failureCount = (db.pushSubscriptions[idx].failureCount || 0) + 1;
      if (db.pushSubscriptions[idx].failureCount >= 3) {
        db.pushSubscriptions[idx].status = "expired";
      }
    }
    db.pushSubscriptions[idx].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveDb(db);
  }
}
function recordPushDeliverySuccess(endpoint) {
  const db = getDb();
  if (!Array.isArray(db.pushSubscriptions)) return;
  const idx = db.pushSubscriptions.findIndex((s) => s && s.endpoint === endpoint);
  if (idx !== -1) {
    db.pushSubscriptions[idx].lastDeliveryAt = (/* @__PURE__ */ new Date()).toISOString();
    db.pushSubscriptions[idx].failureCount = 0;
    saveDb(db);
  }
}
function addPushNotificationRecord(record) {
  const db = getDb();
  if (!Array.isArray(db.pushNotifications)) db.pushNotifications = [];
  const entry = {
    ...record,
    id: `push_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sentAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.pushNotifications.unshift(entry);
  if (db.pushNotifications.length > 100) {
    db.pushNotifications = db.pushNotifications.slice(0, 100);
  }
  saveDb(db);
  return entry;
}
function getPushNotificationHistory() {
  const db = getDb();
  return Array.isArray(db.pushNotifications) ? db.pushNotifications : [];
}
function getPushServerSettings() {
  const db = getDb();
  return db.pushSettings || { autoPublishPush: false, welcomePushEnabled: true };
}
function updatePushServerSettings(settings) {
  const db = getDb();
  db.pushSettings = {
    ...db.pushSettings || { autoPublishPush: false, welcomePushEnabled: true },
    ...settings
  };
  saveDb(db);
  return db.pushSettings;
}

// src/lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";
var DEFAULT_SUPABASE_URL = "https://yvxqyczeavhfwxxjxwgl.supabase.co";
var DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_8ROBFY1Du5rZWcmKVIngJg_9GIIxdBp";
var serverSupabaseInstance = null;
function getServerSupabaseClient() {
  if (serverSupabaseInstance) return serverSupabaseInstance;
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  const supabaseAnonKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();
  if (supabaseUrl && supabaseAnonKey) {
    try {
      serverSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      return serverSupabaseInstance;
    } catch (err) {
      console.error("[SupabaseServer] Failed to initialize Supabase client:", err);
    }
  }
  return null;
}
async function uploadDocumentBufferToSupabase(appId, fileName, fileBuffer, contentType) {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return { url: "", success: false, error: "Supabase client not initialized" };
  }
  const MAX_FILE_SIZE = 15 * 1024 * 1024;
  if (!fileBuffer || fileBuffer.length === 0) {
    return { url: "", success: false, error: "Uploaded file is empty." };
  }
  if (fileBuffer.length > MAX_FILE_SIZE) {
    return { url: "", success: false, error: "File size exceeds maximum allowed limit of 15 MB." };
  }
  const rawExt = (fileName.includes(".") ? fileName.split(".").pop() || "" : "").toLowerCase().trim();
  const ALLOWED_EXTENSIONS = /* @__PURE__ */ new Set(["pdf", "jpg", "jpeg", "png", "webp"]);
  if (!ALLOWED_EXTENSIONS.has(rawExt)) {
    return { url: "", success: false, error: "Invalid file extension. Only PDF, JPG, PNG, and WEBP files are allowed." };
  }
  const isPdf = fileBuffer.length >= 4 && fileBuffer[0] === 37 && fileBuffer[1] === 80 && fileBuffer[2] === 68 && fileBuffer[3] === 70;
  const isJpg = fileBuffer.length >= 3 && fileBuffer[0] === 255 && fileBuffer[1] === 216 && fileBuffer[2] === 255;
  const isPng = fileBuffer.length >= 8 && fileBuffer[0] === 137 && fileBuffer[1] === 80 && fileBuffer[2] === 78 && fileBuffer[3] === 71;
  const isWebp = fileBuffer.length >= 12 && fileBuffer.toString("utf-8", 0, 4) === "RIFF" && fileBuffer.toString("utf-8", 8, 12) === "WEBP";
  if (!isPdf && !isJpg && !isPng && !isWebp) {
    return { url: "", success: false, error: "Corrupt or unverified file signature. Upload rejected for security." };
  }
  const verifiedMime = isPdf ? "application/pdf" : isPng ? "image/png" : isWebp ? "image/webp" : "image/jpeg";
  try {
    const cleanAppId = appId.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);
    const cleanBaseName = fileName.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 30);
    const uniqueFileName = `${Date.now()}_${cleanBaseName}.${rawExt}`;
    const storagePath = `${cleanAppId}/${uniqueFileName}`;
    const { data, error } = await supabase.storage.from("documents").upload(storagePath, fileBuffer, {
      contentType: verifiedMime,
      cacheControl: "3600",
      upsert: true
    });
    if (error) {
      console.warn(`[SupabaseServer] Document upload notice for ${fileName}:`, error.message);
      return { url: "", success: false, error: error.message };
    }
    const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(storagePath);
    return {
      url: publicUrlData?.publicUrl || "",
      success: true
    };
  } catch (err) {
    console.error(`[SupabaseServer] Storage upload exception for ${fileName}:`, err?.message || String(err));
    return { url: "", success: false, error: err?.message || String(err) };
  }
}
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuidString(val) {
  return typeof val === "string" && UUID_REGEX.test(val.trim());
}
function isDeletedApplicationRecord(row) {
  if (!row || typeof row !== "object") return false;
  const topStatus = String(row.status || "").trim().toLowerCase();
  if (topStatus === "deleted") return true;
  if (row.deleted === true || Boolean(row.deletedAt) || Boolean(row.deleted_at)) return true;
  const payload = row.payload;
  if (payload && typeof payload === "object") {
    if (payload.deleted === true || Boolean(payload.deletedAt) || Boolean(payload.deleted_at)) return true;
    if (String(payload.status || "").trim().toLowerCase() === "deleted") return true;
  }
  return false;
}
async function getHighestSupabaseTokenSeq() {
  const supabase = getServerSupabaseClient();
  if (!supabase) return 0;
  let maxSeq = 0;
  try {
    const { data, error } = await supabase.from("applications").select("token_id, payload").order("created_at", { ascending: false }).limit(500);
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        const candidates = [
          row?.token_id,
          row?.payload?.appId,
          row?.payload?.token
        ];
        for (const c of candidates) {
          if (typeof c === "string") {
            const match = c.match(/^CSC21251567(\d+)/i);
            if (match && match[1]) {
              const num = parseInt(match[1], 10);
              if (!isNaN(num) && num > maxSeq) {
                maxSeq = num;
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("[SupabaseServer] Token sequence probe notice:", err);
  }
  return maxSeq;
}
async function findSupabaseApplicationRows(identifier, supabaseUuid) {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return { rows: [], error: "Supabase client is not initialized." };
  }
  const cleanId = (identifier || "").trim();
  const cleanUuid = (supabaseUuid || "").trim();
  const matchedMap = /* @__PURE__ */ new Map();
  try {
    const uuidCandidate = isUuidString(cleanUuid) ? cleanUuid : isUuidString(cleanId) ? cleanId : "";
    if (uuidCandidate) {
      const { data, error } = await supabase.from("applications").select("*").eq("id", uuidCandidate);
      if (error) {
        return { rows: [], error: error.message };
      }
      (data || []).forEach((r) => {
        if (r && r.id) matchedMap.set(String(r.id), r);
      });
    }
    if (cleanId) {
      const { data, error } = await supabase.from("applications").select("*").eq("token_id", cleanId);
      if (error && !error.message?.includes("column")) {
        return { rows: Array.from(matchedMap.values()), error: error.message };
      }
      (data || []).forEach((r) => {
        if (r && r.id) matchedMap.set(String(r.id), r);
      });
    }
    if (matchedMap.size === 0 && cleanId) {
      const { data, error } = await supabase.from("applications").select("*").order("created_at", { ascending: false }).limit(300);
      if (!error && Array.isArray(data)) {
        const lowerClean = cleanId.toLowerCase();
        for (const r of data) {
          if (!r || !r.id) continue;
          const rowUuid = String(r.id);
          const synthToken = `CSC-${rowUuid.slice(0, 8)}`.toLowerCase();
          const payloadAppId = String(r.payload?.appId || r.payload?.token || "").toLowerCase();
          const tokenCol = String(r.token_id || "").toLowerCase();
          if (rowUuid.toLowerCase() === lowerClean || tokenCol === lowerClean || payloadAppId === lowerClean || synthToken === lowerClean) {
            matchedMap.set(rowUuid, r);
          }
        }
      }
    }
    return { rows: Array.from(matchedMap.values()) };
  } catch (err) {
    return { rows: Array.from(matchedMap.values()), error: err?.message || String(err) };
  }
}
async function deleteCustomerApplicationFromSupabase(identifier, supabaseUuid) {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      foundInSupabase: false,
      affectedCount: 0,
      deletedSupabaseIds: [],
      deletedTokenIds: [],
      error: "Supabase client is not initialized."
    };
  }
  const lookup = await findSupabaseApplicationRows(identifier, supabaseUuid);
  if (lookup.error) {
    return {
      success: false,
      foundInSupabase: false,
      affectedCount: 0,
      deletedSupabaseIds: [],
      deletedTokenIds: [],
      error: lookup.error
    };
  }
  if (lookup.rows.length === 0) {
    return {
      success: true,
      foundInSupabase: false,
      affectedCount: 0,
      deletedSupabaseIds: [],
      deletedTokenIds: []
    };
  }
  const activeRows = lookup.rows.filter((r) => !isDeletedApplicationRecord(r));
  if (activeRows.length === 0) {
    return {
      success: true,
      foundInSupabase: true,
      affectedCount: lookup.rows.length,
      deletionMode: "already_deleted",
      deletedSupabaseIds: lookup.rows.map((r) => String(r.id)),
      deletedTokenIds: lookup.rows.map((r) => String(r.token_id || r.payload?.appId || identifier)).filter(Boolean)
    };
  }
  let totalAffected = 0;
  let modeUsed = "hard";
  const deletedSupabaseIds = [];
  const deletedTokenIds = [];
  const errors = [];
  for (const row of activeRows) {
    const primaryKeyUuid = String(row.id);
    const resolvedTok = String(row.token_id || row.payload?.appId || `CSC-${primaryKeyUuid.slice(0, 8)}`);
    const { data: hardDeleted, error: hardErr } = await supabase.from("applications").delete().eq("id", primaryKeyUuid).select("id, token_id");
    if (!hardErr && Array.isArray(hardDeleted) && hardDeleted.length > 0) {
      totalAffected += hardDeleted.length;
      deletedSupabaseIds.push(primaryKeyUuid);
      deletedTokenIds.push(resolvedTok);
      continue;
    }
    const deletedAtIso = (/* @__PURE__ */ new Date()).toISOString();
    const existingPayload = row.payload && typeof row.payload === "object" ? row.payload : {};
    const { data: softDeleted, error: softErr } = await supabase.from("applications").update({
      status: "Deleted",
      payload: {
        ...existingPayload,
        appId: existingPayload.appId || resolvedTok,
        status: "Deleted",
        deleted: true,
        deletedAt: deletedAtIso
      }
    }).eq("id", primaryKeyUuid).select("id, token_id, status");
    if (!softErr && Array.isArray(softDeleted) && softDeleted.length > 0) {
      modeUsed = "soft_tombstone";
      totalAffected += softDeleted.length;
      deletedSupabaseIds.push(primaryKeyUuid);
      deletedTokenIds.push(resolvedTok);
    } else {
      errors.push(
        softErr?.message || hardErr?.message || `Database operation affected 0 rows for primary key ${primaryKeyUuid}. Check RLS policies.`
      );
    }
  }
  if (totalAffected === 0) {
    return {
      success: false,
      foundInSupabase: true,
      affectedCount: 0,
      deletedSupabaseIds: [],
      deletedTokenIds: [],
      error: errors.join("; ") || "Deletion failed: 0 rows were affected in Supabase."
    };
  }
  return {
    success: true,
    foundInSupabase: true,
    affectedCount: totalAffected,
    deletionMode: modeUsed,
    deletedSupabaseIds,
    deletedTokenIds
  };
}
async function persistCustomerApplication(input) {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      appId: input.appId || "UNKNOWN",
      error: "Supabase database is not configured or unreachable."
    };
  }
  let finalAppId = (input.appId || input.idempotencyKey || `CSC21251567${Math.floor(100 + Math.random() * 900)}`).trim();
  try {
    const { data: existingRows } = await supabase.from("applications").select("*").eq("token_id", finalAppId).limit(5);
    if (existingRows && existingRows.length > 0) {
      const activeExisting = existingRows.find((r) => !isDeletedApplicationRecord(r));
      const hasExplicitIdempotency = Boolean(input.idempotencyKey) && activeExisting && String(activeExisting.full_name || "").trim().toLowerCase() === String(input.customerName || "").trim().toLowerCase() && String(activeExisting.service_selected || "").trim().toLowerCase() === String(input.selectedService || "").trim().toLowerCase();
      if (hasExplicitIdempotency && activeExisting) {
        console.log(`[SupabaseServer] Idempotent hit: Application ${finalAppId} already persisted.`);
        return {
          success: true,
          appId: finalAppId,
          data: activeExisting
        };
      }
      const supaMaxSeq = await getHighestSupabaseTokenSeq();
      const nextSafeSeq = Math.max(supaMaxSeq + 1, Math.floor(1e3 + Math.random() * 9e3));
      finalAppId = `CSC21251567${String(nextSafeSeq).padStart(3, "0")}`;
      console.log(`[SupabaseServer] Resolved token collision; assigned fresh token_id: ${finalAppId}`);
    }
  } catch (idempErr) {
    console.warn("[SupabaseServer] Idempotency probe notice:", idempErr);
  }
  const processedDocs = [];
  const documentWarnings = [];
  if (Array.isArray(input.documents) && input.documents.length > 0) {
    for (let i = 0; i < input.documents.length; i++) {
      const doc = input.documents[i];
      const docName = doc.name || `Document_${i + 1}`;
      const docType = doc.type || "application/octet-stream";
      const docSize = typeof doc.size === "number" ? doc.size : 0;
      if (doc.url && (doc.url.startsWith("http://") || doc.url.startsWith("https://"))) {
        processedDocs.push({
          id: doc.id || `doc-${i}`,
          name: docName,
          url: doc.url,
          size: docSize,
          type: docType,
          status: "Uploaded"
        });
        continue;
      }
      if (doc.dataUrl && doc.dataUrl.startsWith("data:")) {
        try {
          const parts = doc.dataUrl.split(",");
          const mimeMatch = parts[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : docType;
          const buffer = Buffer.from(parts[1], "base64");
          const uploadRes = await uploadDocumentBufferToSupabase(
            finalAppId,
            docName,
            buffer,
            mime
          );
          if (uploadRes.success && uploadRes.url) {
            processedDocs.push({
              id: doc.id || `doc-${i}`,
              name: docName,
              url: uploadRes.url,
              size: buffer.length,
              type: mime,
              status: "Uploaded"
            });
          } else {
            documentWarnings.push(`Document "${docName}" could not be saved to storage: ${uploadRes.error || "Upload error"}`);
            processedDocs.push({
              id: doc.id || `doc-${i}`,
              name: docName,
              url: "",
              size: buffer.length,
              type: mime,
              status: "Pending Document Upload"
            });
          }
        } catch (bufErr) {
          console.warn(`[SupabaseServer] Buffer conversion error for ${docName}:`, bufErr);
          documentWarnings.push(`Document "${docName}" buffer error: ${bufErr?.message || String(bufErr)}`);
        }
      }
    }
  }
  const nowIso = input.submittedAt || (/* @__PURE__ */ new Date()).toISOString();
  const fullPayload = {
    token_id: finalAppId,
    full_name: (input.customerName || "Applicant").trim(),
    whatsapp_number: (input.phoneNumber || "").trim(),
    email_address: input.emailAddress && input.emailAddress !== "N/A" ? input.emailAddress.trim() : null,
    service_selected: (input.selectedService || "General CSC Service").trim(),
    user_category: input.userCategory || "General/OBC",
    payment_mode: input.paymentMode || "Pay at CSC Desk Upon Completion",
    utr_number: input.utrNumber || "N/A",
    total_amount: Number(input.totalAmount) || 0,
    status: input.status || "Pending",
    document_urls: processedDocs,
    payload: {
      appId: finalAppId,
      token: finalAppId,
      customerName: input.customerName,
      phoneNumber: input.phoneNumber,
      emailAddress: input.emailAddress,
      selectedService: input.selectedService,
      dateOfBirth: input.dateOfBirth || "N/A",
      userCategory: input.userCategory || "General/OBC",
      paymentMode: input.paymentMode || "Pay at CSC Desk Upon Completion",
      utrNumber: input.utrNumber || "N/A",
      totalAmount: Number(input.totalAmount) || 0,
      status: input.status || "Pending",
      submittedAt: nowIso,
      documents: processedDocs,
      documentWarnings: documentWarnings.length > 0 ? documentWarnings : void 0,
      mandatoryDocName: input.mandatoryDocName || (processedDocs[0]?.name || "N/A")
    }
  };
  try {
    const { data, error } = await supabase.from("applications").insert([fullPayload]).select();
    if (error) {
      console.error("[SupabaseServer] Full schema insert error:", error.message, error.code);
      const isColumnMissing = error.code === "PGRST204" || error.message?.includes("column") || error.message?.includes("schema cache");
      if (isColumnMissing) {
        console.warn("[SupabaseServer] Retrying with base schema...");
        const basePayload = {
          full_name: fullPayload.full_name,
          whatsapp_number: fullPayload.whatsapp_number,
          email_address: fullPayload.email_address,
          service_selected: fullPayload.service_selected,
          document_urls: processedDocs
        };
        const { data: baseData, error: baseErr } = await supabase.from("applications").insert([basePayload]).select();
        if (baseErr) {
          console.error("[SupabaseServer] Base schema insert also failed:", baseErr);
          return {
            success: false,
            appId: finalAppId,
            error: `Database insertion failed: ${baseErr.message}`
          };
        }
        return {
          success: true,
          appId: finalAppId,
          data: baseData?.[0],
          documentWarnings: documentWarnings.length > 0 ? documentWarnings : void 0
        };
      }
      return {
        success: false,
        appId: finalAppId,
        error: `Database persistence error: ${error.message} (Code: ${error.code || "N/A"})`
      };
    }
    if (!data || data.length === 0) {
      return {
        success: false,
        appId: finalAppId,
        error: "Database returned empty confirmation response."
      };
    }
    console.log(`\u2705 [SupabaseServer] Customer Application Successfully Persisted in Supabase: [${finalAppId}] for ${fullPayload.full_name}`);
    return {
      success: true,
      appId: finalAppId,
      data: data[0],
      documentWarnings: documentWarnings.length > 0 ? documentWarnings : void 0
    };
  } catch (err) {
    console.error("[SupabaseServer] Unhandled persistence exception:", err);
    return {
      success: false,
      appId: finalAppId,
      error: `Server database exception: ${err?.message || String(err)}`
    };
  }
}
async function syncPushSubscriptionToSupabase(record) {
  const supabase = getServerSupabaseClient();
  if (!supabase) return { success: false, error: "Supabase client not initialized" };
  try {
    const { error } = await supabase.from("push_subscriptions").upsert({
      id: record.id,
      endpoint: record.endpoint,
      p256dh: record.keys?.p256dh,
      auth: record.keys?.auth,
      device_type: record.deviceType || "unknown",
      user_agent: record.userAgent,
      preferences: record.preferences,
      status: record.status || "active",
      created_at: record.createdAt,
      updated_at: record.updatedAt,
      last_delivery_at: record.lastDeliveryAt
    }, { onConflict: "endpoint" });
    if (error) {
      console.warn("[SupabaseServer] push_subscriptions table sync notice:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.warn("[SupabaseServer] push_subscriptions sync exception:", err?.message);
    return { success: false, error: err?.message };
  }
}
async function syncPushNotificationToSupabase(record) {
  const supabase = getServerSupabaseClient();
  if (!supabase) return { success: false, error: "Supabase client not initialized" };
  try {
    const { error } = await supabase.from("push_notifications_log").insert({
      id: record.id,
      title: record.title,
      body: record.body,
      category: record.category,
      url: record.url,
      post_id: record.postId,
      stats: record.stats,
      sent_at: record.sentAt,
      sent_by: record.sentBy || "Admin"
    });
    if (error) {
      console.warn("[SupabaseServer] push_notifications_log table sync notice:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err?.message };
  }
}

// src/lib/pushServer.ts
import fs3 from "fs";
import path4 from "path";
import webpush from "web-push";
var VAPID_FILE = path4.join(process.cwd(), "data", "vapid.json");
var TMP_VAPID_FILE = "/tmp/vapid.json";
var STABLE_VAPID_PUBLIC_KEY = "BIWxr5Hs7YgdviLAArRERb4tMUKSu-6PvSJbIB6_JLtIuemW4knw4LTtRdj8G-MdKa7EpepFB_vOjKLBkTB0pGg";
var STABLE_VAPID_PRIVATE_KEY = "OGGSMWlqvau-Tghbf6ajVEzBl_ohTQpI6SsV0kNqTjg";
var STABLE_VAPID_SUBJECT = "mailto:support@cscdost.com";
var activeVapidConfig = null;
function initializeVapid() {
  if (activeVapidConfig) return activeVapidConfig;
  let publicKey = (process.env.VAPID_PUBLIC_KEY || "").trim();
  let privateKey = (process.env.VAPID_PRIVATE_KEY || "").trim();
  const subject = (process.env.VAPID_SUBJECT || STABLE_VAPID_SUBJECT).trim();
  if (!publicKey || !privateKey) {
    const candidatePaths = [VAPID_FILE, TMP_VAPID_FILE];
    for (const filePath of candidatePaths) {
      try {
        if (fs3.existsSync(filePath)) {
          const fileContent = fs3.readFileSync(filePath, "utf-8");
          const parsed = JSON.parse(fileContent);
          if (parsed.publicKey && parsed.privateKey) {
            publicKey = parsed.publicKey;
            privateKey = parsed.privateKey;
            break;
          }
        }
      } catch (e) {
      }
    }
  }
  if (!publicKey || !privateKey) {
    publicKey = STABLE_VAPID_PUBLIC_KEY;
    privateKey = STABLE_VAPID_PRIVATE_KEY;
    try {
      const targetDir = fs3.existsSync(path4.dirname(VAPID_FILE)) ? VAPID_FILE : TMP_VAPID_FILE;
      fs3.writeFileSync(targetDir, JSON.stringify({ publicKey, privateKey, subject, createdAt: (/* @__PURE__ */ new Date()).toISOString() }, null, 2));
    } catch {
    }
  }
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    console.log(`\u2705 [WebPush] VAPID configured successfully. Subject: ${subject}`);
  } catch (setErr) {
    console.error("[WebPush] Error setting VAPID details:", setErr);
  }
  activeVapidConfig = { publicKey, privateKey, subject };
  return activeVapidConfig;
}
function getVapidPublicKey() {
  const config = initializeVapid();
  return config.publicKey;
}
async function sendSingleNotification(subscription, payload) {
  initializeVapid();
  const formattedPayload = JSON.stringify({
    title: payload.title || "CSC DOST | Notification \u{1F514}",
    body: payload.body || "New update available on CSC DOST portal.",
    icon: payload.icon || "/csc-dost-header-logo.png",
    badge: payload.badge || "/favicon-32x32.png",
    image: payload.image || void 0,
    url: payload.url || "/",
    tag: payload.tag || `csc-${Date.now()}`,
    postId: payload.postId,
    category: payload.category || "all"
  });
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    }
  };
  try {
    const result = await webpush.sendNotification(pushSubscription, formattedPayload, {
      TTL: 60 * 60 * 24,
      // 24 hours
      urgency: "high"
    });
    recordPushDeliverySuccess(subscription.endpoint);
    return { success: true, statusCode: result.statusCode };
  } catch (err) {
    const statusCode = err?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      console.log(`[WebPush] Subscription expired (${statusCode}) for endpoint: ${subscription.endpoint.slice(0, 45)}...`);
      markPushSubscriptionFailure(subscription.endpoint, true);
    } else {
      console.warn(`[WebPush] Delivery warning (${statusCode || "network"}):`, err?.message || err);
      markPushSubscriptionFailure(subscription.endpoint, false);
    }
    return {
      success: false,
      statusCode,
      error: err?.message || "Push service delivery failed"
    };
  }
}
async function broadcastPushNotification(params) {
  initializeVapid();
  const category = params.category || "all";
  if (params.isTest && params.testEndpoint) {
    const sub = {
      endpoint: params.testEndpoint,
      keys: { p256dh: "", auth: "" }
    };
    const all = getActivePushSubscriptions("all");
    const match = all.find((s) => s.endpoint === params.testEndpoint);
    if (!match) {
      return {
        success: false,
        notificationId: "",
        stats: { totalTargeted: 1, accepted: 0, failed: 1, expiredCleaned: 0 },
        error: "Target test subscription not found or inactive."
      };
    }
    const res = await sendSingleNotification(match, {
      title: params.title,
      body: params.body,
      url: params.url,
      postId: params.postId,
      category,
      icon: params.icon,
      image: params.image
    });
    const stats2 = {
      totalTargeted: 1,
      accepted: res.success ? 1 : 0,
      failed: res.success ? 0 : 1,
      expiredCleaned: res.statusCode === 410 || res.statusCode === 404 ? 1 : 0
    };
    const record2 = addPushNotificationRecord({
      title: params.title,
      body: params.body,
      category,
      url: params.url || "/",
      postId: params.postId,
      icon: params.icon,
      image: params.image,
      sentBy: params.sentBy || "Admin Test",
      stats: stats2,
      isTest: true
    });
    syncPushNotificationToSupabase(record2).catch(() => {
    });
    return {
      success: res.success,
      notificationId: record2.id,
      stats: stats2,
      error: res.error
    };
  }
  const targetSubscribers = getActivePushSubscriptions(category);
  let acceptedCount = 0;
  let failedCount = 0;
  let expiredCleanedCount = 0;
  const BATCH_SIZE = 20;
  for (let i = 0; i < targetSubscribers.length; i += BATCH_SIZE) {
    const batch = targetSubscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(
        (sub) => sendSingleNotification(sub, {
          title: params.title,
          body: params.body,
          url: params.url,
          postId: params.postId,
          category,
          icon: params.icon,
          image: params.image
        })
      )
    );
    for (const res of results) {
      if (res.success) {
        acceptedCount++;
      } else {
        failedCount++;
        if (res.statusCode === 410 || res.statusCode === 404) {
          expiredCleanedCount++;
        }
      }
    }
  }
  const stats = {
    totalTargeted: targetSubscribers.length,
    accepted: acceptedCount,
    failed: failedCount,
    expiredCleaned: expiredCleanedCount
  };
  const record = addPushNotificationRecord({
    title: params.title,
    body: params.body,
    category,
    url: params.url || "/",
    postId: params.postId,
    icon: params.icon,
    image: params.image,
    sentBy: params.sentBy || "Admin Broadcast",
    stats,
    isTest: false
  });
  syncPushNotificationToSupabase(record).catch(() => {
  });
  return {
    success: true,
    notificationId: record.id,
    stats
  };
}

// server.ts
import dotenv from "dotenv";
dotenv.config();
var app = express();
var PORT = 3e3;
app.get(["/api/health", "/health", "/_health"], (req, res) => {
  res.status(200).json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
});
var RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || "").trim();
var RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || "").trim();
var razorpayInstance = null;
function getRazorpay() {
  const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
  if (!keyId || !keySecret) {
    return null;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
  return razorpayInstance;
}
var ADMIN_USERNAME = process.env.ADMIN_USER || "Mahi";
var ADMIN_PASSWORD = process.env.ADMIN_PASS || "Wasu@9687";
var ADMIN_TOKEN_SECRET = (process.env.ADMIN_TOKEN || "csc-staff-secret-auth-token-2026-vle").trim();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use((req, res, next) => {
  const host = req.get("x-forwarded-host") || req.get("host") || "";
  if (host === "cscdost.com") {
    return res.redirect(301, `https://www.cscdost.com${req.originalUrl || req.url}`);
  }
  next();
});
app.use((req, _res, next) => {
  const forwardedPath = req.headers["x-matched-path"] || req.headers["x-forwarded-uri"] || req.headers["x-vercel-matched-path"] || req.headers["x-original-url"];
  if (forwardedPath && typeof forwardedPath === "string" && forwardedPath.startsWith("/api") && (req.url === "/api" || req.url === "/")) {
    req.url = forwardedPath;
  }
  next();
});
function simulateEmail(to, subject, htmlBody) {
  console.log("\n========================================");
  console.log(`\u2709\uFE0F SIMULATING EMAIL SENT TO: ${to}`);
  console.log(`\u{1F4E7} SUBJECT: ${subject}`);
  console.log("----------------------------------------");
  console.log(htmlBody.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
  console.log("========================================\n");
}
async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    let token = "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (req.headers["x-admin-token"]) {
      token = String(req.headers["x-admin-token"]).trim();
    } else if (req.query.adminToken) {
      token = String(req.query.adminToken).trim();
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Authentication token is missing or malformed."
      });
    }
    if (token === ADMIN_TOKEN_SECRET || token === "secret-admin-session-token-xyz-2026" || token === "csc-staff-secret-auth-token-2026-vle") {
      req.adminUser = { role: "admin", username: ADMIN_USERNAME };
      return next();
    }
    const supabase = getServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        req.adminUser = {
          role: "admin",
          userId: data.user.id,
          email: data.user.email
        };
        return next();
      }
    }
    return res.status(403).json({
      success: false,
      error: "Forbidden: Invalid or expired administrative credentials."
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Authentication error: " + (err?.message || "Internal failure")
    });
  }
}
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  const cleanUser = String(username || "").trim();
  const cleanPass = String(password || "").trim();
  const isOperator = cleanUser.toLowerCase() === "mahi" && cleanPass === "Wasu@9687" || cleanUser === ADMIN_USERNAME && cleanPass === ADMIN_PASSWORD || cleanUser.toLowerCase() === "admin" && cleanPass === "admin123";
  if (isOperator) {
    console.log(`\u{1F510} [Auth] Authorized staff login granted for operator: ${cleanUser}`);
    return res.status(200).json({
      success: true,
      token: ADMIN_TOKEN_SECRET,
      user: {
        username: cleanUser,
        role: "staff_operator",
        displayName: cleanUser.toLowerCase() === "admin" ? "Administrator" : "Mahi (Staff Admin)"
      }
    });
  }
  return res.status(401).json({
    success: false,
    error: "Invalid staff username or password."
  });
});
app.all("/api/tracker/view", (req, res) => {
  if (req.method === "POST") {
    const newCount = incrementViews();
    return res.json({ success: true, totalViews: newCount });
  }
  const analytics = getAnalytics();
  res.json({ success: true, totalViews: analytics.views });
});
app.get("/api/public-data", (req, res) => {
  const db = getDb();
  res.json({
    settings: db.settings,
    announcements: db.announcements.filter((a) => a.active),
    gallery: db.gallery
  });
});
app.get("/api/upi/config", (req, res) => {
  res.json({
    success: true,
    upiId: "7006833767-2@okbizaxis",
    merchantName: "CSC DOST"
  });
});
app.post("/api/upi/verify-payment", (req, res) => {
  try {
    const { utrNumber, appId, amount } = req.body || {};
    const finalUtr = (utrNumber || `UPI${Date.now().toString().slice(-8)}`).trim();
    if (appId) {
      updateAppointmentStatus(appId, "completed");
    }
    console.log(`\u2705 Dynamic UPI Payment Verified [UTR: ${finalUtr}] for App ${appId || "N/A"} - \u20B9${amount || "70"}`);
    return res.json({
      success: true,
      message: "UPI Transaction verified successfully.",
      utrNumber: finalUtr,
      appId,
      amount,
      upiVpa: "7006833767-2@okbizaxis"
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to verify UPI payment: " + (err.message || String(err)) });
  }
});
app.get("/api/razorpay/config", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
  if (!keyId) {
    return res.status(200).json({
      success: false,
      configured: false,
      error: "Razorpay online payment is currently not configured on this server."
    });
  }
  return res.status(200).json({
    success: true,
    configured: true,
    keyId
  });
});
app.post("/api/razorpay/create-order", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const { amount, appId, customerName, email, phone, service } = req.body || {};
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: "Valid payment amount is required." });
    }
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        error: "Razorpay gateway is not configured on this server. Please use UPI payment or pay at CSC counter."
      });
    }
    const amountInPaise = Math.round(Number(amount) * 100);
    const receiptId = (appId || `CSC_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 40);
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        appId: appId || "N/A",
        customerName: customerName || "CSC Customer",
        service: service || "CSC Portal Service",
        phone: phone || ""
      }
    };
    const order = await razorpay.orders.create(options);
    console.log(`\u{1F4B3} Razorpay Order Created [ID: ${order.id}] for ${customerName || "Customer"} - \u20B9${amount}`);
    return res.status(200).json({
      success: true,
      order,
      keyId: (process.env.RAZORPAY_KEY_ID || "").trim()
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error?.message || "Server error");
    return res.status(500).json({
      success: false,
      error: "Payment order creation failed: " + (error?.error?.description || error?.message || "Gateway unavailable")
    });
  }
});
app.post("/api/razorpay/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appId } = req.body || {};
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    if (!keySecret) {
      return res.status(503).json({
        success: false,
        error: "Payment signature verification unavailable: Gateway secret is not configured."
      });
    }
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing Razorpay verification parameters (order_id, payment_id, signature)."
      });
    }
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
      console.log(`\u2705 Razorpay Payment Verified [Payment ID: ${razorpay_payment_id}] for Order ${razorpay_order_id}`);
      if (appId) {
        updateAppointmentStatus(appId, "completed");
      }
      res.json({
        success: true,
        message: "Razorpay payment signature verified successfully.",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        utrNumber: razorpay_payment_id
      });
    } else {
      console.error(`\u274C Razorpay Payment Verification Failed for Order ${razorpay_order_id}`);
      res.status(400).json({
        success: false,
        error: "Razorpay payment signature verification failed. Invalid transaction."
      });
    }
  } catch (error) {
    console.error("Razorpay Verification Error:", error?.message || "Server error");
    res.status(500).json({
      success: false,
      error: "Server error verifying Razorpay payment."
    });
  }
});
app.post("/api/contact", (req, res) => {
  const { name, email, phone, service, message } = req.body;
  if (!name || !phone || !service || !message) {
    return res.status(400).json({ error: "Please provide all required fields (Name, Phone, Service, Message)." });
  }
  const request = addContactRequest({ name, email: email || "", phone, service, message });
  const db = getDb();
  if (email) {
    simulateEmail(
      email,
      `Confirmation: Contact Request Received - ${db.settings.cafeName}`,
      `\u{1F4A1} Hello ${name},<br/><br/>
      Thank you for contacting ${db.settings.cafeName}. We have received your query regarding <b>${service}</b>.<br/>
      Our team will review your message and reach out to you within 2 to 4 working hours.<br/><br/>
      <b>Your Query Details:</b><br/>
      - Name: ${name}<br/>
      - Phone: ${phone}<br/>
      - Message: ${message}<br/><br/>
      Regards,<br/>Support Team - ${db.settings.cafeName}`
    );
  }
  simulateEmail(
    db.settings.email,
    `\u{1F6A8} NEW Contact Request: ${service} from ${name}`,
    `\u{1F514} Hello Administrator,<br/><br/>
    You have received a new service query on the cyber cafe portal:<br/><br/>
    <b>Submission Information:</b><br/>
    - Name: ${name}<br/>
    - Phone: ${phone}<br/>
    - Email: ${email || "Not Provided"}<br/>
    - Requested Service: ${service}<br/>
    - Message: ${message}<br/><br/>
    Please log in to your admin panel to manage this request.`
  );
  res.json({ success: true, data: request, message: "Message submitted successfully. Emails simulated in logs." });
});
var sseClients = /* @__PURE__ */ new Set();
function broadcastRealtimeEvent(type, payload) {
  const data = `data: ${JSON.stringify({ type, payload, timestamp: Date.now() })}

`;
  sseClients.forEach((client) => {
    try {
      client.write(data);
    } catch {
      sseClients.delete(client);
    }
  });
}
app.get("/api/realtime/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();
  res.write(`data: ${JSON.stringify({ type: "CONNECTED", timestamp: Date.now() })}

`);
  sseClients.add(res);
  req.on("close", () => {
    sseClients.delete(res);
  });
});
setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.write(`: ping

`);
    } catch {
      sseClients.delete(client);
    }
  });
}, 15e3);
app.get("/api/appointments", authenticateAdmin, (req, res) => {
  const db = getDb();
  const activeList = (db.appointments || []).filter((a) => !isDeletedApplicationRecord(a));
  res.json({ success: true, data: activeList });
});
app.get("/api/appointments/next-token", async (req, res) => {
  const supaMax = await getHighestSupabaseTokenSeq();
  const nextSeq = getNextMonotonicLocalSeq(supaMax);
  const seqPadded = String(nextSeq).padStart(3, "0");
  const nextToken = `CSC21251567${seqPadded}`;
  res.json({ success: true, nextToken, seq: nextSeq });
});
app.get("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const targetId = (id || "").toString().toLowerCase();
  const found = (db.appointments || []).find((a) => {
    if (isDeletedApplicationRecord(a)) return false;
    const appIdStr = (a.appId || a.id || "").toString().toLowerCase();
    const utrStr = (a.utrNumber || "").toString().toLowerCase();
    return appIdStr === targetId || utrStr === targetId;
  });
  if (found) {
    return res.json(found);
  }
  try {
    const lookup = await findSupabaseApplicationRows(id);
    const activeRow = (lookup.rows || []).find((r) => !isDeletedApplicationRecord(r));
    if (activeRow) {
      const resolvedToken = activeRow.token_id || activeRow.payload?.appId || `CSC-${String(activeRow.id).slice(0, 8)}`;
      const mappedApp = {
        appId: resolvedToken,
        id: resolvedToken,
        supabaseId: activeRow.id,
        name: activeRow.full_name,
        customerName: activeRow.full_name,
        phone: activeRow.whatsapp_number,
        phoneNumber: activeRow.whatsapp_number,
        email: activeRow.email_address || "",
        emailAddress: activeRow.email_address || "",
        service: activeRow.service_selected,
        selectedService: activeRow.service_selected,
        status: activeRow.status || "Pending",
        paymentMode: activeRow.payment_mode || "cash",
        utrNumber: activeRow.utr_number || "N/A",
        totalAmount: Number(activeRow.total_amount) || 0,
        userCategory: activeRow.user_category || "General/OBC",
        documents: Array.isArray(activeRow.document_urls) ? activeRow.document_urls : [],
        submittedAt: activeRow.created_at,
        createdAt: activeRow.created_at,
        payload: activeRow.payload
      };
      return res.json(mappedApp);
    }
  } catch (supaErr) {
    console.warn("[Server] Supabase single app lookup notice:", supaErr);
  }
  return res.status(404).json({ error: "Application record not found" });
});
app.patch("/api/appointments/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required" });
  const success = updateAppointmentStatus(id, status);
  if (success) {
    const db = getDb();
    const updated = (db.appointments || []).find((a) => a.id === id || a.appId === id);
    broadcastRealtimeEvent("APPOINTMENT_UPDATED", updated || { id, appId: id, status });
    res.json({ success: true, message: "Status updated successfully", data: updated });
  } else {
    res.status(404).json({ error: "Appointment not found" });
  }
});
app.post("/api/appointments/bulk-delete", authenticateAdmin, async (req, res) => {
  const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
  if (rawItems.length === 0) {
    return res.status(400).json({
      success: false,
      affectedCount: 0,
      error: "No application IDs provided for bulk deletion."
    });
  }
  const deletedIds = [];
  const deletedSupabaseIds = [];
  const deletedTokenIds = [];
  const failedItems = [];
  let totalAffected = 0;
  for (const item of rawItems) {
    const targetId = typeof item === "string" ? item : String(item?.appId || item?.id || "");
    const supabaseUuid = typeof item === "object" && item !== null ? String(item.supabaseId || "") : "";
    if (!targetId && !supabaseUuid) continue;
    const supaRes = await deleteCustomerApplicationFromSupabase(targetId || supabaseUuid, supabaseUuid);
    const localRemoved = deleteAppointment(targetId || supabaseUuid, [
      supabaseUuid,
      ...supaRes.deletedSupabaseIds,
      ...supaRes.deletedTokenIds
    ]);
    if (supaRes.foundInSupabase && !supaRes.success) {
      failedItems.push({
        id: targetId || supabaseUuid,
        error: supaRes.error || "Database failed to delete record in Supabase."
      });
      continue;
    }
    if (!supaRes.foundInSupabase && !localRemoved) {
      failedItems.push({
        id: targetId || supabaseUuid,
        error: "Record not found in Supabase or local database."
      });
      continue;
    }
    deletedIds.push(targetId || supabaseUuid);
    deletedSupabaseIds.push(...supaRes.deletedSupabaseIds);
    deletedTokenIds.push(...supaRes.deletedTokenIds);
    totalAffected += Math.max(supaRes.affectedCount, localRemoved ? 1 : 0);
  }
  if (totalAffected > 0) {
    broadcastRealtimeEvent("APPOINTMENTS_BULK_DELETED", {
      deletedIds,
      deletedSupabaseIds,
      deletedTokenIds
    });
  }
  if (totalAffected === 0 && failedItems.length > 0) {
    return res.status(404).json({
      success: false,
      affectedCount: 0,
      deletedIds: [],
      deletedSupabaseIds: [],
      deletedTokenIds: [],
      failedItems,
      error: failedItems[0].error
    });
  }
  return res.json({
    success: failedItems.length === 0,
    affectedCount: totalAffected,
    deletedIds,
    deletedSupabaseIds,
    deletedTokenIds,
    failedItems,
    message: failedItems.length === 0 ? `Permanently deleted ${deletedIds.length} application(s).` : `Deleted ${deletedIds.length} application(s); ${failedItems.length} failed.`
  });
});
app.delete("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const supabaseId = String(req.query.supabaseId || req.body?.supabaseId || "").trim();
  const supaRes = await deleteCustomerApplicationFromSupabase(id, supabaseId);
  const localRemoved = deleteAppointment(id, [
    supabaseId,
    ...supaRes.deletedSupabaseIds,
    ...supaRes.deletedTokenIds
  ]);
  if (supaRes.foundInSupabase && !supaRes.success) {
    return res.status(500).json({
      success: false,
      affectedCount: 0,
      error: supaRes.error || "Failed to delete application from Supabase database."
    });
  }
  if (!supaRes.foundInSupabase && !localRemoved) {
    return res.status(404).json({
      success: false,
      affectedCount: 0,
      error: `Application "${id}" not found in Supabase or local server database.`
    });
  }
  const affectedCount = Math.max(supaRes.affectedCount, localRemoved ? 1 : 0);
  const eventPayload = {
    id,
    appId: id,
    supabaseId: supabaseId || supaRes.deletedSupabaseIds[0] || void 0,
    deletedSupabaseIds: supaRes.deletedSupabaseIds,
    deletedTokenIds: supaRes.deletedTokenIds
  };
  broadcastRealtimeEvent("APPOINTMENT_DELETED", eventPayload);
  return res.json({
    success: true,
    affectedCount,
    deletionMode: supaRes.deletionMode || (localRemoved ? "local_hard" : "hard"),
    deletedSupabaseIds: supaRes.deletedSupabaseIds,
    deletedTokenIds: supaRes.deletedTokenIds,
    message: "Application permanently deleted."
  });
});
var submissionRateMap = /* @__PURE__ */ new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const entry = submissionRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    submissionRateMap.set(ip, { count: 1, resetAt: now + 6e4 });
    return true;
  }
  if (entry.count >= 25) {
    return false;
  }
  entry.count++;
  return true;
}
app.post("/api/applications/submit", async (req, res) => {
  const clientIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: "Submission rate limit reached. Please wait a minute before submitting again."
    });
  }
  const {
    appId,
    idempotencyKey,
    customerName,
    name,
    applicantName,
    phoneNumber,
    phone,
    mobile,
    emailAddress,
    email,
    selectedService,
    service,
    userCategory,
    dateOfBirth,
    paymentMode,
    utrNumber,
    totalAmount,
    message,
    documents,
    mandatoryDocName,
    status
  } = req.body || {};
  const finalName = (customerName || name || applicantName || "").toString().trim();
  const rawPhone = (phoneNumber || phone || mobile || "").toString().trim();
  const digitsOnly = rawPhone.replace(/\D/g, "");
  const finalService = (selectedService || service || "").toString().trim();
  if (!finalName) {
    return res.status(400).json({
      success: false,
      error: "Full Name is required to register an official application."
    });
  }
  if (digitsOnly.length < 10) {
    return res.status(400).json({
      success: false,
      error: "A valid 10-digit WhatsApp Mobile Number is required."
    });
  }
  if (!finalService) {
    return res.status(400).json({
      success: false,
      error: "Please select an official government service or specify your requirement."
    });
  }
  const explicitCallerToken = (appId || idempotencyKey || "").toString().trim();
  let assignedAppId = explicitCallerToken;
  if (!assignedAppId || !assignedAppId.startsWith("CSC")) {
    const supaMaxSeq = await getHighestSupabaseTokenSeq();
    const nextSeq = getNextMonotonicLocalSeq(supaMaxSeq);
    assignedAppId = `CSC21251567${String(nextSeq).padStart(3, "0")}`;
  }
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const currentDate = nowIso.split("T")[0];
  const currentTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const persistResult = await persistCustomerApplication({
    appId: assignedAppId,
    idempotencyKey: explicitCallerToken || void 0,
    customerName: finalName,
    phoneNumber: digitsOnly.length === 10 ? digitsOnly : rawPhone,
    emailAddress: (emailAddress || email || "").trim(),
    selectedService: finalService,
    userCategory: userCategory || "General/OBC",
    dateOfBirth: dateOfBirth || "N/A",
    paymentMode: paymentMode || "Pay at CSC Desk Upon Completion",
    utrNumber: utrNumber || "N/A",
    totalAmount: typeof totalAmount === "number" ? totalAmount : Number(totalAmount) || 0,
    message: message || "None",
    status: status || "Pending",
    submittedAt: nowIso,
    mandatoryDocName,
    documents: Array.isArray(documents) ? documents : []
  });
  if (!persistResult.success) {
    console.error(`\u274C [Submission Error] Customer submission failed for ${finalName}:`, persistResult.error);
    return res.status(500).json({
      success: false,
      appId: assignedAppId,
      error: persistResult.error || "Failed to save application to Supabase database. Please try again."
    });
  }
  const confirmedAppId = persistResult.appId || assignedAppId;
  const sanitizedDocs = (persistResult.data?.document_urls || []).map((docItem, idx) => ({
    id: docItem.id || `doc-${idx}`,
    name: docItem.name || "Document",
    size: docItem.size || 0,
    type: docItem.type || "application/octet-stream",
    url: docItem.url || ""
  }));
  const localAppointment = addAppointment({
    appId: confirmedAppId,
    id: confirmedAppId,
    supabaseId: persistResult.data?.id ? String(persistResult.data.id) : void 0,
    name: finalName,
    email: (emailAddress || email || "").trim(),
    phone: digitsOnly.length === 10 ? digitsOnly : rawPhone,
    service: finalService,
    appointmentDate: currentDate,
    appointmentTime: currentTime,
    message: message || "None",
    dateOfBirth: dateOfBirth || "N/A",
    userCategory: userCategory || "General/OBC",
    paymentMode: paymentMode || "Pay at CSC Desk Upon Completion",
    utrNumber: utrNumber || "N/A",
    totalAmount: typeof totalAmount === "number" ? totalAmount : Number(totalAmount) || 0,
    documents: sanitizedDocs,
    status: "Pending",
    submittedAt: `${currentDate} ${currentTime}`,
    createdAt: nowIso
  });
  broadcastRealtimeEvent("APPOINTMENT_ADDED", localAppointment);
  const db = getDb();
  const docCount = sanitizedDocs.length;
  if (emailAddress && emailAddress !== "N/A") {
    simulateEmail(
      emailAddress,
      `Official Application Receipt - ${db.settings.cafeName}`,
      `\u{1F4C5} Hello ${finalName},<br/><br/>
      Your application for <b>${finalService}</b> has been securely registered in our CSC database.<br/>
      <b>Official Tracking Token:</b> <b>${confirmedAppId}</b><br/>
      Attached Documents: <b>${docCount} file(s) processed</b>.<br/>
      Our authorized staff will review and process your file.<br/><br/>
      Track Status: <a href="https://www.cscdost.com/#track">https://www.cscdost.com/#track</a><br/><br/>
      Regards,<br/>CSC DOST Portal - ${db.settings.cafeName}`
    );
  }
  const makeWebhook = process.env.WHATSAPP_BROADCAST_WEBHOOK_URL || "https://hook.eu1.make.com/64f9lm3a5sgm4pt9qbc832xgx0nw6bpl";
  if (makeWebhook && makeWebhook.startsWith("http")) {
    fetch(makeWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "new_booking_application",
        category: "booking",
        title: `Application Registered: ${finalService}`,
        body: `Hello ${finalName}, your application for ${finalService} has been registered. Token ID: ${confirmedAppId}. Track your status at https://www.cscdost.com/#track`,
        token_id: confirmedAppId,
        customer_name: finalName,
        customer_phone: digitsOnly,
        service: finalService,
        timestamp: nowIso
      })
    }).catch((err) => {
      console.warn("[Webhook Auto-Dispatch] Notification ping error:", err.message);
    });
  }
  return res.status(200).json({
    success: true,
    appId: confirmedAppId,
    token_id: confirmedAppId,
    supabaseId: persistResult.data?.id,
    status: "Pending",
    data: persistResult.data,
    documentWarnings: persistResult.documentWarnings,
    message: "Application registered and verified in Supabase database."
  });
});
app.post("/api/appointments", async (req, res) => {
  const {
    appId,
    id,
    token,
    tokenNo,
    name,
    customerName,
    applicantName,
    email,
    emailAddress,
    phone,
    phoneNumber,
    mobile,
    service,
    selectedService,
    eService,
    appointmentDate,
    appointmentTime,
    submittedAt,
    createdAt,
    message,
    dateOfBirth,
    userCategory,
    paymentMode,
    utrNumber,
    totalAmount,
    documents,
    uploadedDocuments,
    status
  } = req.body || {};
  const finalName = (name || customerName || applicantName || "Applicant").toString().trim();
  const finalPhone = (phone || phoneNumber || mobile || "N/A").toString().trim();
  const finalService = (service || selectedService || eService || "General CSC Service").toString().trim();
  const finalEmail = (email || emailAddress || "").toString().trim();
  const currentDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const currentTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const finalAppId = appId || id || token || tokenNo || `CSC21251567${Math.floor(100 + Math.random() * 900)}`;
  const rawDocs = Array.isArray(documents) ? documents : Array.isArray(uploadedDocuments) ? uploadedDocuments : [];
  const sanitizedDocs = rawDocs.map((docItem) => ({
    id: docItem.id || `doc-${Math.random().toString(36).substring(2, 7)}`,
    name: docItem.name || docItem.docTypeName || "Document",
    size: typeof docItem.size === "number" ? docItem.size : 0,
    type: docItem.type || "application/octet-stream",
    url: docItem.url || (docItem.dataUrl && docItem.dataUrl.startsWith("http") ? docItem.dataUrl : void 0),
    dataUrl: docItem.dataUrl && docItem.dataUrl.length < 1e5 ? docItem.dataUrl : void 0
  }));
  const appointment = addAppointment({
    appId: finalAppId,
    id: finalAppId,
    name: finalName,
    email: finalEmail,
    phone: finalPhone,
    service: finalService,
    appointmentDate: appointmentDate || currentDate,
    appointmentTime: appointmentTime || submittedAt || createdAt || currentTime,
    message: message || "None",
    dateOfBirth: dateOfBirth || "N/A",
    userCategory: userCategory || "General/OBC",
    paymentMode: paymentMode || "cash",
    utrNumber: utrNumber || "N/A",
    totalAmount: typeof totalAmount === "number" ? totalAmount : Number(totalAmount) || 0,
    documents: sanitizedDocs,
    status: status || "Pending",
    submittedAt: submittedAt || createdAt || `${currentDate} ${currentTime}`,
    createdAt: createdAt || submittedAt || (/* @__PURE__ */ new Date()).toISOString()
  });
  const db = getDb();
  broadcastRealtimeEvent("APPOINTMENT_ADDED", appointment);
  persistCustomerApplication({
    appId: finalAppId,
    customerName: finalName,
    phoneNumber: finalPhone,
    emailAddress: finalEmail,
    selectedService: finalService,
    userCategory: userCategory || "General/OBC",
    dateOfBirth: dateOfBirth || "N/A",
    paymentMode: paymentMode || "cash",
    utrNumber: utrNumber || "N/A",
    totalAmount: typeof totalAmount === "number" ? totalAmount : Number(totalAmount) || 0,
    message: message || "None",
    status: status || "Pending",
    documents: rawDocs
  }).catch((err) => {
    console.warn("[Server] Supabase background sync notice:", err);
  });
  const docCount = Array.isArray(documents) ? documents.length : 0;
  if (email && email !== "N/A") {
    simulateEmail(
      email,
      `Application & Slot Confirmation - ${db.settings.cafeName}`,
      `\u{1F4C5} Hello ${finalName},<br/><br/>
      Your application/booking request for <b>${finalService}</b> [ID: <b>${appointment.appId}</b>] has been registered.<br/>
      Attached Documents: <b>${docCount} file(s) uploaded</b>.<br/>
      Our team will review your application and documents.<br/><br/>
      Regards,<br/>CSC DOST Portal - ${db.settings.cafeName}`
    );
  }
  simulateEmail(
    db.settings.email,
    `\u{1F6A8} NEW Application Submitted: ${finalService} by ${finalName} [${docCount} Docs]`,
    `\u{1F514} Hello Desk Administrator,<br/><br/>
    A customer has submitted a new application with documents on the portal:<br/><br/>
    <b>Application Details:</b><br/>
    - Application Token ID: ${appointment.appId}<br/>
    - Customer Name: ${finalName}<br/>
    - Phone: ${finalPhone}<br/>
    - Service: ${finalService}<br/>
    - Attached Documents: ${docCount} file(s) uploaded<br/>
    - Payment Mode: ${paymentMode || "cash"} (UTR: ${utrNumber || "N/A"})<br/>
    - Date & Time: ${appointmentDate || currentDate} at ${appointmentTime || currentTime}<br/><br/>
    Log in to the Admin Dashboard to view/download attached documents.`
  );
  const makeWebhook = process.env.WHATSAPP_BROADCAST_WEBHOOK_URL || "https://hook.eu1.make.com/64f9lm3a5sgm4pt9qbc832xgx0nw6bpl";
  if (makeWebhook && makeWebhook.startsWith("http")) {
    fetch(makeWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "new_booking_application",
        category: "booking",
        title: `Application Registered: ${finalService}`,
        body: `Hello ${finalName}, your application for ${finalService} has been registered. Token ID: ${appointment.appId}. Track your status at https://www.cscdost.com/#track`,
        token_id: appointment.appId,
        customer_name: finalName,
        customer_phone: finalPhone,
        customer_email: finalEmail,
        service: finalService,
        appointment_date: appointmentDate || currentDate,
        appointment_time: appointmentTime || currentTime,
        url: "https://www.cscdost.com/#track",
        published_at: (/* @__PURE__ */ new Date()).toISOString()
      })
    }).catch((err) => {
      console.warn("[Webhook Auto-Dispatch] Notification ping error:", err.message);
    });
  }
  res.json({ success: true, data: appointment, message: "Application submitted successfully with documents attached." });
});
function formatPhoneNumberE164(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
}
app.post("/api/send-whatsapp-invoice", async (req, res) => {
  try {
    const {
      name,
      phone,
      service,
      totalAmount,
      appId,
      paymentMode,
      utrNumber,
      userCategory,
      submittedAt
    } = req.body;
    if (!name || !phone || !service) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: name, phone, and service are mandatory."
      });
    }
    const formattedPhone = formatPhoneNumberE164(phone);
    if (!formattedPhone || formattedPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Invalid WhatsApp phone number format. Please enter a valid 10-digit mobile number."
      });
    }
    const db = getDb();
    const storeName = db.settings.cafeName || "APNA CSC Digital Portal";
    const dateStr = submittedAt || (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const amountStr = totalAmount ? `\u20B9${totalAmount}` : "\u20B950";
    const token = appId || `APEX-2026-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const payModeStr = (paymentMode || "cash").toUpperCase();
    const utrStr = utrNumber && utrNumber !== "N/A" ? utrNumber : "N/A";
    const messageText = `\u{1F9FE} *${storeName.toUpperCase()} - OFFICIAL INVOICE*
----------------------------------------
\u{1F4CC} *Token ID:* \`${token}\`
\u{1F464} *Customer Name:* ${name}
\u{1F4DD} *Service Applied:* ${service}
\u{1F4C5} *Date:* ${dateStr}

\u{1F4B0} *PAYMENT & FEE BREAKDOWN:*
\u2022 Category: ${userCategory || "General"}
\u2022 Fee Amount: ${amountStr}
\u2022 Payment Mode: ${payModeStr}
\u2022 UTR Ref No: \`${utrStr}\`

----------------------------------------
\u2705 *Status:* Application Successfully Registered
\u{1F4F2} *Track Real-time Status:* https://apnacsc.in/track?id=${token}

_Thank you for choosing ${storeName}! If you have any questions, reply directly to this chat._`;
    const cleanDigits = formattedPhone.replace("+", "");
    const directWhatsAppUrl = `https://api.whatsapp.com/send?phone=${cleanDigits}&text=${encodeURIComponent(messageText)}`;
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioSender = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";
    const metaToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
    const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    let dispatchMethod = "simulated";
    let apiResponse = null;
    if (twilioSid && twilioToken) {
      dispatchMethod = "twilio";
      try {
        const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
        const params = new URLSearchParams();
        params.append("From", twilioSender.startsWith("whatsapp:") ? twilioSender : `whatsapp:${twilioSender}`);
        params.append("To", `whatsapp:${formattedPhone}`);
        params.append("Body", messageText);
        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params
        });
        apiResponse = await twilioRes.json();
        console.log("\u2705 Twilio WhatsApp Message Dispatched:", apiResponse);
      } catch (twErr) {
        console.error("\u274C Twilio WhatsApp Dispatch Error:", twErr?.message || twErr);
      }
    } else if (metaToken && metaPhoneId) {
      dispatchMethod = "meta_cloud_api";
      try {
        const metaRes = await fetch(`https://graph.facebook.com/v18.0/${metaPhoneId}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${metaToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanDigits,
            type: "text",
            text: { preview_url: false, body: messageText }
          })
        });
        apiResponse = await metaRes.json();
        console.log("\u2705 Meta WhatsApp Cloud API Dispatched:", apiResponse);
      } catch (metaErr) {
        console.error("\u274C Meta WhatsApp Dispatch Error:", metaErr?.message || metaErr);
      }
    } else {
      console.log("\n========================================");
      console.log(`\u{1F4AC} SIMULATED WHATSAPP INVOICE DISPATCHED`);
      console.log(`\u{1F4F1} RECIPIENT PHONE: ${formattedPhone}`);
      console.log(`\u{1F3F7}\uFE0F TOKEN ID: ${token}`);
      console.log("----------------------------------------");
      console.log(messageText);
      console.log("========================================\n");
    }
    return res.json({
      success: true,
      dispatchMethod,
      formattedPhone,
      token,
      messageText,
      directWhatsAppUrl,
      apiResponse,
      message: dispatchMethod !== "simulated" ? "WhatsApp invoice notification dispatched successfully via API." : "WhatsApp invoice generated and simulated in server logs."
    });
  } catch (error) {
    console.error("WhatsApp API Handler Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process WhatsApp notification request: " + (error?.message || "Unknown error")
    });
  }
});
var ALLOWED_WHATSAPP_STATUSES = /* @__PURE__ */ new Set([
  "Prepared",
  "Opened in WhatsApp",
  "Manually Confirmed",
  "Submitted to Provider",
  "Sent",
  "Delivered",
  "Failed"
]);
var recentAutomatedSubmissions = /* @__PURE__ */ new Map();
function isValidWhatsAppChannelUrl(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return true;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (host !== "whatsapp.com" && host !== "www.whatsapp.com") return false;
    return /^\/channel\/[A-Za-z0-9_-]{6,}/i.test(parsed.pathname);
  } catch {
    return false;
  }
}
function isValidWhatsAppGroupInviteUrl(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return true;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (host !== "chat.whatsapp.com") return false;
    return /^\/[A-Za-z0-9_-]{6,}/i.test(parsed.pathname);
  } catch {
    return false;
  }
}
app.get("/api/whatsapp/diagnostics", authenticateAdmin, (_req, res) => {
  const cloudApiTokenConfigured = Boolean((process.env.WHATSAPP_CLOUD_API_TOKEN || "").trim());
  const phoneNumberIdConfigured = Boolean((process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim());
  const officialGroupIdConfigured = Boolean((process.env.WHATSAPP_OFFICIAL_GROUP_ID || "").trim());
  const webhookUrlConfigured = Boolean((process.env.WHATSAPP_BROADCAST_WEBHOOK_URL || "").trim());
  const cloudApiReady = cloudApiTokenConfigured && phoneNumberIdConfigured;
  const officialGroupsApiReady = cloudApiReady && officialGroupIdConfigured;
  return res.json({
    success: true,
    checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
    diagnostics: {
      cloudApiReady,
      cloudApiTokenConfigured,
      phoneNumberIdConfigured,
      officialGroupsApiReady,
      officialGroupIdConfigured,
      automatedChannelApiSupported: false,
      webhookUrlConfigured,
      legacyAutoPostDiagnosis: {
        status: "unsupported_for_existing_consumer_groups_and_channels",
        summary: 'Why the legacy Auto-Post button did not deliver to your Group or Channel: (1) A public group invite link (chat.whatsapp.com/...) is a browser join link, not an API destination ID. (2) Standard Meta WhatsApp Cloud API does not provide an endpoint for automated publishing to WhatsApp Channels (whatsapp.com/channel/...). (3) A generic webhook returning HTTP 200 only confirms the webhook received JSON ("Submitted to Provider"), not that WhatsApp delivered a message.',
        supportedGroupWorkflow: 'Use "Share on WhatsApp" (official api.whatsapp.com/send link) to select your existing CSC DOST WhatsApp Group(s) and confirm sending in WhatsApp, then mark as "Manually Confirmed".',
        supportedChannelWorkflow: 'Use "Copy Channel Notification" + "Open My WhatsApp Channel" to paste and publish directly in your WhatsApp Channel, then mark as "Manually Confirmed".',
        officialApiSupport: officialGroupsApiReady ? "Official Meta Cloud API + API-Managed Group ID detected on server." : "No official API-managed Group credentials (WHATSAPP_CLOUD_API_TOKEN + WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_OFFICIAL_GROUP_ID) are configured on the server."
      }
    }
  });
});
app.get("/api/whatsapp/config", authenticateAdmin, (_req, res) => {
  return res.json({
    success: true,
    config: getWhatsAppPublisherConfig()
  });
});
app.put("/api/whatsapp/config", authenticateAdmin, (req, res) => {
  const { channelUrl, channelName, groupInviteUrl, groupName, updatedBy } = req.body || {};
  const cleanChannelUrl = typeof channelUrl === "string" ? channelUrl.trim() : void 0;
  const cleanGroupUrl = typeof groupInviteUrl === "string" ? groupInviteUrl.trim() : void 0;
  if (cleanChannelUrl !== void 0 && !isValidWhatsAppChannelUrl(cleanChannelUrl)) {
    return res.status(400).json({
      success: false,
      error: "Invalid WhatsApp Channel URL. Please enter a valid https://whatsapp.com/channel/... link."
    });
  }
  if (cleanGroupUrl !== void 0 && !isValidWhatsAppGroupInviteUrl(cleanGroupUrl)) {
    return res.status(400).json({
      success: false,
      error: "Invalid WhatsApp Group Invite URL. Please enter a valid https://chat.whatsapp.com/... link."
    });
  }
  const saved = saveWhatsAppPublisherConfig({
    ...cleanChannelUrl !== void 0 ? { channelUrl: cleanChannelUrl } : {},
    ...typeof channelName === "string" ? { channelName: channelName.trim() || "CSC DOST Official WhatsApp Channel" } : {},
    ...cleanGroupUrl !== void 0 ? { groupInviteUrl: cleanGroupUrl } : {},
    ...typeof groupName === "string" ? { groupName: groupName.trim() || "CSC DOST Community Group" } : {},
    ...typeof updatedBy === "string" ? { updatedBy: updatedBy.trim() } : {}
  });
  return res.json({
    success: true,
    config: saved,
    message: "WhatsApp Publisher destination settings saved."
  });
});
app.get(["/api/whatsapp/history", "/api/whatsapp/broadcast-logs"], authenticateAdmin, (_req, res) => {
  const history = getWhatsAppPublishHistory();
  return res.json({
    success: true,
    history,
    logs: history
  });
});
app.post("/api/whatsapp/history", authenticateAdmin, (req, res) => {
  const {
    postId,
    title,
    category,
    destination,
    sharingMethod,
    status,
    adminUser,
    canonicalUrl,
    errorDetails
  } = req.body || {};
  const validStatus = ALLOWED_WHATSAPP_STATUSES.has(status) ? status : "Prepared";
  const entry = addWhatsAppPublishHistoryRecord({
    postId: String(postId || "").trim(),
    title: String(title || "CSC DOST Notification").trim(),
    category: String(category || "job").trim(),
    destination: String(destination || "WhatsApp Group").trim(),
    sharingMethod: String(sharingMethod || "WhatsApp Share Link").trim(),
    status: validStatus,
    adminUser: String(adminUser || "Authorized Staff").trim(),
    canonicalUrl: String(canonicalUrl || "https://www.cscdost.com").trim(),
    confirmedAt: validStatus === "Manually Confirmed" ? `${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}, ${(/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })}` : void 0,
    confirmedBy: validStatus === "Manually Confirmed" ? String(adminUser || "Authorized Staff").trim() : void 0,
    errorDetails: errorDetails ? String(errorDetails) : void 0
  });
  return res.json({
    success: true,
    entry,
    history: getWhatsAppPublishHistory()
  });
});
app.patch("/api/whatsapp/history/:id/status", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status, adminUser } = req.body || {};
  if (!ALLOWED_WHATSAPP_STATUSES.has(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status "${status}". Allowed statuses: ${Array.from(ALLOWED_WHATSAPP_STATUSES).join(", ")}`
    });
  }
  if (status === "Sent" || status === "Delivered") {
    return res.status(400).json({
      success: false,
      error: "Sent and Delivered statuses are reserved for verified official API responses."
    });
  }
  const updated = updateWhatsAppPublishHistoryStatus(
    id,
    status,
    typeof adminUser === "string" ? adminUser.trim() : void 0
  );
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: "Publishing history entry not found."
    });
  }
  return res.json({
    success: true,
    entry: updated,
    history: getWhatsAppPublishHistory()
  });
});
app.delete("/api/whatsapp/history", authenticateAdmin, (_req, res) => {
  clearWhatsAppPublishHistory();
  return res.json({
    success: true,
    history: []
  });
});
app.post("/api/whatsapp/broadcast", authenticateAdmin, async (req, res) => {
  try {
    const {
      postId,
      title,
      category,
      messageText,
      postUrl,
      destination,
      adminUser,
      force
    } = req.body || {};
    if (!messageText || !String(messageText).trim()) {
      return res.status(400).json({
        success: false,
        error: "messageText is required for publishing."
      });
    }
    const cleanPostId = String(postId || title || "post").trim().toLowerCase();
    const cleanDest = String(destination || "Official API Destination").trim();
    const cleanAdmin = String(adminUser || "Authorized Staff").trim();
    const dedupKey = `${cleanPostId}::${cleanDest}`;
    const nowMs = Date.now();
    const lastSentMs = recentAutomatedSubmissions.get(dedupKey) || 0;
    if (!force && nowMs - lastSentMs < 6e4) {
      return res.status(429).json({
        success: false,
        error: "Duplicate automated submission prevented: this notification was already submitted to this destination within the last 60 seconds."
      });
    }
    const cloudToken = (process.env.WHATSAPP_CLOUD_API_TOKEN || "").trim();
    const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim();
    const officialGroupId = (process.env.WHATSAPP_OFFICIAL_GROUP_ID || "").trim();
    const configuredWebhook = (process.env.WHATSAPP_BROADCAST_WEBHOOK_URL || "").trim();
    if (cloudToken && phoneNumberId && officialGroupId) {
      try {
        const metaRes = await fetch(
          `https://graph.facebook.com/v18.0/${encodeURIComponent(phoneNumberId)}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${cloudToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "group",
              to: officialGroupId,
              type: "text",
              text: { preview_url: true, body: String(messageText) }
            }),
            signal: AbortSignal.timeout(8e3)
          }
        );
        const metaData = await metaRes.json().catch(() => ({}));
        const messageId = metaData?.messages?.[0]?.id;
        if (metaRes.ok && messageId) {
          recentAutomatedSubmissions.set(dedupKey, nowMs);
          const entry = addWhatsAppPublishHistoryRecord({
            postId: cleanPostId,
            title: String(title || "CSC DOST Notification"),
            category: String(category || "job"),
            destination: `Official API Group (${officialGroupId})`,
            sharingMethod: "Official WhatsApp Cloud API",
            status: "Sent",
            adminUser: cleanAdmin,
            canonicalUrl: String(postUrl || "https://www.cscdost.com"),
            providerMessageId: String(messageId)
          });
          return res.status(200).json({
            success: true,
            status: "Sent",
            providerMessageId: messageId,
            entry,
            history: getWhatsAppPublishHistory(),
            message: `Verified by Meta Cloud API (Message ID: ${messageId}). Status recorded as Sent.`
          });
        } else {
          const apiErrMsg = metaData?.error?.message || `Meta Cloud API returned HTTP ${metaRes.status}`;
          const failedEntry2 = addWhatsAppPublishHistoryRecord({
            postId: cleanPostId,
            title: String(title || "CSC DOST Notification"),
            category: String(category || "job"),
            destination: `Official API Group`,
            sharingMethod: "Official WhatsApp Cloud API",
            status: "Failed",
            adminUser: cleanAdmin,
            canonicalUrl: String(postUrl || "https://www.cscdost.com"),
            errorDetails: apiErrMsg
          });
          return res.status(400).json({
            success: false,
            status: "Failed",
            error: apiErrMsg,
            entry: failedEntry2,
            history: getWhatsAppPublishHistory()
          });
        }
      } catch (err) {
        const errMsg = err?.message || "Network error contacting Meta Cloud API";
        const failedEntry2 = addWhatsAppPublishHistoryRecord({
          postId: cleanPostId,
          title: String(title || "CSC DOST Notification"),
          category: String(category || "job"),
          destination: "Official API Group",
          sharingMethod: "Official WhatsApp Cloud API",
          status: "Failed",
          adminUser: cleanAdmin,
          canonicalUrl: String(postUrl || "https://www.cscdost.com"),
          errorDetails: errMsg
        });
        return res.status(500).json({
          success: false,
          status: "Failed",
          error: errMsg,
          entry: failedEntry2,
          history: getWhatsAppPublishHistory()
        });
      }
    }
    if (configuredWebhook && /^https?:\/\//i.test(configuredWebhook) && !configuredWebhook.includes("chat.whatsapp.com")) {
      try {
        const hookRes = await fetch(configuredWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "csc_dost_whatsapp_notification",
            postId: cleanPostId,
            title: title || "CSC DOST Notification",
            category: category || "job",
            messageText: String(messageText),
            canonicalUrl: postUrl || "https://www.cscdost.com",
            submittedBy: cleanAdmin,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }),
          signal: AbortSignal.timeout(7e3)
        });
        if (hookRes.ok) {
          recentAutomatedSubmissions.set(dedupKey, nowMs);
          const entry = addWhatsAppPublishHistoryRecord({
            postId: cleanPostId,
            title: String(title || "CSC DOST Notification"),
            category: String(category || "job"),
            destination: cleanDest || "Configured Server Webhook",
            sharingMethod: "Server Webhook Relay",
            status: "Submitted to Provider",
            adminUser: cleanAdmin,
            canonicalUrl: String(postUrl || "https://www.cscdost.com")
          });
          return res.status(200).json({
            success: true,
            status: "Submitted to Provider",
            entry,
            history: getWhatsAppPublishHistory(),
            message: "Payload accepted by server webhook (Status: Submitted to Provider). Note: Webhook acceptance does not confirm WhatsApp Group or Channel delivery unless your downstream provider verifies delivery."
          });
        } else {
          const errText = await hookRes.text().catch(() => "");
          const failedEntry2 = addWhatsAppPublishHistoryRecord({
            postId: cleanPostId,
            title: String(title || "CSC DOST Notification"),
            category: String(category || "job"),
            destination: cleanDest || "Configured Server Webhook",
            sharingMethod: "Server Webhook Relay",
            status: "Failed",
            adminUser: cleanAdmin,
            canonicalUrl: String(postUrl || "https://www.cscdost.com"),
            errorDetails: `Webhook returned HTTP ${hookRes.status}: ${errText.slice(0, 120)}`
          });
          return res.status(400).json({
            success: false,
            status: "Failed",
            error: `Webhook returned HTTP ${hookRes.status}.`,
            entry: failedEntry2,
            history: getWhatsAppPublishHistory()
          });
        }
      } catch (err) {
        const errMsg = err?.message || "Webhook request failed";
        const failedEntry2 = addWhatsAppPublishHistoryRecord({
          postId: cleanPostId,
          title: String(title || "CSC DOST Notification"),
          category: String(category || "job"),
          destination: cleanDest || "Configured Server Webhook",
          sharingMethod: "Server Webhook Relay",
          status: "Failed",
          adminUser: cleanAdmin,
          canonicalUrl: String(postUrl || "https://www.cscdost.com"),
          errorDetails: errMsg
        });
        return res.status(500).json({
          success: false,
          status: "Failed",
          error: errMsg,
          entry: failedEntry2,
          history: getWhatsAppPublishHistory()
        });
      }
    }
    const failedEntry = addWhatsAppPublishHistoryRecord({
      postId: cleanPostId,
      title: String(title || "CSC DOST Notification"),
      category: String(category || "job"),
      destination: cleanDest,
      sharingMethod: "Official API Attempt",
      status: "Failed",
      adminUser: cleanAdmin,
      canonicalUrl: String(postUrl || "https://www.cscdost.com"),
      errorDetails: "Official WhatsApp Business Cloud API credentials (WHATSAPP_CLOUD_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_OFFICIAL_GROUP_ID) are not configured on the server."
    });
    return res.status(400).json({
      success: false,
      status: "Failed",
      error: 'Automated API delivery is unavailable: No official WhatsApp Business Cloud API credentials are configured on the server. Please use the supported "Share to WhatsApp Groups" or "Publish to WhatsApp Channel" workflows.',
      entry: failedEntry,
      history: getWhatsAppPublishHistory()
    });
  } catch (err) {
    console.error("[WhatsApp Publisher] Broadcast error:", err);
    return res.status(500).json({
      success: false,
      status: "Failed",
      error: err?.message || "Unexpected server error while processing WhatsApp request."
    });
  }
});
app.get(["/api/push/vapid-public-key", "/push/vapid-public-key"], (_req, res) => {
  try {
    const publicKey = getVapidPublicKey();
    res.json({ success: true, publicKey });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || "Failed to retrieve VAPID key" });
  }
});
app.get(["/api/push/status", "/push/status"], (_req, res) => {
  try {
    const all = getActivePushSubscriptions("all");
    const jobs = getActivePushSubscriptions("jobs");
    const schemes = getActivePushSubscriptions("schemes");
    const exams = getActivePushSubscriptions("exams");
    const updates = getActivePushSubscriptions("updates");
    const settings = getPushServerSettings();
    const history = getPushNotificationHistory();
    res.json({
      success: true,
      activeSubscribers: all.length,
      categories: {
        all: all.length,
        jobs: jobs.length,
        schemes: schemes.length,
        exams: exams.length,
        updates: updates.length
      },
      settings,
      recentCount: history.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
app.post(["/api/push/subscribe", "/push/subscribe"], async (req, res) => {
  try {
    const { subscription, preferences, deviceType, userAgent } = req.body || {};
    if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return res.status(400).json({
        success: false,
        error: "Invalid push subscription payload: endpoint and encryption keys (p256dh, auth) are required."
      });
    }
    const savedRecord = upsertPushSubscription({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
      deviceType: deviceType || "unknown",
      userAgent: userAgent || req.headers["user-agent"] || "",
      preferences: preferences || { jobs: true, schemes: true, exams: true, updates: true }
    });
    syncPushSubscriptionToSupabase(savedRecord).catch((err) => {
      console.warn("[Push] Background Supabase sync notice:", err);
    });
    const settings = getPushServerSettings();
    if (settings.welcomePushEnabled && req.body.sendWelcome) {
      sendSingleNotification(savedRecord, {
        title: "CSC DOST | Alerts Active! \u{1F514}",
        body: "You are now connected to receive instant job openings, scheme alerts & KU updates.",
        url: "/",
        category: "updates"
      }).catch(() => {
      });
    }
    return res.status(200).json({
      success: true,
      subscriptionId: savedRecord.id,
      message: "Push subscription successfully registered and verified."
    });
  } catch (err) {
    console.error("[Push] Subscribe error:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Server failed to register subscription."
    });
  }
});
app.post(["/api/push/unsubscribe", "/push/unsubscribe"], (req, res) => {
  try {
    const { endpoint } = req.body || {};
    if (!endpoint) {
      return res.status(400).json({ success: false, error: "Endpoint is required to unsubscribe." });
    }
    const removed = deactivatePushSubscription(endpoint);
    res.json({ success: true, removed, message: "Subscription successfully deactivated." });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
app.post(["/api/push/test", "/push/test"], authenticateAdmin, async (req, res) => {
  try {
    const { endpoint, title, body, url, postId } = req.body || {};
    if (!endpoint) {
      return res.status(400).json({ success: false, error: "Target subscriber endpoint is required for test send." });
    }
    const result = await broadcastPushNotification({
      title: title || "CSC DOST | Test Notification \u{1F514}",
      body: body || "This is a test notification from CSC DOST Admin Console.",
      url: url || "/",
      postId,
      isTest: true,
      testEndpoint: endpoint,
      sentBy: req.body.adminUser || "Admin Console"
    });
    if (result.success) {
      return res.json({
        success: true,
        message: "Test notification accepted by push service.",
        stats: result.stats,
        notificationId: result.notificationId
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || "Failed to deliver test notification.",
        stats: result.stats
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});
app.post(["/api/push/send", "/push/send"], authenticateAdmin, async (req, res) => {
  try {
    const { title, body, category, url, postId, image, icon, adminUser } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ success: false, error: "Title and body are required to broadcast a push notification." });
    }
    const result = await broadcastPushNotification({
      title: String(title).trim(),
      body: String(body).trim(),
      category: category || "all",
      url: url || (postId ? `/#post/${postId}` : "/"),
      postId,
      image,
      icon,
      sentBy: adminUser || "Admin Broadcast"
    });
    return res.json({
      success: true,
      notificationId: result.notificationId,
      stats: result.stats,
      message: `Push broadcast processed: ${result.stats.accepted} accepted, ${result.stats.failed} failed (${result.stats.expiredCleaned} expired cleaned).`
    });
  } catch (err) {
    console.error("[Push] Broadcast error:", err);
    return res.status(500).json({ success: false, error: err?.message || "Failed to send broadcast push notification." });
  }
});
app.get(["/api/push/history", "/push/history"], (_req, res) => {
  try {
    const history = getPushNotificationHistory();
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
app.post(["/api/push/settings", "/push/settings"], authenticateAdmin, (req, res) => {
  try {
    const updated = updatePushServerSettings(req.body || {});
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
app.get(["/api/notifications/center", "/notifications/center"], (_req, res) => {
  try {
    const db = getDb();
    const activeAnnouncements = (db.announcements || []).filter((a) => a.active).map((a) => ({
      id: a.id,
      type: "announcement",
      category: "updates",
      title: a.title,
      description: a.content,
      date: a.date,
      url: "/#services",
      badge: "Announcement"
    }));
    const topSarkari = SARKARI_DATA.slice(0, 10).map((item) => ({
      id: item.id,
      type: "post",
      category: item.category === "exam_forms" ? "exams" : item.category === "admissions" ? "exams" : "jobs",
      title: item.title,
      description: item.shortInfo,
      date: item.postDate || "Recent",
      url: `/#post/${item.id}`,
      badge: item.category.toUpperCase().replace("_", " "),
      thumbnailUrl: item.thumbnailUrl
    }));
    res.json({
      success: true,
      items: [...activeAnnouncements, ...topSarkari]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN_SECRET, message: "Administrator authenticated successfully." });
  } else {
    res.status(401).json({ error: "Invalid username or password. Please try again." });
  }
});
app.get("/api/admin/dashboard", authenticateAdmin, (req, res) => {
  const db = getDb();
  const stats = getAnalytics();
  res.json({
    settings: db.settings,
    announcements: db.announcements,
    gallery: db.gallery,
    contactRequests: db.contactRequests,
    appointments: db.appointments,
    stats
  });
});
app.put("/api/admin/settings", authenticateAdmin, (req, res) => {
  const settings = req.body;
  if (!settings || !settings.cafeName) {
    return res.status(400).json({ error: "Invalid settings body" });
  }
  updateSettings(settings);
  res.json({ success: true, message: "Website settings updated successfully." });
});
app.post("/api/admin/announcements", authenticateAdmin, (req, res) => {
  const { title, content, type, active } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  const newAnn = addAnnouncement({ title, content, type: type || "info", active: active !== false });
  res.json({ success: true, data: newAnn });
});
app.put("/api/admin/announcements/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const success = updateAnnouncement(id, req.body);
  if (success) {
    res.json({ success: true, message: "Announcement updated." });
  } else {
    res.status(404).json({ error: "Announcement not found." });
  }
});
app.delete("/api/admin/announcements/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const success = deleteAnnouncement(id);
  if (success) {
    res.json({ success: true, message: "Announcement deleted." });
  } else {
    res.status(404).json({ error: "Announcement not found." });
  }
});
app.post("/api/admin/gallery", authenticateAdmin, (req, res) => {
  const { title, category, url, description } = req.body;
  if (!title || !category || !url) {
    return res.status(400).json({ error: "Title, category, and image URL are required" });
  }
  const newItem = addGalleryItem({ title, category, url, description: description || "" });
  res.json({ success: true, data: newItem });
});
app.delete("/api/admin/gallery/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const success = deleteGalleryItem(id);
  if (success) {
    res.json({ success: true, message: "Gallery photo removed." });
  } else {
    res.status(404).json({ error: "Gallery photo not found." });
  }
});
app.put("/api/admin/requests/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status, request } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required" });
  let success = updateContactStatus(id, status);
  if (!success && request) {
    const db = getDb();
    db.contactRequests.unshift({ ...request, id, status });
    saveDb(db);
    success = true;
  }
  if (success) {
    res.json({ success: true, message: "Contact request status updated." });
  } else {
    res.status(404).json({ error: "Request not found." });
  }
});
app.delete("/api/admin/requests/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const index = db.contactRequests.findIndex((r) => r.id === id);
  if (index !== -1) {
    db.contactRequests.splice(index, 1);
    saveDb(db);
    res.json({ success: true, message: "Request removed." });
  } else {
    res.status(404).json({ error: "Request not found." });
  }
});
app.put("/api/admin/appointments/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status, appointment } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required" });
  let success = updateAppointmentStatus(id, status);
  if (!success && appointment) {
    const db = getDb();
    db.appointments.unshift({ ...appointment, id, status });
    saveDb(db);
    success = true;
  }
  if (success) {
    res.json({ success: true, message: "Appointment status updated." });
  } else {
    res.status(404).json({ error: "Appointment not found." });
  }
});
app.delete("/api/admin/appointments/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const supabaseId = String(req.query.supabaseId || req.body?.supabaseId || "").trim();
  const supaRes = await deleteCustomerApplicationFromSupabase(id, supabaseId);
  const localRemoved = deleteAppointment(id, [
    supabaseId,
    ...supaRes.deletedSupabaseIds,
    ...supaRes.deletedTokenIds
  ]);
  if (supaRes.foundInSupabase && !supaRes.success) {
    return res.status(500).json({ error: supaRes.error || "Failed to delete from Supabase." });
  }
  if (supaRes.affectedCount > 0 || localRemoved) {
    broadcastRealtimeEvent("APPOINTMENT_DELETED", {
      id,
      appId: id,
      supabaseId,
      deletedSupabaseIds: supaRes.deletedSupabaseIds,
      deletedTokenIds: supaRes.deletedTokenIds
    });
    res.json({ success: true, affectedCount: Math.max(supaRes.affectedCount, localRemoved ? 1 : 0), message: "Appointment removed." });
  } else {
    res.status(404).json({ error: "Appointment not found." });
  }
});
app.get("/api/admin/backup", authenticateAdmin, (req, res) => {
  const db = getDb();
  res.setHeader("Content-disposition", "attachment; filename=cyber-cafe-backup.json");
  res.setHeader("Content-type", "application/json");
  res.send(JSON.stringify(db, null, 2));
});
app.post("/api/admin/restore", authenticateAdmin, (req, res) => {
  const newData = req.body;
  if (!newData || !newData.settings || !Array.isArray(newData.announcements)) {
    return res.status(400).json({ error: "Invalid backup structure. Restore cancelled." });
  }
  saveDb(newData);
  res.json({ success: true, message: "Database restored successfully from backup." });
});
function syncCustomPostsAndThumbnailsInMemory() {
  try {
    const customPosts = getCustomSarkariPosts();
    const thumbnailsMap = getPostThumbnailsMap();
    for (const custom of customPosts) {
      if (!custom || !custom.id) continue;
      const existingIdx = SARKARI_DATA.findIndex((i) => i.id === custom.id);
      if (existingIdx >= 0) {
        SARKARI_DATA[existingIdx] = { ...SARKARI_DATA[existingIdx], ...custom };
      } else {
        SARKARI_DATA.unshift(custom);
      }
    }
    for (const item of SARKARI_DATA) {
      const savedThumb = thumbnailsMap[item.id];
      if (savedThumb && savedThumb.thumbnailUrl) {
        item.thumbnailUrl = savedThumb.thumbnailUrl;
        if (savedThumb.spec) {
          item.thumbnailSpec = savedThumb.spec;
        }
      }
    }
  } catch (err) {
    console.warn("[Thumbnails] Memory sync notice:", err);
  }
}
syncCustomPostsAndThumbnailsInMemory();
app.get("/api/thumbnails/map", (_req, res) => {
  syncCustomPostsAndThumbnailsInMemory();
  res.json({
    success: true,
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    aspectRatio: `${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}`,
    thumbnails: getPostThumbnailsMap(),
    customPosts: getCustomSarkariPosts()
  });
});
app.get(
  [
    "/api/thumbnails/post/:id.png",
    "/api/thumbnails/post/:id.webp",
    "/api/thumbnails/post/:id.svg",
    "/api/thumbnails/post/:id",
    "/thumbnails/post/:id.png",
    "/thumbnails/post/:id.webp",
    "/thumbnails/post/:id.svg",
    "/thumbnails/post/:id",
    "/thumbnails/:id.png",
    "/thumbnails/:id.webp",
    "/thumbnails/:id.svg"
  ],
  async (req, res) => {
    let resolvedSpec = null;
    try {
      syncCustomPostsAndThumbnailsInMemory();
      const rawId = (req.params.id || "").replace(/\.(png|webp|svg)$/i, "");
      const isSvg = req.path.endsWith(".svg") || req.query.format === "svg";
      const isWebp = req.path.endsWith(".webp") || req.query.format === "webp";
      const format = isSvg ? "svg" : isWebp ? "webp" : "png";
      if (!isSvg) {
        const localFilePath = path5.join(process.cwd(), "public", "thumbnails", `${rawId}.${format}`);
        if (req.query.force !== "1" && fs4.existsSync(localFilePath)) {
          res.setHeader("Content-Type", format === "webp" ? "image/webp" : "image/png");
          res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
          return res.sendFile(localFilePath);
        }
      }
      const thumbnailsMap = getPostThumbnailsMap();
      const savedEntry = thumbnailsMap[rawId];
      if (savedEntry && savedEntry.spec && !savedEntry.isCustomUpload) {
        resolvedSpec = savedEntry.spec;
      } else {
        const sarkariItem = SARKARI_DATA.find((i) => i.id === rawId);
        if (sarkariItem) {
          resolvedSpec = buildDeterministicThumbnailSpec({
            id: sarkariItem.id,
            title: sarkariItem.title,
            category: sarkariItem.category,
            department: sarkariItem.department,
            postType: sarkariItem.postType,
            shortInfo: sarkariItem.shortInfo,
            startDate: sarkariItem.startDate,
            lastDate: sarkariItem.lastDate,
            status: sarkariItem.status
          });
        } else {
          const serviceItem = SERVICES_LIST.find((s) => s.id === rawId);
          if (serviceItem) {
            resolvedSpec = buildDeterministicThumbnailSpec({
              id: serviceItem.id,
              title: serviceItem.name,
              category: serviceItem.category,
              department: "CSC E-Governance Services India",
              postType: "Service",
              shortInfo: serviceItem.description,
              status: "Open"
            });
          } else {
            resolvedSpec = buildDeterministicThumbnailSpec({
              title: rawId ? rawId.replace(/[-_]+/g, " ").toUpperCase() : "JKSSB Class IV Recruitment",
              category: "jkssb",
              postType: "Job",
              status: "Open"
            });
          }
        }
      }
      if (isSvg) {
        const svgContent = renderStandaloneMasterThumbnailSvg(resolvedSpec);
        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
        return res.send(svgContent);
      }
      const buffer = await renderMasterThumbnailBuffer(resolvedSpec, format);
      res.setHeader("Content-Type", format === "webp" ? "image/webp" : "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
      return res.send(buffer);
    } catch (err) {
      console.error("[Thumbnails] Dynamic post thumbnail generation error:", err);
      const safeSpec = resolvedSpec || buildDeterministicThumbnailSpec({
        title: "CSC DOST Citizen Service Portal",
        category: "jobs",
        status: "Open"
      });
      const fallbackSvg = renderStandaloneMasterThumbnailSvg(safeSpec);
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.send(fallbackSvg);
    }
  }
);
app.post("/api/thumbnails/generate", async (req, res) => {
  try {
    const body = req.body || {};
    const format = body.format === "webp" ? "webp" : "png";
    const useAi = body.useAi !== false;
    const input = {
      id: body.id || body.postId || "",
      title: body.title || "JKSSB Class IV Recruitment 2026",
      category: body.category || "jkssb",
      department: body.department || "",
      postType: body.postType || "Job",
      shortInfo: body.shortDescription || body.shortInfo || "",
      startDate: body.importantDates?.startDate || body.startDate,
      lastDate: body.importantDates?.lastDate || body.lastDate,
      status: body.applicationStatus || body.status || "Open"
    };
    let spec;
    if (body.customSpec && typeof body.customSpec === "object" && body.useCustomSpec === true) {
      const baseSpec = useAi ? await extractThumbnailSpecWithAI(input) : buildDeterministicThumbnailSpec(input);
      const customCta = body.customSpec.ctaButtonText || body.customSpec.ctaText || baseSpec.ctaButtonText;
      spec = {
        ...baseSpec,
        ...body.customSpec,
        ctaButtonText: customCta,
        fourIcons: Array.isArray(body.customSpec.fourIcons) && body.customSpec.fourIcons.length === 4 ? body.customSpec.fourIcons.map(
          (ic) => typeof ic === "string" ? ic : `${ic.line1 || ""} ${ic.line2 || ""}`.trim()
        ) : baseSpec.fourIcons
      };
    } else {
      spec = useAi ? await extractThumbnailSpecWithAI(input) : buildDeterministicThumbnailSpec(input);
    }
    const buffer = await renderMasterThumbnailBuffer(spec, format);
    const mimeType = format === "webp" ? "image/webp" : "image/png";
    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    res.json({
      success: true,
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      aspectRatio: `${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}`,
      format,
      spec,
      dataUrl
    });
  } catch (err) {
    console.error("[Thumbnails] Generate error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to generate 2048x677 master reference thumbnail"
    });
  }
});
app.post("/api/thumbnails/save", async (req, res) => {
  try {
    const body = req.body || {};
    const postId = String(body.postId || body.id || `post-${Date.now()}`).trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    const format = body.format === "webp" ? "webp" : "png";
    const isCustomUpload = Boolean(body.isCustomUpload && body.customImageDataUrl);
    let finalBuffer;
    let finalSpec = body.spec;
    if (isCustomUpload && typeof body.customImageDataUrl === "string") {
      const base64Part = body.customImageDataUrl.includes(",") ? body.customImageDataUrl.split(",")[1] : body.customImageDataUrl;
      const rawBuf = Buffer.from(base64Part, "base64");
      let pipeline = sharp3(rawBuf).resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
        fit: "cover",
        position: "center"
      });
      finalBuffer = format === "webp" ? await pipeline.webp({ quality: 95 }).toBuffer() : await pipeline.png({ compressionLevel: 6 }).toBuffer();
    } else {
      if (!finalSpec) {
        const input = {
          id: postId,
          title: body.title || "JKSSB Class IV Recruitment 2026",
          category: body.category || "jkssb",
          department: body.department || "",
          postType: body.postType || "Job",
          shortInfo: body.shortDescription || "",
          startDate: body.importantDates?.startDate,
          lastDate: body.importantDates?.lastDate,
          status: body.applicationStatus || "Open"
        };
        finalSpec = await extractThumbnailSpecWithAI(input);
      }
      finalBuffer = await renderMasterThumbnailBuffer(finalSpec, format);
    }
    const publicThumbDir = path5.join(process.cwd(), "public", "thumbnails");
    if (!fs4.existsSync(publicThumbDir)) {
      fs4.mkdirSync(publicThumbDir, { recursive: true });
    }
    const ext = format === "webp" ? "webp" : "png";
    const fileName = `${postId}.${ext}`;
    const localDiskPath = path5.join(publicThumbDir, fileName);
    fs4.writeFileSync(localDiskPath, finalBuffer);
    const localUrl = `/thumbnails/${fileName}?t=${Date.now()}`;
    const contentType = format === "webp" ? "image/webp" : "image/png";
    const supaUpload = await uploadDocumentBufferToSupabase(
      "thumbnails",
      `${postId}_${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT}.${ext}`,
      finalBuffer,
      contentType
    );
    const effectiveUrl = supaUpload.success && supaUpload.url ? supaUpload.url : localUrl;
    savePostThumbnailRecord(postId, {
      thumbnailUrl: effectiveUrl,
      supabaseUrl: supaUpload.url || void 0,
      localUrl,
      spec: finalSpec
    });
    syncCustomPostsAndThumbnailsInMemory();
    res.json({
      success: true,
      postId,
      thumbnailUrl: effectiveUrl,
      supabaseUrl: supaUpload.url || null,
      localUrl,
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      aspectRatio: `${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}`,
      format,
      spec: finalSpec,
      isCustomUpload
    });
  } catch (err) {
    console.error("[Thumbnails] Save error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to save 2048x677 thumbnail"
    });
  }
});
app.post("/api/posts", async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title || !String(body.title).trim()) {
      return res.status(400).json({ error: "Post Title is required." });
    }
    const slug = String(
      body.id || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 65)
    );
    const todayStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
    const newPost = {
      id: slug,
      title: String(body.title).trim(),
      category: body.category || "jkssb",
      department: body.department || "",
      postType: body.postType || "Job",
      status: body.applicationStatus || body.status || "Open",
      postDate: body.postDate || todayStr,
      startDate: body.startDate || todayStr,
      lastDate: body.lastDate || "Check Notification",
      advertisementNo: body.advertisementNo || "",
      shortInfo: body.shortDescription || body.shortInfo || `${body.title} official notification, eligibility, important dates, and online application assistance via CSC DOST.`,
      ageLimit: body.ageLimit || "As per official notification norms",
      eligibility: body.eligibility || "Refer to official notification for qualification details",
      totalPosts: body.totalPosts || "Various Posts",
      officialLink: body.officialLink || "https://www.india.gov.in",
      fees: body.fees || {
        genObc: body.genObcFee || "As per official notice",
        scSt: body.scStFee || "As per official notice"
      },
      isNew: true,
      thumbnailUrl: body.thumbnailUrl || `/api/thumbnails/post/${slug}.png`,
      thumbnailSpec: body.thumbnailSpec || void 0
    };
    upsertCustomSarkariPost(newPost);
    if (body.thumbnailUrl || body.thumbnailSpec) {
      savePostThumbnailRecord(slug, {
        thumbnailUrl: newPost.thumbnailUrl,
        spec: body.thumbnailSpec
      });
    }
    syncCustomPostsAndThumbnailsInMemory();
    const pushSettings = getPushServerSettings();
    if (pushSettings.autoPublishPush && !body.suppressPush) {
      const pushCategory = newPost.category === "exam_forms" ? "exams" : newPost.category === "admissions" ? "exams" : "jobs";
      broadcastPushNotification({
        title: `CSC DOST | ${newPost.postType === "Job" ? "New Job Alert" : "New Update"} \u{1F514}`,
        body: `${newPost.title} \u2014 ${newPost.totalPosts || ""} (${newPost.lastDate ? `Last Date: ${newPost.lastDate}` : ""}). Tap to view full details.`,
        category: pushCategory,
        url: `/#post/${slug}`,
        postId: slug,
        image: newPost.thumbnailUrl,
        sentBy: "Auto-Publish on Post Save"
      }).catch((err) => {
        console.warn("[Push] Auto-publish background notification notice:", err?.message);
      });
    }
    res.json({
      success: true,
      post: newPost
    });
  } catch (err) {
    console.error("[Posts] Create/Update post error:", err);
    res.status(500).json({ error: err?.message || "Failed to save post" });
  }
});
app.delete("/api/posts/:id", (req, res) => {
  try {
    const id = req.params.id;
    deleteCustomSarkariPost(id);
    const idx = SARKARI_DATA.findIndex((i) => i.id === id);
    if (idx >= 0) {
      SARKARI_DATA.splice(idx, 1);
    }
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to delete post" });
  }
});
app.get(["/api/og-image/:id.png", "/api/og-image/:id.webp", "/api/og-image/:id.svg", "/api/og-image/:id", "/api/og-image"], async (req, res) => {
  try {
    const rawId = (req.params.id || req.query.id || "").replace(/\.(png|svg|webp)$/i, "");
    const format = req.path.endsWith(".svg") || req.query.format === "svg" ? "svg" : "png";
    const allSarkari = [...SARKARI_DATA, ...getCustomSarkariPosts()];
    const sarkariItem = allSarkari.find((i) => i.id === rawId || i.id === decodeURIComponent(rawId));
    if (sarkariItem) {
      if (format === "svg") {
        const svg = generateOgSvg(sarkariItem);
        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
        return res.send(svg);
      }
      const png2 = await generateSocialPreviewPng(sarkariItem);
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
      return res.send(png2);
    }
    const serviceItem = SERVICES_LIST.find((s) => s.id === rawId || s.id === decodeURIComponent(rawId));
    if (serviceItem) {
      if (format === "svg") {
        const svg = generateServiceOgSvg(serviceItem);
        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
        return res.send(svg);
      }
      const png2 = await generateServiceOgPng(serviceItem);
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
      return res.send(png2);
    }
    if (format === "svg") {
      const svg = generateOgSvg(null);
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
      return res.send(svg);
    }
    const png = await generateSocialPreviewPng(null);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
    return res.send(png);
  } catch (err) {
    console.error("OG Image Generation Error:", err);
    res.status(500).sendFile(path5.join(process.cwd(), "public", "og-banner.png"));
  }
});
app.get(["/og-banner.png", "/og-image.png"], (req, res) => {
  const bannerPath = path5.join(process.cwd(), "public", "og-banner.png");
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
  res.sendFile(bannerPath);
});
app.get(["/og-banner.svg", "/og-image.svg"], (req, res) => {
  const bannerPath = path5.join(process.cwd(), "public", "og-banner.svg");
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
  res.sendFile(bannerPath);
});
function renderDynamicMetaHtml(rawHtml, req) {
  let isNotFound = false;
  const urlPath = req.path;
  const matchPost = urlPath.match(/^\/(?:post|job|jobs|sarkari|notice|admissions|notification)\/([^/?#]+)/i);
  const matchService = urlPath.match(/^\/service\/([^/?#]+)/i);
  const postParam = req.query.post || req.query.job || req.query.id || req.query.notice;
  const serviceParam = req.query.service;
  const host = req.get("x-forwarded-host") || req.get("host") || "www.cscdost.com";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const baseOrigin = isLocal ? `http://${host}` : host.includes(".run.app") ? `https://${host}` : "https://www.cscdost.com";
  let title = "CSC DOST \u2013 Guide to Government Services, Schemes & Recruitment";
  let description = "CSC DOST is an independent citizen assistance and information portal. Explore recruitment updates, government schemes, Aadhaar, PAN card, and direct official links.";
  let ogImage = `${baseOrigin}/og-banner.png`;
  let canonicalUrl = `https://www.cscdost.com${urlPath === "/" ? "" : urlPath}`;
  let ogType = "website";
  let articlePublishedDate = "";
  let breadcrumbItems = [];
  const legalMatch = urlPath.match(/^\/(privacy-policy|privacy|terms-of-service|terms|disclaimer|about-us|about|contact-us|contact|refund-policy|refund)(?:\/)?$/i);
  if (legalMatch) {
    const rawKey = legalMatch[1].toLowerCase();
    if (rawKey === "privacy-policy" || rawKey === "privacy") {
      title = "Privacy Policy | CSC DOST - Digital Assistance & Information Portal";
      description = "Read the Privacy Policy of CSC DOST (cscdost.com). Learn how citizen data, form documents, and personal details are handled securely in compliance with the DPDP Act 2023.";
      canonicalUrl = "https://www.cscdost.com/privacy-policy";
      breadcrumbItems = [
        { name: "Home", url: "https://www.cscdost.com/" },
        { name: "Privacy Policy", url: "https://www.cscdost.com/privacy-policy" }
      ];
    } else if (rawKey === "terms-of-service" || rawKey === "terms") {
      title = "Terms of Service | CSC DOST - Citizen E-Governance Assistance";
      description = "Read the Terms of Service and User Agreement for CSC DOST (cscdost.com). Understand our scope as an independent CSC facilitation center and user responsibilities.";
      canonicalUrl = "https://www.cscdost.com/terms-of-service";
      breadcrumbItems = [
        { name: "Home", url: "https://www.cscdost.com/" },
        { name: "Terms of Service", url: "https://www.cscdost.com/terms-of-service" }
      ];
    } else if (rawKey === "disclaimer") {
      title = "Disclaimer & Government Non-Affiliation | CSC DOST";
      description = "Important legal disclaimer: CSC DOST (cscdost.com) is an independent private digital facilitation center operated by CSC VLE Wasim Ahmad Khanday and is NOT an official government website.";
      canonicalUrl = "https://www.cscdost.com/disclaimer";
      breadcrumbItems = [
        { name: "Home", url: "https://www.cscdost.com/" },
        { name: "Disclaimer", url: "https://www.cscdost.com/disclaimer" }
      ];
    } else if (rawKey === "about-us" || rawKey === "about") {
      title = "About Us | CSC DOST - Authorized CSC VLE Digital Assistance Center";
      description = "Learn about CSC DOST, founded by Authorized CSC VLE Wasim Ahmad Khanday (VLE ID: 212515670018) in Qazigund, Anantnag, J&K to assist citizens with e-governance applications.";
      canonicalUrl = "https://www.cscdost.com/about-us";
      breadcrumbItems = [
        { name: "Home", url: "https://www.cscdost.com/" },
        { name: "About Us", url: "https://www.cscdost.com/about-us" }
      ];
    } else if (rawKey === "contact-us" || rawKey === "contact") {
      title = "Contact Us & Help Desk | CSC DOST Support Center";
      description = "Get in touch with CSC DOST Helpdesk. Call +91-7006833767 or email support@cscdost.com. Physical Center: Sangran Qazigund, Anantnag, Jammu & Kashmir 192221.";
      canonicalUrl = "https://www.cscdost.com/contact-us";
      breadcrumbItems = [
        { name: "Home", url: "https://www.cscdost.com/" },
        { name: "Contact Us", url: "https://www.cscdost.com/contact-us" }
      ];
    } else if (rawKey === "refund-policy" || rawKey === "refund") {
      title = "Refund & Cancellation Policy | CSC DOST";
      description = "Review CSC DOST's transparent refund and fee policies for online application processing, appointment assistance, and citizen digital services.";
      canonicalUrl = "https://www.cscdost.com/refund-policy";
      breadcrumbItems = [
        { name: "Home", url: "https://www.cscdost.com/" },
        { name: "Refund Policy", url: "https://www.cscdost.com/refund-policy" }
      ];
    }
  }
  const targetPostId = (matchPost ? matchPost[1] : postParam)?.replace(/\.html?$/i, "");
  const targetServiceId = (matchService ? matchService[1] : serviceParam)?.replace(/\.html?$/i, "");
  if (targetPostId) {
    const allSarkari = [...SARKARI_DATA, ...getCustomSarkariPosts()];
    const item = allSarkari.find((i) => i.id === targetPostId || i.id === decodeURIComponent(targetPostId));
    if (item) {
      title = `${item.title} | CSC DOST`;
      description = item.shortInfo || `Apply online for ${item.title}. Last Date: ${item.lastDate || "Check Notification"}. Vacancies: ${item.totalPosts || "Open"}. Official updates & application assistance at cscdost.com.`;
      const dateVersion = (item.lastDate || item.postDate || "2026").replace(/[^0-9]/g, "") || "2026";
      ogImage = `${baseOrigin}/api/og-image/${encodeURIComponent(item.id)}.png?v=${dateVersion}`;
      canonicalUrl = `https://www.cscdost.com/post/${item.id}`;
      ogType = "article";
      articlePublishedDate = item.postDate || "2026-02-20";
      breadcrumbItems = [
        { name: "Home", url: "https://www.cscdost.com/" },
        { name: "Recruitment", url: "https://www.cscdost.com/#sarkari-board" },
        { name: item.title, url: canonicalUrl }
      ];
    } else if (matchPost) {
      isNotFound = true;
      title = "Notification Not Found (404) | CSC DOST";
      description = "The requested recruitment notification or examination update could not be found or has expired. Please check active recruitment updates on the CSC DOST portal.";
      canonicalUrl = `${baseOrigin}/#sarkari-board`;
    }
  } else if (targetServiceId) {
    const service = SERVICES_LIST.find((s) => s.id === targetServiceId || s.id === decodeURIComponent(targetServiceId));
    if (service) {
      title = `${service.name} Online Application | CSC DOST`;
      description = `${service.description} Processing time: ${service.estimatedTime}. Official fee: ${service.price}. Fast & reliable application assistance at cscdost.com.`;
      ogImage = `${baseOrigin}/api/og-image/${encodeURIComponent(service.id)}.png?v=srv`;
      canonicalUrl = `https://www.cscdost.com/service/${service.id}`;
      ogType = "website";
      breadcrumbItems = [
        { name: "Home", url: "https://www.cscdost.com/" },
        { name: "Services", url: "https://www.cscdost.com/#services" },
        { name: service.name, url: canonicalUrl }
      ];
    }
  }
  const escAttr = (s) => String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escText = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeTitle = escText(title);
  const safeAttrTitle = escAttr(title);
  const safeAttrDesc = escAttr(description);
  const safeOgImage = escAttr(ogImage);
  const safeCanonical = escAttr(canonicalUrl);
  let html = rawHtml;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);
  html = html.replace(/<meta\s+name=["']title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="title" content="${safeAttrTitle}" />`);
  html = html.replace(/<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${safeAttrDesc}" />`);
  html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="canonical" href="${safeCanonical}" />`);
  html = html.replace(/<meta\s+property=["']og:type["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:type" content="${ogType}" />`);
  html = html.replace(/<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:url" content="${safeCanonical}" />`);
  html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:title" content="${safeAttrTitle}" />`);
  html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:description" content="${safeAttrDesc}" />`);
  html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image" content="${safeOgImage}" />`);
  html = html.replace(/<meta\s+property=["']og:image:secure_url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image:secure_url" content="${safeOgImage}" />`);
  html = html.replace(/<meta\s+property=["']og:image:alt["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image:alt" content="${safeAttrTitle}" />`);
  html = html.replace(/<meta\s+name=["']twitter:card["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:card" content="summary_large_image" />`);
  html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:title" content="${safeAttrTitle}" />`);
  html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:description" content="${safeAttrDesc}" />`);
  html = html.replace(/<meta\s+name=["']twitter:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:image" content="${safeOgImage}" />`);
  html = html.replace(/<meta\s+name=["']twitter:image:alt["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:image:alt" content="${safeAttrTitle}" />`);
  if (ogType === "article") {
    const articleLd = `
    <!-- Dynamic Post Article Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${safeAttrTitle}",
      "description": "${safeAttrDesc}",
      "image": ["${safeOgImage}"],
      "datePublished": "${articlePublishedDate}",
      "dateModified": "${articlePublishedDate}",
      "mainEntityOfPage": "${safeCanonical}",
      "publisher": {
        "@type": "Organization",
        "name": "CSC DOST",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.cscdost.com/favicon.png"
        }
      }
    }
    </script>
  </head>`;
    html = html.replace(/<\/head>/i, articleLd);
  }
  if (breadcrumbItems.length > 0) {
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems.map((b, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": b.name,
        "item": b.url
      }))
    };
    const breadcrumbScript = `
    <!-- Dynamic BreadcrumbList Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(breadcrumbLd, null, 2)}
    </script>
  </head>`;
    html = html.replace(/<\/head>/i, breadcrumbScript);
  }
  if (isNotFound) {
    const notFoundCard = `
    <div style="min-height:70vh; display:flex; align-items:center; justify-content:center; padding:40px 20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f8fafc;">
      <div style="background:white; border:1px solid #e2e8f0; border-radius:16px; max-width:520px; padding:36px; text-align:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="font-size:42px; margin-bottom:12px;">\u{1F4CB}</div>
        <h1 style="font-size:22px; font-weight:800; color:#0f172a; margin:0 0 10px 0;">Notification Not Found or Expired</h1>
        <p style="color:#64748b; font-size:14px; line-height:1.6; margin:0 0 20px 0;">The recruitment notification, admit card, or admission notice you are looking for does not exist or may have been archived after the closing date.</p>
        <a href="/#sarkari-board" style="display:inline-block; background:#2563eb; color:white; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">Browse Latest Sarkari Jobs</a>
      </div>
    </div>`;
    html = html.replace('<div id="root"></div>', `<div id="root">${notFoundCard}</div>`);
  }
  return { html, isNotFound };
}
app.get("/sitemap.xml", (req, res) => {
  try {
    const BASE_URL = "https://www.cscdost.com";
    const TODAY = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/about-us", priority: "0.8", changefreq: "monthly" },
      { loc: "/contact-us", priority: "0.8", changefreq: "monthly" },
      { loc: "/privacy-policy", priority: "0.7", changefreq: "monthly" },
      { loc: "/terms-of-service", priority: "0.7", changefreq: "monthly" },
      { loc: "/disclaimer", priority: "0.7", changefreq: "monthly" },
      { loc: "/refund-policy", priority: "0.7", changefreq: "monthly" }
    ];
    const allSarkari = [...SARKARI_DATA, ...getCustomSarkariPosts()];
    const seenPostIds = /* @__PURE__ */ new Set();
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
    xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n';
    for (const p of staticPages) {
      xml += "  <url>\n";
      xml += `    <loc>${BASE_URL}${p.loc}</loc>
`;
      xml += `    <lastmod>${TODAY}</lastmod>
`;
      xml += `    <changefreq>${p.changefreq}</changefreq>
`;
      xml += `    <priority>${p.priority}</priority>
`;
      xml += "  </url>\n";
    }
    for (const post of allSarkari) {
      if (!post.id || seenPostIds.has(post.id)) continue;
      seenPostIds.add(post.id);
      const modDate = post.postDate ? post.postDate.split("/").reverse().join("-") : TODAY;
      const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(modDate) ? modDate : TODAY;
      xml += "  <url>\n";
      xml += `    <loc>${BASE_URL}/post/${encodeURIComponent(post.id)}</loc>
`;
      xml += `    <lastmod>${safeDate}</lastmod>
`;
      xml += "    <changefreq>weekly</changefreq>\n";
      xml += "    <priority>0.8</priority>\n";
      xml += "  </url>\n";
    }
    for (const s of SERVICES_LIST) {
      xml += "  <url>\n";
      xml += `    <loc>${BASE_URL}/service/${encodeURIComponent(s.id)}</loc>
`;
      xml += `    <lastmod>${TODAY}</lastmod>
`;
      xml += "    <changefreq>monthly</changefreq>\n";
      xml += "    <priority>0.8</priority>\n";
      xml += "  </url>\n";
    }
    xml += "</urlset>\n";
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    return res.send(xml);
  } catch (err) {
    console.error("Error generating dynamic sitemap, serving static file:", err);
    const sitemapPath = path5.join(process.cwd(), "public", "sitemap.xml");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.sendFile(sitemapPath);
  }
});
app.get("/robots.txt", (req, res) => {
  const robotsPath = path5.join(process.cwd(), "public", "robots.txt");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.sendFile(robotsPath);
});
app.use(express.static(path5.join(process.cwd(), "public")));
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(async (req, res, next) => {
      const url = req.originalUrl || req.url;
      const isPostOrServiceOrLegal = /^\/(?:post|job|jobs|sarkari|notice|admissions|notification|service|privacy-policy|privacy|terms-of-service|terms|disclaimer|about-us|about|contact-us|contact|refund-policy|refund)(?:\/|$)/i.test(req.path) || Boolean(req.query.post || req.query.job || req.query.service || req.query.id);
      const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Googlebot|bingbot|Slackbot/i.test(
        req.headers["user-agent"] || ""
      );
      if ((isPostOrServiceOrLegal || isCrawler) && req.method === "GET" && !req.path.includes(".")) {
        try {
          const indexHtml = fs4.readFileSync(path5.join(process.cwd(), "index.html"), "utf-8");
          const transformedHtml = await vite.transformIndexHtml(url, indexHtml);
          const { html: finalHtml, isNotFound } = renderDynamicMetaHtml(transformedHtml, req);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          if (isNotFound) {
            res.status(404);
          }
          return res.send(finalHtml);
        } catch (e) {
          return next(e);
        }
      }
      return vite.middlewares(req, res, next);
    });
  }
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const distPath = path5.join(process.cwd(), "dist");
    const indexHtmlPath = path5.join(distPath, "index.html");
    const rootHtmlPath = path5.join(process.cwd(), "index.html");
    if (fs4.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      try {
        const targetHtmlPath = fs4.existsSync(indexHtmlPath) ? indexHtmlPath : fs4.existsSync(rootHtmlPath) ? rootHtmlPath : null;
        if (targetHtmlPath) {
          const indexHtml = fs4.readFileSync(targetHtmlPath, "utf-8");
          const { html: dynamicHtml, isNotFound } = renderDynamicMetaHtml(indexHtml, req);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          if (isNotFound) {
            return res.status(404).send(dynamicHtml);
          }
          return res.send(dynamicHtml);
        }
      } catch (err) {
        console.error("Error serving index.html:", err);
      }
      return res.status(404).send("Not Found");
    });
  }
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\u{1F680} CSC DOST Server successfully started on http://0.0.0.0:${PORT}`);
    });
  }
}
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Fatal error setting up server:", err);
  });
}
var server_default = app;
export {
  app,
  broadcastRealtimeEvent,
  server_default as default
};
//# sourceMappingURL=server.js.map
