import { dartHex, dartThrust } from "../../../../../packages/render/src/dart.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { rgba } from "../../../../../packages/render/src/meteor-look.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { type Creature, dartHeading } from "../../../../../packages/sim/src/index.js";

/**
 * The paint WAKE is made of, kept out of `index.ts` so that file stays the
 * argument for the candidate rather than a wall of canvas calls.
 *
 * Nothing here caches a frame, for the reason `forge/paint.ts` gives: a
 * candidate lives inside two renderers stepping one world, and a module-level
 * cache would be state shared between the two sides of the pair.
 */

/** How many bars are left on the line. Four: enough to be a track rather
 * than a mark, few enough that the nearest is still the brightest thing on
 * it. */
const MARKS = 4;
/** Where the first one sits behind the tail, and the gap to the next, both as
 * shares of the body radius. */
const FIRST = 0.66;
const GAP = 0.5;
/** Half-length of the nearest bar, and what each one further back loses. They
 * shrink because they are receding, which is the one thing a flat field can
 * say about distance without moving anything. */
const SPAN = 0.5;
const SHRINK = 0.085;
/** The nearest one's weight, and what distance costs. */
const LEAD = 1;
const FADE = 0.2;

/**
 * The thrust, as the line it has been thrown down rather than as a flame on
 * the back of the body.
 *
 * Four short bars lie **across** the diagonal behind the body, shrinking and
 * fading with distance. Across and not along: player 2's own picture of this
 * creature is a dotted leg drawn *along* the diagonal (`dart-path.ts`), and a
 * second line down the same axis would be one mark saying two different
 * things on the one screen that carries both.
 *
 * Every number is a share of the body radius, so the marks grow with the body
 * as the perspective transform brings it down the field — the same rule
 * `wisp-tentacles.ts` states about drawing in the body's own units.
 */
export function wakeJet(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  beatPhase: number,
): void {
  const heat = dartThrust(c, beatPhase);
  if (heat <= 0.01) return;
  const dir = dartHeading(c);
  const r = l.tile * 0.4;
  const hex = dartHex(c);
  // Back up the diagonal the body is running down — the unit diagonal, since
  // a run spends one column per row. A direction, not a distance.
  const bx = -dir * Math.SQRT1_2;
  const by = -Math.SQRT1_2;
  const px = -by;
  const py = bx;
  const at = (along: number, across: number): [number, number] => [
    x + bx * along + px * across,
    y + by * along + py * across,
  ];

  ctx.save();
  ctx.lineCap = "round";
  for (let k = 0; k < MARKS; k++) {
    // Each bar is one the body has already passed, so distance is age: the far
    // ones are shorter, thinner and dimmer, which is a track receding rather
    // than a ladder drawn on the field.
    const along = r * (FIRST + k * GAP);
    const half = r * Math.max(0.1, SPAN - k * SHRINK);
    const bar = new Path2D();
    bar.moveTo(...at(along, half));
    bar.lineTo(...at(along, -half));
    // Through `strokeGlow` and not a plain stroke: everything alive on this
    // field is a line with light around it, and a flat one-pixel rule is the
    // one mark that would read as chrome laid over the game rather than as
    // something in it. The fade rides in the colour because `strokeGlow`
    // owns `globalAlpha` for the length of its own passes.
    strokeGlow(
      ctx,
      bar,
      rgba(hex, heat * Math.max(0, LEAD - k * FADE)),
      Math.max(1, r * (0.2 - k * 0.03)),
      1,
    );
  }
  ctx.restore();

  // What is left on the body itself: one tight, near-white bead at the tail.
  // Not a flame — the argument is that the burn is a point and the picture is
  // the track — but not nothing either, or the marks behind would have nothing
  // to have come out of.
  const [rx, ry] = at(r * 0.24, 0);
  halo(ctx, rx, ry, r * 0.26 * heat, PALETTE.sparkDim, heat * 0.9);
}
