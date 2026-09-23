import type { Picture } from "./pixels.js";

/**
 * **Two pictures as one**: the thing before and the thing after, joined with a
 * grey gutter, so a look change goes to the owner as the one PNG CLAUDE.md
 * allows rather than one frame and the other said in words (`bun run pair`,
 * `pair-png.ts`).
 *
 * The first picture is on the left or on top, always: *before* reads first in
 * either direction. Which direction is decided by the result's shape, because
 * the owner reads on a phone and a phone fits a picture to its width: two
 * crops wider than they are tall laid side by side would be a strip too thin
 * to read, so they stack; two portrait frames stacked would be a picture twice
 * a screen tall, so they sit side by side. `--stack` and `--beside` say it
 * outright.
 *
 * Both are widened to four channels first — a frame from Chrome and a sheet
 * from the rasteriser need not agree on alpha — and a smaller one is centred
 * in the larger one's cell on the gutter's grey rather than stretched, because
 * a stretched *before* is not the picture that was.
 */

export type Direction = "beside" | "stack";

/** The gutter's grey: a seam that is neither the field's dark nor a colour
 * any frame draws with. */
const GUTTER = [128, 128, 128, 255] as const;

/** The direction whose result is nearer a phone screen's shape: side by side
 * only while the pair would still be taller than it is wide. */
export function directionFor(a: Picture, b: Picture): Direction {
  const wide = a.width + b.width;
  const tall = Math.max(a.height, b.height);
  return wide <= tall ? "beside" : "stack";
}

/** A picture of any channel count as eight-bit RGBA. */
export function toRgba(pic: Picture): Picture {
  const channels = pic.pixels.length / (pic.width * pic.height);
  if (channels === 4) return pic;
  const out = new Uint8Array(pic.width * pic.height * 4);
  for (let i = 0; i < pic.width * pic.height; i++) {
    const at = i * channels;
    const grey = channels <= 2;
    const r = pic.pixels[at] ?? 0;
    out[i * 4] = r;
    out[i * 4 + 1] = grey ? r : (pic.pixels[at + 1] ?? 0);
    out[i * 4 + 2] = grey ? r : (pic.pixels[at + 2] ?? 0);
    out[i * 4 + 3] = channels === 2 ? (pic.pixels[at + 1] ?? 255) : 255;
  }
  return { width: pic.width, height: pic.height, pixels: out };
}

/** `a` then `b`, `gutter` pixels apart, as one RGBA picture. */
export function pair(
  first: Picture,
  second: Picture,
  gutter = 8,
  direction: Direction = directionFor(first, second),
): Picture {
  if (!Number.isInteger(gutter) || gutter < 0)
    throw new Error(`gutter ${gutter}: a whole number of pixels, nought or more`);
  const a = toRgba(first);
  const b = toRgba(second);
  const beside = direction === "beside";
  const cellW = Math.max(a.width, b.width);
  const cellH = Math.max(a.height, b.height);
  const width = beside ? a.width + gutter + b.width : cellW;
  const height = beside ? cellH : a.height + gutter + b.height;
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) pixels.set(GUTTER, i * 4);
  const out = { width, height, pixels };
  if (beside) {
    blit(out, a, 0, Math.floor((cellH - a.height) / 2));
    blit(out, b, a.width + gutter, Math.floor((cellH - b.height) / 2));
  } else {
    blit(out, a, Math.floor((cellW - a.width) / 2), 0);
    blit(out, b, Math.floor((cellW - b.width) / 2), a.height + gutter);
  }
  return out;
}

function blit(into: Picture, from: Picture, x: number, y: number): void {
  const row = from.width * 4;
  for (let sy = 0; sy < from.height; sy++) {
    const to = ((y + sy) * into.width + x) * 4;
    into.pixels.set(from.pixels.subarray(sy * row, (sy + 1) * row), to);
  }
}
