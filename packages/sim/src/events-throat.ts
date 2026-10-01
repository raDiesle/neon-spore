import type { ThroatMode } from "./throat.js";

/**
 * **What THE THROAT does that neither screen already says**, as four events:
 * the colour set, the swallow, the refusal and the ending.
 *
 * Its own file on `events-vane.ts`' terms: one boss, one arm of `SimEvent`,
 * and a file `packages/audio/test/bind.test.ts` has to be told the name of.
 *
 * The colour is both seats', because a seat sets only two of the four and the
 * other has to hear the mouth change under the body it is carrying to it. The
 * swallow is the ring going slack, which is the whole of the fight's
 * progress. The refusal is the mistake costing nothing but time, and it has a
 * sound so the pair learns it was the colour and not the aim. The eversion is
 * the ending.
 *
 * All four carry the column the mouth is over, because the pan is the whole of
 * what a fixture can say about *where* — nothing of the gullet is among
 * `world.creatures`.
 */
export type ThroatEvent =
  /** A seat set the mouth's colour. */
  | { type: "throatMode"; col: number; mode: ThroatMode }
  /** A body in the right colour went down the gullet: a ring goes slack. */
  | { type: "throatSwallow"; col: number }
  /** A body in the wrong colour was in the circle: it shakes and stays. */
  | { type: "throatRefuse"; col: number; part: ThroatMode; player: 1 | 2 }
  /** The last ring went slack: the tube turns through its own mouth. */
  | { type: "throatEvert"; col: number };
