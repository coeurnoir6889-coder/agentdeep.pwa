import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal pure-JS PNG generator for PWA icons
function createPNG(width, height) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background #0A0A0A
      let r = 10;
      let g = 10;
      let b = 10;
      let a = 255;

      // Brain silhouette glow area
      if (dist < radius) {
        // Neon violet #7C4DFF to cyan #00E5FF
        const t = (x / width);
        const vr = Math.round(124 * (1 - t * 0.6));
        const vg = Math.round(77 + 140 * t);
        const vb = 255;

        // Central brain shape approximation
        const inBrain = (Math.abs(dx) > 10 && Math.abs(dx) < radius * 0.9 && Math.abs(dy) < radius * 0.85);
        if (inBrain) {
          r = vr;
          g = vg;
          b = vb;
        } else if (dist < radius * 0.95) {
          r = Math.min(255, Math.round(r + 40));
          g = Math.min(255, Math.round(g + 20));
          b = Math.min(255, Math.round(b + 70));
        }
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // PNG structure
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    scanlines[y * (width * 4 + 1)] = 0; // filter None
    buffer.copy(scanlines, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(scanlines);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const outDir = path.resolve('public/icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'icon-192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(outDir, 'icon-maskable-512.png'), createPNG(512, 512));
console.log('PWA PNG icons generated successfully in public/icons/');
