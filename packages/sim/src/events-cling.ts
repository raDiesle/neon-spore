import type { ClingKind } from "./cling.js";

/**
 * **Everything THE LIMPET and THE LEECH do**, as events: one takes hold of a
 * control, lets go of it, or goes off. Its own file on `events-gum.ts`' terms
 * — one arrival taken apart — and one arm of `CreatureEvent`, so every consumer
 * still switches over the whole list. `kind` on every one, because the two are
 * one module and one ear, and the plate and the cannon are told apart by it.
 *
 * **`clingShake` was the fourth** — *the control was found in a new column, one
 * move of the several that shake it off* — and it went with the shake on 15
 * September 2026, when these two stopped being creatures a wave spawns and
 * became a pencil the lantern fires (`harpoon.ts`). Nothing replaced it: under
 * a fault a move is not progress toward getting the body off, it is the whole
 * of what the pair has to keep doing, and what says so is the danger glow going
 * back to nought (`render/harpoon-danger.ts`) rather than a sound.
 *
 * There is no event for a control that stood still either. How near the round
 * is to being lost is read off the world every frame by both screens, and an
 * event on it would be a second clock to keep in step with the first.
 */
export type ClingEvent =
  /**
   * One took its control. Pushed on the beat the fault fires it, which is the
   * first beat of the placement; `col` is the control's column, and `from` is
   * that same column — the body comes out of the lantern rather than down a
   * lane, and the line it came down is drawn from there
   * (`render/harpoon-line.ts`).
   */
  | { type: "clingGrip"; id: number; kind: ClingKind; col: number; row: number; from: number }
  /** Reeled home, and gone: the placement's own length ran out and the thing
   * that fired it called it back. `col` is the control's column as it lets
   * go. */
  | { type: "clingFreed"; kind: ClingKind; col: number; row: number }
  /**
   * The control stood still for the whole count and the body went off: a heavy
   * breach at `col`, which `breachHull` has already pushed as its own event.
   * This one is the blast itself, for the ear and the flash.
   */
  | { type: "clingBlast"; kind: ClingKind; col: number; row: number };
