import React from 'react';
import { ExternalLink, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface StickyMobileActionBarProps {
  officialUrl?: string;
  officialLabel?: string;
  onShareWhatsApp?: () => void;
  shareWhatsAppUrl?: string;
  shareLabel?: string;
  /** Keep clear of MobileBottomNav when bottom nav is visible */
  aboveBottomNav?: boolean;
  className?: string;
}

export function StickyMobileActionBar({
  officialUrl,
  officialLabel,
  onShareWhatsApp,
  shareWhatsAppUrl,
  shareLabel,
  aboveBottomNav = true,
  className = '',
}: StickyMobileActionBarProps) {
  const { t } = useLanguage();

  const resolvedOfficialLabel = officialLabel || t.officialNotice;
  const resolvedShareLabel = shareLabel || t.shareOnWhatsApp;

  if (!officialUrl && !onShareWhatsApp && !shareWhatsAppUrl) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Quick actions"
      className={`md:hidden fixed inset-x-0 z-35 bg-[var(--bg-surface)] border-t border-[var(--border-default)] px-3 py-2 shadow-[0_-4px_14px_rgba(10,17,36,0.12)] flex items-center gap-2.5 ${
        aboveBottomNav
          ? 'bottom-[calc(58px+env(safe-area-inset-bottom))]'
          : 'bottom-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]'
      } ${className}`}
    >
      {officialUrl && (
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[44px] px-3.5 py-2 bg-[#101A36] hover:bg-[#1B2A52] text-white rounded-xl font-bold text-sm inline-flex items-center justify-center gap-1.5 no-underline transition-colors"
        >
          <span className="truncate">{resolvedOfficialLabel}</span>
          <ExternalLink className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
        </a>
      )}

      {onShareWhatsApp ? (
        <button
          type="button"
          onClick={onShareWhatsApp}
          className="flex-1 min-h-[44px] px-3.5 py-2 bg-[#1F9D6B] hover:bg-[#178257] text-white rounded-xl font-bold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{resolvedShareLabel}</span>
        </button>
      ) : shareWhatsAppUrl ? (
        <a
          href={shareWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[44px] px-3.5 py-2 bg-[#1F9D6B] hover:bg-[#178257] text-white rounded-xl font-bold text-sm inline-flex items-center justify-center gap-1.5 no-underline transition-colors"
        >
          <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{resolvedShareLabel}</span>
        </a>
      ) : null}
    </div>
  );
}

export default StickyMobileActionBar;
