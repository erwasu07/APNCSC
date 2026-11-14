import React, { useState, useEffect, useId } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  title?: string;
  items: FaqItem[];
  injectSchema?: boolean;
  defaultOpenIndex?: number | null;
  className?: string;
}

export function FaqAccordion({
  title = 'Frequently Asked Questions',
  items,
  injectSchema = true,
  defaultOpenIndex = 0,
  className = '',
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);
  const baseId = useId();

  useEffect(() => {
    if (!injectSchema || items.length === 0 || typeof document === 'undefined') {
      return;
    }

    const scriptId = `csc-faq-schema-${baseId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });

    return () => {
      try {
        const existing = document.getElementById(scriptId);
        if (existing) existing.remove();
      } catch {}
    };
  }, [items, injectSchema, baseId]);

  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label={title}
      className={`bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 sm:p-5 space-y-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-[#F5A623] shrink-0" aria-hidden="true" />
        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] m-0">
          {title}
        </h3>
      </div>

      <div className="divide-y divide-[var(--border-default)] border-t border-[var(--border-default)]">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          const btnId = `${baseId}-btn-${idx}`;
          const panelId = `${baseId}-panel-${idx}`;

          return (
            <div key={`${item.question}-${idx}`} className="py-1">
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full min-h-[44px] flex items-center justify-between gap-3 py-2.5 text-start font-semibold text-sm sm:text-base text-[var(--text-primary)] hover:text-[#1F9D6B] transition-colors cursor-pointer"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="pb-3 pt-0.5 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed"
                >
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FaqAccordion;
