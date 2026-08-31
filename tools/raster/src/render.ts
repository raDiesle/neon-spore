import { findChrome } from "@neon-spore/frames/capture.js";
import { chromium } from "playwright-core";
import { drawBurstFrame } from "./burst-art.js";

/**
 * Draws the burst in a real browser and brings the bytes back.
 *
 * A browser is used as the encoder rather than a library because it already
 * carries both of the ones this needs — PNG and lossy WebP with an alpha
 * plane — and because the canvas that draws the frame is the same canvas the
 * game draws on. A generator that painted through some other 2D
 * implementation would be answering a question about that implementation.
 *
 * `drawBurstFrame` travels into the page as source text, which is why it may
 * not reference anything outside itself; `burst-art.ts` says so at the top.
 */

export interface BurstSpec {
  /** Side of one square frame, in pixels. */
  size: number;
  /** How many frames the whole burst lasts. */
  frames: number;
  /** Spikes in the crown. */
  spikes: number;
  /** Seeds the angle and length jitter — same seed, same asset. */
  seed: number;
}

export interface RenderedBurst {
  /** One still PNG per frame, in order. */
  png: Uint8Array[];
  /** The same frames as still WebPs. */
  webp: Uint8Array[];
  /**
   * Every frame side by side in one lossy WebP with an alpha plane — the
   * atlas the game draws from. There is no PNG twin of it: at this size PNG
   * is four times the bytes for a soft glow nobody can tell apart, and the
   * APNG built from the same frames is already the lossless master.
   */
  strip: Uint8Array;
  /** A 1x2 PNG that is opaque, and the animation frame whose lower pixel is not. */
  probePng: { still: Uint8Array; animated: Uint8Array };
  /** Two 8x8 stills, for an animated WebP small enough to inline. */
  probeWebp: Uint8Array[];
}

const dataUrlToBytes = (url: string): Uint8Array =>
  Uint8Array.from(atob(url.slice(url.indexOf(",") + 1)), (c) => c.charCodeAt(0));

/** Opens one headless page, draws everything in it, and closes it again. */
export async function renderBurst(spec: BurstSpec): Promise<RenderedBurst> {
  const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent("<!doctype html><meta charset=utf-8><title>burst</title>");
    await page.addScriptTag({ content: `window.__drawBurstFrame = ${drawBurstFrame.toString()};` });

    const shot = await page.evaluate((s: BurstSpec) => {
      const draw = (window as unknown as { __drawBurstFrame: typeof drawBurstFrame })
        .__drawBurstFrame;
      const make = (w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        return [canvas, ctx];
      };

      const png: string[] = [];
      const webp: string[] = [];
      const [stripCanvas, stripCtx] = make(s.size * s.frames, s.size);
      for (let i = 0; i < s.frames; i++) {
        const t = s.frames === 1 ? 0 : i / (s.frames - 1);
        const [canvas, ctx] = make(s.size, s.size);
        draw(ctx, { size: s.size, t, spikes: s.spikes, seed: s.seed });
        png.push(canvas.toDataURL("image/png"));
        webp.push(canvas.toDataURL("image/webp", 0.85));
        stripCtx.drawImage(canvas, i * s.size, 0);
      }

      const [, probeCtx] = make(1, 2);
      probeCtx.fillStyle = "#ff00ff";
      probeCtx.fillRect(0, 0, 1, 2);
      const probeStill = probeCtx.canvas.toDataURL("image/png");
      probeCtx.clearRect(0, 1, 1, 1);
      const probeAnimated = probeCtx.canvas.toDataURL("image/png");

      const probeWebp: string[] = [];
      for (const colour of ["#ff2fd4", "#2fe0f0"]) {
        const [c, ctx] = make(8, 8);
        ctx.fillStyle = colour;
        ctx.fillRect(0, 0, 8, 8);
        probeWebp.push(c.toDataURL("image/webp", 0.9));
      }

      return {
        png,
        webp,
        strip: stripCanvas.toDataURL("image/webp", 0.85),
        probeStill,
        probeAnimated,
        probeWebp,
      };
    }, spec);

    return {
      png: shot.png.map(dataUrlToBytes),
      webp: shot.webp.map(dataUrlToBytes),
      strip: dataUrlToBytes(shot.strip),
      probePng: {
        still: dataUrlToBytes(shot.probeStill),
        animated: dataUrlToBytes(shot.probeAnimated),
      },
      probeWebp: shot.probeWebp.map(dataUrlToBytes),
    };
  } finally {
    await browser.close();
  }
}
