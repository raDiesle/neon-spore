import type { Hold } from "@neon-spore/render";
import type { Command, DragTarget } from "@neon-spore/sim";

/**
 * **What one row of the ON THE FIELD tab is**, and nothing that fills one in.
 *
 * Split out of `field-controls-page.ts` when THE PUSH took that file past its
 * 250-line limit — the third cut that tab has taken and the first along this
 * seam. The two before it moved *lists* out (`tried-controls-page.ts`, and the
 * panel half into `controlsets-page.ts`); this one moves the *shape*, which is
 * the half that stopped changing years before the list did. What is left next
 * door is the list itself, which is the half that grows: a row per control the
 * game has learned to answer on the field.
 *
 * Re-exported from `field-controls-page.ts`, so nothing that already reached
 * for a `FieldControlDef` through that file had to move.
 */

/**
 * A control touched **on the field**, never on the panel below it — grabbed,
 * held or pressed directly against the creatures, the hull or a rope hanging
 * from a boss. None of these has a `ControlDef`: they follow from what a wave
 * *contains* (a maze, a warden, something falling), not from a panel it
 * names.
 *
 * `holdKind` and `dragTarget` exist so `on-field-controls.test.ts` can check
 * this array against `touch.ts`'s own types without retyping them: a new
 * `Hold` kind or `DragTarget` that this file does not mention fails that
 * test's exhaustive switch to *compile*, which is the closest a hand-kept
 * list can get to being derived from code that is a decision procedure
 * rather than a data table.
 */
export interface FieldControlDef {
  name: string;
  /** Where on the field it appears, and under what condition. */
  where: string;
  /** Which seat may use it — the field belongs to both, so this is the one
   * fact a strip's position already gives away for free and a field control
   * has to say out loud. */
  seat: string;
  gesture: "press" | "hold" | "grab and drag";
  does: string;
  /** The function in `touch.ts` (or, for the guide, in `briefing.ts`) that
   * answers this control — read the code there, this is only a pointer. */
  source: string;
  /** The `Hold["kind"]` this entry documents, or `null` where — like the
   * guide's hold — the control is deliberately answered outside `touch.ts`
   * altogether and no `Hold` variant exists for it. */
  holdKind: Hold["kind"] | null;
  /** Which rope, string or body this is — set on every entry that sends a
   * `drag`, and not only the ones whose hold is one: THE PUSH is a `grip` hold
   * that sends a `drag`, because carrying a body is the same gesture as
   * holding it. */
  dragTarget?: DragTarget;
  /**
   * What this gesture actually sends the ship.
   *
   * A hold kind was not enough to keep the list honest. One hold can carry
   * two gestures — a press on the cannon that slides it and a lift that opens
   * the maw are both `kind: "cannon"` — so a check that only asked whether
   * every kind had a row was satisfied by the first of them and would have
   * said nothing if THE MAW TAP had never been written down. The commands are
   * the gestures: `on-field-controls.test.ts` drives every shape of `Hold`
   * through `touchMove` and `touchUp` and fails on one that sends something
   * no entry here claims.
   */
  sends: readonly Command["kind"][];
}
