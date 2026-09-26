import type { Color } from "@neon-spore/sim";
import { cystCoreR, type Point } from "./cyst-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawOculusSight } from "./oculus-story.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE CYST's three story steps, drawn** (§34; the rules are
 * `sim/cyst-step.ts` and `sim/cyst-shot.ts`).
 *
 * - **The swell** is the outline itself, blown up and sinking back as both
 *   pinches hold it (`cyst-pose.ts`); nothing here.
 * - **The spore.** The bottom lobe bulges and lets a spore go; it hangs over
 *   the column it will fall down and sinks as its step runs out, with THE
 *   OCULUS's dotted sight to the hull and a notch where the shield must stand.
 * - **The bud.** A stalk grows out of the sac to a bud over its column, ringed
 *   in the colour it wants and the ring closing as its window runs out.
 *
 * Both in the sac's own frame, its middle at the origin; both screens alike.
 */

/** The spore's radius, and how far toward the hull it sinks by the time its step runs out. */
const SPORE = 0.3;
const SINK = 0.45;
/** The bud's radius, and how high over the sac's middle it grows, in tiles. */
const BUD = 0.42;
const BUD_RISE = 0.9;

/** The step's colour as a fill and a rim; white for either. */
export function cystColour(color: Color | "either"): { body: string; rim: string } {
  if (color === "either") return { body: PALETTE.hullRim, rim: PALETTE.hullRim };
  return { body: PALETTE[color], rim: color === "red" ? PALETTE.redRim : PALETTE.cyanRim };
}

/**
 * The spore, `out` of the way let go from `tip` to hang `dx` across, `sink`
 * of the way sunk toward the hull `toHull` below.
 */
export function drawCystSpore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  tip: Point,
  out: number,
  sink: number,
  dx: number,
  toHull: number,
  beatPhase: number,
): void {
  if (out <= 0) return;
  const hang = tip.y + l.tile * 0.6;
  const y = hang + (toHull - hang) * SINK * sink;
  const at = { x: tip.x + (dx - tip.x) * out, y: tip.y + (y - tip.y) * out };
  const r = SPORE * l.tile * (0.5 + 0.5 * out);
  const spore = new Path2D();
  spore.ellipse(at.x, at.y, r * 0.9, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.cystSac, 0.95);
  ctx.fill(spore);
  const pulse = 0.6 + 0.4 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlow(ctx, spore, PALETTE.cystScar, STROKE.inner, out * pulse);
  const colour = { body: PALETTE.hullRim, rim: PALETTE.cystScar };
  drawOculusSight(ctx, l, { x: at.x, y: at.y + r }, { x: dx, y: toHull }, colour, out);
}

/**
 * The bud, `grown` of the way out on its stalk to hang `dx` across from the
 * sac's middle, ringed in `color` with `left` of its window still to run.
 */
export function drawCystBud(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  grown: number,
  dx: number,
  color: Color | "either",
  left: number,
  beatPhase: number,
): void {
  if (grown <= 0) return;
  const root = { x: Math.sign(dx) * cystCoreR(l) * 1.8, y: -cystCoreR(l) * 1.4 };
  const at = { x: root.x + (dx - root.x) * grown, y: -BUD_RISE * l.tile * grown + root.y };
  const stalk = new Path2D();
  stalk.moveTo(root.x, root.y);
  stalk.quadraticCurveTo(root.x + (at.x - root.x) * 0.2, at.y, at.x, at.y);
  ctx.lineWidth = STROKE.outline * 2.2;
  ctx.strokeStyle = rgba(PALETTE.cystSac, 0.95);
  ctx.stroke(stalk);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.cystSacDark, 0.8);
  ctx.stroke(stalk);
  const r = BUD * l.tile * grown;
  const bud = new Path2D();
  bud.ellipse(at.x, at.y, Math.max(0.5, r), Math.max(0.5, r * 1.12), 0, 0, Math.PI * 2);
  const { body, rim } = cystColour(color);
  ctx.fillStyle = rgba(body, 0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2));
  ctx.fill(bud);
  strokeGlow(ctx, bud, rim, STROKE.inner, grown);
  if (left <= 0) return;
  const ring = new Path2D();
  ring.arc(at.x, at.y, r * 1.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  strokeGlow(ctx, ring, body, STROKE.outline, grown);
}

/** How the core is lit: shown in a fire step's colour with its window, or dull. */
export interface CystCoreLit {
  color: Color | "either";
  left: number;
}
