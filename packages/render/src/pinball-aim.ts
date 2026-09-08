import {
  type PinBall,
  type PinballState,
  pinLaunchVelocity,
  pinPhysics,
  pinRestingBall,
  stepBall,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";
import { pinAt, type Table } from "./pinball-table.js";
import type { ViewState } from "./renderer.js";

/**
 * Where the ball is actually going, and how hard it is about to go there.
 *
 * **The path is the simulation's own, not a drawing of one.** It is the launch
 * velocity `pinLaunchVelocity` would give this angle and this power, stepped
 * by `stepBall` against the pieces that are really standing — the same three
 * calls the round makes on the tick — and cut at the first thing it touches.
 * So it cannot drift from what the ball does: there is no second copy of the
 * gravity, the cap or the wall bounce anywhere in this file.
 *
 * **It stops at first contact on purpose.** The owner asked to see the real
 * flight, and this shows it: the arc, the wall it banks off, and which piece
 * it arrives at. What it never shows is the cascade after that — where a ball
 * goes once it is in a cluster is the thing the pair are supposed to be
 * arguing about, and it is also the one part of this no line could promise.
 *
 * **It is also cut at a length, and the owner set that length.** *The dotted
 * predicted flying direction: maximum distance shown is the size of vertical
 * range from cannon to the top of game screen.* A preview that ran until it
 * hit something drew most of a whole shot on an open board — two hundred and
 * sixty ticks of arc, past the ceiling and back down — which is not a hint, it
 * is the answer. One table-height of travel is a hint: it says which way and
 * how far up, and leaves where it lands to the two people talking.
 *
 * **During the sweep there are two arcs, not one.** No strength has been
 * picked yet, so a single line would be a lie about a number nobody has
 * chosen; the pair are shown the weakest and the strongest that angle can
 * throw, which is the fan it can reach. On the bar the fan collapses to the
 * one live arc, and the bar above the cannon says the same thing again in the
 * channel a thumb is watching.
 */

/** Ticks of flight a preview may step. A ceiling on the work, not on the
 * picture: the length below is what actually ends most traces. */
const PREVIEW_TICKS = 260;

/** How far apart the dashes are, in tiles. */
const DASH_TILES = 0.26;

/** An empty board, for the fan: `stepBall` then answers about walls alone. */
const NO_PIECES: never[] = [];

/**
 * The real path, as stage points, from the muzzle to the first thing the ball
 * would touch — or to the owner's length, whichever comes first.
 *
 * The length is measured **along the path** rather than as a height reached,
 * because a shot thrown almost sideways would otherwise be drawn across the
 * whole table for nothing: what is being promised is *how much flight* the pair
 * are being shown, and that is a distance travelled.
 */
function trace(view: ViewState, t: Table, boss: PinballState, powerMilli: number, board: boolean) {
  const cfg = view.world.cfg;
  const start = pinRestingBall(view.world, boss);
  const v = pinLaunchVelocity(cfg, boss.angleMilli, powerMilli);
  const ball: PinBall = { ...start, vxMilli: v.vxMilli, vyMilli: v.vyMilli };
  const phys = pinPhysics(cfg);
  const pieces = board ? boss.pieces : NO_PIECES;
  const alive = board ? boss.alive : NO_PIECES;
  // The cannon to the ceiling, in the ball's own units. `start.yMilli` *is*
  // that distance: the table's own top is y zero.
  const budget = start.yMilli;
  let run = 0;
  const pts = [pinAt(t, ball.xMilli, ball.yMilli)];
  for (let i = 0; i < PREVIEW_TICKS; i++) {
    const wasX = ball.xMilli;
    const wasY = ball.yMilli;
    const struck = stepBall(ball, pieces, alive, phys);
    run += Math.hypot(ball.xMilli - wasX, ball.yMilli - wasY);
    pts.push(pinAt(t, ball.xMilli, ball.yMilli));
    if (struck.length > 0) break;
    if (run >= budget) break;
    if (ball.yMilli >= t.rows * 1000) break;
  }
  return pts;
}

function strokeTrace(
  ctx: CanvasRenderingContext2D,
  t: Table,
  pts: readonly { x: number; y: number }[],
  color: string,
  width: number,
  alpha: number,
): void {
  const first = pts[0];
  if (first === undefined) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash([t.tile * DASH_TILES, t.tile * DASH_TILES]);
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    if (p !== undefined) ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

export function drawAim(
  ctx: CanvasRenderingContext2D,
  t: Table,
  view: ViewState,
  boss: PinballState,
): void {
  if (boss.shot === "flight") return;
  const width = Math.max(1.5, t.tile * 0.07);
  if (boss.shot === "aim") {
    strokeTrace(ctx, t, trace(view, t, boss, 0, false), PALETTE.sparkDim, width * 0.7, 0.4);
    strokeTrace(ctx, t, trace(view, t, boss, 1000, false), PALETTE.shieldRim, width * 0.8, 0.6);
    return;
  }
  const pts = trace(view, t, boss, boss.powerMilli, true);
  strokeTrace(ctx, t, pts, PALETTE.podRim, width, 0.95);
  const end = pts[pts.length - 1];
  if (end === undefined) return;
  halo(ctx, end.x, end.y, t.tile * 0.5, PALETTE.pod, 0.7);
  ctx.save();
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(end.x, end.y, t.tile * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * How high above the floor the strength bar hangs, in tiles.
 *
 * Above the cannon's own swelling — half a tile at full lift
 * (`ship-silhouettes.ts`) — and inside the lane `pinballFault` keeps clear of
 * pieces, which is what makes a bar across the table safe to draw at all. It
 * used to stand up the right-hand gutter, and there is no gutter any more: the
 * table is the whole field now, on the owner's call.
 */
const BAR_TILES = 1.0;

/**
 * The strength, as a bar across the table just above the cannon.
 *
 * It only exists while the bar is the thing being decided, which is what makes
 * it an answer to the latch rather than another dial to read: the needle stops,
 * this appears, and the next press is the shot.
 */
export function drawPowerBar(ctx: CanvasRenderingContext2D, t: Table, boss: PinballState): void {
  if (boss.shot !== "power") return;
  const w = t.tile * t.cols;
  const h = Math.max(4, t.tile * 0.13);
  const x = t.x + t.tile * 0.35;
  const span = w - t.tile * 0.7;
  const y = t.y + t.tile * (t.rows - BAR_TILES) - h / 2;
  const r = h / 2;

  ctx.save();
  ctx.fillStyle = PALETTE.redDark;
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x, y, span, h, r);
  ctx.fill();
  ctx.stroke();

  const fill = (span * boss.powerMilli) / 1000;
  if (fill > 1) {
    const ramp = ctx.createLinearGradient(x, 0, x + span, 0);
    ramp.addColorStop(0, PALETTE.shield);
    ramp.addColorStop(0.55, PALETTE.pod);
    ramp.addColorStop(1, PALETTE.red);
    ctx.fillStyle = ramp;
    ctx.beginPath();
    ctx.roundRect(x, y, fill, h, Math.min(r, fill / 2));
    ctx.fill();
    halo(ctx, x + fill, y + h / 2, h * 2.2, PALETTE.podRim, 0.55);
  }
  ctx.restore();
}
