import { CANDLE_PHASES, type CandleState } from "./candle.js";

/**
 * What THE CANDLE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `undertow-hash.ts` is one: `hash-boss.ts`
 * grows by a whole boss at a time.
 *
 * **The two columns are the fields that matter most.** One is where a shot
 * has to leave the field to land, the other is the column one seat is being
 * told not to fire from — two devices disagreeing about either would have
 * the pair aiming at two different glows in two different darks. The glow
 * is the health; the two beats are the origins of the drift and the turn.
 */
export function candleHashParts(c: CandleState): number[] {
  return [
    CANDLE_PHASES.indexOf(c.phase),
    c.phaseBeat,
    c.glow,
    c.col,
    c.faceCol,
    c.moveBeat,
    c.turnBeat,
  ];
}
