import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const publicDir = join(process.cwd(), 'client/public');
const srcDir = join(process.cwd(), 'client/src');
const rootDir = join(process.cwd(), 'client');

// ── Manifest tests ──
describe('PWA Manifest', () => {
  it('manifest.json exists in public directory', () => {
    expect(existsSync(join(publicDir, 'manifest.json'))).toBe(true);
  });

  it('manifest.json has required fields', () => {
    const manifest = JSON.parse(readFileSync(join(publicDir, 'manifest.json'), 'utf-8'));
    expect(manifest.name).toBe('Relate');
    expect(manifest.short_name).toBe('Relate');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#6FAF8F');
    expect(manifest.background_color).toBe('#F8F7F4');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
  });

  it('manifest.json has all required icon sizes', () => {
    const manifest = JSON.parse(readFileSync(join(publicDir, 'manifest.json'), 'utf-8'));
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });

  it('manifest.json has a maskable icon', () => {
    const manifest = JSON.parse(readFileSync(join(publicDir, 'manifest.json'), 'utf-8'));
    const maskable = manifest.icons.find((i: { purpose?: string }) => i.purpose === 'maskable');
    expect(maskable).toBeDefined();
  });

  it('manifest.json orientation is portrait-primary', () => {
    const manifest = JSON.parse(readFileSync(join(publicDir, 'manifest.json'), 'utf-8'));
    expect(manifest.orientation).toBe('portrait-primary');
  });
});

// ── Icon file tests ──
describe('PWA Icons', () => {
  it('icon-192.png exists', () => {
    expect(existsSync(join(publicDir, 'icons/icon-192.png'))).toBe(true);
  });

  it('icon-512.png exists', () => {
    expect(existsSync(join(publicDir, 'icons/icon-512.png'))).toBe(true);
  });

  it('icon-maskable-512.png exists', () => {
    expect(existsSync(join(publicDir, 'icons/icon-maskable-512.png'))).toBe(true);
  });

  it('icon files have non-zero size', () => {
    const icon192 = readFileSync(join(publicDir, 'icons/icon-192.png'));
    const icon512 = readFileSync(join(publicDir, 'icons/icon-512.png'));
    const iconMaskable = readFileSync(join(publicDir, 'icons/icon-maskable-512.png'));
    expect(icon192.length).toBeGreaterThan(100);
    expect(icon512.length).toBeGreaterThan(100);
    expect(iconMaskable.length).toBeGreaterThan(100);
  });

  it('icon files are valid PNG (start with PNG magic bytes)', () => {
    const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    const icon192 = readFileSync(join(publicDir, 'icons/icon-192.png'));
    const icon512 = readFileSync(join(publicDir, 'icons/icon-512.png'));
    expect(icon192.subarray(0, 4)).toEqual(PNG_MAGIC);
    expect(icon512.subarray(0, 4)).toEqual(PNG_MAGIC);
  });
});

// ── Service Worker tests ──
describe('Service Worker', () => {
  it('sw.js exists in public directory', () => {
    expect(existsSync(join(publicDir, 'sw.js'))).toBe(true);
  });

  it('sw.js has install event handler', () => {
    const sw = readFileSync(join(publicDir, 'sw.js'), 'utf-8');
    expect(sw).toContain("addEventListener('install'");
  });

  it('sw.js has activate event handler', () => {
    const sw = readFileSync(join(publicDir, 'sw.js'), 'utf-8');
    expect(sw).toContain("addEventListener('activate'");
  });

  it('sw.js has fetch event handler', () => {
    const sw = readFileSync(join(publicDir, 'sw.js'), 'utf-8');
    expect(sw).toContain("addEventListener('fetch'");
  });

  it('sw.js uses network-first for /api/ routes', () => {
    const sw = readFileSync(join(publicDir, 'sw.js'), 'utf-8');
    expect(sw).toContain('/api/');
    expect(sw).toContain('fetch(event.request)');
  });

  it('sw.js has cache-first fallback for static assets', () => {
    const sw = readFileSync(join(publicDir, 'sw.js'), 'utf-8');
    expect(sw).toContain('caches.match(event.request)');
  });

  it('sw.js uses skipWaiting for immediate activation', () => {
    const sw = readFileSync(join(publicDir, 'sw.js'), 'utf-8');
    expect(sw).toContain('self.skipWaiting()');
  });

  it('sw.js uses clients.claim for immediate control', () => {
    const sw = readFileSync(join(publicDir, 'sw.js'), 'utf-8');
    expect(sw).toContain('self.clients.claim()');
  });
});

// ── index.html PWA meta tags tests ──
describe('index.html PWA meta tags', () => {
  it('index.html links to manifest.json', () => {
    const html = readFileSync(join(rootDir, 'index.html'), 'utf-8');
    expect(html).toContain('rel="manifest"');
    expect(html).toContain('href="/manifest.json"');
  });

  it('index.html has theme-color meta tag', () => {
    const html = readFileSync(join(rootDir, 'index.html'), 'utf-8');
    expect(html).toContain('name="theme-color"');
    expect(html).toContain('#6FAF8F');
  });

  it('index.html has iOS PWA meta tags', () => {
    const html = readFileSync(join(rootDir, 'index.html'), 'utf-8');
    expect(html).toContain('apple-mobile-web-app-capable');
    expect(html).toContain('apple-mobile-web-app-status-bar-style');
    expect(html).toContain('apple-mobile-web-app-title');
  });

  it('index.html has apple-touch-icon link', () => {
    const html = readFileSync(join(rootDir, 'index.html'), 'utf-8');
    expect(html).toContain('rel="apple-touch-icon"');
    expect(html).toContain('/icons/icon-192.png');
  });

  it('index.html has viewport-fit=cover', () => {
    const html = readFileSync(join(rootDir, 'index.html'), 'utf-8');
    expect(html).toContain('viewport-fit=cover');
  });

  it('index.html has splash screen element', () => {
    const html = readFileSync(join(rootDir, 'index.html'), 'utf-8');
    expect(html).toContain('id="splash"');
  });
});

// ── main.tsx SW registration tests ──
describe('Service Worker Registration', () => {
  it('main.tsx registers service worker', () => {
    const main = readFileSync(join(srcDir, 'main.tsx'), 'utf-8');
    expect(main).toContain('serviceWorker');
    expect(main).toContain("register('/sw.js')");
  });

  it('main.tsx checks for serviceWorker support before registering', () => {
    const main = readFileSync(join(srcDir, 'main.tsx'), 'utf-8');
    expect(main).toContain("'serviceWorker' in navigator");
  });
});
