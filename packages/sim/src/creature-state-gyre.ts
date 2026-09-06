/**
 * **THE GYRE's four**: the two the hub carries and the two a body on its rim
 * does.
 *
 * The fifth group to leave `creature-state.ts`, cut out when THE COIL's two
 * took that file past its 250-line limit again — on the terms the four before
 * it set and which that file's own header states: a set of fields that only
 * mean anything against each other belongs together, and next door is the list
 * of fields that mean something on their own.
 *
 * These four are the plainest case of it in the game. A hub's turn and its age
 * say nothing at all without each other, a mount's wheel and slot say nothing
 * without the hub's two, and no reader ever wants one of the four alone — where
 * the six bodies stand is one arithmetic over all of them (`gyre-rim.ts`).
 *
 * `CreatureState` extends this rather than nesting it, so every call site still
 * reads `c.gyreStep` and nothing moved.
 */
export interface GyreState {
  /**
   * THE GYRE's two hub fields, and `gyre.ts` is the whole of what they mean.
   * `gyreTurnMilli` is how far the wheel has turned, in thousandths of a rim
   * position, wrapped at `GYRE_TURN_MILLI` so it stays a bounded integer;
   * `gyreStep` is how many beats it has been on the field, which is its route
   * and its speed at once — how far it has fallen, which corner of the diamond
   * it is walking to, how many laps it has sunk and how fast the rim is going
   * are all read off it.
   *
   * Thousandths and not whole clicks, for `dragMilli`'s reason: the rim
   * accelerates, so the turn one beat buys is a fraction of a position and the
   * remainder has to be carried rather than rounded away, or the wheel would
   * have three speeds. Read them through `gyreClick`, `gyreAt` and
   * `gyreSpinPerBeat` (`gyre-rim.ts`) and never by hand — where the six bodies
   * stand, where the spokes are drawn and which column a shot has to be fired
   * up are four readings of the same two numbers.
   */
  gyreTurnMilli?: number;
  gyreStep?: number;
  /**
   * A mount's two, and absent on everything that is not one. `gyreId` is the
   * hub it rides and its presence *is* the attachment — `carryMounts` moves
   * whatever names one and `gyreMountsLeft` counts the same field to decide
   * when the wheel breaks — and `gyreSlot` is which of the six positions on
   * the rim, 0..5, which fixes the mount's colour (`mountColor`) as well as
   * its place, so the alternation around the rim is one fact and not two.
   */
  gyreId?: number;
  gyreSlot?: number;
}
