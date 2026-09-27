import { describe, expect, it } from "bun:test";
import { VISE_CRACK_SHEET } from "@neon-spore/render";
import { readApngInfo } from "../src/apng.js";
import { VISE_CRACK } from "../src/spec.js";
import { readWebpSize } from "../src/webp.js";

/**
 * THE VISE's painted crack as committed under `assets/raster/`, read back as
 * bytes — `assets.test.ts`'s two failures, for the second atlas: a constant
 * that never reached the slicer, and a file written half.
 *
 * And the one number the queue entry set: **the atlas stays under 90 kB**,
 * because it is the only file of the three the field fetches.
 */

const dir = new URL("../../../assets/raster/", import.meta.url);
const load = async (name: string): Promise<Uint8Array> =>
  new Uint8Array(await Bun.file(Bun.fileURLToPath(new URL(name, dir))).arrayBuffer());

const manifest = (await Bun.file(Bun.fileURLToPath(new URL("vise-crack.json", dir))).json()) as {
  frames: number;
  frameSize: number;
  frameMs: number;
  seed: number;
  bytes: { strip: number; apng: number };
};

const BUDGET_BYTES = 90 * 1024;

describe("THE VISE's painted crack", () => {
  it("is described by the same numbers the generator holds", () => {
    expect(manifest.frames).toBe(VISE_CRACK.frames);
    expect(manifest.frameSize).toBe(VISE_CRACK.size);
    expect(manifest.frameMs).toBe(VISE_CRACK.frameMs);
    expect(manifest.seed).toBe(VISE_CRACK.seed);
  });

  it("is sliced by the renderer with those same numbers", () => {
    expect(VISE_CRACK_SHEET.frames).toBe(VISE_CRACK.frames);
    expect(VISE_CRACK_SHEET.frameSize).toBe(VISE_CRACK.size);
    expect(VISE_CRACK_SHEET.frameMs).toBe(VISE_CRACK.frameMs);
  });

  it("ships a lossless APNG master of every frame", async () => {
    const info = readApngInfo(await load("vise-crack.apng"));
    expect(info.frames).toBe(VISE_CRACK.frames);
    expect(info.delaysMs).toEqual(
      Array.from({ length: VISE_CRACK.frames }, () => VISE_CRACK.frameMs),
    );
  });

  it("ships an atlas exactly as wide as its frames, and under its budget", async () => {
    const strip = await load("vise-crack-strip.webp");
    expect(readWebpSize(strip)).toEqual({
      width: VISE_CRACK.size * VISE_CRACK.frames,
      height: VISE_CRACK.size,
    });
    expect(strip.length).toBe(manifest.bytes.strip);
    expect(strip.length).toBeLessThan(BUDGET_BYTES);
  });
});
