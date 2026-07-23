/**
 * Clinical Pharmacist Workspace - background Push & FCM Service Worker
 * Matches standard Firebase Cloud Messaging (FCM) schema & Web Push specifications.
 */

// If Firebase is configured with real key credentials, load compat SDKs
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

try {
  // Safe initialization of Firebase Messaging in background thread
  // This will be invoked only if a real config payload is active
  firebase.initializeApp({
    messagingSenderId: "1234567890" // Placeholder, will match client runtime if configured
  });
  const messaging = firebase.messaging();
  
  messaging.onBackgroundMessage((payload) => {
    console.log('[FCM Background SW] Received background message: ', payload);
    const notificationTitle = payload.notification?.title || 'تنبيه إكلينيكي عاجل';
    const notificationOptions = {
      body: payload.notification?.body || 'لديك جرعة جديدة أو تحديث بالملف الصحي.',
      icon: '/assets/icon.png',
      badge: '/assets/icon.png',
      data: payload.data || {}
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.warn('[FCM Background SW] Standard FCM initialization skipped or missing credentials. Falling back to native Web Push.');
}

// 2. Standard Web Push API event handler fallback (for out-of-the-box browser pushes)
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Web Push Event Received.');
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'تنبيه طبي عاجل', body: event.data.text() };
    }
  }

  const title = payload.title || payload.notification?.title || 'إشعار من منصة دكتور صيدلي';
  const options = {
    body: payload.body || payload.notification?.body || 'لديك تنبيه صحي جديد بخصوص جرعات الدواء أو المواعيد.',
    icon: '/assets/icon.png',
    badge: '/assets/icon.png',
    vibrate: [100, 50, 100],
    data: payload.metadata || payload.data || {},
    actions: [
      { action: 'open', title: 'عرض التفاصيل' },
      { action: 'close', title: 'إغلاق' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 3. Notification click handler to restore or open the application tab
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received. Action:', event.action);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
