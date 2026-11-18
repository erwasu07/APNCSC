import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  ExternalLink,
  EyeOff,
  FileText,
  GitMerge,
  History,
  Layers,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { evaluatePostCopyAndWords } from '../utils/contentAuditRules';
import { validateServiceReadyToPublish } from '../utils/serviceMetadata';
import type { ServiceItem } from '../servicesData';

interface ContentHealthItem {
  id: string;
  url: string;
  kind: 'post' | 'guide' | 'static' | 'service' | 'tool';
  title: string;
  auditClass: 'A' | 'B' | 'C' | 'D';
  wordCount: number;
  hasOfficialLink: boolean;
  hasLastUpdated: boolean;
  publicationStatus?: 'published' | 'draft' | 'archived';
  robotsNoindex?: boolean;
  duplicateOfId?: string;
  hasVerifyPlaceholders?: boolean;
  missingVerifyFields?: string[];
  clusterId?: string;
  reasons: string[];
  rawPost?: {
    id: string;
    title: string;
    shortInfo?: string;
    summary?: string;
    eligibility?: string;
    lastDate?: string;
    postDate?: string;
    officialNotificationUrl?: string;
    officialLink?: string;
    howToApply?: string[];
    selectionProcess?: string[];
    documentsRequired?: string[];
    faq?: { q: string; a: string }[];
    notes?: string;
    sourceExcerpt?: string;
  };
  rawService?: {
    id: string;
    name: string;
    category: ServiceItem['category'];
    description: string;
    issuingAuthority?: string;
    officialFee?: string;
    cscCharge?: string;
    eligibility?: string;
    requirements?: string[];
    estimatedTime?: string;
    price?: string;
    feeLines?: string[];
    officialUrl?: string;
    stepFlow?: string[];
    staffChecks?: string[];
    rejectionReasons?: string[];
    lastVerifiedDate?: string;
    notes?: string;
  };
}

interface MergeClusterSuggestion {
  clusterId: string;
  title: string;
  hubPath: string;
  summary: string;
  issuingAuthority: string;
  memberIds: string[];
  memberCount: number;
  approved: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
}

interface ContentHealthLogEntry {
  id: string;
  postId: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

interface AdminContentHealthTabProps {
  adminToken?: string;
}

const FLAG_VERIFY_HINT = (val?: string) => {
  const s = String(val || '').trim();
  return !s || /\[VERIFY\]/i.test(s) || /^ask us$/i.test(s) || /^as per official/i.test(s) || /^refer official/i.test(s);
};

export default function AdminContentHealthTab({ adminToken }: AdminContentHealthTabProps) {
  const [items, setItems] = useState<ContentHealthItem[]>([]);
  const [mergeClusters, setMergeClusters] = useState<MergeClusterSuggestion[]>([]);
  const [logs, setLogs] = useState<ContentHealthLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState<'BCD' | 'ALL' | 'A' | 'B' | 'C' | 'D'>('BCD');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Edit & Enrich modal state (Posts + Services)
  const [enrichItem, setEnrichItem] = useState<ContentHealthItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formShortInfo, setFormShortInfo] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formEligibility, setFormEligibility] = useState('');
  const [formLastDate, setFormLastDate] = useState('');
  const [formOfficialUrl, setFormOfficialUrl] = useState('');
  const [formHowToApply, setFormHowToApply] = useState('');
  const [formSelectionProcess, setFormSelectionProcess] = useState('');
  const [formDocumentsRequired, setFormDocumentsRequired] = useState('');
  const [formFaq, setFormFaq] = useState<{ q: string; a: string }[]>([]);
  const [formNotes, setFormNotes] = useState('');

  // Service-specific verification form fields
  const [svcName, setSvcName] = useState('');
  const [svcDescription, setSvcDescription] = useState('');
  const [svcAuthority, setSvcAuthority] = useState('');
  const [svcOfficialFee, setSvcOfficialFee] = useState('');
  const [svcCscCharge, setSvcCscCharge] = useState('');
  const [svcEligibility, setSvcEligibility] = useState('');
  const [svcRequirements, setSvcRequirements] = useState('');
  const [svcEstimatedTime, setSvcEstimatedTime] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcFeeLines, setSvcFeeLines] = useState('');
  const [svcOfficialUrl, setSvcOfficialUrl] = useState('');
  const [svcStepFlow, setSvcStepFlow] = useState('');
  const [svcStaffChecks, setSvcStaffChecks] = useState('');
  const [svcRejectionReasons, setSvcRejectionReasons] = useState('');
  const [svcLastVerifiedDate, setSvcLastVerifiedDate] = useState('');

  // Merge 301 modal & Cluster Merge confirmation
  const [mergeSource, setMergeSource] = useState<ContentHealthItem | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [clusterConfirm, setClusterConfirm] = useState<{
    cluster: MergeClusterSuggestion;
    action: 'approve' | 'revert';
  } | null>(null);

  // Bulk Noindex Class C & Class D modals
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkClassDModal, setShowBulkClassDModal] = useState(false);

  const getToken = () =>
    adminToken || (typeof window !== 'undefined' ? sessionStorage.getItem('csc_admin_token') || '' : '');

  const fetchContentHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/content-health', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'err', text: data.error || 'Failed to load content health overview.' });
        return;
      }
      setItems(data.items || []);
      setMergeClusters(data.mergeClusters || []);
      setLogs(data.logs || []);
    } catch {
      setStatusMessage({ type: 'err', text: 'Network error loading Content Health data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentHealth();
  }, []);

  const summary = useMemo(() => {
    return {
      A: items.filter((i) => i.auditClass === 'A').length,
      B: items.filter((i) => i.auditClass === 'B').length,
      C: items.filter((i) => i.auditClass === 'C').length,
      D: items.filter((i) => i.auditClass === 'D').length,
      noindex: items.filter((i) => i.robotsNoindex).length,
      drafts: items.filter((i) => i.publicationStatus === 'draft').length,
      total: items.length,
    };
  }, [items]);

  const classCModifiablePosts = useMemo(
    () => items.filter((i) => i.auditClass === 'C' && i.kind === 'post' && !i.robotsNoindex && !i.duplicateOfId),
    [items]
  );

  const classDModifiableItems = useMemo(
    () =>
      items.filter(
        (i) =>
          i.auditClass === 'D' &&
          (i.kind === 'post' || i.kind === 'service') &&
          !i.robotsNoindex &&
          !i.duplicateOfId
      ),
    [items]
  );

  const publishablePostTargets = useMemo(
    () =>
      items.filter(
        (i) => i.kind === 'post' && i.publicationStatus !== 'draft' && !i.duplicateOfId
      ),
    [items]
  );

  const publishableServiceTargets = useMemo(
    () =>
      items.filter(
        (i) => i.kind === 'service' && i.publicationStatus !== 'draft' && !i.duplicateOfId
      ),
    [items]
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (classFilter === 'BCD' && item.auditClass === 'A') return false;
      if (['A', 'B', 'C', 'D'].includes(classFilter) && item.auditClass !== classFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.reasons.some((r) => r.toLowerCase().includes(q))
      );
    });
  }, [items, classFilter, searchQuery]);

  const openEnrichModal = (item: ContentHealthItem) => {
    setEnrichItem(item);
    setStatusMessage(null);
    if (item.kind === 'service' && item.rawService) {
      const s = item.rawService;
      setSvcName(s.name || item.title || '');
      setSvcDescription(s.description || '');
      setSvcAuthority(s.issuingAuthority || '');
      setSvcOfficialFee(s.officialFee || '');
      setSvcCscCharge(s.cscCharge || '');
      setSvcEligibility(s.eligibility || '');
      setSvcRequirements((s.requirements || []).join('\n'));
      setSvcEstimatedTime(s.estimatedTime || '');
      setSvcPrice(s.price || '');
      setSvcFeeLines((s.feeLines || []).join('\n'));
      setSvcOfficialUrl(s.officialUrl || '');
      setSvcStepFlow((s.stepFlow || []).join('\n'));
      setSvcStaffChecks((s.staffChecks || []).join('\n'));
      setSvcRejectionReasons((s.rejectionReasons || []).join('\n'));
      setSvcLastVerifiedDate(s.lastVerifiedDate || '');
      return;
    }
    const p = item.rawPost;
    setFormTitle(p?.title || item.title || '');
    setFormShortInfo(p?.shortInfo || '');
    setFormSummary(p?.summary || '');
    setFormEligibility(p?.eligibility || '');
    setFormLastDate(p?.lastDate || '');
    setFormOfficialUrl(p?.officialNotificationUrl || p?.officialLink || '');
    setFormHowToApply((p?.howToApply || []).join('\n'));
    setFormSelectionProcess((p?.selectionProcess || []).join('\n'));
    setFormDocumentsRequired((p?.documentsRequired || []).join('\n'));
    setFormFaq(Array.isArray(p?.faq) ? [...p.faq] : []);
    setFormNotes(p?.notes || '');
  };

  const liveEnrichMetrics = useMemo(() => {
    const combined = [
      formTitle,
      formShortInfo,
      formSummary,
      formEligibility,
      formNotes,
      formHowToApply,
      formSelectionProcess,
      formDocumentsRequired,
      formFaq.map((f) => `${f.q} ${f.a}`).join(' '),
    ]
      .filter(Boolean)
      .join(' ');
    return evaluatePostCopyAndWords(combined, enrichItem?.rawPost?.sourceExcerpt);
  }, [
    formTitle,
    formShortInfo,
    formSummary,
    formEligibility,
    formNotes,
    formHowToApply,
    formSelectionProcess,
    formDocumentsRequired,
    formFaq,
    enrichItem,
  ]);

  const liveServiceValidation = useMemo(() => {
    if (!enrichItem || enrichItem.kind !== 'service' || !enrichItem.rawService) {
      return { canPublish: false, missingFields: [] as string[], errors: [] as string[] };
    }
    const candidate: ServiceItem = {
      id: enrichItem.id,
      name: svcName.trim() || enrichItem.rawService.name,
      category: enrichItem.rawService.category,
      description: svcDescription.trim(),
      issuingAuthority: svcAuthority.trim(),
      officialFee: svcOfficialFee.trim(),
      cscCharge: svcCscCharge.trim(),
      eligibility: svcEligibility.trim(),
      requirements: svcRequirements.split('\n').map((s) => s.trim()).filter(Boolean),
      estimatedTime: svcEstimatedTime.trim(),
      price: svcPrice.trim(),
      feeLines: svcFeeLines.split('\n').map((s) => s.trim()).filter(Boolean),
      officialUrl: svcOfficialUrl.trim(),
      stepFlow: svcStepFlow.split('\n').map((s) => s.trim()).filter(Boolean),
      staffChecks: svcStaffChecks.split('\n').map((s) => s.trim()).filter(Boolean),
      rejectionReasons: svcRejectionReasons.split('\n').map((s) => s.trim()).filter(Boolean),
      lastVerifiedDate: svcLastVerifiedDate.trim(),
      requirementsList: [],
    } as ServiceItem;
    return validateServiceReadyToPublish(candidate);
  }, [
    enrichItem,
    svcName,
    svcDescription,
    svcAuthority,
    svcOfficialFee,
    svcCscCharge,
    svcEligibility,
    svcRequirements,
    svcEstimatedTime,
    svcPrice,
    svcFeeLines,
    svcOfficialUrl,
    svcStepFlow,
    svcStaffChecks,
    svcRejectionReasons,
    svcLastVerifiedDate,
  ]);

  const handleSaveEnrich = async (targetStatus: 'draft' | 'published') => {
    if (!enrichItem) return;
    setBusy(true);
    setStatusMessage(null);
    try {
      if (enrichItem.kind === 'service') {
        const res = await fetch('/api/staff/content-health/service/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            id: enrichItem.id,
            publicationStatus: targetStatus,
            name: svcName.trim(),
            description: svcDescription.trim(),
            issuingAuthority: svcAuthority.trim(),
            officialFee: svcOfficialFee.trim(),
            cscCharge: svcCscCharge.trim(),
            eligibility: svcEligibility.trim(),
            requirements: svcRequirements.split('\n').map((s) => s.trim()).filter(Boolean),
            estimatedTime: svcEstimatedTime.trim(),
            price: svcPrice.trim(),
            feeLines: svcFeeLines.split('\n').map((s) => s.trim()).filter(Boolean),
            officialUrl: svcOfficialUrl.trim(),
            stepFlow: svcStepFlow.split('\n').map((s) => s.trim()).filter(Boolean),
            staffChecks: svcStaffChecks.split('\n').map((s) => s.trim()).filter(Boolean),
            rejectionReasons: svcRejectionReasons.split('\n').map((s) => s.trim()).filter(Boolean),
            lastVerifiedDate: svcLastVerifiedDate.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setStatusMessage({ type: 'err', text: data.error || 'Failed to save service verification.' });
        } else {
          setStatusMessage({
            type: 'ok',
            text: `Saved service "${enrichItem.id}" as ${targetStatus}.`,
          });
          setEnrichItem(null);
          await fetchContentHealth();
        }
        return;
      }

      const res = await fetch('/api/staff/content-health/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          id: enrichItem.id,
          publicationStatus: targetStatus,
          title: formTitle.trim(),
          shortInfo: formShortInfo.trim(),
          summary: formSummary.trim(),
          eligibility: formEligibility.trim(),
          lastDate: formLastDate.trim(),
          officialNotificationUrl: formOfficialUrl.trim(),
          howToApply: formHowToApply.split('\n').map((s) => s.trim()).filter(Boolean),
          selectionProcess: formSelectionProcess.split('\n').map((s) => s.trim()).filter(Boolean),
          documentsRequired: formDocumentsRequired.split('\n').map((s) => s.trim()).filter(Boolean),
          faq: formFaq.filter((f) => f.q.trim() && f.a.trim()),
          notes: formNotes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'err', text: data.error || 'Failed to save enriched post.' });
      } else {
        setStatusMessage({
          type: 'ok',
          text: `Saved "${enrichItem.id}" as ${targetStatus} (${liveEnrichMetrics.wordCount} words).`,
        });
        setEnrichItem(null);
        await fetchContentHealth();
      }
    } catch {
      setStatusMessage({ type: 'err', text: 'Network error saving enriched item.' });
    } finally {
      setBusy(false);
    }
  };

  const handleQuickAction = async (
    id: string,
    action: 'set_draft' | 'set_published' | 'mark_noindex' | 'clear_noindex' | 'merge_301',
    targetId?: string,
    kind: 'post' | 'service' = 'post'
  ) => {
    setBusy(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/staff/content-health/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ id, action, targetId, kind }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'err', text: data.error || 'Action failed.' });
      } else {
        setStatusMessage({ type: 'ok', text: data.message || `Updated ${id}.` });
        setMergeSource(null);
        setMergeTargetId('');
        await fetchContentHealth();
      }
    } catch {
      setStatusMessage({ type: 'err', text: 'Network error performing content health action.' });
    } finally {
      setBusy(false);
    }
  };

  const handleMergeGroupAction = async (clusterId: string, action: 'approve' | 'revert') => {
    setBusy(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/staff/content-health/merge-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ clusterId, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'err', text: data.error || 'Merge group action failed.' });
      } else {
        setStatusMessage({ type: 'ok', text: data.message || `Updated merge cluster ${clusterId}.` });
        setClusterConfirm(null);
        await fetchContentHealth();
      }
    } catch {
      setStatusMessage({ type: 'err', text: 'Network error updating merge group.' });
    } finally {
      setBusy(false);
    }
  };

  const handleBulkNoindexClassC = async () => {
    setBusy(true);
    setStatusMessage(null);
    try {
      const ids = classCModifiablePosts.map((i) => i.id);
      const res = await fetch('/api/staff/content-health/bulk-noindex-class-c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ postIds: ids }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'err', text: data.error || 'Bulk noindex failed.' });
      } else {
        setStatusMessage({
          type: 'ok',
          text: `Marked ${data.updatedCount} Class C post(s) as noindex, follow and removed them from /sitemap.xml.`,
        });
        setShowBulkModal(false);
        await fetchContentHealth();
      }
    } catch {
      setStatusMessage({ type: 'err', text: 'Network error during bulk Class C noindex.' });
    } finally {
      setBusy(false);
    }
  };

  const handleBulkNoindexClassD = async () => {
    setBusy(true);
    setStatusMessage(null);
    try {
      const postIds = classDModifiableItems.filter((i) => i.kind === 'post').map((i) => i.id);
      const serviceIds = classDModifiableItems.filter((i) => i.kind === 'service').map((i) => i.id);
      const res = await fetch('/api/staff/content-health/bulk-noindex-class-d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ postIds, serviceIds }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'err', text: data.error || 'Bulk Class D noindex failed.' });
      } else {
        setStatusMessage({
          type: 'ok',
          text: `Marked ${data.updatedCount} remaining Class D page(s) as noindex, follow, excluded from /sitemap.xml, and logged.`,
        });
        setShowBulkClassDModal(false);
        await fetchContentHealth();
      }
    } catch {
      setStatusMessage({ type: 'err', text: 'Network error during bulk Class D noindex.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2 m-0">
            <ShieldAlert className="w-5 h-5 text-[#1F9D6B]" />
            <span>Content Health &amp; Thin-Page Hygiene</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 m-0">
            Audit Class A/B/C/D pages across the sitemap, verify [VERIFY] service fields before publishing, approve Merge Group hubs, or bulk noindex thin/duplicate pages.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBulkClassDModal(true)}
            disabled={classDModifiableItems.length === 0 || busy}
            className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-45 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Noindex all remaining class D ({classDModifiableItems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            disabled={classCModifiablePosts.length === 0 || busy}
            className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-45 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Bulk Noindex Class C ({classCModifiablePosts.length})</span>
          </button>
          <button
            type="button"
            onClick={fetchContentHealth}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[var(--bg-subtle)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="text-[10px] font-bold uppercase text-emerald-600">Class A</div>
          <div className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{summary.A}</div>
        </div>
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3">
          <div className="text-[10px] font-bold uppercase text-sky-600">Class B</div>
          <div className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{summary.B}</div>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="text-[10px] font-bold uppercase text-amber-600">Class C</div>
          <div className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{summary.C}</div>
        </div>
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
          <div className="text-[10px] font-bold uppercase text-rose-600">Class D</div>
          <div className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{summary.D}</div>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-3">
          <div className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Noindex</div>
          <div className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{summary.noindex}</div>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-3">
          <div className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Drafts</div>
          <div className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{summary.drafts}</div>
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

      {/* Merge Group Suggestions Panel */}
      {mergeClusters.length > 0 && (
        <section className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 m-0">
                <Layers className="w-4 h-4 text-sky-600" />
                <span>Merge Group Suggestions (Consolidated Service Hubs + 301 Redirects)</span>
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] m-0 mt-0.5">
                Cluster near-duplicate /service/* pages into one authoritative hub URL and 301-redirect individual thin duplicates.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mergeClusters.map((cluster) => (
              <div
                key={cluster.clusterId}
                className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5 flex flex-col justify-between gap-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-[var(--text-primary)]">{cluster.title}</span>
                    {cluster.approved ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600">
                        Approved · 301 → Hub
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-600">
                        Suggested ({cluster.memberCount} pages)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-[#1F9D6B] flex items-center gap-2">
                    <span>{cluster.hubPath}</span>
                    <a
                      href={cluster.hubPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 hover:underline"
                    >
                      <span>Open Hub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] m-0 leading-relaxed">
                    {cluster.summary}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {cluster.memberIds.slice(0, 6).map((mid) => (
                      <span
                        key={mid}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-muted)]"
                      >
                        {mid}
                      </span>
                    ))}
                    {cluster.memberIds.length > 6 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 text-[var(--text-muted)]">
                        +{cluster.memberIds.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-default)]">
                  {cluster.approved ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setClusterConfirm({ cluster, action: 'revert' })}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card)] cursor-pointer"
                    >
                      Revert Merge
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setClusterConfirm({ cluster, action: 'approve' })}
                      className="px-3 py-1.5 rounded-lg bg-[#1F9D6B] hover:bg-[#178257] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      <span>Approve Merge (301 → Hub)</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {([
            ['BCD', `Needs Work (B/C/D: ${summary.B + summary.C + summary.D})`],
            ['C', `Class C (${summary.C})`],
            ['D', `Class D (${summary.D})`],
            ['B', `Class B (${summary.B})`],
            ['A', `Class A (${summary.A})`],
            ['ALL', `All (${summary.total})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setClassFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                classFilter === key
                  ? 'bg-[#101A36] text-white border-[#101A36]'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-default)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title, slug, or reason..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-xs"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
        {filteredItems.map((item) => {
          const badgeColors =
            item.auditClass === 'A'
              ? 'bg-emerald-500/15 text-emerald-600'
              : item.auditClass === 'B'
              ? 'bg-sky-500/15 text-sky-600'
              : item.auditClass === 'C'
              ? 'bg-amber-500/15 text-amber-600'
              : 'bg-rose-500/15 text-rose-600';

          return (
            <div
              key={`${item.kind}-${item.id}`}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${badgeColors}`}>
                    Class {item.auditClass}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                    {item.wordCount} words
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-[var(--border-default)] text-[var(--text-muted)]">
                    {item.kind}
                  </span>
                  {item.robotsNoindex && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-500/15 text-slate-600 dark:text-slate-300">
                      NOINDEX
                    </span>
                  )}
                  {item.publicationStatus === 'draft' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600">
                      DRAFT
                    </span>
                  )}
                  {item.duplicateOfId && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-600">
                      301 → {item.duplicateOfId}
                    </span>
                  )}
                  {item.hasVerifyPlaceholders && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      [VERIFY] ({item.missingVerifyFields?.length || 1} missing)
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-[var(--text-primary)] truncate">{item.title}</div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)]">
                  <span>{item.url}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1F9D6B] inline-flex items-center gap-0.5 hover:underline"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {item.reasons.length > 0 && (
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {item.reasons.join(' · ')}
                  </div>
                )}
              </div>

              {(item.kind === 'post' || item.kind === 'service') && (
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEnrichModal(item)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#101A36] text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer hover:bg-[#1E2B4F]"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{item.kind === 'service' ? 'Edit & Verify' : 'Edit & Enrich'}</span>
                  </button>

                  {item.publicationStatus === 'draft' ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleQuickAction(item.id, 'set_published', undefined, item.kind === 'service' ? 'service' : 'post')}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-600 text-[11px] font-bold cursor-pointer hover:bg-emerald-500/10"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleQuickAction(item.id, 'set_draft', undefined, item.kind === 'service' ? 'service' : 'post')}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] text-[11px] font-semibold cursor-pointer hover:bg-[var(--bg-subtle)]"
                    >
                      Set Draft
                    </button>
                  )}

                  {item.robotsNoindex ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleQuickAction(item.id, 'clear_noindex', undefined, item.kind === 'service' ? 'service' : 'post')}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] text-[11px] font-semibold cursor-pointer hover:bg-[var(--bg-subtle)]"
                    >
                      Allow Index
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleQuickAction(item.id, 'mark_noindex', undefined, item.kind === 'service' ? 'service' : 'post')}
                      className="px-2.5 py-1.5 rounded-lg border border-amber-500/40 text-amber-600 text-[11px] font-bold cursor-pointer hover:bg-amber-500/10"
                    >
                      Mark Noindex
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMergeSource(item);
                      setMergeTargetId('');
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-purple-500/40 text-purple-600 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer hover:bg-purple-500/10"
                  >
                    <GitMerge className="w-3 h-3" />
                    <span>Merge 301</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit & Verify / Enrich Modal */}
      {enrichItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-[var(--border-default)] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] m-0">
                  {enrichItem.kind === 'service'
                    ? `Edit & Verify Service — ${enrichItem.id}`
                    : `Edit & Enrich Post — ${enrichItem.id}`}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] m-0 mt-1">
                  {enrichItem.kind === 'service'
                    ? 'Any missing fact displays [VERIFY] publicly. Publishing is blocked until all 8 verification sections are filled without [VERIFY] or Ask us.'
                    : 'Prefilled only from existing stored data. Flagged gaps show [VERIFY] — never invent vacancies, dates, fees, or helpline numbers.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnrichItem(null)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {enrichItem.kind === 'service' ? (
              <>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      liveServiceValidation.canPublish
                        ? 'bg-emerald-500/15 text-emerald-600'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {liveServiceValidation.canPublish
                      ? 'All 8 Service Sections Verified (Ready to Publish)'
                      : `Publish Blocked · ${liveServiceValidation.missingFields.length} [VERIFY] section(s) missing`}
                  </span>
                </div>

                {!liveServiceValidation.canPublish && liveServiceValidation.errors.length > 0 && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-800 dark:text-amber-200 space-y-1">
                    <div className="font-bold">Missing Fields Blocking Publish:</div>
                    <ul className="list-disc pl-4 m-0 space-y-0.5">
                      {liveServiceValidation.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Service Name</label>
                    <input
                      type="text"
                      value={svcName}
                      onChange={(e) => setSvcName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Service Overview / Description</label>
                    <textarea
                      rows={2}
                      value={svcDescription}
                      onChange={(e) => setSvcDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">
                        Issuing Authority{' '}
                        {FLAG_VERIFY_HINT(svcAuthority) && (
                          <span className="text-amber-600 font-mono">[VERIFY]</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={svcAuthority}
                        onChange={(e) => setSvcAuthority(e.target.value)}
                        placeholder="e.g. Tehsildar / Revenue Dept. [VERIFY]"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Official Portal URL</label>
                      <input
                        type="url"
                        value={svcOfficialUrl}
                        onChange={(e) => setSvcOfficialUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">
                        Official Government Fee{' '}
                        {FLAG_VERIFY_HINT(svcOfficialFee) && (
                          <span className="text-amber-600 font-mono ml-1">[VERIFY]</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={svcOfficialFee}
                        onChange={(e) => setSvcOfficialFee(e.target.value)}
                        placeholder="Verified statutory fee"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">
                        CSC DOST Service Charge{' '}
                        {FLAG_VERIFY_HINT(svcCscCharge) && (
                          <span className="text-amber-600 font-mono ml-1">[VERIFY]</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={svcCscCharge}
                        onChange={(e) => setSvcCscCharge(e.target.value)}
                        placeholder="Verified CSC service charge"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">
                        Processing Time{' '}
                        {FLAG_VERIFY_HINT(svcEstimatedTime) && (
                          <span className="text-amber-600 font-mono">[VERIFY]</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={svcEstimatedTime}
                        onChange={(e) => setSvcEstimatedTime(e.target.value)}
                        placeholder="Verified processing time"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">
                        Last Verified Date{' '}
                        {FLAG_VERIFY_HINT(svcLastVerifiedDate) && (
                          <span className="text-amber-600 font-mono">[VERIFY]</span>
                        )}
                      </label>
                      <input
                        type="date"
                        value={svcLastVerifiedDate}
                        onChange={(e) => setSvcLastVerifiedDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Itemized Fee Lines (one per line, optional)</label>
                    <textarea
                      rows={2}
                      value={svcFeeLines}
                      onChange={(e) => setSvcFeeLines(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Who Is Eligible{' '}
                      {FLAG_VERIFY_HINT(svcEligibility) && (
                        <span className="text-amber-600 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <textarea
                      rows={2}
                      value={svcEligibility}
                      onChange={(e) => setSvcEligibility(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Exact Documents List (one per line){' '}
                      {!svcRequirements.trim() && <span className="text-amber-600 font-mono">[VERIFY]</span>}
                    </label>
                    <textarea
                      rows={3}
                      value={svcRequirements}
                      onChange={(e) => setSvcRequirements(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Step-by-Step Flow (one per line){' '}
                      {!svcStepFlow.trim() && <span className="text-amber-600 font-mono">[VERIFY]</span>}
                    </label>
                    <textarea
                      rows={3}
                      value={svcStepFlow}
                      onChange={(e) => setSvcStepFlow(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Common Rejection Reasons (one per line){' '}
                      {!svcRejectionReasons.trim() && <span className="text-amber-600 font-mono">[VERIFY]</span>}
                    </label>
                    <textarea
                      rows={2}
                      value={svcRejectionReasons}
                      onChange={(e) => setSvcRejectionReasons(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      What CSC DOST Staff Check Before Submitting (one per line){' '}
                      {!svcStaffChecks.trim() && <span className="text-amber-600 font-mono">[VERIFY]</span>}
                    </label>
                    <textarea
                      rows={2}
                      value={svcStaffChecks}
                      onChange={(e) => setSvcStaffChecks(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[var(--border-default)]">
                  <button
                    type="button"
                    onClick={() => setEnrichItem(null)}
                    className="px-3 py-2 rounded-xl border border-[var(--border-default)] text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleSaveEnrich('draft')}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    disabled={busy || !liveServiceValidation.canPublish}
                    onClick={() => handleSaveEnrich('published')}
                    className="px-4 py-2 rounded-xl bg-[#1F9D6B] disabled:opacity-45 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save &amp; Publish</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      liveEnrichMetrics.wordCount >= 400
                        ? 'bg-emerald-500/15 text-emerald-600'
                        : 'bg-amber-500/15 text-amber-600'
                    }`}
                  >
                    Live Words: {liveEnrichMetrics.wordCount} / 400 min to publish
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      !liveEnrichMetrics.copiedCheck.hasExcessiveCopy
                        ? 'bg-emerald-500/15 text-emerald-600'
                        : 'bg-rose-500/15 text-rose-600'
                    }`}
                  >
                    Consecutive Copy Run: {liveEnrichMetrics.copiedCheck.runLength} (max 2 allowed)
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Title</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">
                        Last Date{' '}
                        {FLAG_VERIFY_HINT(formLastDate) && (
                          <span className="text-amber-600 font-mono">[VERIFY]</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={formLastDate}
                        onChange={(e) => setFormLastDate(e.target.value)}
                        placeholder="DD/MM/YYYY [VERIFY]"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">
                        Official Notice URL{' '}
                        {FLAG_VERIFY_HINT(formOfficialUrl) && (
                          <span className="text-amber-600 font-mono">[VERIFY]</span>
                        )}
                      </label>
                      <input
                        type="url"
                        value={formOfficialUrl}
                        onChange={(e) => setFormOfficialUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      Plain-Language Summary{' '}
                      {FLAG_VERIFY_HINT(formSummary) && (
                        <span className="text-amber-600 font-mono">[VERIFY / Add Overview]</span>
                      )}
                    </label>
                    <textarea
                      rows={3}
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Short Info</label>
                    <textarea
                      rows={2}
                      value={formShortInfo}
                      onChange={(e) => setFormShortInfo(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      Eligibility Criteria{' '}
                      {FLAG_VERIFY_HINT(formEligibility) && (
                        <span className="text-amber-600 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <textarea
                      rows={2}
                      value={formEligibility}
                      onChange={(e) => setFormEligibility(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      How to Apply Steps (one per line){' '}
                      {!formHowToApply.trim() && (
                        <span className="text-amber-600 font-mono">[VERIFY steps from notice]</span>
                      )}
                    </label>
                    <textarea
                      rows={3}
                      value={formHowToApply}
                      onChange={(e) => setFormHowToApply(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Selection Process / Exam Pattern (one per line)</label>
                    <textarea
                      rows={2}
                      value={formSelectionProcess}
                      onChange={(e) => setFormSelectionProcess(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Documents Required Checklist (one per line)</label>
                    <textarea
                      rows={3}
                      value={formDocumentsRequired}
                      onChange={(e) => setFormDocumentsRequired(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">Citizen FAQs</label>
                      <button
                        type="button"
                        onClick={() => setFormFaq((prev) => [...prev, { q: '', a: '' }])}
                        className="text-[11px] font-bold text-[#1F9D6B] cursor-pointer"
                      >
                        + Add FAQ
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formFaq.map((f, idx) => (
                        <div key={idx} className="p-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-1.5">
                          <input
                            type="text"
                            placeholder="Question"
                            value={f.q}
                            onChange={(e) => {
                              const next = [...formFaq];
                              next[idx] = { ...next[idx], q: e.target.value };
                              setFormFaq(next);
                            }}
                            className="w-full px-2 py-1 rounded border border-[var(--border-default)] bg-[var(--bg-card)]"
                          />
                          <textarea
                            rows={2}
                            placeholder="Verified Answer"
                            value={f.a}
                            onChange={(e) => {
                              const next = [...formFaq];
                              next[idx] = { ...next[idx], a: e.target.value };
                              setFormFaq(next);
                            }}
                            className="w-full px-2 py-1 rounded border border-[var(--border-default)] bg-[var(--bg-card)]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Additional Advisory / Editorial Notes</label>
                    <textarea
                      rows={2}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[var(--border-default)]">
                  <button
                    type="button"
                    onClick={() => setEnrichItem(null)}
                    className="px-3 py-2 rounded-xl border border-[var(--border-default)] text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleSaveEnrich('draft')}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    disabled={
                      busy ||
                      liveEnrichMetrics.wordCount < 400 ||
                      liveEnrichMetrics.copiedCheck.hasExcessiveCopy
                    }
                    onClick={() => handleSaveEnrich('published')}
                    className="px-4 py-2 rounded-xl bg-[#1F9D6B] disabled:opacity-45 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save &amp; Publish</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Merge 301 Modal */}
      {mergeSource && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] m-0">
                Merge Duplicate with 301 Redirect
              </h3>
              <button type="button" onClick={() => setMergeSource(null)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] m-0">
              Source URL <code>{mergeSource.url}</code> will permanently 301 redirect to the selected canonical target and be removed from /sitemap.xml.
            </p>
            <div>
              <label className="block text-xs font-bold mb-1">
                {mergeSource.kind === 'service' ? 'Canonical Hub or Service Target' : 'Canonical Target Post'}
              </label>
              <select
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs"
              >
                <option value="">-- Select canonical target --</option>
                {mergeSource.kind === 'service' ? (
                  <>
                    <optgroup label="Service Cluster Hubs">
                      {mergeClusters.map((c) => (
                        <option key={c.hubPath} value={c.hubPath}>
                          Hub: {c.hubPath} — {c.title}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Individual Service Pages">
                      {publishableServiceTargets
                        .filter((s) => s.id !== mergeSource.id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.id} — {s.title.slice(0, 60)}
                          </option>
                        ))}
                    </optgroup>
                  </>
                ) : (
                  publishablePostTargets
                    .filter((p) => p.id !== mergeSource.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.title.slice(0, 60)}
                      </option>
                    ))
                )}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMergeSource(null)}
                className="px-3 py-2 rounded-xl border border-[var(--border-default)] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !mergeTargetId}
                onClick={() =>
                  handleQuickAction(
                    mergeSource.id,
                    'merge_301',
                    mergeTargetId,
                    mergeSource.kind === 'service' ? 'service' : 'post'
                  )
                }
                className="px-4 py-2 rounded-xl bg-purple-600 disabled:opacity-45 text-white text-xs font-bold cursor-pointer"
              >
                Apply 301 Merge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cluster Merge Confirmation Modal */}
      {clusterConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2 m-0">
                <GitMerge className="w-4 h-4 text-[#1F9D6B]" />
                <span>
                  {clusterConfirm.action === 'approve'
                    ? `Approve Merge Group → ${clusterConfirm.cluster.hubPath}`
                    : `Revert Merge Group (${clusterConfirm.cluster.title})`}
                </span>
              </h3>
              <button type="button" onClick={() => setClusterConfirm(null)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] m-0">
              {clusterConfirm.action === 'approve'
                ? `This will add ${clusterConfirm.cluster.hubPath} to /sitemap.xml and configure permanent 301 redirects from all ${clusterConfirm.cluster.memberIds.length} member service URLs below:`
                : `This will restore all ${clusterConfirm.cluster.memberIds.length} individual service pages and remove the cluster 301 redirects:`}
            </p>
            <div className="max-h-44 overflow-y-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2.5 text-[11px] font-mono space-y-1">
              {clusterConfirm.cluster.memberIds.map((mid) => (
                <div key={mid}>/service/{mid}</div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClusterConfirm(null)}
                className="px-3 py-2 rounded-xl border border-[var(--border-default)] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleMergeGroupAction(clusterConfirm.cluster.clusterId, clusterConfirm.action)}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer ${
                  clusterConfirm.action === 'approve' ? 'bg-[#1F9D6B]' : 'bg-slate-700'
                }`}
              >
                {clusterConfirm.action === 'approve' ? 'Confirm Approve Merge' : 'Confirm Revert Merge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Noindex Class C Confirmation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2 m-0">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Confirm Bulk Noindex Class C Posts</span>
              </h3>
              <button type="button" onClick={() => setShowBulkModal(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] m-0">
              This will mark <strong>{classCModifiablePosts.length}</strong> Class C post(s) as{' '}
              <code>noindex, follow</code>, exclude them from <code>/sitemap.xml</code>, and keep them accessible to visitors at their URLs. You can reverse any individual post later.
            </p>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2.5 text-[11px] font-mono space-y-1">
              {classCModifiablePosts.map((p) => (
                <div key={p.id}>{p.id} ({p.wordCount}w)</div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-3 py-2 rounded-xl border border-[var(--border-default)] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleBulkNoindexClassC}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Noindex All ({classCModifiablePosts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Noindex Class D Confirmation Modal */}
      {showBulkClassDModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2 m-0">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Confirm Noindex All Remaining Class D Pages</span>
              </h3>
              <button type="button" onClick={() => setShowBulkClassDModal(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] m-0">
              This will mark <strong>{classDModifiableItems.length}</strong> remaining Class D page(s) as{' '}
              <code>noindex, follow</code>, remove them from <code>/sitemap.xml</code>, and record an audit log entry.
            </p>
            <div className="max-h-52 overflow-y-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2.5 text-[11px] font-mono space-y-1">
              {classDModifiableItems.map((item) => (
                <div key={`${item.kind}-${item.id}`}>
                  [{item.kind}] {item.url} — {item.reasons[0] || 'Class D'}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkClassDModal(false)}
                className="px-3 py-2 rounded-xl border border-[var(--border-default)] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleBulkNoindexClassD}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Noindex All Class D ({classDModifiableItems.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Change Log */}
      {logs.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 space-y-2">
          <div className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#1F9D6B]" />
            <span>Content Health Action Log</span>
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {logs.slice(0, 25).map((l) => (
              <div key={l.id} className="text-[11px] flex flex-wrap items-center justify-between gap-2 py-1 border-b border-[var(--border-default)] last:border-0">
                <div>
                  <span className="font-mono font-bold text-[#1F9D6B]">{l.action}</span>{' '}
                  <span className="font-semibold text-[var(--text-primary)]">{l.postId}</span>{' '}
                  <span className="text-[var(--text-secondary)]">— {l.details}</span>
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
