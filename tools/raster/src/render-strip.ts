import { closeBrowser, launchBrowser } from "@neon-spore/frames/capture.js";
import { dataUrlToBytes } from "./render.js";

/**
 * Draws any painted effect into a strip in a real browser, and brings the
 * bytes back — `render.ts`'s pass without the burst's own extras (the still
 * WebPs, the decoder probes), for every atlas after the first.
 *
 * `draw` travels into the page as source text, so it may reference nothing
 * outside its own body (`burst-art.ts` says why).
 */

export interface StripSpec {
  /** Side of one square frame, in pixels. */
  size: number;
  /** How many frames the whole effect lasts. */
  frames: number;
  /** Seeds the painter's jitter — same seed, same asset. */
  seed: number;
}

export type StripPainter = (
  ctx: CanvasRenderingContext2D,
  options: { size: number; t: number; seed: number },
) => void;

export interface RenderedStrip {
  /** One still PNG per frame, in order — the APNG master is built from these. */
  png: Uint8Array[];
  /** Every frame side by side in one lossy WebP with alpha: the atlas. */
  strip: Uint8Array;
}

export async function renderStrip(draw: StripPainter, spec: StripSpec): Promise<RenderedStrip> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent("<!doctype html><meta charset=utf-8><title>strip</title>");
    await page.addScriptTag({ content: `window.__paint = ${draw.toString()};` });
    const shot = await page.evaluate((s: StripSpec) => {
      const paint = (window as unknown as { __paint: StripPainter }).__paint;
      const make = (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        return [canvas, ctx];
      };
      const png: string[] = [];
      const [stripCanvas, stripCtx] = make(s.size * s.frames, s.size);
      for (let i = 0; i < s.frames; i++) {
        const t = s.frames === 1 ? 0 : i / (s.frames - 1);
        const [canvas, ctx] = make(s.size, s.size);
        paint(ctx, { size: s.size, t, seed: s.seed });
        png.push(canvas.toDataURL("image/png"));
        stripCtx.drawImage(canvas, i * s.size, 0);
      }
      return { png, strip: stripCanvas.toDataURL("image/webp", 0.85) };
    }, spec);
    return { png: shot.png.map(dataUrlToBytes), strip: dataUrlToBytes(shot.strip) };
  } finally {
    await closeBrowser(browser);
  }
}
