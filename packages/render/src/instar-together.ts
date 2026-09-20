import { circleSubpath } from "@neon-spore/content";
import {
  type InstarState,
  instarActing,
  instarHeld,
  instarStep,
  NOT_DONE,
  type SimConfig,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { drawInstarWord } from "./instar-word.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The two clocks a mark lives under**, and the one of them the picture
 * kept to itself.
 *
 * The step's own window is the ring closing in from outside over
 * `windowBeats`, and it was never a secret. The other one is this:
 * **the rule the picture kept to itself**: a mark answered on its own waits
 * `instarTogetherBeats` for its partner, and then goes back to nought
 * (`sim/instar-step.ts`, `slipLonely`). The pair is not meant to do the two
 * things in turn — they have the whole window to work in — but they *are*
 * meant to land inside a beat or two of each other, which is the one thing
 * the fight is made of and the one thing no ring was drawing.
 *
 * The owner, 20 September 2026, on the second pose: *it is not clear what
 * needs to be done, p2 pulls but it is incorrect, why. If p1 needs to tap a
 * specific number of times and then p2 needs to pull, maybe this time frame
 * for p2 is too short, so it needs to be clearer when p2 can pull and be
 * allowed to pull in the right moment.* Every part of that reading is what a
 * silent dot taught him: his mark went in, the partner's did not come, his
 * went back to nought with a sound and nothing said why.
 *
 * So a done mark stops being a full stop. It carries the together window as
 * a ring closing into it — the same grammar as the step's own window ring,
 * which closes in from outside (`instar-marks.ts`) — and one word, on both
 * screens, because the seat that has to read it is the one whose mark is
 * still open. **No new word for the seat still working**: their ring goes
 * urgent and their own verb stays where it was, since a second line telling
 * them to hurry is the partner's sentence taken out of their mouth, and the
 * saying of it out loud is the game (`docs/decisions.md` #34).
 */

/**
 * How much of mark `i`'s together window is left — 1 the beat it was
 * answered, 0 the beat it slips — or `null` where it is not waiting on
 * anybody: not done, a `hold` (which is both seats already), or the only
 * mark in the step, which has nobody to be late.
 */
export function instarTogetherLeft(
  s: InstarState,
  cfg: SimConfig,
  i: number,
  beat: number,
  beatPhase: number,
): number | null {
  const step = instarStep(s);
  if (step === null || step.marks.length < 2 || !instarActing(s)) return null;
  const mark = step.marks[i];
  if (mark === undefined || instarHeld(mark.gesture)) return null;
  const done = s.doneBeat[i] ?? NOT_DONE;
  if (done === NOT_DONE) return null;
  // The beat it slips on is the first where `beat - done` is past the
  // allowance, so the span it has is one beat longer than the allowance.
  const span = cfg.instarTogetherBeats + 1;
  return Math.max(0, Math.min(1, (done + span - (beat + beatPhase)) / span));
}

/** Whether any mark of the step is answered and waiting — which is what
 * makes the marks still open the ones everybody is waiting on. */
export function instarAwaited(
  s: InstarState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): boolean {
  const step = instarStep(s);
  if (step === null) return false;
  return step.marks.some((_, i) => instarTogetherLeft(s, cfg, i, beat, beatPhase) !== null);
}

/**
 * A mark answered: a small filled dot in the rim's colour — and, while its
 * partner is still out, the together window closing into it and the word for
 * what that is.
 */
export function drawInstarDone(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
  time: number,
  /** The together window left, or `null` where nothing is being waited for. */
  left: number | null,
  /** Which side of the mark the words of this step stand on. */
  side: -1 | 1,
): void {
  const p = new Path2D(circleSubpath(x, y, r * 0.5));
  ctx.save();
  ctx.fillStyle = PALETTE.redRim;
  ctx.globalAlpha = 0.6 + 0.2 * Math.sin(time * 3);
  ctx.fill(p);
  ctx.restore();
  if (left === null) return;
  // Closing in on the dot rather than out from it: what is running out is
  // the time this answer keeps, and the picture shows it being taken back.
  const ring = new Path2D(circleSubpath(x, y, r * (0.6 + 1.1 * left)));
  strokeGlow(ctx, ring, PALETTE.redRim, STROKE.inner, 0.35 + 0.75 * (1 - left));
  drawInstarWord(ctx, l, "WAITING", x + side * r * 3.1, y, side, true);
}

/** The step's window: a ring closing in from outside, brighter and faster
 * the less is left. Here rather than beside the rings because it and the
 * together window are one idea drawn twice — time being taken back — and a
 * mark can be under both at once. */
export function drawInstarWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  left: number,
  mine: boolean,
): void {
  const p = new Path2D(circleSubpath(x, y, r * (1.75 + 1.1 * left)));
  const urgency = 1 - left;
  strokeGlow(ctx, p, PALETTE.red, STROKE.inner, (0.25 + 0.65 * urgency) * (mine ? 1 : 0.5));
}
