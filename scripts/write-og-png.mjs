import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";

const width = 1200;
const height = 630;
const font = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
};

function setPixel(data, x, y, [r, g, b]) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const index = (y * width + x) * 3;
  data[index] = r;
  data[index + 1] = g;
  data[index + 2] = b;
}

function fillRect(data, x, y, w, h, color) {
  for (let row = y; row < y + h; row += 1) {
    for (let col = x; col < x + w; col += 1) setPixel(data, col, row, color);
  }
}

function text(data, value, x, y, scale, color) {
  let cursor = x;
  for (const char of value) {
    const glyph = font[char] || font[" "];
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((bit, colIndex) => {
        if (bit === "1") fillRect(data, cursor + colIndex * scale, y + rowIndex * scale, scale, scale, color);
      });
    });
    cursor += 6 * scale;
  }
  return cursor;
}

const navy = [14, 21, 48];
const gold = [224, 160, 48];
const white = [245, 246, 250];
const data = Buffer.alloc(width * height * 3, 0);
fillRect(data, 0, 0, width, height, navy);
fillRect(data, 0, 0, width, 14, gold);
fillRect(data, 80, 150, 92, 92, gold);
text(data, "C", 104, 168, 8, navy);
text(data, "CISSE MULTI-SERVICE", 80, 290, 7, white);
text(data, "SACS  MONTRES  ACCESSOIRES", 80, 380, 4, gold);
text(data, "BAMAKO", 80, 450, 4, white);

const raw = Buffer.alloc((width * 3 + 1) * height);
for (let y = 0; y < height; y += 1) {
  const rowStart = y * (width * 3 + 1);
  raw[rowStart] = 0;
  data.copy(raw, rowStart + 1, y * width * 3, (y + 1) * width * 3);
}

function chunk(type, body) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(body.length);
  const kind = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([kind, body])) >>> 0);
  return Buffer.concat([length, kind, body, crc]);
}

const header = Buffer.alloc(13);
header.writeUInt32BE(width, 0);
header.writeUInt32BE(height, 4);
header[8] = 8;
header[9] = 2;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", header),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const target = path.join(process.cwd(), "public", "og-default.png");
fs.writeFileSync(target, png);
console.log(target, png.length);
