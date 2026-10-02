import { type GaugeState, gaugeGape, gaugeLevelMarksMade, type SimConfig } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { RIM } from "./gauge-alien.js";
import type { ShotClock } from "./gauge-shot.js";

/**
 * **THE GAUGE's mouth, opening.** The owner, 2 October 2026: *increase
 * distance of cannon to teeth (so more opened mouth)*. Every level opens the
 * mouth a step (`sim/gauge-gape.ts`) — a miss loses the round instead, the
 * owner's rule for every boss the same day — and here that is the
 * rim standing `RIM_STEP` of the dial further off the cannon: the teeth, the
 * wound and every thumb on the rim go with it, because they all stand on
 * `rimPoint`. The wound the simulation narrows is the same tear further away.
 *
 * The step is taken **on the landing of the shot that opened it** and eased
 * out past where it settles, a gulp rather than a slide, so the pair sees the
 * shot cost something. Read off the state and the shot's own clock, so nothing
 * here outlives a frame.
 */

/** How much further off the cannon each step stands the rim, as a share of the dial. */
export const RIM_STEP = 0.04;
/** Beats the rim takes to open a step once the shot that opened it lands. */
const OPEN = 0.8;
/** How far past its step the rim throws before it settles, the ease's overshoot. */
const GULP = 2.2;

/** The rim's share of the dial at an opening, which may be part of a step. */
export function gaugeRimShare(gape: number): number {
  return RIM + RIM_STEP * gape;
}

/** The dial with its rim where a mouth this far open stands it. */
export function gaugeOpenDial(dial: Dial, gape: number): Dial {
  return { ...dial, rim: gaugeRimShare(gape) };
}

/**
 * Whether the last shot to land is the one that opened the mouth: the mark
 * that finished a level. Any other mark leaves it where it was, and a miss
 * ends the round with the mouth as it stood.
 */
function landingOpened(cfg: SimConfig, g: GaugeState): boolean {
  if (g.calledMilli < 0 || !g.calledGood) return false;
  return g.level > 0 && gaugeLevelMarksMade(cfg, g) === 0;
}

/** The opening this frame shows, part of a step while the last one is still easing out. */
export function gaugeGapeShown(cfg: SimConfig, g: GaugeState, c: ShotClock): number {
  const gape = gaugeGape(g);
  if (!landingOpened(cfg, g) || c.landed >= OPEN) return gape;
  const t = Math.max(0, c.landed / OPEN) - 1;
  return gape - 1 + (1 + (GULP + 1) * t ** 3 + GULP * t ** 2);
}
