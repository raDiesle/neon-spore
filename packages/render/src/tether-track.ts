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
 * Any direction opens the gate (`sim/warden-rope.ts`: it is the *length* of
 * the pull), but only one fits the field straight: down, away from the eye
 * the rope comes out of, with a fifth of a tile in hand (`config-boss.ts`).
 * So the channel hangs straight down while nobody has it — not on along the
 * rope, which leans as the pupil walks and would point it off the field — and
 * once a hand is on it turns to follow that hand (`pull-line.ts`).
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
    len: (cfg.wardenTautMilli * l.tile) / 1000,
  });
}
