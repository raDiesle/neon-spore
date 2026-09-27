import { describe, expect, it } from "bun:test";
import { PAINTED_STRIPS, STRIP_NAMES } from "@neon-spore/render";
import { readApngInfo } from "../src/apng.js";
import { STRIPS } from "../src/spec.js";
import { readWebpSize } from "../src/webp.js";

/**
 * Every painted strip `strip-bake.ts` writes under `assets/raster/`, read back
 * as bytes — `assets.test.ts`'s two failures, for each atlas after the burst:
 * a constant that never reached the slicer, and a file written half.
 *
 * And the one number their queue entries set: **each atlas stays under
 * 90 kB**, because it is the only file of the three the field fetches.
 */

const dir = new URL("../../../assets/raster/", import.meta.url);
const load = async (name: string): Promise<Uint8Array> =>
  new Uint8Array(await Bun.file(Bun.fileURLToPath(new URL(name, dir))).arrayBuffer());

const BUDGET_BYTES = 90 * 1024;

interface Manifest {
  frames: number;
  frameSize: number;
  frameMs: number;
  seed: number;
  bytes: { strip: number; apng: number };
}

const manifests = new Map<string, Manifest>();
for (const name of STRIP_NAMES) {
  const file = Bun.file(Bun.fileURLToPath(new URL(`${name}.json`, dir)));
  manifests.set(name, (await file.json()) as Manifest);
}

for (const name of STRIP_NAMES) {
  const spec = STRIPS[name];
  const manifest = manifests.get(name) as Manifest;
  describe(`the painted strip ${name}`, () => {
    it("is described by the same numbers the generator holds", () => {
      expect(manifest.frames).toBe(spec.frames);
      expect(manifest.frameSize).toBe(spec.size);
      expect(manifest.frameMs).toBe(spec.frameMs);
      expect(manifest.seed).toBe(spec.seed);
    });

    /**
     * The generator's numbers are read off the renderer's table, so the check
     * that still bites is the bytes: a row changed without `bun run raster`
     * leaves a manifest the renderer would slice wrong.
     */
    it("was baked from the row the renderer slices it with", () => {
      expect(manifest).toMatchObject(PAINTED_STRIPS[name]);
    });

    it("ships a lossless APNG master of every frame", async () => {
      const info = readApngInfo(await load(`${name}.apng`));
      expect(info.frames).toBe(spec.frames);
      expect(info.delaysMs).toEqual(Array.from({ length: spec.frames }, () => spec.frameMs));
    });

    it("ships an atlas exactly as wide as its frames, and under its budget", async () => {
      const strip = await load(`${name}-strip.webp`);
      expect(readWebpSize(strip)).toEqual({ width: spec.size * spec.frames, height: spec.size });
      expect(strip.length).toBe(manifest.bytes.strip);
      expect(strip.length).toBeLessThan(BUDGET_BYTES);
    });
  });
}
