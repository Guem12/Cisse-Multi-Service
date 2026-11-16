import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const BG_COLOR = '#1B2A5E';
const GOLD_COLOR = '#E0A030';
const WHITE_COLOR = '#F5F6FA';

// The emblem path from logo-icon.svg:
// Center is (60, 60), bounding circle ~75px diameter
function createSvg({ size, logoScale, rounded = false }) {
  const center = size / 2;
  // In the original 120x120 coordinate system:
  // center is at (60, 60).
  // We want to translate(center, center) scale(s) translate(-60, -60).
  const s = logoScale;
  const rx = rounded ? Math.round(size * 0.22) : 0;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" ${rx ? `rx="${rx}"` : ''} fill="${BG_COLOR}" />
    <g transform="translate(${center}, ${center}) scale(${s}) translate(-60, -60)">
      <path d="M82.29 39.93 A30 30 0 1 0 82.29 80.07" fill="none" stroke="${GOLD_COLOR}" stroke-width="15" stroke-linecap="round" />
      <path d="M60 50 L70 60 L60 70 L50 60 Z" fill="${WHITE_COLOR}" />
    </g>
  </svg>`;
}

async function main() {
  await fs.mkdir('public/icons', { recursive: true });

  // 1. icon-192.png (192x192)
  // Scale emblem to occupy ~65-70% of 192 -> 192 * 0.65 / 75 ~ 1.66
  const svg192 = createSvg({ size: 192, logoScale: 1.65, rounded: false });
  await sharp(Buffer.from(svg192)).png().toFile('public/icons/icon-192.png');
  console.log('Created public/icons/icon-192.png');

  // 2. icon-512.png (512x512)
  // Scale emblem to occupy ~65-70% of 512 -> 512 * 0.65 / 75 ~ 4.4
  const svg512 = createSvg({ size: 512, logoScale: 4.4, rounded: false });
  await sharp(Buffer.from(svg512)).png().toFile('public/icons/icon-512.png');
  console.log('Created public/icons/icon-512.png');

  // 3. maskable-512.png (512x512)
  // Must be within central 70% safe zone -> diameter <= 358px -> 358 * 0.8 / 75 ~ 3.5
  const svgMaskable = createSvg({ size: 512, logoScale: 3.5, rounded: false });
  await sharp(Buffer.from(svgMaskable)).png().toFile('public/icons/maskable-512.png');
  console.log('Created public/icons/maskable-512.png');

  // 4. apple-icon.png (180x180)
  const svgApple = createSvg({ size: 180, logoScale: 1.55, rounded: true });
  await sharp(Buffer.from(svgApple)).png().toFile('public/apple-icon.png');
  console.log('Created public/apple-icon.png');

  // Also create app/apple-icon.png if app directory is referenced
  await fs.mkdir('app', { recursive: true });
  await fs.copyFile('public/apple-icon.png', 'app/apple-icon.png');
  console.log('Copied to app/apple-icon.png');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
