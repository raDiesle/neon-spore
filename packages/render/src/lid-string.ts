import { circleSubpath, openSmoothPath, type Point } from "@neon-spore/content";
import {
  type Creature,
  lidIsHeld,
  lidOpenMilli,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { strokeGlow } from "./glow.js";
import type { Circle, Layout, ViewRole } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE LID's cord, and the handle on the end of it.
 *
 * It is THE WARDEN's rope one creature along, and it is drawn to say the same
 * four things in the same order, because they are the four things a handle on
 * this field has to say with nobody told anything (`tether.ts` names them):
 * the handle reads as something to take hold of, the moment it is held is
 * visible, pulling builds tension and more pulling builds more, and the plates
 * part in proportion — which is `render/lid.ts` next door and is the same
 * number this file draws.
 *
 * **Flat, outside the perspective transform, and that is the whole reason it
 * is its own pass.** A handle is hit-tested against the circle it is drawn at
 * (`lidCordCircle`, which `handles.ts` calls and this file draws), and a circle
 * scaled by the row it is on would be a control that changes size under the
 * thumb. The body it hangs off is drawn with depth; the thing a finger has to
 * find is not.
 *
 * **One difference from the rope, and it is the creature.** A warden's line is
 * lowered into a column and hangs there; a lid's cord comes down with the body,
 * so it is drawn from wherever the body has glided to this frame — `beatPhase`
 * rather than the row it left.
 */

/** The handle's radius, in tiles. Thumb-sized, and the tether's own figure:
 * the same gesture on the same thumb should not be two sizes to find. */
const HANDLE_TILES = 0.3;

/** How far below the body's centre the handle rests, in tiles. Clear of the
 * eye's own outline at every row, so a thumb reaching for the cord is never a
 * thumb landing on the body behind it. */
const HANG_TILES = 0.8;

/**
 * Where this lid's handle rests, with no hand on it.
 *
 * **The one place it is written down.** `handles.ts` answers a press exactly
 * here and this file draws exactly here — a button drawn in one place and
 * answered in another is a button that works until somebody moves one of them.
 *
 * It reads nothing about the pull: a press is tested against the resting circle
 * whatever the cord is doing. The handle swings while it is dragged and that
 * costs nothing, because by then the pointer is captured and nothing is
 * hit-tested again.
 */
export function lidCordCircle(l: Layout, c: Creature, beatPhase: number): Circle {
  const { x, y } = creatureCenter(l, c, beatPhase);
  return { x, y: y + l.tile * HANG_TILES, r: l.tile * HANDLE_TILES };
}

/**
 * Every cord on the field, drawn flat. Called from `drawCreatures` after the
 * bodies, so a cord is never behind the body it hangs off.
 */
export function drawLidCords(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  for (const c of world.creatures) {
    if (c.kind !== "lid") continue;
    drawOne(ctx, l, world.cfg, c, beatPhase, time);
  }
}

function drawOne(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  beatPhase: number,
  time: number,
): void {
  const hex = c.color === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = c.color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  const rest = lidCordCircle(l, c, beatPhase);
  const top = creatureCenter(l, c, beatPhase);
  // One to one with the hand: the handle stands exactly where the finger
  // carried it, so the distance on the screen *is* the distance being asked
  // for. `lidPullMilli` is thousandths of a tile, which is what `l.tile`
  // turns back into pixels.
  const off = ((c.lidPullMilli ?? 0) * l.tile) / 1000;
  const held = lidIsHeld(c);
  const pull = lidOpenMilli(cfg, c) / 1000;
  const x = rest.x + off;

  // Under tension the cord goes thin and bright: it is its own gauge, and
  // there is no widget anywhere saying how far the pull has got.
  const cord = new Path2D(openSmoothPath(points(rest.x, x, top.y, rest.y, held, pull, time)));
  strokeGlow(ctx, cord, held ? rim : hex, STROKE.outline * (1 - pull * 0.35), 0.4 + pull * 1.4);

  if (held) drawRest(ctx, rest, hex);
  drawHandle(ctx, x, rest.y, rest.r, hex, rim, held, pull, time);
  if (!held) drawHint(ctx, l, l.role, x, rest.y + l.tile * 0.62);
}

/**
 * The cord's own shape. Slack it sags off the straight line between its two
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
  const N = 10;
  const sag = (1 - pull) * (held ? 0.35 : 1);
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    // A half-sine across the length, so both ends stay where they are anchored.
    const belly = Math.sin(t * Math.PI);
    const wave = held
      ? Math.sin(time * 30 + t * 9) * 1.1 * (1 - pull)
      : Math.sin(t * Math.PI * 3 - time * 3) * 2.4 * t;
    // The cord bellies *behind* the hand, the way a line pulled sideways does:
    // the straight line is what full tension looks like.
    const straight = restX + (headX - restX) * t;
    pts.push({
      x: straight - (headX - restX) * belly * sag * 0.45 + wave,
      y: topY + (headY - topY) * t,
    });
  }
  return pts;
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
 * player who is not holding it reads that arc, and it closes into a whole
 * circle at the instant a shot will land.
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
 * Whose cord it is, in words, and only while nobody has hold of it.
 *
 * The pair cannot see each other's thumbs, so the one thing the picture cannot
 * say by itself is which of the two of them is supposed to reach for it — and
 * that is the whole coupling. It is always the pilot's, the way THE MAZE's
 * string and THE WARDEN's rope are, so player 2 is told whose hand it is rather
 * than waiting for a turn that never comes. It goes as soon as a hand lands:
 * from then on the handle's own position says it.
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
  ctx.font = `600 ${Math.round(l.tile * 0.26)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = mine ? PALETTE.text : PALETTE.dim;
  ctx.globalAlpha = mine ? 0.8 : 0.4;
  ctx.fillText(mine ? "PULL" : "PILOT'S", x, y);
  ctx.restore();
}
