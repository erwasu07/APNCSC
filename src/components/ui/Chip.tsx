import React from 'react';

export interface ChipProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'verified';
  className?: string;
}

const CHIP_STYLES = {
  default: 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-default)]',
  accent: 'bg-[var(--status-closing-bg)] text-[var(--status-closing-text)] border-[var(--status-closing-border)]',
  verified: 'bg-[var(--status-open-bg)] text-[var(--status-open-text)] border-[var(--status-open-border)]',
};

export function Chip({
  children,
  icon,
  variant = 'default',
  className = '',
}: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold leading-snug tabular-nums ${CHIP_STYLES[variant]} ${className}`}
    >
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export interface FilterChipProps {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
  className?: string;
}

export function FilterChip({
  label,
  active,
  count,
  onClick,
  className = '',
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
        active
          ? 'bg-[#101A36] dark:bg-[#F5A623] text-white dark:text-[#101A36] border-[#101A36] dark:border-[#F5A623]'
          : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]'
      } ${className}`}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`px-1.5 py-0.5 rounded-md text-xs font-bold tabular-nums ${
            active
              ? 'bg-white/20 text-current'
              : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default Chip;
