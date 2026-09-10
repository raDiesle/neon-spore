import type { BackdropDraw } from "../../../../../packages/render/src/backdrop-look.js";
import { gradientSlot, slotGradient } from "../../../../../packages/render/src/gradient-slot.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * BARE — nothing behind the field but the dark, and the dark is deepest at
 * the edges.
 *
 * The shipped back is five layers: a breathing wash, three shafts of light
 * leaning to the key, a horizon band, and two depths of dust drifting
 * sideways. Every one of them is dim on purpose, and every one of them is
 * still *something moving behind the bodies* — and the whole of what the
 * two players are doing is telling one body from another and counting the
 * column it is in. This candidate argues the plainest case: that the field
 * reads best with nothing behind it at all, and that the one thing a back
 * should do is hold the eye in the middle, where the columns are.
 *
 * So it paints one thing. A vignette: transparent over the play area and
 * settling into the field's own black toward the two side edges and the top
 * corners, so the lanes sit in a pool of the brighter ground and everything
 * outside them falls away. No dust, no light, no horizon — the beat sweep
 * `drawGrid` runs is the only thing that moves behind a body, and it is the
 * beat, which is the one thing worth moving for.
 *
 * **How it can lose.** *It reads as a test rig.* The owner asked for a field
 * with a back the day the shipped one was written, and this is a field with
 * no back. If four bodies against a plain pool look like sprites on a grid
 * rather than things in a space, the argument is lost at a glance.
 */

/** How far in from the side edges the pool reaches full ground, as a share of
 * the width, and how dark the edge gets — the field's own black, not a new one. */
const EDGE_REACH = 0.42;
const EDGE_DEPTH = 0.75;

/** One gradient per layout, never one per frame — `field.ts`'s own pattern. */
const poolSlot = gradientSlot<CanvasGradient>();

export function bare(d: BackdropDraw): void {
  const { ctx, l } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  const cx = l.width / 2;
  const cy = height * 0.45;
  const inner = l.width * EDGE_REACH;
  const outer = Math.hypot(l.width / 2, height * 0.6);
  const g = slotGradient(ctx, poolSlot, `${l.width},${height}`, () => {
    const grad = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
    grad.addColorStop(0, `${PALETTE.background}00`);
    grad.addColorStop(1, `${PALETTE.background}${Math.round(EDGE_DEPTH * 255).toString(16)}`);
    return grad;
  });
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, l.width, height);
}
