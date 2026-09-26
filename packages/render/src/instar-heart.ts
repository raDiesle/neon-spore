import { type InstarState, instarStep } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { instarMarkPoint } from "./instar-place.js";
import type { Figure } from "./instar-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The bare body's heart**, lit in the split along its back after the moult
 * (docs/spec/bosses.md §11.32, *The second act*): a glow that beats on the
 * music's beat where the step's heart mark is, under the ring, so the ring is
 * on something alive rather than on a stretch of body.
 *
 * Its strength is the figure's `heart`, which the morph brings in and every
 * bolt that lands puts out by its share of the count (`deformed`,
 * `instar-shape.ts`), so the four shots are four steps down to dark.
 */
export function drawInstarHeart(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: InstarState,
  f: Figure,
  sway: { xMilli: number; yMilli: number },
  beatPhase: number,
  fade: number,
): void {
  if (f.heart <= 0.01) return;
  const mark = instarStep(s)?.marks.find((m) => m.part === "heart");
  if (mark === undefined) return;
  const at = instarMarkPoint(l, mark, sway, 0);
  // A beat is a thump and a slower easing off.
  const thump = Math.exp(-beatPhase * 5);
  const a = f.heart * fade;
  const r = l.tile * (0.9 + 0.35 * thump);
  ctx.save();
  const g = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, r * 2.2);
  g.addColorStop(0, rgba(PALETTE.redRim, 0.9 * a));
  g.addColorStop(0.25, rgba(PALETTE.red, (0.6 + 0.3 * thump) * a));
  g.addColorStop(0.6, rgba(PALETTE.ember, 0.25 * a));
  g.addColorStop(1, rgba(PALETTE.red, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * 2.2, 0, Math.PI * 2);
  ctx.fill();
  // The heart itself: two lobes and a point, the shape the word already is.
  const h = r * 0.55;
  ctx.fillStyle = rgba(PALETTE.redRim, 0.85 * a);
  ctx.beginPath();
  ctx.moveTo(at.x, at.y + h);
  ctx.bezierCurveTo(at.x - h * 1.4, at.y, at.x - h * 0.6, at.y - h * 1.1, at.x, at.y - h * 0.35);
  ctx.bezierCurveTo(at.x + h * 0.6, at.y - h * 1.1, at.x + h * 1.4, at.y, at.x, at.y + h);
  ctx.fill();
  ctx.restore();
}
