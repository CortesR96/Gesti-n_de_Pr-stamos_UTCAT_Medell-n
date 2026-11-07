/* ============================================================
   Service Worker – Gestión de Préstamos UT CAT Medellín
   Estrategia: precache del "app shell" + cache-first con
   actualización en segundo plano (stale-while-revalidate).
   Al cambiar archivos, sube el número de CACHE_VERSION.
   ============================================================ */
const CACHE_VERSION = 'v14';
const CACHE_NAME = `prestamos-ut-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css?v=14',
  './css/demo.css?v=14',
  './js/store.js?v=14',
  './js/email.js?v=14',
  './js/app.js?v=14',
  './js/views-requests.js?v=14',
  './js/views-admin.js?v=14',
  './js/views-student.js?v=14',
  './js/init.js?v=14',
  './js/pwa.js?v=14',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/logo-ut.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k =>
          k.startsWith('prestamos-ut-') && k !== CACHE_NAME
        ).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // no tocar recursos externos

  // Navegación: red primero y, si no hay conexión, index.html en caché.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // JS y CSS: red primero para que los cambios se vean al recargar.
  if (/\.(css|js)$/.test(url.pathname)) {
    event.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Resto (iconos, manifiesto): caché primero, y se actualiza en segundo plano.
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
