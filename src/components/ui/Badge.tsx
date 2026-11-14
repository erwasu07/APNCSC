import React from 'react';

export type BadgeVariant = 'navy' | 'amber' | 'green' | 'urgent' | 'neutral' | 'chip';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  navy: 'bg-[#101A36] text-white border border-[#101A36]',
  amber: 'bg-[var(--status-closing-bg)] text-[var(--status-closing-text)] border border-[var(--status-closing-border)]',
  green: 'bg-[var(--status-open-bg)] text-[var(--status-open-text)] border border-[var(--status-open-border)]',
  urgent: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60',
  neutral: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]',
  chip: 'bg-white/10 text-[#F5A623] border border-[#F5A623]/40',
};

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold leading-snug whitespace-nowrap ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
