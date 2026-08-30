import type { HitMoment } from "./hits/types.js";
import { BEAT_SECONDS } from "./skins/types.js";

/**
 * The page's hit clock: when the next one lands, and where in it we are.
 *
 * The HITS axis is the only one on SHAPES that needs something to *happen*
 * before it can be judged. The other four are states — a skin, a motion, a
 * light, a glow stack — and a card wearing one shows it the instant it is
 * ticked. A flinch shows nothing at all until something flinches.
 *
 * ## Why it repeats on its own, and why there is a button as well
 *
 * Both, and for different reasons.
 *
 * The **button** is how a reader fires one deliberately while watching a
 * single card. Judging a flash means seeing it land when you are looking at
 * the thing it lands on, and waiting for a cycle to come round is how you miss
 * it three times and conclude it is too quick.
 *
 * The **auto-repeat** is how the axis is visible at all to anyone who cannot
 * click. A cloud session driving a headless browser can screenshot a page and
 * cannot press a button on it; an axis whose every value is invisible in a
 * still is an axis nobody can report on, and this project's whole verification
 * loop is a person being sent a picture. So it runs by default, and the button
 * pre-empts the cycle rather than replacing it.
 *
 * ## The tempo is the game's, not a number picked here
 *
 * `BEAT_SECONDS` is `60 / DEFAULT_CONFIG.bpm`. A hit landing off the beat the
 * field actually runs at would be a look nobody will ever see — the same
 * argument `skins/types.ts` makes about the pulse, and the reason a card has a
 * heartbeat rather than an animation.
 */

/** Beats between one automatic hit and the next. Four, because it has to be
 * long enough that the aftermath has cleared and the eye has settled before
 * the next wind-up starts — the research phrase is that the fade has to clear
 * before the next action — and short enough that a reader who looked away for
 * a moment does not have to wait. */
const PERIOD = 4 * BEAT_SECONDS;
/** How long the wind-up runs before the impact. Just over a beat, so a
 * telegraph is something you have time to *read* rather than a flicker. */
const LEAD = 1.25 * BEAT_SECONDS;
/** How long the aftermath lasts. Shorter than the lead on purpose: a hit
 * announces itself slowly and is over quickly, and reversing that reads as a
 * body swelling rather than as a body struck. */
const TAIL = 0.9 * BEAT_SECONDS;

/**
 * Nothing is in flight: what every value sees between hits.
 *
 * Exported because a figure drawn *outside* the loop needs one too —
 * `skin-still.ts` builds a frame by hand to draw a skin without starting
 * anything, and a still is by definition not mid-impact. Handing it this
 * rather than letting it invent `{ wind: 0, shock: 0 }` keeps one definition
 * of what "no hit" means.
 */
export const IDLE_HIT: HitMoment = { since: Number.NEGATIVE_INFINITY, wind: 0, shock: 0 };

/**
 * The live moment, mutated in place rather than rebuilt.
 *
 * One object for the page, written once per frame by `shape-loop.ts` and read
 * by every figure — so this allocates nothing per frame, which is rule (d) and
 * is the rule an axis like this breaks most easily.
 */
const moment = { since: 0, wind: 0, shock: 0 };

let auto = true;
/** When the next impact lands, in page-clock seconds. `null` until the first
 * frame has told us what time it is — the clock cannot be seeded at module
 * load because `performance.now` there is not the clock the loop runs on. */
let nextAt: number | null = null;

/** Whether hits repeat on their own. */
export function autoHits(): boolean {
  return auto;
}

/** Turns the automatic repeat on or off. The button still works either way. */
export function toggleAutoHits(): void {
  auto = !auto;
}

/**
 * Fire one now — or rather, start its wind-up now, so the impact lands a lead
 * later. Firing straight to impact would make TELEGRAPH unpressable: the one
 * value whose whole subject is the moment *before* would have no before.
 */
export function fireHit(t: number): void {
  nextAt = t + LEAD;
}

/** Where the page is in the current hit. Called once a frame by the loop. */
export function hitAt(t: number): HitMoment {
  if (nextAt === null) nextAt = t + LEAD;
  if (t > nextAt + TAIL) {
    if (auto) {
      // Step rather than add-until-caught-up: a tab left in the background for
      // a minute would otherwise run a minute of hits in one frame.
      const behind = t - nextAt;
      nextAt += Math.ceil(behind / PERIOD) * PERIOD;
    } else {
      return IDLE_HIT;
    }
  }
  const since = t - nextAt;
  if (since < -LEAD) return IDLE_HIT;
  moment.since = since;
  moment.wind = since < 0 ? 1 + since / LEAD : 0;
  moment.shock = since >= 0 ? Math.max(0, 1 - since / TAIL) : 0;
  return moment;
}
