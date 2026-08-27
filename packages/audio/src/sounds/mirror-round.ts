/**
 * How a round of THE MIRROR ends.
 *
 * Split from `mirror.ts` along the fight's own seam: that file is the boss
 * performing, this one is the pair answering and the verdict landing. The
 * three ways a round can be lost — a wrong step, the bait, the silence — are
 * three different sounds on purpose. Which mistake it was is the whole of what
 * the pair has to say to each other before the next round starts, and a single
 * buzzer would make them work it out from the picture instead.
 */

import { after, air, burst, chime, glint, soft, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const MIRROR_ROUND_SOUNDS: SoundDef[] = [
  {
    id: "mirror.handover",
    family: "mirror",
    blurb: "The demonstration ending: a held tone stepping aside in one move.",
    status: "bound",
    use: "The sequence finished and the row handed to the pair.",
    level: 0.36,
    layers: [
      {
        source: "triangle",
        freq: 3800,
        toFreq: 5600,
        gain: 0.24,
        attack: 0.02,
        release: 0.24,
        ring: { freq: 900, depth: 0.4 },
      },
      sub(72, 0.3, 0.4),
      after(0.2, soft(0.6, glint(6800, 0.2))),
    ],
  },
  {
    id: "mirror.echo",
    family: "mirror",
    blurb: "One step answered right. A short bright confirmation, no body.",
    status: "bound",
    use: "The pair matching a step.",
    level: 0.34,
    layers: [glint(5800, 0.1, 0.4), after(0.02, soft(0.5, glint(8700, 0.08)))],
  },
  {
    id: "mirror.echoLate",
    family: "mirror",
    blurb: "The confirmation, but arriving a hair behind the beat and sagging.",
    status: "spare",
    use: "A step answered right but off the beat, if the fight ever grades timing.",
    level: 0.3,
    layers: [{ source: "sine", freq: 5600, toFreq: 4900, gain: 0.4, attack: 0.006, release: 0.14 }],
  },
  {
    id: "mirror.verdictRight",
    family: "mirror",
    blurb:
      "The whole sequence flying back and landing. Rising, and the only clean chord in the game.",
    status: "bound",
    use: "A round answered in full.",
    level: 0.5,
    layers: [
      burst(glint(4400, 0.1, 0.34), 4, 0.07, 1, 12),
      after(0.3, {
        source: "sine",
        freq: 3520,
        gain: 0.24,
        attack: 0.02,
        hold: 0.14,
        release: 0.4,
      }),
      after(0.3, {
        source: "sine",
        freq: 5280,
        gain: 0.18,
        attack: 0.02,
        hold: 0.14,
        release: 0.4,
      }),
      after(0.3, sub(110, 0.5, 0.45)),
    ],
  },
  {
    id: "mirror.verdictWrong",
    family: "mirror",
    blurb: "The sequence coming back at you instead. A descending shear.",
    status: "bound",
    use: "A round broken — the echo strike.",
    level: 0.5,
    layers: [
      {
        source: "sawtooth",
        freq: 420,
        toFreq: 60,
        gain: 0.5,
        attack: 0.01,
        release: 0.5,
        filter: { type: "lowpass", freq: 460, toFreq: 90, q: 2 },
      },
      air(9600, 4200, 0.4, 0.2, 2.4),
      after(0.4, soft(0.7, thud(150, 40, 0.3, 0.6))),
    ],
  },
  {
    id: "mirror.bait",
    family: "mirror",
    blurb: "A step that was never asked for, answered anyway: a tone that curdles halfway.",
    status: "bound",
    use: "The bait — a round lost by doing something instead of nothing.",
    level: 0.44,
    layers: [
      {
        source: "triangle",
        freq: 4600,
        gain: 0.24,
        attack: 0.006,
        hold: 0.05,
        release: 0.1,
        ring: { freq: 1100, depth: 0.5 },
      },
      after(0.14, {
        source: "sawtooth",
        freq: 260,
        toFreq: 90,
        gain: 0.45,
        attack: 0.01,
        release: 0.36,
        filter: { type: "lowpass", freq: 340, toFreq: 120, q: 2.6 },
      }),
    ],
  },
  {
    id: "mirror.silence",
    family: "mirror",
    blurb: "Nothing arriving, and the room noticing. A very low tone opening under the field.",
    status: "bound",
    use: "A round lost to silence — the listening window running out.",
    level: 0.36,
    layers: [
      { source: "sine", freq: 70, toFreq: 40, gain: 0.55, attack: 0.3, hold: 0.3, release: 0.6 },
      soft(0.4, air(400, 140, 0.8, 0.14, 1.6)),
    ],
  },
  {
    id: "mirror.down",
    family: "mirror",
    blurb: "Your own ship's sounds, all of them, played once and stopped dead.",
    status: "bound",
    use: "THE MIRROR destroyed.",
    level: 0.56,
    pierce: "The fight is over mid-sentence, which is the point of ending it this way.",
    layers: [
      burst(chime(3800, 0.18, 0.24, 1200), 6, 0.075, 0.92, -7),
      after(0.5, {
        source: "sawtooth",
        freq: 400,
        toFreq: 36,
        gain: 0.5,
        attack: 0.01,
        release: 1,
        filter: { type: "lowpass", freq: 1800, toFreq: 90, q: 1.6 },
      }),
      after(1.4, soft(0.5, tick(0.4, 0, 3000))),
    ],
  },
  {
    id: "mirror.rounds",
    family: "mirror",
    blurb: "The round counter advancing: one click per round already survived.",
    status: "spare",
    use: "The start of a round, if the pair should hear how deep they are.",
    level: 0.26,
    layers: [burst(glint(6200, 0.06, 0.4), 3, 0.1, 0.85, 8)],
  },
];
