#!/usr/bin/env bun

/**
 * **A STRIP OF FRAMES AS ONE PICTURE**, so a scene can be watched rather than
 * read a frame at a time.
 *
 * `bun run crop` is this idea for one picture: a body is forty pixels across
 * and a change to its shape cannot be seen in a whole phone. This is the same
 * problem along the other axis. Verifying the opening scene meant photographing
 * a phone every 800 ms for twenty seconds and then *looking* at twenty-one
 * pictures — and a session looks at a picture by reading it, one at a time, at
 * most a few before the turn cannot afford any more. Nothing about the motion
 * survives that: what moved between two of them is the one thing a strip read
 * separately cannot say.
 *
 * So: a grid, in order, each cell a caption of the second it was taken at. Two
 * things about it are not decoration, and both were learned by getting them
 * wrong:
 *
 * - **A window, not a shrink.** A cell that scales a whole 390 × 844 phone down
 *   to thumbnail width shows a dark rectangle twenty-one times. `--band`
 *   takes a horizontal slice of every frame — the two heads and the word
 *   crossing between them, the two controls under it — and fills the cell with
 *   that, which is what makes the motion legible.
 * - **The images go in as data URLs.** A page built with `setContent` has no
 *   origin, so a `file://` image in it is refused and the sheet comes back as
 *   a grid of broken-image icons.
 *
 * It opens a browser and draws HTML rather than compositing pixels, because
 * this repository already has the browser and has no image library — and the
 * captions, the grid and the clipping are three lines of CSS there.
 */

import type { Browser } from "playwright-core";
import { launchBrowser } from "./browser.js";

/** What a sheet is made of, after the flags have been read. */
export interface SheetPlan {
  /** The frames, in order. */
  shots: string[];
  cols: number;
  /** How wide one cell is, in CSS pixels. */
  cell: number;
  /** The slice of each frame to show, as fractions of its height. */
  band: { top: number; bottom: number };
  /** Milliseconds between one frame and the next, for the captions. */
  everyMs: number;
}

/** The shape of the frames a sheet is made of: `<prefix>-00.png`, `-01`, … */
export function framePath(prefix: string, i: number): string {
  return `${prefix}-${String(i).padStart(2, "0")}.png`;
}

/**
 * `--band 0.35,0.72` into the two fractions it means.
 *
 * Refused rather than clamped when it is backwards or outside the frame, for
 * `--at`'s reason (`crop.ts`): a band silently corrected is a picture of the
 * wrong part of the frame, and the whole point of the flag is that the caller
 * says where to look.
 */
export function parseBand(value: string | undefined): { top: number; bottom: number } {
  if (value === undefined) return { top: 0, bottom: 1 };
  const parts = value.split(",").map((p) => Number(p.trim()));
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) {
    throw new Error(`--band ${JSON.stringify(value)}: want two fractions, top,bottom`);
  }
  const [top, bottom] = parts as [number, number];
  if (top < 0 || bottom > 1) throw new Error("--band: a fraction of the frame's height, 0 to 1");
  if (bottom - top <= 0) throw new Error("--band: the bottom is under the top, and by some of it");
  return { top, bottom };
}

/** The caption on the `i`th cell: the second into the run it was taken at. */
export function captionAt(i: number, everyMs: number): string {
  return `${((i * everyMs) / 1000).toFixed(1)}s`;
}

/** The page the sheet is a screenshot of. Every frame is inlined. */
export function sheetMarkup(plan: SheetPlan, images: string[], ratio: number): string {
  const full = Math.round(plan.cell * ratio);
  const shown = Math.round(full * (plan.band.bottom - plan.band.top));
  const cells = images
    .map(
      (data, i) =>
        `<figure><div class="win"><img src="${data}"></div>` +
        `<figcaption>${captionAt(i, plan.everyMs)}</figcaption></figure>`,
    )
    .join("");
  return (
    `<style>body{margin:8px;background:#111;display:grid;` +
    `grid-template-columns:repeat(${plan.cols},${plan.cell}px);gap:6px}` +
    `figure{margin:0}` +
    `.win{width:${plan.cell}px;height:${shown}px;overflow:hidden}` +
    `.win img{width:${plan.cell}px;display:block;margin-top:${-Math.round(full * plan.band.top)}px}` +
    `figcaption{color:#fff;font:12px monospace;text-align:center}` +
    `</style>${cells}`
  );
}

/** Every frame the prefix has, in order, stopping at the first gap. */
async function framesFrom(prefix: string): Promise<string[]> {
  const shots: string[] = [];
  for (let i = 0; i < 200; i++) {
    const at = framePath(prefix, i);
    if (!(await Bun.file(at).exists())) break;
    shots.push(at);
  }
  return shots;
}

/** The sheet, written. Answers where it went. */
export async function writeSheet(browser: Browser, plan: SheetPlan, out: string): Promise<string> {
  const images = await Promise.all(
    plan.shots.map(async (path) => {
      const bytes = Buffer.from(await Bun.file(path).arrayBuffer()).toString("base64");
      return `data:image/png;base64,${bytes}`;
    }),
  );
  const first = await Bun.file(plan.shots[0] ?? "").arrayBuffer();
  const ratio = pngRatio(new Uint8Array(first));
  const page = await browser.newPage();
  const full = Math.round(plan.cell * ratio);
  const shown = Math.round(full * (plan.band.bottom - plan.band.top));
  await page.setViewportSize({
    width: plan.cols * (plan.cell + 6) + 20,
    height: Math.ceil(plan.shots.length / plan.cols) * (shown + 26) + 20,
  });
  await page.setContent(sheetMarkup(plan, images, ratio));
  // The images are data URLs and decode with the document, but a screenshot
  // taken in the same tick has caught a page mid-layout before.
  await page.waitForTimeout(300);
  await page.screenshot({ path: out });
  return out;
}

/**
 * How tall a PNG is against its width, read off the header.
 *
 * The cell is given a width and has to know how much of a frame that is, and
 * the frames are whatever the capture took — a phone, a band of a director
 * column, a square. Bytes 16..24 of a PNG are the width and the height, big
 * endian, and no library is needed to read eight bytes.
 */
export function pngRatio(bytes: Uint8Array): number {
  if (bytes.length < 24) return 1;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  return width > 0 && height > 0 ? height / width : 1;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (name: string): string | undefined => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const loose = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
  const [prefix, out] = loose;
  if (!prefix || !out) {
    console.error(
      "usage: bun run sheet <frame-prefix> <out.png> [--cols 8] [--cell 240] " +
        "[--band 0.35,0.72] [--every 800]",
    );
    process.exit(1);
  }

  const shots = await framesFrom(prefix);
  if (shots.length === 0) throw new Error(`no frames at ${framePath(prefix, 0)}`);
  const plan: SheetPlan = {
    shots,
    cols: Number(flag("cols") ?? 8),
    cell: Number(flag("cell") ?? 240),
    band: parseBand(flag("band")),
    everyMs: Number(flag("every") ?? 800),
  };

  const browser = await launchBrowser();
  try {
    console.log(`${await writeSheet(browser, plan, out)} — ${shots.length} frames`);
  } finally {
    await browser.close();
  }
}
