// Renders each brand asset on the background it will actually sit on, as one sheet,
// so the placements can be judged together rather than one screenshot at a time.
import sharp from "sharp";

const NAVY = { r: 0, g: 6, b: 19 }; // navy-950
const PAPER = { r: 247, g: 245, b: 241 }; // paper

const rows = [
  { label: "emblem on paper", src: "src/assets/virashu-emblem.png", bg: PAPER, h: 40 },
  { label: "badge small on paper", src: "src/assets/virashu-badge.png", bg: PAPER, h: 40 },
  { label: "badge small on navy", src: "src/assets/virashu-badge.png", bg: NAVY, h: 44 },
  { label: "badge large on navy", src: "src/assets/virashu-badge.png", bg: NAVY, h: 96 },
  { label: "emblem-gold on navy", src: "src/assets/virashu-emblem-gold.png", bg: NAVY, h: 40 },
  { label: "emblem-gold large on navy", src: "src/assets/virashu-emblem-gold.png", bg: NAVY, h: 110 },
  { label: "lockup on paper", src: "src/assets/virashu-lockup.png", bg: PAPER, h: 150 },
];

const CELL_W = 620;
const CELL_H = 200;

const layers = [];

for (let i = 0; i < rows.length; i++) {
  const r = rows[i];

  // Band background as a real buffer: sharp's composite() does not accept a
  // `create` descriptor inline, which is what left an earlier sheet all-white.
  const band = await sharp({
    create: { width: CELL_W, height: CELL_H - 8, channels: 4, background: { ...r.bg, alpha: 1 } },
  })
    .png()
    .toBuffer();

  layers.push({ input: band, left: 0, top: i * CELL_H + 4 });

  const art = await sharp(r.src).resize({ height: r.h, fit: "inside" }).png().toBuffer();
  const meta = await sharp(art).metadata();
  layers.push({
    input: art,
    left: 60,
    top: i * CELL_H + 4 + Math.round((CELL_H - 8 - meta.height) / 2),
  });
}

await sharp({
  create: {
    width: CELL_W,
    height: rows.length * CELL_H,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite(layers)
  .png()
  .toFile("brand-sheet.png");

console.log(`wrote brand-sheet.png (${CELL_W}x${rows.length * CELL_H})`);
rows.forEach((r, i) => console.log(`  band ${i}: ${r.label} (h=${r.h})`));
