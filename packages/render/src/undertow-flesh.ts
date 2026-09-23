import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE UNDERTOW is made of** where it comes up through the plating: a
 * slime lobe, wet, lit from above and from the breach under it — not a grey
 * fill with a glowing line drawn round it, which is the one picture the brief
 * rules out by name (`new-boss-more` §6.3).
 *
 * Split off `undertow-lobe.ts`, which decides *where* a lobe stands and how
 * tall, so that file stays about the fight and this one about the material.
 *
 * **The light is the breach's.** Whatever the ship stands on glows in the
 * hull's violet, and a lobe pushed up out of it carries that light on its
 * foot, fading up the lobe; the shoulder takes the cold light from above,
 * and the side away from it goes to the deep. The squeeze through a plate
 * leaves a fold across the foot, which is what says *pushed up* rather than
 * *standing*.
 *
 * **The colours go in plain and the strength in the alpha**, so the tests
 * find the lobe's grey, the tall one's two beam colours and the body's ground
 * on the op log (`undertow-frame.test.ts`).
 */

/** Where one lobe or the body sits: its middle, its half-sizes, and the skin it crosses. */
export interface Mass {
  x: number;
  /** The top of it. */
  top: number;
  /** The hull line it comes up through. */
  skin: number;
  /** Half its width at the widest. */
  hw: number;
  tile: number;
}

/** A lobe: rock flesh, and on a tall one the beam's colours lit inside its wall. */
export function paintLobe(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  m: Mass,
  tall: boolean,
): void {
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(path);
  ctx.clip(path);
  shade(ctx, path, m, PALETTE.rock);
  underlight(ctx, path, m, 0.55);
  fold(ctx, m);
  if (tall) {
    // The beam's colours, one per end, lit on the inside of the wall and
    // clipped to the thirds so the middle stays grey: a lobe wholly red would
    // be a lobe somebody loads red for.
    const third = (m.skin - m.top) / 3;
    innerWall(ctx, path, m, m.top - m.tile, third + m.tile, PALETTE.cyan, 0.85);
    innerWall(ctx, path, m, m.skin - third, third, PALETTE.red, 0.85);
  } else {
    // The shoulder's cold light on the inside of the wall, top half only:
    // light from above, not a line drawn round the thing.
    innerWall(ctx, path, m, m.top - m.tile, (m.skin - m.top) * 0.45 + m.tile, PALETTE.rock, 0.4);
  }
  ctx.restore();
  film(ctx, m, 0.3);
}

/** The body: the ship's own deep, lit up from the breach it is squeezing through. */
export function paintBody(ctx: CanvasRenderingContext2D, path: Path2D, m: Mass): void {
  ctx.save();
  ctx.fillStyle = PALETTE.sheenDeep;
  ctx.fill(path);
  ctx.clip(path);
  shade(ctx, path, m, PALETTE.sheenRim);
  underlight(ctx, path, m, 0.8);
  fold(ctx, m);
  innerWall(ctx, path, m, m.top - m.tile, m.skin - m.top + m.tile * 2, PALETTE.hull, 0.55);
  ctx.restore();
  film(ctx, m, 0.35);
}

/** Lit on the upper left shoulder, gone to the deep on the far side. */
function shade(ctx: CanvasRenderingContext2D, path: Path2D, m: Mass, lit: string): void {
  const h = m.skin - m.top;
  const g = ctx.createLinearGradient(m.x - m.hw, m.top, m.x + m.hw, m.top + h * 0.8);
  g.addColorStop(0, rgba(lit, 0.45));
  g.addColorStop(0.4, rgba(lit, 0));
  g.addColorStop(0.7, rgba(PALETTE.sheenDeep, 0));
  g.addColorStop(1, rgba(PALETTE.sheenDeep, 0.6));
  ctx.fillStyle = g;
  ctx.fill(path);
}

/** The breach's violet on the foot, fading up the lobe. */
function underlight(ctx: CanvasRenderingContext2D, path: Path2D, m: Mass, a: number): void {
  const h = m.skin - m.top;
  const g = ctx.createLinearGradient(0, m.skin, 0, m.skin - Math.min(h, m.tile * 1.4));
  g.addColorStop(0, rgba(PALETTE.hull, a));
  g.addColorStop(1, rgba(PALETTE.hull, 0));
  ctx.fillStyle = g;
  ctx.fill(path);
}

/**
 * One fold across the foot, bowing up, where the plate squeezed it. Two
 * stacked creases were drawn first and read as a sleeping face.
 */
function fold(ctx: CanvasRenderingContext2D, m: Mass): void {
  const y = m.skin - (m.skin - m.top) * 0.14;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, m.tile * 0.045);
  ctx.strokeStyle = rgba(PALETTE.sheenDeep, 0.5);
  ctx.beginPath();
  ctx.moveTo(m.x - m.hw * 0.85, y + m.tile * 0.04);
  ctx.quadraticCurveTo(m.x - m.hw * 0.1, y - m.tile * 0.1, m.x + m.hw * 0.8, y);
  ctx.stroke();
}

/**
 * The inside of the wall lit in one colour over one horizontal band: the
 * path stroked wide while clipped to itself, so only the inner half shows.
 */
function innerWall(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  m: Mass,
  y: number,
  height: number,
  colour: string,
  a: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(m.x - m.hw * 2, y, m.hw * 4, height);
  ctx.clip();
  ctx.lineWidth = m.tile * 0.16;
  ctx.strokeStyle = colour;
  ctx.globalAlpha = a;
  ctx.stroke(path);
  ctx.restore();
}

/** The wet film on the shoulder: a soft bloom and a hard point. */
function film(ctx: CanvasRenderingContext2D, m: Mass, a: number): void {
  const r = Math.min(m.hw, (m.skin - m.top) * 0.6);
  if (r < 2) return;
  const x = m.x - m.hw * 0.35;
  const y = m.top + r * 0.55;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, a);
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.3, r * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.85);
  ctx.beginPath();
  ctx.arc(x - r * 0.08, y - r * 0.03, Math.max(0.8, r * 0.06), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
