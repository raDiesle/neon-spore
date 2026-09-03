import type { BossState } from "./boss-state.js";
import { BOSS_KINDS } from "./entries.js";
import { FLEET_DIRS } from "./fleet-board.js";
import { GAUGE_PHASES } from "./gauge.js";
import { mazeHashParts } from "./maze.js";
import { pinballHashParts } from "./pinball-board.js";
import { MIRROR_PHASES, MIRROR_STEPS } from "./simon.js";
import { SNAKE_PHASES } from "./snake.js";

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
  // SNAKE. The body is where the fight is, and everything after it is what
  // the arena has left in it.
  if (boss !== null && boss.kind === "snake") {
    push(SNAKE_PHASES.indexOf(boss.phase));
    push(boss.phaseBeat);
    push(boss.openBeat);
    push(boss.passed ? 1 : 0);
    push(boss.round);
    push(boss.roundBeat);
    push(boss.dirCol);
    push(boss.dirRow);
    push(boss.turn);
    push(boss.stepTick);
    push(boss.grow);
    push(boss.mawTick);
    push(boss.shotBeat);
    push(boss.shotCol);
    push(boss.shotRow);
    push(boss.shotHit ? 1 : 0);
    push(boss.repeats);
    push(boss.repeatBeat);
    push(boss.body.length);
    for (const tile of boss.body) {
      push(tile.col);
      push(tile.row);
    }
    // What has been spent, and then the map it was spent on. The lists of
    // indices are the fight itself — a device that thinks one more enemy is
    // down is a device drawing a different arena for the player who can see
    // it — and the placement is authored, so it is in for THE MIRROR's reason:
    // two phones on two builds of `content` would be driving round different
    // maps and nothing else here would say a word about it.
    push(boss.struck.length);
    for (const at of boss.struck) push(at);
    push(boss.taken.length);
    for (const at of boss.taken) push(at);
    push(boss.rounds.length);
    for (const round of boss.rounds) {
      push(round.beats);
      push(round.stepTicks);
      push(round.enemies.length);
      for (const tile of round.enemies) {
        push(tile.col);
        push(tile.row);
      }
      push(round.points.length);
      for (const tile of round.points) {
        push(tile.col);
        push(tile.row);
      }
      push(round.rocks.length);
      for (const tile of round.rocks) {
        push(tile.col);
        push(tile.row);
      }
    }
  }
  // PINBALL, gathered beside the boss rather than spelled out here — the
  // arrangement `mazeHashParts` already has, and for its reason: a piece's
  // fields are that file's business and a seventh one added there and not to a
  // loop in here is a field two devices could disagree about silently.
  if (boss !== null && boss.kind === "pinball") {
    for (const n of pinballHashParts(boss)) push(n);
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
    for (const s of boss.scars) {
      push(s.col);
      push(s.beat);
    }
  }

  return out;
}
