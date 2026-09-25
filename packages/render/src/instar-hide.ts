import { KEY } from "@neon-spore/content";
import { rgba } from "./hex.js";
import type { Point } from "./instar-shape.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE INSTAR's hide is made of**, over the dark plate `drawPlate` lays
 * down: flesh with a violet body in it, rounded — the cool shadow gathering
 * toward the rim on every side — a wet shoulder where the plate faces the key,
 * and a cool line of light bounced back along the rim turned away from it.
 * Then what grows on it: rows of overlapping scales, and slime that hangs off
 * a lip and swells at its end.
 *
 * The owner, 25 September 2026: *first i want you to enhance graphics* — the
 * standing brief of `new-boss-more` §6.3, a made thing rather than an outline.
 * The recipe is THE BULB QUEEN's carapace (`queen-carapace.ts`): rounding,
 * specular, bounce, composed in that order. **The fifth zone, the contact
 * shadow, is left out**: the plates of this body overlap one another all the
 * way down, and a dark band at every plate's lit edge would draw the seams the
 * seams already draw.
 *
 * A **`Form`** is the plate's centre and its reach in pixels — what a Path2D
 * cannot say about itself — so every gradient is sized to its own plate.
 * Colours go in plain at the fade with the strength in the alpha, the way
 * every drawer of this body does, so the frame tests keep counting the hide.
 */

/** A plate's centre and its half-length, in pixels; `ry` is its half-width
 * across (`r` when round) and `angle` the way its length runs. */
export interface Form {
  x: number;
  y: number;
  r: number;
  ry?: number;
  angle?: number;
}

const SHADOW = "#0B1024";
/** The cool the far rim bounces back, as THE BULB QUEEN's does. */
const BOUNCE = "#9FB4E8";
const SHEEN = "#F4F1EA";

/**
 * The light over one plate, clipped to it. The rounding and the shoulder are
 * painted in the plate's own frame — turned by `angle`, squashed to `ry` — so
 * a long body is lit as a long body and not as a ball the size of it.
 */
export function lightHide(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  form: Form,
  fade: number,
): void {
  const { x, y, r } = form;
  const ry = form.ry ?? r;
  if (r < 1 || ry < 1 || fade <= 0) return;
  ctx.save();
  ctx.clip(p);
  // Light coming back off the dark along the far rim: a stroke inside the
  // clip, so only its inner half shows. First, in the picture's own frame,
  // because the path is.
  const g = ctx.createLinearGradient(x + KEY.x * r, y + KEY.y * ry, x - KEY.x * r, y - KEY.y * ry);
  g.addColorStop(0, rgba(BOUNCE, 0));
  g.addColorStop(0.6, rgba(BOUNCE, 0));
  g.addColorStop(1, rgba(BOUNCE, 0.35 * fade));
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = g;
  ctx.lineWidth = ry * 0.3;
  ctx.stroke(p);
  ctx.globalCompositeOperation = "source-over";
  ctx.translate(x, y);
  ctx.rotate(form.angle ?? 0);
  ctx.scale(1, ry / r);
  // The flesh under the hide: violet, lit from the key's side, the cool
  // shadow gathering toward the rim.
  const body = ctx.createRadialGradient(KEY.x * r * 0.4, KEY.y * r * 0.45, r * 0.05, 0, 0, r * 1.1);
  body.addColorStop(0, rgba(PALETTE.sheenMid, 0.34 * fade));
  body.addColorStop(0.35, rgba(PALETTE.hull, 0.2 * fade));
  body.addColorStop(0.7, rgba(PALETTE.sheenCold, 0.08 * fade));
  body.addColorStop(1, rgba(SHADOW, 0.55 * fade));
  ctx.fillStyle = body;
  ctx.fillRect(-r * 1.3, -r * 1.3, r * 2.6, r * 2.6);
  // The wet shoulder where the plate faces the key.
  const sx = KEY.x * r * 0.42;
  const sy = KEY.y * r * 0.5;
  const spec = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 0.45);
  spec.addColorStop(0, rgba(SHEEN, 0.3 * fade));
  spec.addColorStop(0.45, rgba(SHEEN, 0.07 * fade));
  spec.addColorStop(1, rgba(SHEEN, 0));
  ctx.fillStyle = spec;
  ctx.fillRect(sx - r * 0.5, sy - r * 0.5, r, r);
  ctx.restore();
}

/**
 * Rows of scales over a plate: small arcs, each row half a scale along from
 * the last so no two sit one under the other, the row nearest the key the
 * lightest. Laid in the box `form` spans, turned by its `angle` so they run
 * along the body rather than across the screen, and clipped to the plate.
 */
export function drawScales(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  form: Form,
  size: number,
  fade: number,
): void {
  const ry = form.ry ?? form.r;
  if (size < 2 || fade <= 0) return;
  ctx.save();
  ctx.clip(p);
  ctx.translate(form.x, form.y);
  ctx.rotate(form.angle ?? 0);
  ctx.lineWidth = Math.max(0.6, size * 0.14);
  const rows = Math.min(14, Math.ceil((ry * 2) / (size * 0.8)));
  const cols = Math.min(24, Math.ceil((form.r * 2) / size) + 1);
  for (let j = 0; j < rows; j++) {
    const v = -ry + (j + 0.5) * size * 0.8;
    const lit = Math.max(0, 1 - (j / Math.max(1, rows - 1)) * 1.4);
    ctx.strokeStyle = rgba(PALETTE.hullRim, (0.06 + 0.16 * lit) * fade);
    ctx.beginPath();
    for (let i = 0; i < cols; i++) {
      const u = -form.r + (i + (j % 2) * 0.5) * size;
      ctx.moveTo(u - size * 0.5, v);
      ctx.quadraticCurveTo(u, v + size * 0.7, u + size * 0.5, v);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * A string of slime hanging from `from`: it stretches and gives back on its
 * own slow clock, thins as it goes and swells into a drop at the end, with a
 * point of light on the drop. `seed` keeps two drips from moving in step.
 */
export function drawDrip(
  ctx: CanvasRenderingContext2D,
  from: Point,
  len: number,
  width: number,
  time: number,
  seed: number,
  fade: number,
  hex: string = PALETTE.venom,
): void {
  if (fade <= 0 || len < 2) return;
  const stretch = 0.7 + 0.3 * Math.sin(time * 1.3 + seed * 2.1);
  const end = { x: from.x + Math.sin(time * 0.9 + seed) * width * 0.4, y: from.y + len * stretch };
  const drop = width * (0.7 + 0.25 * stretch);
  ctx.save();
  ctx.fillStyle = rgba(hex, 0.55 * fade);
  ctx.beginPath();
  ctx.moveTo(from.x - width, from.y);
  ctx.quadraticCurveTo(from.x - width * 0.2, (from.y + end.y) / 2, end.x - drop * 0.6, end.y);
  ctx.arc(end.x, end.y, drop, Math.PI, 0, true);
  ctx.quadraticCurveTo(from.x + width * 0.2, (from.y + end.y) / 2, from.x + width, from.y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rgba(SHEEN, 0.7 * fade);
  ctx.beginPath();
  ctx.arc(end.x + KEY.x * drop * 0.35, end.y + KEY.y * drop * 0.35, drop * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A point of wet light: the glint on an eye, a tooth, a drop. */
export function drawGlint(
  ctx: CanvasRenderingContext2D,
  at: Point,
  size: number,
  fade: number,
  alpha = 0.85,
): void {
  if (fade <= 0 || size <= 0) return;
  ctx.save();
  ctx.fillStyle = rgba(SHEEN, alpha * fade);
  ctx.beginPath();
  ctx.arc(at.x + KEY.x * size, at.y + KEY.y * size, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
