import type { CoreVerdict } from "./core-verdict.js";
import { haspBoss, haspLoose, NO_BOLT } from "./hasp.js";
import type { Bullet, Color } from "./types.js";
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
 *
 * What it says of a bolt is `haspVerdict`, which the picture asks too
 * (`render/hasp-stop.ts`).
 */
export function haspStruck(world: World, bullet: Bullet): boolean {
  const s = haspBoss(world);
  if (s === null || haspVerdict(world, bullet.col, bullet.color) === null) return false;
  s.boltCol = NO_BOLT;
  world.events.push({ type: "haspBoltOut", col: bullet.col });
  return true;
}

/**
 * What a bolt in `col` meets of the loose bolt (`core-verdict.ts`'s words):
 * the bolt in its own column while it falls, in either colour, and nothing
 * anywhere else — the clasps are never judged.
 */
export function haspVerdict(world: World, col: number, _color: Color): CoreVerdict {
  const s = haspBoss(world);
  return s !== null && haspLoose(s) && col === s.boltCol ? "target" : null;
}
