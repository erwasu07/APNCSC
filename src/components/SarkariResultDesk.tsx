import React, { useState, useEffect } from 'react';
import TrackApplication from './TrackApplication';
import { db } from '../lib/firebase';
import { getSupabaseClient, uploadMultipleDocumentsToSupabase } from '../lib/supabase';
import { saveApplicationToFormEndpoint } from '../lib/getform';
import { doc, setDoc } from 'firebase/firestore';
import { 
  Briefcase, 
  FileText, 
  Award, 
  Key, 
  BookOpen, 
  GraduationCap, 
  Search, 
  Clock, 
  ArrowRight, 
  X, 
  Calendar, 
  IndianRupee, 
  CheckCircle, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Info,
  AlertCircle,
  User,
  Smartphone,
  Mail,
  QrCode,
  Printer,
  Copy,
  Check,
  FileCheck,
  Shield,
  Bell,
  MessageSquare,
  MessageCircle,
  UploadCloud,
  Paperclip,
  CreditCard,
  Eye,
  Home,
  Building2,
  Train,
  Share2,
  Send,
  ArrowUpRight,
  Code,
  HelpCircle
} from 'lucide-react';
import { SARKARI_DATA, SARKARI_CATEGORIES, SarkariItem } from '../data/sarkariData';
import { SERVICES_LIST } from '../servicesData';
import { UploadedDocument } from '../types';

interface SarkariResultDeskProps {
  onApplyService: (serviceName: string) => void;
  selectedService?: string;
  onOpenDedicatedPage?: (item: SarkariItem) => void;
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

export const RRB_JOBS_HTML_SNIPPET = `<!-- Start: CSC Dost - RRB Jobs (rrbapply.gov.in) Section -->
<div class="csc-rrb-jobs-wrapper" style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 15px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
  
  <!-- Header Banner -->
  <div style="background: linear-gradient(135deg, #1e3a8a, #0369a1); color: #ffffff; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <h2 style="margin: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
      🚆 Railway Recruitment Board (RRB) Latest CEN Notices & Updates
    </h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">
      Verified from rrbapply.gov.in & Official Indian Railways Portals | Updated: August 07, 2026
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px;">

    <!-- Job Card 1: RRB Junior Engineer (CEN 04/2026) -->
    <div style="background: #ffffff; border-left: 5px solid #16a34a; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          RRB Junior Engineer (JE), DMS & CMA Recruitment 2026 (CEN No. 04/2026)
        </h3>
        <span style="background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">NEW ANNOUNCEMENT</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Short Notice Release:</strong> Aug 05, 2026</div>
        <div><strong>Detailed Notification:</strong> Aug 13, 2026</div>
        <div><strong>Application Window:</strong> <span style="color: #2563eb; font-weight: 600;">Aug 14, 2026 to Sep 13, 2026</span></div>
        <div><strong>Total Vacancies:</strong> 4,098 Posts</div>
        <div><strong>Eligibility:</strong> Engineering Diploma / B.E. / B.Tech / B.Sc (Chem/Phys)</div>
        <div><strong>Posts Included:</strong> Junior Engineer (JE), DMS, CMA</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.rrbapply.gov.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Apply Portal (rrbapply.gov.in) →
        </a>
        <a href="https://indianrailways.gov.in/" target="_blank" rel="noopener noreferrer" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Check Official CEN
        </a>
      </div>
    </div>

    <!-- Job Card 2: RRB Section Controller (CEN 03/2026) -->
    <div style="background: #ffffff; border-left: 5px solid #2563eb; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          RRB Section Controller Recruitment 2026 (CEN No. 03/2026)
        </h3>
        <span style="background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">ACTIVE NOW</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Application Start:</strong> July 15, 2026</div>
        <div><strong>Last Date to Apply:</strong> <span style="color: #dc2626; font-weight: 600;">Aug 14, 2026</span></div>
        <div><strong>Fee Payment Last Date:</strong> Aug 16, 2026</div>
        <div><strong>Correction Window:</strong> Aug 17 to Aug 26, 2026</div>
        <div><strong>Vacancies:</strong> 119 Posts</div>
        <div><strong>Eligibility:</strong> Bachelor's Degree in any discipline from recognized University</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.rrbapply.gov.in/#/auth/landing" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Apply Online Now →
        </a>
      </div>
    </div>

    <!-- Job Card 3: RRB Group D CBT Exam Schedule (CEN 09/2025) -->
    <div style="background: #ffffff; border-left: 5px solid #d97706; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          RRB Group D (Level-1) CBT Examination & City Intimation (CEN No. 09/2025)
        </h3>
        <span style="background: #fef3c7; color: #b45309; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">EXAM NOTICE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>City Intimation Slip:</strong> Live on Portal (August Shifts)</div>
        <div><strong>CBT Exam Dates:</strong> <span style="color: #16a34a; font-weight: 600;">Aug 03, 2026 to Aug 25, 2026</span></div>
        <div><strong>Total Vacancies:</strong> 22,195 Posts (Level-1 Trackman/Pointsman)</div>
        <div><strong>Admit Card Download:</strong> 4 Days prior to candidate's exam date</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.rrbapply.gov.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Check Exam City & Slip →
        </a>
      </div>
    </div>

    <!-- Job Card 4: RRB Technician Modification Window (CEN 02/2026) -->
    <div style="background: #ffffff; border-left: 5px solid #9333ea; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          RRB Technician (Grade 1 Signal & Grade 3) Application Correction Window
        </h3>
        <span style="background: #f3e8ff; color: #6b21a8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">CORRECTION ACTIVE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Correction Window Dates:</strong> <span style="color: #dc2626; font-weight: 600;">Aug 01 to Aug 10, 2026</span></div>
        <div><strong>Vacancies:</strong> 6,557 Posts</div>
        <div><strong>Notice Detail:</strong> Modification of RRB choice, photo/signature re-upload & particulars correction.</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.rrbapply.gov.in/#/auth/landing" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Modify Application →
        </a>
      </div>
    </div>

    <!-- Job Card 5: RRB NTPC & Paramedical Upcoming Alert -->
    <div style="background: #ffffff; border-left: 5px solid #0284c7; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          RRB NTPC & Paramedical Categories Recruitment Calendar 2026
        </h3>
        <span style="background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">UPCOMING ALERT</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Expected CEN Window:</strong> Mid-to-Late August 2026</div>
        <div><strong>Target Posts:</strong> Non-Technical Popular Categories (Graduate & Under-Graduate), Staff Nurse & Paramedical</div>
        <div><strong>Official Portal:</strong> rrbapply.gov.in</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.rrbapply.gov.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Visit RRB Portal
        </a>
      </div>
    </div>

  </div>
</div>
<!-- End: CSC Dost - RRB Jobs (rrbapply.gov.in) Section -->`;

export const KU_ADMISSIONS_HTML_SNIPPET = `<!-- Start: CSC Dost - KU Admissions (kashmiruniversity.net) Section -->
<div class="csc-ku-admissions-wrapper" style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 15px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
  
  <div style="background: linear-gradient(135deg, #0f766e, #0d9488); color: #ffffff; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <h2 style="margin: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
      🎓 Kashmir University (KU) Admissions, Selection Lists & Counseling Notices (August 2026)
    </h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">
      Extracted Active Admission Registration Forms, Selection Lists & Counseling Dates (kashmiruniversity.net) | Updated: August 07, 2026
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px;">

    <!-- Notice 1: KU PG 1st Selection List & Counseling Notice -->
    <div style="background: #ffffff; border-left: 5px solid #0d9488; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Kashmir University PG Admissions 2026 1st Selection List & Document Verification Counseling Notice
        </h3>
        <span style="background: #ccfbf1; color: #0f766e; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">1ST SELECTION LIST LIVE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 06, 2026</div>
        <div><strong>Counseling / Doc Verification:</strong> Aug 07 to Aug 18, 2026</div>
        <div><strong>Fee Payment Deadline:</strong> <span style="color: #dc2626; font-weight: 600;">Aug 18, 2026</span></div>
        <div><strong>Courses Included:</strong> MA (English, Urdu, Pol Sc, Hist), M.Sc, M.Com, MCA</div>
        <div><strong>Selection Basis:</strong> KUET 2026 Entrance Merit Ranks</div>
        <div><strong>Reporting Location:</strong> Respective PG Departments (Main Campus Srinagar)</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.kashmiruniversity.net/admission.aspx" target="_blank" rel="noopener noreferrer" style="background: #0d9488; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Check 1st Selection List & Print Allotment Form →
        </a>
      </div>
    </div>

    <!-- Notice 2: KU DDE Distance Mode B.Ed & MA Fresh Admissions -->
    <div style="background: #ffffff; border-left: 5px solid #2563eb; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Kashmir University DDE Distance Mode B.Ed. & MA/M.Com Fresh Admission Notification 2026-27
        </h3>
        <span style="background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">DDE ADMISSION FORM</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 05, 2026</div>
        <div><strong>Application Start Date:</strong> Aug 05, 2026</div>
        <div><strong>Last Date (Without Late Fee):</strong> <span style="color: #dc2626; font-weight: 600;">Aug 20, 2026</span></div>
        <div><strong>With Late Fee (₹500):</strong> Aug 21 to Aug 26, 2026</div>
        <div><strong>Offered Courses:</strong> B.Ed Distance Mode, MA (Eng, Urdu, Econ, Edu), M.Com</div>
        <div><strong>Eligibility:</strong> Graduation with 45% OM / 40% Reserved (B.Ed requires In-service/D.El.Ed)</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.kashmiruniversity.net/admission.aspx" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Apply Online for DDE Admission →
        </a>
      </div>
    </div>

    <!-- Notice 3: KU Ph.D. Entrance Exemption & Direct Admission Notice -->
    <div style="background: #ffffff; border-left: 5px solid #d97706; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Kashmir University Ph.D. Research Programme Entrance Exemption & Direct Admission Registration 2026
        </h3>
        <span style="background: #fef3c7; color: #b45309; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">PH.D ADMISSION</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 07, 2026</div>
        <div><strong>Registration Window:</strong> Aug 07 to Aug 25, 2026</div>
        <div><strong>Department Verification:</strong> <span style="color: #dc2626; font-weight: 600;">Aug 26 to Aug 31, 2026</span></div>
        <div><strong>Exemption Criteria:</strong> CSIR-NET / UGC-NET / GATE / JK-SET Qualified</div>
        <div><strong>Faculties:</strong> Science, Arts, Social Science, Law, Management</div>
        <div><strong>Application Fee:</strong> ₹500 Online Submission</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.kashmiruniversity.net/admission.aspx" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Ph.D Registration Portal →
        </a>
      </div>
    </div>

    <!-- Notice 4: KU BA-LLB 5-Year Integrated Course 2nd Selection List & Allotment Counseling -->
    <div style="background: #ffffff; border-left: 5px solid #9333ea; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Kashmir University BA-LLB 5-Year Integrated Law Course 2nd Selection List & Counseling Allotment 2026
        </h3>
        <span style="background: #f3e8ff; color: #6b21a8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">2ND LAW SELECTION LIST</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 06, 2026</div>
        <div><strong>Counseling / Doc Verification:</strong> Aug 08 to Aug 19, 2026</div>
        <div><strong>Fee Payment Deadline:</strong> <span style="color: #dc2626; font-weight: 600;">Aug 20, 2026</span></div>
        <div><strong>Participating Colleges:</strong> Main Campus Law Dept, Kashmir Law College & Sopore Law College</div>
        <div><strong>Eligibility:</strong> 10+2 with minimum 45% OM / 40% SC/ST</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.kashmiruniversity.net/admission.aspx" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Check 2nd BA-LLB Selection List →
        </a>
      </div>
    </div>

    <!-- Notice 5: KU PG Diploma & Certificate Courses Online Admission -->
    <div style="background: #ffffff; border-left: 5px solid #0284c7; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Kashmir University 1-Year PG Diploma & Certificate Courses Online Admission Notification 2026
        </h3>
        <span style="background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">DIPLOMA & CERTIFICATE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 05, 2026</div>
        <div><strong>Application Start Date:</strong> Aug 05, 2026</div>
        <div><strong>Last Date to Apply:</strong> <span style="color: #dc2626; font-weight: 600;">Aug 22, 2026</span></div>
        <div><strong>Courses:</strong> PG Diploma Cyber Law, Web Design, Data Analytics, French/German/Russian</div>
        <div><strong>Selection Basis:</strong> Academic Merit of Qualifying Exam</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.kashmiruniversity.net/admission.aspx" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Apply for Diploma / Certificate →
        </a>
      </div>
    </div>

  </div>
</div>
<!-- End: CSC Dost - KU Admissions (kashmiruniversity.net) Section -->`;

export const KU_EXAM_FORMS_HTML_SNIPPET = `<!-- Start: CSC Dost - KU Exam Forms (kashmiruniversity.net) Section -->
<div class="csc-ku-exam-forms-wrapper" style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 15px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
  
  <div style="background: linear-gradient(135deg, #78350f, #b45309); color: #ffffff; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <h2 style="margin: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
      📜 Kashmir University (KU) Online Examination Forms & Fee Submission (August 2026)
    </h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">
      Verified Active Notices from Examination Wing & e-Gov Portal (kashmiruniversity.net) | Updated: August 07, 2026
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px;">

    <!-- Notice 1: KU UG BG 4th Sem Exam Form -->
    <div style="background: #ffffff; border-left: 5px solid #16a34a; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Kashmir University UG BG 4th Semester (NEP 2020 Batch 2024 & CBCS Backlog) Online Exam Form 2026
        </h3>
        <span style="background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">UG EXAM FORM LIVE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 06, 2026</div>
        <div><strong>Submission Start Date:</strong> Aug 06, 2026</div>
        <div><strong>Last Date (Without Late Fee):</strong> <span style="color: #dc2626; font-weight: 600;">Aug 22, 2026</span></div>
        <div><strong>With Late Fee (₹500):</strong> Aug 23 to Aug 28, 2026</div>
        <div><strong>Eligible Courses:</strong> BA, B.Sc, B.Com, BBA, BCA (4th Sem Regular & Backlog)</div>
        <div><strong>Fee Structure:</strong> ₹250/theory paper + ₹350 EMF + ₹275 practical</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://egov.kashmiruniversity.ac.in/" target="_blank" rel="noopener noreferrer" style="background: #059669; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Submit Exam Form Portal (egov.kashmiruniversity.ac.in) →
        </a>
        <a href="https://www.kashmiruniversity.net/Examination.aspx" target="_blank" rel="noopener noreferrer" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Download Official PDF Notice
        </a>
      </div>
    </div>

    <!-- Notice 2: KU PG 1st & 3rd Sem Exam Form -->
    <div style="background: #ffffff; border-left: 5px solid #2563eb; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Kashmir University PG (MA, M.Sc, M.Com, MCA) 1st & 3rd Semester Main & Satellite Campus Online Exam Form
        </h3>
        <span style="background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">PG EXAM FORM LIVE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 05, 2026</div>
        <div><strong>Submission Start Date:</strong> Aug 05, 2026</div>
        <div><strong>Last Date (Without Late Fee):</strong> <span style="color: #dc2626; font-weight: 600;">Aug 19, 2026</span></div>
        <div><strong>With Late Fee (₹500):</strong> Aug 20 to Aug 25, 2026</div>
        <div><strong>Campuses:</strong> Main Campus Srinagar, North Campus, South Campus & Govt PG Colleges</div>
        <div><strong>Fee Structure:</strong> ₹1,650 Complete Semester Exam Fee</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.kashmiruniversity.net/Examination.aspx" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Fill PG Exam Form Online →
        </a>
      </div>
    </div>

    <!-- Notice 3: KU B.Ed 1st & 2nd Sem Exam Form -->
    <div style="background: #ffffff; border-left: 5px solid #d97706; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Kashmir University B.Ed. (2-Year Program) 1st & 2nd Semester (Batch 2025) Online Examination Form
        </h3>
        <span style="background: #fef3c7; color: #b45309; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">B.ED EXAM FORM</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 07, 2026</div>
        <div><strong>Submission Start Date:</strong> Aug 07, 2026</div>
        <div><strong>Last Date (Without Late Fee):</strong> <span style="color: #dc2626; font-weight: 600;">Aug 24, 2026</span></div>
        <div><strong>Late Fee Window (₹100/day):</strong> Aug 25 to Aug 30, 2026</div>
        <div><strong>Institutes:</strong> Department of Education Main Campus & Affiliated Private B.Ed Colleges</div>
        <div><strong>Fee Structure:</strong> ₹250 per paper + ₹900 EMF/Hot & Cold Charges</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://egov.kashmiruniversity.ac.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Fill B.Ed Form Portal →
        </a>
      </div>
    </div>

    <!-- Notice 4: KU Professional B.Tech 4th, 6th & 8th Sem Exam Form -->
    <div style="background: #ffffff; border-left: 5px solid #9333ea; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Kashmir University Professional B.Tech / B.E. 4th, 6th & 8th Semester Online Examination Form Notice
        </h3>
        <span style="background: #f3e8ff; color: #6b21a8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">B.TECH EXAM FORM</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 06, 2026</div>
        <div><strong>Submission Start Date:</strong> Aug 06, 2026</div>
        <div><strong>Last Date (Without Late Fee):</strong> <span style="color: #dc2626; font-weight: 600;">Aug 21, 2026</span></div>
        <div><strong>With Late Fee (₹500):</strong> Aug 22 to Aug 27, 2026</div>
        <div><strong>Institutes:</strong> IOT Zakura Campus, Dept of CS Main Campus & SSM College of Engineering</div>
        <div><strong>Fee Structure:</strong> ₹350 per theory paper + ₹450 Engineering Infrastructure & IT Fee</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.kashmiruniversity.net/Examination.aspx" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Fill B.Tech Exam Form →
        </a>
      </div>
    </div>

    <!-- Notice 5: KU DDE Distance Education MA & B.Ed Term-End Exam Form -->
    <div style="background: #ffffff; border-left: 5px solid #0284c7; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Kashmir University DDE Distance Education MA & B.Ed Term-End Online Exam Form Notice
        </h3>
        <span style="background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">DISTANCE EXAM FORM</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 05, 2026</div>
        <div><strong>Submission Start Date:</strong> Aug 05, 2026</div>
        <div><strong>Last Date (Without Late Fee):</strong> <span style="color: #dc2626; font-weight: 600;">Aug 20, 2026</span></div>
        <div><strong>With Late Fee (₹500):</strong> Aug 21 to Aug 26, 2026</div>
        <div><strong>Courses:</strong> Directorate of Distance Education MA (English, Urdu, Econ, Edu) & DDE B.Ed</div>
        <div><strong>Fee Structure:</strong> ₹300 per subject paper + ₹400 DDE Maintenance Fee</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://egov.kashmiruniversity.ac.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Fill DDE Exam Form Portal →
        </a>
      </div>
    </div>

  </div>
</div>
<!-- End: CSC Dost - KU Exam Forms (kashmiruniversity.net) Section -->`;

export const CLUSTER_UNIV_HTML_SNIPPET = `<!-- Start: CSC Dost - Cluster University Srinagar (cusrinagar.edu.in) Section -->
<div class="csc-cluster-univ-wrapper" style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 15px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
  
  <div style="background: linear-gradient(135deg, #064e3b, #0f766e); color: #ffffff; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <h2 style="margin: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
      🏫 Cluster University Srinagar (CUS) Admissions & Examination Updates (August 2026)
    </h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">
      Verified from Official Portal & Notice Board (cusrinagar.edu.in) | Updated: August 07, 2026
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px;">

    <!-- Notice 1: CUS UG 3rd & 5th Semester Examination Forms -->
    <div style="background: #ffffff; border-left: 5px solid #16a34a; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          CUS UG 3rd & 5th Semester NEP-2020 Online Examination Form Submission Notice 2026
        </h3>
        <span style="background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">EXAM FORM LIVE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 06, 2026</div>
        <div><strong>Form Submission Start:</strong> Aug 06, 2026</div>
        <div><strong>Last Date (Without Late Fee):</strong> <span style="color: #dc2626; font-weight: 600;">Aug 20, 2026</span></div>
        <div><strong>With Late Fee (₹500):</strong> Aug 21 to Aug 25, 2026</div>
        <div><strong>Eligible Batches:</strong> Regular & Backlog UG 3rd & 5th Semester (Batch 2023 & 2024)</div>
        <div><strong>Constituent Colleges:</strong> Amar Singh, SP College, Women's College MA Road, AAAM Bemina, IASE</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.cusrinagar.edu.in/" target="_blank" rel="noopener noreferrer" style="background: #059669; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Submit Exam Form Portal →
        </a>
        <a href="https://www.cusrinagar.edu.in/" target="_blank" rel="noopener noreferrer" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Official Notice PDF
        </a>
      </div>
    </div>

    <!-- Notice 2: CUS PG & Integrated 1st Semester Spot Round Admissions -->
    <div style="background: #ffffff; border-left: 5px solid #2563eb; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          CUS PG & 5-Year Integrated 1st Semester Spot Round Counseling & Online Registration
        </h3>
        <span style="background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">SPOT ADMISSION ACTIVE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 05, 2026</div>
        <div><strong>Registration Window:</strong> <span style="color: #16a34a; font-weight: 600;">Aug 05, 2026 to Aug 18, 2026</span></div>
        <div><strong>Document Verification at College:</strong> Aug 19 to Aug 22, 2026</div>
        <div><strong>Courses Included:</strong> M.Sc, M.A, M.Com, MCA, Integrated B.Sc-M.Sc & B.A-M.A</div>
        <div><strong>Eligibility:</strong> CUSET 2026 Qualified or Academic Merit Merit List Holders</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.cusrinagar.edu.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Apply for Spot Admission →
        </a>
      </div>
    </div>

    <!-- Notice 3: CUS B.Ed / M.Ed Exam Form Notice -->
    <div style="background: #ffffff; border-left: 5px solid #d97706; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          CUS B.Ed & M.Ed 2-Year Program Examination Form & Online Fee Schedule 2026
        </h3>
        <span style="background: #fef3c7; color: #b45309; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">TEACHER ED EXAM</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 07, 2026</div>
        <div><strong>Form Submission Start:</strong> Aug 07, 2026</div>
        <div><strong>Last Date to Apply:</strong> <span style="color: #dc2626; font-weight: 600;">Aug 24, 2026</span></div>
        <div><strong>Late Fee Window (₹100/day):</strong> Aug 25 to Aug 28, 2026</div>
        <div><strong>Institute:</strong> Institute of Advanced Studies in Education (IASE Govt College of Education)</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.cusrinagar.edu.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Student Zone Form Portal →
        </a>
      </div>
    </div>

    <!-- Notice 4: CUS UG 1st Sem Self-Registration -->
    <div style="background: #ffffff; border-left: 5px solid #9333ea; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          CUS UG 1st Semester (Batch 2026) Online Self-Registration & Document Verification Notice
        </h3>
        <span style="background: #f3e8ff; color: #6b21a8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">NEW BATCH 2026</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Public Notice Date:</strong> Aug 06, 2026</div>
        <div><strong>Self-Registration Period:</strong> <span style="color: #16a34a; font-weight: 600;">Aug 06 to Aug 21, 2026</span></div>
        <div><strong>Physical Verification at College:</strong> Aug 22 to Aug 28, 2026</div>
        <div><strong>Classes Commencement:</strong> September 01, 2026</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.cusrinagar.edu.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Student Self-Registration →
        </a>
      </div>
    </div>

    <!-- Notice 5: CUS UG Re-evaluation Notice -->
    <div style="background: #ffffff; border-left: 5px solid #0284c7; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          CUS Division of Examination - Online Re-evaluation Form for UG 2nd & 4th Semester Results
        </h3>
        <span style="background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">RE-EVALUATION LIVE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notice Date:</strong> Aug 05, 2026</div>
        <div><strong>Re-evaluation Application Window:</strong> <span style="color: #dc2626; font-weight: 600;">Aug 05 to Aug 17, 2026</span></div>
        <div><strong>Re-evaluation Fee:</strong> ₹500 per paper / answer script copy</div>
        <div><strong>Scope:</strong> UG 2nd & 4th Semester Examination Results</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.cusrinagar.edu.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Apply Re-evaluation Online →
        </a>
      </div>
    </div>

  </div>
</div>
<!-- End: CSC Dost - Cluster University Srinagar (cusrinagar.edu.in) Section -->`;

export const NTA_EXAMS_HTML_SNIPPET = `<!-- Start: CSC Dost - NTA Entrance Exams (nta.ac.in) Section -->
<div class="csc-nta-exams-wrapper" style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 15px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
  
  <div style="background: linear-gradient(135deg, #701a75, #4c1d95); color: #ffffff; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <h2 style="margin: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
      🎓 National Testing Agency (NTA) Latest Entrance Exams & Public Notices (August 2026)
    </h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">
      Verified from Notice Board & Active Examinations (nta.ac.in) | Updated: August 07, 2026
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px;">

    <!-- Exam Notice 1: UGC NET Dec 2026 -->
    <div style="background: #ffffff; border-left: 5px solid #16a34a; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          NTA UGC NET December 2026 Session Public Notice & Application Schedule
        </h3>
        <span style="background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">NEW REGISTRATION</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Public Notice Date:</strong> Aug 06, 2026</div>
        <div><strong>Application Start Date:</strong> Aug 06, 2026</div>
        <div><strong>Last Date to Apply:</strong> <span style="color: #dc2626; font-weight: 600;">Sep 05, 2026 (23:50 Hrs)</span></div>
        <div><strong>Exam Dates:</strong> <span style="color: #2563eb; font-weight: 600;">Dec 01 to Dec 15, 2026</span></div>
        <div><strong>Eligibility:</strong> Master's Degree (Min 55% Marks / 50% for reserved category)</div>
        <div><strong>Courses/Scope:</strong> JRF & Assistant Professor across 83 Subjects</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://ugcnet.nta.ac.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Apply Online Portal (ugcnet.nta.ac.in) →
        </a>
        <a href="https://www.nta.ac.in/" target="_blank" rel="noopener noreferrer" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Download Official PDF Notice
        </a>
      </div>
    </div>

    <!-- Exam Notice 2: JEE Main 2027 Session-1 -->
    <div style="background: #ffffff; border-left: 5px solid #2563eb; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          NTA JEE (Main) 2027 Session-1 Exam Calendar & Preliminary Public Notice
        </h3>
        <span style="background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">EXAM CALENDAR</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notice Date:</strong> Aug 05, 2026</div>
        <div><strong>Expected Registration Start:</strong> Oct 25, 2026</div>
        <div><strong>Session-1 Exam Dates:</strong> <span style="color: #2563eb; font-weight: 600;">Jan 21 to Jan 30, 2027</span></div>
        <div><strong>Eligibility:</strong> Class 12th Pass (2025/2026) or Appearing in 2027</div>
        <div><strong>Streams:</strong> B.E. / B.Tech (Paper 1), B.Arch (2A), B.Planning (2B)</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://jeemain.nta.ac.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Visit JEE Main Portal (jeemain.nta.ac.in) →
        </a>
      </div>
    </div>

    <!-- Exam Notice 3: NEET UG 2026 Counselling Notice -->
    <div style="background: #ffffff; border-left: 5px solid #d97706; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          NTA NEET UG 2026 Medical Counselling Data Verification Public Notice
        </h3>
        <span style="background: #fef3c7; color: #b45309; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">COUNSELLING NOTICE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Public Notice Date:</strong> Aug 06, 2026</div>
        <div><strong>Verification Portal Active:</strong> Aug 06 to Aug 20, 2026</div>
        <div><strong>Scope:</strong> MBBS, BDS, BAMS, BHMS & B.Sc Nursing AIQ/State Seats</div>
        <div><strong>Eligibility:</strong> NEET (UG) 2026 Qualified Candidates</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://neet.ntaonline.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Check NEET Portal (neet.ntaonline.in) →
        </a>
      </div>
    </div>

    <!-- Exam Notice 4: CSIR UGC NET Dec 2026 -->
    <div style="background: #ffffff; border-left: 5px solid #9333ea; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          NTA Joint CSIR-UGC NET December 2026 Online Registration Public Notice
        </h3>
        <span style="background: #f3e8ff; color: #6b21a8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">ACTIVE NOTICE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Public Notice Date:</strong> Aug 07, 2026</div>
        <div><strong>Application Start Date:</strong> Aug 07, 2026</div>
        <div><strong>Last Date to Apply:</strong> <span style="color: #dc2626; font-weight: 600;">Sep 06, 2026</span></div>
        <div><strong>Exam Dates:</strong> <span style="color: #2563eb; font-weight: 600;">Dec 18 to Dec 22, 2026</span></div>
        <div><strong>Eligibility:</strong> M.Sc / BS / B.Tech / B.Pharma / MBBS with min 55% marks</div>
        <div><strong>Streams:</strong> Science & Technology (Chemical, Earth, Life, Math, Physical)</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://csirnet.nta.ac.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Apply Online Portal (csirnet.nta.ac.in) →
        </a>
      </div>
    </div>

    <!-- Exam Notice 5: CUET UG / PG 2027 Preview Notice -->
    <div style="background: #ffffff; border-left: 5px solid #0284c7; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          NTA CUET UG & PG 2027 Academic Session Advisory Public Notice
        </h3>
        <span style="background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">PUBLIC ADVISORY</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Public Notice Date:</strong> Aug 05, 2026</div>
        <div><strong>Application Window (Expected):</strong> Nov 15 to Dec 20, 2026</div>
        <div><strong>Tentative Exam Window:</strong> May 15 to May 31, 2027</div>
        <div><strong>Eligibility:</strong> Class 12th Pass/Appearing (UG) / Bachelor Degree (PG)</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.nta.ac.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Read Advisory on NTA.ac.in →
        </a>
      </div>
    </div>

  </div>
</div>
<!-- End: CSC Dost - NTA Entrance Exams (nta.ac.in) Section -->`;

export const SSC_JOBS_HTML_SNIPPET = `<!-- Start: CSC Dost - SSC Jobs (ssc.gov.in) Section -->
<div class="csc-ssc-jobs-wrapper" style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 15px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
  
  <div style="background: linear-gradient(135deg, #1e1b4b, #312e81); color: #ffffff; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <h2 style="margin: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
      🏛️ Staff Selection Commission (SSC) Latest Jobs & Exam Updates (August 2026)
    </h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">
      Verified from Notice Board & Official Portal (ssc.gov.in) | Updated: August 07, 2026
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px;">

    <!-- Job Card 1 -->
    <div style="background: #ffffff; border-left: 5px solid #16a34a; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          SSC Stenographer Grade 'C' & 'D' Examination 2026 (1,207 Vacancies)
        </h3>
        <span style="background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">NEW NOTIFICATION</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 06, 2026</div>
        <div><strong>Application Start:</strong> Aug 06, 2026</div>
        <div><strong>Last Date to Apply:</strong> <span style="color: #dc2626; font-weight: 600;">Sep 05, 2026 (23:00 Hrs)</span></div>
        <div><strong>Correction Window:</strong> Sep 07 to Sep 08, 2026</div>
        <div><strong>Total Vacancies:</strong> 1,207 Posts (Tentative)</div>
        <div><strong>Eligibility:</strong> 12th Standard Pass + Stenography Skill Test</div>
        <div><strong>Age Limit:</strong> Grade C: 18-30 Yrs | Grade D: 18-27 Yrs</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://ssc.gov.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Apply Online Portal (ssc.gov.in) →
        </a>
        <a href="https://ssc.gov.in/" target="_blank" rel="noopener noreferrer" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Official Notice PDF
        </a>
      </div>
    </div>

    <!-- Job Card 2 -->
    <div style="background: #ffffff; border-left: 5px solid #2563eb; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          SSC CGL 2026 Tier-I Computer Based Exam City Intimation & Admit Card Schedule
        </h3>
        <span style="background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">EXAM SCHEDULE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Official Notice Date:</strong> Aug 05, 2026</div>
        <div><strong>Tier-I Exam Dates:</strong> <span style="color: #2563eb; font-weight: 600;">Sep 09, 2026 to Sep 26, 2026</span></div>
        <div><strong>City Slip Portal Live:</strong> Aug 28, 2026</div>
        <div><strong>Admit Card Download:</strong> 4 Days prior to candidate exam date</div>
        <div><strong>Total Vacancies:</strong> 17,727 Group B & C Officers Posts</div>
        <div><strong>Eligibility:</strong> Bachelor's Degree in any discipline</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://ssc.gov.in/login" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Check Candidate Portal →
        </a>
      </div>
    </div>

    <!-- Job Card 3 -->
    <div style="background: #ffffff; border-left: 5px solid #d97706; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          SSC GD Constable in CAPFs, SSF & Rifleman (GD) 2026 Notification Notice
        </h3>
        <span style="background: #fef3c7; color: #b45309; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">UPCOMING MEGA DRIVE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Short Notice Release:</strong> Aug 07, 2026</div>
        <div><strong>Detailed Notice Date:</strong> Aug 27, 2026</div>
        <div><strong>Application Window:</strong> <span style="color: #16a34a; font-weight: 600;">Aug 27, 2026 to Sep 27, 2026</span></div>
        <div><strong>Expected Vacancies:</strong> 39,481 Posts</div>
        <div><strong>Eligibility:</strong> Class 10th (Matriculation) Pass</div>
        <div><strong>Age Limit:</strong> 18 to 23 Years</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://ssc.gov.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          SSC Portal Check →
        </a>
      </div>
    </div>

    <!-- Job Card 4 -->
    <div style="background: #ffffff; border-left: 5px solid #9333ea; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          SSC Selection Posts Phase-XIV 2026 Application Correction Window Notice
        </h3>
        <span style="background: #f3e8ff; color: #6b21a8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">CORRECTION ACTIVE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Official Notice Date:</strong> Aug 06, 2026</div>
        <div><strong>Correction Window Dates:</strong> <span style="color: #dc2626; font-weight: 600;">Aug 14, 2026 to Aug 16, 2026</span></div>
        <div><strong>Total Vacancies:</strong> 2,049 Posts across 9 Regional Offices</div>
        <div><strong>Levels:</strong> 10th Pass / 12th Pass / Graduate Level Posts</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://ssc.gov.in/login" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Modify Application →
        </a>
      </div>
    </div>

    <!-- Job Card 5 -->
    <div style="background: #ffffff; border-left: 5px solid #0284c7; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          SSC CHSL (10+2) Tier-II (Mains) Examination Date Notice 2026
        </h3>
        <span style="background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">MAINS EXAM NOTICE</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Official Notice Date:</strong> Aug 05, 2026</div>
        <div><strong>Tier-II Exam Date:</strong> <span style="color: #2563eb; font-weight: 600;">October 18, 2026</span></div>
        <div><strong>Posts:</strong> LDC, JSA & DEO Grade A</div>
        <div><strong>Eligibility:</strong> Tier-I Qualified Candidates</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://ssc.gov.in/" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Check Mains Notice PDF
        </a>
      </div>
    </div>

  </div>
</div>
<!-- End: CSC Dost - SSC Jobs (ssc.gov.in) Section -->`;

export const ARMY_JOBS_HTML_SNIPPET = `<!-- Start: CSC Dost - Indian Army Jobs Section -->
<div class="csc-army-jobs-wrapper" style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 15px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
  
  <div style="background: linear-gradient(135deg, #1e3a8a, #065f46); color: #ffffff; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <h2 style="margin: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
      🇮🇳 Join Indian Army Latest Recruitment & Rally Updates (August 2026)
    </h2>
    <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">
      Verified from joinindianarmy.nic.in | Updated: August 07, 2026
    </p>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px;">

    <!-- Job 1 -->
    <div style="background: #ffffff; border-left: 5px solid #16a34a; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          NCC Special Entry Scheme 125th Course (April 2027)
        </h3>
        <span style="background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">NEW NOTIFICATION</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 05, 2026</div>
        <div><strong>Last Date to Apply:</strong> <span style="color: #dc2626; font-weight: 600;">Aug 20, 2026 (15:00 Hrs)</span></div>
        <div><strong>Vacancies:</strong> 70 Posts (Male & Female)</div>
        <div><strong>Eligibility:</strong> Graduate (Min 50% marks) + NCC 'C' Certificate</div>
        <div><strong>Age Limit:</strong> 19 to 25 Years</div>
        <div><strong>Type:</strong> Officers Entry (Short Service Commission)</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Apply Online →
        </a>
        <a href="https://www.joinindianarmy.nic.in/default.aspx" target="_blank" rel="noopener noreferrer" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Official Portal
        </a>
      </div>
    </div>

    <!-- Job 2 -->
    <div style="background: #ffffff; border-left: 5px solid #2563eb; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          JAG Entry Scheme 34th Course (Law Graduates - April 2027)
        </h3>
        <span style="background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">ACTIVE NOW</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 05, 2026</div>
        <div><strong>Last Date to Apply:</strong> <span style="color: #dc2626; font-weight: 600;">Aug 21, 2026</span></div>
        <div><strong>Eligibility:</strong> LLB Degree (Min 55% marks) + Bar Council eligibility</div>
        <div><strong>Age Limit:</strong> 21 to 27 Years</div>
        <div><strong>Location:</strong> All India (Commissioned Officer)</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.joinindianarmy.nic.in/officers-entry-apply-login.htm" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Apply Online →
        </a>
      </div>
    </div>

    <!-- Job 3 -->
    <div style="background: #ffffff; border-left: 5px solid #d97706; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Territorial Army Non-Departmental Officer Entry 2026
        </h3>
        <span style="background: #fef3c7; color: #b45309; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">OFFICER ENTRY</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Notification Date:</strong> Aug 05, 2026</div>
        <div><strong>Last Date to Apply:</strong> <span style="color: #dc2626; font-weight: 600;">Aug 25, 2026</span></div>
        <div><strong>Eligibility:</strong> Graduate in any discipline (Gainfully Employed)</div>
        <div><strong>Age Limit:</strong> 18 to 42 Years</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.joinindianarmy.nic.in/default.aspx" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Check Details on Portal
        </a>
      </div>
    </div>

    <!-- Job 4 -->
    <div style="background: #ffffff; border-left: 5px solid #9333ea; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Ladakh Scouts Regimental Centre Agniveer Recruitment Rally
        </h3>
        <span style="background: #f3e8ff; color: #6b21a8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">RECRUITMENT RALLY</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Rally Dates:</strong> <span style="color: #16a34a; font-weight: 600;">Aug 11 to Aug 13, 2026</span></div>
        <div><strong>Notification Date:</strong> Aug 05, 2026 (Rally Notice)</div>
        <div><strong>Location:</strong> Leh, Ladakh (HQ Quota)</div>
        <div><strong>Eligibility:</strong> 10th / 12th Pass (Ladakh Domicile)</div>
        <div><strong>Age Limit:</strong> 17.5 to 21 Years</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.joinindianarmy.nic.in/BRAgniveerRallySchedule.htm" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          View Rally Schedule →
        </a>
      </div>
    </div>

    <!-- Job 5 -->
    <div style="background: #ffffff; border-left: 5px solid #0284c7; border-radius: 8px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
          Army Ordnance Corps (AOC) Civilian Recruitment Alert 2026
        </h3>
        <span style="background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">UPCOMING ALERT</span>
      </div>
      <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 14px; color: #334155;">
        <div><strong>Expected Online Window:</strong> Aug 24 to Sep 22, 2026</div>
        <div><strong>Posts:</strong> Tradesman Mate, Fireman & Material Assistant</div>
        <div><strong>Eligibility:</strong> 10th Pass / 12th Pass / Graduate</div>
      </div>
      <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://www.joinindianarmy.nic.in/default.aspx" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Check Updates
        </a>
      </div>
    </div>

  </div>
</div>
<!-- End: CSC Dost - Indian Army Jobs Section -->`;

export default function SarkariResultDesk({ onApplyService, selectedService, onOpenDedicatedPage }: SarkariResultDeskProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<SarkariItem | null>(null);
  const [clickedItemId, setClickedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'jkssb' | 'jobs' | 'admissions' | 'exam_forms' | 'cluster_univ' | 'ssc_jobs' | 'rrb_jobs' | 'army_jobs'>('all');
  const [deskViewMode, setDeskViewMode] = useState<'boxes' | 'cards'>('boxes');

  // Interactive Digital Application Portal State
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    emailAddress: '',
    dateOfBirth: '',
    selectedService: '',
    customServiceText: '',
    userCategory: 'genObc' as 'genObc' | 'scSt',
    paymentMode: 'online' as 'cash' | 'online',
    utrNumber: '',
    additionalDetails: '',
    portalFee: 70, // Fixed CSC Processing charge
    applicationFee: 0, // Exam application fee
  });

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrError, setUtrError] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [postSubmitPaymentMode, setPostSubmitPaymentMode] = useState<'none' | 'razorpay' | 'online' | 'cash'>('razorpay');
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  const [razorpayError, setRazorpayError] = useState<string | null>(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any>(null);
  const [activeAlertTab, setActiveAlertTab] = useState<'alerts' | 'updates' | 'help'>('alerts');

  // WhatsApp Automated Invoice Notification State
  const [whatsappStatus, setWhatsappStatus] = useState<{
    loading: boolean;
    sent?: boolean;
    message?: string;
    directWhatsAppUrl?: string;
    error?: string;
  } | null>(null);

  // Share & Toast Notification State
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeShareData, setActiveShareData] = useState<{ title: string; text: string; url: string; name: string } | null>(null);

  // KU Admissions HTML Snippet State
  const [showKuAdmissionsHtmlSource, setShowKuAdmissionsHtmlSource] = useState(false);
  const [kuAdmissionsHtmlCopied, setKuAdmissionsHtmlCopied] = useState(false);

  const handleCopyKuAdmissionsHtml = () => {
    navigator.clipboard.writeText(KU_ADMISSIONS_HTML_SNIPPET);
    setKuAdmissionsHtmlCopied(true);
    triggerToast('Copied KU Admissions (Kashmir Univ) HTML Snippet to clipboard!');
    setTimeout(() => setKuAdmissionsHtmlCopied(false), 3000);
  };

  // KU Exam Forms HTML Snippet State
  const [showKuHtmlSource, setShowKuHtmlSource] = useState(false);
  const [kuHtmlCopied, setKuHtmlCopied] = useState(false);

  const handleCopyKuHtml = () => {
    navigator.clipboard.writeText(KU_EXAM_FORMS_HTML_SNIPPET);
    setKuHtmlCopied(true);
    triggerToast('Copied KU Exam Forms (Kashmir Univ) HTML Snippet to clipboard!');
    setTimeout(() => setKuHtmlCopied(false), 3000);
  };

  // Cluster University HTML Snippet State
  const [showClusterUnivHtmlSource, setShowClusterUnivHtmlSource] = useState(false);
  const [clusterUnivHtmlCopied, setClusterUnivHtmlCopied] = useState(false);

  const handleCopyClusterUnivHtml = () => {
    navigator.clipboard.writeText(CLUSTER_UNIV_HTML_SNIPPET);
    setClusterUnivHtmlCopied(true);
    triggerToast('Copied Cluster University (CUS Srinagar) HTML Snippet to clipboard!');
    setTimeout(() => setClusterUnivHtmlCopied(false), 3000);
  };


  // SSC HTML Snippet State
  const [showSscHtmlSource, setShowSscHtmlSource] = useState(false);
  const [sscHtmlCopied, setSscHtmlCopied] = useState(false);

  const handleCopySscHtml = () => {
    navigator.clipboard.writeText(SSC_JOBS_HTML_SNIPPET);
    setSscHtmlCopied(true);
    triggerToast('Copied SSC Jobs (ssc.gov.in) HTML Snippet to clipboard!');
    setTimeout(() => setSscHtmlCopied(false), 3000);
  };

  // RRB HTML Snippet State
  const [showRrbHtmlSource, setShowRrbHtmlSource] = useState(false);
  const [rrbHtmlCopied, setRrbHtmlCopied] = useState(false);

  const handleCopyRrbHtml = () => {
    navigator.clipboard.writeText(RRB_JOBS_HTML_SNIPPET);
    setRrbHtmlCopied(true);
    triggerToast('Copied RRB Jobs HTML Snippet to clipboard!');
    setTimeout(() => setRrbHtmlCopied(false), 3000);
  };

  // Indian Army HTML Snippet State
  const [showArmyHtmlSource, setShowArmyHtmlSource] = useState(false);
  const [armyHtmlCopied, setArmyHtmlCopied] = useState(false);

  const handleCopyArmyHtml = () => {
    navigator.clipboard.writeText(ARMY_JOBS_HTML_SNIPPET);
    setArmyHtmlCopied(true);
    triggerToast('Copied Indian Army Jobs HTML Snippet to clipboard!');
    setTimeout(() => setArmyHtmlCopied(false), 3000);
  };

  // Auto-open post if ?post=... is present in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('post');
      if (postId) {
        const match = SARKARI_DATA.find(i => i.id === postId);
        if (match) {
          if (onOpenDedicatedPage) {
            onOpenDedicatedPage(match);
          } else {
            setSelectedItem(match);
          }
        }
      }
    }
  }, [onOpenDedicatedPage]);

  const triggerToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleShareSarkari = async (item: SarkariItem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.cscdost.com';
    const shareUrl = `${origin}/#post/${item.id}`;
    const orgName = getOrgName(item);
    const shareTitle = `📢 ${item.title}`;
    const shareText = `📢 *${item.title}*\n🏢 *Board/Dept:* ${orgName}\n${item.lastDate ? `⏰ *Last Date:* ${item.lastDate}\n` : ''}${item.totalPosts ? `👥 *Vacancies/Seats:* ${item.totalPosts}\n` : ''}\n${item.shortInfo ? item.shortInfo + '\n\n' : ''}👉 View full notification & Apply online via CSC DOST:\n${shareUrl}`;

    const dataPayload = { title: shareTitle, text: shareText, url: shareUrl, name: item.title };
    setActiveShareData(dataPayload);

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fallback to share modal if cancelled or unsupported
      }
    }
    setShowShareModal(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${label} to clipboard!`);
  };

  const triggerWhatsAppInvoiceDispatch = async (receiptData: any) => {
    if (!receiptData || !receiptData.phoneNumber) return;

    setWhatsappStatus({ loading: true });

    try {
      const res = await fetch('/api/send-whatsapp-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: receiptData.customerName,
          phone: receiptData.phoneNumber,
          service: receiptData.selectedService,
          totalAmount: receiptData.totalAmount || receiptData.portalFee,
          appId: receiptData.appId,
          paymentMode: receiptData.paymentMode,
          utrNumber: receiptData.utrNumber,
          userCategory: receiptData.userCategory,
          submittedAt: receiptData.submittedAt
        })
      });

      const receiptResText = await res.text();
      const data = receiptResText ? JSON.parse(receiptResText) : {};
      if (res.ok && data.success) {
        setWhatsappStatus({
          loading: false,
          sent: true,
          message: data.message || 'WhatsApp invoice dispatched successfully!',
          directWhatsAppUrl: data.directWhatsAppUrl
        });
      } else {
        setWhatsappStatus({
          loading: false,
          sent: false,
          error: data.error || 'WhatsApp message dispatch failed. You can send it directly using the button below.',
          directWhatsAppUrl: data.directWhatsAppUrl
        });
      }
    } catch (err: any) {
      console.error('Frontend WhatsApp dispatch exception:', err);
      const cleanDigits = (receiptData.phoneNumber || '').replace(/[^\d]/g, '');
      const fallbackPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
      const fallbackText = encodeURIComponent(`🧾 Official Invoice - ${receiptData.selectedService}\nToken: ${receiptData.appId}\nAmount: ₹${receiptData.totalAmount || 70}`);

      setWhatsappStatus({
        loading: false,
        sent: false,
        error: 'Backend API connection failed. Send invoice directly to customer via WhatsApp below.',
        directWhatsAppUrl: `https://api.whatsapp.com/send?phone=${fallbackPhone}&text=${fallbackText}`
      });
    }
  };

  // Dynamic document requirement helper linking service selection to specific required documents
  const getServiceDocRequirement = (serviceVal: string, customText?: string): { mandatory: boolean; requiredDocTypes: DocumentTypeConfig[] } => {
    if (!serviceVal) return { mandatory: false, requiredDocTypes: [] };

    let docKeys: string[] | undefined = SERVICE_DOCUMENT_MAP[serviceVal];

    if (!docKeys) {
      const sItem = SERVICES_LIST.find(s => s.name.toLowerCase() === serviceVal.toLowerCase() || s.id.toLowerCase() === serviceVal.toLowerCase());
      if (sItem) {
        docKeys = SERVICE_DOCUMENT_MAP[sItem.id] || SERVICE_DOCUMENT_MAP[sItem.name];
      }
    }

    if (!docKeys) {
      const sarkariItem = SARKARI_DATA.find(item => item.title.toLowerCase() === serviceVal.toLowerCase());
      if (sarkariItem) {
        if (sarkariItem.category === 'jobs' || sarkariItem.category === 'admissions') {
          docKeys = ['aadhaar', 'marksheet', 'photo', 'caste'];
        }
      }
    }

    if (!docKeys && serviceVal === 'other') {
      const text = (customText || '').toLowerCase();
      if (text.includes('utility') || text.includes('recharge') || text.includes('bill') || text.includes('inquiry') || text.includes('query')) {
        return { mandatory: false, requiredDocTypes: [] };
      }
      docKeys = ['aadhaar', 'other_doc'];
    }

    if (!docKeys) {
      const lower = serviceVal.toLowerCase();
      if (lower.includes('utility') || lower.includes('recharge') || lower.includes('bill')) {
        return { mandatory: false, requiredDocTypes: [] };
      }
      if (lower.includes('pan')) {
        docKeys = ['aadhaar', 'photo', 'signature'];
      } else if (lower.includes('aadhaar')) {
        docKeys = ['aadhaar', 'address_proof'];
      } else if (lower.includes('voter')) {
        docKeys = ['aadhaar', 'photo', 'address_proof'];
      } else if (lower.includes('caste') || lower.includes('income') || lower.includes('certificate') || lower.includes('domicile')) {
        docKeys = ['aadhaar', 'address_proof', 'income', 'caste'];
      } else if (lower.includes('job') || lower.includes('recruitment') || lower.includes('exam') || lower.includes('railway') || lower.includes('ssc') || lower.includes('police') || lower.includes('rpf') || lower.includes('constable') || lower.includes('inspector') || lower.includes('sub inspector')) {
        docKeys = ['aadhaar', 'marksheet', 'photo', 'caste'];
      } else {
        docKeys = ['aadhaar', 'other_doc'];
      }
    }

    const docTypes = docKeys.map(k => DOCUMENT_TYPE_CONFIGS[k]).filter(Boolean);
    return {
      mandatory: docTypes.length > 0,
      requiredDocTypes: docTypes
    };
  };

  const handleMandatoryIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentError(null);
      const file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        setDocumentError(`File "${file.name}" exceeds the maximum size limit of 10MB.`);
        return;
      }

      setIsProcessingFiles(true);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newDoc: UploadedDocument = {
          id: Math.random().toString(36).substring(2, 9),
          docTypeId: 'aadhaar_school_id',
          docTypeName: 'Aadhaar Card or School/College ID Card',
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl,
          rawFile: file
        };
        setUploadedFiles([newDoc]);
        setIsProcessingFiles(false);
      };
      reader.onerror = () => {
        console.error('Error reading file:', file.name);
        setIsProcessingFiles(false);
      };
      reader.readAsDataURL(file);

      e.target.value = '';
    }
  };

  const handleRemoveMandatoryDoc = () => {
    setUploadedFiles([]);
  };

  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, _docType?: any) => {
    handleMandatoryIdUpload(e);
  };

  const handleRemoveDocByTypeId = (_docTypeId?: string) => {
    handleRemoveMandatoryDoc();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleMandatoryIdUpload(e);
  };

  const handleRemoveFile = (_id?: string) => {
    handleRemoveMandatoryDoc();
  };

  const parseFeeString = (feeStr: string | undefined) => {
    if (!feeStr) return 0;
    const clean = feeStr.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  };

  const handleServiceChange = (serviceVal: string) => {
    let appFee = 0;
    if (serviceVal !== 'other') {
      // Find matching exam bulletin to set application fee
      const matchingBulletin = SARKARI_DATA.find(item => item.title === serviceVal);
      if (matchingBulletin && matchingBulletin.fees) {
        const feeStr = formData.userCategory === 'scSt' ? matchingBulletin.fees.scSt : matchingBulletin.fees.genObc;
        appFee = parseFeeString(feeStr);
      }
    }
    setFormData(prev => ({
      ...prev,
      selectedService: serviceVal,
      applicationFee: appFee
    }));
  };

  const handleCategoryChange = (categoryVal: 'genObc' | 'scSt') => {
    let appFee = 0;
    if (formData.selectedService !== 'other') {
      const matchingBulletin = SARKARI_DATA.find(item => item.title === formData.selectedService);
      if (matchingBulletin && matchingBulletin.fees) {
        const feeStr = categoryVal === 'scSt' ? matchingBulletin.fees.scSt : matchingBulletin.fees.genObc;
        appFee = parseFeeString(feeStr);
      }
    }
    setFormData(prev => ({
      ...prev,
      userCategory: categoryVal,
      applicationFee: appFee
    }));
  };

  useEffect(() => {
    if (selectedService) {
      // Clean up any prefix if present
      const cleanName = selectedService.replace(/^(Assistance Request:|Filing Application:)\s*/i, '').trim();

      // Look for exact title match in SARKARI_DATA or SERVICES_LIST
      const sarkariMatch = SARKARI_DATA.find(item => item.title.toLowerCase() === cleanName.toLowerCase());
      const serviceMatch = SERVICES_LIST.find(s => s.name.toLowerCase() === cleanName.toLowerCase());

      if (sarkariMatch) {
        handleServiceChange(sarkariMatch.title);
      } else if (serviceMatch) {
        handleServiceChange(serviceMatch.name);
      } else {
        // Search by partial match
        const partialSarkari = SARKARI_DATA.find(item => item.title.toLowerCase().includes(cleanName.toLowerCase()) || cleanName.toLowerCase().includes(item.title.toLowerCase()));
        const partialService = SERVICES_LIST.find(s => s.name.toLowerCase().includes(cleanName.toLowerCase()) || cleanName.toLowerCase().includes(s.name.toLowerCase()));

        if (partialSarkari) {
          handleServiceChange(partialSarkari.title);
        } else if (partialService) {
          handleServiceChange(partialService.name);
        } else {
          setFormData(prev => ({
            ...prev,
            selectedService: 'other',
            customServiceText: cleanName
          }));
        }
      }

      // Reset form submission view if a new service is selected
      setIsFormSubmitted(false);
      setPostSubmitPaymentMode('razorpay');
      setIsPaymentConfirmed(false);

      // Smooth scroll to Digital Application & Appointment Desk and auto focus Applicant Name
      setTimeout(() => {
        const formEl = document.getElementById('booking-portal-form');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);

      setTimeout(() => {
        const nameInput = document.getElementById('applicant-name-input') as HTMLInputElement | null;
        if (nameInput) {
          try {
            nameInput.focus({ preventScroll: true });
          } catch {
            nameInput.focus();
          }
        }
      }, 350);
    }
  }, [selectedService]);

  const docRequirement = getServiceDocRequirement(formData.selectedService, formData.customServiceText);

  // Helper to generate auto-incrementing globally unique official CSC token starting with prefix CSC21251567...
  const getNextCscTokenIdAsync = async (): Promise<string> => {
    try {
      const res = await fetch('/api/appointments/next-token');
      if (res.ok) {
        const data = await res.json();
        if (data && data.nextToken) {
          const num = parseInt(data.seq, 10);
          if (!isNaN(num)) {
            const lastStored = parseInt(localStorage.getItem('csc_token_seq') || '0', 10);
            if (num > lastStored) {
              localStorage.setItem('csc_token_seq', num.toString());
            }
          }
          return data.nextToken;
        }
      }
    } catch (e) {
      console.warn('Next token server fetch warning, using fallback sequence:', e);
    }

    try {
      let maxSeq = 0;
      const existingApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      if (Array.isArray(existingApps)) {
        existingApps.forEach((a: any) => {
          const id = a.appId || a.id || '';
          const matchNew = id.match(/^CSC21251567(\d+)/i);
          if (matchNew && matchNew[1]) {
            const num = parseInt(matchNew[1], 10);
            if (!isNaN(num) && num > maxSeq) {
              maxSeq = num;
            }
          }
        });
      }
      const lastStored = parseInt(localStorage.getItem('csc_token_seq') || '0', 10);
      if (!isNaN(lastStored) && lastStored > maxSeq) {
        maxSeq = lastStored;
      }

      if (maxSeq === 0) {
        maxSeq = Math.floor((Date.now() % 10000000) / 1000);
      }

      const nextSeq = maxSeq + 1;
      localStorage.setItem('csc_token_seq', nextSeq.toString());
      const seqPadded = String(nextSeq).padStart(3, '0');
      return `CSC21251567${seqPadded}`;
    } catch {
      const randSeq = Math.floor(100 + Math.random() * 900);
      return `CSC21251567${randSeq}`;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError(null);
    setDocumentError(null);

    if (!formData.customerName || !formData.customerName.trim()) {
      setDocumentError('⚠️ Please enter your Full Name before submitting.');
      return;
    }

    if (!formData.phoneNumber || !formData.phoneNumber.trim() || formData.phoneNumber.replace(/\D/g, '').length < 10) {
      setDocumentError('⚠️ Please enter a valid 10-digit WhatsApp Mobile Number.');
      return;
    }

    if (!formData.selectedService) {
      setDocumentError('⚠️ Please select a service or specify your custom request.');
      return;
    }

    if (uploadedFiles.length === 0) {
      setDocumentError('⚠️ Mandatory ID Document Missing: Please upload a clear photo or PDF of your Aadhaar Card or School / College ID Card.');
      return;
    }

    const uploadedDocsList = uploadedFiles.map(f => `${f.name} (${(f.size / 1024).toFixed(1)} KB)`);

    // Assign official Reference Token ID immediately upon form submission!
    const officialAppId = await getNextCscTokenIdAsync();

    const verifiedReceipt = {
      appId: officialAppId,
      customerName: formData.customerName,
      phoneNumber: formData.phoneNumber,
      emailAddress: formData.emailAddress || 'N/A',
      dateOfBirth: formData.dateOfBirth || 'N/A',
      selectedService: formData.selectedService === 'other' || formData.selectedService === 'Custom Unlisted Request' ? formData.customServiceText : formData.selectedService,
      userCategory: formData.userCategory === 'genObc' ? 'General/OBC' : formData.userCategory === 'scSt' ? 'SC/ST' : 'Female Candidate',
      paymentMode: 'Pay at CSC Desk Upon Completion (No Advance Payment)',
      utrNumber: 'N/A (No Advance Payment)',
      paymentStatus: 'No Advance Online Payment Required',
      portalFee: 0,
      applicationFee: 0,
      totalAmount: 0,
      mandatoryDocName: uploadedFiles[0]?.name || 'Aadhaar Card / School ID Attached',
      uploadedDocuments: uploadedDocsList,
      additionalDetails: formData.additionalDetails || 'None',
      submittedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('en-US')
    };

    setSubmissionReceipt(verifiedReceipt);
    setIsFormSubmitted(true);
    setIsPaymentConfirmed(true);

    // Process and upload attached documents to Supabase Storage if configured
    let processedDocs: UploadedDocument[] = uploadedFiles;
    try {
      processedDocs = await uploadMultipleDocumentsToSupabase(uploadedFiles, officialAppId);
      setUploadedFiles(processedDocs);
    } catch (upErr) {
      console.warn('Supabase document upload notice:', upErr);
    }

    // Save application record immediately across storage & databases so it appears in Admin & Track Order
    const nowIso = new Date().toISOString();
    const payload = {
      appId: officialAppId,
      id: officialAppId,
      name: formData.customerName,
      customerName: formData.customerName,
      email: formData.emailAddress || 'N/A',
      phone: formData.phoneNumber,
      phoneNumber: formData.phoneNumber,
      service: verifiedReceipt.selectedService,
      selectedService: verifiedReceipt.selectedService,
      dateOfBirth: formData.dateOfBirth || 'N/A',
      userCategory: verifiedReceipt.userCategory,
      paymentMode: 'Pay at CSC Desk Upon Completion',
      utrNumber: 'N/A',
      totalAmount: 0,
      message: formData.additionalDetails || 'None',
      documents: processedDocs,
      status: 'Registered',
      paymentStatus: 'No Advance Online Payment Required',
      submittedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      statusUpdatedAt: nowIso
    };

    // 1. Save to Cloud Firestore
    if (officialAppId) {
      try {
        Promise.all([
          setDoc(doc(db, 'applications', officialAppId), payload, { merge: true }),
          setDoc(doc(db, 'appointments', officialAppId), payload, { merge: true })
        ]).catch(err => console.error('Firestore setDoc error:', err));

        // Save to Getform.io / Formspree Endpoint
        saveApplicationToFormEndpoint(officialAppId, {
          ...payload,
          applicantName: formData.customerName,
          phoneNumber: formData.phoneNumber,
          emailAddress: formData.emailAddress,
          selectedService: verifiedReceipt.selectedService,
          userCategory: verifiedReceipt.userCategory,
          totalAmount: 0,
          documents: processedDocs
        }).catch(formErr => console.warn('Form endpoint save notice:', formErr));

        const supabase = getSupabaseClient();
        if (supabase) {
          supabase.from('applications').upsert([{
            appId: officialAppId,
            id: officialAppId,
            applicantName: formData.customerName,
            customerName: formData.customerName,
            phoneNumber: formData.phoneNumber,
            emailAddress: formData.emailAddress || 'N/A',
            selectedService: verifiedReceipt.selectedService,
            userCategory: verifiedReceipt.userCategory,
            paymentMode: 'Pay at CSC Desk Upon Completion',
            utrNumber: 'N/A',
            totalAmount: 0,
            status: 'Registered',
            submittedAt: nowIso,
            documents: processedDocs,
            payload
          }], { onConflict: 'appId' }).then(null, console.error);
        }
      } catch (dbErr) {
        console.error('Database initial save notice:', dbErr);
      }
    }

    // 2. Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      localStorage.setItem('csc_local_applications', JSON.stringify([payload, ...existing.filter((i: any) => i.appId !== officialAppId)]));
    } catch (e) {
      console.warn('localStorage save warning:', e);
    }

    // 3. Send to server API
    try {
      const apiDocs = processedDocs.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        url: f.url,
        dataUrl: f.dataUrl && f.dataUrl.length < 50000 ? f.dataUrl : undefined
      }));
      const lightPayload = { ...payload, documents: apiDocs };

      fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lightPayload),
        keepalive: true
      }).catch(console.error);
    } catch (err) {
      console.error('API submission error:', err);
    }

    // 4. Send to Web3Forms
    try {
      const web3Payload = {
        access_key: 'a6293a04-2711-4d7c-bb7c-e7c9ed3d888c',
        subject: `New Application Registered [${officialAppId}] - ${formData.customerName}`,
        from_name: 'APNA CSC Digital Portal',
        name: formData.customerName,
        email: formData.emailAddress || 'no-reply@apnacsc.in',
        phone_number: formData.phoneNumber,
        service_requested: verifiedReceipt.selectedService,
        category: verifiedReceipt.userCategory,
        payment_mode: 'Pay at CSC Desk (No Advance Payment)',
        utr_number: 'N/A',
        amount: '₹0 (Pay Upon Completion)',
        message: `APPLICATION REGISTERED AT CSC DESK\nToken ID: ${officialAppId}\nApplicant Name: ${formData.customerName}\nMobile: ${formData.phoneNumber}\nService: ${verifiedReceipt.selectedService}\nCategory: ${verifiedReceipt.userCategory}\nMandatory ID: ${uploadedFiles[0]?.name || 'Aadhaar Card / School ID Attached'}\nPayment: No Advance Online Payment Required\nNotes: ${formData.additionalDetails || 'None'}`
      };

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(web3Payload)
      }).catch(err => console.error('Web3Forms registration error:', err));
    } catch (err) {
      console.error('Web3Forms dispatch error:', err);
    }

    // 5. Broadcast live events
    try {
      window.dispatchEvent(new CustomEvent('csc_appointment_created', { detail: payload }));
      window.dispatchEvent(new CustomEvent('csc_appointment_updated', { detail: payload }));
      window.dispatchEvent(new Event('storage'));
      const bc = new BroadcastChannel('csc_portal_sync');
      bc.postMessage({ type: 'NEW_APPOINTMENT', payload });
      bc.close();
    } catch (e) {
      console.error(e);
    }

    triggerWhatsAppInvoiceDispatch(verifiedReceipt);

    // Scroll to the receipt slip
    setTimeout(() => {
      const element = document.getElementById('printable-receipt-area') || document.getElementById('printable-digital-slip');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  const handleDynamicUpiPaymentSuccess = async (_utrNumber: string) => {
    // No-op kept for backwards compatibility
  };

  const handleConfirmPayment = async () => {
    // No-op kept for backwards compatibility
  };

  const handlePrintSlip = () => {
    const slipElement = document.getElementById('printable-digital-slip') || document.getElementById('printable-receipt-area');
    if (!slipElement) {
      window.print();
      return;
    }

    // Clone element and strip no-print elements
    const clone = slipElement.cloneNode(true) as HTMLElement;
    const noPrintElements = clone.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.remove());

    // Clean up iframe if already present
    try {
      const existingIframe = document.getElementById('csc-print-iframe');
      if (existingIframe) {
        existingIframe.remove();
      }

      const printIframe = document.createElement('iframe');
      printIframe.id = 'csc-print-iframe';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);

      const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Official CSC e-Receipt #${submissionReceipt?.appId || 'CSC21251567001'}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { size: portrait; margin: 8mm; }
                  body { background: #ffffff !important; color: #0f172a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body class="p-4 bg-white text-slate-900">
              <div class="max-w-2xl mx-auto border border-slate-300 p-6 rounded-2xl shadow-sm">
                ${clone.outerHTML}
              </div>
            </body>
          </html>
        `);
        iframeDoc.close();
        setTimeout(() => {
          try {
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();
          } catch {
            window.print();
          } finally {
            setTimeout(() => {
              if (document.body.contains(printIframe)) {
                document.body.removeChild(printIframe);
              }
            }, 3000);
          }
        }, 500);
        return;
      }
    } catch (err) {
      console.warn('Iframe print failed:', err);
    }

    // Direct window print fallback
    window.print();
  };

  // Filter items based on search query and category tab
  const filteredItems = SARKARI_DATA.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.eligibility && item.eligibility.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Dynamically extract the latest notification from each of the primary categories for the top ticker marquee
  const tickerSections: Array<{ category: SarkariItem['category']; tag: string; emoji: string }> = [
    { category: 'army_jobs', tag: 'ARMY', emoji: '⚔️' },
    { category: 'rrb_jobs', tag: 'RAILWAY', emoji: '🚆' },
    { category: 'ssc_jobs', tag: 'SSC', emoji: '💼' },
    { category: 'cluster_univ', tag: 'CUS', emoji: '🏛️' },
    { category: 'jkssb', tag: 'JKSSB', emoji: '⚡' },
    { category: 'exam_forms', tag: 'EXAM FORM', emoji: '📝' },
    { category: 'admissions', tag: 'ADMISSION', emoji: '🎓' },
  ];

  const latestTickerItems = tickerSections
    .map(sec => {
      const latestItem = SARKARI_DATA.find(item => item.category === sec.category);
      return latestItem ? { item: latestItem, ...sec } : null;
    })
    .filter((entry): entry is { item: SarkariItem; category: SarkariItem['category']; tag: string; emoji: string } => entry !== null);

  // Group items by category for the multi-box layout
  const getItemsByCategory = (cat: 'jkssb' | 'jobs' | 'admit_cards' | 'results' | 'answer_keys' | 'syllabus' | 'admissions') => {
    return SARKARI_DATA.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.eligibility && item.eligibility.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch && item.category === cat;
    });
  };

  const getOrgName = (item: SarkariItem) => {
    if (item.category === 'army_jobs') return 'Indian Army (joinindianarmy.nic.in)';
    if (item.category === 'rrb_jobs') return 'Railway Recruitment Boards (RRB)';
    if (item.category === 'ssc_jobs') return 'Staff Selection Commission (SSC)';
    if (item.category === 'cluster_univ') return 'Cluster University Srinagar (CUS)';
    if (item.category === 'jkssb') return 'J&K Services Selection Board (JKSSB)';
    if (item.category === 'exam_forms') return 'University of Kashmir (Examinations)';
    if (item.category === 'admissions') return 'University of Kashmir (Admissions)';

    const titleUpper = item.title.toUpperCase();
    if (titleUpper.includes('ARMY') || titleUpper.includes('AGNIVEER')) return 'Indian Army';
    if (titleUpper.includes('SSC')) return 'Staff Selection Commission (SSC)';
    if (titleUpper.includes('RRB') || titleUpper.includes('RAILWAY') || titleUpper.includes('RPF')) return 'Railway Recruitment Boards (RRB)';
    if (titleUpper.includes('IBPS')) return 'Institute of Banking Personnel Selection';
    if (titleUpper.includes('JKSSB') || titleUpper.includes('J&K')) return 'J&K Services Selection Board';
    if (titleUpper.includes('UP POLICE') || titleUpper.includes('UPPRPB')) return 'UP Police Recruitment Board';
    if (titleUpper.includes('UPSC')) return 'Union Public Service Commission (UPSC)';
    if (titleUpper.includes('NEET') || titleUpper.includes('NTA') || titleUpper.includes('JEE') || titleUpper.includes('CUET')) return 'National Testing Agency (NTA)';
    if (titleUpper.includes('CBSE') || titleUpper.includes('CTET')) return 'Central Board of Secondary Education';
    if (titleUpper.includes('DELHI UNIVERSITY') || titleUpper.includes('CSAS')) return 'Delhi University Admission Board';
    if (titleUpper.includes('IGNOU')) return 'Indira Gandhi National Open University';
    return item.advertisementNo || 'Government Recruitment Board';
  };

  const getPostsText = (item: SarkariItem) => {
    const match = item.title.match(/(\d[\d,]*\+?\s*(?:Posts|Vacancies|Positions))/i);
    if (match) return match[1];
    const shortMatch = item.shortInfo.match(/(\d[\d,]*\+?\s*(?:Posts|Vacancies|Positions))/i);
    if (shortMatch) return shortMatch[1];
    return 'Multiple Vacancies';
  };

  const getFormattedFees = (item: SarkariItem) => {
    if (item.fees) {
      return (
        <span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400">Gen/OBC: {item.fees.genObc}</span>
          <span className="text-slate-400 mx-1">|</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">SC/ST/Female: {item.fees.scSt}</span>
        </span>
      );
    }
    return <span className="font-bold text-emerald-700 dark:text-emerald-400">Gen: ₹500 | Reserved: ₹250</span>;
  };

  // Icon mapping helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'jobs':
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case 'admit_cards':
        return <FileText className="w-5 h-5 text-orange-500" />;
      case 'results':
        return <Award className="w-5 h-5 text-emerald-500" />;
      case 'answer_keys':
        return <Key className="w-5 h-5 text-purple-500" />;
      case 'syllabus':
        return <BookOpen className="w-5 h-5 text-pink-500" />;
      case 'admissions':
        return <GraduationCap className="w-5 h-5 text-teal-500" />;
      default:
        return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleItemClick = (item: SarkariItem) => {
    // Show instant click ripple / flash effect
    setClickedItemId(item.id);
    setTimeout(() => {
      setClickedItemId(null);
      if (onOpenDedicatedPage) {
        onOpenDedicatedPage(item);
      } else {
        setSelectedItem(item);
      }
    }, 120);
  };

  const handleApplyNow = (item: SarkariItem) => {
    setSelectedItem(null);
    setIsFormSubmitted(false);
    setPostSubmitPaymentMode('none');
    setIsPaymentConfirmed(false);
    onApplyService(`Filing Application: ${item.title}`);
    
    // Auto-fill our new portal form states!
    const feeStr = formData.userCategory === 'scSt' ? item.fees?.scSt : item.fees?.genObc;
    const appFee = parseFeeString(feeStr);

    setFormData(prev => ({
      ...prev,
      selectedService: item.title,
      applicationFee: appFee
    }));

    // Smooth scroll to our form container and auto focus Applicant Name
    setTimeout(() => {
      const formEl = document.getElementById('booking-portal-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    setTimeout(() => {
      const nameInput = document.getElementById('applicant-name-input') as HTMLInputElement | null;
      if (nameInput) {
        try {
          nameInput.focus({ preventScroll: true });
        } catch {
          nameInput.focus();
        }
      }
    }, 350);
  };

  return (
    <section id="sarkari-portal-section" className="pt-0 pb-12 md:pb-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 w-full">
      
      {/* 1. 📢 YELLOW TOP NEWS TICKER STRIP */}
      <div className="bg-[#f59e0b] border-b border-amber-500 py-2 px-2.5 sm:py-2.5 sm:px-4 shadow-sm w-full mb-6 text-slate-950">
        {/* Running Horizontal Ticker Marquee for Mobile & Desktop */}
        <div className="flex max-w-7xl mx-auto items-center justify-between gap-2 sm:gap-3 text-xs font-sans relative">
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0 overflow-hidden">
            <span className="bg-slate-950 text-amber-300 font-black text-[10px] sm:text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded uppercase tracking-wider shrink-0 flex items-center gap-1 sm:gap-1.5 shadow-xs z-10">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>LATEST NEWS:</span>
            </span>
            <div className="overflow-hidden whitespace-nowrap text-xs font-bold text-slate-950 flex-1 relative group">
              <div className="animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused] active:[animation-play-state:paused] flex items-center">
                {/* Dynamic Latest Item from Each of the 7 Target Sections - Primary Copy */}
                <div className="inline-flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 shrink-0">
                  {latestTickerItems.map(({ item, tag, emoji }) => (
                    <React.Fragment key={`ticker-item-1-${item.id}`}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className="inline-flex items-center gap-1.5 hover:underline cursor-pointer text-left group/ticker font-bold"
                        title="Click to view full details"
                      >
                        <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase tracking-wider shadow-xs">
                          {tag}
                        </span>
                        <span className="text-slate-950 font-bold group-hover/ticker:text-blue-900">
                          {emoji} <strong>{item.title}</strong>
                        </span>
                        {item.isNew && (
                          <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[8.5px] font-black font-mono animate-pulse">
                            NEW
                          </span>
                        )}
                      </button>
                      <span className="text-amber-800 font-black">•</span>
                    </React.Fragment>
                  ))}
                </div>

                {/* Duplicate Copy for Seamless Infinite Scrolling */}
                <div className="inline-flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 shrink-0" aria-hidden="true">
                  {latestTickerItems.map(({ item, tag, emoji }) => (
                    <React.Fragment key={`ticker-item-2-${item.id}`}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        tabIndex={-1}
                        className="inline-flex items-center gap-1.5 hover:underline cursor-pointer text-left group/ticker font-bold"
                      >
                        <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase tracking-wider shadow-xs">
                          {tag}
                        </span>
                        <span className="text-slate-950 font-bold group-hover/ticker:text-blue-900">
                          {emoji} <strong>{item.title}</strong>
                        </span>
                        {item.isNew && (
                          <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[8.5px] font-black font-mono">
                            NEW
                          </span>
                        )}
                      </button>
                      <span className="text-amber-800 font-black">•</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



        {/* Section Header & Search Input */}
        <div id="sarkari-board" className="max-w-7xl mx-auto mb-5 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            {/* Title & Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded text-[10px] font-black uppercase tracking-wider font-mono">
                ⚡ SARKARI DESK
              </span>
              <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight font-display">
                Sarkari Exam, Recruitment &amp; Results Desk
              </h2>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search exams, recruitment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-red-600 font-medium shadow-xs"
                id="sarkari-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CATEGORY TABS & QUICK FILTER BAR */}
        <div className="max-w-7xl mx-auto mb-4 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-sans ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
              }`}
            >
              All Notices ({SARKARI_DATA.length})
            </button>

            <button
              onClick={() => setActiveTab('jkssb')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm font-sans ${
                activeTab === 'jkssb'
                  ? 'bg-indigo-700 text-amber-300 ring-2 ring-indigo-500 shadow-indigo-700/30'
                  : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>JKSSB Jobs</span>
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9.5px] font-mono font-black rounded">
                {SARKARI_DATA.filter(s => s.category === 'jkssb').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-sans ${
                activeTab === 'jobs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Latest Jobs ({SARKARI_DATA.filter(s => s.category === 'jobs').length})
            </button>

            <button
              onClick={() => setActiveTab('admissions')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm font-sans ${
                activeTab === 'admissions'
                  ? 'bg-teal-700 text-amber-300 ring-2 ring-teal-500 shadow-teal-700/30'
                  : 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>KU Admissions</span>
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9.5px] font-mono font-black rounded">
                {SARKARI_DATA.filter(s => s.category === 'admissions').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('exam_forms')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm font-sans ${
                activeTab === 'exam_forms'
                  ? 'bg-amber-700 text-amber-300 ring-2 ring-amber-500 shadow-amber-700/30'
                  : 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>KU Exam Forms</span>
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9.5px] font-mono font-black rounded">
                {SARKARI_DATA.filter(s => s.category === 'exam_forms').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cluster_univ')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm font-sans ${
                activeTab === 'cluster_univ'
                  ? 'bg-cyan-800 text-cyan-200 ring-2 ring-cyan-500 shadow-cyan-800/30'
                  : 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>Cluster University</span>
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9.5px] font-mono font-black rounded">
                {SARKARI_DATA.filter(s => s.category === 'cluster_univ').length}
              </span>
            </button>


            <button
              onClick={() => setActiveTab('ssc_jobs')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm font-sans ${
                activeTab === 'ssc_jobs'
                  ? 'bg-orange-800 text-orange-200 ring-2 ring-orange-500 shadow-orange-800/30'
                  : 'bg-orange-50 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
              <span>SSC JOBS</span>
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9.5px] font-mono font-black rounded">
                {SARKARI_DATA.filter(s => s.category === 'ssc_jobs').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rrb_jobs')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm font-sans ${
                activeTab === 'rrb_jobs'
                  ? 'bg-emerald-800 text-emerald-200 ring-2 ring-emerald-500 shadow-emerald-800/30'
                  : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Train className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>RRB JOBS</span>
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9.5px] font-mono font-black rounded">
                {SARKARI_DATA.filter(s => s.category === 'rrb_jobs').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('army_jobs')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm font-sans ${
                activeTab === 'army_jobs'
                  ? 'bg-red-900 text-red-100 ring-2 ring-red-500 shadow-red-900/30'
                  : 'bg-red-50 dark:bg-red-950/70 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
              <span>INDIAN ARMY JOBS</span>
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9.5px] font-mono font-black rounded">
                {SARKARI_DATA.filter(s => s.category === 'army_jobs').length}
              </span>
            </button>
          </div>
        </div>

        {/* FEATURED JKSSB OFFICIAL BANNER WHEN JKSSB TAB IS ACTIVE */}
        {activeTab === 'jkssb' && (
          <div className="max-w-7xl mx-auto mb-5 p-4 sm:p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl text-white border border-indigo-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  OFFICIAL J&amp;K RECRUITMENT DESK
                </span>
                <span className="text-indigo-200 text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Notifications from jkssb.nic.in
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                Jammu &amp; Kashmir Services Selection Board (JKSSB) Notifications
              </h3>
              <p className="text-xs text-indigo-200 max-w-2xl font-medium">
                Official Department-wise post breakdown, total vacancies, qualification criteria, age limit relaxation, and application closing dates parsed directly from official notifications. Apply online via CSC DOST Desk or link directly to the official portal.
              </p>
            </div>
            <a
              href="https://jkssb.nic.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02]"
            >
              <span>Visit jkssb.nic.in</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* FEATURED KASHMIR UNIVERSITY OFFICIAL ADMISSIONS BANNER & EMBED HTML SECTION WHEN ADMISSIONS TAB IS ACTIVE */}
        {activeTab === 'admissions' && (
          <div className="max-w-7xl mx-auto mb-6 space-y-4">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 rounded-2xl text-white border border-teal-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                    OFFICIAL KASHMIR UNIVERSITY PORTAL
                  </span>
                  <span className="text-teal-200 text-xs font-mono font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Active Admission Notices from kashmiruniversity.net
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                  University of Kashmir Admission Updates (August 2026 Notices)
                </h3>
                <p className="text-xs text-teal-200 max-w-2xl font-medium">
                  Extracted Admission Registrations, 1st &amp; 2nd Selection Lists, Counseling Schedules, DDE Distance Mode Forms, Ph.D. Direct Admissions, and Diploma Notices posted on or after August 5, 2026.
                </p>
              </div>
              <a
                href="https://www.kashmiruniversity.net/admission.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 hover:scale-[1.02] font-bold"
              >
                <span>Visit kashmiruniversity.net</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* HTML Snippet Toolbar & Code Copy Box */}
            <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl border border-teal-800/80 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-teal-500/20 text-teal-400 rounded-lg">
                  <FileCheck className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    CSC Dost - KU Admissions (Kashmir Univ) HTML Embed Section
                    <span className="bg-teal-500/30 text-teal-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-teal-500/40">
                      Website Snippet
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Use the buttons below to view or copy the clean HTML code to paste into your website section.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setShowKuAdmissionsHtmlSource(!showKuAdmissionsHtmlSource)}
                  className="flex-1 md:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Code className="w-4 h-4" />
                  <span>{showKuAdmissionsHtmlSource ? 'Hide HTML Code' : 'View HTML Code'}</span>
                </button>
                <button
                  onClick={handleCopyKuAdmissionsHtml}
                  className="flex-1 md:flex-none px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {kuAdmissionsHtmlCopied ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Copied HTML!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy HTML Snippet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Source Code View */}
            {showKuAdmissionsHtmlSource && (
              <div className="p-4 bg-slate-950 text-teal-300 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto relative shadow-inner">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span>HTML Source Code Snippet (CSC Dost - KU Admissions)</span>
                  <button
                    onClick={handleCopyKuAdmissionsHtml}
                    className="px-2.5 py-1 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700 rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Code
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-all text-teal-300/90 max-h-80 overflow-y-auto font-mono text-[11.5px] leading-relaxed select-all">
                  {KU_ADMISSIONS_HTML_SNIPPET}
                </pre>
              </div>
            )}

            {/* Live Rendered HTML Snippet Container */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Live Rendered HTML Section (CSC Dost - KU Admissions)</span>
                <span className="text-[10px] text-teal-600 bg-teal-50 dark:bg-teal-950/60 font-mono font-bold px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  ● Embedded Preview
                </span>
              </div>
              <div
                className="csc-ku-admissions-html-live-wrapper"
                dangerouslySetInnerHTML={{ __html: KU_ADMISSIONS_HTML_SNIPPET }}
              />
            </div>
          </div>
        )}

        {/* FEATURED KASHMIR UNIVERSITY EXAMINATION FORMS BANNER & EMBED HTML SECTION WHEN EXAM_FORMS TAB IS ACTIVE */}
        {activeTab === 'exam_forms' && (
          <div className="max-w-7xl mx-auto mb-6 space-y-4">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 rounded-2xl text-white border border-amber-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                    OFFICIAL KASHMIR UNIVERSITY EXAMINATION DESK
                  </span>
                  <span className="text-amber-200 text-xs font-mono font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Active Exam Form Notices from kashmiruniversity.net
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                  University of Kashmir Exam Form Updates (August 2026 Notices)
                </h3>
                <p className="text-xs text-amber-200 max-w-2xl font-medium">
                  Extracted Active Exam Form Submission Notices (UG BG 4th Sem, PG 1st &amp; 3rd Sem, B.Ed 1st &amp; 2nd Sem, Professional B.Tech 4th/6th/8th Sem, DDE Distance Mode) posted on or after August 5, 2026.
                </p>
              </div>
              <a
                href="https://www.kashmiruniversity.net/Examination.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02] font-bold"
              >
                <span>Visit kashmiruniversity.net</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* HTML Snippet Toolbar & Code Copy Box */}
            <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl border border-amber-800/80 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <FileCheck className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    CSC Dost - KU Exam Forms (Kashmir Univ) HTML Embed Section
                    <span className="bg-amber-500/30 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                      Website Snippet
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Use the buttons below to view or copy the clean HTML code to paste into your website section.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setShowKuHtmlSource(!showKuHtmlSource)}
                  className="flex-1 md:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Code className="w-4 h-4" />
                  <span>{showKuHtmlSource ? 'Hide HTML Code' : 'View HTML Code'}</span>
                </button>
                <button
                  onClick={handleCopyKuHtml}
                  className="flex-1 md:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {kuHtmlCopied ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Copied HTML!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy HTML Snippet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Source Code View */}
            {showKuHtmlSource && (
              <div className="p-4 bg-slate-950 text-amber-300 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto relative shadow-inner">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span>HTML Source Code Snippet (CSC Dost - KU Exam Forms)</span>
                  <button
                    onClick={handleCopyKuHtml}
                    className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700 rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Code
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-all text-amber-300/90 max-h-80 overflow-y-auto font-mono text-[11.5px] leading-relaxed select-all">
                  {KU_EXAM_FORMS_HTML_SNIPPET}
                </pre>
              </div>
            )}

            {/* Live Rendered HTML Snippet Container */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Live Rendered HTML Section (CSC Dost - KU Exam Forms)</span>
                <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/60 font-mono font-bold px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  ● Embedded Preview
                </span>
              </div>
              <div
                className="csc-ku-exam-forms-html-live-wrapper"
                dangerouslySetInnerHTML={{ __html: KU_EXAM_FORMS_HTML_SNIPPET }}
              />
            </div>
          </div>
        )}

        {/* FEATURED CLUSTER UNIVERSITY BANNER & EMBED HTML SECTION WHEN CLUSTER_UNIV TAB IS ACTIVE */}
        {activeTab === 'cluster_univ' && (
          <div className="max-w-7xl mx-auto mb-6 space-y-4">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-2xl text-white border border-emerald-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                    OFFICIAL CLUSTER UNIVERSITY SRINAGAR DESK
                  </span>
                  <span className="text-emerald-200 text-xs font-mono font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Active Notifications from https://www.cusrinagar.edu.in/
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                  Cluster University Srinagar Admissions &amp; Exam Forms Desk (August 2026 Updates)
                </h3>
                <p className="text-xs text-emerald-200 max-w-2xl font-medium">
                  Extracted Active Admission &amp; Examination Notices (UG 3rd &amp; 5th Sem Exam Forms, PG &amp; Integrated Spot Admission Registration, B.Ed/M.Ed Exam Schedule, UG Batch 2026 Registration, UG Re-evaluation Forms) with Official Links and Application Deadlines.
                </p>
              </div>
              <a
                href="https://www.cusrinagar.edu.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02] font-bold"
              >
                <span>Visit www.cusrinagar.edu.in</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* HTML Snippet Toolbar & Code Copy Box */}
            <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl border border-emerald-800/80 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    CSC Dost - Cluster University Srinagar (cusrinagar.edu.in) HTML Embed Section
                    <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                      Website Snippet
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Use the buttons to view or copy the HTML code directly to paste into your website section.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setShowClusterUnivHtmlSource(!showClusterUnivHtmlSource)}
                  className="flex-1 md:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Code className="w-4 h-4" />
                  <span>{showClusterUnivHtmlSource ? 'Hide HTML Code' : 'View HTML Code'}</span>
                </button>
                <button
                  onClick={handleCopyClusterUnivHtml}
                  className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {clusterUnivHtmlCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Copied HTML!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy HTML Snippet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Source Code View */}
            {showClusterUnivHtmlSource && (
              <div className="p-4 bg-slate-950 text-emerald-300 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto relative shadow-inner">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span>HTML Source Code Snippet (CSC Dost - Cluster University Srinagar)</span>
                  <button
                    onClick={handleCopyClusterUnivHtml}
                    className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Code
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-all text-emerald-300/90 max-h-80 overflow-y-auto font-mono text-[11.5px] leading-relaxed select-all">
                  {CLUSTER_UNIV_HTML_SNIPPET}
                </pre>
              </div>
            )}

            {/* Live Rendered HTML Snippet Container */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Live Rendered HTML Section (CSC Dost - Cluster University Srinagar)</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  ● Embedded Preview
                </span>
              </div>
              <div
                className="csc-cluster-univ-html-live-wrapper"
                dangerouslySetInnerHTML={{ __html: CLUSTER_UNIV_HTML_SNIPPET }}
              />
            </div>
          </div>
        )}


        {/* FEATURED SSC JOBS BANNER & EMBED HTML SECTION WHEN SSC_JOBS TAB IS ACTIVE */}
        {activeTab === 'ssc_jobs' && (
          <div className="max-w-7xl mx-auto mb-6 space-y-4">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl text-white border border-indigo-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                    STAFF SELECTION COMMISSION (SSC) DESK
                  </span>
                  <span className="text-indigo-200 text-xs font-mono font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Active Notifications Extracted from https://ssc.gov.in/
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                  Staff Selection Commission Active Recruitment Desk (August 2026 Updates)
                </h3>
                <p className="text-xs text-indigo-200 max-w-2xl font-medium">
                  Extracted Active Job Notifications (SSC Steno Grade C &amp; D 2026, CGL Tier-I Exam City Slip, GD Constable 2026 Mega Notice, Selection Posts Phase-XIV Correction, CHSL Tier-II Date) with Department Details, Official Portal Links (ssc.gov.in), Eligibility Criteria, and Application Windows.
                </p>
              </div>
              <a
                href="https://ssc.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02] font-bold"
              >
                <span>Visit ssc.gov.in</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* HTML Snippet Toolbar & Code Copy Box */}
            <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl border border-indigo-800/80 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <Briefcase className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    CSC Dost - SSC Jobs (ssc.gov.in) HTML Embed Section
                    <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-500/40">
                      Website Snippet
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Use the buttons to view or copy the HTML code directly to paste into your website section.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setShowSscHtmlSource(!showSscHtmlSource)}
                  className="flex-1 md:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Code className="w-4 h-4" />
                  <span>{showSscHtmlSource ? 'Hide HTML Code' : 'View HTML Code'}</span>
                </button>
                <button
                  onClick={handleCopySscHtml}
                  className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {sscHtmlCopied ? (
                    <>
                      <Check className="w-4 h-4 text-indigo-200" />
                      <span>Copied HTML!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy HTML Snippet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Source Code View */}
            {showSscHtmlSource && (
              <div className="p-4 bg-slate-950 text-indigo-300 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto relative shadow-inner">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span>HTML Source Code Snippet (CSC Dost - SSC Jobs)</span>
                  <button
                    onClick={handleCopySscHtml}
                    className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Code
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-all text-indigo-300/90 max-h-80 overflow-y-auto font-mono text-[11.5px] leading-relaxed select-all">
                  {SSC_JOBS_HTML_SNIPPET}
                </pre>
              </div>
            )}

            {/* Live Rendered HTML Snippet Container */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Live Rendered HTML Section (CSC Dost - SSC Jobs)</span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 font-mono font-bold px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  ● Embedded Preview
                </span>
              </div>
              <div
                className="csc-ssc-html-live-wrapper"
                dangerouslySetInnerHTML={{ __html: SSC_JOBS_HTML_SNIPPET }}
              />
            </div>
          </div>
        )}

        {/* FEATURED RRB JOBS BANNER & EMBED HTML SECTION WHEN RRB_JOBS TAB IS ACTIVE */}
        {activeTab === 'rrb_jobs' && (
          <div className="max-w-7xl mx-auto mb-6 space-y-4">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl text-white border border-emerald-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                    RAILWAY RECRUITMENT BOARD (RRB) DESK
                  </span>
                  <span className="text-emerald-200 text-xs font-mono font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Active Notifications Extracted from https://www.rrbapply.gov.in/
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                  Railway Recruitment Board Active Recruitment Desk (RRB JE, Paramedical, ALP, Technician, NTPC)
                </h3>
                <p className="text-xs text-emerald-200 max-w-2xl font-medium">
                  Extracted Active Railway Job Notifications with Department Details, Official Exam Form Link (rrbapply.gov.in), Eligibility Criteria, Age Limits, and Last Date with strict filtering out of expired notifications.
                </p>
              </div>
              <a
                href="https://www.rrbapply.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02] font-bold"
              >
                <span>Visit rrbapply.gov.in</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* HTML Snippet Toolbar & Code Copy Box */}
            <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl border border-emerald-800/80 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    CSC Dost - RRB Jobs HTML Embed Section
                    <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                      Website Snippet
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Use the buttons to view or copy the HTML code directly to paste into your website.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setShowRrbHtmlSource(!showRrbHtmlSource)}
                  className="flex-1 md:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Code className="w-4 h-4" />
                  <span>{showRrbHtmlSource ? 'Hide HTML Code' : 'View HTML Code'}</span>
                </button>
                <button
                  onClick={handleCopyRrbHtml}
                  className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {rrbHtmlCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Copied HTML!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy HTML Snippet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Source Code View */}
            {showRrbHtmlSource && (
              <div className="p-4 bg-slate-950 text-emerald-300 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto relative shadow-inner">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span>HTML Source Code Snippet (CSC Dost - RRB Jobs)</span>
                  <button
                    onClick={handleCopyRrbHtml}
                    className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Code
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-all text-emerald-400/90 max-h-80 overflow-y-auto font-mono text-[11.5px] leading-relaxed select-all">
                  {RRB_JOBS_HTML_SNIPPET}
                </pre>
              </div>
            )}

            {/* Live Rendered HTML Snippet Container */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Live Rendered HTML Section (CSC Dost - RRB Jobs)</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  ● Embedded Preview
                </span>
              </div>
              <div
                className="csc-rrb-html-live-wrapper"
                dangerouslySetInnerHTML={{ __html: RRB_JOBS_HTML_SNIPPET }}
              />
            </div>
          </div>
        )}

        {/* FEATURED INDIAN ARMY JOBS BANNER & EMBED HTML SECTION WHEN ARMY_JOBS TAB IS ACTIVE */}
        {activeTab === 'army_jobs' && (
          <div className="max-w-7xl mx-auto mb-6 space-y-4">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950 via-slate-900 to-red-900 rounded-2xl text-white border border-red-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                    INDIAN ARMY RECRUITMENT DESK
                  </span>
                  <span className="text-red-200 text-xs font-mono font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-red-400" />
                    Active Notifications Extracted from https://www.joinindianarmy.nic.in/
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                  Join Indian Army Active Officer &amp; Agniveer Recruitment Desk
                </h3>
                <p className="text-xs text-red-200 max-w-2xl font-medium">
                  Extracted Active Indian Army Notifications (NCC Special Entry 125th, JAG Entry 34th, Territorial Army Officer Entry, Ladakh Scouts Agniveer Rally, AOC Civilian Alert) with Department Details, Official Exam Form Link (joinindianarmy.nic.in), Eligibility, Age Limits, and Last Date with strict filtering out of expired notifications.
                </p>
              </div>
              <a
                href="https://www.joinindianarmy.nic.in/default.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02] font-bold"
              >
                <span>Visit joinindianarmy.nic.in</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* HTML Snippet Toolbar & Code Copy Box */}
            <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl border border-red-800/80 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                  <Shield className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    CSC Dost - Indian Army Jobs HTML Embed Section
                    <span className="bg-red-500/30 text-red-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-red-500/40">
                      Website Snippet
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Use the buttons to view or copy the HTML code directly to paste into your website.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setShowArmyHtmlSource(!showArmyHtmlSource)}
                  className="flex-1 md:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-red-300 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Code className="w-4 h-4" />
                  <span>{showArmyHtmlSource ? 'Hide HTML Code' : 'View HTML Code'}</span>
                </button>
                <button
                  onClick={handleCopyArmyHtml}
                  className="flex-1 md:flex-none px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {armyHtmlCopied ? (
                    <>
                      <Check className="w-4 h-4 text-red-200" />
                      <span>Copied HTML!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy HTML Snippet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Source Code View */}
            {showArmyHtmlSource && (
              <div className="p-4 bg-slate-950 text-red-300 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto relative shadow-inner">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span>HTML Source Code Snippet (CSC Dost - Indian Army Jobs)</span>
                  <button
                    onClick={handleCopyArmyHtml}
                    className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-700 rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Code
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-all text-red-400/90 max-h-80 overflow-y-auto font-mono text-[11.5px] leading-relaxed select-all">
                  {ARMY_JOBS_HTML_SNIPPET}
                </pre>
              </div>
            )}

            {/* Live Rendered HTML Snippet Container */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Live Rendered HTML Section (CSC Dost - Indian Army Jobs)</span>
                <span className="text-[10px] text-red-600 bg-red-50 dark:bg-red-950/60 font-mono font-bold px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                  ● Embedded Preview
                </span>
              </div>
              <div
                className="csc-army-html-live-wrapper"
                dangerouslySetInnerHTML={{ __html: ARMY_JOBS_HTML_SNIPPET }}
              />
            </div>
          </div>
        )}

        {/* COMPACT SARKARI BOXES GRID (2 columns on mobile, 2 on tablet, 3 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-5 max-w-7xl mx-auto w-full">
            {[
              { id: 'army_jobs', title: 'Indian Army Jobs', icon: Shield, color: 'bg-red-950 text-red-200 border-red-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'rrb_jobs', title: 'RRB Jobs', icon: Train, color: 'bg-emerald-950 text-emerald-200 border-emerald-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'ssc_jobs', title: 'SSC Jobs', icon: Briefcase, color: 'bg-orange-950 text-orange-200 border-orange-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'cluster_univ', title: 'Cluster University', icon: Building2, color: 'bg-cyan-950 text-cyan-200 border-cyan-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'jkssb', title: 'JKSSB Jobs', icon: Briefcase, color: 'bg-indigo-950 text-amber-300 border-indigo-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'exam_forms', title: 'KU Exam Forms', icon: FileCheck, color: 'bg-amber-950 text-amber-300 border-amber-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'admissions', title: 'KU Admissions', icon: GraduationCap, color: 'bg-teal-950 text-amber-300 border-teal-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'jobs', title: 'Latest Jobs', icon: Briefcase, color: 'bg-[#ab0000] text-white border-[#ab0000]' },
            ]
              .filter(box => activeTab === 'all' || activeTab === box.id)
              .map(box => {
                const boxItems = getItemsByCategory(box.id as any);
                const IconComp = box.icon;
                return (
                  <div
                    key={box.id}
                    className={`bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border sm:border-2 overflow-hidden shadow-xs sm:shadow-md flex flex-col transition-all duration-300 ${
                      box.id === 'jkssb' ? 'border-indigo-600 dark:border-indigo-800' : 'border-[#ab0000] dark:border-slate-800'
                    }`}
                    id={`sarkari-box-${box.id}`}
                  >
                    {/* Header Bar */}
                    <div className={`${box.color || 'bg-[#ab0000] text-white'} px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between font-black uppercase text-xs sm:text-base tracking-wider font-display shrink-0 shadow-xs`}>
                      <div className="flex items-center gap-1 sm:gap-2 truncate">
                        <IconComp className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-amber-300 shrink-0" />
                        <span className="truncate">{box.title}</span>
                      </div>
                      <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ml-1 ${box.badgeColor || 'bg-black/30 text-white'}`}>
                        {boxItems.length}
                      </span>
                    </div>

                    {/* Compact Scrollable List Box */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[360px] sm:max-h-[420px] overflow-y-auto scrollbar-thin">
                      {boxItems.length > 0 ? (
                        boxItems.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="p-2 sm:p-3.5 hover:bg-amber-500/10 dark:hover:bg-slate-800/80 transition-all cursor-pointer flex items-start gap-1.5 sm:gap-2.5 group"
                            id={`sarkari-box-item-${item.id}`}
                          >
                            <span className={`${box.id === 'jkssb' ? 'text-indigo-600 dark:text-amber-400' : 'text-[#ab0000] dark:text-amber-400'} font-extrabold text-xs sm:text-base shrink-0 leading-none mt-0.5`}>•</span>
                            <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                              <p className="text-[11px] sm:text-[13px] font-bold text-blue-900 dark:text-blue-300 group-hover:text-indigo-700 dark:group-hover:text-amber-400 group-hover:underline leading-snug transition-colors font-sans line-clamp-3 sm:line-clamp-none">
                                {item.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 text-[9px] sm:text-[10px] font-mono text-slate-500">
                                {item.isNew && (
                                  <span className="px-1 py-0.1 bg-red-700 text-white font-black text-[8.5px] sm:text-[9.5px] rounded animate-pulse">
                                    NEW
                                  </span>
                                )}
                                {item.totalPosts && (
                                  <span className="px-1 py-0.1 bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 font-bold rounded truncate max-w-[90px] sm:max-w-none">
                                    {item.totalPosts}
                                  </span>
                                )}
                                {item.lastDate && (
                                  <span className="text-red-600 dark:text-red-400 font-bold">
                                    Last: {item.lastDate}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 sm:p-8 text-center text-xs text-slate-400 italic">
                          No notices matching search filter
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

        {/* 2. 🏛️ CSC DOST SECURE PORTAL HEADER & VERIFIED DESK CARD */}
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 mt-12">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#2f2b80] text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-widest font-mono">
                  CSC DOST SECURE PORTAL
                </span>
                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-widest font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>🔒 SECURE SSL - Gateway Active</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display leading-tight">
                Digital Application &amp; Appointment Desk
              </h1>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Instant Online Government Form Filing, Sarkari Jobs Apply, and PVC e-Services Verification
              </p>
            </div>

            {/* Top Right Track Order Pill */}
            <TrackApplication />
          </div>

          {/* 🚀 HERO MAIN APPLICATION FORM */}
          <div id="booking-portal-form" className="mb-8 scroll-mt-24 w-full">
            {!isFormSubmitted ? (
              <div className="w-full">
                
                {/* OFFICIAL APPLICATION FORM */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md overflow-hidden">
                  
                  {/* Dark Blue Header Banner */}
                  <div className="bg-[#18204e] text-white px-5 py-3.5 flex items-center justify-between border-b border-indigo-900">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <h2 className="text-sm font-extrabold uppercase tracking-wide font-sans text-white">
                        📑 Official Application Form
                      </h2>
                    </div>
                    <span className="bg-indigo-950/80 text-amber-300 border border-indigo-700/60 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                      Form Ref: CSC21251567001
                    </span>
                  </div>

                  {/* Form Sub-Container */}
                  <div className="p-4 sm:p-6 space-y-5">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Please provide your correct details below. Our CSC team will process your application on the official government portal.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Applicant Name Input */}
                      <div className="space-y-1.5">
                        <label htmlFor="applicant-name-input" className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
                          Applicant Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="applicant-name-input"
                            type="text"
                            required
                            placeholder="e.g. Wasim Ahmad"
                            value={formData.customerName}
                            onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">Must match Aadhaar records</p>
                      </div>

                      {/* WhatsApp Mobile Number */}
                      <div className="space-y-1.5">
                        <label htmlFor="whatsapp-mobile-input" className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
                          WhatsApp Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="whatsapp-mobile-input"
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="e.g. 7006833767"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/\D/g, '') }))}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">For instant SMS/WhatsApp Token Receipts</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Service Selection Dropdown */}
                      <div className="space-y-1.5">
                        <label htmlFor="select-service-dropdown" className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
                          Select Service to Apply <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="select-service-dropdown"
                          value={formData.selectedService}
                          onChange={(e) => {
                            const sVal = e.target.value;
                            handleServiceChange(sVal);
                            setUploadedFiles([]);
                            setDocumentError(null);
                          }}
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans cursor-pointer"
                        >
                          <option value="">-- Choose a Service / Exam --</option>
                          
                          {/* Fallback option if selected service is active but not in standard list */}
                          {formData.selectedService && 
                           !SARKARI_DATA.some(s => s.title === formData.selectedService) && 
                           !SERVICES_LIST.some(serv => serv.name === formData.selectedService) && 
                           formData.selectedService !== 'Custom Unlisted Request' && (
                             <option value={formData.selectedService}>
                               📌 Selected: {formData.selectedService}
                             </option>
                          )}

                          <optgroup label="🔥 SARKARI EXAMS & RECRUITMENT NOTIFICATIONS">
                            {SARKARI_DATA.map(s => (
                              <option key={s.id} value={s.title}>
                                {s.title} {s.lastDate ? `(Last Date: ${s.lastDate})` : ''}
                              </option>
                            ))}
                          </optgroup>

                          <optgroup label="⚡ COMPREHENSIVE CSC E-SERVICES & DIGITAL CATALOGUE">
                            {SERVICES_LIST.map(serv => (
                              <option key={serv.id} value={serv.name}>
                                {serv.name} ({serv.price})
                              </option>
                            ))}
                          </optgroup>

                          <option value="Custom Unlisted Request">Other Custom Request / Form Filing</option>
                        </select>
                      </div>

                      {/* Applicant Category */}
                      <div className="space-y-1.5">
                        <label htmlFor="applicant-category-select" className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
                          Applicant Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="applicant-category-select"
                          value={formData.userCategory}
                          onChange={(e) => {
                            const cat = e.target.value as 'genObc' | 'scSt' | 'female';
                            setFormData(prev => ({ ...prev, userCategory: cat }));
                          }}
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans cursor-pointer"
                        >
                          <option value="genObc">General / OBC / Unreserved</option>
                          <option value="scSt">SC / ST / PwD Candidates</option>
                          <option value="female">Female Candidates (All Categories)</option>
                        </select>
                      </div>
                    </div>

                    {/* CUSTOM SERVICE TEXT FIELD */}
                    {formData.selectedService === 'Custom Unlisted Request' && (
                      <div className="space-y-1.5 animate-fade-in">
                        <label htmlFor="custom-service-input" className="block text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider font-sans">
                          Specify Your Custom Service / Unlisted Exam Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="custom-service-input"
                          type="text"
                          required
                          placeholder="e.g. JK Revenue Land Passbook / University Re-evaluation Form"
                          value={formData.customServiceText}
                          onChange={(e) => setFormData(prev => ({ ...prev, customServiceText: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all font-sans"
                        />
                      </div>
                    )}

                    {/* SINGLE MANDATORY DOCUMENT UPLOAD (AADHAAR OR SCHOOL ID CARD) */}
                    <div className="bg-slate-50 dark:bg-slate-950/80 border-2 border-dashed border-indigo-300 dark:border-indigo-800 rounded-2xl p-4 sm:p-5 space-y-3 font-sans">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                Mandatory ID Verification Document
                              </h4>
                              <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[9px] font-black uppercase font-mono">
                                MANDATORY
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Upload <strong>Aadhaar Card</strong> or <strong>School / College ID Card</strong> (Photo or PDF, max 10MB)
                            </p>
                          </div>
                        </div>

                        {uploadedFiles.length > 0 && (
                          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            ID Attached
                          </span>
                        )}
                      </div>

                      {uploadedFiles.length > 0 ? (
                        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {uploadedFiles[0].name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {(uploadedFiles[0].size / 1024).toFixed(1)} KB • Aadhaar / School ID
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveMandatoryDoc}
                            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-300 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                          >
                            Remove / Change
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 p-5 bg-white dark:bg-slate-900 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 rounded-xl border border-indigo-200 dark:border-indigo-900 cursor-pointer transition-all group">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 underline">
                              Click to select Aadhaar or School ID
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400"> or drag and drop here</span>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                              Accepted formats: JPG, PNG, WebP, PDF (Up to 10MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleMandatoryIdUpload}
                            className="hidden"
                          />
                        </label>
                      )}

                      {/* Informational Callout About Post-Completion Documents */}
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-900 dark:text-blue-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Info className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>No other documents required right now!</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-5">
                          Only your Aadhaar or Student ID is needed to register your token. Remaining academic marksheet copies, photographs, and certificates will be collected by the CSC operator after your initial registration.
                        </p>
                      </div>

                      {documentError && (
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 p-2.5 rounded-lg border border-red-200 dark:border-red-900">
                          {documentError}
                        </p>
                      )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={isProcessingFiles}
                        onClick={handleFormSubmit}
                        className="w-full py-4 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        id="submit-booking-form-btn"
                      >
                        {isProcessingFiles ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating CSC Application Token...</span>
                          </>
                        ) : (
                          <>
                            <span>SUBMIT &amp; ISSUE OFFICIAL CSC APPLICATION TOKEN</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <p className="text-[10.5px] text-center text-slate-500 font-medium mt-2 flex items-center justify-center gap-1">
                        <span>🔒 Instant token generation • No advance payment required • Pay at CSC Center</span>
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              /* SUBMISSION STEP: OFFICIAL CSC REGISTRATION CONFIRMATION & POST-COMPLETION DOCUMENTS DESK */
              <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-600 shadow-xl overflow-hidden animate-fade-in text-slate-900 dark:text-white font-sans" id="printable-receipt-area">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#0f766e] text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-md">
                      <CheckCircle className="w-6 h-6 text-slate-950" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-200">
                        OFFICIAL CSC APPLICATION DESK
                      </span>
                      <h3 className="text-base sm:text-lg font-black uppercase tracking-wide">
                        Application Registered Successfully!
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-400 text-slate-950 rounded-lg text-xs font-mono font-black shadow-xs uppercase">
                      TOKEN: {submissionReceipt?.appId}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
                  
                  {/* Token Box Notice */}
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 font-sans">
                        Your Official Application Token Reference ID is Issued & Saved in Records
                      </p>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300 font-mono font-black mt-0.5">
                        Token Ref: <span className="text-emerald-950 dark:text-amber-300 font-extrabold text-base">{submissionReceipt?.appId}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (submissionReceipt?.appId) {
                          navigator.clipboard.writeText(submissionReceipt.appId);
                          alert(`Token ID ${submissionReceipt.appId} copied to clipboard!`);
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider font-mono cursor-pointer shrink-0 shadow-xs"
                    >
                      Copy Token ID
                    </button>
                  </div>

                  {/* Applicant & Service Summary Card */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Applicant: {submissionReceipt?.customerName}</span>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">Mobile: {submissionReceipt?.phoneNumber}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Selected Service</span>
                        <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{submissionReceipt?.selectedService}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Mandatory Document</span>
                        <p className="font-bold text-emerald-700 dark:text-emerald-400 text-xs truncate">
                          {submissionReceipt?.mandatoryDocName || 'Aadhaar Card / School ID (Attached)'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Payment Terms</span>
                        <p className="font-bold text-amber-700 dark:text-amber-400 text-xs">
                          Pay at Center Upon Completion (No Advance Online Payment)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* POST-SUBMISSION REQUIRED DOCUMENTS PANEL */}
                  {(() => {
                    const postDocs = getPostCompletionRequiredDocs(submissionReceipt?.selectedService || '');
                    return (
                      <div className="bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800/80 rounded-xl p-4 sm:p-5 space-y-3 font-sans">
                        <div className="flex items-center gap-2 border-b border-amber-200 dark:border-amber-900/60 pb-2">
                          <FileCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
                          <div>
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 dark:text-amber-200">
                              Documents You May Be Asked For After Application Completion
                            </h4>
                            <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                              Keep these original / scanned copies ready when our CSC operator contacts you for final submission:
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {postDocs.map((doc, idx) => (
                            <div 
                              key={idx}
                              className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-lg p-2.5 flex items-start gap-2 shadow-2xs"
                            >
                              <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center text-[10px] font-black shrink-0 font-mono mt-0.5">
                                ✓
                              </span>
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                  {doc.name}
                                </p>
                                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
                                  {doc.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Submission Notice & Center Instructions */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1.5 font-sans">
                    <p className="font-bold text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                      <span>Next Steps &amp; Application Processing</span>
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      1. Your application reference token is active in our central CSC registry.
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      2. Our authorized VLE operator will review your application details, verify eligibility on the official portal, and coordinate with you on WhatsApp.
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      3. You can also visit our physical CSC Digital Seva Kendra (Near J&amp;K Bank, Lar Ganderbal) with your Token Ref ID: <strong>{submissionReceipt?.appId}</strong>.
                    </p>
                  </div>

                </div>

                {/* Bottom Action Bar (no-print) */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 no-print">
                  <button
                    type="button"
                    onClick={() => {
                      if (!submissionReceipt) return;
                      const msg = `*CSC DOST — Application Registration Confirmation*
*Token ID:* ${submissionReceipt.appId}
*Applicant Name:* ${submissionReceipt.customerName}
*Mobile:* ${submissionReceipt.phoneNumber}
*Service Requested:* ${submissionReceipt.selectedService}
*Mandatory Document:* ${submissionReceipt.mandatoryDocName || 'Aadhaar / School ID Attached'}
*Payment Terms:* Pay at Center Upon Form Completion`;
                      window.open(`https://wa.me/917006833767?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/30"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send to WhatsApp Desk</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintSlip}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 font-sans shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Registration Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFormSubmitted(false);
                      setUtrError(null);
                      setDocumentError(null);
                      setUploadedFiles([]);
                      setFormData({
                        customerName: '',
                        phoneNumber: '',
                        emailAddress: '',
                        dateOfBirth: '',
                        selectedService: '',
                        customServiceText: '',
                        userCategory: 'genObc',
                        paymentMode: 'online',
                        utrNumber: '',
                        additionalDetails: '',
                        portalFee: 70,
                        applicationFee: 0
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1.5 font-sans"
                  >
                    <Home className="w-3.5 h-3.5 text-amber-400" />
                    <span>Submit Another Request</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* DETAILED SARKARI DEDICATED POST PAGE VIEW */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in overflow-hidden">
          <div 
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 transform scale-100 transition-all duration-300"
            id={`sarkari-detail-modal-${selectedItem.id}`}
          >
            {/* Top Breadcrumb & Clean High-Contrast Light/Blue Header Banner */}
            <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-200 relative bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#1e1b4b] text-white shrink-0 shadow-sm">
              <div className="space-y-2 pr-10">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-200">
                  <span className="font-bold text-amber-300">Sarkari Desk</span>
                  <span>/</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${SARKARI_CATEGORIES[selectedItem.category].color}`}>
                    {SARKARI_CATEGORIES[selectedItem.category].label}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-100 font-mono bg-blue-900/80 px-2.5 py-0.5 rounded border border-blue-400/30 shadow-xs">
                    {getOrgName(selectedItem)}
                  </span>
                  {selectedItem.isNew && (
                    <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[9px] uppercase tracking-wider rounded animate-pulse shadow-xs">
                      ⚡ LATEST NOTIFICATION
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-2xl font-black tracking-tight leading-snug font-sans text-white drop-shadow-xs">
                  {selectedItem.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 absolute right-3.5 top-3.5 sm:top-4">
                <button
                  type="button"
                  onClick={() => handleShareSarkari(selectedItem)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105"
                  title="Share this Post"
                  id="sarkari-post-top-share-btn"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share Post</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-2 bg-white/15 hover:bg-white/30 text-white rounded-full transition-all cursor-pointer border border-white/20 shadow-xs"
                  title="Close Post View"
                  id="sarkari-post-top-close-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Post Content Body - Clean Document Flow (No nested boxes) */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-sm scrollbar-thin bg-white">
              
              {/* Important Alert Strip - Clean Left Callout */}
              <div className="border-l-4 border-amber-500 bg-amber-50/70 p-4 rounded-r-lg space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-700 shrink-0" />
                  <h4 className="text-xs font-bold text-amber-950">
                    Candidate Verification Advisory
                  </h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Ensure all certificates (Aadhaar, Educational Marksheets, Category / Caste Certificates) match your full name and date of birth exactly before submitting. Applications processed through our CSC Desk undergo mandatory VLE verification.
                </p>
                {selectedItem.lastDate && (
                  <p className="text-xs font-semibold text-red-700 pt-0.5">
                    Application Closing Deadline: <span className="underline font-bold">{selectedItem.lastDate}</span>
                  </p>
                )}
              </div>

              {/* Overview & Short Description */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <span>Overview &amp; Notification Summary</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    Published: <strong className="text-slate-900 font-semibold">{selectedItem.postDate}</strong>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <strong className="font-semibold text-slate-900">{getOrgName(selectedItem)}</strong> has officially published the notification for <strong className="font-semibold text-slate-900">{selectedItem.title}</strong>. {selectedItem.shortInfo || 'Interested and eligible candidates can read the complete notification details, eligibility criteria, age limits, and fee structure below before submitting their online application form.'}
                </p>
              </div>

              {/* Important Dates & Application Fees Side-by-Side in Clean Document Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                
                {/* Important Dates */}
                <div className="space-y-2.5">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    <span>Important Dates Schedule</span>
                  </h4>
                  <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                    <div className="py-2 flex justify-between gap-4">
                      <span className="text-slate-600">Notification Released</span>
                      <span className="font-semibold text-slate-900">{selectedItem.postDate}</span>
                    </div>
                    <div className="py-2 flex justify-between gap-4">
                      <span className="text-slate-600">Application Start Date</span>
                      <span className="font-semibold text-emerald-700">{selectedItem.startDate || selectedItem.postDate}</span>
                    </div>
                    <div className="py-2 flex justify-between gap-4">
                      <span className="text-slate-600">Last Date to Apply</span>
                      <span className="font-bold text-red-600">{selectedItem.lastDate || 'As per notification'}</span>
                    </div>
                    <div className="py-2 flex justify-between gap-4">
                      <span className="text-slate-600">Last Date Pay Fee</span>
                      <span className="font-semibold text-slate-900">{selectedItem.lastDate || 'Same as last date'}</span>
                    </div>
                    <div className="py-2 flex justify-between gap-4">
                      <span className="text-slate-600">Exam Date / Admit Card</span>
                      <span className="font-medium text-indigo-900">
                        {selectedItem.category === 'army_jobs' ? 'Check joinindianarmy.nic.in' : selectedItem.category === 'rrb_jobs' ? 'Check rrbapply.gov.in' : selectedItem.category === 'ssc_jobs' ? 'Check ssc.gov.in' : selectedItem.category === 'cluster_univ' ? 'Check cusrinagar.edu.in' : 'To be notified on official portal'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fee Structure */}
                <div className="space-y-2.5">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    <span>Fee Structure &amp; Charges</span>
                  </h4>
                  <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {selectedItem.feePerSubject && (
                      <div className="py-2 flex justify-between gap-4">
                        <span className="text-slate-600">Fee Per Subject / Paper</span>
                        <span className="font-bold text-amber-900">{selectedItem.feePerSubject}</span>
                      </div>
                    )}
                    <div className="py-2 flex justify-between gap-4">
                      <span className="text-slate-600">General / OBC Candidates</span>
                      <span className="font-semibold text-slate-900">{selectedItem.fees?.genObc || 'As per subject paper'}</span>
                    </div>
                    <div className="py-2 flex justify-between gap-4">
                      <span className="text-slate-600">SC / ST / Reserved</span>
                      <span className="font-semibold text-emerald-700">{selectedItem.fees?.scSt || 'As per rules'}</span>
                    </div>
                    <div className="py-2 flex justify-between gap-4">
                      <span className="text-slate-600">Payment Mode</span>
                      <span className="font-medium text-slate-800">Online NetBanking / UPI / Debit Card</span>
                    </div>
                    {selectedItem.totalPosts && (
                      <div className="py-2 flex justify-between gap-4">
                        <span className="text-slate-600">Total Posts / Seats</span>
                        <span className="font-bold text-blue-900">{selectedItem.totalPosts}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Department Breakdown Clean Table */}
              {selectedItem.departmentBreakdown && selectedItem.departmentBreakdown.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Briefcase className="w-4 h-4 text-blue-700" />
                    <span>Department &amp; Cadre Breakdown</span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-600 text-xs font-semibold">
                          <th className="py-2.5 pr-4">Department / Wing</th>
                          <th className="py-2.5 pr-4">Post Title</th>
                          <th className="py-2.5 px-3 text-center">Seats / Posts</th>
                          <th className="py-2.5 pl-4">Qualification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {selectedItem.departmentBreakdown.map((dept, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="py-2.5 pr-4 font-semibold text-slate-900">{dept.department}</td>
                            <td className="py-2.5 pr-4 text-blue-900 font-medium">{dept.postName}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-900">{dept.posts}</td>
                            <td className="py-2.5 pl-4 text-slate-600 text-xs">{dept.qualification}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Age Specifications & Qualification */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Eligibility &amp; Qualification Criteria</span>
                </h4>

                <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {selectedItem.ageLimit && (
                    <p>
                      <strong className="text-slate-900 font-semibold">Age Limit: </strong>
                      <span>{selectedItem.ageLimit}</span>
                    </p>
                  )}
                  <p>
                    <strong className="text-slate-900 font-semibold">Educational Qualification: </strong>
                    <span>{selectedItem.eligibility || 'Graduate Degree / 10th / 12th Pass from recognized board in India.'}</span>
                  </p>
                </div>
              </div>

              {/* Required Documents Checklist */}
              {!['answer_keys', 'syllabus', 'results'].includes(selectedItem.category) && (
                <div className="space-y-2.5 pt-1">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Documents Required for CSC Desk Submission</span>
                  </h4>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Aadhaar Card / Govt Photo ID</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Educational Certificate / Marksheet</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Passport Photo &amp; Signature Scan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Caste / Domicile Certificate (if applicable)</span>
                    </li>
                  </ul>
                </div>
              )}

            </div>

            {/* Bottom Navigation Buttons (Fixed Bar) */}
            <div className="p-4 sm:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 sm:px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-300 flex items-center gap-1.5"
                  id="sarkari-post-close-btn"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareSarkari(selectedItem)}
                  className="px-4 sm:px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:scale-[1.01]"
                  id="sarkari-post-share-btn"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Post</span>
                </button>
              </div>

              {!['answer_keys', 'syllabus', 'results'].includes(selectedItem.category) && (
                <button
                  type="button"
                  onClick={() => handleApplyNow(selectedItem)}
                  className="px-6 sm:px-8 py-2.5 bg-[#172554] hover:bg-[#1e3a8a] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2.5 shadow-md shadow-blue-900/20 cursor-pointer hover:scale-[1.01]"
                  id="sarkari-post-apply-btn"
                >
                  <span>Apply via CSC Desk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SHARE OPTIONS POPUP MODAL */}
      {showShareModal && activeShareData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base font-display">Share Notification / Post</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Share <strong className="text-slate-900 dark:text-white">{activeShareData.name}</strong> directly with candidates, friends or on social channels:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {/* WhatsApp Share */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(activeShareData.text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs transition-all shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-white" />
                  <span>Share on WhatsApp</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {/* Telegram Share */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(activeShareData.url)}&text=${encodeURIComponent(activeShareData.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold text-xs transition-all shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-white" />
                  <span>Share on Telegram</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {/* Copy Direct Link */}
              <button
                type="button"
                onClick={() => copyToClipboard(activeShareData.url, 'Post Direct Link')}
                className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-xs transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Copy className="w-5 h-5 text-amber-500" />
                  <span>Copy Direct Post Link</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">URL Only</span>
              </button>

              {/* Copy Full Post Info */}
              <button
                type="button"
                onClick={() => copyToClipboard(activeShareData.text, 'Full Post Details')}
                className="flex items-center justify-between p-3.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-950 dark:text-indigo-200 rounded-2xl font-bold text-xs transition-all border border-indigo-200 dark:border-indigo-800/80 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Copy Full Post Text & Link</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-500">Text + Link</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
              {activeShareData.url}
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK NOTIFICATION */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-[70] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce font-bold text-xs">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{shareToast}</span>
        </div>
      )}

    </section>
  );
}
