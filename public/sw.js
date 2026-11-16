// CSC DOST — Official Web Push Service Worker (/sw.js)
// Scope: /

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'CSC DOST',
    body: 'New update available on CSC DOST.',
    icon: '/icon-192.png',
    badge: '/favicon-32x32.png',
    tag: 'csc-dost-alert',
    url: '/'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      const rawText = event.data.text();
      if (rawText) {
        payload.body = rawText;
      }
    }
  }

  const targetUrl =
    (payload.data && payload.data.url) ||
    payload.url ||
    '/';

  const options = {
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/favicon-32x32.png',
    tag: payload.tag || 'csc-dost-alert',
    renotify: Boolean(payload.tag),
    data: {
      url: targetUrl
    }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'CSC DOST', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const rawUrl =
    (event.notification.data && event.notification.data.url) ||
    '/';

  let resolvedUrl = '/';
  try {
    resolvedUrl = new URL(rawUrl, self.location.origin).href;
  } catch {
    resolvedUrl = self.location.origin + '/';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url && client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            if ('navigate' in client) {
              return client.navigate(resolvedUrl);
            }
            return client;
          });
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(resolvedUrl);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  const options = event.oldSubscription && event.oldSubscription.options
    ? event.oldSubscription.options
    : { userVisibleOnly: true };

  event.waitUntil(
    self.registration.pushManager
      .subscribe(options)
      .then((newSubscription) =>
        fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: newSubscription.toJSON ? newSubscription.toJSON() : newSubscription,
            subscribedFrom: '/'
          })
        })
      )
      .catch(() => undefined)
  );
});
