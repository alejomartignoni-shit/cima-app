import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dirname, '../public/icon.svg');
const svgBuffer = readFileSync(svgPath);

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-maskable-192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
];

for (const { name, size, maskable } of sizes) {
  let pipeline = sharp(svgBuffer).resize(size, size);

  if (maskable) {
    // For maskable icons: remove the rounded rect background, fill with solid color
    // so the OS can clip to any shape
    const svgMaskable = readFileSync(svgPath, 'utf8')
      .replace(/rx="\d+"/, 'rx="0"');
    pipeline = sharp(Buffer.from(svgMaskable)).resize(size, size);
  }

  const outPath = resolve(__dirname, '../public', name);
  await pipeline.png().toFile(outPath);
  console.log(`Generated ${name} (${size}x${size})`);
}

// Generate favicon.ico (multi-size: 16, 32, 48)
// sharp can't do .ico natively, we'll just generate a 32px PNG as fallback
const faviconPath = resolve(__dirname, '../public/favicon-32.png');
await sharp(svgBuffer).resize(32, 32).png().toFile(faviconPath);
console.log('Generated favicon-32.png');

console.log('\nDone! Icons generated in public/');
