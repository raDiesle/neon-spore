import { encodeApng } from "./apng.js";
import { renderStrip } from "./render-strip.js";
import { VISE_CRACK } from "./spec.js";
import { drawViseCrackFrame } from "./vise-crack-art.js";

/**
 * THE VISE's kernel crack, painted and packed: the atlas the field fetches,
 * the lossless APNG master, and the manifest `tools/raster/test/assets.test.ts`
 * holds against `VISE_CRACK_SHEET`. `run.ts` writes what this returns.
 */
export async function bakeViseCrack(): Promise<{ name: string; bytes: Uint8Array | string }[]> {
  const rendered = await renderStrip(drawViseCrackFrame, VISE_CRACK);
  const apng = encodeApng(
    rendered.png.map((png) => ({ png, delayMs: VISE_CRACK.frameMs })),
    { plays: 0 },
  );
  const manifest = {
    frames: VISE_CRACK.frames,
    frameSize: VISE_CRACK.size,
    frameMs: VISE_CRACK.frameMs,
    seed: VISE_CRACK.seed,
    bytes: { strip: rendered.strip.length, apng: apng.length },
  };
  return [
    { name: "vise-crack-strip.webp", bytes: rendered.strip },
    { name: "vise-crack.apng", bytes: apng },
    { name: "vise-crack.json", bytes: `${JSON.stringify(manifest, null, 2)}\n` },
  ];
}
