import { describe, expect, it } from "bun:test";
import { crc32, PNG_SIGNATURE, readChunks, writeChunk } from "../src/png.js";
import { encodeAnimatedWebp, readAnimatedWebpInfo, readRiffChunks } from "../src/webp.js";

/**
 * The container arithmetic, on its own.
 *
 * Both formats are length-prefixed chunk streams and both punish an off-by-one
 * silently: a PNG with a wrong CRC and a WebP with a missing pad byte are
 * files a decoder either refuses or, worse, reads past the end of. So the two
 * writers are checked against constants that come from the specifications
 * rather than from this repository — the CRC of an empty `IEND` is the one
 * every PNG in the world ends with — and the RIFF writer is checked with an
 * odd-length payload, which is the only case where the padding rule shows up.
 */

describe("PNG chunks", () => {
  it("computes the CRC every PNG's last chunk carries", () => {
    // 0xAE426082 is the CRC of `IEND` with no data — the same four bytes at
    // the end of every PNG file ever written.
    expect(crc32(new Uint8Array([73, 69, 78, 68]))).toBe(0xae426082);
  });

  it("writes a chunk that reads back as itself", () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const file = new Uint8Array([...PNG_SIGNATURE, ...writeChunk("teST", data)]);
    const [chunk] = readChunks(file);
    expect(chunk?.type).toBe("teST");
    expect([...(chunk?.data ?? [])]).toEqual([1, 2, 3, 4, 5]);
  });

  it("refuses anything that is not a PNG", () => {
    expect(() => readChunks(new Uint8Array(16))).toThrow(/signature/);
  });
});

describe("RIFF chunks", () => {
  /** A still WebP small enough to write by hand: header, then a `VP8 ` chunk
   * with an odd payload, so the pad byte is in play. */
  function fakeStill(width: number, height: number, payload: number[]): Uint8Array {
    const vp8 = new Uint8Array(10 + payload.length);
    new DataView(vp8.buffer).setUint16(6, width, true);
    new DataView(vp8.buffer).setUint16(8, height, true);
    vp8.set(payload, 10);
    const body = new Uint8Array(8 + vp8.length + (vp8.length & 1));
    for (let i = 0; i < 4; i++) body[i] = "VP8 ".charCodeAt(i);
    new DataView(body.buffer).setUint32(4, vp8.length, true);
    body.set(vp8, 8);
    const file = new Uint8Array(12 + body.length);
    for (let i = 0; i < 4; i++) file[i] = "RIFF".charCodeAt(i);
    new DataView(file.buffer).setUint32(4, 4 + body.length, true);
    for (let i = 0; i < 4; i++) file[8 + i] = "WEBP".charCodeAt(i);
    file.set(body, 12);
    return file;
  }

  it("keeps an odd-length chunk parseable by padding it", () => {
    const still = fakeStill(8, 8, [9, 9, 9]);
    const animated = encodeAnimatedWebp([
      { webp: still, durationMs: 40 },
      { webp: still, durationMs: 40 },
    ]);
    const types = readRiffChunks(animated).map((c) => c.type);
    expect(types).toEqual(["VP8X", "ANIM", "ANMF", "ANMF"]);
    expect(readAnimatedWebpInfo(animated)).toEqual({
      frames: 2,
      loops: 0,
      durationsMs: [40, 40],
    });
  });

  it("refuses frames that disagree about size", () => {
    expect(() =>
      encodeAnimatedWebp([
        { webp: fakeStill(8, 8, [1]), durationMs: 40 },
        { webp: fakeStill(9, 8, [1]), durationMs: 40 },
      ]),
    ).toThrow(/does not match/);
  });
});
