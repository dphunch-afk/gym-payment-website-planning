const CACHE = 'gym-shell-v2';
const SHELL = ['/login', '/offline.html', '/icon.svg', '/icon-192.svg', '/icon-512.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  if (SHELL.includes(url.pathname)) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
  }
});
