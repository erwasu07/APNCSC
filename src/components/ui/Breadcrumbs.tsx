import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function Breadcrumbs({
  items,
  onNavigate,
  rightSlot,
  className = '',
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--text-secondary)] ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1 list-none m-0 p-0">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="inline-flex items-center gap-1">
              {idx > 0 && (
                <ChevronRight
                  className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 rtl:rotate-180"
                  aria-hidden="true"
                />
              )}
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate(item.href!);
                    }
                  }}
                  className="min-h-[44px] md:min-h-[32px] inline-flex items-center font-semibold text-[var(--text-primary)] hover:text-[#1F9D6B] hover:underline no-underline"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="font-semibold text-[var(--text-primary)] line-clamp-1"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </nav>
  );
}

export default Breadcrumbs;
