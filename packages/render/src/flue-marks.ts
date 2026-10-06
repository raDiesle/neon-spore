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
 * for a bolt and a ring with the beam's bar through it for a beam; **the
 * shots** are three pips under the sight, one going dark for every shot
 * spent; and **the levels** are a stud each over the flue, lit as each is
 * cleared — the flue's health, read off the body.
 *
 * Everything but the ember is on both screens: the navigator, who fires and
 * cannot see the ember, has to see what the level asks and how many shots
 * are left as well as the pilot does.
 */

/** The shot pips' radius and spacing, and how far under the flue they sit, in
 * tiles: under the pilot's `NOW` and the navigator's `FIRE` too, which stand
 * under the sight. */
const PIP = 0.1;
const PIP_GAP = 0.32;
const PIP_DOWN = 2.15;
/** The level studs' radius and spacing, and how far over the flue they sit, in
 * tiles: over the `CALL` standing over the sight. */
const STUD = 0.08;
const STUD_GAP = 0.3;
const STUD_UP = 1.8;

/** How far under the sight the shot pips stand, in pixels. */
export function flueShotsDown(l: Layout): number {
  return PIP_DOWN * l.tile;
}

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

/** The level's shots under the sight: lit for every shot left, dark for every one spent. */
export function drawFlueShots(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  shots: number,
  max: number,
): void {
  const r = PIP * l.tile;
  for (let i = 0; i < max; i++) {
    const x = at.x + (i - (max - 1) / 2) * PIP_GAP * l.tile;
    const pip = new Path2D();
    pip.arc(x, at.y + flueShotsDown(l), r, 0, Math.PI * 2);
    if (i < shots) {
      ctx.fillStyle = PALETTE.hullRim;
      ctx.fill(pip);
      strokeGlowFaded(ctx, pip, PALETTE.hullRim, STROKE.inner, 1, 0.8);
    } else {
      ctx.fillStyle = PALETTE.flueSlot;
      ctx.fill(pip);
      ctx.lineWidth = STROKE.inner;
      ctx.strokeStyle = rgba(PALETTE.hullRim, 0.35);
      ctx.stroke(pip);
    }
  }
}

/** A stud over the flue for every level, lit for each one cleared and flaring as it is. */
export function drawFlueLevels(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  centre: Point,
  hits: number,
  total: number,
  flare: number,
): void {
  const r = STUD * l.tile;
  for (let i = 0; i < total; i++) {
    const stud = new Path2D();
    const x = centre.x + (i - (total - 1) / 2) * STUD_GAP * l.tile;
    stud.arc(x, centre.y - STUD_UP * l.tile, r, 0, Math.PI * 2);
    if (i < hits) {
      ctx.fillStyle = PALETTE.hullRim;
      ctx.fill(stud);
      const glow = i === hits - 1 ? 0.9 + 1.6 * flare : 0.9;
      strokeGlowFaded(ctx, stud, PALETTE.hullRim, STROKE.inner, glow, 0.8);
    } else {
      ctx.fillStyle = PALETTE.flueSlot;
      ctx.fill(stud);
      ctx.lineWidth = STROKE.inner;
      ctx.strokeStyle = rgba(PALETTE.hullRim, 0.3);
      ctx.stroke(stud);
    }
  }
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
