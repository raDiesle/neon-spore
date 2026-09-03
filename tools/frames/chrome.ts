import { existsSync } from "node:fs";

/**
 * Which browser `tools/frames` opens, and where it lives on the two machines
 * this repository runs on.
 *
 * Its own file beside `capture.ts` because it is a different subject from
 * driving a frame — one is a fact about a machine, the other a fact about the
 * game — and because `capture.ts` was at the ceiling CLAUDE.md sets. Every
 * caller still reaches it through `capture.js`, which re-exports both names.
 */

/**
 * Where a Chrome-family browser lives on the machines this repository runs on —
 * the owner's Windows box, the Mac they alternate with, and the cloud sandbox
 * `CLAUDE.md` says "does have a headless Chromium". `playwright-core` ships no
 * browser of its own on purpose: downloading one is a network fetch and a
 * licence none of them needs, when each already carries a real browser on disk.
 *
 * macOS is on the list because everything that takes a picture — `frames`,
 * `png`, `icons`, `raster`, `raster:verify`, `shot` — comes through here, so a
 * missing path is all six of them throwing on half the owner's machines.
 */
export const CHROME_CANDIDATES = [
  process.env.FRAMES_CHROME,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/opt/google/chrome/google-chrome",
  // The cloud sandbox CLAUDE.md names: Playwright's own download, which is the
  // only browser on that machine and is not on any of the paths above.
  "/opt/pw-browsers/chromium",
] as const;

/** The search, kept apart from the filesystem so a test can hand it a fake
 * directory instead of depending on what happens to be installed here. */
export function pickChrome(
  candidates: readonly (string | undefined)[],
  exists: (path: string) => boolean = existsSync,
): string {
  for (const candidate of candidates) {
    if (candidate && exists(candidate)) return candidate;
  }
  throw new Error(
    "no Chrome-family browser found for tools/frames. Set FRAMES_CHROME to an " +
      "executable path, or install Google Chrome, Chromium or Microsoft Edge.",
  );
}

export function findChrome(): string {
  return pickChrome(CHROME_CANDIDATES);
}
