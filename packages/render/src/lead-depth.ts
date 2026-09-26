import { rgba } from "./hex.js";
import type { Ridge } from "./lead-rock.js";
import { PALETTE } from "./palette.js";
import { drawContact } from "./solid-haze.js";

/**
 * **THE LEAD in depth**: the ridge is not a grey band laid across the top of
 * the field but a ledge seen a little from above — a flat top going back from
 * the eye, hazed where it is furthest and caught by the light along the edge
 * nearest, then a crease where the top turns down into the face — and its two
 * ends go away into the dark at the sides of the screen.
 *
 * **The mound sits on that top**, in a soft cool dark on the rock round its
 * foot, and the stalk is a cord with a back: a shade down the side turned
 * from the key, a dark where it goes into the underside of each bead, and a
 * cool rim on each bead's edge away from the light.
 *
 * **Nothing it says moves or grows.** The foot, the tip and every bead are
 * where `lead-shape.ts` puts them, the angle is the pilot's readout, and how
 * many beads there are and how big is the health bar — depth is only light
 * laid on things in place.
 *
 * Nothing here keeps state, and a fade is in every colour.
 */

/** How deep the ledge's top plane runs, as a share of the ridge's depth. */
const PLANE = 0.3;
/** How far in from each side of the screen the ends are hazed, as a share of the ridge's width. */
const ENDS = 0.22;
const END_HAZE = 0.35;
/** How flat the mound's shade lies on the plane, height over width. */
const FLAT = 0.35;

/** The ledge over the ridge's paint (`paintRidge`): its top plane, its crease, its ends going away. */
export function paintLedge(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  r: Ridge,
  fade: number,
): void {
  const { left, right, top, bottom, tile } = r;
  const crease = top + (bottom - top) * PLANE;
  ctx.save();
  ctx.clip(body);
  // The top plane: its back edge hazed toward the field, its front edge lit.
  const plane = ctx.createLinearGradient(0, top, 0, crease);
  plane.addColorStop(0, rgba(PALETTE.background, 0.3 * fade));
  plane.addColorStop(0.55, rgba(PALETTE.sheenRim, 0.04 * fade));
  plane.addColorStop(1, rgba(PALETTE.sheenRim, 0.24 * fade));
  ctx.fillStyle = plane;
  ctx.fillRect(left - tile, top, right - left + tile * 2, crease - top);
  // The crease, where the top turns down into the face.
  ctx.fillStyle = rgba(PALETTE.sheenDeep, 0.75 * fade);
  ctx.fillRect(left - tile, crease, right - left + tile * 2, Math.max(1, tile * 0.035));
  // The ends, going away into the dark at the sides.
  const w = right - left;
  const ends = ctx.createLinearGradient(left, 0, right, 0);
  ends.addColorStop(0, rgba(PALETTE.background, END_HAZE * fade));
  ends.addColorStop(ENDS, rgba(PALETTE.background, 0));
  ends.addColorStop(1 - ENDS, rgba(PALETTE.background, 0));
  ends.addColorStop(1, rgba(PALETTE.background, END_HAZE * fade));
  ctx.fillStyle = ends;
  ctx.fillRect(left - tile, top - tile, w + tile * 2, bottom - top + tile * 2);
  ctx.restore();
}

/** Where the mound sits on the ledge: a soft cool dark on the rock round its foot. */
export function moundContact(
  ctx: CanvasRenderingContext2D,
  ridge: Path2D,
  x: number,
  y: number,
  rx: number,
  fade: number,
): void {
  const r = rx * 1.35;
  ctx.save();
  ctx.clip(ridge);
  // Squashed flat onto the plane: an ellipse of shade and never a disc.
  ctx.translate(x, y);
  ctx.scale(1, FLAT);
  const round = new Path2D();
  round.rect(-r, -r, r * 2, r * 2);
  drawContact(ctx, round, 0, 0, r, 0.85 * fade);
  ctx.restore();
}

/** The stem's own outline, `w` wide from `a` to `b`, for what is laid on it. */
export function stemHide(
  a: { x: number; y: number },
  b: { x: number; y: number },
  w: number,
): Path2D {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const n = Math.hypot(dx, dy) || 1;
  const nx = (-dy / n) * w * 0.5;
  const ny = (dx / n) * w * 0.5;
  const p = new Path2D();
  p.moveTo(a.x + nx, a.y + ny);
  p.lineTo(b.x + nx, b.y + ny);
  p.lineTo(b.x - nx, b.y - ny);
  p.lineTo(a.x - nx, a.y - ny);
  p.closePath();
  return p;
}

/** A bead's rim: the cool light caught on its edge turned from the key, low and to the right. */
export function beadRim(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  a: number,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rgba(PALETTE.sheenCold, 0.4 * a);
  ctx.lineWidth = Math.max(0.8, r * 0.16);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.9, -0.1 * Math.PI, 0.55 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

/** The mound's rim: the cool light caught down its flank turned from the key. */
export function moundRim(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  tile: number,
  fade: number,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rgba(PALETTE.sheenCold, 0.35 * fade);
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.95, ry * 0.92, 0, -0.4 * Math.PI, -0.04 * Math.PI);
  ctx.stroke();
  ctx.restore();
}
