// Offline support: precache the app shell, serve network-first with cache fallback.
const CACHE = 'ampy-v6';
const SHELL = ['./', 'index.html', 'styles.css', 'icon.svg', 'manifest.webmanifest',
  'js/app.js', 'js/bench.js', 'js/sim.js', 'js/lessons.js', 'js/progress.js', 'js/logic.js', 'js/cpu.js'];
// unit files (js/units/*) are cached the first time the app loads them

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // network first so updates land immediately; cache keeps it working offline
  e.respondWith(caches.open(CACHE).then((cache) => fetch(e.request)
    .then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; })
    .catch(() => cache.match(e.request))));
});
