import { lanceReady, primeChargeMilli, priming, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE LANCE, drawn: the button filling under player 1's thumb, and the mark
 * that fill puts on a column of the field.
 *
 * Both are the same number twice — `primeChargeMilli` from the simulation,
 * never a second clock kept here. A charge counted in render/ would run on the
 * frame rate, so one device would think the lobe was full a frame before the
 * other, and the mark is the one row of the information split that both
 * players read (docs/spec/systems.md 5.2).
 *
 * Nothing in this file outlives a frame, so there is nothing for
 * `Effects.reset()` to clear.
 */

/** 0..1 of the way to a lance. */
function charge(world: World): number {
  return primeChargeMilli(world) / 1000;
}

/**
 * The button. It is the same disc as the trigger and the maw, with the fill
 * drawn as an arc closing round the rim — a hold has a length, and the two
 * beside it do not, so it must not read as a third thing that is simply lit.
 */
export function drawLanceButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  world: World,
): void {
  const full = lanceReady(world);
  const t = charge(world);

  ctx.fillStyle = full ? PALETTE.hull : "#2A1F4E";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  if (full) halo(ctx, x, y, r * 1.8, PALETTE.hullRim, 0.55);

  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (t > 0 && !full) {
    // From the top, clockwise, so it reads as something being wound up.
    ctx.strokeStyle = PALETTE.hullRim;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r - 1.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * t);
    ctx.stroke();
  }

  ctx.fillStyle = full ? "#1A0426" : PALETTE.hull;
  ctx.fillText("LANCE", x, y + 3);
}

/**
 * The mark on the field: two brackets that close on the cannon's column as the
 * lobe fills, and a thread up the whole column once it is full.
 *
 * It is drawn on the column rather than on a creature on purpose. The cannon
 * fires up a column and marking was re-grounded onto exactly that
 * (docs/spec/couplings.md 2) — a mark that sat on a body would promise the
 * lance follows it, and it does not; it goes straight up, through whatever is
 * standing there when it arrives.
 */
export function drawLanceMark(ctx: CanvasRenderingContext2D, l: Layout, world: World): void {
  if (!priming(world)) return;
  const full = lanceReady(world);
  const t = charge(world);
  const x = tileCX(l, world.cannonCol);
  const w = l.tile * 0.46;
  // The brackets start at the hull and climb the column as the lobe fills, so
  // the fill is legible as time rather than only as brightness — and they
  // arrive at the top of the field on the beat it comes full.
  const top = tileCY(l, (l.rows - 1) * (1 - t));

  ctx.save();
  ctx.strokeStyle = full ? PALETTE.hullRim : PALETTE.hull;
  ctx.globalAlpha = full ? 0.9 : 0.35 + t * 0.4;
  ctx.lineWidth = full ? 2.4 : 1.6;

  if (full) {
    halo(ctx, x, tileCY(l, l.rows - 2), l.tile * 0.8, PALETTE.hullRim, 0.4);
    ctx.beginPath();
    ctx.moveTo(x, l.gridTop);
    ctx.lineTo(x, l.hullY);
    ctx.stroke();
  }

  // Two corners either side of the column, pointing at each other.
  const arm = l.tile * 0.3;
  ctx.beginPath();
  for (const side of [-1, 1]) {
    ctx.moveTo(x + side * w, top - arm);
    ctx.lineTo(x + side * w, top);
    ctx.lineTo(x + side * (w - arm), top);
  }
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;
}
