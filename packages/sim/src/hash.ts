import { BOSS_KINDS } from "./entries.js";
import { INTERLUDE_KINDS, INTERLUDE_PHASES } from "./interlude.js";
import { MIRROR_PHASES } from "./simon.js";
import type { World } from "./world.js";

/**
 * Which boss is installed, as a number. Read off `BOSS_KINDS` rather than
 * written out as a ternary chain: a fourth boss added to that list and not to
 * a chain here would hash as the third, and two devices would agree about a
 * world they disagree about.
 */
const BOSS_TAG = BOSS_KINDS;

/**
 * A cheap, stable fingerprint of the whole world. Two devices running lockstep
 * must produce the same value on every tick; a replay test pins it down.
 * FNV-1a over a canonical field order — never over JSON.stringify, whose key
 * order is an implementation detail.
 */
export function hashWorld(world: World): number {
  let h = 0x811c9dc5;
  const push = (n: number): void => {
    h ^= n | 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  };

  push(world.tick);
  push(world.beat);
  push(world.over ? 1 : 0);
  push(world.score);
  push(world.cannonCol);
  push(world.shieldCol);
  push(world.gripP1);
  push(world.gripP2);
  push(world.primeTick);
  // The shot that has been pressed and has not left yet. In for the reason a
  // bullet is: two devices that disagree about whether a shot exists have
  // desynced, and a charge is a shot that exists everywhere except on the
  // field. Its colour and its lance only when there is one, the same way an
  // interlude's fields are pushed only when a round is open.
  const shot = world.charge;
  push(shot === null ? -1 : shot.left);
  if (shot !== null) {
    push(shot.color === "red" ? 1 : 2);
    push(shot.lance ? 1 : 0);
  }
  push(world.hullMilli);
  // A ward pod arms the shield without a guard command until this tick — a
  // fact about the world exactly like `hullMilli`, and missing here the same
  // way a bug could miss it: two devices could run the same inputs and the
  // same tick count and still disagree about whether a rock gets deflected,
  // with nothing above catching it.
  push(world.wardUntilTick);
  push(world.rng.state);
  push(world.guard.tries);
  push(world.guard.deflected);
  push(world.guard.mistimed);
  push(world.balance.podsFreed);
  push(world.balance.podsTaken);
  push(world.balance.podsLost);
  push(world.balance.colorHits);
  push(world.balance.colorMisses);
  push(world.balance.streak);
  push(world.balance.bestStreak);
  push(world.balance.wavesCleared);
  // THE FORK. Whether the run is waiting for both thumbs is a fact about the
  // world, and two devices that disagree about it disagree about whether a
  // wave has begun.
  push(world.forkBeat);

  // The briefing. It is in the fingerprint because it decides whether the
  // world ticks at all: a device that thinks a card is still up is a device
  // holding a wave the other one is already playing, and that is a desync
  // whichever way it is spelled.
  // The interlude, and the same argument one more time: a device that thinks
  // the pair is at a dial is a device that is not running the field the other
  // one is running. `interludeDone` is in for a narrower reason — it decides
  // whether the wave a `needWave` asks for is answered with the wave or with
  // the round in front of it, so two devices disagreeing about it would deal
  // themselves different rounds without ever disagreeing about a tick.
  const round = world.interlude;
  push(round === null ? 0 : INTERLUDE_KINDS.indexOf(round.kind) + 1);
  push(world.interludeDone);
  if (round !== null) {
    push(round.wave);
    push(INTERLUDE_PHASES.indexOf(round.phase));
    push(round.phaseBeat);
    push(round.openBeat);
    push(round.passed ? 1 : 0);
    push(round.needleMilli);
    push(round.valve);
    push(round.markMilli);
    push(round.driftDir);
    push(round.marks);
    push(round.misses);
    push(round.calledBeat);
    push(round.calledMilli);
    push(round.calledGood ? 1 : 0);
  }

  push(world.brief.met);
  push(world.brief.ack);
  push(world.brief.due.length);
  for (const n of world.brief.due) push(n);

  push(world.creatures.length);
  for (const c of world.creatures) {
    push(c.id);
    push(c.col);
    push(c.row);
    push(c.color === null ? 0 : c.color === "red" ? 1 : 2);
    push(c.holes);
    push(c.petals);
    push(c.dragMilli);
    push(c.throbOpen ? 1 : 0);
  }

  push(world.bullets.length);
  for (const b of world.bullets) {
    push(b.id);
    push(b.col);
    push(b.row);
    push(b.subMilli);
    push(b.lance ? 1 : 0);
    push(b.pierced);
  }

  push(world.pods.length);
  for (const p of world.pods) {
    push(p.id);
    push(p.colMilli);
    push(p.rowMilli);
    push(p.driftMilli);
    push(p.loose ? 1 : 0);
  }

  push(world.scars.length);
  for (const s of world.scars) {
    push(s.col);
    push(s.beat);
  }

  const boss = world.boss;
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
    push(boss.tornBeat);
    push(boss.openBeat);
    push(boss.eyeSpent ? 1 : 0);
    push(boss.pullTicks);
  }
  if (boss !== null && boss.kind === "vane") {
    push(boss.pins);
    push(boss.spentOpening);
    push(boss.throwBeat);
    push(boss.throwCol);
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

  return h >>> 0;
}
