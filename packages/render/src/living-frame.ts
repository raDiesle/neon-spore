import {
  type CreatureSilhouette,
  livingMotion,
  livingSilhouette,
  poseClock,
} from "@neon-spore/content";
import { type Creature, type SimConfig, wornKind } from "@neon-spore/sim";
import { contourClock, creatureCenter } from "./creature-place.js";
import { depthScale, drawnRow, nearness } from "./depth.js";
import type { Layout } from "./layout.js";

/**
 * Where a living body is standing this frame, and the transform that puts a
 * pen in its own local units.
 *
 * **Two passes draw *over* a body rather than as one** — THE SHELL's plating
 * and THE STRAND's cage — and both have to land on the contour exactly, at
 * every row, through every sway, or the armour reads as a decal stuck near a
 * creature instead of something the creature is wearing. Each of them was
 * re-deriving `drawLiving`'s placement by hand, and a second hand-written copy
 * of it is the standing way this repository's armour comes adrift: `CLAUDE.md`
 * names calling a rule instead of re-deriving it as the thing purity.test.ts
 * carries a table for.
 *
 * So the placement is one function, and a pass that wants to draw on a body
 * asks for it. It is deliberately **not** the whole of `drawLiving`'s
 * transform: the dart's lean and flip, the throb's spin and the echo's strain
 * are not in here, because no creature that wears armour has any of them. A
 * kind that ever did would want them added here once rather than in each
 * caller.
 */
export interface LivingFrame {
  /** The worn body's silhouette — `wornKind`, never `c.kind`. */
  shape: CreatureSilhouette;
  /** The body's centre on screen, before its own-motion offset. */
  x: number;
  y: number;
  /** Distance's two numbers at this body's drawn row. */
  near: number;
  /** The body's drawn radius in pixels, before the silhouette's own scale. */
  r: number;
  /** Body-local units to pixels, so a line width inside the transform is
   * divided by this the way every other line inside a contour is. */
  scale: number;
  /** The contour's own breathing clock, for `blobRadiusMul` and `blobPath`. */
  t: number;
}

/**
 * Read a body's placement. `time` is the wall clock the contour breathes on;
 * the pose clock belongs to `applyLivingFrame`, which is the half of this that
 * actually moves the pen.
 */
export function livingFrame(l: Layout, c: Creature, beatPhase: number, time: number): LivingFrame {
  const shape = livingSilhouette(wornKind(c));
  const { x, y } = creatureCenter(l, c, beatPhase);
  const row = drawnRow(c, beatPhase);
  const r = l.tile * 0.4;
  return {
    shape,
    x,
    y,
    near: nearness(l, row),
    r,
    scale: (r / Math.max(shape.rx, shape.ry)) * (shape.sizeMul ?? 1),
    t: contourClock(c.id, time),
  };
}

/**
 * Put the context in the body's own local units: the depth envelope about the
 * body's centre, then the own-motion translate, rotate and squash. Exactly
 * what `drawLiving` applies to the same creature on the same frame, which is
 * the whole of why it is here rather than typed out again beside each caller.
 *
 * The caller owns the `save`/`restore` around it, because what it draws in
 * between is its own business.
 */
export function applyLivingFrame(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  f: LivingFrame,
  beats: number,
  beatPhase: number,
): void {
  const k = depthScale(cfg, l, drawnRow(c, beatPhase));
  const pose = livingMotion(wornKind(c)).poseAt(poseClock(c.id, beats));
  ctx.translate(f.x, f.y);
  ctx.scale(k, k);
  ctx.translate(-f.x, -f.y);
  ctx.translate(f.x + pose.dx * l.tile, f.y + pose.dy * l.tile);
  ctx.rotate(pose.rot);
  ctx.scale(f.scale * pose.sx, f.scale * pose.sy);
}
