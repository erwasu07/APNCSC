import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
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
  RefreshCw
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

    // 1. Setup Firestore real-time listener
    const docRef = doc(db, 'appointments', cleanToken);
    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setApplicationData({ id: docSnap.id, ...docSnap.data() });
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
      },
      (err) => {
        console.error('Firestore real-time tracking error:', err);
        // Fallback local search
        try {
          const localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
          const web3Apps = JSON.parse(localStorage.getItem('csc_web3forms_submissions') || '[]');
          const foundLocal = [...localApps, ...web3Apps].find(
            (a) =>
              (a.appId && a.appId.toLowerCase() === cleanToken.toLowerCase()) ||
              (a.id && a.id.toLowerCase() === cleanToken.toLowerCase())
          );
          if (foundLocal) {
            setApplicationData(foundLocal);
            setNotFound(false);
          } else {
            setApplicationData(null);
            setNotFound(true);
          }
        } catch (e) {
          setNotFound(true);
        }
        setLoading(false);
      }
    );

    return () => unsub();
  }, [activeTokenId]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tokenIdInput.trim();
    if (!trimmed) return;
    setSearched(true);
    setActiveTokenId(trimmed);
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
          <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-black text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
              <FileCheck className="w-5 h-5 text-blue-500" />
              <span>Approved &amp; Under Process</span>
            </div>
            <p className="text-xs text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
              ⚡ Your application has been verified and approved by staff. It is currently being filed with official government servers.
            </p>
          </div>
        );
      case 'Completed':
        return (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Completed</span>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium leading-relaxed">
              🎉 Application successfully filed and processed! You can download your official receipt or final document below.
            </p>
          </div>
        );
      case 'Rejected':
        return (
          <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-black text-sm">
              <XCircle className="w-5 h-5 text-red-500" />
              <span>Rejected</span>
            </div>
            <p className="text-xs text-red-800 dark:text-red-200 font-medium leading-relaxed">
              ❌ Application was rejected due to incomplete documents or government portal technical errors. Please visit CSC Center in person or contact support.
            </p>
          </div>
        );
      default:
        return (
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-sm">
              <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>Pending Review</span>
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
              ⏳ Application received and queued for staff review. Processing usually begins within 15–30 minutes during working hours.
            </p>
          </div>
        );
    }
  };

  return (
    <div id="track-application-section" className="mb-8 scroll-mt-24">
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-black uppercase tracking-wider font-mono border border-amber-500/30 mb-2">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Live Status Tracker</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-display text-white">
                Track Your Application
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                Enter your Token ID received after submitting your form to view real-time filing status &amp; download receipts.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Firestore Sync</span>
              </span>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Enter Token ID (e.g., APEX-2026-638466)"
                value={tokenIdInput}
                onChange={(e) => setTokenIdInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 border-2 border-slate-700 hover:border-slate-600 focus:border-amber-400 rounded-2xl text-white placeholder-slate-400 font-mono font-bold text-sm tracking-wide focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition-all"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Application</span>
                </>
              )}
            </button>
          </form>

          {/* Results Area */}
          {loading && (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
              <p className="text-xs font-bold">Querying live database for Token {activeTokenId}...</p>
            </div>
          )}

          {searched && notFound && !loading && (
            <div className="p-6 bg-red-950/40 border border-red-800/80 rounded-2xl text-red-200 text-center space-y-2 animate-fade-in">
              <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
              <h4 className="text-sm font-black uppercase tracking-wider text-red-300">Application Token Not Found</h4>
              <p className="text-xs max-w-lg mx-auto font-medium">
                No record matches Token ID <strong className="font-mono text-white underline">{activeTokenId}</strong>. Please ensure you entered the exact Token ID generated upon submitting your application.
              </p>
            </div>
          )}

          {applicationData && !loading && (
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-5 animate-fade-in shadow-xl">
              {/* Token & Header info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Token ID / Receipt No.
                  </span>
                  <span className="text-lg font-black font-mono text-amber-400">
                    {applicationData.appId || activeTokenId}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Submission Time
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {applicationData.submittedAt || applicationData.date || 'Recent'}
                  </span>
                </div>
              </div>

              {/* Status Badge Banner */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                  Live Filing Status
                </span>
                {getStatusBadge(applicationData.status)}
              </div>

              {/* Application Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Applicant Name</span>
                  <span className="font-extrabold text-white text-sm">
                    {applicationData.name || applicationData.customerName || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Applied Service</span>
                  <span className="font-bold text-amber-300">
                    {applicationData.service || applicationData.selectedService || 'General Application'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Mobile Contact</span>
                  <span className="font-bold font-mono text-slate-200">
                    📞 {applicationData.phone || applicationData.phoneNumber || 'N/A'}
                  </span>
                </div>
              </div>

              {/* DOWNLOAD RECEIPT BUTTON (rendered if status is Completed & finalReceiptUrl exists) */}
              {normalizeStatus(applicationData.status) === 'Completed' && applicationData.finalReceiptUrl ? (
                <div className="p-4 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-500/80 rounded-2xl space-y-3 shadow-lg animate-pulse">
                  <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Official Document / Receipt Ready for Download</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    <a
                      href={applicationData.finalReceiptUrl}
                      download={`Receipt_${applicationData.appId || 'CSC'}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Application Receipt</span>
                    </a>

                    <a
                      href={applicationData.finalReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Document Online</span>
                    </a>
                  </div>
                </div>
              ) : normalizeStatus(applicationData.status) === 'Completed' ? (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Application marked Completed by staff. Receipt link generating... Contact cafe if not visible.</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
