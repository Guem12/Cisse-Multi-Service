// Service Worker pour Cissé Multi-Service
const CACHE_NAME = 'cisse-v1';
const OFFLINE_URL = '/offline.html';

// 1. Installation : mise en cache exclusive de la page hors ligne et activation immédiate
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

// 2. Activation : nettoyage des anciens caches et prise de contrôle immédiate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 3. Fetch : gestion réseau avec repli hors ligne pour la navigation uniquement
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Intercepte UNIQUEMENT les requêtes de navigation (pages HTML)
  if (request.mode !== 'navigate' || request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // N'intercepte JAMAIS les requêtes /api, /admin, Cloudinary, stockage ou uploads
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/login') ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('neon.tech') ||
    url.pathname.startsWith('/uploads')
  ) {
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(OFFLINE_URL);
      if (cachedResponse) {
        return cachedResponse;
      }
      return new Response('Vous êtes hors ligne.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    })
  );
});
