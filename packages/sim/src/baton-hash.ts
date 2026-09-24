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
 * each bead's flight is where it is for a shot, and both are in here for the
 * ordinary reason; the counts of handovers and settles decide when the turn
 * tightens and where the arm swings, so they are wire values too.
 */
export function batonHashParts(b: BatonState): number[] {
  const out = [BATON_STAGES.indexOf(b.stage), b.stageBeat, b.col, b.sockets.length];
  for (const s of b.sockets) out.push(s);
  // Every bead, length first: a second bead lighting on one device and not
  // the other is a whole colour the seats would disagree about.
  out.push(b.beads.length);
  for (const bead of b.beads)
    out.push(
      bead.flying ? 1 : 0,
      bead.satBeat,
      bead.socket,
      bead.flightTick,
      bead.struck ? 1 : 0,
      bead.color === "red" ? 1 : 2,
      bead.col,
      bead.fromCol,
      bead.final ? 1 : 0,
    );
  out.push(
    b.merged ? 1 : 0,
    // The crossing's count: a device one act behind would lock the wrong seat.
    b.acts,
    b.stillBeat,
    b.handovers,
    b.settles,
    // The pair of locks, length first: a tuple is a list to `hash-coverage`,
    // and a third lock nobody has a seat for would still be a disagreement.
    b.lockUntil.length,
    b.lockUntil[0],
    b.lockUntil[1],
    b.podId,
    b.shedBeat,
    // The swell and the thumbs on it: which socket is coming away decides
    // where one seat's only reachable thing on the arm is, and a device that
    // disagreed about the count of a hold would merge the beads on its own.
    b.swellSocket,
    b.swellBeat,
    b.stripped,
    b.stripThumbs,
    b.mergeThumbs,
    b.mergeHeld,
    b.threadBeat,
  );
  return out;
}
