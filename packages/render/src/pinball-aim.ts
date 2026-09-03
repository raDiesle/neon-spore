import {
  type PinBall,
  type PinballState,
  pinLaunchVelocity,
  pinPhysics,
  pinRestingBall,
  stepBall,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
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
 * **During the sweep there are two arcs, not one.** No strength has been
 * picked yet, so a single line would be a lie about a number nobody has
 * chosen; the pair are shown the weakest and the strongest that angle can
 * throw, which is the fan it can reach. On the bar the fan collapses to the
 * one live arc, and the vertical bar beside the table says the same thing
 * again in the channel a thumb is watching.
 */

/** Ticks of flight a preview may show. Long enough to cross the table twice. */
const PREVIEW_TICKS = 260;

/** How far apart the dashes are, in tiles. */
const DASH_TILES = 0.26;

/** An empty board, for the fan: `stepBall` then answers about walls alone. */
const NO_PIECES: never[] = [];

/**
 * The real path, as stage points, from the bucket's mouth to the first thing
 * the ball would touch.
 */
function trace(view: ViewState, t: Table, boss: PinballState, powerMilli: number, board: boolean) {
  const cfg = view.world.cfg;
  const start = pinRestingBall(view.world, boss);
  const v = pinLaunchVelocity(cfg, boss.angleMilli, powerMilli);
  const ball: PinBall = { ...start, vxMilli: v.vxMilli, vyMilli: v.vyMilli };
  const phys = pinPhysics(cfg);
  const pieces = board ? boss.pieces : NO_PIECES;
  const alive = board ? boss.alive : NO_PIECES;
  const pts = [pinAt(t, ball.xMilli, ball.yMilli)];
  for (let i = 0; i < PREVIEW_TICKS; i++) {
    const struck = stepBall(ball, pieces, alive, phys);
    pts.push(pinAt(t, ball.xMilli, ball.yMilli));
    if (struck.length > 0) break;
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
 * The strength, as a bar up the right-hand gutter.
 *
 * It only exists while the bar is the thing being decided, which is what makes
 * it an answer to the latch rather than another dial to read: the needle stops,
 * this appears, and the next press is the shot.
 */
export function drawPowerBar(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  t: Table,
  boss: PinballState,
): void {
  if (boss.shot !== "power") return;
  const h = t.tile * t.rows;
  const top = t.y + h * 0.12;
  const bottom = t.y + h * 0.88;
  const right = t.x + t.tile * t.cols;
  const w = Math.max(6, Math.min(t.tile * 0.46, (l.width - right) * 0.5));
  const x = Math.min(l.width - w * 1.2, right + (l.width - right) / 2 - w / 2);
  const r = w / 2;

  ctx.save();
  ctx.fillStyle = PALETTE.redDark;
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(x, top, w, bottom - top, r);
  ctx.fill();
  ctx.stroke();

  const fill = ((bottom - top) * boss.powerMilli) / 1000;
  if (fill > 1) {
    const ramp = ctx.createLinearGradient(0, bottom, 0, top);
    ramp.addColorStop(0, PALETTE.shield);
    ramp.addColorStop(0.55, PALETTE.pod);
    ramp.addColorStop(1, PALETTE.red);
    ctx.fillStyle = ramp;
    ctx.beginPath();
    ctx.roundRect(x, bottom - fill, w, fill, Math.min(r, fill / 2));
    ctx.fill();
    halo(ctx, x + w / 2, bottom - fill, w * 1.6, PALETTE.podRim, 0.5);
  }
  ctx.restore();
}
