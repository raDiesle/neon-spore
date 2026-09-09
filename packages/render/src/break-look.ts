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
 * What is unusual here, and worth saying plainly rather than leaving for
 * somebody to work out: **the shipped value of `wedges` is 0, and the shipped
 * picture is therefore nothing.** Every other look record on this page carries
 * the game's own paint and a candidate argues with it. This one carries the
 * game's own *answer*, and the game's answer to "what does a body come apart
 * into" has always been "no pieces at all" — a dozen three-pixel squares thrown
 * from where it stood (`effects-spark.ts`) and not one fragment of the thing
 * that died. So the left-hand side of this pair is a real state of the game and
 * not an empty seam: it is what the field draws today, and it draws no debris.
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
  wedges: 0,
  innerAt: 1,
  speedTiles: 2.6,
  spin: 5,
  gravityTiles: 11,
  life: 1.1,
  fade: 0.45,
  skid: 0.25,
  sparkScale: 1,
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
