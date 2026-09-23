import { mkdir, readdir, rm } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import type { Page } from "playwright-core";
import { type Crop, clipFor } from "./crop.js";
import { pictureDigest } from "./pixels.js";

/**
 * **The files a capture writes: their names, the write, and the clearing of
 * the last run's.** Out of `capture.ts` on 23 September 2026 when the clearing
 * took it to 234 lines, and together because the name a frame is written under
 * and the names that are cleared before it are one rule said twice — kept in
 * one file, they cannot drift apart.
 */

/** `<prefix>.png` for a single picture, `<prefix>-00.png` onwards for a strip. */
export function framePathFor(outPrefix: string, i: number, frames: number): string {
  return frames === 1 ? `${outPrefix}.png` : `${outPrefix}-${String(i).padStart(2, "0")}.png`;
}

/**
 * **A capture's frames, cleared before it writes its own.**
 *
 * A capture wrote `<prefix>-00.png` onwards and removed nothing, so an
 * eight-frame run into a directory a ten-frame run had used left `-08` and
 * `-09` standing — and `bun run sheet`, which takes every frame the prefix has
 * until the first gap, glued two pictures from a different tick range under
 * the strip on 22 September 2026. Cleared where the prefix is written rather
 * than in the sheet: it closes it for every reader of the directory, a person
 * looking at it in Finder included.
 *
 * Only this prefix's own frames go — `<prefix>.png` and `<prefix>-NN.png` —
 * and nothing else in the directory, so a sheet or a note a session put beside
 * them survives.
 */
export async function clearFrames(outPrefix: string): Promise<string[]> {
  const dir = dirname(outPrefix);
  const base = basename(outPrefix);
  const names = await readdir(dir).catch(() => [] as string[]);
  const ours = names.filter((n) => isFrameOf(base, n));
  await Promise.all(ours.map((n) => rm(join(dir, n), { force: true })));
  return ours;
}

/** Whether a file name is one of the frames a capture to `base` writes. */
export function isFrameOf(base: string, name: string): boolean {
  if (name === `${base}.png`) return true;
  if (!name.startsWith(`${base}-`) || !name.endsWith(".png")) return false;
  return /^\d+$/.test(name.slice(base.length + 1, -".png".length));
}

/**
 * One frame onto disk, answering the digest of the whole picture.
 *
 * The whole frame first and always, because the digest is what says whether
 * the pair is worth writing. What lands on disk is the crop when one was asked
 * for, clipped out of the same instant rather than out of a second capture
 * (`crop.ts`).
 *
 * Of the *picture* and not of the file: a PNG encoder is free to compress one
 * frame two ways, and on a loaded machine it does — which made two captures
 * of one build disagree and the `identical:` guard a comment (`png.ts`).
 */
export async function writeFrame(page: Page, path: string, at?: Crop): Promise<string> {
  await mkdir(dirname(path), { recursive: true });
  const shot = await page.locator("#stage").screenshot();
  if (at) {
    const box = await page.locator("#stage").boundingBox();
    if (!box) throw new Error("#stage has no box to crop out of");
    await page.screenshot({ path, clip: clipFor(box, at) });
  } else {
    await Bun.write(path, shot);
  }
  return pictureDigest(shot);
}
