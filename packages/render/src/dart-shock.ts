import { type Creature, dartHeading } from "@neon-spore/sim";
import { dartHex, dartThrust } from "./dart.js";
import { BODY, jetReach, torchJet } from "./dart-torch.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * SHOCK — the flame has **structure inside it**: three bright knots strung
 * down its axis, the way a thrust that is actually pushing something does.
 *
 * It arrived as `creature:dart` / `shock` on VERSUS and the owner took it into
 * the game on 10 September 2026, over BRAID and a trail of cooling embers —
 * both of which, with the flame this draws over, are on the SHAPES tab's TAIL
 * axis now (`tools/director/src/tails/`), where a mark behind a falling body
 * is kept beside the others of its kind.
 *
 * **What it adds, and what it leaves alone.** The shipped flame (`torchJet`)
 * is drawn first and whole: a dim wide envelope, the body colour, a hot narrow
 * core, each a smooth gradient from the nozzle to nothing — a good flame and a
 * completely even one, so the shape reads but the *volume* does not. The one
 * thing an exhaust has that a smear does not is a repeating mark. Three knots
 * sit along the axis at fixed fractions of the reach, each smaller and dimmer
 * than the one before it, and each breathes on its own clock — rates that are
 * not multiples of one another, which is the difference between three lamps
 * and a flame. Same silhouette, with an interior.
 *
 * The reach, the heat, the direction and the flicker are the flame's own and
 * are asked for rather than restated (`jetReach`, `dartThrust`,
 * `dartHeading`): a knot on a length of its own would drift off the flame the
 * moment the flame breathed.
 *
 * **Where it can lose.** Three round marks in a line is what a chain of
 * bubbles looks like, and at the width the field draws a dart the knots are a
 * few pixels apart. Watch it against THE STRAND, whose whole creature is
 * bodies threaded on a line.
 */

/** Where the knots sit along the flame, as shares of the reach, and how big
 * each is as a share of the body radius. Nearest is biggest: a thrust is
 * hottest where it leaves the nozzle and everything after that is cooling. */
const KNOT_AT = [0.22, 0.46, 0.72] as const;
const KNOT_SIZE = [0.34, 0.24, 0.15] as const;

/** Radians per beat each knot breathes at, and how deep. Three rates that are
 * not multiples of one another, so the knots never pulse together — parts that
 * breathe on the same beat read as one flat object. */
const PULSE_RATE = [23, 31, 41] as const;
const PULSE = 0.26;

export function shockJet(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  beatPhase: number,
): void {
  torchJet(ctx, l, c, x, y, beatPhase);
  const heat = dartThrust(c, beatPhase);
  if (heat <= 0.01) return;
  const dir = dartHeading(c);
  const r = l.tile * BODY;
  const reach = jetReach(r, heat, c, beatPhase);
  // Back up the diagonal the body is running down — a direction and not a
  // distance, `torchJet`'s own vector.
  const bx = -dir * Math.SQRT1_2;
  const by = -Math.SQRT1_2;
  const hex = dartHex(c);
  for (let i = 0; i < KNOT_AT.length; i++) {
    const at = KNOT_AT[i] ?? 0;
    const size = KNOT_SIZE[i] ?? 0;
    const rate = PULSE_RATE[i] ?? 0;
    const beat = 1 + PULSE * Math.sin(beatPhase * rate + c.id + i);
    const along = reach * at;
    // The body's own colour under a narrow pale centre: the same two lights
    // every other glow in this game is made of, and the pale one is gone
    // within a fifth of the mark.
    halo(ctx, x + bx * along, y + by * along, r * size * beat, hex, heat * 0.55);
    halo(ctx, x + bx * along, y + by * along, r * size * beat * 0.4, PALETTE.sparkDim, heat * 0.5);
  }
}
