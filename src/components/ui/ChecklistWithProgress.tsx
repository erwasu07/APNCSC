import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Info } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
}

export interface ChecklistWithProgressProps {
  title: string;
  items: (string | ChecklistItem)[];
  storageKey?: string;
  note?: string;
  className?: string;
}

export function ChecklistWithProgress({
  title,
  items,
  storageKey,
  note = 'Always confirm final eligibility and document specifications against the official notification.',
  className = '',
}: ChecklistWithProgressProps) {
  const normalizedItems: ChecklistItem[] = items.map((item, idx) =>
    typeof item === 'string' ? { id: `item-${idx}`, label: item } : item
  );

  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    if (!storageKey || typeof window === 'undefined') return [];
    try {
      const saved = window.localStorage.getItem(`csc_chk_${storageKey}`);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`csc_chk_${storageKey}`, JSON.stringify(checkedIds));
    } catch {}
  }, [checkedIds, storageKey]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const total = normalizedItems.length;
  const completed = normalizedItems.filter((item) => checkedIds.includes(item.id)).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 sm:p-5 space-y-3.5 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] m-0">
          {title}
        </h3>
        <span className="text-xs font-bold tabular-nums px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
          {completed} of {total} ready ({percent}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${title} completion progress`}
        className="w-full h-2.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden"
      >
        <div
          className="h-full bg-[#1F9D6B] transition-all duration-200 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Interactive Checklist Items */}
      <ul className="space-y-1.5 list-none m-0 p-0">
        {normalizedItems.map((item) => {
          const checked = checkedIds.includes(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggleItem(item.id)}
                className={`w-full min-h-[44px] flex items-start gap-3 text-start px-3 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                  checked
                    ? 'bg-[var(--status-open-bg)] border-[var(--status-open-border)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {checked ? (
                  <CheckSquare
                    className="w-5 h-5 text-[#1F9D6B] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                ) : (
                  <Square
                    className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span
                    className={`block text-sm sm:text-base font-medium leading-snug ${
                      checked ? 'line-through opacity-80' : ''
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.detail && (
                    <span className="block text-xs text-[var(--text-secondary)] mt-0.5">
                      {item.detail}
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {note && (
        <p className="flex items-start gap-2 text-xs text-[var(--text-secondary)] m-0 pt-1">
          <Info className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5" aria-hidden="true" />
          <span>{note}</span>
        </p>
      )}
    </div>
  );
}

export default ChecklistWithProgress;
