// Reports alpha coverage for the derived brand assets.
import sharp from "sharp";

for (const file of [
  "src/assets/virashu-badge.png",
  "src/assets/virashu-lockup.png",
  "src/assets/virashu-emblem.png",
]) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  const alphaAt = (x, y) => data[(y * w + x) * 4 + 3];
  let opaque = 0;
  let clear = 0;
  for (let i = 3; i < data.length; i += 4) (data[i] > 8 ? opaque++ : clear++);

  const pct = ((clear / (w * h)) * 100).toFixed(1);
  console.log(`\n${file}  ${w}x${h}`);
  console.log(`  transparent: ${pct}%   corners: TL=${alphaAt(1, 1)} TR=${alphaAt(w - 2, 1)} BL=${alphaAt(1, h - 2)} BR=${alphaAt(w - 2, h - 2)}`);
  console.log(`  centre alpha: ${alphaAt(w >> 1, h >> 1)}`);
  console.log(`  channels: ${info.channels}`);
}
