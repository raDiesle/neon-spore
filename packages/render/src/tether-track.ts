import type { Point } from "@neon-spore/content";
import type { SimConfig, WardenState } from "@neon-spore/sim";
import { fieldPoint } from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
import { PULL_DOWN, straightPullTrack } from "./pull-line.js";
import type { PullTrack } from "./pull-track.js";

/**
 * **Where THE WARDEN's rope can be pulled**, as the channel `pull-track.ts`
 * draws: from where the hand takes hold, `wardenTautMilli` long — the
 * distance at which the line is taut and the hatch fully open.
 *
 * **One fixed path, straight down** (`sim/warden-rope.ts`): only the hand's
 * travel down it counts, so the channel never turns to follow the hand — it is
 * the path, drawn before anybody touches it and still there while they pull.
 * Down rather than along the rope, which leans as the pupil walks and would
 * point it off the field; down is the one way the field holds the whole length
 * from where the rope hangs, with a fifth of a tile in hand (`config-boss.ts`).
 */
export function wardenRopeTrack(
  l: Layout,
  cfg: SimConfig,
  b: WardenState,
  head: Point,
  rest: Circle,
): PullTrack {
  const from = b.pulling ? fieldPoint(l, { x: b.pullAnchorX, y: b.pullAnchorY }) : rest;
  return straightPullTrack({
    from,
    r: rest.r,
    head,
    held: b.pulling,
    rest: PULL_DOWN,
    follow: false,
    len: (cfg.wardenTautMilli * l.tile) / 1000,
  });
}
