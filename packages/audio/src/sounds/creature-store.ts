/**
 * The idea store, heard (`docs/spec/ideas.md`).
 *
 * These are the least settled sounds in the catalogue and the most useful ones
 * to have: an idea on that page is accepted in principle and not worked out,
 * and several of them stand or fall on whether the pair could tell the thing
 * apart at all. The countdown creature is the clearest case — three pips and a
 * hole where the fourth should be is either instantly readable or the whole
 * mechanic is a guessing game.
 */

import { after, air, burst, chime, glint, metal, soft, spore, sub } from "../grain.js";
import type { SoundDef } from "../types.js";

export const CREATURE_STORE_SOUNDS: SoundDef[] = [
  {
    id: "creature.colonySpread",
    family: "creature",
    blurb: "One thing becoming several, each smaller and quicker than the last.",
    status: "spare",
    use: "The Colony (ideas.md) — spreads, hatches darts.",
    level: 0.3,
    layers: [
      spore(120, 0.24, 0.45, 50),
      after(0.18, burst(soft(0.7, air(4000, 8000, 0.08, 0.2, 3)), 4, 0.11, 0.82, 9)),
    ],
  },
  {
    id: "creature.prismTurn",
    family: "creature",
    blurb: "A facet rotating: a thin tone sliding through a quarter turn.",
    status: "spare",
    use: "The Prism (ideas.md) — what a shot hits and leaves sideways from.",
    level: 0.22,
    layers: [
      { source: "sine", freq: 5600, toFreq: 7400, gain: 0.3, attack: 0.05, release: 0.2 },
      soft(0.4, glint(9200, 0.1)),
    ],
  },
  {
    id: "creature.gateHold",
    family: "creature",
    blurb: "Something arriving at the hull and not going away. A stop with no impact in it.",
    status: "spare",
    use: "The wave gate (ideas.md) — reaching the hull does nothing; only a hit removes it.",
    level: 0.3,
    layers: [
      { source: "sine", freq: 88, gain: 0.5, attack: 0.2, hold: 0.5, release: 0.5 },
      soft(0.5, metal(66, 0.4, 0.4, 110)),
    ],
  },
  {
    id: "creature.gateLoop",
    family: "creature",
    blurb: "The same thing going back up. Rising, and clearly a repeat.",
    status: "spare",
    use: "The wave gate looping for another pass — the pair must hear that it came back.",
    level: 0.3,
    layers: [
      {
        source: "triangle",
        freq: 140,
        toFreq: 420,
        gain: 0.4,
        attack: 0.1,
        release: 0.5,
        wobble: { rate: 5, cents: 30 },
      },
      soft(0.5, air(700, 3400, 0.5, 0.18, 1.6)),
    ],
  },
  {
    id: "creature.echoEarly",
    family: "creature",
    blurb: "A creature's arrival heard a second before it happens.",
    status: "spare",
    use: "Echo (ideas.md) — it appears one second earlier for one player.",
    level: 0.24,
    layers: [soft(0.4, air(2600, 5200, 0.2, 0.2, 2.4)), after(1, spore(160, 0.3, 0.4, 40))],
  },
  {
    id: "creature.reverbRepeat",
    family: "creature",
    blurb: "An action said back, later and quieter.",
    status: "spare",
    use: "Reverb (ideas.md) — repeats an action with a delay.",
    level: 0.26,
    layers: [burst(chime(4200, 0.16, 0.22, 1300), 3, 0.36, 0.55, -3)],
  },
  {
    id: "creature.moult",
    family: "creature",
    blurb: "A skin coming off, and something smaller and harder underneath.",
    status: "spare",
    use: "Moulting (ideas.md).",
    level: 0.32,
    layers: [
      {
        source: "noise",
        freq: 1800,
        gain: 0.34,
        attack: 0.01,
        release: 0.3,
        filter: { type: "bandpass", freq: 2200, toFreq: 420, q: 2.6 },
      },
      after(0.24, metal(150, 0.2, 0.4, 130)),
      after(0.24, soft(0.5, glint(6200, 0.16))),
    ],
  },
  {
    id: "creature.symbiosisNear",
    family: "creature",
    blurb: "Two tones beating against each other. The closer they are, the worse it gets.",
    status: "spare",
    use: "Symbiosis (ideas.md) — only vulnerable while the two are far apart.",
    level: 0.26,
    layers: [
      { source: "triangle", freq: 96, gain: 0.4, attack: 0.2, hold: 0.4, release: 0.4 },
      { source: "triangle", freq: 99, gain: 0.4, attack: 0.2, hold: 0.4, release: 0.4 },
    ],
  },
  {
    id: "creature.symbiosisFar",
    family: "creature",
    blurb: "The same two tones, a clean fifth apart. Open, and audibly available.",
    status: "spare",
    use: "Symbiosis at range — the window a shot lands in.",
    level: 0.26,
    layers: [
      { source: "triangle", freq: 96, gain: 0.4, attack: 0.2, hold: 0.4, release: 0.4 },
      { source: "triangle", freq: 144, gain: 0.34, attack: 0.2, hold: 0.4, release: 0.4 },
    ],
  },
  {
    id: "creature.countdown",
    family: "creature",
    blurb: "Three pips falling in pitch, and a fourth that is a hole where a pip was.",
    status: "spare",
    use: "The countdown creature (ideas.md) — only hittable at zero.",
    level: 0.3,
    layers: [
      glint(6600, 0.07, 0.45),
      after(0.31, glint(5600, 0.07, 0.45)),
      after(0.62, glint(4700, 0.07, 0.45)),
      after(0.93, sub(70, 0.2, 0.6)),
    ],
  },
  {
    id: "creature.camouflage",
    family: "creature",
    blurb: "A sound going out as you turn towards it.",
    status: "spare",
    use: "Camouflage (ideas.md) — it hides when you take aim.",
    level: 0.22,
    layers: [
      {
        source: "triangle",
        freq: 3800,
        gain: 0.28,
        attack: 0.02,
        hold: 0.06,
        release: 0.3,
        ring: { freq: 700, depth: 0.5 },
        filter: { type: "lowpass", freq: 6000, toFreq: 900, q: 1 },
      },
    ],
  },
];
