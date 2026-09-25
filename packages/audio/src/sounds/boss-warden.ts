/**
 * THE WARDEN's second and third hands, in a file of their own because
 * `boss.ts` is full: the rope's four are older than the split and
 * stay in `boss.ts`. These are a thumb landing on an eye, a door thrown, and
 * a door slamming — and all three stay out of the 300–3000 Hz band, because
 * under NARROW and GLARE the pair is saying *hold* and *now* to each other
 * across a voice delay (docs/spec/audio.md §1).
 */

import { after, air, metal, soft, sub, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_WARDEN_SOUNDS: SoundDef[] = [
  {
    id: "boss.wardenHold",
    family: "boss",
    blurb: "A thumb settling on something wet: a soft press, and lids parting with a breath.",
    status: "bound",
    use: "THE WARDEN's eye held under player 2's thumb — the lids behind the hatch part.",
    level: 0.38,
    // A press under the band and the breath above it, over inside a beat:
    // player 1 hears where the thumb landed, and keeps pulling.
    layers: [thud(140, 80, 0.14, 0.45), after(0.05, air(4800, 5600, 0.3, 0.1, 2))],
  },
  {
    id: "boss.wardenThrow",
    family: "boss",
    blurb: "A door thrown open on iron: a swing, and it bangs against its stop.",
    status: "bound",
    use: "THE WARDEN's hatch thrown by player 1's swipe under GLARE — three beats to fire.",
    level: 0.44,
    // The swing is a rising pitch under the voice, as the rope's slack was;
    // the stop is one knock. Player 2 hears the window open and cannot see
    // the hand that opened it.
    layers: [
      { source: "triangle", freq: 64, toFreq: 140, gain: 0.26, attack: 0.02, release: 0.3 },
      after(0.22, metal(72, 0.35, 0.36, 220)),
      after(0.22, sub(48, 0.4, 0.35)),
    ],
  },
  {
    id: "boss.wardenSlam",
    family: "boss",
    blurb: "A hatch slamming of its own weight: one heavy fall, and the ring humming after it.",
    status: "bound",
    use: "THE WARDEN's thrown hatch shutting when its window ran out — the shot is late.",
    level: 0.46,
    // Heavier and lower than the throw and nothing rising in it: a window
    // gone, which both seats have to hear as different from one opening.
    layers: [
      thud(110, 48, 0.28, 0.6),
      after(0.02, metal(54, 0.5, 0.3, 200)),
      after(0.1, soft(0.6, air(6000, 3600, 0.6, 0.1, 1.2))),
    ],
  },
];
