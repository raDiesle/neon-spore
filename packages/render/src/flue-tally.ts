import { type FlueState, flueShownLevel, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Point } from "./flue-shape.js";
import { strokeGlowFaded } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { lightWithin } from "./part-light.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE FLUE's levels, told on its lobes** — the owner, 7 October 2026: *the
 * number of levels is equal to the visual bumps of the pipe (11) and we can
 * visual do something with it representing number of levels achieved and
 * which is current.* In place of the row of studs over the flue.
 *
 * One lobe a level, counted from the left of the screen. A lobe whose level
 * is cleared is lit evenly from inside, pale — evenly, so its light is no
 * gradient the mirage could be counted by — and the one just cleared flares; the
 * lobe of the level lit breathes in that level's colour, its rim drawn in it,
 * and between levels it stands dimmer for the one to come; the lobes still to
 * play stay dark flesh. On both screens: it says nothing of where the spore is.
 */

/** How lit a cleared lobe is, and how much more the one just cleared flares. */
const CLEARED = 0.32;
const FLARE = 0.5;
/** How lit the current lobe is at the bottom and the top of its breath, and between levels. */
const NOW_LOW = 0.16;
const NOW_HIGH = 0.34;
const NOW_WAITING = 0.12;

/** The level unit `k` stands for: the lobes counted from the left of the screen, however the field is turned. */
export function flueTallyLevel(l: Layout, cfg: SimConfig, k: number): number {
  const units = cfg.cols;
  return fieldX(l, 0) <= fieldX(l, units - 1) ? k : units - 1 - k;
}

/** What a level's lobe says: cleared, the one lit or next, or still to come. */
export function flueTallyState(s: FlueState, level: number): "cleared" | "now" | "ahead" {
  if (level < s.hits || s.phase === "spent") return "cleared";
  return level === s.cursor ? "now" : "ahead";
}

/** Unit `k`'s tally, its `unit` path laid round its middle `at`. */
export function drawFlueTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: FlueState,
  k: number,
  unit: Path2D,
  at: Point,
  beatPhase: number,
  flare: number,
): void {
  const level = flueTallyLevel(l, cfg, k);
  if (level >= s.levels.length) return;
  const says = flueTallyState(s, level);
  if (says === "ahead") return;
  ctx.save();
  ctx.translate(at.x, at.y);
  if (says === "cleared") {
    const fresh = level === s.hits - 1 ? flare : 0;
    lightWithin(ctx, unit, PALETTE.hullRim, CLEARED + FLARE * fresh);
  } else {
    const shown = flueShownLevel(s);
    const lit = s.phase === "lit";
    const breath = (Math.cos(beatPhase * Math.PI * 2) + 1) / 2;
    const strength = lit ? NOW_LOW + (NOW_HIGH - NOW_LOW) * breath : NOW_WAITING;
    const hex = stepColour(shown?.color ?? "either").rim;
    lightWithin(ctx, unit, hex, strength);
    strokeGlowFaded(ctx, unit, hex, STROKE.outline, lit ? 0.5 + 0.5 * breath : 0.35, 0.9);
  }
  ctx.restore();
}
