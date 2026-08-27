import { MIRROR_PHASES } from "./simon.js";
import type { World } from "./world.js";

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
  push(world.hullMilli);
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

  push(world.creatures.length);
  for (const c of world.creatures) {
    push(c.id);
    push(c.col);
    push(c.row);
    push(c.color === null ? 0 : c.color === "red" ? 1 : 2);
    push(c.holes);
    push(c.petals);
    push(c.dragMilli);
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
  push(boss === null ? 0 : boss.kind === "queen" ? 1 : 2);
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
