import type { Creature } from "@neon-spore/sim";
import { shockJet } from "./dart-shock.js";
import type { Layout } from "./layout.js";

/**
 * WHAT A DART'S THRUST LOOKS LIKE, as a record rather than as the body of one
 * function.
 *
 * The plume was reached by name from `creatures.ts`, which made the one mark
 * this creature carries on *both* screens unarguable: a plume is a look, a
 * look is offered rather than replaced (CLAUDE.md), and there was nowhere for
 * a second answer to it to sit. This is the seam — `METEOR_LOOK`'s and
 * `DEFLECT_LOOK`'s, in a file of its own for the reason theirs are: `dart.ts`
 * holds the lean, the flip, the heat and the navigator's arrow, none of which
 * is a layer of the exhaust.
 *
 * **The second answer won.** What the game drew was a filled triangle with its
 * base against the body and its apex a tile away — the profile of a *beam*,
 * widest where it starts and coming to a point, which is what a lance and
 * every aimed thing in this game looks like and the one thing a dart's thrust
 * must not be confused with. A dart is not shooting; it is being thrown.
 * `torchJet` (`dart-torch.ts`) turns the two ends round: the flame leaves the
 * tail narrow, opens into a belly a third of the way back, and frays out into
 * a gradient that reaches nothing before the shape closes, so what ends the
 * flame is the flame running out.
 *
 * **The rule is untouched, and that is the discipline of it.** The heat comes
 * from `dartThrust`, the direction from `dartHeading`, and the length from the
 * same `0.9 + 2.1 · heat` the triangle used. Everything that changed is a
 * width or an alpha.
 *
 * The triangle is not gone, it is rehoused: PLUME on the SHAPES tab's TAIL
 * axis (`tools/director/src/tails/plume.ts`) is that exact shape, so a look
 * the game stopped drawing can still be looked at beside the five other things
 * a falling body can leave behind it.
 */
export interface DartLook {
  /**
   * Everything the thrust puts on screen, in field pixels, before the body is
   * drawn over it. `x`/`y` is the dart's own centre and `beatPhase` is where
   * in the beat it is — the two things `dartThrust` reads the heat off, handed
   * in rather than recomputed, because a second reading of that curve is a
   * flame burning on a clock the creature is not on.
   */
  jet(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    c: Creature,
    x: number,
    y: number,
    beatPhase: number,
  ): void;
}

/** The shipped thrust: the flame that leaves the tail narrow, bellies out and
 * frays into nothing (`dart-torch.ts`), with three knots breathing down its
 * axis (`dart-shock.ts`) — the owner took SHOCK over the bare flame on
 * 10 September 2026. */
export const DART_LOOK: DartLook = { jet: shockJet };
