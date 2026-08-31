import { ANIMATED_WEBP_PROBE, APNG_PROBE } from "./raster-probe.js";

/**
 * What the browser in front of us can actually do with a baked animation.
 *
 * Feature-tested by decoding two tiny images rather than read off a user-agent
 * string, because the question is not which browser this is but whether this
 * build of it animates the file we are about to hand it — and that has changed
 * under every one of them at least once. `tools/raster/run.ts` generates both
 * probes with the same encoder that makes the real assets, so a bug in the
 * encoder shows up here as a failed capability rather than as a silently
 * wrong picture.
 *
 * Nothing on the field depends on any of this. The atlas the game draws from
 * is a still image, which every browser has decoded for twenty years; these
 * flags decide what a *page* — the director's RASTER sheet, a menu, a
 * briefing — may put in an `<img>`, and whether frame-accurate decoding is
 * available at all.
 */
export interface RasterCaps {
  /** An `<img>` will play an APNG rather than showing its still fallback. */
  apng: boolean;
  /** An `<img>` will decode an animated WebP at all. */
  animatedWebp: boolean;
  /**
   * WebCodecs' `ImageDecoder`, the only way to ask an animated file for frame
   * *n* instead of letting the wall clock choose. Without it an APNG or an
   * animated WebP cannot be driven by a tick, which is why the field uses an
   * atlas and not either of them.
   */
  imageDecoder: boolean;
  /** `createImageBitmap`, so the atlas can be decoded off the main thread. */
  imageBitmap: boolean;
}

function loadProbe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * The APNG probe is 1x2: opaque in both pixels as a still, transparent in the
 * lower one as an animation. Drawing it and reading that one alpha value
 * separates a decoder that animates from one that does not.
 */
async function detectApng(): Promise<boolean> {
  const img = await loadProbe(APNG_PROBE);
  if (!img) return false;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 2;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 1, 1, 1).data[3] === 0;
}

/**
 * WebP has no still fallback inside the file, so a decoder that cannot
 * animate cannot decode the probe at all. Loading is the whole test.
 */
async function detectAnimatedWebp(): Promise<boolean> {
  const img = await loadProbe(ANIMATED_WEBP_PROBE);
  return img !== null && img.naturalWidth === 8;
}

/** Runs both probes once. Cheap — the two images are under 400 bytes together. */
export async function detectRasterCaps(): Promise<RasterCaps> {
  const [apng, animatedWebp] = await Promise.all([detectApng(), detectAnimatedWebp()]);
  return {
    apng,
    animatedWebp,
    imageDecoder: typeof (globalThis as { ImageDecoder?: unknown }).ImageDecoder === "function",
    imageBitmap: typeof globalThis.createImageBitmap === "function",
  };
}
