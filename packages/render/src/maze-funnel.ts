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
 * is where the shot goes in; the funnel is the bezel's (`maze-plate.ts`), the
 * lit door's two cut ends (`maze-door.ts`) and the gap in the lever's channel
 * (`maze-string.ts`), all of which ask this file where the lips run rather
 * than each working it out.
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
 * The funnel at every cut in the rim: its two lips in the bezel's metal, and
 * nothing between them. There was a faint floor across the mouth, so the
 * shape read as a mouth and not as two strokes; the owner read it as a grey
 * patch across the way in (5 October 2026: *must be removed to show as a
 * cleaned free entrance*), so the mouth is open to the field now. `turn` is
 * the rim's angle, spin included.
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
  const lips = new Path2D();
  for (const cut of cuts) {
    for (const lip of mazeFunnelLips(cfg, wheel, c, turn + cut)) {
      lips.moveTo(lip.from.x, lip.from.y);
      lips.lineTo(lip.to.x, lip.to.y);
    }
  }
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.lineWidth = 2.4;
  ctx.stroke(lips);
  ctx.restore();
}

/**
 * Everything outside the drum but the ways in: the canvas with a wedge cut out
 * at every gap in the rim, as wide as the funnel's mouth and reaching `reach`
 * from the centre. Clipped to by the lever's channel (`maze-string.ts`), which
 * runs round the rim and used to cross every way in as a grey band.
 */
export function mazeOutsideGaps(
  cfg: SimConfig,
  wheel: MazeWheel,
  c: { cx: number; cy: number; r: number },
  turn: number,
  reach: number,
): Path2D {
  const p = new Path2D();
  p.rect(c.cx - reach * 2, c.cy - reach * 2, reach * 4, reach * 4);
  const half = mazeFunnelHalfMilli(cfg, wheel, c.r, 1);
  for (const cut of wheel.openings[wheel.rings] ?? []) {
    const from = mazeCanvasAngle(turn + cut + half);
    const to = mazeCanvasAngle(turn + cut - half);
    p.moveTo(c.cx, c.cy);
    p.arc(c.cx, c.cy, reach, from, to);
    p.closePath();
  }
  return p;
}
