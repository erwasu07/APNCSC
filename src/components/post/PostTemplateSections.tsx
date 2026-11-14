import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Calendar,
  MapPin,
  Users,
  GraduationCap,
  ShieldCheck,
  Banknote,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import type {
  DepartmentBreakdown,
  PostStructuredType,
  SarkariItem,
  TimelineStep,
} from '../../data/sarkariData';
import type { ComputedSarkariStatus } from '../../utils/sarkariStatus';
import { hasRealDataValue, type ProcessStep } from './postHelpers';

export interface PostFactCardItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: 'default' | 'accent' | 'open' | 'exam';
}

export function PostFactsGrid({
  item,
  type,
  statusInfo,
  orgName,
  labels,
}: {
  item: SarkariItem;
  type: PostStructuredType;
  statusInfo: ComputedSarkariStatus;
  orgName: string;
  labels: {
    asPerNotice: string;
    vacanciesLabel: string;
    qualificationLabel: string;
    venueLabel: string;
    reportingTimeLabel: string;
    examWindowLabel: string;
    dvDateLabel: string;
    resultOutLabel: string;
    keyOutLabel: string;
    windowOpensLabel: string;
    closingDateLabel: string;
    closedOnLabel: string;
  };
}) {
  const facts: PostFactCardItem[] = [];

  facts.push({
    label: item.section === 'education' ? 'Institution' : 'Organisation',
    value: orgName,
    icon: <ShieldCheck className="w-4 h-4 text-[#1F9D6B]" aria-hidden="true" />,
  });

  if (type === 'dv') {
    facts.push({
      label: labels.dvDateLabel,
      value: statusInfo.dateValue,
      icon: <Calendar className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />,
      tone: 'exam',
    });
    facts.push({
      label: labels.venueLabel,
      value: item.venue || labels.asPerNotice,
      icon: <MapPin className="w-4 h-4 text-[#F5A623]" aria-hidden="true" />,
    });
    facts.push({
      label: labels.reportingTimeLabel,
      value: item.reportingTime || labels.asPerNotice,
      icon: <Clock className="w-4 h-4 text-[#F5A623]" aria-hidden="true" />,
    });
    if (hasRealDataValue(item.posts) && item.posts !== labels.asPerNotice) {
      facts.push({
        label: labels.vacanciesLabel,
        value: String(item.posts),
        icon: <Users className="w-4 h-4 text-[#1F9D6B]" aria-hidden="true" />,
      });
    }
  } else if (type === 'admit_card' || type === 'exam') {
    facts.push({
      label: statusInfo.dateLabel || labels.examWindowLabel,
      value: statusInfo.dateValue,
      icon: <Calendar className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />,
      tone: 'exam',
    });
    facts.push({
      label: labels.venueLabel,
      value: item.venue || labels.asPerNotice,
      icon: <MapPin className="w-4 h-4 text-[#F5A623]" aria-hidden="true" />,
    });
    facts.push({
      label: labels.reportingTimeLabel,
      value: item.reportingTime || labels.asPerNotice,
      icon: <Clock className="w-4 h-4 text-[#F5A623]" aria-hidden="true" />,
    });
    if (item.learnerGroup) {
      facts.push({
        label: 'Learner Group',
        value: item.learnerGroup,
        icon: <GraduationCap className="w-4 h-4 text-[#1F9D6B]" aria-hidden="true" />,
      });
    }
  } else if (type === 'result') {
    facts.push({
      label: labels.resultOutLabel,
      value: statusInfo.dateValue,
      icon: <Calendar className="w-4 h-4 text-[#1F9D6B]" aria-hidden="true" />,
      tone: 'open',
    });
    if (hasRealDataValue(item.posts) && item.posts !== 'As per official notice') {
      facts.push({
        label: 'Shortlisted / Posts',
        value: String(item.posts),
        icon: <Users className="w-4 h-4 text-[#1F9D6B]" aria-hidden="true" />,
      });
    }
    if (item.advertisementNo) {
      facts.push({
        label: 'Reference / Advt No.',
        value: item.advertisementNo,
        icon: <FileCheck2 className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />,
      });
    }
  } else if (type === 'answer_key') {
    facts.push({
      label: statusInfo.dateLabel || labels.keyOutLabel,
      value: statusInfo.dateValue,
      icon: <Calendar className="w-4 h-4 text-[#D97706]" aria-hidden="true" />,
      tone: statusInfo.computedStatus === 'closing_soon' ? 'accent' : 'default',
    });
    if (item.advertisementNo) {
      facts.push({
        label: 'Notice Reference',
        value: item.advertisementNo,
        icon: <FileCheck2 className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />,
      });
    }
  } else {
    // application | admission | upcoming
    if (item.applyStart || item.startDate) {
      facts.push({
        label: labels.windowOpensLabel,
        value: item.applyStart || item.startDate || item.postDate,
        icon: <Calendar className="w-4 h-4 text-[#1F9D6B]" aria-hidden="true" />,
        tone: type === 'upcoming' ? 'exam' : 'default',
      });
    }
    if (item.applyEnd || item.lastDate) {
      facts.push({
        label: statusInfo.isClosed ? labels.closedOnLabel : labels.closingDateLabel,
        value: item.applyEnd || item.lastDate || labels.asPerNotice,
        icon: <Clock className="w-4 h-4 text-[#D97706]" aria-hidden="true" />,
        tone: statusInfo.isClosingSoon ? 'accent' : 'default',
      });
    }
    if (hasRealDataValue(item.posts)) {
      facts.push({
        label: item.section === 'education' ? 'Intake / Eligibility' : labels.vacanciesLabel,
        value: String(item.posts),
        icon: <Users className="w-4 h-4 text-[#1F9D6B]" aria-hidden="true" />,
      });
    }
    if (hasRealDataValue(item.qualification)) {
      facts.push({
        label: labels.qualificationLabel,
        value: String(item.qualification),
        icon: <GraduationCap className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />,
      });
    }
  }

  return (
    <section
      aria-label="Key notification details"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    >
      {facts.map((fact, idx) => (
        <div
          key={`${fact.label}-${idx}`}
          className={`rounded-xl border p-3.5 text-start ${
            fact.tone === 'accent'
              ? 'bg-[var(--status-closing-bg)] border-[var(--status-closing-border)]'
              : fact.tone === 'exam'
              ? 'bg-[var(--status-exam-bg)] border-[var(--status-exam-border)]'
              : fact.tone === 'open'
              ? 'bg-[var(--status-open-bg)] border-[var(--status-open-border)]'
              : 'bg-[var(--bg-card)] border-[var(--border-default)]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            {fact.icon}
            <span className="truncate">{fact.label}</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1 leading-snug tabular-nums break-words">
            {fact.value}
          </div>
        </div>
      ))}
    </section>
  );
}

export function PostFeeSection({
  item,
  sectionTitle,
  asPerNoticeText,
}: {
  item: SarkariItem;
  sectionTitle: string;
  asPerNoticeText: string;
}) {
  const genObc = item.fee?.genObc || item.fees?.genObc;
  const scSt = item.fee?.scSt || item.fees?.scSt;
  const note = item.fee?.note || item.paymentInstructions || item.feePerSubject;

  if (!hasRealDataValue(genObc) && !hasRealDataValue(scSt) && !hasRealDataValue(note)) {
    return null;
  }

  return (
    <section
      id="fee-structure"
      aria-label={sectionTitle}
      className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-3 text-start"
    >
      <div className="flex items-center gap-2">
        <Banknote className="w-5 h-5 text-[#1F9D6B] shrink-0" aria-hidden="true" />
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] m-0">
          {sectionTitle}
        </h2>
      </div>

      <dl className="divide-y divide-[var(--border-default)] border-t border-[var(--border-default)] m-0">
        {hasRealDataValue(genObc) && (
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
            <dt className="text-sm font-medium text-[var(--text-secondary)]">
              General / OBC / Open Merit
            </dt>
            <dd className="text-sm sm:text-base font-bold text-[var(--text-primary)] m-0 tabular-nums">
              {genObc || asPerNoticeText}
            </dd>
          </div>
        )}
        {hasRealDataValue(scSt) && (
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
            <dt className="text-sm font-medium text-[var(--text-secondary)]">
              SC / ST / Reserved / PwD
            </dt>
            <dd className="text-sm sm:text-base font-bold text-[#1F9D6B] m-0 tabular-nums">
              {scSt || asPerNoticeText}
            </dd>
          </div>
        )}
        {hasRealDataValue(note) && (
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
            <dt className="text-sm font-medium text-[var(--text-secondary)]">
              Payment Note
            </dt>
            <dd className="text-sm font-semibold text-[var(--text-primary)] m-0">
              {note}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

export function PostVacancyTable({
  rows,
  title,
  isEducation,
}: {
  rows?: DepartmentBreakdown[];
  title: string;
  isEducation: boolean;
}) {
  if (!rows || rows.length === 0) return null;
  const hasFeeCol = rows.some((r) => hasRealDataValue(r.fee));

  return (
    <section
      id="vacancy-details"
      aria-label={title}
      className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-3 text-start"
    >
      <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] m-0">
        {title}
      </h2>

      <div className="w-full overflow-x-auto rounded-xl border border-[var(--border-default)]">
        <table className="w-full text-start text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
              <th className="py-2.5 px-3">{isEducation ? 'Department' : 'Wing / Dept'}</th>
              <th className="py-2.5 px-3">{isEducation ? 'Programme' : 'Post Name'}</th>
              <th className="py-2.5 px-3 text-center tabular-nums">
                {isEducation ? 'Seats' : 'Posts'}
              </th>
              <th className="py-2.5 px-3">Qualification</th>
              {hasFeeCol && <th className="py-2.5 px-3">Fee</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {rows.map((row, idx) => (
              <tr key={`${row.postName}-${idx}`} className="hover:bg-[var(--bg-subtle)]/60">
                <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">
                  {row.department}
                </td>
                <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">
                  {row.postName}
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-[#1F9D6B] tabular-nums">
                  {row.posts}
                </td>
                <td className="py-2.5 px-3 text-xs sm:text-sm text-[var(--text-secondary)]">
                  {row.qualification}
                </td>
                {hasFeeCol && (
                  <td className="py-2.5 px-3 text-xs sm:text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                    {row.fee || '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function PostSscTimetableTable() {
  const rows = [
    {
      exam: 'Coast Guard Enrolled Persons Test (CGEPT) 01/2027 & 02/2027',
      dates: '17 – 18 November 2026',
      mode: 'Computer Based Exam',
    },
    {
      exam: 'Annual Departmental Typing & Stenographer Skill Test 2025',
      dates: '20 – 21 November 2026',
      mode: 'Skill / Typing Test',
    },
    {
      exam: 'Sub-Inspector in Delhi Police & CAPFs Examination (Paper-II)',
      dates: '28 November 2026',
      mode: 'Computer Based Exam',
    },
  ];

  return (
    <section
      aria-label="Official SSC Examination Schedule"
      className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-3 text-start"
    >
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#2563EB] shrink-0" aria-hidden="true" />
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] m-0">
          Official SSC Examination Timetable
        </h2>
      </div>
      <div className="w-full overflow-x-auto rounded-xl border border-[var(--border-default)]">
        <table className="w-full text-start text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">
              <th className="py-2.5 px-3">Examination</th>
              <th className="py-2.5 px-3">Scheduled Dates</th>
              <th className="py-2.5 px-3">Stage / Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {rows.map((r) => (
              <tr key={r.exam}>
                <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">{r.exam}</td>
                <td className="py-2.5 px-3 font-bold text-[#2563EB] tabular-nums whitespace-nowrap">
                  {r.dates}
                </td>
                <td className="py-2.5 px-3 text-[var(--text-secondary)]">{r.mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function PostProcessSteps({
  id,
  title,
  subtitle,
  steps,
}: {
  id: string;
  title: string;
  subtitle: string;
  steps: ProcessStep[];
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <section
      id={id}
      aria-label={title}
      className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-3.5 text-start"
    >
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] m-0">
          {title}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] m-0">{subtitle}</p>
      </div>

      <ol className="space-y-3 list-none m-0 p-0">
        {steps.map((step, idx) => (
          <li
            key={`${step.title}-${idx}`}
            className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]"
          >
            <span className="w-7 h-7 rounded-lg bg-[#101A36] dark:bg-[#F5A623] text-white dark:text-[#101A36] text-xs font-extrabold tabular-nums flex items-center justify-center shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <div className="min-w-0 space-y-0.5">
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] m-0">
                {step.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0 break-words">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PostTimelineCard({
  steps,
  title,
}: {
  steps: TimelineStep[];
  title: string;
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <section
      aria-label={title}
      className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 space-y-3 text-start"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)] m-0">
          {title}
        </h2>
      </div>

      <ol className="space-y-3 list-none m-0 p-0">
        {steps.map((step, idx) => {
          const isActive = step.status === 'active';
          const isDone = step.status === 'done';
          return (
            <li key={`${step.label}-${idx}`} className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0" aria-hidden="true">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1F9D6B]" />
                ) : isActive ? (
                  <Clock className="w-4 h-4 text-[#D97706]" />
                ) : (
                  <Circle className="w-4 h-4 text-[var(--text-muted)]" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-bold leading-snug ${
                    isActive
                      ? 'text-[var(--status-closing-text)]'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {step.label}
                </div>
                {step.date && (
                  <div className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums mt-0.5">
                    {step.date}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function PostExternalCtaRow({
  portalUrl,
  pdfUrl,
  portalLabel,
  pdfLabel,
  canApplyOnline,
  applyLabel,
  onApplyClick,
}: {
  portalUrl: string;
  pdfUrl?: string;
  portalLabel: string;
  pdfLabel: string;
  canApplyOnline: boolean;
  applyLabel: string;
  onApplyClick: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {canApplyOnline && (
        <button
          type="button"
          onClick={onApplyClick}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1F9D6B] hover:bg-[#178257] text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <span>{applyLabel}</span>
        </button>
      )}

      <a
        href={portalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#101A36] hover:bg-[#1B2A52] text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 no-underline transition-colors border border-white/10"
      >
        <span>{portalLabel}</span>
        <ExternalLink className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
      </a>

      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 no-underline transition-colors"
        >
          <span>{pdfLabel}</span>
          <ExternalLink className="w-4 h-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
