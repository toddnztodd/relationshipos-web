import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../client/public/icons');
mkdirSync(outDir, { recursive: true });

// Build an SVG icon with the "R" lettermark
function buildSvg(size, padding = 0) {
  const bg = '#6FAF8F';
  const fg = '#FFFFFF';
  const radius = size * 0.18; // rounded corners
  const innerSize = size - padding * 2;
  const fontSize = Math.round(innerSize * 0.52);
  const cx = size / 2;
  const cy = size / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${bg}" />
  <text
    x="${cx}"
    y="${cy}"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="300"
    letter-spacing="-0.02em"
    fill="${fg}"
  >R</text>
</svg>`;
}

async function generate(svgStr, filename, size) {
  const outPath = join(outDir, filename);
  await sharp(Buffer.from(svgStr))
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`✓ ${filename} (${size}×${size})`);
}

// Standard 192
await generate(buildSvg(192), 'icon-192.png', 192);

// Standard 512
await generate(buildSvg(512), 'icon-512.png', 512);

// Maskable 512 — content within central 80% (10% safe zone each side = 51px padding on 512)
const maskablePadding = Math.round(512 * 0.12); // ~61px each side
await generate(buildSvg(512, maskablePadding), 'icon-maskable-512.png', 512);

console.log('\nAll icons generated successfully.');
