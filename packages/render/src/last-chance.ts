import type { World } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **ONE LAST CHANCE, over a body the shield has already pushed.**
 *
 * The owner's words, 25 September 2026. The shield answers a creature once
 * (`sim/shield-push.ts`), and nothing about the body says so: it climbs, tops
 * out and falls again looking exactly as it did the first time. The pair has
 * to know that this fall is the cannon's or the hull's, and the words say it.
 *
 * Read straight off the world every frame — a body is pushed or it is not —
 * so nothing is kept per body and a restart has nothing here to forget. Only
 * the pulse is render time, handed in by `ShieldPushFx`.
 *
 * On **both screens**, unlike the lure's IGNORE: this is not one seat being
 * told something the other is not. Both hands were in the push and both have
 * to change what they do next. In `PALETTE.text` rather than the rim's red,
 * so a red word over a cyan body is never read as the colour to fire.
 *
 * Above the body, centred, and pulled in from the screen's edge the way the
 * lure's label is, so a body in the first or last column keeps its words.
 */

const LABEL = "ONE LAST CHANCE";
/** The lure's size and weight: the field's one size for a word on a body. */
const FONT = '600 9px "Courier New",monospace';
/** Gap between the body's top and the words, in pixels. */
const GAP = 6;
/** Pulses a second, and how far the alpha dips on each. A slow breath: this
 * is a warning that holds, not a clock running down. */
const PULSE_HZ = 1.6;
const PULSE_DIP = 0.3;

export function drawLastChances(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  let set = false;
  for (const c of world.creatures) {
    if (c.pushed !== true) continue;
    if (!set) {
      ctx.save();
      ctx.font = FONT;
      ctx.fillStyle = PALETTE.text;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.globalAlpha = 1 - PULSE_DIP * (0.5 + 0.5 * Math.sin(time * PULSE_HZ * Math.PI * 2));
      set = true;
    }
    const { x, y } = creatureCenter(l, world, c, beatPhase);
    const half = ctx.measureText(LABEL).width / 2;
    const cx = Math.min(Math.max(x, half + 4), l.width - half - 4);
    ctx.fillText(LABEL, cx, y - creatureRadius(l, world, c, beatPhase) - GAP);
  }
  if (set) ctx.restore();
}
