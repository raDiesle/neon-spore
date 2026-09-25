import type { Point } from "@neon-spore/content";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litColour } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splineSealed } from "./spline.js";
import { STEEL, steelRamp } from "./vane-bearing.js";

/**
 * THE VANE's arm: the spar, what it is braced with and the fork on the end.
 *
 * **Named for the spar and not the arm**, because `packages/sim/src/vane-arm.ts`
 * is already the arm — the column its tip stands in, the fold across it and the
 * split it loads. That file is the arithmetic every screen reads; this one is
 * the piece of metal.
 *
 * **It is a lever and not a line.** A stroke of even width is the one thing
 * this boss must not look like — the encounter is a mechanism being turned, and
 * a mechanism is read off its taper: thick where it is bolted to the bearing,
 * thin where it is thrown, which is also why it bends at the tip and not at the
 * root (`armPoints`). Closed and filled, yes, unlike `vane-draw.ts`'s note
 * about an enclosed area reading as a body: what that rule refuses is a
 * *creature* holding a weapon, and a spar with a lattice through it and a fork
 * on its end is not a thing that could be holding anything.
 *
 * **The counterweight is the other half of the lever**, and it is the part that
 * says the arm turns rather than sweeps: a short blunt stub on the far side of
 * the hub, going the other way by arithmetic rather than by a second reading of
 * the cycle. Nothing here is held between frames.
 */

/** How wide the spar is at the bearing and at the tip, in tiles. */
const ROOT = 0.2;
const TIP = 0.062;

/** Points along the arm, from the hub's rim out to the tip. */
export function armPoints(px: number, py: number, tx: number, ty: number, whip: number): Point[] {
  const pts: Point[] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    // The bow trails against the direction of travel, hardest about two thirds
    // out and nothing at all at either end: a lever bends where it is thin, and
    // the eye reads the direction of travel off the lag rather than off the
    // position. **It closes at `f = 1` on purpose.** Cubed in `f`, as this was
    // until 20 September 2026, the lag was largest exactly where the arm ends,
    // so a fast sweep drew the spar past its own tip — up to fifty pixels of
    // it — and the fold line the pair is naming sat in the middle of the arm
    // with a bare wire sticking out beyond it. The profile peaks at 1 and the
    // tip is where `vaneTipNow` says it is.
    const lag = whip * 6.75 * f * f * (1 - f);
    pts.push({ x: px + (tx - px) * f - lag, y: py + (ty - py) * f + Math.abs(lag) * 0.25 });
  }
  return pts;
}

/** The unit normal of the run at `i`, taken off its neighbours. */
function normalAt(pts: readonly Point[], i: number): Point {
  const a = pts[Math.max(0, i - 1)]!;
  const b = pts[Math.min(pts.length - 1, i + 1)]!;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
}

/** The spar's two banks: out along one side, back along the other. */
function spar(pts: readonly Point[], tile: number): Point[] {
  const top: Point[] = [];
  const under: Point[] = [];
  for (let i = 0; i < pts.length; i++) {
    const f = i / (pts.length - 1);
    const w = tile * (ROOT + (TIP - ROOT) * f);
    const n = normalAt(pts, i);
    const p = pts[i]!;
    top.push({ x: p.x + n.x * w, y: p.y + n.y * w });
    under.push({ x: p.x - n.x * w, y: p.y - n.y * w });
  }
  return [...top, ...under.reverse()];
}

/** The arm, from the bearing out: the counterweight, the spar, its bracing and
 * the fork the fold is thrown from. */
export function drawArm(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  px: number,
  py: number,
  hub: number,
  tx: number,
  ty: number,
  whip: number,
  /** How red the blow of a knocked-out pin still shows on the spar. */
  hurt = 0,
): void {
  // The lever's own angle, and the one number the two halves share: the spar
  // leaves the hub pointing at the tip and the weight leaves it pointing away,
  // so the whole thing turns on the bearing instead of sliding along the mount.
  // It was `Math.sign(tx - px)` until 20 September 2026, which put the root
  // beside the hub rather than on the side the arm was reaching, bent the spar
  // into a hook whenever the tip came near the pivot's own column, and flipped
  // the weight from one side to the other as the sweep crossed it.
  const a = Math.atan2(ty - py, tx - px);
  counterweight(ctx, l, px, py, hub, a);

  const rx = px + Math.cos(a) * hub * 0.6;
  const ry = py + Math.sin(a) * hub * 0.6;
  // A short arm bows less. The lag is a distance in pixels and the reach is
  // not: at the ends of a sweep the tip comes back over the bearing, and a
  // forty-pixel bow on a thirty-pixel lever is a hook rather than a whip.
  const reach = Math.hypot(tx - rx, ty - ry);
  const pts = armPoints(rx, ry, tx, ty, whip * Math.min(1, reach / (l.tile * 2.5)));
  const body = splineSealed(spar(pts, l.tile));
  const top = Math.min(py, ty) - l.tile * ROOT;
  ctx.fillStyle = steelRamp(ctx, top, Math.max(py, ty) + l.tile * ROOT);
  ctx.fill(body);
  ctx.strokeStyle = rgba(PALETTE.rock, 0.55);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(body);
  drawHurt(ctx, body, hurt);

  bracing(ctx, l, pts);
  fork(ctx, l, px, py, tx, ty);
}

/**
 * The lattice inside the spar: one zigzag from the root to the tip, drawn as a
 * single path because it is the cheapest way to say *built* rather than *cast*
 * at forty pixels long.
 */
function bracing(ctx: CanvasRenderingContext2D, l: Layout, pts: readonly Point[]): void {
  const web = new Path2D();
  for (let i = 1; i < pts.length - 1; i += 2) {
    const f = i / (pts.length - 1);
    const w = l.tile * (ROOT + (TIP - ROOT) * f) * 0.78;
    const n = normalAt(pts, i);
    const p = pts[i]!;
    const q = pts[i + 1]!;
    const m = normalAt(pts, i + 1);
    const wq = l.tile * (ROOT + (TIP - ROOT) * ((i + 1) / (pts.length - 1))) * 0.78;
    web.moveTo(p.x + n.x * w, p.y + n.y * w);
    web.lineTo(q.x - m.x * wq, q.y - m.y * wq);
  }
  ctx.strokeStyle = rgba(PALETTE.rockDark, 0.85);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(web);
}

/**
 * The stub on the far side of the bearing. Short, blunt and unlit at its end,
 * so nobody reads it as a second tip: the fold happens at one column and this
 * one is never it.
 */
function counterweight(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  px: number,
  py: number,
  hub: number,
  a: number,
): void {
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const near = hub * 0.25;
  const far = hub * 0.92 + l.tile * 0.16;
  const stub = new Path2D();
  stub.moveTo(px - cos * near, py - sin * near);
  stub.lineTo(px - cos * far, py - sin * far);
  ctx.strokeStyle = litColour(STEEL, 0.58);
  ctx.lineWidth = l.tile * 0.085;
  ctx.lineCap = "round";
  ctx.stroke(stub);

  // The weight itself, lit like everything else on the mechanism: drawn dark
  // it read as a hole in the mount rather than as the mass the arm is balanced
  // against, which is the one thing it is here to say.
  const weight = new Path2D();
  weight.moveTo(px - cos * far, py - sin * far);
  weight.lineTo(px - cos * (far + l.tile * 0.04), py - sin * (far + l.tile * 0.04));
  ctx.strokeStyle = litColour(STEEL, 0.3);
  ctx.lineWidth = l.tile * 0.15;
  ctx.stroke(weight);
  ctx.lineCap = "butt";
}

/**
 * The fork the fold is thrown from: an open claw round the tip, facing the way
 * the arm points. The bead inside it is `vane-draw.ts`'s, drawn after this so
 * the column the pair is watching is the brightest thing on the mechanism.
 */
function fork(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  px: number,
  py: number,
  tx: number,
  ty: number,
): void {
  const a = Math.atan2(ty - py, tx - px);
  const claw = new Path2D();
  claw.arc(tx, ty, l.tile * 0.19, a - 1.15, a + 1.15);
  strokeGlow(ctx, claw, PALETTE.rock, STROKE.inner, 0.7);
}
