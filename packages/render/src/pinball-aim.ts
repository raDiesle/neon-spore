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
 * **It shows the first bounce and no more.** It used to stop at first contact,
 * and on 30 September 2026 the owner asked for the sweep's own arcs to show
 * *if it hits obstacles and bounces*. So every arc now runs against the real
 * board, marks where it first touches something, and carries on for one short
 * leg afterwards, dimmer, to say which way it comes off. What it still never
 * shows is the cascade after that — where a ball goes once it is in a cluster
 * is the thing the pair are supposed to be arguing about, and it is also the
 * one part of this no line could promise.
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
 * picture: the length below is what actually ends most traces. Doubled when
 * the ball was slowed to half speed, so it still reaches the same length. */
const PREVIEW_TICKS = 520;

/** How far the leg after the first bounce runs, in tiles of path. */
const BOUNCE_TILES = 1.6;

/** How far apart the dashes are, in tiles. */
const DASH_TILES = 0.26;

type Pt = { x: number; y: number };

/** A traced arc: the flight up to the first contact, and the leg after it. */
interface Trace {
  pts: Pt[];
  /** Where the leg after the first bounce begins in `pts`, or -1 for none. */
  bounce: number;
}

/**
 * The real path, as stage points, from the muzzle through the first thing the
 * ball would touch and a short leg beyond it — or to the owner's length,
 * whichever comes first.
 *
 * The length is measured **along the path** rather than as a height reached,
 * because a shot thrown almost sideways would otherwise be drawn across the
 * whole table for nothing: what is being promised is *how much flight* the pair
 * are being shown, and that is a distance travelled.
 */
function trace(view: ViewState, t: Table, boss: PinballState, powerMilli: number): Trace {
  const cfg = view.world.cfg;
  const start = pinRestingBall(view.world, boss);
  const v = pinLaunchVelocity(cfg, boss.angleMilli, powerMilli);
  const ball: PinBall = { ...start, vxMilli: v.vxMilli, vyMilli: v.vyMilli };
  const phys = pinPhysics(cfg);
  // The cannon to the ceiling, in the ball's own units. `start.yMilli` *is*
  // that distance: the table's own top is y zero.
  let budget = start.yMilli;
  let run = 0;
  let bounce = -1;
  const pts = [pinAt(t, ball.xMilli, ball.yMilli)];
  for (let i = 0; i < PREVIEW_TICKS; i++) {
    const wasX = ball.xMilli;
    const wasY = ball.yMilli;
    const struck = stepBall(ball, boss.pieces, boss.alive, phys);
    run += Math.hypot(ball.xMilli - wasX, ball.yMilli - wasY);
    pts.push(pinAt(t, ball.xMilli, ball.yMilli));
    if (struck.length > 0) {
      // The second contact ends the leg: past it is the cascade.
      if (bounce >= 0) break;
      bounce = pts.length - 1;
      budget = run + BOUNCE_TILES * 1000;
    }
    if (run >= budget) break;
    if (ball.yMilli >= t.rows * 1000) break;
  }
  return { pts, bounce };
}

function strokeTrace(
  ctx: CanvasRenderingContext2D,
  t: Table,
  pts: readonly Pt[],
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

/** One arc: the flight, its first contact ringed, and the leg off it dimmer. */
function drawTrace(
  ctx: CanvasRenderingContext2D,
  t: Table,
  arc: Trace,
  color: string,
  width: number,
  alpha: number,
): void {
  if (arc.bounce < 0) {
    strokeTrace(ctx, t, arc.pts, color, width, alpha);
    return;
  }
  strokeTrace(ctx, t, arc.pts.slice(0, arc.bounce + 1), color, width, alpha);
  strokeTrace(ctx, t, arc.pts.slice(arc.bounce), color, width * 0.8, alpha * 0.55);
  const at = arc.pts[arc.bounce];
  if (at === undefined) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(at.x, at.y, t.tile * 0.16, 0, Math.PI * 2);
  ctx.stroke();
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
    drawTrace(ctx, t, trace(view, t, boss, 0), PALETTE.sparkDim, width * 0.7, 0.45);
    drawTrace(ctx, t, trace(view, t, boss, 1000), PALETTE.shieldRim, width * 0.8, 0.65);
    return;
  }
  const arc = trace(view, t, boss, boss.powerMilli);
  drawTrace(ctx, t, arc, PALETTE.podRim, width, 0.95);
  // The mark sits where the ball first arrives, which is what the bar decides.
  const end = arc.pts[arc.bounce >= 0 ? arc.bounce : arc.pts.length - 1];
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
