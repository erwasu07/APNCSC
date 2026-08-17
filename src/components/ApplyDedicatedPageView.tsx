import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Shield, 
  User, 
  Smartphone, 
  Mail, 
  Calendar, 
  IndianRupee, 
  CheckCircle, 
  Sparkles, 
  FileCheck, 
  UploadCloud, 
  X, 
  Printer, 
  Search, 
  MessageSquare, 
  ExternalLink,
  Info,
  Clock,
  Building2,
  Lock,
  Share2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { SARKARI_DATA, SarkariItem } from '../data/sarkariData';
import { SERVICES_LIST, ServiceItem } from '../servicesData';
import { UploadedDocument } from '../types';
import { db } from '../lib/firebase';
import { getSupabaseClient, uploadMultipleDocumentsToSupabase } from '../lib/supabase';
import { saveApplicationToFormEndpoint } from '../lib/getform';
import { doc, setDoc } from 'firebase/firestore';

interface ApplyDedicatedPageViewProps {
  initialService?: string;
  onBack: () => void;
  onTrackApplication?: (tokenId?: string) => void;
  onNavigateTrack?: (tokenId?: string) => void;
}

export default function ApplyDedicatedPageView({
  initialService = '',
  onBack,
  onTrackApplication,
  onNavigateTrack
}: ApplyDedicatedPageViewProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    emailAddress: '',
    dateOfBirth: '',
    selectedService: '',
    customServiceText: '',
    userCategory: 'genObc' as 'genObc' | 'scSt',
    additionalDetails: '',
    portalFee: 70,
    applicationFee: 0,
  });

  const [documentError, setDocumentError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any>(null);

  // WhatsApp Automated Invoice Notification State
  const [whatsappStatus, setWhatsappStatus] = useState<{
    loading: boolean;
    sent?: boolean;
    message?: string;
    directWhatsAppUrl?: string;
    error?: string;
  } | null>(null);

  const parseFeeString = (feeStr: string | undefined) => {
    if (!feeStr) return 0;
    const clean = feeStr.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  };

  const handleServiceChange = (serviceVal: string) => {
    let appFee = 0;
    if (serviceVal !== 'other') {
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

  // Sync initial service on mount or prop update
  useEffect(() => {
    if (initialService) {
      const cleanName = initialService.replace(/^(Assistance Request:|Filing Application:)\s*/i, '').trim();
      const sarkariMatch = SARKARI_DATA.find(item => item.title.toLowerCase() === cleanName.toLowerCase());
      const serviceMatch = SERVICES_LIST.find(s => s.name.toLowerCase() === cleanName.toLowerCase());

      if (sarkariMatch) {
        handleServiceChange(sarkariMatch.title);
      } else if (serviceMatch) {
        handleServiceChange(serviceMatch.name);
      } else {
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
    } else {
      // Default to first job if none specified
      if (SARKARI_DATA.length > 0) {
        handleServiceChange(SARKARI_DATA[0].title);
      }
    }
  }, [initialService]);

  const handleMandatoryIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
        setDocumentError('Invalid file format. Please upload a clear JPG, PNG, or PDF document.');
        return;
      }

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
          docTypeName: 'Aadhaar Card or Educational ID Card',
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
        setDocumentError('Error reading file. Please try again.');
        setIsProcessingFiles(false);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

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
          totalAmount: receiptData.totalAmount || 0,
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
      const cleanDigits = (receiptData.phoneNumber || '').replace(/[^\d]/g, '');
      const fallbackPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
      const fallbackText = encodeURIComponent(`🧾 Official Application Form Registered - CSC DOST\nToken: ${receiptData.appId}\nService: ${receiptData.selectedService}\nName: ${receiptData.customerName}`);

      setWhatsappStatus({
        loading: false,
        sent: false,
        error: 'Direct WhatsApp link generated below.',
        directWhatsAppUrl: `https://api.whatsapp.com/send?phone=${fallbackPhone}&text=${fallbackText}`
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setDocumentError('⚠️ Please select a service or specify your request.');
      return;
    }

    if (uploadedFiles.length === 0) {
      setDocumentError('⚠️ Mandatory ID Document Missing: Please upload a clear photo or PDF of your Aadhaar Card or Educational ID Card.');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedDocsList = uploadedFiles.map(f => `${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
      const officialAppId = await getNextCscTokenIdAsync();

      const verifiedReceipt = {
        appId: officialAppId,
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        emailAddress: formData.emailAddress || 'N/A',
        dateOfBirth: formData.dateOfBirth || 'N/A',
        selectedService: formData.selectedService === 'other' || formData.selectedService === 'Custom Unlisted Request' ? formData.customServiceText : formData.selectedService,
        userCategory: formData.userCategory === 'genObc' ? 'General/OBC' : 'SC/ST/Female',
        paymentMode: 'Pay at CSC Desk Upon Completion (No Advance Online Payment)',
        utrNumber: 'N/A',
        paymentStatus: 'No Advance Online Payment Required',
        portalFee: 0,
        applicationFee: 0,
        totalAmount: 0,
        mandatoryDocName: uploadedFiles[0]?.name || 'Aadhaar Card / ID Attached',
        uploadedDocuments: uploadedDocsList,
        additionalDetails: formData.additionalDetails || 'None',
        submittedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('en-US')
      };

      setSubmissionReceipt(verifiedReceipt);
      setIsFormSubmitted(true);

      // Upload to Supabase if configured
      let processedDocs: UploadedDocument[] = uploadedFiles;
      try {
        processedDocs = await uploadMultipleDocumentsToSupabase(uploadedFiles, officialAppId);
        setUploadedFiles(processedDocs);
      } catch (upErr) {
        console.warn('Supabase document upload notice:', upErr);
      }

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

      // 1. Cloud Firestore
      try {
        await Promise.all([
          setDoc(doc(db, 'applications', officialAppId), payload, { merge: true }),
          setDoc(doc(db, 'appointments', officialAppId), payload, { merge: true })
        ]);
      } catch (dbErr) {
        console.warn('Firestore setDoc notice:', dbErr);
      }

      // 2. Getform.io
      try {
        saveApplicationToFormEndpoint(officialAppId, {
          ...payload,
          applicantName: formData.customerName,
          phoneNumber: formData.phoneNumber,
          emailAddress: formData.emailAddress,
          selectedService: verifiedReceipt.selectedService,
          userCategory: verifiedReceipt.userCategory,
          totalAmount: 0,
          documents: processedDocs
        }).catch(() => {});
      } catch {}

      // 3. Supabase Table
      try {
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
          }], { onConflict: 'appId' }).then(null, () => {});
        }
      } catch {}

      // 4. LocalStorage
      try {
        const existing = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
        localStorage.setItem('csc_local_applications', JSON.stringify([payload, ...existing.filter((i: any) => i.appId !== officialAppId)]));
      } catch {}

      // 5. Server API
      try {
        fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {});
      } catch {}

      // 6. Broadcast live events
      try {
        window.dispatchEvent(new CustomEvent('csc_appointment_created', { detail: payload }));
        window.dispatchEvent(new Event('storage'));
      } catch {}

      triggerWhatsAppInvoiceDispatch(verifiedReceipt);
    } catch (err: any) {
      console.error('Application submission error:', err);
      setDocumentError('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const currentSarkariItem = SARKARI_DATA.find(item => item.title.toLowerCase() === formData.selectedService.toLowerCase()) ||
    SARKARI_DATA.find(item => item.title === formData.selectedService) ||
    SARKARI_DATA.find(item => formData.selectedService && (formData.selectedService.toLowerCase().includes(item.title.toLowerCase()) || item.title.toLowerCase().includes(formData.selectedService.toLowerCase())));

  const currentServiceItem = SERVICES_LIST.find(s => s.name.toLowerCase() === formData.selectedService.toLowerCase()) ||
    SERVICES_LIST.find(s => s.name === formData.selectedService) ||
    SERVICES_LIST.find(s => formData.selectedService && (formData.selectedService.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(formData.selectedService.toLowerCase())));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16 pt-3 sm:pt-6 font-sans">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        
        {/* Navigation & Action Top Bar */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
            id="apply-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onNavigateTrack) {
                  onNavigateTrack(submissionReceipt?.appId || '');
                } else {
                  window.location.hash = '#track';
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
              id="apply-track-nav-btn"
            >
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              <span>Track Application</span>
            </button>

            <a
              href="https://whatsapp.com/channel/0029VbDgSe75a248qEZAbL3g"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Help</span>
            </a>
          </div>
        </div>

        {/* MAIN APPLICATION CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#18204e] via-[#1f2b6c] to-[#18204e] text-white p-3.5 sm:p-5 border-b border-indigo-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                    APNA CSC DESK
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>SSL Encrypted</span>
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white font-display">
                  Digital Application Filing Desk
                </h1>
                <p className="text-[11px] sm:text-xs text-indigo-200 font-medium">
                  Official Online Form Submission, Recruitment Application Filing &amp; Verification
                </p>
              </div>

              <div className="bg-indigo-950/80 border border-indigo-700/60 px-3 py-1.5 rounded-xl shrink-0 text-left sm:text-right flex sm:block items-center justify-between">
                <span className="text-[10px] font-mono text-indigo-300 block uppercase tracking-wider">
                  Payment Terms:
                </span>
                <span className="text-xs font-bold text-amber-300 ml-2 sm:ml-0">
                  Pay at Desk Upon Completion
                </span>
              </div>
            </div>
          </div>

          {/* APPLICATION FORM OR CONFIRMATION RECEIPT */}
          {!isFormSubmitted ? (
            <form onSubmit={handleFormSubmit} className="p-3.5 sm:p-5 space-y-3.5">
              
              {/* Form Guidance Note */}
              <div className="p-2.5 sm:p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-[11px] uppercase tracking-wide text-indigo-900">Applicant Instructions:</p>
                  <p className="text-indigo-800 text-[11px] leading-relaxed">
                    Enter details as per your official documents. Our CSC operator will file your form on the official portal and issue an official token tracking receipt immediately.
                  </p>
                </div>
              </div>

              {/* DEDICATED NOTIFICATION & APPLICATION INFORMATION PANEL */}
              {currentSarkariItem && (
                <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-200/80 rounded-xl p-3 sm:p-4 space-y-2.5 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-indigo-900 text-white rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                          Notification
                        </span>
                        {currentSarkariItem.advertisementNo && (
                          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded font-semibold">
                            Advt: {currentSarkariItem.advertisementNo}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                        {currentSarkariItem.title}
                      </h3>
                    </div>

                    {currentSarkariItem.officialLink && (
                      <a
                        href={currentSarkariItem.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-900 border border-indigo-200 text-[11px] font-bold rounded-lg shadow-2xs transition-all shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Official PDF</span>
                      </a>
                    )}
                  </div>

                  {currentSarkariItem.shortInfo && (
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      {currentSarkariItem.shortInfo}
                    </p>
                  )}

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">
                        Deadline
                      </span>
                      <span className="text-[11px] font-bold text-red-600 block truncate">
                        {currentSarkariItem.lastDate || 'Active'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">
                        Vacancies
                      </span>
                      <span className="text-[11px] font-bold text-indigo-900 block truncate">
                        {currentSarkariItem.totalPosts || 'As per Advt'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">
                        Age Limit
                      </span>
                      <span className="text-[11px] font-bold text-slate-800 block truncate">
                        {currentSarkariItem.ageLimit || 'Refer to Advt'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">
                        Govt Fee
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 block truncate">
                        {currentSarkariItem.fees?.genObc || 'Free'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {currentServiceItem && !currentSarkariItem && (
                <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-200/80 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 bg-indigo-900 text-white rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                        CSC E-Service Specifications
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                        {currentServiceItem.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-mono font-bold text-xs rounded-lg border border-emerald-300">
                        {currentServiceItem.price}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {currentServiceItem.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {currentServiceItem.estimatedTime && (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Estimated Turnaround</span>
                          <span className="text-xs font-bold text-slate-900">{currentServiceItem.estimatedTime}</span>
                        </div>
                      </div>
                    )}

                    {currentServiceItem.requirements && currentServiceItem.requirements.length > 0 && (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold mb-1">Required Documents</span>
                        <ul className="text-xs text-slate-700 list-disc list-inside space-y-0.5">
                          {currentServiceItem.requirements.map((req, rIdx) => (
                            <li key={rIdx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {documentError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{documentError}</span>
                </div>
              )}

              {/* Step 1: Personal Details */}
              <div className="space-y-2.5">
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Applicant Identification</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label htmlFor="applicant-full-name" className="block text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                      Applicant Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="applicant-full-name"
                        type="text"
                        required
                        placeholder="e.g. Wasim Ahmad"
                        value={formData.customerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Mobile Number */}
                  <div className="space-y-1">
                    <label htmlFor="applicant-phone-number" className="block text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                      WhatsApp Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="applicant-phone-number"
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="e.g. 7006833767"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/\D/g, '') }))}
                        className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address (Optional) */}
                <div className="space-y-1">
                  <label htmlFor="applicant-email" className="block text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                    Email Address <span className="text-slate-400 text-[10px] font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="applicant-email"
                      type="email"
                      placeholder="e.g. applicant@gmail.com"
                      value={formData.emailAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                      className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Service Selection */}
              <div className="space-y-2.5">
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2. Service / Form Selection</span>
                </h2>

                <div className="space-y-1">
                  <label htmlFor="apply-service-select" className="block text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                    Service / Notification to Apply <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="apply-service-select"
                    value={formData.selectedService}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all cursor-pointer"
                  >
                    <option value="">-- Select Notification or CSC Service --</option>
                    <optgroup label="📢 Latest Sarkari Notifications & Exams">
                      {SARKARI_DATA.map((item) => (
                        <option key={item.id} value={item.title}>
                          {item.title} ({item.category.toUpperCase()})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🛠️ CSC E-Governance & Digital Services">
                      {SERVICES_LIST.map((svc) => (
                        <option key={svc.id} value={svc.name}>
                          {svc.name} - {svc.price}
                        </option>
                      ))}
                    </optgroup>
                    <option value="other">Other / Custom Government Form Request</option>
                  </select>
                </div>

                {formData.selectedService === 'other' && (
                  <div className="space-y-1 animate-fade-in">
                    <label htmlFor="custom-service-input" className="block text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                      Specify Service / Form Details <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="custom-service-input"
                      type="text"
                      required
                      placeholder="e.g. CUET UG 2026 Registration / Domicile Certificate"
                      value={formData.customServiceText}
                      onChange={(e) => setFormData(prev => ({ ...prev, customServiceText: e.target.value }))}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Step 3: Mandatory Document Upload (Compact Mobile-First Box) */}
              <div className="space-y-2">
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Mandatory Document Upload</span>
                </h2>

                <div className="border border-dashed border-indigo-300 bg-indigo-50/40 rounded-xl p-3 sm:p-3.5 transition-colors">
                  {uploadedFiles.length === 0 ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center shrink-0">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            Upload Aadhaar Card or Educational ID <span className="text-red-500">*</span>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            JPG, PNG, or PDF (up to 10MB)
                          </p>
                        </div>
                      </div>
                      <label className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs shrink-0">
                        <span>Attach Document</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          onChange={handleMandatoryIdUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-emerald-300 shadow-2xs">
                      <div className="flex items-center gap-2 text-left min-w-0">
                        <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md shrink-0">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-emerald-900 truncate">
                            {uploadedFiles[0].name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {(uploadedFiles[0].size / 1024).toFixed(1)} KB • Attached
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFiles([])}
                        className="p-1 hover:bg-red-50 text-red-600 rounded-md transition-colors cursor-pointer shrink-0 ml-2"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button Section */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500 text-center sm:text-left leading-tight">
                  🔒 Pay ₹0 advance • Verified token issued immediately
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting || isProcessingFiles}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#172554] hover:bg-[#1e3a8a] disabled:opacity-50 text-white text-xs sm:text-sm font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  id="submit-application-btn"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Registering Token...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Submit Application at CSC Desk</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* OFFICIAL CONFIRMATION RECEIPT VIEW */
            <div className="p-5 sm:p-8 space-y-6">
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Registration Successful
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                    Official CSC Application Registered
                  </h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Your application token has been created and synced with the CSC DOST central management queue.
                  </p>
                </div>

                {/* Token ID Callout */}
                <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500 shadow-xs max-w-sm mx-auto space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    Official CSC Reference Token
                  </span>
                  <p className="text-xl sm:text-2xl font-mono font-black text-emerald-700 tracking-wider">
                    {submissionReceipt?.appId}
                  </p>
                </div>
              </div>

              {/* Receipt Summary Grid */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Application Summary
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Applicant Name:</span>
                    <strong className="text-slate-900 font-bold">{submissionReceipt?.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">WhatsApp Mobile:</span>
                    <strong className="text-slate-900 font-bold">{submissionReceipt?.phoneNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Service / Exam:</span>
                    <strong className="text-blue-900 font-bold">{submissionReceipt?.selectedService}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Category:</span>
                    <strong className="text-slate-900 font-bold">{submissionReceipt?.userCategory}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Registered On:</span>
                    <span className="text-slate-700 font-mono">{submissionReceipt?.submittedAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payment Terms:</span>
                    <span className="text-emerald-700 font-bold">Pay Upon Completion at Desk</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Invoice Dispatch Notice */}
              {whatsappStatus?.directWhatsAppUrl && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="text-emerald-950 font-bold block">WhatsApp Token Invoice</strong>
                      <span className="text-emerald-800">Send application reference slip directly to WhatsApp.</span>
                    </div>
                  </div>
                  <a
                    href={whatsappStatus.directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <span>Open in WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintSlip}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-300"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFormSubmitted(false);
                      setFormData({
                        customerName: '',
                        phoneNumber: '',
                        emailAddress: '',
                        dateOfBirth: '',
                        selectedService: '',
                        customServiceText: '',
                        userCategory: 'genObc',
                        additionalDetails: '',
                        portalFee: 70,
                        applicationFee: 0,
                      });
                      setUploadedFiles([]);
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <span>New Application</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const navFn = onTrackApplication || onNavigateTrack;
                    if (navFn) {
                      navFn(submissionReceipt?.appId);
                    } else {
                      window.location.hash = `#track/${submissionReceipt?.appId || ''}`;
                    }
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Track this Application Now</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </main>
  );
}
