import { concat, joinIdat, PNG_SIGNATURE, readChunks, readIhdr, writeChunk } from "./png.js";

/**
 * An APNG, assembled from still PNGs a browser already encoded.
 *
 * The format is PNG plus three chunks. `acTL` says how many frames there are
 * and how many times to play them; `fcTL` sits in front of each frame and
 * carries its rectangle, its delay and what to do with the canvas afterwards;
 * `fdAT` is an `IDAT` with a sequence number glued to the front. Every `fcTL`
 * and `fdAT` shares one counter, and a decoder that finds a gap in it stops.
 *
 * The first frame is a special case with a use. If its `fcTL` comes *before*
 * the `IDAT`, the still image is frame one and every decoder shows something.
 * If it comes after, the `IDAT` is a fallback nobody animating will ever
 * draw — which is exactly how the probe in `packages/render/src/raster-caps.ts`
 * tells the two kinds of decoder apart.
 */

export interface ApngFrame {
  /** A complete still PNG. Every frame must share width, height and format. */
  png: Uint8Array;
  /** How long it holds, in milliseconds. */
  delayMs: number;
}

export interface ApngOptions {
  /** 0 loops forever, which is what a game asset wants. */
  plays?: number;
  /**
   * When true the still image is a fallback outside the animation, and the
   * animation is one frame shorter than the file looks. Only the capability
   * probe wants this; a real asset wants the default.
   */
  stillIsFallback?: boolean;
  /** Millisecond denominator for the delay fraction. 1000 keeps it readable. */
  delayDen?: number;
}

const DISPOSE_BACKGROUND = 1;
const BLEND_SOURCE = 0;

function acTl(frames: number, plays: number): Uint8Array {
  const data = new Uint8Array(8);
  const view = new DataView(data.buffer);
  view.setUint32(0, frames);
  view.setUint32(4, plays);
  return writeChunk("acTL", data);
}

function fcTl(
  seq: number,
  width: number,
  height: number,
  delayMs: number,
  den: number,
): Uint8Array {
  const data = new Uint8Array(26);
  const view = new DataView(data.buffer);
  view.setUint32(0, seq);
  view.setUint32(4, width);
  view.setUint32(8, height);
  view.setUint32(12, 0);
  view.setUint32(16, 0);
  view.setUint16(20, Math.round((delayMs * den) / 1000));
  view.setUint16(22, den);
  data[24] = DISPOSE_BACKGROUND;
  data[25] = BLEND_SOURCE;
  return writeChunk("fcTL", data);
}

function fdAt(seq: number, idat: Uint8Array): Uint8Array {
  const data = new Uint8Array(4 + idat.length);
  new DataView(data.buffer).setUint32(0, seq);
  data.set(idat, 4);
  return writeChunk("fdAT", data);
}

/**
 * Frames in, one APNG out. Throws rather than producing a file that decodes
 * to nonsense: a frame of a different size or colour type cannot be animated
 * with the others, and a decoder given one shows garbage rather than an error.
 */
export function encodeApng(frames: readonly ApngFrame[], options: ApngOptions = {}): Uint8Array {
  if (frames.length === 0) throw new Error("an APNG needs at least one frame");
  const plays = options.plays ?? 0;
  const den = options.delayDen ?? 1000;
  const stillIsFallback = options.stillIsFallback ?? false;

  const parsed = frames.map((frame) => {
    const chunks = readChunks(frame.png);
    return { chunks, ihdr: readIhdr(chunks), idat: joinIdat(chunks), delayMs: frame.delayMs };
  });
  const first = parsed[0]!.ihdr;
  for (const frame of parsed) {
    const h = frame.ihdr;
    if (h.width !== first.width || h.height !== first.height) {
      throw new Error(
        `frame size ${h.width}x${h.height} does not match ${first.width}x${first.height}`,
      );
    }
    if (h.bitDepth !== first.bitDepth || h.colourType !== first.colourType) {
      throw new Error("frames disagree about bit depth or colour type");
    }
  }

  const head = parsed[0]!.chunks;
  const out: Uint8Array[] = [PNG_SIGNATURE];
  for (const chunk of head) {
    if (chunk.type === "IHDR" || chunk.type === "PLTE" || chunk.type === "tRNS") {
      out.push(writeChunk(chunk.type, chunk.data));
    }
  }
  out.push(acTl(stillIsFallback ? parsed.length - 1 : parsed.length, plays));

  let seq = 0;
  if (!stillIsFallback) out.push(fcTl(seq++, first.width, first.height, parsed[0]!.delayMs, den));
  out.push(writeChunk("IDAT", parsed[0]!.idat));

  for (const frame of parsed.slice(1)) {
    out.push(fcTl(seq++, first.width, first.height, frame.delayMs, den));
    out.push(fdAt(seq++, frame.idat));
  }
  out.push(writeChunk("IEND", new Uint8Array(0)));
  return concat(out);
}

/** What a decoder would find: how many frames the file claims, and the delays. */
export function readApngInfo(file: Uint8Array): {
  frames: number;
  plays: number;
  delaysMs: number[];
} {
  const chunks = readChunks(file);
  const actl = chunks.find((c) => c.type === "acTL");
  if (!actl) throw new Error("not an APNG: no acTL");
  const head = new DataView(actl.data.buffer, actl.data.byteOffset, actl.data.byteLength);
  const delaysMs = chunks
    .filter((c) => c.type === "fcTL")
    .map((c) => {
      const view = new DataView(c.data.buffer, c.data.byteOffset, c.data.byteLength);
      const den = view.getUint16(22) || 100;
      return Math.round((view.getUint16(20) * 1000) / den);
    });
  return { frames: head.getUint32(0), plays: head.getUint32(4), delaysMs };
}
