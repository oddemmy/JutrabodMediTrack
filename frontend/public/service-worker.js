const CACHE_NAME = 'jutrabod-v1';

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Fetch from network, fall back to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Activate and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Listen for push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Jutrabod Reminder';
  const options = {
    body: data.body || 'Time to take your medication!',
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      { action: 'mark-taken', title: 'Mark as Taken' },
      { action: 'snooze', title: 'Snooze' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'mark-taken') {
    console.log('Marked as taken');
  } else if (event.action === 'snooze') {
    console.log('Snoozed');
  } else {
    event.waitUntil(clients.openWindow('/'));
  }
});