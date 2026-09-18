/**
 * THE SCOUT's two hands on its picture, in a file of their own for
 * `boss-pinball-hand.ts`' reason: the round had no sounds of its own until 18
 * September 2026. These three are a line going taut, a line coming off, and a
 * cold thruster catching — and all three stay out of the 300–3000 Hz band,
 * because the whole round is one seat flying a ship on the other's word
 * (docs/spec/audio.md §1).
 */

import { after, air, metal, soft, sub } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_SCOUT_HAND_SOUNDS: SoundDef[] = [
  {
    id: "boss.scoutReel",
    family: "boss",
    blurb: "A line going taut and taking a weight: a low haul, and it settling into the pull.",
    status: "bound",
    use: "THE SCOUT's line put on by player 2 under laden — the ship is being pulled home.",
    level: 0.38,
    // Falling, because what player 1 has to hear is his own hands going dead.
    layers: [
      { source: "triangle", freq: 124, toFreq: 58, gain: 0.24, attack: 0.02, release: 0.3 },
      after(0.06, sub(46, 0.34, 0.34)),
    ],
  },
  {
    id: "boss.scoutSlip",
    family: "boss",
    blurb: "The same line coming off: slack running out, and the weight gone off it.",
    status: "bound",
    use: "THE SCOUT's line taken off by player 2 — the ship is player 1's again.",
    level: 0.34,
    // And rising, the other half of the pair: the ship is his again.
    layers: [
      { source: "triangle", freq: 58, toFreq: 124, gain: 0.2, attack: 0.02, release: 0.24 },
      after(0.14, soft(0.5, air(5000, 5800, 0.26, 0.08, 1.3))),
    ],
  },
  {
    id: "boss.scoutPrime",
    family: "boss",
    blurb: "A cold thruster catching: a click, and a breath of flame taking hold behind it.",
    status: "bound",
    use: "THE SCOUT's thruster primed by player 1 under heavy — a burn takes for scoutPrimeTicks.",
    level: 0.36,
    layers: [metal(92, 0.2, 0.12, 250), after(0.05, air(4600, 5400, 0.3, 0.1, 1.9))],
  },
];
