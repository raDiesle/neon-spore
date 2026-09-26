import type { Color, SeamStep } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { type Point, seamLobe, seamPointPath } from "./seam-shape.js";

/**
 * **THE SEAM's marks**: the three things that say what a step asks — the lit
 * point, which is *shoot here, in this colour*; the grit, which is *shield
 * under the ridge*; and the rock, which is *shoot it out, in its column*.
 * Cut from `seam-draw.ts` the day it was written, along the line its second
 * half will grow on — the cue words and the grit's spark come here.
 */

/** A step's colour on the canvas: its cannon's, or white for a step either answers (§26, *Colour*). */
export function seamColour(color: Color | "either"): { body: string; rim: string } {
  if (color === "either") return { body: PALETTE.hullRim, rim: PALETTE.hullRim };
  return { body: PALETTE[color], rim: color === "red" ? PALETTE.redRim : PALETTE.cyanRim };
}

/**
 * The lit point: its opening on the crack glowing in the step's colour, and a
 * ring round it closing as the step's beats run out. Laid in the ridge's own
 * frame, like the crack it sits on.
 */
export function drawSeamPoint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  k: number,
  step: SeamStep,
  left: number,
  beatPhase: number,
): void {
  const { body, rim } = seamColour(step.color);
  const lens = seamPointPath(l, k);
  ctx.fillStyle = rgba(body, 0.45 + 0.25 * Math.cos(beatPhase * Math.PI * 2));
  ctx.fill(lens);
  strokeGlow(ctx, lens, rim, STROKE.inner, 1.3);
  const { y, h } = seamLobe(l, k);
  const ring = new Path2D();
  ring.arc(0, y, h * 0.75, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  strokeGlow(ctx, ring, body, STROKE.outline, 1);
}

/**
 * The grit: shards thrown from the gaping crack and falling down the middle
 * column to the hull over the step's beats, spread as they go — the shield
 * under the ridge is what takes them. Grey, like the ridge they came off.
 */
export function drawSeamGrit(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: Point,
  along: number,
  time: number,
): void {
  const shards = 7;
  for (let i = 0; i < shards; i++) {
    const lag = (i % 3) * 0.12;
    const t = Math.max(0, Math.min(1, along - lag));
    if (t <= 0) continue;
    const spread = (i - (shards - 1) / 2) * 0.16 * l.tile * t;
    const x = from.x + spread;
    const y = from.y + (l.hullY - from.y) * t;
    const r = l.tile * (0.07 + 0.02 * (i % 2));
    const shard = new Path2D();
    const turn = time * 3 + i;
    for (let j = 0; j < 3; j++) {
      const a = turn + (j * Math.PI * 2) / 3;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (j === 0) shard.moveTo(px, py);
      else shard.lineTo(px, py);
    }
    shard.closePath();
    ctx.fillStyle = rgba(PALETTE.rock, 0.5 + 0.4 * t);
    ctx.fill(shard);
  }
}

/**
 * The rock: spat from the crack's mouth across to its column and falling to
 * the hull over the step's beats — in the colour a shot must be to break it,
 * or white when either will. Shot out, it is gone.
 */
export function drawSeamRock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: Point,
  toX: number,
  step: SeamStep,
  along: number,
  time: number,
): void {
  const { body, rim } = seamColour(step.color);
  const across = Math.min(1, along * 3);
  const x = from.x + (toX - from.x) * across;
  const arc = -Math.sin(across * Math.PI) * 0.6 * l.tile;
  const y = from.y + (l.hullY - from.y) * along + arc;
  const r = l.tile * 0.3;
  const pts = 7;
  const lump = new Path2D();
  for (let i = 0; i < pts; i++) {
    const a = time * 1.5 + (i * Math.PI * 2) / pts;
    const m = r * (1 + 0.14 * Math.sin(i * 2.3));
    if (i === 0) lump.moveTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
    else lump.lineTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
  }
  lump.closePath();
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(lump);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(body, 0.9);
  ctx.stroke(lump);
  strokeGlow(ctx, lump, rim, STROKE.inner, 1);
}
