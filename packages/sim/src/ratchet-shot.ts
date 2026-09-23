import { NO_BOLT, ratchetBoss, ratchetLoose } from "./ratchet.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE RATCHET's one target**: the bolt the second clean advance shakes
 * loose (§22, row 8). `hasp-shot.ts`' shape and argument — the rack is rock
 * grey and never shot, and **either colour** takes the bolt, because a loose
 * bolt is not a body whose colour the pair could have got wrong.
 */
export function ratchetStruck(world: World, bullet: Bullet): void {
  const s = ratchetBoss(world);
  if (s === null || !ratchetLoose(s)) return;
  if (bullet.col !== s.boltCol) return;
  s.boltCol = NO_BOLT;
  world.events.push({ type: "ratchetBoltOut", col: bullet.col });
}
