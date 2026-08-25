import { stepBossA } from "./boss-a.js";
import { stepBossB } from "./boss-b.js";
import type { World } from "./world.js";

/**
 * Two implementations of one design, chosen by the wave that installed her.
 * The variant is fixed when the boss is spawned and never changes, so this
 * is a static dispatch per wave.
 */
export function stepBoss(world: World): void {
  const boss = world.boss;
  if (boss === null) return;
  if (boss.variant === "a") stepBossA(world);
  else stepBossB(world);
}
