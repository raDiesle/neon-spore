/**
 * SNAKE's two hands on its own body, in a file of their own for
 * `boss-vane.ts`' reason: the round had no sounds of its own until 18
 * September 2026, because everything in it was a tile one screen or the other
 * was already drawing. These three are jaws that have stuck being hauled
 * apart, a tail lifted off the arena and the same tail put back — and all
 * three stay out of the 300–3000 Hz band, because the whole round is one seat
 * telling the other where to drive (docs/spec/audio.md §1).
 */

import { after, air, soft, sub, thud } from "../grain.js";
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
  {
    id: "boss.snakeLift",
    family: "boss",
    blurb: "A weight coming off the ground: a low haul rising, and slack going out of it.",
    status: "bound",
    use: "SNAKE's tail lifted clear of the arena under player 2's thumb — those tiles are passable.",
    level: 0.36,
    // Rising, and its twin below falling. What player 1 has to hear is which
    // of the two happened, not that something did.
    layers: [
      { source: "triangle", freq: 54, toFreq: 118, gain: 0.22, attack: 0.03, release: 0.24 },
      after(0.16, soft(0.5, air(4800, 5600, 0.3, 0.08, 1.4))),
    ],
  },
  {
    id: "boss.snakeDrop",
    family: "boss",
    blurb: "The same weight going back down: a fall, and it settling where it lands.",
    status: "bound",
    use: "SNAKE's tail back on the arena when her thumb comes off it — those tiles kill again.",
    level: 0.4,
    layers: [
      { source: "triangle", freq: 118, toFreq: 50, gain: 0.24, attack: 0.01, release: 0.26 },
      after(0.06, sub(44, 0.34, 0.3)),
    ],
  },
];
