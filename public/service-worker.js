const CACHE_NAME = 'travel-diary-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : 'Nova poruka!';
  event.waitUntil(
    self.registration.showNotification('Dnevnik putovanja', {
      body: data,
      icon: '/icons/icon-192.png'
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

function getPendingNotes() {
  return JSON.parse(localStorage.getItem('pendingNotes')) || [];
}
  
async function syncNotes() {
  const pendingNotes = getPendingNotes();
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pendingNotes),
    });
    if (response.ok) {
      localStorage.removeItem('pendingNotes');
      showNotification('Bilješke su sinkronizirane!');
    } else {
      throw new Error('Greška prilikom sinkronizacije');
    }
  } catch (error) {
    console.error('Greška:', error);
  }
}

function showNotification(message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Dnevnik putovanja', { body: message });
  }
}