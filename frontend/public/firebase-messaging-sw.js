// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyAqYyR77JUy5vfyvwZEo8CnME5d6CCY3S4",
  authDomain: "jutrabod-health-companion.firebaseapp.com",
  projectId: "jutrabod-health-companion",
  storageBucket: "jutrabod-health-companion.firebasestorage.app",
  messagingSenderId: "288251244109",
  appId: "1:288251244109:web:7df170d27afd18dcd0b604"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title || 'Jutrabod Reminder';
  const notificationOptions = {
    body: payload.notification.body || 'Time to take your medication!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: payload.data,
    actions: [
      { action: 'mark-taken', title: 'Mark as Taken' },
      { action: 'snooze', title: 'Snooze' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  if (event.action === 'mark-taken') {
    console.log('Marked as taken');
    // TODO: Send API request to mark medication as taken
  } else if (event.action === 'snooze') {
    console.log('Snoozed');
    // TODO: Snooze for 10 minutes
  } else {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});