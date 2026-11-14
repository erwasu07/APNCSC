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
      className={`w-full my-2 px-3 py-3 bg-white border border-dashed border-[#CBD5E1] rounded-xl text-center min-h-[104px] flex flex-col items-center justify-center ${className}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-1.5">
        {t.adLabel}
      </span>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: 'block', minHeight: '64px' }}
        data-ad-client="ca-pub-3600904217061779"
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

export default AdSlot;
