export interface ServiceItem {
  id: string;
  name: string;
  category: 'csc' | 'digital' | 'education' | 'business';
  description: string;
  requirements: string[];
  estimatedTime: string;
  popular?: boolean;
}

export const CATEGORY_LABELS = {
  csc: 'CSC Government Services',
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
    popular: true
  },
  {
    id: 'csc-aadhaar',
    name: 'Aadhaar Card Update Assistance',
    category: 'csc',
    description: 'Demographic updates (Name, Address, DOB, Gender, Mobile Number) and photo verification guidance.',
    requirements: ['Aadhaar Card', 'Valid Address/ID Proof (e.g., Voter ID, Passport, Bank Passbook)'],
    estimatedTime: '2 - 5 Days',
    popular: true
  },
  {
    id: 'csc-voter',
    name: 'Voter ID Card Services',
    category: 'csc',
    description: 'Apply for a new Voter ID card, make corrections, shift assembly constituencies, or request PVC card printing.',
    requirements: ['Aadhaar Card', 'Age Proof', 'Passport Size Photo', 'Address Proof'],
    estimatedTime: '15 - 30 Days'
  },
  {
    id: 'csc-ayushman',
    name: 'Ayushman Bharat Golden Card',
    category: 'csc',
    description: 'Check eligibility and register for free ₹5 Lakh health insurance cover under PM-JAY scheme.',
    requirements: ['Aadhaar Card', 'Ration Card / PM Letter'],
    estimatedTime: 'Same Day'
  },
  {
    id: 'csc-pmkisan',
    name: 'PM Kisan Registration & e-KYC',
    category: 'csc',
    description: 'Apply for farmer registration under PM Kisan Samman Nidhi Yojana and mandatory e-KYC updates.',
    requirements: ['Aadhaar Card', 'Land Registry Copy (Khatauni)', 'Bank Passbook Copy'],
    estimatedTime: 'Same Day'
  },
  {
    id: 'csc-eshram',
    name: 'e-Shram & Labour Card',
    category: 'csc',
    description: 'Registration for unorganized sector workers to secure central government accident insurance and social benefits.',
    requirements: ['Aadhaar Card', 'Bank Account Number', 'Mobile Number'],
    estimatedTime: 'Same Day'
  },
  {
    id: 'csc-certificates',
    name: 'State Certificates (Caste/Income/Domicile)',
    category: 'csc',
    description: 'Authorized state-level applications for Caste, Domicile, Income, Marriage, Birth, Death, and Character Certificates.',
    requirements: ['Aadhaar Card', 'Ration Card Copy', 'Self-Declaration Form', 'Address Proof'],
    estimatedTime: '7 - 15 Days',
    popular: true
  },
  {
    id: 'csc-ration',
    name: 'New Ration Card & Corrections',
    category: 'csc',
    description: 'Apply for a new digital ration card, add or delete family member names, and address updates.',
    requirements: ['Aadhaar Cards of all members', 'Head of Family Photo', 'Income Proof'],
    estimatedTime: '15 - 30 Days'
  },
  {
    id: 'csc-passport',
    name: 'Passport Application Filing',
    category: 'csc',
    description: 'Online registration for fresh passports, renewals, tatkaal services, and appointment booking at PSK.',
    requirements: ['Aadhaar Card', '10th Marksheet/Non-ECR Proof', 'Bank Statement', 'Address Proof'],
    estimatedTime: 'Appointment booked in 24h'
  },
  {
    id: 'csc-dl',
    name: 'Driving Licence Services',
    category: 'csc',
    description: 'Apply for fresh learners licence, permanent driving licence, DL renewal, duplicate copy, or address changes.',
    requirements: ['Age Proof (10th pass/Aadhaar)', 'Address Proof', 'Physical Fitness Declaration'],
    estimatedTime: 'Slot Booking same day'
  },
  {
    id: 'csc-utility',
    name: 'Utility Bill Payments & Recharges',
    category: 'csc',
    description: 'Instant payments for electricity bills, water bills, gas cylinders, mobile/DTH, FASTag recharges, and premium insurance payments.',
    requirements: ['Consumer ID / Policy Number', 'Mobile Number'],
    estimatedTime: 'Instant Credit',
    popular: true
  },

  // Digital Services
  {
    id: 'dig-print',
    name: 'B&W / Color Printing & Scanning',
    category: 'digital',
    description: 'High-quality laser printing, document scanning (PDF/JPG formats), and thick-pouch lamination up to A3 size.',
    requirements: ['Soft Copy via WhatsApp, Email, or USB Drive'],
    estimatedTime: 'Instant'
  },
  {
    id: 'dig-photo',
    name: 'Passport Size Photos & Editing',
    category: 'digital',
    description: 'Instant professional passport photo capture, digital background replacement, skin tone touchups, and physical sheets printing.',
    requirements: ['Physical presence for photo or digital file'],
    estimatedTime: '5 Minutes',
    popular: true
  },
  {
    id: 'dig-form',
    name: 'Professional Resume & Typing Services',
    category: 'digital',
    description: 'Design interactive resumes, document editing, PDF combining, and precise typing in Hindi, English, or regional languages.',
    requirements: ['Handwritten Draft or legacy CV', 'Educational Details'],
    estimatedTime: '15 - 30 Minutes'
  },

  // Education Services
  {
    id: 'edu-admissions',
    name: 'School & College Admissions',
    category: 'education',
    description: 'Admissions application support for schools, open universities (e.g., IGNOU, DU SOL), and local colleges.',
    requirements: ['Previous Year Marksheets', 'Category Certificate (if applicable)', 'Photo', 'ID Proof'],
    estimatedTime: 'Same Day'
  },
  {
    id: 'edu-scholarship',
    name: 'National & State Scholarship Forms',
    category: 'education',
    description: 'Secure application filling for national (NSP) and state e-kalyan scholarships for minor, SC/ST, and OBC candidates.',
    requirements: ['Aadhaar Card', 'Previous Class Marksheet', 'Income Certificate', 'Caste Certificate', 'Bank Passbook'],
    estimatedTime: '1 - 2 Hours'
  },
  {
    id: 'edu-exams',
    name: 'Competitive Exam & Admit Card Downloads',
    category: 'education',
    description: 'Filing for central/state exams (SSC, UPSC, Banking, NEET, JEE) and instant colorful admit card downloads.',
    requirements: ['Academic Credentials', 'Signature Scans', 'Photo Scans'],
    estimatedTime: '20 Minutes',
    popular: true
  },

  // Business Services
  {
    id: 'biz-gst',
    name: 'GST Registration & Return Assistance',
    category: 'business',
    description: 'File applications for new GST registration and prepare files for monthly or quarterly GSTR filing.',
    requirements: ['PAN Card', 'Aadhaar Card', 'Business Address Proof (Rent Agreement/Electricity Bill)'],
    estimatedTime: '3 - 5 Days'
  },
  {
    id: 'biz-udyam',
    name: 'MSME & UDYAM Business Registration',
    category: 'business',
    description: 'Register small-medium enterprises under UDYAM scheme to receive interest concessions and credit benefits.',
    requirements: ['Aadhaar Card', 'PAN Card', 'Business Name & Bank Details'],
    estimatedTime: 'Same Day'
  },
  {
    id: 'biz-dsc',
    name: 'Digital Signature Certificate (DSC)',
    category: 'business',
    description: 'Obtain Class 3 Digital Signature Certificate (DSC) for e-tendering, company registration, and trademark filing.',
    requirements: ['Aadhaar Card', 'PAN Card', 'Aadhaar-linked Mobile (OTP verification)'],
    estimatedTime: '24 Hours'
  }
];
