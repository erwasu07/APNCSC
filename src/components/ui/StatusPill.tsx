import React from 'react';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  Sparkles,
  Archive,
} from 'lucide-react';

export type StatusTone =
  | 'open'
  | 'closing_soon'
  | 'exam'
  | 'result'
  | 'upcoming'
  | 'closed';

interface StatusConfig {
  defaultLabel: string;
  bgVar: string;
  textVar: string;
  borderVar: string;
  Icon: React.ElementType;
}

const STATUS_MAP: Record<StatusTone, StatusConfig> = {
  open: {
    defaultLabel: 'Open',
    bgVar: 'bg-[var(--status-open-bg)]',
    textVar: 'text-[var(--status-open-text)]',
    borderVar: 'border-[var(--status-open-border)]',
    Icon: CheckCircle2,
  },
  closing_soon: {
    defaultLabel: 'Closing soon',
    bgVar: 'bg-[var(--status-closing-bg)]',
    textVar: 'text-[var(--status-closing-text)]',
    borderVar: 'border-[var(--status-closing-border)]',
    Icon: Clock,
  },
  exam: {
    defaultLabel: 'Exam / Admit card',
    bgVar: 'bg-[var(--status-exam-bg)]',
    textVar: 'text-[var(--status-exam-text)]',
    borderVar: 'border-[var(--status-exam-border)]',
    Icon: Calendar,
  },
  result: {
    defaultLabel: 'Result / Key',
    bgVar: 'bg-[var(--status-result-bg)]',
    textVar: 'text-[var(--status-result-text)]',
    borderVar: 'border-[var(--status-result-border)]',
    Icon: Award,
  },
  upcoming: {
    defaultLabel: 'Upcoming',
    bgVar: 'bg-[var(--status-upcoming-bg)]',
    textVar: 'text-[var(--status-upcoming-text)]',
    borderVar: 'border-[var(--status-upcoming-border)]',
    Icon: Sparkles,
  },
  closed: {
    defaultLabel: 'Closed',
    bgVar: 'bg-[var(--status-closed-bg)]',
    textVar: 'text-[var(--status-closed-text)]',
    borderVar: 'border-[var(--status-closed-border)]',
    Icon: Archive,
  },
};

export interface StatusPillProps {
  status: StatusTone;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusPill({
  status,
  label,
  size = 'sm',
  className = '',
}: StatusPillProps) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.closed;
  const IconComponent = cfg.Icon;
  const sizeClasses =
    size === 'md'
      ? 'px-3 py-1 text-xs font-bold gap-1.5'
      : 'px-2.5 py-0.5 text-xs font-semibold gap-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border leading-snug whitespace-nowrap tabular-nums ${cfg.bgVar} ${cfg.textVar} ${cfg.borderVar} ${sizeClasses} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label || cfg.defaultLabel}</span>
    </span>
  );
}

export default StatusPill;
