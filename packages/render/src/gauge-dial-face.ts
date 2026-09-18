import { KEY } from "@neon-spore/content";
import type { Dial } from "./gauge.js";
import { BOLT, bolt } from "./gauge-plate.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * What is **mounted in** THE GAUGE's face plate: the cover glass, the lathed
 * bezel that holds it down, and the boss the needle turns on. The plate itself
 * is next door (`gauge-plate.ts`), which has the argument for both files and
 * the bolt head they share.
 *
 * All three are drawn against `Dial` alone and move nothing: the glass is the
 * rim's own circle, the bezel stands outside it, the boss sits on the pivot.
 * The light is `KEY`, the same one the plate's sheen is on — the bezel's
 * shoulder, the chamfer's bright arc and the glass's film are all on that
 * side, and the glass's shadow is under the lip the light comes over, where a
 * cover sunk into a plate casts one.
 */

/** How far the bezel stands outside the rim, as a share of the radius. Smaller
 * than the plate's own overhang, or the ring would hang off its own plate. */
export const BEZEL = 0.055;
/** Bolt heads along the bezel, across the half circle. */
const BEZEL_BOLTS = 9;
/** The gloss on the glass: where it sits along the key, and how far it reaches. */
const GLOSS_AT = 0.4;
const GLOSS_REACH = 0.85;
const GLOSS = 0.1;

/**
 * The cover glass, sunk into the plate: the face darker than the plate around
 * it, a shadow under the lip the light comes over, and a film of gloss on the
 * side the light is. Drawn **before** the band and the notches, so no stroke
 * of the dial is washed by it.
 */
export function drawGaugeGlass(ctx: CanvasRenderingContext2D, dial: Dial): void {
  const { cx, cy, r } = dial;
  const face = new Path2D();
  face.arc(cx, cy, r, Math.PI, Math.PI * 2);
  face.closePath();

  ctx.save();
  ctx.fillStyle = rgba(PALETTE.background, 0.62);
  ctx.fill(face);
  ctx.clip(face);
  // Under the near lip: a cover set below the plate's surface is in shadow
  // where the light comes over the edge, and nowhere else.
  ctx.strokeStyle = rgba(PALETTE.background, 0.85);
  ctx.lineWidth = r * 0.1;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.97, Math.PI, Math.PI * 2);
  ctx.stroke();
  // And the film on it, off-centre toward the light.
  const gx = cx + KEY.x * r * GLOSS_AT;
  const gy = cy + KEY.y * r * GLOSS_AT;
  const gloss = ctx.createRadialGradient(gx, gy, 0, gx, gy, r * GLOSS_REACH);
  gloss.addColorStop(0, rgba(PALETTE.text, GLOSS));
  gloss.addColorStop(0.55, rgba(PALETTE.text, GLOSS * 0.3));
  gloss.addColorStop(1, rgba(PALETTE.text, 0));
  ctx.fillStyle = gloss;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

/**
 * The bezel: a lathed half-ring outside the rim holding the glass down, with a
 * shoulder on the light's side and shadow on the other — the one thing that
 * makes a ring read as turned metal rather than as a thicker line — and the
 * bolts that hold it, each a dark head with the key's highlight on it.
 *
 * Drawn **after** the notches, because a bezel sits over the glass and the
 * scale is printed under it.
 */
export function drawGaugeBezel(ctx: CanvasRenderingContext2D, dial: Dial): void {
  const { cx, cy, r } = dial;
  const out = r * (1 + BEZEL);

  ctx.save();
  const band = ctx.createLinearGradient(
    cx + KEY.x * out,
    cy + KEY.y * out,
    cx - KEY.x * out,
    cy - KEY.y * out,
  );
  band.addColorStop(0, rgba(PALETTE.hullRim, 0.5));
  band.addColorStop(0.45, rgba(PALETTE.hull, 0.3));
  band.addColorStop(1, rgba(PALETTE.grid, 0.92));
  ctx.fillStyle = band;
  ctx.beginPath();
  ctx.arc(cx, cy, out, Math.PI, Math.PI * 2);
  ctx.arc(cx, cy, r, Math.PI * 2, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.28);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, out, Math.PI, Math.PI * 2);
  ctx.stroke();

  const at = r * (1 + BEZEL / 2);
  const head = r * BOLT * 0.7;
  for (let i = 0; i < BEZEL_BOLTS; i++) {
    const a = Math.PI + (Math.PI * (i + 0.5)) / BEZEL_BOLTS;
    bolt(ctx, cx + Math.cos(a) * at, cy + Math.sin(a) * at, head);
  }
  ctx.restore();
}

/**
 * The boss the needle turns on: a collar, a chamfer catching the light on the
 * key's side, and a dark pin in the middle. It replaces the plain filled
 * circle the round shipped with, and it is the mark that says the needle is
 * *mounted* rather than drawn from a point.
 */
export function drawGaugeHub(ctx: CanvasRenderingContext2D, dial: Dial): void {
  const { cx, cy } = dial;
  const r = Math.max(1, dial.r * 0.09);
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.hull, 0.95);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // The chamfer: a bright arc on the light's side, a dark one opposite it.
  const lit = Math.atan2(KEY.y, KEY.x);
  ctx.lineWidth = Math.max(1, r * 0.28);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.8);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.84, lit - 0.6 * Math.PI, lit + 0.6 * Math.PI);
  ctx.stroke();
  ctx.strokeStyle = rgba(PALETTE.background, 0.7);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.84, lit + 0.55 * Math.PI, lit + 1.45 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = rgba(PALETTE.background, 0.9);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
