import React from 'react';
import { PhoneCall, MessageCircle, MapPin, ShieldCheck, UserCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface HelpApplyingCardProps {
  contextTitle?: string;
  onTrackClick?: () => void;
  compact?: boolean;
  className?: string;
}

export function HelpApplyingCard({
  contextTitle,
  compact = false,
  className = '',
}: HelpApplyingCardProps) {
  const { t } = useLanguage();

  const whatsappMessage = contextTitle
    ? `Hello Wasim Ahmad Khanday (CSC DOST), I need help applying for: ${contextTitle}`
    : 'Hello Wasim Ahmad Khanday (CSC DOST), I need help with an online application or service.';
  const whatsappUrl = `https://wa.me/917006833767?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section
      aria-label={t.helpTitle}
      className={`w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      } shadow-2xs text-start ${className}`}
    >
      <div
        className={`flex flex-col ${
          compact ? 'gap-4' : 'lg:flex-row lg:items-center justify-between gap-5'
        }`}
      >
        <div className={`space-y-3 ${compact ? '' : 'max-w-2xl'}`}>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--status-open-bg)] text-[var(--status-open-text)] border border-[var(--status-open-border)] text-xs font-bold uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>CSC DOST Citizen Helpdesk</span>
          </div>

          <div className="space-y-1">
            <h2
              className={`${
                compact ? 'text-lg' : 'text-xl sm:text-2xl'
              } font-bold text-[var(--text-primary)] tracking-tight m-0`}
            >
              {t.helpTitle}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed m-0">
              {t.helpSubtitle}
            </p>
          </div>

          <div
            className={`grid grid-cols-1 ${
              compact ? '' : 'sm:grid-cols-3'
            } gap-2.5 pt-1 text-sm text-[var(--text-primary)]`}
          >
            <div className="flex items-center gap-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2">
              <UserCheck className="w-4 h-4 text-[var(--text-primary)] shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {t.helpOperatorLabel}
                </span>
                <span className="font-bold text-[var(--text-primary)] block truncate">
                  Wasim Ahmad Khanday
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2">
              <ShieldCheck className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {t.helpVleLabel}
                </span>
                <span className="font-mono font-bold text-[var(--text-primary)] block tabular-nums">
                  212515670018
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2">
              <MapPin className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {t.helpLocationLabel}
                </span>
                <span className="font-semibold text-[var(--text-primary)] block truncate">
                  Sangran Qazigund, Anantnag
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`flex flex-col ${
            compact ? 'gap-2.5' : 'sm:flex-row lg:flex-col gap-3 shrink-0 sm:min-w-[260px]'
          }`}
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[46px] px-4 py-2.5 bg-[#1F9D6B] hover:bg-[#178257] text-white font-bold text-sm sm:text-base rounded-xl inline-flex items-center justify-center gap-2 transition-colors no-underline shadow-xs"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
            <span>{t.whatsappNow}</span>
          </a>

          <a
            href="tel:+917006833767"
            className="min-h-[46px] px-4 py-2.5 bg-[#101A36] hover:bg-[#1B2A52] text-white font-bold text-sm sm:text-base rounded-xl inline-flex items-center justify-center gap-2 transition-colors no-underline border border-white/10"
          >
            <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#F5A623]" aria-hidden="true" />
            <span dir="ltr" className="tabular-nums">{t.callNow}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default HelpApplyingCard;
