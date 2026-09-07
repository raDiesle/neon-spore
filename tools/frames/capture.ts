import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { Browser, Page } from "playwright-core";
import { closeBrowser, launchBrowser } from "./browser.js";
import { clipFor } from "./crop.js";
import { openStage } from "./page.js";
import { pressPlan } from "./press-plan.js";
import type { FrameSpec, PressSpec } from "./spec.js";

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
/** The shape of what a capture asks for, and of the handle it drives. Its own
 * file because this one was at the ceiling CLAUDE.md sets, and because a caller
 * usually wants the spec without the browser behind it. */
export type { FrameSpec, HoldSpec, PressSpec } from "./spec.js";

export interface CaptureResult {
  /** One path per frame, in capture order. */
  paths: string[];
  /**
   * A digest of the **whole** frame, one per path, whatever was written.
   *
   * `run.ts` refuses to write a before-and-after pair that is the same on both
   * sides, and that refusal has to be about the game rather than about the
   * rectangle somebody asked to look at: a crop could otherwise hide the only
   * difference there was, or frame one that a reader would have found anyway.
   */
  whole: string[];
  /**
   * Whether a rehearsal's page had already played out when the first picture
   * was taken — so every frame after it is the same one.
   *
   * `undefined` on anything but `--opening guide`, and on a build too old to
   * answer. A digest comparison cannot stand in for it: the light behind the
   * field moves on its own clock, so two photographs of a held page differ in
   * every pixel that is not the film.
   */
  heldPage?: boolean;
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
  shared?: Browser,
): Promise<CaptureResult> {
  const frames = spec.frames ?? 1;
  const strideTicks = spec.strideTicks ?? 6;
  if (frames < 1) throw new Error("frames must be at least 1");

  // A browser of its own unless the caller lent one. `bun run frames` takes
  // one capture per worktree and wants the launch; a *test file* taking six
  // wants one browser, because the launch is the only cost here that is
  // neither measured nor bounded — see `tools/frames/test/opening.test.ts`.
  const browser = shared ?? (await launchBrowser());
  let opened: Page | null = null;
  try {
    const { page, errors: pageErrors } = await openStage(browser, baseUrl, spec);
    opened = page;

    /**
     * What `ticks` and `strideTicks` actually move.
     *
     * A wave is stepped by the simulation and a **rehearsal is not**: a film is
     * a run drawn off the *frame* clock, one tick per `dt * tickHz`
     * (`render/guide-play.ts`). So on the guide the numbers still mean ticks —
     * the film's — and each one is a painted frame worth exactly one of them.
     *
     * It used to paint a plain sixtieth per count, which moved the film by two
     * ticks a frame and made `--stride` mean nothing anybody could work out.
     * Worse, it could not move a film at all once the page had played: a page
     * holds on its last frame, and `SETTLE_FRAMES` below ran a whole second of
     * it before the first photograph. `--frames 6 --stride 30` came back as six
     * copies of the last frame, and the moment a film was *about* was the one
     * moment a session could not send the owner.
     */
    const paintDriven = spec.opening === "guide";
    const tickHz = await page.evaluate(() => window.neonSpore?.world.cfg?.tickHz ?? 120);
    const advance = async (n: number): Promise<void> => {
      await page.evaluate(
        ([count, byFrame, hz]) => {
          const ns = window.neonSpore;
          if (!ns) throw new Error("window.neonSpore missing mid-capture");
          for (let i = 0; i < (count as number); i++) {
            if (byFrame) ns.paint(1 / (hz as number));
            else ns.advance(1);
          }
        },
        [n, paintDriven, tickHz] as [number, boolean, number],
      );
    };

    /**
     * Send one press into the page, refusing a build too old to take it.
     *
     * A `pick`ed press has its id filled in **here**, where the field can be
     * seen: `world.nextId` is dealt as bodies arrive and a caller outside the
     * page has no way to know what it has reached, so a grip written as a
     * number was a guess that is dropped in silence when it is wrong
     * (`PICKS` in `press.ts`).
     */
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
        let command = sent.command;
        if (sent.pick) {
          const bodies = ns.world.creatures.filter((c) => typeof c.id === "number");
          const chosen =
            sent.pick === "first"
              ? bodies[0]
              : bodies.reduce<(typeof bodies)[number] | undefined>(
                  (best, c) => (best === undefined || (c.row ?? -1) > (best.row ?? -1) ? c : best),
                  undefined,
                );
          if (!chosen) {
            throw new Error(
              `--press ${sent.pick}: the field is empty at tick ${ns.world.tick}. A body has to ` +
                "have arrived before a hand can take hold of it — press later, or --ticks further in",
            );
          }
          command = { ...command, id: chosen.id };
        }
        ns.send(sent.player, command);
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

    // **And then back to the page's first tick.** The settle above is about the
    // opening's *words*, which arrive over painted frames — but on a guide the
    // same sixty frames are a whole second of film, and a page that reaches its
    // last tick holds there for good. `replayGuide` is the guide's own middle
    // button: it rebuilds the rehearsal and runs the ticks before this page
    // silently, so what the strip starts from is where those ticks really left
    // it. The caption stays where the settle put it.
    if (paintDriven) {
      await page.evaluate(() => {
        const ns = window.neonSpore;
        if (!ns) throw new Error("window.neonSpore missing before a rehearsal");
        if (!ns.replayGuide) {
          throw new Error(
            "this build has no window.neonSpore.replayGuide — --opening guide needs a commit " +
              "at or after the one that added it, or the strip is six copies of the page's " +
              "last frame",
          );
        }
        ns.replayGuide();
      });
    }

    const paths: string[] = [];
    const whole: string[] = [];
    let heldPage: boolean | undefined;
    for (let i = 0; i < frames; i++) {
      const advanceBy = i === 0 ? spec.ticks : strideTicks;
      if (i === 0 && spec.press) {
        // The presses walk the same tick line the first advance does, so a
        // shot lands while its target is on the field rather than at whatever
        // tick the wave happens to have reached. The tick each one is heard
        // on — and the rule that one has to *run* after it — is `pressPlan`.
        for (const step of pressPlan(spec.press, advanceBy)) {
          if (step.advance > 0) await advance(step.advance);
          if (step.press) await press(step.press);
        }
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

      // Asked at the first picture and nowhere else: a strip that *ends* on a
      // page's last frame is a strip of the whole page, which is right, and
      // one that starts there is six copies of it.
      if (i === 0 && paintDriven) {
        heldPage = await page.evaluate(() => window.neonSpore?.guideFinished?.());
      }

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
      const shot = await page.locator("#stage").screenshot();
      whole.push(new Bun.CryptoHasher("sha256").update(shot).digest("hex"));
      if (spec.at) {
        const box = await page.locator("#stage").boundingBox();
        if (!box) throw new Error("#stage has no box to crop out of");
        await page.screenshot({ path, clip: clipFor(box, spec.at) });
      } else {
        await Bun.write(path, shot);
      }
      paths.push(path);
    }
    return { paths, whole, heldPage };
  } finally {
    // A lent browser is the caller's to close; the tab this capture opened in
    // it is not, and a file that leaked one per capture would be back where it
    // started. `newPage` makes a context of its own, so closing that is the
    // whole of the tear-down.
    if (shared) await opened?.context().close();
    else await closeBrowser(browser);
  }
}
