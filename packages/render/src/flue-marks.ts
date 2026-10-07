import type { FlueLevel } from "@neon-spore/sim";
import { drawFlueGlass } from "./flue-glass.js";
import { flueGlassPath, flueSightH, type Point } from "./flue-shape.js";
import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE FLUE's marks**: what says what a level asks and what it has left.
 * The slot glowing is *a level is lit*; **the sight** over the cannon is
 * where the ember must be met, a length of glass in the colour the level
 * asks, with the beam's bar through it for a beam. The
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
 * The sight over the held cannon, in the level's colour: a length of glass
 * pipe as wide as a shot's reach, breathing on its beat (`flue-glass.ts`),
 * and on a beam level a bar down through it, the beam's own picture. Dim
 * between levels, in the next one's colour.
 */
export function drawFlueSight(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  level: FlueLevel,
  lit: boolean,
  beatPhase: number,
): void {
  const pulse = lit ? 0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2) : 0.35;
  drawFlueGlass(ctx, l, at, level.color, pulse);
  if (level.weapon !== "beam") return;
  const h = flueSightH(l) * 1.5;
  const bar = new Path2D();
  bar.moveTo(at.x, at.y - h);
  bar.lineTo(at.x, at.y + h);
  strokeGlowFaded(ctx, bar, stepColour(level.color).rim, STROKE.outline, pulse, 1);
}

/** A hit's flash in the glass: white, opening out of it as it fades. */
export function drawFlueFlash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  flash: number,
): void {
  if (flash <= 0) return;
  const p = flueGlassPath(l, at, (1 - flash) * flueSightH(l));
  ctx.fillStyle = rgba(PALETTE.hullRim, flash * 0.5);
  ctx.fill(p);
  strokeGlowFaded(ctx, p, PALETTE.hullRim, STROKE.inner, flash);
}
