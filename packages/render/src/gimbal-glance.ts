import { type Glance, STILL_GLANCE } from "./glance.js";
import type { GlanceSize } from "./glance-styles.js";

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
 * Shipped, it adds nothing: `GIMBAL_GLANCE` is still, and VERSUS
 * `gimbal:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `GIMBAL_GLANCE_SIZE`. Taking one means measuring the widest the drift and
 * the turn reach together against the grab radius, as `gimbal-tilt.test.ts`
 * does for the drift alone.
 */
export const GIMBAL_GLANCE: Glance = { ...STILL_GLANCE };

/** How far the cradle turns either way, in radians of yaw, and how far it rolls. */
export const GIMBAL_GLANCE_SIZE: GlanceSize = { reach: 0.45, cock: 0.1, tilt: 0.25 };
