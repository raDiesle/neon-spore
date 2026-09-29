import type { Point, StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **THE FILAMENT's own blow at the hull** (`boss-strike-look.ts`). A fault on
 * the line, or the line left standing past its clock (`strikeFilament`,
 * `sim/filament-step.ts`), and the vein snaps at the tile it stood on: its
 * torn end whips down to the column in the vein's own wall, lumen and rim
 * (`filament-vein.ts`), bursts on the skin in the heart's blood, and is
 * pulled back up to where it tore. `from` is that tile (`boss-strike-from.ts`),
 * so the blow leaves the line where the pair were looking, never the top of
 * the field.
 */

/** The wall's width and the lumen's, in tiles, as the vein's own. */
const WALL = 0.42;
const LUMEN = 0.24;
/** How far the whip bows out sideways, in tiles. */
const BOW = 1.1;
/** The drops the burst throws along the skin. */
const DROPS = 5;

export function filamentBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  // Out fast and hard, back root-first as it fades: the tip travels, the tear stays.
  const reach = 1 - (1 - f.reach) ** 3;
  const back = f.after * f.after;
  const side = to.x >= from.x ? 1 : -1;
  const bend = { x: (from.x + to.x) / 2 + side * tile * BOW, y: (from.y + to.y) / 2 };
  const at = (t: number): Point => {
    const u = 1 - t;
    return {
      x: u * u * from.x + 2 * u * t * bend.x + t * t * to.x,
      y: u * u * from.y + 2 * u * t * bend.y + t * t * to.y,
    };
  };
  const tipT = reach * (1 - back);
  if (tipT <= 0) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [hex, width, a] of [
    [PALETTE.wispRim, WALL * 1.6, 0.25],
    [PALETTE.sheenDeep, WALL, 1],
    [PALETTE.sheenMid, LUMEN, 0.55],
    [PALETTE.wispRim, 0.06, 0.9],
  ] as const) {
    ctx.strokeStyle = rgba(hex, a * fade);
    ctx.lineWidth = tile * width;
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const p = at((tipT * i) / 12);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
  // The torn end, the part that hits: a knot of the heart's blood.
  const tip = at(tipT);
  ctx.fillStyle = rgba(PALETTE.sheenWarm, fade);
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, tile * (0.16 + 0.08 * reach), 0, Math.PI * 2);
  ctx.fill();
  if (f.after > 0) drawBurst(ctx, to, tile, f.after, fade);
  ctx.restore();
}

/** Where it struck: the blood thrown along the skin, and the ring the blow ran out in. */
function drawBurst(
  ctx: CanvasRenderingContext2D,
  to: Point,
  tile: number,
  after: number,
  fade: number,
): void {
  ctx.fillStyle = rgba(PALETTE.sheenWarm, 0.85 * fade);
  for (let i = 0; i < DROPS; i++) {
    const across = (i / (DROPS - 1)) * 2 - 1;
    const x = to.x + across * tile * (0.3 + 1.2 * after);
    const y = to.y - tile * 0.5 * Math.sin(Math.PI * after) * (1 - Math.abs(across) * 0.5);
    ctx.beginPath();
    ctx.arc(x, y, tile * 0.08 * (1.2 - Math.abs(across) * 0.4), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = rgba(PALETTE.wispRim, 0.8 * fade);
  ctx.lineWidth = tile * 0.08;
  ctx.beginPath();
  ctx.ellipse(
    to.x,
    to.y,
    tile * (0.4 + 1.5 * after),
    tile * (0.1 + 0.25 * after),
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
}
