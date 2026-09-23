import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { Browser, Page } from "playwright-core";
import { closeBrowser, launchBrowser } from "./browser.js";
import { clipFor } from "./crop.js";
import { makeDriver } from "./drive.js";
import { filmHeld, filmTickHz } from "./guide-film.js";
import { putHand } from "./hand.js";
import { settleOpening } from "./opening-hold.js";
import { openStage } from "./page.js";
import { pictureDigest } from "./pixels.js";
import { pressesByFrame } from "./press-plan.js";
import { reachFirstFrame, strideOn } from "./reach.js";
import type { CaptureResult } from "./result.js";
import type { FrameSpec } from "./spec.js";
import { backTick } from "./until.js";

/**
 * One picture, or a short strip of them, off the running game — driven the
 * same way "A CHECK THAT LANDED YESTERDAY HAS NO BEFORE" asked for: `window.neonSpore.advance` and `paint`, the same handle
 * `CLAUDE.md` already names for a headless loop check. Nothing here reads a
 * clock or a random number — the comparability a before/after pair needs
 * comes entirely from asking for the same wave, the same tick count and the
 * same seat every time.
 */

/** Opening one, and shutting it so its profile goes with it — `browser.ts`. */
export { closeBrowser, launchBrowser } from "./browser.js";
/** Which browser a capture opens. Six callers across `tools/` ask this file
 * for it, so it is re-exported rather than moved — the subject itself lives in
 * `chrome.ts`, out of the way of driving a frame. */
export { findChrome, pickChrome } from "./chrome.js";
/** The rectangle a capture may be cropped to, and how a pair is compared. */
export { type Crop, clipFor, parseAt, sameFrames } from "./crop.js";
/** Which half of a wave's opening a capture stands in, and the flag that says
 * so — the subject is `opening.ts`'s, and a caller wants the name without it. */
export { type OpeningStop, parseOpening } from "./opening.js";
/** What one answers with. Its own file for the reason the spec is in its own:
 * this one stood at the 250-line ceiling again (`result.ts`). */
export type { CaptureResult } from "./result.js";
/** The shape of what a capture asks for, and of the handle it drives. Its own
 * file because this one was at the ceiling CLAUDE.md sets, and because a caller
 * usually wants the spec without the browser behind it. */
export type { FrameSpec, HandSpec, HoldSpec, PressSpec } from "./spec.js";

/** Half a second at 60Hz: THE LID's plates are fully parted by then and THE
 * LANCE's lobe well into filling, so a picture shows the hold. */
const DEFAULT_HOLD_TICKS = 30;

/**
 * Drive one preview to an agreed frame (or a strip of them) and screenshot
 * `#stage`, the canvas the game and the director both draw the field into.
 * `baseUrl` is a running `bun run preview`-shaped server whose lifetime the
 * caller owns; this opens one tab, drives it and closes the browser.
 */
export async function captureFrames(
  baseUrl: string,
  spec: FrameSpec,
  outPrefix: string,
  shared?: Browser,
): Promise<CaptureResult> {
  const frames = spec.frames ?? 1;
  const strideTicks = spec.strideTicks ?? 6;
  if (frames < 1) throw new Error("frames must be at least 1");

  // A browser of its own unless the caller lent one: one capture wants the
  // launch, a test file taking six wants one browser (`test/opening.test.ts`).
  const browser = shared ?? (await launchBrowser());
  let opened: Page | null = null;
  try {
    const { page, errors: pageErrors, offOrigin } = await openStage(browser, baseUrl, spec);
    opened = page;

    // What one of this capture's counts is worth. On a guide it is one painted
    // frame worth one of the **film's** own ticks, so `--ticks` and `--stride`
    // still say ticks and mean the ones in front of the camera; anywhere else
    // it is `undefined` and a stepped world (`guide-film.ts`).
    const paintDriven = spec.opening === "guide";
    const filmDt = paintDriven ? 1 / (await filmTickHz(page)) : undefined;
    const { advance, press, tick, heard, sent } = makeDriver(page, filmDt);

    // The opening's words let arrive, and a film wound back to the first tick
    // of its page afterwards (`opening-hold.ts`).
    if (spec.opening) await settleOpening(page, paintDriven);

    // **`--ticks` is `world.tick`, not a count of `advance` calls.** Jumping
    // to a wave and clearing its opening cost ticks of their own — fifty of
    // them on THE PULSE — so `--ticks 329` used to photograph tick 379, and a
    // capture aimed at a window computed from the simulation (an effect that
    // lives seventy ticks, a note that expires on a tick a chart fixes) landed
    // fifty ticks late and showed nothing. Nothing in the flag said so, and
    // one lane lost six captures to it. So the count is read back here and
    // subtracted, and every press is on that same absolute axis.
    //
    // A rehearsal is the exception and keeps the relative count: its ticks are
    // the *film's*, painted one at a time off a clock the world's `tick` is
    // not on at all (`guide-film.ts`).
    const startTick = paintDriven ? 0 : await tick();
    if (!spec.until && spec.ticks < startTick) {
      throw new Error(
        `--ticks ${spec.ticks}: the wave's opening already leaves world.tick at ${startTick}, ` +
          "and a capture cannot go back. --ticks is an absolute tick, so ask for a later one",
      );
    }
    // Clamped rather than refused: `--press 0:1:intake` is the documented way
    // to say "from the start", and the start is wherever the opening left off.
    const press0 = spec.press?.map((one) => ({ ...one, tick: Math.max(0, one.tick - startTick) }));
    // Under `--until` the first frame's tick is not known ahead, so every press
    // rides the search and the strip after it hears none (`pressesByFrame`).
    const byFrame = spec.until
      ? [press0 ?? []]
      : pressesByFrame(press0 ?? [], spec.ticks - startTick, frames, strideTicks);

    const paths: string[] = [];
    const whole: string[] = [];
    const atTick: number[] = [];
    let heldPage: boolean | undefined;
    for (let i = 0; i < frames; i++) {
      if (i === 0) {
        // The first frame is *reached*: the presses walk the same tick line
        // the first advance does — so a shot lands while its target is on the
        // field rather than at whatever tick the wave happens to have reached
        // — and the run ends either on the number asked for or on the tick
        // `--until`'s event fires (`reach.ts`).
        const at = await reachFirstFrame({ advance, press, tick, heard, sent }, startTick, {
          advanceBy: spec.ticks - startTick,
          press: byFrame[0],
          until: spec.until,
          holdsAfter: (spec.hold?.length ?? 0) > 0,
        });
        // **`--until-back` wants the frame before that one, and a world does
        // not go back.** So this whole run was the search, and the picture is
        // taken by a second run of the same seed told to stop on the number it
        // found — one more drive, and no ring of painted frames to keep
        // (`until.ts`). The browser is lent to it, so it costs one tab.
        if (at !== null && spec.until?.back !== undefined) {
          const ticks = backTick(spec.until, at, startTick);
          const plain = { ...spec, until: undefined, ticks };
          return await captureFrames(baseUrl, plain, outPrefix, browser);
        }
        // `--until-on` is the other way, and a world does go that way: the
        // same drive, stepped on from the event (`until.ts`).
        if (at !== null && spec.until?.on !== undefined) await advance(spec.until.on);
      } else {
        await strideOn({ advance, press, tick, heard, sent }, strideTicks, byFrame[i] ?? []);
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
      // This phone's own thumb, with the browser's mouse and no ticks of its
      // own: the ring is read by the paint, not by the world (`hand.ts`).
      if (i === 0 && spec.hand) await putHand(page, spec.hand, spec.handOver === true);

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

      // Worth one film tick on a guide, like every other paint of this capture.
      await page.evaluate((dt) => {
        window.neonSpore?.paint(dt as number | undefined);
      }, filmDt);

      // Asked at the first picture and nowhere else: a strip that *ends* on a
      // page's last frame is a strip of the page, and one that starts there is
      // six copies of it.
      if (i === 0 && paintDriven) heldPage = await filmHeld(page);

      if (pageErrors.length > 0) {
        throw new Error(`page threw while driving the loop: ${pageErrors[0]}`);
      }

      const path =
        frames === 1 ? `${outPrefix}.png` : `${outPrefix}-${String(i).padStart(2, "0")}.png`;
      await mkdir(dirname(path), { recursive: true });
      // The whole frame first and always, because the digest is what says
      // whether the pair is worth writing. What lands on disk is the crop when
      // one was asked for, clipped out of the same instant rather than out of a
      // second capture (`crop.ts`).
      //
      // Of the *picture* and not of the file: a PNG encoder is free to
      // compress one frame two ways, and on a loaded machine it does — which
      // made two captures of one build disagree and the `identical:` guard a
      // comment (`png.ts`).
      const shot = await page.locator("#stage").screenshot();
      whole.push(pictureDigest(shot));
      if (spec.at) {
        const box = await page.locator("#stage").boundingBox();
        if (!box) throw new Error("#stage has no box to crop out of");
        await page.screenshot({ path, clip: clipFor(box, spec.at) });
      } else {
        await Bun.write(path, shot);
      }
      paths.push(path);
      if (!paintDriven) atTick.push(await tick());
    }
    return {
      paths,
      whole,
      atTick,
      heldPage,
      fired: heard(),
      sent: sent(),
      offOrigin: offOrigin.asked,
    };
  } finally {
    // A lent browser is the caller's to close; the tab this capture opened in
    // it is not, and a file that leaked one per capture would be back where it
    // started. `newPage` makes a context of its own, so closing that is the
    // whole of the tear-down.
    if (shared) await opened?.context().close();
    else await closeBrowser(browser);
  }
}
