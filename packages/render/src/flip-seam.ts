import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE FLIP's fold, drawn: a pane of glass standing down the middle of the
 * field, and the two halves swapping across it.**
 *
 * Until 25 September 2026 the turned screen said so with the fault's beam on
 * both walls and nothing else, and the owner asked for the picture to say
 * *where* it is mirrored — about the vertical middle of the screen. So the
 * axis the fold turns about (`fieldCol`: column `c` is drawn at `cols − 1 − c`)
 * is drawn as what it is: a line of glass down the centre of the grid, a glint
 * running down it so it reads as a surface rather than a wire, a sheen on
 * either face, and a pair of arrows crossing it at three heights — the ⇄ every
 * phone already uses for *swap*.
 *
 * **Only where `l.flip` is set**, which is the turned screen while the fault
 * is in force (`flippedLayout`): the seat with the true picture is shown no
 * seam, for the reason `fault-beam-ends.ts` gives the walls — a tell about a
 * picture it is not being shown.
 *
 * Over the field's own light and under every body, for THE CODEX's reason:
 * whatever is wrong is in the air between the seat and the field, and a body
 * falling down the middle column crosses in front of it. `time` and not the
 * beat, for the same file's reason — a glint on the metronome would be one
 * more thing to count.
 */

/** Seconds for the glint to run from the top of the seam to the hull. */
const GLINT_PERIOD = 2.6;
/** How far the sheen reaches from the seam on each side, in tiles. */
const SHEEN_TILES = 0.9;
/** The heights the swap arrows cross at, as shares of the field. */
const ARROW_AT = [0.22, 0.5, 0.78] as const;

export function drawFlipSeam(ctx: CanvasRenderingContext2D, l: Layout, time: number): void {
  if (!l.flip) return;
  // Below the lantern that hangs at the top of the middle column, so the seam
  // reads as the plane its light falls down rather than a line through it.
  const top = l.gridTop + l.tile * 1.3;
  const bottom = l.hullY - l.tile * 0.4;
  if (bottom <= top) return;
  const x = l.gridLeft + l.gridWidth / 2;
  const reach = l.tile * SHEEN_TILES;
  ctx.save();

  // The two faces of the glass: brightest at the seam, gone a tile out.
  for (const side of [-1, 1]) {
    const sheen = ctx.createLinearGradient(x, 0, x + side * reach, 0);
    sheen.addColorStop(0, rgba(PALETTE.arc, 0.24));
    sheen.addColorStop(1, rgba(PALETTE.arc, 0));
    ctx.fillStyle = sheen;
    ctx.fillRect(side < 0 ? x - reach : x, top, reach, bottom - top);
  }

  // The two edges of the pane, a hair apart — one line is a wire, two are a
  // thickness of glass — faded in at both ends so it stands in the field
  // rather than being cut off by it.
  const edge = ctx.createLinearGradient(0, top, 0, bottom);
  edge.addColorStop(0, rgba(PALETTE.arcRim, 0));
  edge.addColorStop(0.1, rgba(PALETTE.arcRim, 0.7));
  edge.addColorStop(0.9, rgba(PALETTE.arcRim, 0.7));
  edge.addColorStop(1, rgba(PALETTE.arcRim, 0));
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(1.5, l.tile * 0.03);
  const apart = l.tile * 0.06;
  ctx.beginPath();
  ctx.moveTo(x - apart, top);
  ctx.lineTo(x - apart, bottom);
  ctx.moveTo(x + apart, top);
  ctx.lineTo(x + apart, bottom);
  ctx.stroke();

  // The glint: a short bright run travelling down the pane.
  const span = bottom - top;
  const run = l.tile * 1.4;
  const head = top + ((time / GLINT_PERIOD) % 1) * (span + run) - run;
  const glint = ctx.createLinearGradient(0, head, 0, head + run);
  glint.addColorStop(0, rgba(PALETTE.arcRim, 0));
  glint.addColorStop(0.7, rgba(PALETTE.arcRim, 0.95));
  glint.addColorStop(1, rgba(PALETTE.arcRim, 0));
  ctx.strokeStyle = glint;
  ctx.lineWidth = Math.max(2.5, l.tile * 0.07);
  ctx.beginPath();
  ctx.moveTo(x, Math.max(top, head));
  ctx.lineTo(x, Math.min(bottom, head + run));
  ctx.stroke();

  // ⇄ across the seam at three heights: the left half going right above, the
  // right half going left below. Breathing slowly, out of step with each
  // other, so the pair reads as an exchange rather than two stamps.
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(2, l.tile * 0.06);
  for (let i = 0; i < ARROW_AT.length; i++) {
    const y = top + span * (ARROW_AT[i] ?? 0);
    const breathe = 0.5 + 0.5 * Math.sin(time * 1.7 + i * 2.1);
    swapArrow(ctx, x, y - l.tile * 0.2, l.tile, 1, 0.45 + 0.35 * breathe);
    swapArrow(ctx, x, y + l.tile * 0.2, l.tile, -1, 0.45 + 0.35 * (1 - breathe));
  }
  ctx.restore();
}

/** One arrow across the seam, pointing `dir` (1 right, −1 left). */
function swapArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  dir: 1 | -1,
  alpha: number,
): void {
  const half = tile * 0.7;
  const barb = tile * 0.2;
  const tip = x + dir * half;
  ctx.strokeStyle = rgba(PALETTE.arcRim, alpha);
  ctx.beginPath();
  ctx.moveTo(x - dir * half, y);
  ctx.lineTo(tip, y);
  ctx.moveTo(tip - dir * barb, y - barb);
  ctx.lineTo(tip, y);
  ctx.lineTo(tip - dir * barb, y + barb);
  ctx.stroke();
}
