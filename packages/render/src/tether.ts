import { circleSubpath, openSmoothPath, type Point } from "@neon-spore/content";
import {
  type SimConfig,
  type WardenState,
  type World,
  wardenColor,
  wardenCycle,
  wardenPullMilli,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import type { Circle, Layout, ViewRole } from "./layout.js";
import { tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { wardenRimY } from "./warden.js";

/**
 * THE WARDEN's rope, and the handle on it: the one thing on this field either
 * player can put a hand on.
 *
 * It is the game's first **open** contour — a line with two ends rather than a
 * closed loop with lobes — and it is drawn by `openSmoothPath` for that reason.
 *
 * **Four things have to be legible here, in order, with nobody told anything**
 * (the owner asked for them by name, which is what exempts this file from *a
 * look is offered, never replaced*):
 *
 * 1. the handle reads as something to take hold of — a ring, not a blob, with a
 *    word under it while nobody has it;
 * 2. the moment it is held is visible — the ring fills and the word goes;
 * 3. pulling builds tension and more pulling builds more, **continuously**: the
 *    rope goes taut, thin and bright, and a gauge closes around the handle;
 * 4. the hatch opens in proportion, which is `warden.ts` next door and is the
 *    same number this file draws.
 *
 * Everything here is derived from the world every frame. Only the snap-back
 * after a hit outlives one, and that lives in `Effects` (`warden-fx.ts`).
 */

/** The handle's radius, in tiles. Thumb-sized, and the same on both screens. */
const HANDLE_TILES = 0.3;

/**
 * Where the handle rests, with no hand on it.
 *
 * **The one place it is written down.** `touch.ts` answers a press exactly here
 * and this file draws exactly here — a button drawn in one place and answered in
 * another is a button that works until somebody moves one of them.
 *
 * It reads the layout, the config and the rope's own column, and nothing about
 * the pull: a press is tested against the resting circle whatever the rope is
 * doing. The handle swings while it is dragged and that costs nothing, because
 * by then the pointer is captured and nothing is hit-tested again.
 */
export function tetherHandleCircle(l: Layout, cfg: SimConfig, col: number): Circle {
  return {
    x: tileCX(l, col),
    y: tileCY(l, cfg.wardenRow + cfg.wardenHangRows),
    r: l.tile * HANDLE_TILES,
  };
}

export function drawTether(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  b: WardenState,
  col: number,
  time: number,
): void {
  const cfg: SimConfig = world.cfg;
  const hex = wardenColor(wardenCycle(cfg, world.waveBeat)) === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = hex === PALETTE.red ? PALETTE.redRim : PALETTE.cyanRim;

  const rest = tetherHandleCircle(l, cfg, col);
  const topY = wardenRimY(l, cfg.wardenRow);
  // One to one with the hand: the handle stands exactly where the finger
  // carried it, so the distance on the screen *is* the distance being asked for.
  const off = (b.pullMilli * l.tile) / 1000;
  const x = rest.x + off;
  const pull = wardenPullMilli(world, b) / 1000;
  const held = b.pulling;

  // Under tension the rope goes thin and bright from the rim down: the rope is
  // its own gauge, and there is no widget anywhere saying how far the pull has
  // got. Slack, it hangs with a slow wave travelling down it.
  const line = new Path2D(openSmoothPath(points(rest.x, x, topY, rest.y, held, pull, time)));
  strokeGlow(ctx, line, held ? rim : hex, STROKE.outline * (1 - pull * 0.35), 0.5 + pull * 1.5);

  drawAnchor(ctx, rest.x, topY, hex, rim, pull);
  // The column it hangs in, marked faintly, so the swing reads as a distance
  // from somewhere rather than as a handle that happens to be over there.
  if (held) drawRest(ctx, rest, hex);
  drawHandle(ctx, x, rest.y, rest.r, hex, rim, held, pull, time);
  if (!held) drawHint(ctx, l, l.role, x, rest.y + l.tile * 0.7);
}

/**
 * The rope's own shape. Slack it sags off the straight line between its two
 * ends and a slow wave travels down it; taut it straightens out, and the sag
 * goes to nothing exactly as the tension goes to one.
 */
function points(
  restX: number,
  headX: number,
  topY: number,
  headY: number,
  held: boolean,
  pull: number,
  time: number,
): Point[] {
  const pts: Point[] = [];
  const N = 14;
  const sag = (1 - pull) * (held ? 0.35 : 1);
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    // A half-sine across the length, so both ends stay where they are anchored.
    const belly = Math.sin(t * Math.PI);
    const wave = held
      ? Math.sin(time * 30 + t * 9) * 1.2 * (1 - pull)
      : Math.sin(t * Math.PI * 3 - time * 3) * 3.5 * t;
    // The rope bellies *behind* the hand, the way a rope pulled sideways does:
    // the straight line is what full tension looks like.
    const straight = restX + (headX - restX) * t;
    pts.push({
      x: straight - (headX - restX) * belly * sag * 0.45 + wave,
      y: topY + (headY - topY) * t,
    });
  }
  return pts;
}

/** Where it comes out of the rim, brightening as the tension takes. */
function drawAnchor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hex: string,
  rim: string,
  pull: number,
): void {
  const p = new Path2D(circleSubpath(x, y, 3 + pull * 4));
  ctx.save();
  ctx.fillStyle = pull > 0 ? rim : hex;
  ctx.globalAlpha = 0.5 + pull * 0.5;
  ctx.fill(p);
  ctx.restore();
}

/** The column the handle hangs in, while it is not hanging in it. */
function drawRest(ctx: CanvasRenderingContext2D, rest: Circle, hex: string): void {
  const p = new Path2D(circleSubpath(rest.x, rest.y, rest.r * 0.9));
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(p);
  ctx.restore();
}

/**
 * The handle, and the gauge closing around it.
 *
 * Empty and breathing it says *take hold of me*; filled it says *somebody has*;
 * and the arc sweeping round its edge is how much of the pull is in, drawn as a
 * continuous quantity rather than as a lamp that comes on at a threshold. The
 * player who is not holding it reads that arc, and it closes into a whole circle
 * at the instant the eye can be shot.
 */
function drawHandle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  hex: string,
  rim: string,
  held: boolean,
  pull: number,
  time: number,
): void {
  const breathe = held ? 1 : 1 + 0.08 * Math.sin(time * 4);
  const p = new Path2D(circleSubpath(x, y, r * breathe));
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(p);
  ctx.fillStyle = hex;
  ctx.globalAlpha = held ? 0.55 + pull * 0.45 : 0.18;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, held ? rim : hex, STROKE.inner, held ? 1.2 : 0.8);

  if (pull <= 0) return;
  ctx.save();
  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.lineCap = "butt";
  ctx.beginPath();
  // From the top, clockwise, so it fills the way a dial does.
  ctx.arc(x, y, r * 1.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pull);
  ctx.stroke();
  ctx.restore();
}

/**
 * Whose rope it is, in words, and only while nobody has hold of it.
 *
 * The pair cannot see each other's thumbs, so the one thing the picture cannot
 * say by itself is which of the two of them is supposed to reach for it — and
 * that is the whole coupling. It is always the pilot's now, the way THE MAZE's
 * string always is, so player 2 is told whose hand it is rather than waiting for
 * a turn that never comes. It goes as soon as a hand lands: from then on the
 * handle's own position says it.
 */
function drawHint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  role: ViewRole,
  x: number,
  y: number,
): void {
  const mine = role !== "p2";
  ctx.save();
  ctx.font = `600 ${Math.round(l.tile * 0.3)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = mine ? PALETTE.text : PALETTE.dim;
  ctx.globalAlpha = mine ? 0.9 : 0.45;
  ctx.fillText(mine ? "PULL" : "PILOT'S", x, y);
  ctx.restore();
}
