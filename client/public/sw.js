// ─────────────────────────────────────────────────────────────────────────────
// Relate Service Worker — version-aware, safe cache strategy
//
// KEY DESIGN DECISIONS:
//   1. CACHE_VERSION is injected by the build process (see scripts/stamp-sw.mjs).
//      Every deploy produces a new version string, so the old cache is always
//      deleted on activate.
//   2. We NEVER cache hashed JS/CSS bundles in the SW cache.  Vite already
//      content-hashes them; the browser HTTP cache handles them.  Caching them
//      in the SW as well causes stale-bundle crashes after deploys.
//   3. We only cache the app shell (index.html) and static icons/fonts so the
//      app can open offline.  All API calls go straight to the network.
//   4. On activate we claim all clients immediately and post a RELOAD_REQUIRED
//      message so the app can show a "New version available" prompt or hard-
//      reload automatically.
// ─────────────────────────────────────────────────────────────────────────────

// CACHE_VERSION is replaced at build time by scripts/stamp-sw.mjs.
// During development it falls back to a timestamp so installs always refresh.
const CACHE_VERSION = '1773274190872-qn8pc';
const CACHE_NAME = `relate-${CACHE_VERSION}`;

// Only cache the bare minimum needed for offline launch.
// Do NOT add /src/* or any Vite-generated asset paths here.
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Skip waiting so the new SW activates immediately on next navigate.
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('relate-') && k !== CACHE_NAME)
          .map((k) => {
            console.log('[SW] Deleting stale cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => {
      // Take control of all open pages immediately.
      return self.clients.claim();
    }).then(() => {
      // Notify all clients that a new version is active.
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        });
      });
    })
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API calls — always network, never cache.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // 2. Hashed Vite assets (/assets/*.js, /assets/*.css) — network first,
  //    fall back to cache.  We do NOT proactively cache them to avoid the
  //    stale-bundle problem.  The browser HTTP cache handles these.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Navigation requests (HTML pages) — network first so we always get
  //    the latest index.html.  Fall back to cached '/' for offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/').then((r) => r || caches.match('/index.html'))
      )
    );
    return;
  }

  // 4. Everything else (icons, manifest, fonts) — cache first, then network.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});
