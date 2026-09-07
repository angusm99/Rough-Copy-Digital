/* Anglo Windows — Digital Rough Copy service worker
   Reps use this off-site on tablets where there is often no signal, so the
   whole app shell has to survive offline.

   Two strategies, deliberately split:
   - HTML + app JS  -> network-first. Keeps a stale parser/catalogue from being
     served when the tablet IS online (we have been bitten by that), but falls
     back to cache the moment signal drops.
   - Everything else (vendored pdf.js, SVG drawings, logo) -> cache-first.
     These are large and effectively immutable; refetching them on every load
     is wasted bandwidth on a phone hotspot.

   Bump CACHE when shipping — old caches are dropped on activate. */
const CACHE = 'anglo-rc-v2';

const SHELL = [
  './',
  'index.html',
  'workspace.html',
  'window-picker.html',
  'door-picker.html',
  'window-builder.html',
  'quote-parser.js',
  'vendor/pdf.min.js',
  'vendor/pdf.worker.min.js',
];

self.addEventListener('install', (e) => {
  // addAll fails the whole install if any one file 404s, so add individually
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
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

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // never touch third-party

  const isAppCode = /\.html$/.test(url.pathname)
                 || url.pathname.endsWith('/')
                 || url.pathname.endsWith('quote-parser.js');

  if (isAppCode) {
    // network-first: latest code when online, cached shell when not
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('workspace.html')))
    );
    return;
  }

  // cache-first for assets
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }))
  );
});
