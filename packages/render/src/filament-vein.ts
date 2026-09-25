import type { FilamentState } from "@neon-spore/sim";
import { filamentRunPath } from "./filament-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The lit run as a vein** — the owner, 25 September 2026: *the vene to
 * travel with some weapon*. What player 1 has drawn is a tube: a dark wall,
 * a lumen in the heart's magenta, and the rim THE FILAMENT's lit run always
 * wore (`wispRim`), with a pulse of light running along it toward the heart
 * so the way the pair are going is the way the blood goes. Drawn on every
 * screen; the unlit way ahead stays the dashed line on player 1's alone
 * (`filament-draw.ts`).
 */

/** The wall's width and the lumen's, in tiles. */
const WALL = 0.42;
const LUMEN = 0.24;
/** The flow's dash and gap, in tiles, and how fast it runs toward the heart, in tiles a second. */
const DASH = 0.22;
const GAP = 0.5;
const FLOW = 2.2;

/** The vein from the free end to the head, dimmed while the line is dark. */
export function drawFilamentVein(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FilamentState,
  dark: number,
  time: number,
): void {
  const lit = filamentRunPath(l, s, 0, s.head);
  if (lit === null) return;
  const light = 1 - 0.7 * dark;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = PALETTE.sheenDeep;
  ctx.lineWidth = l.tile * WALL;
  ctx.stroke(lit);
  ctx.strokeStyle = rgba(PALETTE.sheenMid, 0.55 * light);
  ctx.lineWidth = l.tile * LUMEN;
  ctx.stroke(lit);
  ctx.restore();
  strokeGlow(ctx, lit, PALETTE.wispRim, STROKE.outline, light);
  ctx.save();
  ctx.lineCap = "round";
  ctx.setLineDash([l.tile * DASH, l.tile * GAP]);
  ctx.lineDashOffset = -time * FLOW * l.tile;
  ctx.strokeStyle = rgba(PALETTE.sheenWarm, 0.9 * light);
  ctx.lineWidth = l.tile * LUMEN * 0.6;
  ctx.stroke(lit);
  ctx.restore();
}
