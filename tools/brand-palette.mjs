// Builds brand-anchored OKLCH scales from the colours sampled out of the supplied logo.
//
// Each scale keeps the anchor's hue, and at every lightness step uses the anchor's
// chroma capped to what sRGB can actually display at that lightness. Mid-tones stay
// saturated; the extremes taper automatically instead of going muddy or neon.
//
// Run with:  node tools/brand-palette.mjs

/* ---------- sRGB <-> OKLCH (Björn Ottosson's reference maths) ---------- */

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

function rgbToOklab([r, g, b]) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);

  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToRgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

function hexToOklch(hex) {
  const [L, a, b] = rgbToOklab(hexToRgb(hex));
  const C = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
}

const inGamut = ([L, a, b]) =>
  oklabToRgb([L, a, b]).every((c) => c >= -0.0005 && c <= 1.0005);

/** Largest chroma sRGB can show at this lightness and hue. */
function maxChroma(L, h) {
  const rad = (h * Math.PI) / 180;
  let lo = 0;
  let hi = 0.42;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut([L, mid * Math.cos(rad), mid * Math.sin(rad)])) lo = mid;
    else hi = mid;
  }
  return lo;
}

/* ---------- Scales ---------- */

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const L_TARGETS = [0.972, 0.94, 0.885, 0.8, 0.7, 0.6, 0.5, 0.41, 0.33, 0.26, 0.19];

/**
 * Chroma at a given lightness.
 *
 * A flat anchor chroma looks wrong at both ends: high chroma near white reads as
 * pastel and burns, high chroma near black goes muddy. This tapers the anchor's
 * chroma with the squared distance from the anchor's own lightness, capped by
 * what sRGB can display, so the middle of the ramp stays saturated and the
 * extremes settle down on their own.
 */
function chromaAt(L, anchorL, anchorC, hue) {
  const drift = Math.abs(L - anchorL) / 0.85;
  // Floor at ~a third of the anchor chroma: dropping lower turns the light navy
  // tints into flat grey and the dark ones into near-black.
  const taper = Math.max(0.32, (1 - Math.min(drift, 1)) ** 2);
  return Math.min(anchorC * taper, maxChroma(L, hue) * 0.98);
}

/**
 * @param name    scale name for the CSS variable
 * @param hex     the brand anchor this scale is derived from
 * @param anchor  step index the anchor colour should sit on
 */
function scale(name, hex, anchor) {
  const { L: anchorL, C: anchorC, h } = hexToOklch(hex);
  const shift = anchorL - L_TARGETS[anchor];
  const out = [];
  for (let i = 0; i < STEPS.length; i++) {
    const L = Math.max(0.06, Math.min(0.995, L_TARGETS[i] + shift));
    const C = chromaAt(L, anchorL, anchorC, h);
    out.push({ step: STEPS[i], L, C, h, hex: oklchToHex(L, C, h) });
  }
  return { name, anchorHex: hex, hue: h, steps: out };
}

function oklchToHex(L, C, h) {
  const rad = (h * Math.PI) / 180;
  const rgb = oklabToRgb([L, C * Math.cos(rad), C * Math.sin(rad)]);
  const to255 = (c) => Math.max(0, Math.min(255, Math.round(c * 255)));
  return "#" + rgb.map((c) => to255(c).toString(16).padStart(2, "0")).join("");
}

const anchors = {
  navy: "#1A3A5C", // V/S monogram and wordmark, per the light lockup
  navyDeep: "#1A2A4A", // circular badge field
  gold: "#C5A55A", // diamond, crown and badge lettering
  green: "#1E5631", // leaf veins in the lockup
};

console.log("=== brand anchors as OKLCH ===");
for (const [k, v] of Object.entries(anchors)) {
  const { L, C, h } = hexToOklch(v);
  console.log(
    `  ${k.padEnd(9)} ${v}  L=${L.toFixed(3)}  C=${C.toFixed(3)}  H=${h.toFixed(1)}`,
  );
}

console.log("\n=== generated scales (hex per step) ===");
const scales = [
  scale("navy", anchors.navy, 7),
  scale("gold", anchors.gold, 4),
  scale("green", anchors.green, 7),
];

for (const s of scales) {
  console.log(`\n${s.name} (hue ${s.hue.toFixed(1)}, anchor ${s.anchorHex})`);
  for (const st of s.steps) {
    console.log(
      `  --color-${s.name}-${st.step}: oklch(${st.L.toFixed(3)} ${st.C.toFixed(3)} ${st.h.toFixed(1)}); /* ${st.hex} */`,
    );
  }
}

// Contrast helpers, so text colours are chosen on measurement rather than by eye.
const relLum = (hex) => {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [relLum(a), relLum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const paper = "#F7F5F1";
const ink = scales[0].steps[10].hex;

console.log("\n=== contrast checks ===");
const pairs = [
  ["ink on paper", ink, paper],
  ["navy-800 on paper", scales[0].steps[8].hex, paper],
  ["navy-700 on paper", scales[0].steps[7].hex, paper],
  ["gold-500 on paper", scales[1].steps[5].hex, paper],
  ["gold-600 on paper", scales[1].steps[6].hex, paper],
  ["gold-700 on paper", scales[1].steps[7].hex, paper],
  ["gold-500 on navy-950", scales[1].steps[5].hex, scales[0].steps[10].hex],
  ["navy-100 on navy-950", scales[0].steps[1].hex, scales[0].steps[10].hex],
  ["navy-300 on navy-950", scales[0].steps[3].hex, scales[0].steps[10].hex],
  ["green-500 on paper", scales[2].steps[5].hex, paper],
];
for (const [label, fg, bg] of pairs) {
  const r = ratio(fg, bg);
  const verdict = r >= 4.5 ? "AA body" : r >= 3 ? "AA large only" : "FAILS";
  console.log(`  ${label.padEnd(24)} ${r.toFixed(2)}:1  ${verdict}   (${fg} on ${bg})`);
}
