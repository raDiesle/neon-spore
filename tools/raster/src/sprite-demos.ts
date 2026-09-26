import {
  drawBakedEgg,
  drawBakedGlob,
  drawBakedHeart,
  drawBakedIris,
  drawBakedMembrane,
  drawBakedNests,
  drawBakedPale,
  drawBakedScales,
  drawBakedSeam,
  drawBakedSpark,
  drawEgg,
  drawEggCrack,
  drawHideScales,
  drawNests,
  EGG_SPRITE,
  EYE_SPRITE,
  GLOB_SPRITE,
  HEART_LOOK,
  HEART_SPRITE,
  HIDE_SPRITE,
  IRIS_LOOK,
  NEST_SPRITE,
  PALE_LOOK,
  PALE_SPRITE,
  PALETTE,
  RING_LOOK,
  SEAM_SPRITE,
  SPARK_SPRITE,
  SPIT_LOOK,
  type SpriteSpec,
  WING_LOOK,
  WING_SPRITE,
} from "@neon-spore/render";
import {
  beat,
  flat,
  glob,
  iris,
  look,
  plate,
  ring,
  spark,
  split,
  wing,
} from "./sprite-fixtures.js";

/**
 * **What `bun run sprite` can show**: each baked sprite beside the drawing it
 * is offered against. A new sprite is one entry here — its spec, its colours,
 * how tall it plays, and a shipped and a baked way to draw one at a point —
 * and one row in `sprite.ts`'s `BYTES`, which names the modules it costs.
 */

export interface SpriteDemo {
  readonly name: string;
  readonly spec: SpriteSpec;
  readonly base: string;
  readonly glow: string;
  /** The sprite's height in CSS pixels at a head radius of `r`. */
  playH(r: number): number;
  /** The states worth a column, as the window's threat 0..1. */
  readonly threats: readonly number[];
  /** The box a drawing fills about its point, in head radii: [left, top, right, bottom]. */
  readonly box: readonly [number, number, number, number];
  shipped(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    threat: number,
    time: number,
  ): void;
  baked(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    threat: number,
    time: number,
    dpr: number,
  ): void;
}

export const DEMOS: readonly SpriteDemo[] = [
  {
    name: "instar-egg",
    spec: EGG_SPRITE,
    base: PALETTE.bile,
    glow: PALETTE.bileRim,
    playH: (r) => r * 0.13 * 2 * 1.4,
    threats: [0, 0.3, 0.55, 0.9],
    box: [-0.14, -0.19, 0.14, 0.19],
    shipped(ctx, x, y, r, threat, time) {
      drawEgg(ctx, x, y, r, 0.1, 1);
      drawEggCrack(ctx, x, y, r * 0.1, r * 0.13, 0.1, threat, 1, time, 3);
    },
    baked(ctx, x, y, r, threat, time, dpr) {
      drawBakedEgg(ctx, x, y, r, 0.1, 1, threat, time, 3, dpr);
    },
  },
  {
    name: "instar-nest",
    spec: NEST_SPRITE,
    base: PALETTE.text,
    glow: PALETTE.text,
    playH: (r) => r * 0.62,
    threats: [0, 0.9],
    box: [-0.66, -0.5, 0.66, 0.22],
    shipped(ctx, x, y, r, threat, time) {
      drawNests(ctx, flat(1), look(x, y, r, threat, time));
    },
    baked(ctx, x, y, r, threat, time, dpr) {
      drawBakedNests(ctx, flat(dpr), look(x, y, r, threat, time));
    },
  },
  {
    name: "instar-eye",
    spec: EYE_SPRITE,
    base: PALETTE.pod,
    glow: PALETTE.ember,
    playH: (r) => r * 0.2,
    threats: [0],
    box: [-0.2, -0.12, 0.2, 0.12],
    shipped(ctx, x, y, r) {
      IRIS_LOOK.paint(ctx, iris(x, y, r));
    },
    baked(ctx, x, y, r, _threat, _time, dpr) {
      drawBakedIris(ctx, iris(x, y, r), IRIS_LOOK.paint, dpr);
    },
  },
  {
    name: "instar-glob",
    spec: GLOB_SPRITE,
    base: PALETTE.ember,
    glow: PALETTE.podRim,
    playH: (r) => r * 0.12 * 3.6,
    threats: [0],
    box: [-0.3, -0.4, 0.25, 0.25],
    shipped(ctx, x, y, r, _threat, time) {
      SPIT_LOOK.glob(ctx, glob(x, y, r, time));
    },
    baked(ctx, x, y, r, _threat, time, dpr) {
      drawBakedGlob(ctx, glob(x, y, r, time), SPIT_LOOK.glob, dpr);
    },
  },
  {
    name: "instar-heart",
    spec: HEART_SPRITE,
    base: PALETTE.red,
    glow: PALETTE.redRim,
    playH: (r) => r * 0.25 * 4.4,
    threats: [0],
    box: [-0.6, -0.6, 0.6, 0.6],
    shipped(ctx, x, y, r) {
      HEART_LOOK.paint(ctx, beat(x, y, r));
    },
    baked(ctx, x, y, r, _threat, _time, dpr) {
      drawBakedHeart(ctx, beat(x, y, r), HEART_LOOK.paint, dpr);
    },
  },
  {
    name: "instar-hide",
    spec: HIDE_SPRITE,
    base: PALETTE.hullRim,
    glow: PALETTE.text,
    playH: (r) => 4 * 0.8 * r * 0.13,
    threats: [0],
    box: [-0.66, -0.4, 0.66, 0.4],
    shipped(ctx, x, y, r) {
      const [p, form] = plate(ctx, x, y, r);
      drawHideScales(ctx, p, form, r * 0.13, 1);
    },
    baked(ctx, x, y, r, _threat, _time, dpr) {
      const [p, form] = plate(ctx, x, y, r);
      drawBakedScales(ctx, p, form, r * 0.13, 1, dpr);
    },
  },
  {
    name: "instar-moult",
    spec: PALE_SPRITE,
    base: PALETTE.sheenMid,
    glow: PALETTE.text,
    playH: (r) => r * 0.42,
    threats: [0],
    box: [-0.8, -0.45, 0.8, 0.35],
    shipped(ctx, x, y, r) {
      PALE_LOOK.paint(ctx, split(x, y, r));
    },
    baked(ctx, x, y, r, _threat, _time, dpr) {
      drawBakedPale(ctx, split(x, y, r), PALE_LOOK.paint, dpr);
    },
  },
  {
    name: "instar-seam",
    spec: SEAM_SPRITE,
    base: PALETTE.hull,
    glow: PALETTE.hullRim,
    playH: (r) => r,
    threats: [0],
    box: [-0.4, -0.55, 0.4, 0.55],
    shipped(ctx, x, y, r) {
      RING_LOOK.paint(ctx, ring(ctx, x, y, r));
    },
    baked(ctx, x, y, r, _threat, _time, dpr) {
      drawBakedSeam(ctx, ring(ctx, x, y, r), dpr);
    },
  },
  {
    name: "instar-spark",
    spec: SPARK_SPRITE,
    base: PALETTE.ember,
    glow: PALETTE.emberRim,
    playH: (r) => r * 0.025 * 4.8,
    threats: [0],
    box: [-0.08, -0.08, 0.08, 0.08],
    shipped(ctx, x, y, r) {
      SPIT_LOOK.spark(ctx, spark(x, y, r));
    },
    baked(ctx, x, y, r, _threat, _time, dpr) {
      drawBakedSpark(ctx, spark(x, y, r), SPIT_LOOK.spark, dpr);
    },
  },
  {
    name: "instar-wing",
    spec: WING_SPRITE,
    base: PALETTE.sheenDeep,
    glow: PALETTE.sheenCold,
    playH: (r) => r * 0.5 * 2.5,
    threats: [0],
    box: [-0.05, -0.6, 1.15, 0.65],
    shipped(ctx, x, y, r) {
      WING_LOOK.paint(ctx, wing(ctx, x, y, r));
    },
    baked(ctx, x, y, r, _threat, _time, dpr) {
      drawBakedMembrane(ctx, wing(ctx, x, y, r), dpr);
    },
  },
];
