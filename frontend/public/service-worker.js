const CACHE_NAME = 'jutrabod-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch from cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate and clean old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Listen for push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Jutrabod Reminder';
  const options = {
    body: data.body || 'Time to take your medication!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      { action: 'mark-taken', title: 'Mark as Taken' },
      { action: 'snooze', title: 'Snooze' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  if (event.action === 'mark-taken') {
    // TODO: Send API request to mark medication as taken
    console.log('Marked as taken');
  } else if (event.action === 'snooze') {
    // TODO: Snooze for 10 minutes
    console.log('Snoozed');
  } else {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});