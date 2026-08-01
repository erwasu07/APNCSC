import React, { useState, useEffect } from 'react';
import TrackApplication from './TrackApplication';
import { db } from '../lib/firebase';
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
  Eye
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
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'admit_cards' | 'results' | 'answer_keys' | 'syllabus' | 'admissions'>('jobs');

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
  const [postSubmitPaymentMode, setPostSubmitPaymentMode] = useState<'none' | 'online' | 'cash'>('none');
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

      const data = await res.json();
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
          dataUrl
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
            dataUrl
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
      setPostSubmitPaymentMode('none');
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

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const mockAppId = `APEX-2026-${randomNum}`;
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
    setPostSubmitPaymentMode('none');
    setIsPaymentConfirmed(false);

    // Automatically trigger WhatsApp invoice notification dispatch
    triggerWhatsAppInvoiceDispatch(mockReceipt);

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
      documents: uploadedFiles,
      status: 'Pending',
      submittedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      statusUpdatedAt: nowIso
    };

    // 1. Save directly to Cloud Firestore in both 'applications' and 'appointments' collections
    try {
      setDoc(doc(db, 'applications', mockReceipt.appId), initialPayload, { merge: true }).catch(fsErr => {
        console.error('Firestore "applications" save error:', fsErr);
      });
      setDoc(doc(db, 'appointments', mockReceipt.appId), initialPayload, { merge: true }).catch(fsErr => {
        console.error('Firestore "appointments" save error:', fsErr);
      });
    } catch (fsErr) {
      console.error('Firestore save execution exception:', fsErr);
    }

    // 2. Always POST to server API as secondary persistence
    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialPayload)
    })
      .then(res => res.json())
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
      documents: uploadedFiles,
      status: 'Pending',
      submittedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      statusUpdatedAt: nowIso
    };

    // Save directly to Cloud Firestore in both 'applications' and 'appointments' collections
    try {
      setDoc(doc(db, 'applications', updatedReceipt.appId), payload, { merge: true }).catch(fsErr => {
        console.error('Firestore "applications" payment update error:', fsErr);
      });
      setDoc(doc(db, 'appointments', updatedReceipt.appId), payload, { merge: true }).catch(fsErr => {
        console.error('Firestore "appointments" payment update error:', fsErr);
      });
    } catch (fsErr) {
      console.error('Firestore payment update execution error:', fsErr);
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
      const data = await res.json();

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

      if (typeof window !== 'undefined') {
        setTimeout(() => {
          try {
            window.print();
          } catch (e) {
            console.log('Print trigger error:', e);
          }
        }, 350);
      }
    }, 100);
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
      
      {/* 1. 📢 YELLOW TOP NEWS TICKER STRIP (Exact CSC DOST Portal Style) */}
      <div className="bg-[#f59e0b] border-b border-amber-500 py-2 px-3 sm:px-4 shadow-sm w-full mb-6 text-slate-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs font-sans relative">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 overflow-hidden">
            <span className="bg-slate-950 text-amber-300 font-extrabold text-[11px] px-2.5 py-1 rounded uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-xs z-10">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>LATEST NEWS:</span>
            </span>
            <div className="overflow-hidden whitespace-nowrap text-xs font-bold text-slate-950 flex-1 relative group">
              <div className="animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused] flex items-center">
                {/* 8 News Items - Primary Copy */}
                <div className="inline-flex items-center gap-6 pr-6 shrink-0">
                  {/* Job Notifications (2) */}
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

                  {/* Form Results (2) */}
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

                  {/* Answer Keys (2) */}
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

                  {/* Admission Updates (2) */}
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

                {/* 8 News Items - Duplicate Copy for Infinite Seamless Loop */}
                <div className="inline-flex items-center gap-6 pr-6 shrink-0" aria-hidden="true">
                  {/* Job Notifications (2) */}
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

                  {/* Form Results (2) */}
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

                  {/* Answer Keys (2) */}
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

                  {/* Admission Updates (2) */}
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
          <a
            href="#bulletin-board-section"
            className="bg-[#0f172a] hover:bg-black text-white font-black text-[11px] px-3.5 py-1.5 rounded transition-all shadow-xs shrink-0 flex items-center gap-1 cursor-pointer z-10"
          >
            <span>View All Bulletins</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-1.5 sm:px-4 md:px-6">
        
        {/* 2. 🏛️ APEX SECURE PORTAL HEADER & VERIFIED DESK CARD */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#2f2b80] text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-widest font-mono">
                APEX SECURE PORTAL
              </span>
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-widest font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>🔒 SECURE SSL - Gateway Active</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display leading-tight">
              Digital Application &amp; Appointment Desk
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              Instant Online Government Form Filing, Sarkari Jobs Apply, and PVC e-Services Verification
            </p>
          </div>

          {/* Top Right Verified Desk Badge Card */}
          <div className="bg-amber-50/70 dark:bg-slate-950 p-3.5 rounded-xl border border-amber-300/80 dark:border-amber-800/60 shadow-xs flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-base shadow-xs">
              ✓
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-black text-slate-900 dark:text-white block uppercase tracking-wider text-[11px]">
                Verified CSC Desk #212515670018
              </span>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">
                Official VLE Desk Lead: <strong className="font-extrabold underline text-amber-800 dark:text-amber-300">Wasim Ahmad Khanday</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 🚀 2-COLUMN HERO MAIN GRID: LEFT = APPLICATION FORM, RIGHT = TRACKER WIDGET */}
        <div id="booking-portal-form" className="mb-10 scroll-mt-24 w-full">
          {!isFormSubmitted ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: OFFICIAL APPLICATION FORM */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-md overflow-hidden">
                
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

                    <div className="space-y-3">
                      {/* Service / Exam Dropdown */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Select Service to Apply <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.selectedService}
                          onChange={(e) => handleServiceChange(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-bold text-xs outline-none cursor-pointer"
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

                      {/* Required Documents Banner */}
                      <div className="bg-slate-100/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <Info className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                          <strong className="font-extrabold text-slate-900 dark:text-white">Required Documents:</strong>{' '}
                          {docRequirement.mandatory && docRequirement.requiredDocTypes.length > 0
                            ? docRequirement.requiredDocTypes.map(d => d.shortName).join(', ')
                            : 'No documents required for this service'}
                        </span>
                      </div>

                      {/* Applicant Category (Determines Concession Fee) */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                          Applicant Category (Determines Concession Fee)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleCategoryChange('genObc')}
                            className={`py-2.5 px-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer text-center ${
                              formData.userCategory === 'genObc'
                                ? 'bg-[#28256e] text-white shadow-md'
                                : 'bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            General / OBC / Unreserved
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCategoryChange('scSt')}
                            className={`py-2.5 px-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer text-center ${
                              formData.userCategory === 'scSt'
                                ? 'bg-[#28256e] text-white shadow-md'
                                : 'bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            SC / ST / EWS / PwD / Female
                          </button>
                        </div>
                      </div>
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
                                          <span className="text-[9px] text-slate-400 font-mono block">
                                            {(uploadedDoc.size / 1024).toFixed(1)} KB
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

                        {/* Attached Files Counter Summary */}
                        {uploadedFiles.length > 0 && (
                          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                            <span>Total Uploaded Documents: {uploadedFiles.length} of {docRequirement.requiredDocTypes.length}</span>
                            <span className="text-emerald-600 dark:text-emerald-400">✓ Ready for submission</span>
                          </div>
                        )}
                      </div>
                    )}



                    {/* Solid Emerald Green Submit Button */}
                    <div className="pt-2 space-y-3">
                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-[#00a86b] hover:bg-[#008f5a] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Submit Application &amp; Proceed to Payment</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1">
                        <span>🔒</span>
                        <span>Encrypted 256-bit SSL transaction verified by CSC e-Governance Ltd.</span>
                      </p>
                    </div>
                  </form>
                </div>
              </div>

              {/* RIGHT COLUMN: APPLICATION TRACKER WIDGET */}
              <div className="lg:col-span-5 space-y-5">
                <TrackApplication />
              </div>

            </div>
          ) : !isPaymentConfirmed ? (
            /* POST-SUBMISSION PAYMENT MODE SELECTION STEP */
            <div id="booking-portal-form" className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto animate-fade-in">
              <div className="text-center pb-5 border-b border-slate-200 dark:border-slate-800 space-y-2">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full text-xs font-extrabold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                  <span>Step 2 of 2</span>
                  <span>•</span>
                  <span>Select Payment Method</span>
                </div>
                <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white font-display">
                  Select Payment Option
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Token Reference ID: <span className="font-bold text-slate-800 dark:text-slate-200">{submissionReceipt?.appId}</span>
                </p>
              </div>

              {/* Applicant & Service Summary */}
              <div className="my-5 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
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

              {/* TRANSPARENT DYNAMIC FEE CALCULATOR (Moved to Step 2) */}
              <div className="mb-5 bg-[#0b1120] text-white p-4 rounded-xl border border-slate-800 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-200">
                    <span>📊</span>
                    <span>TRANSPARENT DYNAMIC FEE CALCULATOR</span>
                  </div>
                  <span className="bg-[#042f1e] text-[#00e699] border border-[#00b377]/60 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded">
                    Node Rate Locked
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono pt-1 text-slate-300">
                  <div className="flex justify-between items-center">
                    <span>Govt Prescribed Fee ({submissionReceipt?.userCategory || 'General/OBC'}):</span>
                    <span className="font-bold text-white">₹{submissionReceipt?.applicationFee || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>CSC Node Portal Charge (Fixed):</span>
                    <span className="font-bold text-white">₹{submissionReceipt?.portalFee || 50}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>GST (18% on CSC Charge):</span>
                    <span className="font-bold text-white">₹{Math.round((submissionReceipt?.portalFee || 50) * 0.18)}</span>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-800 my-1"></div>

                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">TOTAL PAYABLE AMOUNT:</span>
                  <span className="text-xl font-black font-mono text-[#00e699]">
                    ₹{submissionReceipt?.totalAmount || 0}
                  </span>
                </div>
              </div>

              {/* Payment Mode Buttons: ONLY APPEAR AFTER SUBMITTING APPLICATION FORM */}
              <div className="space-y-4">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 block flex items-center justify-between">
                  <span>Choose Payment Method:</span>
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                    Select an option below
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPostSubmitPaymentMode('online');
                      setUtrError(null);
                    }}
                    className={`group relative p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer text-left shadow-xs hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                      postSubmitPaymentMode === 'online'
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-500/15 dark:bg-blue-500/25 text-slate-900 dark:text-white font-extrabold shadow-md ring-4 ring-blue-500/25 scale-[1.01]'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl shrink-0 transition-colors duration-200 ${
                        postSubmitPaymentMode === 'online'
                          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300/50'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
                      }`}>
                        <QrCode className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Pay Online</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Scan Google Pay / UPI QR Code</span>
                      </div>
                    </div>
                    {postSubmitPaymentMode === 'online' ? (
                      <div className="bg-blue-600 text-white p-1 rounded-full shrink-0 shadow-xs animate-in zoom-in-75">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700 group-hover:border-blue-500 shrink-0 transition-colors" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPostSubmitPaymentMode('cash');
                      setUtrError(null);
                    }}
                    className={`group relative p-4 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer text-left shadow-xs hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                      postSubmitPaymentMode === 'cash'
                        ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-500/15 dark:bg-emerald-500/25 text-slate-900 dark:text-white font-extrabold shadow-md ring-4 ring-emerald-500/25 scale-[1.01]'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl shrink-0 transition-colors duration-200 ${
                        postSubmitPaymentMode === 'cash'
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300/50'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white'
                      }`}>
                        <IndianRupee className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Cash Counter</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Pay in person at Cyber Cafe</span>
                      </div>
                    </div>
                    {postSubmitPaymentMode === 'cash' ? (
                      <div className="bg-emerald-600 text-white p-1 rounded-full shrink-0 shadow-xs animate-in zoom-in-75">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700 group-hover:border-emerald-500 shrink-0 transition-colors" />
                    )}
                  </button>
                </div>

                {/* QR CODE DISPLAY LOGIC: REMAINS HIDDEN UNTIL 'Pay Online' IS SELECTED */}
                {postSubmitPaymentMode === 'none' ? (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-xs font-semibold">
                      👈 Please select either <span className="font-extrabold text-blue-600 dark:text-blue-400">Pay Online</span> or <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Cash Counter</span> above to proceed.
                    </p>
                  </div>
                ) : postSubmitPaymentMode === 'online' ? (
                  /* QR CODE IS REVEALED AND DISPLAYED ONLY NOW AFTER Pay Online IS CLICKED */
                  <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-5 shadow-md border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center animate-fade-in relative overflow-hidden">
                    {/* Decorative Google Colors Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 flex">
                      <div className="w-1/4 bg-[#4285F4]"></div>
                      <div className="w-1/4 bg-[#34A853]"></div>
                      <div className="w-1/4 bg-[#FBBC05]"></div>
                      <div className="w-1/4 bg-[#EA4335]"></div>
                    </div>

                    {/* Google Pay Header */}
                    <div className="mt-1 mb-2 flex flex-col items-center">
                      <div className="flex items-center justify-center gap-1 font-extrabold text-lg text-slate-800 dark:text-white tracking-tight">
                        <span className="text-[#4285F4]">G</span>
                        <span className="text-[#EA4335]">o</span>
                        <span className="text-[#FBBC05]">o</span>
                        <span className="text-[#4285F4]">g</span>
                        <span className="text-[#34A853]">l</span>
                        <span className="text-[#EA4335]">e</span>
                        <span className="ml-1 text-slate-800 dark:text-slate-100 font-bold">Pay</span>
                      </div>
                      
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                        Model Common Service Centre
                      </h4>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                        +91 70068 33767
                      </p>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                        Scan &amp; Pay ₹{submissionReceipt?.totalAmount}
                      </p>
                    </div>

                    {/* High Quality QR Code Image */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-inner my-1 flex flex-col items-center relative">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=000000&data=${encodeURIComponent(
                          `upi://pay?pa=7006833767-2@okbizaxis&pn=Model%20Common%20Service%20Centre&am=${submissionReceipt?.totalAmount}&cu=INR&tn=CSC_DOST_${encodeURIComponent((submissionReceipt?.customerName || 'Payment').replace(/\s+/g, '_'))}`
                        )}`}
                        alt="Google Pay QR Code"
                        className="w-44 h-44 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* UPI ID Banner with Copy Button */}
                    <div className="mt-2 w-full max-w-xs">
                      <div className="flex items-center justify-between gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <span className="text-xs font-mono font-extrabold text-slate-800 dark:text-slate-200 truncate">
                          7006833767-2@okbizaxis
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('7006833767-2@okbizaxis');
                            setCopiedUpi(true);
                            setTimeout(() => setCopiedUpi(false), 2000);
                          }}
                          className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? (
                            <>
                              <Check className="w-3 h-3 text-white" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mandatory UTR Input */}
                    <div className="w-full mt-4 text-left border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>12-Digit UTR / Transaction Ref ID <span className="text-red-500">*</span></span>
                        <span className="text-[9px] text-red-500 font-extrabold uppercase bg-red-50 dark:bg-red-950 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">Mandatory</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter 12-Digit UTR No. (e.g., 420819123456)"
                        value={formData.utrNumber}
                        onChange={(e) => {
                          setFormData({ ...formData, utrNumber: e.target.value });
                          if (utrError) setUtrError(null);
                        }}
                        className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border ${utrError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-amber-400 dark:border-amber-500 focus:border-amber-500'} rounded-xl text-slate-900 dark:text-white font-mono font-extrabold text-xs focus:ring-2 focus:ring-amber-500/20 outline-none`}
                      />
                      {utrError ? (
                        <p className="text-xs text-red-500 font-bold animate-pulse">
                          ⚠️ {utrError}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          * Copy the 12-digit UTR/Ref No. from GPay/PhonePe/Paytm payment receipt and paste above.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleConfirmPayment}
                        className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Confirm Online Payment &amp; Generate Slip</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* CASH COUNTER OPTION: QR CODE REMAINS HIDDEN */
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-3 animate-fade-in">
                    <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
                    <div>
                      <h5 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wide">
                        Visit &amp; Pay At Cyber Cafe Branch Counter
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
                        Your application details have been saved. You can pay the total amount of <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">₹{submissionReceipt?.totalAmount}</span> in cash or UPI directly at our counter using Token ID: <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{submissionReceipt?.appId}</span>.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Confirm Cash Payment Mode &amp; Generate Slip</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* PRINTABLE DIGITAL SUCCESS SLIP / RECEIPT (Exact Image 2 Style) */
            <div id="printable-digital-slip" className="bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-300 max-w-xl mx-auto animate-fade-in relative w-full">
              
              {/* Dark Navy Header Bar */}
              <div className="bg-[#1e2358] text-white px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Official CSC e-Receipt</span>
                </div>
                <button
                  onClick={() => setIsFormSubmitted(false)}
                  className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Modal Body */}
              <div className="p-5 sm:p-6 space-y-4">
                
                {/* Header Branding */}
                <div className="text-center space-y-1">
                  <span className="inline-block bg-[#f59e0b] text-slate-950 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-wider font-mono shadow-xs">
                    CSC DOST • VLE NODE #212515670018
                  </span>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 font-display pt-1">
                    COMMON SERVICES CENTRE PORTAL
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium italic">
                    Ministry of Electronics &amp; IT, Govt of India Authorized Desk
                  </p>
                </div>

                {/* ALLOCATED APPLICATION TOKEN ID Box (Light Mint Green) */}
                <div className="bg-[#e6f7f0] border-2 border-[#10b981] rounded-xl p-3.5 text-center space-y-1 shadow-xs">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#047857]">
                    ALLOCATED APPLICATION TOKEN ID
                  </p>
                  <p className="text-2xl sm:text-3xl font-black font-mono text-[#047857] tracking-wider">
                    {submissionReceipt?.appId || 'CSC-6938-PAN'}
                  </p>
                  <p className="text-[11px] font-bold text-[#059669]">
                    Status: <span className="underline">Received</span>
                  </p>
                </div>

                {/* Receipt Details Table */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs font-sans">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Applicant Name:</span>
                    <span className="font-extrabold text-slate-900 uppercase">{submissionReceipt?.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">WhatsApp Mobile:</span>
                    <span className="font-extrabold text-slate-900 font-mono">{submissionReceipt?.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Service Category:</span>
                    <span className="font-extrabold text-slate-900">{submissionReceipt?.userCategory === 'genObc' ? 'General/OBC' : 'SC/ST'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">E-Service Applied:</span>
                    <span className="font-extrabold text-[#28256e] text-right max-w-[240px] truncate">{submissionReceipt?.selectedService}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Submission Date &amp; Time:</span>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">{submissionReceipt?.submittedAt}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Estimated Turnaround:</span>
                    <span className="font-extrabold text-emerald-600">2-3 Working Days</span>
                  </div>
                </div>

                {/* Dark Navy Fee Summary Box */}
                <div className="bg-[#0b1120] text-white rounded-xl p-3.5 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Government Prescribed Fee:</span>
                    <span className="font-bold text-white">₹{submissionReceipt?.applicationFee || 107}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>CSC Processing Charge:</span>
                    <span className="font-bold text-white">₹{submissionReceipt?.portalFee || 50}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>GST (18%):</span>
                    <span className="font-bold text-white">₹{Math.round((submissionReceipt?.portalFee || 50) * 0.18)}</span>
                  </div>
                  <div className="h-[1px] bg-slate-800 my-1"></div>
                  <div className="flex justify-between items-center font-sans">
                    <span className="font-extrabold uppercase text-slate-200">Total Paid Amount:</span>
                    <span className="text-xl font-black font-mono text-[#00e699]">
                      ₹{submissionReceipt?.totalAmount || 166}
                    </span>
                  </div>
                </div>

                {/* Digital India Security Seal */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="p-1 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&color=0b1120&data=${encodeURIComponent(`Token:${submissionReceipt?.appId}|VLE:Wasim Ahmad Khanday`)}`}
                      alt="CSC Security Seal"
                      className="w-12 h-12"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-left space-y-0.5">
                    <p className="text-xs font-black text-slate-900 uppercase">Digital India Security Seal</p>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Scan QR code at any CSC kiosk to verify authenticity.
                    </p>
                    <p className="text-[10px] font-bold text-slate-700 pt-0.5">
                      Authorized VLE: <span className="font-extrabold">Wasim Ahmad Khanday</span>
                    </p>
                  </div>
                </div>

                {/* WHATSAPP AUTOMATED INVOICE NOTIFICATION STATUS BOX */}
                <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-xl p-3.5 space-y-2.5 no-print text-left">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-xs">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white block">
                          Automated WhatsApp Invoice
                        </span>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                          Target Mobile: <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{submissionReceipt?.phoneNumber}</span>
                        </p>
                      </div>
                    </div>

                    {whatsappStatus?.loading ? (
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md animate-pulse">
                        Dispatching...
                      </span>
                    ) : whatsappStatus?.sent ? (
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Invoice Sent
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-slate-800 bg-slate-200 dark:bg-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md">
                        Notice / Direct Dispatch
                      </span>
                    )}
                  </div>

                  {whatsappStatus?.message && (
                    <p className="text-[10.5px] text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-100/80 dark:bg-emerald-950/80 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      ✅ {whatsappStatus.message}
                    </p>
                  )}

                  {whatsappStatus?.error && (
                    <p className="text-[10.5px] text-amber-800 dark:text-amber-300 font-semibold bg-amber-100/80 dark:bg-amber-950/80 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      ℹ️ {whatsappStatus.error}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-200 dark:border-emerald-800/80">
                    <button
                      type="button"
                      onClick={() => triggerWhatsAppInvoiceDispatch(submissionReceipt)}
                      disabled={whatsappStatus?.loading}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{whatsappStatus?.loading ? 'Sending...' : 'Re-send WhatsApp Invoice'}</span>
                    </button>

                    {whatsappStatus?.directWhatsAppUrl && (
                      <a
                        href={whatsappStatus.directWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ExternalLink className="w-3 h-3 text-amber-400" />
                        <span>Open Invoice on WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 no-print">
                  <button
                    onClick={() => {
                      if (!submissionReceipt) return;
                      const msg = `*New Application Query Submitted on Website!*
*Token ID:* ${submissionReceipt.appId}
*Name:* ${submissionReceipt.customerName}
*Mobile:* ${submissionReceipt.phoneNumber}
*Email:* ${submissionReceipt.emailAddress}
*DOB:* ${submissionReceipt.dateOfBirth}
*Service Requested:* ${submissionReceipt.selectedService}
*Category:* ${submissionReceipt.userCategory}
*Payment Mode:* ${submissionReceipt.paymentMode}
*Payment UTR / Ref No:* ${submissionReceipt.utrNumber}
*Attached Documents:* ${submissionReceipt.uploadedDocuments && submissionReceipt.uploadedDocuments.length > 0 ? submissionReceipt.uploadedDocuments.join(', ') : 'None'}
*Amount:* ₹${submissionReceipt.totalAmount}
*Instructions:* ${submissionReceipt.additionalDetails}`;
                      window.open(`https://wa.me/917006833767?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/30"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send to WhatsApp Admin</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 font-sans"
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
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    Apply Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section Header & Search Input (Image 1 Layout) */}
        <div id="sarkari-board" className="max-w-7xl mx-auto mb-8 scroll-mt-24 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            {/* Title & Subtitle */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-full text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>SARKARI BULLETIN BOARD</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono pl-1 border-l border-red-300 dark:border-red-800">Updated Hourly</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                Sarkari Exam, Recruitment &amp; Results Desk
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
                Verified Government Exam Notifications, Admit Cards &amp; Results for Digital India Aspirants
              </p>
            </div>

            {/* Top Right Search Input Box */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search exams, recruitment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 font-medium shadow-xs"
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

          {/* Quick Filter Navigation Tabs (Image 1 Pills Layout) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-[#1e1b4b] text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
              id="sarkari-tab-jobs"
            >
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Latest Jobs</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                activeTab === 'jobs' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {getItemsByCategory('jobs').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('admit_cards')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admit_cards'
                  ? 'bg-[#1e1b4b] text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
              id="sarkari-tab-admit"
            >
              <FileText className="w-4 h-4 text-orange-400" />
              <span>Admit Cards</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                activeTab === 'admit_cards' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {getItemsByCategory('admit_cards').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'results'
                  ? 'bg-[#1e1b4b] text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
              id="sarkari-tab-results"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Results</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                activeTab === 'results' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {getItemsByCategory('results').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('answer_keys')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'answer_keys'
                  ? 'bg-[#1e1b4b] text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
              id="sarkari-tab-keys"
            >
              <Key className="w-4 h-4 text-purple-400" />
              <span>Answer Keys</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                activeTab === 'answer_keys' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {getItemsByCategory('answer_keys').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('syllabus')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'syllabus'
                  ? 'bg-[#1e1b4b] text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
              id="sarkari-tab-syllabus"
            >
              <BookOpen className="w-4 h-4 text-pink-400" />
              <span>Syllabus</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                activeTab === 'syllabus' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {getItemsByCategory('syllabus').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('admissions')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admissions'
                  ? 'bg-[#1e1b4b] text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
              id="sarkari-tab-admissions"
            >
              <GraduationCap className="w-4 h-4 text-teal-400" />
              <span>Admissions</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                activeTab === 'admissions' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {getItemsByCategory('admissions').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#1e1b4b] text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
              id="sarkari-tab-all"
            >
              <Info className="w-4 h-4 text-slate-400" />
              <span>All Notices</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                activeTab === 'all' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {filteredItems.length}
              </span>
            </button>
          </div>
        </div>

        {/* CARDS GRID (Image 1 Layout) */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group hover:-translate-y-1"
                id={`sarkari-card-${item.id}`}
              >
                <div className="space-y-3">
                  {/* Card Header Tag & New Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] uppercase rounded-md tracking-wider font-mono truncate max-w-[75%]">
                      {getOrgName(item)}
                    </span>
                    {item.isNew && (
                      <span className="px-2 py-0.5 bg-red-500 text-white font-black text-[9px] uppercase tracking-wider rounded font-mono animate-pulse shrink-0">
                        ⚡ NEW
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => handleItemClick(item)}
                    className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug font-display cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                  >
                    {item.title}
                  </h3>

                  {/* Gray Info Box */}
                  <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850 rounded-xl p-3.5 space-y-2 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Total Posts:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white font-mono">{getPostsText(item)}</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">Eligibility:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-right line-clamp-1">{item.eligibility || 'Graduate / 12th Pass'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Fee Details:</span>
                      <div className="text-right text-[11px] font-mono">
                        {getFormattedFees(item)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        <span>Last Date:</span>
                      </span>
                      <span className="font-mono font-black text-red-600 dark:text-red-400">
                        {item.lastDate || item.postDate || '2026-08-30'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: View and Apply via CSC Desk */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleItemClick(item)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleApplyNow(item)}
                    className="py-2.5 px-3 bg-[#1e1b4b] hover:bg-[#121033] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Apply via CSC Desk</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl max-w-md mx-auto">
            <span className="text-4xl block mb-3">🔍</span>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">No government notices found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-6">
              No bulletin entries match your search: "<span className="font-mono font-bold">{searchQuery}</span>". Try looking up broader boards like "SSC", "NTA", or "UPSC".
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
              className="mt-5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              Reset Search Desk
            </button>
          </div>
        )}

        {/* Informative Notice Bar bottom of boxes */}
        <div className="mt-12 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200/80 dark:border-yellow-900/30 rounded-2xl flex items-start gap-3 max-w-4xl mx-auto">
          <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <p className="text-xs text-yellow-800 dark:text-yellow-300 font-medium leading-relaxed">
            <strong>Important Advice:</strong> Government application portals require error-free data entry, high-quality scanning of signatures/marksheets, and compliant dimension adjustments. Visit our physical café or make an appointment online to submit your form securely with zero errors!
          </p>
        </div>

      </div>

      {/* DETAILED SARKARI DRAWER/MODAL POPUP */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transform scale-100 transition-all duration-300"
            id={`sarkari-detail-modal-${selectedItem.id}`}
          >
            {/* Header banner */}
            <div className={`px-6 py-5 border-b border-slate-100 dark:border-slate-800 relative flex items-start justify-between bg-slate-50 dark:bg-slate-950/60`}>
              <div className="space-y-1.5 pr-8">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${SARKARI_CATEGORIES[selectedItem.category].color}`}>
                  {SARKARI_CATEGORIES[selectedItem.category].label}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug font-display">
                  {selectedItem.title}
                </h3>
                {selectedItem.advertisementNo && (
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">
                    Advt No: {selectedItem.advertisementNo}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-all absolute right-4 top-4 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm scrollbar-thin">
              
              {/* Important Notifications Section */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-xs uppercase font-mono tracking-wider">
                  <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-bounce" />
                  <span>Important Notifications</span>
                </div>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                  Candidates are advised to verify all eligibility conditions, required documents, and critical dates before submitting their application. Accurate data entry prevents rejection at the board level.
                </p>
                {selectedItem.lastDate && (
                  <p className="text-[11px] font-bold text-red-600 dark:text-red-400 font-mono pt-1 border-t border-amber-200/80 dark:border-amber-800/50">
                    ⚡ Deadline Notice: Last date for online form filing is {selectedItem.lastDate}.
                  </p>
                )}
              </div>

              {/* Short details paragraph */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                  Brief Overview
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  {selectedItem.shortInfo}
                </p>
              </div>

              {/* Multi-grid specs details */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Important Dates Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    <span>Important Dates</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Post Date:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedItem.postDate}</span>
                    </div>
                    {selectedItem.lastDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Last Date:</span>
                        <span className="font-bold text-rose-500 dark:text-rose-400 font-mono">{selectedItem.lastDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Fees Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Application Fee</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {selectedItem.fees ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Gen / OBC:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedItem.fees.genObc}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">SC / ST / Div:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedItem.fees.scSt}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-500 italic block">Check official notification (Variable)</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Age Limits if any */}
              {selectedItem.ageLimit && (
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    Age Specifications
                  </h4>
                  <p className="text-slate-700 dark:text-slate-200 text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3.5 py-2.5 rounded-xl inline-block">
                    {selectedItem.ageLimit}
                  </p>
                </div>
              )}

              {/* Eligibility qualifications info */}
              {selectedItem.eligibility && (
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    Eligibility &amp; Qualification Required
                  </h4>
                  <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600 dark:text-slate-300 text-xs font-semibold leading-relaxed">
                      {selectedItem.eligibility}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-950/30">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleApplyNow(selectedItem)}
                className="px-6 py-2.5 bg-[#1e1b4b] hover:bg-[#121033] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <span>Apply via CSC Desk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
