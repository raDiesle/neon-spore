import { type Face, LIT, type Pt, SHADOW, shaded } from "./carom-facet.js";
import type { CrustDraw } from "./carom-look.js";
import { mixHex, rgba } from "./hex.js";
import { STROKE } from "./palette.js";

/**
 * The markings a rescue capsule wears, each drawn on the faces of
 * `carom-facet.ts` inside its turned frame — the nose on +x.
 *
 * Four of them, all four asked for by the owner on 10 September 2026, and
 * every capsule offered on the slot wears all four; what differs between the
 * candidates is where and how much. So each is a function of a face or a
 * point rather than of the whole shell, and a look composes them.
 *
 * - **Seams and rivets.** The seams are the face edges `drawFacets` already
 *   strokes; a rivet is a dot with a lit crown and a shadowed foot, in the
 *   plate's own greys — nothing here puts a new colour on the field.
 * - **Chevrons.** The rescue stripe: a band of white and a band of near-black,
 *   shaded by the face they sit on so they turn through the light with it.
 * - **Beacon.** One small light in the body's own colour — the porthole's, so
 *   no new colour — flashing on the beat (`beaconPulse`).
 * - **Scorch.** The shield: the face that goes first, blackened and warmed by
 *   the ember the record already carries, with the lip that meets the field
 *   burning along its edge.
 */

export const CHEVRON_LIGHT = "#F2F4F8";
export const CHEVRON_DARK = "#20242F";
const SCORCH = "#2A1E1B";

/** How much of the shield a face is: the nose whole, its two shoulders half,
 * the rest none — so the scorch has a soft edge rather than a seam. */
export function shieldShare(f: Face, sides: number): number {
  if (f.i === 0) return 1;
  if (f.i === 1 || f.i === sides - 1) return 0.5;
  return 0;
}

/** A plate colour scorched by `k`: darkened toward soot and warmed by the
 * ember, so a heated shield reads as burnt metal and not as a dark face. */
export function scorched(base: string, ember: string, k: number): string {
  if (k <= 0) return base;
  return mixHex(mixHex(base, SCORCH, 0.82 * k), ember, 0.12 * k);
}

/** A chevron band's colour on a face lit `lit`. */
export function chevron(light: boolean, lit: number): string {
  return shaded(light ? CHEVRON_LIGHT : CHEVRON_DARK, lit);
}

/** One rivet at `p`, sized to the rock. */
export function rivet(ctx: CanvasRenderingContext2D, p: Pt, r: number, lit: number): void {
  const s = Math.max(0.8, r * 0.055);
  ctx.beginPath();
  ctx.arc(p.x + s * 0.3, p.y + s * 0.3, s, 0, Math.PI * 2);
  ctx.fillStyle = rgba(SHADOW, 0.7);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
  ctx.fillStyle = mixHex(SHADOW, LIT, 0.45 + 0.5 * lit);
  ctx.fill();
}

/** The beacon at `p`: a disc of the body's rim colour over a halo of its
 * glow, both sized by `pulse` — brightest on the beat. */
export function beacon(
  ctx: CanvasRenderingContext2D,
  p: Pt,
  r: number,
  d: CrustDraw,
  pulse: number,
  size = 0.11,
): void {
  const s = Math.max(1, r * size);
  const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * (2 + 2 * pulse));
  halo.addColorStop(0, rgba(d.glow, 0.55 * pulse));
  halo.addColorStop(1, rgba(d.glow, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(p.x, p.y, s * (2 + 2 * pulse), 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
  ctx.fillStyle = mixHex(d.glow, d.rim, pulse);
  ctx.fill();
  ctx.lineWidth = STROKE.inner * 0.6;
  ctx.strokeStyle = rgba(SHADOW, 0.6);
  ctx.stroke();
}

/** The shield's lip: the silhouette edge of a face stroked in ember, `k`
 * strong — the part of the crust that is meeting whatever it flies through. */
export function emberLip(ctx: CanvasRenderingContext2D, f: Face, ember: string, k: number): void {
  if (k <= 0) return;
  ctx.beginPath();
  ctx.moveTo(f.rimA.x, f.rimA.y);
  ctx.lineTo(f.rimB.x, f.rimB.y);
  ctx.strokeStyle = rgba(ember, 0.7 * k);
  ctx.lineWidth = STROKE.outline * 0.8;
  ctx.lineCap = "round";
  ctx.stroke();
}
