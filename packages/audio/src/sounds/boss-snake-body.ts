/**
 * SNAKE's hand on its own body, in a file of its own for `boss-vane.ts`'
 * reason: the round had no sounds of its own until 18 September 2026, because
 * everything in it was a tile one screen or the other was already drawing.
 * This one is jaws that have stuck being hauled apart, and it stays out of the
 * 300–3000 Hz band, because the whole round is one seat telling the other
 * where to drive (docs/spec/audio.md §1). The tail's lift and drop went with
 * its hold, 6 October 2026.
 */

import { after, air, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_SNAKE_BODY_SOUNDS: SoundDef[] = [
  {
    id: "boss.snakePrise",
    family: "boss",
    blurb: "Stuck jaws hauled apart: a wet tear, and a breath out of the gap.",
    status: "bound",
    use: "SNAKE's jaws prised open by player 1 under gorge, where the MAW press no longer works.",
    level: 0.4,
    // Wet rather than metal: it is a mouth, and it is the driver's cue that
    // the point she is steering at can be taken.
    layers: [thud(120, 70, 0.14, 0.4), after(0.06, air(5200, 6400, 0.32, 0.1, 1.8))],
  },
];
