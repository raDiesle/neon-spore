import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium } from "playwright-core";
import { findChrome } from "./chrome.js";
import { clearOpening } from "./opening.js";

/**
 * One picture, or a short strip of them, off the running game — driven the
 * same way "A CHECK THAT LANDED YESTERDAY HAS NO BEFORE" asked for: `window.neonSpore.advance` and `paint`, the same handle
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
  /**
   * Whose screen this is. Omitted leaves the build's own default, which is the
   * test rig showing both halves at once.
   *
   * A creature whose whole point is that the two devices carry two different
   * pictures — THE VEIL, THE LURE, THE DART — cannot be photographed at all
   * without this: the rig's frame is neither of the two frames a player sees,
   * and it is the one this tool used to be able to take.
   */
  seat?: "p1" | "p2" | "test";
}

/** Which browser a capture opens. Six callers across `tools/` ask this file
 * for it, so it is re-exported rather than moved — the subject itself lives in
 * `chrome.ts`, out of the way of driving a frame. */
export { findChrome, pickChrome } from "./chrome.js";

export interface CaptureResult {
  /** One path per frame, in capture order. */
  paths: string[];
}

const DEFAULT_VIEWPORT = { width: 390, height: 844 } as const;

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
 * `STORAGE_KEY` from `apps/game/src/view.ts`, copied for `OPENING_PLAY`'s
 * reason: the line that reads it runs in the browser, before the bundle loads,
 * where nothing this file imports exists. The view switch restores the seat
 * from this key on startup, so writing it is the same as having pressed the
 * button — and a key that went stale would leave every seated capture silently
 * back on the test rig, which is why the string is named here rather than
 * inlined at the call.
 */
const SEAT_KEY = "neon-spore.view";

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

    // Before the bundle runs, not after: the view switch reads its seat once
    // on startup and the layout is computed from it, so a seat set afterwards
    // would be a second frame's worth of work and a first frame of the wrong
    // screen.
    if (spec.seat) {
      // A refusal to store leaves the capture on whatever the build defaults
      // to, which is the same shape `view.ts` takes when storage says no.
      await page.addInitScript(
        ([key, seat]: string[]) => {
          try {
            localStorage.setItem(key as string, seat as string);
          } catch {}
        },
        [SEAT_KEY, spec.seat],
      );
    }

    await page.goto(baseUrl, { waitUntil: "load" });
    await page.waitForFunction(() => Boolean(window.neonSpore));

    await page.evaluate((wave) => {
      const ns = window.neonSpore;
      if (!ns) throw new Error("window.neonSpore missing after load");
      ns.jumpToWave(wave);
    }, spec.wave);

    await clearOpening(page);

    // The PC key toast (`apps/game/src/key-hint.ts`) sits over the top of the
    // field for its first six seconds, and headless Chrome reports `pointer:
    // fine` — so every frame this tool has ever taken had the hull bar and
    // the siren's corner behind a black box. It runs on a real clock, which
    // `advance` is not, so it cannot be waited out once rAF is frozen: it is
    // removed outright, here, while the page is still its own.
    //
    // Matched on its own text rather than an id, because a commit and its
    // parent both come through here — an id added today is missing from the
    // parent, and a toast cleared on one side of a before/after pair is worse
    // than one left on both.
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("div")) {
        if (el.textContent?.startsWith("Keyboard")) el.remove();
      }
    });

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
