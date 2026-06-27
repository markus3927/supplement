// Service Worker – Supplemente (Bioenergetische Frequenzarbeit)
// Bei jeder neuen Version diese Zahl hochzählen (v8 -> v9 ...).
const CACHE = 'supplemente-v20';
const ASSETS = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(ASSETS.map((u) => c.add(u))))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // HTML / Seitenaufruf: immer zuerst aus dem Netz (frische Version), sonst Cache.
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/')))
    );
    return;
  }

  // Übrige Dateien (Icons, Manifest, ...): zuerst Cache, sonst Netz und cachen.
  e.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached)
    )
  );
});
