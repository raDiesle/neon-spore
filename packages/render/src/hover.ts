import { bandControlSet } from "./band.js";
import { halo } from "./glow.js";
import { bandLobes, hitCircle, type Layout } from "./layout.js";
import type { ViewState } from "./renderer.js";
import { seatSkin } from "./seat-skin.js";

/**
 * WHAT A MOUSE IS RESTING ON, LIT.
 *
 * The owner asked for it in one line — *when I am on PC and mouse hover, I want
 * to see a hover effect on any kind of buttons and slider.* Two of the three
 * already had one: the cannon and the shield light the swelling a press would
 * take hold of (`ship-hand.ts`, and `apps/game/src/input.ts` feeds it), and the
 * guide's own bar lights its buttons from inside (`nav-button.ts`). What was
 * left is the band's controls, and this is them.
 *
 * **It is drawn over the finished button rather than inside it.** A ring
 * outside the contour and a pool of light under the cursor say "this one" from
 * on top, which costs one pass and no signature: `drawBand` already has seven
 * arguments and threading a pointer down through it to `drawLobe` would have
 * made three files know about a mouse.
 *
 * **The target is the one a press actually answers**, not the drawn circle:
 * `hitCircle` is a ring wider than the button (`hitReach`), and a highlight that lit a
 * smaller area than the press would teach the wrong edge.
 *
 * A phone reports no hover at all — `pointer` is set only for a mouse — so this
 * draws nothing there, which is the whole of its cost on the device the game is
 * actually played on.
 */
export function drawControlHover(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const p = view.pointer;
  if (!p) return;
  const set = bandControlSet(view.controls, view.world.wave);
  const skin = seatSkin(l.role);
  // The nearest reach under the pointer, which is the one a press takes
  // (`touch-lobe.ts` `lobeUnder`).
  const lobes = ([1, 2] as const).flatMap((player) => bandLobes(l, set, player));
  const under = lobes
    .filter((lobe) => hitCircle(lobe.circle, p.x, p.y))
    .sort(
      (a, b) =>
        Math.hypot(p.x - a.circle.x, p.y - a.circle.y) -
        Math.hypot(p.x - b.circle.x, p.y - b.circle.y),
    )[0];
  if (under === undefined) return;
  const { x, y, r } = under.circle;
  halo(ctx, x, y, r * 1.9, skin.rim, 0.3);
  ctx.strokeStyle = skin.rim;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
