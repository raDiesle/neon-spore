import type { SimConfig } from "@neon-spore/sim";
import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import type { MimicPose, Point } from "./mimic-shape.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE MIMIC as a crane**: two arms holding the board up by its top corners.
 * The owner, 3 October 2026: *something which holds the area … like a crane
 * holding a portrait or a TV — but alien, living*. While a picture is up the
 * mantle hangs small over the board
 * (`mimic-pose.ts`) and two of its arms come down and out to the board's two
 * top corners and hold it there, each tip curled round its corner with a
 * sucker pressed on the frame.
 *
 * **The arms reach for the corners as the board comes up** — at `held` nought
 * they are still under the mantle, at one they have it — and sway with the
 * skin along their length while their tips stay put, so the board they hold
 * never moves. Drawn in two passes: the arms before the mantle, so they come
 * out from under it, and the grips after the board, so they close over its
 * frame (`mimic-draw.ts`).
 */

/** How thick an arm is at its root and at its tip, in mantle radii, and its lobes. */
const ROOT = 0.8;
const TIP = 0.32;
const LOBES = 5;
/** How bright the pale rim round the crane is, arms and mantle alike. */
export const CRANE_RIM = 0.15;
/** Where along an arm its suckers are, root nought to tip one. */
const SUCKERS = [0.3, 0.45, 0.6, 0.75, 0.9];
/** How far in from the board's corner a grip sits, in tiles. */
const GRIP_IN = 0.3;

/** Where each arm leaves the mantle and where it holds, this frame. */
function ends(l: Layout, cfg: SimConfig, p: MimicPose, side: -1 | 1): { root: Point; tip: Point } {
  const top = l.gridTop;
  const left = l.gridLeft;
  const right = left + cfg.cols * l.tile;
  const root = { x: p.x + side * p.r * 0.55, y: p.y + p.r * p.squash * 0.45 };
  const corner = {
    x: side < 0 ? left + GRIP_IN * l.tile : right - GRIP_IN * l.tile,
    y: top + GRIP_IN * l.tile,
  };
  const k = p.held;
  return {
    root,
    tip: { x: root.x + (corner.x - root.x) * k, y: root.y + (corner.y - root.y) * k },
  };
}

/** A point down an arm's middle, and how thick the arm is there. */
interface Spine {
  x: number;
  y: number;
  half: number;
}

/** Arm `side`'s middle at `u`, root nought to tip one: out first and down last, a jib and not a line. */
function spineAt(l: Layout, p: MimicPose, root: Point, tip: Point, side: -1 | 1, u: number): Spine {
  const x = root.x + (tip.x - root.x) * Math.sin((u * Math.PI) / 2);
  const lift = Math.sin(u * Math.PI) * l.tile * 0.35;
  const sway = Math.sin(p.wave * 0.8 + u * 3 + side) * 0.12 * l.tile * Math.sin(u * Math.PI);
  const y = root.y + (tip.y - root.y) * u * u - lift + sway;
  const lobe = 1 + 0.16 * Math.sin(u * Math.PI * 2 * LOBES - p.wave);
  return { x, y, half: p.r * (ROOT + (TIP - ROOT) * u) * lobe * 0.5 };
}

/** One arm, root to tip, swaying with the skin. */
function arm(l: Layout, cfg: SimConfig, p: MimicPose, side: -1 | 1): Path2D {
  const { root, tip } = ends(l, cfg, p, side);
  const steps = 22;
  const a: Point[] = [];
  const b: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const { x, y, half } = spineAt(l, p, root, tip, side, i / steps);
    a.push({ x, y: y - half });
    b.push({ x, y: y + half });
  }
  return splinePath([...a, ...b.reverse()], true);
}

/**
 * **The suckers glow**, pale as the old sign was, in a pulse that runs down
 * each arm toward the board on the beat: what makes a dark arm on a dark sky
 * read, and what makes it read as alive.
 */
function drawSuckers(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  p: MimicPose,
  side: -1 | 1,
): void {
  const { root, tip } = ends(l, cfg, p, side);
  for (const u of SUCKERS) {
    const at = spineAt(l, p, root, tip, side, u);
    const pulse = 0.5 + 0.5 * Math.sin(p.wave * 2.4 - u * 7);
    const dot = new Path2D();
    dot.arc(at.x, at.y + at.half * 0.3, at.half * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.mimicSign, (0.45 + 0.5 * pulse) * p.held);
    ctx.fill(dot);
  }
}

/** The two arms holding the board, behind the mantle. */
export function drawMimicCraneArms(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  p: MimicPose,
): void {
  if (p.held <= 0) return;
  for (const side of [-1, 1] as const) {
    const path = arm(l, cfg, p, side);
    ctx.fillStyle = PALETTE.mimicSkin;
    ctx.fill(path);
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = PALETTE.mimicSkinDark;
    ctx.stroke(path);
    strokeGlowFaded(ctx, path, PALETTE.mimicSign, STROKE.outline, CRANE_RIM, p.held);
    drawSuckers(ctx, l, cfg, p, side);
  }
}

/** Each arm's tip curled over its corner of the frame, a sucker pressed on it, over the board. */
export function drawMimicCraneGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  p: MimicPose,
): void {
  if (p.held < 0.5) return;
  const grip = (p.held - 0.5) * 2;
  for (const side of [-1, 1] as const) {
    const { tip } = ends(l, cfg, p, side);
    const r = l.tile * 0.34 * grip;
    const curl = new Path2D();
    // The tip hooks round the corner: a short tapered crook toward the board's middle.
    curl.moveTo(tip.x + side * r * 0.4, tip.y - r * 1.2);
    curl.quadraticCurveTo(
      tip.x + side * r * 1.4,
      tip.y + r * 0.6,
      tip.x - side * r * 0.6,
      tip.y + r,
    );
    ctx.lineCap = "round";
    ctx.lineWidth = r * 0.9;
    ctx.strokeStyle = PALETTE.mimicSkinDark;
    ctx.stroke(curl);
    ctx.lineWidth = r * 0.6;
    ctx.strokeStyle = PALETTE.mimicSkin;
    ctx.stroke(curl);
    ctx.lineCap = "butt";
    const sucker = new Path2D();
    sucker.arc(tip.x - side * r * 0.4, tip.y + r * 0.7, r * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.mimicMottle;
    ctx.fill(sucker);
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = PALETTE.mimicSkinDark;
    ctx.stroke(sucker);
    strokeGlowFaded(ctx, sucker, PALETTE.mimicSign, STROKE.outline, 0.8 * grip);
  }
}
