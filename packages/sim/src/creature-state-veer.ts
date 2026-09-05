import type { VeerDir } from "./veer.js";

/**
 * **THE VEER's two fields**, a side and a width, and together they are the
 * whole of what a change of lane still to come looks like.
 *
 * Its own file rather than two more entries in `creature-state.ts`, which was
 * one line under the 250-line limit the day the width was added — the
 * immediate reason, and the same one `creature-state-strand.ts` and
 * `config-veer.ts` each record for themselves. `CreatureState extends
 * VeerState`, so every call site still reads `c.veerDir` and nothing moved.
 */
export interface VeerState {
  /**
   * Which side THE VEER's next change of lane takes (`-1` left, `1` right),
   * and absent on every other kind — so a rock that holds its lane carries no
   * field at all and every wave written before this creature is byte-for-byte
   * the same world.
   *
   * It is most of its state, because *when* it changes lane is not stored at
   * all: the three changes happen on three fixed rows, so how many are left
   * is read off `row` (`veerChangesLeft`) rather than counted down. Read the
   * side through `veerHeading` and never directly — the arrow on player 1's
   * screen, the rider's lean on both, and the column the body actually steps
   * into are three readings of one number, and a second copy of the fallback
   * is how the pair comes to be told a side the rock does not take.
   */
  veerDir?: VeerDir;
  /**
   * How wide THE VEER's next change of lane is, in columns — one to
   * `veerMaxDist`, rolled fresh alongside `veerDir` and absent wherever it is.
   * Read through `veerDist` and never directly, for `veerDir`'s own reason:
   * the number drawn above the rider's arrow and the width the body actually
   * steps are one fact, and a second copy is how the two would ever disagree.
   */
  veerDist?: number;
}
