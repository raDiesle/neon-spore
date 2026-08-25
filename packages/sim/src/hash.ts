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
  push(world.hullMilli);
  push(world.rng.state);
  push(world.guard.tries);
  push(world.guard.deflected);
  push(world.guard.mistimed);

  push(world.creatures.length);
  for (const c of world.creatures) {
    push(c.id);
    push(c.col);
    push(c.row);
    push(c.color === null ? 0 : c.color === "red" ? 1 : 2);
    push(c.holes);
    push(c.petals);
  }

  push(world.bullets.length);
  for (const b of world.bullets) {
    push(b.id);
    push(b.col);
    push(b.row);
    push(b.subMilli);
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

  push(world.boss === null ? 0 : 1);
  if (world.boss !== null) {
    push(world.boss.variant === "a" ? 1 : 2);
    push(world.boss.creatureId);
    push(world.boss.phase);
    push(world.boss.phaseBeat);
    push(world.boss.tellCol);
    push(world.boss.tellColor === null ? 0 : world.boss.tellColor === "red" ? 1 : 2);
    push(world.boss.openBeat);
    push(world.boss.closeBeat);
    push(world.boss.scratch.length);
    for (const n of world.boss.scratch) push(n);
  }

  return h >>> 0;
}
