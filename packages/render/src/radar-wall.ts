import type { RadarBlip } from "./radar-blip.js";

/**
 * **The warning strip's second mark: the row, on a side wall** — for a body
 * that comes up inside the field rather than falling into it (`RadarBlip.wall`).
 *
 * The strip's own mark turned on its side: the same triangle, the same size,
 * colour and fade, pointing in from the wall along the row. Nothing joins the
 * two marks across the field — no line is drawn inside it
 * (`docs/spec/systems.md` 5.8) — so the place where they cross is the pair's
 * to find, which is the same reading of the field out loud as everything else.
 * No tail behind it either: a wedge with a tail on a wall is a crossing rock
 * (`field.ts`), and this one is not going to fly.
 */
export function drawRadarWallMark(
  ctx: CanvasRenderingContext2D,
  wall: NonNullable<RadarBlip["wall"]>,
  s: number,
  alpha: number,
  hex: string,
): void {
  const { x, y, side } = wall;
  // Pointing into the field: the tip away from the wall it stands on.
  const tip = x - side * s;
  const back = x + side * s * 0.55;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.moveTo(tip, y);
  ctx.lineTo(back, y - s * 0.85);
  ctx.lineTo(back, y + s * 0.85);
  ctx.closePath();
  ctx.fill();
}
