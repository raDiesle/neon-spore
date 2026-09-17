import type { BossState } from "./boss-union.js";
import { BOSS_KINDS } from "./entries.js";
import { FLEET_DIRS } from "./fleet-board.js";
import { GAUGE_PHASES } from "./gauge.js";
import { clockHashParts } from "./hash-boss-clocks.js";
import { scarHashParts } from "./hull-types.js";
import { mazeHashParts } from "./maze-hash.js";
import { pinballHashParts } from "./pinball-board.js";
import { pulseHashParts } from "./pulse-hash.js";
import { repriseHashParts } from "./reprise-state.js";
import { scoutHashParts } from "./scout-hash.js";
import { MIRROR_PHASES, MIRROR_STEPS } from "./simon.js";
import { snakeHashParts } from "./snake-hash.js";
import { spliceHashParts } from "./splice-hash.js";

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
    // What she started with. `boss.ts` measures the drop against it, so two
    // devices that disagree here shed a different number of petals for the
    // same hit — the authored-field argument `mazeHashParts` makes.
    push(boss.startPetals);
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
    push(boss.pullOriginYMilli);
    push(boss.pullMilli);
    // And the other half of the pull. A hand may carry the rope any way it
    // likes now, so two devices that agreed about the x and not the y would
    // disagree about how taut the line is — which is to say about whether the
    // shot player 2 just fired counted.
    push(boss.pullYMilli);
    // And where the hand took it. Two devices that disagree about the anchor
    // draw the handle in two places and bound it against two different pieces
    // of the field, so one can reach taut where the other cannot.
    push(boss.pullAnchorX);
    push(boss.pullAnchorY);
  }
  if (boss !== null && boss.kind === "cairn") {
    push(boss.creatureId);
    // Rocks left in the pile, which is the fight's whole length — two devices
    // that disagree here draw a different body and end the wave a rock apart.
    push(boss.units);
    // And the clock over it. `leftBeat` decides which beat the pile sheds on
    // and `settleCol` which lane it sheds into, so a disagreement about either
    // is a rock falling down a column one phone never saw it in.
    push(boss.leftBeat);
    push(boss.settleCol);
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
  // THE FLEET. The placement is authored and hashed for the reason THE
  // MIRROR's rounds are: two phones on two builds of `content` would be
  // shooting at charts with the ships in different squares, and nothing else
  // in here would say a word about it. The list of squares already fired at is
  // the fight itself — a device that thinks one more square is spent has a
  // different chart in front of the player who can see it.
  if (boss !== null && boss.kind === "fleet") {
    push(boss.ships.length);
    for (const ship of boss.ships) {
      push(ship.col);
      push(ship.row);
      push(ship.len);
      push(FLEET_DIRS.indexOf(ship.dir));
    }
    push(boss.struck.length);
    for (const at of boss.struck) push(at);
    for (const beat of boss.sunkBeat) push(beat);
    push(boss.aimCol);
    push(boss.aimRow);
    push(boss.openBeat);
    push(boss.firedBeat);
    push(boss.lastCol);
    push(boss.lastRow);
    push(boss.lastHit ? 1 : 0);
  }
  // The five bosses that are a clock, gathered one file along and for the
  // same reason each of them was gathered beside its own state: what they
  // hash is a beat count, and a count two devices disagree about is a word
  // one of them says wrong (`hash-boss-clocks.ts`).
  if (boss !== null) for (const n of clockHashParts(boss)) push(n);
  if (boss !== null && boss.kind === "scout") {
    for (const n of scoutHashParts(boss)) push(n);
  }
  // SNAKE, gathered beside the boss for the same reason and with the most in
  // it of the four: the body, the arena it is driving round, and everything
  // already spent off both (`snake-hash.ts`).
  if (boss !== null && boss.kind === "snake") {
    for (const n of snakeHashParts(boss)) push(n);
  }
  // PINBALL, gathered beside the boss rather than spelled out here — the
  // arrangement `mazeHashParts` already has, and for its reason: a piece's
  // fields are that file's business and a seventh one added there and not to a
  // loop in here is a field two devices could disagree about silently.
  if (boss !== null && boss.kind === "pinball") {
    for (const n of pinballHashParts(boss)) push(n);
  }
  // THE PULSE, the same way and for the same reason — with the addition that
  // its state is two mirrored halves, and `pulse-hash.ts` is what stops one of
  // them being forgotten (`pulseHashParts`).
  if (boss !== null && boss.kind === "pulse") {
    for (const n of pulseHashParts(boss)) push(n);
  }
  // THE SPLICE, gathered beside the boss like the four above it — and the one
  // whose board is not authored at all, which is why every column it laid is in
  // there too (`splice-hash.ts`).
  if (boss !== null && boss.kind === "splice") {
    for (const n of spliceHashParts(boss)) push(n);
  }
  // THE REPRISE, gathered beside the boss like the five above it — and the one
  // whose numbers are all *cursors into the wave's own script*, which is why
  // they matter as much as any board: two devices that disagree about one are
  // two devices sending a different body back down a different column, at a
  // moment when neither player can see which (`reprise-state.ts`).
  if (boss !== null && boss.kind === "reprise") {
    for (const n of repriseHashParts(boss)) push(n);
  }
  if (boss !== null && boss.kind === "mirror") {
    // Every sequence, not only the one being played. They are authored, which
    // is what makes them worth checking rather than what makes them safe: two
    // phones on two builds of `content` would ask for different steps three
    // rounds in, and nothing else in here would say a word about it. Six
    // rounds of six steps is thirty-odd numbers every four beats.
    push(boss.rounds.length);
    for (const round of boss.rounds) {
      push(round.length);
      for (const step of round) push(MIRROR_STEPS.indexOf(step));
    }
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
    // The hull's own list and this one go through one function, so a field
    // added to a `Scar` is not something to find twice (`hull-types.ts`).
    for (const s of boss.scars) for (const n of scarHashParts(s)) push(n);
  }

  return out;
}
