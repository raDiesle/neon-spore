import type { Creature, World } from "@neon-spore/sim";
import { beatboxRunOpen } from "@neon-spore/sim";
import { beatboxTapThrough, beatboxWrongThrough } from "./beatbox.js";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";

/**
 * **The air a soundbox is moving**, which is the half of this creature that
 * has no number in it at all.
 *
 * The owner asked for a box you can *see the sound coming out of*, and this is
 * that: rings leaving the rim on every beat and opening as they go, the way a
 * cone in a cabinet is drawn moving air. They are the same picture
 * `beatbox-wave.ts` draws when a run comes apart, at a fraction of the size
 * and going nowhere — a box that is behaving is pushing air the whole time,
 * and a miscount is that same air aimed at the ship.
 *
 * **Three of them, on three clocks, and the split is what each one says.**
 *
 * - The **idle** ring is the beat and only the beat: one leaves the body on
 *   every boundary and is gone before the next. It is the field's own grey,
 *   because a box carries no colour and never will (`creatures-beatbox.ts`),
 *   and it is faint enough to read as the body breathing rather than as a
 *   thing happening.
 * - The **counted** ring is green, and it is the receipt. The owner asked for
 *   an echo *in green* on every beat a thumb landed, and for the press itself
 *   to always show that it was seen. Green is the game's own colour for the
 *   one thing that goes right (`PALETTE.good`) and this is exactly that: a
 *   beat the pair got. Nothing else on the field is ever green at the same
 *   time as a box is.
 * - The **wrong** ring is red, and it is the other half of the same sentence.
 *   A run that came apart — short, or one beat too long — lights the body and
 *   throws these, so *that was wrong* arrives at the eye a fifth of a second
 *   after the mistake rather than a beat later (`beatbox-round.ts`).
 *
 * All three are read off the world rather than remembered here: the beat and
 * the phase for the first, and the two ticks the simulation stamps on the body
 * for the other two (`creature-state-beatbox.ts`). So there is nothing to
 * clear on a restart and nothing for `Effects.reset` to forget — the rule
 * `restart.test.ts` enforces is met by having no state at all.
 */

/** How many rings ride out on one beat, and how far apart in the cycle they
 * are. Two: one is a pulse and three is a ripple, and what a cabinet does is
 * push twice — the cone out and the cone back. */
const IDLE_RINGS = 2;
const IDLE_STAGGER = 0.34;
/** How far an idle ring gets past the rim, in body radii, and how bright it
 * gets at the middle of that travel. Faint: this runs on every beat of every
 * box on the field, and a ring the pair has to look at is a ring competing
 * with the count. */
const IDLE_REACH = 1.5;
const IDLE_ALPHA = 0.36;

/** A counted beat's rings: more of them, further out and much brighter, so the
 * difference between a beat that happened and a beat that *counted* is not a
 * question anybody has to ask. */
const TAP_RINGS = 3;
const TAP_STAGGER = 0.2;
const TAP_REACH = 2.8;
const TAP_ALPHA = 0.9;

/** And a run coming apart: the same shape again, wider still. */
const WRONG_RINGS = 3;
const WRONG_STAGGER = 0.16;
const WRONG_REACH = 3.4;
const WRONG_ALPHA = 0.95;

/**
 * One open ring around the body, `t` of the way through its life.
 *
 * An ellipse rather than a circle, and wider than it is tall: what is being
 * drawn is a front leaving a cabinet, and a cabinet is wider than it is tall.
 * It also keeps the rings clear of the marks standing over the box, which sit
 * directly above it (`beatbox-marks.ts`).
 */
function ring(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  reach: number,
  alpha: number,
  hex: string,
): void {
  const out = r * (1 + reach * t);
  ctx.save();
  // **Brightest in the middle of its travel, not at the start.** The first
  // tuning faded a ring out as it went, which is what a fading thing does and
  // is exactly wrong here: a ring is inside the body for the first fifth of
  // its life, so all of its brightness was spent where nothing could see it
  // and the part that cleared the rim was already gone. A sine over the whole
  // life comes up as the ring leaves the body and goes out as it dies.
  ctx.globalAlpha = alpha * Math.sin(Math.PI * t);
  ctx.strokeStyle = hex;
  ctx.lineWidth = Math.max(1, r * 0.12 * (1 - t));
  ctx.beginPath();
  ctx.ellipse(x, y, out * 1.12, out * 0.86, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** A train of `n` rings, each the same ring started `stagger` later. */
function train(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  head: number,
  n: number,
  stagger: number,
  reach: number,
  alpha: number,
  hex: string,
): void {
  for (let i = 0; i < n; i++) {
    const t = head - i * stagger;
    if (t <= 0 || t >= 1) continue;
    ring(ctx, x, y, r, t, reach, alpha, hex);
  }
}

/**
 * Everything the air around one box is doing, drawn **under** the body so the
 * rings leave from behind it rather than across it.
 *
 * `r` is the body's drawn radius with its swell already in it, so a ring
 * leaves the rim the pair can see rather than the rim the body would have had
 * standing still.
 */
export function drawBeatboxAir(
  ctx: CanvasRenderingContext2D,
  world: World,
  c: Creature,
  x: number,
  y: number,
  r: number,
  beatPhase: number,
): void {
  // The beat, always. Even a box in the middle of a run is still a cabinet.
  train(
    ctx,
    x,
    y,
    r,
    beatPhase,
    IDLE_RINGS,
    IDLE_STAGGER,
    IDLE_REACH,
    // A box with a run open pushes harder — the pair has woken it up — and one
    // standing untouched idles. A single number rather than a second train:
    // what changed is how hard it is being driven, not what it is doing.
    beatboxRunOpen(c) ? IDLE_ALPHA * 1.6 : IDLE_ALPHA,
    PALETTE.rock,
  );

  const wrong = beatboxWrongThrough(world, c);
  if (wrong !== null) {
    train(ctx, x, y, r, wrong, WRONG_RINGS, WRONG_STAGGER, WRONG_REACH, WRONG_ALPHA, PALETTE.red);
    // Light behind the body as well as rings off it. Without it a red box is
    // an outline on a dark field; with it the whole lane goes red for a beat,
    // which is what *clearly wrong* looks like from the other side of a sofa.
    halo(ctx, x, y, r * 3.4, PALETTE.red, 0.5 * (1 - wrong));
    return;
  }

  const tap = beatboxTapThrough(world, c);
  if (tap === null) return;
  train(ctx, x, y, r, tap, TAP_RINGS, TAP_STAGGER, TAP_REACH, TAP_ALPHA, PALETTE.good);
  // **The press was seen.** The owner asked for a glow on every click, and it
  // is here rather than in the rings because a ring says *sound left the box*
  // and this says *your thumb landed*: it is under the body, it is brightest
  // on the frame of the press, and it is gone well inside the beat.
  halo(ctx, x, y, r * 2.6, PALETTE.good, 0.55 * (1 - tap) ** 1.5);
}
