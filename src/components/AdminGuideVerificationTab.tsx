import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  History,
  RefreshCw,
  Save,
  ShieldCheck,
  Undo2,
} from 'lucide-react';
import type { GuideArticle } from '../data/guidesData';
import {
  countGuideWords,
  extractGuideVerifyMarkers,
  validateGuideReadyForPublish,
} from '../utils/guidesMerge';

interface GuideItemWithMeta extends GuideArticle {
  verifyCount?: number;
  wordCount?: number;
  verifiedMarkers?: string[];
}

interface GuideVerificationLogItem {
  id: string;
  guideId: string;
  action: string;
  actor: string;
  timestamp: string;
  officialUrl?: string;
  notes?: string;
}

interface AdminGuideVerificationTabProps {
  adminToken?: string;
}

export default function AdminGuideVerificationTab({ adminToken }: AdminGuideVerificationTabProps) {
  const [guides, setGuides] = useState<GuideItemWithMeta[]>([]);
  const [logs, setLogs] = useState<GuideVerificationLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'draft' | 'published' | 'all'>('draft');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Editable draft form state for the active guide
  const [officialPortal, setOfficialPortal] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [benefitSummary, setBenefitSummary] = useState('');
  const [sectionsState, setSectionsState] = useState<GuideArticle['sections']>([]);
  const [eligibilityText, setEligibilityText] = useState('');
  const [documentsText, setDocumentsText] = useState('');
  const [stepByStepText, setStepByStepText] = useState('');
  const [faqsState, setFaqsState] = useState<GuideArticle['faqs']>([]);
  const [checkedMarkers, setCheckedMarkers] = useState<Record<string, boolean>>({});
  const [verifierName, setVerifierName] = useState('Wasim Ahmad Khanday (CSC VLE)');
  const [verifiedDate, setVerifiedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [confirmVerified, setConfirmVerified] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const getToken = () =>
    adminToken || (typeof window !== 'undefined' ? sessionStorage.getItem('csc_admin_token') || '' : '');

  const loadGuides = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/staff/guides', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'err', text: data.error || 'Failed to load guide verification queue.' });
        return;
      }
      setGuides(data.guides || []);
      setLogs(data.logs || []);
      if (!selectedId && Array.isArray(data.guides) && data.guides.length > 0) {
        const firstDraft = data.guides.find((g: GuideItemWithMeta) => g.status === 'draft') || data.guides[0];
        selectGuideForEdit(firstDraft);
      } else if (selectedId && Array.isArray(data.guides)) {
        const refreshed = data.guides.find((g: GuideItemWithMeta) => g.id === selectedId);
        if (refreshed) selectGuideForEdit(refreshed);
      }
    } catch {
      setStatusMessage({ type: 'err', text: 'Network error while loading guide verification queue.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuides();
  }, []);

  const selectGuideForEdit = (guide: GuideItemWithMeta) => {
    setSelectedId(guide.id);
    setOfficialPortal(guide.officialPortal || '');
    setOfficialUrl(guide.officialUrl || '');
    setSummary(guide.summary || '');
    setBenefitSummary(guide.benefitSummary || '');
    setSectionsState(JSON.parse(JSON.stringify(guide.sections || [])));
    setEligibilityText((guide.eligibility || []).join('\n'));
    setDocumentsText((guide.documentsRequired || []).join('\n'));
    setStepByStepText((guide.stepByStep || []).join('\n'));
    setFaqsState(JSON.parse(JSON.stringify(guide.faqs || [])));
    const existingMap: Record<string, boolean> = {};
    (guide.verifiedMarkers || []).forEach((k) => {
      existingMap[k] = true;
    });
    setCheckedMarkers(existingMap);
    if (guide.verifierName) setVerifierName(guide.verifierName);
    if (guide.verifiedDate) setVerifiedDate(guide.verifiedDate);
    setConfirmVerified(false);
    setReviewNotes('');
    setStatusMessage(null);
  };

  const selectedGuide = useMemo(
    () => guides.find((g) => g.id === selectedId) || null,
    [guides, selectedId]
  );

  const liveCandidateGuide = useMemo<GuideArticle | null>(() => {
    if (!selectedGuide) return null;
    return {
      ...selectedGuide,
      officialPortal,
      officialUrl,
      summary,
      benefitSummary,
      sections: sectionsState,
      eligibility: eligibilityText.split('\n').map((s) => s.trim()).filter(Boolean),
      documentsRequired: documentsText.split('\n').map((s) => s.trim()).filter(Boolean),
      stepByStep: stepByStepText.split('\n').map((s) => s.trim()).filter(Boolean),
      faqs: faqsState,
    };
  }, [
    selectedGuide,
    officialPortal,
    officialUrl,
    summary,
    benefitSummary,
    sectionsState,
    eligibilityText,
    documentsText,
    stepByStepText,
    faqsState,
  ]);

  const liveMarkers = useMemo(() => {
    if (!liveCandidateGuide) return [];
    return extractGuideVerifyMarkers(liveCandidateGuide).filter(
      (m) => !m.field.startsWith('verifyNotes[')
    );
  }, [liveCandidateGuide]);

  const liveWordCount = useMemo(() => {
    if (!liveCandidateGuide) return 0;
    return countGuideWords(liveCandidateGuide);
  }, [liveCandidateGuide]);

  const publishReadiness = useMemo(() => {
    if (!liveCandidateGuide) return { ok: false, errors: [] as string[] };
    return validateGuideReadyForPublish(liveCandidateGuide, {
      confirmChecked: confirmVerified,
      verifierName,
    });
  }, [liveCandidateGuide, confirmVerified, verifierName]);

  const counts = useMemo(() => {
    const drafts = guides.filter((g) => g.status === 'draft').length;
    const published = guides.filter((g) => g.status !== 'draft').length;
    const verifyPending = guides.filter((g) => (g.verifyCount || 0) > 0).length;
    return { drafts, published, verifyPending, total: guides.length };
  }, [guides]);

  const visibleGuides = useMemo(() => {
    if (filterMode === 'draft') return guides.filter((g) => g.status === 'draft');
    if (filterMode === 'published') return guides.filter((g) => g.status !== 'draft');
    return guides;
  }, [guides, filterMode]);

  const buildOverridesPayload = () => ({
    officialPortal: officialPortal.trim(),
    officialUrl: officialUrl.trim(),
    summary: summary.trim(),
    benefitSummary: benefitSummary.trim(),
    sections: sectionsState,
    eligibility: eligibilityText.split('\n').map((s) => s.trim()).filter(Boolean),
    documentsRequired: documentsText.split('\n').map((s) => s.trim()).filter(Boolean),
    stepByStep: stepByStepText.split('\n').map((s) => s.trim()).filter(Boolean),
    faqs: faqsState,
  });

  const handleSaveDraft = async () => {
    if (!selectedGuide) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/staff/guides/${encodeURIComponent(selectedGuide.id)}/save-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          officialPortal: officialPortal.trim(),
          officialUrl: officialUrl.trim(),
          verifiedMarkers: Object.keys(checkedMarkers).filter((k) => checkedMarkers[k]),
          verifierName: verifierName.trim(),
          verifiedDate,
          notes: reviewNotes.trim(),
          overrides: buildOverridesPayload(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'err', text: data.error || 'Could not save guide draft.' });
      } else {
        setStatusMessage({ type: 'ok', text: `Saved draft changes for ${selectedGuide.id}.` });
        await loadGuides();
      }
    } catch {
      setStatusMessage({ type: 'err', text: 'Failed to save guide draft.' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyAndPublish = async () => {
    if (!selectedGuide) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/staff/guides/${encodeURIComponent(selectedGuide.id)}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          officialPortal: officialPortal.trim(),
          officialUrl: officialUrl.trim(),
          verifiedMarkers: Object.keys(checkedMarkers).filter((k) => checkedMarkers[k]),
          verifierName: verifierName.trim(),
          verifiedDate,
          confirmVerified,
          notes: reviewNotes.trim(),
          overrides: buildOverridesPayload(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({
          type: 'err',
          text: data.error || 'Verification gate blocked publishing.',
        });
      } else {
        setStatusMessage({
          type: 'ok',
          text: `Verified & published "${selectedGuide.title}". Now live on /scheme/${selectedGuide.id} and included in /sitemap.xml.`,
        });
        await loadGuides();
      }
    } catch {
      setStatusMessage({ type: 'err', text: 'Network error during verify & publish.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRevertDraft = async (guide: GuideItemWithMeta) => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/staff/guides/${encodeURIComponent(guide.id)}/save-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          forceStatus: 'draft',
          verifierName: verifierName.trim(),
          notes: 'Moved back to draft for re-verification',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'err', text: data.error || 'Could not revert guide to draft.' });
      } else {
        setStatusMessage({ type: 'ok', text: `Moved "${guide.id}" back to draft.` });
        await loadGuides();
      }
    } catch {
      setStatusMessage({ type: 'err', text: 'Failed to revert guide to draft.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2 m-0">
            <BookOpen className="w-5 h-5 text-[#1F9D6B]" />
            <span>Guide Verification & Publishing</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 m-0">
            Draft guides remain hidden from visitors and sitemap.xml until every [VERIFY] placeholder is verified on the official portal and removed.
          </p>
        </div>
        <button
          type="button"
          onClick={loadGuides}
          disabled={loading}
          className="px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[var(--bg-subtle)]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">Draft Guides</div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{counts.drafts}</div>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Published Live</div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{counts.published}</div>
        </div>
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
          <div className="text-[11px] font-bold uppercase text-rose-600 dark:text-rose-400">Needs [VERIFY] Check</div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{counts.verifyPending}</div>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-3">
          <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">Total Guides</div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{counts.total}</div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold ${
            statusMessage.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {(['draft', 'published', 'all'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setFilterMode(mode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
              filterMode === mode
                ? 'bg-[#101A36] text-white border-[#101A36]'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            {mode === 'draft'
              ? `Drafts (${counts.drafts})`
              : mode === 'published'
              ? `Published (${counts.published})`
              : `All (${counts.total})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Guide list sidebar */}
        <div className="lg:col-span-4 space-y-2 max-h-[680px] overflow-y-auto pr-1">
          {visibleGuides.map((g) => {
            const markers = extractGuideVerifyMarkers(g).filter((m) => !m.field.startsWith('verifyNotes['));
            const isSelected = selectedId === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => selectGuideForEdit(g)}
                className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/10 border-[#1F9D6B]'
                    : 'bg-[var(--bg-card)] border-[var(--border-default)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      g.status === 'draft'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {g.status === 'draft' ? 'DRAFT' : 'PUBLISHED'}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {countGuideWords(g)}w · {markers.length} [VERIFY]
                  </span>
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)] line-clamp-2">{g.title}</div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">{g.id}</div>
              </button>
            );
          })}
        </div>

        {/* Guide Editor & Verification Panel */}
        <div className="lg:col-span-8 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-4">
          {!selectedGuide || !liveCandidateGuide ? (
            <p className="text-sm text-[var(--text-muted)]">Select a guide from the left list to review and verify.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-default)] pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        selectedGuide.status === 'draft'
                          ? 'bg-amber-500/15 text-amber-600'
                          : 'bg-emerald-500/15 text-emerald-600'
                      }`}
                    >
                      {selectedGuide.status === 'draft' ? 'DRAFT (Noindex / Hidden)' : 'PUBLISHED (Live in Sitemap)'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        liveWordCount >= 400 ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
                      }`}
                    >
                      {liveWordCount} words (min 400)
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        liveMarkers.length === 0 ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
                      }`}
                    >
                      {liveMarkers.length} [VERIFY] tags remaining
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)] m-0">{selectedGuide.title}</h3>
                </div>
                {selectedGuide.status !== 'draft' && (
                  <button
                    type="button"
                    onClick={() => handleRevertDraft(selectedGuide)}
                    disabled={saving}
                    className="px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer hover:bg-[var(--bg-subtle)]"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Move to Draft</span>
                  </button>
                )}
              </div>

              {/* Verify Notes & Pending [VERIFY] Markers Checklist */}
              {(selectedGuide.verifyNotes?.length || liveMarkers.length > 0) && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Verification Checklist — Check Official Portal & Remove [VERIFY] Placeholders Below</span>
                  </div>
                  {selectedGuide.verifyNotes && selectedGuide.verifyNotes.length > 0 && (
                    <ul className="text-xs text-[var(--text-secondary)] list-disc pl-5 space-y-1 m-0">
                      {selectedGuide.verifyNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  )}
                  {liveMarkers.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {liveMarkers.map((m, idx) => {
                        const key = `${m.field}::${m.markerText}`;
                        return (
                          <label
                            key={`${key}-${idx}`}
                            className="flex items-start gap-2 text-xs bg-[var(--bg-card)] p-2 rounded-lg border border-[var(--border-default)] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(checkedMarkers[key])}
                              onChange={(e) =>
                                setCheckedMarkers((prev) => ({ ...prev, [key]: e.target.checked }))
                              }
                              className="mt-0.5 accent-[#1F9D6B]"
                            />
                            <div className="min-w-0">
                              <span className="font-mono font-bold text-[11px] text-amber-700 dark:text-amber-400">
                                {m.field}
                              </span>{' '}
                              <span className="font-semibold text-[var(--text-primary)]">{m.markerText}</span>
                              <div className="text-[11px] text-[var(--text-muted)] truncate">{m.context}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>All [VERIFY] placeholders cleared from guide body!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Official Portal & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    Official Portal Name
                  </label>
                  <input
                    type="text"
                    value={officialPortal}
                    onChange={(e) => setOfficialPortal(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    Official Portal URL (verified source)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      value={officialUrl}
                      onChange={(e) => setOfficialUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-mono"
                    />
                    {officialUrl && (
                      <a
                        href={officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-2 rounded-lg border border-[var(--border-default)] inline-flex items-center text-[#1F9D6B]"
                        title="Open official portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Editable Guide Content Fields (so staff can replace [VERIFY] tags accurately) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    Summary
                  </label>
                  <textarea
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    Benefit Summary
                  </label>
                  <input
                    type="text"
                    value={benefitSummary}
                    onChange={(e) => setBenefitSummary(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs"
                  />
                </div>
              </div>

              {/* Section Paragraphs */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold text-[var(--text-primary)]">Detailed Sections</div>
                {sectionsState.map((sec, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-2">
                    <div className="text-xs font-bold text-[var(--text-primary)]">{sec.heading}</div>
                    <textarea
                      rows={3}
                      value={sec.content}
                      onChange={(e) => {
                        const next = [...sectionsState];
                        next[idx] = { ...next[idx], content: e.target.value };
                        setSectionsState(next);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-xs"
                    />
                    {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1">
                          Bullet Points (one per line)
                        </label>
                        <textarea
                          rows={Math.max(2, sec.bulletPoints.length)}
                          value={sec.bulletPoints.join('\n')}
                          onChange={(e) => {
                            const next = [...sectionsState];
                            next[idx] = {
                              ...next[idx],
                              bulletPoints: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                            };
                            setSectionsState(next);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-xs"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Eligibility, Documents, Step-by-Step */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    Eligibility Items (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={eligibilityText}
                    onChange={(e) => setEligibilityText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    Documents Required (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={documentsText}
                    onChange={(e) => setDocumentsText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    Step-by-Step Walkthrough (one step per line)
                  </label>
                  <textarea
                    rows={4}
                    value={stepByStepText}
                    onChange={(e) => setStepByStepText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs"
                  />
                </div>
              </div>

              {/* FAQs */}
              {faqsState.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-[var(--text-primary)]">FAQs</div>
                  {faqsState.map((faq, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-1.5">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const next = [...faqsState];
                          next[idx] = { ...next[idx], question: e.target.value };
                          setFaqsState(next);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => {
                          const next = [...faqsState];
                          next[idx] = { ...next[idx], answer: e.target.value };
                          setFaqsState(next);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Verifier Attribution & Publish Gate */}
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                      Verifier Name (shown as Reviewed by)
                    </label>
                    <input
                      type="text"
                      value={verifierName}
                      onChange={(e) => setVerifierName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                      Verified Date
                    </label>
                    <input
                      type="date"
                      value={verifiedDate}
                      onChange={(e) => setVerifiedDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    Verification Notes (optional audit note)
                  </label>
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="e.g. Checked latest 2026 circular on official portal"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-xs"
                  />
                </div>

                <label className="flex items-start gap-2 text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmVerified}
                    onChange={(e) => setConfirmVerified(e.target.checked)}
                    className="mt-0.5 accent-[#1F9D6B]"
                  />
                  <span>
                    I confirm every fact, fee, date, eligibility norm, and link in this guide has been verified directly on the official authority portal.
                  </span>
                </label>

                {!publishReadiness.ok && publishReadiness.errors.length > 0 && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 space-y-1 bg-amber-500/10 p-2.5 rounded-lg">
                    {publishReadiness.errors.map((err, i) => (
                      <div key={i}>• {err}</div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[var(--bg-subtle)]"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Draft</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyAndPublish}
                    disabled={saving || !publishReadiness.ok}
                    className="px-4 py-2 rounded-xl bg-[#1F9D6B] disabled:opacity-45 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#178257]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify &amp; Publish Live</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Audit log */}
      {logs.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 space-y-2">
          <div className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#1F9D6B]" />
            <span>Guide Verification Audit Log</span>
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {logs.slice(0, 20).map((l) => (
              <div key={l.id} className="text-[11px] flex flex-wrap items-center justify-between gap-2 py-1 border-b border-[var(--border-default)] last:border-0">
                <div>
                  <span className="font-mono font-bold text-[#1F9D6B]">{l.action}</span>{' '}
                  <span className="font-semibold text-[var(--text-primary)]">{l.guideId}</span>{' '}
                  <span className="text-[var(--text-muted)]">by {l.actor}</span>
                  {l.notes ? <span className="text-[var(--text-secondary)]"> — {l.notes}</span> : null}
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {new Date(l.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
