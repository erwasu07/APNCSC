export interface GuideArticle {
  id: string;
  title: string;
  hindiTitle: string;
  urduTitle?: string;
  category: 'Recruitment' | 'Central Scheme' | 'Identity & Tax' | 'State Services' | 'Education';
  readTime: string;
  lastUpdated: string;
  status?: 'published' | 'draft';
  verifyNotes?: string[];
  reviewedBy?: string;
  reviewedAt?: string;
  verifierName?: string;
  verifiedDate?: string;
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
  // =========================================================================
  // EVERGREEN CITIZEN GUIDES IN DRAFT REVIEW (NOT PUBLIC UNTIL VERIFIED)
  // =========================================================================
  {
    id: 'jk-domicile-certificate-guide-draft',
    status: 'draft',
    title: 'Jammu & Kashmir Domicile Certificate: Eligibility, Documents & Online Process (Draft)',
    hindiTitle: 'जम्मू-कश्मीर अधिवास प्रमाण पत्र (डोमिसाइल) गाइड (ड्राफ्ट)',
    category: 'State Services',
    readTime: '6 min read',
    lastUpdated: 'November 17, 2026',
    author: 'CSC DOST Editorial Desk',
    officialPortal: 'jkeservices.gov.in [VERIFY]',
    officialUrl: 'https://jkeservices.gov.in',
    responsibleDepartment: 'Revenue Department / Tehsil Office, Government of J&K',
    intendedBeneficiaries: 'Permanent residents and eligible 15-year residents of Jammu & Kashmir',
    benefitSummary: 'Primary domicile proof required for J&K UT government jobs and university quotas [VERIFY]',
    applicableRegion: 'Jammu & Kashmir',
    verifyNotes: [
      'Verify current active portal URL on jkeservices.gov.in / jan-sugam portal before publishing.',
      'Verify latest statutory application/CSC service fee tariff and PSGA timeline with Tehsil office.',
    ],
    summary:
      'Step-by-step citizen draft guide explaining J&K Domicile Certificate eligibility categories, PRC conversion rules, required Tehsil supporting proofs, and online tracking steps. [VERIFY all portal charges and turnaround days from official jkeservices.gov.in circular before publishing.]',
    tableOfContents: [
      'Who Is Eligible for J&K Domicile Certificate',
      'Mandatory Supporting Documents',
      'Online Application Workflow',
      'Checking Status & Downloading Digitally Signed Certificate',
    ],
    sections: [
      {
        heading: '1. Who Is Eligible for a J&K Domicile Certificate',
        content:
          'Under the J&K Grant of Domicile Certificate rules, eligibility covers Permanent Resident Certificate (PRC) holders, residents living in J&K for 15 years, students who studied for 7 years and appeared in Class 10/12 exams in J&K, and eligible central government employees or their children. [VERIFY exact clause wording in current J&K Revenue Department notification.]',
      },
      {
        heading: '2. Common Reasons Tehsil Offices Raise Queries',
        content:
          'Applications frequently stall when applicant name or parentage differs between Aadhaar, ration card, and old PRC/revenue extracts, or when scan uploads are blurred.',
        tips: 'Keep clear PDF scans under portal size limits [VERIFY KB limit on jkeservices.gov.in] before initiating submission.',
      },
    ],
    eligibility: [
      'Former PRC holders and their eligible children [VERIFY category code on portal]',
      'Residents completing prescribed continuous stay or schooling criteria in Jammu & Kashmir [VERIFY exact documentary proof matrix]',
    ],
    documentsRequired: [
      'Permanent Resident Certificate (PRC) OR 15-year residence proof (Ration Card / Electoral Roll / Utility Record) [VERIFY accepted alternatives]',
      'Aadhaar Card and Date of Birth Proof (Matriculation Certificate / Birth Certificate)',
      'Passport-size colour photograph and signed self-declaration form',
    ],
    stepByStep: [
      'Register or log in on the official J&K e-Services / Jan Sugam portal [VERIFY current citizen login link].',
      'Select "Issuance of Domicile Certificate" under the Revenue Department menu and pick the appropriate eligibility clause.',
      'Enter Tehsil, District, Halqa/Patwar details, and family particulars carefully matching revenue records.',
      'Upload readable scans of PRC / 15-year proof and submit for Tehsildar verification.',
      'Pay prescribed fee [VERIFY current statutory fee / CSC service tariff] and save the acknowledgement reference number.',
    ],
    faqs: [
      {
        question: 'How long does Tehsildar approval take for a Domicile Certificate?',
        answer:
          'Under J&K Public Services Guarantee Act (PSGA) norms, PRC-based applications typically have a shorter statutory timeline than fresh 15-year verification cases [VERIFY exact working days under latest PSGA schedule].',
      },
    ],
  },
  {
    id: 'nsp-jk-scholarship-guide-draft',
    status: 'draft',
    title: 'National Scholarship Portal (NSP) & OTR Guide for J&K Students (Draft)',
    hindiTitle: 'नेशनल स्कॉलरशिप पोर्टल (NSP) और OTR पंजीकरण गाइड (ड्राफ्ट)',
    category: 'Education',
    readTime: '6 min read',
    lastUpdated: 'November 17, 2026',
    author: 'CSC DOST Editorial Desk',
    officialPortal: 'scholarships.gov.in',
    officialUrl: 'https://scholarships.gov.in',
    responsibleDepartment: 'Ministry of Electronics & IT / Respective Ministries & J&K Higher Education Dept',
    intendedBeneficiaries: 'School, college, and professional course students across J&K and India',
    benefitSummary: 'Pre-Matric, Post-Matric & Merit-cum-Means scholarships via Aadhaar-linked DBT [VERIFY]',
    applicableRegion: 'All India & Jammu & Kashmir',
    verifyNotes: [
      'Verify active academic session closing dates on scholarships.gov.in before publishing.',
      'Verify latest OTR / face-authentication Android app requirements on NSP announcements.',
    ],
    summary:
      'Draft guide covering One Time Registration (OTR) on National Scholarship Portal (NSP 2.0), Aadhaar NPCI DBT bank seeding, institutional verification, and defect handling for J&K students. [VERIFY current session schedule on scholarships.gov.in.]',
    tableOfContents: [
      'NSP One Time Registration (OTR)',
      'Fresh vs Renewal Applications',
      'Mandatory Documents & Bonafide Rules',
      'Common Defect & Bank Rejection Fixes',
    ],
    sections: [
      {
        heading: '1. Understanding NSP One Time Registration (OTR)',
        content:
          'NSP issues a unique 14-digit OTR linked to Aadhaar / EID so students do not create duplicate student profiles across academic sessions. Face authentication via the official AadhaarFaceRD and NSP OTR app may be required. [VERIFY active OTR steps on scholarships.gov.in].',
      },
      {
        heading: '2. DBT Bank Seeding Is Mandatory',
        content:
          'Disbursements move through Aadhaar Payment Bridge (APB) rather than plain IFSC account entry. Ensure your bank account is NPCI Aadhaar-seeded before scholarship sanction.',
      },
    ],
    eligibility: [
      'Enrolled regular students in recognized schools, colleges, or universities matching scheme-specific income and minimum percentage caps [VERIFY scheme guidelines PDF]',
    ],
    documentsRequired: [
      'NSP OTR ID & Aadhaar Card',
      'Bonafide Student Certificate stamped by Institution Head (for applicable fee thresholds) [VERIFY threshold]',
      'Income Certificate issued by competent authority & Category / Domicile Certificate where applicable',
      'Previous year marksheet and fee receipt',
    ],
    stepByStep: [
      'Generate your OTR number via scholarships.gov.in and complete e-KYC [VERIFY mobile app prompt].',
      'Log in with OTR, select the eligible Pre-Matric, Post-Matric, or Top Class scheme, and complete academic details.',
      'Upload required certificates only where prompted by the scheme threshold and submit.',
      'Inform your School/College Nodal Officer to complete INO verification before the institute verification deadline [VERIFY dates].',
    ],
    faqs: [
      {
        question: 'Should a student apply as Fresh or Renewal if promoted to the next semester?',
        answer:
          'Students continuing the same course who received scholarship on NSP in the prior year apply as Renewal; students starting a new degree or applying for the first time apply as Fresh. [VERIFY specific ministry renewal rule].',
      },
    ],
  },
  {
    id: 'jk-ration-card-ekyc-guide-draft',
    status: 'draft',
    title: 'J&K Ration Card (NFSA): Member Addition, Deletion & Mandatory e-KYC Guide (Draft)',
    hindiTitle: 'जम्मू-कश्मीर राशन कार्ड: सदस्य जोड़ना और ई-केवाईसी गाइड (ड्राफ्ट)',
    category: 'State Services',
    readTime: '5 min read',
    lastUpdated: 'November 17, 2026',
    author: 'CSC DOST Editorial Desk',
    officialPortal: 'fcsca.jk.gov.in / jkpds [VERIFY]',
    officialUrl: 'https://jkeservices.gov.in',
    responsibleDepartment: 'Department of Food, Civil Supplies & Consumer Affairs (FCS&CA), J&K',
    intendedBeneficiaries: 'AAY, PHH, and NPHH ration card holders in Jammu & Kashmir',
    benefitSummary: 'Uninterrupted monthly foodgrain allocation & Ayushman Bharat household linkage [VERIFY]',
    applicableRegion: 'Jammu & Kashmir',
    verifyNotes: [
      'Verify latest J&K FCS&CA e-KYC deadline circular and Mera eKYC app / Tehsil Supply Officer (TSO) workflow.',
      'Verify current active portal endpoint (jkeservices.gov.in vs rcms) before publishing.',
    ],
    summary:
      'Draft citizen walkthrough on keeping J&K Ration Card records updated under NFSA — including Aadhaar seeding, e-KYC at Fair Price Shops, adding newborn children, and marriage transfer/deletion certificates. [VERIFY active deadlines from FCS&CA J&K.]',
    tableOfContents: [
      'Why Ration Card e-KYC Is Required',
      'Adding a New Member or Newborn',
      'Transfer / Deletion Certificate (Surrender)',
      'Checking Ration Card Status Online',
    ],
    sections: [
      {
        heading: '1. Aadhaar Seeding & Biometric e-KYC',
        content:
          'Every family member listed on PHH/AAY ration cards must complete Aadhaar biometric authentication through the Fair Price Shop (FPS) PoS machine or official mobile KYC route notified by FCS&CA [VERIFY current allowed channels].',
      },
    ],
    eligibility: [
      'Existing J&K AAY, PHH, or NPHH ration card households registered with FCS&CA [VERIFY income cutoffs for PHH]',
    ],
    documentsRequired: [
      'Existing Ration Card Number & Head of Family Aadhaar Card',
      'Aadhaar Card of every family member + Birth Certificate (for child addition)',
      'Surrender / Deletion Certificate from parent ration card (for newly married member addition)',
    ],
    stepByStep: [
      'Visit your nearest Fair Price Shop (Depot) or Tehsil Supply Officer (TSO) portal desk for family e-KYC status check.',
      'For member addition/deletion, submit an online modification form on the official J&K portal [VERIFY active link] with Birth/Marriage/Surrender proof.',
      'Track TSO inspection approval and download the updated digital ration card slip.',
    ],
    faqs: [
      {
        question: 'Does Ration Card member data affect Ayushman Bharat SEHAT / PM-JAY card generation?',
        answer:
          'Yes. In J&K, updated NFSA ration card family databases are commonly used for SEHAT family verification [VERIFY current SEHAT data source rule].',
      },
    ],
  },
  {
    id: 'voter-id-nvsp-form6-guide-draft',
    status: 'draft',
    title: 'Voter ID (EPIC): Form 6 Registration & Form 8 Correction on Voters Portal (Draft)',
    hindiTitle: 'वोटर आईडी (EPIC): फॉर्म 6 पंजीकरण और फॉर्म 8 सुधार गाइड (ड्राफ्ट)',
    category: 'Identity & Tax',
    readTime: '5 min read',
    lastUpdated: 'November 17, 2026',
    author: 'CSC DOST Editorial Desk',
    officialPortal: 'voters.eci.gov.in',
    officialUrl: 'https://voters.eci.gov.in',
    responsibleDepartment: 'Election Commission of India (ECI)',
    intendedBeneficiaries: 'Indian citizens aged 18+ enrolling or updating electoral roll particulars',
    benefitSummary: 'Free voter registration, constituency shift, & e-EPIC PDF download',
    applicableRegion: 'All India & Jammu & Kashmir',
    verifyNotes: [
      'Verify latest qualifying dates (1 Jan / 1 Apr / 1 Jul / 1 Oct) and accepted document list on voters.eci.gov.in.',
    ],
    summary:
      'Draft guide covering new voter enrolment (Form 6), address/constituency shifting or photo/name correction (Form 8), BLO verification, and free digital e-EPIC download on voters.eci.gov.in. [VERIFY latest Form 6B / document norms on ECI portal.]',
    tableOfContents: [
      'Form 6 vs Form 8: Which Form to Choose',
      'Required Age & Residence Proofs',
      'Online Application & BLO Field Check',
      'Downloading e-EPIC PDF',
    ],
    sections: [
      {
        heading: '1. Form 6 vs Form 8 Explained Simply',
        content:
          'Use Form 6 only if your name is not registered in any Assembly constituency across India. Use Form 8 if you already hold an EPIC number and need address shifting, name/DOB correction, or replacement card issuance.',
      },
    ],
    eligibility: [
      'Indian citizen aged 18 years or above on qualifying date (17+ citizens can pre-apply under ECI quarterly qualifying dates) [VERIFY quarterly calendar]',
    ],
    documentsRequired: [
      'Recent passport-size colour photograph (white/light background)',
      'Age Proof (Birth Certificate, Class 10 Marksheet, Aadhaar, Passport, or PAN) [VERIFY ECI list]',
      'Ordinary Residence Proof (Electricity/Water bill, Bank Passbook, Ration Card, Aadhaar)',
    ],
    stepByStep: [
      'Create or sign in to an account at voters.eci.gov.in using mobile OTP.',
      'Select Form 6 (New) or Form 8 (Correction/Shift) and enter State, District, and Assembly Constituency.',
      'Upload clear scans of photograph, age proof, and address proof, then note the 18-character Reference ID.',
      'Track BLO verification status online; once EPIC is generated, download e-EPIC via OTP.',
    ],
    faqs: [
      {
        question: 'Is there any government fee to apply for a new Voter ID or Form 8 correction?',
        answer:
          'Official ECI registration and e-EPIC download on voters.eci.gov.in are free of charge [VERIFY whether duplicate physical PVC replacement carries any nominal charge].',
      },
    ],
  },
  {
    id: 'jk-isss-nsap-pension-guide-draft',
    status: 'draft',
    title: 'J&K Social Welfare Pensions (ISSS & NSAP): Old Age, Widow & Disability Guide (Draft)',
    hindiTitle: 'जम्मू-कश्मीर सामाजिक सुरक्षा पेंशन (ISSS / NSAP) गाइड (ड्राफ्ट)',
    category: 'Central Scheme',
    readTime: '6 min read',
    lastUpdated: 'November 17, 2026',
    author: 'CSC DOST Editorial Desk',
    officialPortal: 'jkeservices.gov.in / nsap.nic.in [VERIFY]',
    officialUrl: 'https://jkeservices.gov.in',
    responsibleDepartment: 'Social Welfare Department, Government of Jammu & Kashmir',
    intendedBeneficiaries: 'Eligible senior citizens, widows/destitute women & persons with benchmark disability',
    benefitSummary: 'Monthly DBT social security pension support [VERIFY exact monthly slab amount]',
    applicableRegion: 'Jammu & Kashmir',
    verifyNotes: [
      'Verify exact current monthly pension slab rates (age slabs & J&K Social Welfare G.O.) before publishing.',
      'Verify whether ration card category / annual household income limit applies under latest ISSS rules.',
    ],
    summary:
      'Draft informational overview of J&K Integrated Social Security Scheme (ISSS) and NSAP (IGNOAPS, IGNWPS, IGNDPS) pensions, detailing required certificates, Tehsil Social Welfare Officer verification, and DBT account norms. [VERIFY monthly pension rates and income caps.]',
    tableOfContents: [
      'ISSS vs NSAP Pension Categories',
      'Age, Income & Disability Requirements',
      'Mandatory Certificates & Medical Proofs',
      'Life Verification / KYC Continuity',
    ],
    sections: [
      {
        heading: '1. Major Pension Categories in J&K',
        content:
          'Social Welfare pensions cover Old Age Pension, Women in Distress / Widow Pension, Physically Challenged / Disability Pension, and Transgender financial assistance. [VERIFY latest exact age thresholds and monthly pension rupee slabs from Social Welfare Dept J&K order.]',
      },
    ],
    eligibility: [
      'Domicile resident of Jammu & Kashmir meeting age/widowhood/40%+ UDID disability criteria and prescribed income limit [VERIFY exact annual income cap in latest J&K order]',
      'Must not be receiving any other regular government salary or service pension',
    ],
    documentsRequired: [
      'Domicile Certificate & Aadhaar Card linked with active bank account',
      'Age Proof / CMO Certificate / UDID Card (for disability pension) / Death Certificate of spouse (for widow pension)',
      'Income / BPL / AAY / PHH Ration Card proof [VERIFY accepted proof]',
    ],
    stepByStep: [
      'Prepare digital copies of Domicile, Age/UDID/Death proof, Bank Passbook, and Aadhaar.',
      'Apply through the official J&K Jan Sugam / Social Welfare service portal [VERIFY active service URL] selecting ISSS or NSAP scheme.',
      'Submit physical/verifiable proof at the Tehsil Social Welfare Office (TSWO) if called for verification.',
      'Ensure Aadhaar-seeded DBT bank account remains active for monthly credit.',
    ],
    faqs: [
      {
        question: 'What disability percentage is required for disability pension?',
        answer:
          'Generally a benchmark disability of 40% or above certified via UDID / Medical Board is required [VERIFY specific threshold under current J&K ISSS order].',
      },
    ],
  },
  {
    id: 'jk-income-category-certificate-guide-draft',
    status: 'draft',
    title: 'J&K Income, EWS & Reserved Category Certificates (RBA, SC, ST, OBC): Guide (Draft)',
    hindiTitle: 'जम्मू-कश्मीर आय, EWS और आरक्षित श्रेणी (RBA/SC/ST) प्रमाण पत्र गाइड (ड्राफ्ट)',
    category: 'State Services',
    readTime: '6 min read',
    lastUpdated: 'November 17, 2026',
    author: 'CSC DOST Editorial Desk',
    officialPortal: 'jkeservices.gov.in [VERIFY]',
    officialUrl: 'https://jkeservices.gov.in',
    responsibleDepartment: 'Revenue Department / Tehsildar / Competent Authority, J&K',
    intendedBeneficiaries: 'J&K students and job applicants seeking reservation or scholarship benefits',
    benefitSummary: 'Mandatory validity certificates for JKSSB, NEET, CUET & NSP applications [VERIFY]',
    applicableRegion: 'Jammu & Kashmir',
    verifyNotes: [
      'Verify latest J&K Reservation Rules amendments (RBA, ALC/IB, Pahari, OBC/EWS) & certificate validity periods before publishing.',
    ],
    summary:
      'Draft checklist for citizens preparing Income, Economically Weaker Section (EWS), Resident of Backward Area (RBA), SC, ST, or OBC certificates in Jammu & Kashmir, including validity renewals and Patwari/Girdawar field reporting steps. [VERIFY latest reservation categories & validity dates.]',
    tableOfContents: [
      'Choosing the Correct Certificate Type',
      'Validity Period Before Exam Cutoffs',
      'Patwari & Tehsil Verification Documents',
      'Common Application Mistakes',
    ],
    sections: [
      {
        heading: '1. Financial-Year Validity Rules',
        content:
          'Income and EWS certificates are generally valid only for the specific financial year or validity window stated on the certificate, whereas SC/ST or RBA certificates follow rules specified in the J&K Reservation Act/Rules. [VERIFY exact validity duration in years for RBA/EWS/OBC.]',
      },
    ],
    eligibility: [
      'Applicants satisfying J&K domicile, village/area notification (for RBA/ALC), caste listing, or family gross annual income ceilings [VERIFY latest J&K Reservation Rules threshold]',
    ],
    documentsRequired: [
      'Domicile Certificate & Aadhaar Card of applicant and parents',
      'Ration Card, Revenue Extract (Jamabandi / Girdawari where applicable for RBA/EWS asset check)',
      'Salary Slip / Income Affidavit / Halqa Patwari Report [VERIFY format required by concerned Tehsil]',
    ],
    stepByStep: [
      'Log in to the official J&K e-Services / Jan Sugam portal [VERIFY link] and pick Income, EWS, RBA, SC, ST, or OBC service.',
      'Fill correct Patwar Halqa, Tehsil, and annual family income across all sources.',
      'Upload signed affidavit and supporting revenue/ration documents, then track Patwari/Naib-Tehsildar verification.',
      'Download the digitally signed certificate and verify QR/barcode authenticity before job submission.',
    ],
    faqs: [
      {
        question: 'Can an expired EWS or RBA certificate be used for JKSSB or SSC forms?',
        answer:
          'No. Recruitment boards strictly require a valid category certificate issued on or before the closing cutoff date specified in the advertisement.',
      },
    ],
  },
  {
    id: 'digilocker-apaar-abc-id-guide-draft',
    status: 'draft',
    title: 'DigiLocker & APAAR / ABC Academic ID: Student Setup & Document Pull Guide (Draft)',
    hindiTitle: 'डिजिलॉकर और APAAR / ABC अकादमिक आईडी गाइड (ड्राफ्ट)',
    category: 'Education',
    readTime: '5 min read',
    lastUpdated: 'November 17, 2026',
    author: 'CSC DOST Editorial Desk',
    officialPortal: 'digilocker.gov.in / abc.gov.in',
    officialUrl: 'https://www.digilocker.gov.in',
    responsibleDepartment: 'National e-Governance Division (NeGD) & Ministry of Education',
    intendedBeneficiaries: 'School, IGNOU, University of Kashmir & Cluster University students',
    benefitSummary: 'Mandatory 12-digit APAAR/ABC ID for university admissions & digital marksheets',
    applicableRegion: 'All India & Jammu & Kashmir',
    verifyNotes: [
      'Verify latest UGC/IGNOU/KU Samarth portal integration prompts for APAAR ID before publishing.',
    ],
    summary:
      'Draft guide explaining how students generate a 12-digit APAAR (Academic Bank of Credits) ID through DigiLocker, fetch verified JKBOSE/CBSE marksheets, and resolve Aadhaar name mismatch errors before college admission deadlines. [VERIFY current ABC portal steps.]',
    tableOfContents: [
      'What Is APAAR / ABC ID',
      'Linking DigiLocker With Aadhaar',
      'Generating ABC ID for University Admissions',
      'Fixing Name or DOB Mismatch Errors',
    ],
    sections: [
      {
        heading: '1. Why Universities Ask for APAAR / ABC ID',
        content:
          'Indian universities including IGNOU, University of Kashmir, and Cluster University use the 12-digit Academic Bank of Credits (ABC) / APAAR ID on admission and examination portals to store earned semester credits digitally.',
      },
    ],
    eligibility: [
      'Students holding an Aadhaar number linked to an active mobile number for DigiLocker OTP authentication [VERIFY college-level alternate flow if Aadhaar name differs]',
    ],
    documentsRequired: [
      'Aadhaar Card with active OTP mobile number',
      'University / College Roll Number, Registration Number, or Admission Year',
      'Class 10 / 12 Board Roll Number (to pull marksheets into DigiLocker)',
    ],
    stepByStep: [
      'Sign in at digilocker.gov.in or the DigiLocker mobile app using your Aadhaar-linked mobile number.',
      'Open "Search Documents" -> search for "Academic Bank of Credits" or "APAAR ID".',
      'Select your Institution Name (e.g., University of Kashmir, IGNOU, Cluster University Srinagar), Identity Type, and Admission Year.',
      'Click "Get Document" to generate your 12-digit ABC/APAAR ID and copy it accurately onto your admission or exam form.',
    ],
    faqs: [
      {
        question: 'What if my name on Aadhaar does not match my JKBOSE marksheet?',
        answer:
          'ABC/APAAR generation relies on Aadhaar demographic data. If spelling differs significantly from academic records, update Aadhaar demographic details at an authorized centre before university verification.',
      },
    ],
  },
  {
    id: 'jk-pm-surya-ghar-muft-bijli-guide-draft',
    title: 'PM Surya Ghar Muft Bijli Yojana in J&K: Subsidy Slabs, Net Metering & Portal Guide',
    hindiTitle: 'पीएम सूर्य घर मुफ्त बिजली योजना जम्मू-कश्मीर: सब्सिडी और आवेदन गाइड',
    urduTitle: 'پی ایم سوریہ گھر مفت بجلی یوجنا جموں و کشمیر: سبسڈی اور درخواست گائیڈ',
    category: 'Central Scheme',
    readTime: '6 min read',
    lastUpdated: 'November 18, 2026',
    status: 'draft',
    verifyNotes: [
      'Verify latest JPDCL / KPDCL empanelled vendor rules and net metering fee schedule for Jammu & Kashmir consumers.',
      'Confirm central CFA subsidy slabs (1 kW, 2 kW, 3 kW+) and any additional UT/state top-up on pmsuryaghar.gov.in.',
    ],
    author: 'CSC DOST Editorial & Citizen Advisory Desk',
    officialPortal: 'pmsuryaghar.gov.in',
    officialUrl: 'https://pmsuryaghar.gov.in',
    responsibleDepartment: 'Ministry of New & Renewable Energy (MNRE) / KPDCL & JPDCL',
    intendedBeneficiaries: 'Residential electricity consumers with domestic meter connection and suitable roof space',
    benefitSummary: 'Central Financial Assistance up to [VERIFY ₹78,000 for 3 kW+] rooftop solar & up to 300 units/month free power benefit',
    applicableRegion: 'All India (including Jammu & Kashmir KPDCL / JPDCL divisions)',
    summary:
      'Step-by-step guide for Jammu and Kashmir residential electricity consumers applying for rooftop solar installation under PM Surya Ghar: Muft Bijli Yojana, covering registration, KPDCL/JPDCL technical feasibility, vendor selection, net-metering inspection, and DBT subsidy disbursement.',
    tableOfContents: [
      'Overview & Electricity Discom Integration in J&K',
      'CFA Subsidy Structure & Capacity Sizing',
      'Mandatory Consumer Eligibility & Roof Readiness',
      'Documents Required for Online Application',
      'Step-by-Step Application on pmsuryaghar.gov.in',
      'Post-Installation Net Metering & DBT Release',
    ],
    sections: [
      {
        heading: '1. Overview & Electricity Discom Integration in J&K',
        content:
          'PM Surya Ghar: Muft Bijli Yojana assists residential households with domestic grid connections in installing grid-connected rooftop solar plants. In Jammu and Kashmir, consumer consumer-number verification and technical feasibility approvals route through Kashmir Power Distribution Corporation Limited (KPDCL) and Jammu Power Distribution Corporation Limited (JPDCL). Applicants should never pay cash advances to unregistered middlemen before receiving online technical feasibility approval on the national portal.',
        bulletPoints: [
          'Only residential domestic metered connections are eligible; purely commercial or industrial meters follow separate policies.',
          'All installations claiming central subsidy must be executed by a vendor registered and listed on the official national portal under the relevant Discom.',
          'Net metering replaces or reconfigures the existing service meter with a bidirectional smart or net meter approved by the Discom.',
        ],
      },
      {
        heading: '2. CFA Subsidy Structure & Capacity Sizing',
        content:
          'Under central guidelines, Central Financial Assistance depends on sanctioned plant capacity and average monthly household consumption [VERIFY current MNRE 2026 CFA slab rates and any J&K UT special-category additional subsidy percentage on pmsuryaghar.gov.in]. Households should match system kW sizing carefully against their sanctioned load rather than over-sizing beyond sanctioned Discom limits, because sanctioned load upgrades must be cleared by the local Electric Sub-Division before commissioning.',
        tips: 'Check your last 6 months of KPDCL/JPDCL electricity bills before selecting 1 kW, 2 kW, or 3 kW capacity. Snow-load mounting tilt angles matter in Kashmir valley districts.',
      },
      {
        heading: '3. Net Metering Inspection & DBT Subsidy Release',
        content:
          'Once panels and inverter are installed using DCR-compliant solar modules, the vendor submits work completion details with serial numbers and geo-tagged photographs. Discom engineers inspect earthing, AC/DC protection boxes, and install the net meter. After commissioning certificate issuance, the applicant enters bank account details and cancelled cheque on the portal for Direct Benefit Transfer [VERIFY typical 30-day DBT disbursement timeline in KPDCL/JPDCL divisions].',
      },
    ],
    eligibility: [
      'Applicant must be an Indian citizen residing in a house with a valid domestic electricity connection [VERIFY tenant NOC / joint family meter transfer rules]',
      'Roof ownership or valid property title suitable for shadow-free solar mounting',
      'No prior central rooftop solar subsidy availed for the same consumer account number [VERIFY current DBT deduplication norm]',
    ],
    documentsRequired: [
      'Latest KPDCL / JPDCL domestic electricity bill showing Consumer ID and Sanctioned Load',
      'Aadhaar Card linked with active mobile number for OTP login',
      'Cancelled cheque or Bank Passbook front page (matching applicant name for DBT)',
      'Property ownership proof / Jamabandi / Municipal Tax receipt [VERIFY accepted J&K ownership proof list]',
    ],
    stepByStep: [
      'Visit pmsuryaghar.gov.in and select Apply for Rooftop Solar -> Register using State (Jammu & Kashmir), Electricity Distribution Company (KPDCL or JPDCL), and Consumer Account Number.',
      'Log in with registered mobile number and fill out the rooftop capacity request form.',
      'Wait for online Technical Feasibility Approval from your respective Discom sub-division.',
      'Select a registered solar vendor shown inside your portal dashboard and sign the standard agreement.',
      'Complete installation using domestic content requirement (DCR) panels and submit commissioning inspection request.',
      'After net meter installation and commissioning certificate upload, submit bank details on the portal to claim DBT subsidy.',
    ],
    faqs: [
      {
        question: 'Can households in snow-bound districts of Anantnag, Kulgam, or Baramulla apply?',
        answer:
          'Yes, domestic consumers across KPDCL and JPDCL divisions are eligible, provided the vendor uses sturdy elevated mounting structures designed for local wind and snow loads [VERIFY local empanelled vendor availability in rural feeders].',
      },
      {
        question: 'How much subsidy is credited to the bank account?',
        answer:
          'Central Financial Assistance is credited directly to the beneficiary bank account based on installed capacity slabs [VERIFY exact current slab figures on pmsuryaghar.gov.in before submission].',
      },
    ],
  },
  {
    id: 'jk-ladli-beti-smas-guide-draft',
    title: 'J&K Ladli Beti & State Marriage Assistance Scheme (SMAS): Eligibility & Jansugam Guide',
    hindiTitle: 'जम्मू-कश्मीर लाडली बेटी और विवाह सहायता योजना (SMAS): पात्रता और जनसुगम गाइड',
    urduTitle: 'جموں و کشمیر لاڈلی بیٹی اور اسٹیٹ میرج اسسٹنس اسکیم: اہلیت اور درخواست گائیڈ',
    category: 'State Services',
    readTime: '6 min read',
    lastUpdated: 'November 18, 2026',
    status: 'draft',
    verifyNotes: [
      'Verify latest annual family income limit for Ladli Beti and AAY/PHH ration card requirement for SMAS.',
      'Confirm current J&K Bank recurring deposit monthly contribution (Rs 1,000/month) and SMAS financial assistance amount on jksocialwelfare.nic.in.',
    ],
    author: 'CSC DOST Editorial & Welfare Desk',
    officialPortal: 'jansugam.jk.gov.in / jksocialwelfare.nic.in',
    officialUrl: 'https://jansugam.jk.gov.in',
    responsibleDepartment: 'Department of Social Welfare, Government of Jammu & Kashmir',
    intendedBeneficiaries: 'Eligible families of newborn girl children (Ladli Beti) & economically weaker brides (SMAS) in J&K',
    benefitSummary: 'Ladli Beti recurring deposit & SMAS marriage assistance [VERIFY exact 2026 ₹1,000/month & ₹50,000/gold norm on official portal]',
    applicableRegion: 'Jammu & Kashmir UT (verified districts & BPL/AAY/PHH beneficiaries)',
    summary:
      'Citizens guide to two flagship Jammu & Kashmir Social Welfare schemes available via Jansugam: Ladli Beti Scheme for newborn girl children and the State Marriage Assistance Scheme (SMAS) for economically weaker prospective brides.',
    tableOfContents: [
      'Difference Between Ladli Beti and SMAS',
      'Verified Eligibility Rules & Income Thresholds',
      'Mandatory Certificates Required via Tehsil & Health Dept',
      'Online Application Workflow on Jansugam Portal',
      'Verification by CDPO / District Social Welfare Officer',
    ],
    sections: [
      {
        heading: '1. Difference Between Ladli Beti and State Marriage Assistance Scheme',
        content:
          'Although both programmes are administered by the J&K Social Welfare Department through the Jansugam e-services portal, they serve different life stages. Ladli Beti opens a zero-fee recurring deposit account at birth in the girl child name with monthly UT contributions maturing at age 21, while SMAS provides one-time marriage assistance to eligible unmarried daughters aged 18 or above from priority households prior to marriage.',
        bulletPoints: [
          'Ladli Beti applications must generally be submitted within a fixed window from the child birth date [VERIFY 6-month / 1-year window from birth certificate issue].',
          'SMAS applications must be submitted at least one month prior to the scheduled date of marriage [VERIFY exact advance filing days in latest SO notification].',
        ],
      },
      {
        heading: '2. Verified Eligibility Rules & Income Thresholds',
        content:
          'Applicants must belong to Jammu and Kashmir UT with valid Domicile status and verified family income or priority ration category. For Ladli Beti, total annual family income from all sources must remain below [VERIFY Rs 75,000 / Rs 1,00,000 annual income cap as per latest Social Welfare order]. For SMAS, families holding AAY or PHH ration cards verified through Food, Civil Supplies & Consumer Affairs records receive primary priority alongside age and unmarried status confirmation.',
        tips: 'Ensure the mother or girl child Aadhaar-seeded J&K Bank account and Tehsildar Income Certificate have matching spellings before uploading scans on Jansugam.',
      },
      {
        heading: '3. Field Verification by CDPO & Sanction',
        content:
          'Once submitted online with application reference number, records pass digitally to the jurisdictional Child Development Project Officer (CDPO) or Tehsil Social Welfare Officer for field verification through Anganwadi Workers. Keep photocopies of hospital birth record, ration card, and Aadhaar ready for physical verification if requested.',
      },
    ],
    eligibility: [
      'Girl child born in J&K UT within eligible birth-date filing window (Ladli Beti) [VERIFY applicable district list & filing window]',
      'Unmarried girl aged 18 years or above belonging to AAY/PHH family (SMAS) [VERIFY current age & minimum educational qualification norm]',
      'Annual household income below UT prescribed threshold verified by Tehsildar [VERIFY exact ₹ threshold]',
    ],
    documentsRequired: [
      'J&K Domicile Certificate of parents / applicant',
      'Hospital Birth Certificate (Ladli Beti) or School/Date-of-Birth Proof & Nikahnama/Marriage Card (SMAS)',
      'Valid Tehsildar Income Certificate or AAY/PHH Ration Card copy',
      'Aadhaar Card of parents and girl child / prospective bride',
      'Active J&K Bank Passbook copy',
    ],
    stepByStep: [
      'Register or log in on jansugam.jk.gov.in via MeriPehchaan (JanParichay) credentials.',
      'Select Department of Social Welfare -> choose Ladli Beti Scheme or State Marriage Assistance Scheme (SMAS).',
      'Enter family ration card, Aadhaar, domicile, and bank details carefully.',
      'Upload clear PDF/JPG scans of required certificates and submit for e-verification.',
      'Note the Jansugam Application Reference Number and track verification status with local CDPO / TSWO office.',
    ],
    faqs: [
      {
        question: 'Can a family apply for SMAS after the marriage ceremony has already taken place?',
        answer:
          'Under standard Social Welfare rules, SMAS applications must be submitted in advance before the marriage date so field verification can be completed [VERIFY exact advance window on jksocialwelfare.nic.in].',
      },
      {
        question: 'Can an amount from Ladli Beti be withdrawn before age 21?',
        answer:
          'Normally the recurring deposit matures when the beneficiary attains 21 years of age and remains unmarried, subject to official J&K Bank & Social Welfare terms [VERIFY premature closure exceptions].',
      },
    ],
  },
  {
    id: 'pan-aadhaar-linking-correction-guide-draft',
    title: 'PAN-Aadhaar Linking, e-PAN Download & Demographic Correction: Complete Citizen Guide',
    hindiTitle: 'पैन-आधार लिंकिंग, ई-पैन डाउनलोड और सुधार: संपूर्ण नागरिक गाइड',
    urduTitle: 'پین-آدھار لنکنگ، ای-پین ڈاؤن لوڈ اور تصحیح: مکمل شہری گائیڈ',
    category: 'Identity & Tax',
    readTime: '6 min read',
    lastUpdated: 'November 18, 2026',
    status: 'draft',
    verifyNotes: [
      'Confirm current Income Tax e-Filing Section 234H late linking fee (Rs 1,000) and any exempted categories for 2026.',
      'Verify current Protean (NSDL) and UTIITSL physical/e-PAN correction fees.',
    ],
    author: 'CSC DOST Identity & Compliance Desk',
    officialPortal: 'incometax.gov.in / onlineservices.nsdl.com',
    officialUrl: 'https://www.incometax.gov.in/iec/foportal/',
    responsibleDepartment: 'Income Tax Department (CBDT) / Protean (NSDL) & UTIITSL',
    intendedBeneficiaries: 'PAN holders checking Link Aadhaar status, fixing name/DOB mismatches, or downloading e-PAN',
    benefitSummary: 'Prevents inoperative PAN status, avoids higher TDS deduction, and keeps banking & scholarship KYC active',
    applicableRegion: 'All India',
    summary:
      'How to verify whether your PAN is already linked with Aadhaar on the Income Tax e-Filing portal, fix name or date-of-birth mismatches that block linking, pay applicable late fees safely, and request PAN demographic correction.',
    tableOfContents: [
      'Why Operative PAN-Aadhaar Linking Matters',
      'How to Check Link Aadhaar Status Before Paying',
      'Fixing Name, Gender & Date of Birth Mismatches',
      'Fee Structure & Authorized Portals',
      'Step-by-Step Linking & Correction Workflow',
    ],
    sections: [
      {
        heading: '1. Why Operative PAN-Aadhaar Linking Matters',
        content:
          'Under Income Tax rules, an individual whose PAN becomes inoperative due to non-linking with Aadhaar faces disruptions in Income Tax Return refunds, higher TDS/TCS deductions, bank KYC updates, Demat operations, and scholarship bank mandates. Before starting any correction or payment, always check your live linking status directly on the official Income Tax portal without sharing OTPs with third-party agents.',
        bulletPoints: [
          'If PAN status shows Already Linked, no duplicate fee payment is required.',
          'Exempted categories (such as certain NRI statuses or notified age groups) should verify official CBDT exemption circulars before initiating payment [VERIFY current 2026 CBDT exemption list].',
        ],
      },
      {
        heading: '2. Fixing Name, Gender & Date of Birth Mismatches',
        content:
          'UIDAI demographic verification will reject PAN-Aadhaar linking automatically if full name spelling, date of birth, or gender differs between your PAN database record and your Aadhaar record. Decide carefully which document matches your Class 10 Matriculation certificate: update PAN via Protean/UTIITSL if Aadhaar matches school records, or update Aadhaar at an authorized Seva Kendra if PAN holds the accurate spelling.',
        tips: 'Never pay the Rs 1,000 challan twice if UIDAI demographic match fails—fix the mismatch on PAN or Aadhaar first, then re-submit Link Aadhaar once the challan reflects under the same PAN.',
      },
      {
        heading: '3. Authorized Correction Portals & e-PAN Retrieval',
        content:
          'Citizens requiring PAN reprint or demographic correction can use Protean eGov (tin-nsdl) or UTIITSL portals depending on which agency originally issued the PAN, or submit an assisted request through an authorized CSC centre [VERIFY latest Protean & UTIITSL official fee schedule including physical dispatch vs e-PAN only].',
      },
    ],
    eligibility: [
      'All non-exempt Indian PAN holders allotted PAN prior to notified cutoff dates [VERIFY latest CBDT cutoff date]',
      'Aadhaar number active and linked with mobile number for OTP confirmation',
      'Exact match in Name, Date of Birth, and Gender between PAN and Aadhaar',
    ],
    documentsRequired: [
      'PAN Card Number / Existing PAN copy',
      'Aadhaar Card with active mobile number for OTP',
      'Matriculation / Birth Certificate (if correcting Date of Birth on PAN)',
      'Gazette Notification or Supporting ID proof (for major name changes)',
    ],
    stepByStep: [
      'Open incometax.gov.in -> Quick Links -> Link Aadhaar Status and enter your 10-digit PAN and 12-digit Aadhaar.',
      'If status confirms not linked, verify exact Name and DOB matching on both documents first.',
      'Click Link Aadhaar -> validate PAN/Aadhaar -> complete e-Pay Tax challan under Minor Head 500 (Other Receipts) [VERIFY Rs 1,000 fee applicability].',
      'Wait for challan verification (up to 4-5 working days in some banks), then revisit Link Aadhaar to submit the final OTP request.',
      'Re-check Link Aadhaar Status after 48 hours to confirm active operative linking.',
    ],
    faqs: [
      {
        question: 'My challan payment succeeded, but PAN-Aadhaar still says Not Linked. What should I do?',
        answer:
          'Paying the fee challan is only Step 1. You must return to the Link Aadhaar screen on incometax.gov.in once payment reflects and complete the Aadhaar OTP submission step [VERIFY bank settlement delay window].',
      },
      {
        question: 'Which agency should I choose for PAN correction—Protean (NSDL) or UTIITSL?',
        answer:
          'Check the back of your physical PAN card or original acknowledgment slip to see whether NSDL or UTIITSL issued it; either authorized portal can process Changes/Correction in existing PAN data.',
      },
    ],
  },
  {
    id: 'jk-passport-seva-police-verification-guide-draft',
    title: 'Passport Seva in J&K (PSK Srinagar & Jammu): Fresh, Renewal & Police Verification Guide',
    hindiTitle: 'जम्मू-कश्मीर पासपोर्ट सेवा: नया पासपोर्ट, नवीनीकरण और पुलिस सत्यापन गाइड',
    urduTitle: 'جموں و کشمیر پاسپورٹ سیوا: نیا پاسپورٹ، تجدید اور پولیس تصدیق گائیڈ',
    category: 'State Services',
    readTime: '6 min read',
    lastUpdated: 'November 18, 2026',
    status: 'draft',
    verifyNotes: [
      'Confirm current normal vs Tatkaal passport fees (Rs 1,500 normal / Rs 3,500 Tatkaal for 36-page adult passport) on passportindia.gov.in.',
      'Verify latest J&K Police CID / mPassport Police App verification norms and RPO Srinagar / RPO Jammu POPSK list.',
    ],
    author: 'CSC DOST Travel & Identity Advisory Desk',
    officialPortal: 'passportindia.gov.in',
    officialUrl: 'https://www.passportindia.gov.in',
    responsibleDepartment: 'Ministry of External Affairs (RPO Srinagar & RPO Jammu)',
    intendedBeneficiaries: 'Citizens applying for Fresh, Re-issue/Renewal, Minor, or Lost/Damaged Indian Passports in J&K',
    benefitSummary: 'Transparent walkthrough covering Document Advisor, PSK slot booking, biometrics, and J&K Police CID clearance',
    applicableRegion: 'Jammu & Kashmir (RPO Srinagar & RPO Jammu jurisdictions)',
    summary:
      'Complete guide to applying for a fresh or renewed Indian passport through Passport Seva Kendra (PSK) Srinagar, PSK Jammu, or district Post Office Passport Seva Kendras (POPSK), plus preparing documents for J&K Police and CID verification.',
    tableOfContents: [
      'RPO Srinagar vs RPO Jammu Jurisdiction & POPSK Centres',
      'Fresh vs Re-issue & ECNR vs ECR Categories',
      'Checklist of Identity, Address & DOB Proofs',
      'PSK Biometric Appointment & Counter Stages (A, B, C)',
      'J&K Police & CID Verification Tips to Avoid Delays',
    ],
    sections: [
      {
        heading: '1. RPO Srinagar vs RPO Jammu Jurisdiction & POPSK Centres',
        content:
          'Applicants residing in Kashmir division districts (Anantnag, Kulgam, Pulwama, Shopian, Srinagar, Budgam, Baramulla, Bandipora, Kupwara, Ganderbal) fall under Regional Passport Office (RPO) Srinagar, while Jammu division districts report to RPO Jammu. Alongside main PSKs, several district Post Office Passport Seva Kendras (POPSKs) handle normal category bookings [VERIFY active POPSK list in Anantnag, Baramulla, Leh, Udhampur on passportindia.gov.in].',
        bulletPoints: [
          'Always verify on the official Document Advisor tool before booking an appointment whether you need Fresh or Re-issue (validity expiry, damaged pages, exhaustion of pages, or personal detail change).',
          'Do not pay unauthorised third-party websites claiming instant Tatkaal approval; all fees are paid strictly on passportindia.gov.in.',
        ],
      },
      {
        heading: '2. ECNR Status & Document Consistency',
        content:
          'Applicants who have passed Class 10 (Matriculation) or above automatically qualify for Emigration Check Not Required (ECNR) status upon carrying original Class 10 marksheet and certificate to the PSK counter. Ensure your Aadhaar, Voter ID/bank passbook, and school marksheet display identical name spelling, father name, and date of birth; minor spelling mismatches are the top cause of counter hold.',
        tips: 'If you have lived at multiple addresses within the last 12 months, mention all addresses accurately in the form so post-PSK police verification does not trigger an adverse report.',
      },
      {
        heading: '3. J&K Police & CID Verification Preparation',
        content:
          'After successful document scan and biometrics at PSK Counters A, B, and C, your file is forwarded digitally to the local Police Station and Special Branch / CID verification unit [VERIFY current mPassport Police App timeline & required witness proofs in J&K districts]. Keep original documents, two passport photos, and copy of parent/witness ID handy when contacted by the beat officer.',
      },
    ],
    eligibility: [
      'Indian citizen residing in Jammu & Kashmir with verifiable current and permanent residential address',
      'Class 10 pass certificate for Non-ECR endorsement (or other eligible ECNR proof per MEA rules)',
      'Parent/guardian consent Annexures D/C for minor applicants under 18 years [VERIFY latest MEA minor annexure rules]',
    ],
    documentsRequired: [
      'Original Aadhaar Card + Address Proof (Bank Passbook with photo / Electricity or Water bill / Election Card)',
      'Class 10 Matriculation Certificate / Birth Certificate for Date of Birth & ECNR verification',
      'Old Passport in original (for Re-issue / Renewal applications)',
      'Printed Application Receipt (ARN) & SMS appointment confirmation (originals required at PSK)',
    ],
    stepByStep: [
      'Register on passportindia.gov.in selecting the correct RPO (Srinagar or Jammu).',
      'Fill out the Fresh or Re-issue Passport application carefully matching exact spellings on school and Aadhaar records.',
      'Pay the prescribed passport fee online [VERIFY current ₹1,500 normal / ₹3,500 Tatkaal fee] and book a PSK or POPSK slot.',
      'Visit the selected PSK/POPSK 15 minutes early with all ORIGINAL documents (photocopies alone are rejected).',
      'Complete Counter A (document scanning & biometrics), Counter B (verification), and Counter C (granting officer).',
      'Cooperate promptly with local Police Station and CID verification once SMS notification arrives.',
    ],
    faqs: [
      {
        question: 'Is Tatkaal passport available for every applicant?',
        answer:
          'Tatkaal slots carry higher fees and stricter verification norms, and certain categories such as major name change or lost passport may face restrictions [VERIFY Tatkaal eligibility matrix on passportindia.gov.in].',
      },
      {
        question: 'Do I need to carry self-attested photocopies along with original documents to PSK?',
        answer:
          'Original documents are mandatory for digital scanning at PSK Counter A. Carrying one clean self-attested set as backup is helpful, though PSK staff scan directly from originals.',
      },
    ],
  },
  {
    id: 'udyam-msme-jk-self-employment-guide-draft',
    title: 'Udyam MSME Registration & J&K Self-Employment Loan Linkage (PMEGP / Mumkin / Tejaswini)',
    hindiTitle: 'उद्यम एमएसएमई पंजीकरण और जम्मू-कश्मीर स्वरोजगार योजना गाइड',
    urduTitle: 'اُدیم ایم ایس ایم ای رجسٹریشن اور جموں و کشمیر خود روزگار اسکیماں گائیڈ',
    category: 'Central Scheme',
    readTime: '6 min read',
    lastUpdated: 'November 18, 2026',
    status: 'draft',
    verifyNotes: [
      'Verify latest Micro/Small/Medium investment & turnover limits on udyamregistration.gov.in.',
      'Confirm active status & age/education limits of J&K Mission Youth (Mumkin / Tejaswini / Spurring Entrepreneurship) and KVIC PMEGP for 2026.',
    ],
    author: 'CSC DOST Enterprise & Youth Support Desk',
    officialPortal: 'udyamregistration.gov.in / missionyouth.jk.gov.in',
    officialUrl: 'https://udyamregistration.gov.in',
    responsibleDepartment: 'Ministry of MSME / KVIC & J&K Mission Youth / JKEDI',
    intendedBeneficiaries: 'Small traders, artisans, CSC VLEs, tailoring/manufacturing units, and unemployed youth entrepreneurs',
    benefitSummary: 'Free lifetime Udyam Certificate + eligibility gateway for PMEGP [VERIFY 15-35% margin money subsidy] & J&K Mission Youth credit schemes',
    applicableRegion: 'All India & Jammu & Kashmir UT',
    summary:
      'Complete walkthrough for obtaining a free government Udyam MSME Registration Certificate using Aadhaar and PAN, and using it as an enterprise foundation for bank Mudra loans, KVIC PMEGP, and J&K Mission Youth self-employment programmes.',
    tableOfContents: [
      'Why Udyam Registration Is Free & Essential',
      'NIC Business Activity Codes & Investment Classification',
      'Linking Udyam with PMEGP & J&K Youth Schemes',
      'Documents & Bank Details Needed',
      'Step-by-Step Registration on udyamregistration.gov.in',
    ],
    sections: [
      {
        heading: '1. Why Udyam Registration Is Free & Essential',
        content:
          'Udyam Registration is the official Government of India enterprise certificate issued by the Ministry of MSME, completely free of government charge on udyamregistration.gov.in. Beware of lookalike private portals charging hefty fees for free Udyam certificates. A valid Udyam number helps shops, handloom artisans, dairy units, food processors, and service enterprises open current bank accounts, apply for collateral-free credit guarantee schemes, and qualify for priority sector lending.',
        bulletPoints: [
          'Micro, Small, and Medium classification automatically syncs with Income Tax PAN and GSTIN turnover data [VERIFY current ₹ turnover/investment limits].',
          'Existing Udyog Aadhaar holders had to migrate onto Udyam to remain valid for government tenders and subsidies.',
        ],
      },
      {
        heading: '2. Linking Udyam with PMEGP & J&K Youth Self-Employment Schemes',
        content:
          'Young entrepreneurs across Anantnag, Srinagar, Baramulla, and Jammu looking for subsidized loans via KVIC/DIC PMEGP, PM Vishwakarma, or J&K Mission Youth initiatives (such as Mumkin commercial vehicle support or Tejaswini women entrepreneurship) frequently need clean KYC, Aadhaar-linked bank accounts, project reports (DPR), and Udyam registration [VERIFY exact active J&K Mission Youth & JKREGP guidelines for 2026 before applying].',
        tips: 'Pick accurate 5-digit NIC 2008 activity codes (manufacturing vs wholesale/retail/service) during Udyam form entry—banks cross-check your NIC code against your loan project report.',
      },
    ],
    eligibility: [
      'Proprietor, Partnership, SHG, Cooperative, or Enterprise owner with valid Aadhaar & PAN',
      'Aadhaar linked to active mobile number for OTP verification',
      'For J&K Mission Youth / PMEGP linkage: domicile, age (18+ years), and non-defaulter CIBIL status [VERIFY scheme-specific age/qualification criteria]',
    ],
    documentsRequired: [
      'Proprietor Aadhaar Card & Mobile Number',
      'PAN Card of Enterprise / Proprietor',
      'Active Savings or Current Bank Account Number & IFSC',
      'Business Address, Date of Commencement, and NIC Activity Details',
      'GSTIN (if registered and mandatory under GST turnover rules)',
    ],
    stepByStep: [
      'Visit udyamregistration.gov.in and choose For New Entrepreneurs who are not Registered yet as MSME.',
      'Validate Aadhaar number via OTP, then validate PAN and ITR/GST status.',
      'Enter enterprise name, unit location (District, Block, Pincode), and select exact 5-digit NIC Codes.',
      'Enter employee headcount, investment in plant/machinery, and bank account number + IFSC.',
      'Submit final OTP verification and download the printable Udyam Certificate with QR code instantly.',
    ],
    faqs: [
      {
        question: 'Is there any government registration fee for Udyam MSME Certificate?',
        answer:
          'No. Official registration on udyamregistration.gov.in is 100% free of government fee. Only optional CSC facilitation charges apply if you seek assisted data entry and printing.',
      },
      {
        question: 'Can a small shop or CSC service point register under Udyam?',
        answer:
          'Yes, retail trades and service enterprises with valid Aadhaar, PAN, and active bank accounts can register under the appropriate service/trade NIC activity codes [VERIFY latest retail MSME priority sector lending rules].',
      },
    ],
  },
  {
    id: 'eshram-card-unorganised-workers-guide-draft',
    title: 'e-Shram Card Registration & Profile Update: Benefits for Unorganised Workers',
    hindiTitle: 'ई-श्रम कार्ड पंजीकरण और प्रोफाइल अपडेट: असंगठित श्रमिकों के लिए लाभ',
    urduTitle: 'ای-شرم کارڈ رجسٹریشن اور پروفائل اپڈیٹ: غیر منظم مزدوروں کے لیے فوائد',
    category: 'Central Scheme',
    readTime: '5 min read',
    lastUpdated: 'November 18, 2026',
    status: 'draft',
    verifyNotes: [
      'Confirm active PMSBY ₹2 lakh accidental insurance coverage terms and whether e-Shram pension/rations convergence rules updated in 2026.',
      'Verify exact NCO occupation codes and ESIC/EPFO exclusion logic.',
    ],
    author: 'CSC DOST Citizen Welfare Desk',
    officialPortal: 'eshram.gov.in',
    officialUrl: 'https://eshram.gov.in',
    responsibleDepartment: 'Ministry of Labour & Employment, Government of India',
    intendedBeneficiaries: 'Construction workers, agricultural labourers, drivers, street vendors, domestic workers, weavers & artisans',
    benefitSummary: '12-digit Universal Account Number (UAN) linking central/state social security & [VERIFY accidental insurance / ration convergence rules]',
    applicableRegion: 'All India',
    summary:
      'Step-by-step guide for unorganised sector workers on registering for an e-Shram Universal Account Number (UAN), selecting the right NCO occupation code, and updating Aadhaar-linked bank or address details.',
    tableOfContents: [
      'Who Counts as an Unorganised Worker under e-Shram',
      'Key Benefits & PMSBY Convergence Notes',
      'Mandatory Eligibility & Exclusions (EPFO / ESIC)',
      'Documents Required & Occupation Coding',
      'Self-Registration & Profile Update Steps',
    ],
    sections: [
      {
        heading: '1. Who Counts as an Unorganised Worker under e-Shram',
        content:
          'The National Database of Unorganised Workers (e-Shram) covers home-based workers, self-employed workers, and wage workers across construction, agriculture, carpet weaving, apple orchard labour, transport driving, tailoring, carpentry, and domestic help. Registered citizens receive a lifetime 12-digit Universal Account Number (UAN) card recognized across India for state and central welfare delivery.',
        bulletPoints: [
          'Migrant workers moving outside Jammu & Kashmir for seasonal work benefit from a unified national worker database.',
          'Always verify bank account seeding with Aadhaar so future welfare transfers do not bounce.',
        ],
      },
      {
        heading: '2. Important Exclusions & Accidental Cover Notes',
        content:
          'Workers actively covered under Employees Provident Fund Organisation (EPFO), Employees State Insurance Corporation (ESIC), or paying Income Tax are NOT eligible for e-Shram registration [VERIFY current 2026 e-Shram age limit 16–59 years and active PMSBY ₹2 lakh accidental insurance subsidy terms on eshram.gov.in]. Students who are not engaged in any wage or self-employed activity should also verify eligibility carefully rather than registering needlessly.',
        tips: 'Update your e-Shram profile immediately if you change your bank account, mobile number, or skill trade—or if you become an income taxpayer or join organized EPFO payroll.',
      },
    ],
    eligibility: [
      'Citizen engaged in unorganised work (wage worker, migrant labourer, small farmer, artisan, driver)',
      'Age strictly between [VERIFY 16 and 59 years] on date of registration',
      'Must NOT be a member of EPFO / ESIC or an Income Tax assessee',
    ],
    documentsRequired: [
      'Aadhaar Card (with Aadhaar-linked mobile number or biometric verification via CSC)',
      'Active Bank Account Number & IFSC Code seeded with Aadhaar',
      'Nominee full name, relationship, and date of birth',
      'Occupation details matching NCO Code list',
    ],
    stepByStep: [
      'Visit eshram.gov.in and select Register on e-Shram (or Update Profile if already registered).',
      'Verify your Aadhaar-linked mobile number via OTP and enter captcha.',
      'Review pre-filled Aadhaar demographic details and fill in residential address, education, income bracket, and nominee.',
      'Select your primary and secondary NCO occupation code from the official occupation PDF list.',
      'Confirm Aadhaar-seeded bank account details and download your e-Shram UAN Card.',
    ],
    faqs: [
      {
        question: 'Can college students apply for an e-Shram card to receive monthly allowances?',
        answer:
          'e-Shram is strictly designed for unorganised sector workers aged 16–59, not non-working students. Incorrect registration can interfere with scholarship eligibility or create compliance mismatches.',
      },
      {
        question: 'How do I update my bank account or occupation on e-Shram?',
        answer:
          'Log in on eshram.gov.in -> Already Registered? Update using UAN/Aadhaar OTP -> edit Bank Account or Occupation Skills and re-download the updated UAN card.',
      },
    ],
  },
  {
    id: 'kashmir-univ-cus-exam-migration-bonafide-guide-draft',
    title: 'University of Kashmir & Cluster University Srinagar: Migration, Degree & Re-Evaluation Guide',
    hindiTitle: 'कश्मीर विश्वविद्यालय और क्लस्टर यूनिवर्सिटी श्रीनगर: माइग्रेशन, डिग्री और री-इवैल्यूएशन गाइड',
    urduTitle: 'کشمیر یونیورسٹی اور کلسٹر یونیورسٹی سری نگر: مائیگریشن، ڈگری اور ری ایویلوایشن گائیڈ',
    category: 'Education',
    readTime: '6 min read',
    lastUpdated: 'November 18, 2026',
    status: 'draft',
    verifyNotes: [
      'Verify latest University of Kashmir & CUS Srinagar online fee structures for Migration Certificate, Provisional/Original Degree, and Re-evaluation per paper.',
      'Confirm ABC/APAAR ID mandatory requirement on egov.uok.edu.in and cusrinagar.edu.in student portals.',
    ],
    author: 'CSC DOST Higher Education Support Desk',
    officialPortal: 'egov.uok.edu.in / cusrinagar.edu.in',
    officialUrl: 'https://www.kashmiruniversity.net',
    responsibleDepartment: 'University of Kashmir & Cluster University Srinagar (Examination & Registration Wings)',
    intendedBeneficiaries: 'UG, PG, B.Ed, Integrated & DDOE students needing academic certificates or answer-script re-evaluation',
    benefitSummary: 'Clear step-by-step workflow for Migration, Provisional/Degree Certificate, Transcript & Re-evaluation applications',
    applicableRegion: 'Jammu & Kashmir (affiliated colleges & campus students)',
    summary:
      'Practical student guide to applying online for Migration Certificates, Provisional or Original Degree Certificates, Academic Transcripts, and Re-evaluation/Xerox copies of answer scripts at University of Kashmir and Cluster University Srinagar.',
    tableOfContents: [
      'Preparing Registration No., Roll No. & ABC/APAAR ID',
      'Applying for Migration & Provisional/Original Degree',
      'Re-Evaluation & Answer Script Xerox Windows',
      'Documents & College Counter Endorsements',
      'Step-by-Step Portal Submission & Receipt Tracking',
    ],
    sections: [
      {
        heading: '1. Preparing Registration No., Roll No. & ABC/APAAR ID',
        content:
          'Before starting any student service request on University of Kashmir (egov.uok.edu.in / kashmiruniversity.net) or Cluster University Srinagar (cusrinagar.edu.in), gather your University Registration Number, College Class Roll Number, Final Semester Marks Card, and 12-digit APAAR/ABC ID. Incorrect registration numbers or unpaid fee challans are the most common reason certificates remain stuck in processing.',
        bulletPoints: [
          'Keep active email ID and student mobile number updated for SMS certificate dispatch alerts.',
          'Download and print the online payment confirmation receipt with Transaction ID immediately after paying fees.',
        ],
      },
      {
        heading: '2. Migration, Provisional & Original Degree Certificates',
        content:
          'Students moving to IGNOU, central universities, or outside-state institutions require an official Migration Certificate after clearing or cancelling their earlier enrolment. Both University of Kashmir and Cluster University run online student service forms where candidates upload marks cards, college NOC/clearance where specified, and pay the prescribed statutory fee [VERIFY current ₹ Migration and Degree certificate fee slabs on official student service portals].',
        tips: 'Read the specific college clearance instructions printed on your online receipt—some certificates require physical submission of the printed form at your parent college or Hazratbal/Gogji Bagh counter.',
      },
      {
        heading: '3. Re-Evaluation & Answer Script Xerox Windows',
        content:
          'Whenever UG/PG or B.Ed results are declared, the Controller of Examinations publishes a strict notification window (typically 10 to 15 days) for applying online for Re-evaluation or obtaining photocopies of answer scripts [VERIFY exact window days & per-paper re-evaluation fee in latest KU/CUS circular]. Submit before the closing timestamp as late offline applications are not entertained.',
      },
    ],
    eligibility: [
      'Bonafide enrolled or pass-out students of University of Kashmir or Cluster University Srinagar',
      'Valid University Registration Number and declared semester results (for Degree/Migration/Re-evaluation)',
      'Clearance of college dues / library NOC if requested by department guidelines',
    ],
    documentsRequired: [
      'University Registration Number & Enrolment Details',
      'Consolidated / All-Semester Marks Cards PDF',
      '12-digit DigiLocker ABC / APAAR ID (where required)',
      'College No-Objection / Clearance Slip (if applying for mid-course Migration)',
      'Debit Card / UPI / NetBanking for statutory university fee payment',
    ],
    stepByStep: [
      'Visit official portal (kashmiruniversity.net -> Student Services / eGov, or cusrinagar.edu.in -> Student Login).',
      'Select the exact service: Migration Certificate, Provisional/Degree Certificate, Bona Fide, or Re-Evaluation.',
      'Enter University Registration Number and verify auto-fetched student profile details carefully.',
      'Upload scanned marks cards/documents in prescribed KB file size and preview all details.',
      'Pay the official fee online, download the stamped Form + Fee Receipt PDF, and complete physical counter submission if printed on the slip.',
    ],
    faqs: [
      {
        question: 'Can I apply for University of Kashmir Migration Certificate online without visiting Srinagar campus?',
        answer:
          'University of Kashmir has digitized several certificate workflows on its eGov portal, though original document verification or postal dispatch rules vary by certificate type [VERIFY current online-only vs counter pickup notice on egov.uok.edu.in].',
      },
      {
        question: 'What is the fee for applying for a Xerox copy or Re-evaluation of an exam paper?',
        answer:
          'Fee per paper is notified separately in each examination re-evaluation circular [VERIFY exact per-paper ₹ rate in the active notification before paying].',
      },
    ],
  },
  {
    id: 'jk-driving-licence-sarathi-parivahan-guide-draft',
    title: 'J&K Driving Licence & Sarathi Parivahan Guide: Learner Licence, Track Test & Renewal',
    hindiTitle: 'जम्मू-कश्मीर ड्राइविंग लाइसेंस (सारथी परिवहन): लर्नर, टेस्ट और नवीनीकरण गाइड',
    urduTitle: 'جموں و کشمیر ڈرائیونگ لائسنس (سارتھی پری واہن): لرنر، ٹیسٹ اور تجدید گائیڈ',
    category: 'State Services',
    readTime: '6 min read',
    lastUpdated: 'November 18, 2026',
    status: 'draft',
    verifyNotes: [
      'Verify latest J&K RTO / ARTO contactless Aadhaar-eKYC Learner Licence fee, DL Smart Card fee, and Form 1A age threshold (40+ years).',
      'Confirm active driving track test slot booking instructions for Anantnag, Srinagar, Pulwama, and Jammu RTOs.',
    ],
    author: 'CSC DOST Transport & Citizen Facilitation Desk',
    officialPortal: 'sarathi.parivahan.gov.in',
    officialUrl: 'https://sarathi.parivahan.gov.in',
    responsibleDepartment: 'Ministry of Road Transport & Highways (MoRTH) / J&K Transport Department (RTO & ARTOs)',
    intendedBeneficiaries: 'New drivers, two-wheeler/LMV learners, and existing licence holders seeking renewal or duplicate DL in J&K',
    benefitSummary: 'Contactless Aadhaar Learner Test, Permanent DL track booking, and smart-card renewal steps',
    applicableRegion: 'Jammu & Kashmir UT (all RTO & ARTO jurisdictions)',
    summary:
      'Complete guide to applying for a Learner Licence (LL) via contactless Aadhaar e-KYC on Sarathi Parivahan, upgrading to a Permanent Driving Licence after 30 days, passing the ARTO driving track test, and renewing expired licences.',
    tableOfContents: [
      'Contactless Learner Licence via Aadhaar e-KYC',
      'Mandatory Age, Medical Form 1/1A & Vehicle Classes (MCWG / LMV)',
      'Permanent DL Application & ARTO Track Slot Booking',
      'Renewal, Address Change & Duplicate DL Services',
      'Step-by-Step Parivahan Portal Walkthrough',
    ],
    sections: [
      {
        heading: '1. Contactless Learner Licence via Aadhaar e-KYC',
        content:
          'Under MoRTH contactless services integrated with Jammu & Kashmir RTOs/ARTOs (such as ARTO Anantnag, RTO Kashmir Srinagar, ARTO Kulgam, RTO Jammu), applicants using Aadhaar OTP authentication can apply for a Learner Licence (LL) and take the road-signs online stall test directly from home or an authorized facilitation desk after watching the mandatory road-safety tutorial.',
        bulletPoints: [
          'Minimum age is 18 years for standard MCWG (geared two-wheeler) and LMV (car/jeep) [VERIFY 16-year gearless 50cc parental consent rule if needed].',
          'A Learner Licence remains valid for 6 months; you can apply for Permanent Driving Licence only after completing at least 30 days from LL issue date.',
        ],
      },
      {
        heading: '2. Medical Form 1, Form 1A & ARTO Track Test Preparation',
        content:
          'Applicants under 40 years applying for non-transport categories submit self-declaration Form 1 online, whereas applicants aged 40 years or above (or applying for transport/commercial badges) must upload Medical Certificate Form 1A signed by an authorized MBBS doctor on the Parivahan Medical dashboard [VERIFY current J&K RTO Form 1A age threshold and prescribed LL/DL fee table]. On your Permanent DL appointment day, bring your own road-worthy vehicle with valid RC, Insurance, and PUC to the ARTO testing track.',
        tips: 'Practice reverse-S / 8-figure track manoeuvres cleanly and carry printed Application Form, Fee Receipt, LL copy, and original Aadhaar on test day.',
      },
    ],
    eligibility: [
      'Age 18 years or above for MCWG and LMV non-transport licences',
      'Valid residential proof under concerned J&K RTO / ARTO jurisdiction (Aadhaar preferred for contactless mode)',
      'Mandatory 30-day holding period with active Learner Licence before Permanent DL track test',
    ],
    documentsRequired: [
      'Aadhaar Card with active mobile number for OTP e-KYC',
      'Age Proof (Class 10 Certificate / Birth Certificate / Passport / PAN)',
      'Passport-size Photograph & Scanned Signature (white background)',
      'Form 1 Self-Declaration / Form 1A Medical Certificate (if aged 40+ or transport category)',
      'Original Valid Vehicle RC, Insurance & PUC on Permanent DL track test date',
    ],
    stepByStep: [
      'Visit parivahan.gov.in -> Sarathi (Driving Licence Related Services) -> select State: Jammu and Kashmir.',
      'Click Apply for Learner Licence -> choose Submit via Aadhaar Authentication (or non-Aadhaar RTO visit).',
      'Verify Aadhaar OTP, select vehicle classes (MCWG / LMV), fill personal details, and upload photograph/signature/Form 1A if applicable.',
      'Pay prescribed Learner Licence + LL Test fee online, watch the mandatory road safety video, and pass the online road-signs quiz.',
      'After 30 days (and within 180 days), log back in -> Apply for Driving Licence -> book your ARTO Driving Test slot and appear with originals.',
    ],
    faqs: [
      {
        question: 'Can I take the Learner Licence online test from home or a CSC centre?',
        answer:
          'Yes, if you apply via Aadhaar e-KYC mode on sarathi.parivahan.gov.in, the online road-signs tutorial and proctored test can be taken without visiting the ARTO office [VERIFY camera/device requirements before starting].',
      },
      {
        question: 'What happens if my Learner Licence expires before I pass the track test?',
        answer:
          'An expired Learner Licence cannot be extended into a Permanent DL; you must apply for a fresh/expired LL re-issue on Sarathi and clear the LL step again [VERIFY exact fee for expired LL].',
      },
    ],
  },
];

export const PUBLISHED_GUIDE_ARTICLES: GuideArticle[] = GUIDE_ARTICLES.filter(
  (guide) => guide.status !== 'draft'
);

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
