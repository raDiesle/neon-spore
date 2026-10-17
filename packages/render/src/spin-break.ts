import { BREAK_LOOK, type BreakLook } from "./break-look.js";
import { mix32 } from "./hash.js";
import { type Flight, fadeAt } from "./shatter-fall.js";

/**
 * THE SLICK's and THE BULB's death: a break that **turns**, and a different
 * turn each kill.
 *
 * Asked for by the owner by name on 16 October 2026 — "random rotating cool
 * animations for slick and bulb when they are destroyed". The two bodies on
 * more waves than anything else were coming apart the same way every time:
 * nine wedges opening slowly where they stood. Now each kill is one of four,
 * picked from the kill's seed (`killSeed`) so both phones watch the same one:
 *
 * - **VORTEX** — the pieces leave on a spiral, the whole break wheeling round
 *   where the body stood and slowing as it opens.
 * - **PINWHEEL** — the body holds together and whirls up for a fifth of a
 *   second, then flings its pieces still turning.
 * - **WRING** — the core and the rind twist opposite ways, so the body tears
 *   itself along the ring before it opens.
 * - **TUMBLE** — the shipped drift thrown harder, every piece tumbling fast.
 *
 * and each of the first three turns either way. The cut is the shipped one —
 * nine wedges cut again at half their reach — so what changes is the motion
 * alone, and the sparks are the shipped two fifths.
 *
 * **A whirl never lands.** Its pieces hang and fade the way `drift` taught
 * the shipped break to; a floor under a spiral is a root nobody can solve in
 * closed form, and a closed form is the one thing `shatter-fall.ts` insists
 * on. So `landed` is always false and `floor` is ignored.
 */

/** How a break wheels round where the body stood. */
export interface Whirl {
  /** Radians per second the break wheels at its fastest. Signed. */
  readonly orbit: number;
  /** Seconds the body holds together, winding up to `orbit`, before the
   * pieces leave. 0 is a break that starts at full speed. */
  readonly hold: number;
  /** Seconds for the turn to bleed away once the pieces are free. */
  readonly ease: number;
  /** Whether the core turns against the rind. */
  readonly wring: boolean;
}

/** Where a core piece ends and a rind piece starts, in `Shard.depth`. The core
 * of a twice-cut wedge sits at a quarter and the rind at one (`shatter.ts`). */
const RIND = 0.5;

/** How far the break has turned at `t`: a quadratic wind-up over `hold`, then
 * the exponential's tail — continuous in angle and in speed at the join. */
function turnAt(w: Whirl, t: number): number {
  if (t <= w.hold) return w.hold > 0 ? (0.5 * w.orbit * t * t) / w.hold : 0;
  const after = t - w.hold;
  return 0.5 * w.orbit * w.hold + w.orbit * w.ease * (1 - Math.exp(-after / w.ease));
}

/** A flight that whirls: thrown along the cut's own ray, the whole picture
 * wheeled round the body's middle, the pull added after the turn so down stays
 * down. */
export function whirl(w: Whirl): Flight {
  return (s, t, f) => {
    const held = Math.max(0, Math.min(t, f.life));
    const turn = turnAt(w, held) * (w.wring && s.depth < RIND ? -1 : 1);
    const u = Math.max(0, held - w.hold);
    const px = s.x + s.vx * u;
    const py = s.y + s.vy * u;
    const c = Math.cos(turn);
    const sn = Math.sin(turn);
    return {
      x: px * c - py * sn,
      y: px * sn + py * c + 0.5 * f.gravity * u * u,
      angle: turn + s.spin * u,
      alpha: fadeAt(held, f),
      landed: false,
    };
  };
}

function vortex(dir: number): BreakLook {
  return {
    ...BREAK_LOOK,
    speedTiles: 0.55,
    spin: 3,
    gravityTiles: 0.5,
    life: 1.2,
    flight: whirl({ orbit: 10 * dir, hold: 0, ease: 0.3, wring: false }),
  };
}

function pinwheel(dir: number): BreakLook {
  return {
    ...BREAK_LOOK,
    speedTiles: 0.85,
    spin: 4,
    gravityTiles: 0.5,
    life: 1.3,
    flight: whirl({ orbit: 18 * dir, hold: 0.22, ease: 0.4, wring: false }),
  };
}

function wring(dir: number): BreakLook {
  return {
    ...BREAK_LOOK,
    speedTiles: 0.5,
    spin: 2,
    gravityTiles: 0.5,
    life: 1.3,
    flight: whirl({ orbit: 12 * dir, hold: 0.16, ease: 0.3, wring: true }),
  };
}

/** The shipped flight, harder: no whirl, every piece on its own fast turn, and
 * a pull strong enough that some of them land. `shatter.ts` signs each piece's
 * spin itself, so this one has no direction to pick. */
export const TUMBLE: BreakLook = { ...BREAK_LOOK, speedTiles: 0.75, spin: 11, gravityTiles: 1.4 };

/** The other three, turning anticlockwise on screen — named for the bench
 * (`tools/breaks`), which draws one row of each. */
export const VORTEX = vortex(1);
export const PINWHEEL = pinwheel(1);
export const WRING = wring(1);

/** Every look a kill can come out as, built once: a pick allocates nothing. */
export const SPIN_BREAKS: readonly BreakLook[] = [
  VORTEX,
  vortex(-1),
  PINWHEEL,
  pinwheel(-1),
  WRING,
  wring(-1),
  TUMBLE,
];

/** Which of them one seed comes apart by. Mixed first, because `shatter.ts`
 * reads the raw seed for its cut and the two must not move together. */
export function spinBreakFor(seed: number): BreakLook {
  return SPIN_BREAKS[mix32(seed) % SPIN_BREAKS.length] as BreakLook;
}

/** The record `SLICK_HIT` and `BULB_HIT` carry. Its own fields are the shipped
 * break's, so `breakSparks` reads the shipped two fifths off it; the pieces are
 * whichever look `pick` answers. A candidate patching a field here patches
 * nothing the pieces read — it patches `SPIN_BREAKS` or replaces `pick`. */
export const SPIN_BREAK: BreakLook = { ...BREAK_LOOK, pick: spinBreakFor };
