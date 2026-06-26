/* Service Worker — Supplemente
   Bioenergetische Frequenzarbeit / Markus Rufer
   Network-first: zeigt immer die aktuelle Version, Cache nur als Offline-Reserve.
   Bei jedem App-Update die Versionsnummer unten erhöhen (v1 -> v2 ...),
   damit alte zwischengespeicherte Dateien sauber ersetzt werden. */

const CACHE = 'supplemente-v1';
const CORE = [
  '/', '/index.html', '/manifest.webmanifest',
  '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png', '/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(m => m || caches.match('/index.html')))
  );
});
