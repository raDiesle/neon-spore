import type { SimConfig, SimEvent } from "@neon-spore/sim";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type Point, type SpoolPose, spoolLineFoot, spoolLineTop } from "./spool-shape.js";
import type { StoryBlow } from "./valve-fx-story.js";

/**
 * **What THE SPOOL's story throws** (`sim/spool-story.ts`): the burst each of
 * its nine events leaves, and whether it is a step landed or a blow on the
 * hull, which `spool-fx.ts` turns into the casing's hurt and its shudder. Its
 * own page, as THE VALVE's is (`valve-fx-story.ts`), because the fx file is
 * a family of its own and the story is a second one.
 *
 * - **An ask opening** — the snag, the whip, the fray — puffs where it will
 *   be seen: iron off the casing where the line caught, violet off the middle
 *   of the line thrown wide, pale fibre off the line.
 * - **An ask answered** — the snag freed, the loop damped, the fray held —
 *   flares white on the line and is a step landed.
 * - **An ask run out** — the snap, the lash, the strand — lands on the hull
 *   under the column the event names, in red, where `bossStrikesHull` struck.
 *
 * Points are on the spool at rest, like the rest of its bursts.
 */
export function spoolStoryBurst(
  e: SimEvent,
  l: Layout,
  cfg: SimConfig,
  pose: SpoolPose,
  burst: Burst,
): StoryBlow | undefined {
  const top = spoolLineTop(l, pose);
  const foot = spoolLineFoot(l, cfg);
  const mid: Point = { x: (top.x + foot.x) / 2, y: (top.y + foot.y) / 2 };
  const hull = (col: number): StoryBlow => {
    burst(fieldX(l, col), tileCY(l, cfg.rows - 1), 16, PALETTE.red);
    return "struck";
  };
  switch (e.type) {
    case "spoolSnag":
      burst(top.x, top.y, 8, PALETTE.rock);
      return null;
    case "spoolWhip":
      burst(mid.x, mid.y, 8, PALETTE.hull);
      return null;
    case "spoolFray":
      burst(mid.x, mid.y, 6, PALETTE.text);
      return null;
    case "spoolFree":
      burst(top.x, top.y, 10, PALETTE.hullRim);
      return "landed";
    case "spoolDamp":
    case "spoolFeather":
      burst(mid.x, mid.y, 12, PALETTE.hullRim);
      return "landed";
    case "spoolSnap":
    case "spoolLash":
    case "spoolStrand":
      return hull(e.col);
    default:
      return undefined;
  }
}
