import React, { useState, useEffect } from 'react';
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
  Paperclip
} from 'lucide-react';
import { SARKARI_DATA, SARKARI_CATEGORIES, SarkariItem } from '../data/sarkariData';
import { SERVICES_LIST } from '../servicesData';
import { UploadedDocument } from '../types';

interface SarkariResultDeskProps {
  onApplyService: (serviceName: string) => void;
  selectedService?: string;
}

export default function SarkariResultDesk({ onApplyService, selectedService }: SarkariResultDeskProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<SarkariItem | null>(null);
  const [clickedItemId, setClickedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'admit_cards' | 'results' | 'answer_keys' | 'syllabus' | 'admissions'>('all');

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
  const [submissionReceipt, setSubmissionReceipt] = useState<any>(null);
  const [activeAlertTab, setActiveAlertTab] = useState<'alerts' | 'updates' | 'help'>('alerts');

  // Conditional logic helper to check if a document is mandatory for the selected service
  const getServiceDocRequirement = (serviceVal: string, customText?: string): { mandatory: boolean; requiredDocs: string[] } => {
    if (!serviceVal) return { mandatory: false, requiredDocs: [] };

    // 1. Check in SERVICES_LIST
    const serviceItem = SERVICES_LIST.find(s => s.name.toLowerCase() === serviceVal.toLowerCase());
    if (serviceItem) {
      if (serviceItem.id === 'csc-utility') {
        return { mandatory: false, requiredDocs: [] };
      }
      return {
        mandatory: true,
        requiredDocs: serviceItem.requirements && serviceItem.requirements.length > 0
          ? serviceItem.requirements
          : ['Aadhaar Card / ID Proof', 'Relevant Documents']
      };
    }

    // 2. Check in SARKARI_DATA
    const sarkariItem = SARKARI_DATA.find(item => item.title.toLowerCase() === serviceVal.toLowerCase());
    if (sarkariItem) {
      if (sarkariItem.category === 'jobs' || sarkariItem.category === 'admissions') {
        return {
          mandatory: true,
          requiredDocs: [
            'Aadhaar Card / Govt Identity Proof',
            'Educational Marksheet (10th/12th/Graduation)',
            'Passport Size Photo & Signature Scan',
            'Category / Caste Certificate (if applicable)'
          ]
        };
      }
      return { mandatory: false, requiredDocs: [] };
    }

    // 3. Custom / Other service selection
    if (serviceVal === 'other') {
      const text = (customText || '').toLowerCase();
      if (text.includes('utility') || text.includes('recharge') || text.includes('bill') || text.includes('inquiry') || text.includes('query')) {
        return { mandatory: false, requiredDocs: [] };
      }
      return {
        mandatory: true,
        requiredDocs: ['Aadhaar Card / Relevant Application Document (PDF / JPG)']
      };
    }

    // Fallback check
    const lower = serviceVal.toLowerCase();
    if (lower.includes('pan') || lower.includes('aadhaar') || lower.includes('voter') || lower.includes('certificate') || lower.includes('caste') || lower.includes('income') || lower.includes('domicile') || lower.includes('passport') || lower.includes('licence') || lower.includes('admission') || lower.includes('scholarship') || lower.includes('gst') || lower.includes('udyam') || lower.includes('exam') || lower.includes('recruitment') || lower.includes('form') || lower.includes('registration')) {
      return {
        mandatory: true,
        requiredDocs: ['Aadhaar Card / Mandatory Supporting Documents']
      };
    }

    return { mandatory: false, requiredDocs: [] };
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

    if (formData.paymentMode === 'online') {
      if (!formData.utrNumber || formData.utrNumber.trim().length < 4) {
        setUtrError('Please enter the mandatory 12-digit UPI UTR / Transaction Reference ID.');
        return;
      }
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
      paymentMode: formData.paymentMode,
      utrNumber: formData.paymentMode === 'online' ? formData.utrNumber.trim() : 'N/A',
      totalAmount: formData.paymentMode === 'online' ? (formData.portalFee + formData.applicationFee) : formData.portalFee,
      uploadedDocuments: uploadedDocsList,
      additionalDetails: formData.additionalDetails || 'None',
      submittedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('en-US')
    };

    const docsSummaryStr = uploadedDocsList.length > 0 ? uploadedDocsList.join(', ') : 'None Attached';

    // Save application and uploaded documents directly to central server database
    try {
      const payload = {
        appId: mockReceipt.appId,
        name: mockReceipt.customerName,
        email: mockReceipt.emailAddress,
        phone: mockReceipt.phoneNumber,
        service: mockReceipt.selectedService,
        dateOfBirth: mockReceipt.dateOfBirth,
        userCategory: mockReceipt.userCategory,
        paymentMode: mockReceipt.paymentMode,
        utrNumber: mockReceipt.utrNumber,
        totalAmount: mockReceipt.totalAmount,
        message: formData.additionalDetails,
        documents: uploadedFiles
      };

      // Also cache in local storage as safety backup
      try {
        const localAppItem = {
          id: `apt-local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          ...payload,
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: mockReceipt.submittedAt,
          status: 'pending',
          date: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
        localStorage.setItem('csc_local_applications', JSON.stringify([localAppItem, ...existing]));
      } catch (e) {
        console.error('Failed to cache application locally:', e);
      }

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log('Application saved to server database:', data);

      const savedItem = data.data || {
        id: `apt-local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...payload,
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: mockReceipt.submittedAt,
        status: 'pending',
        date: new Date().toISOString()
      };

      // Real-time synchronization dispatches
      try {
        window.dispatchEvent(new CustomEvent('csc_appointment_created', { detail: savedItem }));
        window.dispatchEvent(new Event('storage'));
        const bc = new BroadcastChannel('csc_portal_sync');
        bc.postMessage({ type: 'NEW_APPOINTMENT', payload: savedItem });
        bc.close();
      } catch (bcErr) {
        console.error('Broadcast Channel sync error:', bcErr);
      }
    } catch (err) {
      console.error('API submission dispatch error:', err);
    }

    // Send visitor query / application directly to owner email via Web3Forms API & save to Web3Forms Extractor cache
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      // Format downloadable document links for Web3Forms email body & fields
      const docDownloadDetailsList = uploadedFiles.map((doc, idx) => {
        const downloadHttpUrl = `${origin}/api/documents/download?appId=${mockReceipt.appId}&docId=${doc.id || `doc-${idx}`}`;
        return `📄 File ${idx + 1}: ${doc.name} (${(doc.size / 1024).toFixed(1)} KB)
   • Direct Download Link: ${downloadHttpUrl}
   • Format/Type: ${doc.type || 'application/octet-stream'}`;
      }).join('\n\n');

      const docDownloadSummaryText = uploadedFiles.length > 0 
        ? `\n==================================================\n📁 ATTACHED DOCUMENTS & IMAGES (DOWNLOADABLE FORMAT)\n==================================================\n${docDownloadDetailsList}\n`
        : '\n📁 ATTACHED DOCUMENTS: None Uploaded\n';

      const web3Payload: Record<string, any> = {
        access_key: 'a6293a04-2711-4d7c-bb7c-e7c9ed3d888c',
        subject: `New Application Inquiry [${mockReceipt.appId}] - ${mockReceipt.customerName}`,
        from_name: 'APNA CSC Digital Portal',
        name: mockReceipt.customerName,
        email: mockReceipt.emailAddress !== 'N/A' ? mockReceipt.emailAddress : 'no-reply@apnacsc.in',
        phone_number: mockReceipt.phoneNumber,
        service_requested: mockReceipt.selectedService,
        category: mockReceipt.userCategory,
        payment_mode: mockReceipt.paymentMode,
        utr_number: mockReceipt.utrNumber,
        amount: `₹${mockReceipt.totalAmount}`,
        total_documents_attached: `${uploadedFiles.length} File(s)`,
        documents_summary: docsSummaryStr,
        message: `Application Token ID: ${mockReceipt.appId}
Applicant Name: ${mockReceipt.customerName}
Mobile Number: ${mockReceipt.phoneNumber}
Email: ${mockReceipt.emailAddress}
Date of Birth: ${mockReceipt.dateOfBirth}
Selected Service: ${mockReceipt.selectedService}
Category: ${mockReceipt.userCategory}
Payment Mode: ${mockReceipt.paymentMode}
Payment UTR Ref No: ${mockReceipt.utrNumber}
Amount Charged: ₹${mockReceipt.totalAmount}
Instructions/Note: ${mockReceipt.additionalDetails}
${docDownloadSummaryText}`
      };

      // Add explicit key-value fields for each uploaded document in Web3Forms
      uploadedFiles.forEach((doc, idx) => {
        const downloadUrl = `${origin}/api/documents/download?appId=${mockReceipt.appId}&docId=${doc.id || `doc-${idx}`}`;
        web3Payload[`document_${idx + 1}_name`] = doc.name;
        web3Payload[`document_${idx + 1}_download_link`] = downloadUrl;
      });

      // Save to Web3Forms local submissions cache for real-time extraction
      try {
        const web3Item = {
          id: `w3f-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          appId: mockReceipt.appId,
          name: mockReceipt.customerName,
          email: mockReceipt.emailAddress,
          phone: mockReceipt.phoneNumber,
          service: mockReceipt.selectedService,
          dateOfBirth: mockReceipt.dateOfBirth,
          userCategory: mockReceipt.userCategory,
          paymentMode: mockReceipt.paymentMode,
          utrNumber: mockReceipt.utrNumber,
          totalAmount: mockReceipt.totalAmount,
          message: formData.additionalDetails || 'Web3Forms Direct Inquiry',
          documents: uploadedFiles,
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: mockReceipt.submittedAt,
          status: 'pending' as const,
          date: new Date().toISOString(),
          source: 'Web3Forms API'
        };

        const existingW3F = JSON.parse(localStorage.getItem('csc_web3forms_submissions') || '[]');
        localStorage.setItem('csc_web3forms_submissions', JSON.stringify([web3Item, ...existingW3F]));

        window.dispatchEvent(new CustomEvent('csc_web3forms_sync', { detail: web3Item }));
      } catch (cacheErr) {
        console.error('Failed to cache Web3Forms extraction:', cacheErr);
      }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(web3Payload)
      }).catch(err => console.error('Web3Forms delivery error:', err));
    } catch (err) {
      console.error('Web3Forms dispatch error:', err);
    }

    setSubmissionReceipt(mockReceipt);
    setIsFormSubmitted(true);

    // Keep receipt cleanly scrolled into view on customer screen
    setTimeout(() => {
      const slipContainer = document.getElementById('printable-digital-slip') || document.getElementById('booking-portal-form');
      if (slipContainer) {
        slipContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Auto trigger print window on desktop devices
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        setTimeout(() => {
          try {
            window.print();
          } catch (e) {
            console.log('Print trigger error:', e);
          }
        }, 300);
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
    return filteredItems.filter(item => item.category === cat);
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
    <section id="sarkari-portal-section" className="pt-4 md:pt-6 pb-12 md:pb-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-t border-slate-200/60 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* 📢 CSC DOST OFFICIAL & WHATSAPP CHANNEL BANNER */}
        <div className="mb-6 sm:mb-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 text-center animate-fade-in relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="max-w-4xl mx-auto space-y-3 relative z-10">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-600 text-white text-xs sm:text-sm font-black rounded-full uppercase tracking-wider font-mono shadow-lg shadow-red-500/40 ring-4 ring-red-400/30 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                <span>🔴 LIVE UPDATE</span>
              </span>
            </div>

            <p className="text-sm sm:text-base md:text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-sans max-w-3xl mx-auto">
              <strong className="font-extrabold text-slate-950 dark:text-white">CSC Dost Official</strong> – Your trusted portal for online applications, exam results, admit cards, career news, government schemes, and scholarships.
            </p>

            <div className="pt-1 flex justify-center">
              <a
                href="https://whatsapp.com/channel/0029VbDgSe75a248qEZAbL3g"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3 bg-[#00a884] hover:bg-[#008f70] active:scale-95 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer group"
                id="join-whatsapp-channel-btn"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current group-hover:rotate-12 transition-transform" />
                <span>Join WhatsApp Channel</span>
              </a>
            </div>
          </div>
        </div>

        {/* 🚀 DIGITAL APPLICATION & BOOKING PORTAL WITH UPI INTEGRATION */}
        <div id="booking-portal-form" className="mb-12 scroll-mt-24">
          {!isFormSubmitted ? (
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-5 md:p-8">
              {/* Subtle Ambient Decorative Gradients */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                {/* Header Section */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20 transform rotate-2">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-[9px] font-black tracking-wider uppercase font-mono">
                          <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                          Apex Secure Portal
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[9px] font-black tracking-wider uppercase font-mono border border-emerald-500/10 dark:border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Government Approved Authorized CSC Center
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black tracking-tight uppercase font-display text-slate-900 dark:text-white">
                        Digital Application &amp; Appointment Desk
                      </h3>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">Gateway active</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono flex items-center gap-1 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      SECURE SSL
                    </p>
                  </div>
                </div>

                {/* Progressive Customer Friendly Step Indicators */}
                <div className="grid grid-cols-2 gap-2 mb-6 text-xs bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm font-bold border border-slate-100 dark:border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black flex items-center justify-center text-[10px]">1</span>
                    <span className="truncate">Applicant Credentials</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 text-slate-400 dark:text-slate-500 font-bold">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black flex items-center justify-center text-[10px]">2</span>
                    <span className="truncate">Instant Fee &amp; UPI</span>
                  </div>
                </div>

                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Customer Details & Service */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Full Name */}
                      <div className="space-y-1">
                        <label htmlFor="applicant-name-input" className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 cursor-pointer">
                          Applicant Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <input
                            id="applicant-name-input"
                            type="text"
                            required
                            placeholder="Full Name (as in records)"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 dark:focus:ring-amber-400/10 transition-all font-semibold text-sm outline-none"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          WhatsApp Mobile <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <input
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            title="Please enter a valid 10-digit mobile number"
                            placeholder="10-Digit mobile number"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 dark:focus:ring-amber-400/10 transition-all font-semibold text-sm outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Email Address <span className="text-slate-400 dark:text-slate-600">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <input
                            type="email"
                            placeholder="contact@example.com"
                            value={formData.emailAddress}
                            onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 dark:focus:ring-amber-400/10 transition-all font-semibold text-sm outline-none"
                          />
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Date of Birth <span className="text-slate-400 dark:text-slate-600">(As per Aadhaar)</span>
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 dark:focus:ring-amber-400/10 transition-all font-semibold text-sm outline-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                      {/* Service / Exam Dropdown */}
                      <div className="sm:col-span-8 space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Select Service to Apply <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.selectedService}
                          onChange={(e) => handleServiceChange(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 dark:focus:ring-amber-400/10 transition-all font-bold text-sm outline-none cursor-pointer"
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

                      {/* Caste / Category Selector */}
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Category
                        </label>
                        <select
                          value={formData.userCategory}
                          onChange={(e) => handleCategoryChange(e.target.value as 'genObc' | 'scSt')}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 dark:focus:ring-amber-400/10 transition-all font-bold text-sm outline-none cursor-pointer"
                        >
                          <option value="genObc">General / OBC</option>
                          <option value="scSt">SC / ST</option>
                        </select>
                      </div>
                    </div>

                    {/* Custom Service Input if 'Other' is chosen */}
                    {formData.selectedService === 'other' && (
                      <div className="space-y-1 animate-fade-in">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Please Specify Custom Service <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Type what service or application form you need us to fill..."
                          value={formData.customServiceText}
                          onChange={(e) => setFormData({ ...formData, customServiceText: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 dark:focus:ring-amber-400/10 transition-all font-semibold text-sm outline-none"
                        />
                      </div>
                    )}

                    {/* CONDITIONAL MANDATORY DOCUMENT UPLOAD SECTION */}
                    {docRequirement.mandatory && (
                      <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-4 space-y-3 animate-fade-in my-2 shadow-sm">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-sm">
                              <UploadCloud className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-amber-300 flex items-center gap-1.5">
                                <span>Mandatory Document Upload</span>
                                <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Required</span>
                              </h4>
                              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                                Upload required documents for <strong className="text-slate-900 dark:text-white font-bold">{formData.selectedService === 'other' ? (formData.customServiceText || 'Custom Service') : formData.selectedService}</strong>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* List of Mandatory Required Documents */}
                        {docRequirement.requiredDocs.length > 0 && (
                          <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-inner">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block mb-1">
                              📌 Mandatory Documents Required for this Service:
                            </span>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                              {docRequirement.requiredDocs.map((doc, idx) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                                  <span>{doc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Drag & Drop / Click Upload Area */}
                        <div className="relative">
                          <label className={`flex flex-col items-center justify-center p-4 border-2 border-dashed ${documentError ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30' : 'border-amber-400 dark:border-amber-600 hover:border-amber-500 bg-white dark:bg-slate-900'} rounded-xl cursor-pointer transition-all hover:bg-amber-50/50 dark:hover:bg-amber-950/40 text-center group`}>
                            <UploadCloud className="w-7 h-7 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              Click or Drag &amp; Drop Documents Here
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              Aadhaar Card, Marksheet, Passport Photo, Signature, PDF or JPG (Max 10MB)
                            </span>
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Error Message if not uploaded */}
                        {documentError && (
                          <p className="text-[11px] text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5 bg-red-100 dark:bg-red-950/90 p-2.5 rounded-xl border border-red-300 dark:border-red-800 animate-pulse">
                            <span>⚠️ {documentError}</span>
                          </p>
                        )}

                        {/* Attached Files List */}
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                              Attached Customer Documents ({uploadedFiles.length}):
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {uploadedFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs shadow-sm"
                                >
                                  <Paperclip className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <div className="max-w-[160px] truncate">
                                    <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">{file.name}</span>
                                    <span className="text-[9px] text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(file.id)}
                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                    title="Remove Document"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Additional Details Text Area */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Instructions / Required Document Info
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Add specific instructions, required document links, or special physical visit time slots..."
                        value={formData.additionalDetails}
                        onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10 dark:focus:ring-amber-400/10 transition-all font-medium text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Invoice & UPI Payments Integration */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Interactive Fee Breakdown Card */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-850 rounded-xl p-4 space-y-2.5 shadow-sm">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                        <span>Description</span>
                        <span>Amount</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-600 dark:text-slate-400">Exam Govt Fee ({formData.userCategory === 'genObc' ? 'Gen/OBC' : 'SC/ST'}):</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-white">₹{formData.applicationFee}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-600 dark:text-slate-400">Portal &amp; Filing Charges:</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">₹{formData.portalFee}</span>
                      </div>

                      <div className="h-[1px] bg-slate-200/80 dark:bg-slate-800 my-1.5"></div>

                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-550">Total Payable:</span>
                        <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                          ₹{formData.portalFee + formData.applicationFee}
                        </span>
                      </div>
                    </div>

                    {/* Payment Mode Selector Tabs */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Choose Processing Mode
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMode: 'online' })}
                          className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs font-bold ${
                            formData.paymentMode === 'online'
                              ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-white'
                          }`}
                        >
                          <QrCode className="w-4 h-4 text-amber-500" />
                          <span className="uppercase tracking-wider">Pay UPI Online</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMode: 'cash' })}
                          className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs font-bold ${
                            formData.paymentMode === 'cash'
                              ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-white'
                          }`}
                        >
                          <IndianRupee className="w-4 h-4 text-amber-500" />
                          <span className="uppercase tracking-wider">Cash Counter</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive QR code scanner shown when online mode is active */}
                    {formData.paymentMode === 'online' ? (
                      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-4 shadow-md border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center animate-fade-in relative overflow-hidden">
                        {/* Top Google Colors Decorative Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
                          <div className="w-1/4 bg-[#4285F4]"></div>
                          <div className="w-1/4 bg-[#34A853]"></div>
                          <div className="w-1/4 bg-[#FBBC05]"></div>
                          <div className="w-1/4 bg-[#EA4335]"></div>
                        </div>

                        {/* Header with Google Pay logo & Merchant details */}
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
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                            +91 70068 33767
                          </p>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                            Scan &amp; pay
                          </p>
                        </div>

                        {/* High quality QR Code Frame */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-inner my-1 flex flex-col items-center relative">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=000000&data=${encodeURIComponent(
                              `upi://pay?pa=7006833767-2@okbizaxis&pn=Model%20Common%20Service%20Centre&am=${formData.portalFee + formData.applicationFee}&cu=INR&tn=CSC_DOST_${encodeURIComponent((formData.customerName || 'Payment').replace(/\s+/g, '_'))}`
                            )}`}
                            alt="Google Pay QR Code"
                            className="w-36 h-36 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* UPI ID Banner with Copy button */}
                        <div className="mt-2 w-full max-w-xs">
                          <div className="flex items-center justify-between gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <span className="text-[10px] font-mono font-extrabold text-slate-800 dark:text-slate-200 truncate">
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

                        {/* Supported App Badges */}
                        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1">
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[8px] font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">BHIM UPI</span>
                          <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded text-[8px] font-black border border-blue-200 dark:border-blue-800">GPay</span>
                          <span className="px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded text-[8px] font-black border border-sky-200 dark:border-sky-800">Paytm</span>
                          <span className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded text-[8px] font-black border border-purple-200 dark:border-purple-800">PhonePe</span>
                          <span className="px-1.5 py-0.5 bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded text-[8px] font-black border border-orange-200 dark:border-orange-800">Amazon Pay</span>
                        </div>

                        {/* MANDATORY UTR / TRANSACTION ID INPUT */}
                        <div className="w-full mt-3.5 text-left border-t border-slate-200 dark:border-slate-800 pt-3">
                          <label className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center justify-between">
                            <span>12-Digit UTR / Transaction Ref ID <span className="text-red-500">*</span></span>
                            <span className="text-[9px] text-red-500 font-extrabold uppercase bg-red-50 dark:bg-red-950 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">Mandatory</span>
                          </label>
                          <div className="relative mt-1.5">
                            <input
                              type="text"
                              required={formData.paymentMode === 'online'}
                              placeholder="Enter 12-Digit UTR No. (e.g., 420819123456)"
                              value={formData.utrNumber}
                              onChange={(e) => {
                                setFormData({ ...formData, utrNumber: e.target.value });
                                if (utrError) setUtrError(null);
                              }}
                              className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border ${utrError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-amber-400 dark:border-amber-500 focus:border-amber-500'} rounded-xl text-slate-900 dark:text-white font-mono font-extrabold text-xs focus:ring-2 focus:ring-amber-500/20 outline-none`}
                            />
                          </div>
                          {utrError ? (
                            <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">
                              ⚠️ {utrError}
                            </p>
                          ) : (
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-tight">
                              * After scanning &amp; paying, copy the 12-digit UTR/Ref No. from GPay/PhonePe/Paytm payment receipt and paste it above.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl p-4 text-center flex flex-col items-center justify-center py-5 animate-fade-in">
                        <Clock className="w-6 h-6 text-amber-500 mb-1.5 animate-pulse" />
                        <h5 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-wide">
                          Visit &amp; Pay At Cyber Cafe Branch
                        </h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-xs mt-0.5 leading-relaxed">
                          Your details will be registered securely. You can complete the application fee &amp; filing charges in cash or UPI at our counter.
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Submit Secure Application</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* PRINTABLE DIGITAL SUCCESS SLIP / RECEIPT */
            <div id="printable-digital-slip" className="bg-white text-slate-900 rounded-2xl shadow-xl p-5 md:p-8 border border-emerald-500/40 max-w-2xl mx-auto animate-fade-in relative">
              {/* Authenticity Watermark Decors */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
                <Shield className="w-80 h-80 text-slate-900" />
              </div>
              
              <div className="text-center pb-4 border-b border-dashed border-slate-200">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-2 animate-bounce" style={{ animationDuration: '3.5s' }}>
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black tracking-wider uppercase mb-1">
                  Application Logged Successfully
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 font-display">
                  Apex Cyber Cafe digital slip
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  TOKEN ID: <span className="font-bold text-slate-800">{submissionReceipt?.appId}</span> | REG_ACTIVE
                </p>
              </div>

              {/* Receipt Information Grid Table */}
              <div className="py-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider">Applicant Name:</span>
                    <span className="text-xs font-black text-slate-800">{submissionReceipt?.customerName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider">WhatsApp Mobile:</span>
                    <span className="text-xs font-black text-slate-800 font-mono">{submissionReceipt?.phoneNumber}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider">Date of Birth:</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">{submissionReceipt?.dateOfBirth}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block font-bold uppercase tracking-wider">Applied E-Service:</span>
                    <span className="text-xs font-black text-slate-900 bg-amber-50 px-2 rounded-md border border-amber-200 inline-block mt-0.5">
                      {submissionReceipt?.selectedService}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider">Category Status:</span>
                    <span className="text-xs font-extrabold text-slate-800">{submissionReceipt?.userCategory}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider">Receipt Timestamp:</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">{submissionReceipt?.submittedAt}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider">Filing Status:</span>
                    <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Pending Upload
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider">Processing Fee:</span>
                    <span className="text-xs font-black text-emerald-600 font-mono">
                      ₹{submissionReceipt?.totalAmount} ({submissionReceipt?.paymentMode === 'online' ? 'Online Paid' : 'Cash Pending'})
                    </span>
                  </div>

                  {submissionReceipt?.paymentMode === 'online' && (
                    <div className="sm:col-span-2 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      <span className="text-amber-700 dark:text-amber-400 block font-black uppercase text-[10px] tracking-wider">UPI Payment UTR / Ref ID:</span>
                      <span className="text-xs font-black font-mono text-slate-900 dark:text-white">{submissionReceipt?.utrNumber}</span>
                    </div>
                  )}

                  {submissionReceipt?.uploadedDocuments && submissionReceipt?.uploadedDocuments.length > 0 && (
                    <div className="sm:col-span-3 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                      <span className="text-emerald-800 block font-black uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Attached Customer Documents ({submissionReceipt.uploadedDocuments.length}):</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {submissionReceipt.uploadedDocuments.map((doc: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-white rounded-lg border border-emerald-300 text-[10px] font-bold text-slate-800 font-mono shadow-xs">
                            📄 {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {submissionReceipt?.additionalDetails && submissionReceipt?.additionalDetails !== 'None' && (
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[10px] mt-2">
                    <span className="text-slate-400 block font-bold uppercase tracking-wider mb-1">Applicant instructions/docs note:</span>
                    <p className="text-slate-700 font-semibold">{submissionReceipt?.additionalDetails}</p>
                  </div>
                )}
              </div>

              {/* Digital Stamp Sign off */}
              <div className="pt-4 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&color=128807&data=${encodeURIComponent(`Token:${submissionReceipt?.appId}|Name:${submissionReceipt?.customerName}`)}`}
                      alt="Verification Token"
                      className="w-10 h-10"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mb-0.5">Digital signature</p>
                    <p className="text-[10px] font-black text-slate-800">APEX SECURE AUTHENTICATED</p>
                    <p className="text-[9px] text-slate-500">Verification code: CSC-{submissionReceipt?.appId.slice(-5)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 no-print">
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
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
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

        {/* Section Header */}
        <div id="sarkari-board" className="text-center max-w-3xl mx-auto mb-12 scroll-mt-24">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Sarkari Exam &amp; Jobs Bulletin Board
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm sm:text-base">
            Never miss any government exam, results, or admit card update. Check vacancies and apply securely.
          </p>
        </div>

        {/* Live Search & Filter Desk Controls */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm mb-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input Box */}
            <div className="md:col-span-5 relative group">
              {/* Premium Outer Glow on Hover */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-2xl blur-md opacity-20 group-hover:opacity-60 group-focus-within:opacity-80 transition-all duration-300 -z-10"></div>
              
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-hover:text-red-500 group-hover:scale-110 transition-all duration-300 z-10" />
                <input
                  type="text"
                  placeholder="Search live jobs, admit cards, results..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200/60 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none hover:border-transparent dark:hover:border-transparent focus:border-red-500 dark:focus:border-red-400 focus:ring-4 focus:ring-red-500/15 transition-all duration-300 font-bold text-sm shadow-md"
                  id="sarkari-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors z-10"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Navigation Tabs */}
            <div className="md:col-span-7 flex flex-nowrap sm:flex-wrap overflow-x-auto pb-1 gap-2 justify-start md:justify-end scrollbar-none">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-xs md:text-sm font-extrabold flex-shrink-0 transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                }`}
                id="sarkari-tab-all"
              >
                All Board
              </button>
              {Object.entries(SARKARI_CATEGORIES).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`px-4 py-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-xs md:text-sm font-extrabold flex-shrink-0 transition-all cursor-pointer ${
                    activeTab === key
                      ? 'bg-red-600 text-white shadow-md shadow-red-100 dark:shadow-none'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                  }`}
                  id={`sarkari-tab-${key}`}
                >
                  {info.label}
                </button>
              ))}
            </div>

          </div>
          {searchQuery && (
            <p className="text-xs text-slate-400 mt-3 font-medium text-center md:text-left">
              Found <span className="text-slate-700 dark:text-slate-200 font-bold">{filteredItems.length}</span> matching entries for your query.
            </p>
          )}
        </div>

        {/* SARKARI BOXES GRID (The 6-Box Portal Layout resembling sarkariresult.com but beautifully modernized) */}
        {filteredItems.length > 0 ? (
          <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-4 pb-6 md:pb-0 scrollbar-thin md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-10 md:overflow-x-visible w-full">
            
            {/* Box 1: Latest Jobs */}
            {(activeTab === 'all' || activeTab === 'jobs') && (
              <div 
                className="w-[88vw] sm:w-[360px] md:w-auto flex-shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-sm md:shadow-md overflow-hidden flex flex-col hover:shadow-2xl dark:hover:shadow-slate-950 transition-all duration-300 group hover:-translate-y-2.5"
                id="sarkari-box-jobs"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3.5 sm:px-5 sm:py-4 md:px-7 md:py-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Briefcase className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" />
                    <h3 className="font-extrabold tracking-wide text-xs sm:text-sm md:text-base uppercase font-display leading-tight truncate">Latest Jobs</h3>
                  </div>
                  <span className="inline-block bg-white/20 text-white text-[10px] sm:text-xs font-mono px-2.5 py-0.5 rounded-full font-bold">
                    {getItemsByCategory('jobs').length}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 md:p-4.5 divide-y divide-slate-100 dark:divide-slate-850 flex-grow max-h-[420px] sm:max-h-[520px] overflow-y-auto scrollbar-thin">
                  {getItemsByCategory('jobs').length > 0 ? (
                    getItemsByCategory('jobs').map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all flex items-start gap-2 sm:gap-3 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 group/item ${
                          clickedItemId === item.id ? 'bg-blue-100 dark:bg-blue-900/30 scale-[0.98]' : ''
                        }`}
                        id={`sarkari-item-${item.id}`}
                      >
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0 group-hover/item:scale-125 transition-transform"></span>
                        <div className="flex-grow min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs sm:text-xs md:text-sm font-extrabold text-slate-850 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors font-display leading-tight break-words sm:line-clamp-2">
                              {item.title}
                            </span>
                            {item.isNew && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 text-[8.5px] sm:text-[9.5px] font-black uppercase rounded animate-pulse flex-shrink-0 font-mono tracking-wider">
                                New
                              </span>
                            )}
                          </div>
                          {item.lastDate && (
                            <span className="text-[10px] sm:text-xs font-mono text-rose-500 dark:text-rose-400 font-extrabold block leading-none">
                              Last Date: {item.lastDate}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-400 group-hover/item:text-blue-500 dark:group-hover/item:text-blue-400 group-hover/item:translate-x-1 transition-all self-center flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs sm:text-sm text-slate-400 py-12 font-medium">No active jobs found</p>
                  )}
                </div>
              </div>
            )}

            {/* Box 2: Admit Cards */}
            {(activeTab === 'all' || activeTab === 'admit_cards') && (
              <div 
                className="w-[88vw] sm:w-[360px] md:w-auto flex-shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-sm md:shadow-md overflow-hidden flex flex-col hover:shadow-2xl dark:hover:shadow-slate-950 transition-all duration-300 group hover:-translate-y-2.5"
                id="sarkari-box-admit"
              >
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-3.5 sm:px-5 sm:py-4 md:px-7 md:py-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <FileText className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" />
                    <h3 className="font-extrabold tracking-wide text-xs sm:text-sm md:text-base uppercase font-display leading-tight truncate">Admit Cards</h3>
                  </div>
                  <span className="inline-block bg-white/20 text-white text-[10px] sm:text-xs font-mono px-2.5 py-0.5 rounded-full font-bold">
                    {getItemsByCategory('admit_cards').length}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 md:p-4.5 divide-y divide-slate-100 dark:divide-slate-850 flex-grow max-h-[420px] sm:max-h-[520px] overflow-y-auto scrollbar-thin">
                  {getItemsByCategory('admit_cards').length > 0 ? (
                    getItemsByCategory('admit_cards').map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all flex items-start gap-2 sm:gap-3 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 group/item ${
                          clickedItemId === item.id ? 'bg-orange-100 dark:bg-orange-900/30 scale-[0.98]' : ''
                        }`}
                        id={`sarkari-item-${item.id}`}
                      >
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0 group-hover/item:scale-125 transition-transform"></span>
                        <div className="flex-grow min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs sm:text-xs md:text-sm font-extrabold text-slate-850 dark:text-slate-100 group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors font-display leading-tight break-words sm:line-clamp-2">
                              {item.title}
                            </span>
                            {item.isNew && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 text-[8.5px] sm:text-[9.5px] font-black uppercase rounded animate-pulse flex-shrink-0 font-mono tracking-wider">
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] sm:text-xs font-mono text-slate-400 dark:text-slate-500 block leading-none">
                            Released: {item.postDate}
                          </span>
                        </div>
                        <ChevronRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-400 group-hover/item:text-orange-500 dark:group-hover/item:text-orange-400 group-hover/item:translate-x-1 transition-all self-center flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs sm:text-sm text-slate-400 py-12 font-medium">No admit cards found</p>
                  )}
                </div>
              </div>
            )}

            {/* Box 3: Exam Results */}
            {(activeTab === 'all' || activeTab === 'results') && (
              <div 
                className="w-[88vw] sm:w-[360px] md:w-auto flex-shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-sm md:shadow-md overflow-hidden flex flex-col hover:shadow-2xl dark:hover:shadow-slate-950 transition-all duration-300 group hover:-translate-y-2.5"
                id="sarkari-box-results"
              >
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3.5 sm:px-5 sm:py-4 md:px-7 md:py-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Award className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" />
                    <h3 className="font-extrabold tracking-wide text-xs sm:text-sm md:text-base uppercase font-display leading-tight truncate">Exam Results</h3>
                  </div>
                  <span className="inline-block bg-white/20 text-white text-[10px] sm:text-xs font-mono px-2.5 py-0.5 rounded-full font-bold">
                    {getItemsByCategory('results').length}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 md:p-4.5 divide-y divide-slate-100 dark:divide-slate-850 flex-grow max-h-[420px] sm:max-h-[520px] overflow-y-auto scrollbar-thin">
                  {getItemsByCategory('results').length > 0 ? (
                    getItemsByCategory('results').map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all flex items-start gap-2 sm:gap-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 group/item ${
                          clickedItemId === item.id ? 'bg-emerald-100 dark:bg-emerald-900/30 scale-[0.98]' : ''
                        }`}
                        id={`sarkari-item-${item.id}`}
                      >
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0 group-hover/item:scale-125 transition-transform"></span>
                        <div className="flex-grow min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs sm:text-xs md:text-sm font-extrabold text-slate-850 dark:text-slate-100 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors font-display leading-tight break-words sm:line-clamp-2">
                              {item.title}
                            </span>
                            {item.isNew && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 text-[8.5px] sm:text-[9.5px] font-black uppercase rounded animate-pulse flex-shrink-0 font-mono tracking-wider">
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] sm:text-xs font-mono text-emerald-600 dark:text-emerald-400 font-extrabold block leading-none">
                            Declared On: {item.postDate}
                          </span>
                        </div>
                        <ChevronRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-400 group-hover/item:text-emerald-500 dark:group-hover/item:text-emerald-400 group-hover/item:translate-x-1 transition-all self-center flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs sm:text-sm text-slate-400 py-12 font-medium">No results found</p>
                  )}
                </div>
              </div>
            )}

            {/* Box 4: Answer Keys */}
            {(activeTab === 'all' || activeTab === 'answer_keys') && (
              <div 
                className="w-[88vw] sm:w-[360px] md:w-auto flex-shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-sm md:shadow-md overflow-hidden flex flex-col hover:shadow-2xl dark:hover:shadow-slate-950 transition-all duration-300 group hover:-translate-y-2.5"
                id="sarkari-box-keys"
              >
                <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-4 py-3.5 sm:px-5 sm:py-4 md:px-7 md:py-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Key className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" />
                    <h3 className="font-extrabold tracking-wide text-xs sm:text-sm md:text-base uppercase font-display leading-tight truncate">Answer Keys</h3>
                  </div>
                  <span className="inline-block bg-white/20 text-white text-[10px] sm:text-xs font-mono px-2.5 py-0.5 rounded-full font-bold">
                    {getItemsByCategory('answer_keys').length}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 md:p-4.5 divide-y divide-slate-100 dark:divide-slate-850 flex-grow max-h-[420px] sm:max-h-[520px] overflow-y-auto scrollbar-thin">
                  {getItemsByCategory('answer_keys').length > 0 ? (
                    getItemsByCategory('answer_keys').map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all flex items-start gap-2 sm:gap-3 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 group/item ${
                          clickedItemId === item.id ? 'bg-purple-100 dark:bg-purple-900/30 scale-[0.98]' : ''
                        }`}
                        id={`sarkari-item-${item.id}`}
                      >
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0 group-hover/item:scale-125 transition-transform"></span>
                        <div className="flex-grow min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs sm:text-xs md:text-sm font-extrabold text-slate-850 dark:text-slate-100 group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors font-display leading-tight break-words sm:line-clamp-2">
                              {item.title}
                            </span>
                            {item.isNew && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 text-[8.5px] sm:text-[9.5px] font-black uppercase rounded animate-pulse flex-shrink-0 font-mono tracking-wider">
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] sm:text-xs font-mono text-slate-400 dark:text-slate-500 block leading-none">
                            Key Update: {item.postDate}
                          </span>
                        </div>
                        <ChevronRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-400 group-hover/item:text-purple-500 dark:group-hover/item:text-purple-400 group-hover/item:translate-x-1 transition-all self-center flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs sm:text-sm text-slate-400 py-12 font-medium">No answer keys found</p>
                  )}
                </div>
              </div>
            )}

            {/* Box 5: Exam Syllabus */}
            {(activeTab === 'all' || activeTab === 'syllabus') && (
              <div 
                className="w-[88vw] sm:w-[360px] md:w-auto flex-shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-sm md:shadow-md overflow-hidden flex flex-col hover:shadow-2xl dark:hover:shadow-slate-950 transition-all duration-300 group hover:-translate-y-2.5"
                id="sarkari-box-syllabus"
              >
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 py-3.5 sm:px-5 sm:py-4 md:px-7 md:py-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <BookOpen className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" />
                    <h3 className="font-extrabold tracking-wide text-xs sm:text-sm md:text-base uppercase font-display leading-tight truncate">Syllabus</h3>
                  </div>
                  <span className="inline-block bg-white/20 text-white text-[10px] sm:text-xs font-mono px-2.5 py-0.5 rounded-full font-bold">
                    {getItemsByCategory('syllabus').length}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 md:p-4.5 divide-y divide-slate-100 dark:divide-slate-850 flex-grow max-h-[420px] sm:max-h-[520px] overflow-y-auto scrollbar-thin">
                  {getItemsByCategory('syllabus').length > 0 ? (
                    getItemsByCategory('syllabus').map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all flex items-start gap-2 sm:gap-3 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 group/item ${
                          clickedItemId === item.id ? 'bg-pink-100 dark:bg-pink-900/30 scale-[0.98]' : ''
                        }`}
                        id={`sarkari-item-${item.id}`}
                      >
                        <span className="w-2 h-2 bg-pink-500 rounded-full mt-1.5 flex-shrink-0 group-hover/item:scale-125 transition-transform"></span>
                        <div className="flex-grow min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs sm:text-xs md:text-sm font-extrabold text-slate-850 dark:text-slate-100 group-hover/item:text-pink-600 dark:group-hover/item:text-pink-400 transition-colors font-display leading-tight break-words sm:line-clamp-2">
                              {item.title}
                            </span>
                            {item.isNew && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 text-[8.5px] sm:text-[9.5px] font-black uppercase rounded animate-pulse flex-shrink-0 font-mono tracking-wider">
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] sm:text-xs font-mono text-slate-400 dark:text-slate-500 block leading-none">
                            Updated: {item.postDate}
                          </span>
                        </div>
                        <ChevronRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-400 group-hover/item:text-pink-500 dark:group-hover/item:text-pink-400 group-hover/item:translate-x-1 transition-all self-center flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs sm:text-sm text-slate-400 py-12 font-medium">No syllabus found</p>
                  )}
                </div>
              </div>
            )}

            {/* Box 6: Admissions */}
            {(activeTab === 'all' || activeTab === 'admissions') && (
              <div 
                className="w-[88vw] sm:w-[360px] md:w-auto flex-shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-sm md:shadow-md overflow-hidden flex flex-col hover:shadow-2xl dark:hover:shadow-slate-950 transition-all duration-300 group hover:-translate-y-2.5"
                id="sarkari-box-admissions"
              >
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3.5 sm:px-5 sm:py-4 md:px-7 md:py-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <GraduationCap className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" />
                    <h3 className="font-extrabold tracking-wide text-xs sm:text-sm md:text-base uppercase font-display leading-tight truncate">Admissions</h3>
                  </div>
                  <span className="inline-block bg-white/20 text-white text-[10px] sm:text-xs font-mono px-2.5 py-0.5 rounded-full font-bold">
                    {getItemsByCategory('admissions').length}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 md:p-4.5 divide-y divide-slate-100 dark:divide-slate-850 flex-grow max-h-[420px] sm:max-h-[520px] overflow-y-auto scrollbar-thin">
                  {getItemsByCategory('admissions').length > 0 ? (
                    getItemsByCategory('admissions').map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all flex items-start gap-2 sm:gap-3 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 group/item ${
                          clickedItemId === item.id ? 'bg-teal-100 dark:bg-teal-900/30 scale-[0.98]' : ''
                        }`}
                        id={`sarkari-item-${item.id}`}
                      >
                        <span className="w-2 h-2 bg-teal-500 rounded-full mt-1.5 flex-shrink-0 group-hover/item:scale-125 transition-transform"></span>
                        <div className="flex-grow min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs sm:text-xs md:text-sm font-extrabold text-slate-850 dark:text-slate-100 group-hover/item:text-teal-600 dark:group-hover/item:text-teal-400 transition-colors font-display leading-tight break-words sm:line-clamp-2">
                              {item.title}
                            </span>
                            {item.isNew && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 text-[8.5px] sm:text-[9.5px] font-black uppercase rounded animate-pulse flex-shrink-0 font-mono tracking-wider">
                                New
                              </span>
                            )}
                          </div>
                          {item.lastDate && (
                            <span className="text-[10px] sm:text-xs font-mono text-teal-600 dark:text-teal-400 font-extrabold block leading-none">
                              Last Date: {item.lastDate}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-400 group-hover/item:text-teal-500 dark:group-hover/item:text-teal-400 group-hover/item:translate-x-1 transition-all self-center flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs sm:text-sm text-slate-400 py-12 font-medium">No admissions found</p>
                  )}
                </div>
              </div>
            )}

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
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-all absolute right-4 top-4"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm scrollbar-thin">
              
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
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-950/30">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4.5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                Close View
              </button>
              <button
                onClick={() => handleApplyNow(selectedItem)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-red-100 dark:shadow-none"
              >
                Apply Online via Café
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
