import { deflateSync } from "node:zlib";
import { concat, PNG_SIGNATURE, writeChunk } from "../raster/src/png.js";
import type { Picture } from "./pixels.js";

/**
 * **A picture written back out, and a piece of one made bigger** — the two
 * halves `pixels.ts` does not have, so that a lane holding a PNG can look
 * closer at it without a browser.
 *
 * Three lanes in two days wrote the same throwaway: decode a screenshot, cut
 * a rectangle out, scale it up by whole pixels, encode it again. Each did it
 * because `bun run shot --at` was the only way to magnify a candidate and it
 * was broken for them — a hang above 2x on a tile pose, then a clip that
 * landed on the page's prose — and each deleted the script afterwards, which
 * is exactly the friction `shot.ts` was written to stop being paid twice.
 * `bun run crop` is that script kept (`crop-png.ts`).
 *
 * **Nearest neighbour, on purpose.** The point of magnifying a frame is to
 * see what was drawn, and a pixel is what was drawn; a smoothed enlargement
 * invents colours between two pixels that no phone ever showed. `--at` with
 * `--scale` is the better instrument when it works, because the browser
 * paints the frame again at the higher resolution rather than stretching one
 * — this is the fallback for a picture already taken.
 *
 * **Filter nought on every scanline.** A PNG encoder may pick any filter, and
 * `pixels.ts` says why two encoders' choices are not two pictures; here the
 * choice is the one that needs no prediction, because the file is read by a
 * person once and thrown away, and nothing downstream digests it.
 */

/** A rectangle inside a picture, in its own pixels. */
export interface Window {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** `pixels.ts`'s colour types, as channels per pixel, the other way round. */
function colourTypeFor(channels: number): number {
  const type = { 1: 0, 2: 4, 3: 2, 4: 6 }[channels];
  if (type === undefined) throw new Error(`${channels} channels a pixel: not a PNG layout`);
  return type;
}

/**
 * The rectangle, each of its pixels drawn `zoom` times over in both directions.
 * A window reaching past the picture is clamped to its edge rather than
 * refused: a person asking for the corner of a frame is asking for the corner.
 */
export function magnify(pic: Picture, channels: number, win: Window, zoom: number): Picture {
  if (!Number.isInteger(zoom) || zoom < 1)
    throw new Error(`zoom ${zoom}: a whole number, one or more`);
  if (win.width <= 0 || win.height <= 0) throw new Error("a crop with no area is not a picture");
  const width = win.width * zoom;
  const height = win.height * zoom;
  const pixels = new Uint8Array(width * height * channels);
  for (let oy = 0; oy < height; oy++) {
    const sy = Math.min(pic.height - 1, Math.max(0, win.y + Math.floor(oy / zoom)));
    for (let ox = 0; ox < width; ox++) {
      const sx = Math.min(pic.width - 1, Math.max(0, win.x + Math.floor(ox / zoom)));
      const from = (sy * pic.width + sx) * channels;
      const to = (oy * width + ox) * channels;
      for (let c = 0; c < channels; c++) pixels[to + c] = pic.pixels[from + c] ?? 0;
    }
  }
  return { width, height, pixels };
}

/** A picture as PNG bytes: eight bits a channel, one IDAT, no filtering. */
export function encodePng(pic: Picture, channels: number): Uint8Array {
  const stride = pic.width * channels;
  const raw = new Uint8Array(pic.height * (stride + 1));
  for (let y = 0; y < pic.height; y++) {
    raw[y * (stride + 1)] = 0;
    raw.set(pic.pixels.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, pic.width);
  view.setUint32(4, pic.height);
  ihdr[8] = 8;
  ihdr[9] = colourTypeFor(channels);
  return concat([
    PNG_SIGNATURE,
    writeChunk("IHDR", ihdr),
    writeChunk("IDAT", new Uint8Array(deflateSync(raw))),
    writeChunk("IEND", new Uint8Array(0)),
  ]);
}
