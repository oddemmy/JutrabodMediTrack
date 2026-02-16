import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAqYyR77JUy5vfyvwZEo8CnME5d6CCY3S4",
  authDomain: "jutrabod-health-companion.firebaseapp.com",
  projectId: "jutrabod-health-companion",
  storageBucket: "jutrabod-health-companion.firebasestorage.app",
  messagingSenderId: "288251244109",
  appId: "1:288251244109:web:7df170d27afd18dcd0b604",
  measurementId: "G-2EDB0XPBL5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

// VAPID key for web push
const VAPID_KEY = "BNos_-6Buva1WLQ-RQd21CFyPehnyWFYFtH6OB2mdGzD8s5ij49n1kZWxe8sG9A98YNPj1SqhJ2rTjg3ElBYz9A";

// Request permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });

export { messaging };