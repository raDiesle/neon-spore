import type { ClingKind } from "./cling.js";

/**
 * **Everything THE LIMPET and THE LEECH do**, as events: one takes hold of a
 * control, is shaken a move looser, lets go, or goes off. Its own file on
 * `events-choke.ts`' terms — one arrival taken apart — and one arm of
 * `CreatureEvent`, so every consumer still switches over the whole list.
 * `kind` on every one, because the two are one module and one ear, and the
 * plate and the cannon are told apart by it.
 *
 * There is no event for a beat the control stood still. The count that beat
 * moved is read off the world every frame by the one seat that is shown it
 * (`render/cling.ts`), and a sound on it would tell the other seat too.
 */
export type ClingEvent =
  /**
   * One came to rest on the ship and took its control. Pushed on the beat
   * it is drawn standing on the hull; `from` is the lane it fell down and
   * `col` the control's column, which is where it is from now on.
   */
  | { type: "clingGrip"; id: number; kind: ClingKind; col: number; row: number; from: number }
  /**
   * The control was found in a new column on the beat: one move of the
   * `of` that shake it off. `moves` is how many so far.
   */
  | { type: "clingShake"; kind: ClingKind; col: number; moves: number; of: number }
  /** Shaken off, and gone. `col` is the control's column as it lets go. */
  | { type: "clingFreed"; kind: ClingKind; col: number; row: number }
  /**
   * The control stood still for the whole fuse and the body went off: a
   * heavy breach at `col`, which `breachHull` has already pushed as its own
   * event. This one is the blast itself, for the ear and the flash.
   */
  | { type: "clingBlast"; kind: ClingKind; col: number; row: number };
