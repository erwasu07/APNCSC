import React from 'react';

export interface TabWithCountItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsWithCountsProps {
  tabs: TabWithCountItem[];
  activeTabId: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function TabsWithCounts({
  tabs,
  activeTabId,
  onChange,
  ariaLabel = 'Filter categories',
  className = '',
}: TabsWithCountsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#101A36] dark:bg-[#F5A623] text-white dark:text-[#101A36] border-[#101A36] dark:border-[#F5A623] shadow-2xs'
                : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-strong)]'
            }`}
          >
            {tab.icon && <span className="shrink-0" aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold tabular-nums ${
                  isActive
                    ? 'bg-white/20 text-current'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default TabsWithCounts;
