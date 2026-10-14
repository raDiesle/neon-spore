import type { Glance } from "./glance.js";
import type { GlanceSize } from "./glance-styles.js";

/**
 * **THE FILAMENT's heart glances** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn, especially the head*, one entry per boss.
 *
 * The heart is the one organ here and it already turns: a yaw there and back
 * about the line through its apex, in true depth (`filament-heart-look.ts`),
 * so the vessels slide round the muscle and its far side goes back into the
 * haze. So this record is that turn, and unlike every other boss's it does
 * not ship still — it ships as the idle sway the heart has always had, read
 * as **yaw in radians** where the other records read part radii. What VERSUS
 * offers is the turn played the other two ways: LOOK, holding a look either
 * side, and COCK, cocking as it turns, each roll **about the apex**
 * (`filamentHeartPoint`), where every vein goes in, so a lead and the tools
 * riding it into the heart stay on it.
 *
 * SWAY is not offered: it is the turn the heart already ships, at a
 * different pace. `FILAMENT_GLANCE_SIZE` is the shipped sway's reach.
 */

/** The idle sway: how far either way, in radians, and the seconds there and back. */
const SWAY = 0.32;
const SWAY_PERIOD = 7.5;

export const FILAMENT_GLANCE: Glance = {
  swing: (time) => SWAY * Math.sin((time * Math.PI * 2) / SWAY_PERIOD),
  roll: () => 0,
};

/** How far the heart turns either way, in radians, and how far it rolls about its apex. */
export const FILAMENT_GLANCE_SIZE: GlanceSize = { reach: SWAY, cock: 0.12, tilt: 0.4 };
