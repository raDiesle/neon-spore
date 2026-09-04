import type { Point } from "@neon-spore/content";
import type { Color, Command, DragTarget } from "@neon-spore/sim";

/**
 * **What a hit test hands back**: what a drag and a lift continue to mean,
 * after the press that started them.
 *
 * Split out of `touch.ts` when the ship itself became touchable and that file
 * went past its 250-line limit, along the seam `touch-field.ts` was cut on:
 * next door is the decision procedure, and this — like the `Field` it is
 * handed — is a *shape*. Both are re-exported from `touch.ts`, so nothing
 * that already reached for a `Hold` or a `Touch` through that file had to
 * move.
 *
 * **A value and not a name, and that is the decision the eleven rounds still
 * to come inherit.** The press is the only moment anything knows *where* it
 * landed, so what a later move needs has to be handed back by it. `drag`
 * carries its origin for that reason: a string is turned by how far the hand
 * has come from where it grabbed, and once the hand has moved there is nothing
 * left to ask. `shot` carries one for the same reason and nothing else.
 *
 * So being draggable is a property of **the hold**, settled at the press — not
 * of the creature kind, since THE MAZE's string is not a creature, and not of
 * the drawing, which does not get to decide the control scheme. `id` is the
 * same argument one step further on: THE LID's cord *is* on a creature and a
 * wave may send three of them down at once, so which body the press landed on
 * is the second thing only the press can know. A draggable
 * element answers where the hand went; everything else answers only that a
 * hand is there. Whoever owns the canvas keeps this between the press and the
 * lift and hands it back untouched, so none of them learns what any of it
 * means and a new draggable element costs them nothing.
 *
 * `lance` follows nothing sideways — it is here because the *lift* matters:
 * the lobe fills for exactly as long as the thumb stays down, and nothing in
 * the simulation empties it on its own (`sim/lance.ts`).
 */
export type Hold =
  /**
   * The cannon, and the shield, wherever the hand took hold of them. `direct`
   * is set only when the press landed on the lobe **on the ship** rather than
   * on the strip in the band, and it changes nothing about what a move means:
   * both are absolute, both snap to a column. It is there so the ring that
   * says *you have hold of this* is drawn for a hand on the hull and not for a
   * thumb on a strip, which is where the owner drew the line — a strip already
   * shows what it is doing by being under the finger (`touch-ship.ts`).
   *
   * `suck` is where player 1's press on the cannon landed, and it is the same
   * kind of value `shot` carries below and for the same reason: a lift is a
   * tap only in relation to somewhere, and the press is the one moment
   * anything knows where. It is set only when the wave's panel actually has a
   * maw on it, so the presence of the field is the permission — nothing later
   * has to ask the control set again (`sucksOnLift`).
   */
  | { kind: "cannon"; direct?: true; suck?: Point }
  | { kind: "shield"; direct?: true }
  /**
   * Player 1's thumb resting on the shield lobe after triggering it. The guard
   * is sent by the press and the window is the simulation's from then on
   * (`sim/guard.ts`), so the hold says nothing on the lift — it exists only so
   * the ring stays lit while the thumb is still there.
   */
  | { kind: "guard" }
  | { kind: "grip" }
  | { kind: "lance" }
  /**
   * Player 2's thumb on the muzzle. The press says nothing at all — it is the
   * *lift* that fires, and which colour it fires is how far the muzzle was
   * carried from `originX` (`swipeColor`). A swipe that ends short of the
   * threshold fires nothing, which is what makes it a control a player can
   * change their mind inside.
   */
  | {
      kind: "shot";
      originX: number;
      /**
       * The one colour this panel has, when it has only one — the ladder's
       * first two rungs (`ControlSet.reduces`). Absent on a panel carrying
       * both, which is every wave from STANDARD 2 on.
       *
       * It rides on the hold for `suck`'s reason one case up: the permission
       * is read where the press is answered, and the lift is a long way from
       * anything that knows the wave. Left and right are the two lobes' own
       * order, and a seat with one lobe has no order to read — so a swipe
       * either way sends the colour that exists rather than half the gesture
       * firing nothing.
       */
      only?: Color;
    }
  | {
      kind: "drag";
      target: DragTarget;
      player: 1 | 2;
      originX: number;
      originY: number;
      id?: number;
    };

export interface Touch {
  player: 1 | 2;
  /**
   * What to tell the ship, or **null** for a press that takes hold of
   * something and says nothing yet — player 2's thumb landing on the muzzle
   * is the only one of those, and it stays silent until the lift decides
   * which colour it was.
   */
  command: Command | null;
  /** Null for a press that is over the moment it happens — a shot, a guard. */
  hold: Hold | null;
}
