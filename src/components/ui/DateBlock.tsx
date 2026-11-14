import React from 'react';
import { Calendar } from 'lucide-react';
import type { StatusTone } from './StatusPill';

export interface DateBlockProps {
  label: string;
  dateText: string;
  hint?: string;
  tone?: StatusTone;
  compact?: boolean;
  className?: string;
}

const TONE_CLASSES: Record<StatusTone, string> = {
  open: 'bg-[var(--status-open-bg)] border-[var(--status-open-border)] text-[var(--status-open-text)]',
  closing_soon: 'bg-[var(--status-closing-bg)] border-[var(--status-closing-border)] text-[var(--status-closing-text)]',
  exam: 'bg-[var(--status-exam-bg)] border-[var(--status-exam-border)] text-[var(--status-exam-text)]',
  result: 'bg-[var(--status-result-bg)] border-[var(--status-result-border)] text-[var(--status-result-text)]',
  upcoming: 'bg-[var(--status-upcoming-bg)] border-[var(--status-upcoming-border)] text-[var(--status-upcoming-text)]',
  closed: 'bg-[var(--bg-subtle)] border-[var(--border-default)] text-[var(--text-secondary)]',
};

export function DateBlock({
  label,
  dateText,
  hint,
  tone = 'closed',
  compact = false,
  className = '',
}: DateBlockProps) {
  return (
    <div
      className={`rounded-lg border ${TONE_CLASSES[tone]} ${
        compact ? 'px-2.5 py-1.5' : 'px-3 py-2'
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-85">
        <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="text-sm font-bold tabular-nums mt-0.5 leading-snug text-[var(--text-primary)]">
        {dateText}
      </div>
      {hint && (
        <div className="text-xs font-semibold tabular-nums mt-0.5 leading-snug">
          {hint}
        </div>
      )}
    </div>
  );
}

export default DateBlock;
