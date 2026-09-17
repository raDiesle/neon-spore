import { type LedgerBead, type LedgerState, ledgerCadence, ledgerSeamCol } from "./ledger.js";
import { nextInt } from "./rng.js";
import type { World } from "./world.js";

/**
 * **What a bill is**: one hit down the seam, and one return on the cord.
 *
 * Its own file because the two callers are on different clocks and both do
 * exactly this. `ledger-shot.ts` bills on the **tick** a bolt leaves the top of
 * the seam's column or the muzzle it was fired from; `ledger-step.ts` bills on
 * the **beat** a warded return is thrown back up the cord, which is the same
 * widening with nobody paying for it. A second copy of *what happens when the
 * seam takes one* is the copy that would forget the last return.
 */

/** Which colour the seam shows next. Seeded, so both devices show the same. */
function reroll(world: World): "red" | "cyan" {
  return nextInt(world.rng, 2) === 0 ? "red" : "cyan";
}

/**
 * A return onto the cord, `ledgerCadence` beats from the socket.
 *
 * The **last** one is marked here and nowhere else: the bill for the hit that
 * finishes the seam is the one that tears the cord out of the ship, and the
 * pair is shown it coming with its own event so neither screen has to work
 * out which bead this is (`ledgerLetThrough`).
 */
export function startBead(world: World, t: LedgerState, last: boolean): void {
  const beats = ledgerCadence(t, world.cfg);
  const bead: LedgerBead = { beat: world.beat + beats, span: beats, last };
  t.beads.push(bead);
  world.events.push({
    type: last ? "ledgerLast" : "ledgerBead",
    col: t.socket,
    beats,
  });
}

/**
 * **The seam takes one**: the split widens, it shows a new colour, and — unless
 * the cord whipped it back — the same damage starts down the cord.
 *
 * The colour is rerolled on every hit rather than held for the fight, and that
 * is the navigator's whole job: the colour she has to load is a fresh question
 * every time, on a clock she started. A seam that kept one colour would be a
 * fight the pair could answer without talking after the first sentence.
 */
export function widenSeam(world: World, t: LedgerState, bills: boolean): void {
  const cfg = world.cfg;
  t.seam += 1;
  t.want = reroll(world);
  world.events.push({
    type: "ledgerSeam",
    col: ledgerSeamCol(t, cfg),
    seam: t.seam,
    color: t.want,
  });
  const last = t.seam >= cfg.ledgerSeamHits;
  // The last hit always puts its return on the cord, however it was made: the
  // whip pays for nothing else, but the fight cannot end without the bead the
  // pair has to let through.
  if (bills || last) startBead(world, t, last);
}

/** The cord tears out of the ship, and the halves finally part. */
export function tearCord(world: World, t: LedgerState): void {
  t.outBeat = world.beat;
  t.beads = [];
  world.events.push({ type: "ledgerTear", col: t.socket });
}
