import React, { useState, useEffect } from 'react';
import TrackApplication from './TrackApplication';
import { AdSenseSlot } from './AdSenseSlot';
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
  Train
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
  const [activeTab, setActiveTab] = useState<'all' | 'jkssb' | 'jobs' | 'admissions' | 'exam_forms' | 'cluster_univ' | 'nta' | 'ssc_jobs' | 'rrb_jobs' | 'army_jobs'>('all');
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

  // Helper to generate auto-incrementing official CSC token starting with prefix CSC21251567...
  const getNextCscTokenId = (): string => {
    try {
      let maxSeq = 0;
      const existingApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      if (Array.isArray(existingApps)) {
        existingApps.forEach((a: any) => {
          const id = a.appId || a.id || '';
          const matchNew = id.match(/^CSC21251567(\d+)/i);
          const matchOld = id.match(/^CSC-2026-(\d+)/i);
          if (matchNew && matchNew[1]) {
            const num = parseInt(matchNew[1], 10);
            if (!isNaN(num) && num > maxSeq) {
              maxSeq = num;
            }
          } else if (matchOld && matchOld[1]) {
            const num = parseInt(matchOld[1], 10);
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
      const seqPadded = String(nextSeq).padStart(3, '0');
      return `CSC21251567${seqPadded}`;
    } catch {
      return `CSC21251567001`;
    }
  };

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

    const uploadedDocsList = uploadedFiles.map(f => `${f.name} (${(f.size / 1024).toFixed(1)} KB)`);

    // Note: Official Reference Token ID is NOT assigned or stored until Razorpay payment is completed!
    const pendingReceipt = {
      appId: '', // Unassigned until payment confirmation
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

    setSubmissionReceipt(pendingReceipt);
    setIsFormSubmitted(true);
    setPostSubmitPaymentMode('razorpay');
    setIsPaymentConfirmed(false);

    // Keep payment desk cleanly scrolled into view
    setTimeout(() => {
      const element = document.getElementById('printable-receipt-area');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handlePayWithRazorpay = () => {
    if (!submissionReceipt) return;

    setIsRazorpayLoading(true);
    setRazorpayError(null);

    processRazorpayPayment({
      amount: submissionReceipt.totalAmount || 70,
      appId: 'CSC_ONLINE_PAYMENT',
      customerName: submissionReceipt.customerName,
      email: submissionReceipt.emailAddress,
      phone: submissionReceipt.phoneNumber,
      serviceName: submissionReceipt.selectedService,
      onSuccess: async (paymentId, orderId, signature) => {
        setIsRazorpayLoading(false);

        // Generate official CSC Token ID ONLY upon successful payment!
        const officialAppId = getNextCscTokenId();

        const updatedReceipt = {
          ...submissionReceipt,
          appId: officialAppId,
          paymentMode: 'razorpay',
          utrNumber: paymentId,
          paymentId: paymentId,
          orderId: orderId,
          paymentStatus: 'Paid via Razorpay',
          isPaid: true
        };

        setSubmissionReceipt(updatedReceipt);
        setFormData(prev => ({ ...prev, utrNumber: paymentId, paymentMode: 'online' }));
        setPostSubmitPaymentMode('razorpay');
        setIsPaymentConfirmed(true);

        // Upload attached documents to Supabase Storage with official token
        let processedDocs: UploadedDocument[] = uploadedFiles;
        try {
          processedDocs = await uploadMultipleDocumentsToSupabase(uploadedFiles, officialAppId);
          setUploadedFiles(processedDocs);
        } catch (upErr) {
          console.warn('Supabase payment document upload notice:', upErr);
        }

        // Save application in Cloud Firestore & central server database ONLY NOW that payment is confirmed
        const nowIso = new Date().toISOString();
        const updatedPayload = {
          appId: officialAppId,
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
          isPaid: true,
          submittedAt: nowIso,
          updatedAt: nowIso,
          statusUpdatedAt: nowIso
        };

        try {
          setDoc(doc(db, 'applications', officialAppId), updatedPayload, { merge: true }).catch(console.error);
          setDoc(doc(db, 'appointments', officialAppId), updatedPayload, { merge: true }).catch(console.error);

          const supabase = getSupabaseClient();
          if (supabase) {
            supabase.from('applications').upsert([
              {
                appId: officialAppId,
                id: officialAppId,
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

        // Save paid application to localStorage for recent tokens tracking
        try {
          const existing = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
          const cleanedExisting = existing.filter((i: any) => i.appId !== officialAppId && i.paymentMode !== 'pending');
          localStorage.setItem('csc_local_applications', JSON.stringify([updatedPayload, ...cleanedExisting]));
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
        fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPayload)
        }).catch(console.error);

        // Trigger official WhatsApp invoice notification dispatch with generated token
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
    const officialAppId = getNextCscTokenId();

    const updatedReceipt = {
      ...submissionReceipt,
      appId: officialAppId,
      paymentMode: 'razorpay',
      utrNumber: utr,
      paymentId: utr,
      paymentStatus: 'Paid via Razorpay Page',
      isPaid: true
    };

    setSubmissionReceipt(updatedReceipt);
    setFormData(prev => ({ ...prev, utrNumber: utr, paymentMode: 'online' }));
    setPostSubmitPaymentMode('razorpay');
    setIsPaymentConfirmed(true);

    let processedDocs: UploadedDocument[] = uploadedFiles;
    try {
      processedDocs = await uploadMultipleDocumentsToSupabase(uploadedFiles, officialAppId);
      setUploadedFiles(processedDocs);
    } catch (upErr) {
      console.warn('Supabase payment document upload notice:', upErr);
    }

    const nowIso = new Date().toISOString();
    const updatedPayload = {
      appId: officialAppId,
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
      isPaid: true,
      submittedAt: nowIso,
      updatedAt: nowIso,
      statusUpdatedAt: nowIso
    };

    try {
      setDoc(doc(db, 'applications', officialAppId), updatedPayload, { merge: true }).catch(console.error);
      setDoc(doc(db, 'appointments', officialAppId), updatedPayload, { merge: true }).catch(console.error);

      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.from('applications').upsert([
          {
            appId: officialAppId,
            id: officialAppId,
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
      const cleanedExisting = existing.filter((i: any) => i.appId !== officialAppId && i.paymentMode !== 'pending');
      localStorage.setItem('csc_local_applications', JSON.stringify([updatedPayload, ...cleanedExisting]));
    } catch (e) {
      console.warn('localStorage update warning:', e);
    }

    try {
      window.dispatchEvent(new CustomEvent('csc_appointment_updated', { detail: updatedPayload }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }

    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPayload)
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
              <title>CSC e-Receipt #${submissionReceipt?.appId || 'CSC21251567001'}</title>
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
                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">JOB</span>
                    🔥 <strong>SSC CGL 2026</strong> Official Notification Released — Apply at CSC Desk!
                  </span>
                  <span className="text-amber-800 font-black">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">JOB</span>
                    ⚡ <strong>UPPSC RO/ARO 2026</strong> Online Application Form Open
                  </span>
                  <span className="text-amber-800 font-black">•</span>

                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">RESULT</span>
                    🏆 <strong>NEET UG 2026</strong> Merit List &amp; Cutoff Scorecard Released
                  </span>
                  <span className="text-amber-800 font-black">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">RESULT</span>
                    🎯 <strong>IBPS PO Mains Result 2026</strong> Declared — Check Score
                  </span>
                  <span className="text-amber-800 font-black">•</span>

                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">ANSWER KEY</span>
                    🔑 <strong>NTA JEE Main 2026</strong> Session 1 Final Answer Key Out
                  </span>
                  <span className="text-amber-800 font-black">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">ANSWER KEY</span>
                    📝 <strong>SSC GD Constable 2026</strong> Official Answer Key Released
                  </span>
                  <span className="text-amber-800 font-black">•</span>

                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">ADMISSION</span>
                    🎓 <strong>CUET UG 2026</strong> Online Registration Form Open
                  </span>
                  <span className="text-amber-800 font-black">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-amber-300 rounded text-[9.5px] font-black font-mono uppercase">ADMISSION</span>
                    🏫 <strong>Bihar B.Ed CET 2026</strong> Admission Online Form Active
                  </span>
                  <span className="text-amber-800 font-black">•</span>
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
              onClick={() => setActiveTab('nta')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm font-sans ${
                activeTab === 'nta'
                  ? 'bg-red-800 text-red-200 ring-2 ring-red-500 shadow-red-800/30'
                  : 'bg-red-50 dark:bg-red-950/70 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
              <span>NTA Exams</span>
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9.5px] font-mono font-black rounded">
                {SARKARI_DATA.filter(s => s.category === 'nta').length}
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
                Jammu &amp; Kashmir Services Selection Board (JKSSB) Job Advertisements
              </h3>
              <p className="text-xs text-indigo-200 max-w-2xl font-medium">
                Official Department-wise post breakdown, total vacancies, qualification criteria, age limit relaxation, and application closing dates parsed directly from official notifications. Apply online via CSC DOST Desk or link directly to the official portal.
              </p>
            </div>
            <a
              href="https://jkssb.nic.in/Advertisement.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02]"
            >
              <span>Visit jkssb.nic.in</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* FEATURED KASHMIR UNIVERSITY OFFICIAL ADMISSIONS BANNER WHEN ADMISSIONS TAB IS ACTIVE */}
        {activeTab === 'admissions' && (
          <div className="max-w-7xl mx-auto mb-5 p-4 sm:p-5 bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 rounded-2xl text-white border border-teal-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  OFFICIAL KASHMIR UNIVERSITY PORTAL
                </span>
                <span className="text-teal-200 text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Admission Notifications from kashmiruniversity.net
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                University of Kashmir Admission Notifications (KUET PG, B.Ed, Ph.D &amp; Distance Mode)
              </h3>
              <p className="text-xs text-teal-200 max-w-2xl font-medium">
                Department &amp; School-wise seat breakdown, eligibility criteria, age limits, and online submission closing dates parsed directly from official Kashmir University admission notices (kashmiruniversity.net/admission.aspx).
              </p>
            </div>
            <a
              href="https://www.kashmiruniversity.net/admission.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02]"
            >
              <span>Visit kashmiruniversity.net</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* FEATURED KASHMIR UNIVERSITY EXAMINATION FORMS BANNER WHEN EXAM_FORMS TAB IS ACTIVE */}
        {activeTab === 'exam_forms' && (
          <div className="max-w-7xl mx-auto mb-5 p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 rounded-2xl text-white border border-amber-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  OFFICIAL KASHMIR UNIVERSITY EXAMINATION DESK
                </span>
                <span className="text-amber-200 text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Exam Form Notices from kashmiruniversity.net/Examination.aspx
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                University of Kashmir Exam Form Notifications (UG, PG, B.Ed, B.Tech, MBBS &amp; DDE)
              </h3>
              <p className="text-xs text-amber-200 max-w-2xl font-medium">
                Official Start Dates, Application Closing Dates, Fee structure per subject, and Department/School-wise exam form breakdown extracted directly from official Kashmir University examination wing notifications (kashmiruniversity.net/Examination.aspx).
              </p>
            </div>
            <a
              href="https://www.kashmiruniversity.net/Examination.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02]"
            >
              <span>Visit kashmiruniversity.net/Examination</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* FEATURED CLUSTER UNIVERSITY BANNER WHEN CLUSTER_UNIV TAB IS ACTIVE */}
        {activeTab === 'cluster_univ' && (
          <div className="max-w-7xl mx-auto mb-5 p-4 sm:p-5 bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-900 rounded-2xl text-white border border-cyan-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  OFFICIAL CLUSTER UNIVERSITY SRINAGAR DESK
                </span>
                <span className="text-cyan-200 text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Notifications from cusrinagar.edu.in
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                Cluster University Srinagar Admissions &amp; Examination Forms Desk
              </h3>
              <p className="text-xs text-cyan-200 max-w-2xl font-medium">
                Department-wise admission &amp; exam form details, Eligibility criteria, Age limits (where applicable), and Final application or form submission deadlines extracted directly from official Cluster University Srinagar notices (cusrinagar.edu.in).
              </p>
            </div>
            <a
              href="https://www.cusrinagar.edu.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02] font-bold"
            >
              <span>Visit cusrinagar.edu.in</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* FEATURED NTA BANNER WHEN NTA TAB IS ACTIVE */}
        {activeTab === 'nta' && (
          <div className="max-w-7xl mx-auto mb-5 p-4 sm:p-5 bg-gradient-to-r from-red-950 via-slate-900 to-red-900 rounded-2xl text-white border border-red-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  NATIONAL TESTING AGENCY (NTA) DESK
                </span>
                <span className="text-red-200 text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Active Notifications Extracted from www.nta.ac.in
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                NTA National Entrance Examinations Desk (JEE Main, NEET UG, CUET, UGC NET)
              </h3>
              <p className="text-xs text-red-200 max-w-2xl font-medium">
                Extracting Department Details, Official Exam Form Links, Eligibility Criteria, Age Limits, and Application Last Dates for active national entrance exams with strict filtering out of expired notifications.
              </p>
            </div>
            <a
              href="https://www.nta.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02] font-bold"
            >
              <span>Visit www.nta.ac.in</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* FEATURED SSC JOBS BANNER WHEN SSC_JOBS TAB IS ACTIVE */}
        {activeTab === 'ssc_jobs' && (
          <div className="max-w-7xl mx-auto mb-5 p-4 sm:p-5 bg-gradient-to-r from-orange-950 via-slate-900 to-orange-900 rounded-2xl text-white border border-orange-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  STAFF SELECTION COMMISSION (SSC) DESK
                </span>
                <span className="text-orange-200 text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Active Notifications Extracted from https://ssc.gov.in/
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                Staff Selection Commission Active Recruitment Desk (SSC CGL, CHSL, MTS, CPO, Steno, JE)
              </h3>
              <p className="text-xs text-orange-200 max-w-2xl font-medium">
                Extracted Active Job Notifications with Department Details, Official Exam Form Link (ssc.gov.in), Eligibility Criteria, Age Limits, and Last Date with strict filtering out of expired notifications.
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
        )}

        {/* FEATURED RRB JOBS BANNER WHEN RRB_JOBS TAB IS ACTIVE */}
        {activeTab === 'rrb_jobs' && (
          <div className="max-w-7xl mx-auto mb-5 p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl text-white border border-emerald-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
        )}

        {/* FEATURED INDIAN ARMY JOBS BANNER WHEN ARMY_JOBS TAB IS ACTIVE */}
        {activeTab === 'army_jobs' && (
          <div className="max-w-7xl mx-auto mb-5 p-4 sm:p-5 bg-gradient-to-r from-red-950 via-slate-900 to-red-900 rounded-2xl text-white border border-red-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  INDIAN ARMY RECRUITMENT DESK
                </span>
                <span className="text-red-200 text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-red-400" />
                  Active Notifications Extracted from https://www.joinindianarmy.nic.in/default.aspx
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                Join Indian Army Active Officer &amp; Agniveer Recruitment Desk
              </h3>
              <p className="text-xs text-red-200 max-w-2xl font-medium">
                Extracted Active Indian Army Notifications (SSC Tech 68th, NCC Special Entry 125th, JAG Entry 125th, TGC-144, Agniveer Rallies) with Department Details, Official Exam Form Link (joinindianarmy.nic.in), Eligibility, Age Limits, and Last Date with strict filtering out of expired notifications.
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
        )}

        {/* COMPACT SARKARI BOXES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto w-full">
            {[
              { id: 'army_jobs', title: 'Indian Army Jobs (joinindianarmy.nic.in)', icon: Shield, color: 'bg-red-950 text-red-200 border-red-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'rrb_jobs', title: 'RRB Jobs (rrbapply.gov.in)', icon: Train, color: 'bg-emerald-950 text-emerald-200 border-emerald-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'ssc_jobs', title: 'SSC Jobs (ssc.gov.in)', icon: Briefcase, color: 'bg-orange-950 text-orange-200 border-orange-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'nta', title: 'NTA Entrance Exams (nta.ac.in)', icon: GraduationCap, color: 'bg-red-950 text-red-200 border-red-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'cluster_univ', title: 'Cluster University (CUS Srinagar)', icon: Building2, color: 'bg-cyan-950 text-cyan-200 border-cyan-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'jkssb', title: 'JKSSB Jobs (J&K)', icon: Briefcase, color: 'bg-indigo-950 text-amber-300 border-indigo-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'exam_forms', title: 'KU Exam Forms (Kashmir Univ)', icon: FileCheck, color: 'bg-amber-950 text-amber-300 border-amber-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'admissions', title: 'KU Admissions (Kashmir Univ)', icon: GraduationCap, color: 'bg-teal-950 text-amber-300 border-teal-800', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
              { id: 'jobs', title: 'Latest Jobs', icon: Briefcase, color: 'bg-[#ab0000] text-white border-[#ab0000]' },
            ]
              .filter(box => activeTab === 'all' || activeTab === box.id)
              .map(box => {
                const boxItems = getItemsByCategory(box.id as any);
                const IconComp = box.icon;
                return (
                  <div
                    key={box.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border-2 overflow-hidden shadow-md flex flex-col transition-all duration-300 ${
                      box.id === 'jkssb' ? 'border-indigo-600 dark:border-indigo-800' : 'border-[#ab0000] dark:border-slate-800'
                    }`}
                    id={`sarkari-box-${box.id}`}
                  >
                    {/* Header Bar */}
                    <div className={`${box.color || 'bg-[#ab0000] text-white'} px-4 py-3 flex items-center justify-between font-black uppercase text-sm sm:text-base tracking-wider font-display shrink-0 shadow-xs`}>
                      <div className="flex items-center gap-2">
                        <IconComp className="w-4.5 h-4.5 text-amber-300" />
                        <span>{box.title}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${box.badgeColor || 'bg-black/30 text-white'}`}>
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
                            <span className={`${box.id === 'jkssb' ? 'text-indigo-600 dark:text-amber-400' : 'text-[#ab0000] dark:text-amber-400'} font-extrabold text-base shrink-0 leading-none mt-0.5`}>•</span>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-xs sm:text-[13px] font-bold text-blue-900 dark:text-blue-300 group-hover:text-indigo-700 dark:group-hover:text-amber-400 group-hover:underline leading-snug transition-colors font-sans">
                                {item.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500">
                                {item.isNew && (
                                  <span className="px-1.5 py-0.2 bg-red-700 text-white font-black text-[9.5px] rounded animate-pulse">
                                    ⚡ NEW
                                  </span>
                                )}
                                {item.totalPosts && (
                                  <span className="px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 font-bold rounded">
                                    {item.totalPosts}
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
                            setFormData(prev => ({
                              ...prev,
                              selectedService: sVal
                            }));
                            setUploadedFiles([]);
                            setDocumentError(null);
                          }}
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans cursor-pointer"
                        >
                          <option value="">-- Choose a Service / Exam --</option>
                          
                          <optgroup label="🔥 SARKARI EXAMS & RECRUITMENT">
                            {SARKARI_DATA.slice(0, 15).map(s => (
                              <option key={s.id} value={s.title}>
                                {s.title} ({s.lastDate ? `Last: ${s.lastDate}` : 'Active'})
                              </option>
                            ))}
                          </optgroup>

                          <optgroup label="⚡ POPULAR CSC E-SERVICES">
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

                    {/* DOCUMENT UPLOAD COMPONENT FOR SELECTED SERVICE */}
                    {(() => {
                      const { requiredDocTypes: reqDocs } = getServiceDocRequirement(formData.selectedService, formData.customServiceText);
                      if (reqDocs.length === 0) {
                        return (
                          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
                            <Info className="w-4 h-4 shrink-0 text-amber-600" />
                            <span><strong>Required Documents:</strong> No documents required for this service</span>
                          </div>
                        );
                      }
                      return (
                        <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-sans">
                                Required Documents Upload ({reqDocs.length})
                              </h4>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-500">
                              {uploadedFiles.length} of {reqDocs.length} Attached
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {reqDocs.map(docConfig => {
                              const existingFile = uploadedFiles.find(f => f.docTypeId === docConfig.id);

                              return (
                                <div 
                                  key={docConfig.id}
                                  className={`p-3 rounded-xl border transition-all ${
                                    existingFile 
                                      ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' 
                                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans line-clamp-1">
                                      {docConfig.shortName}
                                    </span>
                                    {existingFile ? (
                                      <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-black uppercase font-mono shrink-0">
                                        ATTACHED
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded text-[9px] font-black uppercase font-mono shrink-0">
                                        REQUIRED
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[10px] text-slate-500 mb-2 font-medium line-clamp-1">
                                    {docConfig.description}
                                  </p>

                                  {existingFile ? (
                                    <div className="flex items-center justify-between bg-white dark:bg-slate-950 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900 text-xs font-mono">
                                      <span className="text-emerald-700 dark:text-emerald-400 font-bold truncate max-w-[140px]">
                                        {existingFile.name}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveDocByTypeId(docConfig.id)}
                                        className="text-red-500 hover:text-red-700 text-xs font-bold px-1 cursor-pointer"
                                        title="Remove document"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold cursor-pointer transition-all border border-indigo-200 dark:border-indigo-800/80">
                                      <UploadCloud className="w-3.5 h-3.5" />
                                      <span>Choose File</span>
                                      <input
                                        type="file"
                                        accept={docConfig.accept}
                                        onChange={(e) => handleSingleFileUpload(e, docConfig)}
                                        className="hidden"
                                      />
                                    </label>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {documentError && (
                            <p className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 p-2 rounded-lg border border-red-200 dark:border-red-900">
                              ⚠️ {documentError}
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* SUBMIT BUTTON */}
                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={isProcessingFiles}
                        onClick={handleFormSubmit}
                        className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        id="submit-booking-form-btn"
                      >
                        {isProcessingFiles ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating CSC Application Token...</span>
                          </>
                        ) : (
                          <>
                            <span>SUBMIT APPLICATION &amp; PROCEED TO PAYMENT</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <p className="text-[10.5px] text-center text-slate-500 font-medium mt-2 flex items-center justify-center gap-1">
                        <span>🔒 Encrypted 256-bit SSL transaction verified by CSC e-Governance Ltd.</span>
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              /* SUBMISSION STEP: PAYMENT OPTIONS & CONFIRMATION DESK */
              <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-600 shadow-xl overflow-hidden animate-fade-in text-slate-900 dark:text-white font-sans" id="printable-receipt-area">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#1e1b4b] text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-indigo-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-md">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-300">
                        OFFICIAL CSC PAYMENT GATEWAY DESK
                      </span>
                      <h3 className="text-base sm:text-lg font-black uppercase tracking-wide">
                        {!isPaymentConfirmed ? 'Complete Payment via Razorpay Gateway' : 'Application & Payment Confirmed!'}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-mono font-black shadow-xs uppercase ${
                      isPaymentConfirmed ? 'bg-amber-400 text-slate-950' : 'bg-amber-400 text-slate-950 font-sans'
                    }`}>
                      {isPaymentConfirmed ? submissionReceipt?.appId : 'PAYMENT PENDING'}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
                  
                  {/* Token Box Notice */}
                  {isPaymentConfirmed ? (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 font-sans">
                          Your Official Application Token Ref ID is Generated & Saved in CSC Records
                        </p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono font-medium">
                          Token ID: <strong className="text-emerald-950 dark:text-amber-300 font-black">{submissionReceipt?.appId}</strong>
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
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold uppercase tracking-wider font-mono cursor-pointer shrink-0"
                      >
                        Copy Token
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-amber-950 dark:text-amber-200 font-sans flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>Application Form Details Saved — Complete Payment to Issue Official Reference Token ID</span>
                        </p>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 font-mono font-medium mt-0.5">
                          Your official CSC Reference Token ID and downloadable receipt will be issued immediately upon payment.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Summary & Payable Fee Card */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Applicant: {submissionReceipt?.customerName}</span>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">Mobile: {submissionReceipt?.phoneNumber}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Selected Service / Exam</span>
                        <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{submissionReceipt?.selectedService}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Total Payable Fee</span>
                        <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">₹{submissionReceipt?.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {!isPaymentConfirmed ? (
                    /* EXCLUSIVE RAZORPAY PAYMENT GATEWAY DESK */
                    <div className="space-y-4 pt-1">
                      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-sans">
                          Pay ₹{submissionReceipt?.totalAmount} via Official Razorpay Payment Gateway
                        </h4>
                      </div>

                      {/* RAZORPAY ONLINE GATEWAY PAYMENT BOX */}
                      <div className="bg-indigo-50/90 dark:bg-indigo-950/70 border-2 border-indigo-500/50 rounded-2xl p-4 sm:p-6 space-y-4 animate-fade-in shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200/80 dark:border-indigo-800/80 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                              <Shield className="w-4 h-4 text-amber-300" />
                            </div>
                            <div>
                              <h5 className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-white font-sans">
                                Razorpay Secure Payment Gateway
                              </h5>
                              <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-mono font-semibold">
                                Instant Auto-Confirmation &amp; Official E-Receipt
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-amber-400 text-slate-950 text-[10px] font-mono font-black rounded-md uppercase tracking-wider shadow-xs">
                            256-BIT SSL ENCRYPTED
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          Click below to launch official Razorpay Checkout popup. Supports all payment options: <strong>Google Pay, PhonePe, Paytm, BHIM UPI, Credit/Debit Cards, Net Banking, and Wallet</strong>.
                        </p>

                        {razorpayError && (
                          <div className="p-3 bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-medium space-y-1">
                            <p className="font-bold">⚠️ Payment Notice:</p>
                            <p>{razorpayError}</p>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                          <button
                            type="button"
                            disabled={isRazorpayLoading}
                            onClick={handlePayWithRazorpay}
                            className="w-full sm:flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                          >
                            {isRazorpayLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Launching Razorpay Gateway...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-5 h-5 text-amber-300" />
                                <span>PAY ₹{submissionReceipt?.totalAmount} NOW VIA RAZORPAY GATEWAY</span>
                              </>
                            )}
                          </button>

                          <a
                            href="https://razorpay.me/@cscdost"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full sm:w-auto px-4 py-4 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 shrink-0"
                          >
                            <ExternalLink className="w-4 h-4 text-amber-400" />
                            <span>Razorpay.me Page</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* CONFIRMED VERIFIED APPLICATION RECEIPT VIEW */
                    <div className="space-y-4 pt-1 animate-fade-in">
                      <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-2.5">
                        <CheckCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-emerald-950 dark:text-emerald-200 uppercase font-sans">
                            Payment Confirmed &amp; Application Processed
                          </p>
                          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-mono font-medium">
                            Payment Mode: <strong className="uppercase">{submissionReceipt?.paymentMode}</strong> | Ref ID: <strong className="font-bold">{submissionReceipt?.utrNumber}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Details Summary Table */}
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 font-sans">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                          <span>Official Receipt Details</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div>
                            <span className="text-slate-500 font-medium">Applicant Name:</span>
                            <p className="font-bold text-slate-900 dark:text-white">{submissionReceipt?.customerName}</p>
                          </div>

                          <div>
                            <span className="text-slate-500 font-medium">Mobile Number:</span>
                            <p className="font-bold text-slate-900 dark:text-white font-mono">{submissionReceipt?.phoneNumber}</p>
                          </div>

                          <div>
                            <span className="text-slate-500 font-medium">Service Name:</span>
                            <p className="font-bold text-slate-900 dark:text-white">{submissionReceipt?.selectedService}</p>
                          </div>

                          <div>
                            <span className="text-slate-500 font-medium">Category:</span>
                            <p className="font-bold text-slate-900 dark:text-white uppercase">{submissionReceipt?.userCategory}</p>
                          </div>

                          <div>
                            <span className="text-slate-500 font-medium">Payment Mode:</span>
                            <p className="font-bold text-emerald-700 dark:text-emerald-400 uppercase font-mono font-black">{submissionReceipt?.paymentMode}</p>
                          </div>

                          <div>
                            <span className="text-slate-500 font-medium">Payment Ref / UTR:</span>
                            <p className="font-bold text-slate-900 dark:text-white font-mono">{submissionReceipt?.utrNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1 font-mono">
                        <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1 font-sans uppercase">
                          Fee Breakdown
                        </p>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Subtotal:</span>
                          <span>₹{(submissionReceipt?.applicationFee || 0) + (submissionReceipt?.portalFee || 70)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>GST (18%):</span>
                          <span>₹{Math.round((submissionReceipt?.portalFee || 70) * 0.18)}</span>
                        </div>
                        <div className="pt-1 border-t border-slate-300 dark:border-slate-700 flex justify-between font-sans text-sm font-black text-slate-900 dark:text-white">
                          <span>Total Paid:</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-base">₹{submissionReceipt?.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Action Bar (no-print) */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 no-print">
                  <button
                    type="button"
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
                    className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 font-sans shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
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
                    className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1.5 font-sans"
                  >
                    <Home className="w-3.5 h-3.5 text-amber-400" />
                    <span>Return to Home</span>
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
                  {selectedItem.advertisementNo && (
                    <>
                      <span>/</span>
                      <span className="text-yellow-300 font-bold">{selectedItem.advertisementNo}</span>
                    </>
                  )}
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

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-2 bg-white/15 hover:bg-white/30 text-white rounded-full transition-all absolute right-3.5 top-4 cursor-pointer border border-white/20 shadow-xs"
                title="Close Post View"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Post Content Body - Clean High-Contrast Light Theme */}
            <div className="p-4 sm:p-7 overflow-y-auto space-y-5 text-sm scrollbar-thin bg-slate-50">
              
              {/* Important Alert Strip */}
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 shadow-2xs">
                <Bell className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 font-mono">
                    Candidate Verification Advisory
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    Ensure all certificates (Aadhaar, Educational Marksheets, Category / Caste Certificates) match your full name and date of birth exactly before submitting. Applications processed through our CSC Desk undergo mandatory VLE verification.
                  </p>
                  {selectedItem.lastDate && (
                    <p className="text-xs font-bold text-red-700 font-mono pt-1">
                      ⏰ Application Closing Deadline: <span className="underline">{selectedItem.lastDate}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Google AdSense Banner Ad Slot */}
              <AdSenseSlot className="my-2" />

              {/* Prominent Short Information / Short Description Card */}
              <div className="bg-white border border-blue-200 rounded-2xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-900 font-mono flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-blue-700" />
                    <span>Short Description / Notification Summary</span>
                  </h4>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-mono font-bold rounded-full border border-blue-200">
                    Official Notice
                  </span>
                </div>

                <div className="text-slate-800 text-xs sm:text-sm leading-relaxed space-y-2.5 font-normal">
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="font-extrabold text-blue-900">{getOrgName(selectedItem)}</strong> has officially published the official notification for <strong className="font-black text-slate-950">{selectedItem.title}</strong>. {selectedItem.shortInfo || 'Interested and eligible candidates can read the complete notification details, eligibility criteria, age limits, and fee structure below before submitting their online application form.'}
                  </p>
                  
                  {/* Quick Post Metadata Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 bg-slate-100 rounded-lg flex flex-col border border-slate-200/60">
                      <span className="text-slate-600 text-[9px] uppercase font-bold">Post Date</span>
                      <span className="font-extrabold text-slate-900">{selectedItem.postDate}</span>
                    </div>
                    <div className="p-2 bg-slate-100 rounded-lg flex flex-col border border-slate-200/60">
                      <span className="text-slate-600 text-[9px] uppercase font-bold">Category</span>
                      <span className="font-extrabold text-blue-700 uppercase">{selectedItem.category.replace('_', ' ')}</span>
                    </div>
                    {selectedItem.advertisementNo ? (
                      <div className="p-2 bg-slate-100 rounded-lg flex flex-col col-span-2 sm:col-span-1 border border-slate-200/60">
                        <span className="text-slate-600 text-[9px] uppercase font-bold">Advt No.</span>
                        <span className="font-extrabold text-amber-700 truncate">{selectedItem.advertisementNo}</span>
                      </div>
                    ) : (
                      <div className="p-2 bg-slate-100 rounded-lg flex flex-col col-span-2 sm:col-span-1 border border-slate-200/60">
                        <span className="text-slate-600 text-[9px] uppercase font-bold">Status</span>
                        <span className="font-extrabold text-emerald-700">Active / Form Open</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Important Dates & Application Fees Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Important Dates Box */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-700 font-mono pb-2 border-b border-slate-100">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    <span>Key Examination Schedule</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">Notification Release:</span>
                      <span className="font-bold text-slate-900">{selectedItem.postDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">Date of Start (Form Open):</span>
                      <span className="font-bold text-emerald-700">{selectedItem.startDate || selectedItem.postDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">Last Date to Apply:</span>
                      <span className="font-extrabold text-red-600">{selectedItem.lastDate || 'As per notification'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">Last Date Pay Fee:</span>
                      <span className="font-bold text-slate-900">{selectedItem.lastDate || 'Same as last date'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 font-medium">Exam Date / Admit Card:</span>
                      <span className="font-bold text-indigo-700">
                        {selectedItem.category === 'army_jobs' ? 'To be notified on www.joinindianarmy.nic.in' : selectedItem.category === 'rrb_jobs' ? 'To be notified on www.rrbapply.gov.in' : selectedItem.category === 'ssc_jobs' ? 'To be notified on ssc.gov.in' : selectedItem.category === 'nta' ? 'To be notified on www.nta.ac.in' : selectedItem.category === 'cluster_univ' ? 'To be notified on cusrinagar.edu.in' : 'To be notified soon on official portal'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fee Structure Box */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 font-mono pb-2 border-b border-slate-100">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    <span>Exam Fee Structure &amp; Subject Charges</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    {selectedItem.feePerSubject && (
                      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl mb-1">
                        <span className="text-amber-800 dark:text-amber-300 text-[10px] uppercase font-bold block">Fee As Per Subject / Paper:</span>
                        <span className="font-black text-amber-950 dark:text-amber-200 text-xs">{selectedItem.feePerSubject}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">General / Category Candidates:</span>
                      <span className="font-extrabold text-slate-900">{selectedItem.fees?.genObc || 'As per subject paper'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">SC / ST / Divyang:</span>
                      <span className="font-extrabold text-emerald-700">{selectedItem.fees?.scSt || 'As per university rules'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 font-medium">Online Mode:</span>
                      <span className="font-bold text-amber-700">NetBanking / Credit / Debit Card</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Total Number of Posts / Seats Banner */}
              {selectedItem.totalPosts && (
                <div className={`bg-gradient-to-r text-white border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm ${
                  selectedItem.category === 'admissions'
                    ? 'from-teal-950 via-slate-900 to-teal-900 border-teal-700'
                    : selectedItem.category === 'exam_forms'
                    ? 'from-amber-950 via-slate-900 to-amber-900 border-amber-700'
                    : selectedItem.category === 'cluster_univ'
                    ? 'from-cyan-950 via-slate-900 to-cyan-900 border-cyan-700'
                    : selectedItem.category === 'nta'
                    ? 'from-red-950 via-slate-900 to-red-900 border-red-700'
                    : selectedItem.category === 'ssc_jobs'
                    ? 'from-orange-950 via-slate-900 to-orange-900 border-orange-700'
                    : selectedItem.category === 'rrb_jobs'
                    ? 'from-emerald-950 via-slate-900 to-emerald-900 border-emerald-700'
                    : selectedItem.category === 'army_jobs'
                    ? 'from-red-950 via-slate-900 to-red-900 border-red-700'
                    : 'from-indigo-950 via-slate-900 to-indigo-900 border-indigo-700'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl font-black shrink-0">
                      {selectedItem.category === 'admissions' || selectedItem.category === 'nta' ? (
                        <GraduationCap className="w-5 h-5" />
                      ) : selectedItem.category === 'exam_forms' ? (
                        <FileCheck className="w-5 h-5" />
                      ) : selectedItem.category === 'cluster_univ' ? (
                        <Building2 className="w-5 h-5" />
                      ) : selectedItem.category === 'rrb_jobs' ? (
                        <Train className="w-5 h-5" />
                      ) : selectedItem.category === 'army_jobs' ? (
                        <Shield className="w-5 h-5" />
                      ) : (
                        <Briefcase className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest block">
                        {selectedItem.category === 'admissions' || selectedItem.category === 'cluster_univ' || selectedItem.category === 'nta'
                          ? 'TOTAL SEATS / INTAKE CAPACITY'
                          : selectedItem.category === 'exam_forms'
                          ? 'EXPECTED CANDIDATE ENROLMENT'
                          : 'TOTAL NUMBER OF VACANCIES / POSTS'}
                      </span>
                      <h4 className="text-lg sm:text-xl font-black tracking-tight text-white font-mono">
                        {selectedItem.totalPosts}
                      </h4>
                    </div>
                  </div>
                  {selectedItem.officialLink && (
                    <a
                      href={selectedItem.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shrink-0 font-bold"
                    >
                      <span>
                        {selectedItem.category === 'admissions'
                          ? 'Official Admission Portal'
                          : selectedItem.category === 'exam_forms'
                          ? 'Official KU Exam Portal'
                          : selectedItem.category === 'cluster_univ'
                          ? 'Official CUS Portal'
                          : selectedItem.category === 'nta'
                          ? 'Official NTA Portal'
                          : selectedItem.category === 'ssc_jobs'
                          ? 'Official SSC Portal (ssc.gov.in)'
                          : selectedItem.category === 'rrb_jobs'
                          ? 'Official RRB Portal (rrbapply.gov.in)'
                          : selectedItem.category === 'army_jobs'
                          ? 'Official Army Portal (joinindianarmy.nic.in)'
                          : 'Official Advertisement PDF'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Department-wise Post / Course / Exam Form Breakdown Table */}
              {selectedItem.departmentBreakdown && selectedItem.departmentBreakdown.length > 0 && (
                <div className={`bg-white border rounded-2xl p-5 space-y-3.5 shadow-xs ${
                  selectedItem.category === 'admissions'
                    ? 'border-teal-200'
                    : selectedItem.category === 'exam_forms'
                    ? 'border-amber-200'
                    : selectedItem.category === 'cluster_univ'
                    ? 'border-cyan-200'
                    : selectedItem.category === 'nta'
                    ? 'border-red-200'
                    : selectedItem.category === 'ssc_jobs'
                    ? 'border-orange-200'
                    : selectedItem.category === 'rrb_jobs'
                    ? 'border-emerald-200'
                    : selectedItem.category === 'army_jobs'
                    ? 'border-red-200'
                    : 'border-indigo-200'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider font-mono flex items-center gap-2 text-slate-900">
                      {selectedItem.category === 'admissions' || selectedItem.category === 'nta' ? (
                        <GraduationCap className="w-4.5 h-4.5 text-teal-700" />
                      ) : selectedItem.category === 'exam_forms' ? (
                        <FileCheck className="w-4.5 h-4.5 text-amber-700" />
                      ) : selectedItem.category === 'cluster_univ' ? (
                        <Building2 className="w-4.5 h-4.5 text-cyan-700" />
                      ) : selectedItem.category === 'rrb_jobs' ? (
                        <Train className="w-4.5 h-4.5 text-emerald-700" />
                      ) : selectedItem.category === 'army_jobs' ? (
                        <Shield className="w-4.5 h-4.5 text-red-700" />
                      ) : (
                        <Briefcase className="w-4.5 h-4.5 text-orange-700" />
                      )}
                      <span>
                        {selectedItem.category === 'admissions' || selectedItem.category === 'cluster_univ' || selectedItem.category === 'nta'
                          ? 'Department / Stream / Exam Paper Breakdown'
                          : selectedItem.category === 'exam_forms'
                          ? 'Department / Course-Wise Exam Form Breakdown & Subject Fees'
                          : selectedItem.category === 'ssc_jobs'
                          ? 'Ministry / Department / Cadre-Wise Post Breakdown & Eligibility'
                          : selectedItem.category === 'rrb_jobs'
                          ? 'Railway Zone / Department / Cadre-Wise Post Breakdown & Eligibility'
                          : selectedItem.category === 'army_jobs'
                          ? 'Arm / Service / Regiment / Wing-Wise Breakdown & Qualification'
                          : 'Department-wise Post Breakdown & Qualifications'}
                      </span>
                    </h4>
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full border ${
                      selectedItem.category === 'admissions'
                        ? 'bg-teal-100 text-teal-900 border-teal-200'
                        : selectedItem.category === 'exam_forms'
                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                        : selectedItem.category === 'cluster_univ'
                        ? 'bg-cyan-100 text-cyan-900 border-cyan-200'
                        : selectedItem.category === 'nta'
                        ? 'bg-red-100 text-red-900 border-red-200'
                        : selectedItem.category === 'ssc_jobs'
                        ? 'bg-orange-100 text-orange-900 border-orange-200'
                        : selectedItem.category === 'rrb_jobs'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                        : selectedItem.category === 'army_jobs'
                        ? 'bg-red-100 text-red-900 border-red-200'
                        : 'bg-indigo-100 text-indigo-900 border-indigo-200'
                    }`}>
                      Official Distribution
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-200">
                      <thead className={`font-extrabold uppercase text-[10px] tracking-wider font-mono ${
                        selectedItem.category === 'admissions'
                          ? 'bg-teal-50/80 text-teal-950'
                          : selectedItem.category === 'exam_forms'
                          ? 'bg-amber-50/80 text-amber-950'
                          : selectedItem.category === 'cluster_univ'
                          ? 'bg-cyan-50/80 text-cyan-950'
                          : selectedItem.category === 'nta'
                          ? 'bg-red-50/80 text-red-950'
                          : selectedItem.category === 'ssc_jobs'
                          ? 'bg-orange-50/80 text-orange-950'
                          : selectedItem.category === 'rrb_jobs'
                          ? 'bg-emerald-50/80 text-emerald-950'
                          : selectedItem.category === 'army_jobs'
                          ? 'bg-red-50/80 text-red-950'
                          : 'bg-indigo-50/80 text-indigo-950'
                      }`}>
                        <tr>
                          <th className="py-2.5 px-3">
                            {selectedItem.category === 'admissions' || selectedItem.category === 'exam_forms' || selectedItem.category === 'cluster_univ' || selectedItem.category === 'nta'
                              ? 'School / Department'
                              : 'Department Name'}
                          </th>
                          <th className="py-2.5 px-3">
                            {selectedItem.category === 'admissions' || selectedItem.category === 'exam_forms' || selectedItem.category === 'cluster_univ' || selectedItem.category === 'nta'
                              ? 'Programme / Course Title'
                              : 'Post Title'}
                          </th>
                          <th className="py-2.5 px-3 text-center">
                            {selectedItem.category === 'admissions' || selectedItem.category === 'cluster_univ' || selectedItem.category === 'nta'
                              ? 'Seats / Intake'
                              : selectedItem.category === 'exam_forms'
                              ? 'Fee as per Subject'
                              : 'No. of Posts'}
                          </th>
                          <th className="py-2.5 px-3">
                            {selectedItem.category === 'admissions' || selectedItem.category === 'exam_forms' || selectedItem.category === 'cluster_univ' || selectedItem.category === 'nta'
                              ? 'Eligibility & Requirements'
                              : 'Educational / Technical Qualification'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {selectedItem.departmentBreakdown.map((dept, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-900">{dept.department}</td>
                            <td className={`py-3 px-3 font-semibold ${
                              selectedItem.category === 'admissions'
                                ? 'text-teal-900'
                                : selectedItem.category === 'exam_forms'
                                ? 'text-amber-900'
                                : selectedItem.category === 'cluster_univ'
                                ? 'text-cyan-900'
                                : selectedItem.category === 'nta'
                                ? 'text-red-900'
                                : selectedItem.category === 'ssc_jobs'
                                ? 'text-orange-950 dark:text-orange-300'
                                : 'text-indigo-900'
                            }`}>{dept.postName}</td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 font-mono font-black rounded-md ${
                                selectedItem.category === 'admissions'
                                  ? 'bg-teal-100 text-teal-900'
                                  : selectedItem.category === 'exam_forms'
                                  ? 'bg-amber-100 text-amber-950 border border-amber-300'
                                  : selectedItem.category === 'cluster_univ'
                                  ? 'bg-cyan-100 text-cyan-950 border border-cyan-300'
                                  : selectedItem.category === 'nta'
                                  ? 'bg-red-100 text-red-950 border border-red-300'
                                  : selectedItem.category === 'ssc_jobs'
                                  ? 'bg-orange-100 text-orange-950 border border-orange-300'
                                  : 'bg-indigo-100 text-indigo-900'
                              }`}>
                                {dept.posts}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 text-[11px] leading-snug">{dept.qualification}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Age Specifications & Qualification Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Eligibility &amp; Qualification Criteria</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {selectedItem.ageLimit && (
                    <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-black uppercase text-amber-800 font-mono block">Age Limit Criteria</span>
                      <p className="font-bold text-slate-900">
                        {selectedItem.ageLimit}
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-blue-800 font-mono block">Educational Qualification</span>
                    <p className="font-semibold text-slate-900">
                      {selectedItem.eligibility || 'Graduate Degree / 10th / 12th Pass from recognized board in India.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Required Documents Checklist for CSC Desk Application */}
              {!['answer_keys', 'syllabus', 'results'].includes(selectedItem.category) && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Documents Required for CSC Desk Submission</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800">Aadhaar Card / Govt Photo ID</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800">Educational Certificate / Marksheet</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800">Passport Photo &amp; Signature Scan</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800">Caste / Domicile Certificate (if applicable)</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Navigation Buttons (Fixed Bar) */}
            <div className="p-4 sm:p-5 border-t border-slate-200 flex items-center justify-between gap-3 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-5 sm:px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-300 flex items-center gap-1.5"
                id="sarkari-post-close-btn"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>

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

    </section>
  );
}
