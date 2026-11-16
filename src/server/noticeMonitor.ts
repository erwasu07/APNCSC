import crypto from 'crypto';
import {
  getMonitorSources,
  saveMonitorSources,
  getReviewQueue,
  upsertReviewQueueItem,
  addMonitorRunRecord,
  getWhatsAppAlertState,
  saveWhatsAppAlertState,
  MonitorSourceRecord,
  ReviewQueueItem,
  MonitorRunRecord
} from '../dbServer';
import {
  dispatchOwnerWhatsAppAlert,
  flushQuietHoursSummaryIfReady,
  buildDailySummaryMessage,
  STAFF_REVIEW_URL,
  sanitizeAlertLogText
} from './whatsappAlerts';

export interface SimulatedMonitorInput {
  newDrafts?: Array<{
    id?: string;
    title: string;
    category?: string;
    sourceId?: string;
    sourceUrl?: string;
    officialNotificationUrl?: string;
    confidence?: number;
    validationFlags?: string[];
    shortInfo?: string;
    lastDate?: string;
  }>;
  updateProposals?: Array<{
    id?: string;
    postId: string;
    title: string;
    category?: string;
    sourceId?: string;
    sourceUrl?: string;
    officialNotificationUrl?: string;
    confidence?: number;
    validationFlags?: string[];
    proposedChanges?: Record<string, { before: string; after: string }>;
    shortInfo?: string;
    lastDate?: string;
    publishedPostChanged?: boolean;
  }>;
  failingSourceIds?: string[];
  forceCrash?: boolean;
  retryDelaysMs?: number[];
  fetchImpl?: typeof fetch;
}

export interface RunMonitorOptions {
  trigger: 'scheduled_ist' | 'manual' | 'simulated';
  now?: Date;
  simulatedInput?: SimulatedMonitorInput;
}

export interface RunMonitorSummary {
  run: MonitorRunRecord;
  summaryAlertSent: boolean;
  summaryAlertQueued: boolean;
  urgentAlertsSent: number;
  whatsappError?: string;
}

let isMonitorRunning = false;
let schedulerStarted = false;

/**
 * Checks a single official portal URL safely without mutating live published posts
 */
async function probeOfficialSource(
  source: MonitorSourceRecord,
  fetchImpl: typeof fetch = globalThis.fetch
): Promise<{ ok: boolean; contentHash?: string; error?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetchImpl(source.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'CSCDOST-NoticeMonitor/1.0 (+https://www.cscdost.com)'
      },
      signal: controller.signal
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const html = await res.text();
    const stripped = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 50000);
    const contentHash = crypto.createHash('sha256').update(stripped).digest('hex').slice(0, 16);
    return { ok: true, contentHash };
  } catch (err: any) {
    return { ok: false, error: sanitizeAlertLogText(err?.message || 'Request timeout or network failure') };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Runs the Official Notice Monitor & Review Queue check.
 * Never alters existing live posts and never blocks if WhatsApp fails.
 */
export async function runOfficialNoticeMonitor(options: RunMonitorOptions): Promise<RunMonitorSummary> {
  const now = options.now || new Date();
  const startedAt = now.toISOString();
  const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const sim = options.simulatedInput;
  const retryDelaysMs = sim?.retryDelaysMs;
  const fetchImpl = sim?.fetchImpl;

  let newDraftsCount = 0;
  let updateProposalsCount = 0;
  let carefulReviewCount = 0;
  let sourcesFailingCount = 0;
  let urgentAlertsSent = 0;
  let summaryAlertSent = false;
  let summaryAlertQueued = false;
  let whatsappError: string | undefined;

  isMonitorRunning = true;
  try {
    if (sim?.forceCrash) {
      throw new Error('Simulated Official Notice Monitor crash');
    }

    const sources = getMonitorSources();
    const existingQueue = getReviewQueue();
    const pendingLowConfItems: ReviewQueueItem[] = [];
    const pendingPublishedChangeItems: ReviewQueueItem[] = [];
    const tripledFailingSources: MonitorSourceRecord[] = [];

    if (sim) {
      // Simulation mode applies deterministic findings while using exact production source & alert pipelines
      const failSet = new Set(sim.failingSourceIds || []);
      for (const src of sources) {
        src.lastCheckedAt = now.toISOString();
        if (failSet.has(src.id)) {
          src.consecutiveFailures = (src.consecutiveFailures || 0) + 1;
          src.lastStatus = 'failing';
          src.lastError = 'Simulated source fetch failure';
          sourcesFailingCount++;
          if (src.consecutiveFailures >= 3) {
            tripledFailingSources.push(src);
          }
        } else {
          src.consecutiveFailures = 0;
          src.lastStatus = 'ok';
          src.lastError = undefined;
        }
      }
      saveMonitorSources(sources);

      for (const draft of sim.newDrafts || []) {
        const confidence = typeof draft.confidence === 'number' ? draft.confidence : 96;
        const flags = Array.isArray(draft.validationFlags) ? draft.validationFlags : [];
        const draftItem: ReviewQueueItem = {
          id: draft.id || `draft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          kind: 'new_draft',
          title: draft.title,
          category: draft.category || 'jkssb',
          sourceId: draft.sourceId || 'jkssb',
          sourceUrl: draft.sourceUrl || 'https://jkssb.nic.in/',
          officialNotificationUrl: draft.officialNotificationUrl || draft.sourceUrl || 'https://jkssb.nic.in/',
          confidence,
          validationFlags: flags,
          shortInfo: draft.shortInfo || `${draft.title} detected by Official Notice Monitor.`,
          lastDate: draft.lastDate || 'Verify Official PDF',
          status: 'pending',
          detectedAt: now.toISOString()
        };
        upsertReviewQueueItem(draftItem);
        newDraftsCount++;
        if (confidence < 90 || flags.length > 0) {
          carefulReviewCount++;
        }
        if (confidence < 90 && flags.length > 0) {
          pendingLowConfItems.push(draftItem);
        }
      }

      for (const prop of sim.updateProposals || []) {
        const confidence = typeof prop.confidence === 'number' ? prop.confidence : 95;
        const flags = Array.isArray(prop.validationFlags) ? prop.validationFlags : [];
        const propItem: ReviewQueueItem = {
          id: prop.id || `upd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          kind: 'update_proposal',
          postId: prop.postId,
          title: prop.title,
          category: prop.category || 'jkssb',
          sourceId: prop.sourceId || 'jkssb',
          sourceUrl: prop.sourceUrl || 'https://jkssb.nic.in/',
          officialNotificationUrl: prop.officialNotificationUrl || prop.sourceUrl || 'https://jkssb.nic.in/',
          confidence,
          validationFlags: flags,
          proposedChanges: prop.proposedChanges,
          shortInfo: prop.shortInfo || `Detected change on official source for published post ${prop.postId}.`,
          lastDate: prop.lastDate,
          status: 'pending',
          detectedAt: now.toISOString()
        };
        upsertReviewQueueItem(propItem);
        updateProposalsCount++;
        if (confidence < 90 || flags.length > 0) {
          carefulReviewCount++;
        }
        if (prop.publishedPostChanged !== false) {
          pendingPublishedChangeItems.push(propItem);
        }
      }
    } else {
      // Live portal health & change check
      for (const src of sources) {
        const probe = await probeOfficialSource(src);
        src.lastCheckedAt = now.toISOString();
        if (!probe.ok) {
          src.consecutiveFailures = (src.consecutiveFailures || 0) + 1;
          src.lastStatus = 'failing';
          src.lastError = probe.error;
          sourcesFailingCount++;
          if (src.consecutiveFailures >= 3) {
            tripledFailingSources.push(src);
          }
        } else {
          src.consecutiveFailures = 0;
          src.lastStatus = 'ok';
          src.lastError = undefined;
          if (src.lastContentHash && probe.contentHash && src.lastContentHash !== probe.contentHash) {
            // Record lightweight change notice in Review Queue for staff inspection (without touching live posts)
            const changeId = `srcchange_${src.id}_${new Date(now).toISOString().slice(0, 10)}`;
            const alreadyQueued = existingQueue.some(q => q.id === changeId && q.status === 'pending');
            if (!alreadyQueued) {
              const item: ReviewQueueItem = {
                id: changeId,
                kind: 'new_draft',
                title: `Portal Update Detected on ${src.name}`,
                category: src.category,
                sourceId: src.id,
                sourceUrl: src.url,
                officialNotificationUrl: src.url,
                confidence: 85,
                validationFlags: ['Portal content changed — manual review recommended'],
                shortInfo: `${src.name} (${src.url}) content hash changed since previous monitor check.`,
                status: 'pending',
                detectedAt: now.toISOString()
              };
              upsertReviewQueueItem(item);
              newDraftsCount++;
              carefulReviewCount++;
            }
          }
          if (probe.contentHash) {
            src.lastContentHash = probe.contentHash;
          }
        }
      }
      saveMonitorSources(sources);
    }

    // Immediate Alerts (max 1 per hour per condition key) — wrapped safely so failures NEVER block monitor
    try {
      for (const failSrc of tripledFailingSources) {
        const msg = `CSC DOST Failure Alert: ${failSrc.name} failed ${failSrc.consecutiveFailures} times in a row. Check source status.\nReview now: ${STAFF_REVIEW_URL}`;
        const r = await dispatchOwnerWhatsAppAlert({
          type: 'failure',
          message: msg,
          cooldownKey: `source:${failSrc.id}`,
          now,
          retryDelaysMs,
          fetchImpl
        });
        if (r.sent) urgentAlertsSent++;
        else if (r.error) whatsappError = r.error;
      }

      for (const lowDraft of pendingLowConfItems) {
        const msg = `CSC DOST Urgent Review: Draft "${lowDraft.title.slice(0, 65)}" flagged (${lowDraft.confidence}% confidence).\nReview now: ${STAFF_REVIEW_URL}`;
        const r = await dispatchOwnerWhatsAppAlert({
          type: 'urgent',
          message: msg,
          cooldownKey: `low_conf:${lowDraft.id}`,
          now,
          retryDelaysMs,
          fetchImpl
        });
        if (r.sent) urgentAlertsSent++;
        else if (r.error) whatsappError = r.error;
      }

      for (const pubChange of pendingPublishedChangeItems) {
        const msg = `CSC DOST Urgent Update: Published post "${pubChange.title.slice(0, 60)}" official page changed.\nReview now: ${STAFF_REVIEW_URL}`;
        const r = await dispatchOwnerWhatsAppAlert({
          type: 'urgent',
          message: msg,
          cooldownKey: `published_changed:${pubChange.postId || pubChange.id}`,
          now,
          retryDelaysMs,
          fetchImpl
        });
        if (r.sent) urgentAlertsSent++;
        else if (r.error) whatsappError = r.error;
      }

      // Summary Alert: send ONE message ONLY if there is something to review
      const totalToReview = newDraftsCount + updateProposalsCount + carefulReviewCount + sourcesFailingCount;
      if (totalToReview > 0) {
        const summaryMsg = buildDailySummaryMessage({
          newDrafts: newDraftsCount,
          updateProposals: updateProposalsCount,
          carefulReview: carefulReviewCount,
          sourcesFailing: sourcesFailingCount
        });

        const sumRes = await dispatchOwnerWhatsAppAlert({
          type: 'summary',
          message: summaryMsg,
          summaryCounts: {
            newDrafts: newDraftsCount,
            updateProposals: updateProposalsCount,
            carefulReview: carefulReviewCount,
            sourcesFailing: sourcesFailingCount
          },
          templateVars: {
            newDrafts: newDraftsCount,
            updates: updateProposalsCount,
            carefulReview: carefulReviewCount,
            sourcesFailing: sourcesFailingCount,
            reviewLink: STAFF_REVIEW_URL
          },
          now,
          retryDelaysMs,
          fetchImpl
        });
        summaryAlertSent = sumRes.sent;
        summaryAlertQueued = Boolean(sumRes.queued);
        if (sumRes.error) whatsappError = sumRes.error;
      }
    } catch (waErr: any) {
      whatsappError = sanitizeAlertLogText(waErr?.message || 'WhatsApp dispatch exception');
      console.warn('[NoticeMonitor] Non-fatal WhatsApp alert error:', whatsappError);
    }

    const completedRun: MonitorRunRecord = {
      id: runId,
      startedAt,
      completedAt: new Date().toISOString(),
      trigger: options.trigger,
      status: 'ok',
      newDrafts: newDraftsCount,
      updateProposals: updateProposalsCount,
      carefulReview: carefulReviewCount,
      sourcesFailing: sourcesFailingCount
    };
    addMonitorRunRecord(completedRun);

    return {
      run: completedRun,
      summaryAlertSent,
      summaryAlertQueued,
      urgentAlertsSent,
      whatsappError
    };
  } catch (err: any) {
    const errMsg = sanitizeAlertLogText(err?.message || 'Monitor execution failed');
    try {
      const r = await dispatchOwnerWhatsAppAlert({
        type: 'failure',
        message: `CSC DOST Monitor Crash Alert: Scheduled check failed (${errMsg.slice(0, 90)}).\nReview now: ${STAFF_REVIEW_URL}`,
        cooldownKey: 'monitor_crash',
        now,
        retryDelaysMs,
        fetchImpl
      });
      if (r.sent) urgentAlertsSent++;
      else if (r.error) whatsappError = r.error;
    } catch (waErr: any) {
      whatsappError = sanitizeAlertLogText(waErr?.message || 'WhatsApp crash alert failed');
    }

    const crashedRun: MonitorRunRecord = {
      id: runId,
      startedAt,
      completedAt: new Date().toISOString(),
      trigger: options.trigger,
      status: 'crashed',
      newDrafts: newDraftsCount,
      updateProposals: updateProposalsCount,
      carefulReview: carefulReviewCount,
      sourcesFailing: sourcesFailingCount,
      error: errMsg
    };
    addMonitorRunRecord(crashedRun);

    return {
      run: crashedRun,
      summaryAlertSent: false,
      summaryAlertQueued: false,
      urgentAlertsSent,
      whatsappError
    };
  } finally {
    isMonitorRunning = false;
  }
}

/**
 * Starts the 7:00 AM and 6:00 PM IST Official Notice Monitor scheduler & quiet-hours flusher
 */
export function startNoticeMonitorScheduler(): void {
  if (schedulerStarted) return;
  schedulerStarted = true;

  const tick = async () => {
    if (isMonitorRunning) return;
    try {
      const now = new Date();
      const istMs = now.getTime() + 330 * 60 * 1000;
      const ist = new Date(istMs);
      const dateKey = ist.toISOString().slice(0, 10);
      const hour = ist.getUTCHours();
      const minute = ist.getUTCMinutes();

      // Flush any summary held during quiet hours once quiet hours have ended
      await flushQuietHoursSummaryIfReady(now).catch(() => false);

      // Run at 07:00 AM IST and 18:00 (6:00 PM) IST
      const isMorningSlot = hour === 7 && minute < 5;
      const isEveningSlot = hour === 18 && minute < 5;
      if (isMorningSlot || isEveningSlot) {
        const slotKey = `${dateKey}-${String(hour).padStart(2, '0')}`;
        const state = getWhatsAppAlertState();
        if (state.lastScheduledSlotKey !== slotKey) {
          state.lastScheduledSlotKey = slotKey;
          saveWhatsAppAlertState(state);
          await runOfficialNoticeMonitor({ trigger: 'scheduled_ist', now });
        }
      }
    } catch (e: any) {
      console.warn('[NoticeMonitor] Scheduler tick notice:', sanitizeAlertLogText(e?.message || 'error'));
    }
  };

  const timer = setInterval(tick, 60_000);
  if (typeof timer.unref === 'function') {
    timer.unref();
  }
}
