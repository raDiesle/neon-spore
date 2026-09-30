import type { SimConfig, SimEvent } from "@neon-spore/sim";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { haspCentre, haspSeam } from "./hasp-shape.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE HASP's story throws** (`sim/hasp-story.ts`): the burst each of
 * its twelve events leaves, and whether it is a step landed or a blow on the
 * hull, which `hasp-fx.ts` turns into the row's hurt and the hull's shock —
 * `valve-fx-story.ts`'s arrangement, on its own page for the same reason.
 *
 * - **An ask opening** puffs where it will be answered: iron off the bottom
 *   clasp's hinge for the rattle, off the middle hub for the backspin (on the
 *   screens shown a wheel), ember off the top clasp's seam for the rust, iron
 *   off the middle of the row for the sway.
 * - **An ask answered** — the hush, the catch, the crack, the steady — flares
 *   white there and is a step landed. The catch's flare is on the wheel's
 *   screens only; the step is landed on both, the row jolting as one door.
 * - **An ask run out** — the slam, the spoke, the burst, the rough swing —
 *   lands on the hull under the middle column in red, where `bossStrikesHull`
 *   struck, and shudders it.
 */
export type StoryBlow = "landed" | "struck" | null;

/** The burst for one of the story's events, and what it deals; `undefined` for an event not the story's. */
export function haspStoryBurst(
  e: SimEvent,
  l: Layout,
  cfg: SimConfig,
  burst: Burst,
  wheel: boolean,
): StoryBlow | undefined {
  const hinge = haspSeam(l, cfg, 0);
  const hub = haspCentre(l, cfg, 1);
  const rust = haspCentre(l, cfg, 2);
  const hull = (): StoryBlow => {
    if (!("col" in e)) return null;
    burst(fieldX(l, e.col), tileCY(l, cfg.rows - 1), 16, PALETTE.red);
    return "struck";
  };
  switch (e.type) {
    case "haspRattle":
      burst(hinge.x, hinge.top, 8, PALETTE.rock);
      return null;
    case "haspBackspin":
      if (wheel) burst(hub.x, hub.y, 8, PALETTE.rock);
      return null;
    case "haspRust":
      burst(rust.x, rust.y, 10, PALETTE.ember);
      return null;
    case "haspSway":
      burst(hub.x, hub.y, 8, PALETTE.rock);
      return null;
    case "haspHush":
      burst(hinge.x, hinge.top, 10, PALETTE.hullRim);
      return "landed";
    case "haspCatch":
      if (wheel) burst(hub.x, hub.y, 12, PALETTE.hullRim);
      return "landed";
    case "haspCrack":
      burst(rust.x, rust.y, 12, PALETTE.hullRim);
      return "landed";
    case "haspSteady":
      burst(hub.x, hub.y, 12, PALETTE.hullRim);
      return "landed";
    case "haspSlam":
    case "haspSpoke":
    case "haspBurst":
    case "haspRough":
      return hull();
    default:
      return undefined;
  }
}
