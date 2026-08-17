import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  FileCheck, 
  X, 
  MessageCircle, 
  Printer, 
  AlertCircle, 
  Building2, 
  Calendar, 
  User, 
  Smartphone, 
  ExternalLink,
  Shield,
  ArrowRight,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'pending' | 'rejected';
}

export interface TrackingData {
  appId: string;
  applicantName?: string;
  serviceName?: string;
  status?: string;
  appliedDate?: string;
  phoneNumber?: string;
  userCategory?: string;
  paymentMode?: string;
  paymentStatus?: string;
  totalAmount?: number | string;
  workflowSteps?: WorkflowStep[];
  vleRemark?: {
    nodeId?: string;
    remarkText?: string;
    vleName?: string;
    vlePhone?: string;
  };
  documents?: any[];
}

interface TrackDedicatedPageViewProps {
  initialTokenId?: string;
  onBack: () => void;
  onNavigateApply?: (serviceName?: string) => void;
}

export default function TrackDedicatedPageView({
  initialTokenId = '',
  onBack,
  onNavigateApply
}: TrackDedicatedPageViewProps) {
  const [searchInput, setSearchInput] = useState(initialTokenId || '');
  const [activeToken, setActiveToken] = useState(initialTokenId || '');
  const [liveData, setLiveData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [recentTokens, setRecentTokens] = useState<string[]>([]);
  const [copiedToken, setCopiedToken] = useState(false);

  // Load recent tokens from localStorage
  useEffect(() => {
    try {
      const tokensSet = new Set<string>();
      const localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      if (Array.isArray(localApps)) {
        localApps.forEach((a: any) => {
          const t = a.appId || a.id;
          if (t && !String(t).includes('PENDING')) {
            tokensSet.add(String(t));
          }
        });
      }
      setRecentTokens(Array.from(tokensSet).slice(0, 5));
    } catch {
      setRecentTokens([]);
    }
  }, []);

  // Sync initial token
  useEffect(() => {
    if (initialTokenId) {
      const tok = initialTokenId.trim();
      setSearchInput(tok);
      setActiveToken(tok);
    }
  }, [initialTokenId]);

  // Fetch real-time application data from Firestore / LocalStorage / Server API
  useEffect(() => {
    if (!activeToken || !activeToken.trim()) {
      setLiveData(null);
      setNotFound(false);
      setLoading(false);
      return;
    }

    const cleanToken = activeToken.trim();
    setLoading(true);
    setNotFound(false);

    let unsubApp: (() => void) | null = null;

    const buildWorkflowSteps = (statusStr: string, submittedAtStr?: string, statusUpdatedAtStr?: string): WorkflowStep[] => {
      const sLower = (statusStr || '').toLowerCase();
      const isCompleted = sLower.includes('complete') || sLower.includes('delivered') || sLower.includes('dispatched');
      const isProcessing = sLower.includes('process') || sLower.includes('verified') || sLower.includes('in progress') || isCompleted;
      const isUnderReview = sLower.includes('review') || sLower.includes('desk') || isProcessing;
      const isRejected = sLower.includes('reject') || sLower.includes('cancel');

      return [
        {
          stepNumber: 1,
          title: 'Application Submitted & Logged',
          description: 'Official token generated and queued at CSC Operator Desk.',
          timestamp: submittedAtStr || 'Today',
          status: isRejected ? 'rejected' : 'completed'
        },
        {
          stepNumber: 2,
          title: 'Document & Identity Verification',
          description: 'VLE officer verifying Aadhaar, marksheet, and category eligibility.',
          timestamp: isUnderReview ? (statusUpdatedAtStr || 'In Verification') : 'Pending',
          status: isRejected ? 'rejected' : isUnderReview ? 'completed' : 'in_progress'
        },
        {
          stepNumber: 3,
          title: 'Official Portal Processing',
          description: 'Application submitted to government recruitment / departmental portal.',
          timestamp: isProcessing ? (statusUpdatedAtStr || 'Processing') : 'Pending',
          status: isRejected ? 'rejected' : isProcessing ? 'completed' : isUnderReview ? 'in_progress' : 'pending'
        },
        {
          stepNumber: 4,
          title: 'Government Authorization & Acknowledgment',
          description: 'Confirmation receipt & registration roll/admit slip created.',
          timestamp: isCompleted ? (statusUpdatedAtStr || 'Approved') : 'Pending',
          status: isRejected ? 'rejected' : isCompleted ? 'completed' : isProcessing ? 'in_progress' : 'pending'
        },
        {
          stepNumber: 5,
          title: 'Final Dispatch & WhatsApp Delivery',
          description: 'Official acknowledgment slip & documents dispatched to candidate.',
          timestamp: isCompleted ? (statusUpdatedAtStr || 'Dispatched') : 'Pending',
          status: isRejected ? 'rejected' : isCompleted ? 'completed' : 'pending'
        }
      ];
    };

    const processLocalOrFetchedApp = (rawApp: any) => {
      const submittedAt = rawApp.submittedAt ? new Date(rawApp.submittedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently';
      const steps = buildWorkflowSteps(rawApp.status || 'Registered', submittedAt, rawApp.statusUpdatedAt);

      setLiveData({
        appId: rawApp.appId || rawApp.id || cleanToken,
        applicantName: rawApp.customerName || rawApp.applicantName || rawApp.name || 'Candidate',
        serviceName: rawApp.selectedService || rawApp.service || 'CSC Service Application',
        status: rawApp.status || 'Registered at CSC Desk',
        appliedDate: submittedAt,
        phoneNumber: rawApp.phoneNumber || rawApp.phone || '',
        userCategory: rawApp.userCategory || 'General',
        paymentMode: rawApp.paymentMode || 'Pay at CSC Desk',
        paymentStatus: rawApp.paymentStatus || 'Pay Upon Completion',
        totalAmount: rawApp.totalAmount || 0,
        workflowSteps: steps,
        vleRemark: {
          nodeId: 'CSC-VLE-001',
          vleName: 'Wasim Ahmad (VLE Operator)',
          vlePhone: '+91 70068 33767',
          remarkText: rawApp.status === 'Completed'
            ? 'Application submitted successfully on official government portal. Acknowledgment slip sent via WhatsApp.'
            : 'Application received and currently under verification by CSC operator.'
        },
        documents: rawApp.documents || []
      });
      setLoading(false);
      setNotFound(false);
    };

    // 1. Check LocalStorage first for instant UX
    try {
      const localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      const matchLocal = localApps.find((a: any) => 
        (a.appId && a.appId.toLowerCase() === cleanToken.toLowerCase()) ||
        (a.id && a.id.toLowerCase() === cleanToken.toLowerCase()) ||
        (a.phone && a.phone.replace(/\D/g, '') === cleanToken.replace(/\D/g, '')) ||
        (a.phoneNumber && a.phoneNumber.replace(/\D/g, '') === cleanToken.replace(/\D/g, ''))
      );

      if (matchLocal) {
        processLocalOrFetchedApp(matchLocal);
      }
    } catch {}

    // 2. Fetch from Firestore
    try {
      const appDocRef = doc(db, 'applications', cleanToken);
      unsubApp = onSnapshot(appDocRef, (snap) => {
        if (snap.exists()) {
          processLocalOrFetchedApp(snap.data());
        } else {
          // Check appointments collection
          const aptDocRef = doc(db, 'appointments', cleanToken);
          getDoc(aptDocRef).then((aptSnap) => {
            if (aptSnap.exists()) {
              processLocalOrFetchedApp(aptSnap.data());
            } else {
              // Fetch from server API
              fetch(`/api/appointments/${cleanToken}`)
                .then(res => res.ok ? res.json() : null)
                .then(apiData => {
                  if (apiData && apiData.appId) {
                    processLocalOrFetchedApp(apiData);
                  } else {
                    // Check if local had data, else notFound
                    setLiveData(prev => {
                      if (!prev) {
                        setNotFound(true);
                      }
                      return prev;
                    });
                    setLoading(false);
                  }
                })
                .catch(() => {
                  setLiveData(prev => {
                    if (!prev) setNotFound(true);
                    return prev;
                  });
                  setLoading(false);
                });
            }
          }).catch(() => {
            setLoading(false);
          });
        }
      }, (err) => {
        console.warn('Firestore tracking error:', err);
        setLoading(false);
      });
    } catch (err) {
      console.warn('Firestore subscription exception:', err);
      setLoading(false);
    }

    return () => {
      if (unsubApp) unsubApp();
    };
  }, [activeToken]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveToken(searchInput.trim());
    }
  };

  const copyTokenToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16 pt-3 sm:pt-6 font-sans">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        
        {/* Navigation & Action Top Bar */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
            id="track-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onNavigateApply) {
                  onNavigateApply();
                } else {
                  window.location.hash = '#apply';
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#172554] hover:bg-[#1e3a8a] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
              id="track-apply-nav-btn"
            >
              <span>Apply for New Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <a
              href="https://whatsapp.com/channel/0029VbDgSe75a248qEZAbL3g"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Help</span>
            </a>
          </div>
        </div>

        {/* MAIN TRACKING CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden space-y-6">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#18204e] via-[#1f2b6c] to-[#18204e] text-white p-5 sm:p-7 border-b border-indigo-900">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded font-mono uppercase tracking-wider">
                  CSC LIVE TRACKER
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Real-time Status Feed</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white font-display">
                Track Application &amp; Order Status
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 font-medium">
                Enter your CSC Token ID (e.g. CSC21251567001) or WhatsApp Mobile Number to check real-time progress.
              </p>
            </div>
          </div>

          {/* Search Box Form */}
          <div className="px-5 sm:px-8 pt-2">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter CSC Token ID (e.g. CSC21251567001) or Mobile..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#172554] hover:bg-[#1e3a8a] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm shrink-0 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Track Status</span>
              </button>
            </form>

            {/* Recent Tokens Quick Select */}
            {recentTokens.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                <span className="text-slate-500 font-bold">Recent Tokens:</span>
                {recentTokens.map((tok) => (
                  <button
                    key={tok}
                    type="button"
                    onClick={() => {
                      setSearchInput(tok);
                      setActiveToken(tok);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                      activeToken === tok
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tok}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LIVE TRACKING RESULT OR EMPTY STATE */}
          <div className="px-5 sm:px-8 pb-8">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-500">Querying CSC Live Database &amp; VLE Queue...</p>
              </div>
            ) : notFound ? (
              <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-amber-950">No Application Found for "{activeToken}"</h3>
                  <p className="text-xs text-amber-800 max-w-md mx-auto">
                    Please verify your Token ID or WhatsApp number. Tokens are generated instantly after submitting an application via the CSC Desk.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateApply) onNavigateApply();
                    else window.location.hash = '#apply';
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Submit New Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : liveData ? (
              <div className="space-y-6">
                
                {/* Application Snapshot Card */}
                <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider">
                        CSC Reference Token
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl font-mono font-black text-amber-300">
                          {liveData.appId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyTokenToClipboard(liveData.appId)}
                          className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Copy Token ID"
                        >
                          {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold text-xs">
                        {liveData.status || 'Active & Registered'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Applicant:</span>
                      <strong className="text-white font-bold">{liveData.applicantName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Service:</span>
                      <strong className="text-indigo-200 font-bold">{liveData.serviceName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Date Logged:</span>
                      <span className="text-slate-300 font-mono">{liveData.appliedDate}</span>
                    </div>
                  </div>
                </div>

                {/* 5-Stage Live Progress Workflow */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Application Lifecycle &amp; Progress Timeline
                  </h3>

                  <div className="space-y-3">
                    {liveData.workflowSteps?.map((step) => {
                      const isDone = step.status === 'completed';
                      const isCurrent = step.status === 'in_progress';
                      return (
                        <div
                          key={step.stepNumber}
                          className={`p-3.5 sm:p-4 rounded-xl border flex items-start gap-3 transition-all ${
                            isDone
                              ? 'bg-emerald-50/70 border-emerald-200'
                              : isCurrent
                              ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                              : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {isDone ? (
                              <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            ) : isCurrent ? (
                              <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                                {step.stepNumber}
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-slate-300 text-slate-600 rounded-full flex items-center justify-center text-xs font-bold">
                                {step.stepNumber}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={`text-xs sm:text-sm font-bold ${isDone ? 'text-emerald-950' : isCurrent ? 'text-indigo-950 font-black' : 'text-slate-700'}`}>
                                {step.title}
                              </h4>
                              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                {step.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-600">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Operator Remarks Card */}
                {liveData.vleRemark && (
                  <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span>VLE Operator Remarks &amp; Action</span>
                    </div>
                    <p className="text-slate-700">
                      {liveData.vleRemark.remarkText}
                    </p>
                  </div>
                )}

                {/* Bottom Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-300"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Status Slip</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?phone=917006833767&text=${encodeURIComponent(`Hello CSC DOST, I am inquiring about my Application Token: ${liveData.appId} for ${liveData.serviceName}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Contact Operator via WhatsApp</span>
                  </a>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <p className="text-xs font-bold text-slate-700">Enter Token ID or Mobile Number Above</p>
                  <p className="text-[11px] text-slate-500">
                    You can track any application submitted online or at the CSC physical desk in real-time.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
