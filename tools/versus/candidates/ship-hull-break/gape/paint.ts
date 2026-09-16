import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { stream } from "../../../../../packages/render/src/hash.js";
import type { HullBreakPaint } from "../../../../../packages/render/src/hull-break-look.js";

/**
 * The hole opened into a cavity: the pit widened and deepened into the ship,
 * ribs of the frame crossing it where the skin used to be, and light venting
 * up out of it.
 *
 * **What it argues** is that the ship should be shown to have an inside. A pit
 * in a membrane says the surface is damaged; a cavity with structure in it says
 * the thing the pair is standing on is broken, which is what a lost wave is.
 */

/** How far the break reaches past the hole, in tiles. */
export const OPEN = 1.4;

/** How many ribs cross the cavity. Odd, so the middle of the hole has one. */
const RIBS = 5;

/** How deep the cavity goes below the skin, as a multiple of the hole's radius. */
const DEEP = 1.5;

/** The vent's radius, in tiles, and the halo's quantisation (`glow.ts`). */
const VENT_TILES = 0.9;
const VENT_STEP = 6;

export function gape(ctx: CanvasRenderingContext2D, b: HullBreakPaint): void {
  const rnd = stream(b.seed + 3);
  const deep = b.r * DEEP;
  const half = Math.max(b.r, (b.right - b.left) / 2);

  // The cavity, under the mouth the crater already cut. Clipped to itself so
  // nothing inside can reach the sky: this half really is a hole.
  const cavity = new Path2D();
  cavity.moveTo(b.left, b.y);
  cavity.bezierCurveTo(
    b.left - half * 0.2,
    b.y + deep,
    b.right + half * 0.2,
    b.y + deep,
    b.right,
    b.y,
  );
  cavity.closePath();
  ctx.save();
  ctx.clip(cavity);
  ctx.fillStyle = "#050308";
  ctx.fill(cavity);

  // The frame, where the skin came off it. Each rib is where a rib would be
  // rather than where a line looks good: evenly across the opening, and dimmer
  // the further into the hole it stands.
  for (let i = 0; i < RIBS; i++) {
    const u = (i + 0.5) / RIBS;
    const x = b.left + (b.right - b.left) * u;
    const lean = (rnd() - 0.5) * half * 0.3;
    const rib = new Path2D();
    rib.moveTo(x, b.y);
    rib.lineTo(x + lean, b.y + deep * (0.55 + 0.4 * rnd()));
    strokeGlow(ctx, rib, b.rim, Math.max(1, b.tile * 0.03), 0.35 + 0.35 * Math.sin(u * Math.PI));
  }
  ctx.restore();

  // And what is getting out: a vent standing in the mouth, breathing.
  const lit = 0.55 + 0.25 * Math.sin(b.time * 3.1 + b.seed);
  const r = b.tile * VENT_TILES;
  halo(ctx, b.x, b.y, Math.max(VENT_STEP, Math.round(r / VENT_STEP) * VENT_STEP), "#FF7A2F", lit);

  // The torn lip, so the cavity has an edge rather than fading into the skin.
  const lip = new Path2D();
  lip.moveTo(b.left - half * 0.25, b.skinY(b.left - half * 0.25));
  lip.lineTo(b.left, b.y);
  lip.moveTo(b.right, b.y);
  lip.lineTo(b.right + half * 0.25, b.skinY(b.right + half * 0.25));
  strokeGlow(ctx, lip, b.rim, Math.max(1, b.tile * 0.04), 0.8);
}
