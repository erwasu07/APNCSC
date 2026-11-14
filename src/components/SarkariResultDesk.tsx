import React from 'react';
import type { SarkariItem } from '../data/sarkariData';
import SarkariListPage from './list/SarkariListPage';

interface SarkariResultDeskProps {
  onApplyService: (serviceName: string) => void;
  selectedService?: string;
  onOpenDedicatedPage?: (item: SarkariItem) => void;
  mode?: 'all' | 'jobs' | 'education';
  initialTab?: 'all' | 'jkssb' | 'banking_jobs' | 'jobs' | 'admissions' | 'exam_forms' | 'cluster_univ' | 'ignou' | 'ssc_jobs' | 'rrb_jobs' | 'army_jobs';
  educationSubRoute?: boolean;
  onNavigateRoute?: (path: string) => void;
}

export interface PostCompletionDoc {
  name: string;
  category: string;
  description: string;
}

export const getPostCompletionRequiredDocs = (serviceVal?: string, customText?: string): PostCompletionDoc[] => {
  const service = (serviceVal || customText || '').toLowerCase();

  // If PAN card
  if (service.includes('pan')) {
    return [
      { name: 'Recent Passport Size Color Photographs (2 Copies)', category: 'Photo Proof', description: '2 recent passport size photos with clear white background.' },
      { name: 'Applicant Signature Specimen Scan', category: 'Signature', description: 'Clear signature in dark ink on clean white paper.' },
      { name: 'Date of Birth Proof (Optional)', category: 'DOB Proof', description: '10th marksheet or Birth certificate if required for verification.' }
    ];
  }

  // If State certificates (Domicile, Caste, Income)
  if (service.includes('caste') || service.includes('income') || service.includes('domicile') || service.includes('certificate')) {
    return [
      { name: 'Parents PRC / Domicile Certificate Copy', category: 'State Domicile', description: 'Permanent Resident Certificate or Domicile of parents/guardian.' },
      { name: 'Tehsildar / Revenue Income Verification Report', category: 'Income Proof', description: 'Mandatory for Income Certificate & EWS/OBC-NCL processing.' },
      { name: 'Ration Card / Electricity Bill Copy', category: 'Address Proof', description: 'Current residence verification document.' },
      { name: 'Passport Size Photographs (2 Copies)', category: 'Photo Proof', description: 'Recent color photographs of the applicant.' }
    ];
  }

  // If Ayushman / Golden card
  if (service.includes('ayushman') || service.includes('golden card')) {
    return [
      { name: 'Ration Card (NFSA / Ration Booklet Copy)', category: 'Family Record', description: 'Ration card displaying applicant and family members names.' },
      { name: 'PM-JAY Family Letter / HHID Slip (if available)', category: 'Scheme ID', description: 'PM-JAY eligibility letter or registered mobile number.' }
    ];
  }

  // If PM Kisan / Agriculture
  if (service.includes('kisan') || service.includes('pm kisan')) {
    return [
      { name: 'Revenue Land Records (Khatauni / Jamabandi / B-1)', category: 'Land Record', description: 'Certified land holding revenue passbook copy.' },
      { name: 'Bank Passbook Front Page Copy', category: 'Banking DBT', description: 'Clear copy displaying Account Number and IFSC Code.' }
    ];
  }

  // If Jobs / Recruitment / Exams / Admissions / University
  if (
    service.includes('job') ||
    service.includes('recruitment') ||
    service.includes('rrb') ||
    service.includes('ssc') ||
    service.includes('army') ||
    service.includes('jkssb') ||
    service.includes('exam') ||
    service.includes('admission') ||
    service.includes('university') ||
    service.includes('cluster')
  ) {
    return [
      { name: '10th / Matriculation Marksheet & Passing Certificate', category: 'Educational Proof', description: 'Proof of Date of Birth and matriculation marks.' },
      { name: '12th (Higher Secondary) Marksheet / Diploma Certificate', category: 'Educational Proof', description: 'Required for 10+2 level recruitment and undergraduate admissions.' },
      { name: 'Graduation / Degree Semester Marksheets & Degree Certificate', category: 'Higher Qualification', description: 'Required for Graduate level notifications (CGL, RRB JE, NTPC, etc.).' },
      { name: 'Passport Size Photograph (Recent, White Background)', category: 'Digital Photo', description: 'Digital photo file (20KB - 50KB) as per recruitment board dimensions.' },
      { name: 'Applicant Signature Scan', category: 'Digital Signature', description: 'Scanned signature on plain white paper with black/blue pen.' },
      { name: 'Category / Caste Certificate (SC/ST/OBC/EWS)', category: 'Reservation Proof', description: 'Valid certificate issued by competent revenue authority (if claiming quota).' },
      { name: 'J&K Domicile / PRC Certificate', category: 'Domicile Quota', description: 'Mandatory for JKSSB and UT-level recruitment vacancies.' }
    ];
  }

  // General / Default for all other services
  return [
    { name: 'Educational Marksheets / Certificates (10th/12th/Degree)', category: 'Academic Proof', description: 'Relevant qualification certificate if applying for exams or courses.' },
    { name: 'Recent Passport Size Color Photographs', category: 'Photo Proof', description: 'Clean color photo with plain white background.' },
    { name: 'Applicant Signature Specimen Scan', category: 'Signature', description: 'Signed in black/blue ink on clean white paper.' },
    { name: 'Category / Domicile Certificate (if applicable)', category: 'State / Quota', description: 'Valid SC/ST/OBC/EWS/Domicile certificate for quota benefits.' },
    { name: 'Bank Passbook / Secondary Supporting Slip', category: 'Financial / Reference', description: 'For direct benefit transfer or official fee refunds.' }
  ];
};

export interface DocumentTypeConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  accept: string;
}

export const DOCUMENT_TYPE_CONFIGS: Record<string, DocumentTypeConfig> = {
  aadhaar: {
    id: 'aadhaar',
    name: 'Aadhaar Card / Govt Identity Proof',
    shortName: 'Aadhaar Card',
    description: 'Clear copy of Aadhaar Card, Voter ID, or Passport (PDF/JPG, Max 10MB)',
    accept: '.pdf,.jpg,.jpeg,.png'
  },
  marksheet: {
    id: 'marksheet',
    name: 'Educational Marksheet (10th/12th/Graduation)',
    shortName: 'Educational Marksheet',
    description: '10th, 12th or Graduation Certificate / Marksheet (PDF/JPG, Max 10MB)',
    accept: '.pdf,.jpg,.jpeg,.png'
  },
  photo: {
    id: 'photo',
    name: 'Passport Size Photo & Signature Scan',
    shortName: 'Passport Photo & Signature',
    description: 'Recent passport size photo and scanned signature image (JPG/PNG, Max 10MB)',
    accept: '.jpg,.jpeg,.png'
  },
  signature: {
    id: 'signature',
    name: 'Signature Specimen Scan',
    shortName: 'Signature Scan',
    description: 'Scanned signature on plain white paper (JPG/PNG, Max 10MB)',
    accept: '.jpg,.jpeg,.png'
  },
  caste: {
    id: 'caste',
    name: 'Category / Caste Certificate (if applicable)',
    shortName: 'Caste Certificate',
    description: 'Valid SC / ST / OBC / EWS Caste or Sub-caste Certificate (PDF/JPG, Max 10MB)',
    accept: '.pdf,.jpg,.jpeg,.png'
  },
  income: {
    id: 'income',
    name: 'Income Certificate / Proof',
    shortName: 'Income Certificate',
    description: 'Latest Govt issued Income Certificate or Salary Slip (PDF/JPG, Max 10MB)',
    accept: '.pdf,.jpg,.jpeg,.png'
  },
  address_proof: {
    id: 'address_proof',
    name: 'Valid Address Proof Document',
    shortName: 'Address Proof',
    description: 'Electricity bill, Domicile certificate, Voter ID or Bank Passbook (PDF/JPG, Max 10MB)',
    accept: '.pdf,.jpg,.jpeg,.png'
  },
  bank_passbook: {
    id: 'bank_passbook',
    name: 'Bank Passbook / Statement Copy',
    shortName: 'Bank Passbook',
    description: 'Front page displaying Account Number & IFSC code (PDF/JPG, Max 10MB)',
    accept: '.pdf,.jpg,.jpeg,.png'
  },
  land: {
    id: 'land',
    name: 'Land Registry Copy (Khatauni / B-1)',
    shortName: 'Land Registry Copy',
    description: 'Verified revenue land record or Khatauni copy (PDF/JPG, Max 10MB)',
    accept: '.pdf,.jpg,.jpeg,.png'
  },
  ration: {
    id: 'ration',
    name: 'Ration Card / PM Letter Copy',
    shortName: 'Ration Card',
    description: 'Copy of Ration Card or PM-JAY eligibility letter (PDF/JPG, Max 10MB)',
    accept: '.pdf,.jpg,.jpeg,.png'
  },
  other_doc: {
    id: 'other_doc',
    name: 'Relevant Application Supporting Document',
    shortName: 'Supporting Document',
    description: 'Any relevant supporting document or reference slip (PDF/JPG, Max 10MB)',
    accept: '.pdf,.jpg,.jpeg,.png'
  }
};

export const SERVICE_DOCUMENT_MAP: Record<string, string[]> = {
  // CSC Services
  'csc-pan': ['aadhaar', 'photo', 'signature'],
  'New PAN Card Application': ['aadhaar', 'photo', 'signature'],

  'csc-aadhaar': ['aadhaar', 'address_proof'],
  'Aadhaar Card Update Assistance': ['aadhaar', 'address_proof'],

  'csc-voter': ['aadhaar', 'photo', 'address_proof'],
  'Voter ID Card Services': ['aadhaar', 'photo', 'address_proof'],

  'csc-ayushman': ['aadhaar', 'ration'],
  'Ayushman Bharat Golden Card': ['aadhaar', 'ration'],

  'csc-pmkisan': ['aadhaar', 'land', 'bank_passbook'],
  'PM Kisan Registration & e-KYC': ['aadhaar', 'land', 'bank_passbook'],

  'csc-eshram': ['aadhaar', 'bank_passbook'],
  'e-Shram & Labour Card': ['aadhaar', 'bank_passbook'],

  'csc-certificates': ['aadhaar', 'address_proof', 'income', 'caste'],
  'State Certificates (Caste/Income/Domicile)': ['aadhaar', 'address_proof', 'income', 'caste'],

  'csc-ration': ['aadhaar', 'photo', 'income'],
  'New Ration Card & Corrections': ['aadhaar', 'photo', 'income'],

  'csc-passport': ['aadhaar', 'marksheet', 'bank_passbook', 'address_proof'],
  'Passport Application Filing': ['aadhaar', 'marksheet', 'bank_passbook', 'address_proof'],

  'csc-dl': ['aadhaar', 'marksheet', 'address_proof'],
  'Driving Licence Services': ['aadhaar', 'marksheet', 'address_proof'],

  'csc-utility': [],
  'Utility Bill Payments & Recharges': [],

  // Digital Services
  'dig-print': ['other_doc'],
  'B&W / Color Printing & Scanning': ['other_doc'],

  'dig-photo': ['photo'],
  'Passport Size Photos & Editing': ['photo'],

  'dig-form': ['marksheet', 'other_doc'],
  'Professional Resume & Typing Services': ['marksheet', 'other_doc'],

  // Education Services
  'edu-admissions': ['aadhaar', 'marksheet', 'photo', 'caste'],
  'School & College Admissions': ['aadhaar', 'marksheet', 'photo', 'caste'],

  'other': ['aadhaar', 'other_doc']
};

export default function SarkariResultDesk({
  onApplyService,
  onOpenDedicatedPage,
  mode = 'all',
  initialTab,
  educationSubRoute = false,
  onNavigateRoute,
}: SarkariResultDeskProps) {
  return (
    <SarkariListPage
      mode={mode}
      initialTab={initialTab}
      educationSubRoute={educationSubRoute}
      onNavigateRoute={onNavigateRoute}
      onOpenDedicatedPage={onOpenDedicatedPage}
      onApplyService={onApplyService}
    />
  );
}
