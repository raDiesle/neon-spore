import type { Glance } from "./glance.js";
import { type GlanceSize, glanceOf, sway } from "./glance-styles.js";

/** How far the cradle turns either way, in radians of yaw, and how far it rolls. */
export const GIMBAL_GLANCE_SIZE: GlanceSize = { reach: 0.16, cock: 0, tilt: 0.25 };

/**
 * **THE GIMBAL glances** — the owner, 9 and 10 October 2026: *... or if
 * mechanical the full boss shape*, one entry per boss.
 *
 * The whole cradle already wanders in its yoke on the idle drift
 * (`gimbal-tilt.ts`, in the game since 3 October 2026), so the full shape is
 * already the part that moves; what it never does is *look*. This record is a
 * deliberate turn laid **on top of** that wander: a yaw of the whole cradle,
 * read as **radians** where the other records read part radii, and a roll
 * about its middle, both hushed by the drift's own table (`gimbalHush`), so a
 * turn steadies for the hands exactly as the wander does. Rings, teeth and
 * marks go through the same plane (`tiltMatrix`), and the bolt stopper reads
 * the tilt that is drawn, so nothing a thumb or a bolt meets is left behind.
 * The rig shades the far side as it turns away.
 *
 * Taken off VERSUS `gimbal:glance` on 14 October 2026, the owner leaving
 * SWAY, LOOK or COCK to each boss: SWAY (`glance-styles.ts`), because a roll
 * turns every ring off its bearing and the first true band is too narrow to
 * spend it in, at `GIMBAL_GLANCE_SIZE` — a third of what VERSUS offered, the
 * most the drift and the turn together allow: a rim a thumb is on stays inside
 * half the grab, and a ring inside half its band (`gimbal-tilt.test.ts`
 * samples `gimbalTilt` with both in it).
 */
export const GIMBAL_GLANCE: Glance = glanceOf(sway, GIMBAL_GLANCE_SIZE);
