/// <reference lib="WebWorker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { setCatchHandler } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope;

// Precache all assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Allow SWUpdateBanner to trigger skipWaiting
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Offline fallback for navigation requests
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    return caches.match('/offline.html') || Response.error();
  }
  return Response.error();
});

// Push notification handler
self.addEventListener('push', function(event) {
  event.waitUntil(
    (async () => {
      try {
        const data = event.data?.json() ?? {};
        return self.registration.showNotification(
          data.title || 'إشعار جديد',
          {
            body: data.body || 'لديك تحديث جديد',
            icon: '/pwa/icon-192x192.png',
            badge: '/pwa/icon-96x96.png',
            dir: 'rtl',
            lang: 'ar',
            data: { url: data.url || '/' },
          }
        );
      } catch (err) {
        return self.registration.showNotification(
          'إشعار جديد',
          { body: 'لديك تحديث جديد' }
        );
      }
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});
