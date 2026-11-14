import React, { useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const DEFAULT_WHATSAPP_GROUP_URL =
  'https://chat.whatsapp.com/GqeYfcw1sdN0EQtGvVR1fI';

export interface PublicAlertsConfig {
  whatsappUrl: string;
  whatsappType: 'channel' | 'group';
  channelUrl: string;
  groupInviteUrl: string;
  telegramUrl: string;
}

const DEFAULT_ALERTS_CONFIG: PublicAlertsConfig = {
  whatsappUrl: DEFAULT_WHATSAPP_GROUP_URL,
  whatsappType: 'group',
  channelUrl: '',
  groupInviteUrl: DEFAULT_WHATSAPP_GROUP_URL,
  telegramUrl: '',
};

let cachedAlertsConfig: PublicAlertsConfig | null = null;
let inflightAlertsPromise: Promise<PublicAlertsConfig> | null = null;

export function fetchPublicAlertsConfig(): Promise<PublicAlertsConfig> {
  if (cachedAlertsConfig) return Promise.resolve(cachedAlertsConfig);
  if (inflightAlertsPromise) return inflightAlertsPromise;

  inflightAlertsPromise = fetch('/api/public/alerts-config')
    .then(async (res) => {
      if (!res.ok) return DEFAULT_ALERTS_CONFIG;
      const data = (await res.json()) as Partial<PublicAlertsConfig>;
      const normalized: PublicAlertsConfig = {
        whatsappUrl: data.whatsappUrl || DEFAULT_WHATSAPP_GROUP_URL,
        whatsappType: data.whatsappType === 'channel' && data.channelUrl ? 'channel' : 'group',
        channelUrl: data.channelUrl || '',
        groupInviteUrl: data.groupInviteUrl || DEFAULT_WHATSAPP_GROUP_URL,
        telegramUrl: data.telegramUrl || '',
      };
      cachedAlertsConfig = normalized;
      return normalized;
    })
    .catch(() => DEFAULT_ALERTS_CONFIG)
    .finally(() => {
      inflightAlertsPromise = null;
    });

  return inflightAlertsPromise;
}

export function usePublicAlertsConfig(): PublicAlertsConfig {
  const [config, setConfig] = useState<PublicAlertsConfig>(
    cachedAlertsConfig || DEFAULT_ALERTS_CONFIG
  );

  useEffect(() => {
    let active = true;
    fetchPublicAlertsConfig().then((cfg) => {
      if (active) setConfig(cfg);
    });
    return () => {
      active = false;
    };
  }, []);

  return config;
}

export interface AlertsBoxProps {
  whatsappUrl?: string;
  telegramUrl?: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
}

export function AlertsBox({
  whatsappUrl,
  telegramUrl,
  title,
  subtitle,
  compact = false,
  className = '',
}: AlertsBoxProps) {
  const { t } = useLanguage();
  const config = usePublicAlertsConfig();

  const effectiveWhatsappUrl = whatsappUrl || config.whatsappUrl || DEFAULT_WHATSAPP_GROUP_URL;
  const isChannel = Boolean(config.channelUrl && effectiveWhatsappUrl === config.channelUrl);
  const buttonLabel = isChannel ? t.joinWhatsAppChannelBtn : t.joinWhatsAppGroupBtn;
  const effectiveTelegramUrl = telegramUrl || config.telegramUrl;

  return (
    <section
      aria-label={title || t.alertsTitle}
      className={`bg-[#1F9D6B] text-white rounded-2xl shadow-xs ${
        compact ? 'p-4' : 'px-4 py-4 sm:px-6 sm:py-5'
      } ${className}`}
    >
      <div
        className={`flex flex-col ${
          compact ? 'gap-3' : 'sm:flex-row sm:items-center sm:justify-between gap-3.5'
        } text-start`}
      >
        <div className="space-y-0.5 min-w-0">
          <h2 className="text-base sm:text-lg font-extrabold text-white m-0 leading-snug">
            {title || t.alertsTitle}
          </h2>
          <p className="text-sm text-emerald-50 m-0 leading-relaxed">
            {subtitle || t.alertsSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={effectiveWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-4 py-2 bg-white hover:bg-emerald-50 text-[#101A36] rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 no-underline transition-colors shadow-2xs"
          >
            <MessageCircle className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />
            <span>{buttonLabel}</span>
          </a>

          {effectiveTelegramUrl && (
            <a
              href={effectiveTelegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2 bg-[#101A36] hover:bg-[#1B2A52] text-white rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 no-underline transition-colors"
            >
              <Send className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
              <span>{t.joinTelegramChannel}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export default AlertsBox;
