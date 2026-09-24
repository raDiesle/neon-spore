import { haspBoss, haspLoose, NO_BOLT } from "./hasp.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE HASP's one target**: the bolt the second hasp's spring throws loose
 * (§20, row 7).
 *
 * Its own file beside `hasp-step.ts` because next door is the fight's clock,
 * and this happens where a bolt leaves the top of the field. The hasps
 * themselves are rock grey and none of them is ever shot: the cannon has one
 * thing to do in this whole wave and the shield has none at all, which is what
 * makes the one thing worth keeping on the band.
 *
 * **Either colour.** The design says *their own colour* and both of them
 * are: a loose bolt is not a body whose colour the pair could have got
 * wrong, so nothing here is billed to the colour balance. What it costs to
 * miss is a hull strike, which is the wave.
 */
export function haspStruck(world: World, bullet: Bullet): void {
  const s = haspBoss(world);
  if (s === null || !haspLoose(s)) return;
  if (bullet.col !== s.boltCol) return;
  s.boltCol = NO_BOLT;
  world.events.push({ type: "haspBoltOut", col: bullet.col });
}
