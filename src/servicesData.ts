export interface ServiceItem {
  id: string;
  name: string;
  category: 'csc' | 'revenue' | 'jk_state' | 'digital' | 'education' | 'business';
  description: string;
  requirements: string[];
  estimatedTime: string;
  price: string;
  popular?: boolean;
}

export const CATEGORY_LABELS = {
  csc: 'CSC Government Services',
  revenue: 'JK Revenue Services',
  jk_state: 'J&K State e-Services',
  digital: 'Digital & Cyber Services',
  education: 'Education & Admissions',
  business: 'Business & Registrations'
};

export const SERVICES_LIST: ServiceItem[] = [
  // CSC Services
  {
    id: 'csc-pan',
    name: 'New PAN Card Application',
    category: 'csc',
    description: 'Fresh Permanent Account Number (PAN) application & correction services with e-KYC support.',
    requirements: ['Aadhaar Card', '2 Passport Size Photos', 'Aadhaar-linked Mobile Number'],
    estimatedTime: '3 - 7 Days',
    price: '₹107 (Govt Fee) + ₹50 (CSC Charge)',
    popular: true
  },
  {
    id: 'csc-aadhaar',
    name: 'Aadhaar Card Update Assistance',
    category: 'csc',
    description: 'Demographic updates (Name, Address, DOB, Gender, Mobile Number) and photo verification guidance.',
    requirements: ['Aadhaar Card', 'Valid Address/ID Proof (e.g., Voter ID, Passport, Bank Passbook)'],
    estimatedTime: '2 - 5 Days',
    price: '₹50 (Standard Govt/CSC Fee)',
    popular: true
  },
  {
    id: 'csc-voter',
    name: 'Voter ID Card Services',
    category: 'csc',
    description: 'Apply for a new Voter ID card, make corrections, shift assembly constituencies, or request PVC card printing.',
    requirements: ['Aadhaar Card', 'Age Proof', 'Passport Size Photo', 'Address Proof'],
    estimatedTime: '15 - 30 Days',
    price: '₹30 - ₹50 (Application/PVC Print)'
  },
  {
    id: 'csc-ayushman',
    name: 'Ayushman Bharat Golden Card',
    category: 'csc',
    description: 'Check eligibility and register for free ₹5 Lakh health insurance cover under PM-JAY scheme.',
    requirements: ['Aadhaar Card', 'Ration Card / PM Letter'],
    estimatedTime: 'Same Day',
    price: 'FREE (₹0 Govt Scheme Registration)'
  },
  {
    id: 'csc-pmkisan',
    name: 'PM Kisan Registration & e-KYC',
    category: 'csc',
    description: 'Apply for farmer registration under PM Kisan Samman Nidhi Yojana and mandatory e-KYC updates.',
    requirements: ['Aadhaar Card', 'Land Registry Copy (Khatauni)', 'Bank Passbook Copy'],
    estimatedTime: 'Same Day',
    price: '₹15 - ₹30 (Mandatory Portal Fee)'
  },
  {
    id: 'csc-eshram',
    name: 'e-Shram & Labour Card',
    category: 'csc',
    description: 'Registration for unorganized sector workers to secure central government accident insurance and social benefits.',
    requirements: ['Aadhaar Card', 'Bank Account Number', 'Mobile Number'],
    estimatedTime: 'Same Day',
    price: 'FREE (Govt) / ₹20 (Lamination Print)'
  },
  {
    id: 'csc-certificates',
    name: 'State Certificates (Caste/Income/Domicile)',
    category: 'csc',
    description: 'Authorized state-level applications for Caste, Domicile, Income, Marriage, Birth, Death, and Character Certificates.',
    requirements: ['Aadhaar Card', 'Ration Card Copy', 'Self-Declaration Form', 'Address Proof'],
    estimatedTime: '7 - 15 Days',
    price: '₹30 (Govt Fee) + ₹30 (Filing Charge)',
    popular: true
  },
  {
    id: 'csc-ration',
    name: 'New Ration Card & Corrections',
    category: 'csc',
    description: 'Apply for a new digital ration card, add or delete family member names, and address updates.',
    requirements: ['Aadhaar Cards of all members', 'Head of Family Photo', 'Income Proof'],
    estimatedTime: '15 - 30 Days',
    price: '₹50 (Service & Portal Fee)'
  },
  {
    id: 'csc-passport',
    name: 'Passport Application Filing',
    category: 'csc',
    description: 'Online registration for fresh passports, renewals, tatkaal services, and appointment booking at PSK.',
    requirements: ['Aadhaar Card', '10th Marksheet/Non-ECR Proof', 'Bank Statement', 'Address Proof'],
    estimatedTime: 'Appointment booked in 24h',
    price: '₹1500 (Govt Fee) + ₹200 (CSC Filing)'
  },
  {
    id: 'csc-dl',
    name: 'Driving Licence Services',
    category: 'csc',
    description: 'Apply for fresh learners licence, permanent driving licence, DL renewal, duplicate copy, or address changes.',
    requirements: ['Age Proof (10th pass/Aadhaar)', 'Address Proof', 'Physical Fitness Declaration'],
    estimatedTime: 'Slot Booking same day',
    price: '₹200 - ₹500 (Govt RTO Fee depend)'
  },
  {
    id: 'csc-utility',
    name: 'Utility Bill Payments & Recharges',
    category: 'csc',
    description: 'Instant payments for electricity bills, water bills, gas cylinders, mobile/DTH, FASTag recharges, and premium insurance payments.',
    requirements: ['Consumer ID / Policy Number', 'Mobile Number'],
    estimatedTime: 'Instant Credit',
    price: 'FREE (₹0 Convenience Fee)',
    popular: true
  },

  // Digital Services
  {
    id: 'dig-print',
    name: 'B&W / Color Printing & Scanning',
    category: 'digital',
    description: 'High-quality laser printing, document scanning (PDF/JPG formats), and thick-pouch lamination up to A3 size.',
    requirements: ['Soft Copy via WhatsApp, Email, or USB Drive'],
    estimatedTime: 'Instant',
    price: 'B&W ₹2/pg, Color ₹10/pg, Lamination ₹20'
  },
  {
    id: 'dig-photo',
    name: 'Passport Size Photos & Editing',
    category: 'digital',
    description: 'Instant professional passport photo capture, digital background replacement, skin tone touchups, and physical sheets printing.',
    requirements: ['Physical presence for photo or digital file'],
    estimatedTime: '5 Minutes',
    price: '₹50 (8 Photos) / ₹80 (16 Photos)',
    popular: true
  },
  {
    id: 'dig-form',
    name: 'Professional Resume & Typing Services',
    category: 'digital',
    description: 'Design interactive resumes, document editing, PDF combining, and precise typing in Hindi, English, or regional languages.',
    requirements: ['Handwritten Draft or legacy CV', 'Educational Details'],
    estimatedTime: '15 - 30 Minutes',
    price: '₹50 - ₹100 (Based on pages)'
  },

  // Education Services
  {
    id: 'edu-admissions',
    name: 'School & College Admissions',
    category: 'education',
    description: 'Admissions application support for schools, open universities (e.g., IGNOU, DU SOL), and local colleges.',
    requirements: ['Previous Year Marksheets', 'Category Certificate (if applicable)', 'Photo', 'ID Proof'],
    estimatedTime: 'Same Day',
    price: '₹50 - ₹100 + University Fee'
  },
  {
    id: 'edu-scholarship',
    name: 'National & State Scholarship Forms',
    category: 'education',
    description: 'Secure application filling for national (NSP) and state e-kalyan scholarships for minor, SC/ST, and OBC candidates.',
    requirements: ['Aadhaar Card', 'Previous Class Marksheet', 'Income Certificate', 'Caste Certificate', 'Bank Passbook'],
    estimatedTime: '1 - 2 Hours',
    price: '₹50 - ₹80 (Full Filing)'
  },
  {
    id: 'edu-exams',
    name: 'Competitive Exam & Admit Card Downloads',
    category: 'education',
    description: 'Filing for central/state exams (SSC, UPSC, Banking, NEET, JEE) and instant colorful admit card downloads.',
    requirements: ['Academic Credentials', 'Signature Scans', 'Photo Scans'],
    estimatedTime: '20 Minutes',
    price: '₹50 - ₹100 (Exam Filing) / ₹10 (Print)',
    popular: true
  },

  // Business Services
  {
    id: 'biz-gst',
    name: 'GST Registration & Return Assistance',
    category: 'business',
    description: 'File applications for new GST registration and prepare files for monthly or quarterly GSTR filing.',
    requirements: ['PAN Card', 'Aadhaar Card', 'Business Address Proof (Rent Agreement/Electricity Bill)'],
    estimatedTime: '3 - 5 Days',
    price: '₹500 (Reg) / ₹300 (Return Filing)'
  },
  {
    id: 'biz-udyam',
    name: 'MSME & UDYAM Business Registration',
    category: 'business',
    description: 'Register small-medium enterprises under UDYAM scheme to receive interest concessions and credit benefits.',
    requirements: ['Aadhaar Card', 'PAN Card', 'Business Name & Bank Details'],
    estimatedTime: 'Same Day',
    price: '₹100 (CSC Assistance Charge)'
  },
  {
    id: 'biz-dsc',
    name: 'Digital Signature Certificate (DSC)',
    category: 'business',
    description: 'Obtain Class 3 Digital Signature Certificate (DSC) for e-tendering, company registration, and trademark filing.',
    requirements: ['Aadhaar Card', 'PAN Card', 'Aadhaar-linked Mobile (OTP verification)'],
    estimatedTime: '24 Hours',
    price: '₹1200 - ₹1500 (2 Year Token)'
  },

  // JK Revenue Services (Revenue Department Govt of Jammu & Kashmir)
  {
    id: 'rev-attestation-mutation',
    name: 'Attestation of Mutations',
    category: 'revenue',
    description: 'Official attestation & registration of land ownership mutation (Inteqal) following sale, inheritance, gift, or exchange in J&K Revenue records.',
    requirements: ['Registered Sale/Gift Deed or Death Certificate', 'Aadhaar Card', 'Khatauni / Jamabandi Copy', 'Patwari Field Verification Report'],
    estimatedTime: '7 - 15 Days',
    price: '₹50 (Govt Fee) + ₹50 (CSC Charge)',
    popular: true
  },
  {
    id: 'rev-clu',
    name: 'Change Of Land Use (CLU)',
    category: 'revenue',
    description: 'Formal application for conversion or permission to change agricultural land for residential, commercial, or industrial purposes in Jammu & Kashmir.',
    requirements: ['Aadhaar Card', 'Title Deed / Fard', 'Aks Masavi / Site Layout Plan', 'NOC from Relevant Local Authorities'],
    estimatedTime: '15 - 30 Days',
    price: 'As per Govt tariff + ₹100 (Filing Charge)'
  },
  {
    id: 'rev-copy-mutation',
    name: 'Copy of Mutation',
    category: 'revenue',
    description: 'Issuance of certified copy of registered Mutation (Inteqal order sheet) from official Tehsildar land revenue archives.',
    requirements: ['Mutation Number', 'Village & Tehsil Name', 'Applicant Aadhaar Card', 'Khata / Khewat Details'],
    estimatedTime: '3 - 7 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)'
  },
  {
    id: 'rev-encumbrance-cert',
    name: 'Encumbrance Certificate',
    category: 'revenue',
    description: 'Official Revenue Department certificate confirming that a parcel of land or property is free from legal liabilities, mortgages, or financial claims.',
    requirements: ['Aadhaar Card', 'Property / Land Title Copy', 'Registered Deed Details', 'Survey / Khasra Number'],
    estimatedTime: '5 - 10 Days',
    price: '₹50 (Govt Fee) + ₹40 (CSC Charge)'
  },
  {
    id: 'rev-aks-masavi',
    name: 'Extract of Aks Masavi / Latha',
    category: 'revenue',
    description: 'Official certified map extract (Aks Masavi/Latha) displaying exact land boundary contours, survey numbers, and adjacent plots.',
    requirements: ['Khasra Number', 'Village & Tehsil Details', 'Applicant ID Proof (Aadhaar)', 'Fard Copy'],
    estimatedTime: '3 - 7 Days',
    price: '₹40 (Govt Fee) + ₹30 (CSC Charge)'
  },
  {
    id: 'rev-chulah-chowkidara',
    name: 'Extract of Chulah / Chowkidara',
    category: 'revenue',
    description: 'Certified extract of Chulah / Chowkidara tax register used as historical household residence and family lineage proof in rural J&K.',
    requirements: ['Head of Family Name', 'Village / Panchayat Name', 'Aadhaar Card', 'Old Ancestral Residence Proof'],
    estimatedTime: '5 - 10 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)'
  },
  {
    id: 'rev-girdawari',
    name: 'Extract of Girdawari',
    category: 'revenue',
    description: 'Certified copy of harvest inspection register (Khasra Girdawari) detailing current cultivation, crop details, and land possession status.',
    requirements: ['Khasra / Khewat Number', 'Aadhaar Card', 'Village & Patwari Circle Details'],
    estimatedTime: '3 - 5 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)',
    popular: true
  },
  {
    id: 'rev-jamabandi',
    name: 'Extract of Jamabandi',
    category: 'revenue',
    description: 'Certified copy of Record of Rights (RoR / Jamabandi) detailing land ownership, shares, area, and revenue liability in J&K.',
    requirements: ['Khewat / Khatauni / Khasra Number', 'Landowner Name', 'Aadhaar Card'],
    estimatedTime: '3 - 7 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)',
    popular: true
  },
  {
    id: 'rev-fard',
    name: 'Fard (Fard Intikhab)',
    category: 'revenue',
    description: 'Official land record extract (Fard) required for property sales, bank loan approvals, court verification, or mortgage deeds.',
    requirements: ['Khasra / Khatauni Number', 'Owner Aadhaar Card', 'Bank or Legal Reference Document'],
    estimatedTime: '2 - 5 Days',
    price: '₹50 (Govt Fee) + ₹40 (CSC Charge)',
    popular: true
  },
  {
    id: 'rev-field-book',
    name: 'Field Book Extract',
    category: 'revenue',
    description: 'Certified copy of Revenue Field Book containing precise geometric measurements, survey line dimensions, and boundary markings.',
    requirements: ['Khasra Number', 'Village & Tehsil', 'Aadhaar Card', 'Jamabandi Reference'],
    estimatedTime: '5 - 10 Days',
    price: '₹40 (Govt Fee) + ₹30 (CSC Charge)'
  },
  {
    id: 'rev-court-files',
    name: 'Files of Court Cases',
    category: 'revenue',
    description: 'Certified copy of revenue court proceedings, order sheets, partition suits, and land dispute judgments from Tehsildar / DC Courts.',
    requirements: ['Case / Suit Number', 'Court Name (Tehsildar/ACR/DC)', 'Applicant Aadhaar Card', 'Party Details'],
    estimatedTime: '7 - 15 Days',
    price: '₹50 (Govt Fee) + ₹50 (CSC Charge)'
  },
  {
    id: 'rev-income-cert',
    name: 'Income Certificate',
    category: 'revenue',
    description: 'Official Revenue Department Income Certificate required for educational scholarships, government welfare schemes, and job quotas.',
    requirements: ['Aadhaar Card', 'Salary Slip / Chowkidar Verification Report', 'Ration Card Copy', 'Self Declaration Affidavit'],
    estimatedTime: '5 - 10 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)',
    popular: true
  },
  {
    id: 'rev-income-dependency',
    name: 'Income Dependency Certificate',
    category: 'revenue',
    description: 'Revenue certificate validating financial dependency on the head of family for higher education, medical reimbursement, or welfare claims.',
    requirements: ['Aadhaar Cards of Dependent & Family Head', 'Income Certificate of Head', 'Ration Card Copy', 'Affidavit'],
    estimatedTime: '7 - 12 Days',
    price: '₹40 (Govt Fee) + ₹30 (CSC Charge)'
  },
  {
    id: 'rev-land-passbook',
    name: 'Land Pass Book',
    category: 'revenue',
    description: 'Issuance and digital update of official Land Pass Book containing comprehensive landholding and revenue details of a farmer/landowner.',
    requirements: ['Aadhaar Card', 'Khewat / Khatauni Numbers', 'Aadhaar-linked Mobile Number', 'Passport Size Photo'],
    estimatedTime: '7 - 15 Days',
    price: '₹100 (Govt Fee) + ₹50 (CSC Charge)'
  },
  {
    id: 'rev-legal-heir',
    name: 'Legal Heir Certificate',
    category: 'revenue',
    description: 'Official Revenue certificate certifying surviving legal heirs of a deceased person for inheritance, pension claims, bank deposits, and land transfer.',
    requirements: ['Death Certificate', 'Aadhaar Cards of All Surviving Heirs', 'Family Tree (Shajra Nasab)', 'Notarized Affidavit'],
    estimatedTime: '15 - 30 Days',
    price: '₹50 (Govt Fee) + ₹50 (CSC Charge)',
    popular: true
  },
  {
    id: 'rev-demarcation',
    name: 'Measurement / Demarcation of Land',
    category: 'revenue',
    description: 'Formal application for physical boundary measurement and demarcation (Nishandehi) of land parcels by Revenue Surveyors/Patwaris.',
    requirements: ['Aadhaar Card', 'Title Deed / Jamabandi Copy', 'Khasra Number', 'Adjacent Landowner Names'],
    estimatedTime: '15 - 30 Days',
    price: '₹100 (Govt Fee) + ₹50 (CSC Charge)'
  },
  {
    id: 'rev-prc-files',
    name: 'PRC Files',
    category: 'revenue',
    description: 'Archival verification and record copy retrieval of legacy Permanent Resident Certificate (PRC) files and Domicile supporting records.',
    requirements: ['Aadhaar Card', 'Old PRC Copy (if available)', 'Ration Card / Voter List', 'Parental PRC Document'],
    estimatedTime: '7 - 15 Days',
    price: '₹50 (Govt Fee) + ₹40 (CSC Charge)'
  },
  {
    id: 'rev-property-cert',
    name: 'Property Certificates',
    category: 'revenue',
    description: 'Official property valuation, valuation assessment, and ownership certificates issued by Revenue Officers for bank loans and visa procedures.',
    requirements: ['Aadhaar Card', 'Jamabandi / Fard Copy', 'Approved Site/Building Plan', 'Valuation Report'],
    estimatedTime: '7 - 14 Days',
    price: 'As per valuation fee + ₹50 (CSC Charge)'
  },
  {
    id: 'rev-shajra-nasab',
    name: 'Shajra Nasab (Family Tree)',
    category: 'revenue',
    description: 'Certified copy of ancestral genealogical family tree (Shajra Nasab) recorded in revenue archives for inheritance and heir identification.',
    requirements: ['Ancestor / Family Head Name', 'Village & Tehsil', 'Applicant Aadhaar Card', 'Revenue Record References'],
    estimatedTime: '5 - 10 Days',
    price: '₹40 (Govt Fee) + ₹40 (CSC Charge)'
  },

  // J&K State e-Services (ServiceOnline / J&K e-Unnat Portal)
  {
    id: 'jk-domicile-cert',
    name: 'Domicile Certificate (J&K)',
    category: 'jk_state',
    description: 'Official Jammu & Kashmir Domicile Certificate application for employment, admissions, and citizen rights issued by competent Tehsildar authority.',
    requirements: ['Aadhaar Card', 'PRC / Ration Card / Electoral Roll / School Certificate', 'Passport Size Photograph'],
    estimatedTime: '30 Days',
    price: '₹20 (Govt Fee) + ₹30 (CSC Charge)',
    popular: true
  },
  {
    id: 'jk-rba-cert',
    name: 'Resident of Backward Area (RBA) Certificate',
    category: 'jk_state',
    description: 'Official certificate for residents of backward areas in J&K for employment and educational reservation quotas.',
    requirements: ['Aadhaar Card', 'Domicile Certificate', 'Ration Card / School Record', 'Patwari Verification Report'],
    estimatedTime: '15 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)',
    popular: true
  },
  {
    id: 'jk-obc-cert',
    name: 'Other Backward Classes (OBC / OSC) Certificate',
    category: 'jk_state',
    description: 'Issuance of OBC / Other Social Castes (OSC) certificate by Tehsildar for central & J&K state government institutions.',
    requirements: ['Aadhaar Card', 'Income Proof / Salary Slip', 'Domicile Certificate', 'Caste Affidavit'],
    estimatedTime: '30 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)',
    popular: true
  },
  {
    id: 'jk-st-cert',
    name: 'Scheduled Tribe (ST) Certificate',
    category: 'jk_state',
    description: 'Official Scheduled Tribe certificate issued by Tehsildar for eligible ST communities in Jammu & Kashmir.',
    requirements: ['Aadhaar Card', 'Domicile Certificate', 'Ancestral ST Record / PRC', 'Passport Photo'],
    estimatedTime: '15 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)',
    popular: true
  },
  {
    id: 'jk-sc-cert',
    name: 'Scheduled Caste (SC) Certificate',
    category: 'jk_state',
    description: 'Official Scheduled Caste certificate issued by Tehsildar for eligible SC communities in Jammu & Kashmir.',
    requirements: ['Aadhaar Card', 'Domicile Certificate', 'Ancestral SC Proof', 'Passport Photo'],
    estimatedTime: '15 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)'
  },
  {
    id: 'jk-alc-ib-cert',
    name: 'ALC / IB Certificate (Line of Actual Control / Border Area)',
    category: 'jk_state',
    description: 'Special reservation certificate for residents of areas adjoining International Border (IB) or Line of Actual Control (ALC) in J&K.',
    requirements: ['Aadhaar Card', 'Domicile Certificate', 'Border Residence Proof', 'Patwari Report'],
    estimatedTime: '15 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)'
  },
  {
    id: 'jk-pahari-cert',
    name: 'Pahari Ethnic People Category Certificate',
    category: 'jk_state',
    description: 'Official Pahari Ethnic Category reservation certificate issued by Tehsildar for J&K public recruitment & admissions.',
    requirements: ['Aadhaar Card', 'Domicile Certificate', 'Family Revenue Record', 'Self Declaration'],
    estimatedTime: '30 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)'
  },
  {
    id: 'jk-ews-cert',
    name: 'Economically Weaker Section (EWS) Certificate',
    category: 'jk_state',
    description: 'Income & Assets Certificate for EWS reservation category in jobs and educational institutions issued by Tehsildar.',
    requirements: ['Aadhaar Card', 'Family Income Certificate / ITR', 'Land Holding Documents', 'Ration Card'],
    estimatedTime: '45 Days',
    price: '₹30 (Govt Fee) + ₹40 (CSC Charge)',
    popular: true
  },
  {
    id: 'jk-birth-cert',
    name: 'Birth Certificate & Child Name Inclusion',
    category: 'jk_state',
    description: 'Issuance of fresh Birth Certificate, correction, or inclusion of child name in existing birth records.',
    requirements: ['Hospital Discharge Slip / Birth Report', 'Parents Aadhaar Cards', 'Affidavit (if delayed)'],
    estimatedTime: '30 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)',
    popular: true
  },
  {
    id: 'jk-death-cert',
    name: 'Death Certificate / Non-Availability Certificate',
    category: 'jk_state',
    description: 'Official registration & issuance of Death Certificate or Non-Availability Certificate from local registrar.',
    requirements: ['Hospital Death Summary / Chowkidar Report', 'Deceased Aadhaar Card', 'Applicant ID Proof'],
    estimatedTime: '30 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)'
  },
  {
    id: 'jk-marriage-cert',
    name: 'Marriage Certificate (Registrar of Marriages)',
    category: 'jk_state',
    description: 'Legal registration of marriage under J&K Marriage Acts and issuance of official Marriage Certificate.',
    requirements: ['Bride & Groom Aadhaar Cards', 'Joint Passport Photograph', 'Marriage Card / Nikahnama / Temple Receipt', 'Witnesses IDs'],
    estimatedTime: '5 Days',
    price: '₹50 (Govt Fee) + ₹50 (CSC Charge)',
    popular: true
  },
  {
    id: 'jk-character-cert',
    name: 'Character Certificate by Tehsildar',
    category: 'jk_state',
    description: 'Official character and antecedents certificate issued by Tehsildar for government employment, tenders, and admissions.',
    requirements: ['Aadhaar Card', 'Police Clearance Certificate (PCC)', 'Passport Photo', 'School/College Conduct Proof'],
    estimatedTime: '20 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)',
    popular: true
  },
  {
    id: 'jk-dependent-cert',
    name: 'Dependent Certificate',
    category: 'jk_state',
    description: 'Issuance of Dependent Certificate by Tehsildar for government employee dependents, compassionate grounds, and medical benefits.',
    requirements: ['Aadhaar Cards', 'Family Head Pensioner / Employee Slip', 'Ration Card', 'Affidavit'],
    estimatedTime: '30 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)'
  },
  {
    id: 'jk-unemployment-cert',
    name: 'Unemployment Certificate',
    category: 'jk_state',
    description: 'Official certificate certifying unemployment status issued by Tehsildar for government self-employment schemes & loans.',
    requirements: ['Aadhaar Card', 'Educational Qualification Marksheets', 'Self Declaration Affidavit', 'Ration Card'],
    estimatedTime: '15 Days',
    price: '₹30 (Govt Fee) + ₹30 (CSC Charge)'
  },
  {
    id: 'jk-pension-isss',
    name: 'JK-ISSS & GOI NSAP Social Pension Sanction',
    category: 'jk_state',
    description: 'Sanction and online registration of Old Age Pension, Widow Pension, and Disability Pension under JK-ISSS & NSAP.',
    requirements: ['Aadhaar Card', 'Age Proof / Disability Certificate', 'Bank Passbook (DBT Linked)', 'Income Certificate'],
    estimatedTime: '30 Days',
    price: 'Free Application + ₹30 (CSC Charge)',
    popular: true
  },
  {
    id: 'jk-ladli-beti',
    name: 'Ladli Beti & State Marriage Assistance Scheme',
    category: 'jk_state',
    description: 'Application for financial assistance under Ladli Beti scheme for girl child and State Marriage Assistance Scheme (SMAS) for poor girls.',
    requirements: ['Aadhaar Card', 'Birth Certificate of Girl Child', 'Parents Income Certificate', 'Bank Passbook'],
    estimatedTime: '30 Days',
    price: 'Free Application + ₹40 (CSC Charge)',
    popular: true
  },
  {
    id: 'jk-mgnrega-jobcard',
    name: 'MGNREGA Job Card Application',
    category: 'jk_state',
    description: 'Application for issuance of MGNREGA Job Card for rural households under Panchayati Raj Department.',
    requirements: ['Aadhaar Card', 'Ration Card', 'Bank Account Details', 'Passport Photograph'],
    estimatedTime: '15 Days',
    price: 'Free Application + ₹20 (CSC Charge)'
  },
  {
    id: 'jk-trade-license',
    name: 'Fresh License & Renewal for Carrying Out Trade',
    category: 'jk_state',
    description: 'Application for fresh municipal trade license or annual renewal for shops, commercial establishments, and business units.',
    requirements: ['Aadhaar Card', 'Shop Rent Agreement / Property Receipt', 'Pan Card', 'NOC from Fire/Pollution (if applicable)'],
    estimatedTime: '30 Days',
    price: 'As per Municipal tariff + ₹50 (CSC Charge)'
  },
  {
    id: 'jk-building-licenses',
    name: 'Architect, Engineer & Draftsman License (SMC/JMC)',
    category: 'jk_state',
    description: 'Issuance of License for Architect (AoR), Structural Engineer (SEoR), Town Planner, and Draftsman for Municipal Corporations.',
    requirements: ['Professional Degree / Council Registration Certificate', 'Aadhaar Card', 'PAN Card', 'Experience Proof'],
    estimatedTime: '30 Days',
    price: 'As per Municipal fee + ₹100 (CSC Charge)'
  },
  {
    id: 'jk-drone-permission',
    name: 'Permission for Drone Flying, Exhibitions & Gatherings',
    category: 'jk_state',
    description: 'District Magistrate permission for Drone Flying, Religious Processions, Political Gatherings, Exhibitions, or Cultural Events.',
    requirements: ['Applicant ID / Aadhaar Card', 'Event Schedule & Location Map', 'Drone Operator UIN / License Details', 'Police NOC'],
    estimatedTime: '7 - 15 Days',
    price: '₹50 (CSC Charge)'
  },
  {
    id: 'jk-assistive-aids',
    name: 'Motorized Tricycle & Assistive Aids for Specially Abled',
    category: 'jk_state',
    description: 'Application for grant of high-end automatic wheelchairs, motorized tricycles, and aids to specially-abled persons in J&K.',
    requirements: ['Disability Certificate (40%+ UDID Card)', 'Aadhaar Card', 'Income Certificate', 'Passport Photograph'],
    estimatedTime: '30 Days',
    price: 'Free Govt Service + ₹30 (CSC Charge)'
  },
  {
    id: 'jk-senior-citizen',
    name: 'Senior Citizen & Super Senior Citizen Certificate',
    category: 'jk_state',
    description: 'Issuance of Senior Citizen Card / Certificate for welfare schemes, healthcare priorities, and travel concessions.',
    requirements: ['Aadhaar Card / DOB Certificate', 'Passport Photo', 'Address Proof'],
    estimatedTime: '30 Days',
    price: '₹20 (Govt Fee) + ₹30 (CSC Charge)'
  },
  {
    id: 'jk-horticulture-passbook',
    name: 'Horticulture Passbook & High Density Orchard Booking',
    category: 'jk_state',
    description: 'Application for Horticulture Passbook issuance, high-density apple orchard development, and machinery subsidies.',
    requirements: ['Aadhaar Card', 'Land Fard / Jamabandi Copy', 'Bank Account Passbook', 'Khasra Details'],
    estimatedTime: '15 Days',
    price: '₹50 (CSC Charge)'
  }
];

