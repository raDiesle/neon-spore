import type { BossState } from "./boss-state.js";
import { BOSS_KINDS } from "./entries.js";
import { GAUGE_PHASES } from "./gauge.js";
import { mazeHashParts } from "./maze.js";
import { MIRROR_PHASES } from "./simon.js";

/**
 * The boss half of the world fingerprint.
 *
 * Split out of `hash.ts` the day THE DART pushed that file past its 250-line
 * limit, and along a seam that was already there rather than at a convenient
 * line: everything left in `hash.ts` is the *field* — the ship, the bodies on
 * it, the shots, the wave's own clock — and everything here is the state of
 * whichever mechanism happens to be installed above it. The field's half is
 * one fixed list that grows by a field at a time; this half grows by a whole
 * boss at a time, and six of them are already twice the size of the rest.
 *
 * The contract is `mazeHashParts`', which is where the shape came from: a flat
 * list of numbers, in a fixed order, pushed by the caller. Nothing here reads
 * or writes the running hash, so there is no second copy of the FNV step and
 * no way for the two files to disagree about how a number is folded in.
 */

/**
 * Which boss is installed, as a number. Read off `BOSS_KINDS` rather than
 * written out as a ternary chain: a fourth boss added to that list and not to
 * a chain here would hash as the third, and two devices would agree about a
 * world they disagree about.
 */
const BOSS_TAG = BOSS_KINDS;

/** Every number the installed boss contributes, tag first. `null` is one
 * number and not zero of them: "no boss" has to be as loud as any boss. */
export function bossHashParts(boss: BossState | null): number[] {
  const out: number[] = [];
  const push = (n: number): void => {
    out.push(n);
  };
  push(boss === null ? 0 : BOSS_TAG.indexOf(boss.kind) + 1);
  if (boss !== null && boss.kind === "queen") {
    push(boss.creatureId);
    push(boss.phase);
    push(boss.phaseBeat);
    push(boss.tellCol);
    push(boss.tellColor === null ? 0 : boss.tellColor === "red" ? 1 : 2);
    push(boss.weakSide);
    push(boss.pickBeat);
    push(boss.spentSide);
    push(boss.openBeat);
    push(boss.closeBeat);
    push(boss.dropSide);
    push(boss.releaseBeat);
    push(boss.releaseSide);
    push(boss.scratch.length);
    for (const n of boss.scratch) push(n);
  }
  if (boss !== null && boss.kind === "warden") {
    push(boss.creatureId);
    push(boss.tetherId);
    push(boss.pupilCol);
    push(boss.pupilDir);
    push(boss.plates);
    push(boss.eyeSpent ? 1 : 0);
    // The rope. Two devices that disagree about how taut it is disagree about
    // whether the hatch is open, which is whether the next shot counts.
    push(boss.pulling ? 1 : 0);
    push(boss.pullOriginMilli);
    push(boss.pullMilli);
  }
  if (boss !== null && boss.kind === "vane") {
    push(boss.pins);
    push(boss.spentOpening);
    push(boss.throwBeat);
    push(boss.throwCol);
  }
  if (boss !== null && boss.kind === "maze") {
    // Gathered beside the boss rather than spelled out here: `mazeHashParts`
    // says what is in it and why, the authored wheel included.
    for (const n of mazeHashParts(boss)) push(n);
  }
  // THE GAUGE, and the same argument one more time: a device that thinks the
  // pair is at a dial is a device that is not running the field the other one
  // is running — and that is exactly what the boss tag a few lines up already
  // says, so what is left here is the dial itself.
  if (boss !== null && boss.kind === "gauge") {
    push(GAUGE_PHASES.indexOf(boss.phase));
    push(boss.phaseBeat);
    push(boss.openBeat);
    push(boss.passed ? 1 : 0);
    push(boss.needleMilli);
    push(boss.valve);
    push(boss.markMilli);
    push(boss.driftDir);
    push(boss.marks);
    push(boss.misses);
    push(boss.calledBeat);
    push(boss.calledMilli);
    push(boss.calledGood ? 1 : 0);
  }
  if (boss !== null && boss.kind === "mirror") {
    push(boss.round);
    push(MIRROR_PHASES.indexOf(boss.phase));
    push(boss.phaseBeat);
    push(boss.matched);
    push(boss.shown);
    push(boss.cannonCol);
    push(boss.hullMilli);
    push(boss.verdict);
    push(boss.verdictCol);
    push(boss.scars.length);
    for (const s of boss.scars) {
      push(s.col);
      push(s.beat);
    }
  }

  return out;
}
