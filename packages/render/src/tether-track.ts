import { type SimConfig, type WardenState, wardenRopePath } from "@neon-spore/sim";
import { fieldPoint } from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
import { PULL_TRACK_W, type PullTrack } from "./pull-track.js";

/**
 * **Where THE WARDEN's rope can be pulled**, as the channel `pull-track.ts`
 * draws: from where the hand takes hold, down to taut.
 *
 * **One fixed path, bowed toward the middle of the field** — the simulation's
 * own, point for point (`sim/warden-bow.ts`), so a thumb on the drawing is a
 * thumb on the rule, and one that leaves the drawing by more than a tile
 * drops the rope. The channel never turns to follow the hand — it is the path,
 * drawn before anybody touches it and still there while they pull. Straight
 * down until the owner bent it, 13 October 2026: *curves increase difficulty
 * and are more exciting than straight lines*.
 */
export function wardenRopeTrack(
  l: Layout,
  cfg: SimConfig,
  b: WardenState,
  rest: Circle,
): PullTrack {
  const from = b.pulling ? fieldPoint(l, { x: b.pullAnchorX, y: b.pullAnchorY }) : rest;
  return {
    pts: wardenRopePath(cfg, b).pts.map((p) => ({
      x: from.x + (p.x * l.tile) / 1000,
      y: from.y + (p.y * l.tile) / 1000,
    })),
    w: rest.r * PULL_TRACK_W,
  };
}
