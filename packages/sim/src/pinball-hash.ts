import { PIN_SHOTS, PINBALL_PHASES, type PinballState } from "./pinball.js";
import { pinPieceParts } from "./pinball-board.js";

/**
 * What PINBALL puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `snake-hash.ts` and `vane-hash.ts` are ones:
 * `pinball-board.ts` is the table's arithmetic and this was the longest block
 * in it that is not about a table at all — every line here is about what two
 * devices could come to disagree about. It came out the day the round gained
 * two hands on its own picture and took that file over its 250-line limit.
 */

/**
 * Every number PINBALL contributes to the world fingerprint.
 *
 * Here rather than in `hash-boss.ts` for `mazeHashParts`' reason: the ball is
 * four integers and every one of them is the fight — two devices a thousandth
 * apart on a velocity take the next bounce off a different side of a peg, and
 * by the third they are playing different tables. The authored boards are in
 * for THE FLEET's reason, and `alive` because it is what a board has become.
 *
 * The type is imported for its shape only, so nothing here runs against
 * `pinball.ts` and the two files do not close a cycle.
 */
export function pinballHashParts(boss: PinballState): number[] {
  const out: number[] = [];

  out.push(PINBALL_PHASES.indexOf(boss.phase));
  out.push(boss.phaseBeat);
  out.push(boss.openBeat);
  out.push(boss.passed ? 1 : 0);
  out.push(boss.round);
  out.push(boss.roundBeat);
  out.push(PIN_SHOTS.indexOf(boss.shot));
  out.push(boss.angleMilli);
  out.push(boss.angleDir);
  out.push(boss.powerMilli);
  out.push(boss.powerDir);
  out.push(boss.ball.xMilli);
  out.push(boss.ball.yMilli);
  out.push(boss.ball.vxMilli);
  out.push(boss.ball.vyMilli);
  out.push(boss.flightBeat);
  out.push(boss.drops);
  out.push(boss.dropBeat);
  out.push(boss.dropXMilli);
  out.push(boss.catchBeat);
  out.push(boss.hitTick);
  out.push(boss.hitXMilli);
  out.push(boss.hitYMilli);
  out.push(boss.hitRun);
  // The two hands on the table. A slack spring is whether the bar runs at all,
  // and the nudges and the tilt are whether her shove reaches the ball — so a
  // device that disagreed about any of the three would be running a different
  // ball down a different board (`pinball-hand.ts`).
  out.push(boss.slack ? 1 : 0);
  out.push(boss.nudges);
  out.push(boss.tilted ? 1 : 0);
  for (const n of pinPieceParts(boss.pieces)) out.push(n);
  for (const up of boss.alive) out.push(up ? 1 : 0);
  out.push(boss.lit.length);
  for (const i of boss.lit) out.push(i);
  out.push(boss.rounds.length);
  for (const round of boss.rounds) {
    out.push(round.beats);
    for (const n of pinPieceParts(round.pieces)) out.push(n);
  }
  return out;
}
