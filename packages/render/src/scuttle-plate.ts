import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { faded, glint } from "./scuttle-metal.js";

/**
 * **THE SCUTTLE's parts** (`scuttle-metal.ts` has the slab they are seated
 * in): a plate of rock, shaded with a lip of light along its top and a glint;
 * where one has gone, a socket — a recess under an overhanging lip with the
 * wet violet of the inside at the bottom of it; and the cord a loose part
 * hangs on. The live part is a plate like the rest, in the colour a shot has
 * to be. **Every width is off the tile.**
 */

/**
 * A plate of `hex`, seated or hanging: shaded top to foot, a lip of light
 * along its top, a glint. `a` how solid it is.
 */
export function paintPlate(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  y: number,
  tile: number,
  hex: string,
  a: number,
  fade: number,
): void {
  const hh = tile * 0.16;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = faded(hex, fade);
  ctx.fill(body);
  ctx.globalAlpha = 1;
  ctx.clip(body);
  const shade = ctx.createLinearGradient(x, y - hh, x, y + hh);
  shade.addColorStop(0, rgba(PALETTE.sheenRim, 0.3 * fade));
  shade.addColorStop(0.35, rgba(PALETTE.sheenRim, 0));
  shade.addColorStop(0.55, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, 0.55 * fade));
  ctx.fillStyle = shade;
  ctx.fill(body);
  ctx.restore();
  glint(ctx, x - tile * 0.18, y - hh * 0.45, tile * 0.08, tile * 0.03, fade);
}

/**
 * A socket a plate has left: a recess under its lip, the shadow the lip casts
 * across its top, and the violet of the inside wet at the bottom of it.
 */
export function paintSocket(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  y: number,
  tile: number,
  fade: number,
): void {
  const hh = tile * 0.16;
  ctx.save();
  ctx.fillStyle = faded(PALETTE.sheenDeep, fade, 0.6);
  ctx.fill(body);
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = faded(PALETTE.hull, fade);
  ctx.fill(body);
  ctx.clip(body);
  ctx.lineJoin = "round";
  band(ctx, body, x, y + hh * 0.2, y + hh * 2, tile * 0.1, faded(PALETTE.hullRim, fade), 0.55);
  band(ctx, body, x, y - hh * 2, y - hh * 0.3, tile * 0.14, faded(PALETTE.sheenDeep, fade), 0.6);
  ctx.restore();
  glint(ctx, x + tile * 0.1, y + hh * 0.35, tile * 0.06, tile * 0.025, fade);
}

/** The thread a loose part hangs on: a cord with a wet line down its lit side. */
export function paintThread(
  ctx: CanvasRenderingContext2D,
  thread: Path2D,
  tile: number,
  fade: number,
): void {
  const w = Math.max(1, tile * 0.04);
  ctx.save();
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = faded(PALETTE.dim, fade);
  ctx.lineWidth = w;
  ctx.stroke(thread);
  ctx.translate(-w * 0.3, 0);
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = faded(PALETTE.sheenRim, fade);
  ctx.lineWidth = Math.max(0.6, tile * 0.012);
  ctx.stroke(thread);
  ctx.restore();
}

/** A socket's or a plate's path stroked inside it over one band. */
function band(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  from: number,
  to: number,
  width: number,
  colour: string,
  a: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - width * 20, from, width * 40, to - from);
  ctx.clip();
  ctx.lineWidth = width;
  ctx.strokeStyle = colour;
  ctx.globalAlpha = a;
  ctx.stroke(body);
  ctx.restore();
}

/**
 * The live part's rim: its colour's light along the plate's lower edge, from
 * inside — the colour a shot has to be, and never a line all round.
 */
export function paintLiveRim(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  y: number,
  tile: number,
  rim: string,
  a: number,
): void {
  ctx.save();
  ctx.clip(body);
  band(ctx, body, x, y, y + tile, tile * 0.12, rim, a);
  ctx.restore();
}
