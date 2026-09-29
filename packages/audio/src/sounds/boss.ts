/**
 * The bosses. Three exist; eight are names holding a slot (docs/spec/bosses.md).
 *
 * A boss is not louder than a wave, it is *lower*. Everything here has a body
 * under 90 Hz, which is the one register the rest of the catalogue leaves
 * alone — so a boss can be heard arriving under a field already full of
 * creatures without anything having to be turned down.
 *
 * The unbuilt ones each get a voice here anyway. A name holding a slot is
 * easier to argue about once you can hear what it would sound like.
 */

import { after, air, burst, chime, glint, metal, noise, soft, spore, sub, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_SOUNDS: SoundDef[] = [
  {
    id: "boss.arrive",
    family: "boss",
    blurb: "Something very large settling into the top of the field.",
    status: "bound",
    use: "A wave with a boss in it opening.",
    level: 0.5,
    layers: [
      { source: "sine", freq: 120, toFreq: 42, gain: 0.7, attack: 0.5, hold: 0.3, release: 1.1 },
      air(110, 420, 0.8, 0.12, 3),
      after(0.9, soft(0.6, metal(58, 0.6, 0.4, 120))),
    ],
  },
  {
    id: "boss.queenStep",
    family: "boss",
    blurb: "One column of a very heavy thing pacing. A footfall with plate on it.",
    status: "bound",
    use: "The Bulb Queen moving one column, once per beat.",
    level: 0.3,
    layers: [thud(90, 38, 0.16, 0.6), soft(0.4, metal(70, 0.1, 0.35, 110))],
  },
  {
    id: "boss.queenOpen",
    family: "boss",
    blurb: "Armour parting. A held breath with a bright seam through it.",
    status: "bound",
    use: "The two beats she is open — the window the mark is inside.",
    level: 0.44,
    layers: [
      air(700, 6400, 0.5, 0.15, 2.4),
      { source: "sine", freq: 60, toFreq: 96, gain: 0.5, attack: 0.2, hold: 0.5, release: 0.3 },
      after(0.14, soft(0.7, glint(4800, 0.5, 0.18))),
    ],
  },
  {
    id: "boss.queenShut",
    family: "boss",
    blurb: "It closes. The seam goes out and the body drops a tone.",
    status: "bound",
    use: "The open window ending.",
    level: 0.36,
    layers: [
      { source: "sine", freq: 96, toFreq: 54, gain: 0.55, attack: 0.02, release: 0.4 },
      soft(0.6, metal(64, 0.18, 0.45, 120)),
    ],
  },
  {
    // THE WARDEN. Commissioned as a spare against act 50 and claimed when the
    // eye was built — the sound came first and the encounter came to it.
    id: "boss.warden",
    family: "boss",
    blurb: "A door in something enormous, opening once and shutting once.",
    status: "bound",
    use: "The Warden's hatch coming fully open as the rope is pulled taut.",
    level: 0.42,
    layers: [
      metal(44, 0.9, 0.55, 130),
      after(0.5, air(120, 400, 0.7, 0.12, 3)),
      after(1.3, soft(0.8, metal(40, 0.8, 0.5, 110))),
    ],
  },
  {
    id: "boss.wardenTether",
    family: "boss",
    blurb: "A cable going taut, and something heavy taking up the slack behind it.",
    status: "bound",
    use: "The Warden lowering a rope out of the middle of its rim.",
    level: 0.4,
    layers: [
      metal(58, 0.5, 0.42, 200),
      // A triangle and not a saw: the slack coming up is a pitch rising under
      // the voice, and a saw at 70 Hz puts its fifth harmonic straight into
      // the speech band for the whole half second (`band.ts`).
      { source: "triangle", freq: 70, toFreq: 128, gain: 0.28, attack: 0.03, release: 0.5 },
      after(0.18, soft(0.7, sub(41, 0.7, 0.4))),
    ],
  },
  {
    id: "boss.wardenPlate",
    family: "boss",
    blurb: "One plate coming off a rim, and the gap it leaves ringing.",
    status: "bound",
    use: "A shot into the open pupil taking a plate off THE WARDEN.",
    level: 0.46,
    layers: [
      thud(220, 46, 0.5, 0.6),
      metal(120, 0.35, 0.32, 120),
      // The gap left in the rim, ringing — put above the speech band rather
      // than through it, which is where the catalogue keeps its sparkle.
      after(0.09, glint(3400, 0.3, 0.14)),
    ],
  },
  {
    id: "boss.queenDown",
    family: "boss",
    blurb: "The last petal, and everything under it letting go at once.",
    status: "bound",
    use: "A boss destroyed — the Bulb Queen, or THE WARDEN's last plate.",
    level: 0.6,
    pierce: "A boss dying is the end of the conversation about the boss.",
    layers: [
      thud(300, 30, 1.2, 0.8),
      noise(2600, { type: "bandpass", freq: 3200, toFreq: 200, q: 0.7 }, 0.01, 0.9, 0.5),
      after(0.3, burst(chime(3600, 0.5, 0.2, 1100), 4, 0.17, 0.72, -5)),
      after(1.1, soft(0.6, spore(52, 1.2, 0.4, 70))),
    ],
  },
  {
    id: "boss.torchDrop",
    family: "boss",
    blurb: "A rock let go from a height, falling faster than anything else does.",
    status: "bound",
    use: "A torch entering the queue — the clock of its own she drops on.",
    level: 0.42,
    layers: [
      {
        source: "sawtooth",
        freq: 300,
        toFreq: 90,
        gain: 0.5,
        attack: 0.01,
        release: 0.6,
        filter: { type: "lowpass", freq: 380, toFreq: 130, q: 2.4 },
      },
      air(7000, 4600, 0.5, 0.14, 3),
    ],
  },
  {
    id: "boss.torchWarn",
    family: "boss",
    blurb: "Three hard pips, close together, the third one higher.",
    status: "bound",
    use: "The torch alarm — the one warning that has to arrive before the sentence about it.",
    level: 0.36,
    pierce: "The torch is the one arrival too fast to be talked about. It interrupts on purpose.",
    layers: [
      burst(
        {
          source: "square",
          freq: 1200,
          gain: 0.28,
          attack: 0.002,
          hold: 0.03,
          release: 0.04,
          filter: { type: "lowpass", freq: 2600, q: 1 },
        },
        3,
        0.11,
        1,
        4,
      ),
      sub(70, 0.3, 0.4),
    ],
  },
  {
    id: "boss.markReal",
    family: "boss",
    blurb: "A ring pulsing where the shot has to go. Only one player ever hears it.",
    status: "spare",
    use: "The real mark, if marking (couplings.md 2) is ever given a sound of its own.",
    level: 0.22,
    layers: [
      {
        source: "sine",
        freq: 5400,
        gain: 0.3,
        attack: 0.04,
        hold: 0.06,
        release: 0.2,
        repeat: { times: 2, every: 0.31, decay: 0.7 },
      },
    ],
  },
];
