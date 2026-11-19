// Codex · service worker : l'appli s'ouvre même sans réseau, et se met à jour dès qu'il revient
const V = 'codex-202611191011';
const SHELL = ['./', 'index.html', 'app.js', 'boot.js', 'config.js', 'manifest.webmanifest', 'confidentialite.html',
  './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png', './favicon-32.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin !== location.origin && u.hostname !== 'cdn.jsdelivr.net') return; // Supabase : jamais en cache
  // réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  e.respondWith(fetch(e.request, u.origin === location.origin ? { cache: 'no-cache' } : {}).then((r) => {
    if (r.ok) { const c = r.clone(); caches.open(V).then((ca) => ca.put(e.request, c)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
});
