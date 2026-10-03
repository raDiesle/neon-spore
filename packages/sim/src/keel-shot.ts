import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import type { CoreVerdict } from "./core-verdict.js";
import { keelBoss, keelMarrowLit, keelThrown, NO_JOINT, NO_ROCK } from "./keel.js";
import { keelMarrowStruck } from "./keel-story.js";
import { closeSlow } from "./slow.js";
import type { Bullet, Color } from "./types.js";
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
 * **The marrow wants both**, one bolt of each up the middle (`keel-story.ts`).
 *
 * **The rock wants either colour**, THE MANTLE's spark's argument: a rock is
 * not a body with a colour the pair could have got wrong, and what it costs to
 * miss is the column.
 *
 * What it says of a bolt is `keelVerdict`, which the picture asks too
 * (`render/keel-stop.ts`).
 */
export function keelStruck(world: World, bullet: Bullet): boolean {
  const s = keelBoss(world);
  const v = keelVerdict(world, bullet.col, bullet.color);
  if (s === null || v === null) return false;
  if (keelThrown(s) && bullet.col === s.rockCol) {
    s.rockCol = NO_ROCK;
    world.events.push({ type: "keelRockOut", col: bullet.col });
    return true;
  }
  if (keelMarrowStruck(world, s, bullet)) return true;
  if (v === "armour") return true;
  if (v === "wrong") {
    missedColor(world);
    return true;
  }
  metColor(world);
  const seg = s.locked.indexOf(false);
  if (seg !== -1) s.locked[seg] = true;
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.joint = NO_JOINT;
  closeSlow(world);
  world.events.push({ type: "keelShut", col: bullet.col });
  return true;
}

/**
 * What a bolt of `color` in `col` meets of the spine (`core-verdict.ts`'s
 * words): the thrown rock in its column, in either colour; up the middle, the
 * marrow's half of that colour while it is lit and unsealed, the socket while
 * it is open — `wrong` in the other colour — and otherwise the spine's
 * armour, the socket shut or the marrow's half already in; and nothing
 * anywhere else.
 */
export function keelVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = keelBoss(world);
  if (s === null) return null;
  if (keelThrown(s) && col === s.rockCol) return "target";
  if (col !== midCol(world.cfg)) return null;
  if (keelMarrowLit(s)) return s.marrow[color === "red" ? 0 : 1] ? "armour" : "target";
  if (s.phase !== "socket") return "armour";
  return color === s.socket ? "target" : "wrong";
}
