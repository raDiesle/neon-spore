import type { InstarState, SimConfig } from "@neon-spore/sim";
import { type Figure, instarFigure, instarPhaseAt } from "./instar-shape.js";

/**
 * **THE INSTAR weaves**, and everything of it weaves together.
 *
 * The owner asked for it on 22 September 2026 — *make the body of boss do
 * some more moving, so it moves around game* — and gave the reason in the
 * same breath: *so we better see the slow effect when something was moving
 * fast, which then is seen to slowed down for a moment*. A window opened over
 * a body standing still says nothing about speed. A window opened over a body
 * crossing a third of the field a beat says it in one frame, and the pair see
 * the slow rather than being told about it.
 *
 * **It is a flier's weave**: side to side, lifting at each end of the
 * swing the way a thing holding itself up on its wings does between beats of
 * them (`instar-draw.ts`). The weave is written as a displacement rather than
 * a rotation on purpose: every part of the figure and every mark takes the
 * same offset, so the body does not shear, and no drawer of this boss needs
 * a transform it did not have.
 *
 * **Nothing here is the simulation's.** The marks' own coordinates in
 * `content/instar-script.ts` are where the body *is* when it hangs straight,
 * the thumb finds a mark where the mark is drawn because the hit test adds
 * the same offset (`instar-mark-grip.ts` `instarMarkUnder`), and a pull's depth
 * is measured from the hold's origin and not from the ring, so a mark that
 * travels out from under a thumb already holding it takes the thumb's carry
 * with it. `packages/sim` does not know the body moved and `hashWorld` cannot
 * see this file.
 *
 * **And it is slowed by THE SLOW for free**, which is the whole point: the
 * swing is a function of `beat` and `beatPhase`, and a slow window is beats
 * arriving at the slow rate (`sim/slow.ts`). Nothing here
 * reads a clock, so nothing here has to be told.
 */

export interface Sway {
  /** Thousandths of the field's width, added to every x of the body. */
  xMilli: number;
  /** Thousandths of the field's height, added to every y. */
  yMilli: number;
}

/**
 * How far the swing carries the head out, in thousandths of the field's
 * width.
 *
 * At 240 the body covers very nearly half the field across one swing, and the
 * marks nearest an edge — the two nests, at 320 and 660 — come to 80 and 900
 * without leaving it. Wider than that and a thumb reaching the mark at
 * the end of its travel would be reaching off the screen.
 */
const REACH = 240;

/** Thousandths of the field's height the body rises at each end of a swing. */
const RISE = 50;

/**
 * Beats in one swing, out and back.
 *
 * Four rather than two: the peak carries the body about a third of the
 * field's width in a beat, which is unmistakably fast and is still a mark a
 * thumb can meet. At two it was a mark the pair chased and never caught, and
 * a window nobody lands is a window THE SLOW never opens over.
 */
const BEATS = 4;

/** Beats the swing takes to die away once the body is beaten. */
const STILLING = 2;

/** Where the body is carried this frame. */
export function instarSway(s: InstarState, cfg: SimConfig, beat: number, beatPhase: number): Sway {
  const swing = (beat + beatPhase) * ((Math.PI * 2) / BEATS);
  // A beaten body hangs still: the swing is damped out over the first beats of
  // `down`, well inside `instarOutBeats`, so it is not still fading when the
  // shape does.
  const alive =
    s.phase === "down"
      ? Math.max(0, 1 - instarPhaseAt(s, beat, beatPhase) / Math.min(STILLING, cfg.instarOutBeats))
      : 1;
  return {
    xMilli: REACH * alive * Math.sin(swing),
    // The weave is highest at the ends of its travel and lowest through the
    // middle, so the rise is the swing at twice the rate, and `yMilli` grows
    // downward: the body is carried *up* by a negative one.
    yMilli: -RISE * alive * (1 - Math.cos(swing * 2)) * 0.5,
  };
}

/**
 * The body this frame: the figure, carried.
 *
 * **The one way to ask where THE INSTAR is.** `instarFigure` answers where it
 * hangs and this answers where it has swung to, and a drawer that called the
 * first alone would put the head one place and the marks another. The `sway`
 * comes back with the figure because the marks are not part of it — they are
 * the script's own coordinates and take the same offset from the caller
 * (`instar-marks.ts`, `boss-cue-instar.ts`, `instar-fx.ts`).
 */
export function instarBody(
  s: InstarState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): { f: Figure; sway: Sway } {
  const sway = instarSway(s, cfg, beat, beatPhase);
  const f = instarFigure(s, beat, beatPhase);
  return {
    f: {
      ...f,
      headX: f.headX + sway.xMilli,
      headY: f.headY + sway.yMilli,
      rearX: f.rearX + sway.xMilli,
      rearY: f.rearY + sway.yMilli,
      eggsX: f.eggsX + sway.xMilli,
      eggsY: f.eggsY + sway.yMilli,
      nestX: f.nestX + sway.xMilli,
      nestY: f.nestY + sway.yMilli,
      tailX: f.tailX + sway.xMilli,
      tailY: f.tailY + sway.yMilli,
    },
    sway,
  };
}
