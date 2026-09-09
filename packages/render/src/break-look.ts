import { facet, type PiecePaint } from "./break-piece.js";
import type { Fracture } from "./shatter.js";
import type { Fall } from "./shatter-fall.js";

/**
 * THE ONE RECORD A CANDIDATE **BREAK** PATCHES.
 *
 * `magnet-look.ts`'s kind, and the same reasons: a record rather than a named
 * function, so a candidate look is a field patched onto it for the length of
 * one `draw()` and the call site never learns anything about it
 * (`docs/versus.md`).
 *
 * **`wedges` was 0 until 9 September 2026, and the shipped picture was
 * therefore nothing.** The game's answer to "what does a body come apart into"
 * had always been "no pieces at all" — a dozen three-pixel squares thrown from
 * where it stood (`effects-spark.ts`) and not one fragment of the thing that
 * died, so a slick and a bulb and a throb all came apart identically and none
 * of them came apart into anything.
 *
 * `creature:break` / `shatter` argued that the pieces should be pieces *of that
 * body*, and the owner took it. The fracture is cut from the same contour
 * `livingPath` draws with (`shatter.ts`), so the pieces put back together are
 * the body again with no gaps, and the cut faces — the surfaces that were
 * *inside* it, which no player had ever seen — are dark where the rim is
 * bright. Nine wedges cut again at half their reach is the tuning `bun run
 * breaks` settles on: a shattered core and slabs of skin off the rim, the
 * difference between a body quartered and a body that took a hit. Then they
 * fall, land on the hull and fade there, which is the owner's own answer to
 * whether a break may leave anything behind.
 *
 * **The sparks came down to two fifths in the same breath**, and `sparkScale`
 * exists for exactly that: eighteen fragments *and* twelve squares is the old
 * effect playing on top of the new one. What is left of the squares is the
 * flash — the instant of the hit, which the fracture is too slow to carry.
 *
 * **What to watch for, because the candidate's own card named it.** The column
 * has to stay readable. Two people calling columns to each other need a lane to
 * be clear the moment it is clear, and this puts eighteen fragments in one for
 * most of a second and then leaves them lying on the ship. Hesitation over
 * whether something is still falling in a lane already cleared is this look,
 * and no amount of fading fixes it — the debris *is* the claim.
 *
 * `Debris` reads this on the frame a body is destroyed and never again, so a
 * patch applied mid-flight does not retune pieces already in the air — which is
 * correct, and is the same rule `Sparks` follows.
 */
export interface BreakLook {
  /**
   * How many wedges a destroyed body is cut into, and the switch: under three
   * there is no fracture and `Debris` spawns nothing at all.
   */
  readonly wedges: number;
  /** Where the inner ring ends — `Fracture.innerAt`, and 1 for a single ring. */
  readonly innerAt: number;
  /** How fast a piece leaves, **in tiles per second** rather than in pixels, so
   * a break is the same size relative to a body on every phone. */
  readonly speedTiles: number;
  /** Turn rate before the per-piece jitter, radians per second. */
  readonly spin: number;
  /** Downward pull, tiles per second squared. */
  readonly gravityTiles: number;
  /** How long a piece is on screen, seconds. */
  readonly life: number;
  /** The share of `life` spent fading, 0..1. */
  readonly fade: number;
  /** How much speed a piece keeps along the band when it lands. */
  readonly skid: number;
  /**
   * How many sparks the ordinary kill throws, as a multiple of the count
   * `effects-spark.ts`'s own table names. One ships. It is here rather than in
   * that table because a candidate that gives a body *pieces* has to be able to
   * take the squares back down in the same breath — twelve particles over a
   * fracture is the old effect playing on top of the new one, and a pair
   * judging the pieces would be judging the pair of them.
   */
  readonly sparkScale: number;
  /** How one piece is painted. */
  readonly paint: (ctx: CanvasRenderingContext2D, p: PiecePaint) => void;
}

export const BREAK_LOOK: BreakLook = {
  wedges: 9,
  innerAt: 0.5,
  speedTiles: 1.2,
  spin: 6,
  gravityTiles: 14,
  life: 1,
  fade: 0.4,
  skid: 0.3,
  sparkScale: 0.4,
  paint: facet,
};

/** The cut this record asks for, at one place and one seed — the one route from
 * a look to a `Fracture`, so a caller never assembles one by hand. */
export function fractureFrom(look: BreakLook, tile: number, seed: number): Fracture {
  return {
    ox: 0,
    oy: 0,
    wedges: look.wedges,
    innerAt: look.innerAt,
    speed: look.speedTiles * tile,
    spin: look.spin,
    seed,
  };
}

/** And the flight, on the same terms. `floor` is where the band is, in the same
 * body-local units the cut is in — the caller is the only one who knows. */
export function fallFrom(look: BreakLook, tile: number, floor?: number): Fall {
  return {
    gravity: look.gravityTiles * tile,
    life: look.life,
    fade: look.fade,
    floor,
    skid: look.skid,
  };
}
