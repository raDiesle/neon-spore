import { blobPath, openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { SheenPass } from "../../../../../packages/render/src/hull-sheen.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { dither } from "../../../../../packages/render/src/sheen.js";

/**
 * PLASM's skin and chamber: the ship is a **single cell**.
 *
 * Nothing on it is a surface feature. The membrane is a double line with a
 * soft lit band under it — a wall you can see through — and everything that
 * says *alive* is behind it: a nucleus with its own membrane and a nucleolus,
 * mitochondria drifting on slow courses, a haze of granules. The chamber is
 * the same cytoplasm further in: vacuoles as lenses of fluid, and the cortex's
 * own streaming drawn as faint flow lines between them.
 *
 * Chosen by the owner from four concept cards on 10 September 2026 and taken
 * further here: the concept was a thin flat band with blobs in it, and what it
 * needed was **body** — a contour that bulges, a membrane with thickness, and
 * organelles with an inside.
 */

const MITOCHONDRIA = 6;
const GRANULES = 60;

/**
 * The membrane. The outer contour is the ship's own rim; under it a broad soft
 * band of light is the wall's thickness seen edge-on, and a thin second line
 * a little further in is the wall's inner face. Between the two the cell is
 * brighter than anywhere else — which is what a translucent wall does to the
 * light coming through it.
 */
function membrane(s: SheenPass): void {
  const { ctx, l, body, skin } = s;
  strokeGlow(ctx, body, skin.body[0], l.tile * 0.4, 0.34);
  ctx.save();
  ctx.translate(0, l.tile * 0.2);
  ctx.strokeStyle = rgba(skin.edge, 0.3);
  ctx.lineWidth = Math.max(0.8, l.tile * 0.035);
  ctx.stroke(body);
  ctx.restore();
}

/** A mitochondrion: an elongated body with cristae drawn across it. */
function mitochondrion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  wide: number,
  tilt: number,
  seed: number,
  skin: SheenPass["skin"],
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  const outer = new Path2D(blobPath(0, 0, len, wide, 3, 0.06, 0.04, 0, seed, 22));
  ctx.fillStyle = rgba(skin.body[1], 0.7);
  ctx.fill(outer);
  ctx.strokeStyle = rgba(skin.body[0], 0.45);
  ctx.lineWidth = Math.max(0.6, wide * 0.08);
  ctx.stroke(outer);
  // The cristae: folds across the inside, none of them straight or evenly
  // spaced, which is what says organ and not capsule.
  let d = "";
  const folds = 4 + Math.floor(hash01(seed + 2) * 3);
  for (let k = 0; k < folds; k++) {
    const u = -0.72 + (1.44 * (k + 0.5)) / folds + (hash01(seed + k * 3) - 0.5) * 0.12;
    const cx = u * len;
    const reach = wide * (0.5 + hash01(seed + k * 5) * 0.35) * (k % 2 === 0 ? 1 : -1);
    d += `M ${cx.toFixed(2)} ${(-reach * 0.1).toFixed(2)} Q ${(cx + wide * 0.25).toFixed(2)} ${(
      reach * 0.5
    ).toFixed(2)}, ${(cx - wide * 0.1).toFixed(2)} ${reach.toFixed(2)} `;
  }
  ctx.strokeStyle = rgba(skin.edge, 0.32);
  ctx.lineWidth = Math.max(0.5, wide * 0.06);
  ctx.stroke(new Path2D(d));
  ctx.restore();
}

function mitochondria(s: SheenPass): void {
  const { ctx, l, time, skinY, skin } = s;
  for (let i = 0; i < MITOCHONDRIA; i++) {
    const u = (0.06 + i * 0.16 + time * (0.005 + i * 0.0015)) % 1;
    const x = l.gridLeft + u * l.gridWidth;
    const sink = 0.5 + 0.5 * Math.sin(time * 0.25 + i * 1.9);
    const y = skinY(x) + l.tile * (0.5 + 0.55 * sink);
    const len = l.tile * (0.42 + hash01(i * 7 + 1) * 0.3);
    const tilt = Math.sin(time * 0.12 + i) * 0.6 + (hash01(i * 9 + 4) - 0.5) * 1.2;
    mitochondrion(ctx, x, y, len, len * 0.42, tilt, i * 11 + 3, skin);
  }
}

/** The nucleus: a large dim body with a membrane of its own and a nucleolus,
 * drifting across the width over a minute. */
function nucleus(s: SheenPass): void {
  const { ctx, l, time, skinY, skin } = s;
  const x = l.gridLeft + l.gridWidth * (0.5 + 0.3 * Math.sin(time * 0.045));
  const y = skinY(x) + l.tile * 1.1;
  const r = l.tile * 0.62;
  const shape = new Path2D(blobPath(x, y, r * 1.25, r * 0.78, 3, 0.05, 0.03, time * 0.08, 5, 28));
  const inner = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.25);
  inner.addColorStop(0, rgba(skin.body[2], 0.55));
  inner.addColorStop(1, rgba(skin.body[1], 0.35));
  ctx.fillStyle = inner;
  ctx.fill(shape);
  ctx.strokeStyle = rgba(skin.body[0], 0.5);
  ctx.lineWidth = Math.max(0.8, l.tile * 0.03);
  ctx.stroke(shape);
  ctx.save();
  ctx.translate(0, r * 0.1);
  ctx.strokeStyle = rgba(skin.body[0], 0.16);
  ctx.stroke(shape);
  ctx.restore();
  // The nucleolus, and the one wet highlight on it.
  ctx.fillStyle = rgba(skin.body[0], 0.3);
  ctx.fill(
    new Path2D(blobPath(x - r * 0.25, y - r * 0.1, r * 0.3, r * 0.26, 3, 0.1, 0.04, 0, 9, 16)),
  );
  halo(ctx, x - r * 0.4, y - r * 0.3, r * 0.35, skin.edge, 0.2);
}

/** Granules: a haze of tiny bodies through the cytoplasm, each drifting on
 * its own course, which is what makes the fluid read as fluid. */
function granules(s: SheenPass): void {
  const { ctx, l, time, skinY, skin } = s;
  ctx.fillStyle = rgba(skin.body[0], 0.28);
  for (let i = 0; i < GRANULES; i++) {
    const x =
      l.gridLeft +
      l.gridWidth * ((hash01(i * 13 + 5) + time * 0.004 * (0.5 + hash01(i * 3 + 1))) % 1);
    const y = skinY(x) + l.tile * (0.25 + hash01(i * 17 + 9) * 1.2) + Math.sin(time * 0.5 + i) * 2;
    const r = l.tile * (0.012 + hash01(i * 19 + 7) * 0.02);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function cytoplasm(s: SheenPass): void {
  granules(s);
  nucleus(s);
  mitochondria(s);
  membrane(s);
  dither(s.ctx, s.filled);
}

/** The chamber: the same cytoplasm deeper in — vacuoles as lenses of fluid,
 * and the streaming between them drawn as faint flow lines. */
export function vacuoles(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  const base = g.createLinearGradient(0, 0, 0, h);
  skin.ground.forEach((c, i) => {
    base.addColorStop(i / 3, c);
  });
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  // The streaming: long faint curves running down and round, the cortex's own
  // flow, so the fluid has a direction before anything floats in it.
  let flow = "";
  for (let i = 0; i < 14; i++) {
    const x0 = w * (hash01(i * 23 + 1) * 1.2 - 0.1);
    const pts: Point[] = [];
    for (let k = 0; k <= 8; k++) {
      const p = k / 8;
      pts.push({ x: x0 + Math.sin(p * 3.2 + i * 1.1) * w * 0.08, y: -h * 0.05 + h * 1.1 * p });
    }
    flow += openSmoothPath(pts);
  }
  g.lineCap = "round";
  g.strokeStyle = rgba(skin.flesh[1], 0.12);
  g.lineWidth = Math.max(1, w / 260);
  g.stroke(new Path2D(flow));
  const count = Math.round(Math.min(26, (w * h) / 16000));
  for (let i = 0; i < count; i++) {
    const x = hash01(i * 7 + 11) * w;
    const y = hash01(i * 13 + 29) ** 0.8 * h;
    const r = (0.05 + hash01(i * 19 + 3) * 0.11) * w;
    const lens = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    lens.addColorStop(0, rgba(skin.flesh[0], 0.05));
    lens.addColorStop(0.75, rgba(skin.flesh[1], 0.08));
    lens.addColorStop(1, rgba(skin.flesh[0], 0.28));
    g.fillStyle = lens;
    const shape = new Path2D(blobPath(x, y, r, r * 0.92, 4, 0.1, 0.06, 0, i * 3 + 1, 20));
    g.fill(shape);
    g.strokeStyle = rgba(skin.rim, 0.1);
    g.lineWidth = Math.max(0.6, w / 700);
    g.stroke(shape);
  }
  const floor = skin.ground[3];
  const v = g.createLinearGradient(0, h * 0.5, 0, h);
  v.addColorStop(0, rgba(floor, 0));
  v.addColorStop(1, rgba(floor, 0.7));
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);
}
