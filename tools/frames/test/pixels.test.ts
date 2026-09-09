import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { deflateSync } from "node:zlib";
import { concat, PNG_SIGNATURE, writeChunk } from "../../raster/src/png.js";
import { decodePng, pictureDiff, pictureDigest } from "../pixels.js";

/**
 * The claim `bun run frames` rests on: two files are the same *picture* when
 * they hold the same pixels, whatever the encoder did with them.
 *
 * It is checked against PNGs written here rather than against a screenshot,
 * because the thing under test is exactly the freedom a real encoder has —
 * the same image, filtered two ways and deflated at two levels — and a
 * capture cannot be asked to exercise both on demand. That freedom is what
 * made a capture test fail once inside a full `bun run check` and then pass
 * twelve times on its own.
 */

/**
 * One RGBA image, written with every scanline carrying `filter`.
 *
 * The filters are the point: `None` and `Up` describe the same pixels with
 * different bytes, which is the whole of what an encoder is free to choose.
 */
function writePng(
  width: number,
  height: number,
  pixels: Uint8Array,
  filter: 0 | 2,
  level: 1 | 6 | 9,
): Uint8Array {
  const ihdr = new Uint8Array(13);
  const head = new DataView(ihdr.buffer);
  head.setUint32(0, width);
  head.setUint32(4, height);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const stride = width * 4;
  const raw = new Uint8Array(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = filter;
    for (let x = 0; x < stride; x++) {
      const value = pixels[y * stride + x] ?? 0;
      const above = y > 0 ? (pixels[(y - 1) * stride + x] ?? 0) : 0;
      raw[y * (stride + 1) + 1 + x] = (filter === 2 ? value - above : value) & 0xff;
    }
  }

  const body = deflateSync(raw, { level });
  return concat([
    PNG_SIGNATURE,
    writeChunk("IHDR", ihdr),
    writeChunk("IDAT", body),
    writeChunk("IEND", new Uint8Array()),
  ]);
}

/** A four-by-three picture with a gradient in it, so a filter that is undone
 * wrongly cannot look right by accident. */
function subject(): Uint8Array {
  const pixels = new Uint8Array(4 * 3 * 4);
  for (let i = 0; i < pixels.length; i++) pixels[i] = (i * 37 + 11) & 0xff;
  return pixels;
}

describe("decodePng", () => {
  it("gives back the pixels it was given, whichever filter carried them", () => {
    const pixels = subject();
    for (const filter of [0, 2] as const) {
      const read = decodePng(writePng(4, 3, pixels, filter, 6));
      expect(read.width).toBe(4);
      expect(read.height).toBe(3);
      expect([...read.pixels]).toEqual([...pixels]);
    }
  });

  it("refuses a file that is not one, rather than digesting rubbish", () => {
    expect(() => decodePng(new Uint8Array(32))).toThrow(/not a PNG/);
  });
});

describe("pictureDigest", () => {
  it("is the same for one picture written two ways", () => {
    const pixels = subject();
    const none = pictureDigest(writePng(4, 3, pixels, 0, 9));
    const up = pictureDigest(writePng(4, 3, pixels, 2, 1));
    expect(up).toBe(none);
  });

  it("moves when one channel of one pixel does", () => {
    const pixels = subject();
    const before = pictureDigest(writePng(4, 3, pixels, 0, 6));
    const nudged = Uint8Array.from(pixels);
    nudged[17] = ((nudged[17] ?? 0) + 1) & 0xff;
    expect(pictureDigest(writePng(4, 3, nudged, 0, 6))).not.toBe(before);
  });

  it("tells two pictures of the same bytes and different shapes apart", () => {
    const flat = new Uint8Array(4 * 4 * 3);
    for (let i = 0; i < flat.length; i++) flat[i] = i & 0xff;
    expect(pictureDigest(writePng(4, 3, flat, 0, 6))).not.toBe(
      pictureDigest(writePng(3, 4, flat, 0, 6)),
    );
  });
});

describe("pictureDiff", () => {
  it("says nothing about a pair that only the encoder wrote differently", () => {
    const pixels = subject();
    expect(pictureDiff(writePng(4, 3, pixels, 0, 9), writePng(4, 3, pixels, 2, 1))).toBe("");
  });

  it("names how much differs and where it starts", () => {
    const pixels = subject();
    const nudged = Uint8Array.from(pixels);
    // The blue channel of the pixel at x=1, y=1: row 1 is 16 bytes in.
    nudged[16 + 4 + 2] = ((nudged[16 + 4 + 2] ?? 0) + 9) & 0xff;
    const said = pictureDiff(writePng(4, 3, pixels, 0, 6), writePng(4, 3, nudged, 0, 6));
    expect(said).toContain("1 of 48 channel bytes differ");
    expect(said).toContain("x=1, y=1");
  });
});

/**
 * **And one a browser actually wrote**, because the synthetic ones above are
 * not enough on their own: every test in this file passed while the inflate
 * underneath refused a real screenshot outright (`png.ts` says which one and
 * why). The home-screen icon is the PNG this repository keeps that no test
 * writes — 192 square, and opaque, so it comes back three channels a pixel
 * rather than four.
 */
describe("a PNG from outside this file", () => {
  it("reads the icon the game ships", async () => {
    const path = join(import.meta.dir, "../../../apps/game/public/icon-192.png");
    const read = decodePng(await Bun.file(path).bytes());
    expect(read.width).toBe(192);
    expect(read.height).toBe(192);
    expect(read.pixels.length).toBe(192 * 192 * 3);
  });
});
