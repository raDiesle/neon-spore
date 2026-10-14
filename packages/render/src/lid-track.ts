import { type Creature, lidCordPath, type SimConfig } from "@neon-spore/sim";
import type { Circle, Layout } from "./layout.js";
import { PULL_TRACK_W, type PullTrack } from "./pull-track.js";

/**
 * **Where THE LID's cord can be pulled**, as the channel `pull-track.ts`
 * draws: from the cord's rest, `lidTautMilli` along its way — the distance at
 * which the plates stand fully apart — and bowed to one side of it.
 *
 * The channel is the simulation's own path, point for point
 * (`sim/lid-bow.ts`), so a thumb on the drawing is a thumb on the rule, and
 * one that leaves it by more than a tile drops the cord. The way it runs is
 * the simulation's too (`sim/lid-way.ts`): the way a grab would take now
 * while nobody has it, the way the grab took once a hand does — down, then
 * across towards the middle of the field, then the other way, then up, the
 * first the field holds the whole cord of. A lid that has come far down the
 * field turns its channel across rather than drawing one that runs off the
 * bottom. The rest is the body's this frame, so the channel rides the
 * falling lid with the handle. Straight until the owner bent it, 13 October
 * 2026: *curves increase difficulty and are more exciting than straight lines*.
 */
export function lidCordTrack(l: Layout, cfg: SimConfig, c: Creature, rest: Circle): PullTrack {
  return {
    pts: lidCordPath(cfg, c).pts.map((p) => ({
      x: rest.x + (p.x * l.tile) / 1000,
      y: rest.y + (p.y * l.tile) / 1000,
    })),
    w: rest.r * PULL_TRACK_W,
  };
}
