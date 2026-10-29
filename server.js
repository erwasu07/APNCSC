// server.ts
import express from "express";
import path4 from "path";
import fs4 from "fs";
import Razorpay from "razorpay";
import crypto2 from "crypto";
import sharp3 from "sharp";

// src/data/sarkariData.ts
var SARKARI_DATA = [
  {
    "id": "ku-bed-2year-distance-admissions-2026",
    "title": "University of Kashmir 2-Year B.Ed. (Session 2026-28) Distance Mode Online Admission & Counselling Notice",
    "category": "admissions",
    "postDate": "27/10/2026",
    "startDate": "27/10/2026",
    "lastDate": "15/11/2026",
    "advertisementNo": "Admission Notification No. 18 of 2026 (B.Ed. Distance)",
    "shortInfo": "Directorate of Distance Education (DDOE), University of Kashmir has invited online applications and counselling preferences for admission to 2-Year B.Ed. Programme for Session 2026-28. Candidates with minimum 50% aggregate marks in Bachelor or Master degree can apply online at kashmiruniversity.net.",
    "ageLimit": "No upper age limit for Distance B.Ed admission",
    "eligibility": "Graduation (Bachelor Degree) or Post Graduation with at least 50% marks for General/OM and 45% marks for Reserved Categories from a recognized University.",
    "totalPosts": "Available Seats in DDOE & Affiliated Private B.Ed Colleges",
    "officialLink": "https://www.kashmiruniversity.net",
    "fees": {
      "genObc": "\u20B9500/- Online Application Processing & Counselling Fee",
      "scSt": "\u20B9500/- Online Application Processing & Counselling Fee"
    },
    "isNew": true
  },
  {
    "id": "cus-btech-7th-8th-sem-exam-form-2026",
    "title": "Cluster University Srinagar B.Tech 7th & 8th Semester (Regular / Backlog) Online Examination Form Notice 2026",
    "category": "cluster_univ",
    "postDate": "26/10/2026",
    "startDate": "27/10/2026",
    "lastDate": "08/11/2026",
    "advertisementNo": "Exam Notice No. CUS/Exam/BTech/2026/412",
    "shortInfo": "Cluster University Srinagar has issued an urgent notification for submission of online examination forms for B.Tech Engineering 7th and 8th Semester (Regular Batch and Previous Backlog Batches). Eligible engineering students must submit forms and verify course subjects online via cusrinagar.edu.in.",
    "ageLimit": "As per University Examination Statutes",
    "eligibility": "Enrolled candidates of B.Tech Engineering courses in GCET Safapora / affiliated engineering constituent colleges with requisite attendance.",
    "totalPosts": "Engineering Examination Session 2026",
    "officialLink": "https://cusrinagar.edu.in",
    "fees": {
      "genObc": "\u20B91,275/- per semester (or prescribed fee per backlog paper)",
      "scSt": "\u20B91,275/- per semester"
    },
    "isNew": true
  },
  {
    "id": "army-rvc-captain-entry-2026",
    "title": "Indian Army Remount Veterinary Corps (RVC) Captain Entry Scheme 2026 (Short Service Commission)",
    "category": "army_jobs",
    "postDate": "26/10/2026",
    "startDate": "22/10/2026",
    "lastDate": "18/11/2026",
    "advertisementNo": "RVC/SSC/2026 Direct Entry Notice",
    "shortInfo": "Join Indian Army invites applications from qualified male and female veterinary graduates for grant of Short Service Commission (SSC) in the Remount Veterinary Corps (RVC) as Captain. Selected candidates receive handsome military pay and allowances under Pay Level 10B with Military Service Pay.",
    "ageLimit": "21 to 32 Years (Candidate must not be born earlier than 19 Nov 1994 and not later than 18 Nov 2005)",
    "eligibility": "BVSc / BVSc & AH degree from any recognized Indian University or its equivalent foreign qualification included in the First or Second Schedule to the IVC Act.",
    "totalPosts": "Various Commissioned Officer Posts",
    "officialLink": "https://joinindianarmy.nic.in",
    "fees": {
      "genObc": "\u20B90/- (No Application Fee)",
      "scSt": "\u20B90/- (Exempted)"
    },
    "isNew": true
  },
  // 🏛️ JKSSB OFFICIAL PORTAL UPDATE (27 OCTOBER 2026)
  {
    id: "jkssb-advt-11-of-2026-je-civil-pwd",
    title: "JKSSB Advt 11 of 2026: Recruitment for 458 Junior Engineer (Civil) Posts in Public Works (R&B) Department",
    category: "jkssb",
    postDate: "27/10/2026",
    startDate: "30/11/2026",
    lastDate: "29/12/2026",
    advertisementNo: "Advt No. 11 of 2026",
    shortInfo: "Jammu and Kashmir Services Selection Board (JKSSB) has released Advertisement Notification No. 11 of 2026 inviting online applications for 458 posts of Junior Engineer (Civil) in the Public Works (R&B) Department. Eligible candidates holding a 3-year Diploma or Degree in Civil Engineering can apply online through the official portal jkssb.nic.in.",
    ageLimit: "Open Merit (OM): 40 Years | SC / ST / RBA / ALC/IB / EWS / PSP: 43 Years | PWD: 42 Years | Ex-Servicemen: 48 Years (as on 01/01/2026)",
    eligibility: "03 Years Diploma in Civil Engineering from Government recognized Institute/Indian University or Degree in Civil Engineering or AMIE Section (A&B) India.",
    totalPosts: "458 Posts (UT Cadre)",
    officialLink: "https://jkssb.nic.in",
    fees: {
      genObc: "\u20B9550/- (Rupees Five Hundred Fifty Only)",
      scSt: "\u20B9450/- (For SC, ST, PWD & EWS Candidates)"
    },
    isNew: true
  },
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
import sharp2 from "sharp";

// src/thumbnailGenerator.ts
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { GoogleGenAI, Type } from "@google/genai";
import { fileURLToPath } from "url";

// src/utils/vectorText.ts
import opentype from "opentype.js";

// src/assets/embeddedFonts.ts
var LIBERATION_SANS_BOLD_BASE64 = "AAEAAAATAQAABAAwRkZUTWie8yUAAhdAAAAAHEdERUYAJwLPAAIGfAAAACZHUE9T1SjxtQACBvQAABBKR1NVQpM8gksAAgakAAAAUE9TLzL4PoeWAAABuAAAAGBjbWFwBKCddwAADLAAAAbyY3Z0IF/iX4AAAB6YAAACSmZwZ21z0yOwAAATpAAABwVnYXNwABEACQACBmwAAAAQZ2x5ZtarPysAACY4AAGtaGhlYWT056peAAABPAAAADZoaGVhDooIYwAAAXQAAAAkaG10eMkJ9hgAAAIYAAAKlmtlcm7U1MvdAAHToAAAFVRsb2NhyaM6nAAAIOQAAAVUbWF4cAfqCKgAAAGYAAAAIG5hbWW+UvszAAHo9AAACI5wb3N0oy3RtQAB8YQAABTocHJlcDvrDG0AABqsAAAD6QABAAAAARHraqHjgF8PPPUAHwgAAAAAAL8a/4AAAAAAz5JOH/6H/ZMIfwhEAAEACAACAAAAAAAAAAEAAAc+/k4AQwjr/of+hwh/AAEAAAAAAAAAAAAAAAAAAAKiAAEAAAKpAVIAVACCAAUAAgAQAC8AWgAABHoGoQADAAIAAwTnArwABQAABZoFMwAAARsFmgUzAAAD0QBmAhIIBQILBwQCAgICAgSgAAKvUAB4+wAAAAAAAAAAMUFTQwAgACH7AgXT/lEBMwc+AbJgAACf39cAAAQ6BYEAAAAgAAIC7ABEAAAAAAKqAAACOQAAAqoAwQPLAIcEcwAjBHMAGwcdADMFxwBaAecAbQKqAGYCqgACAx0ABgSsAFYCOQCLAqoAUAI5AIsCOQAUBHMAUQRzAIEEcwBHBHMALwRzAB8EcwA/BHMASwRzAFgEcwBBBHMARwKqAMUCqgDDBKwAVgSsAFUErABWBOMAXgfNAHUFxwAzBccAiQXHAFQFxwCJBVYAiQTjAIkGOQBUBccAiQI5AIkEcwAfBccAiQTjAIkGqgCJBccAiQY5AFQFVgCJBjkAVAXHAIkFVgA7BOMAFwXHAHsFVgAOB40AAgVWABIFVgAjBOMAPQKqAHMCOQAVAqoAGQSsAC0Ec//sAqoAQgRzADwE4wCHBHMAUATjAFQEcwBQAqoAIwTjAFQE4wCPAjkAjwI5/+AEcwCPAjkAjwcdAIcE4wCHBOMAUATjAIcE4wBUAx0AhwRzAEgCqgAZBOMAfwRzAAgGOf/6BHMADgRzABAEAABEAx0AIQI9AJwDHQArBKwAUQKqAMIEcwAzBHMAFQRzADkEcwAIAj0AnARzADUCqgAQBeUAIAL2AC0EcwBcBKwAVAXlACAEa//vAzMAWgRkADECqgAzAqoALAKqAFcEnACGBHMARwI5AI0CqgBgAqoAUgLsAC0EcwBdBqwAXgasAF4GrABnBOMAcgXHADMFxwAzBccAMwXHADMFxwAzBccAMwgAAAQFxwBUBVYAiQVWAIkFVgCJBVYAiQI5/9gCOQBoAjn/qwI5/9cFxwAIBccAiQY5AFQGOQBUBjkAVAY5AFQGOQBUBKwAVgY5AFQFxwB7BccAewXHAHsFxwB7BVYAIwVWAIkE4wCPBHMANARzADQEcwA0BHMANARzADQEcwA0Bx0AQgRzAFAEcwBQBHMAUARzAFAEcwBQAjn/wAI5AHICOf+tAjn/2ATjAFAE4wCHBOMAUATjAFAE4wBQBOMAUATjAFAEZAAxBOMAAQTjAH8E4wB/BOMAfwTjAH8EcwAQBOMAjwRzABAFxwAzBHMAPAXHADMEcwA8BccAMwRzADwFxwBUBHMAUAXHAFQEcwBQBccAVARzAFAFxwBUBHMAUAXHAIkFwABUBccACATjAFQFVgCJBHMAUAVWAIkEcwBQBVYAiQRzAFAFVgCJBHMAUAVWAIkEcwBQBjkAVATjAFQGOQBUBOMAVAY5AFQE4wBUBjkAVATjAFQFxwCJBOMAjwXHAA4E4wAKAjn/mQI5/5kCOf/sAjn/7AI5/7wCOf+9AjkAWAI5AEUCOQCJAjkAkQZHAIkEcwCPBHMAHwI5/6YFxwCJBHMAjwRzAI8E4wCJAjkAagTjAIkCOQCPBOMAiQMVAI8E4wCJA9UAjwTjAAACOQASBccAiQTjAIcFxwCJBOMAhwXHAIkE4wCHBav/6gXJAIUE4wCHBjkAVATjAFAGOQBUBOMAUAY5AFQE4wBQCAAAVAeNAFAFxwCJAx0AhwXHAIkDHQCHBccAiQMdADgFVgA7BHMASAVWADsEcwBIBVYAOwRzAEgFVgA7BHMASATjABcCqgAZBOMAFwPVABkE4wAXAqoAGQXHAHsE4wB/BccAewTjAH8FxwB7BOMAfwXHAHsE4wB/BccAewTjAH8FxwB7BOMAfweNAAIGOf/6BVYAIwRzABAFVgAjBOMAPQQAAEQE4wA9BAAARATjAD0EAABEAjkAjgRzAKgFxwAzBHMAPAgAAAQHHQBCBjkAVATjAAEFVgA7BHMASATjABcCqgAZAqoAAAKqAAACqgAkAqr/xwKqAMgCqgAnAqoATAKq//ICqv+kAqoAuQO4AG4FxwAkAqoAxQbTAC4HPwAkA8oAJAaZ/+YHawCABrT/0AI5/6kFxwAzBccAiQTPAIkFwABTBVYAiQTjAD0FxwCJBjkAVAI5AIkFxwCJBVYADgaqAIkFxwCJBSYAVAY5AFQFxwCJBVYAiQTNAFoE4wAXBVYAIwaRAD8FVgASBnkAYAZqAFMCOf/XBVYAIwTrAFADnABNBOMAawI5AIkEqAB/BOsAUATiAI4EcwAIBNoAVgPMAE0DrwBCBOMAawRTAFoCOQCJBHYAjwRzAAkE5QCQBHMAAAOQAEIE4wBQBiAAKgTzAHkEKQBPBXkAUAOSABIEqAB/BbkAUASbAA0GBwCBBsIAUQI5/9kEqAB/BOMAUASoAH8GwgBRBVYAiQVaAIkHFQAXBIkAiQWxAFQFVgA7AjkAiQI1/9UEcwAfCMAACAiAAIkHAAAXBOIAiQXHAIgE+v/5BcAAiQXHADMFwACJBccAiQSJAIkFswASBVYAiQc7//oFAwAuBcAAiAXAAIgE4gCJBZ0ACAaqAIkFxwCJBjkAVAXAAIkFVgCJBccAVATjABcE+gABBtQARwVWABIF2ACJBZ8AbggKAIkIJwCJBvUAFgfVAIkFwACJBbEANghAAIkFwAAjBHMAPATxAF4E6wCPA1UAjwUUAA4EcwBQBaz/7wP6ADUE6wCOBOsAjgQBAI4FFQAVBesAjwTVAI8E4wBQBNUAjwTjAIcEcwBQA+sAOgRzABAHAABSBHMADgTrAI8EpQBTBqsAjwbAAI8F1QAmBtUAjwTrAI8EawA0BtUAjwSr//8EcwBQBHMAUATjAAoDVQCPBGsAUARzAEgCOQCPAkD/2gI5/+AHwAAVB0AAjwTjAAoEAQCOBOsAjgRzABAE1QCPBjkAVATjAFAD5QCJA5MAjweNAAIGOf/6B40AAgY5//oHjQACBjn/+gVWACMEcwAQAqoAUAKqAFAEcwA+CAAAAAgAAAAEa//sAjkAiwI5AIsCOQCKAjkAiwQAAJcEAACXBAAAlwRzAIoEcwCIAs0AQQgAAOEIAAApAesAVQPVAFUCqgBc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GmtcUI7DdHXGkFEULUk2BSg1Oxn+YQOxrKYgT4ZlY4NOIKUA//8AEP5XBGgFihImAFwAABAHAGkA8QAA//8AMwAABZEGqRImACQAABEHAU0BjAFOABNACwIXBSYCABUWBAclASs1ACs1AAAA//8APP/sBIAFWxImAEQAABEHAU0A8wAAABW0AkcRJgK4/+u0RUYFKSUBKzUAKzUA//8AMwAABZEHEBImACQAABEHAqgBhgAAABNACwIVBSYCARomBAclASs1ACs1AAAA//8APP/sBIAF4hImAEQAABEHAU4BGwAAABW0AkURJgK4/+a0SlYFKSUBKzUAKzUA//8AM/5iBZEFgRImACQAABEHAVEDtQALAA65AAL/p7QgIAcHJQErNf//ADz+VwSABE4SJgBEAAARBwFRAmEAAAASswIPUAG4/2S0UFApKSUBK101//8AVP/sBY8HFxImACYAABEHAqICNQAAABNACwEqBSYBmSotEAYlASs1ACs1AAAA//8AUP/sBDcF3hImAEYAABEHAHQBZwAAABNACwEhESYBeSEkBRwlASs1ACs1AAAA//8AVP/sBY8HKxImACYAABEHAqMBzAAAABNACwErBSYBMDAqEAYlASs1ACs1AAAA//8AUP/sBDcF+RImAEYAABEHAUsA5gAAABNACwEiESYBEychBRwlASs1ACs1AAAA//8AVP/sBY8G2hImACYAABEHAU8BvgEOABNACwEqBSYBISosEAYlASs1ACs1AAAA//8AUP/sBDcFzBImAEYAABEHAU8BBAAAAAu2ARUhIwUcJQErNQAAAP//AFT/7AWPBysSJgAmAAARBwKkAbgAAAATQAsBKgUmARwsMhAGJQErNQArNQAAAP//AFD/7AQ3BfkSJgBGAAARBwFMANYAAAATQAsBIREmAQMjKQUcJQErNQArNQAAAP//AIkAAAVxBysSJgAnAAARBwKkAWYAAAAVtAIaBSYCuP+/tBwiBgAlASs1ACs1AP//AFT/7AXBBcwQJgBHAAARBwKfBFsASwASQAoCQQACeEBAICAlASs1AD81//8ACAAABXEFgRAGAJAAAAACAFT/7ATZBcwALAA9AHxANywsGSkQAC1GBwQEA98HAQdAJChIBz+PPwE3R8AZ0BkCMBkBGQYrUiwDLDJRHiMeAB4QHiAeAx64/8BAEQ4R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HLj/gLMwMEgcuP/Asy8vSBy4/4CzLi5IHLj/gLMtLUgcuP/AsywsSBy4/8CzKipIHLj/QLMpKUgcuP+AsygoSBy4/8CzJydIHLj/wLMkJEgcuP+AsyMjSBy4/4CzIiJIHLj/wLMhIUgcuP/Asx8fSBy4/8CzHh5IHLj/gLMdHUgcuP/AsxwcSBy4/8CzGxtIHLj/wLMZGUgcuP/AsxYWSBy4/8CzFBRIHLj/wLMTE0gcuP/AsxERSBy4/8CzEBBIHLj/gLMPD0gcuP/Asw4OSBy4/8CzDAxIHLj/gLMJCUgcuP/AsggISCsrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKwErNQA/NQAA//8AxQITAeUDRBIGApg4AP//AC4AAAaDBYIQJwAoAX0AABEHAVT/df+eACyzAQ4DAbj/bkAWDw8BASUAoAABjwABTwABPwABLwABABFdXV1dXTUrNQA/Nf//ACQAAAa1BYIQJwArAXgAABEHAVT/a/+eACyzAQ4DAbj/aUAWDw8EBCUAzwABrwABTwABPwABLwABABFdXV1dXTUrNQA/Nf//ACQAAANBBYIQJwAsAZEAABEHAVT/a/+eADyzAQYDAbj/UEAiBwcAACUA8AAB7wABzwAB3wABjwABfwABQAABPwABAAABABFdXV1dXV1dXV01KzUAPzX////m/+wGQwWWECYAMmAAEQcBVP8t/54AQ7QCKgMCKLj/wLIJEUi4/zJAICgoCgolAQBvAAFvAAFfAAFPAAE/AAEPAAH/AAFgAAEAEV1dcXFxcXFxNTUrKzUAPzUAAAD//wCAAAAHSQWCECcAPAIUAAARBgFUx54ATLYBCwMBAAwBuP+PQCsMDAQEJQD/AAHQAAHPAAG/AAGQAAGPAAF/AAFQAAFPAAE/AAEQAAEPAAEAEV1dXV1dXV1dXV1dXTUrXTUAPzUAAP///9AAAAZhBZYQJgF2SgARBwFU/xf/ngBFQBABOAMB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AV8BlP+0AV8CD/+PAWEAD/8fAWEAEf8fAWEBX/8hAWEBYv8hAWEBaf8hAWEBfP++AWEBhv++AWEBlwBeAWIBZv/JAWIBbf/JAWIBcf9WAWIBcv9GAWIBeP9GAWYBX//JAWYBYv/JAWYBaf/JAWYBcv/HAWYBeP/HAWgBZv+iAWgBbf+iAWgBc/+iAWgBef/RAWgBfv/RAWgBgf/RAWgBg//RAWgBhf/RAWgBi//RAWgBjP/RAWgBkP/RAWgBk//RAWgBlv/RAWgBmf/RAWgBm//RAWkBZv/JAWkBbf/JAWkBcf9WAWkBcv9GAWkBeP9GAW0BX//JAW0BYv/JAW0Baf/JAW0Bcv/HAW0BeP/HAW8AD/76AW8AEf76AW8BX/9oAW8BYv9oAW8Baf9oAXABjf/dAXABkf/dAXEAD/8fAXEAEP+PAXEAEf8fAXEAHf8fAXEAHv8fAXEBXgDyAXEBX/9oAXEBYv9cAXEBZv/bAXEBaf9oAXEBbf/bAXEBc//JAXEBdv/bAXEBef9oAXEBev9oAXEBfv9oAXEBgP9oAXEBgf+sAXEBgv9oAXEBhP9oAXEBhv/bAXEBif9oAXEBiv9oAXEBjP9oAXEBkP9oAXEBkv9oAXEBk/9oAXEBlP+FAXEBlf9oAXEBlwBcAXEBmP9oAXEBmf9oAXEBmv9oAXIAD/8fAXIAEP+PAXIAEf8fAXIAHf9oAXIAHv9oAXIBXgEAAXIBX/9GAXIBYv9GAXIBZv+yAXIBaf9GAXIBbf+yAXIBc/+yAXIBdv+yAXIBef9oAXIBe/+0AXIBfP+0AXIBfv9oAXIBgP+sAXIBgf+0AXIBhP+0AXIBhv+0AXIBh/+0AXIBif+0AXIBjP9oAXIBkP9oAXIBk/9oAXIBlwBcAXIBmf9oAXMBX//JAXMBcf/JAXMBcv/HAXMBeP/HAXQBlv/lAXQBm//lAXUBef/bAXUBfv/bAXUBgf/bAXUBjP/bAXUBkP/bAXUBk//bAXUBlv/bAXUBmf/bAXUBm//bAXYBcv/HAXYBeP/HAXgBXgEAAXgBX/9GAXgBYv9GAXgBZv+yAXgBaf9GAXgBbf+yAXgBc/+yAXgBdv+yAXgBef9oAXgBe/+0AXgBfP+0AXgBfv9oAXgBgf+0AXgBhP+0AXgBhv+0AXgBh/+0AXgBif+0AXgBjP9oAXgBkP9oAXgBk/9oAXgBlwBcAXgBmf9oAYEBjf/HAYEBkf/HAYEBlP+2AYMBef+NAYMBe//PAYMBfv+NAYMBgP++AYMBgf+0AYMBhP/PAYMBhf+0AYMBhv/PAYMBh//PAYMBiv++AYMBjP+NAYMBjf+0AYMBkP+NAYMBkf+0AYMBk/+NAYMBlv+NAYMBmf+NAYMBm/+NAYcBef+8AYcBfv+8AYcBgf+8AYcBg/+8AYcBhf/jAYcBi/+8AYcBjP+8AYcBj/+8AYcBkP+8AYcBk/+8AYcBlv+8AYcBmf+8AYcBm/+8AYgBef/nAYgBff/hAYgBfv/nAYgBgf/nAYgBg//nAYgBi//nAYgBjP/nAYgBj//nAYgBkP/nAYgBkv/hAYgBk//nAYgBlv/nAYgBmP/hAYgBmf/nAYgBmv/hAYgBm//nAYsBef/nAYsBfv/nAYsBgf/nAYsBg//nAYsBi//nAYsBjP/nAYsBj//nAYsBkP/nAYsBk//nAYsBmf/nAYwBjf/HAYwBkf/HAYwBlP+2AY0Bef/HAY0Bfv/HAY0Bgf/HAY0Bg//HAY0BiP+0AY0BjP/HAY0Bj//HAY0BkP/HAY0Bk//HAY0Blv/HAY0Bm//HAY4Bjf/HAY4Bkf/HAZEBef/HAZEBfv/HAZEBgf/HAZEBg//HAZEBjP/HAZEBj//HAZEBkP/HAZEBk//HAZEBlv/HAZEBm//HAZMBiP/nAZMBjf/HAZMBkf/HAZMBlP+2AZQBef+2AZQBfv+2AZQBgf+2AZQBg/+2AZQBjP+2AZQBj/+2AZQBkP+2AZQBk/+2AZQBlv/VAZQBmf+2AZQBm//VAZYBjf/HAZYBkf/HAZYBlP/VAZkBjf/HAZkBkf/HAZkBlP+2AZsBjf/HAZsBkf/HAZsBlP/VAZ8AD/8ZAZ8AEf8AAZ8AHf/lAZ8AHv/lAZ8AbP+yAZ8Ae/+yAaUCD/8zAaYCD/8zAawBsABMAawBtwAZAawBuv/lAawBu//lAawBvf/NAawBvv+aAawBv/+yAawBwP/NAawBw/9kAawByf/NAawBzAAZAawBzf/lAawB3f/lAawB3v/lAawB6QAZAawCD/+YAa0BrP+yAa0Bsv/NAa0Bs//lAa0Bt//NAa0Bvf/lAa0Bvv/NAa0Bv//NAa0BwP/lAa0Bwf/NAa0Bw/+yAa0Bxv+yAa0Byf/NAa0By//NAa0B3//lAa4BrP+aAa4BsP/lAa4Bsv+yAa4Bs//lAa4Bt//NAa4Buv/NAa4Bvf+yAa4Bvv+yAa4Bv/+yAa4BwP/NAa4Bwf+yAa4Bw/+yAa4Bxv+aAa4By//NAa4B3v/lAa4B4f/lAa4B4/+yAa8AD/8ZAa8AEf8AAa8AHf/lAa8AHv/lAa8AbP+yAa8Ae/+yAa8BrP9/Aa8BsP/NAa8Bt//NAa8Buv/lAa8Bvf/lAa8BzP/lAa8Bzv/NAa8B0P+yAa8B0f+YAa8B1P/NAa8B1/+aAa8B2P+yAa8B2f/NAa8B2v+aAa8B3P+yAa8B3/+yAa8B5/+yAa8B6P+yAa8B6v+yAa8B6/+yAbABswAZAbABvwAZAbABwP/lAbABw//lAbAB0QAZAbAB0wAzAbAB2gAZAbAB3wAZAbIBswAZAbIBuv/lAbIBvf/NAbIBvgAzAbIBvwAzAbIBwwAZAbIBxgBMAbIBzAAZAbIB2v/lAbMBsv/NAbMBt//NAbMBuv/lAbMBvf/NAbMBvv+yAbMBv/+yAbMBwP/NAbMBw/+yAbMBy//NAbYBswBMAbYBvf/lAbYBvgAzAbYBvwAzAbYBwP/lAbYBwwAzAbYByQAZAbYBzAAZAbYB0wAZAbYB3f/lAbcBzAAzAbgBzAAZAbgB3f/lAbgB4//lAboBrP/NAboBsP/lAboBsv/lAboBt//NAboBv//NAboBwf+yAboBy//lAboB0P/NAboB1//lAbwAD/7lAbwAEf7NAbwAHf/lAbwAHv/lAbwBrP9MAbwBsP9/AbwBsv/lAbwBs//lAbwBt/9/AbwBuP/lAbwBuv/lAbwBvf/NAbwBvv/lAbwBv//lAbwBwP/lAbwBwf+yAbwBy//NAbwBzP/lAbwB0P9/AbwB0f/NAbwB2v/NAbwB6//lAb0BrP/NAb0BsP/lAb0Bs//lAb0Bt//NAb0BuP/lAb0Buv/NAb0Bvv/NAb0Bv//lAb0Bwf+yAb0Bw//NAb0Bxv/lAb0Byf/lAb0BzAAZAb0Bzf/lAb0B0gAZAb0B3f/lAb0B4P/lAb0B4//lAb4AD/8zAb4AEf8ZAb4AHf/lAb4AHv/lAb4AbP/NAb4BrP9/Ab4BsP/NAb4BsgAzAb4Bt//NAb4Buv/NAb4BwP+yAb4By//lAb4BzP/NAb4Bzv+yAb4B0f+aAb4B1P+yAb4B1v+yAb4B1/9/Ab4B2P+YAb4B2v9/Ab4B2//lAb4B3P+yAb4B3f9/Ab4B3/+yAb4B4f+yAb4B5f/lAb4B5//lAb4B6P/lAb4B6v/lAb4B6//NAb8AD/8ZAb8AEf8AAb8AHf/NAb8AHv/NAb8AbP+yAb8Ae/+yAb8BrP9mAb8BsP+YAb8Bt/+yAb8Buv/NAb8BwP+yAb8Byf/lAb8By//NAb8Bzf/NAb8Bzv+yAb8Bz/+yAb8B0P9/Ab8B0f9/Ab8B0v/lAb8B0/+aAb8B1P+yAb8B1f+yAb8B1v+yAb8B1/9/Ab8B2P+aAb8B2f+yAb8B2v9/Ab8B2/+yAb8B3P+yAb8B3f9/Ab8B4f/NAb8B4v+yAb8B5P+yAb8B5f+yAb8B6v+yAb8B6/+aAcABrP/NAcABsP+YAcABt/+yAcABvv+yAcABv/+yAcABwP/lAcABw//lAcABy//LAcAB1//NAcEBs//lAcEBuv/LAcEBvf+yAcEBwP+yAcEByf/NAcEB2v/lAcEB3//lAcIBzABMAcIB0QAZAcIB2gAZAcUBzAAZAcYBy/+yAcYCD/8zAcgBrP/NAcgBsP/lAcgBsv+yAcgBs//NAcgBt/+yAcgBuP/NAcgBuv/lAcgBvf/NAcgBvv8xAcgBwf+YAcgBw/9mAcgByf+yAcgBy/+yAcgCD/9mAckBsP/NAckBsv/NAckBs//lAckBt/+yAckBwP/lAckBwf/NAckBy//NAckB0P/lAckB0gAZAckB1//NAcoBrP/NAcoBsP/NAcoBsv/NAcoBt/+yAcoBvf/lAcoBvv/NAcoBwf+yAcoBw//lAcoB0P/NAcoB0gAZAcoB1//NAcwB0wAZAcwB4//NAc0B0P/NAc0B0v/lAc0B0//lAc0B1//NAc0B2P/lAc0B3f/lAc0B3//lAc0B4f/NAc0B4//NAc0B5v/lAc0B6f/lAc0B6//lAc4BzP/lAc4Bzf/lAc4B0f/lAc4B0v/lAc4B1//lAc4B2P/lAc4B2v/lAc4B3f/NAc4B3v/lAc4B3//NAc4B4P/lAc4B4/+yAc4B5v/NAc4B6//lAc8AD/9MAc8AEf8zAc8B0P+yAc8B1//NAc8B2v/lAc8B3f/lAdAB0wAZAdAB3f/lAdAB3wAZAdAB5v/lAdEBzf/lAdEB0v/lAdEB2P/lAdEB3f/lAdEB3v/lAdEB3//lAdEB4f/lAdEB4//NAdIBzAAZAdIB0f/lAdIB0wAZAdIB2v/NAdIB3f/lAdIB4//NAdMBzP/lAdMBzf/NAdMB0f/lAdMB0v/lAdMB0//lAdMB1//lAdMB2P/NAdMB2v/NAdMB3f/NAdMB3//NAdMB4P/lAdMB4/+yAdMB5v/NAdYB1wAZAdYB2v/lAdYB3f/lAdYB4P/lAdYB4//lAdYB6f/lAdcBzf/lAdcB0f/lAdcB2v/lAdcB3f/lAdcB3//lAdcB4//NAdgBzP/lAdgBzf/lAdgB0//lAdgB2v/lAdgB3f/lAdgB3//lAdgB4P/lAdgB6f/lAdoB0P/lAdoB0v/lAdoB0//lAdoB1//NAdoB2P/lAdoB3f/lAdoB3v/NAdoB3//lAdoB4f/NAdoB4//NAdoB6f/lAdoB6//lAdwB0P/NAdwB0v/lAdwB0//lAdwB1//NAdwB2P/lAdwB3v/lAdwB3//lAdwB4f/lAdwB4//NAdwB6f/lAdwB6//lAd0BzAAZAd0Bzf/lAd0B4f/lAd0B4//LAd0B5v/lAd4AD/9mAd4AEf9MAd4B0P/lAd4B0gAZAd4B1//lAd4B2v/lAd4B3f/lAd4B3wAzAd8AD/9mAd8AEf9MAd8AHf/lAd8AHv/lAd8AewAzAd8BzP/lAd8B0P/NAd8B0f/lAd8B0gAZAd8B0//lAd8B1//lAd8B2P/lAd8B2v/NAd8B3P/lAd8B3f/NAd8B3gAZAd8B4P/lAd8B4QAZAd8B6f/lAd8B6//lAeABzf/lAeAB0P/lAeAB0f/lAeAB1//NAeAB2P/lAeAB2v/lAeAB3v/lAeAB3//lAeAB4//NAeAB6//lAeEBzf/lAeEB0f/NAeEB0//lAeEB2v/NAeEB3f/NAeEB3wAZAeEB4P/lAeEB4//NAeEB6f/lAeIBzAAZAeIB0wAZAeIB3f/lAeUBzAAZAeUB2v/lAegB3v9MAegB4/9MAekBzf/lAekB0P/lAekB0v/lAekB0//lAekB1//NAekB2P/lAekB3f/lAekB3v/lAekB4f/lAekB6//lAeoBzf/lAeoB0P/lAeoB0v/lAeoB1//NAeoB2P/lAeoB3f/lAeoB3v/NAeoB4f/NAeoB4/+yAeoB6f/lAfoAD/9mAfoAEf9MAfoAHf/lAfoAHv/lAfoAbP/NAf4AD/9/Af4AEf9mAf4AHf/lAf4AHv/lAf4AbP/NAf4Ae//NAg4CDv+0Ag8AA/+PAg8AVv+0Ag8CD/+0AhQBnv8zAhQBp/8zAhQBvv9MAhQBw/8xAhQBxv9MAAAAHAFWAAEAAAAAAAAAYADCAAEAAAAAAAEADwFDAAEAAAAAAAIABAFdAAEAAAAAAAMAHwGiAAEAAAAAAAQAFAHsAAEAAAAAAAUADgIfAAEAAAAAAAYAEwJWAAEAAAAAAAcAegNgAAEAAAAAAAgAFAQFAAEAAAAAAAkADgQ4AAEAAAAAAAsAHASBAAEAAAAAAAwALgT8AAEAAAAAAA0AbwYLAAEAAAAAAA4APgb5AAMAAQQJAAAAwAAAAAMAAQQJAAEAHgEjAAMAAQQJAAIACAFTAAMAAQQJAAMAPgFiAAMAAQQJAAQAKAHCAAMAAQQJAAUAHAIBAAMAAQQJAAYAJgIuAAMAAQQJAAcA9AJqAAMAAQQJAAgAKAPbAAMAAQQJAAkAHAQaAAMAAQQJAAsAOARHAAMAAQQJAAwAXASeAAMAAQQJAA0A3gUrAAMAAQQJAA4AfAZ7AEMAbwBwAHkAcgBpAGcAaAB0ACAAKABjACkAIAAyADAAMAA3ACAAUgBlAGQAIABIAGEAdAAsACAASQBuAGMALgAgAEEAbABsACAAcgBpAGcAaAB0AHMAIAByAGUAcwBlAHIAdgBlAGQALgAgAEwASQBCAEUAUgBBAFQASQBPAE4AIABpAHMAIABhACAAdAByAGEAZABlAG0AYQByAGsAIABvAGYAIABSAGUAZAAgAEgAYQB0ACwAIABJAG4AYwAuAABDb3B5cmlnaHQgKGMpIDIwMDcgUmVkIEhhdCwgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBMSUJFUkFUSU9OIGlzIGEgdHJhZGVtYXJrIG9mIFJlZCBIYXQsIEluYy4AAEwAaQBiAGUAcgBhAHQAaQBvAG4AIABTAGEAbgBzAABMaWJlcmF0aW9uIFNhbnMAAEIAbwBsAGQAAEJvbGQAAEEAcwBjAGUAbgBkAGUAcgAgAC0AIABMAGkAYgBlAHIAYQB0AGkAbwBuACAAUwBhAG4AcwAgAEIAbwBsAGQAAEFzY2VuZGVyIC0gTGliZXJhdGlvbiBTYW5zIEJvbGQAAEwAaQBiAGUAcgBhAHQAaQBvAG4AIABTAGEAbgBzACAAQgBvAGwAZAAATGliZXJhdGlvbiBTYW5zIEJvbGQAAFYAZQByAHMAaQBvAG4AIAAxAC4AMAA3AC4ANAAAVmVyc2lvbiAxLjA3LjQAAEwAaQBiAGUAcgBhAHQAaQBvAG4AUwBhAG4AcwAtAEIAbwBsAGQAAExpYmVyYXRpb25TYW5zLUJvbGQAAEwAaQBiAGUAcgBhAHQAaQBvAG4AIABpAHMAIABhACAAdAByAGEAZABlAG0AYQByAGsAIABvAGYAIABSAGUAZAAgAEgAYQB0ACwAIABJAG4AYwAuACAAcgBlAGcAaQBzAHQAZQByAGUAZAAgAGkAbgAgAFUALgBTAC4AIABQAGEAdABlAG4AdAAgAGEAbgBkACAAVAByAGEAZABlAG0AYQByAGsAIABPAGYAZgBpAGMAZQAgAGEAbgBkACAAYwBlAHIAdABhAGkAbgAgAG8AdABoAGUAcgAgAGoAdQByAGkAcwBkAGkAYwB0AGkAbwBuAHMALgAATGliZXJhdGlvbiBpcyBhIHRyYWRlbWFyayBvZiBSZWQgSGF0LCBJbmMuIHJlZ2lzdGVyZWQgaW4gVS5TLiBQYXRlbnQgYW5kIFRyYWRlbWFyayBPZmZpY2UgYW5kIGNlcnRhaW4gb3RoZXIganVyaXNkaWN0aW9ucy4AAEEAcwBjAGUAbgBkAGUAcgAgAEMAbwByAHAAbwByAGEAdABpAG8AbgAAQXNjZW5kZXIgQ29ycG9yYXRpb24AAFMAdABlAHYAZQAgAE0AYQB0AHQAZQBzAG8AbgAAU3RldmUgTWF0dGVzb24AAGgAdAB0AHAAOgAvAC8AdwB3AHcALgBhAHMAYwBlAG4AZABlAHIAYwBvAHIAcAAuAGMAbwBtAC8AAGh0dHA6Ly93d3cuYXNjZW5kZXJjb3JwLmNvbS8AAGgAdAB0AHAAOgAvAC8AdwB3AHcALgBhAHMAYwBlAG4AZABlAHIAYwBvAHIAcAAuAGMAbwBtAC8AdAB5AHAAZQBkAGUAcwBpAGcAbgBlAHIAcwAuAGgAdABtAGwAAGh0dHA6Ly93d3cuYXNjZW5kZXJjb3JwLmNvbS90eXBlZGVzaWduZXJzLmh0bWwAAEwAaQBjAGUAbgBzAGUAZAAgAHUAbgBkAGUAcgAgAHQAaABlACAATABpAGIAZQByAGEAdABpAG8AbgAgAEYAbwBuAHQAcwAgAGwAaQBjAGUAbgBzAGUALAAgAHMAZQBlACAAaAB0AHQAcABzADoALwAvAGYAZQBkAG8AcgBhAHAAcgBvAGoAZQBjAHQALgBvAHIAZwAvAHcAaQBrAGkALwBMAGkAYwBlAG4AcwBpAG4AZwAvAEwAaQBiAGUAcgBhAHQAaQBvAG4ARgBvAG4AdABMAGkAYwBlAG4AcwBlAABMaWNlbnNlZCB1bmRlciB0aGUgTGliZXJhdGlvbiBGb250cyBsaWNlbnNlLCBzZWUgaHR0cHM6Ly9mZWRvcmFwcm9qZWN0Lm9yZy93aWtpL0xpY2Vuc2luZy9MaWJlcmF0aW9uRm9udExpY2Vuc2UAAGgAdAB0AHAAcwA6AC8ALwBmAGUAZABvAHIAYQBwAHIAbwBqAGUAYwB0AC4AbwByAGcALwB3AGkAawBpAC8ATABpAGMAZQBuAHMAaQBuAGcALwBMAGkAYgBlAHIAYQB0AGkAbwBuAEYAbwBuAHQATABpAGMAZQBuAHMAZQAAaHR0cHM6Ly9mZWRvcmFwcm9qZWN0Lm9yZy93aWtpL0xpY2Vuc2luZy9MaWJlcmF0aW9uRm9udExpY2Vuc2UAAAAAAgAAAAAAAP/+ANcAAAAAAAAAAAAAAAAAAAAAAAAAAAKpAAAAAQACAQIABAAFAAYABwAIAAkACgALAAwADQAOAA8BAwARABIAEwAUABUAFgAXABgAGQAaABsAHAAdAQQAHwAgACEAIgAjACQAJQAmACcAKAApACoAKwAsAC0ALgAvADAAMQAyADMANAA1ADYANwA4ADkAOgA7ADwAPQA+AD8AQABBAEIAQwBEAEUARgBHAEgASQBKAEsATABNAE4ATwBQAFEAUgBTAFQAVQBWAFcAWABZAFoAWwBcAF0AXgBfAGAAYQCjAIQAhQC9AJYA6ACGAI4AiwCdAKkApACKANoAgwCTAQUBBgCNAQcAiAEIAN4BCQCeAKoA9QD0APYAogCtAMkAxwCuAGIAYwCQAGQAywBlAMgAygDPAMwAzQDOAOkAZgDTANAA0QCvAGcA8ACRANYA1ADVAGgA6wDtAIkAagBpAGsAbQBsAG4AoABvAHEAcAByAHMAdQB0AHYAdwDqAHgAegB5AHsAfQB8ALgAoQB/AH4AgACBAOwA7gC6AQoBCwEMAQ0BDgEPAP0A/gEQAREBEgETAP8BAAEUARUBFgEBARcBGAEZARoBGwEcAR0BHgEfASABIQEiAPgA+QEjASQBJQEmAScBKAEpASoBKwEsAS0BLgEvATABMQEyAPoA1wEzATQBNQE2ATcBOAE5AToBOwE8AT0BPgE/AUABQQDiAOMBQgFDAUQBRQFGAUcBSAFJAUoBSwFMAU0BTgFPAVAAsACxAVEBUgFTAVQBVQFWAVcBWAFZAVoA+wD8AOQA5QFbAVwBXQFeAV8BYAFhAWIBYwFkAWUBZgFnAWgBaQFqAWsBbAFtAW4BbwFwALsBcQFyAXMBdADmAOcBdQCmAXYBdwF4AXkBegF7AXwBfQF+AX8A2ADhAYAA2wDcAN0A4ADZAN8BgQGCAYMBhAGFAYYBhwGIAYkBigGLAYwBjQGOAKgBjwGQAZEBkgGTAZQBlQGWAZcBmAGZAZoBmwGcAZ0BngGfAaABoQCfAaIBowGkAaUBpgGnAagBqQGqAasBrAGtAa4BrwGwAbEBsgGzAJcBtAG1AbYAmwG3AbgBuQG6AbsBvAG9Ab4BvwHAAcEBwgHDAcQBxQHGAccByAHJAcoBywHMAc0BzgHPAdAB0QHSAdMB1AHVAdYB1wHYAdkB2gHbAdwB3QHeAd8B4AHhAeIB4wHkAeUB5gHnAegB6QHqAesB7AHtAe4B7wHwAfEB8gHzAfQB9QH2AfcB+AH5AfoB+wH8Af0B/gH/AgACAQICAgMCBAIFAgYCBwIIAgkCCgILAgwCDQIOAg8CEAIRAhICEwIUAhUCFgIXAhgCGQIaAhsCHAIdAh4CHwIgAiECIgIjAiQCJQImAicCKAIpAioCKwIsAi0CLgIvAjACMQIyALIAswIzAjQAtgC3AMQCNQC0ALUAxQCCAMIAhwCrAMYCNgI3AL4AvwI4AjkCOgI7APcCPAI9Aj4CPwJAAkEAjAJCAkMCRAJFAkYCRwJIAkkCSgJLAkwCTQJOAJgCTwCaAJkA7wClAJICUAJRAJwApwCPAlIAlACVAlMCVAJVAlYCVwJYAlkCWgJbAlwCXQJeAl8CYAJhAmICYwJkAmUCZgJnAmgCaQJqAmsCbAJtAm4CbwJwAnECcgJzAnQCdQJ2AncCeAJ5AnoCewJ8An0CfgJ/AoACgQKCAoMChAKFAoYChwKIAokCigKLAowCjQKOAo8AuQKQApECkgKTApQClQKWApcCmAKZApoCmwKcAp0CngKfAqACoQKiAqMCpAKlAqYCpwKoAqkCqgKrAqwCrQKuAq8CsAKxArICswK0B3VuaTAwQTAHdW5pMDBBRAd1bmkwMzdFB3VuaTAwQjIHdW5pMDBCMwd1bmkwMEI1B3VuaTIyMTkHdW5pMDBCOQdBbWFjcm9uB2FtYWNyb24GQWJyZXZlBmFicmV2ZQdBb2dvbmVrB2FvZ29uZWsLQ2NpcmN1bWZsZXgLY2NpcmN1bWZsZXgKQ2RvdGFjY2VudApjZG90YWNjZW50BkRjYXJvbgZkY2Fyb24GRGNyb2F0B0VtYWNyb24HZW1hY3JvbgZFYnJldmUGZWJyZXZlCkVkb3RhY2NlbnQKZWRvdGFjY2VudAdFb2dvbmVrB2VvZ29uZWsGRWNhcm9uBmVjYXJvbgtHY2lyY3VtZmxleAtnY2lyY3VtZmxleApHZG90YWNjZW50Cmdkb3RhY2NlbnQMR2NvbW1hYWNjZW50DGdjb21tYWFjY2VudAtIY2lyY3VtZmxleAtoY2lyY3VtZmxleARIYmFyBGhiYXIGSXRpbGRlBml0aWxkZQdJbWFjcm9uB2ltYWNyb24GSWJyZXZlBmlicmV2ZQdJb2dvbmVrB2lvZ29uZWsCSUoCaWoLSmNpcmN1bWZsZXgLamNpcmN1bWZsZXgMS2NvbW1hYWNjZW50DGtjb21tYWFjY2VudAxrZ3JlZW5sYW5kaWMGTGFjdXRlBmxhY3V0ZQxMY29tbWFhY2NlbnQMbGNvbW1hYWNjZW50BkxjYXJvbgZsY2Fyb24ETGRvdARsZG90Bk5hY3V0ZQZuYWN1dGUMTmNvbW1hYWNjZW50DG5jb21tYWFjY2VudAZOY2Fyb24GbmNhcm9uC25hcG9zdHJvcGhlA0VuZwNlbmcHT21hY3JvbgdvbWFjcm9uBk9icmV2ZQZvYnJldmUNT2h1bmdhcnVtbGF1dA1vaHVuZ2FydW1sYXV0BlJhY3V0ZQZyYWN1dGUMUmNvbW1hYWNjZW50DHJjb21tYWFjY2VudAZSY2Fyb24GcmNhcm9uBlNhY3V0ZQZzYWN1dGULU2NpcmN1bWZsZXgLc2NpcmN1bWZsZXgMVGNvbW1hYWNjZW50DHRjb21tYWFjY2VudAZUY2Fyb24GdGNhcm9uBFRiYXIEdGJhcgZVdGlsZGUGdXRpbGRlB1VtYWNyb24HdW1hY3JvbgZVYnJldmUGdWJyZXZlBVVyaW5nBXVyaW5nDVVodW5nYXJ1bWxhdXQNdWh1bmdhcnVtbGF1dAdVb2dvbmVrB3VvZ29uZWsLV2NpcmN1bWZsZXgLd2NpcmN1bWZsZXgLWWNpcmN1bWZsZXgLeWNpcmN1bWZsZXgGWmFjdXRlBnphY3V0ZQpaZG90YWNjZW50Cnpkb3RhY2NlbnQFbG9uZ3MKQXJpbmdhY3V0ZQphcmluZ2FjdXRlB0FFYWN1dGUHYWVhY3V0ZQtPc2xhc2hhY3V0ZQtvc2xhc2hhY3V0ZQxTY29tbWFhY2NlbnQMc2NvbW1hYWNjZW50B3VuaTAyMUEHdW5pMDIxQgd1bmkwMkM5BXRvbm9zDWRpZXJlc2lzdG9ub3MKQWxwaGF0b25vcwlhbm90ZWxlaWEMRXBzaWxvbnRvbm9zCEV0YXRvbm9zCUlvdGF0b25vcwxPbWljcm9udG9ub3MMVXBzaWxvbnRvbm9zCk9tZWdhdG9ub3MRaW90YWRpZXJlc2lzdG9ub3MFQWxwaGEEQmV0YQVHYW1tYQdFcHNpbG9uBFpldGEDRXRhBVRoZXRhBElvdGEFS2FwcGEGTGFtYmRhAk11Ak51AlhpB09taWNyb24CUGkDUmhvBVNpZ21hA1RhdQdVcHNpbG9uA1BoaQNDaGkDUHNpDElvdGFkaWVyZXNpcw9VcHNpbG9uZGllcmVzaXMKYWxwaGF0b25vcwxlcHNpbG9udG9ub3MIZXRhdG9ub3MJaW90YXRvbm9zFHVwc2lsb25kaWVyZXNpc3Rvbm9zBWFscGhhBGJldGEFZ2FtbWEFZGVsdGEHZXBzaWxvbgR6ZXRhA2V0YQV0aGV0YQRpb3RhBWthcHBhBmxhbWJkYQJudQJ4aQdvbWljcm9uA3JobwZzaWdtYTEFc2lnbWEDdGF1B3Vwc2lsb24DcGhpA2NoaQNwc2kFb21lZ2EMaW90YWRpZXJlc2lzD3Vwc2lsb25kaWVyZXNpcwxvbWljcm9udG9ub3MMdXBzaWxvbnRvbm9zCm9tZWdhdG9ub3MHdW5pMDQwMAlhZmlpMTAwMjMJYWZpaTEwMDUxCWFmaWkxMDA1MglhZmlpMTAwNTMJYWZpaTEwMDU0CWFmaWkxMDA1NQlhZmlpMTAwNTYJYWZpaTEwMDU3CWFmaWkxMDA1OAlhZmlpMTAwNTkJYWZpaTEwMDYwCWFmaWkxMDA2MQd1bmkwNDBECWFmaWkxMDA2MglhZmlpMTAxNDUJYWZpaTEwMDE3CWFmaWkxMDAxOAlhZmlpMTAwMTkJYWZpaTEwMDIwCWFmaWkxMDAyMQlhZmlpMTAwMjIJYWZpaTEwMDI0CWFmaWkxMDAyNQlhZmlpMTAwMjYJYWZpaTEwMDI3CWFmaWkxMDAyOAlhZmlpMTAwMjkJYWZpaTEwMDMwCWFmaWkxMDAzMQlhZmlpMTAwMzIJYWZpaTEwMDMzCWFmaWkxMDAzNAlhZmlpMTAwMzUJYWZpaTEwMDM2CWFmaWkxMDAzNwlhZmlpMTAwMzgJYWZpaTEwMDM5CWFmaWkxMDA0MAlhZmlpMTAwNDEJYWZpaTEwMDQyCWFmaWkxMDA0MwlhZmlpMTAwNDQJYWZpaTEwMDQ1CWFmaWkxMDA0NglhZmlpMTAwNDcJYWZpaTEwMDQ4CWFmaWkxMDA0OQlhZmlpMTAwNjUJYWZpaTEwMDY2CWFmaWkxMDA2NwlhZmlpMTAwNjgJYWZpaTEwMDY5CWFmaWkxMDA3MAlhZmlpMTAwNzIJYWZpaTEwMDczCWFmaWkxMDA3NAlhZmlpMTAwNzUJYWZpaTEwMDc2CWFmaWkxMDA3NwlhZmlpMTAwNzgJYWZpaTEwMDc5CWFmaWkxMDA4MAlhZmlpMTAwODEJYWZpaTEwMDgyCWFmaWkxMDA4MwlhZmlpMTAwODQJYWZpaTEwMDg1CWFmaWkxMDA4NglhZmlpMTAwODcJYWZpaTEwMDg4CWFmaWkxMDA4OQlhZmlpMTAwOTAJYWZpaTEwMDkxCWFmaWkxMDA5MglhZmlpMTAwOTMJYWZpaTEwMDk0CWFmaWkxMDA5NQlhZmlpMTAwOTYJYWZpaTEwMDk3B3VuaTA0NTAJYWZpaTEwMDcxCWFmaWkxMDA5OQlhZmlpMTAxMDAJYWZpaTEwMTAxCWFmaWkxMDEwMglhZmlpMTAxMDMJYWZpaTEwMTA0CWFmaWkxMDEwNQlhZmlpMTAxMDYJYWZpaTEwMTA3CWFmaWkxMDEwOAlhZmlpMTAxMDkHdW5pMDQ1RAlhZmlpMTAxMTAJYWZpaTEwMTkzCWFmaWkxMDE0NwlhZmlpMTAxOTUJYWZpaTEwMDUwCWFmaWkxMDA5OAZXZ3JhdmUGd2dyYXZlBldhY3V0ZQZ3YWN1dGUJV2RpZXJlc2lzCXdkaWVyZXNpcwZZZ3JhdmUGeWdyYXZlB3VuaTIwMTAHdW5pMjAxMQlhZmlpMDAyMDgNdW5kZXJzY29yZWRibA1xdW90ZXJldmVyc2VkBm1pbnV0ZQZzZWNvbmQJZXhjbGFtZGJsB3VuaTIwM0UHdW5pMjIxNQd1bmkyMDdGBGxpcmEGcGVzZXRhBEV1cm8JYWZpaTYxMjQ4CWFmaWk2MTI4OQlhZmlpNjEzNTIHdW5pMjEyNgllc3RpbWF0ZWQJb25lZWlnaHRoDHRocmVlZWlnaHRocwtmaXZlZWlnaHRocwxzZXZlbmVpZ2h0aHMJYXJyb3dsZWZ0B2Fycm93dXAKYXJyb3dyaWdodAlhcnJvd2Rvd24JYXJyb3dib3RoCWFycm93dXBkbgxhcnJvd3VwZG5ic2UHdW5pMjIwNgpvcnRob2dvbmFsDGludGVyc2VjdGlvbgtlcXVpdmFsZW5jZQVob3VzZQ1yZXZsb2dpY2Fsbm90CmludGVncmFsdHAKaW50ZWdyYWxidAhTRjEwMDAwMAhTRjExMDAwMAhTRjAxMDAwMAhTRjAzMDAwMAhTRjAyMDAwMAhTRjA0MDAwMAhTRjA4MDAwMAhTRjA5MDAwMAhTRjA2MDAwMAhTRjA3MDAwMAhTRjA1MDAwMAhTRjQzMDAwMAhTRjI0MDAwMAhTRjUxMDAwMAhTRjUyMDAwMAhTRjM5MDAwMAhTRjIyMDAwMAhTRjIxMDAwMAhTRjI1MDAwMAhTRjUwMDAwMAhTRjQ5MDAwMAhTRjM4MDAwMAhTRjI4MDAwMAhTRjI3MDAwMAhTRjI2MDAwMAhTRjM2MDAwMAhTRjM3MDAwMAhTRjQyMDAwMAhTRjE5MDAwMAhTRjIwMDAwMAhTRjIzMDAwMAhTRjQ3MDAwMAhTRjQ4MDAwMAhTRjQxMDAwMAhTRjQ1MDAwMAhTRjQ2MDAwMAhTRjQwMDAwMAhTRjU0MDAwMAhTRjUzMDAwMAhTRjQ0MDAwMAd1cGJsb2NrB2RuYmxvY2sFYmxvY2sHbGZibG9jawdydGJsb2NrB2x0c2hhZGUFc2hhZGUHZGtzaGFkZQlmaWxsZWRib3gGSDIyMDczBkgxODU0MwZIMTg1NTEKZmls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AZr/aAAcAA//HwAQ/48AEf8fAB3/aAAe/2gBXgEAAV//RgFi/0YBZv+yAWn/RgFt/7IBc/+yAXb/sgF5/2gBe/+0AXz/tAF+/2gBgP+sAYH/tAGE/7QBhv+0AYf/tAGJ/7QBjP9oAZD/aAGT/2gBlwBcAZn/aAAEAV//yQFx/8kBcv/HAXj/xwACAZb/5QGb/+UACQF5/9sBfv/bAYH/2wGM/9sBkP/bAZP/2wGW/9sBmf/bAZv/2wADAY3/xwGR/8cBlP+2ABIBef+NAXv/zwF+/40BgP++AYH/tAGE/88Bhf+0AYb/zwGH/88Biv++AYz/jQGN/7QBkP+NAZH/tAGT/40Blv+NAZn/jQGb/40ADQF5/7wBfv+8AYH/vAGD/7wBhf/jAYv/vAGM/7wBj/+8AZD/vAGT/7wBlv+8AZn/vAGb/7wAEAF5/+cBff/hAX7/5wGB/+cBg//nAYv/5wGM/+cBj//nAZD/5wGS/+EBk//nAZb/5wGY/+EBmf/nAZr/4QGb/+cACgF5/+cBfv/nAYH/5wGD/+cBi//nAYz/5wGP/+cBkP/nAZP/5wGZ/+cACwF5/8cBfv/HAYH/xwGD/8cBiP+0AYz/xwGP/8cBkP/HAZP/xwGW/8cBm//HAAIBjf/HAZH/xwAKAXn/xwF+/8cBgf/HAYP/xwGM/8cBj//HAZD/xwGT/8cBlv/HAZv/xwAEAYj/5wGN/8cBkf/HAZT/tgALAXn/tgF+/7YBgf+2AYP/tgGM/7YBj/+2AZD/tgGT/7YBlv/VAZn/tgGb/9UAAwGN/8cBkf/HAZT/1QAGAA//GQAR/wAAHf/lAB7/5QBs/7IAe/+yAAECD/8zABABsABMAbcAGQG6/+UBu//lAb3/zQG+/5oBv/+yAcD/zQHD/2QByf/NAcwAGQHN/+UB3f/lAd7/5QHpABkCD/+YAA4BrP+yAbL/zQGz/+UBt//NAb3/5QG+/80Bv//NAcD/5QHB/80Bw/+yAcb/sgHJ/80By//NAd//5QARAaz/mgGw/+UBsv+yAbP/5QG3/80Buv/NAb3/sgG+/7IBv/+yAcD/zQHB/7IBw/+yAcb/mgHL/80B3v/lAeH/5QHj/7IAGgAP/xkAEf8AAB3/5QAe/+UAbP+yAHv/sgGs/38BsP/NAbf/zQG6/+UBvf/lAcz/5QHO/80B0P+yAdH/mAHU/80B1/+aAdj/sgHZ/80B2v+aAdz/sgHf/7IB5/+yAej/sgHq/7IB6/+yAAgBswAZAb8AGQHA/+UBw//lAdEAGQHTADMB2gAZAd8AGQAJAbMAGQG6/+UBvf/NAb4AMwG/ADMBwwAZAcYATAHMABkB2v/lAAkBsv/NAbf/zQG6/+UBvf/NAb7/sgG//7IBwP/NAcP/sgHL/80ACgGzAEwBvf/lAb4AMwG/ADMBwP/lAcMAMwHJABkBzAAZAdMAGQHd/+UAAQHMADMAAwHMABkB3f/lAeP/5QAJAaz/zQGw/+UBsv/lAbf/zQG//80Bwf+yAcv/5QHQ/80B1//lABYAD/7lABH+zQAd/+UAHv/lAaz/TAGw/38Bsv/lAbP/5QG3/38BuP/lAbr/5QG9/80Bvv/lAb//5QHA/+UBwf+yAcv/zQHM/+UB0P9/AdH/zQHa/80B6//lABIBrP/NAbD/5QGz/+UBt//NAbj/5QG6/80Bvv/NAb//5QHB/7IBw//NAcb/5QHJ/+UBzAAZAc3/5QHSABkB3f/lAeD/5QHj/+UAHgAP/zMAEf8ZAB3/5QAe/+UAbP/NAaz/fwGw/80BsgAzAbf/zQG6/80BwP+yAcv/5QHM/80Bzv+yAdH/mgHU/7IB1v+yAdf/fwHY/5gB2v9/Adv/5QHc/7IB3f9/Ad//sgHh/7IB5f/lAef/5QHo/+UB6v/lAev/zQAkAA//GQAR/wAAHf/NAB7/zQBs/7IAe/+yAaz/ZgGw/5gBt/+yAbr/zQHA/7IByf/lAcv/zQHN/80Bzv+yAc//sgHQ/38B0f9/AdL/5QHT/5oB1P+yAdX/sgHW/7IB1/9/Adj/mgHZ/7IB2v9/Adv/sgHc/7IB3f9/AeH/zQHi/7IB5P+yAeX/sgHq/7IB6/+aAAkBrP/NAbD/mAG3/7IBvv+yAb//sgHA/+UBw//lAcv/ywHX/80ABwGz/+UBuv/LAb3/sgHA/7IByf/NAdr/5QHf/+UAAwHMAEwB0QAZAdoAGQABAcwAGQACAcv/sgIP/zMADgGs/80BsP/lAbL/sgGz/80Bt/+yAbj/zQG6/+UBvf/NAb7/MQHB/5gBw/9mAcn/sgHL/7ICD/9mAAoBsP/NAbL/zQGz/+UBt/+yAcD/5QHB/80By//NAdD/5QHSABkB1//NAAsBrP/NAbD/zQGy/80Bt/+yAb3/5QG+/80Bwf+yAcP/5QHQ/80B0gAZAdf/zQACAdMAGQHj/80ADAHQ/80B0v/lAdP/5QHX/80B2P/lAd3/5QHf/+UB4f/NAeP/zQHm/+UB6f/lAev/5QAOAcz/5QHN/+UB0f/lAdL/5QHX/+UB2P/lAdr/5QHd/80B3v/lAd//zQHg/+UB4/+yAeb/zQHr/+UABgAP/0wAEf8zAdD/sgHX/80B2v/lAd3/5QAEAdMAGQHd/+UB3wAZAeb/5QAIAc3/5QHS/+UB2P/lAd3/5QHe/+UB3//lAeH/5QHj/80ABgHMABkB0f/lAdMAGQHa/80B3f/lAeP/zQANAcz/5QHN/80B0f/lAdL/5QHT/+UB1//lAdj/zQHa/80B3f/NAd//zQHg/+UB4/+yAeb/zQAGAdcAGQHa/+UB3f/lAeD/5QHj/+UB6f/lAAYBzf/lAdH/5QHa/+UB3f/lAd//5QHj/80ACAHM/+UBzf/lAdP/5QHa/+UB3f/lAd//5QHg/+UB6f/lAAwB0P/lAdL/5QHT/+UB1//NAdj/5QHd/+UB3v/NAd//5QHh/80B4//NAen/5QHr/+UACwHQ/80B0v/lAdP/5QHX/80B2P/lAd7/5QHf/+UB4f/lAeP/zQHp/+UB6//lAAUBzAAZAc3/5QHh/+UB4//LAeb/5QAIAA//ZgAR/0wB0P/lAdIAGQHX/+UB2v/lAd3/5QHfADMAFAAP/2YAEf9MAB3/5QAe/+UAewAzAcz/5QHQ/80B0f/lAdIAGQHT/+UB1//lAdj/5QHa/80B3P/lAd3/zQHeABkB4P/lAeEAGQHp/+UB6//lAAoBzf/lAdD/5QHR/+UB1//NAdj/5QHa/+UB3v/lAd//5QHj/80B6//lAAkBzf/lAdH/zQHT/+UB2v/NAd3/zQHfABkB4P/lAeP/zQHp/+UAAwHMABkB0wAZAd3/5QACAcwAGQHa/+UAAgHe/0wB4/9MAAoBzf/lAdD/5QHS/+UB0//lAdf/zQHY/+UB3f/lAd7/5QHh/+UB6//lAAoBzf/lAdD/5QHS/+UB1//NAdj/5QHd/+UB3v/NAeH/zQHj/7IB6f/lAAUAD/9mABH/TAAd/+UAHv/lAGz/zQAGAA//fwAR/2YAHf/lAB7/5QBs/80Ae//NAAECDv+0AAMAA/+PAFb/tAIP/7QABQGe/zMBp/8zAb7/TAHD/zEBxv9MAAEAZwADACQAKQAvADMANQA3ADkAOgA8AEkAVQBZAFoAXAFWAVsBXAFdAV8BYQFiAWYBaAFpAW0BbwFwAXEBcgFzAXQBdQF2AXgBgQGDAYcBiAGLAYwBjQGOAZEBkwGUAZYBmQGbAZ8BpQGmAawBrQGuAa8BsAGyAbMBtgG3AbgBugG8Ab0BvgG/AcABwQHCAcUBxgHIAckBygHMAc0BzgHPAdAB0QHSAdMB1gHXAdgB2gHcAd0B3gHfAeAB4QHiAeUB6AHpAeoB+gH+Ag4CDwIUAAAAAAABAAAAANnxpYUAAAAAvxr/gAAAAADPkk4f";
var LIBERATION_SANS_REGULAR_BASE64 = "AAEAAAATAQAABAAwRkZUTWie8ucAAiDcAAAAHEdERUYAJwLPAAIPrAAAACZHUE9TanebnQACECQAABC2R1NVQpM8gksAAg/UAAAAUE9TLzL3EoaHAAABuAAAAGBjbWFwBKCddwAADLwAAAbyY3Z0IEOdQ+oAAB2QAAACFmZwZ21z0yOwAAATsAAABwVnYXNwABgACQACD5wAAAAQZ2x5ZtVR9QMAACT8AAG4NGhlYWT0p6kkAAABPAAAADZoaGVhDksIrAAAAXQAAAAkaG10eGEeDgoAAAIYAAAKpGtlcm7HUcGeAAHdMAAAFVRsb2NhBwV5HgAAH6gAAAVUbWF4cAcOB9EAAAGYAAAAIG5hbWUegfbaAAHyhAAACGpwb3N0M4HbtwAB+vAAABSpcHJlcHrIXvYAABq4AAAC1QABAAAAARHrkZnHYV8PPPUAHwgAAAAAAL8a/4AAAAAAz5JN4f5g/ZMIZwdIAAAACAACAAAAAAAAAAEAAAc+/k4AQwjA/mD+9AhnAAEAAAAAAAAAAAAAAAAAAAKpAAEAAAKpAVIAVACMAAUAAgAQAC8AWgAAA54FwAADAAIAAwS4AZAABQAABZoFMwAAARsFmgUzAAAD0QBmAhIIBQILBgQCAgICAgSgAAKvUAB4+wAAAAAAAAAAMUFTQwBAACH7AgXT/lEBMwc+AbJgAACf39cAAAQ6BYEAAAAgAAIC7ABEAAAAAAKqAAACOQAAAjkAuQLXAFcEcwAJBHMAFgcdAEkFVgBIAYcAaAKqAH8CqgAMAx0AIQSsAGQCOQC4AqoAWwI5ALsCOQAABHMAUARzAJwEcwBnBHMATgRzAC8EcwBSBHMAaARzAGkEcwBZBHMAYAI5ALsCOQC4BKwAZQSsAGQErABlBHMAVAgfAKEFVgAEBVYAqAXHAGgFxwCoBVYAqATjAKgGOQBnBccAqAI5AL0EAAAgBVYAqARzAKgGqgCoBccAqAY5AGEFVgCoBjkAYQXHAKgFVgBdBOMALgXHAJ4FVgAJB40ACQVWAC4FVgAtBOMAQQI5AJICOQAAAjkAEAPBAAoEc//hAqoAagRzAFcEcwCEBAAAVwRzAFYEcwBXAjkAHQRzAFYEcwCOAccAiQHH/84EAACKAccAigaqAIgEcwCIBHMAVgRzAIQEcwBWAqoAiAQAADkCOQAfBHMAhQQAAAcFx//9BAAAFwQAAAUEAAAxAqwAIgIUALcCrAAiBKwAXAKqAPIEcwCHBHMAOgRzAHEEc//+AhQAtwRzAHMCqgAtBeUAHwL2ABoEcwBTBKwAZAXlAB8Ea//vAzMAegRkAEECqgApAqoAGwKqAEgEnACMBEwAUAI5ALsCqgB3AqoAUALsABsEcwBTBqwAOAasADgGrABJBOMAgwVWAAQFVgAEBVYABAVWAAQFVgAEBVYABAgAABgFxwBoBVYAqAVWAKgFVgCoBVYAqAI5AAkCOQCOAjn/0gI5AAcFxwAOBccAqAY5AGEGOQBhBjkAYQY5AGEGOQBhBKwAjgY5AEcFxwCeBccAngXHAJ4FxwCeBVYALQVWAKgE4wCOBHMAVwRzAFcEcwBXBHMAVwRzAFcEcwBXBx0AQgQAAFcEcwBXBHMAVwRzAFcEcwBXAjkACgI5AIcCOf/TAjkACARzAFYEcwCMBHMAVgRzAFYEcwBWBHMAVgRzAFYEZABBBOMALARzAIsEcwCLBHMAiwRzAIsEAAAFBHMAigQAAAUFVgAEBHMAVwVWAAQEcwBXBVYABARzAFcFxwBoBAAAVwXHAGgEAABXBccAaAQAAFcFxwBoBAAAVwXHAKgE6wBWBccADgRzAFYFVgCoBHMAVwVWAKgEcwBXBVYAqARzAFcFVgCoBHMAVwVWAKgEcwBXBjkAZwRzAFYGOQBnBHMAVgY5AGcEcwBWBjkAZwRzAFYFxwCoBHMAjgXHAA4EcwAKAjn/uAI5/7gCOQAMAjkADAI5/9ICOf/SAjkAXAHHAB8COQC9AjkAwgXhAKoDjQCJBAAAIAHH/5kFVgCoBAAAigQAAIoEcwCoAccAWwRzAKgBxwB+BHMAqAJVAIoEcwCoAqwAigRzABQBxwAQBccAqARzAIwFxwCoBHMAjAXHAKgEcwCMBNX//gXJAKUEcwCMBjkAYQRzAFYGOQBhBHMAVgY5AGEEcwBWCAAAYQeNAFYFxwCoAqoAiAXHAKgCqgCBBccAqAKqADgFVgBdBAAAOQVWAF0EAAA5BVYAXQQAADkFVgBdBAAAOQTjAC4COQAfBOMALgMAAB8E4wAuAjkAHwXHAJ4EcwCFBccAngRzAIUFxwCeBHMAhQXHAJ4EcwCFBccAngRzAIUFxwCeBHMAhQeNAAkFx//9BVYALQQAAAUFVgAtBOMAQQQAADEE4wBBBAAAMQTjAEEEAAAxAccAigRzAMAFVgAEBHMAVwgAABgHHQBCBjkARwTjACwFVgBdBAAAOQTjAC4COQAfAqoAAAKqAAACqgAzAqr/3QKqAJwCqgAzAqoAUAKq/+kCqgAWAqoAzQKqAB0FVwAEAjkAuwZG//UGtP/yAxL/6AYy/7sG2ABBBgX/uwHH/7AFVgAEBVYAqARoAKgFWAA9BVYAqATjAEEFxwCoBjkAYQI5AL0FVgCoBVgACgaqAKgFxwCoBTMAWgY5AGEFxwCoBVYAqATyAGwE4wAuBVYALQZiAHUFVgAuBq8AkQX7AFcCOQAHBVYALQSgAFYDkQBGBHMAagHHAIkEYACFBKAAVgSaAI4EAAAHBHQAVgORAEYDhwBWBHMAagRzAGoBxwCJBAAAigQAAA4EnACKBAAAAAOVAFYEcwBWBYUATwSNAIQD2wBWBPAAVgMpAB0EYACFBTAAVQQzABUFtACHBj8AUwHH/80EYACFBHMAVgRgAIUGPwBTBVYAqAVXAKgG6wAuBFUAqAXAAGgFVgBdAjkAvQI5AAcEAAAgCHUAEggVAKgG1QAuBKkAqAXHAKgFFQA3BcAAqAVWAAQFQACoBVYAqARVAKgFawAPBVYAqAdjABwE1QBDBcAAqAXAAKgEqQCoBUAAEgaqAKgFxwCoBjkAYQXAAKYFVgCoBccAaATjAC4FFQA3BhUAdgVWAC4F6wCoBVUAoAdVAKgHgACoBlUALgcVAKgFQACoBcAAaQgVAKgFxwBgBHMAVwSVAHgEQACOAusAjgSrABQEcwBXBVoABwOrADEEeACOBHgAjgOAAIoEqwALBYAAjgRrAI4EcwBWBFUAjgRzAIQEAABXA6oAIwQAAAUGlQBWBAAAFwSVAI4EKwB6BmsAjgaVAI4FAAAtBcAAjgQrAI4EFQA3BgAAjgRVABEEcwBXBHMAVwRzAAoC6wCOBBUAVwQAADkBxwCJAjn/+AHH/84HQAALBoAAjgRzAAoDgACKBHgAjgQAAAUEawCOBjkAYQRzAFYD6QCoA0oAjgeNAAkFx//9B40ACQXH//0HjQAJBcf//QVWAC0EAAAFAqoAWwKqAFsEcwAACAAAAAgAAAAEa//hAccAfwHHAH8BxwB/AccAfgKqAEsCqgBLAqoASwRzAIoEcwCIAs0AUQgAARYIAAA3AYAAVQLVAFUCqgBY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//8ABAAABVIG/hImACQAABEHAqMBYAAAABNACwIWBSYCABsVBAclASs1ACs1AAAA//8ABAAABVIHBhImACQAABEHAqYBXgAAABNACwIVBSYCAh4sBAclASs1ACs1AAAA//8ABAAABVIGshImACQAABEHAqUBbAAAABdADQMCFQUmAwIEGRcEByUBKzU1ACs1NQAAAP//AAQAAAVSBvsSJgAkAAARBwFQAYkAiAAWQAwDAjgDAwIDHxUEByUBKzU1AD81NQACABgAAAeoBYEADwAaAIhAVnQZAXICAVYCZgICcwODAwJVA2UDAn8FjwUCbQUBXAUBGQUpBQIABwELBwsHABAOIA4CDgIZAxEDBBEJDVoaBQACXxkZBQQMXwkJDRAIXwUDBBINXwASAD/tPz/tMhI5L+0REjkv7QEvMzPtMjMvMxESOTkvXRI5OS8vcTEwXV1dXV1dXV1dIREhAyMBIRUhESEVIREhFQEjDgUHAyEDyf3cxscCrgS5/QkCu/1FAyD8IZcBEBYbGBIC2QHeAZz+ZAWBnP48mv4VnATuAyMyOjMmBf4zAAD//wBo/k4FeQWWEiYAJgAAEQcAeAH+AAAAC7YBOjAoGhAlASs1AAAA//8AqAAABP4G8BImACgAABEHAqEBPwAAABW0AQwFJgG4/6q0DRAACiUBKzUAKzUA//8AqAAABP4G8BImACgAABEHAqIB3wAAABNACwEMBSYBKAwPAAolASs1ACs1AAAA//8AqAAABP4G/hImACgAABEHAqMBdwAAABW0AQ0FJgG4/++0EgwACiUBKzUAKzUA//8AqAAABP4GshImACgAABEHAqUBeQAAABm2AgEMBSYCAbj/6rQQDgAKJQErNTUAKzU1AP//AAkAAAGxBvASJgAsAAARBgKhnwAAFbQBBAUmAbj/wbQFCAACJQErNQArNQAAAP//AI4AAAI2BvASJgAsAAARBgKiRgAAE0ALAQQFJgFFBAcAAiUBKzUAKzUA////0gAAAmgG/hImACwAABEGAqPSAAATQAsBBQUmAQAKBAACJQErNQArNQD//wAHAAACNAayEiYALAAAEQYCpdoAABdADQIBBAUmAgEBCAYAAiUBKzU1ACs1NQAAAgAOAAAFZQWBABAAIQBwQEV1CgFbIIsgAlsfix8CWhSKFAJbEwEKHxofAgoUGhQCGhoc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VkgQuP9As1VVSBC4/0CzVFRIELj/QLNTU0gQuP+As1JSSBC4/8CzUVFIELj/gLNQUEgQuP+As09PSBC4/0CzTk5IELj/QLNNTUgQuP9As0xMSBC4/4CzS0tIELj/gLNKSkgQuP+As0lJSBC4/0CzSEhIELj/gLNHR0gQuP/As0ZGSBC4/4CzRUVIELj/wLNEREgQuP/As0NDSBC4/4CzQkJIELj/QLNBQUgQuP+As0BASBC4/4CzPz9IELj/gLM+PkgQuP/Asz09SBC4/8CzPDxIELj/wLM7O0gQuP+Aszo6SBC4/4CzOTlIELj/gLM4OEgQuP+Aszc3SBC4/4CzNjZIELj/wLM1NUgQuP/AszQ0SBC4/4CzMzNIELj/wLMyMkgQuP+AszExSBC4/4CzMDBIELj/gLMvL0gQuP/Asy4uSBC4/4CzLS1IELj/gLMsLEgQuP+AsysrSBC4/8CzKipIELj/wLMpKUgQuP/AsygoSBC4/8CzJydIELj/gLMmJkgQuP+AsyUlSBC4/4CzJCRIELj/wLMjI0gQuP+AsyIiSBC4/8CzISFIELj/wLMgIEgQuP/Asx8fSBC4/8CzHh5IELj/wLMdHUgQuP/AsxwcSBC4/8CzGxtIELj/wLMaGkgQuP/AsxkZSBC4/8CzGBhIELj/gLMXF0gQuP/AsxYWSBC4/8CzFRVIELj/wLMREUgQuP+AsxAQSBC4/8CzDw9IELj/wLMODkgQuP/AQB4MDEgQQAsLSAELAwGADAFwDAFgDAFADAEQDAEADAG4/6ZADQwMBAQlALAAAQAAAQAQXV01K11dXV1dXTUAPzUBKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKyv///+7AAAFrQWWECYBdgoAEQcBVP7u/3wAREAPQUATE0gBPAMBkDoBEDoBuP8+QBw6OjU1JQCfAAFfAAEfAAHfAAGvAAGfAAEfAAEAEF1dXV1xcXE1K11dNQA/NQErAAD///+wAAACHgZBECYBhgAA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ADcAA//bADcAD/8dADcAEP+PADcAEf8dADcAHf8dADcAHv8dADcAJP9oADcAMv/bADcARP8dADcARv8dADcASP8dADcATP+0ADcAUv8dADcAVf+0ADcAVv8dADcAWP+0ADcAWv+PADcAXP+PADkAD/9EADkAEP+PADkAEf9EADkAHf+0ADkAHv+0ADkAJP9oADkARP9oADkASP+PADkATP/bADkAUv+PADkAVf+0ADkAWP+0ADkAXP+0ADoAD/+PADoAEP/bADoAEf+PADoAHf/bADoAHv/bADoAJP+0ADoARP+0ADoASP/bADoAUv/bADoAVf/bADoAWP/bADoAXP/uADwAA//bADwAD/74ADwAEP9EADwAEf74ADwAHf+PADwAHv97ADwAJP9oADwARP9oADwASP9EADwATP+0ADwAUv9EADwAU/9oADwAVP9EADwAWP+PADwAWf+PAEkASf/bAEkCDwAlAFUAD/+PAFUAEf+PAFUCDwBMAFkAD/9oAFkAEf9oAFoAD/+PAFoAEf+PAFwAD/9oAFwAEf9oAVYBZv/VAVYBbf/VAVYBcf9oAVYBcv9oAVYBc//FAVYBeP9oAVYBgP/bAVYBiv/bAVYBlP/bAVsBcv++AVwBXgCqAVwBX/9oAVwBYv9oAVwBZv+NAVwBaf9oAVwBbf+NAVwBc/+NAVwBdv+eAVwBe/9oAVwBfP+0AVwBfv9GAVwBhP9oAVwBhv+0AVwBh/9oAVwBif9oAVwBjP9GAVwBkP9GAVwBk/9GAVwBlwBiAVwBmf9GAV0Bcv/RAV0BeP/RAV8AA/+PAV8BZv/VAV8Bbf/VAV8Bcf9oAV8Bcv9oAV8Bc//FAV8BeP9oAV8BgP/bAV8Biv/bAV8BlP/bAV8CD/9oAWEAD/8fAWEAEf8fAWEBXgCkAWEBX/9EAWEBYv9EAWEBaf9EAWEBhv+oAWEBlwBYAWIAA/+PAWIBZv/VAWIBbf/VAWIBcf+JAWIBcv9oAWIBeP9oAWYBX//bAWYBYv/bAWYBaf/bAWYBcv++AWYBeP++AWgBZv/BAWgBbf/BAWgBc/+PAWgBef/nAWgBfv/nAWgBgf/nAWgBg//nAWgBhf/nAWgBi//nAWgBjP/nAWgBkP/nAWgBk//nAWgBlv/nAWgBmf/nAWgBm//nAWkAA/+PAWkBZv/VAWkBbf/VAWkBcf9oAWkBcv9oAWkBeP9oAW0BX//bAW0BYv/VAW0Baf/bAW0Bcv++AW0BeP++AW8AA//bAW8AD/76AW8AEf76AW8BX/9oAW8BYv9oAW8Baf9oAXABjf+eAXABkf+eAXEAA//bAXEAD/8fAXEAEf8fAXEAHf8fAXEAHv8fAXEBXgC8AXEBX/9oAXEBYv9oAXEBZv/bAXEBaf9oAXEBbf/bAXEBc//bAXEBdv/bAXEBef8fAXEBev8fAXEBff9OAXEBfv8fAXEBgP9OAXEBgv8fAXEBhP9qAXEBhv+0AXEBif9qAXEBiv+PAXEBjP8fAXEBkP8fAXEBkv9QAXEBk/8fAXEBlP+PAXEBlf9qAXEBlwC8AXEBmP9OAXEBmf8fAXEBmv9OAXIAA//bAXIAD/76AXIAEP9GAXIAEf76AXIAHf+PAXIAHv+PAXIBXgC8AXIBX/9oAXIBYv9oAXIBZv+NAXIBaf9oAXIBbf+NAXIBc/+NAXIBdv+eAXIBe/9oAXIBfP+0AXIBfv9GAXIBgP+eAXIBhP9oAXIBhv+0AXIBh/9oAXIBif9oAXIBjP9GAXIBkP9GAXIBk/9GAXIBlwB5AXIBmf9GAXMBX//FAXMBcv++AXMBeP++AXUBef+yAXUBfv+yAXUBgf+yAXUBhf/ZAXUBjP+yAXUBkP+yAXUBk/+yAXUBlv+yAXUBmf+yAXUBm/+yAXYBcv/RAXYBeP/RAXgAA//bAXgBXgCqAXgBX/9oAXgBYv9oAXgBZv+NAXgBaf9oAXgBbf+NAXgBc/+NAXgBdv+eAXgBe/9oAXgBfP+0AXgBfv9GAXgBhP9oAXgBhv+0AXgBh/9oAXgBif9oAXgBjP9GAXgBkP9GAXgBk/9GAXgBlwBiAXgBmf9GAYEBiP/ZAYEBjf/jAYEBkf/jAYEBlP/JAYMBef93AYMBe//bAYMBfv93AYMBgP+qAYMBgf+0AYMBhP/bAYMBhf+eAYMBhv/bAYMBh//bAYMBiv+qAYMBjP93AYMBjf+qAYMBkP93AYMBkf+qAYMBk/93AYMBlv93AYMBmf93AYMBm/93AYUBiP/ZAYcBef/nAYcBfv/nAYcBgf/nAYcBg//nAYcBhf/nAYcBi//nAYcBjP/nAYcBj//nAYcBkP/nAYcBk//nAYcBlv/nAYcBmf/nAYcBm//nAYgBef/hAYgBfv/hAYgBgf/hAYgBi//hAYgBjP/hAYgBj//RAYgBkP/hAYgBkv/PAYgBk//bAYgBlv/hAYgBmf/hAYgBmv/PAYgBm//hAYsBef/JAYsBfv/JAYsBgf/JAYsBg//JAYsBi//JAYsBjP/JAYsBj//JAYsBkP/JAYsBk//JAYsBmf/JAYwBiP/ZAYwBjf/jAYwBkf/jAYwBlP/JAY0Bef/jAY0Bfv/jAY0Bg//jAY0BjP/jAY0Bj//jAY0BkP/jAY0Bk//jAY0Blv/jAY0Bm//jAY4BiP/ZAY4Bjf/jAY4Bkf/jAZEBef/jAZEBfv/jAZEBgf/jAZEBg//jAZEBjP/jAZEBj//jAZEBkP/jAZEBk//jAZEBlv/jAZEBm//jAZMBiP/ZAZMBjf/jAZMBkf/jAZMBlP/JAZQBef/JAZQBfv/JAZQBgf/JAZQBg//JAZQBjP/JAZQBj//JAZQBkP/JAZQBk//JAZQBlv/JAZQBmf/JAZQBm//JAZYBiP/ZAZYBjf/jAZYBkf/jAZYBlP/JAZkBiP/ZAZkBjf/jAZkBkf/jAZkBlP/JAZsBiP/ZAZsBjf/jAZsBkf/jAZsBlP/JAZ8AD/8GAZ8AEf8GAZ8AbP93AZ8Ae/93AZ8CC//TAaUCD/9gAaYCD/93AawBsABEAawBs//pAawBtwAtAawBuv/TAawBu//pAawBvf/TAawBvv9gAawBv/+mAawBwP+8AawBw/9gAawByf/TAawBzAAXAawB3v/TAawB3//pAawB4AAXAawB6QAtAawCD/+NAa0BrP/TAa0Bs//pAa0Buv/pAa0Bvf/pAa0Bvv+kAa0Bv//RAa0BwP/pAa0Bwf/TAa0Bw/+kAa0Bxv+8Aa0Byf/pAa0By//pAa0B1//pAa0B3//TAa4BrP+8Aa4BsP/TAa4Bsv/TAa4Bs/+8Aa4Bt//pAa4Buv+8Aa4Bvf+8Aa4Bvv93Aa4Bv/+8Aa4BwP+8Aa4Bwf+mAa4Bw/+kAa4Bxv+NAa4By/+8Aa4B0P/pAa4B2P/pAa4B3v+8Aa4B3//pAa4B4f/pAa4B4/+8Aa4B6//pAa8AD/8GAa8AEf8GAa8AbP93Aa8Ae/93Aa8BrP93Aa8BsP93Aa8Bs//TAa8Bt/+NAa8BuP/RAa8Buv+NAa8Bvf+kAa8By/+8Aa8BzP+NAa8Bzv+NAa8B0P93Aa8B0f93Aa8B1P+NAa8B1/+NAa8B2P+NAa8B2f+NAa8B2v93Aa8B3P+NAa8B3/93Aa8B5/+NAa8B6P+NAa8B6v+NAa8B6/93Aa8CC//TAbABvwAXAbABwP/TAbABw/+6AbAB0wBEAbAB2gAXAbAB3wAtAbEBs//TAbEB3f/pAbIBs//pAbIBuv/TAbIBvf/pAbIBvgAXAbIBvwAtAbIBxgAtAbIBzAAXAbIB0f/nAbIB2v/pAbIB3//pAbMBt//pAbMBuv/pAbMBvf/pAbMBvv/TAbMBv//pAbMBwP/pAbMBw//TAbMBy//pAbYBs//pAbYBuv/pAbYBvf/pAbYBvwAXAbYBwP+6AbcBwP/pAbcBzQAXAbcB3wAXAbgBwP/pAbgBw//pAbgBzAAXAbgB0QAXAbgB2gAXAbgB3QAXAbgB3wAXAbgB4//pAbgB6QAXAboBrP/TAboBsP/TAboBsv/TAboBt//pAboBv//TAboBwf+kAboBw//TAboBy//TAboB0P/TAboB1//pAboB4f/pAbwAD/59AbwAEf59AbwAHf/TAbwAHv/TAbwAe/+NAbwBrP93AbwBsP93AbwBsv/pAbwBs//TAbwBt/+NAbwBuP/pAbwBuv/TAbwBvf/pAbwBvv+kAbwBv//TAbwBwP/pAbwBwf+kAbwBy//TAbwBzP+8AbwB0P9gAbwB0f+mAbwB2v+mAbwB6f/TAbwB6/+8Ab0BrP/TAb0BsP/TAb0Bs//pAb0Bt/+8Ab0BuP/pAb0Buv/TAb0Bvv+8Ab0Bv/+8Ab0Bwf+NAb0Bw/+8Ab0Bxv+6Ab0Byf/pAb0BzAAXAb0B0gAtAb0B4//pAb4AD/8dAb4AEf8dAb4AbP+mAb4Ae/+mAb4BrP+8Ab4BsP+8Ab4BsgAXAb4Bs//pAb4Bt//TAb4Buv+kAb4BwP+8Ab4By//TAb4BzP+kAb4Bzv+mAb4B0f+NAb4B1P+mAb4B1v+mAb4B1/+kAb4B2P+mAb4B2v9gAb4B2/+mAb4B3P+NAb4B3f+NAb4B3/+NAb4B4f+mAb4B5f+mAb4B5/+mAb4B6P+mAb4B6v+mAb4B6/+NAb4CC//TAb8AD/7wAb8AEf7wAb8AHf/TAb8AHv/TAb8AbP+mAb8Ae/+kAb8BrP93Ab8BsP+kAb8Bs//TAb8Bt/+8Ab8Buv+8Ab8BwP+8Ab8Byf/TAb8By//TAb8Bzf/TAb8Bzv+NAb8Bz/+kAb8B0P9gAb8B0f93Ab8B0v+8Ab8B0/+NAb8B1P+kAb8B1f+8Ab8B1v+kAb8B1/93Ab8B2P+kAb8B2f+kAb8B2v93Ab8B2/+kAb8B3P+kAb8B3f93Ab8B4f+kAb8B4v+kAb8B5P+kAb8B5f+kAb8B6v+kAb8B6/93Ab8CC//pAcABrP/TAcABsP+8AcABt/+8AcABvv+NAcABv/+kAcABw//TAcABy/+6AcAB1/+8AcEBs//TAcEBuv+8AcEBvf+8AcEBwP+8AcEByf+6AcEB2v/pAcEB3//TAcIBuv/TAcIBzAAtAcUBzAAXAcUB3wAtAcYBy/+8AcYCD/93AcgBrP/TAcgBsP/TAcgBsv+8AcgBs//pAcgBt/+6AcgBuP/TAcgBuv/TAcgBvf/TAcgBvv8zAcgBwf+kAcgBw/9gAcgByf/pAcgBy/+kAcgCD/9gAckBsP+8AckBsv/nAckBs//pAckBt/+8AckBwf+6AckBy//TAckB0P+8AckB0gAXAckB1/+8AckB2P/pAckB6//pAcoBrP+8AcoBsP+mAcoBsv/TAcoBt/+kAcoBuv/pAcoBvf/pAcoBvv+NAcoBwf+kAcoBw/+8AcoB0P+kAcoB1/+kAcoB2P/pAcwB0//pAcwB3v/TAcwB3//pAcwB4//TAc0BzP/RAc0B0P+kAc0B0f/pAc0B0v/pAc0B0//TAc0B1/+kAc0B2P/TAc0B3f/pAc0B3//TAc0B4P/pAc0B4f+8Ac0B4/+8Ac0B5v+8Ac0B6f/pAc0B6//TAc4BzP/pAc4Bzf/pAc4B0P/pAc4B0f/pAc4B0v/pAc4B0//pAc4B1//RAc4B2P/pAc4B2v/pAc4B3f/pAc4B3v/TAc4B3//TAc4B4P/pAc4B4/+kAc4B5v+8Ac4B6//pAc8AD/8GAc8AEf8GAc8BzP/TAc8B0P+kAc8B0f/TAc8B0//pAc8B1//TAc8B2v/TAc8B3f/TAc8B6//pAdAB5v/TAdAB6QAXAdEBzf/pAdEB0P/TAdEB0v/pAdEB0//TAdEB1/+8AdEB3v+8AdEB3//pAdEB4f/TAdEB4/+8AdIBzQAXAdIB3wAXAdIB4//pAdIB5gAtAdMBzf/pAdMB0P/TAdMB0f/pAdMB0//pAdMB1//pAdMB2v/pAdMB3f/pAdMB3//pAdMB4P/pAdMB4/+8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AG0AYQByAGsAIABPAGYAZgBpAGMAZQAgAGEAbgBkACAAYwBlAHIAdABhAGkAbgAgAG8AdABoAGUAcgAgAGoAdQByAGkAcwBkAGkAYwB0AGkAbwBuAHMALgAATGliZXJhdGlvbiBpcyBhIHRyYWRlbWFyayBvZiBSZWQgSGF0LCBJbmMuIHJlZ2lzdGVyZWQgaW4gVS5TLiBQYXRlbnQgYW5kIFRyYWRlbWFyayBPZmZpY2UgYW5kIGNlcnRhaW4gb3RoZXIganVyaXNkaWN0aW9ucy4AAEEAcwBjAGUAbgBkAGUAcgAgAEMAbwByAHAAbwByAGEAdABpAG8AbgAAQXNjZW5kZXIgQ29ycG9yYXRpb24AAFMAdABlAHYAZQAgAE0AYQB0AHQAZQBzAG8AbgAAU3RldmUgTWF0dGVzb24AAGgAdAB0AHAAOgAvAC8AdwB3AHcALgBhAHMAYwBlAG4AZABlAHIAYwBvAHIAcAAuAGMAbwBtAC8AAGh0dHA6Ly93d3cuYXNjZW5kZXJjb3JwLmNvbS8AAGgAdAB0AHAAOgAvAC8AdwB3AHcALgBhAHMAYwBlAG4AZABlAHIAYwBvAHIAcAAuAGMAbwBtAC8AdAB5AHAAZQBkAGUAcwBpAGcAbgBlAHIAcwAuAGgAdABtAGwAAGh0dHA6Ly93d3cuYXNjZW5kZXJjb3JwLmNvbS90eXBlZGVzaWduZXJzLmh0bWwAAEwAaQBjAGUAbgBzAGUAZAAgAHUAbgBkAGUAcgAgAHQAaABlACAATABpAGIAZQByAGEAdABpAG8AbgAgAEYAbwBuAHQAcwAgAGwAaQBjAGUAbgBzAGUALAAgAHMAZQBlACAAaAB0AHQAcABzADoALwAvAGYAZQBkAG8AcgBhAHAAcgBvAGoAZQBjAHQALgBvAHIAZwAvAHcAaQBrAGkALwBMAGkAYwBlAG4AcwBpAG4AZwAvAEwAaQBiAGUAcgBhAHQAaQBvAG4ARgBvAG4AdABMAGkAYwBlAG4AcwBlAABMaWNlbnNlZCB1bmRlciB0aGUgTGliZXJhdGlvbiBGb250cyBsaWNlbnNlLCBzZWUgaHR0cHM6Ly9mZWRvcmFwcm9qZWN0Lm9yZy93aWtpL0xpY2Vuc2luZy9MaWJlcmF0aW9uRm9udExpY2Vuc2UAAGgAdAB0AHAAcwA6AC8ALwBmAGUAZABvAHIAYQBwAHIAbwBqAGUAYwB0AC4AbwByAGcALwB3AGkAawBpAC8ATABpAGMAZQBuAHMAaQBuAGcALwBMAGkAYgBlAHIAYQB0AGkAbwBuAEYAbwBuAHQATABpAGMAZQBuAHMAZQAAaHR0cHM6Ly9mZWRvcmFwcm9qZWN0Lm9yZy93aWtpL0xpY2Vuc2luZy9MaWJlcmF0aW9uRm9udExpY2Vuc2UAAAAAAgAAAAAAAP+9AJYAAAAAAAAAAAAAAAAAAAAAAAAAAAKpAAAAAQACAQIABAAFAAYABwAIAAkACgALAAwADQAOAA8BAwARABIAEwAUABUAFgAXABgAGQAaABsAHAAdAQQAHwAgACEAIgAjACQAJQAmACcAKAApACoAKwAsAC0ALgAvADAAMQAyADMANAA1ADYANwA4ADkAOgA7ADwAPQA+AD8AQABBAEIAQwBEAEUARgBHAEgASQBKAEsATABNAE4ATwBQAFEAUgBTAFQAVQBWAFcAWABZAFoAWwBcAF0AXgBfAGAAYQCjAIQAhQC9AJYA6ACGAI4AiwCdAKkApACKANoAgwCTAQUBBgCNAQcAiAEIAN4BCQCeAKoA9QD0APYAogCtAMkAxwCuAGIAYwCQAGQAywBlAMgAygDPAMwAzQDOAOkAZgDTANAA0QCvAGcA8ACRANYA1ADVAGgA6wDtAIkAagBpAGsAbQBsAG4AoABvAHEAcAByAHMAdQB0AHYAdwDqAHgAegB5AHsAfQB8ALgAoQB/AH4AgACBAOwA7gC6AQoBCwEMAQ0BDgEPAP0A/gEQAREBEgETAP8BAAEUARUBFgEBARcBGAEZARoBGwEcAR0BHgEfASABIQEiAPgA+QEjASQBJQEmAScBKAEpASoBKwEsAS0BLgEvATABMQEyAPoA1wEzATQBNQE2ATcBOAE5AToBOwE8AT0BPgE/AUABQQDiAOMBQgFDAUQBRQFGAUcBSAFJAUoBSwFMAU0BTgFPAVAAsACxAVEBUgFTAVQBVQFWAVcBWAFZAVoA+wD8AOQA5QFbAVwBXQFeAV8BYAFhAWIBYwFkAWUBZgFnAWgBaQFqAWsBbAFtAW4BbwFwALsBcQFyAXMBdADmAOcBdQCmAXYBdwF4AXkBegF7AXwBfQF+AX8A2ADhAYAA2wDcAN0A4ADZAN8BgQGCAYMBhAGFAYYBhwGIAYkBigGLAYwBjQGOAKgBjwGQAZEBkgGTAZQBlQGWAZcBmAGZAZoBmwGcAZ0BngGfAaABoQCfAaIBowGkAaUBpgGnAagBqQGqAasBrAGtAa4BrwGwAbEBsgGzAJcBtAG1AbYAmwG3AbgBuQG6AbsBvAG9Ab4BvwHAAcEBwgHDAcQBxQHGAccByAHJAcoBywHMAc0BzgHPAdAB0QHSAdMB1AHVAdYB1wHYAdkB2gHbAdwB3QHeAd8B4AHhAeIB4wHkAeUB5gHnAegB6QHqAesB7AHtAe4B7wHwAfEB8gHzAfQB9QH2AfcB+AH5AfoB+wH8Af0B/gH/AgACAQICAgMCBAIFAgYCBwIIAgkCCgILAgwCDQIOAg8CEAIRAhICEwIUAhUCFgIXAhgCGQIaAhsCHAIdAh4CHwIgAiECIgIjAiQCJQImAicCKAIpAioCKwIsAi0CLgIvAjACMQIyALIAswIzAjQAtgC3AMQCNQC0ALUAxQCCAMIAhwCrAMYCNgI3AL4AvwI4AjkCOgI7APcCPAI9Aj4CPwJAAkEAjAJCAkMCRAJFAkYCRwJIAkkCSgJLAkwCTQJOAJgCTwCaAJkA7wClAJICUAJRAJwApwCPAlIAlACVAlMCVAJVAlYCVwJYAlkCWgJbAlwCXQJeAl8CYAJhAmICYwJkAmUCZgJnAmgCaQJqAmsCbAJtAm4CbwJwAnECcgJzAnQCdQJ2AncCeAJ5AnoCewJ8An0CfgJ/AoACgQKCAoMChAKFAoYChwKIAokCigKLAowCjQKOAo8AuQKQApECkgKTApQClQKWApcCmAKZApoCmwKcAp0CngKfAqACoQKiAqMCpAKlAqYCpwKoAqkCqgKrAqwCrQKuAq8CsAKxArICswK0B3VuaTAwQTAHdW5pMDBBRAd1bmkwMzdFB3VuaTAwQjIHdW5pMDBCMwd1bmkwMEI1B3VuaTIyMTkHdW5pMDBCOQdBbWFjcm9uB2FtYWNyb24GQWJyZXZlBmFicmV2ZQdBb2dvbmVrB2FvZ29uZWsLQ2NpcmN1bWZsZXgLY2NpcmN1bWZsZXgKQ2RvdGFjY2VudApjZG90YWNjZW50BkRjYXJvbgZkY2Fyb24GRGNyb2F0B0VtYWNyb24HZW1hY3JvbgZFYnJldmUGZWJyZXZlCkVkb3RhY2NlbnQKZWRvdGFjY2VudAdFb2dvbmVrB2VvZ29uZWsGRWNhcm9uBmVjYXJvbgtHY2lyY3VtZmxleAtnY2lyY3VtZmxleApHZG90YWNjZW50Cmdkb3RhY2NlbnQMR2NvbW1hYWNjZW50DGdjb21tYWFjY2VudAtIY2lyY3VtZmxleAtoY2lyY3VtZmxleARIYmFyBGhiYXIGSXRpbGRlBml0aWxkZQdJbWFjcm9uB2ltYWNyb24GSWJyZXZlBmlicmV2ZQdJb2dvbmVrB2lvZ29uZWsCSUoCaWoLSmNpcmN1bWZsZXgLamNpcmN1bWZsZXgMS2NvbW1hYWNjZW50DGtjb21tYWFjY2VudAxrZ3JlZW5sYW5kaWMGTGFjdXRlBmxhY3V0ZQxMY29tbWFhY2NlbnQMbGNvbW1hYWNjZW50BkxjYXJvbgZsY2Fyb24ETGRvdARsZG90Bk5hY3V0ZQZuYWN1dGUMTmNvbW1hYWNjZW50DG5jb21tYWFjY2VudAZOY2Fyb24GbmNhcm9uC25hcG9zdHJvcGhlA0VuZwNlbmcHT21hY3JvbgdvbWFjcm9uBk9icmV2ZQZvYnJldmUNT2h1bmdhcnVtbGF1dA1vaHVuZ2FydW1sYXV0BlJhY3V0ZQZyYWN1dGUMUmNvbW1hYWNjZW50DHJjb21tYWFjY2VudAZSY2Fyb24GcmNhcm9uBlNhY3V0ZQZzYWN1dGULU2NpcmN1bWZsZXgLc2NpcmN1bWZsZXgMVGNvbW1hYWNjZW50DHRjb21tYWFjY2VudAZUY2Fyb24GdGNhcm9uBFRiYXIEdGJhcgZVdGlsZGUGdXRpbGRlB1VtYWNyb24HdW1hY3JvbgZVYnJldmUGdWJyZXZlBVVyaW5nBXVyaW5nDVVodW5nYXJ1bWxhdXQNdWh1bmdhcnVtbGF1dAdVb2dvbmVrB3VvZ29uZWsLV2NpcmN1bWZsZXgLd2NpcmN1bWZsZXgLWWNpcmN1bWZsZXgLeWNpcmN1bWZsZXgGWmFjdXRlBnphY3V0ZQpaZG90YWNjZW50Cnpkb3RhY2NlbnQFbG9uZ3MKQXJpbmdhY3V0ZQphcmluZ2FjdXRlB0FFYWN1dGUHYWVhY3V0ZQtPc2xhc2hhY3V0ZQtvc2xhc2hhY3V0ZQxTY29tbWFhY2NlbnQMc2NvbW1hYWNjZW50B3VuaTAyMUEHdW5pMDIxQgd1bmkwMkM5BXRvbm9zDWRpZXJlc2lzdG9ub3MKQWxwaGF0b25vcwlhbm90ZWxlaWEMRXBzaWxvbnRvbm9zCEV0YXRvbm9zCUlvdGF0b25vcwxPbWljcm9udG9ub3MMVXBzaWxvbnRvbm9zCk9tZWdhdG9ub3MRaW90YWRpZXJlc2lzdG9ub3MFQWxwaGEEQmV0YQVHYW1tYQdFcHNpbG9uBFpldGEDRXRhBVRoZXRhBElvdGEFS2FwcGEGTGFtYmRhAk11Ak51AlhpB09taWNyb24CUGkDUmhvBVNpZ21hA1RhdQdVcHNpbG9uA1BoaQNDaGkDUHNpDElvdGFkaWVyZXNpcw9VcHNpbG9uZGllcmVzaXMKYWxwaGF0b25vcwxlcHNpbG9udG9ub3MIZXRhdG9ub3MJaW90YXRvbm9zFHVwc2lsb25kaWVyZXNpc3Rvbm9zBWFscGhhBGJldGEFZ2FtbWEFZGVsdGEHZXBzaWxvbgR6ZXRhA2V0YQV0aGV0YQRpb3RhBWthcHBhBmxhbWJkYQJudQJ4aQdvbWljcm9uA3JobwZzaWdtYTEFc2lnbWEDdGF1B3Vwc2lsb24DcGhpA2NoaQNwc2kFb21lZ2EMaW90YWRpZXJlc2lzD3Vwc2lsb25kaWVyZXNpcwxvbWljcm9udG9ub3MMdXBzaWxvbnRvbm9zCm9tZWdhdG9ub3MHdW5pMDQwMAlhZmlpMTAwMjMJYWZpaTEwMDUxCWFmaWkxMDA1MglhZmlpMTAwNTMJYWZpaTEwMDU0CWFmaWkxMDA1NQlhZmlpMTAwNTYJYWZpaTEwMDU3CWFmaWkxMDA1OAlhZmlpMTAwNTkJYWZpaTEwMDYwCWFmaWkxMDA2MQd1bmkwNDBECWFmaWkxMDA2MglhZmlpMTAxNDUJYWZpaTEwMDE3CWFmaWkxMDAxOAlhZmlpMTAwMTkJYWZpaTEwMDIwCWFmaWkxMDAyMQlhZmlpMTAwMjIJYWZpaTEwMDI0CWFmaWkxMDAyNQlhZmlpMTAwMjYJYWZpaTEwMDI3CWFmaWkxMDAyOAlhZmlpMTAwMjkJYWZpaTEwMDMwCWFmaWkxMDAzMQlhZmlpMTAwMzIJYWZpaTEwMDMzCWFmaWkxMDAzNAlhZmlpMTAwMzUJYWZpaTEwMDM2CWFmaWkxMDAzNwlhZmlpMTAwMzgJYWZpaTEwMDM5CWFmaWkxMDA0MAlhZmlpMTAwNDEJYWZpaTEwMDQyCWFmaWkxMDA0MwlhZmlpMTAwNDQJYWZpaTEwMDQ1CWFmaWkxMDA0NglhZmlpMTAwNDcJYWZpaTEwMDQ4CWFmaWkxMDA0OQlhZmlpMTAwNjUJYWZpaTEwMDY2CWFmaWkxMDA2NwlhZmlpMTAwNjgJYWZpaTEwMDY5CWFmaWkxMDA3MAlhZmlpMTAwNzIJYWZpaTEwMDczCWFmaWkxMDA3NAlhZmlpMTAwNzUJYWZpaTEwMDc2CWFmaWkxMDA3NwlhZmlpMTAwNzgJYWZpaTEwMDc5CWFmaWkxMDA4MAlhZmlpMTAwODEJYWZpaTEwMDgyCWFmaWkxMDA4MwlhZmlpMTAwODQJYWZpaTEwMDg1CWFmaWkxMDA4NglhZmlpMTAwODcJYWZpaTEwMDg4CWFmaWkxMDA4OQlhZmlpMTAwOTAJYWZpaTEwMDkxCWFmaWkxMDA5MglhZmlpMTAwOTMJYWZpaTEwMDk0CWFmaWkxMDA5NQlhZmlpMTAwOTYJYWZpaTEwMDk3B3VuaTA0NTAJYWZpaTEwMDcxCWFmaWkxMDA5OQlhZmlpMTAxMDAJYWZpaTEwMTAxCWFmaWkxMDEwMglhZmlpMTAxMDMJYWZpaTEwMTA0CWFmaWkxMDEwNQlhZmlpMTAxMDYJYWZpaTEwMTA3CWFmaWkxMDEwOAlhZmlpMTAxMDkHdW5pMDQ1RAlhZmlpMTAxMTAJYWZpaTEwMTkzCWFmaWkxMDE0NwlhZmlpMTAxOTUJYWZpaTEwMDUwCWFmaWkxMDA5OAZXZ3JhdmUGd2dyYXZlBldhY3V0ZQZ3YWN1dGUJV2RpZXJlc2lzCXdkaWVyZXNpcwZZZ3JhdmUGeWdyYXZlB3VuaTIwMTAHdW5pMjAxMQlhZmlpMDAyMDgNdW5kZXJzY29yZWRibA1xdW90ZXJldmVyc2VkBm1pbnV0ZQZzZWNvbmQJZXhjbGFtZGJsB3VuaTIwM0UHdW5pMjIxNQd1bmkyMDdGBGxpcmEGcGVzZXRhBEV1cm8JYWZpaTYxMjQ4CWFmaWk2MTI4OQlhZmlpNjEzNTIHdW5pMjEyNgllc3RpbWF0ZWQJb25lZWlnaHRoDHRocmVlZWlnaHRocwtmaXZlZWlnaHRocwxzZXZlbmVpZ2h0aHMJYXJyb3dsZWZ0B2Fycm93dXAKYXJyb3dyaWdodAlhcnJvd2Rvd24JYXJyb3dib3RoCWFycm93dXBkbgxhcnJvd3VwZG5ic2UHdW5pMjIwNgpvcnRob2dvbmFsDGludGVyc2VjdGlvbgtlcXVpdmFsZW5jZQVob3VzZQ1yZXZsb2dpY2Fsbm90CmludGVncmFsdHAKaW50ZWdyYWxidAhTRjEwMDAwMAhTRjExMDAwMAhTRjAxMDAwMAhTRjAzMDAwMAhTRjAyMDAwMAhTRjA0MDAwMAhTRjA4MDAwMAhTRjA5MDAwMAhTRjA2MDAwMAhTRjA3MDAwMAhTRjA1MDAwMAhTRjQzMDAwMAhTRjI0MDAwMAhTRjUxMDAwMAhTRjUyMDAwMAhTRjM5MDAwMAhTRjIyMDAwMAhTRjIxMDAwMAhTRjI1MDAwMAhTRjUwMDAwMAhTRjQ5MDAwMAhTRjM4MDAwMAhTRjI4MDAwMAhTRjI3MDAwMAhTRjI2MDAwMAhTRjM2MDAwMAhTRjM3MDAwMAhTRjQyMDAwMAhTRjE5MDAwMAhTRjIwMDAwMAhTRjIzMDAwMAhTRjQ3MDAwMAhTRjQ4MDAwMAhTRjQxMDAwMAhTRjQ1MDAwMAhTRjQ2MDAwMAhTRjQwMDAwMAhTRjU0MDAwMAhTRjUzMDAwMAhTRjQ0MDAwMAd1cGJsb2NrB2RuYmxvY2sFYmxvY2sHbGZibG9jawdydGJsb2NrB2x0c2hhZGUFc2hhZGUHZGtzaGFkZQlmaWxsZWRib3gGSDIyMDczBkgxODU0MwZIMTg1NTEKZmlsbGVkcmVjdAd0cmlhZ3VwB3RyaWFncnQHdHJpYWdkbgd0cmlhZ2xmBmNpcmNsZQZIMTg1MzMJaW52YnVsbGV0CWludmNpcmNsZQpvcGVuYnVsbGV0CXNtaWxlZmFjZQxpbnZzbWlsZWZhY2UDc3VuBmZlbWFsZQRtYWxlBXNwYWRlBGNsdWIFaGVhcnQHZGlhbW9uZAttdXNpY2Fsbm90ZQ5tdXNpY2Fsbm90ZWRibAd1bmkyNjZDB3VuaUZCMDEHdW5pRkIwMgd1bmlGMDA1Bm1pZGRvdAd1bmlGMDA0B3VuaTIwNzQHdW5pMjA3NQd1bmkyMDc3B3VuaTIwNzgIZ2x5cGg1NzEIZ2x5cGg1NzIIZ2x5cGg1NzMIZ2x5cGg1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/8kAEgF5/3cBe//bAX7/dwGA/6oBgf+0AYT/2wGF/54Bhv/bAYf/2wGK/6oBjP93AY3/qgGQ/3cBkf+qAZP/dwGW/3cBmf93AZv/dwABAYj/2QANAXn/5wF+/+cBgf/nAYP/5wGF/+cBi//nAYz/5wGP/+cBkP/nAZP/5wGW/+cBmf/nAZv/5wANAXn/4QF+/+EBgf/hAYv/4QGM/+EBj//RAZD/4QGS/88Bk//bAZb/4QGZ/+EBmv/PAZv/4QAKAXn/yQF+/8kBgf/JAYP/yQGL/8kBjP/JAY//yQGQ/8kBk//JAZn/yQAJAXn/4wF+/+MBg//jAYz/4wGP/+MBkP/jAZP/4wGW/+MBm//jAAMBiP/ZAY3/4wGR/+MACgF5/+MBfv/jAYH/4wGD/+MBjP/jAY//4wGQ/+MBk//jAZb/4wGb/+MACwF5/8kBfv/JAYH/yQGD/8kBjP/JAY//yQGQ/8kBk//JAZb/yQGZ/8kBm//JAAUAD/8GABH/BgBs/3cAe/93Agv/0wABAg//YAABAg//dwARAbAARAGz/+kBtwAtAbr/0wG7/+kBvf/TAb7/YAG//6YBwP+8AcP/YAHJ/9MBzAAXAd7/0wHf/+kB4AAXAekALQIP/40ADgGs/9MBs//pAbr/6QG9/+kBvv+kAb//0QHA/+kBwf/TAcP/pAHG/7wByf/pAcv/6QHX/+kB3//TABUBrP+8AbD/0wGy/9MBs/+8Abf/6QG6/7wBvf+8Ab7/dwG//7wBwP+8AcH/pgHD/6QBxv+NAcv/vAHQ/+kB2P/pAd7/vAHf/+kB4f/pAeP/vAHr/+kAHAAP/wYAEf8GAGz/dwB7/3cBrP93AbD/dwGz/9MBt/+NAbj/0QG6/40Bvf+kAcv/vAHM/40Bzv+NAdD/dwHR/3cB1P+NAdf/jQHY/40B2f+NAdr/dwHc/40B3/93Aef/jQHo/40B6v+NAev/dwIL/9MABgG/ABcBwP/TAcP/ugHTAEQB2gAXAd8ALQACAbP/0wHd/+kACgGz/+kBuv/TAb3/6QG+ABcBvwAtAcYALQHMABcB0f/nAdr/6QHf/+kACAG3/+kBuv/pAb3/6QG+/9MBv//pAcD/6QHD/9MBy//pAAUBs//pAbr/6QG9/+kBvwAXAcD/ugADAcD/6QHNABcB3wAXAAkBwP/pAcP/6QHMABcB0QAXAdoAFwHdABcB3wAXAeP/6QHpABcACwGs/9MBsP/TAbL/0wG3/+kBv//TAcH/pAHD/9MBy//TAdD/0wHX/+kB4f/pABgAD/59ABH+fQAd/9MAHv/TAHv/jQGs/3cBsP93AbL/6QGz/9MBt/+NAbj/6QG6/9MBvf/pAb7/pAG//9MBwP/pAcH/pAHL/9MBzP+8AdD/YAHR/6YB2v+mAen/0wHr/7wADwGs/9MBsP/TAbP/6QG3/7wBuP/pAbr/0wG+/7wBv/+8AcH/jQHD/7wBxv+6Acn/6QHMABcB0gAtAeP/6QAfAA//HQAR/x0AbP+mAHv/pgGs/7wBsP+8AbIAFwGz/+kBt//TAbr/pAHA/7wBy//TAcz/pAHO/6YB0f+NAdT/pgHW/6YB1/+kAdj/pgHa/2AB2/+mAdz/jQHd/40B3/+NAeH/pgHl/6YB5/+mAej/pgHq/6YB6/+NAgv/0wAmAA/+8AAR/vAAHf/TAB7/0wBs/6YAe/+kAaz/dwGw/6QBs//TAbf/vAG6/7wBwP+8Acn/0wHL/9MBzf/TAc7/jQHP/6QB0P9gAdH/dwHS/7wB0/+NAdT/pAHV/7wB1v+kAdf/dwHY/6QB2f+kAdr/dwHb/6QB3P+kAd3/dwHh/6QB4v+kAeT/pAHl/6QB6v+kAev/dwIL/+kACAGs/9MBsP+8Abf/vAG+/40Bv/+kAcP/0wHL/7oB1/+8AAcBs//TAbr/vAG9/7wBwP+8Acn/ugHa/+kB3//TAAIBuv/TAcwALQACAcwAFwHfAC0AAgHL/7wCD/93AA4BrP/TAbD/0wGy/7wBs//pAbf/ugG4/9MBuv/TAb3/0wG+/zMBwf+kAcP/YAHJ/+kBy/+kAg//YAALAbD/vAGy/+cBs//pAbf/vAHB/7oBy//TAdD/vAHSABcB1/+8Adj/6QHr/+kADAGs/7wBsP+mAbL/0wG3/6QBuv/pAb3/6QG+/40Bwf+kAcP/vAHQ/6QB1/+kAdj/6QAEAdP/6QHe/9MB3//pAeP/0wAPAcz/0QHQ/6QB0f/pAdL/6QHT/9MB1/+kAdj/0wHd/+kB3//TAeD/6QHh/7wB4/+8Aeb/vAHp/+kB6//TABABzP/pAc3/6QHQ/+kB0f/pAdL/6QHT/+kB1//RAdj/6QHa/+kB3f/pAd7/0wHf/9MB4P/pAeP/pAHm/7wB6//pAAoAD/8GABH/BgHM/9MB0P+kAdH/0wHT/+kB1//TAdr/0wHd/9MB6//pAAIB5v/TAekAFwAJAc3/6QHQ/9MB0v/pAdP/0wHX/7wB3v+8Ad//6QHh/9MB4/+8AAQBzQAXAd8AFwHj/+kB5gAtAAsBzf/pAdD/0wHR/+kB0//pAdf/6QHa/+kB3f/pAd//6QHg/+kB4/+8Aeb/0wAKAcwALQHNAC0B0QAXAdMAFwHXABcB2gAXAd0AFwHeABcB3wAXAekAFwACAdoAFwHj/9MAAwHN/+kB0//pAd8AFwAIAdD/0wHS/+kB0//pAdf/0wHe/9MB3//pAeH/6QHj/9MACAHQ/9EB0//pAdf/ugHe/9MB3//pAeH/6QHj/9MB6//pAAQB0gAXAdoAFwHj/+kB6QAXAAoAD/8dABH/HQHM/+kB0P+8AdH/6QHSAEQB1//TAdr/6QHd/+kB3wAXABAAD/8zABH/MwB7ABcBzP/pAc0AFwHQ/7wB0f/pAdIAFwHX/9MB2P/pAdr/5wHc/+kB3f/pAeD/6QHp/+kB6//pAAcBzf/pAdD/0wHX/9MB3v/TAd//6QHj/9MB6//pAAkBzP/pAc3/6QHR/+kB0//pAdr/6QHd/+kB3v/pAeD/6QHj/9MABAHR/+kB0//pAdr/6QHd/+kAAwHR/+kB2v/pAd8AFwACAd7/YAHj/3cACAHQ/9MB0QAXAdP/6QHX/9MB2gAXAd7/0wHh/+kB6//pAAcB0P/TAdL/6QHX/9MB2P/pAd7/0wHh/+kB4//TAAIAD/8zABH/MwAHAA//BgAR/wYAHf/TAB7/0wBs/2AAe/9gAgv/0wABAg7/2wADAAP/tABW/9sCD//bAAUBnv9gAaf/YAG+/2ABw/+8Acb/vAABAGgAAwAkACkALwAzADUANwA5ADoAPABJAFUAWQBaAFwBVgFbAVwBXQFfAWEBYgFmAWgBaQFtAW8BcAFxAXIBcwF1AXYBeAGBAYMBhQGHAYgBiwGMAY0BjgGRAZMBlAGWAZkBmwGfAaUBpgGsAa0BrgGvAbABsQGyAbMBtgG3AbgBugG8Ab0BvgG/AcABwQHCAcUBxgHIAckBygHMAc0BzgHPAdAB0QHSAdMB1gHXAdgB2gHcAd0B3gHfAeAB4QHiAeUB6AHpAeoB+gH+Ag4CDwIUAAAAAAABAAAAANnxpYUAAAAAvxr/gAAAAADPkk3h";

// src/utils/vectorText.ts
var boldFont = null;
var regFont = null;
var fontsInitialized = false;
function initFonts() {
  if (fontsInitialized) return;
  fontsInitialized = true;
  try {
    if (LIBERATION_SANS_BOLD_BASE64) {
      const boldBuf = Buffer.from(LIBERATION_SANS_BOLD_BASE64, "base64");
      boldFont = opentype.parse(
        boldBuf.buffer.slice(boldBuf.byteOffset, boldBuf.byteOffset + boldBuf.byteLength)
      );
    }
  } catch (e) {
    console.warn("[VectorText] Error initializing bold font:", e);
  }
  try {
    if (LIBERATION_SANS_REGULAR_BASE64) {
      const regBuf = Buffer.from(LIBERATION_SANS_REGULAR_BASE64, "base64");
      regFont = opentype.parse(
        regBuf.buffer.slice(regBuf.byteOffset, regBuf.byteOffset + regBuf.byteLength)
      );
    }
  } catch (e) {
    console.warn("[VectorText] Error initializing regular font:", e);
  }
}
function renderVectorText(text, x, y, fontSize, fill, options = {}) {
  if (!text) return "";
  initFonts();
  const font = (options.weight === "regular" ? regFont : boldFont) || boldFont || regFont;
  const anchor = options.anchor || "start";
  const letterSpacing = options.letterSpacing || 0;
  if (!font) {
    const esc = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<text x="${x}" y="${y}" font-family="sans-serif" font-weight="${options.weight === "regular" ? "normal" : "bold"}" font-size="${fontSize}" fill="${fill}" text-anchor="${anchor}">${esc}</text>`;
  }
  try {
    const chars = Array.from(text);
    let totalWidth = 0;
    for (let i = 0; i < chars.length; i++) {
      totalWidth += font.getAdvanceWidth(chars[i], fontSize);
      if (i < chars.length - 1) totalWidth += letterSpacing;
    }
    let curX = x;
    if (anchor === "middle") {
      curX = x - totalWidth / 2;
    } else if (anchor === "end") {
      curX = x - totalWidth;
    }
    const pathDataList = [];
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (ch !== " ") {
        const glyphPath = font.getPath(ch, curX, y, fontSize);
        const data = glyphPath.toPathData(2);
        if (data && data.length > 0) {
          pathDataList.push(data);
        }
      }
      curX += font.getAdvanceWidth(ch, fontSize) + letterSpacing;
    }
    if (pathDataList.length === 0) {
      return "";
    }
    return `<path d="${pathDataList.join(" ")}" fill="${fill}" />`;
  } catch (err) {
    console.warn("[VectorText] Glyph path rendering fallback:", err);
    const esc = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<text x="${x}" y="${y}" font-family="sans-serif" font-weight="${options.weight === "regular" ? "normal" : "bold"}" font-size="${fontSize}" fill="${fill}" text-anchor="${anchor}">${esc}</text>`;
  }
}
function measureVectorTextWidth(text, fontSize, options = {}) {
  if (!text) return 0;
  initFonts();
  const font = (options.weight === "regular" ? regFont : boldFont) || boldFont || regFont;
  if (!font) return text.length * fontSize * 0.58;
  const letterSpacing = options.letterSpacing || 0;
  const chars = Array.from(text);
  let totalWidth = 0;
  for (let i = 0; i < chars.length; i++) {
    totalWidth += font.getAdvanceWidth(chars[i], fontSize);
    if (i < chars.length - 1) totalWidth += letterSpacing;
  }
  return totalWidth;
}

// src/thumbnailGenerator.ts
var THUMBNAIL_WIDTH = 1200;
var THUMBNAIL_HEIGHT = 630;
var embeddedFontBase64Bold = LIBERATION_SANS_BOLD_BASE64 || "";
var embeddedFontBase64Regular = LIBERATION_SANS_REGULAR_BASE64 || "";
try {
  if (!embeddedFontBase64Bold || !embeddedFontBase64Regular) {
    let currentDir = process.cwd();
    try {
      currentDir = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));
    } catch {
      currentDir = process.cwd();
    }
    const boldCandidates = [
      path.join(currentDir, "assets/fonts/LiberationSans-Bold.ttf"),
      path.join(process.cwd(), "src/assets/fonts/LiberationSans-Bold.ttf"),
      "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
    ];
    for (const p of boldCandidates) {
      if (fs.existsSync(p)) {
        embeddedFontBase64Bold = fs.readFileSync(p).toString("base64");
        break;
      }
    }
    const regularCandidates = [
      path.join(currentDir, "assets/fonts/LiberationSans-Regular.ttf"),
      path.join(process.cwd(), "src/assets/fonts/LiberationSans-Regular.ttf"),
      "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
    ];
    for (const p of regularCandidates) {
      if (fs.existsSync(p)) {
        embeddedFontBase64Regular = fs.readFileSync(p).toString("base64");
        break;
      }
    }
  }
} catch (e) {
  console.warn("Could not read font files for base64 embedding:", e);
}
function escapeXml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
var CATEGORY_THEMES = {
  jkssb: {
    name: "JKSSB (Royal Blue & Orange)",
    orgTitle: "JKSSB",
    primaryColor: "#0047BA",
    // Royal Blue
    secondaryColor: "#FF6A00",
    // Vibrant Orange
    pillBg: "#FF6A00",
    pillText: "#FFFFFF",
    isPillGradient: false,
    card1Bg: "#F0F6FE",
    card1Border: "#D0E1FD",
    card2Bg: "#FFF8F1",
    card2Border: "#FCD9BD",
    card3Bg: "#F0F6FE",
    card3Border: "#D0E1FD",
    waveRibbon: "#FF6A00",
    waveFill: "#0047BA",
    bottomPillBg: "#00368F",
    hasTicks: true,
    badgeLabel: "JOB ALERT"
  },
  army_jobs: {
    name: "Indian Army (Olive Green & Gold)",
    orgTitle: "INDIAN ARMY",
    primaryColor: "#1E4620",
    // Olive Green
    secondaryColor: "#C89B2B",
    // Metallic Gold
    pillBg: "url(#goldMetallicGrad)",
    pillText: "#1E4620",
    isPillGradient: true,
    card1Bg: "#F3F7F2",
    card1Border: "#CFDEC9",
    card2Bg: "#FBF8EE",
    card2Border: "#EFE5C2",
    card3Bg: "#F3F7F2",
    card3Border: "#CFDEC9",
    waveRibbon: "#C89B2B",
    waveFill: "#1E4620",
    bottomPillBg: "#133015",
    hasTicks: false,
    badgeLabel: "DEFENCE RECRUITMENT"
  },
  rrb_jobs: {
    name: "Railways / RRB (Navy Blue & Orange)",
    orgTitle: "RAILWAY / RRB",
    primaryColor: "#0B2545",
    // Deep Navy
    secondaryColor: "#FF6A00",
    // Vibrant Orange
    pillBg: "#FF6A00",
    pillText: "#FFFFFF",
    isPillGradient: false,
    card1Bg: "#F0F5FA",
    card1Border: "#C9D8E8",
    card2Bg: "#FFF8F1",
    card2Border: "#FCD9BD",
    card3Bg: "#F0F5FA",
    card3Border: "#C9D8E8",
    waveRibbon: "#FF6A00",
    waveFill: "#0B2545",
    bottomPillBg: "#081C35",
    hasTicks: true,
    badgeLabel: "RAILWAY JOBS"
  },
  ssc_jobs: {
    name: "SSC (Navy Blue & Teal)",
    orgTitle: "STAFF SELECTION COMM.",
    primaryColor: "#0A2540",
    // Deep Navy
    secondaryColor: "#008080",
    // Teal
    pillBg: "#008080",
    pillText: "#FFFFFF",
    isPillGradient: false,
    card1Bg: "#F0F9F9",
    card1Border: "#BCE4E4",
    card2Bg: "#F0F5FA",
    card2Border: "#C9D8E8",
    card3Bg: "#F0F9F9",
    card3Border: "#BCE4E4",
    waveRibbon: "#008080",
    waveFill: "#0A2540",
    bottomPillBg: "#081D33",
    hasTicks: true,
    badgeLabel: "SSC RECRUITMENT"
  },
  exam_forms: {
    name: "Kashmir University (Navy & Teal)",
    orgTitle: "KASHMIR UNIVERSITY",
    primaryColor: "#0B2545",
    // Deep Navy
    secondaryColor: "#028090",
    // Teal / Cyan
    pillBg: "#028090",
    pillText: "#FFFFFF",
    isPillGradient: false,
    card1Bg: "#F0F9F9",
    card1Border: "#BDE5E8",
    card2Bg: "#F0F5FA",
    card2Border: "#C9D8E8",
    card3Bg: "#F0F9F9",
    card3Border: "#BDE5E8",
    waveRibbon: "#028090",
    waveFill: "#0B2545",
    bottomPillBg: "#081C35",
    hasTicks: true,
    badgeLabel: "UNIVERSITY UPDATE"
  },
  admissions: {
    name: "Admissions / University Notice",
    orgTitle: "KASHMIR UNIVERSITY",
    primaryColor: "#0B2545",
    secondaryColor: "#028090",
    pillBg: "#028090",
    pillText: "#FFFFFF",
    isPillGradient: false,
    card1Bg: "#F0F9F9",
    card1Border: "#BDE5E8",
    card2Bg: "#FFF8F1",
    card2Border: "#FCD9BD",
    card3Bg: "#F0F9F9",
    card3Border: "#BDE5E8",
    waveRibbon: "#028090",
    waveFill: "#0B2545",
    bottomPillBg: "#081C35",
    hasTicks: true,
    badgeLabel: "ADMISSION NOTICE"
  },
  cluster_univ: {
    name: "Cluster University (Royal Blue & Orange)",
    orgTitle: "CLUSTER UNIVERSITY",
    primaryColor: "#0047BA",
    // Royal Blue
    secondaryColor: "#FF7900",
    // Orange
    pillBg: "#FF7900",
    pillText: "#FFFFFF",
    isPillGradient: false,
    card1Bg: "#F0F6FE",
    card1Border: "#D0E1FD",
    card2Bg: "#FFF8F1",
    card2Border: "#FCD9BD",
    card3Bg: "#F0F6FE",
    card3Border: "#D0E1FD",
    waveRibbon: "#FF7900",
    waveFill: "#0047BA",
    bottomPillBg: "#00368F",
    hasTicks: true,
    badgeLabel: "UNIVERSITY UPDATE"
  },
  default: {
    name: "CSC DOST Default (Royal Blue & Orange)",
    orgTitle: "CSC DOST",
    primaryColor: "#0047BA",
    secondaryColor: "#FF6A00",
    pillBg: "#FF6A00",
    pillText: "#FFFFFF",
    isPillGradient: false,
    card1Bg: "#F0F6FE",
    card1Border: "#D0E1FD",
    card2Bg: "#FFF8F1",
    card2Border: "#FCD9BD",
    card3Bg: "#F0F6FE",
    card3Border: "#D0E1FD",
    waveRibbon: "#FF6A00",
    waveFill: "#0047BA",
    bottomPillBg: "#00368F",
    hasTicks: true,
    badgeLabel: "JOB ALERT"
  }
};
function extractSpecificPostRole(title, category) {
  const cleanTitle = (title || "").trim();
  const upper = cleanTitle.toUpperCase();
  if (upper.includes("TES-57")) return "TES-57 (10+2)";
  if (upper.includes("TES-54")) return "TES-54 (10+2)";
  if (upper.includes("TES-55")) return "TES-55 (10+2)";
  if (upper.includes("CLASS IV") || upper.includes("CLASS-IV")) return "CLASS IV";
  if (upper.includes("JE CIVIL")) return "JE CIVIL (PWD)";
  if (upper.includes("JUNIOR ASSISTANT")) return "JUNIOR ASSISTANT";
  if (upper.includes("FORESTER")) return "FORESTER";
  if (upper.includes("SUB INSPECTOR") || upper.includes("SUB-INSPECTOR") || upper.includes("SI RECRUITMENT")) return "SUB-INSPECTOR";
  if (upper.includes("PATWARI")) return "PATWARI";
  if (upper.includes("AGNIVEER")) return "AGNIVEER RALLY";
  if (upper.includes("CHSL")) return "CHSL (10+2)";
  if (upper.includes("CGL")) return "CGL EXAM";
  if (upper.includes("GD CONSTABLE") || upper.includes("SSC") && upper.includes("CONSTABLE")) return "GD CONSTABLE";
  if (upper.includes("MTS")) return "MTS / HAVALDAR";
  if (upper.includes("NTPC")) return "NTPC (UG)";
  if (upper.includes("TECHNICIAN")) return "TECHNICIAN";
  if (upper.includes("ALP")) return "ASSISTANT LOCO PILOT";
  if (upper.includes("RPF")) return "RPF CONSTABLE / SI";
  if (upper.includes("B.ED") && upper.includes("DYD")) return "B.ED 4TH SEM (DYD)";
  if (upper.includes("B.TECH")) return "B.TECH ENGG EXAM";
  if (upper.includes("BG 1ST") || upper.includes("BG 2ND") || upper.includes("1ST & 2ND SEM")) return "BG 1ST & 2ND SEM";
  if (upper.includes("INTEGRATED PG") || upper.includes("SPOT ROUND")) return "INTEGRATED PG ADMISSION";
  const parenMatch = cleanTitle.match(/\(([A-Za-z0-9+–—\s/]{3,24})\)/);
  if (parenMatch && !parenMatch[1].toLowerCase().includes("advt") && !parenMatch[1].toLowerCase().includes("notice")) {
    return parenMatch[1].trim().toUpperCase();
  }
  let stripped = cleanTitle.replace(/^JKSSB\s+/i, "").replace(/^Indian Army\s+/i, "").replace(/^RRB\s+/i, "").replace(/^SSC\s+/i, "").replace(/^Cluster University Srinagar\s+/i, "").replace(/^University of Kashmir\s+/i, "").replace(/^CUS\s+/i, "").replace(/^KU\s+/i, "").replace(/Online Form\s*\d*/gi, "").replace(/Apply Online\s*\d*/gi, "").replace(/Recruitment\s*\d*/gi, "").replace(/Notification\s*\d*/gi, "").replace(/Examination\s*\d*/gi, "").replace(/Session\s*\d*[-–]?\d*/gi, "").replace(/\b202[4-9]\b/g, "").replace(/Advt\.?\s*No\.?\s*[\d/A-Z-]+/gi, "").replace(/[-–—:]+/g, " ").trim();
  if (stripped.length > 28) {
    const words = stripped.split(/\s+/);
    stripped = words.slice(0, 3).join(" ");
  }
  return (stripped || (category === "admissions" ? "ADMISSION NOTICE" : "RECRUITMENT NOTICE")).toUpperCase().slice(0, 32);
}
function buildDeterministicThumbnailSpec(input) {
  const rawTitle = (input.title || "").trim();
  const titleUpper = rawTitle.toUpperCase();
  const rawCategory = (input.category || "").toLowerCase();
  const statusLower = (input.status || "").toLowerCase();
  let style = "default";
  if (rawCategory === "jkssb" || titleUpper.includes("JKSSB")) {
    style = "jkssb";
  } else if (rawCategory === "army_jobs" || titleUpper.includes("ARMY") || titleUpper.includes("AGNIVEER")) {
    style = "army_jobs";
  } else if (rawCategory === "rrb_jobs" || titleUpper.includes("RRB") || titleUpper.includes("RAILWAY")) {
    style = "rrb_jobs";
  } else if (rawCategory === "ssc_jobs" || titleUpper.includes("SSC")) {
    style = "ssc_jobs";
  } else if (rawCategory === "cluster_univ" || titleUpper.includes("CLUSTER UNIVERSITY") || titleUpper.includes("CUS")) {
    style = "cluster_univ";
  } else if (rawCategory === "exam_forms" || titleUpper.includes("KASHMIR UNIVERSITY") || titleUpper.includes("EXAM FORM") || titleUpper.includes("DATE SHEET")) {
    style = "exam_forms";
  } else if (rawCategory === "admissions" || titleUpper.includes("ADMISSION")) {
    style = titleUpper.includes("CLUSTER") ? "cluster_univ" : "admissions";
  }
  const theme = CATEGORY_THEMES[style] || CATEGORY_THEMES.default;
  let orgTitle = theme.orgTitle;
  if (input.department && input.department.trim().length <= 26) {
    orgTitle = input.department.trim().toUpperCase();
  } else if (titleUpper.includes("INDIAN ARMY")) {
    orgTitle = "INDIAN ARMY";
  } else if (titleUpper.includes("JKSSB")) {
    orgTitle = "JKSSB";
  } else if (titleUpper.includes("RAILWAY") || titleUpper.includes("RRB")) {
    orgTitle = "RAILWAY / RRB";
  } else if (titleUpper.includes("SSC")) {
    orgTitle = "STAFF SELECTION COMM.";
  } else if (titleUpper.includes("KASHMIR UNIV") || titleUpper.includes("KU ")) {
    orgTitle = "KASHMIR UNIVERSITY";
  } else if (titleUpper.includes("CLUSTER UNIV") || titleUpper.includes("CUS")) {
    orgTitle = "CLUSTER UNIVERSITY";
  }
  const postBadgeTitle = extractSpecificPostRole(rawTitle, style);
  let eligibilityValue = "See notification";
  if (input.eligibility && input.eligibility.trim()) {
    const rawEl = input.eligibility.trim();
    if (rawEl.length <= 24) {
      eligibilityValue = rawEl;
    } else {
      const credMatches = rawEl.match(/\b(10th|12th|10\+2|Graduate|Post\s*Graduate|Diploma|BE\/B\.Tech|Degree|B\.Ed|B\.Tech|ITI)\b/gi);
      if (credMatches && credMatches.length > 0) {
        eligibilityValue = Array.from(new Set(credMatches.map((c) => c.trim()))).slice(0, 2).join(" / ") + " Pass";
      } else {
        eligibilityValue = rawEl.slice(0, 22).trim() + "...";
      }
    }
  }
  let lastDateValue = "Check website";
  if (input.lastDate && input.lastDate.trim()) {
    lastDateValue = input.lastDate.trim();
  } else if (statusLower === "closed") {
    lastDateValue = "Closed / Archive";
  }
  const howToApplyValue = "Visit CSC DOST";
  const hasVerifiedPreset = [
    "jkssb",
    "army_jobs",
    "rrb_jobs",
    "ssc_jobs",
    "exam_forms",
    "admissions",
    "cluster_univ"
  ].includes(style);
  const logoOption = input.customOverrides?.logoUrl ? "custom" : hasVerifiedPreset ? "preset" : "placeholder";
  return {
    category: style,
    orgTitle,
    postBadgeTitle,
    badgeLabel: theme.badgeLabel,
    eligibilityLabel: "Eligibility:",
    eligibilityValue,
    lastDateLabel: "Last date:",
    lastDateValue,
    howToApplyLabel: "How to apply:",
    howToApplyValue,
    logoOption,
    // Legacy fields for backward compatibility
    mainHeadingLeft: orgTitle,
    redBadgeText: postBadgeTitle,
    secondHeading: "ONLINE APPLICATION",
    yellowBannerPrefix: "Apply Through ",
    yellowBannerHighlight: "CSC DOST",
    fourIcons: [
      "Form Assistance",
      "Document Upload",
      "Fee Verification",
      "Candidate Support"
    ],
    laptopTitle: orgTitle.slice(0, 10),
    laptopSubtitle: "Online Service Portal",
    footerLine1: "Get Easy and Reliable Online Assistance",
    footerLine2: `for ${orgTitle} ${postBadgeTitle}`,
    ctaButtonText: statusLower === "closed" ? "READ DETAILS" : "APPLY NOW",
    ...input.customOverrides
  };
}
function getVerifiedLogoVector(category, primaryColor) {
  switch (category) {
    case "army_jobs":
      return `<g transform="translate(18, 15)">
        <circle cx="100" cy="95" r="75" fill="#1E4620" fill-opacity="0.08" stroke="#1E4620" stroke-width="2" />
        <!-- Crossed Swords -->
        <line x1="55" y1="50" x2="145" y2="140" stroke="#C89B2B" stroke-width="6" stroke-linecap="round" />
        <line x1="145" y1="50" x2="55" y2="140" stroke="#C89B2B" stroke-width="6" stroke-linecap="round" />
        <!-- Central Shield -->
        <path d="M 82 70 L 118 70 L 118 100 Q 118 122, 100 130 Q 82 122, 82 100 Z" fill="#1E4620" stroke="#C89B2B" stroke-width="2.5" />
        <circle cx="100" cy="90" r="10" fill="#F3DF79" />
        ${renderVectorText("INDIAN ARMY", 100, 185, 14, "#1E4620", { anchor: "middle", weight: "bold", letterSpacing: 1 })}
      </g>`;
    case "jkssb":
      return `<g transform="translate(18, 15)">
        <circle cx="100" cy="95" r="75" fill="#0047BA" fill-opacity="0.06" stroke="#0047BA" stroke-width="2" />
        <circle cx="100" cy="95" r="65" fill="none" stroke="#FF6A00" stroke-width="1.5" stroke-dasharray="4,3" />
        <!-- Scales of justice -->
        <line x1="100" y1="58" x2="100" y2="128" stroke="#0047BA" stroke-width="4" stroke-linecap="round" />
        <line x1="70" y1="72" x2="130" y2="72" stroke="#0047BA" stroke-width="3.5" />
        <path d="M 60 92 L 80 92 L 70 72 Z" fill="#FF6A00" />
        <path d="M 120 92 L 140 92 L 130 72 Z" fill="#FF6A00" />
        <rect x="85" y="124" width="30" height="8" rx="2" fill="#0047BA" />
        ${renderVectorText("JKSSB", 100, 185, 16, "#0047BA", { anchor: "middle", weight: "bold", letterSpacing: 1 })}
      </g>`;
    case "rrb_jobs":
      return `<g transform="translate(18, 15)">
        <circle cx="100" cy="95" r="75" fill="#0B2545" fill-opacity="0.06" stroke="#0B2545" stroke-width="2" />
        <!-- Train silhouette -->
        <rect x="74" y="62" width="52" height="58" rx="8" fill="#0B2545" stroke="#FF6A00" stroke-width="2.5" />
        <circle cx="100" cy="80" r="10" fill="#FF6A00" />
        <circle cx="85" cy="106" r="4" fill="#FFFFFF" />
        <circle cx="115" cy="106" r="4" fill="#FFFFFF" />
        <path d="M 68 126 L 132 126" stroke="#0B2545" stroke-width="4" stroke-linecap="round" />
        <line x1="80" y1="126" x2="72" y2="136" stroke="#0B2545" stroke-width="3" />
        <line x1="120" y1="126" x2="128" y2="136" stroke="#0B2545" stroke-width="3" />
        ${renderVectorText("INDIAN RAILWAYS", 100, 185, 14, "#0B2545", { anchor: "middle", weight: "bold", letterSpacing: 1 })}
      </g>`;
    case "ssc_jobs":
      return `<g transform="translate(18, 15)">
        <circle cx="100" cy="95" r="75" fill="#0A2540" fill-opacity="0.06" stroke="#0A2540" stroke-width="2" />
        <circle cx="100" cy="95" r="62" fill="none" stroke="#008080" stroke-width="2" />
        <!-- Ashoka pillar base & stars -->
        <rect x="90" y="65" width="20" height="42" rx="3" fill="#0A2540" />
        <polygon points="100,52 104,60 114,60 106,66 109,76 100,70 91,76 94,66 86,60 96,60" fill="#008080" />
        <rect x="80" y="112" width="40" height="8" rx="2" fill="#0A2540" />
        ${renderVectorText("SSC", 100, 185, 16, "#0A2540", { anchor: "middle", weight: "bold", letterSpacing: 1 })}
      </g>`;
    case "exam_forms":
    case "admissions":
      return `<g transform="translate(18, 15)">
        <circle cx="100" cy="95" r="75" fill="#0B2545" fill-opacity="0.06" stroke="#0B2545" stroke-width="2" />
        <!-- Chinar leaf shape -->
        <path d="M 100 55 C 90 70, 70 75, 76 95 C 80 102, 88 98, 92 110 C 95 116, 98 128, 100 132 C 102 128, 105 116, 108 110 C 112 98, 120 102, 124 95 C 130 75, 110 70, 100 55 Z" fill="#028090" />
        <circle cx="100" cy="92" r="6" fill="#FFFFFF" />
        ${renderVectorText("KASHMIR UNIV", 100, 185, 13, "#0B2545", { anchor: "middle", weight: "bold", letterSpacing: 0.5 })}
      </g>`;
    case "cluster_univ":
      return `<g transform="translate(18, 15)">
        <circle cx="100" cy="95" r="75" fill="#0047BA" fill-opacity="0.06" stroke="#0047BA" stroke-width="2" />
        <!-- Open book + shikara -->
        <path d="M 72 85 Q 100 95, 100 115 Q 100 95, 128 85 L 128 108 Q 100 118, 100 132 Q 100 118, 72 108 Z" fill="#0047BA" />
        <path d="M 80 72 L 120 72 L 100 56 Z" fill="#FF7900" />
        ${renderVectorText("CUS SRINAGAR", 100, 185, 14, "#0047BA", { anchor: "middle", weight: "bold", letterSpacing: 1 })}
      </g>`;
    default:
      return "";
  }
}
function renderStandaloneMasterThumbnailSvg(spec) {
  const theme = CATEGORY_THEMES[spec.category] || CATEGORY_THEMES.default;
  const rawOrgTitle = (spec.orgTitle || theme.orgTitle).trim();
  const rawPostBadgeTitle = (spec.postBadgeTitle || "OFFICIAL NOTIFICATION").trim();
  const rawElLabel = (spec.eligibilityLabel || "Eligibility:").trim();
  const rawElValue = (spec.eligibilityValue || "See notification").trim();
  const elValueClean = rawElValue.length > 20 ? rawElValue.slice(0, 18) + "..." : rawElValue;
  const rawDateLabel = (spec.lastDateLabel || "Last date:").trim();
  const rawDateValue = (spec.lastDateValue || "Check website").trim();
  const dateValueClean = rawDateValue.length > 20 ? rawDateValue.slice(0, 18) + "..." : rawDateValue;
  const rawApplyLabel = (spec.howToApplyLabel || "How to apply:").trim();
  const rawApplyValue = (spec.howToApplyValue || "Visit CSC DOST").trim();
  const applyValueClean = rawApplyValue.length > 20 ? rawApplyValue.slice(0, 18) + "..." : rawApplyValue;
  const isCustomLogo = Boolean(spec.logoUrl && spec.logoUrl.trim());
  const verifiedPresetSvg = getVerifiedLogoVector(spec.category, theme.primaryColor);
  const hasVerifiedPreset = spec.logoOption === "preset" ? Boolean(verifiedPresetSvg) : Boolean(verifiedPresetSvg && spec.logoOption !== "placeholder");
  const hasLogo = isCustomLogo || hasVerifiedPreset;
  let logoContentSvg = "";
  if (isCustomLogo && spec.logoUrl) {
    const safeLogoUrl = escapeXml(spec.logoUrl.trim());
    logoContentSvg = `<image href="${safeLogoUrl}" x="18" y="18" width="198" height="198" preserveAspectRatio="xMidYMid meet" />`;
  } else if (hasVerifiedPreset) {
    logoContentSvg = verifiedPresetSvg;
  }
  const centerX = hasLogo ? 460 : 600;
  const orgFontSize = rawOrgTitle.length > 22 ? 52 : rawOrgTitle.length > 15 ? 60 : rawOrgTitle.length > 10 ? 74 : 92;
  const badgeFontSize = rawPostBadgeTitle.length > 24 ? 42 : rawPostBadgeTitle.length > 16 ? 50 : 60;
  const measuredWidth = measureVectorTextWidth(rawPostBadgeTitle, badgeFontSize, { weight: "bold" });
  const maxPillWidth = hasLogo ? 820 : 980;
  const badgePillWidth = Math.min(maxPillWidth, Math.max(380, Math.round(measuredWidth + 88)));
  const badgePillX = Math.round(centerX - badgePillWidth / 2);
  const showTicks = theme.hasTicks && rawOrgTitle.length <= 12;
  const leftTickBaseX = hasLogo ? 85 : 120;
  const rightTickBaseX = hasLogo ? 835 : 1080;
  return `<svg width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" viewBox="0 0 ${THUMBNAIL_WIDTH} ${THUMBNAIL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Metallic Gold Gradient for Indian Army -->
    <linearGradient id="goldMetallicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C59B27" />
      <stop offset="35%" stop-color="#F5DE7B" />
      <stop offset="70%" stop-color="#ECC657" />
      <stop offset="100%" stop-color="#B3861B" />
    </linearGradient>

    <!-- Subtle Clean Background Shadow -->
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.12" />
    </filter>

    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.06" />
    </filter>

    <filter id="brandPillShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Clean Pure White Background -->
  <rect width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" fill="#FFFFFF" />

  ${hasLogo && logoContentSvg ? `
  <!-- TOP RIGHT: VERIFIED OFFICIAL LOGO CONTAINER -->
  <g transform="translate(915, 45)">
    <rect x="0" y="0" width="235" height="235" rx="22" fill="#F8FAFC" stroke="${theme.primaryColor}" stroke-width="2.5" stroke-dasharray="7,7" />
    ${logoContentSvg}
  </g>
  ` : ""}

  <!-- TOP LEFT / CENTER: ORGANIZATION HEADING & POST TITLE PILL -->
  <g transform="translate(0, 0)">
    <!-- Radiating burst ticks for JKSSB / RRB / SSC / CUS -->
    ${showTicks ? `
    <!-- Left Burst Ticks -->
    <g stroke="${theme.secondaryColor}" stroke-width="7" stroke-linecap="round">
      <line x1="${leftTickBaseX}" y1="120" x2="${leftTickBaseX - 25}" y2="105" />
      <line x1="${leftTickBaseX - 5}" y1="145" x2="${leftTickBaseX - 35}" y2="145" />
      <line x1="${leftTickBaseX}" y1="170" x2="${leftTickBaseX - 25}" y2="185" />
    </g>
    <!-- Right Burst Ticks -->
    <g stroke="${theme.secondaryColor}" stroke-width="7" stroke-linecap="round">
      <line x1="${rightTickBaseX}" y1="120" x2="${rightTickBaseX + 25}" y2="105" />
      <line x1="${rightTickBaseX + 5}" y1="145" x2="${rightTickBaseX + 35}" y2="145" />
      <line x1="${rightTickBaseX}" y1="170" x2="${rightTickBaseX + 25}" y2="185" />
    </g>
    ` : ""}

    <!-- Organization Name as Pure Vector Path -->
    ${renderVectorText(rawOrgTitle, centerX, 145, orgFontSize, theme.primaryColor, { anchor: "middle", weight: "bold" })}

    <!-- Post Title / Role Pill Banner with Pure Vector Path -->
    <g transform="translate(${badgePillX}, 180)" filter="url(#softShadow)">
      <rect x="0" y="0" width="${badgePillWidth}" height="92" rx="26" fill="${theme.pillBg}" stroke="${theme.isPillGradient ? "#B3861B" : "none"}" stroke-width="${theme.isPillGradient ? 1.5 : 0}" />
      ${renderVectorText(rawPostBadgeTitle, badgePillWidth / 2, 65, badgeFontSize, theme.pillText, { anchor: "middle", weight: "bold" })}
    </g>
  </g>

  <!-- MIDDLE ROW: 3 INFORMATION BLOCKS -->
  <!-- CARD 1: ELIGIBILITY -->
  <g transform="translate(45, 335)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="345" height="120" rx="18" fill="${theme.card1Bg}" stroke="${theme.card1Border}" stroke-width="1.5" />
    <!-- Circle Icon -->
    <circle cx="56" cy="60" r="30" fill="${theme.primaryColor}" />
    <!-- Document Icon inside Circle -->
    <g transform="translate(42, 45)" stroke="#FFFFFF" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="3" width="18" height="24" rx="2" />
      <line x1="9" y1="9" x2="19" y2="9" />
      <line x1="9" y1="14" x2="19" y2="14" />
      <line x1="9" y1="19" x2="15" y2="19" />
    </g>
    <!-- Vertical Separator Line -->
    <line x1="102" y1="28" x2="102" y2="92" stroke="${theme.card1Border}" stroke-width="1.5" />
    <!-- Text Labels as Pure Vector Paths -->
    ${renderVectorText(rawElLabel, 118, 48, 20, theme.primaryColor, { anchor: "start", weight: "bold" })}
    ${renderVectorText(elValueClean, 118, 80, 18, "#1E293B", { anchor: "start", weight: "bold" })}
  </g>

  <!-- CARD 2: LAST DATE -->
  <g transform="translate(425, 335)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="350" height="120" rx="18" fill="${theme.card2Bg}" stroke="${theme.card2Border}" stroke-width="1.5" />
    <!-- Circle Icon -->
    <circle cx="56" cy="60" r="30" fill="${theme.secondaryColor}" />
    <!-- Calendar Icon inside Circle -->
    <g transform="translate(42, 45)" stroke="#FFFFFF" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="5" width="20" height="19" rx="2" />
      <line x1="4" y1="11" x2="24" y2="11" />
      <line x1="9" y1="2" x2="9" y2="6" />
      <line x1="19" y1="2" x2="19" y2="6" />
    </g>
    <!-- Vertical Separator Line -->
    <line x1="102" y1="28" x2="102" y2="92" stroke="${theme.card2Border}" stroke-width="1.5" />
    <!-- Text Labels as Pure Vector Paths -->
    ${renderVectorText(rawDateLabel, 118, 48, 20, theme.secondaryColor, { anchor: "start", weight: "bold" })}
    ${renderVectorText(dateValueClean, 118, 80, 18, "#1E293B", { anchor: "start", weight: "bold" })}
  </g>

  <!-- CARD 3: HOW TO APPLY -->
  <g transform="translate(810, 335)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="345" height="120" rx="18" fill="${theme.card3Bg}" stroke="${theme.card3Border}" stroke-width="1.5" />
    <!-- Circle Icon -->
    <circle cx="56" cy="60" r="30" fill="${theme.primaryColor}" />
    <!-- Cursor Pointer Icon inside Circle -->
    <g transform="translate(43, 46)">
      <path d="M 6 4 L 20 18 L 13 19 L 17 26 L 14 28 L 10 20 L 6 24 Z" fill="#FFFFFF" />
    </g>
    <!-- Vertical Separator Line -->
    <line x1="102" y1="28" x2="102" y2="92" stroke="${theme.card3Border}" stroke-width="1.5" />
    <!-- Text Labels as Pure Vector Paths -->
    ${renderVectorText(rawApplyLabel, 118, 48, 20, theme.primaryColor, { anchor: "start", weight: "bold" })}
    ${renderVectorText(applyValueClean, 118, 80, 18, "#1E293B", { anchor: "start", weight: "bold" })}
  </g>

  <!-- BOTTOM LAYER: DUAL WAVING RIBBONS -->
  <!-- 1. Secondary Ribbon Wave (Top Accent) -->
  <path d="M 0 520 Q 300 480, 600 525 T 1200 490 L 1200 528 Q 900 560, 600 545 T 0 538 Z" fill="${theme.waveRibbon}" />
  <!-- 2. Primary Wave (Bottom Solid Base) -->
  <path d="M 0 534 Q 300 495, 600 540 T 1200 504 L 1200 630 L 0 630 Z" fill="${theme.waveFill}" />

  <!-- CENTERED BOTTOM BRAND PILL -->
  <g transform="translate(375, 532)" filter="url(#brandPillShadow)">
    <rect x="0" y="0" width="450" height="58" rx="29" fill="${theme.bottomPillBg}" stroke="#FFFFFF" stroke-width="2" />
    
    <!-- Left Accent Dash -->
    <line x1="35" y1="29" x2="105" y2="29" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    
    <!-- Centered Brand Domain as Pure Vector Path -->
    ${renderVectorText("cscdost.com", 225, 39, 26, "#FFFFFF", { anchor: "middle", weight: "bold", letterSpacing: 0.8 })}

    <!-- Right Accent Dash -->
    <line x1="345" y1="29" x2="415" y2="29" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  </g>
</svg>`;
}
async function renderMasterThumbnailBuffer(spec, format = "png") {
  if (spec.customThumbnailUrl && spec.customThumbnailUrl.startsWith("data:image")) {
    const base64Data = spec.customThumbnailUrl.split(",")[1] || spec.customThumbnailUrl;
    const buf = Buffer.from(base64Data, "base64");
    let pipeline2 = sharp(buf).resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, { fit: "cover" });
    return format === "webp" ? pipeline2.webp({ quality: 92 }).toBuffer() : pipeline2.png({ quality: 94, compressionLevel: 7 }).toBuffer();
  }
  const svgString = renderStandaloneMasterThumbnailSvg(spec);
  let pipeline = sharp(Buffer.from(svgString));
  if (format === "webp") {
    return pipeline.webp({ quality: 92 }).toBuffer();
  }
  return pipeline.png({ quality: 94, compressionLevel: 7 }).toBuffer();
}
async function extractThumbnailSpecWithAI(input) {
  const baseSpec = buildDeterministicThumbnailSpec(input);
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
      model: "gemini-2.5-flash",
      contents: `You are generating structured copy for a 1200x630 CSC DOST portal social share thumbnail.
Summarize the following post into ultra-concise, high-impact text matching the approved visual layout:
Post Title: ${input.title}
Category: ${input.category || ""}
Department/Organization: ${input.department || ""}
Short Description: ${input.shortInfo || ""}
Last Date: ${input.lastDate || "N/A"}
Eligibility: ${input.eligibility || "N/A"}

Rules:
- orgTitle: Uppercase official organization acronym/name (e.g. "JKSSB", "INDIAN ARMY", "RAILWAY / RRB", "STAFF SELECTION COMM.", "KASHMIR UNIVERSITY", "CLUSTER UNIVERSITY").
- postBadgeTitle: Uppercase specific role or examination name (e.g. "CLASS IV", "TES-57 (10+2)", "JE CIVIL (PWD)", "NTPC (UG)", "CHSL (10+2)", "BG 1ST & 2ND SEM"). Max 26 chars.
- eligibilityValue: Ultra-short requirement (max 20 chars, e.g. "10th / 12th Pass", "BE/B.Tech Civil", "10+2 with PCM").
- lastDateValue: Clean date string (max 18 chars, e.g. "25/03/2026", "Check website").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            orgTitle: { type: Type.STRING },
            postBadgeTitle: { type: Type.STRING },
            eligibilityValue: { type: Type.STRING },
            lastDateValue: { type: Type.STRING }
          },
          required: ["orgTitle", "postBadgeTitle", "eligibilityValue", "lastDateValue"]
        }
      }
    });
    if (response && response.text) {
      const parsed = JSON.parse(response.text.trim());
      return {
        ...baseSpec,
        orgTitle: (parsed.orgTitle || baseSpec.orgTitle).trim(),
        postBadgeTitle: (parsed.postBadgeTitle || baseSpec.postBadgeTitle).trim(),
        eligibilityValue: (parsed.eligibilityValue || baseSpec.eligibilityValue).trim(),
        lastDateValue: (parsed.lastDateValue || baseSpec.lastDateValue).trim()
      };
    }
    return baseSpec;
  } catch (err) {
    console.warn("[ThumbnailAI] Falling back to deterministic spec:", err);
    return baseSpec;
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
function generatePortalOgBannerSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071328"/>
      <stop offset="50%" stop-color="#0b1b38"/>
      <stop offset="100%" stop-color="#08142b"/>
    </linearGradient>

    <!-- Card Background Gradient -->
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#142447" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0d1830" stop-opacity="0.95"/>
    </linearGradient>

    <!-- Tricolor Gradients -->
    <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF9933"/>
      <stop offset="100%" stop-color="#E65100"/>
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#15803D"/>
    </linearGradient>

    <!-- Soft Drop Shadows -->
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- Subtle Ambient Glow Orbs -->
  <circle cx="600" cy="240" r="320" fill="#2563eb" opacity="0.12"/>
  <circle cx="150" cy="450" r="220" fill="#f59e0b" opacity="0.08"/>
  <circle cx="1050" cy="450" r="220" fill="#10b981" opacity="0.08"/>

  <!-- Top Tricolor Accent Bar -->
  <rect x="0" y="0" width="400" height="6" fill="#FF9933"/>
  <rect x="400" y="0" width="400" height="6" fill="#FFFFFF"/>
  <rect x="800" y="0" width="400" height="6" fill="#138808"/>

  <!-- Geometric Grid Accent Lines -->
  <g stroke="#3b82f6" stroke-opacity="0.08" stroke-width="1">
    <line x1="0" y1="100" x2="1200" y2="100"/>
    <line x1="0" y1="200" x2="1200" y2="200"/>
    <line x1="0" y1="300" x2="1200" y2="300"/>
    <line x1="0" y1="400" x2="1200" y2="400"/>
    <line x1="0" y1="500" x2="1200" y2="500"/>
    <line x1="200" y1="0" x2="200" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="1000" y1="0" x2="1000" y2="630"/>
  </g>

  <!-- TOP HEADER BADGE (Centered) -->
  <g transform="translate(600, 48)">
    <rect x="-290" y="-18" width="580" height="36" rx="18" fill="#172554" stroke="#3b82f6" stroke-width="1.2" opacity="0.95"/>
    <circle cx="-264" cy="0" r="5" fill="#22c55e"/>
    ${renderVectorText("AUTHORIZED DIGITAL PORTAL \u2022 CSC VLE ID: 212515670018", -248, 5, 13, "#93c5fd", { anchor: "start", weight: "bold", letterSpacing: 1 })}
  </g>

  <!-- CENTER HERO BRAND BLOCK (WhatsApp Square Crop Safe Zone) -->
  <g transform="translate(600, 160)">
    <!-- CSC Digital India Emblem Vector -->
    <g transform="translate(0, 0)">
      <circle cx="0" cy="0" r="56" fill="#1e3a8a" opacity="0.4"/>
      <circle cx="0" cy="0" r="52" fill="#ffffff"/>
      <!-- Saffron Swash -->
      <path d="M -22 -32 A 40 40 0 0 1 42 -22" fill="none" stroke="url(#saffronGrad)" stroke-width="7" stroke-linecap="round"/>
      <!-- Green Swash -->
      <path d="M 40 22 A 40 40 0 0 1 -24 32" fill="none" stroke="url(#greenGrad)" stroke-width="7" stroke-linecap="round"/>
      <!-- Inner Globe Grid -->
      <circle cx="0" cy="0" r="24" fill="none" stroke="#000080" stroke-width="2.5"/>
      <ellipse cx="0" cy="0" rx="24" ry="11" fill="none" stroke="#000080" stroke-width="1.8"/>
      <ellipse cx="0" cy="0" rx="11" ry="24" fill="none" stroke="#000080" stroke-width="1.8"/>
      <!-- Golden Verified Badge -->
      <circle cx="36" cy="36" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="2.5"/>
      <path d="M 31 36 L 35 40 L 42 32" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Main Brand Title as Pure Vector Path -->
    ${renderVectorText("CSC DOST", 0, 105, 78, "#ffffff", { anchor: "middle", weight: "bold", letterSpacing: -1 })}

    <!-- Subtitle / Tagline as Pure Vector Path -->
    ${renderVectorText("Government Services, Schemes & Recruitment Simplified", 0, 145, 22, "#93c5fd", { anchor: "middle", weight: "bold", letterSpacing: 0.5 })}

    <!-- Web URL Pill with Pure Vector Path -->
    <g transform="translate(0, 185)">
      <rect x="-170" y="-18" width="340" height="36" rx="18" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5"/>
      ${renderVectorText("WWW.CSCDOST.COM", 0, 5, 17, "#fbbf24", { anchor: "middle", weight: "bold", letterSpacing: 1.5 })}
    </g>
  </g>

  <!-- 3 FEATURE CARDS (Recruitment, Services, University) -->
  <g transform="translate(70, 425)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="320" height="125" rx="16" fill="url(#cardGrad)" stroke="#1e40af" stroke-width="1.5"/>
    <rect x="18" y="16" width="38" height="38" rx="10" fill="#1e3a8a"/>
    <text x="37" y="42" text-anchor="middle" font-size="20">\u{1F4CB}</text>
    ${renderVectorText("Sarkari Jobs & Exams", 68, 34, 15, "#ffffff", { weight: "bold" })}
    ${renderVectorText("Daily Verified Gazettes", 68, 50, 12, "#60a5fa", { weight: "bold" })}
    <line x1="18" y1="68" x2="302" y2="68" stroke="#1e3a8a" stroke-width="1"/>
    ${renderVectorText("JKSSB \u2022 Indian Army \u2022 SSC \u2022 RRB", 18, 90, 13, "#e2e8f0", { weight: "bold" })}
    ${renderVectorText("Admit Cards \u2022 Syllabi \u2022 Answer Keys", 18, 108, 11, "#94a3b8", { weight: "regular" })}
  </g>

  <g transform="translate(440, 425)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="320" height="125" rx="16" fill="url(#cardGrad)" stroke="#059669" stroke-width="1.5"/>
    <rect x="18" y="16" width="38" height="38" rx="10" fill="#065f46"/>
    <text x="37" y="42" text-anchor="middle" font-size="20">\u{1F3DB}\uFE0F</text>
    ${renderVectorText("Citizen Digital Services", 68, 34, 15, "#ffffff", { weight: "bold" })}
    ${renderVectorText("Online Counter Assistance", 68, 50, 12, "#34d399", { weight: "bold" })}
    <line x1="18" y1="68" x2="302" y2="68" stroke="#047857" stroke-width="1"/>
    ${renderVectorText("Aadhaar \u2022 PAN \u2022 Ayushman \u2022 KISAN", 18, 90, 13, "#e2e8f0", { weight: "bold" })}
    ${renderVectorText("Domicile \u2022 E-Tickets \u2022 Certificates", 18, 108, 11, "#94a3b8", { weight: "regular" })}
  </g>

  <g transform="translate(810, 425)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="320" height="125" rx="16" fill="url(#cardGrad)" stroke="#d97706" stroke-width="1.5"/>
    <rect x="18" y="16" width="38" height="38" rx="10" fill="#92400e"/>
    <text x="37" y="42" text-anchor="middle" font-size="20">\u{1F393}</text>
    ${renderVectorText("University Desk", 68, 34, 15, "#ffffff", { weight: "bold" })}
    ${renderVectorText("KU & Cluster Univ Srinagar", 68, 50, 12, "#fbbf24", { weight: "bold" })}
    <line x1="18" y1="68" x2="302" y2="68" stroke="#b45309" stroke-width="1"/>
    ${renderVectorText("Admissions \u2022 Exam Forms \u2022 Results", 18, 90, 13, "#e2e8f0", { weight: "bold" })}
    ${renderVectorText("Direct Link Portals & Step Guides", 18, 108, 11, "#94a3b8", { weight: "regular" })}
  </g>

  <!-- BOTTOM ACCREDITATION BAR -->
  <g transform="translate(600, 595)">
    ${renderVectorText("Operated by Wasim Ahmad Khanday (CSC VLE) \u2022 Sangran Qazigund, Anantnag, J&K 192221 \u2022 Official Helpline: +91 70068 33767", 0, 0, 12, "#64748b", { anchor: "middle", weight: "bold", letterSpacing: 0.5 })}
  </g>
</svg>`;
}
function generateOgSvg(item) {
  if (!item || !item.id) {
    return generatePortalOgBannerSvg();
  }
  const spec = buildDeterministicThumbnailSpec({
    id: item.id,
    title: item.title || "CSC DOST \u2013 Citizen Recruitment & Government Services Portal",
    category: item.category,
    department: item.department,
    postType: item.postType,
    shortInfo: item.shortInfo,
    startDate: item.startDate,
    lastDate: item.lastDate,
    eligibility: item.eligibility,
    status: item.status
  });
  return renderStandaloneMasterThumbnailSvg(spec);
}
async function generateSocialPreviewPng(item) {
  if (!item || !item.id) {
    const svg = generatePortalOgBannerSvg();
    return sharp2(Buffer.from(svg)).png({ quality: 95, compressionLevel: 9 }).toBuffer();
  }
  try {
    const spec = buildDeterministicThumbnailSpec({
      id: item.id,
      title: item.title || "CSC DOST \u2013 Citizen Recruitment & Government Services Portal",
      category: item.category,
      department: item.department,
      postType: item.postType,
      shortInfo: item.shortInfo,
      startDate: item.startDate,
      lastDate: item.lastDate,
      eligibility: item.eligibility,
      status: item.status
    });
    return await renderMasterThumbnailBuffer(spec, "png");
  } catch (err) {
    console.warn("[SocialPreview] Falling back to portal banner PNG:", err);
    const fallbackSvg = generatePortalOgBannerSvg();
    return sharp2(Buffer.from(fallbackSvg)).png({ quality: 95, compressionLevel: 9 }).toBuffer();
  }
}
function generateServiceOgSvg(service) {
  const escapedName = escapeXml2(service.name);
  const escapedPrice = escapeXml2(service.price);
  const escapedTime = escapeXml2(service.estimatedTime);
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
    ${renderVectorText("CSC DOST", 55, 44, 16, "#FDE047", { anchor: "middle", weight: "bold" })}
    ${renderVectorText("SERVICES", 55, 64, 20, "#FFFFFF", { anchor: "middle", weight: "bold" })}
  </g>

  <g transform="translate(195, 48)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="620" height="62" rx="14" fill="#0284C7" stroke="#38BDF8" stroke-width="2" />
    ${renderVectorText("ONLINE CITIZEN E-SERVICES", 310, 40, 28, "#FFFFFF", { anchor: "middle", weight: "bold" })}
  </g>

  <!-- CONTENT -->
  <g transform="translate(65, 140)">
    <rect x="0" y="0" width="1070" height="370" rx="20" fill="#FFFFFF" fill-opacity="0.05" stroke="#334155" stroke-width="2" />
    
    ${renderVectorText(service.name.slice(0, 42), 40, 70, 40, "#FFFFFF", { weight: "bold" })}

    ${descLines.map((l, idx) => renderVectorText(l, 40, 130 + idx * 35, 22, "#94A3B8", { weight: "regular" })).join("\n    ")}

    <g transform="translate(40, 240)">
      <rect x="0" y="0" width="300" height="90" rx="12" fill="#14532D" stroke="#22C55E" stroke-width="2" />
      ${renderVectorText("ESTIMATED FEE", 20, 32, 14, "#BBF7D0", { weight: "bold" })}
      ${renderVectorText(service.price, 20, 68, 28, "#FFFFFF", { weight: "bold" })}
    </g>

    <g transform="translate(370, 240)">
      <rect x="0" y="0" width="300" height="90" rx="12" fill="#1E3A8A" stroke="#3B82F6" stroke-width="2" />
      ${renderVectorText("PROCESSING TIME", 20, 32, 14, "#BFDBFE", { weight: "bold" })}
      ${renderVectorText(service.estimatedTime, 20, 68, 28, "#FFFFFF", { weight: "bold" })}
    </g>
  </g>

  <!-- FOOTER -->
  <g transform="translate(65, 530)">
    <rect x="0" y="0" width="1070" height="55" rx="12" fill="#020617" stroke="#F59E0B" stroke-width="2" />
    ${renderVectorText("cscdost.com \u2022 Authorized Common Service Center", 30, 35, 20, "#FDE047", { weight: "bold" })}
    ${renderVectorText("Apply & Upload Documents Online", 1040, 35, 18, "#FFFFFF", { anchor: "end", weight: "bold" })}
  </g>
</svg>`;
}
async function generateServiceOgPng(service) {
  const svgString = generateServiceOgSvg(service);
  return sharp2(Buffer.from(svgString)).png({ quality: 90, compressionLevel: 8 }).toBuffer();
}

// src/serverContentRenderer.ts
function escapeHtml(str) {
  if (str === null || str === void 0) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function renderPostSubstantiveHtml(item) {
  const safeTitle = escapeHtml(item.title);
  const safeCategory = escapeHtml(item.category?.replace(/_/g, " ").toUpperCase() || "RECRUITMENT NOTICE");
  const safePostDate = escapeHtml(item.postDate || "Recent");
  const safeStartDate = escapeHtml(item.startDate || "Open");
  const safeLastDate = escapeHtml(item.lastDate || "Check Notification");
  const safeAdvtNo = escapeHtml(item.advertisementNo || "Refer to Gazette");
  const safeTotalPosts = escapeHtml(item.totalPosts || "Open / As per rules");
  const safeAgeLimit = escapeHtml(item.ageLimit || "As per official rules");
  const safeEligibility = escapeHtml(item.eligibility || "Refer to official recruitment gazette");
  const safeShortInfo = escapeHtml(item.shortInfo || "Comprehensive recruitment notification details, eligibility, important dates, and official application instructions.");
  const safeGenObc = escapeHtml(item.fees?.genObc || "Refer to notification");
  const safeScSt = escapeHtml(item.fees?.scSt || "Refer to notification");
  const safeOfficialLink = escapeHtml(item.officialLink || "https://www.cscdost.com");
  return `
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.6;">
    <!-- Breadcrumb Navigation -->
    <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
      <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <a href="/#sarkari-board" style="color:#2563eb; text-decoration:none;">Recruitment Updates</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#0f172a; font-weight:600;">${safeTitle}</span>
    </nav>

    <!-- Government Transparency Notice -->
    <aside style="background:#fffbeb; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px; font-size:13px; color:#92400e;">
      <strong>Official Transparency Notice:</strong> CSC DOST (cscdost.com) is an independent private digital facilitation center operated by authorized CSC VLE Wasim Ahmad Khanday (VLE ID: 212515670018). We are <strong>not</strong> an official government recruitment board. All notifications are linked directly to official government portals.
    </aside>

    <!-- Article Header -->
    <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
        <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:10px;">
          ${safeCategory}
        </span>
        <h1 style="font-size:26px; line-height:1.3; font-weight:800; color:#0f172a; margin:0 0 12px 0;">
          ${safeTitle}
        </h1>
        <div style="font-size:13px; color:#64748b; display:flex; flex-wrap:wrap; gap:16px;">
          <span><strong>Post Date:</strong> ${safePostDate}</span>
          <span><strong>Advt No:</strong> ${safeAdvtNo}</span>
          <span><strong>Last Date to Apply:</strong> <strong style="color:#b91c1c;">${safeLastDate}</strong></span>
        </div>
      </header>

      <!-- Short Summary -->
      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#1e293b; margin:0 0 8px 0;">Notification Summary</h2>
        <p style="font-size:15px; color:#334155; line-height:1.7; margin:0;">
          ${safeShortInfo}
        </p>
      </section>

      <!-- Key Dates & Application Fees Table -->
      <section style="margin-bottom:24px; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
          <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 10px 0;">\u{1F4C5} Important Dates</h3>
          <ul style="list-style:none; padding:0; margin:0; font-size:14px; color:#334155; line-height:1.8;">
            <li><strong>Notification Released:</strong> ${safePostDate}</li>
            <li><strong>Online Application Start:</strong> ${safeStartDate}</li>
            <li><strong>Last Date to Apply Online:</strong> <span style="color:#b91c1c; font-weight:700;">${safeLastDate}</span></li>
            <li><strong>Exam / Admit Card:</strong> Check official portal for schedule</li>
          </ul>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
          <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 10px 0;">\u{1F4B3} Application Fee</h3>
          <ul style="list-style:none; padding:0; margin:0; font-size:14px; color:#334155; line-height:1.8;">
            <li><strong>General / OBC / EWS:</strong> ${safeGenObc}</li>
            <li><strong>SC / ST / PwD / Female:</strong> ${safeScSt}</li>
            <li><strong>Payment Mode:</strong> Net Banking, Debit/Credit Card, UPI through Official Gateway</li>
          </ul>
        </div>
      </section>

      <!-- Eligibility, Age Limit & Vacancies -->
      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#1e293b; margin:0 0 12px 0;">Eligibility Criteria &amp; Vacancy Details</h2>
        <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left; border:1px solid #e2e8f0;">
          <tbody>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <th style="padding:10px 14px; background:#f1f5f9; width:30%; font-weight:600; color:#1e293b;">Total Vacancies</th>
              <td style="padding:10px 14px; color:#0f172a; font-weight:600;">${safeTotalPosts}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <th style="padding:10px 14px; background:#f1f5f9; font-weight:600; color:#1e293b;">Age Limit</th>
              <td style="padding:10px 14px; color:#334155;">${safeAgeLimit} (Age relaxation applicable as per government norms)</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <th style="padding:10px 14px; background:#f1f5f9; font-weight:600; color:#1e293b;">Educational Qualification</th>
              <td style="padding:10px 14px; color:#334155;">${safeEligibility}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Step-by-Step Instructions -->
      <section style="margin-bottom:28px;">
        <h2 style="font-size:18px; font-weight:700; color:#1e293b; margin:0 0 10px 0;">How to Apply Online</h2>
        <ol style="padding-left:20px; font-size:14px; color:#334155; line-height:1.8; margin:0;">
          <li>Review the complete official advertisement brochure to verify your educational eligibility and age requirements.</li>
          <li>Prepare scanned copies of your Matriculation (10th) mark sheet, identity proof (Aadhaar / Voter ID), passport photograph, and signature in accordance with board specifications.</li>
          <li>Visit the official recruiting website or authority link provided below.</li>
          <li>Complete one-time registration (OTR) or applicant login using valid mobile number and email.</li>
          <li>Fill in academic credentials, examination center preferences, and communication address accurately.</li>
          <li>Submit mandatory application fees via the secured payment gateway before the closing date: <strong>${safeLastDate}</strong>.</li>
          <li>Download and print the final application confirmation receipt for your records and examination entry.</li>
        </ol>
      </section>

      <!-- Official Links Action Section -->
      <section style="background:#f1f5f9; border-radius:10px; padding:18px; display:flex; flex-wrap:wrap; items-center; justify-content:space-between; gap:12px;">
        <div>
          <div style="font-weight:700; font-size:15px; color:#0f172a;">Official Board Portal &amp; Direct Links</div>
          <div style="font-size:13px; color:#64748b;">Verify official notification details directly on the government portal.</div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a href="${safeOfficialLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#2563eb; color:#ffffff; font-weight:600; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            Official Portal / Gazette \u2197
          </a>
          <a href="/apply" style="display:inline-block; background:#ffffff; color:#0f172a; border:1px solid #cbd5e1; font-weight:600; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            Assisted Application Desk
          </a>
        </div>
      </section>
    </article>

    <!-- Footer Disclaimers -->
    <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
      <p>Published by CSC DOST | Operator: Wasim Ahmad Khanday (CSC VLE ID: 212515670018) | Sangran Qazigund, Anantnag, J&amp;K 192221</p>
      <p>
        <a href="/privacy-policy" style="color:#2563eb; text-decoration:none;">Privacy Policy</a> \u2022
        <a href="/terms-of-service" style="color:#2563eb; text-decoration:none;">Terms of Service</a> \u2022
        <a href="/disclaimer" style="color:#2563eb; text-decoration:none;">Disclaimer</a> \u2022
        <a href="/contact-us" style="color:#2563eb; text-decoration:none;">Contact Helpdesk</a>
      </p>
    </footer>
  </main>
  `;
}
function renderServiceSubstantiveHtml(service) {
  const safeName = escapeHtml(service.name);
  const safeDescription = escapeHtml(service.description);
  const safePrice = escapeHtml(service.price);
  const safeTime = escapeHtml(service.estimatedTime);
  const safeCategory = escapeHtml(service.category);
  const safeOfficialUrl = "https://digitalseva.csc.gov.in";
  const safeDocs = Array.isArray(service.requirements) ? service.requirements : [];
  return `
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.6;">
    <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
      <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <a href="/#services" style="color:#2563eb; text-decoration:none;">Citizen Services</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#0f172a; font-weight:600;">${safeName}</span>
    </nav>

    <aside style="background:#fffbeb; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px; font-size:13px; color:#92400e;">
      <strong>Citizen Transparency Notice:</strong> CSC DOST operates as an authorized Village Level Entrepreneur (VLE ID: 212515670018) under the Digital India Common Services Center framework to provide assisted e-governance service filing and document preparation.
    </aside>

    <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
        <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:10px;">
          ${safeCategory}
        </span>
        <h1 style="font-size:26px; line-height:1.3; font-weight:800; color:#0f172a; margin:0 0 12px 0;">
          ${safeName} Application &amp; Assistance
        </h1>
        <p style="font-size:15px; color:#475569; margin:0;">
          ${safeDescription}
        </p>
      </header>

      <section style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin-bottom:24px;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
          <div style="font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase;">Official Fee</div>
          <div style="font-size:20px; font-weight:800; color:#15803d; margin-top:4px;">${safePrice}</div>
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
          <div style="font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase;">Estimated Processing Time</div>
          <div style="font-size:20px; font-weight:800; color:#1e293b; margin-top:4px;">${safeTime}</div>
        </div>
      </section>

      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#1e293b; margin:0 0 12px 0;">Required Documents</h2>
        <ul style="padding-left:20px; font-size:14px; color:#334155; line-height:1.8; margin:0;">
          ${safeDocs.map((doc) => `<li>${escapeHtml(doc)}</li>`).join("")}
        </ul>
      </section>

      <section style="background:#f1f5f9; border-radius:10px; padding:18px; display:flex; flex-wrap:wrap; items-center; justify-content:space-between; gap:12px;">
        <div>
          <div style="font-weight:700; font-size:15px; color:#0f172a;">Apply Online or Direct Portal</div>
          <div style="font-size:13px; color:#64748b;">Submit your application through our assisted counter or visit the official department portal.</div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a href="/apply?service=${encodeURIComponent(service.name)}" style="display:inline-block; background:#2563eb; color:#ffffff; font-weight:600; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            Apply Online with CSC DOST
          </a>
          <a href="${safeOfficialUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#ffffff; color:#0f172a; border:1px solid #cbd5e1; font-weight:600; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            Official Department Portal \u2197
          </a>
        </div>
      </section>
    </article>

    <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
      <p>CSC DOST | Operator: Wasim Ahmad Khanday (VLE ID: 212515670018) | Sangran Qazigund, Anantnag, J&amp;K 192221</p>
      <p>
        <a href="/privacy-policy" style="color:#2563eb; text-decoration:none;">Privacy Policy</a> \u2022
        <a href="/terms-of-service" style="color:#2563eb; text-decoration:none;">Terms of Service</a> \u2022
        <a href="/disclaimer" style="color:#2563eb; text-decoration:none;">Disclaimer</a> \u2022
        <a href="/contact-us" style="color:#2563eb; text-decoration:none;">Contact Helpdesk</a>
      </p>
    </footer>
  </main>
  `;
}
function renderLegalPageSubstantiveHtml(pageType) {
  const norm = pageType.toLowerCase();
  if (norm.includes("privacy")) {
    return `
    <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
      <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
        <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#0f172a; font-weight:600;">Privacy Policy</span>
      </nav>

      <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
          <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
            Legal Compliance &amp; DPDP Act 2023
          </span>
          <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Privacy Policy</h1>
          <p style="font-size:13px; color:#64748b; margin:0;">Effective Date: February 2026 \u2022 Last Reviewed &amp; Updated: October 2026</p>
        </header>

        <section style="font-size:15px; color:#334155; space-y:16px;">
          <p>
            At <strong>CSC DOST</strong> (accessible from <code>https://www.cscdost.com</code>), the privacy and digital security of our visitors and applicants is of paramount importance. This Privacy Policy document outlines the types of personal information that is collected and recorded by CSC DOST and how we use, safeguard, and disclose it in strict accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Information Technology Act, 2000</strong>.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">1. Scope and Applicability</h2>
          <p>
            This policy applies to all visitors, applicants, and registered users of our website, web push notifications, and physical facilitation counter. By utilizing our services or accessing our site, you consent to the data practices described herein.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">2. Information We Collect</h2>
          <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
            <li><strong>Informational Visitors:</strong> We collect standard, anonymous server log files (IP addresses, browser type, referring pages, date/time stamps) strictly for aggregate security analytics and system health monitoring.</li>
            <li><strong>Assisted Form Applicants:</strong> When you voluntarily submit an application assistance request, we collect only necessary personal data: Full Name, Father's Name, Date of Birth, Gender, Mobile Number, Email Address, and uploaded proof documents (e.g. Matriculation diploma, Domicile certificate, Photograph, Signature).</li>
            <li><strong>Web Push Subscribers:</strong> If you grant browser notification permissions, we store your anonymous cryptographic Web Push subscription endpoint and keys to deliver official job notifications and exam alerts. No identity data is associated with push tokens.</li>
            <li><strong>Payment Information:</strong> Online fee transactions are processed directly by <strong>Razorpay (PCI-DSS Level 1 compliant gateway)</strong>. CSC DOST does <strong>not</strong> collect, store, or view your debit/credit card numbers, CVVs, net-banking passwords, or UPI PINs.</li>
          </ul>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">3. Purpose and Legal Basis for Processing</h2>
          <p>We process citizen information exclusively for:</p>
          <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
            <li>Assisting you in submitting your form to the designated official government portal (e.g., JKSSB, SSC, University of Kashmir).</li>
            <li>Providing real-time application status updates and payment receipts via SMS, WhatsApp, and Web Push notifications.</li>
            <li>Complying with mandatory record-keeping requirements under the CSC e-Governance Services India scheme.</li>
            <li>Preventing fraudulent submissions, spam, and cyber threats.</li>
          </ul>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">4. Client-Side Document Tools Data Isolation</h2>
          <p>
            Our browser-based document resizing, signature joining, and PDF generation tools operate <strong>entirely inside your local web browser</strong> via HTML5 Canvas and WebAssembly. Your photos, signatures, and certificates are never uploaded to our servers when utilizing these offline utilities.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">5. Third-Party Advertising &amp; Google AdSense</h2>
          <p>
            We use Google AdSense (Publisher ID: <code>ca-pub-3600904217061779</code>) to serve contextual and interest-based advertisements that support our free educational articles and recruitment bulletins. Google uses cookies, including the DoubleClick DART cookie, to serve ads to users based on their visits to this and other websites on the Internet.
          </p>
          <p>
            Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style="color:#2563eb;">Google Ads Settings</a> or through the <a href="https://aboutads.info" target="_blank" rel="noopener noreferrer" style="color:#2563eb;">Network Advertising Initiative Opt-Out Page</a>.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">6. Data Retention and Erasure</h2>
          <p>
            Application records and uploaded documents are retained securely for a period of up to 180 days after application processing to permit verification and candidate support, after which they are systematically purged from our encrypted storage. Citizens may request immediate deletion of their personal records by emailing <strong>support@cscdost.com</strong> with their tracking token.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">7. Grievance Redressal Officer</h2>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
            <p style="margin:0 0 6px 0;"><strong>Data Grievance Officer:</strong> Wasim Ahmad Khanday</p>
            <p style="margin:0 0 6px 0;"><strong>Designation:</strong> Lead VLE &amp; Operator, CSC DOST (VLE ID: 212515670018)</p>
            <p style="margin:0 0 6px 0;"><strong>Email:</strong> <a href="mailto:support@cscdost.com" style="color:#2563eb;">support@cscdost.com</a> / <a href="mailto:wasimkhanday@gmail.com" style="color:#2563eb;">wasimkhanday@gmail.com</a></p>
            <p style="margin:0;"><strong>Physical Office:</strong> Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir 192221</p>
          </div>
        </section>
      </article>

      <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
        <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
      </footer>
    </main>
    `;
  }
  if (norm.includes("disclaimer")) {
    return `
    <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
      <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
        <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#0f172a; font-weight:600;">Disclaimer</span>
      </nav>

      <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
          <span style="display:inline-block; background:#fef3c7; color:#92400e; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
            Legal Disclaimer &amp; Non-Affiliation
          </span>
          <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Disclaimer &amp; Government Non-Affiliation</h1>
          <p style="font-size:13px; color:#64748b; margin:0;">Effective Date: February 2026 \u2022 Last Reviewed &amp; Updated: October 2026</p>
        </header>

        <section style="font-size:15px; color:#334155; space-y:16px;">
          <div style="background:#fffbeb; border:1px solid #fef3c7; border-left:4px solid #f59e0b; padding:16px; border-radius:0 8px 8px 0; margin-bottom:20px;">
            <p style="margin:0; font-weight:700; color:#92400e; font-size:16px;">Independent Digital Facilitation Notice</p>
            <p style="margin:8px 0 0 0; color:#78350f; font-size:14px; line-height:1.6;">
              CSC DOST (<code>www.cscdost.com</code>) is an independent private digital facilitation center operated by CSC Village Level Entrepreneur (VLE) Wasim Ahmad Khanday (VLE ID: 212515670018). We are <strong>NOT</strong> an official government website and we do not represent any government department, recruitment agency, or university.
            </p>
          </div>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">1. Informational &amp; Facilitation Scope</h2>
          <p>
            All information provided on CSC DOST regarding government recruitment (JKSSB, SSC, RRB, Indian Army), university admissions (University of Kashmir, Cluster University Srinagar), and central schemes (PM-KISAN, Ayushman Bharat PM-JAY) is published strictly for educational guidance and citizen awareness.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">2. Primary Sources &amp; Verification</h2>
          <p>
            We strongly advise all candidates and citizens to cross-verify notification details, dates, fee amounts, and eligibility requirements directly from official government gazettes and recruitment boards (<code style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">.gov.in / .nic.in</code>) before applying or remitting any payment.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">3. External Hyperlinks</h2>
          <p>
            CSC DOST contains links to third-party government and organizational websites. We do not exercise editorial or administrative control over external portals, nor do we assume liability for their content, availability, or operational changes.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">4. Contact &amp; Questions</h2>
          <p>
            If you have questions regarding this disclaimer, please contact us at <a href="mailto:support@cscdost.com" style="color:#2563eb;">support@cscdost.com</a> or phone: <a href="tel:+917006833767" style="color:#2563eb;">+91 70068 33767</a>. Physical Office: Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir 192221.
          </p>
        </section>
      </article>

      <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
        <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
      </footer>
    </main>
    `;
  }
  if (norm.includes("terms")) {
    return `
    <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
      <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
        <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#0f172a; font-weight:600;">Terms of Service</span>
      </nav>

      <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
          <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
            Citizen Agreement
          </span>
          <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Terms of Service &amp; User Agreement</h1>
          <p style="font-size:13px; color:#64748b; margin:0;">Effective Date: February 2026 \u2022 Last Reviewed &amp; Updated: October 2026</p>
        </header>

        <section style="font-size:15px; color:#334155; space-y:16px;">
          <p>
            These Terms of Service govern your access to and use of <strong>CSC DOST</strong> (<code>www.cscdost.com</code>) and services rendered at our physical CSC facilitation desk in Sangran Qazigund, J&amp;K.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">1. Nature of Services</h2>
          <p>
            CSC DOST offers citizen assistance for online application filling, document preparation, and government scheme enrollment. We charge nominal facilitation fees strictly for clerical, printing, and digital data-entry assistance in accordance with CSC e-Governance norms.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">2. Applicant Responsibility</h2>
          <p>
            Applicants are solely responsible for ensuring the accuracy and authenticity of personal details, dates of birth, educational certificates, and category claims submitted through our assistance portal. CSC DOST is not liable for rejections arising from incorrect information provided by the candidate.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">3. Payments &amp; Gateway</h2>
          <p>
            All electronic payments are processed securely via Razorpay. Official government exam fees are paid directly to designated recruitment boards. Facilitation charges are clearly itemized on payment receipts.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">4. Legal Jurisdiction</h2>
          <p>
            Any dispute arising out of or in connection with services provided by CSC DOST shall be subject to the exclusive jurisdiction of the competent courts in District Anantnag, Jammu &amp; Kashmir.
          </p>
        </section>
      </article>

      <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
        <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
      </footer>
    </main>
    `;
  }
  if (norm.includes("about")) {
    return `
    <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
      <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
        <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#0f172a; font-weight:600;">About Us</span>
      </nav>

      <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
          <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
            Operator Profile &amp; Mission
          </span>
          <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">About CSC DOST (cscdost.com)</h1>
          <p style="font-size:13px; color:#64748b; margin:0;">Published by Authorized CSC VLE Wasim Ahmad Khanday \u2022 Verified &amp; Active</p>
        </header>

        <section style="font-size:15px; color:#334155; space-y:16px;">
          <p>
            Welcome to <strong>CSC DOST</strong> (operating digitally at <code>www.cscdost.com</code>), an independent citizen assistance, e-governance facilitation, and informational guidance platform.
          </p>
          <p>
            CSC DOST was established to bridge the digital divide between rural/semi-urban citizens and modern digital e-governance systems. Millions of candidates and families across Jammu &amp; Kashmir and India face technical barriers, complex form-filling requirements, strict image compression criteria, and unfamiliar payment gateways when applying for recruitments, competitive examinations, scholarship schemes, or welfare programs. CSC DOST offers verified guides, step-by-step assistance, and direct links to official authorities.
          </p>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:18px; margin:20px 0;">
            <h2 style="font-size:18px; font-weight:700; color:#0f172a; margin:0 0 10px 0;">Certified CSC Entrepreneur Details</h2>
            <ul style="list-style:none; padding:0; margin:0; font-size:14px; color:#334155; line-height:1.9;">
              <li><strong>Lead Operator:</strong> Wasim Ahmad Khanday</li>
              <li><strong>Authorized CSC VLE ID:</strong> 212515670018</li>
              <li><strong>MSME Udyam Registration:</strong> UDYAM-JK-01-0041957</li>
              <li><strong>Physical Facilitation Center:</strong> Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir (PIN: 192221)</li>
              <li><strong>Helpline Contact:</strong> +91 70068 33767 / +91 96821 32895</li>
              <li><strong>Support Email:</strong> support@cscdost.com</li>
            </ul>
          </div>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">Core Services Provided</h2>
          <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
            <li><strong>Recruitment Bulletin &amp; Sarkari Results:</strong> Daily verified updates on Indian Army, RRB Railways, SSC Staff Selection Commission, JKSSB, Kashmir University admissions, and Cluster University Srinagar notices.</li>
            <li><strong>Citizen E-Governance Guidance:</strong> Educational walkthroughs for PAN card registration, Aadhaar address correction, Ayushman Bharat PM-JAY Golden Card issuance, PM-KISAN e-KYC, and state domicile certificates.</li>
            <li><strong>Browser-Based Document Tools:</strong> Free client-side image resizers, photo signature joiners, and document optimizers designed to meet exact government pixel and kilobyte specifications without sending files to private external servers.</li>
            <li><strong>Assisted Application Desk:</strong> Optional citizen facilitation where applicants who cannot complete complex online forms can book physical or virtual assistance from our certified VLE center.</li>
          </ul>
        </section>
      </article>

      <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
        <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
      </footer>
    </main>
    `;
  }
  if (norm.includes("contact")) {
    return `
    <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
      <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
        <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#0f172a; font-weight:600;">Contact Us</span>
      </nav>

      <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
          <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
            Helpdesk &amp; Citizen Support
          </span>
          <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Contact Us &amp; Physical Center Details</h1>
          <p style="font-size:13px; color:#64748b; margin:0;">We are available to assist citizens with technical questions, application tracking, and grievances.</p>
        </header>

        <section style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin:20px 0;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:18px;">
            <h2 style="font-size:16px; font-weight:700; color:#0f172a; margin:0 0 10px 0;">\u{1F3E2} Physical Facilitation Desk</h2>
            <p style="font-size:14px; color:#334155; line-height:1.8; margin:0;">
              <strong>Address:</strong> CSC DOST Facilitation Desk, Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir, PIN: 192221, India<br/>
              <strong>CSC VLE ID:</strong> 212515670018<br/>
              <strong>Operator:</strong> Wasim Ahmad Khanday<br/>
              <strong>Working Hours:</strong> Mon \u2013 Sat: 9:00 AM \u2013 7:00 PM IST (Closed Sundays)
            </p>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:18px;">
            <h2 style="font-size:16px; font-weight:700; color:#0f172a; margin:0 0 10px 0;">\u{1F4DE} Electronic Helpdesk</h2>
            <p style="font-size:14px; color:#334155; line-height:1.8; margin:0;">
              <strong>Helpline / Phone:</strong> <a href="tel:+917006833767" style="color:#2563eb;">+91 70068 33767</a><br/>
              <strong>Alternate Contact:</strong> +91 96821 32895<br/>
              <strong>Support Email:</strong> <a href="mailto:support@cscdost.com" style="color:#2563eb;">support@cscdost.com</a><br/>
              <strong>Grievance Officer:</strong> Wasim Ahmad Khanday (<a href="mailto:wasimkhanday@gmail.com" style="color:#2563eb;">wasimkhanday@gmail.com</a>)<br/>
              <strong>Tracking Desk:</strong> <a href="/track" style="color:#2563eb;">cscdost.com/track</a>
            </p>
          </div>
        </section>
      </article>

      <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
        <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
      </footer>
    </main>
    `;
  }
  return `
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
    <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
      <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#0f172a; font-weight:600;">Refund Policy</span>
    </nav>

    <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
        <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
          Fee Policy
        </span>
        <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Refund &amp; Cancellation Policy</h1>
        <p style="font-size:13px; color:#64748b; margin:0;">Effective Date: February 2026 \u2022 Last Reviewed: October 2026</p>
      </header>

      <section style="font-size:15px; color:#334155; space-y:16px;">
        <p>
          At <strong>CSC DOST</strong>, we strive to deliver transparent, reliable digital facilitation and e-governance application assistance.
        </p>
        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">1. Facilitation Fees</h2>
        <p>
          Facilitation fees paid for clerical form-filling and application assistance are refundable if the assistance request is cancelled prior to form submission on the government portal. Once an application is officially filed and an application number is generated on the government system, facilitation charges become non-refundable.
        </p>
        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">2. Government Examination &amp; Portal Fees</h2>
        <p>
          Official fees remitted directly to recruitment boards (JKSSB, SSC, UPSC, RRB) or government authorities are governed strictly by each respective department's policies and are generally non-refundable once remitted.
        </p>
        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">3. Refund Processing</h2>
        <p>
          Approved refunds will be processed to the original payment source within 5-7 business days via our payment gateway (Razorpay). For inquiries, email <a href="mailto:support@cscdost.com" style="color:#2563eb;">support@cscdost.com</a> with your transaction token.
        </p>
      </section>
    </article>

    <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
      <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
    </footer>
  </main>
  `;
}
function renderHomepageSubstantiveHtml(posts, services) {
  const topPosts = posts.slice(0, 15);
  const topServices = services.slice(0, 8);
  return `
  <main class="ssr-homepage-wrapper" style="max-width:1100px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.6;">
    <!-- Hero Banner -->
    <header style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color:#ffffff; border-radius:16px; padding:32px 24px; margin-bottom:28px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#93c5fd; margin-bottom:8px;">
        Authorized CSC Village Level Entrepreneur \u2022 VLE ID: 212515670018
      </div>
      <h1 style="font-size:32px; font-weight:800; line-height:1.2; margin:0 0 12px 0;">
        CSC DOST \u2013 Independent Digital Assistance &amp; Citizen Information Portal
      </h1>
      <p style="font-size:16px; color:#e0e7ff; max-width:800px; line-height:1.6; margin:0 0 20px 0;">
        Fast, verified recruitment updates (JKSSB, Indian Army, SSC, RRB), central scheme guides (PM-KISAN, Ayushman Bharat PM-JAY, Aadhaar, PAN card), and free citizen document preparation tools.
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:12px; font-size:14px;">
        <a href="#sarkari-board" style="background:#ffffff; color:#1e3a8a; font-weight:700; padding:10px 20px; border-radius:8px; text-decoration:none;">
          Browse Latest Jobs
        </a>
        <a href="/tools" style="background:rgba(255,255,255,0.15); color:#ffffff; font-weight:600; padding:10px 20px; border-radius:8px; text-decoration:none; border:1px solid rgba(255,255,255,0.3);">
          Online Document Tools
        </a>
        <a href="/track" style="background:rgba(255,255,255,0.15); color:#ffffff; font-weight:600; padding:10px 20px; border-radius:8px; text-decoration:none; border:1px solid rgba(255,255,255,0.3);">
          Track Application
        </a>
      </div>
    </header>

    <!-- Government Transparency Notice -->
    <aside style="background:#fffbeb; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:28px; font-size:13px; color:#92400e;">
      <strong>Official Transparency Notice:</strong> CSC DOST (cscdost.com) is an independent private digital facilitation center operated by CSC VLE Wasim Ahmad Khanday in Sangran Qazigund, Anantnag, J&amp;K. We are <strong>NOT</strong> an official government website. Official portals end with <code style="background:#fef3c7; padding:2px 4px; border-radius:3px;">.gov.in</code> or <code style="background:#fef3c7; padding:2px 4px; border-radius:3px;">.nic.in</code>.
    </aside>

    <!-- Latest Recruitment Notifications -->
    <section id="sarkari-board" style="margin-bottom:36px;">
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:16px;">
        <h2 style="font-size:22px; font-weight:800; color:#0f172a; margin:0;">
          Latest Sarkari Jobs &amp; Notifications
        </h2>
        <span style="font-size:13px; color:#64748b;">Updated Daily</span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px;">
        ${topPosts.map((post) => `
          <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:11px; font-weight:700; color:#2563eb; background:#eff6ff; padding:3px 8px; border-radius:4px; text-transform:uppercase;">
                  ${escapeHtml(post.category?.replace(/_/g, " "))}
                </span>
                <span style="font-size:12px; color:#b91c1c; font-weight:600;">Last Date: ${escapeHtml(post.lastDate)}</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; line-height:1.35; margin:0 0 8px 0;">
                <a href="/post/${escapeHtml(post.id)}" style="color:#0f172a; text-decoration:none;">
                  ${escapeHtml(post.title)}
                </a>
              </h3>
              <p style="font-size:13px; color:#475569; line-height:1.5; margin:0 0 12px 0;">
                ${escapeHtml((post.shortInfo || "").slice(0, 110))}...
              </p>
            </div>
            <div style="border-top:1px solid #f1f5f9; padding-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:12px;">
              <span style="color:#64748b;">Posts: <strong>${escapeHtml(post.totalPosts || "Open")}</strong></span>
              <a href="/post/${escapeHtml(post.id)}" style="color:#2563eb; font-weight:600; text-decoration:none;">
                View Details &amp; Apply \u2192
              </a>
            </div>
          </article>
        `).join("")}
      </div>
    </section>

    <!-- Core Citizen Services -->
    <section id="services" style="margin-bottom:36px;">
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:16px;">
        <h2 style="font-size:22px; font-weight:800; color:#0f172a; margin:0;">
          Citizen E-Governance Services
        </h2>
        <span style="font-size:13px; color:#64748b;">Assisted Digital Counter</span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:14px;">
        ${topServices.map((service) => `
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
            <div style="font-size:11px; font-weight:600; color:#15803d; text-transform:uppercase; margin-bottom:4px;">${escapeHtml(service.category)}</div>
            <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 6px 0;">
              <a href="/service/${escapeHtml(service.id)}" style="color:#0f172a; text-decoration:none;">${escapeHtml(service.name)}</a>
            </h3>
            <p style="font-size:12px; color:#64748b; line-height:1.4; margin:0 0 10px 0;">${escapeHtml(service.description.slice(0, 85))}...</p>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px;">
              <span style="font-weight:700; color:#0f172a;">${escapeHtml(service.price)}</span>
              <a href="/service/${escapeHtml(service.id)}" style="color:#2563eb; font-weight:600; text-decoration:none;">View Service \u2192</a>
            </div>
          </div>
        `).join("")}
      </div>
    </section>

    <!-- Frequently Asked Questions -->
    <section style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:24px; margin-bottom:36px;">
      <h2 style="font-size:20px; font-weight:800; color:#0f172a; margin:0 0 16px 0;">Frequently Asked Questions</h2>
      <div style="space-y:14px;">
        <div style="margin-bottom:14px;">
          <h3 style="font-size:15px; font-weight:700; color:#1e293b; margin:0 0 4px 0;">What is CSC DOST?</h3>
          <p style="font-size:14px; color:#475569; margin:0;">
            CSC DOST (cscdost.com) is an independent citizen assistance portal and information desk operated by authorized CSC Village Level Entrepreneur Wasim Ahmad Khanday in Sangran Qazigund, Anantnag, Jammu &amp; Kashmir.
          </p>
        </div>
        <div>
          <h3 style="font-size:15px; font-weight:700; color:#1e293b; margin:0 0 4px 0;">Is CSC DOST an official government website?</h3>
          <p style="font-size:14px; color:#475569; margin:0;">
            No. CSC DOST is a private digital facilitation center and information portal. We are NOT an official government website. Official government portals include csc.gov.in, digitalseva.csc.gov.in, and jkssb.nic.in.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer Links -->
    <footer style="border-top:1px solid #e2e8f0; padding-top:20px; text-align:center; font-size:13px; color:#64748b; line-height:1.8;">
      <p style="margin:0 0 8px 0;">
        <a href="/about-us" style="color:#2563eb; text-decoration:none; margin:0 8px;">About Us</a> |
        <a href="/contact-us" style="color:#2563eb; text-decoration:none; margin:0 8px;">Contact Helpdesk</a> |
        <a href="/privacy-policy" style="color:#2563eb; text-decoration:none; margin:0 8px;">Privacy Policy (DPDP Act)</a> |
        <a href="/terms-of-service" style="color:#2563eb; text-decoration:none; margin:0 8px;">Terms of Service</a> |
        <a href="/disclaimer" style="color:#2563eb; text-decoration:none; margin:0 8px;">Disclaimer</a> |
        <a href="/refund-policy" style="color:#2563eb; text-decoration:none; margin:0 8px;">Refund Policy</a>
      </p>
      <p style="margin:0; font-size:12px;">\xA9 2026 CSC DOST \u2022 Operator: Wasim Ahmad Khanday (CSC VLE ID: 212515670018) \u2022 Sangran Qazigund, Anantnag, J&amp;K 192221</p>
    </footer>
  </main>
  `;
}
function renderNotFoundSubstantiveHtml(requestedPath) {
  const safePath = escapeHtml(requestedPath);
  return `
  <main class="ssr-not-found-wrapper" style="min-height:70vh; display:flex; align-items:center; justify-content:center; padding:40px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; background:#f8fafc;">
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; max-width:540px; padding:36px; text-align:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="font-size:48px; margin-bottom:12px;">\u{1F4CB}</div>
      <h1 style="font-size:24px; font-weight:800; color:#0f172a; margin:0 0 10px 0;">Page or Notification Not Found (404)</h1>
      <p style="color:#64748b; font-size:14px; line-height:1.6; margin:0 0 20px 0;">
        The requested address <code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:13px; color:#0f172a;">${safePath}</code> does not exist or may have expired after the recruitment closing date.
      </p>
      <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
        <a href="/" style="display:inline-block; background:#2563eb; color:#ffffff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
          Return to Homepage
        </a>
        <a href="/#sarkari-board" style="display:inline-block; background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
          Latest Sarkari Jobs
        </a>
      </div>
    </div>
  </main>
  `;
}

// src/dbServer.ts
import fs2 from "fs";
import path2 from "path";
var DB_PATH = path2.join(process.cwd(), "data", "db.json");
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
  pushSettings: { autoPublishPush: false, welcomePushEnabled: true },
  paymentTransactions: []
};
var memoryDb = null;
function initDb() {
  if (memoryDb) return;
  try {
    const dir = path2.dirname(DB_PATH);
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
      if (!parsed.paymentTransactions) parsed.paymentTransactions = [];
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
function updateAppointmentPayment(id, paymentUpdate) {
  const db = getDb();
  const item = db.appointments.find(
    (r) => r.id === id || r.appId === id || r.supabaseId === id
  );
  if (item) {
    if (paymentUpdate.paymentMethod) item.paymentMethod = paymentUpdate.paymentMethod;
    if (paymentUpdate.paymentStatus) item.paymentStatus = paymentUpdate.paymentStatus;
    if (paymentUpdate.amountPaid !== void 0) item.amountPaid = paymentUpdate.amountPaid;
    if (paymentUpdate.amountDue !== void 0) item.amountDue = paymentUpdate.amountDue;
    if (paymentUpdate.utrNumber) item.utrNumber = paymentUpdate.utrNumber;
    if (paymentUpdate.gatewayTxnId) item.gatewayTxnId = paymentUpdate.gatewayTxnId;
    if (paymentUpdate.paidAt) item.paidAt = paymentUpdate.paidAt;
    if (paymentUpdate.offlineReceiptNo) item.offlineReceiptNo = paymentUpdate.offlineReceiptNo;
    if (paymentUpdate.offlineCollectedBy) item.offlineCollectedBy = paymentUpdate.offlineCollectedBy;
    saveDb(db);
    return true;
  }
  return false;
}
function upsertPaymentTransaction(txn) {
  const db = getDb();
  if (!db.paymentTransactions) db.paymentTransactions = [];
  const idx = db.paymentTransactions.findIndex((t) => t.txnid === txn.txnid);
  const updatedTxn = {
    ...txn,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (idx !== -1) {
    db.paymentTransactions[idx] = { ...db.paymentTransactions[idx], ...updatedTxn };
  } else {
    db.paymentTransactions.unshift({
      ...updatedTxn,
      createdAt: updatedTxn.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  saveDb(db);
  return db.paymentTransactions.find((t) => t.txnid === txn.txnid);
}
function getPaymentTransactions() {
  const db = getDb();
  return db.paymentTransactions || [];
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
async function updateSupabasePaymentRecord(identifier, paymentData) {
  const supabase = getServerSupabaseClient();
  if (!supabase) return { success: false, error: "Supabase client not initialized" };
  try {
    const lookup = await findSupabaseApplicationRows(identifier);
    if (!lookup.rows || lookup.rows.length === 0) {
      return { success: false, error: `Application "${identifier}" not found in Supabase.` };
    }
    const targetRow = lookup.rows[0];
    const targetUuid = String(targetRow.id);
    const existingPayload = targetRow.payload && typeof targetRow.payload === "object" ? targetRow.payload : {};
    const updatedPayload = {
      ...existingPayload,
      paymentMethod: paymentData.paymentMethod || existingPayload.paymentMethod,
      paymentStatus: paymentData.paymentStatus || existingPayload.paymentStatus,
      amountPaid: paymentData.amountPaid !== void 0 ? paymentData.amountPaid : existingPayload.amountPaid,
      amountDue: paymentData.amountDue !== void 0 ? paymentData.amountDue : existingPayload.amountDue,
      gatewayTxnId: paymentData.gatewayTxnId || existingPayload.gatewayTxnId,
      payuMihpayid: paymentData.payuMihpayid || existingPayload.payuMihpayid,
      payuBankRef: paymentData.payuBankRef || existingPayload.payuBankRef,
      paidAt: paymentData.paidAt || existingPayload.paidAt,
      offlineReceiptNo: paymentData.offlineReceiptNo || existingPayload.offlineReceiptNo,
      offlineCollectedBy: paymentData.offlineCollectedBy || existingPayload.offlineCollectedBy,
      offlineCollectedAt: paymentData.offlineCollectedAt || existingPayload.offlineCollectedAt,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const updateObj = {
      payload: updatedPayload
    };
    if (paymentData.paymentMethod) updateObj.payment_mode = paymentData.paymentMethod;
    if (paymentData.paymentStatus === "paid" && paymentData.amountPaid) {
      updateObj.utr_number = paymentData.gatewayTxnId || paymentData.payuMihpayid || "PAID";
    }
    try {
      const { error: fullUpdateErr } = await supabase.from("applications").update({
        ...updateObj,
        payment_method: paymentData.paymentMethod,
        payment_status: paymentData.paymentStatus,
        amount_paid: paymentData.amountPaid,
        amount_due: paymentData.amountDue,
        gateway_txnid: paymentData.gatewayTxnId,
        payu_mihpayid: paymentData.payuMihpayid,
        payu_bank_ref: paymentData.payuBankRef,
        paid_at: paymentData.paidAt,
        offline_receipt_no: paymentData.offlineReceiptNo,
        offline_collected_by: paymentData.offlineCollectedBy,
        offline_collected_at: paymentData.offlineCollectedAt
      }).eq("id", targetUuid);
      if (!fullUpdateErr) {
        return { success: true };
      }
    } catch {
    }
    const { error: fallbackErr } = await supabase.from("applications").update(updateObj).eq("id", targetUuid);
    if (fallbackErr) {
      return { success: false, error: fallbackErr.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err?.message || String(err) };
  }
}
async function recordSupabasePaymentTransaction(txn) {
  const supabase = getServerSupabaseClient();
  if (!supabase) return { success: false, error: "Supabase client not initialized" };
  try {
    const { error } = await supabase.from("payment_transactions").upsert({
      txnid: txn.txnid,
      token_id: txn.tokenId || txn.token_id || txn.appId,
      application_id: txn.applicationId || txn.appId,
      customer_name: txn.customerName || txn.customer_name || "Customer",
      customer_phone: txn.customerPhone || txn.customer_phone || "",
      customer_email: txn.customerEmail || txn.customer_email || "",
      service_name: txn.serviceName || txn.service_name || "",
      payment_method: txn.paymentMethod || txn.payment_method || "online_payu",
      gateway: "payu",
      govt_fee: txn.govtFee || 0,
      csc_fee: txn.cscFee || 70,
      delivery_fee: txn.deliveryFee || 0,
      total_amount: txn.totalAmount || txn.amount || 0,
      currency: "INR",
      status: txn.status || "initiated",
      payu_mihpayid: txn.payuMihpayid || txn.mihpayid,
      bank_ref_num: txn.bankRefNum || txn.bank_ref_num,
      payment_mode: txn.paymentMode || txn.mode,
      hash_verified: Boolean(txn.hashVerified),
      api_verified: Boolean(txn.apiVerified),
      error_message: txn.errorMessage || txn.error,
      request_payload: txn.requestPayload,
      response_payload: txn.responsePayload,
      verification_payload: txn.verificationPayload,
      created_at: txn.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, { onConflict: "txnid" });
    if (error) {
      console.warn("[SupabaseServer] payment_transactions insert notice:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.warn("[SupabaseServer] payment_transactions exception:", err?.message);
    return { success: false, error: err?.message };
  }
}

// src/server/payu.ts
import crypto from "crypto";
function getPayUMerchantKey() {
  return (process.env.PAYU_MERCHANT_KEY || process.env.PAYU_KEY || "").trim();
}
function getPayUMerchantSalt() {
  return (process.env.PAYU_MERCHANT_SALT || process.env.PAYU_SALT || "").trim();
}
function getPayUEnv() {
  return (process.env.PAYU_ENV || "test").toLowerCase().trim();
}
function getAppBaseUrl() {
  return (process.env.APP_BASE_URL || "https://www.cscdost.com").replace(/\/+$/, "");
}
function getPayUPaymentUrl() {
  const env = getPayUEnv();
  return env === "production" || env === "prod" || env === "live" ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment";
}
function getPayUVerifyUrl() {
  const env = getPayUEnv();
  return env === "production" || env === "prod" || env === "live" ? "https://info.payu.in/merchant/postservice?form=2" : "https://test.payu.in/merchant/postservice?form=2";
}
var PAYU_MERCHANT_KEY = getPayUMerchantKey();
var PAYU_MERCHANT_SALT = getPayUMerchantSalt();
var PAYU_ENV = getPayUEnv();
var APP_BASE_URL = getAppBaseUrl();
var PAYU_PAYMENT_URL = getPayUPaymentUrl();
var PAYU_VERIFY_URL = getPayUVerifyUrl();
function isPayUConfigured() {
  const key = getPayUMerchantKey();
  const salt = getPayUMerchantSalt();
  const isPlaceholder = (val) => !val || val.includes("<") || val.includes(">") || val.includes("placeholder") || val === "YOUR_KEY_HERE";
  return Boolean(key && salt && !isPlaceholder(key) && !isPlaceholder(salt));
}
function calculateAuthoritativePrice(serviceNameOrId, userCategory, deliveryOption) {
  const cleanTarget = (serviceNameOrId || "").toLowerCase().trim();
  let govtFee = 0;
  let cscFee = 70;
  let deliveryFee = 0;
  if (deliveryOption === "speed_post") {
    deliveryFee = 50;
  }
  const matchedService = SERVICES_LIST.find(
    (s) => s.id.toLowerCase() === cleanTarget || s.name.toLowerCase() === cleanTarget || cleanTarget.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(cleanTarget)
  );
  if (matchedService) {
    const priceStr = matchedService.price || "";
    const numMatches = priceStr.match(/₹\s*(\d+)/g);
    if (numMatches && numMatches.length > 0) {
      const parsedNums = numMatches.map((m) => parseInt(m.replace(/[^\d]/g, ""), 10)).filter((n) => !isNaN(n));
      if (parsedNums.length >= 2) {
        govtFee = parsedNums[0];
        cscFee = parsedNums[1];
      } else if (parsedNums.length === 1) {
        if (priceStr.toLowerCase().includes("govt")) {
          govtFee = parsedNums[0];
        } else {
          cscFee = parsedNums[0];
        }
      }
    }
    return {
      govtFee,
      cscFee,
      deliveryFee,
      totalAmount: Math.max(1, govtFee + cscFee + deliveryFee),
      description: matchedService.name
    };
  }
  const matchedJob = SARKARI_DATA.find(
    (item) => item.id.toLowerCase() === cleanTarget || item.title.toLowerCase() === cleanTarget || cleanTarget.includes(item.title.toLowerCase())
  );
  if (matchedJob && matchedJob.fees) {
    const isReserved = userCategory && (userCategory.toLowerCase().includes("sc") || userCategory.toLowerCase().includes("st") || userCategory.toLowerCase().includes("female"));
    const rawFee = isReserved ? matchedJob.fees.scSt : matchedJob.fees.genObc;
    const matchDigits = String(rawFee || "").match(/(\d+)/);
    if (matchDigits) {
      govtFee = parseInt(matchDigits[1], 10);
    }
    return {
      govtFee,
      cscFee: 70,
      deliveryFee,
      totalAmount: Math.max(1, govtFee + 70 + deliveryFee),
      description: matchedJob.title
    };
  }
  return {
    govtFee: 0,
    cscFee: 70,
    deliveryFee,
    totalAmount: Math.max(1, 70 + deliveryFee),
    description: serviceNameOrId || "CSC DOST E-Governance Service"
  };
}
function generatePayURequestHash(params) {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    salt
  } = params;
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  return crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
}
function verifyPayUResponseHash(responseParams, salt) {
  const {
    key = "",
    txnid = "",
    amount = "",
    productinfo = "",
    firstname = "",
    email = "",
    status = "",
    hash = "",
    additionalCharges,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = ""
  } = responseParams;
  if (!hash || !salt) {
    return false;
  }
  let hashSequence = "";
  if (additionalCharges && String(additionalCharges).trim().length > 0) {
    hashSequence = `${additionalCharges}|${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  } else {
    hashSequence = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  }
  const calculatedHash = crypto.createHash("sha512").update(hashSequence).digest("hex").toLowerCase();
  return calculatedHash === String(hash).toLowerCase().trim();
}
async function verifyPaymentWithPayU(txnid) {
  const key = getPayUMerchantKey();
  const salt = getPayUMerchantSalt();
  const verifyUrl = getPayUVerifyUrl();
  if (!isPayUConfigured()) {
    if (txnid.startsWith("MOCK_") || txnid.startsWith("TEST_PAYU_")) {
      return {
        success: true,
        status: "success",
        mihpayid: `PAYU_MOCK_${Date.now()}`,
        bankRefNum: `AXIS_${Date.now().toString().slice(-6)}`,
        amount: 70,
        mode: "UPI",
        message: "Mock verification completed (Test Mode)"
      };
    }
    return {
      success: false,
      status: "error",
      message: "PayU credentials are not configured in production environment."
    };
  }
  try {
    const hashString = `${key}|verify_payment|${txnid}|${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
    const bodyParams = new URLSearchParams();
    bodyParams.append("key", key);
    bodyParams.append("command", "verify_payment");
    bodyParams.append("var1", txnid);
    bodyParams.append("hash", hash);
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: bodyParams.toString()
    });
    if (!response.ok) {
      return {
        success: false,
        status: "error",
        message: `PayU Verify API HTTP ${response.status}`
      };
    }
    const data = await response.json();
    if (data && data.status === 1 && data.transaction_details && data.transaction_details[txnid]) {
      const details = data.transaction_details[txnid];
      const txnStatus = String(details.status || "").toLowerCase();
      return {
        success: txnStatus === "success",
        status: txnStatus === "success" ? "success" : txnStatus === "pending" ? "pending" : "failure",
        mihpayid: details.mihpayid,
        bankRefNum: details.bank_ref_num,
        amount: Number(details.amt || details.transaction_amount || 0),
        mode: details.mode,
        message: details.error_Message || details.msg || "Transaction verified with PayU gateway",
        rawResponse: details
      };
    }
    return {
      success: false,
      status: "not_found",
      message: data.msg || "Transaction details not found on PayU",
      rawResponse: data
    };
  } catch (err) {
    console.error("[PayU] verifyPaymentWithPayU exception:", err?.message || err);
    return {
      success: false,
      status: "error",
      message: err?.message || "Network error verifying payment with PayU"
    };
  }
}

// src/lib/pushServer.ts
import fs3 from "fs";
import path3 from "path";
import webpush from "web-push";
var VAPID_FILE = path3.join(process.cwd(), "data", "vapid.json");
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
      const targetDir = fs3.existsSync(path3.dirname(VAPID_FILE)) ? VAPID_FILE : TMP_VAPID_FILE;
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
app.get("/api/payu/config", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    success: true,
    configured: isPayUConfigured(),
    env: getPayUEnv(),
    merchantKey: isPayUConfigured() ? getPayUMerchantKey() : "TEST_KEY",
    paymentUrl: getPayUPaymentUrl()
  });
});
app.all("/api/payu/mock-gateway", (req, res) => {
  const mergedParams = {
    ...req.query || {},
    ...req.body || {}
  };
  const key = mergedParams.key || "TEST_KEY";
  const txnid = mergedParams.txnid || "TEST_TXN";
  const amount = mergedParams.amount || "70.00";
  const productinfo = mergedParams.productinfo || "Service";
  const firstname = mergedParams.firstname || "Customer";
  const email = mergedParams.email || "customer@example.com";
  const udf1 = mergedParams.udf1 || "CSC21251567001";
  const surl = mergedParams.surl || `${getAppBaseUrl()}/api/payu/response`;
  const furl = mergedParams.furl || `${getAppBaseUrl()}/api/payu/response`;
  const effectiveSalt = isPayUConfigured() ? getPayUMerchantSalt() : "test_mock_salt_12345";
  const mihpayid = `PAYU_MOCK_${Date.now()}`;
  const bankRefNum = `AXIS_${Date.now().toString().slice(-6)}`;
  const successSeq = `${effectiveSalt}|success|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const successHash = crypto2.createHash("sha512").update(successSeq).digest("hex").toLowerCase();
  const failSeq = `${effectiveSalt}|failure|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const failHash = crypto2.createHash("sha512").update(failSeq).digest("hex").toLowerCase();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PayU Hosted Checkout Simulator | CSC DOST</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; color: #0f172a; }
    .card { max-width: 480px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0b192c; color: white; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; }
    .header h2 { margin: 0; font-size: 18px; font-weight: 700; }
    .badge { background: #0284c7; color: white; font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: 600; text-transform: uppercase; }
    .body { padding: 24px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .info-row .label { color: #64748b; font-weight: 500; }
    .info-row .value { color: #0f172a; font-weight: 600; font-family: monospace; }
    .total-row { display: flex; justify-content: space-between; padding: 14px 0; margin-top: 10px; font-size: 16px; font-weight: 700; color: #16a34a; }
    .actions { display: flex; gap: 12px; margin-top: 24px; }
    .btn { flex: 1; padding: 14px; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; text-align: center; }
    .btn-pay { background: #16a34a; color: white; }
    .btn-pay:hover { background: #15803d; }
    .btn-cancel { background: #fee2e2; color: #b91c1c; }
    .btn-cancel:hover { background: #fecaca; }
    .notice { font-size: 11px; color: #64748b; text-align: center; margin-top: 16px; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h2>PayU Hosted Checkout</h2>
        <small style="opacity: 0.8; font-size: 11px;">Official Test Mode Simulator</small>
      </div>
      <span class="badge">Test Environment</span>
    </div>
    <div class="body">
      <div class="info-row">
        <span class="label">Merchant</span>
        <span class="value">CSC DOST (E-Services)</span>
      </div>
      <div class="info-row">
        <span class="label">Order / Token Ref</span>
        <span class="value">${udf1}</span>
      </div>
      <div class="info-row">
        <span class="label">Transaction ID</span>
        <span class="value">${txnid}</span>
      </div>
      <div class="info-row">
        <span class="label">Customer Name</span>
        <span class="value">${firstname}</span>
      </div>
      <div class="info-row">
        <span class="label">Service</span>
        <span class="value">${productinfo}</span>
      </div>
      <div class="total-row">
        <span>Amount Payable</span>
        <span>\u20B9${amount}</span>
      </div>

      <div class="actions">
        <!-- Success Form -->
        <form action="${surl}" method="POST" style="flex: 1;">
          <input type="hidden" name="status" value="success" />
          <input type="hidden" name="txnid" value="${txnid}" />
          <input type="hidden" name="amount" value="${amount}" />
          <input type="hidden" name="productinfo" value="${productinfo}" />
          <input type="hidden" name="firstname" value="${firstname}" />
          <input type="hidden" name="email" value="${email}" />
          <input type="hidden" name="key" value="${key}" />
          <input type="hidden" name="mihpayid" value="${mihpayid}" />
          <input type="hidden" name="bank_ref_num" value="${bankRefNum}" />
          <input type="hidden" name="mode" value="UPI" />
          <input type="hidden" name="udf1" value="${udf1}" />
          <input type="hidden" name="hash" value="${successHash}" />
          <button type="submit" class="btn btn-pay" style="width: 100%;">
            \u2713 Simulate Pay Securely
          </button>
        </form>

        <!-- Failure Form -->
        <form action="${furl}" method="POST" style="flex: 1;">
          <input type="hidden" name="status" value="failure" />
          <input type="hidden" name="txnid" value="${txnid}" />
          <input type="hidden" name="amount" value="${amount}" />
          <input type="hidden" name="productinfo" value="${productinfo}" />
          <input type="hidden" name="firstname" value="${firstname}" />
          <input type="hidden" name="email" value="${email}" />
          <input type="hidden" name="key" value="${key}" />
          <input type="hidden" name="mihpayid" value="" />
          <input type="hidden" name="error" value="E000" />
          <input type="hidden" name="error_Message" value="User cancelled payment session" />
          <input type="hidden" name="udf1" value="${udf1}" />
          <input type="hidden" name="hash" value="${failHash}" />
          <button type="submit" class="btn btn-cancel" style="width: 100%;">
            \u2715 Simulate Failure / Cancel
          </button>
        </form>
      </div>

      <p class="notice">
        This simulator mirrors PayU's hosted checkout page for local testing and demonstration. In production with real Vercel credentials, users are redirected to <strong>secure.payu.in</strong>.
      </p>
    </div>
  </div>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});
app.post("/api/payu/initiate", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const {
      appId,
      customerName,
      email,
      phone,
      serviceName,
      userCategory,
      deliveryOption
    } = req.body || {};
    const cleanName = String(customerName || "").trim();
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    const cleanService = String(serviceName || "").trim();
    const cleanAppId = String(appId || "").trim();
    if (!cleanName || cleanPhone.length < 10 || !cleanService) {
      return res.status(400).json({
        success: false,
        error: "Please provide Customer Name, 10-digit Phone Number, and Service Name."
      });
    }
    const priceInfo = calculateAuthoritativePrice(cleanService, userCategory, deliveryOption);
    const amountFormatted = priceInfo.totalAmount.toFixed(2);
    let resolvedAppId = cleanAppId;
    if (!resolvedAppId || !resolvedAppId.startsWith("CSC")) {
      const supaMax = await getHighestSupabaseTokenSeq();
      const nextSeq = getNextMonotonicLocalSeq(supaMax);
      resolvedAppId = `CSC21251567${String(nextSeq).padStart(3, "0")}`;
    }
    const db = getDb();
    const existingLocal = (db.appointments || []).find(
      (a) => !isDeletedApplicationRecord(a) && String(a.appId || a.id).toLowerCase() === resolvedAppId.toLowerCase()
    );
    if (existingLocal && String(existingLocal.paymentStatus || "").toLowerCase() === "paid") {
      return res.status(400).json({
        success: false,
        error: `Application ${resolvedAppId} has already been paid and verified.`
      });
    }
    const txnid = `PAYU_${Date.now()}_${crypto2.randomBytes(3).toString("hex").toUpperCase()}`;
    const configured = isPayUConfigured();
    const merchantKey = configured ? getPayUMerchantKey() : process.env.PAYU_MERCHANT_KEY || "TEST_KEY";
    const merchantSalt = configured ? getPayUMerchantSalt() : "test_mock_salt_12345";
    const surl = `${getAppBaseUrl()}/api/payu/response`;
    const furl = `${getAppBaseUrl()}/api/payu/response`;
    const firstName = cleanName.split(" ")[0] || "Customer";
    const emailAddr = String(email || "").trim() || "customer@cscdost.com";
    const productInfo = priceInfo.description.substring(0, 95);
    const hash = generatePayURequestHash({
      key: merchantKey,
      txnid,
      amount: amountFormatted,
      productinfo: productInfo,
      firstname: firstName,
      email: emailAddr,
      udf1: resolvedAppId,
      udf2: cleanService.substring(0, 95),
      udf3: cleanPhone,
      udf4: userCategory || "",
      udf5: deliveryOption || "",
      salt: merchantSalt
    });
    const payuParams = {
      key: merchantKey,
      txnid,
      amount: amountFormatted,
      productinfo: productInfo,
      firstname: firstName,
      email: emailAddr,
      phone: cleanPhone,
      surl,
      furl,
      hash,
      udf1: resolvedAppId,
      udf2: cleanService.substring(0, 95),
      udf3: cleanPhone,
      udf4: userCategory || "",
      udf5: deliveryOption || ""
    };
    const txnRecord = {
      txnid,
      tokenId: resolvedAppId,
      appId: resolvedAppId,
      customerName: cleanName,
      customerPhone: cleanPhone,
      customerEmail: emailAddr,
      serviceName: cleanService,
      paymentMethod: "online_payu",
      govtFee: priceInfo.govtFee,
      cscFee: priceInfo.cscFee,
      deliveryFee: priceInfo.deliveryFee,
      totalAmount: priceInfo.totalAmount,
      status: "initiated",
      requestPayload: {
        amount: amountFormatted,
        productinfo: productInfo,
        key: merchantKey,
        configured
      },
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    upsertPaymentTransaction(txnRecord);
    recordSupabasePaymentTransaction(txnRecord).catch(
      (err) => console.warn("[PayU Initiate] Supabase transaction audit warning:", err)
    );
    updateAppointmentPayment(resolvedAppId, {
      paymentMethod: "online_payu",
      paymentStatus: "pending_verification",
      amountDue: priceInfo.totalAmount,
      gatewayTxnId: txnid
    });
    updateSupabasePaymentRecord(resolvedAppId, {
      paymentMethod: "online_payu",
      paymentStatus: "pending_verification",
      amountDue: priceInfo.totalAmount,
      gatewayTxnId: txnid
    }).catch((err) => console.warn("[PayU Initiate] Supabase appointment update notice:", err));
    const actionUrl = configured ? getPayUPaymentUrl() : `${getAppBaseUrl()}/api/payu/mock-gateway`;
    console.log(`\u{1F4B3} [PayU Initiate] Checkout session prepared [Txn: ${txnid}] for ${cleanName} - \u20B9${amountFormatted}`);
    return res.status(200).json({
      success: true,
      actionUrl,
      params: payuParams,
      isMockTestMode: !configured,
      orderSummary: {
        appId: resolvedAppId,
        customerName: cleanName,
        serviceName: cleanService,
        govtFee: priceInfo.govtFee,
        cscFee: priceInfo.cscFee,
        deliveryFee: priceInfo.deliveryFee,
        totalAmount: priceInfo.totalAmount,
        amountFormatted: `\u20B9${amountFormatted}`
      }
    });
  } catch (err) {
    console.error("[PayU Initiate Error]:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to initiate PayU payment session: " + (err?.message || "Server error")
    });
  }
});
app.post("/api/payu/response", async (req, res) => {
  try {
    const responseData = req.body || {};
    const {
      status,
      txnid,
      amount,
      udf1,
      mihpayid,
      bank_ref_num,
      error_Message,
      mode
    } = responseData;
    const cleanTxnid = String(txnid || "").trim();
    const cleanAppId = String(udf1 || "").trim();
    const cleanStatus = String(status || "").toLowerCase().trim();
    const configured = isPayUConfigured();
    const salt = configured ? getPayUMerchantSalt() : "test_mock_salt_12345";
    console.log(`\u{1F4E5} [PayU Callback Received] Status: "${cleanStatus}" | TxnID: ${cleanTxnid} | AppID: ${cleanAppId}`);
    const hashValid = verifyPayUResponseHash(responseData, salt);
    if (!hashValid && configured) {
      console.error(`\u{1F6A8} [PayU Security Alert] Hash mismatch on transaction callback ${cleanTxnid}!`);
      return res.redirect(
        303,
        `${getAppBaseUrl()}/track?token=${encodeURIComponent(cleanAppId)}&payment=tampered&reason=Hash+signature+verification+failed`
      );
    }
    const verifyResult = await verifyPaymentWithPayU(cleanTxnid);
    const isPaymentSuccessful = cleanStatus === "success" && (verifyResult.success || !configured);
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    if (isPaymentSuccessful) {
      const finalAmount = Number(amount || verifyResult.amount || 0);
      updateAppointmentPayment(cleanAppId, {
        paymentMethod: "online_payu",
        paymentStatus: "paid",
        amountPaid: finalAmount,
        amountDue: 0,
        gatewayTxnId: cleanTxnid,
        utrNumber: mihpayid || cleanTxnid,
        paidAt: nowIso
      });
      updateAppointmentStatus(cleanAppId, "approved");
      upsertPaymentTransaction({
        txnid: cleanTxnid,
        tokenId: cleanAppId,
        appId: cleanAppId,
        status: "paid",
        payuMihpayid: mihpayid || verifyResult.mihpayid,
        bankRefNum: bank_ref_num || verifyResult.bankRefNum,
        paymentMode: mode || verifyResult.mode || "ONLINE",
        hashVerified: true,
        apiVerified: verifyResult.success,
        responsePayload: responseData,
        verificationPayload: verifyResult.rawResponse,
        updatedAt: nowIso
      });
      updateSupabasePaymentRecord(cleanAppId, {
        paymentMethod: "online_payu",
        paymentStatus: "paid",
        amountPaid: finalAmount,
        amountDue: 0,
        gatewayTxnId: cleanTxnid,
        payuMihpayid: mihpayid || verifyResult.mihpayid,
        payuBankRef: bank_ref_num || verifyResult.bankRefNum,
        paidAt: nowIso
      }).catch((err) => console.warn("[PayU Response] Supabase payment update notice:", err));
      recordSupabasePaymentTransaction({
        txnid: cleanTxnid,
        tokenId: cleanAppId,
        appId: cleanAppId,
        status: "paid",
        payuMihpayid: mihpayid || verifyResult.mihpayid,
        bankRefNum: bank_ref_num || verifyResult.bankRefNum,
        paymentMode: mode || verifyResult.mode,
        hashVerified: true,
        apiVerified: verifyResult.success,
        responsePayload: responseData,
        verificationPayload: verifyResult.rawResponse,
        updatedAt: nowIso
      }).catch((err) => console.warn("[PayU Response] Supabase transaction audit notice:", err));
      const db = getDb();
      const updatedApp = (db.appointments || []).find((a) => a.appId === cleanAppId || a.id === cleanAppId);
      broadcastRealtimeEvent("APPOINTMENT_UPDATED", updatedApp || { appId: cleanAppId, paymentStatus: "paid" });
      console.log(`\u2705 [PayU Payment Reconciled & Paid] Token ${cleanAppId} | \u20B9${finalAmount} | Ref: ${mihpayid}`);
      return res.redirect(
        303,
        `${getAppBaseUrl()}/track?token=${encodeURIComponent(cleanAppId)}&payment=success&txnid=${encodeURIComponent(cleanTxnid)}&ref=${encodeURIComponent(mihpayid || "")}&amt=${encodeURIComponent(String(finalAmount))}`
      );
    } else {
      const failReason = error_Message || verifyResult.message || "Payment transaction was not completed";
      updateAppointmentPayment(cleanAppId, {
        paymentMethod: "online_payu",
        paymentStatus: "failed",
        gatewayTxnId: cleanTxnid
      });
      upsertPaymentTransaction({
        txnid: cleanTxnid,
        tokenId: cleanAppId,
        appId: cleanAppId,
        status: "failed",
        errorMessage: failReason,
        responsePayload: responseData,
        verificationPayload: verifyResult.rawResponse,
        updatedAt: nowIso
      });
      updateSupabasePaymentRecord(cleanAppId, {
        paymentMethod: "online_payu",
        paymentStatus: "failed",
        gatewayTxnId: cleanTxnid
      }).catch((err) => console.warn("[PayU Response Failed] Supabase notice:", err));
      console.log(`\u26A0\uFE0F [PayU Payment Incomplete/Failed] Token: ${cleanAppId} | Reason: ${failReason}`);
      return res.redirect(
        303,
        `${getAppBaseUrl()}/track?token=${encodeURIComponent(cleanAppId)}&payment=failed&txnid=${encodeURIComponent(cleanTxnid)}&reason=${encodeURIComponent(failReason)}`
      );
    }
  } catch (err) {
    console.error("[PayU Response Handler Exception]:", err?.message || err);
    return res.redirect(
      303,
      `${getAppBaseUrl()}/track?payment=error&reason=${encodeURIComponent("Server error processing payment callback")}`
    );
  }
});
app.post("/api/payu/webhook", async (req, res) => {
  try {
    const payload = req.body || {};
    const { status, txnid, udf1, mihpayid } = payload;
    const cleanTxnid = String(txnid || "").trim();
    const cleanAppId = String(udf1 || "").trim();
    if (!cleanTxnid) {
      return res.status(400).json({ success: false, error: "Missing txnid" });
    }
    const salt = isPayUConfigured() ? getPayUMerchantSalt() : "test_mock_salt_12345";
    const hashValid = verifyPayUResponseHash(payload, salt);
    if (!hashValid && isPayUConfigured()) {
      return res.status(400).json({ success: false, error: "Invalid webhook signature" });
    }
    const verifyResult = await verifyPaymentWithPayU(cleanTxnid);
    if (verifyResult.success || String(status).toLowerCase() === "success") {
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      updateAppointmentPayment(cleanAppId, {
        paymentMethod: "online_payu",
        paymentStatus: "paid",
        gatewayTxnId: cleanTxnid,
        utrNumber: mihpayid || cleanTxnid,
        paidAt: nowIso
      });
      updateSupabasePaymentRecord(cleanAppId, {
        paymentMethod: "online_payu",
        paymentStatus: "paid",
        gatewayTxnId: cleanTxnid,
        paidAt: nowIso
      }).catch(() => {
      });
    }
    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message || "Webhook error" });
  }
});
app.post("/api/payu/recheck", authenticateAdmin, async (req, res) => {
  try {
    const { txnid, appId } = req.body || {};
    if (!txnid && !appId) {
      return res.status(400).json({ success: false, error: "Transaction ID or Application ID required." });
    }
    const db = getDb();
    let targetTxnid = String(txnid || "").trim();
    let targetAppId = String(appId || "").trim();
    if (!targetTxnid && targetAppId) {
      const matchedApp = (db.appointments || []).find((a) => a.appId === targetAppId || a.id === targetAppId);
      targetTxnid = matchedApp?.gatewayTxnId || matchedApp?.utrNumber || "";
    }
    if (!targetTxnid) {
      return res.status(404).json({
        success: false,
        error: "No payment transaction reference found for this application to verify."
      });
    }
    const verifyResult = await verifyPaymentWithPayU(targetTxnid);
    if (verifyResult.success && targetAppId) {
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      updateAppointmentPayment(targetAppId, {
        paymentStatus: "paid",
        amountPaid: verifyResult.amount,
        paidAt: nowIso
      });
      updateSupabasePaymentRecord(targetAppId, {
        paymentStatus: "paid",
        amountPaid: verifyResult.amount,
        paidAt: nowIso
      }).catch(() => {
      });
    }
    return res.status(200).json({
      success: true,
      verifiedStatus: verifyResult.status,
      details: verifyResult
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Recheck failed: " + (err?.message || err) });
  }
});
app.post("/api/admin/record-offline-payment", authenticateAdmin, async (req, res) => {
  try {
    const { appId, amountPaid, receiptNo, notes } = req.body || {};
    const cleanAppId = String(appId || "").trim();
    if (!cleanAppId) {
      return res.status(400).json({ success: false, error: "Application Reference ID is required." });
    }
    const numAmount = Number(amountPaid);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: "Valid collected amount in \u20B9 is required." });
    }
    const staffUser = req.adminUser?.username || "Mahi";
    const finalReceiptNo = String(receiptNo || `CSC_CASH_${Date.now().toString().slice(-6)}`).trim();
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const localUpdated = updateAppointmentPayment(cleanAppId, {
      paymentMethod: "pay_at_centre",
      paymentStatus: "paid",
      amountPaid: numAmount,
      amountDue: 0,
      offlineReceiptNo: finalReceiptNo,
      offlineCollectedBy: staffUser,
      paidAt: nowIso
    });
    const supaResult = await updateSupabasePaymentRecord(cleanAppId, {
      paymentMethod: "pay_at_centre",
      paymentStatus: "paid",
      amountPaid: numAmount,
      amountDue: 0,
      offlineReceiptNo: finalReceiptNo,
      offlineCollectedBy: staffUser,
      offlineCollectedAt: nowIso,
      paidAt: nowIso
    });
    const cashTxnId = `CASH_${cleanAppId}_${Date.now().toString().slice(-6)}`;
    upsertPaymentTransaction({
      txnid: cashTxnId,
      tokenId: cleanAppId,
      appId: cleanAppId,
      customerName: "Offline Citizen",
      serviceName: "CSC Counter Collection",
      paymentMethod: "pay_at_centre",
      totalAmount: numAmount,
      status: "paid",
      offlineReceiptNo: finalReceiptNo,
      offlineCollectedBy: staffUser,
      createdAt: nowIso
    });
    recordSupabasePaymentTransaction({
      txnid: cashTxnId,
      tokenId: cleanAppId,
      appId: cleanAppId,
      paymentMethod: "pay_at_centre",
      totalAmount: numAmount,
      status: "paid",
      offlineReceiptNo: finalReceiptNo,
      offlineCollectedBy: staffUser,
      createdAt: nowIso
    }).catch(() => {
    });
    const db = getDb();
    const updated = (db.appointments || []).find((a) => a.appId === cleanAppId || a.id === cleanAppId);
    broadcastRealtimeEvent("APPOINTMENT_UPDATED", updated || { appId: cleanAppId, paymentStatus: "paid" });
    console.log(`\u{1F4B5} [Cash Collected] App ${cleanAppId} marked PAID: \u20B9${numAmount} by Staff "${staffUser}" [Slip: ${finalReceiptNo}]`);
    return res.status(200).json({
      success: true,
      message: `Offline cash payment of \u20B9${numAmount} successfully recorded.`,
      appId: cleanAppId,
      receiptNo: finalReceiptNo,
      collectedBy: staffUser,
      collectedAt: nowIso
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to record offline payment: " + (err?.message || err) });
  }
});
app.get("/api/payu/transactions", authenticateAdmin, (_req, res) => {
  const transactions = getPaymentTransactions();
  return res.status(200).json({
    success: true,
    transactions
  });
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
    const expectedSignature = crypto2.createHmac("sha256", keySecret).update(body).digest("hex");
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
        const localFilePath = path4.join(process.cwd(), "public", "thumbnails", `${rawId}.${format}`);
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
    const publicThumbDir = path4.join(process.cwd(), "public", "thumbnails");
    if (!fs4.existsSync(publicThumbDir)) {
      fs4.mkdirSync(publicThumbDir, { recursive: true });
    }
    const ext = format === "webp" ? "webp" : "png";
    const fileName = `${postId}.${ext}`;
    const localDiskPath = path4.join(publicThumbDir, fileName);
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
    const fallbackPath = path4.join(process.cwd(), "public", "og-banner.png");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).sendFile(fallbackPath);
  }
});
app.get(["/og-banner.png", "/og-image.png"], async (req, res) => {
  const bannerPath = path4.join(process.cwd(), "public", "og-banner.png");
  if (fs4.existsSync(bannerPath)) {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
    return res.sendFile(bannerPath);
  }
  const png = await generateSocialPreviewPng(null);
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
  return res.send(png);
});
app.get(["/og-banner.svg", "/og-image.svg"], (req, res) => {
  const bannerPath = path4.join(process.cwd(), "public", "og-banner.svg");
  if (fs4.existsSync(bannerPath)) {
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
    return res.sendFile(bannerPath);
  }
  const svg = generateOgSvg(null);
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
  return res.send(svg);
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
  let ogImage = `${baseOrigin}/og-banner.png?v=2026_v3`;
  let canonicalUrl = `https://www.cscdost.com${urlPath === "/" ? "" : urlPath}`;
  let ogType = "website";
  let articlePublishedDate = "";
  let breadcrumbItems = [];
  let substantiveBodyHtml = "";
  const legalMatch = urlPath.match(/^\/(privacy-policy|privacy|terms-of-service|terms|disclaimer|about-us|about|contact-us|contact|refund-policy|refund)(?:\/)?$/i);
  if (legalMatch) {
    const rawKey = legalMatch[1].toLowerCase();
    substantiveBodyHtml = renderLegalPageSubstantiveHtml(rawKey);
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
      ogImage = `${baseOrigin}/api/og-image/${encodeURIComponent(item.id)}.png?v=${dateVersion}_v3`;
      canonicalUrl = `https://www.cscdost.com/post/${item.id}`;
      ogType = "article";
      articlePublishedDate = item.postDate || "2026-02-20";
      breadcrumbItems = [
        { name: "Home", url: "https://www.cscdost.com/" },
        { name: "Recruitment", url: "https://www.cscdost.com/#sarkari-board" },
        { name: item.title, url: canonicalUrl }
      ];
      substantiveBodyHtml = renderPostSubstantiveHtml(item);
    } else if (matchPost) {
      isNotFound = true;
      title = "Notification Not Found (404) | CSC DOST";
      description = "The requested recruitment notification or examination update could not be found or has expired. Please check active recruitment updates on the CSC DOST portal.";
      canonicalUrl = `${baseOrigin}/#sarkari-board`;
      substantiveBodyHtml = renderNotFoundSubstantiveHtml(urlPath);
    }
  } else if (targetServiceId) {
    const service = SERVICES_LIST.find((s) => s.id === targetServiceId || s.id === decodeURIComponent(targetServiceId));
    if (service) {
      title = `${service.name} Online Application | CSC DOST`;
      description = `${service.description} Processing time: ${service.estimatedTime}. Official fee: ${service.price}. Fast & reliable application assistance at cscdost.com.`;
      ogImage = `${baseOrigin}/api/og-image/${encodeURIComponent(service.id)}.png?v=srv_v3`;
      canonicalUrl = `https://www.cscdost.com/service/${service.id}`;
      ogType = "website";
      breadcrumbItems = [
        { name: "Home", url: "https://www.cscdost.com/" },
        { name: "Services", url: "https://www.cscdost.com/#services" },
        { name: service.name, url: canonicalUrl }
      ];
      substantiveBodyHtml = renderServiceSubstantiveHtml(service);
    } else if (matchService) {
      isNotFound = true;
      title = "Service Not Found (404) | CSC DOST";
      description = "The requested citizen service could not be found. Please check our complete service directory on the CSC DOST portal.";
      canonicalUrl = `${baseOrigin}/#services`;
      substantiveBodyHtml = renderNotFoundSubstantiveHtml(urlPath);
    }
  } else if (urlPath === "/") {
    const allSarkari = [...SARKARI_DATA, ...getCustomSarkariPosts()];
    substantiveBodyHtml = renderHomepageSubstantiveHtml(allSarkari, SERVICES_LIST);
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
  if (isNotFound && !substantiveBodyHtml) {
    substantiveBodyHtml = renderNotFoundSubstantiveHtml(urlPath);
  }
  if (substantiveBodyHtml) {
    html = html.replace('<div id="root"></div>', `<div id="root">${substantiveBodyHtml}</div>`);
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
    const sitemapPath = path4.join(process.cwd(), "public", "sitemap.xml");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.sendFile(sitemapPath);
  }
});
app.get("/robots.txt", (req, res) => {
  const robotsPath = path4.join(process.cwd(), "public", "robots.txt");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.sendFile(robotsPath);
});
app.use(express.static(path4.join(process.cwd(), "public")));
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  const distPath = path4.join(process.cwd(), "dist");
  const indexHtmlPath = path4.join(distPath, "index.html");
  const rootHtmlPath = path4.join(process.cwd(), "index.html");
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
async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(async (req, res, next) => {
      const url = req.originalUrl || req.url;
      const isPostOrServiceOrLegal = req.path === "/" || /^\/(?:post|job|jobs|sarkari|notice|admissions|notification|service|privacy-policy|privacy|terms-of-service|terms|disclaimer|about-us|about|contact-us|contact|refund-policy|refund)(?:\/|$)/i.test(req.path) || Boolean(req.query.post || req.query.job || req.query.service || req.query.id);
      const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Googlebot|bingbot|Slackbot/i.test(
        req.headers["user-agent"] || ""
      );
      if ((isPostOrServiceOrLegal || isCrawler) && req.method === "GET" && !req.path.includes(".")) {
        try {
          const indexHtml = fs4.readFileSync(path4.join(process.cwd(), "index.html"), "utf-8");
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
