import type { Command } from "./types.js";

/**
 * **Everything THE STARE does that neither screen already says**, as one arm
 * of `SimEvent`.
 *
 * Its own file on `events-splice.ts`' terms exactly — one boss taken apart
 * rather than incidents that share a body. The state is on both screens as
 * world every frame (`stare.ts`); what is here is the *moments*, and since the
 * rebuild of 29 September 2026 most of them are sounds: a beat of the
 * pattern is the music the pair learns (`packages/audio/src/bind-stare.ts`).
 */
export type StareEvent =
  /**
   * One beat of a pattern. `open` when the eye opens on it; `teach` on the
   * blue pass, where it costs nothing. `step` is the beat's place in the
   * pattern, so the music can put the downbeat on 0.
   */
  | { type: "stareBeat"; open: boolean; teach: boolean; step: number; level: number }
  /**
   * A seat moved on an open beat. `command` is the press itself, for the
   * picture's flash on the button that did it (`render/src/stare-fx.ts`);
   * `col` is where the laser struck — the column the cannon was sent to.
   */
  | { type: "stareCaught"; player: 1 | 2; command: Command; col: number }
  /** A bolt hit the shut eye and the level is over. `level` is the one just ended. */
  | { type: "stareHit"; level: number; last: boolean }
  /** A pass ran out with no hit and the eye began to charge its beam. */
  | { type: "stareCharge"; pass: number }
  /** `player` pulled the lid in time and the beam vented out to the sides. */
  | { type: "stareVent"; player: 1 | 2 }
  /** Nobody pulled the lid: the beam comes down the middle onto the hull. */
  | { type: "stareBlast"; col: number }
  /** Three passes without a hit: the level starts again from its blue pass. */
  | { type: "stareAgain"; level: number }
  /** The eye is out and the boss is gone. */
  | { type: "stareOut" };
