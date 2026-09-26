import { SEAM_POINTS, type SeamState, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { into } from "./seam-pose.js";
import { seamLobe } from "./seam-shape.js";

/**
 * **THE SEAM's two story steps, drawn** (§26's story item; the rules are
 * `sim/seam.ts`'s `blind` and `glow`).
 *
 * - **The turn.** The ridge swings round on its spine, narrowing to an edge
 *   and widening again with its back to the pair: plain dark shell, ribbed
 *   across, no crack and no point to shoot — only its grit, thrown blind at
 *   the shield. It swings back over the rest that follows.
 * - **The glow.** Heat comes up through the crack from inside: the crack
 *   white-hot, veins of it lit out through the shell, one vein going dark
 *   per shot that lands, and a ring round the middle lobe closing as the
 *   step's beats run out. White, because either colour quenches it.
 */

/** Ribs across the turned ridge's back. */
const RIBS = 7;

/**
 * How far the ridge has turned away: 0 facing, 1 its back to the pair —
 * eased round over the turn's first beat, and back over the rest after it.
 */
export function seamTurn(s: SeamState, cfg: SimConfig, beat: number, beatPhase: number): number {
  const t = into(s, beat, beatPhase);
  if (s.phase === "lit" && s.steps[s.cursor]?.ask === "blind") return smoothstep(t);
  if (s.phase === "rest" && s.steps[s.cursor - 1]?.ask === "blind") {
    return 1 - smoothstep(t / Math.max(1, cfg.seamRestBeats));
  }
  return 0;
}

/** The ridge's width as it turns: an edge halfway round, whole again face or back on. */
export function seamTurnWidth(turn: number): number {
  return Math.max(0.12, Math.abs(Math.cos(turn * Math.PI)));
}

/** The ridge's back: darker than its face, ribbed across, and no crack on it. */
export function drawSeamBack(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  ridge: Path2D,
  half: number,
): void {
  ctx.fillStyle = rgba(PALETTE.background, 0.45);
  ctx.fill(ridge);
  ctx.save();
  ctx.clip(ridge);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.45);
  for (let i = 1; i < RIBS; i++) {
    const y = -half + (2 * half * i) / RIBS;
    const rib = new Path2D();
    rib.moveTo(-1.2 * l.tile, y + 0.12 * l.tile);
    rib.quadraticCurveTo(0, y - 0.18 * l.tile, 1.2 * l.tile, y + 0.12 * l.tile);
    ctx.stroke(rib);
  }
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.9);
  ctx.stroke(ridge);
}

/**
 * The glow from within, laid over the crack in the ridge's own frame: the
 * crack burning white by the share still to quench, a vein out from each
 * lobe per shot owed — dark once its shot has landed — and the ring round
 * the middle lobe, `left` of it still open.
 */
export function drawSeamGlow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  ridge: Path2D,
  crack: Path2D,
  quenched: number,
  shots: number,
  left: number,
  beatPhase: number,
): void {
  const hot = Math.max(0, 1 - quenched / Math.max(1, shots));
  const throb = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  ctx.save();
  ctx.clip(ridge);
  ctx.fillStyle = rgba(PALETTE.hullRim, (0.08 + 0.08 * throb) * hot);
  ctx.fill(ridge);
  for (let i = 0; i < shots; i++) {
    const lit = i >= quenched;
    const { y, h } = seamLobe(l, i % SEAM_POINTS);
    const side = i % 2 === 0 ? 1 : -1;
    const vein = new Path2D();
    vein.moveTo(0, y);
    vein.lineTo(side * 0.35 * l.tile, y - h * 0.2);
    vein.lineTo(side * 0.6 * l.tile, y + h * 0.15);
    vein.lineTo(side * 0.95 * l.tile, y - h * 0.3);
    ctx.lineWidth = lit ? STROKE.outline : STROKE.inner;
    ctx.strokeStyle = lit ? rgba(PALETTE.hullRim, 0.55 + 0.3 * throb) : rgba(PALETTE.rock, 0.35);
    ctx.stroke(vein);
    if (lit) strokeGlow(ctx, vein, PALETTE.hullRim, STROKE.inner, 0.9);
  }
  ctx.restore();
  if (hot > 0) {
    ctx.fillStyle = rgba(PALETTE.hullRim, (0.35 + 0.35 * throb) * hot);
    ctx.fill(crack);
    strokeGlow(ctx, crack, PALETTE.hullRim, STROKE.inner, 0.6 + hot);
  }
  const { y, h } = seamLobe(l, 1);
  const ring = new Path2D();
  ring.arc(0, y, h * 0.75, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  strokeGlow(ctx, ring, PALETTE.hullRim, STROKE.outline, 1);
}
