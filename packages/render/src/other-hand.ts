import { priming, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { HullMood, LobePositions } from "./hull.js";
import type { HullFrame } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { cannonTip } from "./muzzle.js";
import { PALETTE } from "./palette.js";

/**
 * THE OTHER HAND: the cheapest presence a two-device co-op game can show — not
 * what a control is doing, only that a thumb is on one right now.
 *
 * Of everything the band emits (`touch.ts`), only a thumb on a colour
 * (`prime`) is a genuine hold with both edges: `touchDown` sends it and
 * `touchUp` explicitly ends it. The cannon and shield strips are drags with no
 * release signal — lifting a finger from either leaves nothing in the world,
 * so there is no honest "held" state to read back for them. This file draws
 * exactly one thing: whether **player 2's** thumb is resting on a colour, at
 * this instant, as a slow pulse over the cannon lobe — the lobe that hold
 * fills. It is not the fill: `drawLanceMark` already draws the beam in the
 * column and how far it has grown, to the same thousandth on both screens
 * (docs/spec/systems.md 5.2). This is only presence, on or off.
 *
 * **The direction reversed on 7 September 2026** and nothing about the picture
 * had to change, which is the argument for having drawn presence rather than
 * progress in the first place. The lance used to be filled by player 1 holding
 * a button of his own; the owner took that button away and put the fill on the
 * trigger, so the thumb this reports is now the navigator's and the seat that
 * most wants to see it is the pilot's.
 *
 * It is drawn from the same `world` both devices hold, so both draw it the
 * same way — the mark row of the information split is deliberately not split
 * between the two seats, and neither is this. It says nothing about *where*
 * the thumb sits beyond the cannon's own column, and nothing about which
 * colour is under it: that is `drawLanceMark`'s to say, once the fill has
 * begun to mean something.
 */
export function drawOtherHand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
  mood: HullMood,
  at: LobePositions,
  // Handed down from `drawShip`'s single `frame()` call for this tick, the
  // same as `drawHull` and `hullSkinY` take — defaulted so a caller with only
  // the four numbers above still gets the same answer.
  f?: HullFrame,
): void {
  if (!priming(world)) return;
  const tip = f ? cannonTip(l, time, mood, at, f) : cannonTip(l, time, mood, at);
  // A pulse, not a fill — presence has no progress to show, and a steady glow
  // would read as paint rather than a hand that is still there.
  const pulse = 0.6 + 0.4 * Math.sin(time * 6);
  halo(ctx, tip.x, tip.y, l.tile * 1.6, PALETTE.hullRim, 0.3 * pulse);
}
