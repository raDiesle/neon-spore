import {
  drawBakedEgg,
  drawBakedNests,
  drawBakedScales,
  drawEgg,
  drawEggCrack,
  drawHideScales,
  drawNests,
  EGG_SPRITE,
  type Form,
  HIDE_SPRITE,
  type Layout,
  type Look,
  lightHide,
  NEST_SPRITE,
  PALETTE,
  type SpriteSpec,
} from "@neon-spore/render";

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

/** A layout in which a place in thousandths is a pixel, so a nest goes where it is put. */
function flat(dpr: number): Layout {
  return { gridLeft: 0, gridTop: 0, gridWidth: 1000, gridHeight: 1000, dpr } as unknown as Layout;
}

function look(x: number, y: number, r: number, threat: number, time: number): Look {
  const f = { nest: 1, nestX: x, nestY: y, eggs: 0, eggsX: 0, eggsY: 0 };
  return {
    f,
    head: { x, y },
    r,
    time,
    fade: 1,
    hurt: 0,
    threat,
    fire: 0,
    harden: 0,
    shoveUp: 0,
    shoveDown: 0,
  } as unknown as Look;
}

/** A plate of hide a head radius long, lit as the body lights its own, for scales to lie on. */
function plate(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): [Path2D, Form] {
  const form: Form = { x, y, r: r * 0.6, ry: r * 0.3, angle: -0.25 };
  const p = new Path2D();
  p.ellipse(x, y, form.r, form.ry ?? form.r, form.angle ?? 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.hull;
  ctx.fill(p);
  lightHide(ctx, p, form, 1);
  return [p, form];
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
];
