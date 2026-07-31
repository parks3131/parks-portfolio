// Turns a photo shot against a plain white background into the badge's cut-out
// PNG: background keyed out, bottom faded, sharpened for magnification.
//
//   node scripts/photo-cutout.mjs <source> public/images/avatar.png
//
// Kept in the repo because the badge photo gets replaced, and the two things
// that make this work - filling from the border rather than thresholding white,
// and forcing the mask back to one channel - are not obvious enough to rederive.
import { stat } from "node:fs/promises";
import sharp from "sharp";

const [SRC, OUT] = process.argv.slice(2);
if (!SRC || !OUT) throw new Error("usage: node scripts/photo-cutout.mjs <source> <output.png>");
const THRESH = 236;

// Full resolution: the badge texture is magnified when the page is zoomed, so
// anything smaller than the source is visibly soft.
const base = sharp(SRC);
const { data, info } = await base.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

const isBg = (i) => {
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
  return r >= THRESH && g >= THRESH && b >= THRESH;
};

// Flood fill inward from every border pixel that is background-white. Only the
// white *connected to the frame* is removed, so the white stripes and stars on
// the tank top survive.
const out = new Uint8Array(W * H);
out.fill(255);
const seen = new Uint8Array(W * H);
const stack = [];
const push = (x, y) => {
  const i = y * W + x;
  if (seen[i] || !isBg(i)) return;
  seen[i] = 1;
  stack.push(i);
};
for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }

while (stack.length) {
  const i = stack.pop();
  out[i] = 0;
  const x = i % W, y = (i / W) | 0;
  if (x > 0) push(x - 1, y);
  if (x < W - 1) push(x + 1, y);
  if (y > 0) push(x, y - 1);
  if (y < H - 1) push(x, y + 1);
}

// Feather, then pull the threshold up so the silhouette shrinks by a hair.
// A hard mask keeps a bright white fringe from the original anti-aliasing.
// toColourspace is load-bearing: sharp promotes a raw single-channel image to
// three channels on the way out, and reading that back as one channel gives a
// striped mask rather than an error.
const soft = await sharp(Buffer.from(out), { raw: { width: W, height: H, channels: 1 } })
  .blur(1.4).toColourspace("b-w").raw().toBuffer();
if (soft.length !== W * H) throw new Error(`mask is ${soft.length} bytes, expected ${W * H}`);

const alpha = Buffer.alloc(W * H);
for (let i = 0; i < W * H; i++) {
  const a = (soft[i] - 90) / (255 - 90);
  alpha[i] = Math.max(0, Math.min(255, Math.round(a * 255)));
}

// Fade the bottom, where the photo cuts the torso off mid-frame. Without it the
// figure ends on a hard horizontal edge and reads as a cropped sticker.
const FADE = Math.round(H * 0.14);
for (let y = H - FADE; y < H; y++) {
  const t = (y - (H - FADE)) / FADE;
  const k = 1 - t * t * (3 - 2 * t);
  for (let x = 0; x < W; x++) alpha[y * W + x] = Math.round(alpha[y * W + x] * k);
}

// Unsharp mask before the alpha goes on: the source is a soft phone photo and
// the card magnifies it.
const rgb = await base.clone().removeAlpha().sharpen({ sigma: 1.1, m1: 0.6, m2: 2.2 }).raw().toBuffer();
await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
  .joinChannel(alpha, { raw: { width: W, height: H, channels: 1 } })
  .png({ compressionLevel: 9, palette: true, quality: 95, effort: 10 })
  .toFile(OUT);

const { size } = await stat(OUT);
console.log("wrote", OUT, `${W}x${H}`, Math.round(size / 1024) + "KB");
