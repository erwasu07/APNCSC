import React, { useState, useEffect } from 'react';
import TrackApplication from './TrackApplication';
import { db } from '../lib/firebase';
import { getSupabaseClient, uploadMultipleDocumentsToSupabase } from '../lib/supabase';
import { processRazorpayPayment } from '../lib/razorpay';
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
  Home
} from 'lucide-react';
import { SARKARI_DATA, SARKARI_CATEGORIES, SarkariItem } from '../data/sarkariData';
import { SERVICES_LIST } from '../servicesData';
import { UploadedDocument } from '../types';

interface SarkariResultDeskProps {
  onApplyService: (serviceName: string) => void;
  selectedService?: string;
}

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

export default function SarkariResultDesk({ onApplyService, selectedService }: SarkariResultDeskProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<SarkariItem | null>(null);
  const [clickedItemId, setClickedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'admit_cards' | 'results' | 'answer_keys' | 'syllabus' | 'admissions'>('all');
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
    portalFee: 50, // Processing charge
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
      const fallbackText = encodeURIComponent(`🧾 Official Invoice - ${receiptData.selectedService}\nToken: ${receiptData.appId}\nAmount: ₹${receiptData.totalAmount || 50}`);

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

  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: DocumentTypeConfig) => {
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
          docTypeId: docType.id,
          docTypeName: docType.name,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl,
          rawFile: file
        };
        setUploadedFiles(prev => [
          ...prev.filter(f => f.docTypeId !== docType.id),
          newDoc
        ]);
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

  const handleRemoveDocByTypeId = (docTypeId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.docTypeId !== docTypeId));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentError(null);
      const filesArray = Array.from(e.target.files as FileList);

      // Check max size (10MB limit per file)
      for (const file of filesArray) {
        if (file.size > 10 * 1024 * 1024) {
          setDocumentError(`File "${file.name}" exceeds the maximum size limit of 10MB.`);
          return;
        }
      }

      setIsProcessingFiles(true);
      let loadedCount = 0;

      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const newDoc: UploadedDocument = {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            dataUrl,
            rawFile: file
          };
          setUploadedFiles(prev => [...prev, newDoc]);
          loadedCount++;
          if (loadedCount === filesArray.length) {
            setIsProcessingFiles(false);
          }
        };
        reader.onerror = () => {
          console.error('Error reading file:', file.name);
          loadedCount++;
          if (loadedCount === filesArray.length) {
            setIsProcessingFiles(false);
          }
        };
        reader.readAsDataURL(file);
      });

      // Reset target value so re-selecting same file works
      e.target.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError(null);
    setDocumentError(null);

    if (!formData.customerName || !formData.phoneNumber || !formData.selectedService) {
      return;
    }

    const docReq = getServiceDocRequirement(formData.selectedService, formData.customServiceText);
    if (docReq.mandatory && uploadedFiles.length === 0) {
      setDocumentError('Please upload at least 1 mandatory document (Aadhaar / Marksheet / Photo / PDF) required for this service.');
      return;
    }

    // Generate auto-incrementing token starting with prefix CSC-2026-
    const getNextCscTokenId = (): string => {
      try {
        let maxSeq = 0;
        const existingApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
        if (Array.isArray(existingApps)) {
          existingApps.forEach((a: any) => {
            const id = a.appId || a.id || '';
            const match = id.match(/CSC-2026-(\d+)/i);
            if (match && match[1]) {
              const num = parseInt(match[1], 10);
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
        const nextSeq = maxSeq + 1;
        localStorage.setItem('csc_token_seq', nextSeq.toString());
        return `CSC-2026-${nextSeq}`;
      } catch {
        return `CSC-2026-1`;
      }
    };

    const mockAppId = getNextCscTokenId();
    const uploadedDocsList = uploadedFiles.map(f => `${f.name} (${(f.size / 1024).toFixed(1)} KB)`);

    const mockReceipt = {
      appId: mockAppId,
      customerName: formData.customerName,
      phoneNumber: formData.phoneNumber,
      emailAddress: formData.emailAddress || 'N/A',
      dateOfBirth: formData.dateOfBirth || 'N/A',
      selectedService: formData.selectedService === 'other' ? formData.customServiceText : formData.selectedService,
      userCategory: formData.userCategory === 'genObc' ? 'General/OBC' : 'SC/ST',
      paymentMode: 'pending',
      utrNumber: 'N/A',
      portalFee: formData.portalFee,
      applicationFee: formData.applicationFee,
      totalAmount: formData.portalFee + formData.applicationFee + Math.round(formData.portalFee * 0.18),
      uploadedDocuments: uploadedDocsList,
      additionalDetails: formData.additionalDetails || 'None',
      submittedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('en-US')
    };

    setSubmissionReceipt(mockReceipt);
    setIsFormSubmitted(true);
    setPostSubmitPaymentMode('razorpay');
    setIsPaymentConfirmed(false);

    // Automatically trigger WhatsApp invoice notification dispatch
    triggerWhatsAppInvoiceDispatch(mockReceipt);

    // Process and upload attached documents to Supabase Storage if configured
    let processedDocs: UploadedDocument[] = uploadedFiles;
    try {
      processedDocs = await uploadMultipleDocumentsToSupabase(uploadedFiles, mockReceipt.appId);
      setUploadedFiles(processedDocs);
    } catch (upErr) {
      console.warn('Supabase document upload notice:', upErr);
    }

    // Save initial application directly to Cloud Firestore & server API immediately
    const nowIso = new Date().toISOString();
    const initialPayload = {
      appId: mockReceipt.appId,
      name: mockReceipt.customerName,
      email: mockReceipt.emailAddress,
      phone: mockReceipt.phoneNumber,
      service: mockReceipt.selectedService,
      dateOfBirth: mockReceipt.dateOfBirth,
      userCategory: mockReceipt.userCategory,
      paymentMode: 'cash',
      utrNumber: 'N/A',
      totalAmount: mockReceipt.totalAmount,
      message: formData.additionalDetails || 'None',
      documents: processedDocs,
      status: 'Pending',
      submittedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      statusUpdatedAt: nowIso
    };

    // 1. Save directly to Cloud Firestore and Supabase
    try {
      setDoc(doc(db, 'applications', mockReceipt.appId), initialPayload, { merge: true }).catch(fsErr => {
        console.error('Firestore "applications" save error:', fsErr);
      });
      setDoc(doc(db, 'appointments', mockReceipt.appId), initialPayload, { merge: true }).catch(fsErr => {
        console.error('Firestore "appointments" save error:', fsErr);
      });

      const supabase = getSupabaseClient();
      if (supabase) {
        (async () => {
          try {
            await supabase.from('applications').upsert([
              {
                appId: mockReceipt.appId,
                id: mockReceipt.appId,
                applicantName: mockReceipt.customerName,
                customerName: mockReceipt.customerName,
                phoneNumber: mockReceipt.phoneNumber,
                emailAddress: mockReceipt.emailAddress,
                selectedService: mockReceipt.selectedService,
                userCategory: mockReceipt.userCategory,
                paymentMode: mockReceipt.paymentMode,
                utrNumber: mockReceipt.utrNumber,
                totalAmount: mockReceipt.totalAmount,
                status: 'Pending',
                submittedAt: nowIso,
                documents: processedDocs,
                payload: initialPayload
              }
            ], { onConflict: 'appId' });
          } catch (sbErr) {
            console.error('Supabase "applications" upsert error:', sbErr);
          }
        })();
      }
    } catch (fsErr) {
      console.error('Database save execution exception:', fsErr);
    }

    // 2. Always POST to server API as secondary persistence
    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialPayload)
    })
      .then(async res => {
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      })
      .then(data => {
        console.log('Server registration successful:', data);
      })
      .catch(err => console.error('Initial API submission save error:', err));

    // 2. Save lightweight version to localStorage (avoiding quota overflow)
    try {
      const lightDocs = uploadedFiles.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type
      }));
      const lightPayload = { ...initialPayload, documents: lightDocs };

      const existing = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      localStorage.setItem('csc_local_applications', JSON.stringify([lightPayload, ...existing.filter((i: any) => i.appId !== mockReceipt.appId)]));
    } catch (e) {
      console.warn('localStorage quota warning (handled safely):', e);
    }

    // 3. Broadcast live synchronization events across tabs and windows
    try {
      window.dispatchEvent(new CustomEvent('csc_appointment_created', { detail: initialPayload }));
      window.dispatchEvent(new Event('storage'));
      const bc = new BroadcastChannel('csc_portal_sync');
      bc.postMessage({ type: 'NEW_APPOINTMENT', payload: initialPayload });
      bc.close();
    } catch (bcErr) {
      console.error('Broadcast Channel error:', bcErr);
    }

    // Keep form cleanly scrolled into view on customer screen
    setTimeout(() => {
      const formEl = document.getElementById('booking-portal-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handlePayWithRazorpay = () => {
    if (!submissionReceipt) return;

    setIsRazorpayLoading(true);
    setRazorpayError(null);

    processRazorpayPayment({
      amount: submissionReceipt.totalAmount || 50,
      appId: submissionReceipt.appId,
      customerName: submissionReceipt.customerName,
      email: submissionReceipt.emailAddress,
      phone: submissionReceipt.phoneNumber,
      serviceName: submissionReceipt.selectedService,
      onSuccess: async (paymentId, orderId, signature) => {
        setIsRazorpayLoading(false);

        const updatedReceipt = {
          ...submissionReceipt,
          paymentMode: 'razorpay',
          utrNumber: paymentId,
          paymentId: paymentId,
          orderId: orderId,
          paymentStatus: 'Paid via Razorpay'
        };

        setSubmissionReceipt(updatedReceipt);
        setFormData(prev => ({ ...prev, utrNumber: paymentId, paymentMode: 'online' }));
        setPostSubmitPaymentMode('razorpay');
        setIsPaymentConfirmed(true);

        // Process and upload attached documents to Supabase Storage if configured
        let processedDocs: UploadedDocument[] = uploadedFiles;
        try {
          processedDocs = await uploadMultipleDocumentsToSupabase(uploadedFiles, updatedReceipt.appId);
          setUploadedFiles(processedDocs);
        } catch (upErr) {
          console.warn('Supabase payment document upload notice:', upErr);
        }

        // Save/update application in Cloud Firestore & central server database
        const nowIso = new Date().toISOString();
        const updatedPayload = {
          appId: updatedReceipt.appId,
          name: updatedReceipt.customerName,
          email: updatedReceipt.emailAddress,
          phone: updatedReceipt.phoneNumber,
          service: updatedReceipt.selectedService,
          dateOfBirth: updatedReceipt.dateOfBirth,
          userCategory: updatedReceipt.userCategory,
          paymentMode: 'Razorpay Online',
          utrNumber: paymentId,
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
          totalAmount: updatedReceipt.totalAmount,
          message: formData.additionalDetails || 'None',
          documents: processedDocs,
          status: 'Paid',
          paymentStatus: 'Paid via Razorpay',
          submittedAt: nowIso,
          updatedAt: nowIso,
          statusUpdatedAt: nowIso
        };

        try {
          setDoc(doc(db, 'applications', updatedReceipt.appId), updatedPayload, { merge: true }).catch(console.error);
          setDoc(doc(db, 'appointments', updatedReceipt.appId), updatedPayload, { merge: true }).catch(console.error);

          const supabase = getSupabaseClient();
          if (supabase) {
            supabase.from('applications').upsert([
              {
                appId: updatedReceipt.appId,
                id: updatedReceipt.appId,
                applicantName: updatedReceipt.customerName,
                phoneNumber: updatedReceipt.phoneNumber,
                emailAddress: updatedReceipt.emailAddress,
                selectedService: updatedReceipt.selectedService,
                userCategory: updatedReceipt.userCategory,
                paymentMode: 'Razorpay Online',
                utrNumber: paymentId,
                totalAmount: updatedReceipt.totalAmount,
                status: 'Paid',
                submittedAt: nowIso,
                documents: processedDocs,
                payload: updatedPayload
              }
            ], { onConflict: 'appId' }).then(null, console.error);
          }
        } catch (dbErr) {
          console.error('Database save error after Razorpay payment:', dbErr);
        }

        // Save updated local application to localStorage
        try {
          const existing = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
          localStorage.setItem('csc_local_applications', JSON.stringify([updatedPayload, ...existing.filter((i: any) => i.appId !== updatedReceipt.appId)]));
        } catch (e) {
          console.warn('localStorage update warning:', e);
        }

        // Broadcast live synchronization events
        try {
          window.dispatchEvent(new CustomEvent('csc_appointment_updated', { detail: updatedPayload }));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {
          console.error(e);
        }

        // Secondary POST to server API
        fetch(`/api/appointments/${updatedReceipt.appId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Paid via Razorpay' })
        }).catch(console.error);

        // Trigger updated WhatsApp invoice notification with payment confirmation
        triggerWhatsAppInvoiceDispatch(updatedReceipt);
      },
      onError: (errMsg) => {
        setIsRazorpayLoading(false);
        setRazorpayError(errMsg + ' You can also pay directly using https://razorpay.me/@cscdost');
      },
      onDismiss: () => {
        setIsRazorpayLoading(false);
      }
    });
  };

  const handleConfirmManualRazorpayPayment = async () => {
    if (!submissionReceipt) return;

    const utr = formData.utrNumber.trim() || `RZP_${Date.now()}`;

    const updatedReceipt = {
      ...submissionReceipt,
      paymentMode: 'razorpay',
      utrNumber: utr,
      paymentId: utr,
      paymentStatus: 'Paid via Razorpay Page'
    };

    setSubmissionReceipt(updatedReceipt);
    setFormData(prev => ({ ...prev, utrNumber: utr, paymentMode: 'online' }));
    setPostSubmitPaymentMode('razorpay');
    setIsPaymentConfirmed(true);

    let processedDocs: UploadedDocument[] = uploadedFiles;
    try {
      processedDocs = await uploadMultipleDocumentsToSupabase(uploadedFiles, updatedReceipt.appId);
      setUploadedFiles(processedDocs);
    } catch (upErr) {
      console.warn('Supabase payment document upload notice:', upErr);
    }

    const nowIso = new Date().toISOString();
    const updatedPayload = {
      appId: updatedReceipt.appId,
      name: updatedReceipt.customerName,
      email: updatedReceipt.emailAddress,
      phone: updatedReceipt.phoneNumber,
      service: updatedReceipt.selectedService,
      dateOfBirth: updatedReceipt.dateOfBirth,
      userCategory: updatedReceipt.userCategory,
      paymentMode: 'Razorpay Online (razorpay.me)',
      utrNumber: utr,
      razorpayPaymentId: utr,
      totalAmount: updatedReceipt.totalAmount,
      message: formData.additionalDetails || 'None',
      documents: processedDocs,
      status: 'Paid',
      paymentStatus: 'Paid via Razorpay Page',
      submittedAt: nowIso,
      updatedAt: nowIso,
      statusUpdatedAt: nowIso
    };

    try {
      setDoc(doc(db, 'applications', updatedReceipt.appId), updatedPayload, { merge: true }).catch(console.error);
      setDoc(doc(db, 'appointments', updatedReceipt.appId), updatedPayload, { merge: true }).catch(console.error);

      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.from('applications').upsert([
          {
            appId: updatedReceipt.appId,
            id: updatedReceipt.appId,
            applicantName: updatedReceipt.customerName,
            phoneNumber: updatedReceipt.phoneNumber,
            emailAddress: updatedReceipt.emailAddress,
            selectedService: updatedReceipt.selectedService,
            userCategory: updatedReceipt.userCategory,
            paymentMode: 'Razorpay Online (razorpay.me)',
            utrNumber: utr,
            totalAmount: updatedReceipt.totalAmount,
            status: 'Paid',
            submittedAt: nowIso,
            documents: processedDocs,
            payload: updatedPayload
          }
        ], { onConflict: 'appId' }).then(null, console.error);
      }
    } catch (dbErr) {
      console.error('Database save error after Razorpay payment:', dbErr);
    }

    try {
      const existing = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      localStorage.setItem('csc_local_applications', JSON.stringify([updatedPayload, ...existing.filter((i: any) => i.appId !== updatedReceipt.appId)]));
    } catch (e) {
      console.warn('localStorage update warning:', e);
    }

    try {
      window.dispatchEvent(new CustomEvent('csc_appointment_updated', { detail: updatedPayload }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }

    fetch(`/api/appointments/${updatedReceipt.appId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Paid via Razorpay Page' })
    }).catch(console.error);

    triggerWhatsAppInvoiceDispatch(updatedReceipt);
  };

  const handleConfirmPayment = async () => {
    setUtrError(null);
    if (postSubmitPaymentMode === 'none') {
      return;
    }

    if (postSubmitPaymentMode === 'online') {
      if (!formData.utrNumber || formData.utrNumber.trim().length < 4) {
        setUtrError('Please enter the mandatory 12-digit UPI UTR / Transaction Reference ID.');
        return;
      }
    }

    const updatedReceipt = {
      ...submissionReceipt,
      paymentMode: postSubmitPaymentMode,
      utrNumber: postSubmitPaymentMode === 'online' ? formData.utrNumber.trim() : 'N/A',
      totalAmount: postSubmitPaymentMode === 'online' ? (formData.portalFee + formData.applicationFee) : formData.portalFee
    };

    setSubmissionReceipt(updatedReceipt);

    // Trigger updated WhatsApp invoice notification with payment confirmation
    triggerWhatsAppInvoiceDispatch(updatedReceipt);

    const docsSummaryStr = updatedReceipt.uploadedDocuments && updatedReceipt.uploadedDocuments.length > 0 
      ? updatedReceipt.uploadedDocuments.join(', ') 
      : 'None Attached';

    // Process and upload attached documents to Supabase Storage if configured
    let processedDocs: UploadedDocument[] = uploadedFiles;
    try {
      processedDocs = await uploadMultipleDocumentsToSupabase(uploadedFiles, updatedReceipt.appId);
      setUploadedFiles(processedDocs);
    } catch (upErr) {
      console.warn('Supabase payment document upload notice:', upErr);
    }

    // Save/update application in Cloud Firestore & central server database
    const nowIso = new Date().toISOString();
    const payload = {
      appId: updatedReceipt.appId,
      name: updatedReceipt.customerName,
      email: updatedReceipt.emailAddress,
      phone: updatedReceipt.phoneNumber,
      service: updatedReceipt.selectedService,
      dateOfBirth: updatedReceipt.dateOfBirth,
      userCategory: updatedReceipt.userCategory,
      paymentMode: updatedReceipt.paymentMode,
      utrNumber: updatedReceipt.utrNumber,
      totalAmount: updatedReceipt.totalAmount,
      message: formData.additionalDetails || 'None',
      documents: processedDocs,
      status: 'Pending',
      submittedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      statusUpdatedAt: nowIso
    };

    // Save directly to Cloud Firestore and Supabase
    try {
      setDoc(doc(db, 'applications', updatedReceipt.appId), payload, { merge: true }).catch(fsErr => {
        console.error('Firestore "applications" payment update error:', fsErr);
      });
      setDoc(doc(db, 'appointments', updatedReceipt.appId), payload, { merge: true }).catch(fsErr => {
        console.error('Firestore "appointments" payment update error:', fsErr);
      });

      const supabase = getSupabaseClient();
      if (supabase) {
        (async () => {
          try {
            await supabase.from('applications').upsert([
              {
                appId: updatedReceipt.appId,
                id: updatedReceipt.appId,
                applicantName: updatedReceipt.customerName,
                customerName: updatedReceipt.customerName,
                phoneNumber: updatedReceipt.phoneNumber,
                emailAddress: updatedReceipt.emailAddress,
                selectedService: updatedReceipt.selectedService,
                userCategory: updatedReceipt.userCategory,
                paymentMode: updatedReceipt.paymentMode,
                utrNumber: updatedReceipt.utrNumber,
                totalAmount: updatedReceipt.totalAmount,
                status: 'Pending',
                submittedAt: nowIso,
                updatedAt: nowIso,
                documents: processedDocs,
                payload: payload
              }
            ], { onConflict: 'appId' });
          } catch (sbErr) {
            console.error('Supabase "applications" payment update error:', sbErr);
          }
        })();
      }
    } catch (fsErr) {
      console.error('Database payment update execution error:', fsErr);
    }

    // 1. Update local storage with lightweight payload (no heavy base64 to avoid quota error)
    try {
      const lightDocs = uploadedFiles.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type
      }));
      const lightPayload = { ...payload, documents: lightDocs };

      const existing = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      localStorage.setItem('csc_local_applications', JSON.stringify([lightPayload, ...existing.filter((i: any) => i.appId !== updatedReceipt.appId)]));
    } catch (e) {
      console.warn('Failed to update local application cache safely:', e);
    }

    // 2. Perform server API update
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const aptText = await res.text();
      const data = aptText ? JSON.parse(aptText) : {};

      const savedItem = data.data || {
        id: `apt-local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...payload,
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: updatedReceipt.submittedAt,
        status: 'pending',
        date: new Date().toISOString()
      };

      window.dispatchEvent(new CustomEvent('csc_appointment_created', { detail: savedItem }));
      window.dispatchEvent(new Event('storage'));
      const bc = new BroadcastChannel('csc_portal_sync');
      bc.postMessage({ type: 'NEW_APPOINTMENT', payload: savedItem });
      bc.close();
    } catch (err) {
      console.error('API submission update error:', err);
    }

    // Send update to Web3Forms
    try {
      const web3Payload = {
        access_key: 'a6293a04-2711-4d7c-bb7c-e7c9ed3d888c',
        subject: `Payment Confirmed [${updatedReceipt.appId}] - ${updatedReceipt.customerName} (${updatedReceipt.paymentMode.toUpperCase()})`,
        from_name: 'APNA CSC Digital Portal',
        name: updatedReceipt.customerName,
        email: updatedReceipt.emailAddress !== 'N/A' ? updatedReceipt.emailAddress : 'no-reply@apnacsc.in',
        phone_number: updatedReceipt.phoneNumber,
        service_requested: updatedReceipt.selectedService,
        category: updatedReceipt.userCategory,
        payment_mode: updatedReceipt.paymentMode,
        utr_number: updatedReceipt.utrNumber,
        amount: `₹${updatedReceipt.totalAmount}`,
        message: `CONFIRMED APPLICATION & PAYMENT\nToken ID: ${updatedReceipt.appId}\nApplicant Name: ${updatedReceipt.customerName}\nMobile: ${updatedReceipt.phoneNumber}\nEmail: ${updatedReceipt.emailAddress}\nDOB: ${updatedReceipt.dateOfBirth}\nService: ${updatedReceipt.selectedService}\nCategory: ${updatedReceipt.userCategory}\nPayment Mode: ${updatedReceipt.paymentMode}\nUTR No: ${updatedReceipt.utrNumber}\nAttached Documents: ${docsSummaryStr}\nTotal Amount: ₹${updatedReceipt.totalAmount}\nNotes: ${updatedReceipt.additionalDetails}`
      };

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(web3Payload)
      }).catch(err => console.error('Web3Forms payment update error:', err));
    } catch (err) {
      console.error('Web3Forms dispatch error:', err);
    }

    setIsPaymentConfirmed(true);

    setTimeout(() => {
      const slipContainer = document.getElementById('printable-digital-slip');
      if (slipContainer) {
        slipContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handlePrintSlip = () => {
    const slipElement = document.getElementById('printable-digital-slip');
    if (!slipElement) {
      window.print();
      return;
    }

    // Clone element and strip no-print elements
    const clone = slipElement.cloneNode(true) as HTMLElement;
    const noPrintElements = clone.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.remove());

    // Try popup window print first
    try {
      const printWindow = window.open('', '_blank', 'width=850,height=950,top=50,left=50');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Official CSC e-Receipt #${submissionReceipt?.appId || 'CSC-2026'}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { size: portrait; margin: 8mm; }
                  body { background: #ffffff !important; color: #0f172a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body class="bg-slate-50 p-4 sm:p-8 flex items-center justify-center min-h-screen">
              <div class="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-slate-200">
                ${clone.outerHTML}
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.focus();
                    window.print();
                  }, 400);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        return;
      }
    } catch (e) {
      console.warn('Popup print window blocked, using fallback iframe print:', e);
    }

    // Hidden iframe fallback print method (works inside sandboxed iFrames)
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
              <title>CSC e-Receipt #${submissionReceipt?.appId || 'CSC-2026'}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { size: portrait; margin: 8mm; }
                  body { background: #ffffff !important; color: #000000 !important; font-family: sans-serif; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body class="p-4 bg-white text-slate-900">
              <div class="max-w-2xl mx-auto">
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
            }, 2000);
          }
        }, 400);
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

  // Group items by category for the multi-box layout
  const getItemsByCategory = (cat: 'jobs' | 'admit_cards' | 'results' | 'answer_keys' | 'syllabus' | 'admissions') => {
    return SARKARI_DATA.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.eligibility && item.eligibility.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch && item.category === cat;
    });
  };

  const getOrgName = (item: SarkariItem) => {
    const titleUpper = item.title.toUpperCase();
    if (titleUpper.includes('SSC')) return 'STAFF SELECTION COMMISSION (SSC)';
    if (titleUpper.includes('RRB') || titleUpper.includes('RAILWAY') || titleUpper.includes('RPF')) return 'RAILWAY RECRUITMENT BOARDS (RRB)';
    if (titleUpper.includes('IBPS')) return 'INSTITUTE OF BANKING PERSONNEL SELECTION';
    if (titleUpper.includes('JKSSB') || titleUpper.includes('J&K')) return 'J&K SERVICES SELECTION BOARD';
    if (titleUpper.includes('UP POLICE') || titleUpper.includes('UPPRPB')) return 'UP POLICE RECRUITMENT BOARD';
    if (titleUpper.includes('UPSC')) return 'UNION PUBLIC SERVICE COMMISSION (UPSC)';
    if (titleUpper.includes('NEET') || titleUpper.includes('NTA') || titleUpper.includes('JEE') || titleUpper.includes('CUET')) return 'NATIONAL TESTING AGENCY (NTA)';
    if (titleUpper.includes('CBSE') || titleUpper.includes('CTET')) return 'CENTRAL BOARD OF SECONDARY EDUCATION';
    if (titleUpper.includes('DELHI UNIVERSITY') || titleUpper.includes('CSAS')) return 'DELHI UNIVERSITY ADMISSION BOARD';
    if (titleUpper.includes('IGNOU')) return 'INDIRA GANDHI NATIONAL OPEN UNIVERSITY';
    return item.advertisementNo || 'GOVERNMENT RECRUITMENT BOARD';
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
      setSelectedItem(item);
    }, 150);
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
                {/* 8 News Items - Primary Copy */}
                <div className="inline-flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 shrink-0">
                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">JOB</span>
                    🔥 <strong>SSC CGL 2026</strong> Official Notification Released — Apply at CSC Desk!
                  </a>
                  <span className="text-amber-800 font-black">•</span>
                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">JOB</span>
                    ⚡ <strong>UPPSC RO/ARO 2026</strong> Online Application Form Open
                  </a>
                  <span className="text-amber-800 font-black">•</span>

                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">RESULT</span>
                    🏆 <strong>NEET UG 2026</strong> Merit List &amp; Cutoff Scorecard Released
                  </a>
                  <span className="text-amber-800 font-black">•</span>
                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">RESULT</span>
                    🎯 <strong>IBPS PO Mains Result 2026</strong> Declared — Check Score
                  </a>
                  <span className="text-amber-800 font-black">•</span>

                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">ANSWER KEY</span>
                    🔑 <strong>NTA JEE Main 2026</strong> Session 1 Final Answer Key Out
                  </a>
                  <span className="text-amber-800 font-black">•</span>
                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">ANSWER KEY</span>
                    📝 <strong>SSC GD Constable 2026</strong> Official Answer Key Released
                  </a>
                  <span className="text-amber-800 font-black">•</span>

                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">ADMISSION</span>
                    🎓 <strong>CUET UG 2026</strong> Online Registration Form Open
                  </a>
                  <span className="text-amber-800 font-black">•</span>
                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">ADMISSION</span>
                    🏫 <strong>Bihar B.Ed CET 2026</strong> Admission Online Form Active
                  </a>
                  <span className="text-amber-800 font-black">•</span>
                </div>

                {/* Duplicate Copy for Infinite Ticker */}
                <div className="inline-flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 shrink-0" aria-hidden="true">
                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">JOB</span>
                    🔥 <strong>SSC CGL 2026</strong> Official Notification Released — Apply at CSC Desk!
                  </a>
                  <span className="text-amber-800 font-black">•</span>
                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">JOB</span>
                    ⚡ <strong>UPPSC RO/ARO 2026</strong> Online Application Form Open
                  </a>
                  <span className="text-amber-800 font-black">•</span>

                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">RESULT</span>
                    🏆 <strong>NEET UG 2026</strong> Merit List &amp; Cutoff Scorecard Released
                  </a>
                  <span className="text-amber-800 font-black">•</span>
                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">RESULT</span>
                    🎯 <strong>IBPS PO Mains Result 2026</strong> Declared — Check Score
                  </a>
                  <span className="text-amber-800 font-black">•</span>

                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">ANSWER KEY</span>
                    🔑 <strong>NTA JEE Main 2026</strong> Session 1 Final Answer Key Out
                  </a>
                  <span className="text-amber-800 font-black">•</span>
                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">ANSWER KEY</span>
                    📝 <strong>SSC GD Constable 2026</strong> Official Answer Key Released
                  </a>
                  <span className="text-amber-800 font-black">•</span>

                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">ADMISSION</span>
                    🎓 <strong>CUET UG 2026</strong> Online Registration Form Open
                  </a>
                  <span className="text-amber-800 font-black">•</span>
                  <a href="#service-link" className="inline-flex items-center gap-1.5 hover:underline cursor-pointer">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">ADMISSION</span>
                    🏫 <strong>Bihar B.Ed CET 2026</strong> Admission Online Form Active
                  </a>
                  <span className="text-amber-800 font-black">•</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
        
        {/* 2. 🏛️ CSC DOST SECURE PORTAL HEADER & VERIFIED DESK CARD */}
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
                  <span className="text-[10px] font-mono font-bold bg-indigo-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-indigo-700">
                    Form Ref: CSC-2026-v4
                  </span>
                </div>

                {/* Form Container */}
                <div className="p-5 sm:p-6 space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Please provide your correct details below. Our CSC team will process your application on the official government portal.
                  </p>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Full Name */}
                      <div className="space-y-1">
                        <label htmlFor="applicant-name-input" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer">
                          Applicant Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <input
                            id="applicant-name-input"
                            type="text"
                            required
                            placeholder="e.g. Wasim Ahmad"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-semibold text-xs outline-none"
                          />
                        </div>
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium block">
                          Must match Aadhaar records
                        </span>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          WhatsApp Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <input
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            title="Please enter a valid 10-digit mobile number"
                            placeholder="e.g. 7006833767"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-mono font-semibold text-xs outline-none"
                          />
                        </div>
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium block">
                          For instant SMS/WhatsApp Token Receipts
                        </span>
                      </div>
                    </div>

                    {/* Service & Category Row (Side-by-Side 2-Column Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Select Service to Apply */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Select Service to Apply <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.selectedService}
                          onChange={(e) => handleServiceChange(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-semibold text-xs outline-none cursor-pointer"
                        >
                          <option value="">-- Choose a Service / Exam --</option>
                          
                          <optgroup label="🔥 Live Bulletins & Exams">
                            {SARKARI_DATA.filter(item => item.category === 'jobs' || item.category === 'admissions').map(item => (
                              <option key={item.id} value={item.title}>
                                Exam: {item.title}
                              </option>
                            ))}
                          </optgroup>

                          <optgroup label="💼 Premium Cyber Cafe E-Services">
                            {SERVICES_LIST.map(service => (
                              <option key={service.id} value={service.name}>
                                {service.name}
                              </option>
                            ))}
                          </optgroup>

                          <option value="other">⚠️ Other / Custom Digital Work</option>
                        </select>
                      </div>

                      {/* Applicant Category Dropdown */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Applicant Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.userCategory}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-semibold text-xs outline-none cursor-pointer"
                        >
                          <option value="genObc">General / OBC / Unreserved</option>
                          <option value="scSt">SC / ST / EWS / PwD / Female (Concession)</option>
                        </select>
                      </div>
                    </div>

                    {/* Required Documents Banner */}
                    <div className="bg-slate-100/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <Info className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>
                        <strong className="font-extrabold text-slate-900 dark:text-white">Required Documents:</strong>{' '}
                        {docRequirement.mandatory && docRequirement.requiredDocTypes.length > 0
                          ? docRequirement.requiredDocTypes.map(d => d.shortName).join(', ')
                          : 'No documents required for this service'}
                      </span>
                    </div>

                    {/* Custom Service Input if 'Other' is chosen */}
                    {formData.selectedService === 'other' && (
                      <div className="space-y-1 animate-fade-in">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Please Specify Custom Service <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Type what service or application form you need us to fill..."
                          value={formData.customServiceText}
                          onChange={(e) => setFormData({ ...formData, customServiceText: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-semibold text-xs outline-none"
                        />
                      </div>
                    )}

                    {/* DYNAMIC MANDATORY DOCUMENT UPLOAD SECTION */}
                    {docRequirement.mandatory && docRequirement.requiredDocTypes.length > 0 && (
                      <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-4 space-y-3.5 animate-fade-in my-2 shadow-sm">
                        
                        {/* Section Title */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg shadow-xs">
                              <UploadCloud className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-amber-300 flex items-center gap-1.5">
                                <span>Mandatory Document Upload</span>
                                <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  Required
                                </span>
                              </h4>
                              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                                Upload required documents for <strong className="text-slate-900 dark:text-white font-bold">{formData.selectedService === 'other' ? (formData.customServiceText || 'Custom Service') : formData.selectedService}</strong>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Bullet Points List of Mandatory Documents */}
                        <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-inner">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block mb-1.5">
                            📌 MANDATORY DOCUMENTS REQUIRED FOR THIS SERVICE:
                          </span>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            {docRequirement.requiredDocTypes.map((docType) => (
                              <li key={docType.id} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                                <span>{docType.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* SEPARATE INDIVIDUAL FILE INPUT FIELDS FOR EACH DOCUMENT TYPE */}
                        <div className="space-y-2.5 pt-1">
                          <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                            📁 Separate Document Upload Fields ({docRequirement.requiredDocTypes.length} Required):
                          </span>

                          <div className="grid grid-cols-1 gap-2.5">
                            {docRequirement.requiredDocTypes.map((docType) => {
                              const uploadedDoc = uploadedFiles.find(f => f.docTypeId === docType.id);

                              return (
                                <div
                                  key={docType.id}
                                  className={`p-3 rounded-xl border transition-all ${
                                    uploadedDoc
                                      ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-800 shadow-xs'
                                      : 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800/80 hover:border-amber-500 shadow-2xs'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[11.5px] font-black uppercase tracking-wide text-slate-900 dark:text-white">
                                          {docType.name}
                                        </span>
                                        <span className="text-[8.5px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                                          Required
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                        {docType.description}
                                      </p>
                                    </div>

                                    {uploadedDoc ? (
                                      <div className="flex items-center gap-2 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 shrink-0">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <div className="max-w-[150px] text-left">
                                          <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 block truncate">
                                            {uploadedDoc.name}
                                          </span>
                                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold font-mono block">
                                            ✓ Legible Scan • {(uploadedDoc.size / 1024).toFixed(1)} KB
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveDocByTypeId(docType.id)}
                                          className="p-1 hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer ml-1"
                                          title="Remove Document"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-2xs transition-all cursor-pointer shrink-0">
                                        <UploadCloud className="w-3.5 h-3.5" />
                                        <span>Choose File</span>
                                        <input
                                          type="file"
                                          accept={docType.accept}
                                          onChange={(e) => handleSingleFileUpload(e, docType)}
                                          className="hidden"
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Error Message if not uploaded */}
                        {documentError && (
                          <p className="text-[11px] text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5 bg-red-100 dark:bg-red-950/90 p-2.5 rounded-xl border border-red-300 dark:border-red-800 animate-pulse">
                            <span>⚠️ {documentError}</span>
                          </p>
                        )}

                        {/* Document Readiness Progress Visualizer */}
                        <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            <span>Document Readiness Checklist</span>
                            <span className={uploadedFiles.length >= docRequirement.requiredDocTypes.length ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-amber-600 dark:text-amber-400 font-extrabold"}>
                              {uploadedFiles.length} of {docRequirement.requiredDocTypes.length} Uploaded
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${Math.min(100, (uploadedFiles.length / (docRequirement.requiredDocTypes.length || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}



                    {/* Compact Emerald Green Submit Button */}
                    <div className="pt-1.5 space-y-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-[#00a86b] hover:bg-[#008f5a] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Submit Application &amp; Proceed to Payment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1">
                        <span>🔒</span>
                        <span>Encrypted 256-bit SSL transaction verified by CSC e-Governance Ltd.</span>
                      </p>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          ) : !isPaymentConfirmed ? (
            /* POST-SUBMISSION PAYMENT MODE SELECTION STEP */
            <div id="booking-portal-form" className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-5 border border-slate-200 dark:border-slate-800 max-w-lg mx-auto animate-fade-in">
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full text-[11px] font-extrabold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                  <span>Step 2 of 2</span>
                  <span>•</span>
                  <span>Select Payment Method</span>
                </div>
                <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white font-display">
                  Select Payment Option
                </h3>
              </div>

              {/* Applicant & Service Summary */}
              <div className="my-4 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-extrabold">Applicant Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{submissionReceipt?.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-extrabold">Applied Service</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{submissionReceipt?.selectedService}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-extrabold">Mobile Number</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-100">{submissionReceipt?.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-extrabold">Total Fee</span>
                  <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">₹{submissionReceipt?.totalAmount}</span>
                </div>
              </div>

              {/* Payment Mode Buttons */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Choose Payment Method:</span>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    Razorpay Gateway
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  
                  {/* OPTION 1: RAZORPAY GATEWAY (RECOMMENDED) */}
                  <button
                    type="button"
                    onClick={() => {
                      setPostSubmitPaymentMode('razorpay');
                      setUtrError(null);
                      setRazorpayError(null);
                    }}
                    className={`group relative p-3 rounded-xl border-2 flex items-center justify-between gap-2 transition-all duration-200 cursor-pointer text-left shadow-2xs hover:shadow-md ${
                      postSubmitPaymentMode === 'razorpay'
                        ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 text-slate-900 dark:text-white font-extrabold shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        postSubmitPaymentMode === 'razorpay'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block text-slate-900 dark:text-white">Razorpay</span>
                        <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium block">UPI / Cards / NetBanking</span>
                      </div>
                    </div>
                  </button>

                  {/* OPTION 2: CASH COUNTER */}
                  <button
                    type="button"
                    onClick={() => {
                      setPostSubmitPaymentMode('cash');
                      setUtrError(null);
                      setRazorpayError(null);
                    }}
                    className={`group relative p-3 rounded-xl border-2 flex items-center justify-between gap-2 transition-all duration-200 cursor-pointer text-left shadow-2xs hover:shadow-md ${
                      postSubmitPaymentMode === 'cash'
                        ? 'border-amber-600 dark:border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 text-slate-900 dark:text-white font-extrabold shadow-sm ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-amber-500 dark:hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        postSubmitPaymentMode === 'cash'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block text-slate-900 dark:text-white">Cash Counter</span>
                        <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium block">Pay in person</span>
                      </div>
                    </div>
                  </button>

                </div>

                {/* PAYMENT METHOD DETAILS DISPLAY LOGIC */}
                {postSubmitPaymentMode === 'razorpay' ? (
                  /* RAZORPAY PAYMENT GATEWAY CARD */
                  <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-4 shadow-sm border border-emerald-500/30 dark:border-emerald-500/20 flex flex-col items-center text-center animate-fade-in relative overflow-hidden space-y-3">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">⚡ Razorpay Online</span>
                        <span className="text-slate-400 text-[9px]">•</span>
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">256-bit SSL Secure</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                        Pay <strong className="text-emerald-600 dark:text-emerald-400 font-black font-mono">₹{submissionReceipt?.totalAmount}</strong> securely via GPay, PhonePe, Paytm, UPI, Debit/Credit Card or NetBanking.
                      </p>
                    </div>

                    {/* Primary Razorpay Action Button */}
                    <div className="w-full">
                      <button
                        type="button"
                        onClick={handlePayWithRazorpay}
                        disabled={isRazorpayLoading}
                        className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isRazorpayLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Launching Gateway...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>Pay ₹{submissionReceipt?.totalAmount} via Razorpay Gateway</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Error message display with fallback */}
                    {razorpayError && (
                      <div className="w-full text-xs text-amber-900 dark:text-amber-200 font-medium bg-amber-50 dark:bg-amber-950/80 p-3 rounded-lg border border-amber-300 dark:border-amber-800 text-left space-y-1.5">
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 text-xs">⚠️</span>
                          <p className="font-bold text-[11px]">{razorpayError}</p>
                        </div>
                        <a
                          href="https://razorpay.me/@cscdost"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span>Open Direct Payment Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  /* CASH COUNTER OPTION */
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center flex flex-col items-center justify-center space-y-2.5 animate-fade-in">
                    <Clock className="w-6 h-6 text-amber-500 animate-pulse" />
                    <div>
                      <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wide">
                        Pay At Counter
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-0.5 leading-relaxed">
                        Pay <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">₹{submissionReceipt?.totalAmount}</span> in cash at our counter.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Confirm Cash Payment &amp; Generate Slip</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* PRINTABLE DIGITAL SUCCESS SLIP / RECEIPT (Exact Image 2 Style) */
            <div id="printable-digital-slip" className="bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-300 max-w-2xl mx-auto animate-fade-in relative w-full font-sans">
              
              {/* Header Bar (no-print) */}
              <div className="bg-[#1e2358] text-white px-6 py-3 flex items-center justify-between no-print">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Official CSC e-Receipt</span>
                </div>
                <button
                  onClick={() => setIsFormSubmitted(false)}
                  className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close Receipt"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Receipt Content */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Top Section: Logo/Provider Info & Green Receipt Banner */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
                  {/* Left: Organization / Provider Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        CSC
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                          CSC DOST Portal
                        </h2>
                        <p className="text-[11px] font-bold text-amber-600">
                          VLE Node #212515670018
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-xs pt-1 leading-snug">
                      Common Services Centre Portal • Ministry of Electronics &amp; IT, Govt of India Authorized Desk
                    </p>
                  </div>

                  {/* Right: Receipt Number Green Banner (Image 2 style) */}
                  <div className="text-left sm:text-right shrink-0">
                    <div className="bg-[#65a30d] text-white px-4 py-2 rounded-md font-bold text-base shadow-xs inline-block">
                      Receipt for #{submissionReceipt?.appId || 'CSC-2026-4'}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-1">
                      Transaction Date: <span className="font-semibold text-slate-800">{submissionReceipt?.submittedAt}</span>
                    </p>
                  </div>
                </div>

                {/* Recipient Details Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                      RECIPIENT / APPLICANT
                    </span>
                    <p className="text-sm font-black text-slate-900 uppercase">
                      {submissionReceipt?.customerName}
                    </p>
                    <p className="text-slate-600 font-mono mt-0.5">
                      📱 WhatsApp: {submissionReceipt?.phoneNumber}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                      SERVICE DETAILS
                    </span>
                    <p className="font-bold text-slate-800">
                      Category: <span className="font-extrabold text-slate-900">{submissionReceipt?.userCategory === 'genObc' ? 'General / OBC' : 'SC / ST'}</span>
                    </p>
                    <p className="text-slate-600 mt-0.5 font-medium">
                      Status: <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10.5px]">Payment Confirmed</span>
                    </p>
                  </div>
                </div>

                {/* Itemized Service Table (Exact Image 2 Style with Green Table Header) */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#65a30d] text-white font-black uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-3">PRODUCT / SERVICE</th>
                        <th className="py-2.5 px-3">DESCRIPTION</th>
                        <th className="py-2.5 px-3 text-center">QTY</th>
                        <th className="py-2.5 px-3 text-right">COST (₹)</th>
                        <th className="py-2.5 px-3 text-right">TOTAL (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {submissionReceipt?.selectedService}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          Government Prescribed Fee ({submissionReceipt?.userCategory === 'genObc' ? 'General/OBC' : 'SC/ST'})
                        </td>
                        <td className="py-3 px-3 text-center font-mono">1</td>
                        <td className="py-3 px-3 text-right font-mono">₹{submissionReceipt?.applicationFee || 0}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold">₹{submissionReceipt?.applicationFee || 0}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          CSC Node Portal Charge
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          Fixed Handling &amp; Verification Processing
                        </td>
                        <td className="py-3 px-3 text-center font-mono">1</td>
                        <td className="py-3 px-3 text-right font-mono">₹{submissionReceipt?.portalFee || 50}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold">₹{submissionReceipt?.portalFee || 50}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          GST (18%)
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          18% GST on CSC Node Service Charge
                        </td>
                        <td className="py-3 px-3 text-center font-mono">1</td>
                        <td className="py-3 px-3 text-right font-mono">₹{Math.round((submissionReceipt?.portalFee || 50) * 0.18)}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold">₹{Math.round((submissionReceipt?.portalFee || 50) * 0.18)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bottom Summary Section (Image 2 Style) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pt-2">
                  {/* Left: Thank you message & Security Seal */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-700 italic">
                      Thanks for choosing CSC DOST Services!
                    </p>
                    
                    {/* Digital India Security Seal */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-3 max-w-xs">
                      <div className="p-1 bg-white border border-slate-200 rounded shrink-0">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&color=0b1120&data=${encodeURIComponent(`Token:${submissionReceipt?.appId}|VLE:Wasim Ahmad Khanday`)}`}
                          alt="CSC Security Seal"
                          className="w-10 h-10"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-left space-y-0.5">
                        <p className="text-[10px] font-black text-slate-900 uppercase">Digital India Security Seal</p>
                        <p className="text-[9px] text-slate-500 leading-tight">
                          Scan QR code at any CSC kiosk to verify authenticity.
                        </p>
                        <p className="text-[9.5px] font-bold text-slate-700">
                          VLE: <span className="font-extrabold text-slate-900">Wasim Ahmad Khanday</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Receipt Payment Calculation Block */}
                  <div className="w-full sm:w-64 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono">
                    <p className="font-sans font-black text-xs text-slate-800 uppercase pb-1 border-b border-slate-200">
                      Receipt for Payment
                    </p>
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>₹{(submissionReceipt?.applicationFee || 0) + (submissionReceipt?.portalFee || 50)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST (18%):</span>
                      <span>₹{Math.round((submissionReceipt?.portalFee || 50) * 0.18)}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-300 flex justify-between font-sans text-sm font-black text-slate-900">
                      <span>Total Paid:</span>
                      <span className="font-mono text-emerald-700 font-extrabold text-base">₹{submissionReceipt?.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar (no-print) */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-200 no-print">
                  <button
                    onClick={() => {
                      if (!submissionReceipt) return;
                      const msg = `*New Application Submitted on CSC DOST!*
*Token ID:* ${submissionReceipt.appId}
*Name:* ${submissionReceipt.customerName}
*Mobile:* ${submissionReceipt.phoneNumber}
*Service Requested:* ${submissionReceipt.selectedService}
*Category:* ${submissionReceipt.userCategory}
*Payment Mode:* ${submissionReceipt.paymentMode}
*Payment Ref:* ${submissionReceipt.utrNumber || 'N/A'}
*Amount Paid:* ₹${submissionReceipt.totalAmount}`;
                      window.open(`https://wa.me/917006833767?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/30"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send to WhatsApp Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintSlip}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 font-sans shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
                  </button>

                  <button
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
                        portalFee: 50,
                        applicationFee: 0
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1.5 font-sans"
                  >
                    <Home className="w-3.5 h-3.5 text-amber-400" />
                    <span>Return to Home</span>
                  </button>
                </div>
              </div>
            </div>
          )}
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

        {/* COMPACT SARKARI BOXES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto w-full">
            {[
              { id: 'results', title: 'Results', icon: Award },
              { id: 'jobs', title: 'Latest Jobs', icon: Briefcase },
              { id: 'admit_cards', title: 'Admit Card', icon: FileText },
              { id: 'answer_keys', title: 'Answer Key', icon: Key },
              { id: 'admissions', title: 'Admissions', icon: GraduationCap },
              { id: 'syllabus', title: 'Syllabus & Documents', icon: BookOpen },
            ]
              .filter(box => activeTab === 'all' || activeTab === box.id)
              .map(box => {
                const boxItems = getItemsByCategory(box.id as any);
                const IconComp = box.icon;
                return (
                  <div
                    key={box.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#ab0000] dark:border-slate-800 overflow-hidden shadow-md flex flex-col transition-all duration-300"
                    id={`sarkari-box-${box.id}`}
                  >
                    {/* Dark Red/Maroon Header Bar */}
                    <div className="bg-[#ab0000] text-white px-4 py-3 flex items-center justify-between font-black uppercase text-sm sm:text-base tracking-wider font-display shrink-0 shadow-xs">
                      <div className="flex items-center gap-2">
                        <IconComp className="w-4.5 h-4.5 text-amber-300" />
                        <span>{box.title}</span>
                      </div>
                      <span className="text-xs bg-black/30 text-white font-mono font-bold px-2 py-0.5 rounded-full">
                        {boxItems.length}
                      </span>
                    </div>

                    {/* Compact Scrollable List Box */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[420px] overflow-y-auto scrollbar-thin">
                      {boxItems.length > 0 ? (
                        boxItems.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="p-3.5 hover:bg-amber-500/10 dark:hover:bg-slate-800/80 transition-all cursor-pointer flex items-start gap-2.5 group"
                            id={`sarkari-box-item-${item.id}`}
                          >
                            <span className="text-[#ab0000] dark:text-amber-400 font-extrabold text-base shrink-0 leading-none mt-0.5">•</span>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-xs sm:text-[13px] font-bold text-blue-900 dark:text-blue-300 group-hover:text-[#ab0000] dark:group-hover:text-amber-400 group-hover:underline leading-snug transition-colors font-sans">
                                {item.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500">
                                {item.isNew && (
                                  <span className="px-1.5 py-0.2 bg-red-600 text-white font-extrabold text-[9.5px] rounded animate-pulse">
                                    ⚡ NEW
                                  </span>
                                )}
                                {item.lastDate && (
                                  <span className="text-red-600 dark:text-red-400 font-bold">
                                    Last Date: {item.lastDate}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400 italic">
                          No notices matching search filter
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>



      </div>

      {/* DETAILED SARKARI DEDICATED POST PAGE VIEW */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in overflow-hidden">
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transform scale-100 transition-all duration-300"
            id={`sarkari-detail-modal-${selectedItem.id}`}
          >
            {/* Top Breadcrumb & Header Banner */}
            <div className="px-5 sm:px-8 py-5 border-b border-slate-200 dark:border-slate-800 relative bg-gradient-to-r from-slate-900 via-[#1e1b4b] to-slate-900 text-white shrink-0">
              <div className="space-y-2 pr-10">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-300">
                  <span>Sarkari Desk</span>
                  <span>/</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${SARKARI_CATEGORIES[selectedItem.category].color}`}>
                    {SARKARI_CATEGORIES[selectedItem.category].label}
                  </span>
                  {selectedItem.advertisementNo && (
                    <>
                      <span>/</span>
                      <span className="text-amber-400 font-bold">{selectedItem.advertisementNo}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-300 font-mono bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-700/50">
                    {getOrgName(selectedItem)}
                  </span>
                  {selectedItem.isNew && (
                    <span className="px-2 py-0.5 bg-red-500 text-white font-black text-[9px] uppercase tracking-wider rounded animate-pulse">
                      ⚡ LATEST NOTIFICATION
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-2xl font-black tracking-tight leading-snug font-display text-white">
                  {selectedItem.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-full transition-all absolute right-4 top-5 cursor-pointer"
                title="Close Post View"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Post Content Body */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-sm scrollbar-thin bg-slate-50/50 dark:bg-slate-950/50">
              
              {/* Important Alert Strip */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 font-mono">
                    Candidate Verification Advisory
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    Ensure all certificates (Aadhaar, Educational Marksheets, Category / Caste Certificates) match your full name and date of birth exactly before submitting. Applications processed through our CSC Desk undergo mandatory VLE verification.
                  </p>
                  {selectedItem.lastDate && (
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 font-mono pt-1">
                      ⏰ Application Closing Deadline: <span className="underline">{selectedItem.lastDate}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Brief Overview Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Notification Overview</span>
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  {selectedItem.shortInfo}
                </p>
              </div>

              {/* Important Dates & Application Fees Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Important Dates Box */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    <span>Key Examination Schedule</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Post / Release Date:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedItem.postDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Application Start:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedItem.postDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Last Date for Online Form:</span>
                      <span className="font-extrabold text-red-600 dark:text-red-400">{selectedItem.lastDate || 'As per notification'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Last Date Pay Fee:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.lastDate || 'Same as last date'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 dark:text-slate-400">Exam Date / Admit Card:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">To be notified soon</span>
                    </div>
                  </div>
                </div>

                {/* Fee Structure Box */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono pb-2 border-b border-slate-100 dark:border-slate-800">
                    <IndianRupee className="w-4 h-4 text-emerald-500" />
                    <span>Application Fee Breakdown</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">General / OBC / EWS:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{selectedItem.fees?.genObc || '₹100'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">SC / ST / PH (Divyang):</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{selectedItem.fees?.scSt || '₹0'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">All Category Female:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Exempted / Minimal</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 dark:text-slate-400">CSC Portal Filing Fee:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">₹50 Fixed</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Age Specifications & Qualification Box */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Eligibility &amp; Qualification Criteria</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {selectedItem.ageLimit && (
                    <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1">
                      <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 font-mono block">Age Limit Criteria</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedItem.ageLimit}
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400 font-mono block">Educational Qualification</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedItem.eligibility || 'Graduate Degree / 10th / 12th Pass from recognized board in India.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Required Documents Checklist for CSC Desk Application */}
              {!['answer_keys', 'syllabus', 'results'].includes(selectedItem.category) && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-500" />
                    <span>Documents Required for CSC Desk Submission</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Aadhaar Card / Govt Photo ID</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Educational Certificate / Marksheet</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Passport Photo &amp; Signature Scan</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Caste / Domicile Certificate (if applicable)</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Navigation Buttons (Fixed Bar) */}
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-5 sm:px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                id="sarkari-post-close-btn"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>

              {!['answer_keys', 'syllabus', 'results'].includes(selectedItem.category) && (
                <button
                  type="button"
                  onClick={() => handleApplyNow(selectedItem)}
                  className="px-6 sm:px-8 py-3 bg-[#1e1b4b] hover:bg-[#121033] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2.5 shadow-lg shadow-indigo-900/30 cursor-pointer hover:scale-[1.02]"
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

    </section>
  );
}
