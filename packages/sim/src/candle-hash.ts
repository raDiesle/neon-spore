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
 *
 * **The pull is in too**, and it is the field a lane would have been tempted
 * to leave out: it is a thumb's depth, it is gone the tick the thumb lifts,
 * and it never decides anything but the one tick it crosses the bottom on.
 * That tick is the phase changing, so a device that disagreed about the depth
 * would disagree about when the wick started smoking — which is the clock the
 * beam is raced against (CLAUDE.md, rule 4).
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
    c.pinchMilli,
  ];
}
