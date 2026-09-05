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
import { settleLaunch } from "./launch.js";
import { holdOpening } from "./opening-hold.js";

/**
 * `OPENING_PLAY` from `packages/sim/src/briefing.ts`, copied rather than
 * imported: this file runs in Node, but the comparison below runs inside
 * `page.evaluate`, in the browser, where only what is passed in exists. `0`
 * is the phase a wave opens into once nothing is holding it — introduction
 * and guide both count upward from there, never down (see that file's own
 * comment on `OpeningPhase`), so "not `OPENING_PLAY`" is "the opening still
 * has the field".
 */
export const OPENING_PLAY = 0;
export const OPENING_INTRO = 1;
export const OPENING_GUIDE = 2;

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
export const OPENING_POLL_MS = 150;

/**
 * More ticks than `readyHoldMs` could ever be tuned up to, so one attempt
 * always crosses a ready gate outright. Ticks and not a number of attempts,
 * for `RETRY_TICKS`' reason next door: the fill is counted in the world's own
 * clock and nothing about it depends on how often this file looks.
 */
export const GATE_TICKS_ENOUGH = 1200;

/**
 * `OPENING_POLL_MS` × this comfortably clears `INTRO_SECONDS` (5.5s) plus a
 * guide ack on a build with no `advanceOpening` at all, while still failing
 * loudly — rather than hanging the capture — on a wave whose opening
 * genuinely never lets go.
 */
export const MAX_OPENING_ATTEMPTS = 80;

/**
 * Where the page's opening is right now, or `"old"` for a build from before
 * `phase` replaced `due` — that shape counts cards and cannot tell an
 * introduction from a guide, which is the whole of what `stopAt` asks.
 */
export async function openingPhase(page: Page): Promise<{ phase: number; steps: number } | "old"> {
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
 * Advance the page until nothing is holding the field *and* the wave has
 * finished arriving, or throw — unless `stopAt` names a phase to stand in
 * instead, which is `holdOpening` above. `page` is a loaded preview with
 * `window.neonSpore` already present.
 *
 * The arrival is part of "nothing is holding the field" and not a second step
 * a caller has to know about: it is what a crossed gate leaves on the screen,
 * and every capture this tool took before `settleLaunch` existed has it. A
 * capture standing *in* an opening has crossed no gate and has none to paint
 * out.
 */
export async function clearOpening(
  page: Page,
  stopAt?: OpeningStop,
  driven = false,
): Promise<void> {
  if (stopAt) return await holdOpening(page, stopAt, driven);
  // **Driven, the wait is dead time and the ticks are ours to spend.** The
  // page's loop is parked from before the bundle ran (`page.ts`), so nothing
  // moves between attempts — polling would be eighty sleeps of 150 ms for
  // nothing. Instead the ticks are spent one at a time inside one round trip,
  // stopping on the tick the opening lets go: any more and the wave would
  // already be running when the capture thinks it is at tick zero.
  if (driven) {
    const spent = await page.evaluate(
      ([introSeconds, max, openingPlay]) => {
        const ns = window.neonSpore;
        if (!ns) throw new Error("window.neonSpore missing mid-capture");
        const holding = () => {
          const brief = ns.world.brief;
          return Array.isArray(brief.due) ? brief.due.length > 0 : brief.phase !== openingPlay;
        };
        ns.advanceOpening?.(introSeconds);
        ns.dismissBriefing();
        let i = 0;
        while (holding() && i < (max as number)) {
          ns.advance(1);
          i++;
        }
        return holding() ? -1 : i;
      },
      [INTRO_SECONDS_ENOUGH, GATE_TICKS_ENOUGH, OPENING_PLAY] as [number, number, number],
    );
    if (spent < 0) throw new Error("wave's opening never let go — stuck open");
    return await settleLaunch(page);
  }
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
  await settleLaunch(page);
}
