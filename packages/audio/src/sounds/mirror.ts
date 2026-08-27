/**
 * THE MIRROR: your own ship, asking for your moves back.
 *
 * The rule that shapes this family: the boss's half of a sequence sounds like
 * the ship's half heard through something. Same grains, a fifth lower, with a
 * ring modulator on everything — recognisably your own controls, and
 * recognisably not yours. That is the entire joke of the fight and it has to
 * survive being heard rather than seen, because one of the two players is
 * looking at a row of slots and not at the ship at all.
 */

import { after, air, burst, metal, soft, spore, sub, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

/** The boss's version of a control: the same event, lower and ring modulated. */
function shown(freq: number, ring: number, release = 0.2): SoundDef["layers"] {
  return [
    tick(0.35, 0, 3600),
    {
      source: "triangle",
      freq,
      gain: 0.3,
      attack: 0.006,
      release,
      ring: { freq: ring, depth: 0.6 },
    },
    sub(104, release * 0.8, 0.4),
  ];
}

export const MIRROR_SOUNDS: SoundDef[] = [
  {
    id: "mirror.arrive",
    family: "mirror",
    blurb: "Your own ship's sounds played backwards and settling into one chord.",
    status: "bound",
    use: "THE MIRROR taking the field.",
    level: 0.48,
    layers: [
      {
        source: "triangle",
        freq: 60,
        toFreq: 90,
        gain: 0.6,
        attack: 1,
        release: 0.6,
        ring: { freq: 33, depth: 0.5 },
      },
      air(7200, 3600, 1.2, 0.15, 2.4),
      after(1.1, soft(0.7, metal(48, 0.5, 0.5, 120))),
    ],
  },
  {
    id: "mirror.countIn",
    family: "mirror",
    blurb: "Four clicks, and the room getting quieter under each one.",
    status: "bound",
    use: "The count-in before a sequence is performed.",
    level: 0.4,
    layers: [
      burst(tick(0.55, 0, 3800), 4, 0.625, 0.94),
      { source: "sine", freq: 90, toFreq: 56, gain: 0.4, attack: 0.6, hold: 1.2, release: 0.6 },
    ],
  },
  {
    id: "mirror.showFireRed",
    family: "mirror",
    blurb: "The red shot, a fifth down and rung out of tune.",
    status: "bound",
    use: "THE MIRROR performing a fireRed step.",
    level: 0.42,
    layers: shown(4600, 1180),
  },
  {
    id: "mirror.showFireCyan",
    family: "mirror",
    blurb: "The cyan shot, same treatment — glassier, and higher by a fifth.",
    status: "bound",
    use: "THE MIRROR performing a fireCyan step.",
    level: 0.42,
    layers: shown(6900, 1760),
  },
  {
    id: "mirror.showGuard",
    family: "mirror",
    blurb: "Plate coming up somewhere it should not be.",
    status: "bound",
    use: "THE MIRROR performing a guard step.",
    level: 0.42,
    layers: [
      {
        source: "sine",
        freq: 52,
        toFreq: 110,
        gain: 0.55,
        attack: 0.01,
        hold: 0.05,
        release: 0.16,
        ring: { freq: 27, depth: 0.4 },
      },
      air(2600, 5200, 0.18, 0.2, 1.8),
    ],
  },
  {
    id: "mirror.showIntake",
    family: "mirror",
    blurb: "Its maw opening. Wetter than yours, and slower.",
    status: "bound",
    use: "THE MIRROR performing an intake step.",
    level: 0.42,
    layers: [spore(110, 0.24, 0.45, 60), air(300, 1200, 0.2, 0.16, 3), sub(48, 0.2, 0.45)],
  },
  {
    id: "mirror.showCannonLeft",
    family: "mirror",
    blurb: "A detent, and a tone falling a step as it lands.",
    status: "bound",
    use: "THE MIRROR performing a cannonLeft step.",
    level: 0.38,
    layers: [
      tick(0.4, 0, 2800),
      {
        source: "triangle",
        freq: 3600,
        toFreq: 3200,
        gain: 0.24,
        attack: 0.005,
        release: 0.14,
        ring: { freq: 400, depth: 0.5 },
      },
      sub(96, 0.1, 0.4),
    ],
  },
  {
    id: "mirror.showCannonRight",
    family: "mirror",
    blurb: "The same detent, the tone rising instead.",
    status: "bound",
    use: "THE MIRROR performing a cannonRight step.",
    level: 0.38,
    layers: [
      tick(0.4, 0, 2800),
      {
        source: "triangle",
        freq: 3200,
        toFreq: 3600,
        gain: 0.24,
        attack: 0.005,
        release: 0.14,
        ring: { freq: 400, depth: 0.5 },
      },
      sub(96, 0.1, 0.4),
    ],
  },
];
