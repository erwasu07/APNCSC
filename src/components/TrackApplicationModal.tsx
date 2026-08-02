import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  X,
  MessageCircle,
  Sparkles,
  Download,
  ShieldCheck,
  Loader2,
  ArrowRight
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
  recentTokens?: string[];
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

// Default Model Data matching user design & live data format
export const DEFAULT_TRACKING_DATA: TrackingData = {
  appId: 'APEX-2026',
  deskId: '21251670018',
  statusTitle: 'Completed & Card Ready for Download',
  statusCategory: 'Welfare & PM Schemes',
  appliedDate: '01/08/2026',
  currentStep: 4,
  totalSteps: 4,
  applicantName: 'Wasim Ahmad Khan',
  serviceName: 'Ayushman Bharat PM-JAY',
  feeAmount: '₹50 (Pay Online (UPI/Card))',
  whatsappNumber: '+91 7006833767',
  recentTokens: ['APEX-2026', 'CSC-2026-9482', 'CSC-2026-8812'],
  workflowSteps: [
    {
      stepNumber: 1,
      title: 'Application & Aadhaar KYC Received',
      description: 'Applicant submitted ration card & Aadhaar biometric at CSC Desk',
      timestamp: '01/08/2026, 10:15 AM',
      status: 'completed'
    },
    {
      stepNumber: 2,
      title: 'Document Scrutiny & BIS Portal Submission',
      description: 'VLE Wasim Ahmad verified family roster on PM-JAY BIS 3.0 portal',
      timestamp: '01/08/2026, 10:30 AM',
      status: 'completed'
    },
    {
      stepNumber: 3,
      title: 'Government Authority Approval',
      description: 'Ayushman card approved by SHA J&K Nodal Officer',
      timestamp: '01/08/2026, 11:45 AM',
      status: 'completed'
    },
    {
      stepNumber: 4,
      title: 'Token Completed & Card Printed',
      description: 'E-Card PDF downloaded and WhatsApp acknowledgment receipt dispatched',
      timestamp: '01/08/2026, 11:50 AM',
      status: 'completed'
    }
  ],
  vleRemark: {
    nodeId: '21251670018',
    remarkText: 'SEHAT & PM-JAY verification approved by State Health Agency. PVC Card print ready at CSC Desk #21251670018.',
    vleName: 'Wasim',
    vlePhone: '+917006833767'
  }
};

export default function TrackApplicationModal({
  isOpen,
  onClose,
  initialTokenId = 'APEX-2026'
}: TrackApplicationModalProps) {
  const [searchInput, setSearchInput] = useState(initialTokenId || 'APEX-2026');
  const [activeToken, setActiveToken] = useState(initialTokenId || 'APEX-2026');
  const [liveData, setLiveData] = useState<TrackingData | null>(DEFAULT_TRACKING_DATA);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Sync token if prop changes
  useEffect(() => {
    if (initialTokenId) {
      setSearchInput(initialTokenId);
      setActiveToken(initialTokenId);
    }
  }, [initialTokenId]);

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

  // Fetch real-time data when activeToken changes
  useEffect(() => {
    if (!isOpen || !activeToken) return;

    if (activeToken.toUpperCase() === 'APEX-2026') {
      setLiveData(DEFAULT_TRACKING_DATA);
      setNotFound(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);

    const cleanToken = activeToken.trim();
    let unsubApp: (() => void) | null = null;

    try {
      unsubApp = onSnapshot(
        doc(db, 'applications', cleanToken),
        (docSnap) => {
          if (docSnap.exists()) {
            const raw = docSnap.data();
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

            const formatted: TrackingData = {
              appId: raw.appId || cleanToken,
              deskId: raw.deskId || '21251670018',
              statusTitle,
              statusCategory: raw.category || raw.selectedService || 'CSC Government Service',
              appliedDate: raw.createdAt ? new Date(raw.createdAt).toLocaleDateString('en-IN') : 'Recent',
              currentStep,
              totalSteps: 4,
              applicantName: raw.customerName || raw.name || 'Applicant',
              serviceName: raw.selectedService || raw.service || 'CSC Government Service',
              feeAmount: `₹${raw.totalAmount || raw.portalFee || 50} (Paid)`,
              whatsappNumber: raw.phoneNumber || raw.phone || '+91 7006833767',
              recentTokens: DEFAULT_TRACKING_DATA.recentTokens,
              workflowSteps: [
                {
                  stepNumber: 1,
                  title: 'Application Received & Queued',
                  description: 'Application submitted with required documents at CSC Desk',
                  timestamp: raw.createdAt ? new Date(raw.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
                  status: 'completed'
                },
                {
                  stepNumber: 2,
                  title: 'Document Scrutiny & Verification',
                  description: isRejected ? 'Verification rejected by staff' : 'VLE desk verified attached documents & identity details',
                  timestamp: 'Recently',
                  status: isCompleted || isApproved ? 'completed' : isRejected ? 'rejected' : 'in_progress'
                },
                {
                  stepNumber: 3,
                  title: 'Official Department Filing',
                  description: 'Submitted to official state/central government portal',
                  timestamp: 'Recently',
                  status: isCompleted ? 'completed' : isApproved ? 'in_progress' : 'pending'
                },
                {
                  stepNumber: 4,
                  title: 'Final Certificate / Receipt Generated',
                  description: isCompleted ? 'E-Document issued and ready for download' : 'Awaiting final portal completion',
                  timestamp: 'Recently',
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
              status: raw.status
            };
            setLiveData(formatted);
            setNotFound(false);
          } else {
            // Check local storage fallback
            try {
              const localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
              const found = localApps.find((a: any) => (a.appId || a.id || '').toLowerCase() === cleanToken.toLowerCase());
              if (found) {
                const st = (found.status || '').toLowerCase();
                const isComp = st.includes('completed');
                const isAppr = st.includes('approved') || st.includes('process');
                const isRej = st.includes('reject');

                setLiveData({
                  appId: found.appId || cleanToken,
                  deskId: '21251670018',
                  statusTitle: isComp ? 'Completed & Receipt Ready' : isAppr ? 'Approved & Under Process' : isRej ? 'Application Rejected' : 'Application Received & Under Review',
                  statusCategory: found.service || found.selectedService || 'CSC Service',
                  appliedDate: 'Recent',
                  currentStep: isComp ? 4 : isAppr ? 3 : 2,
                  totalSteps: 4,
                  applicantName: found.customerName || found.name || 'Applicant',
                  serviceName: found.selectedService || found.service || 'Service',
                  feeAmount: `₹${found.totalAmount || 50}`,
                  whatsappNumber: found.phoneNumber || found.phone || '+91 7006833767',
                  workflowSteps: [
                    { stepNumber: 1, title: 'Application Received & Queued', description: 'Submitted at CSC Desk', timestamp: 'Recently', status: 'completed' },
                    { stepNumber: 2, title: 'Document Verification', description: 'VLE verified identity details', timestamp: 'Recently', status: isComp || isAppr ? 'completed' : 'in_progress' },
                    { stepNumber: 3, title: 'Department Filing', description: 'Submitted to portal', timestamp: 'Recently', status: isComp ? 'completed' : isAppr ? 'in_progress' : 'pending' },
                    { stepNumber: 4, title: 'Receipt Generated', description: isComp ? 'Ready for download' : 'Awaiting completion', timestamp: 'Recently', status: isComp ? 'completed' : 'pending' },
                  ],
                  vleRemark: {
                    nodeId: '21251670018',
                    remarkText: found.vleRemark || `Application status: ${found.status || 'Pending'}. CSC Desk #21251670018.`,
                    vleName: 'Wasim',
                    vlePhone: '+917006833767'
                  },
                  finalReceiptUrl: found.finalReceiptUrl,
                  status: found.status || 'Pending'
                });
                setNotFound(false);
              } else {
                setLiveData(null);
                setNotFound(true);
              }
            } catch {
              setLiveData(null);
              setNotFound(true);
            }
          }
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } catch {
      setLoading(false);
    }

    return () => {
      if (unsubApp) unsubApp();
    };
  }, [activeToken, isOpen]);

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

  const displayData = liveData || DEFAULT_TRACKING_DATA;

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
                Verify real-time filing status with Model CSC Desk #{displayData.deskId || '21251670018'}
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
                placeholder="Enter Token ID (e.g. APEX-2026)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-amber-400 transition-all placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#161a38] dark:bg-slate-800 hover:bg-[#0f1228] dark:hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm shrink-0 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>SEARCH</span>}
              </button>
            </form>

            {/* Recent Tokens Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Recent Tokens:</span>
              {DEFAULT_TRACKING_DATA.recentTokens?.map((tok) => {
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
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Fetching live application status for <span className="font-mono text-emerald-600">{activeToken}</span>...
              </p>
            </div>
          )}

          {/* NOT FOUND STATE */}
          {notFound && !loading && (
            <div className="p-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-center space-y-1.5">
              <XCircle className="w-7 h-7 text-red-500 mx-auto" />
              <h4 className="text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-300">
                Token ID Not Found
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                No matching record found for token <strong className="font-mono text-slate-900 dark:text-white underline">{activeToken}</strong>. Please verify your Token ID.
              </p>
            </div>
          )}

          {/* MAIN TRACKING CONTENT */}
          {!loading && !notFound && (
            <>
              {/* STATUS BANNER */}
              <div className="bg-[#ecfdf5] dark:bg-emerald-950/40 border border-[#a7f3d0] dark:border-emerald-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                      TOKEN STATUS
                    </span>
                    <span className="px-2 py-0.5 bg-white dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 rounded-full font-mono text-[11px] font-extrabold shadow-2xs">
                      {displayData.appId}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-100 font-display leading-snug">
                    {displayData.statusTitle || 'Completed & Card Ready for Download'}
                  </h3>

                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    Applied on <span className="font-mono font-bold">{displayData.appliedDate || '01/08/2026'}</span> | Category: <span className="font-bold">{displayData.statusCategory || 'Welfare & PM Schemes'}</span>
                  </p>
                </div>

                <div className="shrink-0 bg-white dark:bg-emerald-900/90 border border-emerald-300 dark:border-emerald-700 px-3.5 py-1.5 rounded-xl text-center shadow-2xs">
                  <span className="text-xs font-black text-emerald-950 dark:text-emerald-100">
                    Step {displayData.currentStep || 4} / {displayData.totalSteps || 4}
                  </span>
                </div>
              </div>

              {/* 4-GRID APPLICANT DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                    APPLICANT
                  </span>
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate" title={displayData.applicantName}>
                    {displayData.applicantName || 'Wasim Ahmad Khan'}
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                    SERVICE / JOB
                  </span>
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate" title={displayData.serviceName}>
                    {displayData.serviceName || 'Ayushman Bharat PM-JAY'}
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                    FEE AMOUNT
                  </span>
                  <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 truncate">
                    {displayData.feeAmount || '₹50 (Pay Online (UPI/Card))'}
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                    WHATSAPP NUMBER
                  </span>
                  <p className="text-xs font-black font-mono text-slate-900 dark:text-white truncate">
                    {displayData.whatsappNumber || '+91 7006833767'}
                  </p>
                </div>
              </div>

              {/* WORKFLOW TIMELINE */}
              <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 font-display">
                  APPLICATION FILING WORKFLOW TIMELINE
                </h4>

                <div className="relative pl-2 sm:pl-3 space-y-5">
                  {displayData.workflowSteps?.map((step, idx) => {
                    const isLast = idx === (displayData.workflowSteps?.length || 0) - 1;
                    const isCompleted = step.status === 'completed';
                    const isInProgress = step.status === 'in_progress';

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
                    VLE Desk Remark (#{displayData.vleRemark?.nodeId || displayData.deskId || '21251670018'}):
                  </h5>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {displayData.vleRemark?.remarkText ||
                      'SEHAT & PM-JAY verification approved by State Health Agency. PVC Card print ready at CSC Desk #21251670018.'}
                  </p>
                </div>

                <a
                  href={`https://api.whatsapp.com/send?phone=${(displayData.vleRemark?.vlePhone || '+917006833767').replace(/[^\d]/g, '')}&text=${encodeURIComponent(
                    `Hello VLE ${displayData.vleRemark?.vleName || 'Wasim'}, regarding my application token ${displayData.appId}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp VLE {displayData.vleRemark?.vleName || 'Wasim'}</span>
                </a>
              </div>

              {/* DOWNLOAD RECEIPT ACTION IF COMPLETED */}
              {displayData.finalReceiptUrl && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Official E-Document / Receipt PDF Ready</span>
                  </div>

                  <a
                    href={displayData.finalReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              )}
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
