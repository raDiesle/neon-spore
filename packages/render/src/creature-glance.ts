import { type Glance, STILL_GLANCE } from "./glance.js";
import type { GlanceSize } from "./glance-styles.js";

/**
 * **How far an enemy may glance** — the owner, 14 October 2026: every enemy
 * glances as the bosses do, *within the naming gate*, so each kind stays its
 * own word across a voice delay.
 *
 * The size is the largest the gate allows, **searched, not guessed**
 * (`tools/shape-sheet/src/nameability-glance.ts`): every living kind turned
 * about its centre through every swing and roll of a COCK round, crossed with
 * its whole pose window. The reach was searched first, with no roll, because
 * the turn is the part an eye sees from across the field: at 0.23 the wisp's
 * lobes, bunched on one half and spread on the other, cover the limpet's and
 * the blister's. Then the roll at that reach: at 0.15 the beatbox and the
 * leech share a box. A hundredth under either is what ships, and
 * `tools/shape-sheet/test/nameability-glance.test.ts` holds both edges.
 *
 * Measured on the bodies the gate knows, the living ones. The ghost and the
 * wisp's trail are mostly not drawn, and a rock is not a living word; the
 * lanes that turn those say so where they do.
 *
 * `tilt` is LOOK's, and an enemy cocks.
 */
export const CREATURE_GLANCE_SIZE: GlanceSize = { reach: 0.22, cock: 0.14, tilt: 0 };

/** Still until the lane that turns every living enemy lands ("Every living enemy glances", `docs/queue.md`). */
export const CREATURE_GLANCE: Glance = STILL_GLANCE;
