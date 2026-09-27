import { encodeApng } from "./apng.js";
import { renderStrip, type StripPainter, type StripSpec } from "./render-strip.js";

/**
 * One painted strip, baked and packed: the atlas the field fetches
 * (`<name>-strip.webp`), the lossless APNG master (`<name>.apng`), and the
 * manifest its assets test holds against the renderer's sheet
 * (`<name>.json`). `run.ts` writes what this returns. THE VISE's crack and
 * THE RIME's clearing go through here; the burst has extras of its own
 * (`render.ts`).
 */
export async function bakeStrip(
  name: string,
  draw: StripPainter,
  spec: StripSpec & { frameMs: number },
): Promise<{ name: string; bytes: Uint8Array | string }[]> {
  const rendered = await renderStrip(draw, spec);
  const apng = encodeApng(
    rendered.png.map((png) => ({ png, delayMs: spec.frameMs })),
    { plays: 0 },
  );
  const manifest = {
    frames: spec.frames,
    frameSize: spec.size,
    frameMs: spec.frameMs,
    seed: spec.seed,
    bytes: { strip: rendered.strip.length, apng: apng.length },
  };
  return [
    { name: `${name}-strip.webp`, bytes: rendered.strip },
    { name: `${name}.apng`, bytes: apng },
    { name: `${name}.json`, bytes: `${JSON.stringify(manifest, null, 2)}\n` },
  ];
}
