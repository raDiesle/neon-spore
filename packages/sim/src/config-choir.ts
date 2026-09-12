/**
 * THE CHOIR's numbers: how far a hand has to carry an arrow, how long the pair has between the two of them, what the
 * song costs the hull and what the merge is worth (`choir.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-recoil.ts` and `config-ghost.ts` already give: every call site still
 * reads `cfg.choirWindowBeats`, and the split is only about how much of one
 * file a reader has to hold at once.
 *
 * **Its own file rather than four more rows in `config-creatures.ts`.** THE
 * RECOIL's file next door makes the argument these five make more strongly:
 * the four are decided **together**. How far the hand travels, how long it has to
 * make the second trip and what failing costs are one decision about how hard
 * the gesture is, and a reader who moves one has to move the other two.
 */
export interface ChoirConfig {
  /**
   * Thousandths of a tile a hand has to carry an arrow, **outward**, before
   * that arrow counts as moved. A tile and a half: far enough that a thumb
   * resting against the edge of the glass never sends one by accident, short
   * enough that both trips fit inside the window below on a phone held in one
   * hand.
   */
  choirPullMilli: number;
  /**
   * Beats between the first arrow moving and the second having to. Two, and
   * the owner named the number while the creature was being designed. It is
   * the shortest interval that is still a *thing said out loud* rather than a
   * reflex — at one beat the pilot is racing their own hand, and at four the
   * two gestures stop being one gesture and the field goes quiet between them.
   */
  choirWindowBeats: number;
  /**
   * Beats the two bodies take to draw together once the gesture has landed.
   *
   * One, and it is the length of the *picture* rather than a difficulty dial:
   * the owner asked to watch two become one and then see the colour arrive,
   * and a beat is long enough to read as a movement and short enough that the
   * pair is not standing over a body they cannot shoot while the wave goes on
   * around them. Nothing about it is a penalty — the gesture has already
   * succeeded by the time this starts.
   */
  choirFuseBeats: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const CHOIR_DEFAULTS: ChoirConfig = {
  choirPullMilli: 1500,
  choirWindowBeats: 2,
  choirFuseBeats: 1,
};
