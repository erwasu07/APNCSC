import fs from 'fs';
import path from 'path';
import webpush from 'web-push';
import {
  getActivePushSubscriptions,
  markPushSubscriptionFailure,
  recordPushDeliverySuccess,
  addPushNotificationRecord,
  PushSubscriptionRecord,
  PushNotificationRecord,
  getPushServerSettings
} from '../dbServer';
import { syncPushNotificationToSupabase } from './supabaseServer';

// Path for persistent VAPID keys fallback
const VAPID_FILE = path.join(process.cwd(), 'data', 'vapid.json');

interface VapidConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

let activeVapidConfig: VapidConfig | null = null;

export function initializeVapid(): VapidConfig {
  if (activeVapidConfig) return activeVapidConfig;

  let publicKey = (process.env.VAPID_PUBLIC_KEY || '').trim();
  let privateKey = (process.env.VAPID_PRIVATE_KEY || '').trim();
  const subject = (process.env.VAPID_SUBJECT || 'mailto:support@cscdost.com').trim();

  // If environment variables are missing, check or create data/vapid.json
  if (!publicKey || !privateKey) {
    try {
      if (fs.existsSync(VAPID_FILE)) {
        const fileContent = fs.readFileSync(VAPID_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.publicKey && parsed.privateKey) {
          publicKey = parsed.publicKey;
          privateKey = parsed.privateKey;
        }
      }
    } catch (e) {
      console.warn('[WebPush] Error reading local vapid.json:', e);
    }
  }

  // If still missing, generate a new pair and save to data/vapid.json
  if (!publicKey || !privateKey) {
    try {
      console.log('[WebPush] Generating new VAPID keypair for CSC DOST...');
      const keys = webpush.generateVAPIDKeys();
      publicKey = keys.publicKey;
      privateKey = keys.privateKey;

      const dir = path.dirname(VAPID_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(VAPID_FILE, JSON.stringify({ publicKey, privateKey, subject, createdAt: new Date().toISOString() }, null, 2));
      console.log('✅ [WebPush] Generated and stored persistent VAPID keys in data/vapid.json');
    } catch (genErr) {
      console.error('[WebPush] Failed to generate/save VAPID keys:', genErr);
    }
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    console.log(`✅ [WebPush] VAPID configured successfully. Subject: ${subject}`);
  } catch (setErr) {
    console.error('[WebPush] Error setting VAPID details:', setErr);
  }

  activeVapidConfig = { publicKey, privateKey, subject };
  return activeVapidConfig;
}

export function getVapidPublicKey(): string {
  const config = initializeVapid();
  return config.publicKey;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  postId?: string;
  category?: 'jobs' | 'schemes' | 'exams' | 'updates' | 'all';
}

/**
 * Sends a single push notification to a specific subscription
 */
export async function sendSingleNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  initializeVapid();

  const formattedPayload = JSON.stringify({
    title: payload.title || 'CSC DOST | Notification 🔔',
    body: payload.body || 'New update available on CSC DOST portal.',
    icon: payload.icon || '/csc-dost-header-logo.png',
    badge: payload.badge || '/favicon-32x32.png',
    image: payload.image || undefined,
    url: payload.url || '/',
    tag: payload.tag || `csc-${Date.now()}`,
    postId: payload.postId,
    category: payload.category || 'all'
  });

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    }
  };

  try {
    const result = await webpush.sendNotification(pushSubscription, formattedPayload, {
      TTL: 60 * 60 * 24, // 24 hours
      urgency: 'high'
    });

    recordPushDeliverySuccess(subscription.endpoint);
    return { success: true, statusCode: result.statusCode };
  } catch (err: any) {
    const statusCode = err?.statusCode;
    // 404 or 410 means subscription has expired or unsubscribed
    if (statusCode === 404 || statusCode === 410) {
      console.log(`[WebPush] Subscription expired (${statusCode}) for endpoint: ${subscription.endpoint.slice(0, 45)}...`);
      markPushSubscriptionFailure(subscription.endpoint, true);
    } else {
      console.warn(`[WebPush] Delivery warning (${statusCode || 'network'}):`, err?.message || err);
      markPushSubscriptionFailure(subscription.endpoint, false);
    }

    return {
      success: false,
      statusCode,
      error: err?.message || 'Push service delivery failed'
    };
  }
}

/**
 * Broadcasts a push notification to subscribers, handling batching and deactivation of expired subscriptions
 */
export async function broadcastPushNotification(params: {
  title: string;
  body: string;
  category?: 'jobs' | 'schemes' | 'exams' | 'updates' | 'all';
  url?: string;
  postId?: string;
  icon?: string;
  image?: string;
  sentBy?: string;
  isTest?: boolean;
  testEndpoint?: string;
}): Promise<{
  success: boolean;
  notificationId: string;
  stats: {
    totalTargeted: number;
    accepted: number;
    failed: number;
    expiredCleaned: number;
  };
  error?: string;
}> {
  initializeVapid();

  const category = params.category || 'all';

  // If this is a test targeted to a single subscriber
  if (params.isTest && params.testEndpoint) {
    const sub = {
      endpoint: params.testEndpoint,
      keys: { p256dh: '', auth: '' }
    };
    // Look up in active subscriptions to find matching keys
    const all = getActivePushSubscriptions('all');
    const match = all.find(s => s.endpoint === params.testEndpoint);
    if (!match) {
      return {
        success: false,
        notificationId: '',
        stats: { totalTargeted: 1, accepted: 0, failed: 1, expiredCleaned: 0 },
        error: 'Target test subscription not found or inactive.'
      };
    }

    const res = await sendSingleNotification(match, {
      title: params.title,
      body: params.body,
      url: params.url,
      postId: params.postId,
      category,
      icon: params.icon,
      image: params.image
    });

    const stats = {
      totalTargeted: 1,
      accepted: res.success ? 1 : 0,
      failed: res.success ? 0 : 1,
      expiredCleaned: res.statusCode === 410 || res.statusCode === 404 ? 1 : 0
    };

    const record = addPushNotificationRecord({
      title: params.title,
      body: params.body,
      category,
      url: params.url || '/',
      postId: params.postId,
      icon: params.icon,
      image: params.image,
      sentBy: params.sentBy || 'Admin Test',
      stats,
      isTest: true
    });

    syncPushNotificationToSupabase(record).catch(() => {});

    return {
      success: res.success,
      notificationId: record.id,
      stats,
      error: res.error
    };
  }

  // Get active subscribers matching category
  const targetSubscribers = getActivePushSubscriptions(category);

  let acceptedCount = 0;
  let failedCount = 0;
  let expiredCleanedCount = 0;

  // Controlled batch size (20 concurrent requests) to avoid overwhelming sockets
  const BATCH_SIZE = 20;
  for (let i = 0; i < targetSubscribers.length; i += BATCH_SIZE) {
    const batch = targetSubscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(sub =>
        sendSingleNotification(sub, {
          title: params.title,
          body: params.body,
          url: params.url,
          postId: params.postId,
          category,
          icon: params.icon,
          image: params.image
        })
      )
    );

    for (const res of results) {
      if (res.success) {
        acceptedCount++;
      } else {
        failedCount++;
        if (res.statusCode === 410 || res.statusCode === 404) {
          expiredCleanedCount++;
        }
      }
    }
  }

  const stats = {
    totalTargeted: targetSubscribers.length,
    accepted: acceptedCount,
    failed: failedCount,
    expiredCleaned: expiredCleanedCount
  };

  const record = addPushNotificationRecord({
    title: params.title,
    body: params.body,
    category,
    url: params.url || '/',
    postId: params.postId,
    icon: params.icon,
    image: params.image,
    sentBy: params.sentBy || 'Admin Broadcast',
    stats,
    isTest: false
  });

  syncPushNotificationToSupabase(record).catch(() => {});

  return {
    success: true,
    notificationId: record.id,
    stats
  };
}
