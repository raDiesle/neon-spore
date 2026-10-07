import type { FlueLevel } from "@neon-spore/sim";
import { flueSightR, type Point } from "./flue-shape.js";
import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE FLUE's marks**: what says what a level asks and what it has left.
 * The slot glowing is *a level is lit*; **the sight** over the cannon is
 * where the ember must be met, drawn in the colour the level asks, a ring
 * for a bolt and a ring with the beam's bar through it for a beam. The
 * levels are the flue's own lobes, one each (`flue-tally.ts`), where a stud
 * each stood over the flue until 7 October 2026. The shots a level has left are the
 * strings the flue hangs on (`flue-strings.ts`), where three pips under the
 * sight were until the owner had them taken off on 6 October 2026.
 *
 * Everything but the ember is on both screens: the navigator, who fires and
 * cannot see the ember, has to see what the level asks as well as the pilot
 * does.
 */

/** The lit level's slot, glowing on its beat: *this one*. */
export function drawFlueSlotGlow(
  ctx: CanvasRenderingContext2D,
  slot: Path2D,
  beatPhase: number,
): void {
  const pulse = 0.55 + 0.3 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlowFaded(ctx, slot, PALETTE.hullRim, STROKE.inner, pulse, 0.8);
}

/**
 * The sight over the held cannon, in the level's colour: a ring breathing on
 * its beat for a bolt, and for a beam the same ring with a bar down through
 * it, the beam's own picture. Dim between levels, in the next one's colour.
 */
export function drawFlueSight(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  level: FlueLevel,
  lit: boolean,
  beatPhase: number,
): void {
  const r = flueSightR(l);
  const hex = stepColour(level.color).rim;
  const pulse = lit ? 0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2) : 0.35;
  const ring = new Path2D();
  ring.arc(at.x, at.y, r, 0, Math.PI * 2);
  strokeGlowFaded(ctx, ring, hex, STROKE.outline, pulse, 1);
  if (level.weapon !== "beam") return;
  const bar = new Path2D();
  bar.moveTo(at.x, at.y - r * 1.5);
  bar.lineTo(at.x, at.y + r * 1.5);
  strokeGlowFaded(ctx, bar, hex, STROKE.outline, pulse, 1);
}

/** A hit's flash at the sight: white, opening as it fades. */
export function drawFlueFlash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  flash: number,
): void {
  if (flash <= 0) return;
  const p = new Path2D();
  p.arc(at.x, at.y, flueSightR(l) * (0.6 + 0.9 * (1 - flash)), 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.hullRim, flash * 0.5);
  ctx.fill(p);
  strokeGlowFaded(ctx, p, PALETTE.hullRim, STROKE.inner, flash);
}
