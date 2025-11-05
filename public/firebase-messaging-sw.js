/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications
 */

// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDovLKo3djdRbs963vqKdbj-geRWyzMTrg",
  authDomain: "fyppp-5b4f0.firebaseapp.com",
  projectId: "fyppp-5b4f0",
  storageBucket: "fyppp-5b4f0.firebasestorage.app",
  messagingSenderId: "324382119785",
  appId: "1:324382119785:web:b6948fcc89f49c6e06aae5"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📬 Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'PetCare Hub';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: payload.data,
    actions: [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

