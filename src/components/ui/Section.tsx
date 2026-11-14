import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  secondaryAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({
  id,
  title,
  subtitle,
  actionLabel,
  actionHref,
  onActionClick,
  secondaryAction,
  children,
  className = '',
}: SectionProps) {
  return (
    <section id={id} className={`w-full ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
        <div className="space-y-1 text-start">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight leading-snug">
            {title}
          </h2>
          {subtitle && (
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">{subtitle}</p>
          )}
        </div>
        {(actionLabel || secondaryAction) && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {secondaryAction}
            {actionLabel && actionHref && (
              <a
                href={actionHref}
                onClick={(e) => {
                  if (onActionClick) {
                    e.preventDefault();
                    onActionClick();
                  }
                }}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-colors no-underline"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-4 h-4 text-[var(--text-primary)] rtl:rotate-180" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

export default Section;
