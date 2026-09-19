// Derives usable web assets from the supplied brand JPEGs.
//
//   virashu.jpeg      -> virashu-badge.png    circle mask, transparent outside
//   virashu_logo.jpeg -> virashu-lockup.png   full stacked lockup, background keyed out
//   virashu_logo.jpeg -> virashu-emblem.png   emblem only, split at the gap above the wordmark
//
// Run with:  node tools/derive-brand-assets.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "C:/Users/ratne/OneDrive/Desktop/mobile screen/logo";
const OUT = "src/assets";

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

async function rawOf(path) {
  const { data, info } = await sharp(path)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function hits({ data, width, height }, threshold) {
  const colHits = new Array(width).fill(0);
  const rowHits = new Array(height).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (lum(data[i], data[i + 1], data[i + 2]) < threshold) {
        colHits[x]++;
        rowHits[y]++;
      }
    }
  }
  return { colHits, rowHits };
}

/** Bounding box of everything darker than `threshold`. */
function artBounds({ colHits, rowHits }, minRun = 3) {
  const firstCol = colHits.findIndex((n) => n >= minRun);
  const lastCol = colHits.findLastIndex((n) => n >= minRun);
  const firstRow = rowHits.findIndex((n) => n >= minRun);
  const lastRow = rowHits.findLastIndex((n) => n >= minRun);
  if (firstCol < 0 || firstRow < 0) throw new Error("no artwork found");
  return { minX: firstCol, minY: firstRow, maxX: lastCol, maxY: lastRow };
}

/**
 * Bounds for a source carrying page furniture.
 *
 * virashu_logo.jpeg has a full-height rule near its right edge. A plain min/max
 * scan drags the box out to that rule, so columns are grouped into contiguous
 * runs and only the densest run (the actual lockup) is kept.
 */
function artBoundsMainSubject({ colHits, rowHits }, minRowHits, minColHits) {
  const firstRow = rowHits.findIndex((n) => n >= minRowHits);
  const lastRow = rowHits.findLastIndex((n) => n >= minRowHits);
  if (firstRow < 0) throw new Error("no artwork rows found");

  let best = null;
  let run = null;
  for (let x = 0; x <= colHits.length; x++) {
    const inRun = x < colHits.length && colHits[x] >= minColHits;
    if (inRun && !run) run = { start: x, end: x };
    else if (inRun) run.end = x;
    else if (run) {
      if (!best || run.end - run.start > best.end - best.start) best = run;
      run = null;
    }
  }
  if (!best) throw new Error("no artwork columns found");
  return { minX: best.start, minY: firstRow, maxX: best.end, maxY: lastRow };
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/** Clears the near-neutral light background so the artwork sits on any light surface. */
function keyOutBackground(data) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    if (Math.min(r, g, b) > 218 && spread < 26) data[i + 3] = 0;
  }
  return data;
}

async function badge() {
  const img = await rawOf(`${SRC}/virashu.jpeg`);
  const b = artBounds(hits(img, 200));
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  const side = Math.max(b.maxX - b.minX, b.maxY - b.minY) + 8;

  const left = clamp(Math.round(cx - side / 2), 0, img.width - 1);
  const top = clamp(Math.round(cy - side / 2), 0, img.height - 1);
  const size = Math.min(Math.round(side), img.width - left, img.height - top);

  const S = 1024;
  const square = await sharp(`${SRC}/virashu.jpeg`)
    .extract({ left, top, width: size, height: size })
    .resize(S, S, { fit: "cover" })
    .png()
    .toBuffer();

  // Inset the mask by 3px. Masking at exactly r = S/2 samples the source's own
  // cream background at the rim, leaving a visible light halo on dark surfaces.
  const mask = Buffer.from(
    `<svg width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2 - 3}" fill="#fff"/></svg>`,
  );

  await sharp(square)
    .composite([{ input: mask, blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/virashu-badge.png`);

  console.log(`badge  : crop ${size}x${size} @${left},${top} -> ${S}x${S} circular`);
}

/** Shared bounds for the two assets taken from the light lockup. */
async function lockupBounds() {
  const img = await rawOf(`${SRC}/virashu_logo.jpeg`);
  const h = hits(img, 200);
  const b = artBoundsMainSubject(h, 30, 30);
  return { img, h, b };
}

async function cropKeyed(left, top, width, height, outName, maxWidth) {
  const { data } = await sharp(`${SRC}/virashu_logo.jpeg`)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  await sharp(keyOutBackground(data), { raw: { width, height, channels: 4 } })
    .resize({ width: maxWidth, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/${outName}`);
}

async function lockup() {
  const { img, b } = await lockupBounds();
  const pad = 24;
  const left = clamp(b.minX - pad, 0, img.width - 1);
  const top = clamp(b.minY - pad, 0, img.height - 1);
  const width = clamp(b.maxX - b.minX + pad * 2, 1, img.width - left);
  const height = clamp(b.maxY - b.minY + pad * 2, 1, img.height - top);

  await cropKeyed(left, top, width, height, "virashu-lockup.png", 1400);
  console.log(`lockup : crop ${width}x${height} @${left},${top}`);
  return b;
}

/**
 * The emblem on its own, split from the wordmark.
 *
 * The stacked lockup reads as mush at header size, so the header gets the emblem
 * with the name set as live text beside it. The split point is the widest band of
 * blank rows in the middle of the artwork.
 */
async function emblem(b) {
  const img = await rawOf(`${SRC}/virashu_logo.jpeg`);

  // Row profile between the artwork's own columns only. Using the full image
  // width would count the stray vertical rule on every row, so nothing would
  // ever read as blank.
  const rowHits = new Array(img.height).fill(0);
  for (let y = 0; y < img.height; y++) {
    for (let x = b.minX; x <= b.maxX; x++) {
      const i = (y * img.width + x) * 4;
      if (lum(img.data[i], img.data[i + 1], img.data[i + 2]) < 200) rowHits[y]++;
    }
  }

  const lo = Math.floor(b.minY + (b.maxY - b.minY) * 0.3);
  const hi = Math.ceil(b.minY + (b.maxY - b.minY) * 0.9);
  let best = null;
  let run = null;
  for (let y = lo; y <= hi; y++) {
    const blank = rowHits[y] < 3;
    if (blank && !run) run = { start: y, end: y };
    else if (blank) run.end = y;
    else if (run) {
      if (!best || run.end - run.start > best.end - best.start) best = run;
      run = null;
    }
  }
  if (!best) throw new Error("no separation found between emblem and wordmark");

  const pad = 16;
  const left = clamp(b.minX - pad, 0, img.width - 1);
  const top = clamp(b.minY - pad, 0, img.height - 1);
  const width = clamp(b.maxX - b.minX + pad * 2, 1, img.width - left);
  const height = clamp(best.start - top, 1, img.height - top);

  await cropKeyed(left, top, width, height, "virashu-emblem.png", 720);
  console.log(
    `emblem : crop ${width}x${height} @${left},${top}  (split at blank rows ${best.start}-${best.end})`,
  );
}

/**
 * Gold-only emblem for dark surfaces.
 *
 * The supplied emblem is navy line art, which disappears on the navy field. The
 * circular badge solves this by drawing the same artwork in gold on navy, so this
 * does the same remap: blue-dominant pixels become the brand gold, gold and green
 * are left alone.
 */
async function emblemGold() {
  const { data, info } = await sharp(`${OUT}/virashu-emblem.png`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const GOLD = [197, 165, 90]; // #C5A55A, the brand gold

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const bluish = data[i + 2] - Math.max(data[i], data[i + 1]);
    if (bluish <= 8) continue;
    // Steep ramp: blending navy through the middle would land on olive mud.
    const t = Math.min(1, (bluish - 8) / 20);
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] + (GOLD[c] - data[i + c]) * t);
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/virashu-emblem-gold.png`);

  console.log(`gold   : virashu-emblem-gold.png ${info.width}x${info.height} (navy remapped to gold)`);
}

/**
 * Favicons.
 *
 * Built from the gold emblem on the badge's own navy field rather than from the
 * badge itself: the badge's inner lettering collapses into noise below roughly
 * 150px, and a favicon is smaller than that. Colours match the badge, so the tab
 * icon still reads as the same mark.
 */
async function favicons() {
  const S = 512;
  const NAVY = { r: 26, g: 42, b: 74 }; // the badge's own field colour

  const field = await sharp({
    create: { width: S, height: S, channels: 4, background: { ...NAVY, alpha: 1 } },
  })
    .png()
    .toBuffer();

  const circleMask = Buffer.from(
    `<svg width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2}" fill="#fff"/></svg>`,
  );

  const disc = await sharp(field)
    .composite([{ input: circleMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const emblem = await sharp(`${OUT}/virashu-emblem-gold.png`)
    .resize({ width: Math.round(S * 0.7), fit: "inside" })
    .png()
    .toBuffer();
  const em = await sharp(emblem).metadata();

  const icon = await sharp(disc)
    .composite([
      {
        input: emblem,
        left: Math.round((S - em.width) / 2),
        top: Math.round((S - em.height) / 2),
      },
    ])
    .png()
    .toBuffer();

  await sharp(icon).resize(64, 64).png({ compressionLevel: 9 }).toFile("public/favicon.png");
  await sharp(icon).resize(180, 180).png({ compressionLevel: 9 }).toFile("public/apple-touch-icon.png");
  console.log("icons  : public/favicon.png (64), public/apple-touch-icon.png (180) from gold emblem");
}

await mkdir(OUT, { recursive: true });
await badge();
const b = await lockup();
await emblem(b);
await emblemGold();
await favicons();
console.log("done");
