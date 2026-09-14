import { halo } from "./glow.js";
import type { NavBox } from "./guide-nav.js";
import { LIFT } from "./guide-nav.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The slab the guide's bar stands on. Out of `guide-nav.ts` on line count when
 * the bar learnt to answer a press on the picture (`NUDGE_S`); the bar's
 * buttons and dots stay there, this is only the ground under them.
 */

/**
 * The slab itself: a shadow cast up onto the game, a ground that is not the
 * panel's colour, and a lit rim along the top edge. All three are saying the
 * same thing — this is lying on the phone, not built into it.
 */
export function slab(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  bar: NavBox,
  age: number,
  nudge: number,
): void {
  const cast = ctx.createLinearGradient(0, bar.y - LIFT, 0, bar.y);
  cast.addColorStop(0, "rgba(0,0,0,0)");
  cast.addColorStop(1, "rgba(0,0,0,.62)");
  ctx.fillStyle = cast;
  ctx.fillRect(0, bar.y - LIFT, l.width, LIFT);

  // Cold slate, where the panel above it is warm violet tissue. The two are
  // not variations on one colour: the whole point of the slab is that a glance
  // tells you it is not part of the ship.
  const ground = ctx.createLinearGradient(0, bar.y, 0, bar.y + bar.h);
  ground.addColorStop(0, "#1B2140");
  ground.addColorStop(0.16, "#0B0E22");
  ground.addColorStop(1, "#05070F");
  ctx.fillStyle = ground;
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);

  // A pale rim, breathing, with its own light on the game above it. Pale and
  // not pink: every lit edge in this game belongs to something the ship grew,
  // and this one is the one edge that belongs to the tool laid over it.
  // And brighter for a moment after a press on the picture (`NUDGE_S`).
  const lit = 0.07 + 0.03 * Math.sin(age * 1.6) + 0.35 * nudge;
  halo(ctx, l.width / 2, bar.y, l.width * 0.55, PALETTE.text, lit);
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.5 + 0.5 * nudge;
  ctx.fillRect(0, bar.y, l.width, 2 + 2 * nudge);
  ctx.globalAlpha = 0.14;
  ctx.fillRect(0, bar.y + 3, l.width, 1);
  ctx.globalAlpha = 1;
}
