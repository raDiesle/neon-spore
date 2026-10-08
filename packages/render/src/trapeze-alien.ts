import { LIGHT_HALF } from "@neon-spore/content";
import { drawHurt } from "./boss-hurt.js";
import { mixHex, rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import { PALETTE } from "./palette.js";
import { drawArm, drawLeg, drawSeat } from "./trapeze-limbs.js";
import {
  type Point,
  TRAPEZE_HEAD,
  TRAPEZE_HEAD_UP,
  TRAPEZE_SIZE,
  TRAPEZE_TORSO,
  TRAPEZE_TORSO_UP,
  trapezeBodyPath,
} from "./trapeze-shape.js";

/**
 * **The alien on the swing, seen from the side** (the owner, 7 October 2026:
 * *an alien could sit on the swing*; *looks must be big enough to see* — a
 * whole-body pose, not a twitch).
 *
 * Drawn in the seat's own frame: the origin the seat, up the ropes, and
 * forward the way the alien faces, which is **toward the gong** — so between
 * levels, when the gong changes sides, it turns round on the seat, the body
 * narrowing to edge-on and widening again the other way (`TrapezeFx.facing`).
 *
 * **It pumps the way a child on a swing does.** Going forward it leans back
 * and throws its legs out; coming back it sits up and tucks them under. At
 * the gong's end, with the swing high enough, the legs shoot straight out —
 * the kick (`TrapezeFx.kick`). Everything with a far side — the seat, an arm,
 * a leg, an eye — has it drawn first and darker, behind the body, so the
 * alien sits *in* the swing rather than on top of a picture of it.
 *
 * HERALD's two bodies are the torso and the head (`trapeze-shape.ts`), drawn
 * `TRAPEZE_SIZE` the size of a creature's; the head's lag is the frame's
 * own, as the swing's speed.
 */

/** How far back the alien leans at full speed forward, in radians. */
const LEAN = 0.32;
/** The shin's angle off forward, tucked under and thrown out, radians, down positive. */
const TUCKED = 1.75;
const THROWN = 0.12;

export interface TrapezePose {
  /** The seat's place, and the swing's angle there in degrees. */
  at: Point;
  deg: number;
  /** -1..1: which way the alien faces, eased through edge-on as it turns. */
  facing: number;
  /** -1..1: how fast it goes the way it faces; below nought, coming back. */
  forward: number;
  /** 0..1: the legs thrown straight out at the gong. */
  kick: number;
  /** How far the head lags the swing, radians. */
  lag: number;
}

/** The seat, the alien on it, and its limbs, posed by `p`; returns the torso, for the hurt and the flash. */
export function drawTrapezeAlien(
  ctx: CanvasRenderingContext2D,
  tile: number,
  p: TrapezePose,
  time: number,
  hurt: number,
): Path2D {
  const T = tile;
  const lean = -LEAN * p.forward;
  const out = Math.max(p.kick, 0.5 + 0.5 * p.forward);
  const shin = TUCKED + (THROWN - TUCKED) * out;
  const sx = Math.sign(p.facing || 1) * Math.max(0.18, Math.abs(p.facing));
  ctx.save();
  ctx.translate(p.at.x, p.at.y);
  ctx.rotate((-p.deg * Math.PI) / 180);
  ctx.scale(sx * TRAPEZE_SIZE, TRAPEZE_SIZE);
  const hip = { x: 0, y: -0.03 * T };
  // The far side first: its leg and its arm, a shade darker.
  drawLeg(ctx, T, hip, shin + 0.12, 0.08 * T, true);
  const shoulder = up(hip, lean, 0.62 * T, 0.06 * T);
  drawArm(ctx, T, shoulder, 0.05 * T, true);
  drawSeat(ctx, T);
  const torso = trapezeBodyPath(
    up(hip, lean, TRAPEZE_TORSO_UP * T, 0),
    TRAPEZE_TORSO * T,
    time,
    2.3,
  );
  const headAt = up(hip, lean + p.lag, TRAPEZE_HEAD_UP * T, 0.06 * T);
  const head = trapezeBodyPath(headAt, TRAPEZE_HEAD * T, time * 1.3, 5.1);
  drawAntennae(ctx, T, headAt, lean + 2 * p.lag);
  fillBody(ctx, torso, up(hip, lean, TRAPEZE_TORSO_UP * T, 0), TRAPEZE_TORSO * T);
  fillBody(ctx, head, headAt, TRAPEZE_HEAD * T);
  drawHurt(ctx, torso, hurt);
  drawEyes(ctx, T, headAt);
  drawLeg(ctx, T, hip, shin, 0, false);
  drawArm(ctx, T, shoulder, 0, false);
  ctx.restore();
  return torso;
}

/** `d` up from `from` along a body leaning `lean`, and `fwd` forward of it. */
function up(from: Point, lean: number, d: number, fwd: number): Point {
  return {
    x: from.x + Math.sin(lean) * d + Math.cos(lean) * fwd,
    y: from.y - Math.cos(lean) * d + Math.sin(lean) * fwd,
  };
}

function fillBody(ctx: CanvasRenderingContext2D, path: Path2D, at: Point, r: number): void {
  ctx.fillStyle = PALETTE.trapezeAlien;
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  litRound(ctx, at.x - 0.3 * r, at.y - 0.3 * r, r * 1.2, LIGHT_HALF.creature);
  ctx.restore();
  ctx.lineWidth = 0.06 * r * 1.6;
  ctx.strokeStyle = rgba(PALETTE.trapezeAlienDark, 0.95);
  ctx.stroke(path);
}

/** Two feelers off the head, swept back by `sweep`, a bead on each. */
function drawAntennae(ctx: CanvasRenderingContext2D, T: number, head: Point, sweep: number): void {
  for (const [dx, len] of [
    [-0.06, 0.42],
    [0.08, 0.36],
  ] as const) {
    const root = { x: head.x + dx * T, y: head.y - TRAPEZE_HEAD * T * 0.8 };
    const a = -Math.PI / 2 - 0.35 + sweep * 1.4 + dx * 3;
    const tip = { x: root.x + Math.cos(a) * len * T, y: root.y + Math.sin(a) * len * T };
    const stalk = new Path2D();
    stalk.moveTo(root.x, root.y);
    stalk.quadraticCurveTo(root.x - 0.1 * T, (root.y + tip.y) / 2, tip.x, tip.y);
    ctx.lineCap = "round";
    ctx.lineWidth = 0.05 * T;
    ctx.strokeStyle = PALETTE.trapezeAlienDark;
    ctx.stroke(stalk);
    const bead = new Path2D();
    bead.arc(tip.x, tip.y, 0.07 * T, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.trapezeBrassLit;
    ctx.fill(bead);
  }
}

/** The near eye toward the front of the head and the far one half hidden past it. */
function drawEyes(ctx: CanvasRenderingContext2D, T: number, head: Point): void {
  const r = TRAPEZE_HEAD * T;
  for (const [dx, k] of [
    [0.62, 0.7],
    [0.2, 1],
  ] as const) {
    const eye = new Path2D();
    eye.ellipse(head.x + dx * r, head.y - 0.1 * r, 0.24 * r * k, 0.3 * r * k, 0, 0, Math.PI * 2);
    ctx.fillStyle = mixHex(PALETTE.hullRim, PALETTE.trapezeAlien, 0.15);
    ctx.fill(eye);
    const pupil = new Path2D();
    pupil.arc(head.x + (dx + 0.1) * r, head.y - 0.08 * r, 0.12 * r * k, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.trapezeAlienDark;
    ctx.fill(pupil);
  }
}
