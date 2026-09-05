import type { Chart } from "./fleet-chart.js";
import { chartX, chartY } from "./fleet-chart.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * A salvo in the air: the shell arcing out of the cannon, and its shadow
 * walking the water underneath it.
 *
 * **The shot is lobbed, not fired.** The owner asked for it in those words —
 * out of the cannon, catapulted in a curve, coming down from above, slowly, on
 * the square. That is not decoration on a hit-scan rule: the chart is a map of
 * water a long way off, and a shell that appeared in a square the instant a
 * thumb landed made the two things one press. Now the pilot presses, the pair
 * watch it climb, and the mark arrives when the shell does.
 *
 * **The shadow is what makes the curve read.** On a flat chart a rising object
 * and a shrinking object are the same picture; a dark ellipse crossing the
 * squares in a straight line, with the shell pulling away from it and falling
 * back onto it, is the only thing here that says *height*. It is drawn under
 * the shell and over the water, exactly where the shell will land, so the
 * navigator can read the square a moment before the mark says it.
 *
 * Nothing here is state. The flight is one number handed in by `fleet-fx.ts`,
 * which owns the shells; this file is the geometry and the paint.
 */

/** How far above its square the crest stands, in tiles. */
const CREST_TILES = 1.3;
/** How far over the chart's own top edge a crest may go, in tiles. */
const CEILING_TILES = 0.15;
/** The shallowest arc, in tiles, so a lob into the row below is not a skim. */
const LIFT_MIN_TILES = 0.8;
/**
 * Where along the flight the crest falls. Short of halfway, so the shell
 * spends longer coming down than going up — the owner asked for a ballista,
 * and what a ballista is, is a long fall.
 */
const PEAK = 0.45;

/** Where a shell is on its way to a square, in stage pixels. */
export interface ShellPose {
  /** The shell itself. */
  x: number;
  y: number;
  /** The point on the water under it — the shadow, and where it will land. */
  groundX: number;
  groundY: number;
  /** 0 at the muzzle and at the square, 1 at the top of the arc. */
  height: number;
  /** Which way it is travelling, in radians. */
  angle: number;
}

/**
 * Where the crest of the flight goes: above the square, and never above the
 * chart's own top edge by more than a whisker.
 *
 * **It is set from the square, not from the length of the flight.** A lift
 * that was a share of that length looked right for a square near the ship and
 * wrong for one at the top of the chart, where the arc crested *below* its own
 * target and the shell came at it from underneath. And the ceiling matters as
 * much: the strip above the chart is the HUD, and a shell sailing through the
 * wave number is a shell nobody reads as being over water.
 */
function crestY(l: Layout, c: Chart, toY: number): number {
  const over = Math.max(c.top - l.tile * CEILING_TILES, toY - l.tile * CREST_TILES);
  return Math.min(toY - l.tile * LIFT_MIN_TILES, over);
}

/**
 * Where the shell stands at `t`, 0 at the muzzle and 1 in the square.
 *
 * **Two parabolas meeting at the crest, not one over a straight line.** The
 * obvious arc — the line from muzzle to square, minus `4t(1-t)` of lift — puts
 * its *highest* point at the middle of the flight only when the two ends are
 * level. They never are here: the muzzle is at the hull and the square is up
 * the chart, so the real crest slides late and overshoots, and a clamp written
 * against the midpoint let the shell sail clean off the top of the stage. This
 * says where the crest is instead of solving for it: rise to `crestY` at
 * `PEAK`, fall from it to the square, both halves flat where they meet, so the
 * top of the arc is exactly where it is asked to be.
 *
 * The ground track is a straight line and the time along it is even, which is
 * what a thrown thing does. `angle` is taken from the two points either side
 * rather than differentiated, because the shell is drawn nose-first and a nose
 * that is one frame stale is a nose that is wrong at the moment it lands.
 */
export function shellPose(
  l: Layout,
  c: Chart,
  fromX: number,
  fromY: number,
  col: number,
  row: number,
  t: number,
): ShellPose {
  const toX = chartX(c, col);
  const toY = chartY(c, row);
  const crest = crestY(l, c, toY);
  const at = (u: number): { x: number; y: number; ground: number } => {
    const ground = fromY + (toY - fromY) * u;
    const end = u <= PEAK ? fromY : toY;
    const k = u <= PEAK ? (u - PEAK) / PEAK : (u - PEAK) / (1 - PEAK);
    return { x: fromX + (toX - fromX) * u, y: crest + (end - crest) * k * k, ground };
  };
  const here = at(t);
  const ahead = at(Math.min(1, t + 0.02));
  // How far off its own shadow it is, against the most it ever will be. The
  // shadow reads this and nothing else, so it does not need to know the shape
  // of the curve above it.
  const tall = Math.max(1, fromY + (toY - fromY) * PEAK - crest);
  return {
    x: here.x,
    y: here.y,
    groundX: here.x,
    groundY: here.ground,
    height: Math.max(0, Math.min(1, (here.ground - here.y) / tall)),
    angle: Math.atan2(ahead.y - here.y, ahead.x - here.x),
  };
}

/**
 * The shadow, on the water: an ellipse that widens and softens as the shell
 * climbs away from it and draws tight under the shell as it comes down.
 *
 * Flat rather than round on purpose — the chart is read as a surface seen at a
 * slant, so a circle would read as a hole in it.
 */
export function drawShellShadow(ctx: CanvasRenderingContext2D, c: Chart, p: ShellPose): void {
  const r = c.tile * (0.16 + 0.2 * p.height);
  ctx.save();
  ctx.globalAlpha = 0.6 - 0.3 * p.height;
  ctx.fillStyle = "#000208";
  ctx.beginPath();
  ctx.ellipse(p.groundX, p.groundY, r, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  // A thin lit edge round it. Water this dark takes a black ellipse and shows
  // nothing at all — the shadow was invisible without this, and a shadow
  // nobody can see is the one part of the arc that was doing the explaining.
  ctx.globalAlpha *= 0.4;
  ctx.strokeStyle = PALETTE.shield;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

/**
 * The shell: a stubby body nose-first along its own flight, with a fin at the
 * back and an exhaust behind that.
 *
 * It is drawn in the colour of the seat's own ammunition — amber, the salvo
 * button's colour — rather than in a hull colour or a damage red. What is
 * flying is *theirs*, and the one moment in this fight the pair have something
 * of their own on the chart should not be dressed as the thing it is about to
 * break (`fleet-impact.ts` is where the red goes).
 */
export function drawShell(ctx: CanvasRenderingContext2D, c: Chart, p: ShellPose): void {
  const long = c.tile * 0.3;
  const across = c.tile * 0.13;
  ctx.save();
  halo(ctx, p.x, p.y, c.tile * (0.5 + 0.3 * p.height), PALETTE.pod, 0.34);
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  // The exhaust, behind the fin and fading out along the path it came down.
  // It is longest at the muzzle and burns out by the top of the arc, which is
  // what a charge that is all spent in the first moment looks like.
  const trail = long * (1.4 + 3.4 * Math.max(0, 1 - p.height * 1.6));
  const g = ctx.createLinearGradient(-long, 0, -long - trail, 0);
  g.addColorStop(0, PALETTE.ember);
  g.addColorStop(1, "rgba(255,122,47,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-long, -across * 0.7);
  ctx.lineTo(-long - trail, 0);
  ctx.lineTo(-long, across * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(long, 0);
  ctx.lineTo(long * 0.2, -across);
  ctx.lineTo(-long, -across * 0.8);
  ctx.lineTo(-long * 0.7, 0);
  ctx.lineTo(-long, across * 0.8);
  ctx.lineTo(long * 0.2, across);
  ctx.closePath();
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill();
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();

  // The nose, lit: the one part of it the eye tracks across a whole arc.
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(long * 0.62, 0, Math.max(1, across * 0.42), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
