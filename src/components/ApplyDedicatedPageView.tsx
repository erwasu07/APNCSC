import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Upload,
  X,
  Printer,
  Search,
  MessageCircle,
  ExternalLink,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowRight,
  RefreshCw,
  CreditCard,
  Building2,
  ShieldCheck,
  IndianRupee
} from 'lucide-react';
import { SARKARI_DATA, SarkariItem } from '../data/sarkariData';
import { SERVICES_LIST, ServiceItem } from '../servicesData';
import { UploadedDocument } from '../types';
import { db } from '../lib/firebase';
import { submitApplicationToSupabase } from '../lib/supabase';
import { doc, setDoc } from 'firebase/firestore';
import { computeSarkariStatus } from '../utils/sarkariStatus';

interface ApplyDedicatedPageViewProps {
  initialService?: string;
  onBack: () => void;
  onTrackApplication?: (tokenId?: string) => void;
  onNavigateTrack?: (tokenId?: string) => void;
}

interface DocRequirementSlot {
  slotId: string;
  label: string;
  required: boolean;
  allowedFormats: string;
  maxSizeLabel: string;
}

function splitServiceFeeBreakdown(priceStr?: string): {
  govtCharge?: string;
  cscCharge?: string;
  rawPrice?: string;
} {
  if (!priceStr || !priceStr.trim()) return {};
  const clean = priceStr.trim();
  if (clean.includes('+')) {
    const parts = clean.split('+').map((p) => p.trim());
    if (parts.length === 2) {
      return {
        govtCharge: parts[0],
        cscCharge: parts[1],
        rawPrice: clean
      };
    }
  }
  return { rawPrice: clean };
}

export default function ApplyDedicatedPageView({
  initialService = '',
  onBack,
  onTrackApplication,
  onNavigateTrack
}: ApplyDedicatedPageViewProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isChangingService, setIsChangingService] = useState<boolean>(false);
  const [showNotificationSummary, setShowNotificationSummary] = useState<boolean>(false);

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
    applicationFee: 0
  });

  const [reviewConfirmed, setReviewConfirmed] = useState<boolean>(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [stepBannerError, setStepBannerError] = useState<string | null>(null);

  // Selected files stored in memory for the current session (uploaded at final submit)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [processingSlotId, setProcessingSlotId] = useState<string | null>(null);
  const [slotErrors, setSlotErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any>(null);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'online_payu' | 'pay_at_centre'>('online_payu');
  const [payuInitiating, setPayuInitiating] = useState<boolean>(false);

  // Stable idempotency token for the current submission attempt to prevent duplicates on retry
  const pendingSubmissionIdRef = useRef<string | null>(null);

  // WhatsApp Automated Invoice Notification State
  const [whatsappStatus, setWhatsappStatus] = useState<{
    loading: boolean;
    sent?: boolean;
    message?: string;
    directWhatsAppUrl?: string;
    error?: string;
  } | null>(null);

  // Refs for accessible focus management
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const serviceSelectRef = useRef<HTMLSelectElement>(null);
  const customServiceRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const consentCheckboxRef = useRef<HTMLInputElement>(null);

  const parseFeeString = (feeStr: string | undefined) => {
    if (!feeStr) return 0;
    const clean = feeStr.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  };

  const handleServiceChange = (serviceVal: string) => {
    let appFee = 0;
    if (serviceVal !== 'other') {
      const matchingBulletin = SARKARI_DATA.find((item) => item.title === serviceVal);
      if (matchingBulletin && matchingBulletin.fees) {
        const feeStr =
          formData.userCategory === 'scSt'
            ? matchingBulletin.fees.scSt
            : matchingBulletin.fees.genObc;
        appFee = parseFeeString(feeStr);
      }
    }
    pendingSubmissionIdRef.current = null;
    setFormData((prev) => ({
      ...prev,
      selectedService: serviceVal,
      applicationFee: appFee
    }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.selectedService;
      delete next.customServiceText;
      return next;
    });
  };

  const handleCategoryChange = (categoryVal: 'genObc' | 'scSt') => {
    let appFee = 0;
    if (formData.selectedService !== 'other') {
      const matchingBulletin = SARKARI_DATA.find(
        (item) => item.title === formData.selectedService
      );
      if (matchingBulletin && matchingBulletin.fees) {
        const feeStr =
          categoryVal === 'scSt'
            ? matchingBulletin.fees.scSt
            : matchingBulletin.fees.genObc;
        appFee = parseFeeString(feeStr);
      }
    }
    setFormData((prev) => ({
      ...prev,
      userCategory: categoryVal,
      applicationFee: appFee
    }));
  };

  // Preselect service when user arrives from a post or service page
  useEffect(() => {
    if (initialService) {
      const cleanName = initialService
        .replace(/^(Assistance Request:|Filing Application:)\s*/i, '')
        .trim();
      const sarkariMatch = SARKARI_DATA.find(
        (item) => item.title.toLowerCase() === cleanName.toLowerCase()
      );
      const serviceMatch = SERVICES_LIST.find(
        (s) => s.name.toLowerCase() === cleanName.toLowerCase()
      );

      if (sarkariMatch) {
        handleServiceChange(sarkariMatch.title);
        setIsChangingService(false);
      } else if (serviceMatch) {
        handleServiceChange(serviceMatch.name);
        setIsChangingService(false);
      } else {
        const partialSarkari = SARKARI_DATA.find(
          (item) =>
            item.title.toLowerCase().includes(cleanName.toLowerCase()) ||
            cleanName.toLowerCase().includes(item.title.toLowerCase())
        );
        const partialService = SERVICES_LIST.find(
          (s) =>
            s.name.toLowerCase().includes(cleanName.toLowerCase()) ||
            cleanName.toLowerCase().includes(s.name.toLowerCase())
        );

        if (partialSarkari) {
          handleServiceChange(partialSarkari.title);
          setIsChangingService(false);
        } else if (partialService) {
          handleServiceChange(partialService.name);
          setIsChangingService(false);
        } else {
          setFormData((prev) => ({
            ...prev,
            selectedService: 'other',
            customServiceText: cleanName
          }));
          setIsChangingService(false);
        }
      }
    } else if (!formData.selectedService && SARKARI_DATA.length > 0) {
      handleServiceChange(SARKARI_DATA[0].title);
      setIsChangingService(false);
    }
  }, [initialService]);

  // Warn before abandoning unsaved work
  const hasUnsavedWork = Boolean(
    !isFormSubmitted &&
      (formData.customerName.trim() ||
        formData.phoneNumber.trim() ||
        formData.emailAddress.trim() ||
        formData.additionalDetails.trim() ||
        uploadedFiles.length > 0)
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedWork) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedWork]);

  const handleSafeBack = () => {
    if (hasUnsavedWork) {
      const confirmLeave = window.confirm(
        'You have unsaved application details. Are you sure you want to leave this page?'
      );
      if (!confirmLeave) return;
    }
    onBack();
  };

  // Match active Sarkari item or CSC service item
  const currentSarkariItem: SarkariItem | undefined = useMemo(() => {
    if (!formData.selectedService || formData.selectedService === 'other') return undefined;
    return (
      SARKARI_DATA.find(
        (item) => item.title.toLowerCase() === formData.selectedService.toLowerCase()
      ) ||
      SARKARI_DATA.find((item) => item.title === formData.selectedService) ||
      SARKARI_DATA.find(
        (item) =>
          formData.selectedService.toLowerCase().includes(item.title.toLowerCase()) ||
          item.title.toLowerCase().includes(formData.selectedService.toLowerCase())
      )
    );
  }, [formData.selectedService]);

  const currentSarkariStatus = useMemo(() => {
    return currentSarkariItem ? computeSarkariStatus(currentSarkariItem) : null;
  }, [currentSarkariItem]);

  const currentServiceItem: ServiceItem | undefined = useMemo(() => {
    if (!formData.selectedService || formData.selectedService === 'other' || currentSarkariItem) {
      return undefined;
    }
    return (
      SERVICES_LIST.find(
        (s) => s.name.toLowerCase() === formData.selectedService.toLowerCase()
      ) ||
      SERVICES_LIST.find((s) => s.name === formData.selectedService) ||
      SERVICES_LIST.find(
        (s) =>
          formData.selectedService.toLowerCase().includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(formData.selectedService.toLowerCase())
      )
    );
  }, [formData.selectedService, currentSarkariItem]);

  // Build real document requirement slots for Step 2 based on selected service
  const documentSlots: DocRequirementSlot[] = useMemo(() => {
    if (currentServiceItem && Array.isArray(currentServiceItem.requirements) && currentServiceItem.requirements.length > 0) {
      return currentServiceItem.requirements.map((reqName, index) => ({
        slotId: index === 0 ? 'aadhaar_school_id' : `service_req_${index}`,
        label: reqName,
        required: index === 0,
        allowedFormats: 'JPG, PNG, WEBP, or PDF',
        maxSizeLabel: 'Max 10 MB'
      }));
    }

    if (currentSarkariItem) {
      return [
        {
          slotId: 'aadhaar_school_id',
          label: 'Identity or Educational Qualification Document (Aadhaar / Marksheet / ID)',
          required: true,
          allowedFormats: 'JPG, PNG, WEBP, or PDF',
          maxSizeLabel: 'Max 10 MB'
        },
        {
          slotId: 'supporting_doc_2',
          label: 'Additional Supporting Document (Photo / Signature / Category Certificate)',
          required: false,
          allowedFormats: 'JPG, PNG, WEBP, or PDF',
          maxSizeLabel: 'Max 10 MB'
        }
      ];
    }

    return [
      {
        slotId: 'aadhaar_school_id',
        label: 'Primary Identity or Supporting Document',
        required: true,
        allowedFormats: 'JPG, PNG, WEBP, or PDF',
        maxSizeLabel: 'Max 10 MB'
      },
      {
        slotId: 'supporting_doc_2',
        label: 'Additional Supporting Document',
        required: false,
        allowedFormats: 'JPG, PNG, WEBP, or PDF',
        maxSizeLabel: 'Max 10 MB'
      }
    ];
  }, [currentServiceItem, currentSarkariItem]);

  const navigateToStep = (nextStep: 1 | 2 | 3) => {
    setStepBannerError(null);
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      stepHeadingRef.current?.focus();
    }, 60);
  };

  // Validate Step 1 (Details) and focus first invalid field
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    let firstInvalidRef: React.RefObject<HTMLElement | null> | null = null;

    if (!formData.selectedService) {
      errors.selectedService = 'Please select a service or notification.';
      setIsChangingService(true);
      if (!firstInvalidRef) firstInvalidRef = serviceSelectRef;
    } else if (
      formData.selectedService === 'other' &&
      !formData.customServiceText.trim()
    ) {
      errors.customServiceText = 'Please specify the service or form you need assistance with.';
      if (!firstInvalidRef) firstInvalidRef = customServiceRef;
    }

    if (!formData.customerName.trim()) {
      errors.customerName = 'Enter the applicant’s full name.';
      if (!firstInvalidRef) firstInvalidRef = nameInputRef;
    }

    const cleanDigits = formData.phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      errors.phoneNumber = 'Enter a valid 10-digit mobile number.';
      if (!firstInvalidRef) firstInvalidRef = phoneInputRef;
    }

    if (
      formData.emailAddress.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress.trim())
    ) {
      errors.emailAddress = 'Enter a valid email address or leave this field blank.';
      if (!firstInvalidRef) firstInvalidRef = emailInputRef;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setStepBannerError('Please check the highlighted fields before continuing.');
      setTimeout(() => {
        firstInvalidRef?.current?.focus();
      }, 30);
      return false;
    }

    if (currentSarkariItem && currentSarkariStatus && !currentSarkariStatus.canApplyOnline) {
      setStepBannerError(
        currentSarkariStatus.isClosed
          ? `Applications for "${currentSarkariItem.title}" officially concluded on ${currentSarkariItem.lastDate}. Assisted application requests cannot be accepted for closed cycles.`
          : currentSarkariStatus.isUpcoming
          ? `Applications for "${currentSarkariItem.title}" commence on ${currentSarkariItem.startDate}. Please check back when the official window opens.`
          : currentSarkariStatus.isCancelled
          ? `This recruitment notice has been formally cancelled by the authority.`
          : `Applications are currently unavailable or pending verification for this notice.`
      );
      return false;
    }

    setStepBannerError(null);
    return true;
  };

  // Validate Step 2 (Documents)
  const validateStep2 = (): boolean => {
    const requiredSlots = documentSlots.filter((s) => s.required);
    const newSlotErrors: Record<string, string> = {};

    for (const slot of requiredSlots) {
      const hasFile = uploadedFiles.some((f) => f.docTypeId === slot.slotId) || uploadedFiles.length > 0;
      if (!hasFile) {
        newSlotErrors[slot.slotId] = `Please attach "${slot.label}" before continuing.`;
      }
    }

    setSlotErrors(newSlotErrors);

    if (Object.keys(newSlotErrors).length > 0) {
      setStepBannerError('Please attach the required document to continue to review.');
      return false;
    }

    setStepBannerError(null);
    return true;
  };

  const handleContinueFromStep1 = () => {
    if (validateStep1()) {
      navigateToStep(2);
    }
  };

  const handleContinueFromStep2 = () => {
    if (validateStep2()) {
      navigateToStep(3);
    }
  };

  const handleSlotFileSelect = (
    slot: DocRequirementSlot,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStepBannerError(null);
    setSlotErrors((prev) => {
      const next = { ...prev };
      delete next[slot.slotId];
      return next;
    });

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'application/pdf'
    ];
    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)
    ) {
      setSlotErrors((prev) => ({
        ...prev,
        [slot.slotId]:
          'Unsupported file format. Please choose a JPG, PNG, WEBP, or PDF file.'
      }));
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSlotErrors((prev) => ({
        ...prev,
        [slot.slotId]: `File "${file.name}" exceeds the 10 MB maximum size limit.`
      }));
      e.target.value = '';
      return;
    }

    setProcessingSlotId(slot.slotId);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newDoc: UploadedDocument = {
        id: Math.random().toString(36).substring(2, 9),
        docTypeId: slot.slotId,
        docTypeName: slot.label,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl,
        rawFile: file
      };
      setUploadedFiles((prev) => {
        const filtered = prev.filter((item) => item.docTypeId !== slot.slotId);
        // Keep primary required document first for backend compatibility
        if (slot.required) {
          return [newDoc, ...filtered];
        }
        return [...filtered, newDoc];
      });
      setProcessingSlotId(null);
    };
    reader.onerror = () => {
      setSlotErrors((prev) => ({
        ...prev,
        [slot.slotId]: 'Could not read the selected file. Please try again.'
      }));
      setProcessingSlotId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveSlotFile = (slotId: string) => {
    setUploadedFiles((prev) => prev.filter((item) => item.docTypeId !== slotId));
  };

  const getNextCscTokenIdAsync = async (): Promise<string> => {
    if (pendingSubmissionIdRef.current) {
      return pendingSubmissionIdRef.current;
    }

    try {
      const res = await fetch('/api/appointments/next-token');
      if (res.ok) {
        const data = await res.json();
        if (data && data.nextToken) {
          const num = parseInt(data.seq, 10);
          if (!isNaN(num)) {
            const lastStored = parseInt(
              localStorage.getItem('csc_token_seq') || '0',
              10
            );
            if (num > lastStored) {
              localStorage.setItem('csc_token_seq', num.toString());
            }
          }
          pendingSubmissionIdRef.current = data.nextToken;
          return data.nextToken;
        }
      }
    } catch (e) {
      console.warn('Next token server fetch warning, using fallback sequence:', e);
    }

    try {
      let maxSeq = 0;
      const existingApps = JSON.parse(
        localStorage.getItem('csc_local_applications') || '[]'
      );
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
      const token = `CSC21251567${seqPadded}`;
      pendingSubmissionIdRef.current = token;
      return token;
    } catch {
      const randSeq = Math.floor(100 + Math.random() * 900);
      const token = `CSC21251567${randSeq}`;
      pendingSubmissionIdRef.current = token;
      return token;
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
          message: data.message || 'WhatsApp confirmation dispatched.',
          directWhatsAppUrl: data.directWhatsAppUrl
        });
      } else {
        setWhatsappStatus({
          loading: false,
          sent: false,
          error: data.error,
          directWhatsAppUrl: data.directWhatsAppUrl
        });
      }
    } catch {
      const cleanDigits = (receiptData.phoneNumber || '').replace(/[^\d]/g, '');
      const fallbackPhone =
        cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
      const fallbackText = encodeURIComponent(
        `CSC DOST Assistance Request Received\nReference ID: ${receiptData.appId}\nService: ${receiptData.selectedService}\nApplicant: ${receiptData.customerName}`
      );

      setWhatsappStatus({
        loading: false,
        sent: false,
        directWhatsAppUrl: `https://api.whatsapp.com/send?phone=${fallbackPhone}&text=${fallbackText}`
      });
    }
  };

  // Online PayU trigger from receipt view for users who originally chose Pay at Centre
  const handlePayOnlineFromReceipt = async () => {
    if (!submissionReceipt?.appId || payuInitiating) return;
    setPayuInitiating(true);
    try {
      const sName =
        submissionReceipt.selectedService ||
        (formData.selectedService === 'other'
          ? formData.customServiceText.trim() || 'Custom Service'
          : formData.selectedService) ||
        'CSC Service';
      const payuRes = await fetch('/api/payu/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: submissionReceipt.appId,
          serviceId: formData.selectedService || 'general',
          serviceName: sName,
          customerName: submissionReceipt.customerName,
          email:
            submissionReceipt.emailAddress && submissionReceipt.emailAddress !== 'N/A'
              ? submissionReceipt.emailAddress
              : `${submissionReceipt.phoneNumber}@cscdost.com`,
          phone: submissionReceipt.phoneNumber,
          deliveryType: formData.deliveryOption
        })
      });
      const payuData = await payuRes.json();
      if (payuData.success && payuData.actionUrl && payuData.params) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = payuData.actionUrl;
        Object.entries(payuData.params).forEach(([k, v]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = String(v);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      } else {
        alert(payuData.error || 'Failed to initiate PayU checkout.');
      }
    } catch (err: any) {
      console.error('Error initiating PayU:', err);
      alert('Error connecting to PayU gateway.');
    } finally {
      setPayuInitiating(false);
    }
  };

  // Final submission handler (only invoked on Step 3 Submit Assistance Request)
  const handleFinalFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent accidental submission from earlier steps
    if (currentStep === 1) {
      handleContinueFromStep1();
      return;
    }
    if (currentStep === 2) {
      handleContinueFromStep2();
      return;
    }

    if (isSubmitting || processingSlotId) return;

    if (!validateStep1()) {
      navigateToStep(1);
      return;
    }
    if (!validateStep2()) {
      navigateToStep(2);
      return;
    }

    if (!reviewConfirmed) {
      setStepBannerError(
        'Please confirm the acknowledgement checkbox before submitting your request.'
      );
      consentCheckboxRef.current?.focus();
      return;
    }

    setStepBannerError(null);
    setIsSubmitting(true);

    try {
      const selectedServiceClean =
        formData.selectedService === 'other' ||
        formData.selectedService === 'Custom Unlisted Request'
          ? formData.customServiceText.trim() || 'Custom Service Request'
          : formData.selectedService;

      const userCategoryClean =
        formData.userCategory === 'genObc' ? 'General/OBC' : 'SC/ST/Female';

      const idempotentToken = await getNextCscTokenIdAsync();

      const docsToSubmit = uploadedFiles.map((f, idx) => ({
        id: f.id || `doc-${idx}`,
        name: f.name || 'Document',
        size: f.size || 0,
        type: f.type || 'application/octet-stream',
        dataUrl: f.dataUrl
      }));

      const isOnline = selectedPaymentMethod === 'online_payu' && computedPriceDetails.totalAmount > 0;
      const paymentModeLabel = isOnline
        ? 'online_payu'
        : isPhysicalDeliveryService
        ? 'Pay at Centre / Cash on Delivery'
        : 'Pay Later at CSC Centre (Offline)';

      const paymentStatusInitial = computedPriceDetails.isFree
        ? 'not_required'
        : isOnline
        ? 'pending_verification'
        : 'unpaid';

      const submitPayload = {
        appId: idempotentToken,
        idempotencyKey: idempotentToken,
        customerName: formData.customerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        emailAddress: (formData.emailAddress || '').trim(),
        dateOfBirth: formData.dateOfBirth || 'N/A',
        selectedService: selectedServiceClean,
        userCategory: userCategoryClean,
        paymentMode: paymentModeLabel,
        paymentStatus: paymentStatusInitial,
        utrNumber: 'N/A',
        totalAmount: computedPriceDetails.totalAmount,
        message: formData.additionalDetails.trim() || 'None',
        mandatoryDocName:
          uploadedFiles[0]?.name || 'Identity / Supporting Document Attached',
        documents: docsToSubmit
      };

      let confirmedAppId = '';
      let savedData: any = null;
      let persistSuccess = false;
      let lastErrorMessage = '';

      // Pathway A: Authoritative server endpoint (persists to Supabase + local DB)
      try {
        const res = await fetch('/api/applications/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitPayload)
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const resData = await res.json();
          if (res.ok && resData.success) {
            persistSuccess = true;
            confirmedAppId = resData.appId || resData.token_id || idempotentToken;
            savedData = resData.data;
          } else {
            lastErrorMessage =
              resData.error || `Server returned error (${res.status})`;
          }
        } else {
          lastErrorMessage = `API returned HTTP ${res.status}`;
        }
      } catch (serverErr: any) {
        lastErrorMessage = serverErr?.message || 'Server connection notice';
      }

      // Pathway B: Direct Supabase Client Fallback using the same idempotent token
      if (!persistSuccess) {
        const supaDirectRes = await submitApplicationToSupabase(
          {
            appId: idempotentToken,
            customerName: formData.customerName.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            emailAddress: formData.emailAddress.trim(),
            selectedService: selectedServiceClean,
            userCategory: userCategoryClean,
            paymentMode: paymentModeLabel,
            utrNumber: 'N/A',
            totalAmount: computedPriceDetails.totalAmount,
            status: 'Pending',
            dateOfBirth: formData.dateOfBirth,
            message: formData.additionalDetails.trim(),
            mandatoryDocName:
              uploadedFiles[0]?.name || 'Identity Document Attached',
            submittedAt: new Date().toISOString()
          },
          uploadedFiles
        );

        if (supaDirectRes.success && supaDirectRes.data) {
          persistSuccess = true;
          confirmedAppId = supaDirectRes.data?.token_id || idempotentToken;
          savedData = supaDirectRes.data;
        } else {
          throw new Error(
            supaDirectRes.error ||
              lastErrorMessage ||
              'Unable to submit your request right now. Please check your internet connection and try again.'
          );
        }
      }

      const uploadedDocsList = uploadedFiles.map(
        (f) => `${f.docTypeName ? `${f.docTypeName}: ` : ''}${f.name} (${(f.size / 1024).toFixed(1)} KB)`
      );

      const nowFormatted =
        new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) +
        ' · ' +
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        });

      const verifiedReceipt = {
        appId: confirmedAppId,
        customerName: formData.customerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        emailAddress: formData.emailAddress.trim() || 'N/A',
        dateOfBirth: formData.dateOfBirth || 'N/A',
        selectedService: selectedServiceClean,
        userCategory: userCategoryClean,
        paymentMode: isOnline ? 'online_payu' : 'pay_at_centre',
        paymentMethodLabel: isOnline
          ? 'PayU Online Hosted Gateway'
          : isPhysicalDeliveryService
          ? 'Pay at Centre / Cash on Delivery'
          : 'Pay Later at CSC Centre',
        utrNumber: 'N/A',
        paymentStatus: computedPriceDetails.isFree
          ? 'Not Required'
          : isOnline
          ? 'Pending Verification'
          : 'Unpaid (Pay at CSC Centre)',
        govtFee: computedPriceDetails.govtFee,
        cscFee: computedPriceDetails.cscFee,
        totalAmount: computedPriceDetails.totalAmount,
        mandatoryDocName:
          uploadedFiles[0]?.name || 'Identity / Supporting Document Attached',
        uploadedDocuments: uploadedDocsList,
        additionalDetails: formData.additionalDetails.trim() || 'None',
        submittedAt: nowFormatted
      };

      setSubmissionReceipt(verifiedReceipt);
      setIsFormSubmitted(true);
      pendingSubmissionIdRef.current = null;

      // Save non-sensitive reference summary in localStorage for current-device token lookup
      try {
        const localCacheItem = {
          appId: confirmedAppId,
          id: confirmedAppId,
          customerName: formData.customerName.trim(),
          name: formData.customerName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          phone: formData.phoneNumber.trim(),
          selectedService: selectedServiceClean,
          service: selectedServiceClean,
          userCategory: userCategoryClean,
          paymentMode: verifiedReceipt.paymentMode,
          paymentStatus: verifiedReceipt.paymentStatus,
          status: 'Pending',
          submittedAt: new Date().toISOString()
        };
        const existing = JSON.parse(
          localStorage.getItem('csc_local_applications') || '[]'
        );
        localStorage.setItem(
          'csc_local_applications',
          JSON.stringify([
            localCacheItem,
            ...existing.filter((i: any) => i.appId !== confirmedAppId)
          ])
        );
        window.dispatchEvent(
          new CustomEvent('csc_appointment_created', { detail: localCacheItem })
        );
        window.dispatchEvent(new Event('storage'));
      } catch {}

      // Secondary Firestore sync (non-blocking)
      try {
        Promise.all([
          setDoc(doc(db, 'applications', confirmedAppId), {
            ...verifiedReceipt,
            documents: savedData?.document_urls || []
          }, { merge: true }),
          setDoc(doc(db, 'appointments', confirmedAppId), {
            ...verifiedReceipt,
            documents: savedData?.document_urls || []
          }, { merge: true })
        ]).catch(() => {});
      } catch {}

      // If user chose PayU Online payment, initiate PayU Hosted Checkout redirect
      if (isOnline) {
        setPayuInitiating(true);
        try {
          const payuRes = await fetch('/api/payu/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appId: confirmedAppId,
              customerName: formData.customerName.trim(),
              email: (formData.emailAddress || '').trim() || 'customer@cscdost.com',
              phone: formData.phoneNumber.trim(),
              serviceName: selectedServiceClean,
              userCategory: userCategoryClean
            })
          });

          const payuData = await payuRes.json();
          if (payuRes.ok && payuData.success && payuData.actionUrl && payuData.params) {
            // Create a standard auto-submitting POST form for PayU Hosted Checkout
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payuData.actionUrl;
            form.style.display = 'none';

            Object.entries(payuData.params).forEach(([key, val]) => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = String(val);
              form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
            return;
          } else {
            console.warn('PayU initiate response notice:', payuData.error);
            setStepBannerError(
              payuData.error ||
                'PayU gateway session could not be established. Your application reference is preserved—you may pay at the counter or complete payment anytime from tracking.'
            );
          }
        } catch (payuErr: any) {
          console.warn('PayU checkout redirect error:', payuErr);
          setStepBannerError(
            'Your application is safely registered, but the payment gateway was unreachable. You can pay at the counter or complete payment later using your application reference.'
          );
        } finally {
          setPayuInitiating(false);
        }
      }
      try {
        Promise.all([
          setDoc(doc(db, 'applications', confirmedAppId), {
            ...verifiedReceipt,
            documents: savedData?.document_urls || []
          }, { merge: true }),
          setDoc(doc(db, 'appointments', confirmedAppId), {
            ...verifiedReceipt,
            documents: savedData?.document_urls || []
          }, { merge: true })
        ]).catch(() => {});
      } catch {}

      triggerWhatsAppInvoiceDispatch(verifiedReceipt);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setIsFormSubmitted(false);
      setStepBannerError(
        err?.message ||
          'Submission could not be completed. Your entered information is safe—please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const selectedServiceDisplayTitle =
    formData.selectedService === 'other'
      ? formData.customServiceText.trim() || 'Custom Government / CSC Request'
      : formData.selectedService || 'Select a service';

  const selectedServiceIdentifier = currentSarkariItem?.advertisementNo
    ? currentSarkariItem.advertisementNo
    : currentServiceItem
    ? `Service ID: ${currentServiceItem.id}`
    : undefined;

  const serviceFeeBreakdown = useMemo(() => {
    if (currentSarkariItem) {
      const feeText =
        formData.userCategory === 'scSt'
          ? currentSarkariItem.fees?.scSt
          : currentSarkariItem.fees?.genObc;
      return {
        govtCharge: feeText || undefined,
        cscCharge: 'Operator filing charge confirmed at CSC desk',
        rawPrice: undefined
      };
    }
    if (currentServiceItem) {
      return splitServiceFeeBreakdown(currentServiceItem.price);
    }
    return {};
  }, [currentSarkariItem, currentServiceItem, formData.userCategory]);

  const isPhysicalDeliveryService = useMemo(() => {
    const s = (formData.selectedService || '').toLowerCase();
    return (
      s.includes('pvc') ||
      s.includes('smart card') ||
      s.includes('card printing') ||
      s.includes('printout') ||
      s.includes('delivery') ||
      s.includes('plastic card')
    );
  }, [formData.selectedService]);

  const computedPriceDetails = useMemo(() => {
    let govtFee = 0;
    let cscFee = 70;
    let isFree = false;

    if (currentSarkariItem && currentSarkariItem.fees) {
      const feeText =
        formData.userCategory === 'scSt'
          ? currentSarkariItem.fees.scSt
          : currentSarkariItem.fees.genObc;
      const digits = String(feeText || '').match(/(\d+)/);
      govtFee = digits ? parseInt(digits[1], 10) : 0;
      if (String(feeText || '').toLowerCase().includes('free') || feeText === '0' || feeText === '₹0') {
        govtFee = 0;
      }
    } else if (currentServiceItem && currentServiceItem.price) {
      const priceLower = currentServiceItem.price.toLowerCase();
      if (priceLower.includes('free') && !priceLower.includes('+')) {
        isFree = true;
        cscFee = 0;
      }
      const numMatches = currentServiceItem.price.match(/₹\s*(\d+)/g);
      if (numMatches && numMatches.length >= 2) {
        govtFee = parseInt(numMatches[0].replace(/[^\d]/g, ''), 10) || 0;
        cscFee = parseInt(numMatches[1].replace(/[^\d]/g, ''), 10) || 70;
      } else if (numMatches && numMatches.length === 1) {
        const val = parseInt(numMatches[0].replace(/[^\d]/g, ''), 10) || 70;
        if (priceLower.includes('govt')) {
          govtFee = val;
        } else {
          cscFee = val;
        }
      }
    }

    const totalAmount = isFree ? 0 : Math.max(0, govtFee + cscFee);
    return { govtFee, cscFee, totalAmount, isFree };
  }, [currentSarkariItem, currentServiceItem, formData.userCategory]);

  return (
    <div className="min-h-screen bg-white text-[#102A43] font-sans w-full overflow-x-hidden">
      {/* Compact Header with Existing CSC DOST Logo & Back to Portal */}
      <header className="w-full bg-white border-b border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSafeBack}
            className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            aria-label="CSC DOST - Back to Portal"
          >
            <img
              src="/favicon.svg"
              alt="CSC DOST Logo"
              className="w-8 h-8 rounded-lg shrink-0 object-contain"
            />
            <div className="min-w-0">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#102A43] block leading-none">
                CSC <span className="text-[#2563EB]">DOST</span>
              </span>
              <span className="text-[11px] text-[#64748B] block mt-0.5 truncate">
                Citizen Service Portal
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const navFn = onTrackApplication || onNavigateTrack;
                if (navFn) {
                  navFn(submissionReceipt?.appId || '');
                } else {
                  window.location.hash = '#track';
                }
              }}
              id="apply-track-nav-btn"
              className="hidden sm:inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
              <span>Track Application</span>
            </button>

            <button
              type="button"
              onClick={handleSafeBack}
              id="apply-back-btn"
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <ArrowLeft className="w-4 h-4 text-[#475569]" aria-hidden="true" />
              <span>Back to Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-3xl mx-auto">
        {!isFormSubmitted ? (
          <>
            {/* Page Heading & 3-Step Progress Bar */}
            <header className="px-4 py-6 border-b border-[#E2E8F0] space-y-4">
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight">
                  Application assistance desk
                </h1>
                <p className="text-sm text-[#475569]">
                  Prepare your request in three simple steps.
                </p>
              </div>

              {/* Compact 3-Step Navigation (6–8px gap) */}
              <nav aria-label="Application steps">
                <ol className="grid grid-cols-3 gap-2">
                  {[
                    { step: 1 as const, label: 'Details' },
                    { step: 2 as const, label: 'Documents' },
                    { step: 3 as const, label: 'Review' }
                  ].map((item) => {
                    const isActive = currentStep === item.step;
                    const isCompleted = currentStep > item.step;
                    return (
                      <li key={item.step}>
                        <button
                          type="button"
                          onClick={() => {
                            if (item.step < currentStep) {
                              navigateToStep(item.step);
                            } else if (item.step === 2 && currentStep === 1) {
                              handleContinueFromStep1();
                            } else if (item.step === 3 && currentStep === 2) {
                              handleContinueFromStep2();
                            } else if (item.step === 3 && currentStep === 1) {
                              if (validateStep1() && validateStep2()) {
                                navigateToStep(3);
                              }
                            }
                          }}
                          aria-current={isActive ? 'step' : undefined}
                          className={`w-full min-h-[44px] px-3 py-2 rounded-lg border text-left flex items-center gap-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                            isActive
                              ? 'bg-[#EFF6FF] border-[#2563EB] text-[#102A43]'
                              : isCompleted
                              ? 'bg-white border-[#CBD5E1] text-[#102A43] hover:bg-[#F8FAFC]'
                              : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                              isActive
                                ? 'bg-[#2563EB] text-white'
                                : isCompleted
                                ? 'bg-[#16A34A] text-white'
                                : 'bg-[#E2E8F0] text-[#475569]'
                            }`}
                          >
                            {isCompleted ? '✓' : item.step}
                          </span>
                          <span className="text-xs sm:text-sm font-bold truncate">
                            {item.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </header>

            {/* Validation / Submission Alert Banner */}
            {stepBannerError && (
              <div
                role="alert"
                className="px-4 py-3.5 bg-[#FEF2F2] border-b border-[#FECACA] text-[#B91C1C] text-xs sm:text-sm font-medium flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{stepBannerError}</span>
              </div>
            )}

            <form onSubmit={handleFinalFormSubmit} noValidate>
              {/* ============================================================ */}
              {/* STEP 1 — DETAILS                                             */}
              {/* ============================================================ */}
              {currentStep === 1 && (
                <div className="divide-y divide-[#E2E8F0]">
                  {/* Compact Selected-Service Summary */}
                  <section
                    aria-labelledby="selected-service-heading"
                    className="px-4 py-5 space-y-3 bg-[#F8FAFC]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <span
                          id="selected-service-heading"
                          className="text-xs font-bold uppercase tracking-wider text-[#475569] block"
                        >
                          Selected service or notification
                        </span>
                        <p className="text-sm sm:text-base font-bold text-[#102A43] leading-snug break-words">
                          {selectedServiceDisplayTitle}
                        </p>
                        {selectedServiceIdentifier && (
                          <p className="text-xs text-[#475569] font-mono">
                            {selectedServiceIdentifier}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsChangingService((prev) => !prev)}
                        className="min-h-[38px] px-3 py-1.5 bg-white hover:bg-[#F1F5F9] text-[#2563EB] border border-[#CBD5E1] rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        {isChangingService ? 'Hide selector' : 'Change'}
                      </button>
                    </div>

                    {/* Applications Closed / Concluded Warning Alert */}
                    {currentSarkariStatus && !currentSarkariStatus.canApplyOnline && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-rose-700">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>
                            {currentSarkariStatus.isClosed
                              ? 'Applications Closed for this Notification'
                              : currentSarkariStatus.isUpcoming
                              ? 'Upcoming Application Window'
                              : currentSarkariStatus.isCancelled
                              ? 'Notification Cancelled'
                              : 'Applications Inactive'}
                          </span>
                        </div>
                        <p className="leading-relaxed text-rose-800">
                          {currentSarkariStatus.closingTimeNote ||
                            `The online application window officially closed on ${currentSarkariItem?.lastDate}. Assisted application filing cannot be processed for concluded cycles.`}
                          {' '}Please click &ldquo;Change&rdquo; above to select an active service or recruitment.
                        </p>
                      </div>
                    )}

                    {/* Optional View Notification Link / Expandable Summary (Never repeats full article) */}
                    {(currentSarkariItem || currentServiceItem) && (
                      <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setShowNotificationSummary((prev) => !prev)}
                          aria-expanded={showNotificationSummary}
                          className="inline-flex items-center gap-1 text-[#2563EB] hover:underline font-semibold cursor-pointer"
                        >
                          <span>
                            {showNotificationSummary
                              ? 'Hide key details'
                              : 'View notification summary'}
                          </span>
                          {showNotificationSummary ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {currentSarkariItem && (
                          <a
                            href={`#post/${currentSarkariItem.id}`}
                            className="inline-flex items-center gap-1 text-[#475569] hover:text-[#102A43] hover:underline font-medium"
                          >
                            <span>View notification page</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {currentServiceItem && (
                          <a
                            href={`#service/${currentServiceItem.id}`}
                            className="inline-flex items-center gap-1 text-[#475569] hover:text-[#102A43] hover:underline font-medium"
                          >
                            <span>View service details</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {showNotificationSummary && currentSarkariItem && (
                      <div className="pt-2 border-t border-[#E2E8F0] text-xs text-[#334155] space-y-1.5">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {currentSarkariItem.lastDate && (
                            <span>
                              <strong className="text-[#102A43]">Last Date:</strong>{' '}
                              {currentSarkariItem.lastDate}
                            </span>
                          )}
                          {currentSarkariItem.totalPosts && (
                            <span>
                              <strong className="text-[#102A43]">Posts:</strong>{' '}
                              {currentSarkariItem.totalPosts}
                            </span>
                          )}
                          {currentSarkariItem.fees?.genObc && (
                            <span>
                              <strong className="text-[#102A43]">Official Fee:</strong>{' '}
                              {currentSarkariItem.fees.genObc}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {showNotificationSummary && currentServiceItem && (
                      <div className="pt-2 border-t border-[#E2E8F0] text-xs text-[#334155] space-y-1">
                        <p>{currentServiceItem.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                          {currentServiceItem.price && (
                            <span>
                              <strong className="text-[#102A43]">Charges:</strong>{' '}
                              {currentServiceItem.price}
                            </span>
                          )}
                          {currentServiceItem.estimatedTime && (
                            <span>
                              <strong className="text-[#102A43]">Turnaround:</strong>{' '}
                              {currentServiceItem.estimatedTime}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Service Selector Dropdown (Visible when changing or when "other" or empty) */}
                    {(isChangingService ||
                      !formData.selectedService ||
                      formData.selectedService === 'other') && (
                      <div className="pt-3 border-t border-[#E2E8F0] space-y-3">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="apply-service-select"
                            className="block text-xs font-semibold text-[#102A43]"
                          >
                            Select service or recruitment notification{' '}
                            <span className="text-[#DC2626]">*</span>
                          </label>
                          <select
                            ref={serviceSelectRef}
                            id="apply-service-select"
                            value={formData.selectedService}
                            onChange={(e) => {
                              handleServiceChange(e.target.value);
                              if (e.target.value && e.target.value !== 'other') {
                                setIsChangingService(false);
                              }
                            }}
                            className="w-full min-h-[44px] px-3 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-xs sm:text-sm font-medium text-[#102A43] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
                          >
                            <option value="">-- Choose a notification or service --</option>
                            <optgroup label="Active Recruitment & Admission Notices (Open for Application)">
                              {SARKARI_DATA.filter((item) => computeSarkariStatus(item).canApplyOnline).map((item) => (
                                <option key={item.id} value={item.title}>
                                  {item.title} (Open till {item.lastDate})
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Concluded / Historical Notices (Applications Closed)">
                              {SARKARI_DATA.filter((item) => !computeSarkariStatus(item).canApplyOnline).map((item) => (
                                <option key={item.id} value={item.title}>
                                  {item.title} [Applications Closed]
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="CSC E-Governance & Citizen Services">
                              {SERVICES_LIST.map((svc) => (
                                <option key={svc.id} value={svc.name}>
                                  {svc.name} ({svc.price})
                                </option>
                              ))}
                            </optgroup>
                            <option value="other">
                              Other / Custom Government Form Request
                            </option>
                          </select>
                          {fieldErrors.selectedService && (
                            <p className="text-xs text-[#DC2626] font-medium">
                              {fieldErrors.selectedService}
                            </p>
                          )}
                        </div>

                        {formData.selectedService === 'other' && (
                          <div className="space-y-1.5">
                            <label
                              htmlFor="custom-service-input"
                              className="block text-xs font-semibold text-[#102A43]"
                            >
                              Specify service or form name{' '}
                              <span className="text-[#DC2626]">*</span>
                            </label>
                            <input
                              ref={customServiceRef}
                              id="custom-service-input"
                              type="text"
                              required
                              placeholder="e.g. Domicile Certificate or Exam Form"
                              value={formData.customServiceText}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  customServiceText: e.target.value
                                }));
                                if (fieldErrors.customServiceText) {
                                  setFieldErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.customServiceText;
                                    return next;
                                  });
                                }
                              }}
                              className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                            />
                            {fieldErrors.customServiceText && (
                              <p className="text-xs text-[#DC2626] font-medium">
                                {fieldErrors.customServiceText}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </section>

                  {/* Applicant Details Fields */}
                  <section
                    aria-labelledby="step-1-heading"
                    className="px-4 py-6 space-y-4"
                  >
                    <h2
                      ref={stepHeadingRef}
                      id="step-1-heading"
                      tabIndex={-1}
                      className="text-lg font-bold text-[#102A43] focus:outline-none"
                    >
                      1. Applicant details
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="applicant-full-name"
                          className="block text-xs sm:text-sm font-semibold text-[#102A43]"
                        >
                          Full name <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                          ref={nameInputRef}
                          id="applicant-full-name"
                          type="text"
                          required
                          autoComplete="name"
                          placeholder="e.g. Wasim Ahmad"
                          value={formData.customerName}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              customerName: e.target.value
                            }));
                            if (fieldErrors.customerName) {
                              setFieldErrors((prev) => {
                                const next = { ...prev };
                                delete next.customerName;
                                return next;
                              });
                            }
                          }}
                          aria-invalid={Boolean(fieldErrors.customerName)}
                          aria-describedby="name-helper-text"
                          className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-lg text-sm text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:ring-2 ${
                            fieldErrors.customerName
                              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                              : 'border-[#CBD5E1] focus:border-[#2563EB] focus:ring-[#2563EB]/20'
                          }`}
                        />
                        {fieldErrors.customerName ? (
                          <p className="text-xs text-[#DC2626] font-medium">
                            {fieldErrors.customerName}
                          </p>
                        ) : (
                          <p id="name-helper-text" className="text-xs text-[#64748B]">
                            As printed on your official ID or marksheet.
                          </p>
                        )}
                      </div>

                      {/* Mobile Number */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="applicant-phone-number"
                          className="block text-xs sm:text-sm font-semibold text-[#102A43]"
                        >
                          Mobile number <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                          ref={phoneInputRef}
                          id="applicant-phone-number"
                          type="tel"
                          inputMode="numeric"
                          required
                          maxLength={10}
                          autoComplete="tel"
                          placeholder="10-digit mobile number"
                          value={formData.phoneNumber}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData((prev) => ({
                              ...prev,
                              phoneNumber: digits
                            }));
                            if (fieldErrors.phoneNumber) {
                              setFieldErrors((prev) => {
                                const next = { ...prev };
                                delete next.phoneNumber;
                                return next;
                              });
                            }
                          }}
                          aria-invalid={Boolean(fieldErrors.phoneNumber)}
                          aria-describedby="phone-helper-text"
                          className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-lg text-sm font-mono text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:ring-2 ${
                            fieldErrors.phoneNumber
                              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                              : 'border-[#CBD5E1] focus:border-[#2563EB] focus:ring-[#2563EB]/20'
                          }`}
                        />
                        {fieldErrors.phoneNumber ? (
                          <p className="text-xs text-[#DC2626] font-medium">
                            {fieldErrors.phoneNumber}
                          </p>
                        ) : (
                          <p id="phone-helper-text" className="text-xs text-[#64748B]">
                            Used for operator verification and status updates.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email Address (Optional) */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="applicant-email"
                          className="block text-xs sm:text-sm font-semibold text-[#102A43]"
                        >
                          Email address{' '}
                          <span className="text-xs font-normal text-[#64748B]">
                            (Optional)
                          </span>
                        </label>
                        <input
                          ref={emailInputRef}
                          id="applicant-email"
                          type="email"
                          autoComplete="email"
                          placeholder="name@example.com"
                          value={formData.emailAddress}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              emailAddress: e.target.value
                            }));
                            if (fieldErrors.emailAddress) {
                              setFieldErrors((prev) => {
                                const next = { ...prev };
                                delete next.emailAddress;
                                return next;
                              });
                            }
                          }}
                          aria-invalid={Boolean(fieldErrors.emailAddress)}
                          className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-lg text-sm text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:ring-2 ${
                            fieldErrors.emailAddress
                              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                              : 'border-[#CBD5E1] focus:border-[#2563EB] focus:ring-[#2563EB]/20'
                          }`}
                        />
                        {fieldErrors.emailAddress && (
                          <p className="text-xs text-[#DC2626] font-medium">
                            {fieldErrors.emailAddress}
                          </p>
                        )}
                      </div>

                      {/* Date of Birth (Optional / Service-Specific) */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="applicant-dob"
                          className="block text-xs sm:text-sm font-semibold text-[#102A43]"
                        >
                          Date of birth{' '}
                          <span className="text-xs font-normal text-[#64748B]">
                            (Optional)
                          </span>
                        </label>
                        <input
                          id="applicant-dob"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              dateOfBirth: e.target.value
                            }))
                          }
                          className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#102A43] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                        />
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="applicant-category"
                        className="block text-xs sm:text-sm font-semibold text-[#102A43]"
                      >
                        Applicant category
                      </label>
                      <select
                        id="applicant-category"
                        value={formData.userCategory}
                        onChange={(e) =>
                          handleCategoryChange(e.target.value as 'genObc' | 'scSt')
                        }
                        className="w-full sm:max-w-xs min-h-[44px] px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#102A43] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
                      >
                        <option value="genObc">General / OM / OBC / RBA</option>
                        <option value="scSt">SC / ST / EWS / PwBD / Female</option>
                      </select>
                      <p className="text-xs text-[#64748B]">
                        Helps determine applicable official fee concessions where relevant.
                      </p>
                    </div>

                    {/* Additional Service-Specific Details */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="applicant-additional-details"
                        className="block text-xs sm:text-sm font-semibold text-[#102A43]"
                      >
                        Service-specific notes or preferences{' '}
                        <span className="text-xs font-normal text-[#64748B]">
                          (Optional)
                        </span>
                      </label>
                      <textarea
                        id="applicant-additional-details"
                        rows={3}
                        placeholder="Mention preferred exam centre, post preference, or specific correction details if applicable..."
                        value={formData.additionalDetails}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            additionalDetails: e.target.value
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                    </div>

                    {/* Step 1 Primary Action */}
                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleContinueFromStep1}
                        id="step-1-continue-btn"
                        disabled={Boolean(currentSarkariStatus && !currentSarkariStatus.canApplyOnline)}
                        className={`w-full sm:w-auto min-h-[44px] px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 ${
                          currentSarkariStatus && !currentSarkariStatus.canApplyOnline
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer'
                        }`}
                      >
                        <span>
                          {currentSarkariStatus && !currentSarkariStatus.canApplyOnline
                            ? 'Applications Closed'
                            : 'Continue to Documents'}
                        </span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 2 — DOCUMENTS                                           */}
              {/* ============================================================ */}
              {currentStep === 2 && (
                <section
                  aria-labelledby="step-2-heading"
                  className="px-4 py-6 space-y-5"
                >
                  <div className="space-y-1">
                    <h2
                      ref={stepHeadingRef}
                      id="step-2-heading"
                      tabIndex={-1}
                      className="text-lg font-bold text-[#102A43] focus:outline-none"
                    >
                      2. Required &amp; supporting documents
                    </h2>
                    <p className="text-xs sm:text-sm text-[#475569]">
                      Attach clear copies for{' '}
                      <strong className="font-semibold text-[#102A43]">
                        {selectedServiceDisplayTitle}
                      </strong>
                      . Files are transmitted only when you submit your request in Step 3.
                    </p>
                  </div>

                  {/* Document Upload Rows */}
                  <div className="divide-y divide-[#E2E8F0] border-t border-b border-[#E2E8F0]">
                    {documentSlots.map((slot) => {
                      const attachedFile = uploadedFiles.find(
                        (f) => f.docTypeId === slot.slotId
                      );
                      const isProcessing = processingSlotId === slot.slotId;
                      const slotErr = slotErrors[slot.slotId];
                      const inputId = `file-upload-${slot.slotId}`;

                      return (
                        <div key={slot.slotId} className="py-4 space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <label
                                  htmlFor={inputId}
                                  className="text-sm font-bold text-[#102A43] cursor-pointer"
                                >
                                  {slot.label}
                                </label>
                                <span
                                  className={`text-xs font-semibold ${
                                    slot.required
                                      ? 'text-[#B91C1C]'
                                      : 'text-[#64748B]'
                                  }`}
                                >
                                  {slot.required ? '(Required)' : '(Optional)'}
                                </span>
                              </div>
                              <p className="text-xs text-[#64748B]">
                                Formats: {slot.allowedFormats} · {slot.maxSizeLabel}
                              </p>
                            </div>

                            {/* Choose or Replace File Control */}
                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                id={inputId}
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                onChange={(e) => handleSlotFileSelect(slot, e)}
                                className="sr-only"
                              />
                              <label
                                htmlFor={inputId}
                                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                  attachedFile
                                    ? 'bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1]'
                                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                                }`}
                              >
                                <Upload className="w-4 h-4" aria-hidden="true" />
                                <span>
                                  {isProcessing
                                    ? 'Reading file...'
                                    : attachedFile
                                    ? 'Replace file'
                                    : 'Choose file'}
                                </span>
                              </label>

                              {attachedFile && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlotFile(slot.slotId)}
                                  className="min-h-[44px] px-3 py-2 bg-white hover:bg-[#FEF2F2] text-[#B91C1C] border border-[#CBD5E1] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                                  aria-label={`Remove ${attachedFile.name}`}
                                >
                                  <X className="w-4 h-4" aria-hidden="true" />
                                  <span>Remove</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Attached File Status */}
                          {attachedFile && (
                            <div className="flex items-center gap-2 text-xs text-[#15803D] font-medium pt-0.5">
                              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                              <span className="truncate font-semibold text-[#102A43]">
                                {attachedFile.name}
                              </span>
                              <span className="text-[#64748B] font-mono shrink-0">
                                ({(attachedFile.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          )}

                          {/* Slot Validation Error */}
                          {slotErr && (
                            <p role="alert" className="text-xs text-[#DC2626] font-medium">
                              {slotErr}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Step 2 Navigation Buttons */}
                  <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() => navigateToStep(1)}
                      className="min-h-[44px] px-5 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1] text-sm font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleContinueFromStep2}
                      disabled={Boolean(processingSlotId)}
                      id="step-2-continue-btn"
                      className="min-h-[44px] px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                      <span>Continue to Review</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </section>
              )}

              {/* ============================================================ */}
              {/* STEP 3 — REVIEW                                              */}
              {/* ============================================================ */}
              {currentStep === 3 && (
                <section
                  aria-labelledby="step-3-heading"
                  className="px-4 py-6 space-y-6"
                >
                  <div className="space-y-1">
                    <h2
                      ref={stepHeadingRef}
                      id="step-3-heading"
                      tabIndex={-1}
                      className="text-lg font-bold text-[#102A43] focus:outline-none"
                    >
                      3. Review your request
                    </h2>
                    <p className="text-xs sm:text-sm text-[#475569]">
                      Verify your details and attached documents before submitting.
                    </p>
                  </div>

                  {/* Review Group 1: Selected Service & Applicant Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#102A43]">
                        Service &amp; applicant details
                      </h3>
                      <button
                        type="button"
                        onClick={() => navigateToStep(1)}
                        className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer py-1 px-2"
                      >
                        Edit details
                      </button>
                    </div>

                    <dl className="divide-y divide-[#E2E8F0] border-t border-b border-[#E2E8F0] text-sm">
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <dt className="text-[#64748B]">Selected service</dt>
                        <dd className="font-semibold text-[#102A43] sm:text-right max-w-md break-words">
                          {selectedServiceDisplayTitle}
                        </dd>
                      </div>

                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <dt className="text-[#64748B]">Full name</dt>
                        <dd className="font-semibold text-[#102A43] sm:text-right">
                          {formData.customerName}
                        </dd>
                      </div>

                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <dt className="text-[#64748B]">Mobile number</dt>
                        <dd className="font-mono font-semibold text-[#102A43] sm:text-right">
                          {formData.phoneNumber}
                        </dd>
                      </div>

                      {formData.emailAddress.trim() && (
                        <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <dt className="text-[#64748B]">Email address</dt>
                          <dd className="text-[#334155] sm:text-right">
                            {formData.emailAddress}
                          </dd>
                        </div>
                      )}

                      {formData.dateOfBirth && (
                        <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <dt className="text-[#64748B]">Date of birth</dt>
                          <dd className="font-mono text-[#334155] sm:text-right">
                            {formData.dateOfBirth}
                          </dd>
                        </div>
                      )}

                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <dt className="text-[#64748B]">Category</dt>
                        <dd className="text-[#334155] sm:text-right">
                          {formData.userCategory === 'genObc'
                            ? 'General / OM / OBC / RBA'
                            : 'SC / ST / EWS / PwBD / Female'}
                        </dd>
                      </div>

                      {formData.additionalDetails.trim() && (
                        <div className="py-2.5 flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                          <dt className="text-[#64748B]">Notes / preferences</dt>
                          <dd className="text-[#334155] sm:text-right max-w-md break-words">
                            {formData.additionalDetails}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Review Group 2: Attached Documents */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#102A43]">
                        Selected documents ({uploadedFiles.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => navigateToStep(2)}
                        className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer py-1 px-2"
                      >
                        Edit documents
                      </button>
                    </div>

                    <ul className="divide-y divide-[#E2E8F0] border-t border-b border-[#E2E8F0] text-sm">
                      {uploadedFiles.map((docFile) => (
                        <li
                          key={docFile.id}
                          className="py-2.5 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-[#102A43] truncate">
                              {docFile.docTypeName || 'Attached document'}
                            </p>
                            <p className="text-xs text-[#64748B] truncate">
                              {docFile.name}
                            </p>
                          </div>
                          <span className="text-xs font-mono text-[#475569] shrink-0">
                            {(docFile.size / 1024).toFixed(1)} KB
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Review Group 3: Select Payment Method & Itemised Summary */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#102A43]">
                        Payment Option
                      </h3>
                      <span className="text-xs text-[#64748B]">
                        Choose how to pay
                      </span>
                    </div>

                    {/* Dual Payment Options Radio Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Option 1: Pay Online via PayU */}
                      <label
                        className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          selectedPaymentMethod === 'online_payu'
                            ? 'border-[#2563EB] bg-[#EFF6FF]'
                            : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="checkoutPaymentMethod"
                            value="online_payu"
                            checked={selectedPaymentMethod === 'online_payu'}
                            onChange={() => setSelectedPaymentMethod('online_payu')}
                            className="mt-1 w-4 h-4 text-[#2563EB] border-[#CBD5E1] focus:ring-[#2563EB]"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#102A43] flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-[#2563EB]" />
                              <span>Pay Online (PayU)</span>
                            </span>
                            <p className="text-[11px] text-[#475569] mt-0.5 leading-relaxed">
                              UPI, Cards, Net Banking &amp; QR via PayU Hosted Gateway. Instant receipt.
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-[#DBEAFE] flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#2563EB]">Instant Confirmation</span>
                          <span className="font-mono font-bold text-[#102A43]">
                            ₹{computedPriceDetails.totalAmount}
                          </span>
                        </div>
                      </label>

                      {/* Option 2: Pay Later / Pay at Centre */}
                      <label
                        className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          selectedPaymentMethod === 'pay_at_centre'
                            ? 'border-[#2563EB] bg-[#EFF6FF]'
                            : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="checkoutPaymentMethod"
                            value="pay_at_centre"
                            checked={selectedPaymentMethod === 'pay_at_centre'}
                            onChange={() => setSelectedPaymentMethod('pay_at_centre')}
                            className="mt-1 w-4 h-4 text-[#2563EB] border-[#CBD5E1] focus:ring-[#2563EB]"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#102A43] flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#16A34A]" />
                              <span>
                                {isPhysicalDeliveryService
                                  ? 'Pay at Centre / Cash on Delivery'
                                  : 'Pay Later at Centre'}
                              </span>
                            </span>
                            <p className="text-[11px] text-[#475569] mt-0.5 leading-relaxed">
                              Submit application now. Pay offline at the counter upon visit or document collection.
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#64748B]">Pay on Counter Visit</span>
                          <span className="text-xs text-[#D97706] font-medium">Unpaid at Filing</span>
                        </div>
                      </label>
                    </div>

                    {/* Itemised Fee Breakdown Box */}
                    <div className="mt-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                        Itemised Price Summary
                      </span>
                      <dl className="divide-y divide-[#E2E8F0] text-xs">
                        <div className="py-1.5 flex items-center justify-between">
                          <dt className="text-[#475569]">Official Department / Portal Fee</dt>
                          <dd className="font-mono font-medium text-[#102A43]">
                            {computedPriceDetails.govtFee > 0 ? `₹${computedPriceDetails.govtFee}` : 'Free / Direct Filing'}
                          </dd>
                        </div>
                        <div className="py-1.5 flex items-center justify-between">
                          <dt className="text-[#475569]">CSC DOST Portal &amp; Assistance Charge</dt>
                          <dd className="font-mono font-medium text-[#102A43]">
                            ₹{computedPriceDetails.cscFee}
                          </dd>
                        </div>
                        <div className="pt-2 flex items-center justify-between text-sm font-bold text-[#102A43]">
                          <dt>Total Amount</dt>
                          <dd className="font-mono text-[#16A34A] text-base">
                            ₹{computedPriceDetails.totalAmount}
                          </dd>
                        </div>
                      </dl>
                      <p className="text-[11px] text-[#64748B] pt-1">
                        CSC DOST service charges are separate from any government statutory fee.
                      </p>
                    </div>
                  </div>

                  {/* Consent & Disclaimer Checkbox */}
                  <div className="pt-1">
                    <label
                      htmlFor="review-consent-checkbox"
                      className="flex items-start gap-3 cursor-pointer select-none"
                    >
                      <input
                        ref={consentCheckboxRef}
                        id="review-consent-checkbox"
                        type="checkbox"
                        checked={reviewConfirmed}
                        onChange={(e) => setReviewConfirmed(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <span className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                        I confirm the above details match my documents and authorise CSC DOST to assist with preparing this application. I understand that a CSC DOST request is separate from official government portal submission or approval.
                      </span>
                    </label>
                  </div>

                  {/* Step 3 Final Submission Actions */}
                  <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => navigateToStep(2)}
                      disabled={isSubmitting || payuInitiating}
                      className="min-h-[44px] px-5 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1] text-sm font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || payuInitiating || Boolean(processingSlotId)}
                      id="submit-application-btn"
                      className="min-h-[44px] px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                    >
                      {isSubmitting || payuInitiating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                          <span>
                            {selectedPaymentMethod === 'online_payu'
                              ? 'Connecting PayU Gateway...'
                              : 'Submitting request...'}
                          </span>
                        </>
                      ) : selectedPaymentMethod === 'online_payu' && computedPriceDetails.totalAmount > 0 ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-300" aria-hidden="true" />
                          <span>Pay Securely via PayU (₹{computedPriceDetails.totalAmount}) →</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          <span>Submit Application (Pay at Centre) →</span>
                        </>
                      )}
                    </button>
                  </div>
                </section>
              )}
            </form>
          </>
        ) : (
          /* ================================================================ */
          /* OPEN CONFIRMATION VIEW (AFTER VERIFIED BACKEND SUBMISSION)       */
          /* ================================================================ */
          <div className="divide-y divide-[#E2E8F0]">
            {/* Heading & Reference Block */}
            <section
              aria-labelledby="confirmation-heading"
              className="px-4 py-6 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h1
                    id="confirmation-heading"
                    className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight"
                  >
                    Request received
                  </h1>
                  <p className="text-sm text-[#475569]">
                    Your application assistance request has been logged with CSC DOST.
                  </p>
                </div>
              </div>

              {/* Open Reference Band */}
              <div className="py-3.5 px-4 bg-[#F8FAFC] border-t border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-[#64748B] block">
                    Application reference
                  </span>
                  <span className="text-lg sm:text-xl font-mono font-extrabold text-[#102A43]">
                    {submissionReceipt?.appId}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyReference(submissionReceipt?.appId || '')}
                  className="self-start sm:self-auto min-h-[38px] px-3 py-1.5 bg-white hover:bg-[#F1F5F9] text-[#102A43] border border-[#CBD5E1] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedToken ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />
                      <span>Copy Reference</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Open Summary Rows */}
            <section
              aria-labelledby="receipt-summary-heading"
              className="px-4 py-6 space-y-3"
            >
              <h2
                id="receipt-summary-heading"
                className="text-base font-bold text-[#102A43]"
              >
                Request details
              </h2>

              <dl className="divide-y divide-[#E2E8F0] border-t border-b border-[#E2E8F0] text-sm">
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <dt className="text-[#64748B]">Selected service</dt>
                  <dd className="font-semibold text-[#102A43] sm:text-right max-w-md break-words">
                    {submissionReceipt?.selectedService}
                  </dd>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <dt className="text-[#64748B]">Applicant name</dt>
                  <dd className="font-semibold text-[#102A43] sm:text-right">
                    {submissionReceipt?.customerName}
                  </dd>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <dt className="text-[#64748B]">Mobile number</dt>
                  <dd className="font-mono text-[#334155] sm:text-right">
                    {submissionReceipt?.phoneNumber}
                  </dd>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <dt className="text-[#64748B]">Submitted on</dt>
                  <dd className="font-mono text-[#334155] sm:text-right">
                    {submissionReceipt?.submittedAt}
                  </dd>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <dt className="text-[#64748B]">Payment method</dt>
                  <dd className="font-medium text-[#102A43] sm:text-right">
                    {submissionReceipt?.paymentMethodLabel || 'Pay Later at CSC Centre'}
                  </dd>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <dt className="text-[#64748B]">Payment status</dt>
                  <dd className="sm:text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      submissionReceipt?.paymentStatus?.toLowerCase().includes('paid')
                        ? 'bg-green-100 text-green-800'
                        : submissionReceipt?.paymentStatus?.toLowerCase().includes('not required')
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {submissionReceipt?.paymentStatus || 'Unpaid (Pay at CSC Centre)'}
                    </span>
                  </dd>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <dt className="text-[#64748B]">Total assistance amount</dt>
                  <dd className="font-mono font-bold text-base text-[#102A43] sm:text-right">
                    {submissionReceipt?.totalAmount && submissionReceipt.totalAmount > 0
                      ? `₹${submissionReceipt.totalAmount}`
                      : 'Free / Direct Filing'}
                  </dd>
                </div>
              </dl>

              {/* Pay Online Now action for offline/unpaid requests */}
              {submissionReceipt?.totalAmount && submissionReceipt.totalAmount > 0 && submissionReceipt.paymentMode === 'pay_at_centre' && (
                <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-blue-950">
                      Want to complete your payment online now?
                    </p>
                    <p className="text-xs text-blue-800 mt-0.5">
                      You selected Pay at Centre (₹{submissionReceipt.totalAmount}), but you can also pay digitally right now via PayU Hosted Checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePayOnlineFromReceipt}
                    disabled={payuInitiating}
                    className="min-h-[40px] px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shrink-0 inline-flex items-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    {payuInitiating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Opening Gateway...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Online via PayU (₹{submissionReceipt.totalAmount})</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Next Steps & Mandatory Disclaimer */}
              <div className="pt-3 space-y-2 text-xs sm:text-sm text-[#475569]">
                <p className="font-semibold text-[#102A43]">What happens next:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    A CSC DOST operator will verify your attached documents and details.
                  </li>
                  <li>
                    {submissionReceipt?.paymentMode === 'pay_at_centre' && submissionReceipt?.totalAmount && submissionReceipt.totalAmount > 0
                      ? `Payment of ₹${submissionReceipt.totalAmount} will be collected at the counter or cash on delivery upon document completion.`
                      : 'Online payment status will be updated immediately upon confirmation from the payment gateway.'}
                  </li>
                  <li>
                    If any OTP or clarification is required during official portal filing, the operator will contact you on your mobile number.
                  </li>
                </ul>
                <p className="pt-2 text-xs text-[#475569] border-t border-[#E2E8F0]">
                  Receipt of this request by CSC DOST is for operator assistance and is separate from official government portal submission or government approval.
                </p>
              </div>
            </section>

            {/* Primary & Secondary Confirmation Actions */}
            <section className="px-4 py-6 space-y-3">
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
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
                  id="confirm-track-btn"
                  className="min-h-[44px] px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" aria-hidden="true" />
                  <span>Track Application</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1] text-sm font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-[#475569]" aria-hidden="true" />
                  <span>Print Acknowledgement</span>
                </button>

                {whatsappStatus?.directWhatsAppUrl && (
                  <a
                    href={whatsappStatus.directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1] text-sm font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
                    <span>Save Reference on WhatsApp</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsFormSubmitted(false);
                    setSubmissionReceipt(null);
                    setCurrentStep(1);
                    pendingSubmissionIdRef.current = null;
                    setFormData((prev) => ({
                      ...prev,
                      customerName: '',
                      phoneNumber: '',
                      emailAddress: '',
                      dateOfBirth: '',
                      additionalDetails: ''
                    }));
                    setUploadedFiles([]);
                  }}
                  className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#2563EB] border border-[#CBD5E1] text-sm font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span>Start Another Request</span>
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
