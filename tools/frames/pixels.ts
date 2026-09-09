/**
 * **A screenshot read back as the picture it is**, rather than as the file it
 * arrived in.
 *
 * `captureFrames` used to digest the PNG bytes, and two runs of one build
 * inside a full `bun run check` came back with different digests — then
 * matched twelve times out of twelve when the file was run alone. A PNG is a
 * compressed stream: the encoder picks a filter per scanline and a deflate
 * block layout, and nothing in the format promises it picks the same ones on
 * a machine that is being fought over. So two files that differ are not two
 * pictures that differ, and an assertion that says so is asking the wrong
 * question — of `test/opening.test.ts`, and of `bun run frames`'s own
 * `identical:` guard, which refuses to write a before-and-after pair that
 * shows nothing.
 *
 * The container is `tools/raster/src/png.ts`'s, called rather than written
 * again: that file already takes a PNG apart into chunks for the animator, and
 * a second copy of where an `IDAT` starts is a second thing to keep right.
 * What is here is the half it has no use for — undoing the scanline filters,
 * which is what turns a compressed stream back into pixels.
 *
 * Decoding rather than reading the canvas back with `getImageData`: three of
 * the game's controls are DOM buttons sitting **over** `#stage`, so the
 * backing store is not what the screenshot saw. Everything the picture has is
 * in these bytes.
 */

import { inflateSync } from "node:zlib";
import { joinIdat, readChunks, readIhdr } from "../raster/src/png.js";

/** Bytes a pixel for the colour types that carry eight bits a channel. */
const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 4: 2, 6: 4 };

export interface Picture {
  width: number;
  height: number;
  /** Row-major, with every scanline filter undone. */
  pixels: Uint8Array;
}

/** Paeth's predictor, from the PNG specification: whichever neighbour the
 * gradient `a + b - c` is nearest to, with ties going left. */
function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/** The pixels of one PNG, with every scanline filter undone. */
export function decodePng(bytes: Uint8Array): Picture {
  const chunks = readChunks(bytes);
  const { width, height, bitDepth, colourType } = readIhdr(chunks);
  if (bitDepth !== 8) throw new Error(`PNG bit depth ${bitDepth}: only eight bits a channel`);
  const channels = CHANNELS[colourType];
  if (!channels) throw new Error(`PNG colour type ${colourType}: not one this reads`);

  // `node:zlib` and not `Bun.inflateSync`, which refuses a real screenshot with
  // "invalid stored block lengths" on a stream opening with a perfectly
  // ordinary `78 9c` — Bun 1.4.2, reproduced on the game's own home-screen
  // icon. Synthetic PNGs go through it happily, which is the trap; the icon is
  // in `test/pixels.test.ts` for exactly that reason.
  const raw = inflateSync(joinIdat(chunks));

  const stride = width * channels;
  const pixels = new Uint8Array(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const from = y * (stride + 1) + 1;
    const to = y * stride;
    const up = to - stride;
    if (filter === undefined || filter > 4) {
      throw new Error(`PNG scanline filter ${filter}: not one the format has`);
    }
    for (let x = 0; x < stride; x++) {
      const value = raw[from + x] ?? 0;
      const left = x >= channels ? (pixels[to + x - channels] ?? 0) : 0;
      const above = y > 0 ? (pixels[up + x] ?? 0) : 0;
      const corner = y > 0 && x >= channels ? (pixels[up + x - channels] ?? 0) : 0;
      const predicted =
        filter === 1
          ? left
          : filter === 2
            ? above
            : filter === 3
              ? (left + above) >> 1
              : filter === 4
                ? paeth(left, above, corner)
                : 0;
      pixels[to + x] = (value + predicted) & 0xff;
    }
  }
  return { width, height, pixels };
}

/**
 * A digest of what a screenshot *shows*, so two encodings of one picture agree
 * and one changed pixel does not.
 *
 * The size goes in with the pixels, because two pictures of different shapes
 * could otherwise hold the same bytes.
 */
export function pictureDigest(bytes: Uint8Array): string {
  const { width, height, pixels } = decodePng(bytes);
  return new Bun.CryptoHasher("sha256").update(`${width}x${height}:`).update(pixels).digest("hex");
}

/** How much of two pictures disagrees and where it starts — what a failed
 * comparison says instead of two digests. */
export function pictureDiff(a: Uint8Array, b: Uint8Array): string {
  const one = decodePng(a);
  const two = decodePng(b);
  if (one.width !== two.width || one.height !== two.height) {
    return `${one.width}x${one.height} against ${two.width}x${two.height}`;
  }
  let differing = 0;
  let first = -1;
  for (let i = 0; i < one.pixels.length; i++) {
    if (one.pixels[i] === two.pixels[i]) continue;
    if (first === -1) first = i;
    differing++;
  }
  if (differing === 0) return "";
  const channels = one.pixels.length / (one.width * one.height);
  const pixel = Math.floor(first / channels);
  return (
    `${differing} of ${one.pixels.length} channel bytes differ, ` +
    `first at x=${pixel % one.width}, y=${Math.floor(pixel / one.width)}`
  );
}
