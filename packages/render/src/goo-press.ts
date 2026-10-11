import { KEY, type Point } from "@neon-spore/content";
import { centre, type GooBody } from "./goo-body.js";
import { mix } from "./goo-noise.js";
import type { GooStyle } from "./goo-style.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **A thumb pressed into a soft drop** — the owner, 11 October 2026: *it looks
 * 3d soft and when touched it looks like the mass is pushed while pulling in
 * the middle of it — maybe like a slime or a sponge or some other variants
 * (like soft plastic)*. What the soft drops (`soft-*.ts`) share: the drop
 * flattened and widened by the press, the dent in its middle — a hollow
 * whose wall nearer the light is in shadow and whose far wall is lit, inside
 * a lip lit the other way round — and the mass the pull shoves ahead piling
 * up into a lit bow. Each material says how it gives (`Give`).
 */

/** A thumb in a drop: how deep, 0 untouched to 1 all the way in, and the way it is
 * pulled, a unit vector or zero. */
export interface Press {
  readonly depth: number;
  readonly way: Point;
}

export const UNPRESSED: Press = { depth: 0, way: { x: 0, y: 0 } };

/** How a material takes a thumb. */
export interface Give {
  /** How much wider than a thumb the dent spreads, and how deep it reads, 0..1. */
  readonly spread: number;
  readonly deep: number;
  /** How far a full press flattens and widens the whole drop, and how far it sags
   * under its own weight untouched. */
  readonly flatten: number;
  readonly sag: number;
  /** How sharply the lip and the bow catch the light: 0 matte, 1 glossy. */
  readonly gloss: number;
}

/** The drop as its weight and the press leave it: lower and wider, mass pushed out from
 * the middle. */
export function pressed(b: GooBody, p: Press, give: Give): GooBody {
  const by = give.sag + give.flatten * p.depth;
  if (by <= 0) return b;
  return { ...b, squash: (b.squash ?? 1) * (1 + by) };
}

/** The colours a drop is lit with, washed towards a refusal's red or a count's green. */
export interface Tones {
  readonly neon: string;
  readonly alpha: number;
  tone(c: string): string;
}

export function tonesOf(
  style: GooStyle,
  tint: { red: number; green?: number; alpha?: number },
): Tones {
  const green = tint.green ?? 0;
  return {
    neon: mix(mix(style.neon, PALETTE.red, tint.red), PALETTE.good, green),
    alpha: tint.alpha ?? 1,
    tone: (c) => mix(mix(c, PALETTE.red, tint.red * 0.7), PALETTE.good, green * 0.7),
  };
}

/** Where the dent is and how big: in the middle of the drawn drop, a little behind it
 * as the pull drags the mass ahead. */
export interface Dent {
  readonly at: Point;
  readonly r: number;
  readonly depth: number;
}

export function dentOf(b: GooBody, p: Press, give: Give): Dent {
  const c = centre(b);
  const back = b.r * 0.12 * p.depth;
  return {
    at: { x: c.x - p.way.x * back, y: c.y - p.way.y * back },
    r: b.r * (0.3 + 0.28 * p.depth) * give.spread,
    depth: p.depth * give.deep,
  };
}

/** A shadow is this blue-black, never black (`.claude/skills/depth`). */
export const SHADE = "#0B1024";

/** The hollow and its lip, clipped to the drop by the caller. */
export function paintDent(
  ctx: CanvasRenderingContext2D,
  d: Dent,
  style: GooStyle,
  t: Tones,
  gloss: number,
): void {
  const k = d.depth * t.alpha;
  if (k < 0.02) return;
  const { at, r } = d;
  const lit = t.tone(mix(style.core, "#FFFFFF", 0.3 + 0.3 * gloss));
  ctx.save();
  // The lip round it stands up: lit on the side towards the light, shaded away from it.
  const lip = ctx.createLinearGradient(
    at.x + KEY.x * r * 1.5,
    at.y + KEY.y * r * 1.5,
    at.x - KEY.x * r * 1.5,
    at.y - KEY.y * r * 1.5,
  );
  lip.addColorStop(0, rgba(lit, 0.8 * k));
  lip.addColorStop(0.5, rgba(lit, 0));
  lip.addColorStop(1, rgba(SHADE, 0.65 * k));
  ctx.strokeStyle = lip;
  for (const [w, a] of [
    [0.55, 0.5],
    [0.3, 0.8],
    [0.12 + 0.1 * (1 - gloss), 1],
  ] as const) {
    ctx.globalAlpha = a;
    ctx.lineWidth = r * w;
    ctx.beginPath();
    ctx.ellipse(at.x, at.y, r * 1.12, r * 1.04, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // The hollow: its wall nearer the light faces away from it, the far wall faces it.
  const hollow = ctx.createLinearGradient(
    at.x + KEY.x * r,
    at.y + KEY.y * r,
    at.x - KEY.x * r,
    at.y - KEY.y * r,
  );
  hollow.addColorStop(0, rgba(SHADE, 0.85 * k));
  hollow.addColorStop(0.5, rgba(SHADE, 0.4 * k));
  hollow.addColorStop(0.82, rgba(lit, 0.1 * k));
  hollow.addColorStop(1, rgba(lit, (0.35 + 0.4 * gloss) * k));
  ctx.globalAlpha = 1;
  ctx.fillStyle = hollow;
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, r, r * 0.94, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The mass the pull shoves ahead of the thumb, piled into a lit bow across the way. */
export function paintBow(
  ctx: CanvasRenderingContext2D,
  b: GooBody,
  p: Press,
  style: GooStyle,
  t: Tones,
  gloss: number,
): void {
  const len = Math.hypot(p.way.x, p.way.y);
  const k = p.depth * t.alpha;
  if (len < 0.01 || k < 0.02) return;
  const ux = p.way.x / len;
  const uy = p.way.y / len;
  const c = centre(b);
  const q = { x: c.x + ux * b.r * 0.55, y: c.y + uy * b.r * 0.55 };
  // Lit as much as its top faces the light: a bow pushed up the light is brighter.
  const face = 0.6 + 0.4 * Math.max(0, -(ux * KEY.x + uy * KEY.y));
  ctx.save();
  ctx.translate(q.x, q.y);
  ctx.rotate(Math.atan2(uy, ux));
  ctx.scale(0.55, 1);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.r * 0.5);
  g.addColorStop(0, rgba(t.tone(mix(style.core, "#FFFFFF", 0.25 * gloss)), 0.5 * k * face));
  g.addColorStop(1, rgba(t.tone(style.core), 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, b.r * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
