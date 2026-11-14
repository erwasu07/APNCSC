import React from 'react';
import { BellRing, MessageCircle, Send } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const DEFAULT_WHATSAPP_GROUP_URL =
  'https://chat.whatsapp.com/GqeYfcw1sdN0EQtGvVR1fI';

export interface AlertsBoxProps {
  whatsappUrl?: string;
  telegramUrl?: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
}

export function AlertsBox({
  whatsappUrl = DEFAULT_WHATSAPP_GROUP_URL,
  telegramUrl,
  title,
  subtitle,
  compact = false,
  className = '',
}: AlertsBoxProps) {
  const { t } = useLanguage();

  return (
    <section
      aria-label={title || t.alertsTitle}
      className={`bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      } space-y-3.5 ${className}`}
    >
      <div className="flex items-start gap-3 text-start">
        <div className="w-10 h-10 rounded-xl bg-[var(--status-closing-bg)] border border-[var(--status-closing-border)] flex items-center justify-center shrink-0">
          <BellRing
            className="w-5 h-5 text-[var(--status-closing-text)]"
            aria-hidden="true"
          />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] m-0 leading-snug">
            {title || t.alertsTitle}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] m-0 leading-relaxed">
            {subtitle || t.alertsSubtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[44px] px-4 py-2.5 bg-[#1F9D6B] hover:bg-[#178257] text-white rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 no-underline transition-colors"
        >
          <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t.joinWhatsAppGroup}</span>
        </a>

        {telegramUrl ? (
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[44px] px-4 py-2.5 bg-[#101A36] hover:bg-[#1B2A52] text-white rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 no-underline transition-colors border border-white/10"
          >
            <Send className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
            <span>{t.joinTelegramChannel}</span>
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="flex-1 min-h-[44px] px-4 py-2.5 bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
            <span>{t.joinTelegramChannel} ({t.comingSoon})</span>
          </span>
        )}
      </div>
    </section>
  );
}

export default AlertsBox;
