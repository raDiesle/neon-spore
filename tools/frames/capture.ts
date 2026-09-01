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

declare global {
  interface Window {
    neonSpore?: {
      // Both fields are optional: `bun run frames <sha>` drives a commit and
      // its own parent through this same evaluated function, and `phase`
      // replaced `due` in the commit that added the introduction
      // (`f6be23b`). A parent checked out from before that lands on the
      // older shape, so this has to recognise either rather than assume the
      // one the current tree happens to have.
      world: { brief: { phase?: number; due?: readonly unknown[] } };
      jumpToWave(wave: number): void;
      dismissBriefing(): void;
      /** Missing on a build from before the introduction existed. */
      advanceOpening?(seconds: number): void;
      advance(ticks: number): void;
      paint(): void;
    };
  }
}

/**
 * `OPENING_PLAY` from `packages/sim/src/briefing.ts`, copied rather than
 * imported: this file runs in Node, but the comparison below runs inside
 * `page.evaluate`, in the browser, where only what is passed in exists. `0`
 * is the phase a wave opens into once nothing is holding it — introduction
 * and guide both count upward from there, never down (see that file's own
 * comment on `OpeningPhase`), so "not `OPENING_PLAY`" is "the opening still
 * has the field".
 */
const OPENING_PLAY = 0;

/**
 * More seconds than `INTRO_SECONDS` (`apps/game/src/waves.ts`) could ever be
 * tuned up to — enough that one call always exhausts the introduction's
 * countdown in a single step, rather than this file having to know the real
 * number and go stale the day that one changes.
 */
const INTRO_SECONDS_ENOUGH = 60;

/**
 * Real milliseconds given to the browser between attempts at clearing the
 * opening. `advanceOpening` clears it in one attempt on a build that has it;
 * this wait is what makes a build from *before* `advanceOpening` existed —
 * `f6be23b`'s own commit, which `bun run frames f6be23b` diffs against its
 * parent and screenshots in the same run — clear it too, off nothing but its
 * own `requestAnimationFrame` loop and real wall-clock time. Playwright does
 * not suspend rAF on a headless page the way a backgrounded real tab would,
 * so that loop is genuinely ticking between attempts; this just gives it
 * room to.
 */
const OPENING_POLL_MS = 150;

/**
 * `OPENING_POLL_MS` × this comfortably clears `INTRO_SECONDS` (5.5s) plus a
 * guide ack on a build with no `advanceOpening` at all, while still failing
 * loudly — rather than hanging the capture — on a wave whose opening
 * genuinely never lets go.
 */
const MAX_OPENING_ATTEMPTS = 80;

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

    await page.evaluate((wave) => {
      const ns = window.neonSpore;
      if (!ns) throw new Error("window.neonSpore missing after load");
      ns.jumpToWave(wave);
    }, spec.wave);

    // A commit and its own parent run through this same loop, and `due` (a
    // stack of cards) became `phase` (introduction, then an optional guide)
    // in the commit that added the introduction — so a parent checked out
    // from before it still answers with the older shape. Read whichever one
    // this build actually has, every attempt, rather than assume one.
    const holds = () =>
      page.evaluate((openingPlay) => {
        const ns = window.neonSpore;
        if (!ns) throw new Error("window.neonSpore missing mid-capture");
        const brief = ns.world.brief;
        return Array.isArray(brief.due) ? brief.due.length > 0 : brief.phase !== openingPlay;
      }, OPENING_PLAY);

    for (let i = 0; await holds(); i++) {
      if (i >= MAX_OPENING_ATTEMPTS) {
        throw new Error("wave's opening never let go — stuck open");
      }
      // `advanceOpening` clears the introduction outright on a build that has
      // it. `dismissBriefing` acks a guide (new shape) or pops the top card
      // (old shape) — a no-op the rest of the time. `advance(1)` lets
      // whichever of those just landed a command actually take effect. None
      // of the three do anything on a build with no `advanceOpening` and
      // nothing due yet, which is exactly when `OPENING_POLL_MS` matters.
      await page.evaluate((introSeconds) => {
        const ns = window.neonSpore;
        if (!ns) throw new Error("window.neonSpore missing mid-capture");
        ns.advanceOpening?.(introSeconds);
        ns.dismissBriefing();
        ns.advance(1);
      }, INTRO_SECONDS_ENOUGH);
      await page.waitForTimeout(OPENING_POLL_MS);
    }

    // **The loop stops here, and not one line earlier.** Everything this tool
    // promises rests on the two pictures being the same instant of the same
    // wave — and until this line the page has gone on ticking between
    // `paint()` and the screenshot, a couple of hundred milliseconds of round
    // trip being a few dozen ticks, so the frame that landed was at whatever
    // beat phase the loop happened to reach and the parent and the commit
    // reached different ones. Anything that only shows for part of a beat was
    // caught or missed at random. THE VEIL's lightning is what found it: three
    // captures in a row of a creature whose whole picture is a strike on the
    // beat came back with no strike in them.
    //
    // Not in an init script, because the loop above *needs* the loop: a build
    // from before `advanceOpening` existed clears its own opening on nothing
    // but rAF and wall-clock time, which is the whole of what
    // `OPENING_POLL_MS` is waiting for. So it runs until the opening lets go
    // and then stops, and from here the only clock is `advance`.
    await page.evaluate(() => {
      window.requestAnimationFrame = () => 0;
    });

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
