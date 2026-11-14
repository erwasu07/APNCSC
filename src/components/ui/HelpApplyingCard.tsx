import React from 'react';
import { PhoneCall, MessageCircle, MapPin, ShieldCheck, UserCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface HelpApplyingCardProps {
  contextTitle?: string;
  onTrackClick?: () => void;
  className?: string;
}

export function HelpApplyingCard({
  contextTitle,
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
      className={`w-full bg-white border border-[#DCE3EE] rounded-2xl p-5 sm:p-6 shadow-2xs text-start ${className}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#ECFDF5] text-[#146C48] border border-[#A7F3D0] text-xs font-bold uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />
            <span>CSC DOST Citizen Helpdesk</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#101A36] tracking-tight">
              {t.helpTitle}
            </h2>
            <p className="text-base text-[#526075] leading-relaxed">
              {t.helpSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-sm text-[#101A36]">
            <div className="flex items-center gap-2 bg-[#F6F8FC] border border-[#DCE3EE] rounded-lg px-3 py-2">
              <UserCheck className="w-4 h-4 text-[#101A36] shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#526075]">
                  {t.helpOperatorLabel}
                </span>
                <span className="font-bold text-[#101A36] block truncate">
                  Wasim Ahmad Khanday
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#F6F8FC] border border-[#DCE3EE] rounded-lg px-3 py-2">
              <ShieldCheck className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#526075]">
                  {t.helpVleLabel}
                </span>
                <span className="font-mono font-bold text-[#101A36] block">
                  212515670018
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#F6F8FC] border border-[#DCE3EE] rounded-lg px-3 py-2">
              <MapPin className="w-4 h-4 text-[#B45309] shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#526075]">
                  {t.helpLocationLabel}
                </span>
                <span className="font-semibold text-[#101A36] block truncate">
                  Sangran Qazigund, Anantnag
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 sm:min-w-[260px]">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] px-5 py-3 bg-[#1F9D6B] hover:bg-[#178257] text-white font-bold text-base rounded-xl inline-flex items-center justify-center gap-2 transition-colors no-underline shadow-xs"
          >
            <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{t.whatsappNow}</span>
          </a>

          <a
            href="tel:+917006833767"
            className="min-h-[48px] px-5 py-3 bg-[#101A36] hover:bg-[#1B2A52] text-white font-bold text-base rounded-xl inline-flex items-center justify-center gap-2 transition-colors no-underline"
          >
            <PhoneCall className="w-5 h-5 shrink-0 text-[#F5A623]" aria-hidden="true" />
            <span dir="ltr">{t.callNow}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default HelpApplyingCard;
