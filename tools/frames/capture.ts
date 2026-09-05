import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium } from "playwright-core";
import { findChrome } from "./chrome.js";
import { openStage } from "./page.js";
import type { FrameSpec, PressSpec } from "./spec.js";

/**
 * One picture, or a short strip of them, off the running game — driven the
 * same way "A CHECK THAT LANDED YESTERDAY HAS NO BEFORE" asked for: `window.neonSpore.advance` and `paint`, the same handle
 * `CLAUDE.md` already names for a headless loop check. Nothing here reads a
 * clock or a random number — the comparability a before/after pair needs
 * comes entirely from asking for the same wave, the same tick count and the
 * same seat every time.
 */

/** Which browser a capture opens. Six callers across `tools/` ask this file
 * for it, so it is re-exported rather than moved — the subject itself lives in
 * `chrome.ts`, out of the way of driving a frame. */
export { findChrome, pickChrome } from "./chrome.js";
/** Which half of a wave's opening a capture stands in, and the flag that says
 * so — the subject is `opening.ts`'s, and a caller wants the name without it. */
export { type OpeningStop, parseOpening } from "./opening.js";
/** The shape of what a capture asks for, and of the handle it drives. Its own
 * file because this one was at the ceiling CLAUDE.md sets, and because a caller
 * usually wants the spec without the browser behind it. */
export type { FrameSpec, HoldSpec, PressSpec } from "./spec.js";

export interface CaptureResult {
  /** One path per frame, in capture order. */
  paths: string[];
}

/** Painted frames spent settling a wave's opening before the frame that is
 * kept — a second, longer than its longest entrance (`render/text-drop.ts`).
 * `FrameSpec.settle` is the same idea handed to the caller, for the effects the
 * tool cannot know the length of. */
const SETTLE_FRAMES = 60;

/** Half a second at 60Hz: THE LID's plates are fully parted by then and THE
 * LANCE's lobe is well into filling, so the picture shows the hold rather than
 * the instant it began. */
const DEFAULT_HOLD_TICKS = 30;

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
    const { page, errors: pageErrors } = await openStage(browser, baseUrl, spec);

    /**
     * What `ticks` and `strideTicks` actually move.
     *
     * A wave is stepped by the simulation and a **rehearsal is not**: the
     * guide's loop is drawn by `paint` off the frame clock, so a strip of it
     * counted in ticks would be one picture repeated. On the guide, then, the
     * two numbers count painted frames — the same numbers the caller wrote,
     * against the only clock the thing in front of the camera runs on.
     */
    const paintDriven = spec.opening === "guide";
    const advance = async (n: number): Promise<void> => {
      await page.evaluate(
        ([count, byFrame]) => {
          const ns = window.neonSpore;
          if (!ns) throw new Error("window.neonSpore missing mid-capture");
          for (let i = 0; i < (count as number); i++) {
            if (byFrame) ns.paint();
            else ns.advance(1);
          }
        },
        [n, paintDriven] as [number, boolean],
      );
    };

    /** Send one press into the page, refusing a build too old to take it. */
    const press = async (one: PressSpec): Promise<void> => {
      await page.evaluate((sent) => {
        const ns = window.neonSpore;
        if (!ns) throw new Error("window.neonSpore missing before a press");
        if (!ns.send) {
          throw new Error(
            "this build has no window.neonSpore.send — --press needs a commit at or after the " +
              "one that added it, and a before/after pair cannot press anything on its parent",
          );
        }
        ns.send(sent.player, sent.command);
      }, one);
    };

    // **An opening's words arrive rather than appear**, on painted frames rather
    // than on ticks (`render/text-drop.ts`), so a capture that painted one frame
    // caught them at zero opacity. Settled first, the way `pose-art.ts` settles
    // the frame it keeps; the count goes over the wire because `evaluate` runs
    // in the browser, where a constant declared here does not exist.
    if (spec.opening) {
      await page.evaluate((n) => {
        for (let i = 0; i < n; i++) window.neonSpore?.paint();
      }, SETTLE_FRAMES);
    }

    const paths: string[] = [];
    for (let i = 0; i < frames; i++) {
      const advanceBy = i === 0 ? spec.ticks : strideTicks;
      if (i === 0 && spec.press) {
        // The presses walk the same tick line the first advance does, so a
        // shot lands while its target is on the field rather than at whatever
        // tick the wave happens to have reached. `parsePress` sorted them.
        let at = 0;
        for (const one of spec.press) {
          const step = Math.min(one.tick, advanceBy) - at;
          if (step > 0) {
            await advance(step);
            at += step;
          }
          await press(one);
        }
        if (advanceBy - at > 0) await advance(advanceBy - at);
      } else {
        await advance(advanceBy);
      }

      // **After the wave's own ticks, never before them.** A hand takes hold of
      // something that is already there: a `drag` names a creature by the id
      // the simulation dealt it, and at tick zero of a wave that creature has
      // not arrived — the command lands on a stale id, `setGrip` drops it, and
      // the frame comes back released while every number in the capture says
      // the hold was sent. That is the exact failure this flag exists to end,
      // so the press goes in here and gets its own short run of ticks to show
      // in. In order and on one tick: a handle's grab first, then the pull.
      if (i === 0 && spec.hold) {
        for (const one of spec.hold) await press({ ...one, tick: spec.ticks });
        await advance(spec.holdTicks ?? DEFAULT_HOLD_TICKS);
      }

      // **Painting with the world held still**, which is the only way an
      // effect that lives in painted seconds can be photographed at all: the
      // simulation has already been driven to the tick the burst fires on, and
      // from here the picture catches up on its own clock (`FrameSpec.settle`).
      // Before every frame of a strip rather than once, so `--stride 0` is a
      // strip of the burst rather than the same instant repeated.
      if (spec.settle) {
        await page.evaluate((n) => {
          for (let k = 0; k < n; k++) window.neonSpore?.paint();
        }, spec.settle);
      }

      await page.evaluate(() => {
        window.neonSpore?.paint();
      });

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
