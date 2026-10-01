import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE UNDERTOW is made of** where it comes up through the plating: the
 * ship's own flesh, a bump of the hull the way the cannon is one — wet, lit
 * from above and from the breach under it, and coloured inside its wall by
 * what answers it.
 *
 * Split off `undertow-lobe.ts`, which decides *where* a lobe stands and how
 * tall, so that file stays about the fight and this one about the material.
 *
 * **The colour is the answer.** A yellow lobe is the maw's — the pod colour,
 * which is what the maw takes everywhere else — and a cyan one the shield's,
 * in the dome's own colour, so the pair reads which control by looking and
 * says it in one word. A tall lobe carries the colour the whole length of its
 * wall and brighter: it is the one a tap has to come down on.
 *
 * **The colours go in plain and the strength in the alpha**, so the tests
 * find the lobe's ground and its answer's colour on the op log
 * (`undertow-frame.test.ts`).
 */

/** Where one lobe sits: its middle, its half-sizes, and the skin it crosses. */
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

/** A lobe: the hull's deep, lit from the breach, and its answer's colour inside the wall. */
export function paintLobe(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  m: Mass,
  colour: string,
  tall: boolean,
): void {
  ctx.save();
  ctx.fillStyle = PALETTE.sheenDeep;
  ctx.fill(path);
  ctx.clip(path);
  shade(ctx, path, m, PALETTE.sheenRim);
  underlight(ctx, path, m, 0.7);
  fold(ctx, m);
  const h = m.skin - m.top;
  // The answer lit on the inside of the wall: the top half on a standing
  // lobe, light from above; the whole of it on a tall one.
  const reach = tall ? h + m.tile : h * 0.55 + m.tile;
  innerWall(ctx, path, m, m.top - m.tile, reach, colour, tall ? 1 : 0.8);
  cap(ctx, m, colour, tall ? 0.75 : 0.5);
  ctx.restore();
  film(ctx, m, 0.3);
}

/** The answer's colour pooled in the crown, so a lobe a tile tall still says which. */
function cap(ctx: CanvasRenderingContext2D, m: Mass, colour: string, a: number): void {
  const r = Math.max(2, m.hw * 1.1);
  const g = ctx.createRadialGradient(m.x, m.top, 0, m.x, m.top, r);
  g.addColorStop(0, rgba(colour, a));
  g.addColorStop(1, rgba(colour, 0));
  ctx.fillStyle = g;
  ctx.fillRect(m.x - r, m.top - r, r * 2, r * 2);
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
