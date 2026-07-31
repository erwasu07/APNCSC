import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  Download,
  ShieldAlert,
  Loader2,
  Sparkles,
  ExternalLink,
  Info,
  X
} from 'lucide-react';

interface TrackApplicationProps {
  initialTokenId?: string;
}

export default function TrackApplication({ initialTokenId = '' }: TrackApplicationProps) {
  const [tokenIdInput, setTokenIdInput] = useState(initialTokenId);
  const [activeTokenId, setActiveTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Robust Date/Timestamp Formatting Helper
  const formatDisplayDate = (dateVal: any): string => {
    if (!dateVal) return 'N/A';
    try {
      let d: Date;
      if (typeof dateVal === 'object' && dateVal !== null) {
        if (typeof dateVal.toDate === 'function') {
          d = dateVal.toDate();
        } else if (typeof dateVal.seconds === 'number') {
          d = new Date(dateVal.seconds * 1000);
        } else {
          d = new Date(dateVal);
        }
      } else if (typeof dateVal === 'number') {
        d = new Date(dateVal);
      } else {
        const parsed = new Date(String(dateVal));
        if (!isNaN(parsed.getTime())) {
          d = parsed;
        } else {
          return String(dateVal);
        }
      }

      if (isNaN(d.getTime())) return String(dateVal);

      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return String(dateVal);
    }
  };

  // Subscribe in real-time to Firestore document when activeTokenId changes
  useEffect(() => {
    if (!activeTokenId) {
      setApplicationData(null);
      setNotFound(false);
      return;
    }

    setLoading(true);
    setNotFound(false);

    const cleanToken = activeTokenId.trim();

    let unsubApp: (() => void) | null = null;
    let unsubApt: (() => void) | null = null;

    let appFoundData: any = null;
    let aptFoundData: any = null;

    const checkAndSetResult = () => {
      const mergedData = appFoundData || aptFoundData;
      if (mergedData) {
        setApplicationData(mergedData);
        setNotFound(false);
        setLoading(false);
      } else {
        // Check local cache fallback
        let foundLocal = null;
        try {
          const localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
          const web3Apps = JSON.parse(localStorage.getItem('csc_web3forms_submissions') || '[]');
          foundLocal = [...localApps, ...web3Apps].find(
            (a) =>
              (a.appId && a.appId.toLowerCase() === cleanToken.toLowerCase()) ||
              (a.id && a.id.toLowerCase() === cleanToken.toLowerCase())
          );
        } catch (e) {
          console.error('Local tracking parse error:', e);
        }

        if (foundLocal) {
          setApplicationData(foundLocal);
          setNotFound(false);
        } else {
          setApplicationData(null);
          setNotFound(true);
        }
        setLoading(false);
      }
    };

    try {
      unsubApp = onSnapshot(
        doc(db, 'applications', cleanToken),
        (docSnap) => {
          if (docSnap.exists()) {
            appFoundData = { id: docSnap.id, ...docSnap.data() };
          } else {
            appFoundData = null;
          }
          checkAndSetResult();
        },
        () => {
          appFoundData = null;
          checkAndSetResult();
        }
      );

      unsubApt = onSnapshot(
        doc(db, 'appointments', cleanToken),
        (docSnap) => {
          if (docSnap.exists()) {
            aptFoundData = { id: docSnap.id, ...docSnap.data() };
          } else {
            aptFoundData = null;
          }
          checkAndSetResult();
        },
        () => {
          aptFoundData = null;
          checkAndSetResult();
        }
      );
    } catch (err) {
      console.error('Firestore real-time tracking exception:', err);
      checkAndSetResult();
    }

    return () => {
      if (unsubApp) unsubApp();
      if (unsubApt) unsubApt();
    };
  }, [activeTokenId]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tokenIdInput.trim();
    if (!trimmed) return;
    setSearched(true);
    setActiveTokenId(trimmed);
  };

  // Force direct download using Blob / Object URL to bypass browser inline display & CORS issues
  const handleForceDownload = async (fileUrl: string, rawFilename?: string) => {
    if (!fileUrl) return;
    setIsDownloading(true);

    const filename = rawFilename || `Receipt_${applicationData?.appId || 'CSC_Application'}.png`;

    try {
      let blob: Blob;

      if (fileUrl.startsWith('data:')) {
        // Base64 Data URL to Blob conversion
        const res = await fetch(fileUrl);
        blob = await res.blob();
      } else {
        // Remote Firebase Storage / HTTP URL fetch
        const response = await fetch(fileUrl, {
          method: 'GET',
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }
        blob = await response.blob();
      }

      // Create object URL and force link trigger
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.download = filename;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.warn('Blob fetch download failed, falling back to window location / direct download:', err);
      // Direct anchor click fallback
      const fallbackLink = document.createElement('a');
      fallbackLink.href = fileUrl;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      fallbackLink.download = filename;
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    } finally {
      setIsDownloading(false);
    }
  };

  const normalizeStatus = (statusStr?: string) => {
    if (!statusStr) return 'Pending';
    const lower = statusStr.toLowerCase();
    if (lower.includes('approved') || lower.includes('process')) return 'Approved & Under Process';
    if (lower.includes('complete') || lower.includes('finished') || lower.includes('done')) return 'Completed';
    if (lower.includes('reject') || lower.includes('cancel')) return 'Rejected';
    return 'Pending';
  };

  const getStatusBadge = (statusStr?: string) => {
    const norm = normalizeStatus(statusStr);
    switch (norm) {
      case 'Approved & Under Process':
        return (
          <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-extrabold text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              <FileCheck className="w-4 h-4 text-blue-500" />
              <span>Approved &amp; Under Process</span>
            </div>
            <p className="text-[11px] text-blue-800 dark:text-blue-200 font-medium leading-tight">
              Application verified and approved by cafe staff. Processing with official government portal.
            </p>
          </div>
        );
      case 'Completed':
        return (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Completed</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-200 font-medium leading-tight">
              🎉 Application successfully filed! Download your official receipt below.
            </p>
          </div>
        );
      case 'Rejected':
        return (
          <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-red-700 dark:text-red-300 font-extrabold text-xs">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Rejected</span>
            </div>
            <p className="text-[11px] text-red-800 dark:text-red-200 font-medium leading-tight">
              Application rejected due to incomplete details or portal error. Visit CSC Cafe for assistance.
            </p>
          </div>
        );
      default:
        return (
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Pending Review</span>
            </div>
            <p className="text-[11px] text-amber-900 dark:text-amber-200 font-medium leading-tight">
              ⏳ Application queued for staff review. Processing usually begins within 15–30 minutes.
            </p>
          </div>
        );
    }
  };

  return (
    <div id="track-application-section" className="mb-6 scroll-mt-20 w-full max-w-xl mx-auto px-0 sm:px-2">
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-none sm:rounded-2xl p-4 sm:p-5 shadow-lg border-x-0 sm:border-x border-y sm:border border-slate-800 relative overflow-hidden w-full">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          {/* Compact Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight font-display text-white">
                  Track Application
                </h2>
                <p className="text-[11px] text-slate-300 font-medium">
                  Enter Token ID to check real-time filing status
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Sync</span>
            </span>
          </div>

          {/* Compact Search Bar */}
          <form onSubmit={handleTrackSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Enter Token ID (e.g., APEX-2026-638466)"
                value={tokenIdInput}
                onChange={(e) => setTokenIdInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-900/90 border border-slate-700 hover:border-slate-600 focus:border-amber-400 rounded-xl text-white placeholder-slate-400 font-mono font-bold text-xs tracking-wide focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {tokenIdInput && (
                <button
                  type="button"
                  onClick={() => {
                    setTokenIdInput('');
                    setActiveTokenId('');
                    setApplicationData(null);
                    setNotFound(false);
                    setSearched(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Track</span>
                </>
              )}
            </button>
          </form>

          {/* Results Area */}
          {loading && (
            <div className="p-4 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-xs space-y-1">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500 mx-auto" />
              <p className="font-bold">Checking status for {activeTokenId}...</p>
            </div>
          )}

          {searched && notFound && !loading && (
            <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-red-200 text-center space-y-1 animate-fade-in">
              <ShieldAlert className="w-6 h-6 text-red-400 mx-auto" />
              <h4 className="text-xs font-black uppercase tracking-wider text-red-300">Token Not Found</h4>
              <p className="text-[11px] font-medium">
                No application found for <strong className="font-mono text-white underline">{activeTokenId}</strong>. Double check your Token ID.
              </p>
            </div>
          )}

          {applicationData && !loading && (
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 space-y-3.5 animate-fade-in shadow-md">
              {/* Token & Time Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Token ID</span>
                  <span className="text-sm font-black font-mono text-amber-400">
                    {applicationData.appId || activeTokenId}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Submitted Date</span>
                  <span className="text-[11px] font-mono font-bold text-slate-300">
                    {formatDisplayDate(applicationData.createdAt || applicationData.submittedAt || applicationData.date)}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              {getStatusBadge(applicationData.status)}

              {/* Application Detail Compact Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Applicant</span>
                  <span className="font-bold text-white truncate block">
                    {applicationData.name || applicationData.customerName || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Service</span>
                  <span className="font-bold text-amber-300 truncate block">
                    {applicationData.service || applicationData.selectedService || 'General Application'}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Mobile</span>
                  <span className="font-bold font-mono text-slate-200 block">
                    {applicationData.phone || applicationData.phoneNumber || 'N/A'}
                  </span>
                </div>
              </div>

              {/* DOWNLOAD RECEIPT ACTION BOX */}
              {normalizeStatus(applicationData.status) === 'Completed' && applicationData.finalReceiptUrl ? (
                <div className="p-3 bg-emerald-950/70 border border-emerald-500/60 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Official Receipt Ready</span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => handleForceDownload(applicationData.finalReceiptUrl, `Receipt_${applicationData.appId || 'CSC'}.png`)}
                      disabled={isDownloading}
                      className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Receipt</span>
                        </>
                      )}
                    </button>

                    <a
                      href={applicationData.finalReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-all flex items-center gap-1 border border-slate-700 shrink-0"
                      title="View Online in New Tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View</span>
                    </a>
                  </div>
                </div>
              ) : normalizeStatus(applicationData.status) === 'Completed' ? (
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Application marked Completed. Receipt document being generated by staff.</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
