export interface GuideArticle {
  id: string;
  title: string;
  hindiTitle: string;
  urduTitle?: string;
  category: 'Recruitment' | 'Central Scheme' | 'Identity & Tax' | 'State Services' | 'Education';
  readTime: string;
  lastUpdated: string;
  summary: string;
  officialPortal: string;
  officialUrl: string;
  author: string;
  responsibleDepartment?: string;
  intendedBeneficiaries?: string;
  benefitSummary?: string;
  applicableRegion?: string;
  tableOfContents: string[];
  sections: {
    heading: string;
    content: string;
    bulletPoints?: string[];
    tips?: string;
  }[];
  eligibility: string[];
  documentsRequired: string[];
  stepByStep: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    id: 'jkssb-recruitment-guide-2026',
    title: 'JKSSB Recruitment 2026: Complete Application Guide, Syllabus & Document Checklist',
    hindiTitle: 'जेकेएसएसबी भर्ती 2026: आवेदन प्रक्रिया, पाठ्यक्रम और आवश्यक दस्तावेज',
    urduTitle: 'جے کے ایس ایس بی بھرتی 2026: مکمل درخواست گائیڈ اور دستاویزات کی فہرست',
    category: 'Recruitment',
    readTime: '6 min read',
    lastUpdated: 'August 14, 2026',
    author: 'CSC DOST Editorial & VLE Advisory Desk',
    officialPortal: 'jkssb.nic.in / ssbjk.org.in',
    officialUrl: 'https://jkssb.nic.in',
    summary:
      'A complete step-by-step citizen walkthrough for Jammu and Kashmir Services Selection Board (JKSSB) recruitments. Learn how to complete One-Time Registration (OTR), upload certificates, verify domicile status, and avoid common application rejection pitfalls.',
    tableOfContents: [
      'Overview of JKSSB Recruitment Process',
      'Eligibility & Domicile Criteria',
      'Step-by-Step Online Registration & Application',
      'Mandatory Document Specifications',
      'Application Fees & Payment Modes',
      'Common Mistakes to Avoid',
      'Frequently Asked Questions (FAQs)',
    ],
    sections: [
      {
        heading: '1. Overview of JKSSB Recruitment Process',
        content:
          'The Jammu and Kashmir Services Selection Board (JKSSB) is the premier recruiting agency for non-gazetted, technical, ministerial, and executive positions across various government departments in Jammu and Kashmir. Candidates seeking employment must register through the official portal (ssbjk.org.in or jkssb.nic.in). Having your valid J&K Domicile Certificate, 10th marksheet for date of birth verification, and category certificate (if applicable) is essential before starting.',
        bulletPoints: [
          'All vacancies are advertised via official notifications with specific advertisement numbers.',
          'One-Time Registration (OTR) profile is required for applying across multiple advertisements.',
          'Selection is purely merit-based through Computer Based Tests (CBT) or OMR written exams followed by Document Verification (DV).',
        ],
      },
      {
        heading: '2. Eligibility & Domicile Criteria',
        content:
          'As per J&K Civil Services rules, applicants must be bonafide Domiciles of the Union Territory of Jammu and Kashmir. The candidate must possess a valid Domicile Certificate issued by the competent revenue authority (Tehsildar) on or before the cut-off date mentioned in the notification.',
        bulletPoints: [
          'Age Limits: General Category usually 18 to 40 years; SC/ST/RBA/ALC-IB/EWS candidates enjoy age relaxation up to 43 years; PwD up to 42 years; Ex-Servicemen up to 48 years.',
          'Educational Qualifications: Varies by post—from Matriculation (Class 10th), 10+2, to Graduation with specific technical degrees (e.g. B.Tech, BCA, BSc Nursing, B.Ed).',
          'Reservation Certificates: Category certificates must be active and valid on the date of submission.',
        ],
      },
      {
        heading: '3. Step-by-Step Online Registration & Application',
        content:
          'Follow this proven procedure at CSC DOST or independently to ensure your application is registered without errors:',
        bulletPoints: [
          'Step 1: Visit the official JKSSB portal and click on "Candidate Registration / Login".',
          'Step 2: Enter candidate Full Name (as per 10th Marksheet), active Mobile Number, and functional Email ID to generate OTP.',
          'Step 3: Fill in Personal Details, Permanent Address, Correspondence Address, and District Domicile details.',
          'Step 4: Enter Educational Details sequentially starting from 10th, 12th, Graduation, and Post-Graduation.',
          'Step 5: Upload recent passport photograph and signature conforming to exact pixel and file size requirements.',
          'Step 6: Review the application preview carefully before proceeding to payment gateway.',
          'Step 7: Pay the application fee online and download the finalized application form with unique Application ID.',
        ],
        tips: 'Always download and store 2 printed copies of the submitted application form and the payment e-receipt. The physical copy is required during final Document Verification.',
      },
      {
        heading: '4. Mandatory Document Specifications',
        content:
          'Uploading improperly formatted documents leads to instant system rejection. Ensure your files adhere strictly to the following standards:',
        bulletPoints: [
          'Recent Color Photograph: 3.5cm x 4.5cm, light background, file size 20KB to 50KB in JPG/JPEG format.',
          'Applicant Signature: Clear dark ink on white paper, file size 10KB to 20KB in JPG/JPEG format.',
          'Domicile & Category Certificates: PDF format, size under 200KB, clearly readable seal and digital signature.',
        ],
      },
    ],
    eligibility: [
      'Candidate must be a bonafide Domicile of UT of Jammu & Kashmir.',
      'Age between 18 and 40 years (Relaxations applicable for reserved categories).',
      'Required educational qualification from a recognized Board/University as specified in the recruitment notification.',
    ],
    documentsRequired: [
      'Valid J&K Domicile Certificate issued by Tehsildar',
      'Matriculation (10th) Certificate & Marksheet for DOB proof',
      '10+2 / Graduation / Diploma Marksheets & Degree Certificates',
      'Reserved Category Certificate (RBA, SC, ST, OSC, EWS, ALC/IB, PSP) if claiming quota',
      'Recent Passport-sized Photograph with white/light background',
      'Scanned Signature in dark ink',
      'Valid Government Photo ID (Aadhaar Card, Voter ID, or Driving License)',
    ],
    stepByStep: [
      'Visit official JKSSB Portal (jkssb.nic.in) or request assistance at CSC DOST.',
      'Complete One Time Registration (OTR) with mobile number and email verification.',
      'Select active Advertisement Notification and choose eligible post.',
      'Fill personal, academic, and reservation credentials accurately.',
      'Upload compliant scanned photograph and signature.',
      'Review complete application form preview and confirm declaration.',
      'Make online fee payment via Debit Card, Credit Card, Net Banking, or UPI.',
      'Print & save the final Application Confirmation Slip with Token ID.',
    ],
    faqs: [
      {
        question: 'Can candidates outside Jammu and Kashmir apply for JKSSB posts?',
        answer:
          'No, having a valid Domicile Certificate of the Union Territory of Jammu and Kashmir is mandatory for all JKSSB advertised posts under current UT civil recruitment regulations.',
      },
      {
        question: 'What should I do if my payment was deducted but the application status shows pending?',
        answer:
          'Wait for 24 to 48 hours for bank reconciliation. Do not immediately pay twice. If status does not update, log in, click "Re-verify Payment" or contact JKSSB helpdesk / your CSC DOST representative with your bank transaction UTR number.',
      },
      {
        question: 'Can I edit my application form after final submission?',
        answer:
          'JKSSB usually opens a dedicated 3-5 day Edit Window after the last date of application. However, basic details like name, email, and mobile number cannot be altered.',
      },
    ],
  },
  {
    id: 'pan-card-apply-update-guide-2026',
    title: 'How to Apply for New PAN Card & Update Existing PAN Online (NSDL/UTIITSL)',
    hindiTitle: 'नया पैन कार्ड आवेदन और पैन सुधार: सम्पूर्ण ऑनलाइन प्रक्रिया',
    urduTitle: 'نیا پین کارڈ درخواست اور موجودہ پین کارڈ میں تبدیلی کی مکمل گائیڈ',
    category: 'Identity & Tax',
    readTime: '5 min read',
    lastUpdated: 'August 12, 2026',
    author: 'CSC DOST Financial Services Desk',
    officialPortal: 'onlineservices.nsdl.com / pan.utiitsl.com',
    officialUrl: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
    summary:
      'Complete guide for Indian citizens on applying for a fresh Permanent Account Number (PAN Card - Form 49A) and correcting name, date of birth, father name, or photo in existing PAN. Includes e-KYC instant paperless process and Aadhaar linking details.',
    tableOfContents: [
      'What is a PAN Card & Why is it Mandatory?',
      'Types of PAN Applications (Form 49A vs CSF Correction)',
      'Digital Paperless (e-KYC) vs Physical Mode',
      'Documents Required for PAN Registration',
      'Step-by-Step PAN Application Process',
      'Mandatory PAN-Aadhaar Linking Guidelines',
      'Frequently Asked Questions',
    ],
    sections: [
      {
        heading: '1. What is a PAN Card & Why is it Mandatory?',
        content:
          'Permanent Account Number (PAN) is a ten-digit unique alphanumeric identifier issued by the Income Tax Department of India under the supervision of the Central Board of Direct Taxes (CBDT). It is mandatory for opening bank accounts, filing income tax returns, making high-value financial transactions, registering businesses, and availing financial subsidies.',
        bulletPoints: [
          'Valid for lifetime across India and not affected by change of address.',
          'Required for transactions exceeding ₹50,000 in cash or purchase of mutual funds/shares.',
          'Serves as universally recognized proof of identity.',
        ],
      },
      {
        heading: '2. Types of PAN Applications (Form 49A vs CSF Correction)',
        content: 'Before initiating your application, understand which form applies to your need:',
        bulletPoints: [
          'Form 49A (New PAN - Indian Citizens): For individuals who have never been allotted a PAN card before.',
          'CSF Form (Changes / Correction in existing PAN): For individuals wishing to correct misspelled names, update Date of Birth, update father/mother name, or order a reprint of a lost/damaged PAN card.',
        ],
      },
      {
        heading: '3. Digital Paperless (e-KYC) vs Physical Mode',
        content: 'Citizens can apply via two distinct channels:',
        bulletPoints: [
          'Paperless e-KYC & e-Sign Mode: Requires Aadhaar-linked active mobile number. Demographic details and photograph are fetched automatically from UIDAI without submitting physical forms. e-PAN is generated within 2-4 hours.',
          'Physical Document Mode: Suitable when applicant wishes to have a custom signature/photo on the physical card or when Aadhaar mobile is not linked. Physical documents are signed and dispatched to NSDL/UTIITSL processing center.',
        ],
      },
    ],
    eligibility: [
      'All Indian citizens, minors (through guardian), firms, and trusts.',
      'No minimum or maximum age limit exists for PAN allotment.',
    ],
    documentsRequired: [
      'Proof of Identity (Aadhaar Card, Voter ID, Passport, Driving License)',
      'Proof of Address (Aadhaar Card, Electricity Bill, Bank Statement, Domicile)',
      'Proof of Date of Birth (Birth Certificate, 10th Marksheet, Aadhaar Card, Passport)',
      'Two recent passport-sized color photographs (if applying via physical / scanning mode)',
    ],
    stepByStep: [
      'Select Application Type: "New PAN - Indian Citizen (Form 49A)" or "Changes or Correction in existing PAN".',
      'Fill in applicant Title, Last Name, First Name, Date of Birth, Email ID, and Mobile Number.',
      'Generate Token Number to preserve application session.',
      'Choose submission method: Submit digitally through e-KYC & e-Sign OR Submit scanned images.',
      'Enter Father Name, Income Source, and complete Residential Address.',
      'Select Assessing Officer (AO) Code matching your state/district jurisdiction.',
      'Review Form 49A summary and proceed to payment gateway (₹107 for Indian address delivery / ₹72 for e-PAN only).',
      'Complete Aadhaar OTP verification to e-Sign the application.',
      'Download 15-digit Acknowledgement Receipt for tracking dispatch status.',
    ],
    faqs: [
      {
        question: 'How many days does it take to receive the physical PAN card at my home?',
        answer:
          'Digital e-PAN is usually issued via email within 24 to 72 hours. The physical plastic PVC card is dispatched via India Post Speed Post and typically arrives at your doorstep within 7 to 14 working days.',
      },
      {
        question: 'Is it illegal to possess more than one PAN card?',
        answer:
          'Yes. Possessing more than one PAN card is a punishable offence under Section 272B of the Income Tax Act, 1961, and can attract a penalty of ₹10,000. Any duplicate PAN must be surrendered immediately.',
      },
      {
        question: 'How do I check if my PAN is linked with my Aadhaar?',
        answer:
          'You can check your status on the official Income Tax portal (incometax.gov.in) under "Link Aadhaar Status" by entering your 10-digit PAN and 12-digit Aadhaar number.',
      },
    ],
  },
  {
    id: 'pm-kisan-ekyc-status-guide-2026',
    title: 'PM Kisan Samman Nidhi Yojana 2026: eKYC, Beneficiary Status & Installment Guide',
    hindiTitle: 'पीएम किसान सम्मान निधि 2026: ई-केवाईसी, लाभार्थी स्थिति और किस्त गाइड',
    urduTitle: 'پی ایم کسان سمان ندھی یوجنا 2026: ای کے وائی سی اور قسط گائیڈ',
    category: 'Central Scheme',
    readTime: '5 min read',
    lastUpdated: 'August 15, 2026',
    author: 'CSC DOST Rural & Farmer Welfare Desk',
    officialPortal: 'pmkisan.gov.in',
    officialUrl: 'https://pmkisan.gov.in',
    responsibleDepartment: 'Ministry of Agriculture & Farmers Welfare, Govt. of India',
    intendedBeneficiaries: 'Small & Marginal Landholding Farmer Families',
    benefitSummary: '₹6,000 / Year (3 Installments of ₹2,000 via DBT)',
    applicableRegion: 'All India (including UT of Jammu & Kashmir)',
    summary:
      'Essential walkthrough for eligible farmers across India to receive ₹6,000 annual financial assistance under PM-KISAN. Complete guide on biometric eKYC, Aadhaar-Bank account NPCI seeding, land record seeding, and correcting rejected beneficiary status.',
    tableOfContents: [
      'Overview of PM-KISAN Scheme Benefits',
      'Mandatory Requirements for Receiving Installments',
      'How to Complete PM-KISAN eKYC (OTP & Biometric)',
      'How to Check Beneficiary Status & Land Seeding',
      'Aadhaar-Bank NPCI DBT Seeding Process',
      'Resolving Common Rejection Reasons',
      'Frequently Asked Questions',
    ],
    sections: [
      {
        heading: '1. Overview of PM-KISAN Scheme Benefits',
        content:
          'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector scheme launched by the Government of India to provide income support to all landholding farmers families in the country. Under the scheme, financial assistance of ₹6,000 per annum is provided to eligible farmer families in three equal four-monthly installments of ₹2,000 directly into their bank accounts via Direct Benefit Transfer (DBT).',
        bulletPoints: [
          '100% funding by the Government of India.',
          'Transferred directly via Aadhaar-enabled NPCI DBT mechanism.',
          'Covers small, marginal, and landholding farmer families subject to statutory exclusion criteria.',
        ],
      },
      {
        heading: '2. Mandatory Requirements for Receiving Installments',
        content:
          'To prevent fraudulent claims and ensure transparent distribution, the Government has made the following 3 verifications strictly mandatory for every farmer:',
        bulletPoints: [
          'Mandatory eKYC: OTP-based through Aadhaar or Biometric-based via authorized CSC Center.',
          'Land Seeding (Land Record Authentication): Verification of Jamabandi / Khasra / Mutation records by local Revenue / Patwari authority.',
          'Aadhaar-Bank Account Seeding: Active NPCI (National Payments Corporation of India) mapping with your bank account for DBT.',
        ],
      },
      {
        heading: '3. How to Complete PM-KISAN eKYC',
        content: 'Farmers can complete their verification using two easy methods:',
        bulletPoints: [
          'Method A (OTP-based eKYC): Visit pmkisan.gov.in -> Click "eKYC" -> Enter 12-digit Aadhaar -> Enter Aadhaar-registered mobile number -> Submit OTP.',
          'Method B (Biometric eKYC at CSC DOST): If your mobile number is not linked to Aadhaar, visit your nearest CSC DOST centre for fingerprint/iris biometric authentication on official CSC portal.',
        ],
      },
    ],
    eligibility: [
      'All landholding farmer families who own cultivable land in their names.',
      'Name must appear in state revenue land ownership records.',
      'Exclusions: Institutional landholders, constitutional post holders, serving/retired government employees, doctors, engineers, lawyers, and income tax payers.',
    ],
    documentsRequired: [
      'Aadhaar Card of the farmer applicant',
      'Land Ownership Document (Jamabandi / Khasra / Inteqal / Revenue Record copy)',
      'Active Bank Account Passbook seeded with NPCI / Aadhaar',
      'Active Mobile Number for OTP updates',
    ],
    stepByStep: [
      'Visit pmkisan.gov.in or consult your local CSC DOST VLE.',
      'Check "Know Your Status" by entering your PM-KISAN Registration Number / Aadhaar.',
      'Verify that all 3 flags are marked "YES": (1) eKYC Status: YES, (2) Land Seeding: YES, (3) Aadhaar Bank Account Seeding Status: YES.',
      'If eKYC is NO, complete instant biometric verification.',
      'If Land Seeding is NO, submit land records to your local Revenue Officer (Patwari / Tehsildar / Agriculture Extension Officer).',
      'If Aadhaar Seeding is NO, visit your bank branch and submit the "Aadhaar NPCI DBT Seeding Consent Form".',
      'Check payment release status for upcoming 4-monthly cycle.',
    ],
    faqs: [
      {
        question: 'Why has my PM-KISAN installment stopped coming to my bank account?',
        answer:
          'The most common reasons are: (1) Pending eKYC, (2) Unverified Land Seeding, or (3) Bank account not seeded with NPCI DBT. Check your status under "Know Your Status" on pmkisan.gov.in to identify the exact pending verification.',
      },
      {
        question: 'Can both husband and wife receive PM-KISAN installments?',
        answer:
          'No. As per scheme guidelines, PM-KISAN benefit is provided per "farmer family" (consisting of husband, wife, and minor children). Only one eligible individual from a single family can receive the benefit.',
      },
      {
        question: 'How do I find my PM-KISAN Registration Number?',
        answer:
          'Visit pmkisan.gov.in -> Click "Know Your Status" -> Click "Know your Registration No." -> Enter your registered Mobile number or Aadhaar Number -> Submit OTP to view your Registration ID.',
      },
    ],
  },
  {
    id: 'ayushman-bharat-golden-card-guide-2026',
    title: 'Ayushman Bharat PM-JAY Golden Card: ₹5 Lakh Health Cover Registration Guide',
    hindiTitle: 'आयुष्मान भारत पीएम-जय गोल्डन कार्ड: ₹5 लाख मुफ्त इलाज आवेदन गाइड',
    urduTitle: 'آیوشمان بھارت پی ایم جے گولڈن کارڈ: 5 لاکھ روپے مفت علاج گائیڈ',
    category: 'Central Scheme',
    readTime: '6 min read',
    lastUpdated: 'August 11, 2026',
    author: 'CSC DOST Healthcare Assistance Desk',
    officialPortal: 'beneficiary.nha.gov.in',
    officialUrl: 'https://beneficiary.nha.gov.in',
    responsibleDepartment: 'National Health Authority (NHA), Ministry of Health & Family Welfare',
    intendedBeneficiaries: 'SECC/NFSA Families, All J&K Residents (SEHAT) & Senior Citizens (70+)',
    benefitSummary: '₹5,00,000 Cashless Health Cover Per Family / Year',
    applicableRegion: 'All India & Universal Coverage in Jammu & Kashmir',
    summary:
      'Comprehensive guide to generating your Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY / SEHAT) Golden Health Card. Avail cashless in-patient healthcare coverage of up to ₹5,00,000 per family per year across empaneled hospitals in India.',
    tableOfContents: [
      'Scheme Benefits & Hospital Coverage',
      'Who is Eligible for Ayushman Golden Card?',
      'SEHAT Scheme for UT of Jammu & Kashmir',
      'Step-by-Step e-KYC & Card Generation Process',
      'How to Find Empaneled Government & Private Hospitals',
      'How to Avail Cashless Treatment During Hospitalization',
      'Frequently Asked Questions',
    ],
    sections: [
      {
        heading: '1. Scheme Benefits & Hospital Coverage',
        content:
          'Ayushman Bharat PM-JAY is the world’s largest government-funded healthcare assurance scheme. It provides a health cover of ₹5,00,000 per family per year for secondary and tertiary care hospitalization across more than 27,000 empaneled public and private hospitals across India.',
        bulletPoints: [
          'Complete cashless and paperless access to medical care at point of service.',
          'Covers pre-hospitalization (up to 3 days) and post-hospitalization expenses (up to 15 days) including medicines and diagnostics.',
          'No restrictions on family size, age, or gender.',
          'All pre-existing medical conditions are covered from day one of card activation.',
        ],
      },
      {
        heading: '2. Who is Eligible for Ayushman Golden Card?',
        content: 'Eligibility depends on state/UT schemes:',
        bulletPoints: [
          'National PM-JAY: Families identified under the Socio-Economic Caste Census (SECC 2011) database or active NFSA Ration Card lists.',
          'AB-PMJAY SEHAT (Jammu & Kashmir Special Universal Scheme): 100% universal coverage for all residents of Jammu and Kashmir holding a valid Ration Card / Domicile proof.',
          'Senior Citizens (70+ Years): Dedicated Ayushman Vay Vandana card providing ₹5 Lakh top-up cover for senior citizens aged 70 and above regardless of income.',
        ],
      },
    ],
    eligibility: [
      'All residents of J&K under universal AB-PMJAY SEHAT scheme.',
      'Identified beneficiaries under SECC 2011 / NFSA Ration Card database across all Indian States.',
      'Senior citizens aged 70 years and above (Ayushman Vay Vandana Scheme).',
    ],
    documentsRequired: [
      'Aadhaar Card of all family members',
      'Ration Card (NFSA / Non-NFSA / State Food Department Card)',
      'Active mobile number linked with Aadhaar for OTP verification',
    ],
    stepByStep: [
      'Visit beneficiary.nha.gov.in or visit your nearest CSC DOST Center.',
      'Select "Beneficiary" login and enter your mobile number with OTP.',
      'Select your State, Scheme (PMJAY / SEHAT), District, and Search By (Ration Card No / Family ID / Aadhaar No).',
      'Locate your family member details in the authenticated beneficiary roster.',
      'Click on "Action / e-KYC" next to the unverified family member.',
      'Authenticate identity via Aadhaar OTP, Fingerprint, or Face RD scan.',
      'Capture a live photograph with clear lighting.',
      'Submit the e-KYC request; the card is approved instantly or within 24 hours.',
      'Click "Download Card" to save the high-resolution PDF or print a PVC Golden Card at CSC DOST.',
    ],
    faqs: [
      {
        question: 'Do I have to pay any money at the hospital for treatments under Ayushman Card?',
        answer:
          'No. The treatment is completely cashless and free of cost up to ₹5,00,000 per family per year in all empaneled hospitals. You only need to show your Ayushman Card / Aadhaar at the Ayushman Mitra Helpdesk in the hospital.',
      },
      {
        question: 'Can I add a newborn baby or newly married spouse to my Ayushman Card?',
        answer:
          'Yes. You can add a new family member by updating your Ration Card at the Food & Supplies department first, or by using the "Add Member" option on the NHA beneficiary portal with valid marriage/birth proof.',
      },
    ],
  },
  {
    id: 'aadhaar-card-update-guide-2026',
    title: 'Aadhaar Card Update 2026: Mobile Linking, Address Correction & Document Upload Guide',
    hindiTitle: 'आधार कार्ड सुधार 2026: मोबाइल नंबर लिंकिंग, पता अपडेट और दस्तावेज सत्यापन',
    urduTitle: 'آدھار کارڈ اپ ڈیٹ 2026: موبائل لنکنگ اور پتہ درستگی گائیڈ',
    category: 'Identity & Tax',
    readTime: '5 min read',
    lastUpdated: 'August 10, 2026',
    author: 'CSC DOST UIDAI Assistance Desk',
    officialPortal: 'myaadhaar.uidai.gov.in',
    officialUrl: 'https://myaadhaar.uidai.gov.in',
    summary:
      'Complete guide on updating demographic and biometric information in your 12-digit Aadhaar card. Learn how to update address online, complete mandatory 10-year free document revalidation (Proof of Identity & Proof of Address), and book CSC enrollment appointments.',
    tableOfContents: [
      'Importance of Keeping Aadhaar Updated',
      'What Can Be Updated Online vs at Enrolment Centre',
      'Mandatory 10-Year Document Revalidation Notice',
      'Step-by-Step Online Address Update Process',
      'List of Valid Supporting Documents for UIDAI',
      'How to Verify Mobile Number & Email in Aadhaar',
      'Frequently Asked Questions',
    ],
    sections: [
      {
        heading: '1. Importance of Keeping Aadhaar Updated',
        content:
          'Aadhaar is the foundational digital identity for over 1.4 billion Indian citizens. Keeping your demographic information (Name, Date of Birth, Gender, Address, Mobile Number, Email) and biometric data (Photograph, Iris, Fingerprints) accurate is crucial for seamless access to government subsidies, banking services, passports, and SIM card verifications.',
        bulletPoints: [
          'Mobile number linking is essential for receiving OTPs across all government and banking portals.',
          'UIDAI advises all citizens whose Aadhaar was issued more than 10 years ago to re-upload Proof of Identity (PoI) and Proof of Address (PoA) documents.',
        ],
      },
      {
        heading: '2. What Can Be Updated Online vs at Enrolment Centre',
        content: 'Understanding update channels:',
        bulletPoints: [
          'Online through myAadhaar (Requires active mobile OTP): Address change, Document Update (PoI/PoA re-verification), Language change.',
          'At Physical Aadhaar Enrolment / CSC Centre (Biometric Required): Mobile Number linking, Email ID update, Name correction, Date of Birth correction, Gender update, Biometric update (Fingerprints, Iris, Photo).',
        ],
      },
    ],
    eligibility: ['All resident individuals holding a 12-digit Aadhaar number.'],
    documentsRequired: [
      'Proof of Identity (PoI): Voter ID, Passport, PAN Card, Driving License, Domicile Certificate',
      'Proof of Address (PoA): Electricity Bill, Water Bill, Bank Passbook with Photo, Domicile Certificate, Ration Card, Rent Agreement',
      'Proof of Date of Birth: Birth Certificate, 10th School Marksheet, Passport',
    ],
    stepByStep: [
      'Visit myaadhaar.uidai.gov.in and click "Login with Aadhaar and OTP".',
      'Enter your 12-digit Aadhaar number, complete the Captcha, and submit the OTP sent to your registered mobile.',
      'Select "Address Update" -> "Update Aadhaar Online".',
      'Enter complete new address details including Care Of (C/O), House/Building, Street, Landmark, Pin Code, Village/Town, and District.',
      'Upload valid supporting document (e.g. Domicile / Electricity Bill / Bank Passbook) in PDF/JPG format.',
      'Pay standard UIDAI online service fee (₹50).',
      'Download the Service Request Number (SRN) slip to track update progress (usually completed within 3 to 7 working days).',
    ],
    faqs: [
      {
        question: 'Can I link my mobile number to Aadhaar without visiting a centre?',
        answer:
          'No. Mobile number linking requires live biometric authentication (fingerprint/iris) as per UIDAI security norms. You must visit an authorized Aadhaar Seva Kendra or CSC DOST centre in person.',
      },
      {
        question: 'What is the fee charged for Aadhaar biometric and demographic updates?',
        answer:
          'UIDAI standard government fees are: (1) Mandatory Biometric Update (Children aged 5 & 15 years): FREE, (2) Demographic Update (Name/Address/DOB/Mobile): ₹50, (3) Biometric Update with Demographic: ₹100.',
      },
    ],
  },
];

/**
 * Archived guide entries moved to /post/<slug> (kept intact for rollback).
 */
export const ARCHIVED_GUIDE_ARTICLES: GuideArticle[] = [
  {
    id: 'army-agniveer-rally-guide-2026',
    title: 'Indian Army Agniveer Rally 2026: Physical Standards, Online CEE & Registration Guide',
    hindiTitle: 'भारतीय सेना अग्निवीर भर्ती 2026: ऑनलाइन परीक्षा, शारीरिक मानक और पंजीकरण',
    urduTitle: 'بھارتی فوج اگنی ویر ریلی 2026: جسمانی معیار اور آن لائن رجسٹریشن گائیڈ',
    category: 'Recruitment',
    readTime: '6 min read',
    lastUpdated: 'August 13, 2026',
    author: 'CSC DOST Defence & Career Guidance Desk',
    officialPortal: 'joinindianarmy.nic.in',
    officialUrl: 'https://joinindianarmy.nic.in',
    summary:
      'A detailed handbook for defence aspirants applying for Indian Army Agniveer General Duty (GD), Technical, Clerk/Store Keeper Technical, and Tradesmen. Complete coverage of Common Entrance Exam (CEE), 1.6 KM Physical Fitness Test (PFT), and documentation norms.',
    tableOfContents: [
      'Agniveer Entry Schemes & Trades Overview',
      'Age & Educational Qualification Criteria',
      'Recruitment Stages: Phase-I (Online CEE) & Phase-II (Rally PFT)',
      'Physical Fitness Test (PFT) Marking Matrix',
      'List of Mandatory Documents for Rally Ground',
      'Step-by-Step Online Registration on JoinIndianArmy',
      'Frequently Asked Questions',
    ],
    sections: [
      {
        heading: '1. Agniveer Entry Schemes & Trades Overview',
        content:
          'Under the Agnipath Scheme, youth serve in the Armed Forces for four years. The Indian Army recruits for several key categories:',
        bulletPoints: [
          'Agniveer (General Duty) (All Arms): Core combat units (Infantry, Artillery, Armoured).',
          'Agniveer (Technical): Technical support, Signals, EME, and Air Defence.',
          'Agniveer (Office Assistant / Store Keeper Technical): Administrative and supply chain duties.',
          'Agniveer (Tradesmen 10th & 8th Pass): Support roles, chefs, stewards, and artisans.',
        ],
      },
      {
        heading: '2. Recruitment Stages: Phase-I & Phase-II',
        content: 'The recruitment process is structured in two streamlined phases:',
        bulletPoints: [
          'Phase I: Online Computer Based Common Entrance Examination (CEE) conducted across designated testing centres throughout India.',
          'Phase II: Physical Fitness Test (PFT), Physical Measurement Test (PMT), Adaptability Test, and Medical Examination at designated Army Recruiting Office (ARO) rally grounds for shortlisted candidates.',
        ],
      },
    ],
    eligibility: [
      'Age Limit: 17.5 years to 21 years across all Agniveer categories.',
      'Agniveer GD: 10th / Matric with 45% aggregate and 33% in each subject.',
      'Agniveer Technical: 10+2 / Intermediate in Science stream (Physics, Chemistry, Maths, English) with 50% aggregate.',
      'Agniveer Clerk / SKT: 10+2 with 60% aggregate and 50% in English and Maths/Accounts.',
      'Agniveer Tradesmen: 10th simple pass / 8th simple pass with 33% in each subject.',
    ],
    documentsRequired: [
      'Admit Card printed on Laser Printer on good quality paper',
      'Twenty (20) copies of unattested recent passport-sized color photographs',
      'Original Education Certificates & Marksheets (Matric / 10+2)',
      'Domicile / Residence Certificate with photograph issued by Tehsildar',
      'Caste Certificate with photograph (for candidates belonging to SC/ST/OBC)',
      'Religion Certificate / Character Certificate from Village Sarpanch / Ward Member',
      'Unmarried Certificate for candidates under 21 years of age',
      'Affidavit duly signed on non-judicial stamp paper of ₹10 as per format in notification',
    ],
    stepByStep: [
      'Visit joinindianarmy.nic.in and enter website captcha.',
      'Click on "Agnipath" tab -> "User Registration / Apply Online".',
      'Enter Aadhaar / Matriculation certificate details to initiate registration.',
      'Fill in personal bio-data, communication address, and physical measurements.',
      'Select examination city preferences for Online Computer Based Test (CEE).',
      'Pay online exam fee (₹250 + GST).',
      'Download examination registration receipt with Roll Number.',
      'Appear for Online CEE with downloaded Admit Card.',
    ],
    faqs: [
      {
        question: 'What is the 1.6 KM run timing and scoring criteria for Indian Army Rally?',
        answer:
          'Group I (Up to 5 Min 30 Sec): 60 Marks; Group II (5 Min 31 Sec to 5 Min 45 Sec): 48 Marks. Push-ups / Beam Pull-ups: 10 pull-ups = 40 Marks, 9 pull-ups = 33 Marks, 8 pull-ups = 27 Marks, 7 pull-ups = 21 Marks, 6 pull-ups = 16 Marks.',
      },
      {
        question: 'Is Aadhaar authentication mandatory on JoinIndianArmy portal?',
        answer:
          'Yes. UIDAI Aadhaar verification via OTP or Digilocker is mandatory to prevent proxy candidate registration and verify candidate date of birth accurately.',
      },
    ],
  },
];
