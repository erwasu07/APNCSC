import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Layers,
  ListChecks,
  RefreshCw,
  Save,
  Search,
  Upload,
} from 'lucide-react';

interface AdminServiceFactsTabProps {
  adminToken?: string;
}

interface ServiceFactEntry {
  priorityRank: number;
  demandScore: number;
  demandBreakdown: { views: number; clicks: number; enquiries: number };
  id: string;
  name: string;
  category: string;
  description: string;
  legacyPriceNote: string;
  issuingAuthority: string;
  officialFee: string;
  cscCharge: string;
  estimatedTime: string;
  eligibility: string;
  requirements: string[];
  stepFlow: string[];
  rejectionReasons: string[];
  staffChecks: string[];
  officialUrl: string;
  lastVerifiedDate: string;
  wordCount: number;
  missingFields: string[];
  validationErrors: string[];
  isComplete: boolean;
  isIndexable: boolean;
  robotsNoindex: boolean;
  duplicateOfId: string;
  clusterId: string;
}

interface ClusterMemberSummary {
  id: string;
  name: string;
  isComplete: boolean;
  missingFields: string[];
}

interface ClusterHubOverrideData {
  clusterId: string;
  whatDocumentIsFor?: string;
  howServicesDiffer?: string;
  commonMistakes?: string[];
  officialSources?: Array<{ label: string; url: string }>;
  perServiceDifferences?: Record<string, string>;
  lastVerifiedDate?: string;
}

interface ClusterHubEntry {
  clusterId: string;
  title: string;
  hubPath: string;
  summary: string;
  wordCount: number;
  isIndexable: boolean;
  missingData: string[];
  sectionStatus?: {
    whatDocumentIsFor: boolean;
    howServicesDiffer: boolean;
    comparisonTableComplete: boolean;
    perServiceDifferences: boolean;
    commonMistakes: boolean;
    officialSources: boolean;
    minWordCount800: boolean;
  };
  override: ClusterHubOverrideData;
  members: ClusterMemberSummary[];
}

const FIELD_LABELS: Record<string, string> = {
  issuingAuthority: 'Issuing Authority',
  officialFee: 'Official Fee',
  cscCharge: 'CSC DOST Charge',
  estimatedTime: 'Processing Time',
  eligibility: 'Eligibility',
  requirements: 'Documents List',
  stepFlow: 'Step Flow',
  rejectionReasons: 'Rejection Reasons',
  staffChecks: 'Staff Checks',
  officialUrl: 'Official URL',
  lastVerifiedDate: 'Last Verified Date',
};

function parseCsvText(csvText: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  const normalized = csvText.replace(/^\uFEFF/, '');
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    const next = normalized[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentCell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentCell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      currentRow.push(currentCell);
      currentCell = '';
    } else if (ch === '\r' && next === '\n') {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += ch;
    }
  }
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const records: Array<Record<string, string>> = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.length === 1 && !cells[0].trim()) continue;
    const rec: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      if (headers[c]) {
        rec[headers[c]] = (cells[c] ?? '').trim();
      }
    }
    if (rec.id) records.push(rec);
  }
  return records;
}

const isMissingStaffVal = (val?: string | null): boolean => {
  const s = String(val || '').trim();
  return !s || /\[VERIFY\]/i.test(s) || /\bask us\b/i.test(s);
};

export default function AdminServiceFactsTab({ adminToken }: AdminServiceFactsTabProps) {
  const [services, setServices] = useState<ServiceFactEntry[]>([]);
  const [clusters, setClusters] = useState<ClusterHubEntry[]>([]);
  const [totalServices, setTotalServices] = useState(0);
  const [completeCount, setCompleteCount] = useState(0);
  const [indexableCount, setIndexableCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subMode, setSubMode] = useState<'services' | 'clusters'>('services');
  const [queueFilter, setQueueFilter] = useState<'all' | 'top20' | 'incomplete' | 'complete'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedClusterId, setSelectedClusterId] = useState<string>('jk-category-certificates');

  const [statusBanner, setStatusBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Single-service form state (11 fields, never prefilled with invented text)
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [officialFee, setOfficialFee] = useState('');
  const [cscCharge, setCscCharge] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [requirements, setRequirements] = useState('');
  const [stepFlow, setStepFlow] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState('');
  const [staffChecks, setStaffChecks] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [lastVerifiedDate, setLastVerifiedDate] = useState('');

  // Cluster Hub form state
  const [hubWhatFor, setHubWhatFor] = useState('');
  const [hubHowDiffer, setHubHowDiffer] = useState('');
  const [hubCommonMistakes, setHubCommonMistakes] = useState('');
  const [hubSources, setHubSources] = useState<Array<{ label: string; url: string }>>([]);
  const [hubMemberDiffs, setHubMemberDiffs] = useState<Record<string, string>>({});
  const [hubVerifiedDate, setHubVerifiedDate] = useState('');

  const getToken = () =>
    adminToken ||
    (typeof window !== 'undefined' ? window.sessionStorage.getItem('csc_admin_token') || '' : '');

  const loadServiceToForm = (svc: ServiceFactEntry) => {
    setSelectedServiceId(svc.id);
    setIssuingAuthority(svc.issuingAuthority || '');
    setOfficialFee(svc.officialFee || '');
    setCscCharge(svc.cscCharge || '');
    setEstimatedTime(svc.estimatedTime || '');
    setEligibility(svc.eligibility || '');
    setRequirements((svc.requirements || []).join('\n'));
    setStepFlow((svc.stepFlow || []).join('\n'));
    setRejectionReasons((svc.rejectionReasons || []).join('\n'));
    setStaffChecks((svc.staffChecks || []).join('\n'));
    setOfficialUrl(svc.officialUrl || '');
    setLastVerifiedDate(svc.lastVerifiedDate || '');
  };

  const loadClusterToForm = (cluster: ClusterHubEntry) => {
    setSelectedClusterId(cluster.clusterId);
    const ov = cluster.override || { clusterId: cluster.clusterId };
    setHubWhatFor(ov.whatDocumentIsFor || '');
    setHubHowDiffer(ov.howServicesDiffer || '');
    setHubCommonMistakes((ov.commonMistakes || []).join('\n'));
    setHubSources(
      Array.isArray(ov.officialSources) && ov.officialSources.length > 0
        ? ov.officialSources.map((s) => ({ label: s.label || '', url: s.url || '' }))
        : [{ label: '', url: '' }]
    );
    setHubMemberDiffs({ ...(ov.perServiceDifferences || {}) });
    setHubVerifiedDate(ov.lastVerifiedDate || '');
  };

  const fetchFacts = async (preserveSelectionId?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/service-facts', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusBanner({ type: 'err', text: data.error || 'Failed to load Service Facts.' });
        return;
      }
      const list: ServiceFactEntry[] = Array.isArray(data.services) ? data.services : [];
      const clusterList: ClusterHubEntry[] = Array.isArray(data.clusters) ? data.clusters : [];
      setServices(list);
      setClusters(clusterList);
      setTotalServices(data.totalServices || list.length);
      setCompleteCount(data.completeCount || 0);
      setIndexableCount(data.indexableCount || 0);

      const targetId = preserveSelectionId || selectedServiceId;
      const matchedSvc = list.find((s) => s.id === targetId) || list.find((s) => !s.isComplete) || list[0];
      if (matchedSvc) loadServiceToForm(matchedSvc);

      const matchedCluster =
        clusterList.find((c) => c.clusterId === selectedClusterId) || clusterList[0];
      if (matchedCluster) loadClusterToForm(matchedCluster);
    } catch {
      setStatusBanner({ type: 'err', text: 'Network error fetching Service Facts.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) || null,
    [services, selectedServiceId]
  );

  const selectedCluster = useMemo(
    () => clusters.find((c) => c.clusterId === selectedClusterId) || null,
    [clusters, selectedClusterId]
  );

  const filteredQueue = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return services.filter((s) => {
      if (queueFilter === 'top20' && s.priorityRank > 20) return false;
      if (queueFilter === 'incomplete' && s.isComplete) return false;
      if (queueFilter === 'complete' && !s.isComplete) return false;
      if (q && !`${s.id} ${s.name} ${s.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [services, queueFilter, searchQuery]);

  const top20Complete = useMemo(
    () => services.slice(0, 20).filter((s) => s.isComplete).length,
    [services]
  );

  const progressPct = totalServices > 0 ? Math.round((completeCount / totalServices) * 100) : 0;

  const handleSaveService = async (mode: 'draft' | 'next_incomplete' | 'mark_indexable') => {
    if (!selectedService) return;
    setSaving(true);
    setStatusBanner(null);
    try {
      const res = await fetch('/api/staff/service-facts/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          id: selectedService.id,
          requireComplete: mode === 'mark_indexable',
          issuingAuthority: issuingAuthority.trim(),
          officialFee: officialFee.trim(),
          cscCharge: cscCharge.trim(),
          estimatedTime: estimatedTime.trim(),
          eligibility: eligibility.trim(),
          requirements: requirements.split('\n').map((s) => s.trim()).filter(Boolean),
          stepFlow: stepFlow.split('\n').map((s) => s.trim()).filter(Boolean),
          rejectionReasons: rejectionReasons.split('\n').map((s) => s.trim()).filter(Boolean),
          staffChecks: staffChecks.split('\n').map((s) => s.trim()).filter(Boolean),
          officialUrl: officialUrl.trim(),
          lastVerifiedDate: lastVerifiedDate.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusBanner({
          type: 'err',
          text: data.error || 'Could not save service facts.',
        });
        return;
      }

      let nextSelectId = selectedService.id;
      if (mode === 'next_incomplete') {
        const currentIndex = services.findIndex((s) => s.id === selectedService.id);
        const after = services.slice(currentIndex + 1).find((s) => !s.isComplete);
        const wrapped = services.slice(0, Math.max(0, currentIndex)).find((s) => !s.isComplete);
        const candidate = after || wrapped;
        if (candidate) nextSelectId = candidate.id;
      }

      setStatusBanner({
        type: 'ok',
        text: data.isComplete
          ? `Verified "${selectedService.name}" (${data.wordCount} words) — now indexable & in sitemap.xml.`
          : `Saved draft for "${selectedService.name}" (${data.wordCount} words · ${data.missingFields?.length || 0} field(s) missing · remains noindex).`,
      });
      await fetchFacts(nextSelectId);
    } catch {
      setStatusBanner({ type: 'err', text: 'Network error while saving Service Facts.' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = async () => {
    setStatusBanner(null);
    try {
      const res = await fetch('/api/staff/service-facts/export.csv', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        setStatusBanner({ type: 'err', text: 'Failed to export CSV.' });
        return;
      }
      const csvBlob = await res.blob();
      const url = URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cscdost_service_facts.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setStatusBanner({ type: 'err', text: 'Network error exporting CSV.' });
    }
  };

  const handleImportCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSaving(true);
    setStatusBanner(null);
    try {
      const text = await file.text();
      const rows = parseCsvText(text);
      if (rows.length === 0) {
        setStatusBanner({ type: 'err', text: 'CSV had no valid data rows (requires "id" header column).' });
        return;
      }
      const res = await fetch('/api/staff/service-facts/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusBanner({ type: 'err', text: data.error || 'CSV import failed.' });
      } else {
        setStatusBanner({
          type: 'ok',
          text: `CSV import complete: ${data.updatedCount} service(s) updated, ${data.skippedCount} empty row(s) skipped${
            data.unknownIds?.length ? ` (${data.unknownIds.length} unknown id(s))` : ''
          }.`,
        });
        await fetchFacts(selectedServiceId);
      }
    } catch {
      setStatusBanner({ type: 'err', text: 'Failed to parse or upload CSV file.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCluster = async () => {
    if (!selectedCluster) return;
    setSaving(true);
    setStatusBanner(null);
    try {
      const res = await fetch('/api/staff/service-facts/cluster/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          clusterId: selectedCluster.clusterId,
          whatDocumentIsFor: hubWhatFor.trim(),
          howServicesDiffer: hubHowDiffer.trim(),
          commonMistakes: hubCommonMistakes.split('\n').map((s) => s.trim()).filter(Boolean),
          officialSources: hubSources
            .map((s) => ({ label: s.label.trim(), url: s.url.trim() }))
            .filter((s) => s.label && s.url),
          perServiceDifferences: hubMemberDiffs,
          lastVerifiedDate: hubVerifiedDate.trim() || new Date().toISOString().slice(0, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusBanner({ type: 'err', text: data.error || 'Failed to save cluster hub.' });
      } else {
        setStatusBanner({
          type: 'ok',
          text: data.readiness?.isIndexable
            ? `Cluster hub "${selectedCluster.title}" (${data.wordCount} words) is complete & indexable!`
            : `Saved hub "${selectedCluster.title}" (${data.wordCount} words · ${data.readiness?.missingData?.length || 0} missing item(s) · remains noindex).`,
        });
        await fetchFacts(selectedServiceId);
      }
    } catch {
      setStatusBanner({ type: 'err', text: 'Network error saving cluster hub.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Progress */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#111827] m-0 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-[#1F9D6B]" />
              <span>Service Facts — Verified Data Entry</span>
            </h2>
            <p className="text-xs text-[#64748B] m-0 mt-1">
              Fill 11 verified facts & reach 400+ original words per service. Incomplete services stay{' '}
              <code className="font-mono bg-slate-100 px-1 rounded">noindex, follow</code> and out of{' '}
              <code className="font-mono bg-slate-100 px-1 rounded">/sitemap.xml</code> with zero public{' '}
              <code className="font-mono bg-slate-100 px-1 rounded">[VERIFY]</code> text.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleImportCsvFile}
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl border border-[#1F9D6B]/40 bg-emerald-50 hover:bg-emerald-100 text-[#1F9D6B] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>

            <button
              type="button"
              onClick={() => fetchFacts(selectedServiceId)}
              disabled={loading}
              className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-[#111827]">
              {completeCount} of {totalServices} complete ({progressPct}%)
            </span>
            <span className="text-[#64748B] font-semibold">
              Top 20 Priority: {top20Complete} of {Math.min(20, totalServices)} complete · Indexable now:{' '}
              {indexableCount}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className="h-full bg-[#1F9D6B] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Sub-mode Switch */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSubMode('services')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
              subMode === 'services'
                ? 'bg-[#101A36] text-white'
                : 'bg-slate-100 text-[#334155] hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>One-by-One Service Facts ({totalServices})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubMode('clusters')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
              subMode === 'clusters'
                ? 'bg-[#101A36] text-white'
                : 'bg-slate-100 text-[#334155] hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              Cluster Hubs Missing Data ({clusters.filter((c) => !c.isIndexable).length} incomplete)
            </span>
          </button>
        </div>
      </div>

      {statusBanner && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-semibold flex items-center gap-2 ${
            statusBanner.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusBanner.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusBanner.text}</span>
        </div>
      )}

      {subMode === 'services' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Priority Queue Column */}
          <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-2xl p-3.5 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: `All (${totalServices})` },
                  { id: 'top20', label: 'Top 20' },
                  { id: 'incomplete', label: `Incomplete (${totalServices - completeCount})` },
                  { id: 'complete', label: `Complete (${completeCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setQueueFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                    queueFilter === tab.id
                      ? 'bg-[#1F9D6B] text-white'
                      : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search service ID or name..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs"
              />
            </div>

            <div className="space-y-1.5 max-h-[680px] overflow-y-auto pr-1">
              {filteredQueue.map((svc) => {
                const isSelected = svc.id === selectedServiceId;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      setStatusBanner(null);
                      loadServiceToForm(svc);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-[#1F9D6B] bg-emerald-50/70'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        #{svc.priorityRank}
                        {svc.demandScore > 0 ? ` · score ${svc.demandScore}` : ''}
                      </span>
                      {svc.isComplete ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                          INDEXABLE
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          [VERIFY] {svc.missingFields.length}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#111827] mt-1 truncate">{svc.name}</div>
                    <div className="text-[10px] font-mono text-[#64748B] flex items-center justify-between mt-0.5">
                      <span className="truncate">{svc.id}</span>
                      <span>{svc.wordCount} / 400w</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Single-Service Form Column */}
          <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 space-y-4">
            {selectedService ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#101A36] text-white">
                        Priority #{selectedService.priorityRank}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          selectedService.isIndexable
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedService.isIndexable
                          ? 'Indexable (in sitemap.xml)'
                          : 'noindex, follow (auto until complete & 400+ words)'}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {selectedService.wordCount} / 400 words
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#111827] mt-1.5 mb-0">
                      {selectedService.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#64748B] mt-1">
                      <span>/service/{selectedService.id}</span>
                      <a
                        href={`/service/${selectedService.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1F9D6B] inline-flex items-center gap-1 hover:underline"
                      >
                        <span>Preview Public Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {selectedService.legacyPriceNote && (
                        <span className="text-slate-500">
                          Code price hint: "{selectedService.legacyPriceNote}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedService.validationErrors.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900 space-y-1">
                    <div className="font-bold">
                      Remaining items before `/service/{selectedService.id}` becomes indexable:
                    </div>
                    <ul className="list-disc pl-4 m-0 space-y-0.5">
                      {selectedService.validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">
                      1. Issuing Authority{' '}
                      {isMissingStaffVal(issuingAuthority) && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={issuingAuthority}
                      onChange={(e) => setIssuingAuthority(e.target.value)}
                      placeholder="Verified department / authority"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      2. Official Portal URL{' '}
                      {isMissingStaffVal(officialUrl) && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <input
                      type="url"
                      value={officialUrl}
                      onChange={(e) => setOfficialUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      3. Official Government Fee{' '}
                      {isMissingStaffVal(officialFee) && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={officialFee}
                      onChange={(e) => setOfficialFee(e.target.value)}
                      placeholder="Exact statutory fee"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      4. CSC DOST Service Charge{' '}
                      {isMissingStaffVal(cscCharge) && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={cscCharge}
                      onChange={(e) => setCscCharge(e.target.value)}
                      placeholder="Your CSC center service charge"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      5. Real Processing Time{' '}
                      {isMissingStaffVal(estimatedTime) && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder="Verified processing duration"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      6. Last Verified Date{' '}
                      {isMissingStaffVal(lastVerifiedDate) && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="date"
                        value={lastVerifiedDate}
                        onChange={(e) => setLastVerifiedDate(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-[#CBD5E1] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setLastVerifiedDate(new Date().toISOString().slice(0, 10))}
                        className="px-2.5 py-2 rounded-lg border border-[#CBD5E1] bg-slate-50 hover:bg-slate-100 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Today</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">
                      7. Eligibility{' '}
                      {isMissingStaffVal(eligibility) && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <textarea
                      rows={2}
                      value={eligibility}
                      onChange={(e) => setEligibility(e.target.value)}
                      placeholder="Exact eligibility criteria for applicants"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      8. Exact Documents List (one per line){' '}
                      {!requirements.trim() && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <textarea
                      rows={3}
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="One verified required document per line"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      9. Step-by-Step Flow (one per line){' '}
                      {!stepFlow.trim() && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <textarea
                      rows={3}
                      value={stepFlow}
                      onChange={(e) => setStepFlow(e.target.value)}
                      placeholder="One verified submission / workflow step per line"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      10. Common Rejection Reasons (one per line){' '}
                      {!rejectionReasons.trim() && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <textarea
                      rows={2}
                      value={rejectionReasons}
                      onChange={(e) => setRejectionReasons(e.target.value)}
                      placeholder="One common verifiable rejection reason per line"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      11. Staff Pre-Submission Checks (one per line){' '}
                      {!staffChecks.trim() && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <textarea
                      rows={2}
                      value={staffChecks}
                      onChange={(e) => setStaffChecks(e.target.value)}
                      placeholder="One pre-submission quality/document check CSC DOST performs"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveService('draft')}
                    className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Draft</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveService('next_incomplete')}
                      className="px-4 py-2.5 rounded-xl bg-[#101A36] hover:bg-[#1E2B4F] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Save &amp; next incomplete service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveService('mark_indexable')}
                      className="px-4 py-2.5 rounded-xl bg-[#1F9D6B] hover:bg-[#198258] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save &amp; Verify Indexable</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-xs text-[#64748B] py-10 text-center">
                Select a service from the priority queue to edit verified facts.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CLUSTER HUBS MISSING DATA & 800-WORD GUIDE EDITOR */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-4 space-y-2">
            {clusters.map((cluster) => (
              <button
                key={cluster.clusterId}
                type="button"
                onClick={() => {
                  setStatusBanner(null);
                  loadClusterToForm(cluster);
                }}
                className={`w-full text-left bg-white border rounded-2xl p-3.5 transition cursor-pointer ${
                  cluster.clusterId === selectedClusterId
                    ? 'border-[#1F9D6B] ring-1 ring-[#1F9D6B]'
                    : 'border-[#E2E8F0] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      cluster.isIndexable
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cluster.isIndexable ? 'INDEXABLE' : `NOINDEX · ${cluster.missingData.length} missing`}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600">{cluster.wordCount} / 800w</span>
                </div>
                <div className="text-xs font-bold text-[#111827] mt-1.5">{cluster.title}</div>
                <div className="text-[11px] font-mono text-[#64748B] mt-0.5">{cluster.hubPath}</div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 space-y-4">
            {selectedCluster && (
              <>
                <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-extrabold text-[#111827] m-0">
                      {selectedCluster.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#64748B] mt-1">
                      <span>{selectedCluster.hubPath}</span>
                      <span>{selectedCluster.wordCount} / 800 original words</span>
                      <a
                        href={selectedCluster.hubPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1F9D6B] inline-flex items-center gap-1 hover:underline"
                      >
                        <span>Open Hub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Staff Missing Data List */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 space-y-1.5">
                  <div className="text-xs font-extrabold text-amber-900">
                    Missing data keeping {selectedCluster.hubPath} in noindex, follow ({selectedCluster.missingData.length}):
                  </div>
                  {selectedCluster.missingData.length === 0 ? (
                    <div className="text-xs text-emerald-700 font-semibold">
                      All cluster sections, comparison table cells, per-service differences, and 800+ words are complete.
                    </div>
                  ) : (
                    <ul className="list-disc pl-4 m-0 text-[11px] text-amber-900 space-y-0.5 max-h-44 overflow-y-auto">
                      {selectedCluster.missingData.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">
                      What the documents/services are for{' '}
                      {isMissingStaffVal(hubWhatFor) && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <textarea
                      rows={4}
                      value={hubWhatFor}
                      onChange={(e) => setHubWhatFor(e.target.value)}
                      placeholder="Original, non-templated explanation of what these documents/services are used for..."
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      How these services differ from each other{' '}
                      {isMissingStaffVal(hubHowDiffer) && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <textarea
                      rows={4}
                      value={hubHowDiffer}
                      onChange={(e) => setHubHowDiffer(e.target.value)}
                      placeholder="Explain distinct scope, eligibility boundaries, and when citizens need each option..."
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      Common mistakes (one per line){' '}
                      {!hubCommonMistakes.trim() && (
                        <span className="text-amber-700 font-mono">[VERIFY]</span>
                      )}
                    </label>
                    <textarea
                      rows={3}
                      value={hubCommonMistakes}
                      onChange={(e) => setHubCommonMistakes(e.target.value)}
                      placeholder="One real mistake seen during citizen submissions per line"
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold">Official Portals &amp; Sources List</label>
                      <button
                        type="button"
                        onClick={() => setHubSources((prev) => [...prev, { label: '', url: '' }])}
                        className="text-[11px] font-bold text-[#1F9D6B] hover:underline cursor-pointer"
                      >
                        + Add Source
                      </button>
                    </div>
                    {hubSources.map((src, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <input
                          type="text"
                          value={src.label}
                          onChange={(e) =>
                            setHubSources((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, label: e.target.value } : item))
                            )
                          }
                          placeholder="Source / Portal Label"
                          className="sm:col-span-5 px-2.5 py-1.5 rounded-lg border border-[#CBD5E1]"
                        />
                        <input
                          type="url"
                          value={src.url}
                          onChange={(e) =>
                            setHubSources((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, url: e.target.value } : item))
                            )
                          }
                          placeholder="https://..."
                          className="sm:col-span-6 px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setHubSources((prev) => prev.filter((_, i) => i !== idx))}
                          className="sm:col-span-1 px-2 py-1.5 rounded-lg border border-slate-200 text-rose-600 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="font-bold">
                      Per-Service Specific Differences ({selectedCluster.members.length} members)
                    </div>
                    <p className="text-[11px] text-[#64748B] m-0">
                      Comparison table columns (Issuing Authority, Who It Is For, Typical Time, Fee Note) pull automatically from each service&apos;s verified facts.
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {selectedCluster.members.map((m) => (
                        <div key={m.id} className="p-2.5 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[#111827]">{m.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {m.missingFields.length === 0
                                ? 'Table facts complete'
                                : `${m.missingFields.length} fact(s) missing (${m.missingFields
                                    .slice(0, 3)
                                    .map((f) => FIELD_LABELS[f] || f)
                                    .join(', ')})`}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={hubMemberDiffs[m.id] || ''}
                            onChange={(e) =>
                              setHubMemberDiffs((prev) => ({ ...prev, [m.id]: e.target.value }))
                            }
                            placeholder={`Specific difference & usage note for ${m.name}...`}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="max-w-xs">
                    <label className="block font-bold mb-1">Hub Last Verified Date</label>
                    <input
                      type="date"
                      value={hubVerifiedDate}
                      onChange={(e) => setHubVerifiedDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveCluster}
                    className="px-4 py-2.5 rounded-xl bg-[#1F9D6B] hover:bg-[#198258] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Cluster Hub Guide</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
