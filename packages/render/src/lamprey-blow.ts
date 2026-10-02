import { LAMPREY_TEETH, type SimConfig } from "@neon-spore/sim";
import type { Point, StrikeFrame } from "./boss-strike-look.js";
import { fieldX } from "./field-flip.js";
import { rgba } from "./hex.js";
import { MOUTH } from "./lamprey-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE LAMPREY's own blow at the hull** (`boss-strike-look.ts`). The jaw was
 * let go for long enough that the bite went full (`lamprey-step.ts`'s
 * `lampreyFull`), and a sucker does what a sucker does with nobody pinning
 * it: it clamps. Its seven teeth, spread round the mouth bitten flat on the
 * plating, drive in and close to a tight ring at the column, and where each
 * went in a puncture is left, dark and bleeding the hull's red, with flecks of
 * plating thrown up off the bite.
 *
 * The blow leaves from the mouth itself, on the hull over the jaw's column —
 * the eel is already where it strikes, so the reach is the clamp's time and
 * not a distance.
 */

/** How flat the ring lies on the plating, how far it spreads before it clamps, and how tight it closes, in tiles. */
const FLAT = 0.4;
const OPEN = MOUTH;
const SHUT = 0.35;
/** A tooth's length and root, in tiles, and a puncture's size. */
const LONG = 0.3;
const ROOT = 0.12;
const HOLE = 0.09;
/** The flecks thrown up off the bite, and how high, in tiles. */
const FLECKS = 7;
const THROW = 0.9;

/** Where the blow leaves the body: the mouth, flat on the hull over the jaw's column. */
export function lampreyBlowFrom(l: Layout, _cfg: SimConfig, col: number): Point {
  return { x: fieldX(l, col), y: l.hullY };
}

/** Tooth `t`'s angle round the ring, the first at the top. */
const angleOf = (t: number): number => -Math.PI / 2 + (t * Math.PI * 2) / LAMPREY_TEETH;

export function lampreyBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const k = f.reach ** 2;
  ctx.save();
  ctx.translate(from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k);
  const ring = (OPEN + (SHUT - OPEN) * k) * tile;
  if (f.after <= 0) {
    // The teeth closing in, each pointed at the middle.
    for (let t = 0; t < LAMPREY_TEETH; t++) {
      const a = angleOf(t);
      ctx.save();
      ctx.translate(Math.cos(a) * ring, Math.sin(a) * ring * FLAT);
      ctx.rotate(a - Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(-(ROOT * tile) / 2, 0);
      ctx.lineTo(0, LONG * tile);
      ctx.lineTo((ROOT * tile) / 2, 0);
      ctx.closePath();
      ctx.fillStyle = PALETTE.lampreyTooth;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    return;
  }
  // The punctures where the teeth went in, bleeding the hull's red as they fade.
  const shut = SHUT * tile;
  for (let t = 0; t < LAMPREY_TEETH; t++) {
    const a = angleOf(t);
    const x = Math.cos(a) * shut;
    const y = Math.sin(a) * shut * FLAT;
    ctx.fillStyle = rgba(PALETTE.red, 0.6 * fade);
    ctx.beginPath();
    ctx.ellipse(x, y, HOLE * tile * 1.8, HOLE * tile * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(PALETTE.lampreyMouth, 0.9 * fade);
    ctx.beginPath();
    ctx.ellipse(x, y, HOLE * tile, HOLE * tile * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // The flecks of plating thrown up off the bite, falling back as they die.
  const a = f.after;
  for (let i = 0; i < FLECKS; i++) {
    const across = (i / (FLECKS - 1)) * 2 - 1;
    const sx = across * OPEN * tile * (1 - (1 - a) ** 2);
    const sy = -THROW * tile * (1 - Math.abs(across) * 0.5) * 4 * a * (1 - a);
    const s = tile * (0.04 + 0.02 * (i % 2)) * fade;
    ctx.fillStyle = rgba(i % 2 ? PALETTE.hullRim : PALETTE.red, fade);
    ctx.fillRect(sx - s, sy - s, s * 2, s * 2);
  }
  ctx.restore();
}
