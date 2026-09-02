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
 * Advance the page until nothing is holding the field, or throw. `page` is a
 * loaded preview with `window.neonSpore` already present.
 */
export async function clearOpening(page: Page): Promise<void> {
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
