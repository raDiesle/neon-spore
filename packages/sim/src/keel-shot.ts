import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { keelBoss, keelThrown, NO_JOINT, NO_ROCK } from "./keel.js";
import { closeSlow } from "./slow.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE KEEL's two targets**: the midpoint's socket (movement 2) and the
 * tail's rock (movement 3), both where a bolt leaves the top of the field.
 *
 * **The socket wants its colour.** It flashes the wave's `socket`, and only
 * that cannon's bolt up the middle column shuts it — which locks the
 * left-middle segment for nothing, the leftmost still loose. The other colour
 * is a colour missed on the balance sheet and nothing else: the socket stays
 * open and its window runs on.
 *
 * **The rock wants either colour**, THE MANTLE's spark's argument: a rock is
 * not a body with a colour the pair could have got wrong, and what it costs to
 * miss is the column.
 */
export function keelStruck(world: World, bullet: Bullet): void {
  const s = keelBoss(world);
  if (s === null) return;
  if (keelThrown(s) && bullet.col === s.rockCol) {
    s.rockCol = NO_ROCK;
    world.events.push({ type: "keelRockOut", col: bullet.col });
    return;
  }
  if (s.phase !== "socket" || bullet.col !== midCol(world.cfg)) return;
  if (bullet.color !== s.socket) {
    missedColor(world);
    return;
  }
  metColor(world);
  const seg = s.locked.indexOf(false);
  if (seg !== -1) s.locked[seg] = true;
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.joint = NO_JOINT;
  closeSlow(world);
  world.events.push({ type: "keelShut", col: bullet.col });
}
