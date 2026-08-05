import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  X,
  MessageCircle,
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'pending' | 'rejected';
}

export interface VleRemarkData {
  nodeId?: string;
  remarkText?: string;
  vleName?: string;
  vlePhone?: string;
}

export interface TrackingData {
  appId: string;
  deskId?: string;
  statusTitle?: string;
  statusCategory?: string;
  appliedDate?: string;
  currentStep?: number;
  totalSteps?: number;
  applicantName?: string;
  serviceName?: string;
  feeAmount?: string;
  whatsappNumber?: string;
  workflowSteps?: WorkflowStep[];
  vleRemark?: VleRemarkData;
  finalReceiptUrl?: string;
  status?: string;
}

interface TrackApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTokenId?: string;
}

export default function TrackApplicationModal({
  isOpen,
  onClose,
  initialTokenId = ''
}: TrackApplicationModalProps) {
  const [searchInput, setSearchInput] = useState(initialTokenId || '');
  const [activeToken, setActiveToken] = useState(initialTokenId || '');
  const [liveData, setLiveData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [recentTokens, setRecentTokens] = useState<string[]>([]);

  // Load user's recent tokens from localStorage (ONLY paid applications with valid Token IDs)
  useEffect(() => {
    if (!isOpen) return;
    try {
      const tokensSet = new Set<string>();
      const localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      if (Array.isArray(localApps)) {
        localApps.forEach((a: any) => {
          const isPaid = a.isPaid === true ||
                         a.paymentMode === 'razorpay' || 
                         a.paymentMode === 'online' || 
                         a.paymentMode === 'Razorpay Online' ||
                         a.paymentMode === 'Razorpay Online (razorpay.me)' ||
                         (a.paymentStatus && a.paymentStatus.toLowerCase().includes('paid')) ||
                         (a.status && a.status.toLowerCase().includes('paid'));
          const t = a.appId || a.id;
          if (t && isPaid && !String(t).includes('PENDING') && String(t) !== 'CSC-2026-1') {
            tokensSet.add(String(t));
          }
        });
      }
      const web3Apps = JSON.parse(localStorage.getItem('csc_web3forms_submissions') || '[]');
      if (Array.isArray(web3Apps)) {
        web3Apps.forEach((a: any) => {
          const isPaid = a.isPaid === true ||
                         a.paymentMode === 'razorpay' || 
                         a.paymentMode === 'online' || 
                         a.paymentMode === 'Razorpay Online' ||
                         (a.paymentStatus && a.paymentStatus.toLowerCase().includes('paid'));
          const t = a.appId || a.id;
          if (t && isPaid && !String(t).includes('PENDING')) {
            tokensSet.add(String(t));
          }
        });
      }
      setRecentTokens(Array.from(tokensSet).slice(0, 5));
    } catch {
      setRecentTokens([]);
    }
  }, [isOpen]);

  // Sync token if prop changes or when modal opens
  useEffect(() => {
    if (isOpen) {
      const tok = initialTokenId ? initialTokenId.trim() : '';
      setSearchInput(tok);
      setActiveToken(tok);
      if (!tok) {
        setLiveData(null);
        setNotFound(false);
        setLoading(false);
      }
    }
  }, [isOpen, initialTokenId]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch real-time application data from Firestore / LocalStorage / Server API
  useEffect(() => {
    if (!isOpen || !activeToken || !activeToken.trim()) {
      setLiveData(null);
      setNotFound(false);
      setLoading(false);
      return;
    }

    const cleanToken = activeToken.trim();
    setLoading(true);
    setNotFound(false);
    setLiveData(null);

    let unsubApp: (() => void) | null = null;

    const buildTrackingObject = (raw: any): TrackingData => {
      const rawStatus = (raw.status || '').toLowerCase();
      const isCompleted = rawStatus.includes('completed');
      const isApproved = rawStatus.includes('approved') || rawStatus.includes('process');
      const isRejected = rawStatus.includes('reject');

      let statusTitle = 'Application Under Staff Review';
      let currentStep = 2;

      if (isCompleted) {
        statusTitle = 'Completed & Receipt Ready for Download';
        currentStep = 4;
      } else if (isApproved) {
        statusTitle = 'Approved & Under Department Process';
        currentStep = 3;
      } else if (isRejected) {
        statusTitle = 'Application Rejected / Action Required';
        currentStep = 2;
      }

      const formattedDate = raw.createdAt
        ? new Date(raw.createdAt).toLocaleDateString('en-IN')
        : raw.submittedAt
        ? new Date(raw.submittedAt).toLocaleDateString('en-IN')
        : 'Recent';

      const formattedTime = raw.createdAt
        ? new Date(raw.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Recently';

      return {
        appId: raw.appId || raw.id || cleanToken,
        deskId: raw.deskId || '21251670018',
        statusTitle,
        statusCategory: raw.userCategory || raw.category || raw.selectedService || 'CSC Government Service',
        appliedDate: formattedDate,
        currentStep,
        totalSteps: 4,
        applicantName: raw.customerName || raw.name || 'Applicant',
        serviceName: raw.selectedService || raw.service || 'CSC Government Service',
        feeAmount: `₹${raw.totalAmount || raw.portalFee || 70} (${raw.paymentMode === 'cash' ? 'Pay Cash at Counter' : 'Online Payment'})`,
        whatsappNumber: raw.phoneNumber || raw.phone || '+91 7006833767',
        workflowSteps: [
          {
            stepNumber: 1,
            title: 'Application Received & Queued',
            description: 'Application submitted with required documents at CSC Desk',
            timestamp: formattedTime,
            status: 'completed'
          },
          {
            stepNumber: 2,
            title: 'Document Scrutiny & Verification',
            description: isRejected ? 'Verification rejected by staff' : 'VLE desk verified attached documents & identity details',
            timestamp: 'Updated',
            status: isCompleted || isApproved ? 'completed' : isRejected ? 'rejected' : 'in_progress'
          },
          {
            stepNumber: 3,
            title: 'Official Department Filing',
            description: 'Submitted to official state/central government portal',
            timestamp: 'Updated',
            status: isCompleted ? 'completed' : isApproved ? 'in_progress' : 'pending'
          },
          {
            stepNumber: 4,
            title: 'Final Certificate / Receipt Generated',
            description: isCompleted ? 'E-Document issued and ready for download' : 'Awaiting final portal completion',
            timestamp: 'Updated',
            status: isCompleted ? 'completed' : 'pending'
          }
        ],
        vleRemark: {
          nodeId: '21251670018',
          remarkText: raw.vleRemark || (isCompleted ? 'Application completed successfully. Final processed receipt and e-document uploaded.' : `Application status is currently ${raw.status || 'Pending'}. CSC Desk #21251670018 active.`),
          vleName: 'Wasim',
          vlePhone: '+917006833767'
        },
        finalReceiptUrl: raw.finalReceiptUrl,
        status: raw.status || 'Pending'
      };
    };

    try {
      // 1. Subscribe to Firestore real-time doc in 'applications' collection
      unsubApp = onSnapshot(
        doc(db, 'applications', cleanToken),
        (docSnap) => {
          if (docSnap.exists()) {
            setLiveData(buildTrackingObject(docSnap.data()));
            setNotFound(false);
            setLoading(false);
          } else {
            // Check 'appointments' collection fallback in Firestore
            getDoc(doc(db, 'appointments', cleanToken)).then((aptSnap) => {
              if (aptSnap.exists()) {
                setLiveData(buildTrackingObject(aptSnap.data()));
                setNotFound(false);
                setLoading(false);
              } else {
                // Check LocalStorage fallback
                checkLocalAndServerFallback(cleanToken, buildTrackingObject);
              }
            }).catch(() => {
              checkLocalAndServerFallback(cleanToken, buildTrackingObject);
            });
          }
        },
        (err) => {
          console.warn('Firestore snapshot error, checking fallback:', err);
          checkLocalAndServerFallback(cleanToken, buildTrackingObject);
        }
      );
    } catch {
      checkLocalAndServerFallback(cleanToken, buildTrackingObject);
    }

    return () => {
      if (unsubApp) unsubApp();
    };
  }, [activeToken, isOpen]);

  const checkLocalAndServerFallback = (cleanToken: string, buildTrackingObject: (raw: any) => TrackingData) => {
    const normClean = cleanToken.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    try {
      const localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      const web3Apps = JSON.parse(localStorage.getItem('csc_web3forms_submissions') || '[]');
      const combined = [...localApps, ...web3Apps];
      
      const found = combined.find((a: any) => {
        const id = (a.appId || a.id || '').toString();
        const normId = id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const utr = (a.utrNumber || '').toString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return normId === normClean || (utr && utr === normClean);
      });

      if (found) {
        setLiveData(buildTrackingObject(found));
        setNotFound(false);
        setLoading(false);
        return;
      }

      // Secondary server endpoint fetch
      fetch(`/api/appointments/${encodeURIComponent(cleanToken)}`)
        .then(async (res) => {
          if (!res.ok) return null;
          const txt = await res.text();
          return txt ? JSON.parse(txt) : null;
        })
        .then((data) => {
          if (data && (data.appId || data.id || data.customerName || data.name)) {
            setLiveData(buildTrackingObject(data));
            setNotFound(false);
            setLoading(false);
          } else {
            // Check full list fallback from /api/appointments
            fetch('/api/appointments')
              .then(res => res.json())
              .then(resData => {
                const list = resData?.data || resData || [];
                if (Array.isArray(list)) {
                  const match = list.find((item: any) => {
                    const idStr = (item.appId || item.id || item.token || '').toString();
                    const normId = idStr.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    const utrStr = (item.utrNumber || '').toString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    return normId === normClean || (utrStr && utrStr === normClean);
                  });
                  if (match) {
                    setLiveData(buildTrackingObject(match));
                    setNotFound(false);
                    setLoading(false);
                    return;
                  }
                }
                setLiveData(null);
                setNotFound(true);
                setLoading(false);
              })
              .catch(() => {
                setLiveData(null);
                setNotFound(true);
                setLoading(false);
              });
          }
        })
        .catch(() => {
          setLiveData(null);
          setNotFound(true);
          setLoading(false);
        });
    } catch {
      setLiveData(null);
      setNotFound(true);
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setActiveToken(searchInput.trim());
  };

  const handleSelectRecentToken = (tok: string) => {
    setSearchInput(tok);
    setActiveToken(tok);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Card Box */}
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. TOP HEADER SECTION */}
        <div className="bg-[#0d1527] text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider font-display text-white">
                  CSC APPLICATION LIVE TRACKER
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live Sync</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Verify real-time filing status with CSC Desk #21251670018
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            title="Close Tracker"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* SCROLLABLE MODAL BODY */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-slate-900 dark:text-slate-100">
          {/* 2. SEARCH BAR & RECENT TOKENS */}
          <div className="space-y-2.5">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter Token ID (e.g. CSC21251567001)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-amber-400 transition-all placeholder-slate-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !searchInput.trim()}
                className="px-6 py-2.5 bg-[#161a38] dark:bg-slate-800 hover:bg-[#0f1228] dark:hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm shrink-0 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>SEARCH</span>}
              </button>
            </form>

            {/* User Submitted Recent Tokens Pills */}
            {recentTokens.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold pt-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Your Recent Tokens:</span>
                {recentTokens.map((tok) => {
                  const isActive = tok.toLowerCase() === activeToken.toLowerCase();
                  return (
                    <button
                      key={tok}
                      type="button"
                      onClick={() => handleSelectRecentToken(tok)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-extrabold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1e1b4b] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {tok}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* INITIAL PROMPT (When no search token entered yet) */}
          {!activeToken && !loading && (
            <div className="p-8 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                <FileCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Enter Your Application Token ID
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Please enter the Token Reference Number (e.g. <span className="font-mono font-bold text-amber-600 dark:text-amber-400">CSC21251567001</span>) from your submission receipt to fetch live status, staff verification details, and download official receipts.
                </p>
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <Loader2 className="w-7 h-7 animate-spin text-amber-500 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Fetching live application details for <span className="font-mono text-amber-600 dark:text-amber-400">{activeToken}</span>...
              </p>
            </div>
          )}

          {/* NOT FOUND STATE */}
          {notFound && !loading && (
            <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-center space-y-2">
              <XCircle className="w-8 h-8 text-red-500 mx-auto" />
              <h4 className="text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-300">
                Application Record Not Found
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-md mx-auto">
                No application matches Token ID <strong className="font-mono text-slate-900 dark:text-white underline">{activeToken}</strong>. Please check the reference number on your slip or contact Helpdesk (+91 70068 33767).
              </p>
            </div>
          )}

          {/* MAIN LIVE TRACKING CONTENT */}
          {!loading && !notFound && liveData && (
            <>
              {/* STATUS BANNER */}
              <div className={`border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${
                liveData.status?.toLowerCase().includes('completed')
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80'
                  : liveData.status?.toLowerCase().includes('reject')
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/80'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80'
              }`}>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      TOKEN STATUS
                    </span>
                    <span className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-full font-mono text-[11px] font-extrabold shadow-2xs">
                      {liveData.appId}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black font-display leading-snug text-slate-900 dark:text-white">
                    {liveData.statusTitle}
                  </h3>

                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Applied on <span className="font-mono font-bold">{liveData.appliedDate}</span> | Service: <span className="font-bold">{liveData.serviceName}</span>
                  </p>
                </div>

                <div className="shrink-0 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3.5 py-1.5 rounded-xl text-center shadow-2xs">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Step {liveData.currentStep} / {liveData.totalSteps}
                  </span>
                </div>
              </div>

              {/* DOWNLOAD RECEIPT BANNER IF COMPLETED OR FILE PRESENT */}
              {(liveData.finalReceiptUrl || liveData.status?.toLowerCase().includes('completed')) && (
                <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl shrink-0">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        Official Application Receipt Ready
                      </h4>
                      <p className="text-[11px] text-emerald-100 font-medium">
                        The staff member has uploaded your final processed receipt document.
                      </p>
                    </div>
                  </div>

                  {liveData.finalReceiptUrl ? (
                    <a
                      href={liveData.finalReceiptUrl}
                      download={`Receipt-${liveData.appId}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Download Receipt</span>
                    </a>
                  ) : (
                    <span className="text-xs italic font-semibold text-emerald-100">
                      Available at counter
                    </span>
                  )}
                </div>
              )}

              {/* 4-GRID APPLICANT DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    APPLICANT
                  </span>
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate" title={liveData.applicantName}>
                    {liveData.applicantName}
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    SERVICE / JOB
                  </span>
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate" title={liveData.serviceName}>
                    {liveData.serviceName}
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    FEE AMOUNT
                  </span>
                  <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 truncate">
                    {liveData.feeAmount}
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    WHATSAPP NUMBER
                  </span>
                  <p className="text-xs font-black font-mono text-slate-900 dark:text-white truncate">
                    {liveData.whatsappNumber}
                  </p>
                </div>
              </div>

              {/* WORKFLOW TIMELINE */}
              <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 font-display">
                  APPLICATION FILING WORKFLOW TIMELINE
                </h4>

                <div className="relative pl-2 sm:pl-3 space-y-5">
                  {liveData.workflowSteps?.map((step, idx) => {
                    const isLast = idx === (liveData.workflowSteps?.length || 0) - 1;
                    const isCompleted = step.status === 'completed';
                    const isInProgress = step.status === 'in_progress';
                    const isRejected = step.status === 'rejected';

                    return (
                      <div key={idx} className="relative flex items-start gap-3 sm:gap-4 group">
                        {!isLast && (
                          <div
                            className={`absolute left-3.5 sm:left-4 top-7 bottom-0 w-0.5 -ml-px ${
                              isCompleted
                                ? 'bg-emerald-400 dark:bg-emerald-600'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        )}

                        <div className="relative z-10 shrink-0">
                          {isCompleted ? (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                            </div>
                          ) : isInProgress ? (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white flex items-center justify-center animate-pulse shadow-xs">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                            </div>
                          ) : isRejected ? (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xs">
                              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center">
                              <span className="text-xs font-black font-mono">{step.stepNumber}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-1 pt-0.5">
                          <div className="space-y-0.5">
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                              {step.title}
                            </h5>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                              {step.description}
                            </p>
                          </div>

                          <span className="text-[10.5px] font-mono font-medium text-slate-500 dark:text-slate-400 shrink-0 sm:text-right">
                            {step.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* VLE REMARK BOX */}
              <div className="bg-[#eef2ff] dark:bg-indigo-950/40 border border-[#c7d2fe] dark:border-indigo-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <h5 className="text-xs font-black text-slate-900 dark:text-white font-display">
                    VLE Desk Remark (#{liveData.vleRemark?.nodeId || '21251670018'}):
                  </h5>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {liveData.vleRemark?.remarkText}
                  </p>
                </div>

                <a
                  href={`https://api.whatsapp.com/send?phone=${(liveData.vleRemark?.vlePhone || '+917006833767').replace(/[^\d]/g, '')}&text=${encodeURIComponent(
                    `Hello VLE ${liveData.vleRemark?.vleName || 'Wasim'}, regarding my application token ${liveData.appId}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp VLE {liveData.vleRemark?.vleName || 'Wasim'}</span>
                </a>
              </div>
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#0d1527] dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
          >
            CLOSE TRACKER
          </button>
        </div>
      </div>
    </div>
  );
}
