import type { InstarState, SimConfig } from "@neon-spore/sim";
import { type Figure, instarFigure } from "./instar-shape.js";
import { phaseInto } from "./phase-into.js";
import { type SlowSpan, slowHush } from "./slow-hush.js";

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
 *
 * **But a slowed weave is still a weave under a thumb**, and the owner, 27
 * September 2026: *circles should almost stay where they are and not move
 * because of the boss's natural body movement, otherwise it's hard to hit.*
 * So while THE SLOW is open the weave also dies down (`instarHush`), and
 * comes back once it shuts. A swept mark's travel along its track is the
 * gesture and not the weave (`instar-place.ts`), so it goes on.
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

/**
 * What is left of the weave while THE SLOW is open.
 *
 * A twentieth, not the tenth the rest of the bosses use (`slow-hush.ts`
 * `HUSHED`), because the test is a speed and a tenth misses it: the weave's
 * peak is `REACH · 2π / BEATS`, 377 thousandths of an eleven-column field a
 * beat, and the window plays a beat in 2.5 seconds, so a tenth of it is still
 * 0.17 of a tile a second. A twentieth is 0.08, under the 0.1 the owner's
 * *almost stay where they are* was written down as.
 */
const HUSHED = 0.05;

/** **How much of the weave is left**: the shared curve, at this boss's depth. */
export function instarHush(slow: SlowSpan, beat: number, beatPhase: number): number {
  return slowHush(slow, beat, beatPhase, HUSHED);
}

/**
 * **How much of the body's own motion is left**: the weave's, and the
 * serpent's swim on top of it (`instar-serpent.ts`). Hushed while THE SLOW is
 * open, and a beaten body hangs still: damped out over the first beats of
 * `down`, well inside `instarOutBeats`, so it is not still moving as the shape
 * fades.
 */
export function instarLive(
  s: InstarState,
  cfg: SimConfig,
  slow: SlowSpan,
  beat: number,
  beatPhase: number,
): number {
  const alive =
    s.phase === "down"
      ? Math.max(0, 1 - phaseInto(s, beat, beatPhase) / Math.min(STILLING, cfg.instarOutBeats))
      : 1;
  return alive * instarHush(slow, beat, beatPhase);
}

/** Where the body is carried this frame. */
export function instarSway(
  s: InstarState,
  cfg: SimConfig,
  slow: SlowSpan,
  beat: number,
  beatPhase: number,
): Sway {
  const swing = (beat + beatPhase) * ((Math.PI * 2) / BEATS);
  const k = instarLive(s, cfg, slow, beat, beatPhase);
  return {
    xMilli: REACH * k * Math.sin(swing),
    // The weave is highest at the ends of its travel and lowest through the
    // middle, so the rise is the swing at twice the rate, and `yMilli` grows
    // downward: the body is carried *up* by a negative one.
    yMilli: -RISE * k * (1 - Math.cos(swing * 2)) * 0.5,
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
 * (`instar-marks.ts`, `instar-mark-grip.ts`, `instar-fx.ts`).
 */
export function instarBody(
  s: InstarState,
  cfg: SimConfig,
  slow: SlowSpan,
  beat: number,
  beatPhase: number,
  held = 0,
): { f: Figure; sway: Sway } {
  const sway = instarSway(s, cfg, slow, beat, beatPhase);
  const f = instarFigure(s, beat, beatPhase, held);
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
