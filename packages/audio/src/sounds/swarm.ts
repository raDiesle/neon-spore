/**
 * What a lot of creatures sound like together.
 *
 * Not the same thing as several of `creature.ts` played at once. A wave is a
 * sentence (`docs/spec/wave-design.md`) and a sentence has a shape: arriving,
 * pressing, thinning out. These are the shapes, so a wave being authored in
 * the director can be heard as one thing before any of its creatures have a
 * voice of their own.
 */

import { after, air, burst, glint, soft, spore, sub, swell } from "../grain.js";
import type { SoundDef } from "../types.js";

export const SWARM_SOUNDS: SoundDef[] = [
  {
    id: "swarm.arriveFew",
    family: "swarm",
    blurb: "Three or four things entering the field at the top, staggered.",
    status: "spare",
    use: "The opening of a light wave.",
    level: 0.24,
    layers: [
      burst(soft(0.7, air(2600, 900, 0.3, 0.18, 1.6)), 3, 0.16, 0.85, -5),
      soft(0.5, sub(64, 0.4, 0.4)),
    ],
  },
  {
    id: "swarm.arriveMany",
    family: "swarm",
    blurb: "A lot of them at once, and the floor dropping to make room.",
    status: "spare",
    use: "The opening of a heavy wave, or a boss's brood.",
    level: 0.34,
    layers: [
      burst(soft(0.6, air(3400, 700, 0.34, 0.2, 1.3)), 7, 0.075, 0.92, -4),
      { source: "sine", freq: 70, toFreq: 44, gain: 0.55, attack: 0.3, hold: 0.2, release: 0.7 },
    ],
  },
  {
    id: "swarm.press",
    family: "swarm",
    blurb: "The field getting closer. A floor rising a semitone over four seconds.",
    status: "spare",
    use: "A wave whose figures crowd rather than accelerate.",
    level: 0.26,
    layers: [
      { source: "sine", freq: 48, toFreq: 58, gain: 0.55, attack: 2, hold: 0.6, release: 1.4 },
      soft(0.4, swell(96, 3.4, 0.3, 0.4)),
    ],
  },
  {
    id: "swarm.thin",
    family: "swarm",
    blurb: "The last few. Air with gaps in it, and nothing underneath.",
    status: "spare",
    use: "A wave down to its final creatures.",
    level: 0.2,
    layers: [burst(soft(0.5, glint(5600, 0.1)), 3, 0.7, 0.8, -6), soft(0.3, swell(52, 2.4, 0.4))],
  },
  {
    id: "swarm.wallOfThem",
    family: "swarm",
    blurb: "Every column occupied. One chord, and none of it consonant.",
    status: "spare",
    use: "A figure that fills the width — the moment before a wave is survived or not.",
    level: 0.34,
    layers: [
      spore(84, 1, 0.35, 25),
      spore(96, 1, 0.3, 25),
      spore(112, 1, 0.28, 25),
      spore(126, 1, 0.24, 25),
      soft(0.5, air(300, 1400, 1.2, 0.16, 1)),
    ],
  },
  {
    id: "swarm.hatch",
    family: "swarm",
    blurb: "Something opening and several smaller things leaving it.",
    status: "spare",
    use: "The Colony, the Mother, and anything that spawns.",
    level: 0.32,
    layers: [
      {
        source: "noise",
        freq: 1400,
        gain: 0.45,
        attack: 0.02,
        release: 0.2,
        filter: { type: "bandpass", freq: 1800, toFreq: 500, q: 1.4 },
      },
      after(0.16, burst(soft(0.6, glint(6600, 0.06)), 5, 0.08, 0.86, 7)),
    ],
  },
  {
    id: "swarm.retreat",
    family: "swarm",
    blurb: "The field pulling back. Everything sliding upward and away.",
    status: "spare",
    use: "A wave that leaves rather than being cleared.",
    level: 0.28,
    layers: [
      air(180, 820, 1.2, 0.16, 2.2),
      { source: "sine", freq: 60, toFreq: 96, gain: 0.4, attack: 0.6, release: 0.8 },
    ],
  },
];
