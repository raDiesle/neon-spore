import { drawEye } from "./instar-head-parts.js";
import { drawScales } from "./instar-hide.js";
import type { Point } from "./instar-place.js";
import { faded, type Look } from "./instar-plate.js";
import { FRILL, type Seen3 } from "./instar-quarter-model.js";
import { drawLipTeeth } from "./instar-side-parts.js";
import { drawWeak } from "./instar-weak.js";
import { PALETTE } from "./palette.js";

/**
 * **The small parts of THE INSTAR's head turned to the ship**
 * (`instar-quarter-head.ts` lays them): its teeth, its nostrils, its eyes
 * under the scowl and the frill behind its jaw. Split off the head so the
 * order it is drawn in reads on one page.
 */

/** Teeth along a lip: hanging down from the upper (`dir` 1), standing up off the lower (-1), the fangs at the front. */
export function drawQuarterTeeth(
  ctx: CanvasRenderingContext2D,
  lip: readonly Seen3[],
  at: (p: Point) => Point,
  r: number,
  dir: 1 | -1,
  fade: number,
): void {
  const roots: Point[] = [];
  const lengths: number[] = [];
  for (let i = 0; i < lip.length - 1; i++) {
    const a = lip[i] as Seen3;
    const b = lip[i + 1] as Seen3;
    for (const u of i === 2 || i === 3 ? [0.85] : [0.5]) {
      const z = a.z + (b.z - a.z) * u;
      // The far side's teeth are behind the snout and the gape's dark: only the near ones.
      if (z < -0.05) continue;
      roots.push(at({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }));
      const fang = i === 2 || i === 3 ? 1.9 : 1;
      lengths.push(dir * r * (dir > 0 ? 0.12 : 0.08) * fang);
    }
  }
  drawLipTeeth(ctx, roots, lengths, r * 0.035, fade);
}

export function drawNostril(
  ctx: CanvasRenderingContext2D,
  n: Point,
  face: number,
  r: number,
  fire: number,
  fade: number,
): void {
  const sx = Math.max(0.35, face);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.beginPath();
  ctx.ellipse(n.x, n.y, r * 0.07 * sx, r * 0.035, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = faded(PALETTE.ember, fade, 0.35 + 0.6 * fire);
  ctx.beginPath();
  ctx.ellipse(n.x, n.y, r * 0.035 * sx, r * 0.016, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * An eye foreshortened by how far it faces the ship, `open` of the way, the
 * weak point's glow on it — and the scowl: the upper lid driven down across
 * it toward the snout, and a heavy brow on the lid, lit along its crest.
 */
export function drawQuarterEye(
  ctx: CanvasRenderingContext2D,
  look: Look,
  eye: Point,
  sx: number,
  s: -1 | 1,
  open: number,
): void {
  const { r, time, fade } = look;
  // The lid, in the eye's own frame: low at the inner corner, toward the snout.
  const lid = (x: number) => -0.035 * r - s * 0.24 * x;
  const w = r * 0.32;
  ctx.save();
  ctx.translate(eye.x, eye.y);
  ctx.scale(sx, 1);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-w, lid(-w));
  ctx.lineTo(w, lid(w));
  ctx.lineTo(w, r * 0.3);
  ctx.lineTo(-w, r * 0.3);
  ctx.closePath();
  ctx.clip();
  const p = drawEye(ctx, { x: 0, y: 0 }, r * 1.1, s, open, time, fade);
  if (p) drawWeak(ctx, p, (look.weak?.eye ?? 0) * fade, "eye");
  ctx.restore();
  // The brow: thick over the inner corner, thinning as it sweeps back and up.
  const inner = -s * w * 0.95;
  const outer = s * w * 1.05;
  const brow = new Path2D();
  brow.moveTo(inner, lid(inner) + r * 0.01);
  brow.quadraticCurveTo(0, lid(0) + r * 0.012, outer, lid(outer) - r * 0.02);
  brow.lineTo(outer + s * r * 0.04, lid(outer) - r * 0.07);
  brow.quadraticCurveTo(0, lid(0) - r * 0.09, inner - s * r * 0.02, lid(inner) - r * 0.1);
  brow.closePath();
  // A ridge of bone under the hide: lit along its crest, dark where it overhangs the eye.
  const ridge = ctx.createLinearGradient(0, lid(0) - r * 0.09, 0, lid(0) + r * 0.012);
  ridge.addColorStop(0, faded(PALETTE.hull, fade));
  ridge.addColorStop(0.45, faded(PALETTE.sheenDeep, fade));
  ridge.addColorStop(1, faded(PALETTE.background, fade));
  ctx.fillStyle = ridge;
  ctx.fill(brow);
  drawScales(ctx, brow, { x: 0, y: lid(0) - r * 0.04, r: w, ry: r * 0.06 }, r * 0.07, fade);
  ctx.strokeStyle = faded(PALETTE.background, fade, 0.85);
  ctx.lineWidth = Math.max(1, r * 0.025);
  ctx.beginPath();
  ctx.moveTo(inner, lid(inner) + r * 0.01);
  ctx.quadraticCurveTo(0, lid(0) + r * 0.012, outer, lid(outer) - r * 0.02);
  ctx.stroke();
  ctx.strokeStyle = faded(PALETTE.sheenRim, fade, 0.45);
  ctx.lineWidth = Math.max(1, r * 0.022);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(inner - s * r * 0.01, lid(inner) - r * 0.085);
  ctx.quadraticCurveTo(0, lid(0) - r * 0.08, outer + s * r * 0.03, lid(outer) - r * 0.065);
  ctx.stroke();
  ctx.restore();
}

/** The frill behind the near jaw: bone spines swept back off the cheek, curving. */
export function drawFrill(
  ctx: CanvasRenderingContext2D,
  at: (p: Point) => Point,
  r: number,
  fade: number,
): void {
  ctx.save();
  for (const { root, bend, tip } of FRILL) {
    const a = at(root);
    const c = at(bend);
    const b = at(tip);
    const len = Math.hypot(c.x - a.x, c.y - a.y) || 1;
    const nx = (-(c.y - a.y) / len) * r * 0.055;
    const ny = ((c.x - a.x) / len) * r * 0.055;
    for (const [hex, side] of [
      [PALETTE.rock, -1],
      [PALETTE.rockDark, 1],
    ] as const) {
      ctx.fillStyle = faded(hex, fade, 0.95);
      ctx.beginPath();
      ctx.moveTo(a.x + side * nx, a.y + side * ny);
      ctx.quadraticCurveTo(c.x + side * nx * 0.5, c.y + side * ny * 0.5, b.x, b.y);
      ctx.quadraticCurveTo(c.x, c.y, a.x, a.y);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}
