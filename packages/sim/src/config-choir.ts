/**
 * THE CHOIR's numbers: how many turns the pair rubs together, how close
 * together the two seats' turns have to be, how long the pair has, and how
 * long the merge takes (`choir.ts`, `choir-rub.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-recoil.ts` and `config-ghost.ts` already give: every call site still
 * reads `cfg.choirWindowBeats`, and the split is only about how much of one
 * file a reader has to hold at once.
 *
 * **Its own file rather than four more rows in `config-creatures.ts`.** THE
 * RECOIL's file next door makes the argument these five make more strongly:
 * these are decided **together**. How many turns, how close the two seats'
 * turns, and how long a pause lapses are one decision about how hard the
 * gesture is, and a reader who moves one has to move the others.
 */
export interface ChoirConfig {
  /**
   * Turns of the rub made together — by either seat, while the other is
   * rubbing too — that draw the membranes together. Eight: two seats scrubbing
   * at an easy four turns a second make it in a second, which is a gesture
   * made together rather than a race (THE RUB LAB's 8 TURNS).
   */
  choirRubTurns: number;
  /**
   * Beats since the other seat's last turn inside which a turn still counts
   * as made together. One — THE RUB LAB's BOTH AT ONCE: long enough that two
   * thumbs scrubbing at their own pace overlap, short enough that one seat
   * cannot rub now and the other later.
   */
  choirTogetherBeats: number;
  /**
   * Beats between the first shake and the second having to land, and the
   * longest a rub may stop being made together before it lapses. Two, and
   * the owner named the number while the creature was being designed. It is
   * the shortest interval that is still a *thing said out loud* rather than a
   * reflex — at one beat the pilot is racing their own hand, and at four the
   * two moves stop being one gesture and the field goes quiet between them.
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
  choirRubTurns: 8,
  choirTogetherBeats: 1,
  choirWindowBeats: 2,
  choirFuseBeats: 1,
};
