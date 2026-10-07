import { LIGHT_HALF } from "@neon-spore/content";
import {
  ballR,
  collarAt,
  type Dial,
  drumAt,
  flyweightAt,
  headAt,
  type Point,
  spindleAt,
} from "./governor-shape.js";
import { drawCasing, drawCrown, drawPodSeam } from "./governor-trim.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE GOVERNOR's works**: the Watt governor standing over the dial — the
 * spindle, the brake drum at its foot with the yoke's two jaws on it, the
 * collar the links pull up, and INTERFERENCE's two flyweights swung out
 * opposite one another. The weight behind the spindle is drawn before it
 * and dimmer, the one in front after it, so the pair are seen to turn round
 * it rather than slide past.
 *
 * It is not a Victorian engine's: the shaft is cased in collars, the head
 * wears a crown of three prongs lit at their tips, and each flyweight is a
 * polished pod split round its middle by a seam with the face's veins' light
 * inside, breathing with them (`governor-face-baked.ts`).
 *
 * The yoke hangs half open on the drum. It was the brake's chord, drawn,
 * until the owner's rework of 6 October 2026 took the brake away
 * (`sim/governor.ts`), and it is scenery now.
 */

/** How the works stand this frame. */
export interface GovernorWorks {
  /** The arms' swing off the spindle, in radians. */
  swing: number;
  /** The first flyweight's place round the spindle, in radians. */
  orbit: number;
  /** How bright the veins' light is this frame, 0..1 (`governorVeinPulse`). */
  pulse: number;
}

/** A jaw's gap off the drum, in tiles, hanging half open. */
const IDLE = 0.14;
/** A jaw shoe's width, in tiles, and its height against the drum's. */
const SHOE = 0.14;
const SHOE_TALL = 1.15;
/** How far a lever runs out and down from its shoe, in tiles. */
const LEVER = 0.5;
/** The spindle's and a link's width, in outline strokes. */
const SHAFT = 1.4;
/** The back flyweight's alpha, dimmed by the spindle's shadow. */
const BACK = 0.7;
/** Draws the works. */
export function drawGovernorWorks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  w: GovernorWorks,
): void {
  const head = headAt(l, d);
  const collar = collarAt(l, d, w.swing);
  const phis = [w.orbit, w.orbit + Math.PI];
  const back = phis.filter((phi) => Math.sin(phi) < 0);
  const front = phis.filter((phi) => Math.sin(phi) >= 0);
  for (const phi of back) drawFlyweight(ctx, l, d, w, phi, head, collar, BACK);

  const foot = spindleAt(l, d, 0);
  const shaft = new Path2D();
  shaft.moveTo(foot.x, foot.y);
  shaft.lineTo(head.x, head.y);
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.outline * SHAFT;
  ctx.strokeStyle = PALETTE.governorBrassDark;
  ctx.stroke(shaft);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = PALETTE.governorBrass;
  ctx.stroke(shaft);
  drawCasing(ctx, l, foot, head);
  drawCrown(ctx, l, head, w.pulse);

  drawDrumAndYoke(ctx, l, d);
  drawBoss(ctx, collar, 0.16 * l.tile, 0.08 * l.tile);
  drawBoss(ctx, head, 0.2 * l.tile, 0.12 * l.tile);
  for (const phi of front) drawFlyweight(ctx, l, d, w, phi, head, collar, 1);
}

/** One flyweight: its arm from the head, its link down to the collar, and the ball. */
function drawFlyweight(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  w: GovernorWorks,
  phi: number,
  head: Point,
  collar: Point,
  alpha: number,
): void {
  const ball = flyweightAt(l, d, w.swing, phi);
  const r = ballR(l, phi);
  ctx.save();
  ctx.globalAlpha *= alpha;
  const arm = new Path2D();
  arm.moveTo(head.x, head.y);
  arm.lineTo(ball.x, ball.y);
  arm.lineTo(collar.x, collar.y);
  ctx.lineJoin = "round";
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.governorBrassDark;
  ctx.stroke(arm);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = PALETTE.governorBrass;
  ctx.stroke(arm);
  const body = new Path2D();
  body.arc(ball.x, ball.y, r, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.governorBrass;
  ctx.fill(body);
  ctx.save();
  ctx.clip(body);
  litRound(ctx, ball.x, ball.y, r, LIGHT_HALF.rock, phi);
  drawPodSeam(ctx, ball, r, w.pulse);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.governorBrassDark;
  ctx.stroke(body);
  ctx.restore();
}

/** The brake drum, seen as a short cylinder, and the yoke's two shoes and levers on it. */
function drawDrumAndYoke(ctx: CanvasRenderingContext2D, l: Layout, d: Dial): void {
  const drum = drumAt(l, d);
  const { x, y } = drum.at;
  const squash = drum.r * d.tilt;
  const side = new Path2D();
  side.ellipse(x, y + drum.half, drum.r, squash, 0, 0, Math.PI);
  side.lineTo(x - drum.r, y - drum.half);
  side.ellipse(x, y - drum.half, drum.r, squash, 0, Math.PI, 0, true);
  side.closePath();
  ctx.fillStyle = PALETTE.governorBrassDark;
  ctx.fill(side);
  const top = new Path2D();
  top.ellipse(x, y - drum.half, drum.r, squash, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.governorHub;
  ctx.fill(top);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = PALETTE.governorBrass;
  ctx.stroke(side);

  const tall = drum.half * 2 * SHOE_TALL;
  const shoe = SHOE * l.tile;
  for (let bit = 0; bit < 2; bit++) {
    const out = bit === 0 ? -1 : 1;
    const gap = IDLE * l.tile;
    const inner = x + out * (drum.r + gap);
    const jaw = new Path2D();
    jaw.roundRect(Math.min(inner, inner + out * shoe), y - tall / 2, shoe, tall, shoe / 2);
    const lever = new Path2D();
    lever.moveTo(inner + out * shoe, y);
    lever.lineTo(inner + out * (shoe + LEVER * l.tile), y + LEVER * l.tile);
    ctx.lineCap = "round";
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = PALETTE.governorBrassDark;
    ctx.stroke(lever);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = PALETTE.governorBrass;
    ctx.stroke(lever);
    ctx.fillStyle = PALETTE.governorBrass;
    ctx.fill(jaw);
    ctx.strokeStyle = rgba(PALETTE.governorBrassDark, 0.95);
    ctx.stroke(jaw);
  }
}

/** A small brass boss on the spindle: the collar, or the head the arms hang from. */
function drawBoss(ctx: CanvasRenderingContext2D, at: Point, rx: number, ry: number): void {
  const p = new Path2D();
  p.ellipse(at.x, at.y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.governorBrass;
  ctx.fill(p);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = PALETTE.governorBrassDark;
  ctx.stroke(p);
}
