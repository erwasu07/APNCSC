import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Play,
  ExternalLink,
  XCircle,
  Loader2,
  Check,
  X,
  Clock
} from 'lucide-react';

function getStaffAuthHeaders(includeJson = false): Record<string, string> {
  let token = '';
  try {
    token = sessionStorage.getItem('csc_admin_token') || '';
  } catch {}
  if (!token) {
    token = '';
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'x-admin-token': token
  };
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

import {
  validatePostPublishQuality,
  countWords,
} from '../utils/contentQualityValidator';

function buildDraftEditState(item: any) {
  return {
    title: item.title || '',
    shortInfo: item.shortInfo || '',
    originalAnalysis: item.originalAnalysis || '',
    eligibility: item.eligibility || '',
    lastDate: item.lastDate || '',
    officialNotificationUrl: item.officialNotificationUrl || item.sourceUrl || '',
    reviewerNotes: item.reviewerNotes || '',
    confirmNotDuplicate: false,
  };
}

export default function AdminReviewQueue() {
  const [sources, setSources] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningMonitor, setRunningMonitor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftForm, setDraftForm] = useState<ReturnType<typeof buildDraftEditState> | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  const loadMonitorStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/monitor/status', {
        headers: getStaffAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSources(data.sources || []);
        setQueue(data.queue || []);
        setRuns(data.runs || []);
      }
    } catch (e: any) {
      console.warn('[AdminReviewQueue] Failed to load monitor status:', e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitorStatus();
  }, []);

  const handleRunMonitor = async () => {
    setRunningMonitor(true);
    setBanner(null);
    try {
      const res = await fetch('/api/staff/monitor/run', {
        method: 'POST',
        headers: getStaffAuthHeaders(true)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const r = data.summary?.run;
        if (data.summary?.whatsappError) {
          setBanner({
            type: 'warning',
            text: `Monitor completed (${r.newDrafts} drafts, ${r.sourcesFailing} failing), but WhatsApp alert failed: ${data.summary.whatsappError}`
          });
        } else {
          setBanner({
            type: 'success',
            text: `Monitor check completed: ${r.newDrafts} new drafts, ${r.updateProposals} updates, ${r.sourcesFailing} failing sources.`
          });
        }
        loadMonitorStatus();
      } else {
        setBanner({ type: 'error', text: data.error || 'Monitor run failed.' });
      }
    } catch (e: any) {
      setBanner({ type: 'error', text: e?.message || 'Network error running monitor.' });
    } finally {
      setRunningMonitor(false);
    }
  };

  const openReviewEditor = (item: any) => {
    setEditingId(item.id);
    setDraftForm(buildDraftEditState(item));
    setReviewError(null);
  };

  const handleDecision = async (id: string, action: 'approve_draft' | 'dismiss', payload?: any) => {
    setSubmittingId(id);
    setReviewError(null);
    try {
      const res = await fetch(`/api/staff/monitor/review/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: getStaffAuthHeaders(true),
        body: JSON.stringify({ action, ...(payload || {}) })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setEditingId(null);
        setDraftForm(null);
        setBanner({
          type: 'success',
          text:
            action === 'approve_draft'
              ? 'Item verified and saved strictly as an unpublished Draft (never auto-published).'
              : 'Review item dismissed.'
        });
        loadMonitorStatus();
      } else {
        const msg =
          Array.isArray(data.validationErrors) && data.validationErrors.length > 0
            ? data.validationErrors.join(' ')
            : data.error || 'Could not process review decision.';
        setReviewError(msg);
      }
    } catch (e: any) {
      setReviewError(e?.message || 'Network error submitting review.');
    } finally {
      setSubmittingId(null);
    }
  };

  const pendingItems = queue.filter((q) => q.status === 'pending');

  return (
    <div className="space-y-5">
      {banner && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : banner.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <span>{banner.text}</span>
          <button type="button" onClick={() => setBanner(null)} className="p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#175CEE] text-white flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#102A43]">Official Notice Monitor &amp; Review Queue</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Scheduled checks run daily at 7:00 AM and 6:00 PM IST. Every detected change stays UNREVIEWED and requires a verified 400+ word original rewrite before drafting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMonitorStatus}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-[#F6F8FC] hover:bg-slate-100 text-[#102A43] text-xs font-semibold border border-[#E2E8F0] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleRunMonitor}
            disabled={runningMonitor}
            className="px-4 py-2 rounded-xl bg-[#175CEE] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {runningMonitor ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Run Monitor Now</span>
          </button>
        </div>
      </div>

      {/* Pending Review Queue */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
            Pending Review Queue ({pendingItems.length})
          </h3>
          <span className="text-[11px] text-[#64748B]">Strict Human Editorial Gate (No Auto-Publish)</span>
        </div>

        {pendingItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Review queue is clear. New notices or official page changes will appear here after the next monitor run.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingItems.map((item) => {
              const isEditing = editingId === item.id && draftForm;
              const liveQuality =
                isEditing && draftForm
                  ? validatePostPublishQuality(
                      {
                        id: item.id,
                        title: draftForm.title,
                        shortInfo: draftForm.shortInfo,
                        originalAnalysis: draftForm.originalAnalysis,
                        eligibility: draftForm.eligibility,
                        lastDate: draftForm.lastDate,
                        postDate: new Date().toLocaleDateString('en-GB'),
                        officialNotificationUrl: draftForm.officialNotificationUrl,
                        officialLink: draftForm.officialNotificationUrl,
                        sourceExcerpt: item.sourceExcerpt,
                      },
                      { minWordCount: 400, enforceWordCount: true, maxConsecutiveCopiedSentences: 2 }
                    )
                  : null;
              const duplicateList: string[] = Array.isArray(item.duplicateMatches) ? item.duplicateMatches : [];

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                          {item.reviewStatus === 'verified' ? 'Verified' : 'UNREVIEWED'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.kind === 'update_proposal'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {item.kind === 'update_proposal' ? 'Update Proposal' : 'New Draft'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.confidence < 90
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          Confidence: {item.confidence}%
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">{item.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#102A43]">{item.title}</h4>
                      <p className="text-xs text-[#475569]">{item.shortInfo}</p>

                      {duplicateList.length > 0 && (
                        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-900 font-semibold">
                          Duplicate Warning: Possible match with existing post(s): {duplicateList.join('; ')}
                        </div>
                      )}

                      {Array.isArray(item.validationFlags) && item.validationFlags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.validationFlags.map((flag: string, i: number) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10.5px] font-semibold"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={item.officialNotificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => (isEditing ? setEditingId(null) : openReviewEditor(item))}
                        className="px-3 py-1.5 rounded-lg bg-[#175CEE] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Close Editor' : 'Review & Rewrite'}</span>
                      </button>
                      <button
                        type="button"
                        disabled={submittingId === item.id}
                        onClick={() => handleDecision(item.id, 'dismiss')}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {isEditing && draftForm && liveQuality && (
                    <div className="mt-3 pt-3 border-t border-slate-200 bg-white rounded-xl p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#102A43]">
                          Human Editorial Rewrite (Saves as Unpublished Draft)
                        </span>
                        <div className="flex items-center gap-3 text-[11px] font-bold">
                          <span className={liveQuality.wordCount >= 400 ? 'text-emerald-600' : 'text-amber-700'}>
                            Words: {liveQuality.wordCount} / 400
                          </span>
                          <span className={liveQuality.copiedCheck.hasExcessiveCopy ? 'text-rose-600' : 'text-emerald-600'}>
                            {liveQuality.copiedCheck.hasExcessiveCopy
                              ? `Copied run: ${liveQuality.copiedCheck.runLength} sentences (>2 blocked)`
                              : 'Original phrasing OK'}
                          </span>
                        </div>
                      </div>

                      {item.sourceExcerpt && (
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                          <strong className="block text-slate-700 mb-0.5">Captured Official Portal Excerpt (do not copy &gt;2 consecutive sentences verbatim):</strong>
                          <span className="line-clamp-3">{item.sourceExcerpt}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Rewritten Title *</label>
                          <input
                            type="text"
                            value={draftForm.title}
                            onChange={(e) => setDraftForm({ ...draftForm, title: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Official Source URL *</label>
                          <input
                            type="url"
                            value={draftForm.officialNotificationUrl}
                            onChange={(e) => setDraftForm({ ...draftForm, officialNotificationUrl: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Eligibility / Target Group *</label>
                          <input
                            type="text"
                            value={draftForm.eligibility}
                            onChange={(e) => setDraftForm({ ...draftForm, eligibility: e.target.value })}
                            placeholder="Exact qualification or learner stream from circular"
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Closing / Reference Date *</label>
                          <input
                            type="text"
                            value={draftForm.lastDate}
                            onChange={(e) => setDraftForm({ ...draftForm, lastDate: e.target.value })}
                            placeholder="DD/MM/YYYY or As per official notice"
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Original Plain-Language Summary * ({countWords(draftForm.shortInfo)} words)
                        </label>
                        <textarea
                          rows={2}
                          value={draftForm.shortInfo}
                          onChange={(e) => setDraftForm({ ...draftForm, shortInfo: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Original Citizen Guidance, Checklist &amp; Verification Analysis * ({countWords(draftForm.originalAnalysis)} words)
                        </label>
                        <textarea
                          rows={4}
                          value={draftForm.originalAnalysis}
                          onChange={(e) => setDraftForm({ ...draftForm, originalAnalysis: e.target.value })}
                          placeholder="Write original guidance explaining dates, eligibility steps, required documents, and how applicants should verify the PDF before applying (total 400+ words across all fields)..."
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      {duplicateList.length > 0 && (
                        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-900 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftForm.confirmNotDuplicate}
                            onChange={(e) => setDraftForm({ ...draftForm, confirmNotDuplicate: e.target.checked })}
                          />
                          <span>I checked the existing posts above and confirm this notice is distinct (not a duplicate).</span>
                        </label>
                      )}

                      {reviewError && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
                          {reviewError}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={submittingId === item.id}
                          onClick={() => handleDecision(item.id, 'approve_draft', draftForm)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {submittingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Approve as Unpublished Draft</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monitored Sources Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
            Monitored Official Sources ({sources.length})
          </h3>
          <div className="divide-y divide-slate-100">
            {sources.map((src) => (
              <div key={src.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <div className="font-bold text-[#102A43] truncate">{src.name}</div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">{src.url}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {src.lastStatus === 'failing' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Failing ({src.consecutiveFailures})
                    </span>
                  ) : src.lastStatus === 'ok' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Healthy
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>Recent Monitor Runs ({runs.length})</span>
          </h3>
          {runs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No monitor runs recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {runs.slice(0, 10).map((run) => (
                <div key={run.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-semibold text-[#102A43]">
                      {run.trigger} &bull; {run.status === 'crashed' ? 'Crashed' : 'Completed'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Drafts: {run.newDrafts} | Updates: {run.updateProposals} | Careful: {run.carefulReview} | Failing: {run.sourcesFailing}
                    </div>
                  </div>
                  <span className="font-mono text-[10.5px] text-slate-400 shrink-0">
                    {new Date(run.completedAt).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
