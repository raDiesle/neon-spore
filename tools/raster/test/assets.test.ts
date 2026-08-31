import { describe, expect, it } from "bun:test";
import { BURST_SHEET } from "@neon-spore/render";
import { readApngInfo } from "../src/apng.js";
import { BURST } from "../src/spec.js";
import { readAnimatedWebpInfo, readWebpSize } from "../src/webp.js";

/**
 * What is actually committed under `assets/raster/`, read back as bytes.
 *
 * Two things go wrong with a generated binary in a repository and neither one
 * announces itself. It can be regenerated with a changed constant and
 * committed without the constant reaching the code that draws it — so the
 * atlas here is checked against `BURST_SHEET`, which is what
 * `packages/render/src/sprite-burst.ts` slices the strip with, and a mismatch
 * there is a game drawing frame 17 of a 16-frame strip. And it can be
 * committed truncated or half-written, which every check above this line would
 * pass and a decoder would not.
 *
 * `bun run raster:verify` is the other half: this reads the containers, that
 * one asks a browser whether it agrees.
 */

const dir = new URL("../../../assets/raster/", import.meta.url);
const load = async (name: string): Promise<Uint8Array> =>
  new Uint8Array(await Bun.file(Bun.fileURLToPath(new URL(name, dir))).arrayBuffer());

const manifest = (await Bun.file(Bun.fileURLToPath(new URL("burst.json", dir))).json()) as {
  frames: number;
  frameSize: number;
  frameMs: number;
  seed: number;
  spikes: number;
};

describe("the generated burst", () => {
  it("is described by the same numbers the generator holds", () => {
    expect(manifest.frames).toBe(BURST.frames);
    expect(manifest.frameSize).toBe(BURST.size);
    expect(manifest.frameMs).toBe(BURST.frameMs);
    expect(manifest.seed).toBe(BURST.seed);
    expect(manifest.spikes).toBe(BURST.spikes);
  });

  it("is sliced by the renderer with those same numbers", () => {
    expect(BURST_SHEET.frames).toBe(BURST.frames);
    expect(BURST_SHEET.frameSize).toBe(BURST.size);
    expect(BURST_SHEET.frameMs).toBe(BURST.frameMs);
  });

  it("ships an APNG of every frame, looping forever", async () => {
    const info = readApngInfo(await load("burst.apng"));
    expect(info.frames).toBe(BURST.frames);
    expect(info.plays).toBe(0);
    expect(info.delaysMs).toEqual(Array.from({ length: BURST.frames }, () => BURST.frameMs));
  });

  it("ships an animated WebP of every frame, looping forever", async () => {
    const info = readAnimatedWebpInfo(await load("burst.webp"));
    expect(info.frames).toBe(BURST.frames);
    expect(info.loops).toBe(0);
    expect(info.durationsMs).toEqual(Array.from({ length: BURST.frames }, () => BURST.frameMs));
  });

  it("ships an atlas exactly as wide as its frames laid side by side", async () => {
    expect(readWebpSize(await load("burst-strip.webp"))).toEqual({
      width: BURST.size * BURST.frames,
      height: BURST.size,
    });
  });
});

describe("the capability probes", () => {
  it("are small enough to inline, and are what they claim to be", async () => {
    const { ANIMATED_WEBP_PROBE, APNG_PROBE } = await import(
      "../../../packages/render/src/raster-probe.js"
    );
    expect(APNG_PROBE.startsWith("data:image/png;base64,")).toBe(true);
    expect(ANIMATED_WEBP_PROBE.startsWith("data:image/webp;base64,")).toBe(true);
    // Under a kilobyte together: they are inlined into the bundle, so their
    // cost is paid by every load whether or not anything asks the question.
    expect(APNG_PROBE.length + ANIMATED_WEBP_PROBE.length).toBeLessThan(1024);
  });
});
