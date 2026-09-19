import sharp from "sharp";

async function analyse(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buckets = { navy: 0, gold: 0, green: 0, other: 0, transparent: 0 };
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 16) {
      buckets.transparent++;
      continue;
    }
    const max = Math.max(r, g, b);
    if (b === max && b - Math.max(r, g) > 8) buckets.navy++;
    else if (g === max && g - Math.min(r, b) > 8) buckets.green++;
    else if (r >= max && r - b > 30) buckets.gold++;
    else buckets.other++;
  }
  const total = info.width * info.height;
  const pct = (n) => `${((n / total) * 100).toFixed(1)}%`;
  console.log(`\n${file} (${info.width}x${info.height})`);
  console.log(
    `  navy ${pct(buckets.navy)}  gold ${pct(buckets.gold)}  green ${pct(buckets.green)}  other ${pct(buckets.other)}  clear ${pct(buckets.transparent)}`,
  );
}

await analyse("src/assets/virashu-emblem.png");
await analyse("src/assets/virashu-emblem-gold.png");

// Confirm the contact sheet actually painted each band the colour intended.
const sheet = await sharp("brand-sheet.png").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const at = (x, y) => {
  const i = (y * sheet.info.width + x) * 4;
  return `rgb(${sheet.data[i]},${sheet.data[i + 1]},${sheet.data[i + 2]})`;
};
console.log("\nbrand-sheet.png band colour at x=590 (clear of artwork):");
for (let i = 0; i < 6; i++) console.log(`  band ${i} (y=${i * 200 + 100}): ${at(590, i * 200 + 100)}`);
