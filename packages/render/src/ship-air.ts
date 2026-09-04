import { gradientSlot, slotGradient } from "./gradient-slot.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { P1_SKIN, type SeatSkin } from "./seat-skin.js";

/**
 * THE AIR THE SHIP IS SITTING IN.
 *
 * The panel below the hull is the ship seen from inside and is painted in the
 * seat's own colour throughout (`seat-skin.ts`). Above the hull there was
 * nothing of the seat at all: the same cold violet sky on both devices, right
 * up to a gold rim. The owner asked for the other half of it — *slightly change
 * the space air above the shield, but not so much, also to have another colour,
 * slightly the golden* — and this is it. The ship lights the water it is in.
 *
 * **It is the field's back, not the field.** It goes down over the backdrop and
 * under the grid, the radar and every body, so nothing a player has to read is
 * drawn on top of it. That matters more here than anywhere: the two ammunition
 * colours have to survive at 26 px against whatever is behind them
 * (`backdrop.ts`'s header), and this is the only thing in the picture that
 * differs between the two seats while the bodies on it do not.
 *
 * **Slightly, in the owner's word, is the whole specification.** It is one
 * gradient rising off `bandTop` and gone within a third of the sky, additive,
 * peaking under a tenth — dimmer than the act's own wash. What it has to do is
 * be noticed once and never again, which is what a seat's colour is for.
 *
 * The bottom of it is under the hull and never reaches a screen: the ship is
 * painted over this pass, so what is actually seen begins at the silhouette and
 * follows it. That is why the glow hugs the lobes without this file knowing
 * where a lobe is.
 *
 * **Stateless.** The gradient depends on the layout and the seat, and the
 * breathe is `globalAlpha` on a cached one rather than a rebuilt gradient —
 * pure functions of `time` either way, so there is nothing here for
 * `Effects.reset()` to forget (`restart.test.ts`).
 */

/** How far up the sky it reaches, as a share of the field's height. */
const REACH = 0.34;

const airSlot = gradientSlot<CanvasGradient>();

/** How far up the field the ship's light reaches, in pixels. */
function reach(l: Layout): number {
  return Math.min(l.bandTop * REACH, l.tile * 8);
}

export function drawShipAir(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  skin: SeatSkin = P1_SKIN,
): void {
  const bottom = l.bandTop;
  const top = bottom - reach(l);
  if (bottom <= 0 || l.width <= 0 || top >= bottom) return;
  // The two stops are the seat's colour at two depths rather than one: the
  // brightest thread of it right against the hull, where a rim light would be
  // spilling off the skin, and the tissue's own colour above that, which is
  // the same colour the chamber under the ship is made of. The seats' two
  // `flesh` triples are matched to each other by value, so neither of them
  // lifts one screen's sky further than the other's (`seat-skin.ts`).
  const g = slotGradient(ctx, airSlot, `${top}|${bottom}|${skin.tint}`, () => {
    const grad = ctx.createLinearGradient(0, top, 0, bottom);
    grad.addColorStop(0, rgba(skin.flesh[1], 0));
    grad.addColorStop(0.66, rgba(skin.flesh[0], 0.065));
    grad.addColorStop(1, rgba(skin.tint, 0.17));
    return grad;
  });
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // The same slow breathe the act's wash has, and deliberately out of step
  // with it: two layers rising and falling together would read as one thing
  // flickering. Spent on `globalAlpha` so the gradient itself stays cached.
  ctx.globalAlpha = 0.82 + 0.18 * Math.sin(time * 0.09 + 2.3);
  ctx.fillStyle = g;
  ctx.fillRect(0, top, l.width, bottom - top);
  ctx.restore();
}
