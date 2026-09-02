import { type FleetState, fleetShipAt, type World } from "@neon-spore/sim";
import { type Chart, chartOf, chartSquareName, chartX, chartY } from "./fleet-chart.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * What has been fired at, and where the sights are standing.
 *
 * **Everything in this file is on both screens**, and that is the half of THE
 * FLEET that makes the other half playable. The hulls are the pilot's alone
 * (`fleet-hulls.ts`); the record of what the two of them have already spent is
 * shared, or the navigator would be firing into a fog with no way of knowing
 * which squares they had covered — a fight neither of them could hold in their
 * head is not a harder fight, it is a longer one.
 *
 * A hit is a struck cross in the colour of damage; a splash is a ripple in the
 * chart's own cyan. The reference sheet's two markers, and they are opposite
 * enough that a glance across a phone tells them apart without counting.
 */

/** Every square already spent, hit or splash. */
export function drawFleetMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  boss: FleetState,
): void {
  const c = chartOf(l, world);
  if (c.tile <= 0) return;
  ctx.save();
  for (const at of boss.struck) {
    const col = at % c.cols;
    const row = Math.floor(at / c.cols);
    if (fleetShipAt(boss.ships, col, row) === -1) splash(ctx, c, col, row);
    else hit(ctx, c, col, row);
  }
  ctx.restore();
}

/** Open water, spent. A dashed ripple with a bead in the middle of it. */
function splash(ctx: CanvasRenderingContext2D, c: Chart, col: number, row: number): void {
  const x = chartX(c, col);
  const y = chartY(c, row);
  ctx.strokeStyle = PALETTE.shield;
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = STROKE.inner;
  ctx.setLineDash([c.tile * 0.13, c.tile * 0.09]);
  ctx.beginPath();
  ctx.arc(x, y, c.tile * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE.shield;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, c.tile * 0.06), 0, Math.PI * 2);
  ctx.fill();
}

/** A hull, holed. A cross struck through a wash of the damage colour. */
function hit(ctx: CanvasRenderingContext2D, c: Chart, col: number, row: number): void {
  const x = chartX(c, col);
  const y = chartY(c, row);
  const r = c.tile * 0.34;
  halo(ctx, x, y, r * 1.7, PALETTE.red, 0.45);
  ctx.fillStyle = "rgba(255,59,107,.16)";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.red;
  ctx.lineWidth = STROKE.outline * 1.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - r * 0.6, y - r * 0.6);
  ctx.lineTo(x + r * 0.6, y + r * 0.6);
  ctx.moveTo(x + r * 0.6, y - r * 0.6);
  ctx.lineTo(x - r * 0.6, y + r * 0.6);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = STROKE.inner * 0.8;
  ctx.stroke();
  ctx.lineCap = "butt";
}

/**
 * The sights, and the name of the square they are in.
 *
 * **Four corner brackets and never a filled box**, because whatever is under
 * the sights has to stay readable through them — on the pilot's screen that is
 * a hull he is about to talk about, and a cursor that covered it would make
 * the fight harder for exactly the wrong reason.
 *
 * The name is drawn beside the chart, on both screens, and it is the single
 * most important thing in this picture: it is the sentence. The navigator
 * reads their own position off it, the pilot reads the square he is asking for
 * against it, and neither of them has to count letters under a clock. It sits
 * where the sights are not — over the chart when the sights are low, under it
 * when they are high — so it never covers the square being argued about.
 */
export function drawFleetSights(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  boss: FleetState,
  beatPhase: number,
): void {
  const c = chartOf(l, world);
  if (c.tile <= 0) return;
  const x = chartX(c, boss.aimCol);
  const y = chartY(c, boss.aimRow);
  // Widest on the beat and tightest before the next one, so the sights breathe
  // in the same time the pair is counting in.
  const grow = c.tile * 0.06 * (1 - beatPhase);
  const half = c.tile * 0.46 + grow;
  const arm = c.tile * 0.26;

  ctx.save();
  halo(ctx, x, y, c.tile * 0.8, PALETTE.pod, 0.4);
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = STROKE.outline;
  ctx.beginPath();
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      ctx.moveTo(x + sx * half, y + sy * (half - arm));
      ctx.lineTo(x + sx * half, y + sy * half);
      ctx.lineTo(x + sx * (half - arm), y + sy * half);
    }
  }
  ctx.stroke();
  // A bead in the middle: the four brackets say which square, and this says
  // which point of it a salvo lands on.
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, c.tile * 0.05), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawSquareName(ctx, c, boss);
}

/** The square, spelled. `D7`, in a chip on the seam the sights are furthest from. */
function drawSquareName(ctx: CanvasRenderingContext2D, c: Chart, boss: FleetState): void {
  const text = chartSquareName(boss.aimCol, boss.aimRow);
  const high = boss.aimRow * 2 < c.rows;
  const y = high ? c.top + c.rows * c.tile - c.tile * 0.55 : c.top + c.tile * 0.55;
  const x = c.left + c.cols * c.tile - c.tile * 0.9;

  ctx.save();
  ctx.font = `700 ${Math.max(11, Math.round(c.tile * 0.5))}px "Courier New",monospace`;
  ctx.textAlign = "center";
  const w = ctx.measureText(text).width + 12;
  const h = Math.max(14, c.tile * 0.62);
  ctx.fillStyle = "rgba(6,4,16,.85)";
  ctx.fillRect(x - w / 2, y - h / 2, w, h);
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - w / 2 + 0.5, y - h / 2 + 0.5, w - 1, h - 1);
  ctx.fillStyle = PALETTE.podRim;
  ctx.fillText(text, x, y + h * 0.18);
  ctx.restore();
}
