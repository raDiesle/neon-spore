import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium } from "playwright-core";

/**
 * One picture, or a short strip of them, off the running game — driven the
 * same way `docs/queue.md`'s "A CHECK THAT LANDED YESTERDAY HAS NO BEFORE"
 * describes: `window.neonSpore.advance` and `paint`, the same handle
 * `CLAUDE.md` already names for a headless loop check. Nothing here reads a
 * clock or a random number — the comparability a before/after pair needs
 * comes entirely from asking for the same wave, the same tick count and the
 * same seat every time.
 */

export interface FrameSpec {
  /** 0-based wave index, the same number `jumpToWave` already takes. */
  wave: number;
  /** Ticks to advance, from the wave's own start, before the first capture. */
  ticks: number;
  /**
   * A strip rather than a still, for a check about motion. 1 is a single
   * frame at `ticks`; more than that captures `frames` frames, `strideTicks`
   * apart, starting at `ticks`.
   */
  frames?: number;
  /** Ticks between frames of a strip. Ignored when `frames` is 1. */
  strideTicks?: number;
  /** CSS viewport the phone is drawn at. A fixed size is part of what makes
   * two captures comparable — the layout math reads the viewport back. */
  viewport?: { width: number; height: number };
}

export interface CaptureResult {
  /** One path per frame, in capture order. */
  paths: string[];
}

const DEFAULT_VIEWPORT = { width: 390, height: 844 } as const;

/**
 * Where a Chrome-family browser lives on the two machines this repository
 * runs on — this Windows box, and the cloud sandbox `CLAUDE.md` says "does
 * have a headless Chromium". `playwright-core` ships no browser of its own on
 * purpose: downloading one is a network fetch and a licence neither machine
 * needs, when both already carry a real browser on disk.
 */
const CHROME_CANDIDATES = [
  process.env.FRAMES_CHROME,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/opt/google/chrome/google-chrome",
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

declare global {
  interface Window {
    neonSpore?: {
      world: { brief: { due: readonly unknown[] } };
      jumpToWave(wave: number): void;
      dismissBriefing(): void;
      advance(ticks: number): void;
      paint(): void;
    };
  }
}

/** More briefing cards than one wave can plausibly owe (`MAX_BRIEFING_SUBJECTS`
 * in `packages/sim/src/briefing.ts` caps it at 31) — a safety rail, not a tuned
 * number, so a stuck card fails loudly instead of hanging the capture. */
const MAX_BRIEFING_CARDS = 40;

/**
 * Drive one preview to an agreed frame (or a strip of them) and screenshot
 * `#stage`, the canvas the game and the director both draw the field into.
 *
 * `baseUrl` is a running `bun run preview`-shaped server — the caller starts
 * it and owns its lifetime. This function only opens one tab, drives it and
 * closes the browser; it never touches a port or a process.
 */
export async function captureFrames(
  baseUrl: string,
  spec: FrameSpec,
  outPrefix: string,
): Promise<CaptureResult> {
  const frames = spec.frames ?? 1;
  const strideTicks = spec.strideTicks ?? 6;
  if (frames < 1) throw new Error("frames must be at least 1");

  const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
  try {
    const page = await browser.newPage({ viewport: spec.viewport ?? DEFAULT_VIEWPORT });
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    await page.goto(baseUrl, { waitUntil: "load" });
    await page.waitForFunction(() => Boolean(window.neonSpore));

    await page.evaluate(
      ({ wave, max }) => {
        const ns = window.neonSpore;
        if (!ns) throw new Error("window.neonSpore missing after load");
        ns.jumpToWave(wave);
        // A wave can owe more than one card, and a dismiss only acks the one
        // on top (`ackBriefing` in `packages/sim/src/briefing.ts`) — so this
        // acks, ticks once to let the sim pop it, and checks again, rather
        // than assuming one ack from two thumbs clears the whole stack.
        for (let i = 0; ns.world.brief.due.length > 0; i++) {
          if (i >= max) throw new Error("briefing never cleared — too many cards due");
          ns.dismissBriefing();
          ns.advance(1);
        }
      },
      { wave: spec.wave, max: MAX_BRIEFING_CARDS },
    );

    const paths: string[] = [];
    for (let i = 0; i < frames; i++) {
      const advanceBy = i === 0 ? spec.ticks : strideTicks;
      await page.evaluate((ticks) => {
        const ns = window.neonSpore;
        if (!ns) throw new Error("window.neonSpore missing mid-capture");
        ns.advance(ticks);
        ns.paint();
      }, advanceBy);

      if (pageErrors.length > 0) {
        throw new Error(`page threw while driving the loop: ${pageErrors[0]}`);
      }

      const path =
        frames === 1 ? `${outPrefix}.png` : `${outPrefix}-${String(i).padStart(2, "0")}.png`;
      await mkdir(dirname(path), { recursive: true });
      await page.locator("#stage").screenshot({ path });
      paths.push(path);
    }
    return { paths };
  } finally {
    await browser.close();
  }
}
