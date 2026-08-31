import { concat } from "./png.js";

/**
 * An animated WebP, assembled from still WebPs a browser already encoded.
 *
 * Same trick as `apng.ts` and the same reason: WebP is a RIFF file, so the
 * animation is a container question rather than a codec one. A still lossy
 * WebP with transparency is `VP8X` (the extended header) plus `ALPH` (the
 * alpha plane) plus `VP8 ` (the colour); an animated one keeps one `VP8X` for
 * the whole file, adds an `ANIM` chunk, and then wraps each frame's own
 * `ALPH`/`VP8 ` payload in an `ANMF`.
 *
 * The one trap is that RIFF chunks are padded to an even length and the pad
 * byte is *not* counted in the chunk's own size field but *is* counted by
 * everything containing it. Getting that wrong produces a file that Chromium
 * shows and Safari refuses, which is the worst kind of wrong.
 *
 * Unlike a PNG there is no still fallback inside the file: a decoder that
 * cannot animate cannot show anything at all. That is what makes the
 * capability probe for this format the simplest of the two — if it loads, it
 * animates.
 */

export interface WebpFrame {
  /** A complete still WebP, as a browser's `toDataURL("image/webp")` gives it. */
  webp: Uint8Array;
  /** How long it holds, in milliseconds. */
  durationMs: number;
}

interface RiffChunk {
  type: string;
  data: Uint8Array;
}

function ascii(bytes: Uint8Array, at: number): string {
  return String.fromCharCode(bytes[at]!, bytes[at + 1]!, bytes[at + 2]!, bytes[at + 3]!);
}

/** The chunks inside a RIFF/WEBP file, in order, with the padding stripped. */
export function readRiffChunks(file: Uint8Array): RiffChunk[] {
  if (ascii(file, 0) !== "RIFF" || ascii(file, 8) !== "WEBP") throw new Error("not a WebP file");
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
  const chunks: RiffChunk[] = [];
  let at = 12;
  while (at + 8 <= file.length) {
    const type = ascii(file, at);
    const size = view.getUint32(at + 4, true);
    chunks.push({ type, data: file.subarray(at + 8, at + 8 + size) });
    at += 8 + size + (size & 1);
  }
  return chunks;
}

function writeRiffChunk(type: string, data: Uint8Array): Uint8Array {
  const padded = data.length + (data.length & 1);
  const out = new Uint8Array(8 + padded);
  for (let i = 0; i < 4; i++) out[i] = type.charCodeAt(i);
  new DataView(out.buffer).setUint32(4, data.length, true);
  out.set(data, 8);
  return out;
}

function uint24(view: DataView, at: number, value: number): void {
  view.setUint8(at, value & 0xff);
  view.setUint8(at + 1, (value >> 8) & 0xff);
  view.setUint8(at + 2, (value >> 16) & 0xff);
}

/** Width and height of a still WebP, read out of its `VP8X` or `VP8 ` header. */
export function readWebpSize(file: Uint8Array): { width: number; height: number } {
  const chunks = readRiffChunks(file);
  const vp8x = chunks.find((c) => c.type === "VP8X");
  if (vp8x) {
    const d = vp8x.data;
    return {
      width: (d[4]! | (d[5]! << 8) | (d[6]! << 16)) + 1,
      height: (d[7]! | (d[8]! << 8) | (d[9]! << 16)) + 1,
    };
  }
  const vp8 = chunks.find((c) => c.type === "VP8 ");
  if (!vp8) throw new Error("WebP carries neither VP8X nor VP8");
  const view = new DataView(vp8.data.buffer, vp8.data.byteOffset, vp8.data.byteLength);
  return { width: view.getUint16(6, true) & 0x3fff, height: view.getUint16(8, true) & 0x3fff };
}

const FLAG_ANIMATION = 0x02;
const FLAG_ALPHA = 0x10;
/** Bit 1 is the blending method (1 = overwrite), bit 0 the disposal (1 = clear). */
const ANMF_FLAGS = 0x03;

/** Frames in, one animated WebP out. */
export function encodeAnimatedWebp(frames: readonly WebpFrame[], loops = 0): Uint8Array {
  if (frames.length === 0) throw new Error("an animated WebP needs at least one frame");
  const { width, height } = readWebpSize(frames[0]!.webp);

  const vp8xData = new Uint8Array(10);
  const vp8xView = new DataView(vp8xData.buffer);
  vp8xView.setUint8(0, FLAG_ANIMATION | FLAG_ALPHA);
  uint24(vp8xView, 4, width - 1);
  uint24(vp8xView, 7, height - 1);

  const animData = new Uint8Array(6);
  const animView = new DataView(animData.buffer);
  animView.setUint32(0, 0, true);
  animView.setUint16(4, loops, true);

  const body: Uint8Array[] = [writeRiffChunk("VP8X", vp8xData), writeRiffChunk("ANIM", animData)];

  for (const frame of frames) {
    const size = readWebpSize(frame.webp);
    if (size.width !== width || size.height !== height) {
      throw new Error(`frame size ${size.width}x${size.height} does not match ${width}x${height}`);
    }
    const payload = readRiffChunks(frame.webp)
      .filter((c) => c.type === "ALPH" || c.type === "VP8 " || c.type === "VP8L")
      .map((c) => writeRiffChunk(c.type, c.data));

    const header = new Uint8Array(16);
    const headerView = new DataView(header.buffer);
    uint24(headerView, 0, 0);
    uint24(headerView, 3, 0);
    uint24(headerView, 6, width - 1);
    uint24(headerView, 9, height - 1);
    uint24(headerView, 12, frame.durationMs);
    headerView.setUint8(15, ANMF_FLAGS);
    body.push(writeRiffChunk("ANMF", concat([header, ...payload])));
  }

  const payload = concat(body);
  const out = new Uint8Array(12 + payload.length);
  for (let i = 0; i < 4; i++) out[i] = "RIFF".charCodeAt(i);
  new DataView(out.buffer).setUint32(4, 4 + payload.length, true);
  for (let i = 0; i < 4; i++) out[8 + i] = "WEBP".charCodeAt(i);
  out.set(payload, 12);
  return out;
}

/** What a decoder would find: the frame count, the loop count and the delays. */
export function readAnimatedWebpInfo(file: Uint8Array): {
  frames: number;
  loops: number;
  durationsMs: number[];
} {
  const chunks = readRiffChunks(file);
  const anim = chunks.find((c) => c.type === "ANIM");
  if (!anim) throw new Error("not an animated WebP: no ANIM chunk");
  const animView = new DataView(anim.data.buffer, anim.data.byteOffset, anim.data.byteLength);
  const anmf = chunks.filter((c) => c.type === "ANMF");
  const durationsMs = anmf.map((c) => c.data[12]! | (c.data[13]! << 8) | (c.data[14]! << 16));
  return { frames: anmf.length, loops: animView.getUint16(4, true), durationsMs };
}
