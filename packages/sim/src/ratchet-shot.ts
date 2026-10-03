import type { CoreVerdict } from "./core-verdict.js";
import { NO_BOLT, ratchetBoss, ratchetLoose } from "./ratchet.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE RATCHET's one target**: the bolt the second clean advance shakes
 * loose (§22, row 8). `hasp-shot.ts`' shape and argument — the rack is rock
 * grey and never shot, and **either colour** takes the bolt, because a loose
 * bolt is not a body whose colour the pair could have got wrong.
 *
 * What it says of a bolt is `ratchetVerdict`, which the picture asks too
 * (`render/ratchet-stop.ts`).
 */
export function ratchetStruck(world: World, bullet: Bullet): boolean {
  const s = ratchetBoss(world);
  if (s === null || ratchetVerdict(world, bullet.col, bullet.color) === null) return false;
  s.boltCol = NO_BOLT;
  world.events.push({ type: "ratchetBoltOut", col: bullet.col });
  return true;
}

/**
 * What a bolt in `col` meets of the loose bolt (`core-verdict.ts`'s words):
 * the bolt in its own column while it falls, in either colour, and nothing
 * anywhere else — the rack is never judged.
 */
export function ratchetVerdict(world: World, col: number, _color: Color): CoreVerdict {
  const s = ratchetBoss(world);
  return s !== null && ratchetLoose(s) && col === s.boltCol ? "target" : null;
}
