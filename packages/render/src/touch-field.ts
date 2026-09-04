import type { ControlSet } from "@neon-spore/content";
import type { Creature, MazeState, SimConfig, WardenState } from "@neon-spore/sim";

/**
 * **What a hit test is handed**: the field as the control scheme needs to see
 * it, and nothing else.
 *
 * Split out of `touch.ts` when the drag grew its second axis and that file went
 * past its 250-line limit, along the seam `command-types.ts` was cut from
 * `types.ts`: this is a *shape*, and `touch.ts` next door is the decision
 * procedure that reads one. The shape is also the half that is scrolled past —
 * every field on it is a fact about the wave or the world that some hit test
 * happens to need, and each arrived one at a time with a paragraph explaining
 * why it is required rather than defaulted.
 *
 * Re-exported from `touch.ts`, so nothing that already reached for a `Field`
 * through that file had to move.
 */
export interface Field {
  creatures: readonly Creature[];
  /**
   * Where the two lobes are standing, in whole columns — the world's own
   * numbers, not the eased ones the renderer is carrying towards them.
   *
   * They are here because the ship became touchable where it is drawn
   * (`touch-ship.ts`), and they are **required and stated** for the reason
   * every field below is: a hit test that defaulted them to the middle column
   * would put both grab circles somewhere neither lobe is, and every press on
   * the hull would answer the wrong control or nothing at all.
   */
  cannonCol: number;
  shieldCol: number;
  /** 0..1 within the beat, so a grab lands on the creature as drawn. */
  beatPhase: number;
  /**
   * Whose hand a touch on the *field* is. The strips below say who they belong
   * to by where they are; the field belongs to both players, so it can only be
   * signed by the seat this screen holds.
   */
  seat: 1 | 2;
  /**
   * The numbers a hit test needs: the row THE WARDEN's rim hangs its tether
   * from (`creatureAt`), and how wide THE MAZE's drum stands. The whole config
   * rather than the one number picked out of it, which is what this was — the
   * second thing to want one would have been a second field to copy across.
   */
  cfg: SimConfig;
  /**
   * THE MAZE, if it is the boss running, `null` otherwise. **Required, and
   * stated rather than defaulted**, for the reason the comment under
   * `controls` gives: a caller that quietly meant `null` would leave the pilot
   * pressing a handle that is drawn and answers nothing.
   */
  maze: MazeState | null;
  /**
   * THE WARDEN, if it is the boss running, `null` otherwise. **Required, and
   * stated rather than defaulted**, for the same reason `maze` is: a caller
   * that quietly meant `null` would leave the pilot pressing a handle that is
   * drawn and answers nothing, which is the one failure this whole file exists
   * to prevent.
   */
  warden: WardenState | null;
  /**
   * The whole panel this wave is played on — both seats at once, never a
   * combination (`packages/content/src/control-sets.ts`).
   *
   * It is on the field for the same reason `wardenRow` is: this file is handed
   * a field, never a world, and which panel is up is a fact about the wave.
   *
   * It is **required** rather than defaulted, and that is the whole repair.
   * The band learned to walk a set and this file did not, so it went on
   * answering a fixed `l.lanceButton` whatever the wave said — the lance was
   * invisible on every ordinary wave and still primed under the thumb. A
   * default would put that back the first time a caller forgot to pass one;
   * a required field makes the compiler ask.
   */
  controls: ControlSet;
}
