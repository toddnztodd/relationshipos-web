/**
 * Stability + Branding tests
 * Verifies the PWA crash fix, branding changes, and error boundary improvements.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..');
const clientSrc = join(root, 'client', 'src');
const clientPublic = join(root, 'client', 'public');

// ── Service Worker ────────────────────────────────────────────────────────────
describe('Service Worker — cache strategy', () => {
  const swPath = join(clientPublic, 'sw.js');
  const sw = readFileSync(swPath, 'utf-8');

  it('exists at client/public/sw.js', () => {
    expect(existsSync(swPath)).toBe(true);
  });

  it('contains a CACHE_VERSION placeholder or stamped value', () => {
    // Either the placeholder (dev) or a stamped version (after build)
    const hasPlaceholder = sw.includes('__RELATE_SW_VERSION__');
    const hasStamped = /relate-\d{13}-[a-z0-9]{5}/.test(sw);
    expect(hasPlaceholder || hasStamped).toBe(true);
  });

  it('does NOT cache /assets/ paths in PRECACHE_URLS', () => {
    // Vite-hashed bundles must not be precached — that was the crash root cause.
    // Extract the PRECACHE_URLS array literal and check it has no /assets/ entries.
    const match = sw.match(/const PRECACHE_URLS\s*=\s*(\[[\s\S]*?\]);/);
    const arrayStr = match?.[1] ?? '';
    expect(arrayStr).not.toContain('/assets/');
  });

  it('serves /api/ routes as network-only (no caching)', () => {
    expect(sw).toContain("url.pathname.startsWith('/api/')");
    // The api branch should return fetch() directly, not caches.match
    const apiBlock = sw.match(/startsWith\('\/api\/'\)[^}]+}/s)?.[0] ?? '';
    expect(apiBlock).not.toContain('caches.match');
  });

  it('handles navigation requests with network-first strategy', () => {
    expect(sw).toContain("event.request.mode === 'navigate'");
  });

  it('deletes stale relate-* caches on activate', () => {
    expect(sw).toContain("k.startsWith('relate-') && k !== CACHE_NAME");
    expect(sw).toContain('caches.delete(k)');
  });

  it('posts SW_UPDATED message to all clients on activate', () => {
    expect(sw).toContain("type: 'SW_UPDATED'");
    expect(sw).toContain('clients.forEach');
  });

  it('calls self.skipWaiting() on install', () => {
    expect(sw).toContain('self.skipWaiting()');
  });

  it('calls self.clients.claim() on activate', () => {
    expect(sw).toContain('self.clients.claim()');
  });
});

// ── SW stamp script ───────────────────────────────────────────────────────────
describe('SW stamp script', () => {
  const stampPath = join(root, 'scripts', 'stamp-sw.mjs');

  it('exists at scripts/stamp-sw.mjs', () => {
    expect(existsSync(stampPath)).toBe(true);
  });

  it('targets dist/public/sw.js and client/public/sw.js', () => {
    const src = readFileSync(stampPath, 'utf-8');
    expect(src).toContain("dist', 'public', 'sw.js'");
    expect(src).toContain("client', 'public', 'sw.js'");
  });

  it('generates a version string with timestamp', () => {
    const src = readFileSync(stampPath, 'utf-8');
    expect(src).toContain('Date.now()');
  });
});

// ── main.tsx — SW registration ────────────────────────────────────────────────
describe('main.tsx — service worker registration', () => {
  const mainPath = join(clientSrc, 'main.tsx');
  const main = readFileSync(mainPath, 'utf-8');

  it('registers /sw.js', () => {
    expect(main).toContain("register('/sw.js')");
  });

  it('listens for SW_UPDATED message and reloads', () => {
    expect(main).toContain("event.data?.type === 'SW_UPDATED'");
    expect(main).toContain('window.location.reload()');
  });

  it('handles updatefound event for waiting SW', () => {
    expect(main).toContain("'updatefound'");
    expect(main).toContain("newWorker.state === 'installed'");
  });

  it('logs bootstrap info', () => {
    expect(main).toContain('[Relate] Bootstrap start');
  });
});

// ── Branding ──────────────────────────────────────────────────────────────────
describe('Branding — tagline', () => {
  it('Login.tsx uses "The Relationship Operating System"', () => {
    const login = readFileSync(join(clientSrc, 'pages', 'Login.tsx'), 'utf-8');
    expect(login).toContain('The Relationship Operating System');
  });

  it('manifest.json description updated', () => {
    const manifest = JSON.parse(readFileSync(join(clientPublic, 'manifest.json'), 'utf-8'));
    expect(manifest.description).toContain('The Relationship Operating System');
    expect(manifest.name).toBe('Relate');
    expect(manifest.short_name).toBe('Relate');
  });

  it('index.html splash contains tagline', () => {
    const html = readFileSync(join(root, 'client', 'index.html'), 'utf-8');
    expect(html).toContain('The Relationship Operating System');
    expect(html).toContain('splash-tagline');
  });
});

// ── Error Boundary ────────────────────────────────────────────────────────────
describe('ErrorBoundary — stale cache recovery', () => {
  const ebPath = join(clientSrc, 'components', 'ErrorBoundary.tsx');
  const eb = readFileSync(ebPath, 'utf-8');

  it('has componentDidCatch with console.error logging', () => {
    expect(eb).toContain('componentDidCatch');
    expect(eb).toContain('console.error');
  });

  it('detects chunk load errors with isChunkLoadError heuristic', () => {
    expect(eb).toContain('isChunkLoadError');
    expect(eb).toContain('loading chunk');
    expect(eb).toContain('failed to fetch dynamically imported module');
  });

  it('has handleClearCacheAndReload that unregisters SW and clears caches', () => {
    expect(eb).toContain('handleClearCacheAndReload');
    expect(eb).toContain('getRegistrations');
    expect(eb).toContain('caches.keys()');
    expect(eb).toContain('caches.delete(k)');
  });

  it('shows "App update required" message for stale cache errors', () => {
    expect(eb).toContain('App update required');
    expect(eb).toContain('Clear cache');
  });

  it('shows "Reload Page" button for generic errors', () => {
    expect(eb).toContain('Reload Page');
  });
});

// ── PWA manifest completeness ─────────────────────────────────────────────────
describe('PWA manifest', () => {
  const manifest = JSON.parse(readFileSync(join(clientPublic, 'manifest.json'), 'utf-8'));

  it('has all required PWA fields', () => {
    expect(manifest.name).toBeDefined();
    expect(manifest.short_name).toBeDefined();
    expect(manifest.start_url).toBeDefined();
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBeDefined();
    expect(manifest.background_color).toBeDefined();
  });

  it('has 3 icons including maskable', () => {
    expect(manifest.icons).toHaveLength(3);
    const maskable = manifest.icons.find((i: any) => i.purpose === 'maskable');
    expect(maskable).toBeDefined();
  });

  it('icons exist on disk', () => {
    for (const icon of manifest.icons) {
      const iconPath = join(clientPublic, icon.src.replace(/^\//, ''));
      expect(existsSync(iconPath)).toBe(true);
    }
  });
});
