import { type Creature, lidWayNow, lidWayVec, type SimConfig } from "@neon-spore/sim";
import type { Circle, Layout } from "./layout.js";
import { straightPullTrack } from "./pull-line.js";
import type { PullTrack } from "./pull-track.js";

/**
 * **Where THE LID's cord can be pulled**, as the channel `pull-track.ts`
 * draws: from the cord's rest, `lidTautMilli` long — the distance at which
 * the plates stand fully apart.
 *
 * The channel lies the one way the cord runs, and the simulation chooses it
 * (`sim/lid-way.ts`): the way a grab would take now while nobody has it, the
 * way the grab took once a hand does — down, then across towards the middle
 * of the field, then the other way, then up, the first the field holds the
 * whole cord of. A lid that has come far down the field turns its channel
 * across rather than drawing one that runs off the bottom. The rest is the
 * body's this frame, so the channel rides the falling lid with the handle.
 */
export function lidCordTrack(l: Layout, cfg: SimConfig, c: Creature, rest: Circle): PullTrack {
  const len = (cfg.lidTautMilli * l.tile) / 1000;
  const way = lidWayVec(lidWayNow(cfg, c));
  return straightPullTrack({ from: rest, r: rest.r, way, len });
}
