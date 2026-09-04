/**
 * Getting a wave's own opening out of the way, so a capture can start on the
 * field.
 *
 * Its own file beside `capture.ts` because it is the one part of driving a
 * frame that is about *the build under the browser* rather than about the
 * picture: every number here is an allowance for a commit's parent, checked
 * out from before the introduction existed, and none of them has anything to
 * say about a viewport, a seat or a screenshot. `capture.ts` was at its line
 * ceiling, and this is the seam that was already there.
 */

import type { Page } from "playwright-core";

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
const OPENING_INTRO = 1;
const OPENING_GUIDE = 2;

/**
 * Which half of the opening a capture wants to stand *in*, rather than get
 * past. `undefined` is the tool's whole history: run through both and
 * photograph the field.
 *
 * The two named here are the two screens a wave puts in front of a player
 * before it starts, and until this existed neither could be photographed at
 * all — `clearOpening` was unconditional, so `bun run frames` advanced past
 * the introduction and the guide on its way to every picture it has ever
 * taken. The lane that built wave 1's rehearsal had to write a throwaway
 * Playwright script to see its own work.
 */
export type OpeningStop = "intro" | "guide";

/** `--opening <value>` off the command line. */
export function parseOpening(value: string | undefined): OpeningStop | undefined {
  if (value === undefined) return undefined;
  if (value === "intro" || value === "guide") return value;
  throw new Error(`--opening ${value}: one of intro, guide`);
}

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
 * More ticks than `readyHoldMs` could ever be tuned up to, so one attempt
 * always crosses a ready gate outright. Ticks and not a number of attempts,
 * for `RETRY_TICKS`' reason next door: the fill is counted in the world's own
 * clock and nothing about it depends on how often this file looks.
 */
const GATE_TICKS_ENOUGH = 1200;

/**
 * `OPENING_POLL_MS` × this comfortably clears `INTRO_SECONDS` (5.5s) plus a
 * guide ack on a build with no `advanceOpening` at all, while still failing
 * loudly — rather than hanging the capture — on a wave whose opening
 * genuinely never lets go.
 */
const MAX_OPENING_ATTEMPTS = 80;

/**
 * Where the page's opening is right now, or `"old"` for a build from before
 * `phase` replaced `due` — that shape counts cards and cannot tell an
 * introduction from a guide, which is the whole of what `stopAt` asks.
 */
async function openingPhase(page: Page): Promise<{ phase: number; steps: number } | "old"> {
  return await page.evaluate(() => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing mid-capture");
    const brief = ns.world.brief;
    if (Array.isArray(brief.due)) return "old" as const;
    // `steps` is how many pages of film this wave's guide has, and 0 for one
    // made of prose. It decides whether there is an introduction behind the
    // guide at all: a stepped guide's last page *is* the introduction, so
    // crossing its gate starts the wave (`sim/guide-steps.ts`).
    return { phase: brief.phase ?? 0, steps: brief.steps ?? 0 };
  });
}

/**
 * Stand *in* the opening at the phase asked for, rather than run through it.
 *
 * **The two are the other way round from how this was written.** A wave opens
 * on its *guide* now, and its introduction stands behind that
 * (`packages/sim/src/briefing.ts` — the introduction names the wave the pair is
 * about to play, so it wants to be the last thing before the field). So
 * `"guide"` is the phase a guided wave opens in and only has to be checked for,
 * and `"intro"` is the one with a screen to get past.
 *
 * Getting past a guide means **crossing its gate**, which is two thumbs held
 * for `readyHoldMs` — `dismissBriefing` is exactly that hold from both seats,
 * and the ticks after it are what fill the circles. That is the one move this
 * function used to refuse to make, on the grounds that acking the thing being
 * photographed cannot be undone; with the order swapped it is the only way to
 * reach the thing that *is* being photographed, and the guide is no longer it.
 *
 * Every refusal names the wave rather than timing out: a picture of the field
 * returned for `--opening guide` would be an honest-looking answer to a
 * question nobody asked.
 */
async function holdOpening(page: Page, stopAt: OpeningStop): Promise<void> {
  const want = stopAt === "intro" ? OPENING_INTRO : OPENING_GUIDE;
  for (let i = 0; i <= MAX_OPENING_ATTEMPTS; i++) {
    const opening = await openingPhase(page);
    if (opening === "old") {
      throw new Error(
        "--opening needs a build whose world.brief has a phase — this one predates the " +
          "introduction, so it has no introduction and no guide to photograph",
      );
    }
    const { phase, steps } = opening;
    if (phase === want) return;
    if (stopAt === "intro" && phase === OPENING_GUIDE && steps > 0) {
      throw new Error(
        "this wave's guide is stepped, so its introduction is the last page of the guide " +
          "rather than a screen behind it — photograph it with --opening guide",
      );
    }
    if (phase === OPENING_PLAY) {
      throw new Error(
        stopAt === "intro"
          ? "this wave is already on the field: nothing is holding it, so there is no " +
              "introduction to photograph"
          : "this wave carries no guide — it opened straight on its introduction",
      );
    }
    if (want === OPENING_GUIDE) {
      throw new Error(
        "this wave is on its introduction, which is *behind* the guide: it carries no " +
          "guide to photograph",
      );
    }
    // Standing on a guide with the introduction behind it. Cross the gate:
    // both thumbs down, then the ticks that fill the two circles.
    await page.evaluate((fillTicks) => {
      const ns = window.neonSpore;
      if (!ns) throw new Error("window.neonSpore missing mid-capture");
      ns.dismissBriefing();
      ns.advance(1);
      ns.advance(fillTicks);
    }, GATE_TICKS_ENOUGH);
    await page.waitForTimeout(OPENING_POLL_MS);
  }
  throw new Error("the guide never passed — the introduction never came up");
}

/**
 * Frames given to the launch before this gives up on it. `LAUNCH_LIFE` is
 * 0.72s at a sixtieth each (`render/opening-fx.ts`), so this is nearly four
 * times what it takes — enough that a slower animation still finishes, and
 * short enough that a build whose rings never end says so rather than spins.
 */
const MAX_LAUNCH_FRAMES = 160;

/**
 * Frames painted on a build that cannot be asked. `bun run frames <sha>`
 * drives a commit and its own parent, and a parent from between the launch
 * landing and `launching` being exposed has the rings and no way to report
 * them: a second of frames is past `LAUNCH_LIFE` whichever of the two this is.
 */
const BLIND_LAUNCH_FRAMES = 60;

/**
 * Paint the wave's arrival out, so a capture is of the field rather than of
 * the field behind two enormous rings.
 *
 * The rings run on the **frame** clock and the world knows nothing about them,
 * so `clearOpening` above cannot see them: it steps the simulation, and
 * `OpeningFx.update` only ever gets the sixtieth of a second that each
 * photographed frame paints. Every capture this tool has ever taken went
 * through them — one violet, one amber, over the top two thirds of the field —
 * and they were still there 2500 ticks into a wave.
 *
 * Painting is the only thing that moves them, which is why this is a loop of
 * `paint` and not another `advance`. It is capped and throws the way
 * `clearOpening` does, rather than spinning on a build whose launch never ends.
 */
export async function settleLaunch(page: Page): Promise<void> {
  const asked = await page.evaluate(() => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing mid-capture");
    return typeof ns.launching === "function";
  });
  if (!asked) {
    await page.evaluate((n) => {
      for (let i = 0; i < n; i++) window.neonSpore?.paint();
    }, BLIND_LAUNCH_FRAMES);
    return;
  }
  const painted = await page.evaluate((max) => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing mid-capture");
    let i = 0;
    while (ns.launching?.() && i < max) {
      ns.paint();
      i++;
    }
    return i;
  }, MAX_LAUNCH_FRAMES);
  if (painted >= MAX_LAUNCH_FRAMES) {
    throw new Error(
      `the wave was still arriving after ${MAX_LAUNCH_FRAMES} painted frames — ` +
        "its launch animation never ends",
    );
  }
}

/**
 * Advance the page until nothing is holding the field, or throw — unless
 * `stopAt` names a phase to stand in instead, which is `holdOpening` above.
 * `page` is a loaded preview with `window.neonSpore` already present.
 */
export async function clearOpening(page: Page, stopAt?: OpeningStop): Promise<void> {
  if (stopAt) return await holdOpening(page, stopAt);
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
}
