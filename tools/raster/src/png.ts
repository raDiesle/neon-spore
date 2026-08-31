/**
 * The parts of the PNG container an animator needs, and nothing else.
 *
 * A still PNG is a signature followed by length-prefixed, CRC-checked chunks;
 * an APNG is the same file with three more chunk types in it. So building one
 * needs no image codec at all — the pixels arrive already compressed, inside
 * the `IDAT` of a still frame a browser encoded for us, and this file only
 * has to take those chunks apart and put them back in a different order.
 *
 * That is the whole reason `tools/raster` has no dependency: encoding pixels
 * is hard and somebody already did it, while rearranging chunks is arithmetic.
 */

/** The eight bytes every PNG starts with. */
export const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

export interface Chunk {
  /** Four ASCII characters — `IHDR`, `IDAT`, `acTL`, and the rest. */
  type: string;
  /** The chunk's payload, without the length, the type or the CRC. */
  data: Uint8Array;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

/** PNG's CRC-32, over the chunk type and the chunk data together. */
export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]!) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Splits a PNG file into its chunks, in file order. Throws on a bad signature. */
export function readChunks(file: Uint8Array): Chunk[] {
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (file[i] !== PNG_SIGNATURE[i]) throw new Error("not a PNG: signature mismatch");
  }
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
  const chunks: Chunk[] = [];
  let at = PNG_SIGNATURE.length;
  while (at + 8 <= file.length) {
    const length = view.getUint32(at);
    const type = String.fromCharCode(file[at + 4]!, file[at + 5]!, file[at + 6]!, file[at + 7]!);
    const data = file.subarray(at + 8, at + 8 + length);
    chunks.push({ type, data });
    at += 12 + length;
    if (type === "IEND") break;
  }
  return chunks;
}

/** One chunk as bytes: length, type, data, CRC. */
export function writeChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

export interface Ihdr {
  width: number;
  height: number;
  bitDepth: number;
  colourType: number;
}

/** The header every frame of an animation has to agree on. */
export function readIhdr(chunks: Chunk[]): Ihdr {
  const ihdr = chunks.find((c) => c.type === "IHDR");
  if (!ihdr) throw new Error("PNG has no IHDR");
  const view = new DataView(ihdr.data.buffer, ihdr.data.byteOffset, ihdr.data.byteLength);
  return {
    width: view.getUint32(0),
    height: view.getUint32(4),
    bitDepth: ihdr.data[8]!,
    colourType: ihdr.data[9]!,
  };
}

/** Every `IDAT` of one still frame, run together — a PNG may split them. */
export function joinIdat(chunks: Chunk[]): Uint8Array {
  const parts = chunks.filter((c) => c.type === "IDAT");
  const total = parts.reduce((n, c) => n + c.data.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const part of parts) {
    out.set(part.data, at);
    at += part.data.length;
  }
  return out;
}

/** Concatenates byte runs — used everywhere a container is assembled. */
export function concat(parts: readonly Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}
