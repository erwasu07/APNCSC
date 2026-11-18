import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Layers,
  MessageCircle,
  PhoneCall,
} from 'lucide-react';
import type { ServiceItem } from '../servicesData';
import { SERVICES_LIST } from '../servicesData';
import {
  deriveStoredServiceFacts,
  getServiceClusterById,
  hasExplicitContent,
  hasExplicitList,
  isValidHttpUrl,
  type ServiceClusterHubOverride,
} from '../utils/serviceMetadata';
import { Breadcrumbs, Card, Chip } from './ui';

interface ServiceClusterHubViewProps {
  clusterId: string;
  allServices?: ServiceItem[];
  hubOverride?: ServiceClusterHubOverride;
  onBack: () => void;
  onApplyService: (serviceName: string) => void;
  onNavigateRoute?: (path: string) => void;
}

export default function ServiceClusterHubView({
  clusterId,
  allServices = SERVICES_LIST,
  hubOverride,
  onBack,
  onApplyService,
  onNavigateRoute,
}: ServiceClusterHubViewProps) {
  const cluster = useMemo(() => getServiceClusterById(clusterId), [clusterId]);

  const members = useMemo(() => {
    if (!cluster) return [];
    const byId = new Map(allServices.map((s) => [s.id, s]));
    return cluster.memberIds
      .map((id) => byId.get(id))
      .filter((s): s is ServiceItem => Boolean(s));
  }, [cluster, allServices]);

  if (!cluster) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Service Hub Not Found</h1>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-[#101A36] text-white text-sm font-bold cursor-pointer"
        >
          Back to Services
        </button>
      </div>
    );
  }

  const hasWhatFor = hasExplicitContent(hubOverride?.whatDocumentIsFor);
  const hasHowDiff = hasExplicitContent(hubOverride?.howServicesDiffer);
  const commonMistakes =
    Array.isArray(hubOverride?.commonMistakes) && hasExplicitList(hubOverride.commonMistakes)
      ? hubOverride.commonMistakes.map((s) => s.trim()).filter(Boolean)
      : [];
  const officialSources = Array.isArray(hubOverride?.officialSources)
    ? hubOverride.officialSources.filter((s) => hasExplicitContent(s?.label) && isValidHttpUrl(s?.url))
    : [];

  const navigateRoute = (href: string) => {
    if (onNavigateRoute) {
      onNavigateRoute(href);
    } else {
      window.history.pushState(null, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <article
      aria-labelledby="cluster-hub-h1"
      className="w-full bg-[var(--bg-page)] text-[var(--text-primary)] pb-20"
    >
      <div className="max-w-[1180px] mx-auto px-3 sm:px-4 lg:px-6 pt-4 lg:pt-6 space-y-5">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'CSC E-Services', href: '/services' },
            { label: cluster.title },
          ]}
          onNavigate={navigateRoute}
          rightSlot={
            <button
              type="button"
              onClick={onBack}
              className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)] hover:text-[#1F9D6B] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>All Services</span>
            </button>
          }
        />

        <header className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-6 space-y-3 text-start">
          <div className="flex flex-wrap items-center gap-2">
            <Chip variant="verified">
              <span className="inline-flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                Consolidated Service Hub · {members.length} Services
              </span>
            </Chip>
            {hasExplicitContent(hubOverride?.lastVerifiedDate) && (
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Last verified: {hubOverride!.lastVerifiedDate}
              </span>
            )}
          </div>
          <h1
            id="cluster-hub-h1"
            className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] m-0 leading-snug"
          >
            {cluster.title}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0">
            {cluster.summary}
          </p>
        </header>

        {hasWhatFor && (
          <Card className="p-4 sm:p-5 space-y-2 text-start">
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] m-0">
              What These Documents &amp; Services Are For
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0 whitespace-pre-line">
              {hubOverride!.whatDocumentIsFor}
            </p>
          </Card>
        )}

        {hasHowDiff && (
          <Card className="p-4 sm:p-5 space-y-2 text-start">
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] m-0">
              How These Services Differ From Each Other
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0 whitespace-pre-line">
              {hubOverride!.howServicesDiffer}
            </p>
          </Card>
        )}

        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-default)] text-start">
            <h2 className="text-base font-extrabold text-[var(--text-primary)] m-0">
              Comparison Table
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[var(--bg-surface)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
                  <th className="p-3.5 font-bold">Service</th>
                  <th className="p-3.5 font-bold">Issuing Authority</th>
                  <th className="p-3.5 font-bold">Who It Is For</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">Typical Time</th>
                  <th className="p-3.5 font-bold whitespace-nowrap">Fee Note</th>
                  <th className="p-3.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {members.map((member) => {
                  const facts = deriveStoredServiceFacts(member);
                  return (
                    <tr key={member.id} className="hover:bg-[var(--bg-surface)]/60">
                      <td className="p-3.5 align-top min-w-[200px]">
                        <div className="font-bold text-[var(--text-primary)]">{member.name}</div>
                        {!member.duplicateOfId && (
                          <a
                            href={`/service/${member.id}`}
                            onClick={(e) => {
                              if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                                e.preventDefault();
                                navigateRoute(`/service/${member.id}`);
                              }
                            }}
                            className="inline-block mt-1 text-[11px] font-bold text-[#1F9D6B] hover:underline"
                          >
                            View Checklist →
                          </a>
                        )}
                      </td>
                      <td className="p-3.5 align-top min-w-[160px] text-xs text-[var(--text-secondary)]">
                        {facts.authorityFromStoredData ? facts.issuingAuthority : ''}
                      </td>
                      <td className="p-3.5 align-top min-w-[180px] text-xs text-[var(--text-secondary)]">
                        {facts.eligibilityFromStoredData ? facts.eligibility : ''}
                      </td>
                      <td className="p-3.5 align-top whitespace-nowrap text-xs">
                        {facts.timeFromStoredData ? (
                          <span className="text-[var(--text-primary)] font-semibold">{facts.estimatedTime}</span>
                        ) : (
                          ''
                        )}
                      </td>
                      <td className="p-3.5 align-top whitespace-nowrap font-bold text-xs">
                        {facts.feesFromStoredData ? (
                          <span className="text-[#1F9D6B]">{facts.feesText}</span>
                        ) : (
                          ''
                        )}
                      </td>
                      <td className="p-3.5 align-top text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onApplyService(member.name)}
                          className="px-3 py-1.5 rounded-lg bg-[#101A36] hover:bg-[#1E2B4F] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Apply</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-3 text-start">
          <h2 className="text-lg font-extrabold text-[var(--text-primary)] m-0">
            Service-by-Service Breakdown &amp; Specific Differences
          </h2>
          <div className="space-y-3">
            {members.map((member) => {
              const facts = deriveStoredServiceFacts(member);
              const diffNote = hubOverride?.perServiceDifferences?.[member.id];
              return (
                <div
                  key={member.id}
                  className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5 space-y-1.5"
                >
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] m-0">
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] m-0 leading-relaxed">
                    {member.description}
                  </p>
                  {hasExplicitContent(diffNote) && (
                    <p className="text-xs sm:text-sm text-[var(--text-primary)] m-0 leading-relaxed">
                      <strong>Specific Difference:</strong> {diffNote}
                    </p>
                  )}
                  {facts.eligibilityFromStoredData && (
                    <p className="text-xs text-[var(--text-secondary)] m-0">
                      <strong>Eligibility:</strong> {facts.eligibility}
                    </p>
                  )}
                  {facts.requirements.length > 0 && (
                    <p className="text-xs text-[var(--text-secondary)] m-0">
                      <strong>Documents:</strong> {facts.requirements.join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {commonMistakes.length > 0 && (
          <Card className="p-4 sm:p-5 space-y-2.5 text-start">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-extrabold text-[var(--text-primary)] m-0">
                Common Mistakes to Avoid
              </h2>
            </div>
            <ul className="list-disc pl-5 m-0 space-y-1.5 text-sm text-[var(--text-secondary)]">
              {commonMistakes.map((mistake, idx) => (
                <li key={`${cluster.clusterId}-mistake-${idx}`}>{mistake}</li>
              ))}
            </ul>
          </Card>
        )}

        {officialSources.length > 0 && (
          <Card className="p-4 sm:p-5 space-y-2.5 text-start">
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] m-0">
              Official Portals &amp; Sources
            </h2>
            <ul className="list-disc pl-5 m-0 space-y-1.5 text-sm">
              {officialSources.map((src, idx) => (
                <li key={`${cluster.clusterId}-src-${idx}`}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 dark:text-sky-300 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>{src.label}</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Independent CSC DOST Desk (VLE ID 212515670018, Sangran Qazigund). Confirm requirements before applying.
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/917006833767?text=${encodeURIComponent(
                `Hello CSC DOST, enquiry for ${cluster.title}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#1F9D6B] text-white text-xs font-bold inline-flex items-center gap-1.5 no-underline"
            >
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>WhatsApp Desk</span>
            </a>
            <a
              href="tel:+917006833767"
              className="px-3.5 py-2 rounded-xl bg-[#101A36] text-white text-xs font-bold inline-flex items-center gap-1.5 no-underline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#F5A623]" aria-hidden="true" />
              <span>+91 70068 33767</span>
            </a>
          </div>
        </Card>
      </div>
    </article>
  );
}
