import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { isDeletedApplicationRecord } from '../lib/supabase';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  MessageCircle,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  mapApplicationToTrackingData,
  TrackingData
} from './TrackDedicatedPageView';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentTokens, setRecentTokens] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const tokensSet = new Set<string>();
      const localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      if (Array.isArray(localApps)) {
        localApps.forEach((a: any) => {
          if (isDeletedApplicationRecord(a)) return;
          const t = a.appId || a.id;
          if (t && !String(t).includes('PENDING')) {
            tokensSet.add(String(t));
          }
        });
      }
      setRecentTokens(Array.from(tokensSet).slice(0, 4));
    } catch {
      setRecentTokens([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const tok = initialTokenId ? initialTokenId.trim() : '';
      setSearchInput(tok);
      setActiveToken(tok);
      if (!tok) {
        setLiveData(null);
        setNotFound(false);
        setErrorMessage(null);
        setLoading(false);
      }
    }
  }, [isOpen, initialTokenId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !activeToken || !activeToken.trim()) {
      setLiveData(null);
      setNotFound(false);
      setErrorMessage(null);
      setLoading(false);
      return;
    }

    const cleanToken = activeToken.trim();
    let isCancelled = false;
    let unsubApp: (() => void) | null = null;

    setLoading(true);
    setNotFound(false);
    setErrorMessage(null);
    setLiveData(null);

    // Single-record lookup only (never fetches all applications into browser)
    fetch(`/api/appointments/${encodeURIComponent(cleanToken)}`)
      .then(async (res) => {
        if (isCancelled) return;
        if (res.status === 404) {
          // Check Firestore single document fallback
          try {
            const snap = await getDoc(doc(db, 'applications', cleanToken));
            if (!isCancelled && snap.exists() && !isDeletedApplicationRecord(snap.data())) {
              setLiveData(mapApplicationToTrackingData(snap.data(), cleanToken));
              setNotFound(false);
              setLoading(false);
              unsubApp = onSnapshot(doc(db, 'applications', cleanToken), (s) => {
                if (!isCancelled && s.exists() && !isDeletedApplicationRecord(s.data())) {
                  setLiveData(mapApplicationToTrackingData(s.data(), cleanToken));
                }
              });
              return;
            }
          } catch {}
          if (!isCancelled) {
            setLiveData(null);
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (isCancelled) return;

        if (data && !isDeletedApplicationRecord(data) && (data.appId || data.id)) {
          setLiveData(mapApplicationToTrackingData(data, cleanToken));
          setNotFound(false);
          setLoading(false);
        } else {
          setLiveData(null);
          setNotFound(true);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isCancelled) return;
        setLiveData(null);
        setNotFound(false);
        setErrorMessage('Unable to reach the tracking service right now. Please retry.');
        setLoading(false);
      });

    return () => {
      isCancelled = true;
      if (unsubApp) unsubApp();
    };
  }, [activeToken, isOpen, retryCount]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    if (searchInput.trim() === activeToken) {
      setRetryCount((c) => c + 1);
    } else {
      setActiveToken(searchInput.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/60 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-track-heading"
        className="bg-white rounded-none md:rounded-xl border-0 md:border border-[#E2E8F0] w-full max-w-2xl overflow-hidden flex flex-col h-full md:h-auto max-h-screen md:max-h-[90vh] text-[#102A43]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 id="modal-track-heading" className="text-base font-bold text-[#102A43]">
              Track your application
            </h2>
            <p className="text-xs text-[#64748B]">
              Follow your CSC DOST assistance request.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tracker"
            className="p-2 text-[#64748B] hover:text-[#102A43] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <label htmlFor="modal-track-input" className="block text-xs font-semibold text-[#102A43]">
              Application ID
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="modal-track-input"
                type="text"
                placeholder="e.g. CSC21251567001"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 min-h-[44px] px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm font-mono font-medium text-[#102A43] focus:outline-none focus:border-[#2563EB]"
              />
              <button
                type="submit"
                disabled={loading || !searchInput.trim()}
                className="min-h-[44px] px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Track Status
              </button>
            </div>
          </form>

          {recentTokens.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[#64748B]">Recent:</span>
              {recentTokens.map((tok) => (
                <button
                  key={tok}
                  type="button"
                  onClick={() => {
                    setSearchInput(tok);
                    setActiveToken(tok);
                  }}
                  className="px-2.5 py-1 rounded border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] font-mono font-semibold text-[#102A43] cursor-pointer"
                >
                  {tok}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="py-4 flex items-center gap-2.5 text-sm text-[#475569]">
              <RefreshCw className="w-4 h-4 text-[#2563EB] animate-spin" />
              <span>Checking application status...</span>
            </div>
          )}

          {errorMessage && !loading && (
            <div className="py-4 border-t border-[#E2E8F0] space-y-2.5">
              <p className="text-sm text-[#B91C1C] font-medium">{errorMessage}</p>
              <button
                type="button"
                onClick={() => setRetryCount((c) => c + 1)}
                className="min-h-[40px] px-4 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {notFound && !loading && !errorMessage && (
            <div className="py-4 border-t border-[#E2E8F0] space-y-1.5">
              <h3 className="text-sm font-bold text-[#102A43]">
                No application found for “{activeToken}”
              </h3>
              <p className="text-xs text-[#475569]">
                Please verify your Application ID on your acknowledgement slip and try again.
              </p>
            </div>
          )}

          {liveData && !loading && !notFound && !errorMessage && (
            <div className="space-y-4 border-t border-[#E2E8F0] pt-4">
              <dl className="divide-y divide-[#E2E8F0] border-b border-[#E2E8F0] text-xs sm:text-sm">
                <div className="py-2.5 flex justify-between gap-2">
                  <dt className="text-[#64748B]">Application reference</dt>
                  <dd className="font-mono font-bold text-[#102A43]">{liveData.appId}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <dt className="text-[#64748B]">Requested service</dt>
                  <dd className="font-semibold text-[#102A43] text-right">{liveData.serviceName}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <dt className="text-[#64748B]">Current status</dt>
                  <dd className="font-semibold text-[#2563EB]">{liveData.statusLabel}</dd>
                </div>
                {liveData.appliedDate && (
                  <div className="py-2.5 flex justify-between gap-2">
                    <dt className="text-[#64748B]">Submission date</dt>
                    <dd className="font-mono text-[#334155]">{liveData.appliedDate}</dd>
                  </div>
                )}
              </dl>

              <ol className="space-y-3">
                {liveData.workflowSteps.map((step) => {
                  const isDone = step.status === 'completed';
                  const isCurrent = step.status === 'in_progress';
                  const isRej = step.status === 'rejected';
                  const isAction = step.status === 'action_required';

                  return (
                    <li key={step.stepNumber} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                        ) : isRej ? (
                          <XCircle className="w-4 h-4 text-[#DC2626]" />
                        ) : isAction ? (
                          <AlertCircle className="w-4 h-4 text-[#D97706]" />
                        ) : isCurrent ? (
                          <Clock className="w-4 h-4 text-[#2563EB]" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-[#CBD5E1] inline-block" />
                        )}
                      </div>
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-[#102A43]">{step.title}</p>
                        <p className="text-[#475569]">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <p className="text-xs text-[#475569] pt-2 border-t border-[#E2E8F0]">
                A CSC DOST request is not confirmation of submission to a government portal.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {liveData.finalReceiptUrl && (
                  <a
                    href={liveData.finalReceiptUrl}
                    download={`Receipt-${liveData.appId}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Receipt</span>
                  </a>
                )}
                <a
                  href={`https://api.whatsapp.com/send?phone=917006833767&text=${encodeURIComponent(
                    `Hello CSC DOST Operator, regarding my Application ID: ${liveData.appId}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 border border-[#CBD5E1] text-[#102A43] text-xs font-semibold rounded-lg"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Get help</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
