import type { Glance } from "./glance.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";

/** How far the heart turns either way, in radians, and how far it rolls about its apex. */
export const FILAMENT_GLANCE_SIZE: GlanceSize = { reach: 0.32, cock: 0.12, tilt: 0.4 };

/**
 * **THE FILAMENT's heart glances** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn, especially the head*, one entry per boss.
 *
 * The heart is the one organ here and it already turned: a yaw there and back
 * about the line through its apex, in true depth (`filament-heart-look.ts`),
 * so the vessels slide round the muscle and its far side goes back into the
 * haze. So this record is that turn, read as **yaw in radians** where the
 * other records read part radii, and any roll is **about the apex**
 * (`filamentHeartPoint`), where every vein goes in, so a lead and the tools
 * riding it into the heart stay on it.
 *
 * Taken off VERSUS `filament:glance` on 14 October 2026, the owner leaving
 * SWAY, LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `FILAMENT_GLANCE_SIZE` — the reach of the idle
 * sway it replaces, which turned there and back over seven and a half seconds
 * with no roll.
 */
export const FILAMENT_GLANCE: Glance = glanceOf(cock, FILAMENT_GLANCE_SIZE, temperOf("filament"));
