import { BATON_STAGES, type BatonState } from "./baton.js";

/**
 * What THE BATON puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `stare-hash.ts` and `diastole-hash.ts` are
 * ones: `hash-boss.ts` grows by a whole boss at a time.
 *
 * **The two locks are the fields that matter most.** They decide which of two
 * people may touch their own phone on this beat, so two devices disagreeing
 * about one is the worst desync this game could have: a seat would be locked
 * on their screen and playing on the other's. The sockets are the health and
 * the flight is where the bead is for a shot, and both are in here for the
 * ordinary reason; the counts of handovers and settles decide when the turn
 * tightens and where the arm swings, so they are wire values too.
 */
export function batonHashParts(b: BatonState): number[] {
  const out = [BATON_STAGES.indexOf(b.stage), b.stageBeat, b.col, b.fromCol, b.sockets.length];
  for (const s of b.sockets) out.push(s);
  out.push(
    b.socket,
    b.flightTick,
    b.struck ? 1 : 0,
    b.color === "red" ? 1 : 2,
    b.handovers,
    b.settles,
    // The pair of locks, length first: a tuple is a list to `hash-coverage`,
    // and a third lock nobody has a seat for would still be a disagreement.
    b.lockUntil.length,
    b.lockUntil[0],
    b.lockUntil[1],
    b.podId,
    b.shedBeat,
  );
  return out;
}
