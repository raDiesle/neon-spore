import { priming, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { cannonTip, type HullMood, type LobePositions } from "./hull.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE OTHER HAND: the cheapest presence a two-device co-op game can show — not
 * what a control is doing, only that a thumb is on one right now.
 *
 * Of everything the band emits (`touch.ts`), only the lance (`prime`) is a
 * genuine hold with both edges: `touchDown` sends it and `touchUp` explicitly
 * ends it. The cannon and shield strips are drags with no release signal —
 * lifting a finger from either leaves nothing in the world, so there is no
 * honest "held" state to read back for them. This file draws exactly one
 * thing: whether player 1's thumb is on the lance, at this instant, as a slow
 * pulse over the cannon lobe — the lobe the lance itself fills. It is not the
 * fill: `drawLanceMark` already draws the column and how full it is, to the
 * same thousandth on both screens (docs/spec/systems.md 5.2). This is only
 * presence, on or off, with nothing to teach.
 *
 * It is drawn from the same `world` both devices hold, so both draw it the
 * same way — the mark row of the information split is deliberately not split
 * between the two seats, and neither is this. It says nothing about *where*
 * the thumb sits beyond the cannon's own column, and nothing at all about
 * player 2's hands: the shield strip and the fire buttons have no hold state
 * to show, so this stays one-directional rather than guessing the other half.
 */
export function drawOtherHand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
  mood: HullMood,
  at: LobePositions,
): void {
  if (!priming(world)) return;
  const tip = cannonTip(l, time, mood, at);
  // A pulse, not a fill — presence has no progress to show, and a steady glow
  // would read as paint rather than a hand that is still there.
  const pulse = 0.6 + 0.4 * Math.sin(time * 6);
  halo(ctx, tip.x, tip.y, l.tile * 1.6, PALETTE.hullRim, 0.3 * pulse);
}
