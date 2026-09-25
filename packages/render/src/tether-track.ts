import type { Point } from "@neon-spore/content";
import type { SimConfig, WardenState } from "@neon-spore/sim";
import { fieldPoint } from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
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
 * once a hand is on it and has gone a handle's width it turns to the way
 * that hand is actually going — the fill has to be the pull, whichever way
 * it was made.
 */

/** How far the hand goes, in handle radii, before the channel turns to follow it. */
const FOLLOW_AFTER = 2;

export function wardenRopeTrack(
  l: Layout,
  cfg: SimConfig,
  b: WardenState,
  head: Point,
  rest: Circle,
): PullTrack {
  const from = b.pulling ? fieldPoint(l, { x: b.pullAnchorX, y: b.pullAnchorY }) : rest;
  let dx = 0;
  let dy = 1;
  const hx = head.x - from.x;
  const hy = head.y - from.y;
  const went = Math.hypot(hx, hy);
  if (b.pulling && went > 0) {
    const k = Math.min(1, went / (rest.r * FOLLOW_AFTER));
    dx = dx * (1 - k) + (hx / went) * k;
    dy = dy * (1 - k) + (hy / went) * k;
    const n = Math.hypot(dx, dy) || 1;
    dx /= n;
    dy /= n;
  }
  const len = (cfg.wardenTautMilli * l.tile) / 1000;
  return {
    pts: [
      { x: from.x, y: from.y },
      { x: from.x + dx * len, y: from.y + dy * len },
    ],
    w: rest.r * 0.6,
  };
}
