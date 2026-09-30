import type { SimConfig, SimEvent } from "@neon-spore/sim";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { ratchetLock, ratchetPawl, ratchetPawlY, ratchetX } from "./ratchet-shape.js";

/**
 * **What THE RATCHET's story throws** (`sim/ratchet-story.ts`): the burst each
 * of its twelve events leaves, and whether it is a step landed or a blow on
 * the hull, which `ratchet-fx.ts` turns into the rack's hurt and the hull's
 * shock. Its own page, THE VALVE's shape (`valve-fx-story.ts`), because the
 * fx file is near its length with the rack's own receipts.
 *
 * - **An ask opening** — the slip, the kick, the bind, the wind — puffs where
 *   it will be answered: dark iron off the seam the rack sags past, iron off
 *   the pawl, embers off the grinding seam, pale off the lock the spring hangs
 *   from.
 * - **An ask answered** — the bite, the seat, the mesh, the wound — flares
 *   pale in the same place, and is a step landed.
 * - **An ask run out** — the drop, the fly, the shake, the unwind — lands on
 *   the hull under the middle column in red, where `bossStrikesHull` struck,
 *   and shudders it.
 *
 * All of them are the rack's, so all burst on both screens: none is a hand
 * said for the other seat (`ratchet-fx.ts`, THE HASP's rule).
 */
export type StoryBlow = "landed" | "struck" | null;

/** The burst for one of the story's events, and what it deals; `undefined` for an event not the story's. */
export function ratchetStoryBurst(
  e: SimEvent,
  l: Layout,
  cfg: SimConfig,
  burst: Burst,
): StoryBlow | undefined {
  const seam = { x: ratchetX(l, cfg), y: ratchetPawlY(l) };
  const pawl = ratchetPawl(l, cfg);
  const lock = ratchetLock(l, cfg);
  const hull = (): StoryBlow => {
    if (!("col" in e)) return null;
    burst(fieldX(l, e.col), tileCY(l, cfg.rows - 1), 16, PALETTE.red);
    return "struck";
  };
  switch (e.type) {
    case "ratchetSlip":
      burst(seam.x, seam.y, 8, PALETTE.rockDark);
      return null;
    case "ratchetKick":
      burst(pawl.x, pawl.y, 8, PALETTE.rock);
      return null;
    case "ratchetBind":
      burst(seam.x, seam.y, 8, PALETTE.emberRim);
      return null;
    case "ratchetWind":
      burst(lock.x, lock.y + lock.half, 6, PALETTE.hullRim);
      return null;
    case "ratchetBite":
      burst(seam.x, seam.y, 10, PALETTE.hullRim);
      return "landed";
    case "ratchetSeat":
      burst(pawl.x, pawl.y, 10, PALETTE.hullRim);
      return "landed";
    case "ratchetMesh":
      burst(seam.x, seam.y, 12, PALETTE.hullRim);
      return "landed";
    case "ratchetWound":
      burst(lock.x, lock.y + lock.half, 12, PALETTE.hullRim);
      return "landed";
    case "ratchetDrop":
    case "ratchetFly":
    case "ratchetShake":
    case "ratchetUnwind":
      return hull();
    default:
      return undefined;
  }
}
