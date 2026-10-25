import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Printer,
  MessageCircle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Download,
  Phone,
  FileText
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { isDeletedApplicationRecord } from '../lib/supabase';

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
  timestamp?: string;
  status: 'completed' | 'in_progress' | 'pending' | 'action_required' | 'rejected';
}

export interface TrackingData {
  appId: string;
  applicantName?: string;
  maskedPhone?: string;
  serviceName?: string;
  rawStatus: string;
  statusLabel: string;
  statusTone: 'completed' | 'in_progress' | 'pending' | 'action_required' | 'rejected';
  appliedDate?: string;
  lastUpdated?: string;
  userCategory?: string;
  paymentMode?: string;
  paymentStatus?: string;
  totalAmount?: number | string;
  workflowSteps: WorkflowStep[];
  hasExplicitHistory: boolean;
  operatorRemark?: string;
  finalReceiptUrl?: string;
}

interface TrackDedicatedPageViewProps {
  initialToken?: string;
  initialTokenId?: string;
  onBack: () => void;
  onApplyNew?: (serviceName?: string) => void;
  onNavigateApply?: (serviceName?: string) => void;
}

function maskPhoneNumber(phone?: string): string | undefined {
  if (!phone || typeof phone !== 'string') return undefined;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return undefined;
  const last4 = digits.slice(-4);
  return `••••••${last4}`;
}

function maskApplicantName(name?: string): string | undefined {
  if (!name || typeof name !== 'string') return undefined;
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

function formatKnownTimestamp(val?: unknown): string | undefined {
  if (!val) return undefined;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed.toLowerCase() === 'n/a' || trimmed.toLowerCase() === 'pending') {
      return undefined;
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return trimmed;
  }
  return undefined;
}

export function mapApplicationToTrackingData(rawApp: any, fallbackToken: string): TrackingData {
  const rawStatusStr = String(rawApp.status || 'Pending').trim();
  const sLower = rawStatusStr.toLowerCase();

  const isCompleted =
    sLower.includes('complete') ||
    sLower.includes('delivered') ||
    sLower.includes('dispatched');
  const isRejected = sLower.includes('reject') || sLower.includes('cancel');
  const isActionRequired =
    sLower.includes('action') ||
    sLower.includes('clarification') ||
    sLower.includes('hold') ||
    sLower.includes('correction');
  const isProcessing =
    sLower.includes('process') ||
    sLower.includes('approved') ||
    sLower.includes('verified') ||
    sLower.includes('review') ||
    sLower.includes('in_progress');

  let statusLabel = 'Request Received (Pending Review)';
  let statusTone: TrackingData['statusTone'] = 'pending';

  if (isCompleted) {
    statusLabel = 'Completed';
    statusTone = 'completed';
  } else if (isRejected) {
    statusLabel = sLower.includes('cancel') ? 'Cancelled' : 'Rejected';
    statusTone = 'rejected';
  } else if (isActionRequired) {
    statusLabel = 'Action Required';
    statusTone = 'action_required';
  } else if (isProcessing) {
    statusLabel = 'Under Operator Process';
    statusTone = 'in_progress';
  } else if (rawStatusStr) {
    statusLabel = rawStatusStr;
    statusTone = 'pending';
  }

  const submittedDate = formatKnownTimestamp(
    rawApp.submittedAt || rawApp.createdAt || rawApp.created_at || rawApp.date
  );
  const updatedDate = formatKnownTimestamp(
    rawApp.statusUpdatedAt || rawApp.updatedAt || rawApp.updated_at
  );

  // Check if explicit status history array is stored on the record
  const rawHistory = rawApp.statusHistory || rawApp.payload?.statusHistory;
  let workflowSteps: WorkflowStep[] = [];
  let hasExplicitHistory = false;

  if (Array.isArray(rawHistory) && rawHistory.length > 0) {
    hasExplicitHistory = true;
    workflowSteps = rawHistory.map((item: any, index: number) => ({
      stepNumber: index + 1,
      title: String(item.title || item.status || `Stage ${index + 1}`),
      description: String(item.description || item.note || ''),
      timestamp: formatKnownTimestamp(item.timestamp || item.date),
      status: item.state || 'completed'
    }));
  } else {
    // Map actual stored backend status to factual stages without inventing timestamps
    const step1: WorkflowStep = {
      stepNumber: 1,
      title: 'Assistance request received',
      description: 'Application details and supporting documents logged with CSC DOST.',
      timestamp: submittedDate,
      status: 'completed'
    };

    const step2: WorkflowStep = {
      stepNumber: 2,
      title: isRejected
        ? sLower.includes('cancel')
          ? 'Request cancelled'
          : 'Request not approved / rejected'
        : isActionRequired
        ? 'Action required from applicant'
        : 'Operator verification & form preparation',
      description: isRejected
        ? rawApp.vleRemark ||
          rawApp.payload?.vleRemark ||
          'This request could not be processed. Please contact the assistance desk for details.'
        : isActionRequired
        ? rawApp.vleRemark ||
          rawApp.payload?.vleRemark ||
          'Additional clarification or document correction is required before filing.'
        : isCompleted
        ? 'Details reviewed and processed by the CSC operator.'
        : isProcessing
        ? 'Operator is verifying your details and preparing the official form.'
        : 'Queued for operator verification at the CSC assistance desk.',
      timestamp: isProcessing || isRejected || isActionRequired ? updatedDate : undefined,
      status: isRejected
        ? 'rejected'
        : isActionRequired
        ? 'action_required'
        : isCompleted
        ? 'completed'
        : 'in_progress'
    };

    const step3: WorkflowStep = {
      stepNumber: 3,
      title: 'Request completion & acknowledgement',
      description: isCompleted
        ? 'CSC DOST processing completed. Acknowledgement is ready.'
        : 'Final status and acknowledgement will be updated once processing finishes.',
      timestamp: isCompleted ? updatedDate : undefined,
      status: isCompleted ? 'completed' : 'pending'
    };

    workflowSteps = isRejected ? [step1, step2] : [step1, step2, step3];
  }

  const rawPaymentMode = rawApp.paymentMode || rawApp.payment_mode || rawApp.payload?.paymentMode;
  const rawPaymentStatus = rawApp.paymentStatus || rawApp.payload?.paymentStatus;

  let paymentDisplay: string | undefined;
  if (rawPaymentStatus && String(rawPaymentStatus).trim() !== 'N/A') {
    paymentDisplay = String(rawPaymentStatus).trim();
  } else if (rawPaymentMode && String(rawPaymentMode).trim() !== 'N/A') {
    const pmLower = String(rawPaymentMode).toLowerCase();
    if (pmLower === 'cash' || pmLower.includes('desk') || pmLower.includes('completion')) {
      paymentDisplay = 'Pay at CSC Desk upon completion';
    } else {
      paymentDisplay = String(rawPaymentMode);
    }
  }

  const operatorRemark =
    typeof rawApp.vleRemark === 'string'
      ? rawApp.vleRemark
      : typeof rawApp.vleRemark?.remarkText === 'string'
      ? rawApp.vleRemark.remarkText
      : typeof rawApp.payload?.vleRemark === 'string'
      ? rawApp.payload.vleRemark
      : undefined;

  return {
    appId: String(rawApp.appId || rawApp.token_id || rawApp.id || fallbackToken),
    applicantName: maskApplicantName(
      rawApp.customerName || rawApp.full_name || rawApp.applicantName || rawApp.name
    ),
    maskedPhone: maskPhoneNumber(
      rawApp.phoneNumber || rawApp.whatsapp_number || rawApp.phone
    ),
    serviceName: String(
      rawApp.selectedService || rawApp.service_selected || rawApp.service || 'CSC Assistance Request'
    ),
    rawStatus: rawStatusStr,
    statusLabel,
    statusTone,
    appliedDate: submittedDate,
    lastUpdated: updatedDate && updatedDate !== submittedDate ? updatedDate : undefined,
    userCategory:
      rawApp.userCategory || rawApp.user_category || rawApp.payload?.userCategory || undefined,
    paymentMode: rawPaymentMode ? String(rawPaymentMode) : undefined,
    paymentStatus: paymentDisplay,
    totalAmount:
      rawApp.totalAmount !== undefined && Number(rawApp.totalAmount) > 0
        ? Number(rawApp.totalAmount)
        : undefined,
    workflowSteps,
    hasExplicitHistory,
    operatorRemark,
    finalReceiptUrl:
      rawApp.finalReceiptUrl || rawApp.payload?.finalReceiptUrl || undefined
  };
}

export default function TrackDedicatedPageView({
  initialToken = '',
  initialTokenId = '',
  onBack,
  onApplyNew,
  onNavigateApply
}: TrackDedicatedPageViewProps) {
  const resolvedInitial = (initialToken || initialTokenId || '').trim();
  const [searchInput, setSearchInput] = useState(resolvedInitial);
  const [activeToken, setActiveToken] = useState(resolvedInitial);
  const [liveData, setLiveData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(resolvedInitial));
  const [notFound, setNotFound] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentTokens, setRecentTokens] = useState<string[]>([]);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleStartNewRequest = (serviceName?: string) => {
    const fn = onApplyNew || onNavigateApply;
    if (fn) {
      fn(serviceName);
    } else {
      window.location.hash = serviceName
        ? `#apply?service=${encodeURIComponent(serviceName)}`
        : '#apply';
    }
  };

  // Load recent tokens from current browser session's local applications list
  useEffect(() => {
    try {
      const tokensSet = new Set<string>();
      const localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      if (Array.isArray(localApps)) {
        localApps.forEach((a: any) => {
          if (isDeletedApplicationRecord(a)) return;
          const t = a.appId || a.id;
          if (t && typeof t === 'string' && !t.includes('PENDING')) {
            tokensSet.add(t.trim());
          }
        });
      }
      setRecentTokens(Array.from(tokensSet).slice(0, 4));
    } catch {
      setRecentTokens([]);
    }
  }, []);

  // Sync initial token prop if updated externally
  useEffect(() => {
    const nextTok = (initialToken || initialTokenId || '').trim();
    if (nextTok) {
      setSearchInput(nextTok);
      setActiveToken(nextTok);
    }
  }, [initialToken, initialTokenId]);

  // Authorised single-application lookup by Application ID
  useEffect(() => {
    const cleanToken = activeToken.trim();
    if (!cleanToken) {
      setLiveData(null);
      setNotFound(false);
      setErrorMessage(null);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    let unsubFirestore: (() => void) | null = null;

    // Clear previous results immediately when starting a new lookup
    setLoading(true);
    setNotFound(false);
    setErrorMessage(null);
    setLiveData(null);

    const checkFirestoreOrLocalFallback = async (serverReturned404: boolean) => {
      try {
        const appDocRef = doc(db, 'applications', cleanToken);
        const snap = await getDoc(appDocRef);
        if (isCancelled) return;

        if (snap.exists() && !isDeletedApplicationRecord(snap.data())) {
          setLiveData(mapApplicationToTrackingData(snap.data(), cleanToken));
          setNotFound(false);
          setErrorMessage(null);
          setLoading(false);

          unsubFirestore = onSnapshot(
            appDocRef,
            (liveSnap) => {
              if (!isCancelled && liveSnap.exists() && !isDeletedApplicationRecord(liveSnap.data())) {
                setLiveData(mapApplicationToTrackingData(liveSnap.data(), cleanToken));
              }
            },
            () => {}
          );
          return;
        }

        const aptDocRef = doc(db, 'appointments', cleanToken);
        const aptSnap = await getDoc(aptDocRef);
        if (isCancelled) return;

        if (aptSnap.exists() && !isDeletedApplicationRecord(aptSnap.data())) {
          setLiveData(mapApplicationToTrackingData(aptSnap.data(), cleanToken));
          setNotFound(false);
          setErrorMessage(null);
          setLoading(false);
          return;
        }
      } catch {
        // Firestore unavailable or blocked; continue to local check
      }

      if (isCancelled) return;

      // Only check current browser's own submitted applications if server was unreachable (not on authoritative 404)
      if (!serverReturned404) {
        try {
          const localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
          const matchLocal = Array.isArray(localApps)
            ? localApps.find(
                (a: any) =>
                  !isDeletedApplicationRecord(a) &&
                  ((a.appId && String(a.appId).toLowerCase() === cleanToken.toLowerCase()) ||
                    (a.id && String(a.id).toLowerCase() === cleanToken.toLowerCase()))
              )
            : null;

          if (matchLocal) {
            setLiveData(mapApplicationToTrackingData(matchLocal, cleanToken));
            setNotFound(false);
            setErrorMessage(null);
            setLoading(false);
            return;
          }
        } catch {}
      }

      if (serverReturned404) {
        setLiveData(null);
        setNotFound(true);
        setErrorMessage(null);
        setLoading(false);
      } else {
        setLiveData(null);
        setNotFound(false);
        setErrorMessage(
          'Unable to reach the tracking service right now. Please check your internet connection and try again.'
        );
        setLoading(false);
      }
    };

    fetch(`/api/appointments/${encodeURIComponent(cleanToken)}`)
      .then(async (res) => {
        if (isCancelled) return;

        if (res.status === 404) {
          await checkFirestoreOrLocalFallback(true);
          return;
        }

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const apiData = await res.json();
        if (isCancelled) return;

        if (apiData && !isDeletedApplicationRecord(apiData) && (apiData.appId || apiData.id)) {
          setLiveData(mapApplicationToTrackingData(apiData, cleanToken));
          setNotFound(false);
          setErrorMessage(null);
          setLoading(false);
        } else {
          await checkFirestoreOrLocalFallback(true);
        }
      })
      .catch(async () => {
        if (isCancelled) return;
        await checkFirestoreOrLocalFallback(false);
      });

    return () => {
      isCancelled = true;
      if (unsubFirestore) unsubFirestore();
    };
  }, [activeToken, retryCount]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) {
      searchInputRef.current?.focus();
      return;
    }
    if (trimmed === activeToken) {
      setRetryCount((c) => c + 1);
    } else {
      setActiveToken(trimmed);
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveToken('');
    setLiveData(null);
    setNotFound(false);
    setErrorMessage(null);
    searchInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-white text-[#102A43] font-sans w-full overflow-x-hidden">
      {/* Compact Top Bar with existing CSC DOST logo and Back to Portal */}
      <header className="w-full bg-white border-b border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
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

          <button
            type="button"
            onClick={onBack}
            id="track-back-btn"
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <ArrowLeft className="w-4 h-4 text-[#475569]" aria-hidden="true" />
            <span>Back to Portal</span>
          </button>
        </div>
      </header>

      {/* Main Content Area — Full-width open sections on mobile, comfortable centered width on desktop */}
      <div className="max-w-3xl mx-auto">
        {/* Page Heading & Search Section */}
        <section
          aria-labelledby="track-page-heading"
          className="px-4 py-6 border-b border-[#E2E8F0] space-y-4"
        >
          <div className="space-y-1.5">
            <h1
              id="track-page-heading"
              className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight"
            >
              Track your application
            </h1>
            <p className="text-sm text-[#475569]">
              Follow your CSC DOST assistance request.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-2" noValidate>
            <label
              htmlFor="track-app-id-input"
              className="block text-xs sm:text-sm font-semibold text-[#102A43]"
            >
              Application ID (Reference Token)
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  id="track-app-id-input"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g. CSC21251567001"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full min-h-[44px] pl-10 pr-9 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm font-medium text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-colors font-mono"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Clear Application ID"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#102A43] rounded cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                id="track-submit-btn"
                className="min-h-[44px] px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                <span>Track Status</span>
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Enter the reference ID shown on your CSC DOST acknowledgement slip.
            </p>
          </form>

          {/* Recent Session References (if present on this device) */}
          {recentTokens.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-[#64748B] mr-1">
                Recent on this device:
              </span>
              {recentTokens.map((tok) => {
                const isSelected = activeToken.toLowerCase() === tok.toLowerCase();
                return (
                  <button
                    key={tok}
                    type="button"
                    onClick={() => {
                      setSearchInput(tok);
                      setActiveToken(tok);
                    }}
                    className={`min-h-[36px] px-2.5 py-1 rounded-md text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#102A43] border-[#E2E8F0]'
                    }`}
                  >
                    {tok}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Status / Result Section */}
        <div aria-live="polite">
          {/* 1. INITIAL STATE */}
          {!activeToken && !loading && !errorMessage && (
            <section className="px-4 py-6 border-b border-[#E2E8F0] space-y-3">
              <h2 className="text-base font-bold text-[#102A43]">
                How to check your status
              </h2>
              <ul className="space-y-2 text-sm text-[#334155] list-disc list-inside">
                <li>
                  Locate your Application ID (starts with <span className="font-mono font-semibold text-[#102A43]">CSC</span>) from your confirmation screen or printed slip.
                </li>
                <li>
                  Enter the full ID above and select <strong className="font-semibold text-[#102A43]">Track Status</strong>.
                </li>
              </ul>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStartNewRequest()}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#102A43] border border-[#CBD5E1] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  <span>Start a new request</span>
                  <ArrowRight className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                </button>
              </div>
            </section>
          )}

          {/* 2. LOADING STATE */}
          {loading && (
            <section
              role="status"
              className="px-4 py-6 border-b border-[#E2E8F0] flex items-center gap-3 text-sm text-[#334155]"
            >
              <RefreshCw className="w-5 h-5 text-[#2563EB] animate-spin shrink-0" aria-hidden="true" />
              <span>
                Checking status for <strong className="font-mono text-[#102A43]">{activeToken}</strong>...
              </span>
            </section>
          )}

          {/* 3. ERROR STATE (Distinct from Not Found) */}
          {!loading && errorMessage && (
            <section
              role="alert"
              className="px-4 py-6 border-b border-[#E2E8F0] space-y-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-[#102A43]">
                    Unable to load application status
                  </h2>
                  <p className="text-sm text-[#475569]">{errorMessage}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setRetryCount((c) => c + 1)}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  <span>Retry</span>
                </button>

                <a
                  href="tel:+917006833767"
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1] text-xs sm:text-sm font-semibold rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#475569]" aria-hidden="true" />
                  <span>Call Desk (+91 70068 33767)</span>
                </a>
              </div>
            </section>
          )}

          {/* 4. NOT FOUND STATE */}
          {!loading && !errorMessage && notFound && (
            <section
              role="region"
              aria-labelledby="not-found-heading"
              className="px-4 py-6 border-b border-[#E2E8F0] space-y-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1.5">
                  <h2 id="not-found-heading" className="text-base font-bold text-[#102A43]">
                    No application found for “{activeToken}”
                  </h2>
                  <p className="text-sm text-[#475569]">
                    Please check that the Application ID matches your acknowledgement slip (for example, <span className="font-mono font-semibold text-[#102A43]">CSC21251567001</span>) without extra spaces.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => searchInputRef.current?.focus()}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <span>Check ID &amp; Try Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartNewRequest()}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <span>Start a new request</span>
                  <ArrowRight className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                </button>

                <a
                  href={`https://api.whatsapp.com/send?phone=917006833767&text=${encodeURIComponent(
                    `Hello CSC DOST Desk, I need help locating my Application ID (${activeToken}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1] text-xs sm:text-sm font-semibold rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
                  <span>Get help from operator</span>
                </a>
              </div>
            </section>
          )}

          {/* 5. FOUND STATE */}
          {!loading && !errorMessage && !notFound && liveData && (
            <div className="divide-y divide-[#E2E8F0]">
              {/* Application Summary Section (Open Labelled Rows) */}
              <section
                aria-labelledby="summary-heading"
                className="px-4 py-6 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 id="summary-heading" className="text-lg font-bold text-[#102A43]">
                    Application summary
                  </h2>
                  <span
                    className={`text-xs font-bold ${
                      liveData.statusTone === 'completed'
                        ? 'text-[#15803D]'
                        : liveData.statusTone === 'rejected'
                        ? 'text-[#B91C1C]'
                        : liveData.statusTone === 'action_required'
                        ? 'text-[#B45309]'
                        : 'text-[#2563EB]'
                    }`}
                  >
                    {liveData.statusLabel}
                  </span>
                </div>

                <dl className="divide-y divide-[#E2E8F0] border-t border-b border-[#E2E8F0] text-sm">
                  {/* Application Reference */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <dt className="text-[#64748B] font-medium">Application reference</dt>
                    <dd className="font-mono font-bold text-[#102A43] flex items-center gap-2">
                      <span>{liveData.appId}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyToken(liveData.appId)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-sans font-semibold text-[#2563EB] hover:bg-[#F8FAFC] rounded border border-[#E2E8F0] cursor-pointer"
                        title="Copy Application Reference"
                      >
                        {copiedToken ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#16A34A]" aria-hidden="true" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </dd>
                  </div>

                  {/* Requested Service */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <dt className="text-[#64748B] font-medium">Requested service</dt>
                    <dd className="font-semibold text-[#102A43] sm:text-right break-words max-w-md">
                      {liveData.serviceName}
                    </dd>
                  </div>

                  {/* Current Status */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <dt className="text-[#64748B] font-medium">Current status</dt>
                    <dd className="font-semibold text-[#102A43] sm:text-right">
                      {liveData.statusLabel}
                    </dd>
                  </div>

                  {/* Applicant (if available) */}
                  {liveData.applicantName && (
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <dt className="text-[#64748B] font-medium">Applicant</dt>
                      <dd className="font-medium text-[#102A43] sm:text-right">
                        {liveData.applicantName}
                        {liveData.maskedPhone ? (
                          <span className="text-[#64748B] font-mono text-xs ml-2">
                            ({liveData.maskedPhone})
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  )}

                  {/* Submission Date (only if recorded) */}
                  {liveData.appliedDate && (
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <dt className="text-[#64748B] font-medium">Submission date</dt>
                      <dd className="font-mono text-[#334155] sm:text-right">
                        {liveData.appliedDate}
                      </dd>
                    </div>
                  )}

                  {/* Last Update (only if recorded) */}
                  {liveData.lastUpdated && (
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <dt className="text-[#64748B] font-medium">Last update</dt>
                      <dd className="font-mono text-[#334155] sm:text-right">
                        {liveData.lastUpdated}
                      </dd>
                    </div>
                  )}

                  {/* Payment Status (only where supported/recorded) */}
                  {liveData.paymentStatus && (
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <dt className="text-[#64748B] font-medium">Payment status</dt>
                      <dd className="text-[#334155] font-medium sm:text-right">
                        {liveData.paymentStatus}
                        {liveData.totalAmount ? ` (₹${liveData.totalAmount})` : ''}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* Vertical Progress Timeline */}
              <section
                aria-labelledby="timeline-heading"
                className="px-4 py-6 space-y-4"
              >
                <h2 id="timeline-heading" className="text-lg font-bold text-[#102A43]">
                  Status timeline
                </h2>

                <ol className="relative space-y-5">
                  {liveData.workflowSteps.map((step, idx) => {
                    const isLast = idx === liveData.workflowSteps.length - 1;
                    const isDone = step.status === 'completed';
                    const isCurrent = step.status === 'in_progress';
                    const isAction = step.status === 'action_required';
                    const isRej = step.status === 'rejected';

                    let stateLabel = 'Pending';
                    if (isDone) stateLabel = 'Completed';
                    else if (isCurrent) stateLabel = 'Current stage';
                    else if (isAction) stateLabel = 'Action required';
                    else if (isRej) stateLabel = 'Stopped';

                    return (
                      <li key={step.stepNumber} className="relative flex items-start gap-3.5">
                        {!isLast && (
                          <div
                            aria-hidden="true"
                            className={`absolute left-3.5 top-7 -bottom-5 w-px ${
                              isDone ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'
                            }`}
                          />
                        )}

                        <div className="relative z-10 shrink-0 mt-0.5">
                          {isDone ? (
                            <div className="w-7 h-7 rounded-full bg-[#16A34A] text-white flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            </div>
                          ) : isRej ? (
                            <div className="w-7 h-7 rounded-full bg-[#DC2626] text-white flex items-center justify-center">
                              <XCircle className="w-4 h-4" aria-hidden="true" />
                            </div>
                          ) : isAction ? (
                            <div className="w-7 h-7 rounded-full bg-[#D97706] text-white flex items-center justify-center">
                              <AlertCircle className="w-4 h-4" aria-hidden="true" />
                            </div>
                          ) : isCurrent ? (
                            <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                              <Clock className="w-4 h-4" aria-hidden="true" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] text-[#64748B] flex items-center justify-center text-xs font-bold">
                              {step.stepNumber}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="text-sm font-bold text-[#102A43]">
                              {step.title}
                            </h3>
                            <span
                              className={`text-xs font-semibold ${
                                isDone
                                  ? 'text-[#15803D]'
                                  : isRej
                                  ? 'text-[#B91C1C]'
                                  : isAction
                                  ? 'text-[#B45309]'
                                  : isCurrent
                                  ? 'text-[#2563EB]'
                                  : 'text-[#64748B]'
                              }`}
                            >
                              {stateLabel}
                              {step.timestamp ? ` · ${step.timestamp}` : ''}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {/* Operator Note if specifically recorded */}
                {liveData.operatorRemark && (
                  <div className="pt-3 border-t border-[#E2E8F0] space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                      Desk Note
                    </h3>
                    <p className="text-sm text-[#102A43] leading-relaxed">
                      {liveData.operatorRemark}
                    </p>
                  </div>
                )}

                {/* Mandatory Disclaimer */}
                <p className="text-xs text-[#475569] pt-3 border-t border-[#E2E8F0] leading-relaxed">
                  A CSC DOST request is not confirmation of submission to a government portal.
                </p>
              </section>

              {/* Secondary Actions Section */}
              <section
                aria-label="Tracking actions"
                className="px-4 py-6 space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  {liveData.finalReceiptUrl && (
                    <a
                      href={liveData.finalReceiptUrl}
                      download={`Acknowledgement-${liveData.appId}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" aria-hidden="true" />
                      <span>Download Processed Receipt</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#475569]" aria-hidden="true" />
                    <span>Print Status Summary</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?phone=917006833767&text=${encodeURIComponent(
                      `Hello CSC DOST Operator, I am inquiring about my Application Reference: ${liveData.appId} (${liveData.serviceName}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#102A43] border border-[#CBD5E1] text-xs sm:text-sm font-semibold rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
                    <span>Get help (Operator WhatsApp)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleStartNewRequest()}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#2563EB] border border-[#CBD5E1] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" aria-hidden="true" />
                    <span>Start a new request</span>
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
