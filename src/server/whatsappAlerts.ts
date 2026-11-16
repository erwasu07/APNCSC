import {
  getWhatsAppAlertSettings,
  getWhatsAppAlertState,
  saveWhatsAppAlertState,
  addWhatsAppAlertLog,
  WhatsAppAlertSettings,
  WhatsAppAlertType,
  WhatsAppProviderType,
} from '../dbServer';

export const STAFF_REVIEW_URL = 'https://www.cscdost.com/staff';
export const DAILY_ALERT_LIMIT = 20;
export const URGENT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export interface SummaryTemplateVars {
  newDrafts: number;
  updates: number;
  carefulReview: number;
  sourcesFailing?: number;
  reviewLink?: string;
}

export interface SendWhatsAppOptions {
  providerOverride?: WhatsAppProviderType;
  templateVars?: SummaryTemplateVars;
  retryDelaysMs?: number[];
  fetchImpl?: typeof fetch;
}

export interface SendWhatsAppResult {
  success: boolean;
  provider: WhatsAppProviderType;
  attempts: number;
  responseSummary?: string;
  error?: string;
}

/**
 * Masks a phone number for safe logging (never exposes full phone numbers)
 */
export function maskPhoneNumberForLogs(phone: string): string {
  const clean = String(phone || '').replace(/[^\d+]/g, '');
  if (!clean) return '***';
  if (clean.length <= 4) return '****';
  const last4 = clean.slice(-4);
  const prefix = clean.startsWith('+') ? clean.slice(0, 3) : '';
  const maskedCount = Math.max(4, clean.length - prefix.length - 4);
  return `${prefix}${'*'.repeat(maskedCount)}${last4}`;
}

/**
 * Strips any potential tokens, API keys, or phone numbers from error/log strings
 */
export function sanitizeAlertLogText(raw: string): string {
  let out = String(raw || '');
  // Redact query apikey=...
  out = out.replace(/([?&]apikey=)[^&\s]+/gi, '$1[REDACTED]');
  // Redact Bearer / Basic tokens
  out = out.replace(/(Bearer|Basic)\s+[A-Za-z0-9._+/=-]+/gi, '$1 [REDACTED]');
  // Redact Twilio AC... / Meta EAA... style tokens if embedded
  out = out.replace(/\b(EAA[A-Za-z0-9]{12,}|AC[a-f0-9]{20,})\b/g, '[REDACTED_TOKEN]');
  // Redact long digit sequences (phone numbers)
  out = out.replace(/(\+?\d[\d\s-]{6,}\d)/g, (m) => maskPhoneNumberForLogs(m));
  return out.trim().slice(0, 300);
}

/**
 * Sanitizes message text: plain text, concise (< 400 chars), no excessive emojis
 */
export function formatConcisePlainMessage(text: string): string {
  const clean = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (clean.length <= 395) return clean;
  return `${clean.slice(0, 392).trimEnd()}...`;
}

export function getConfiguredWhatsAppProvider(): WhatsAppProviderType {
  const raw = (process.env.WHATSAPP_PROVIDER || 'cloud_api').trim().toLowerCase();
  if (raw === 'twilio') return 'twilio';
  if (raw === 'callmebot') return 'callmebot';
  return 'cloud_api';
}

function normalizeInternationalPhone(raw: string): string {
  const cleaned = String(raw || '')
    .trim()
    .replace(/^whatsapp:/i, '')
    .replace(/[\s()-]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return `+${cleaned.slice(1).replace(/\D/g, '')}`;
  const digits = cleaned.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

/**
 * Reads owner WhatsApp numbers strictly from server-side environment secrets
 * (OWNER_PHONES comma-separated, with OWNER_PHONE fallback).
 */
export function getOwnerPhoneNumbers(): string[] {
  const listRaw = (process.env.OWNER_PHONES || '').trim();
  const singleRaw = (process.env.OWNER_PHONE || '').trim();
  const combined = [listRaw, singleRaw].filter(Boolean).join(',');
  if (!combined) return [];

  const unique = new Set<string>();
  for (const part of combined.split(',')) {
    const norm = normalizeInternationalPhone(part);
    if (norm && norm.replace(/\D/g, '').length >= 8) {
      unique.add(norm);
    }
  }
  return Array.from(unique);
}

export function getProviderSecretsStatus(provider = getConfiguredWhatsAppProvider()): {
  provider: WhatsAppProviderType;
  configured: boolean;
  ownerPhonesCount: number;
  ownerPhonesMasked: string[];
  missingVars: string[];
} {
  const owners = getOwnerPhoneNumbers();
  const missingVars: string[] = [];

  if (provider === 'cloud_api') {
    if (!(process.env.WA_PHONE_NUMBER_ID || '').trim()) missingVars.push('WA_PHONE_NUMBER_ID');
    if (!(process.env.WA_ACCESS_TOKEN || '').trim()) missingVars.push('WA_ACCESS_TOKEN');
    if (owners.length === 0) missingVars.push('OWNER_PHONES');
  } else if (provider === 'twilio') {
    if (!(process.env.TWILIO_ACCOUNT_SID || '').trim()) missingVars.push('TWILIO_ACCOUNT_SID');
    if (!(process.env.TWILIO_AUTH_TOKEN || '').trim()) missingVars.push('TWILIO_AUTH_TOKEN');
    if (!(process.env.TWILIO_WHATSAPP_FROM || '').trim()) missingVars.push('TWILIO_WHATSAPP_FROM');
    if (owners.length === 0) missingVars.push('OWNER_PHONES');
  } else {
    if (!(process.env.CALLMEBOT_API_KEY || '').trim()) missingVars.push('CALLMEBOT_API_KEY');
    if (owners.length === 0 && !(process.env.OWNER_PHONE || '').trim()) missingVars.push('OWNER_PHONE');
  }

  return {
    provider,
    configured: missingVars.length === 0,
    ownerPhonesCount: owners.length,
    ownerPhonesMasked: owners.map(maskPhoneNumberForLogs),
    missingVars
  };
}

/**
 * Returns IST (Asia/Kolkata, UTC+05:30) date key and time parts
 */
export function getIstTimeParts(date = new Date()): {
  dateKey: string;
  hour: number;
  minute: number;
  totalMinutes: number;
  hhmm: string;
  slotKey: string;
} {
  const istMs = date.getTime() + 330 * 60 * 1000;
  const istDate = new Date(istMs);
  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  const hour = istDate.getUTCHours();
  const minute = istDate.getUTCMinutes();
  const dateKey = `${year}-${month}-${day}`;
  const hhmm = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const slotKey = `${dateKey}-${String(hour).padStart(2, '0')}`;
  return {
    dateKey,
    hour,
    minute,
    totalMinutes: hour * 60 + minute,
    hhmm,
    slotKey
  };
}

function parseHhmmToMinutes(hhmm: string, fallbackMinutes: number): number {
  const m = String(hhmm || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return fallbackMinutes;
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return h * 60 + min;
}

export function isWithinQuietHours(settings: WhatsAppAlertSettings, now = new Date()): boolean {
  if (!settings.quietHoursEnabled) return false;
  const { totalMinutes } = getIstTimeParts(now);
  const startMin = parseHhmmToMinutes(settings.quietStartIst, 22 * 60); // 22:00 IST
  const endMin = parseHhmmToMinutes(settings.quietEndIst, 6 * 60 + 30); // 06:30 IST

  if (startMin === endMin) return false;
  if (startMin > endMin) {
    // Overnight window (e.g. 22:00 -> 06:30)
    return totalMinutes >= startMin || totalMinutes < endMin;
  }
  return totalMinutes >= startMin && totalMinutes < endMin;
}

async function sendOnceViaProvider(
  provider: WhatsAppProviderType,
  to: string,
  message: string,
  options?: SendWhatsAppOptions
): Promise<{ ok: boolean; responseSummary?: string; error?: string }> {
  const doFetch = options?.fetchImpl || globalThis.fetch;
  const normalizedTo = normalizeInternationalPhone(to);
  if (!normalizedTo) {
    return { ok: false, error: 'Recipient owner phone number is missing or invalid.' };
  }
  const plainBody = formatConcisePlainMessage(message);

  if (provider === 'cloud_api') {
    const phoneId = (process.env.WA_PHONE_NUMBER_ID || '').trim();
    const accessToken = (process.env.WA_ACCESS_TOKEN || '').trim();
    if (!phoneId || !accessToken) {
      return { ok: false, error: 'Missing server secret WA_PHONE_NUMBER_ID or WA_ACCESS_TOKEN.' };
    }

    const recipientDigits = normalizedTo.replace(/^\+/, '');
    const tpl = options?.templateVars;
    const payload = tpl
      ? {
          messaging_product: 'whatsapp',
          to: recipientDigits,
          type: 'template',
          template: {
            name: 'cscdost_review_alert',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: String(tpl.newDrafts) },
                  { type: 'text', text: String(tpl.updates) },
                  { type: 'text', text: String(tpl.carefulReview) },
                  { type: 'text', text: String(tpl.reviewLink || STAFF_REVIEW_URL) }
                ]
              }
            ]
          }
        }
      : {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientDigits,
          type: 'text',
          text: {
            preview_url: false,
            body: plainBody
          }
        };

    const res = await doFetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(phoneId)}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error: sanitizeAlertLogText(data?.error?.message || `Meta Cloud API HTTP ${res.status}`)
      };
    }
    const msgId = data?.messages?.[0]?.id || 'accepted';
    return { ok: true, responseSummary: `cloud_api messageId=${msgId}` };
  }

  if (provider === 'twilio') {
    const sid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
    const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
    const fromRaw = (process.env.TWILIO_WHATSAPP_FROM || '').trim();
    if (!sid || !authToken || !fromRaw) {
      return { ok: false, error: 'Missing server secret TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_WHATSAPP_FROM.' };
    }

    const fromFormatted = fromRaw.startsWith('whatsapp:')
      ? fromRaw
      : `whatsapp:${normalizeInternationalPhone(fromRaw)}`;
    const toFormatted = `whatsapp:${normalizedTo}`;

    const form = new URLSearchParams();
    form.set('From', fromFormatted);
    form.set('To', toFormatted);
    form.set('Body', plainBody);

    const basicAuth = Buffer.from(`${sid}:${authToken}`).toString('base64');
    const res = await doFetch(
      `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: form.toString()
      }
    );

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error: sanitizeAlertLogText(data?.message || `Twilio HTTP ${res.status}`)
      };
    }
    return { ok: true, responseSummary: `twilio sid=${data?.sid || 'queued'} status=${data?.status || 'accepted'}` };
  }

  // Provider C: callmebot
  const apiKey = (process.env.CALLMEBOT_API_KEY || '').trim();
  const targetPhone = normalizedTo || normalizeInternationalPhone(process.env.OWNER_PHONE || '');
  if (!apiKey || !targetPhone) {
    return { ok: false, error: 'Missing server secret CALLMEBOT_API_KEY or OWNER_PHONE.' };
  }

  const callmebotPhone = targetPhone.replace(/\s+/g, '');
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(callmebotPhone)}&text=${encodeURIComponent(plainBody)}&apikey=${encodeURIComponent(apiKey)}`;
  const res = await doFetch(url, { method: 'GET' });
  const bodyText = await res.text().catch(() => '');

  if (!res.ok || /error|invalid|denied/i.test(bodyText)) {
    return {
      ok: false,
      error: sanitizeAlertLogText(bodyText || `CallMeBot HTTP ${res.status}`)
    };
  }
  return { ok: true, responseSummary: 'callmebot queued' };
}

/**
 * Core server-side WhatsApp transport with up to 3 retries & increasing delay.
 * Never logs or exposes full phone numbers, tokens, or API keys.
 */
export async function sendWhatsApp(
  to: string,
  message: string,
  options?: SendWhatsAppOptions
): Promise<SendWhatsAppResult> {
  const provider = options?.providerOverride || getConfiguredWhatsAppProvider();
  const retryDelays = options?.retryDelaysMs || [1000, 3000, 7000];
  const maxRetries = Math.min(3, retryDelays.length);

  let lastError = 'Unknown provider failure';
  let attempts = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;
    try {
      const outcome = await sendOnceViaProvider(provider, to, message, options);
      if (outcome.ok) {
        return {
          success: true,
          provider,
          attempts,
          responseSummary: outcome.responseSummary
        };
      }
      lastError = outcome.error || 'Delivery rejected by provider';
    } catch (err: any) {
      lastError = sanitizeAlertLogText(err?.message || 'Network exception during WhatsApp request');
    }

    if (attempt < maxRetries) {
      const delayMs = retryDelays[attempt] ?? 1000 * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return {
    success: false,
    provider,
    attempts,
    error: sanitizeAlertLogText(lastError)
  };
}

export function buildDailySummaryMessage(counts: {
  newDrafts: number;
  updateProposals: number;
  carefulReview: number;
  sourcesFailing: number;
}): string {
  return formatConcisePlainMessage(
    `New drafts: ${counts.newDrafts} | Update proposals: ${counts.updateProposals} | Need careful review: ${counts.carefulReview} | Sources failing: ${counts.sourcesFailing}\nReview now: ${STAFF_REVIEW_URL}`
  );
}

/**
 * Coordinates Owner WhatsApp Alerts with:
 * - On/Off & per-category toggles
 * - Quiet hours holding (10:00 PM - 6:30 AM IST) for non-urgent summaries
 * - 1-hour urgent/failure cooldown per condition key
 * - Daily 20-alert cap with one final "Alert limit reached, check the console" message
 * - Masked logs & failure banner state (never throws/blocks monitor)
 */
export async function dispatchOwnerWhatsAppAlert(params: {
  type: WhatsAppAlertType;
  message: string;
  cooldownKey?: string;
  templateVars?: SummaryTemplateVars;
  summaryCounts?: {
    newDrafts: number;
    updateProposals: number;
    carefulReview: number;
    sourcesFailing: number;
  };
  now?: Date;
  bypassEnabledToggle?: boolean;
  retryDelaysMs?: number[];
  fetchImpl?: typeof fetch;
}): Promise<{
  sent: boolean;
  queued?: boolean;
  suppressedReason?: string;
  provider: WhatsAppProviderType;
  attempts: number;
  responseSummary?: string;
  error?: string;
}> {
  const now = params.now || new Date();
  const settings = getWhatsAppAlertSettings();
  const state = getWhatsAppAlertState();
  const provider = getConfiguredWhatsAppProvider();
  const owners = getOwnerPhoneNumbers();
  const maskedRecipients = owners.map(maskPhoneNumberForLogs);
  const { dateKey } = getIstTimeParts(now);

  // 1. Master toggle & type checks
  if (!params.bypassEnabledToggle) {
    if (!settings.enabled) {
      return { sent: false, suppressedReason: 'disabled', provider, attempts: 0 };
    }
    if (params.type === 'summary' && !settings.dailySummary) {
      return { sent: false, suppressedReason: 'summary_disabled', provider, attempts: 0 };
    }
    if (params.type === 'urgent' && !settings.urgentAlerts) {
      return { sent: false, suppressedReason: 'urgent_disabled', provider, attempts: 0 };
    }
    if (params.type === 'failure' && !settings.failureAlerts) {
      return { sent: false, suppressedReason: 'failure_disabled', provider, attempts: 0 };
    }
  }

  // 2. Quiet hours hold for non-urgent summary messages
  if (params.type === 'summary' && isWithinQuietHours(settings, now)) {
    const prev = state.queuedDuringQuietHours || {
      newDrafts: 0,
      updateProposals: 0,
      carefulReview: 0,
      sourcesFailing: 0,
      queuedAt: now.toISOString()
    };
    const c = params.summaryCounts || { newDrafts: 0, updateProposals: 0, carefulReview: 0, sourcesFailing: 0 };
    state.queuedDuringQuietHours = {
      newDrafts: prev.newDrafts + c.newDrafts,
      updateProposals: prev.updateProposals + c.updateProposals,
      carefulReview: Math.max(prev.carefulReview, c.carefulReview),
      sourcesFailing: Math.max(prev.sourcesFailing, c.sourcesFailing),
      queuedAt: prev.queuedAt
    };
    saveWhatsAppAlertState(state);

    addWhatsAppAlertLog({
      timestamp: now.toISOString(),
      type: 'summary',
      provider,
      recipientsMasked: maskedRecipients,
      status: 'queued_quiet_hours',
      attempts: 0,
      messagePreview: formatConcisePlainMessage(params.message)
    });

    return { sent: false, queued: true, suppressedReason: 'quiet_hours', provider, attempts: 0 };
  }

  // 3. Urgent / failure 1-hour deduplication cooldown
  if ((params.type === 'urgent' || params.type === 'failure') && params.cooldownKey) {
    const lastIso = state.lastUrgentAlertByKey[params.cooldownKey];
    if (lastIso) {
      const elapsed = now.getTime() - new Date(lastIso).getTime();
      if (elapsed >= 0 && elapsed < URGENT_COOLDOWN_MS) {
        return { sent: false, suppressedReason: 'urgent_cooldown_1h', provider, attempts: 0 };
      }
    }
  }

  // 4. Daily 20 alerts cap (test button checks config cleanly, or counts toward total if desired — enforce on all automated & total dispatches except let limit notice run once)
  const dailySent = state.dailySentCounts[dateKey] || 0;
  if (params.type !== 'test' && dailySent >= DAILY_ALERT_LIMIT - 1) {
    if (state.limitReachedSentDate === dateKey || dailySent >= DAILY_ALERT_LIMIT) {
      addWhatsAppAlertLog({
        timestamp: now.toISOString(),
        type: params.type,
        provider,
        recipientsMasked: maskedRecipients,
        status: 'suppressed_rate_limit',
        attempts: 0,
        messagePreview: formatConcisePlainMessage(params.message)
      });
      return { sent: false, suppressedReason: 'daily_rate_limit', provider, attempts: 0 };
    }

    // Send the one final 20th message notifying owner and stop
    const limitMessage = 'Alert limit reached, check the console';
    let limitSentOk = false;
    let limitAttempts = 0;
    let limitError = '';
    for (const phone of owners) {
      const r = await sendWhatsApp(phone, limitMessage, {
        retryDelaysMs: params.retryDelaysMs,
        fetchImpl: params.fetchImpl
      });
      limitAttempts = Math.max(limitAttempts, r.attempts);
      if (r.success) limitSentOk = true;
      else if (r.error) limitError = r.error;
    }

    state.dailySentCounts[dateKey] = DAILY_ALERT_LIMIT;
    state.limitReachedSentDate = dateKey;
    saveWhatsAppAlertState(state);

    addWhatsAppAlertLog({
      timestamp: now.toISOString(),
      type: 'rate_limit',
      provider,
      recipientsMasked: maskedRecipients,
      status: limitSentOk ? 'sent' : 'failed',
      attempts: limitAttempts,
      messagePreview: limitMessage,
      error: limitSentOk ? undefined : limitError || 'Failed to send limit notice'
    });

    return { sent: false, suppressedReason: 'daily_rate_limit_final_sent', provider, attempts: limitAttempts };
  }

  // 5. Ensure at least one owner phone is configured
  if (owners.length === 0) {
    const errMsg = 'No owner phone numbers configured in OWNER_PHONES (or OWNER_PHONE) server secret.';
    state.lastFailureWarning = {
      message: errMsg,
      at: now.toISOString(),
      provider
    };
    saveWhatsAppAlertState(state);

    addWhatsAppAlertLog({
      timestamp: now.toISOString(),
      type: params.type,
      provider,
      recipientsMasked: [],
      status: 'failed',
      attempts: 0,
      messagePreview: formatConcisePlainMessage(params.message),
      error: errMsg
    });

    return { sent: false, provider, attempts: 0, error: errMsg };
  }

  // 6. Dispatch to all configured owner numbers with retry up to 3x
  const cleanMsg = formatConcisePlainMessage(params.message);
  let anySuccess = false;
  let maxAttempts = 0;
  const responseSummaries: string[] = [];
  const errors: string[] = [];

  for (const phone of owners) {
    const res = await sendWhatsApp(phone, cleanMsg, {
      templateVars: params.templateVars,
      retryDelaysMs: params.retryDelaysMs,
      fetchImpl: params.fetchImpl
    });
    maxAttempts = Math.max(maxAttempts, res.attempts);
    if (res.success) {
      anySuccess = true;
      if (res.responseSummary) responseSummaries.push(res.responseSummary);
    } else if (res.error) {
      errors.push(res.error);
    }
  }

  if (anySuccess) {
    state.dailySentCounts[dateKey] = dailySent + 1;
    if ((params.type === 'urgent' || params.type === 'failure') && params.cooldownKey) {
      state.lastUrgentAlertByKey[params.cooldownKey] = now.toISOString();
    }
    state.lastFailureWarning = null;
    saveWhatsAppAlertState(state);

    console.log(
      `[WhatsAppAlerts] Sent ${params.type} alert via ${provider} to ${maskedRecipients.join(', ')} (attempts=${maxAttempts})`
    );
  } else {
    const errText = sanitizeAlertLogText(errors.join('; ') || 'WhatsApp delivery failed after retries');
    state.lastFailureWarning = {
      message: `WhatsApp alert failed (${provider}): ${errText}`,
      at: now.toISOString(),
      provider
    };
    saveWhatsAppAlertState(state);

    console.warn(
      `[WhatsAppAlerts] Delivery failed for ${params.type} via ${provider} after ${maxAttempts} attempt(s): ${errText}`
    );
  }

  addWhatsAppAlertLog({
    timestamp: now.toISOString(),
    type: params.type,
    provider,
    recipientsMasked: maskedRecipients,
    status: anySuccess ? 'sent' : 'failed',
    attempts: maxAttempts,
    messagePreview: cleanMsg,
    responseSummary: anySuccess ? responseSummaries.join('; ') : undefined,
    error: anySuccess ? undefined : sanitizeAlertLogText(errors.join('; ') || 'Delivery failed')
  });

  return {
    sent: anySuccess,
    provider,
    attempts: maxAttempts,
    responseSummary: responseSummaries.join('; ') || undefined,
    error: anySuccess ? undefined : sanitizeAlertLogText(errors.join('; '))
  };
}

/**
 * Flushes held quiet-hours summary once quiet hours end
 */
export async function flushQuietHoursSummaryIfReady(now = new Date(), options?: { retryDelaysMs?: number[]; fetchImpl?: typeof fetch }): Promise<boolean> {
  const settings = getWhatsAppAlertSettings();
  if (!settings.enabled || !settings.dailySummary) return false;
  if (isWithinQuietHours(settings, now)) return false;

  const state = getWhatsAppAlertState();
  const queued = state.queuedDuringQuietHours;
  if (!queued) return false;

  const totalPending = queued.newDrafts + queued.updateProposals + queued.carefulReview + queued.sourcesFailing;
  state.queuedDuringQuietHours = null;
  saveWhatsAppAlertState(state);

  if (totalPending <= 0) return false;

  const msg = buildDailySummaryMessage(queued);
  const res = await dispatchOwnerWhatsAppAlert({
    type: 'summary',
    message: msg,
    summaryCounts: queued,
    templateVars: {
      newDrafts: queued.newDrafts,
      updates: queued.updateProposals,
      carefulReview: queued.carefulReview,
      sourcesFailing: queued.sourcesFailing,
      reviewLink: STAFF_REVIEW_URL
    },
    now,
    retryDelaysMs: options?.retryDelaysMs,
    fetchImpl: options?.fetchImpl
  });

  return res.sent;
}

/**
 * Sends "CSC DOST alert test" to configured owner phone numbers
 */
export async function sendTestWhatsAppAlert(options?: {
  retryDelaysMs?: number[];
  fetchImpl?: typeof fetch;
}) {
  return dispatchOwnerWhatsAppAlert({
    type: 'test',
    message: 'CSC DOST alert test',
    bypassEnabledToggle: true,
    retryDelaysMs: options?.retryDelaysMs,
    fetchImpl: options?.fetchImpl
  });
}
