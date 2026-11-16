import webpush from 'web-push';
import {
  getActivePushSubscriptions,
  deletePushSubscription,
  markPushSubscriptionFailure,
  recordPushDeliverySuccess,
  addPushNotificationRecord,
  PushSubscriptionRecord
} from '../dbServer';
import {
  deletePushSubscriptionFromSupabase,
  getPushSubscriptionsFromSupabase,
  syncPushNotificationToSupabase
} from './supabaseServer';

const DEFAULT_PUBLIC_KEY =
  'BJZxu9aQ0e54Br6OUHQMQbw7Oc1p1FStaxyzuBGISVvfBDp8N4lFPn8tVEZPZeM75TJjbLJHmdsTIkLi7noWlnk';
const DEFAULT_SUBJECT = 'mailto:support@cscdost.com';

let vapidConfigured = false;

export function getVapidPublicKey(): string {
  return (
    process.env.VAPID_PUBLIC_KEY ||
    process.env.VITE_VAPID_PUBLIC_KEY ||
    DEFAULT_PUBLIC_KEY
  ).trim();
}

export function isPushConfigured(): boolean {
  const publicKey = getVapidPublicKey();
  const privateKey = (process.env.VAPID_PRIVATE_KEY || '').trim();
  return Boolean(publicKey && privateKey);
}

export function initializeVapid(): boolean {
  if (vapidConfigured) return true;

  const publicKey = getVapidPublicKey();
  const privateKey = (process.env.VAPID_PRIVATE_KEY || '').trim();
  const subject = (process.env.VAPID_SUBJECT || DEFAULT_SUBJECT).trim();

  if (!publicKey || !privateKey) {
    console.warn('[WebPush] VAPID_PRIVATE_KEY environment secret is not set; push delivery is disabled.');
    return false;
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
    return true;
  } catch (err: any) {
    console.error('[WebPush] Error configuring VAPID details:', err?.message || 'Invalid VAPID configuration');
    return false;
  }
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

export function formatPostPushPayload(post: {
  id: string;
  title?: string;
  shortInfo?: string;
  shortDescription?: string;
  summary?: string;
  category?: 'jobs' | 'schemes' | 'exams' | 'updates' | 'all';
}): PushPayload {
  const cleanTitle = String(post.title || 'CSC DOST Update')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  const rawSummary = String(post.shortInfo || post.shortDescription || post.summary || '')
    .replace(/\s+/g, ' ')
    .trim();
  const cleanBody = (rawSummary || 'Tap to view complete notification details on CSC DOST.').slice(0, 100);
  const slug = String(post.id || '').trim();

  return {
    title: cleanTitle,
    body: cleanBody,
    icon: '/icon-192.png',
    badge: '/favicon-32x32.png',
    url: slug ? `https://www.cscdost.com/post/${encodeURIComponent(slug)}` : 'https://www.cscdost.com/',
    tag: slug || `csc-${Date.now()}`,
    postId: slug || undefined,
    category: post.category || 'all'
  };
}

/**
 * Merges active subscribers from both Supabase and local database, deduplicated by endpoint
 */
export async function getMergedActiveSubscribers(category?: string): Promise<PushSubscriptionRecord[]> {
  const localSubs = getActivePushSubscriptions(category);
  const supaSubs = await getPushSubscriptionsFromSupabase();

  const merged = new Map<string, PushSubscriptionRecord>();
  for (const sub of localSubs) {
    if (sub && sub.endpoint) merged.set(sub.endpoint, sub);
  }
  for (const sub of supaSubs) {
    if (!sub || !sub.endpoint) continue;
    if (category && category !== 'all') {
      const prefs = sub.preferences || { jobs: true, schemes: true, exams: true, updates: true };
      if (category === 'jobs' && prefs.jobs === false) continue;
      if (category === 'schemes' && prefs.schemes === false) continue;
      if (category === 'exams' && prefs.exams === false) continue;
      if (category === 'updates' && prefs.updates === false) continue;
    }
    if (!merged.has(sub.endpoint)) {
      merged.set(sub.endpoint, sub);
    }
  }

  return Array.from(merged.values());
}

/**
 * Removes an expired or invalid subscription from both local store and Supabase
 */
async function removeExpiredSubscription(endpoint: string): Promise<void> {
  deletePushSubscription(endpoint);
  await deletePushSubscriptionFromSupabase(endpoint).catch(() => false);
}

/**
 * Sends a single push notification to a specific subscription
 */
export async function sendSingleNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  if (!initializeVapid()) {
    return {
      success: false,
      statusCode: 503,
      error: 'Push server secret (VAPID_PRIVATE_KEY) is not configured.'
    };
  }

  const formattedPayload = JSON.stringify({
    title: payload.title || 'CSC DOST Update',
    body: payload.body || 'New update available on CSC DOST.',
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/favicon-32x32.png',
    image: payload.image || undefined,
    url: payload.url || 'https://www.cscdost.com/',
    tag: payload.tag || payload.postId || `csc-${Date.now()}`,
    postId: payload.postId,
    category: payload.category || 'all',
    data: {
      url: payload.url || 'https://www.cscdost.com/'
    }
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
      TTL: 60 * 60 * 24,
      urgency: 'high'
    });

    recordPushDeliverySuccess(subscription.endpoint);
    return { success: true, statusCode: result.statusCode };
  } catch (err: any) {
    const statusCode = err?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      console.log(`[WebPush] Removed expired subscription (${statusCode}): ${subscription.endpoint.slice(0, 48)}...`);
      await removeExpiredSubscription(subscription.endpoint);
    } else {
      console.warn(`[WebPush] Delivery failure (${statusCode || 'network'}): ${err?.message || 'Push request failed'}`);
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
 * Broadcasts a push notification in batches of 200 and cleans up 404/410 subscriptions
 */
export async function broadcastPushNotification(params: {
  title: string;
  body: string;
  category?: 'jobs' | 'schemes' | 'exams' | 'updates' | 'all';
  url?: string;
  tag?: string;
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
  if (!initializeVapid()) {
    return {
      success: false,
      notificationId: '',
      stats: { totalTargeted: 0, accepted: 0, failed: 0, expiredCleaned: 0 },
      error: 'Push server secret (VAPID_PRIVATE_KEY) is not configured.'
    };
  }

  const category = params.category || 'all';
  const targetIcon = params.icon || '/icon-192.png';
  const targetTag = params.tag || params.postId || `csc-${Date.now()}`;
  const targetUrl = params.url || (params.postId ? `https://www.cscdost.com/post/${encodeURIComponent(params.postId)}` : 'https://www.cscdost.com/');

  // Single targeted test send
  if (params.isTest && params.testEndpoint) {
    const all = await getMergedActiveSubscribers('all');
    const match = all.find(s => s.endpoint === params.testEndpoint);
    if (!match) {
      return {
        success: false,
        notificationId: '',
        stats: { totalTargeted: 1, accepted: 0, failed: 1, expiredCleaned: 0 },
        error: 'Target test subscription not found or no longer active.'
      };
    }

    const res = await sendSingleNotification(match, {
      title: params.title,
      body: params.body,
      url: targetUrl,
      tag: targetTag,
      postId: params.postId,
      category,
      icon: targetIcon,
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
      url: targetUrl,
      tag: targetTag,
      postId: params.postId,
      icon: targetIcon,
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

  // Broadcast to active subscribers in batches of 200
  const targetSubscribers = await getMergedActiveSubscribers(category);

  let acceptedCount = 0;
  let failedCount = 0;
  let expiredCleanedCount = 0;

  const BATCH_SIZE = 200;
  for (let i = 0; i < targetSubscribers.length; i += BATCH_SIZE) {
    const batch = targetSubscribers.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map(sub =>
        sendSingleNotification(sub, {
          title: params.title,
          body: params.body,
          url: targetUrl,
          tag: targetTag,
          postId: params.postId,
          category,
          icon: targetIcon,
          image: params.image
        })
      )
    );

    for (const outcome of settled) {
      if (outcome.status === 'fulfilled' && outcome.value.success) {
        acceptedCount++;
      } else {
        failedCount++;
        const statusCode = outcome.status === 'fulfilled' ? outcome.value.statusCode : undefined;
        if (statusCode === 410 || statusCode === 404) {
          expiredCleanedCount++;
        }
      }
    }
  }

  console.log(
    `[WebPush] Broadcast finished (${category}): targeted=${targetSubscribers.length}, accepted=${acceptedCount}, failed=${failedCount}, deleted=${expiredCleanedCount}`
  );

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
    url: targetUrl,
    tag: targetTag,
    postId: params.postId,
    icon: targetIcon,
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
