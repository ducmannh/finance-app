import fs from "node:fs";
import path from "node:path";

const svgIconContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient: Rich Vibrant Emerald to Cyan -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="45%" stop-color="#0D9488" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>

    <!-- Glass Overlay / Light Sheen -->
    <linearGradient id="glassSheen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.0" />
    </linearGradient>

    <!-- Coin Gradient -->
    <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="40%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>

    <!-- Credit Card Gradient -->
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <!-- Wallet Body Gradient -->
    <linearGradient id="walletBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>

    <!-- Flap Clasp Gradient -->
    <linearGradient id="claspGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>

    <!-- Dynamic Drop Shadows -->
    <filter id="mainShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#022c22" flood-opacity="0.4" />
    </filter>

    <filter id="coinGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#F59E0B" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Base Squircle -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)" />

  <!-- Subtle Inset Glow Border -->
  <rect x="6" y="6" width="500" height="500" rx="122" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-opacity="0.35" />

  <!-- Top Ambient Sheen -->
  <path d="M 0 128 C 0 57.3 57.3 0 128 0 L 384 0 C 454.7 0 512 57.3 512 128 C 360 175 152 175 0 128 Z" fill="url(#glassSheen)" />

  <!-- Rising Decorative Trend Line in Background -->
  <path d="M 64 360 Q 180 340 260 280 T 448 130" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-dasharray="8 12" stroke-opacity="0.25" />

  <!-- Top Sparkling Stars -->
  <path d="M 120 90 Q 120 115 95 115 Q 120 115 120 140 Q 120 115 145 115 Q 120 115 120 90 Z" fill="#FDE68A" />
  <circle cx="120" cy="115" r="4" fill="#FFFFFF" />
  
  <path d="M 425 105 Q 425 120 410 120 Q 425 120 425 135 Q 425 120 440 120 Q 425 120 425 105 Z" fill="#FFFFFF" opacity="0.85" />

  <!-- Golden Coin Peeking Out -->
  <g filter="url(#coinGlow)">
    <circle cx="335" cy="180" r="68" fill="url(#coinGrad)" stroke="#FFFFFF" stroke-width="6" />
    <!-- Inner Coin Ring -->
    <circle cx="335" cy="180" r="54" fill="none" stroke="#FDE68A" stroke-width="3" stroke-dasharray="6 6" opacity="0.9" />
    <!-- Currency Symbol -->
    <path d="M 335 146 L 335 214 M 320 162 C 320 154 350 154 350 170 C 350 186 320 180 320 196 C 320 210 350 210 350 200" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Credit Card peeking behind front wallet pocket -->
  <g filter="url(#mainShadow)">
    <rect x="135" y="150" width="165" height="90" rx="16" fill="url(#cardGrad)" stroke="#FFFFFF" stroke-width="3" />
    <!-- Chip -->
    <rect x="155" y="172" width="28" height="20" rx="4" fill="#FDE68A" opacity="0.9" />
  </g>

  <!-- Main Wallet Body -->
  <g filter="url(#mainShadow)">
    <rect x="92" y="200" width="328" height="225" rx="40" fill="url(#walletBody)" />
    <!-- Leather Stitching / Seam -->
    <rect x="104" y="212" width="304" height="201" rx="30" fill="none" stroke="#CBD5E1" stroke-width="3" stroke-dasharray="8 8" />

    <!-- Wallet Fold Shadow -->
    <path d="M 92 235 Q 256 255 420 235" stroke="#94A3B8" stroke-width="3" fill="none" opacity="0.3" />

    <!-- Clasp Strap -->
    <rect x="290" y="275" width="134" height="78" rx="22" fill="url(#claspGrad)" stroke="#FFFFFF" stroke-width="5" />
    <!-- Clasp Button -->
    <circle cx="388" cy="314" r="16" fill="#FFFFFF" />
    <circle cx="388" cy="314" r="9" fill="#0D9488" />
  </g>
</svg>`;

// Generate ICO buffer (32x32)
function createIcoBuffer() {
  const size = 32;
  const pixels = new Uint8Array(size * size * 4);

  function setPixel(x: number, y: number, r: number, g: number, b: number, a: number = 255) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (y * size + x) * 4;
    const srcA = a / 255;
    const dstA = pixels[idx + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA > 0) {
      pixels[idx] = Math.round((r * srcA + pixels[idx] * dstA * (1 - srcA)) / outA);
      pixels[idx + 1] = Math.round((g * srcA + pixels[idx + 1] * dstA * (1 - srcA)) / outA);
      pixels[idx + 2] = Math.round((b * srcA + pixels[idx + 2] * dstA * (1 - srcA)) / outA);
      pixels[idx + 3] = Math.round(outA * 255);
    }
  }

  // Squircle Background: Gradient Emerald -> Teal -> Cyan
  const cornerRadius = 7;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const minX = 1, maxX = 30;
      const minY = 1, maxY = 30;
      const cx = x < minX + cornerRadius ? minX + cornerRadius : x > maxX - cornerRadius ? maxX - cornerRadius : x;
      const cy = y < minY + cornerRadius ? minY + cornerRadius : y > maxY - cornerRadius ? maxY - cornerRadius : y;
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d <= cornerRadius) {
        const alpha = Math.min(1, Math.max(0, cornerRadius - d + 0.5)) * 255;
        const t = (x + y) / (size * 2);
        const r = Math.round(5 * (1 - t) + 2 * t);
        const g = Math.round(150 * (1 - t) + 132 * t);
        const b = Math.round(105 * (1 - t) + 199 * t);
        setPixel(x, y, r, g, b, alpha);
      }
    }
  }

  // Golden Coin (at x: 21, y: 11, radius: 4.8)
  for (let y = 6; y <= 16; y++) {
    for (let x = 16; x <= 26; x++) {
      const dx = x - 21;
      const dy = y - 11;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= 4.8) {
        const aa = Math.min(1, Math.max(0, 4.8 - d + 0.5));
        const gy = (y - 6) / 10;
        const cr = Math.round(253 * (1 - gy) + 217 * gy);
        const cg = Math.round(230 * (1 - gy) + 119 * gy);
        const cb = Math.round(138 * (1 - gy) + 6 * gy);
        setPixel(x, y, cr, cg, cb, aa * 255);
      }
    }
  }

  // Mini Card behind wallet (x: 8..18, y: 10..14)
  for (let y = 10; y <= 13; y++) {
    for (let x = 8; x <= 18; x++) {
      setPixel(x, y, 52, 211, 153, 240);
    }
  }

  // White Wallet Body (x: 6..25, y: 13..25, r: 3)
  for (let y = 13; y <= 25; y++) {
    for (let x = 6; x <= 25; x++) {
      const cx = x < 9 ? 9 : x > 22 ? 22 : x;
      const cy = y < 16 ? 16 : y > 22 ? 22 : y;
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= 3) {
        const aa = Math.min(1, Math.max(0, 3 - d + 0.5));
        const t = (y - 13) / 12;
        const val = Math.round(255 - t * 20);
        setPixel(x, y, val, val, val, aa * 255);
      }
    }
  }

  // Wallet Clasp Strap (x: 18..26, y: 17..21)
  for (let y = 17; y <= 21; y++) {
    for (let x = 18; x <= 26; x++) {
      const dRight = Math.max(0, x - 24);
      if (dRight <= 2) {
        setPixel(x, y, 16, 185, 129, 255);
      }
    }
  }
  // Clasp stud
  setPixel(24, 19, 255, 255, 255, 255);

  // Sparkles
  setPixel(8, 7, 253, 230, 138, 255);
  setPixel(7, 7, 253, 230, 138, 180);
  setPixel(9, 7, 253, 230, 138, 180);
  setPixel(8, 6, 253, 230, 138, 180);
  setPixel(8, 8, 253, 230, 138, 180);

  const headerSize = 6;
  const dirSize = 16;
  const dibHeaderSize = 40;
  const pixelBytes = size * size * 4;
  const maskBytes = (size * size) / 8;
  const totalImageBytes = dibHeaderSize + pixelBytes + maskBytes;
  const totalFileSize = headerSize + dirSize + totalImageBytes;

  const buf = Buffer.alloc(totalFileSize);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(1, 4);

  buf.writeUInt8(size, 6);
  buf.writeUInt8(size, 7);
  buf.writeUInt8(0, 8);
  buf.writeUInt8(0, 9);
  buf.writeUInt16LE(1, 10);
  buf.writeUInt16LE(32, 12);
  buf.writeUInt32LE(totalImageBytes, 14);
  buf.writeUInt32LE(headerSize + dirSize, 18);

  let offset = 22;
  buf.writeUInt32LE(dibHeaderSize, offset);
  buf.writeInt32LE(size, offset + 4);
  buf.writeInt32LE(size * 2, offset + 8);
  buf.writeUInt16LE(1, offset + 12);
  buf.writeUInt16LE(32, offset + 14);
  buf.writeUInt32LE(0, offset + 16);
  buf.writeUInt32LE(pixelBytes, offset + 20);
  buf.writeInt32LE(0, offset + 24);
  buf.writeInt32LE(0, offset + 28);
  buf.writeUInt32LE(0, offset + 32);
  buf.writeUInt32LE(0, offset + 36);

  offset += dibHeaderSize;
  for (let y = size - 1; y >= 0; y--) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      buf.writeUInt8(pixels[idx + 2], offset++);
      buf.writeUInt8(pixels[idx + 1], offset++);
      buf.writeUInt8(pixels[idx], offset++);
      buf.writeUInt8(pixels[idx + 3], offset++);
    }
  }

  for (let i = 0; i < maskBytes; i++) {
    buf.writeUInt8(0, offset++);
  }

  return buf;
}

// Write to targets
const baseDir = process.cwd();
const icoBuffer = createIcoBuffer();

// 1. src/app/icon.svg
fs.writeFileSync(path.join(baseDir, "src", "app", "icon.svg"), svgIconContent);
// 2. src/app/apple-icon.svg
fs.writeFileSync(path.join(baseDir, "src", "app", "apple-icon.svg"), svgIconContent);
// 3. public/icon.svg
fs.writeFileSync(path.join(baseDir, "public", "icon.svg"), svgIconContent);
// 4. src/app/favicon.ico
fs.writeFileSync(path.join(baseDir, "src", "app", "favicon.ico"), icoBuffer);
// 5. public/favicon.ico
fs.writeFileSync(path.join(baseDir, "public", "favicon.ico"), icoBuffer);

console.log("Successfully generated all icons for Next.js App Router!");
