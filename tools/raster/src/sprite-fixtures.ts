import {
  type BodyRing,
  type Form,
  type Layout,
  type Look,
  lightHide,
  PALETTE,
  type PaleSkin,
  type WingSkin,
} from "@neon-spore/render";

/**
 * The things `sprite-demos.ts` draws its sprites on: a nest's layout and
 * window, a plate of hide, a ring of the long body, a flat wing and the
 * moult's split — each at a point and a head radius, as small as the drawing
 * it is shown under needs.
 */

/** A layout in which a place in thousandths is a pixel, so a nest goes where it is put. */
export function flat(dpr: number): Layout {
  return { gridLeft: 0, gridTop: 0, gridWidth: 1000, gridHeight: 1000, dpr } as unknown as Layout;
}

export function look(x: number, y: number, r: number, threat: number, time: number): Look {
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
export function plate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
): [Path2D, Form] {
  const form: Form = { x, y, r: r * 0.6, ry: r * 0.3, angle: -0.25 };
  const p = new Path2D();
  p.ellipse(x, y, form.r, form.ry ?? form.r, form.angle ?? 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.hull;
  ctx.fill(p);
  lightHide(ctx, p, form, 1);
  return [p, form];
}

/** A ring of the long body, back to belly across a head radius, on a strip of hide. */
export function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): BodyRing {
  const hide = new Path2D();
  hide.rect(x - r * 0.35, y - r * 0.5, r * 0.7, r);
  const g = ctx.createLinearGradient(x, y - r * 0.5, x, y + r * 0.5);
  g.addColorStop(0, PALETTE.hull);
  g.addColorStop(1, PALETTE.sheenDeep);
  ctx.fillStyle = g;
  ctx.fill(hide);
  return { top: { x, y: y - r * 0.5 }, bottom: { x, y: y + r * 0.5 }, r, fade: 1, hide };
}

/** A flat wing half a head radius to the unit, its membrane laid in the membrane's own colour. */
export function wing(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): WingSkin {
  const u = r * 0.5;
  const at = (qx: number, qy: number) => ({ x: x + qx * u, y: y + qy * u });
  const bones = [
    [0, 0],
    [0.7, -0.75],
    [1.45, -1.05],
    [2.1, -0.05],
    [1.55, 0.6],
    [0.8, 0.8],
    [0.15, 1.15],
  ].map(([qx, qy]) => at(qx ?? 0, qy ?? 0));
  const membrane = new Path2D();
  for (const p of bones) membrane.lineTo(p.x, p.y);
  membrane.closePath();
  ctx.fillStyle = PALETTE.sheenDeep;
  ctx.fill(membrane);
  return {
    membrane,
    frame: [at(0, 0), at(1, 0), at(0, 1)],
    root: at(0.15, 1.15),
    wrist: at(1.45, -1.05),
    tips: [at(2.1, -0.05), at(1.55, 0.6), at(0.8, 0.8)],
    unit: u,
    fade: 1,
    lit: 1,
    sheen: 0.6,
  };
}

/** A split a head radius and a half long down a tilted back, gaping as the bare pose opens it. */
export function split(x: number, y: number, r: number): PaleSkin {
  const back = Array.from({ length: 13 }, (_, i) => {
    const u = i / 12 - 0.5;
    return { x: x + u * r * 1.5, y: y - r * 0.3 + u * r * 0.25 - Math.cos(u * Math.PI) * r * 0.08 };
  });
  const pale = new Path2D();
  for (const p of back) pale.lineTo(p.x, p.y);
  for (let i = back.length - 1; i >= 0; i--) {
    const p = back[i] ?? { x, y };
    pale.lineTo(p.x, p.y + Math.sin((Math.PI * i) / 12) ** 0.6 * r * 0.6);
  }
  pale.closePath();
  return { pale, back, crest: back[6] ?? { x, y }, r, fade: 1, breath: 1 };
}
