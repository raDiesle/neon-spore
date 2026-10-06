import type { SimConfig } from "@neon-spore/sim";
import { flueSightAt, type Point } from "./flue-shape.js";
import { FLUE_STRINGS, type FlueHang, flueHung, flueStringFoot } from "./flue-strings.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { TOP_CHROME_PX } from "./top-chrome.js";

/**
 * **The strings THE FLUE hangs on, drawn** (`flue-strings.ts` says how it
 * hangs): a tendon of the flue's own flesh each, coming down out of the dark
 * under the game's chrome (`TOP_CHROME_PX`, where no boss may reach past) to
 * a sucker on the flue's crown, a thread of light running
 * it and knots along it, stirring.
 *
 * **A cut one** is two ends: the top one hanging from the dark and swinging,
 * the bottom a stub on the crown, both raw red where they parted. Growing
 * back, the top end comes down to the crown and the stub goes, so a level
 * lights with three whole. Drawn under the flue, so a sucker sits behind the
 * flesh it holds; on both screens, since the shots left are the pair's both.
 */

/** The tendon's width, the thread's and a knot's radius, in tiles; the knots, how many. */
const CORD = 0.2;
const THREAD = 0.03;
const KNOT = 0.11;
const KNOTS = 4;
/** How far a cut string's top end hangs, as a share of its length, and its stub, in tiles. */
const HANGS = 0.65;
const STUB = 0.8;
/** How far under the chrome a string comes up out of the dark, in tiles. */
const FADE = 1.5;
/** The sucker on the crown, in tiles. */
const SUCKER = 0.22;

export function drawFlueStrings(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  hang: FlueHang,
  shift: Point,
  time: number,
): void {
  const sight = flueSightAt(l, cfg);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < FLUE_STRINGS; i++) {
    const hung = flueHung(flueStringFoot(l, cfg, i), sight, hang.tilt, hang.drop);
    const foot = { x: hung.x + shift.x, y: hung.y + shift.y };
    const top = { x: flueStringFoot(l, cfg, i).x, y: TOP_CHROME_PX };
    if (foot.y <= top.y + l.tile) continue;
    const whole = hang.whole[i] ?? 1;
    const stir = Math.sin(time * 1.1 + i * 2.3) * l.tile * 0.12;
    if (whole >= 1) cord(ctx, l, top, foot, stir, i);
    else cutCord(ctx, l, top, foot, whole, stir, time, i);
    sucker(ctx, l, foot);
  }
  ctx.restore();
}

/**
 * A cut string, `whole` of the way grown back: the top end hanging and
 * swinging, coming down as it grows, and the stub on the crown, gone by the
 * time the top end gets there.
 */
function cutCord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  top: Point,
  foot: Point,
  whole: number,
  stir: number,
  time: number,
  i: number,
): void {
  const reach = HANGS + (1 - HANGS) * whole;
  const swing = Math.sin(time * 2.1 + i) * l.tile * 0.35 * (1 - whole);
  const end = { x: top.x + (foot.x - top.x) * reach + swing, y: top.y + (foot.y - top.y) * reach };
  cord(ctx, l, top, end, stir, i);
  raw(ctx, l, end, 1 - whole);
  const stub = { x: foot.x - swing * 0.2, y: foot.y - STUB * l.tile * (1 - whole) };
  cord(ctx, l, stub, foot, 0, i);
  raw(ctx, l, stub, 1 - whole);
}

/** One length of tendon from `a` to `b`, bowed by `bow`, with its thread and knots. */
function cord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  a: Point,
  b: Point,
  bow: number,
  seed: number,
): void {
  const mx = (a.x + b.x) / 2 + bow;
  const my = (a.y + b.y) / 2;
  const path = new Path2D();
  path.moveTo(a.x, a.y);
  path.quadraticCurveTo(mx, my, b.x, b.y);
  ctx.lineWidth = CORD * l.tile * 1.5;
  ctx.strokeStyle = outOfDark(ctx, l, PALETTE.flueSootDark, 1);
  ctx.stroke(path);
  ctx.lineWidth = CORD * l.tile;
  ctx.strokeStyle = outOfDark(ctx, l, PALETTE.flueSoot, 1);
  ctx.stroke(path);
  ctx.lineWidth = THREAD * l.tile;
  ctx.strokeStyle = outOfDark(ctx, l, PALETTE.sheenRim, 0.35);
  ctx.stroke(path);
  ctx.fillStyle = PALETTE.flueSoot;
  ctx.strokeStyle = PALETTE.flueSootDark;
  ctx.lineWidth = THREAD * l.tile;
  for (let k = 1; k <= KNOTS; k++) {
    const t = (k - 0.5 + 0.3 * Math.sin(seed + k)) / KNOTS;
    if (b.y - a.y < l.tile * 0.8 && k > 1) break;
    const u = 1 - t;
    const x = u * u * a.x + 2 * u * t * mx + t * t * b.x;
    const y = u * u * a.y + 2 * u * t * my + t * t * b.y;
    if (y < TOP_CHROME_PX + FADE * l.tile) continue;
    const knot = new Path2D();
    knot.ellipse(x, y, KNOT * l.tile, KNOT * l.tile * 1.4, 0, 0, Math.PI * 2);
    ctx.fill(knot);
    ctx.stroke(knot);
  }
}

/** `hex` at `alpha`, coming up out of nothing over the first `FADE` tiles under the chrome. */
function outOfDark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  hex: string,
  alpha: number,
): CanvasGradient {
  const g = ctx.createLinearGradient(0, TOP_CHROME_PX, 0, TOP_CHROME_PX + FADE * l.tile);
  g.addColorStop(0, rgba(hex, 0));
  g.addColorStop(1, rgba(hex, alpha));
  return g;
}

/** A parted end, raw red, `fresh` 1 just cut. */
function raw(ctx: CanvasRenderingContext2D, l: Layout, at: Point, fresh: number): void {
  const r = CORD * l.tile * 0.9;
  ctx.fillStyle = rgba(PALETTE.red, 0.5 + 0.4 * fresh);
  ctx.beginPath();
  ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(PALETTE.redRim, 0.7 * fresh);
  ctx.lineWidth = THREAD * l.tile;
  for (const a of [-0.9, 0, 0.9]) {
    ctx.beginPath();
    ctx.moveTo(at.x, at.y);
    ctx.lineTo(at.x + Math.sin(a) * r * 2, at.y + Math.cos(a) * r * 2);
    ctx.stroke();
  }
}

/** The sucker a string holds the crown by. */
function sucker(ctx: CanvasRenderingContext2D, l: Layout, at: Point): void {
  const r = SUCKER * l.tile;
  ctx.fillStyle = PALETTE.flueSoot;
  ctx.strokeStyle = PALETTE.flueSootDark;
  ctx.lineWidth = THREAD * l.tile * 1.5;
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, r * 1.3, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
