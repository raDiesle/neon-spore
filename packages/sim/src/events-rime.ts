import type { RimeAsk } from "./rime.js";

/**
 * What THE RIME says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The lens stands over the middle, so every one is there; the ones
 * about a half say which with `side`, the pilot's nought and the navigator's
 * one.
 */

interface RimeColEvent {
  /** The column it happened over. */
  col: number;
}

export type RimeEvent =
  /** The lens settles into frame, both halves frosted solid. */
  | ({ type: "rimeEnter" } & RimeColEvent)
  /** A step lit: a half to wipe, a shot at the core, or the shield against a surge. */
  | ({ type: "rimeLight"; ask: RimeAsk } & RimeColEvent)
  /** Fresh reversals shaved the lit half; `rimeMilli` is the frost left on it. */
  | ({ type: "rimeShave"; side: 0 | 1; rimeMilli: number } & RimeColEvent)
  /** A half wiped clear; `wipes` is how many it has taken now. */
  | ({ type: "rimeClear"; side: 0 | 1; wipes: number } & RimeColEvent)
  /** A wipe ran out: the half frosts back solid, to be wiped from its first wipe again. */
  | ({ type: "rimeFrost"; side: 0 | 1 } & RimeColEvent)
  /** Both halves clear and the core lies bare. */
  | ({ type: "rimeBare" } & RimeColEvent)
  /** The core shot in its colour; `hits` is how many it has taken. */
  | ({ type: "rimeHit"; hits: number } & RimeColEvent)
  /** A surge of frost turned by the shield: the lens stays bare. */
  | ({ type: "rimeBlock" } & RimeColEvent)
  /** A shield step ran out: the surge frosts the lens over, to be shielded again. */
  | ({ type: "rimeCloud" } & RimeColEvent)
  /** A fire step ran out with the core unshot: the hull takes it. */
  | ({ type: "rimeMiss" } & RimeColEvent)
  /** The script is done and the lens shatters. */
  | ({ type: "rimeShatter" } & RimeColEvent)
  /** The shattered lens has fallen `rimeShatterBeats`; the wave may end. */
  | ({ type: "rimeOut" } & RimeColEvent);
