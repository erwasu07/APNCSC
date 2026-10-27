// CSC DOST — Official Web Push & Service Worker
// Version: 1.0.0
// Scope: /

const CACHE_NAME = 'csc-dost-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ============================================================
// PUSH EVENT HANDLER
// ============================================================
self.addEventListener('push', (event) => {
  let payload = {
    title: 'CSC DOST | New Alert 🔔',
    body: 'New citizen e-service or recruitment update available.',
    icon: '/csc-dost-header-logo.png',
    badge: '/favicon-32x32.png',
    url: '/',
    tag: 'csc-dost-general-alert'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch (e) {
      const rawText = event.data.text();
      if (rawText) {
        payload.body = rawText;
      }
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon || '/csc-dost-header-logo.png',
    badge: payload.badge || '/favicon-32x32.png',
    image: payload.image || undefined,
    tag: payload.tag || `csc-dost-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [150, 80, 150],
    data: {
      url: payload.url || '/',
      postId: payload.postId,
      category: payload.category,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'View Details'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// ============================================================
// NOTIFICATION CLICK HANDLER
// ============================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open with CSC DOST, focus and navigate it
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl) {
            return client.navigate(targetUrl);
          }
          return client;
        }
      }
      // If no tab is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ============================================================
// PUSH SUBSCRIPTION CHANGE HANDLER (Browser Rotation)
// ============================================================
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription ? event.oldSubscription.options : { userVisibleOnly: true })
      .then((newSubscription) => {
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: newSubscription,
            source: 'pushsubscriptionchange'
          })
        });
      })
      .catch((err) => {
        console.warn('[SW] pushsubscriptionchange re-subscribe failed:', err);
      })
  );
});
