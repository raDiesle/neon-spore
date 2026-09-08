import type { Creature } from "@neon-spore/sim";
import { drawDartJet } from "./dart.js";
import type { Layout } from "./layout.js";

/**
 * WHAT A DART'S THRUST LOOKS LIKE, as a record rather than as the body of one
 * function.
 *
 * `drawDartJet` was reached by name from `creatures.ts`, which made the one
 * mark this creature carries on *both* screens unarguable: a plume is a look,
 * a look is offered rather than replaced (CLAUDE.md), and there was nowhere
 * for a second answer to it to sit. This is the seam — `METEOR_LOOK`'s and
 * `DEFLECT_LOOK`'s, in a file of its own for the reason theirs are: `dart.ts`
 * is at the line ceiling and holds the lean, the flip, the heat and the
 * navigator's arrow, none of which is a layer of the exhaust.
 *
 * Nothing here changes a pixel. `creatures.ts` calls this in the place and the
 * transform it called `drawDartJet` in, and `DART_LOOK.jet` **is**
 * `drawDartJet`. It is the same flame; it is now a flame somebody can offer
 * another answer to.
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

/** The shipped thrust: a filled tongue back along the diagonal, three soft
 * balls down it and a near-white root. `dart.ts` holds the arithmetic. */
export const DART_LOOK: DartLook = { jet: drawDartJet };
