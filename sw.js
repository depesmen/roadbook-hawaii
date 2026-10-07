// Road Book : garde la dernière version consultée pour l'ouvrir sans réseau.
// Page : réseau d'abord (pour recevoir les mises à jour), sinon la copie gardée. Polices : copie gardée d'abord.
const CACHE = 'roadbook-v2';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  const isPage = url.origin === location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!isPage && !isFont) return;   // Supabase et le reste : jamais mis en cache ici
  if (isFont) {
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }))));
    return;
  }
  e.respondWith(fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
    .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./', { ignoreSearch: true }))));
});
