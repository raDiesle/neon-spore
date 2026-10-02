import { cystCorePath, cystCoreR, cystMarkAt, cystR } from "./cyst-shape.js";
import type { CystCoreLit } from "./cyst-story.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawLitCore } from "./lit-core.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE CYST's marks**: the things that say what a step asks — a lit freeze
 * mark beside a flank, which is *tap here*; the lit core, which is *shoot
 * here, in this colour*; and the flashes `cyst-fx.ts` times. The words over
 * them are the cue's, every boss's way (`boss-cue-read-zi.ts`).
 */

/** How far the core's window ring stands off it, as a share of its radius. */
const RING = 1.45;

/**
 * Freeze mark `side`, beside its flank, drawn only while its flank's step is
 * lit: a hollow ring with a dot breathing white, a ring round it closing as
 * the tap's window runs out; and, once tapped, filled and still. Nothing
 * stands there between steps (`marks-window.test.ts`).
 */
export function drawCystMark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  state: "lit" | "stilled",
  left: number,
  beatPhase: number,
): void {
  const m = cystMarkAt(l, side);
  const pulse = 0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2);
  const ring = new Path2D();
  ring.arc(m.x, m.y, m.r, 0, Math.PI * 2);
  const dot = new Path2D();
  dot.arc(m.x, m.y, m.r * 0.32, 0, Math.PI * 2);
  if (state === "stilled") {
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.8);
    ctx.fill(ring);
    strokeGlow(ctx, ring, PALETTE.hullRim, STROKE.outline, 0.8);
    return;
  }
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.85 * pulse);
  ctx.fill(dot);
  strokeGlow(ctx, ring, PALETTE.hullRim, STROKE.outline, pulse);
  if (left <= 0) return;
  const window = new Path2D();
  window.arc(m.x, m.y, m.r * 1.4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  strokeGlow(ctx, window, PALETTE.hullRim, STROKE.inner, 0.9);
}

/**
 * The covered core's own motion: how far it rises and sinks, in tiles, and how
 * much it squashes as it goes, each with its own rate in radians a second so
 * the two never fall into step with each other or with the beat.
 */
const CORE_DRIFT = 0.04;
const CORE_DRIFT_RATE = 0.5;
const CORE_SQUASH = 0.05;
const CORE_SQUASH_RATE = 0.83;

/**
 * The core: under the skin while the sac is whole, a shadow through it; bared,
 * a dark hollow with the core in it, dull between fire steps and lit in the
 * step's colour while one is owed, brighter for every hit it has taken, with
 * a ring round it closing as the step's beats run out.
 *
 * The shadow under the skin moves on a clock of its own, the one thing in
 * the sac that does: it rises and sinks down its column and squashes as it
 * goes. Bared, it is the target and holds still.
 */
export function drawCystCore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  size: number,
  bright: number,
  bare: boolean,
  lit: CystCoreLit | null,
  beatPhase: number,
  time: number,
): void {
  const core = cystCorePath(l, size);
  if (!bare) {
    const drift = Math.sin(time * CORE_DRIFT_RATE);
    const squash = CORE_SQUASH * Math.sin(time * CORE_SQUASH_RATE);
    ctx.save();
    ctx.translate(0, l.tile * CORE_DRIFT * drift);
    ctx.scale(1 + squash, 1 - squash);
    ctx.fillStyle = rgba(PALETTE.cystSacDark, 0.45);
    ctx.fill(core);
    ctx.restore();
    return;
  }
  const hollow = new Path2D();
  hollow.arc(0, 0, cystCoreR(l) * 1.3, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.background, 0.92);
  ctx.fill(hollow);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.cystScar, 0.7);
  ctx.stroke(hollow);
  ctx.fillStyle = rgba(PALETTE.cystSac, 0.8);
  ctx.fill(core);
  if (lit === null) return;
  // Lit for its step, from inside, and nothing past its edge (`lit-core.ts`).
  drawLitCore(
    ctx,
    core,
    lit,
    beatPhase,
    { x: 0, y: 0, r: cystCoreR(l) },
    cystCoreR(l) * RING,
    bright,
  );
}

/**
 * A core hit's flash — white over the hollow, a thin flare the first time and
 * wider every hit — and the split's, over the whole sac.
 */
export function drawCystFlash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  flash: { now: number; hits: number },
  split: number,
): void {
  if (flash.now > 0 && flash.hits > 0) {
    const hits = Math.min(3, flash.hits);
    const r = cystCoreR(l) * (0.5 + 0.5 * hits) * (1.4 - 0.4 * flash.now);
    const p = new Path2D();
    p.arc(0, 0, Math.max(0.5, r), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hullRim, flash.now * (0.35 + 0.2 * hits));
    ctx.fill(p);
    strokeGlow(ctx, p, PALETTE.hullRim, STROKE.inner, flash.now * (0.6 + 0.4 * hits));
  }
  if (split > 0) {
    const p = new Path2D();
    p.arc(0, 0, cystR(l) * (1.2 - 0.3 * split), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.cystScar, 0.5 * split);
    ctx.fill(p);
  }
}
