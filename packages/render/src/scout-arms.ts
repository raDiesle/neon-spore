import { KEY } from "@neon-spore/content";
import { halo } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { FLESH_U, FLESH_W, px, py, type ScoutPose, SHELL, SHELL_U, SHELL_W } from "./scout-pose.js";

/**
 * THE SCOUT's soft parts (`scout-shell.ts`): the body at the shell's opening
 * and the six tentacles that reach out of it along the heading. Split off the
 * shell on its line count.
 */

/** The soft body at the opening, breathing, with its own light inside it. */
export function drawScoutFlesh(ctx: CanvasRenderingContext2D, p: ScoutPose, time: number): void {
  const x = px(p, FLESH_U, FLESH_W);
  const y = py(p, FLESH_U, FLESH_W);
  const breath = 1 + 0.05 * Math.sin(time * 2.4);
  const rx = 0.36 * p.r * breath;
  const ry = 0.4 * p.r * breath;
  const tilt = Math.atan2(p.fy, p.fx);
  ctx.save();
  const soft = ctx.createRadialGradient(
    x + KEY.x * rx * 0.4,
    y + KEY.y * rx * 0.4,
    rx * 0.1,
    x,
    y,
    rx * 1.1,
  );
  soft.addColorStop(0, PALETTE.hullRim);
  soft.addColorStop(0.45, mixHex(PALETTE.hull, PALETTE.hullRim, 0.45));
  soft.addColorStop(1, mixHex(PALETTE.hull, PALETTE.sheenDeep, 0.35));
  ctx.fillStyle = soft;
  const body = new Path2D();
  body.ellipse(x, y, rx, ry, tilt, 0, Math.PI * 2);
  ctx.fill(body);
  ctx.clip(body);
  // Where the body goes into the shell, in shadow.
  ctx.strokeStyle = rgba(PALETTE.sheenDeep, 0.7);
  ctx.lineWidth = Math.max(1, p.r * 0.14);
  ctx.beginPath();
  ctx.arc(
    px(p, SHELL_U, SHELL_W),
    py(p, SHELL_U, SHELL_W),
    SHELL * p.r * 1.02,
    tilt - 0.75,
    tilt + 0.75,
  );
  ctx.stroke();
  ctx.restore();
}

/** One tentacle's base along the opening, and its share of the fan. */
const ARMS = [
  { w: -0.3, fan: -1, reach: 0.62, feeler: false },
  { w: -0.2, fan: -0.75, reach: 0.95, feeler: true },
  { w: -0.1, fan: -0.25, reach: 0.68, feeler: false },
  { w: 0, fan: 0.25, reach: 0.68, feeler: false },
  { w: 0.08, fan: 0.75, reach: 0.95, feeler: true },
  { w: 0.16, fan: 1, reach: 0.62, feeler: false },
] as const;

/**
 * The tentacles, reaching along the heading from the opening. `open` is 0 to
 * 1: shut, they bunch into a point; open, they fan out to take a mote in.
 * `limp` lets them hang, slower, for the navigator's ship at rest.
 */
export function drawScoutArms(
  ctx: CanvasRenderingContext2D,
  p: ScoutPose,
  open: number,
  limp: boolean,
  time: number,
): void {
  const sway = limp ? 0.12 : 0.18;
  const speed = limp ? 1.6 : 4.2;
  ctx.save();
  for (let i = 0; i < ARMS.length; i++) {
    const arm = ARMS[i];
    if (arm === undefined) continue;
    const bu = FLESH_U + 0.2;
    const bw = FLESH_W + arm.w;
    const a = arm.fan * (0.12 + 0.5 * open) + sway * Math.sin(time * speed + i * 1.3);
    const len = arm.reach * (limp ? 0.85 : 1) * (1 - 0.1 * open);
    const tu = bu + Math.cos(a) * len;
    const tw = bw + Math.sin(a) * len;
    // The middle bends outward and the tip curls back in: a grasp.
    const mu = bu + Math.cos(a * 1.6) * len * 0.55;
    const mw = bw + Math.sin(a * 1.6) * len * 0.55 + arm.fan * 0.06;
    taper(ctx, p, bu, bw, mu, mw, tu, tw, arm.feeler ? 0.085 : 0.07);
    if (!arm.feeler) continue;
    const x = px(p, tu, tw);
    const y = py(p, tu, tw);
    halo(ctx, x, y, p.r * 0.5, PALETTE.good, 0.55);
    ctx.fillStyle = PALETTE.goodRim;
    ctx.beginPath();
    ctx.arc(x, y, p.r * 0.11, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** One tentacle: a filled curve thinning from its base to a point. */
function taper(
  ctx: CanvasRenderingContext2D,
  p: ScoutPose,
  bu: number,
  bw: number,
  mu: number,
  mw: number,
  tu: number,
  tw: number,
  base: number,
): void {
  const n = 7;
  const left: number[] = [];
  const right: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = (1 - t) * (1 - t) * bu + 2 * (1 - t) * t * mu + t * t * tu;
    const w = (1 - t) * (1 - t) * bw + 2 * (1 - t) * t * mw + t * t * tw;
    const du = 2 * (1 - t) * (mu - bu) + 2 * t * (tu - mu);
    const dw = 2 * (1 - t) * (mw - bw) + 2 * t * (tw - mw);
    const d = Math.hypot(du, dw) || 1;
    const half = base * (1 - 0.8 * t);
    left.push(
      px(p, u - (dw / d) * half, w + (du / d) * half),
      py(p, u - (dw / d) * half, w + (du / d) * half),
    );
    right.push(
      px(p, u + (dw / d) * half, w - (du / d) * half),
      py(p, u + (dw / d) * half, w - (du / d) * half),
    );
  }
  ctx.beginPath();
  ctx.moveTo(left[0] ?? 0, left[1] ?? 0);
  for (let i = 2; i < left.length; i += 2) ctx.lineTo(left[i] ?? 0, left[i + 1] ?? 0);
  for (let i = right.length - 2; i >= 0; i -= 2) ctx.lineTo(right[i] ?? 0, right[i + 1] ?? 0);
  ctx.closePath();
  ctx.fillStyle = PALETTE.hull;
  ctx.fill();
  ctx.strokeStyle = rgba(PALETTE.sheenDeep, 0.6);
  ctx.lineWidth = Math.max(0.75, p.r * 0.03);
  ctx.stroke();
}
