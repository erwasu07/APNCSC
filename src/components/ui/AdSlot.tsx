import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdSlotProps {
  slotId?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ slotId = 'auto', className = '' }: AdSlotProps) {
  const { t } = useLanguage();
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    try {
      if (typeof window !== 'undefined' && Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle.push({});
        pushedRef.current = true;
      }
    } catch {
      // Ignore AdSense initialization errors in preview/ad-blocked environments
    }
  }, []);

  return (
    <aside
      aria-label={t.adLabel}
      className={`w-full my-3 px-3 py-2.5 bg-[var(--bg-surface)] border border-dashed border-[var(--border-strong)] rounded-xl text-center h-[120px] md:h-[112px] overflow-hidden flex flex-col items-center justify-center ${className}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1 shrink-0">
        {t.adLabel}
      </span>
      <ins
        className="adsbygoogle block w-full overflow-hidden"
        style={{ display: 'block', height: '72px' }}
        data-ad-client="ca-pub-3600904217061779"
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

export default AdSlot;
