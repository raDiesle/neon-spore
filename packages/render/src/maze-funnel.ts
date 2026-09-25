import { type MazeWheel, mazeRadiusMilli, type SimConfig } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { mazeCanvasAngle, mazeRimHalfGapMilli } from "./maze-walls.js";
import { PALETTE } from "./palette.js";

/**
 * **THE MAZE's way in is a funnel**: the rim's cut flares outward, narrow
 * where it meets the corridor and wide at its mouth, so a gap coming round to
 * the ship's column is caught from further off and looks it. The owner, 25
 * September 2026, by name: *the entrance should snap a little, and maybe
 * widen like a filter shape, so it is easier to position.*
 *
 * **The mouth is the catch, drawn.** The rule clicks a way in onto the column
 * once it comes within `mazeSnapMilli` of the column's centre
 * (`mazeEntranceCol`); the funnel's mouth is exactly that window as an angle
 * at the rim, so whatever part of the column's line lies inside the mouth is a
 * click. What a pair sees is what catches, and the one number moves both.
 *
 * It changes no wall. The cut at the rim is still `mazeRimHalfGapMilli`, which
 * is where the shot goes in; the funnel is the bezel's (`maze-plate.ts`) and
 * the lit door's two cut ends (`maze-door.ts`), both of which ask this file
 * where the lips run rather than each working it out.
 */

/** How far out from the rim the funnel's mouth stands, as a share of the drum's radius. */
export const FUNNEL_DEPTH = 0.075;

/** The snap window, as a half-angle at the rim in thousandths of a degree. */
function catchHalfMilli(cfg: SimConfig): number {
  const s = Math.min(1, cfg.mazeSnapMilli / Math.max(1, mazeRadiusMilli(cfg)));
  return (Math.asin(s) * 180_000) / Math.PI;
}

/**
 * Half the funnel's width, as an angle, `k` of the way out from the rim (0)
 * to its mouth (1). Never narrower than the cut itself, so a wheel whose gap
 * is already wider than the catch gets straight sides rather than a funnel
 * pointing inward.
 */
export function mazeFunnelHalfMilli(
  cfg: SimConfig,
  wheel: MazeWheel,
  r: number,
  k: number,
): number {
  const half = mazeRimHalfGapMilli(wheel, r);
  const mouth = Math.max(half, catchHalfMilli(cfg));
  return half + (mouth - half) * Math.max(0, Math.min(1, k));
}

interface Point {
  x: number;
  y: number;
}

/**
 * The two lips of the way in standing at `at`: each from its cut end on the
 * rim to the mouth, in canvas pixels.
 */
export function mazeFunnelLips(
  cfg: SimConfig,
  wheel: MazeWheel,
  c: { cx: number; cy: number; r: number },
  at: number,
): { from: Point; to: Point }[] {
  const inner = mazeFunnelHalfMilli(cfg, wheel, c.r, 0);
  const outer = mazeFunnelHalfMilli(cfg, wheel, c.r, 1);
  const out = c.r * (1 + FUNNEL_DEPTH);
  const on = (rad: number, a: number): Point => {
    const p = mazeCanvasAngle(a);
    return { x: c.cx + rad * Math.cos(p), y: c.cy + rad * Math.sin(p) };
  };
  return [1, -1].map((side) => ({
    from: on(c.r, at + side * inner),
    to: on(out, at + side * outer),
  }));
}

/**
 * The funnel at every cut in the rim: a faint floor between the lips, so the
 * shape reads as a mouth and not as two strokes, and the lips themselves in
 * the bezel's metal. `turn` is the rim's angle, spin included.
 */
export function drawMazeFunnels(
  ctx: CanvasRenderingContext2D,
  c: { cx: number; cy: number; r: number },
  cfg: SimConfig,
  wheel: MazeWheel,
  turn: number,
): void {
  const cuts = wheel.openings[wheel.rings] ?? [];
  if (cuts.length === 0) return;
  const floor = new Path2D();
  const lips = new Path2D();
  for (const cut of cuts) {
    const [a, b] = mazeFunnelLips(cfg, wheel, c, turn + cut);
    if (a === undefined || b === undefined) continue;
    floor.moveTo(a.from.x, a.from.y);
    floor.lineTo(a.to.x, a.to.y);
    floor.lineTo(b.to.x, b.to.y);
    floor.lineTo(b.from.x, b.from.y);
    floor.closePath();
    for (const lip of [a, b]) {
      lips.moveTo(lip.from.x, lip.from.y);
      lips.lineTo(lip.to.x, lip.to.y);
    }
  }
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.14);
  ctx.fill(floor);
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.lineWidth = 2.4;
  ctx.stroke(lips);
  ctx.restore();
}
