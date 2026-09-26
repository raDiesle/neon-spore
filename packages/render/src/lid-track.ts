import type { Point } from "@neon-spore/content";
import { type Creature, lidSide, type SimConfig } from "@neon-spore/sim";
import type { Circle, Layout } from "./layout.js";
import { fittingWay, PULL_DOWN, PULL_UP, straightPullTrack } from "./pull-line.js";
import type { PullTrack } from "./pull-track.js";

/**
 * **Where THE LID's cord can be pulled**, as the channel `pull-track.ts`
 * draws: from the cord's rest, `lidTautMilli` long — the distance at which
 * the plates stand fully apart.
 *
 * Any direction opens it, as with THE WARDEN's rope (`sim/handle-pull.ts`),
 * so the channel lies the first way the field holds its whole length
 * straight: down, then across towards the middle of the field (the side the
 * cord already hangs on, `lidSide`), then the other way, then up. A lid that
 * has come far down the field turns its channel across rather than drawing
 * one that runs off the bottom. The rest is the body's this frame, so the
 * channel rides the falling lid with the handle, and once a hand has it the
 * channel turns to the way the hand is going (`pull-line.ts`).
 */
export function lidCordTrack(
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  rest: Circle,
  head: Point,
  held: boolean,
): PullTrack {
  const len = (cfg.lidTautMilli * l.tile) / 1000;
  const side = lidSide(cfg, c);
  const way = fittingWay(l, cfg, rest, len, [
    PULL_DOWN,
    { dx: side, dy: 0 },
    { dx: -side, dy: 0 },
    PULL_UP,
  ]);
  return straightPullTrack({ from: rest, r: rest.r, head, held, rest: way, len });
}
