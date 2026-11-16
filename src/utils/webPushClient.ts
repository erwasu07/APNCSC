// CSC DOST — Official Client Web Push & Device Detection Utility
import { VAPID_PUBLIC_KEY } from '../config/pushConfig';

export interface PushPreferences {
  jobs: boolean;
  schemes: boolean;
  exams: boolean;
  updates: boolean;
}

export const DEFAULT_PUSH_PREFERENCES: PushPreferences = {
  jobs: true,
  schemes: true,
  exams: true,
  updates: true
};

/**
 * Converts a base64url string to a Uint8Array for applicationServerKey
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Detects if the current device is iOS (iPhone, iPad, iPod)
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detects if the web app is running in standalone mode (Added to Home Screen)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Detects device category
 */
export function getDeviceType(): 'android' | 'ios' | 'desktop' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/windows|macintosh|linux/.test(ua) && !/mobile/.test(ua)) return 'desktop';
  return 'unknown';
}

/**
 * Checks whether Web Push and Service Workers are supported by the browser
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Checks the current browser notification permission
 */
export function getBrowserPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

/**
 * Registers the official service worker at /sw.js
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.error('[WebPush] Service Worker registration failed:', err);
    throw new Error('Service Worker registration failed. Ensure /sw.js is accessible.');
  }
}

/**
 * Retrieves the existing push subscription if already subscribed
 */
export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const existingReg = await navigator.serviceWorker.getRegistration('/');
    if (!existingReg) return null;
    return await existingReg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

async function resolvePublicVapidKey(): Promise<string> {
  if (VAPID_PUBLIC_KEY && VAPID_PUBLIC_KEY.length > 20) {
    return VAPID_PUBLIC_KEY;
  }
  for (const endpoint of ['/api/push/vapid-public-key', '/push/vapid-public-key']) {
    try {
      const res = await fetch(endpoint);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.publicKey) {
          return String(data.publicKey).trim();
        }
      }
    } catch {}
  }
  throw new Error('Failed to retrieve VAPID public key.');
}

/**
 * Subscribes the visitor to real Web Push notifications (call ONLY inside user gesture)
 */
export async function subscribeToWebPush(
  preferences: PushPreferences = DEFAULT_PUSH_PREFERENCES,
  options?: { sendWelcome?: boolean; subscribedFrom?: string }
): Promise<{ success: boolean; subscription: PushSubscription; subscriptionId: string }> {
  if (!isPushSupported()) {
    throw new Error('Web Push notifications are not supported in this browser.');
  }

  if (isIOS() && !isStandalone()) {
    throw new Error('IOS_HOMESCREEN_REQUIRED');
  }

  let permission = Notification.permission;
  if (permission === 'denied') {
    try {
      localStorage.setItem('csc_push_notification_status', 'denied');
    } catch {}
    throw new Error('PERMISSION_DENIED');
  }

  if (permission === 'default') {
    permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      if (permission === 'denied') {
        try {
          localStorage.setItem('csc_push_notification_status', 'denied');
        } catch {}
        throw new Error('PERMISSION_DENIED');
      }
      throw new Error('PERMISSION_DISMISSED');
    }
  }

  // Permission is 'granted' (either silently already granted or freshly approved)
  const registration = await registerServiceWorker();
  if (!registration) {
    throw new Error('Could not initialize service worker.');
  }

  const publicKey = await resolvePublicVapidKey();
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
  }

  const subJson = subscription.toJSON();
  if (!subJson.endpoint || !subJson.keys || !subJson.keys.p256dh || !subJson.keys.auth) {
    throw new Error('Failed to generate encryption keys for push subscription.');
  }

  const subscribedFrom =
    options?.subscribedFrom ||
    (typeof window !== 'undefined' ? `${window.location.pathname || '/'}${window.location.search || ''}` : '/');

  let saveData: any = null;
  let saveOk = false;
  for (const endpoint of ['/api/push/subscribe', '/push/subscribe']) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subJson,
          preferences,
          deviceType: getDeviceType(),
          userAgent: navigator.userAgent,
          subscribedFrom,
          sendWelcome: options?.sendWelcome !== false
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        saveData = data;
        saveOk = true;
        break;
      }
    } catch {}
  }

  if (!saveOk || !saveData) {
    throw new Error('Server failed to save push subscription in database.');
  }

  try {
    localStorage.setItem('csc_push_notification_status', 'subscribed');
    localStorage.setItem('csc_push_preferences', JSON.stringify(preferences));
    localStorage.setItem('csc_push_endpoint', subJson.endpoint);
    localStorage.removeItem('csc_push_dismissed_until');
  } catch {}

  return {
    success: true,
    subscription,
    subscriptionId: saveData.subscriptionId
  };
}

/**
 * Unsubscribes the visitor from Web Push notifications and deletes DB row
 */
export async function unsubscribeFromWebPush(): Promise<boolean> {
  try {
    let endpointToDelete = '';
    try {
      endpointToDelete = localStorage.getItem('csc_push_endpoint') || '';
    } catch {}

    if (isPushSupported()) {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const subscription = registration ? await registration.pushManager.getSubscription() : null;
      if (subscription) {
        endpointToDelete = subscription.endpoint || endpointToDelete;
        await subscription.unsubscribe();
      }
    }

    if (endpointToDelete) {
      for (const ep of ['/api/push/unsubscribe', '/push/unsubscribe']) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: endpointToDelete })
          });
          if (res.ok) break;
        } catch {}
      }
    }

    try {
      localStorage.setItem('csc_push_notification_status', 'unsubscribed');
      localStorage.removeItem('csc_push_endpoint');
    } catch {}
    return true;
  } catch (err) {
    console.error('[WebPush] Error during unsubscribe:', err);
    return false;
  }
}
