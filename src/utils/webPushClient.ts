// CSC DOST — Official Client Web Push & Device Detection Utility

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
 * Converts a base64 string to a Uint8Array for applicationServerKey
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

    // Wait until service worker is active
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
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.warn('[WebPush] Error checking existing subscription:', err);
    return null;
  }
}

/**
 * Subscribes the visitor to real Web Push notifications
 */
export async function subscribeToWebPush(
  preferences: PushPreferences = DEFAULT_PUSH_PREFERENCES,
  options?: { sendWelcome?: boolean }
): Promise<{ success: boolean; subscription: PushSubscription; subscriptionId: string }> {
  // 1. Check support
  if (!isPushSupported()) {
    throw new Error('Web Push notifications are not supported in this browser.');
  }

  // 2. Check iOS special requirement
  if (isIOS() && !isStandalone()) {
    throw new Error('IOS_HOMESCREEN_REQUIRED');
  }

  // 3. Request native browser notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    localStorage.setItem('csc_push_notification_status', 'denied');
    throw new Error(
      permission === 'denied'
        ? 'Notifications are blocked in your browser settings. Please enable notifications in site permissions.'
        : 'Notification permission was dismissed.'
    );
  }

  // 4. Ensure Service Worker is registered and ready
  const registration = await registerServiceWorker();
  if (!registration) {
    throw new Error('Could not initialize service worker.');
  }

  // 5. Fetch VAPID public key from backend (with automatic fallback)
  let keyData: any = null;
  for (const endpoint of ['/api/push/vapid-public-key', '/push/vapid-public-key']) {
    try {
      const res = await fetch(endpoint);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.publicKey) {
          keyData = data;
          break;
        }
      }
    } catch {}
  }

  if (!keyData || !keyData.publicKey) {
    throw new Error('Failed to retrieve VAPID application server key from server.');
  }

  const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);

  // 6. Check existing subscription or create a new one
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
  }

  const subJson = subscription.toJSON();
  if (!subJson.endpoint || !subJson.keys || !subJson.keys.p256dh || !subJson.keys.auth) {
    throw new Error('Failed to generate full encryption keys for push subscription.');
  }

  // 7. Save subscription securely in Supabase / backend database
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

  // 8. Update local storage with true confirmed state
  localStorage.setItem('csc_push_notification_status', 'subscribed');
  localStorage.setItem('csc_push_preferences', JSON.stringify(preferences));
  localStorage.setItem('csc_push_endpoint', subJson.endpoint);

  return {
    success: true,
    subscription,
    subscriptionId: saveData.subscriptionId
  };
}

/**
 * Unsubscribes the visitor from Web Push notifications
 */
export async function unsubscribeFromWebPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Notify backend to deactivate record
      for (const ep of ['/api/push/unsubscribe', '/push/unsubscribe']) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint })
          });
          if (res.ok) break;
        } catch {}
      }
    }

    localStorage.setItem('csc_push_notification_status', 'unsubscribed');
    localStorage.removeItem('csc_push_endpoint');
    return true;
  } catch (err) {
    console.error('[WebPush] Error during unsubscribe:', err);
    return false;
  }
}
