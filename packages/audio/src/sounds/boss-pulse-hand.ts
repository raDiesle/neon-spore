/**
 * THE PULSE's hand on the bar, in a file of their own for
 * `boss-scout-hand.ts`' reason: the round had no sounds of its own until 18
 * September 2026. These three are a thumb taking a weight, that weight let go,
 * and both thumbs arriving on it at once — and all three stay out of the
 * 300–3000 Hz band, because a round whose whole subject is one seat reading
 * the other's arrow is a round being talked through (docs/spec/audio.md §1).
 */

import { after, air, metal, soft, sub, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_PULSE_HAND_SOUNDS: SoundDef[] = [
  {
    id: "boss.pulseBrace",
    family: "boss",
    blurb: "A thumb taking a weight: a soft catch, and the hum of it steadying under the hand.",
    status: "bound",
    use: "THE PULSE's bar braced by one seat under flutter — that seat is out of the song.",
    level: 0.36,
    layers: [thud(128, 82, 0.13, 0.4), after(0.04, soft(0.5, sub(52, 0.26, 0.3)))],
  },
  {
    id: "boss.pulseSlip",
    family: "boss",
    blurb: "The weight let go: the hum falling away and the hand off it.",
    status: "bound",
    use: "THE PULSE's bar let go — that seat is back in the song and the carry is over.",
    level: 0.34,
    layers: [
      { source: "triangle", freq: 112, toFreq: 56, gain: 0.2, attack: 0.01, release: 0.26 },
      after(0.06, soft(0.45, air(5200, 3400, 0.36, 0.08, 1.2))),
    ],
  },
  {
    id: "boss.pulseArrest",
    family: "boss",
    blurb: "Two hands closing on one thing: a double catch, and a ring rising between them.",
    status: "bound",
    use: "THE PULSE's arrested bar under both thumbs at once — it climbs while neither of them plays.",
    level: 0.44,
    // Rising, and the only one of the three that is: it is the one moment in
    // the round neither seat can reach alone, and it has to sound like relief.
    layers: [
      thud(120, 70, 0.14, 0.34),
      after(0.08, metal(96, 0.3, 0.26, 240)),
      after(0.1, {
        source: "triangle",
        freq: 70,
        toFreq: 148,
        gain: 0.2,
        attack: 0.02,
        release: 0.3,
      }),
    ],
  },
];
