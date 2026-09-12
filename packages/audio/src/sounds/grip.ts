/**
 * THE GRIP and THE PUSH, and the two shot ideas that are not built.
 *
 * A hand held on something falling is the one thing in the game that costs the
 * player who does it (`docs/spec/assists.md` 6.4), and the sound says so: the
 * grab is bright, and then there is a creak once a beat for as long as it is
 * held. The other player hears what it is costing without being told, which is
 * the only way this mechanic pays for itself across a voice delay.
 */

import { after, air, burst, chime, glint, noise, soft, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const GRIP_SOUNDS: SoundDef[] = [
  {
    id: "ship.gripTake",
    family: "ship",
    blurb: "A hand landing on something falling: a soft grab, then the line going taut.",
    status: "bound",
    use: "THE GRIP: the moment a hand takes hold.",
    level: 0.4,
    layers: [
      noise(1200, { type: "bandpass", freq: 1800, toFreq: 500, q: 1.6 }, 0.002, 0.04, 0.5),
      thud(180, 90, 0.12, 0.5),
      after(0.05, soft(0.6, glint(3600, 0.14))),
    ],
  },
  {
    id: "ship.gripStrain",
    family: "ship",
    blurb: "The line under load, creaking once per beat.",
    status: "bound",
    use: "Repeated while a hand is held, so the other player hears the cost of it.",
    level: 0.16,
    layers: [
      {
        source: "sawtooth",
        freq: 88,
        toFreq: 78,
        gain: 0.4,
        attack: 0.06,
        release: 0.18,
        filter: { type: "lowpass", freq: 200, toFreq: 120, q: 3.4 },
        wobble: { rate: 9, cents: 22 },
      },
    ],
  },
  {
    id: "ship.gripCarry",
    family: "ship",
    blurb: "A held body dragged one tile: a short scrape, and the tile arriving under it.",
    status: "bound",
    use: "THE PUSH: the beat a carried body spends a column.",
    // Quieter than the grab and shorter than the creak. A body may be carried
    // every other beat and a beat is 625 ms at 96 BPM, so anything with a tail
    // on it would overlap itself before the pair had heard the first one.
    level: 0.26,
    layers: [
      noise(900, { type: "bandpass", freq: 1100, toFreq: 700, q: 2.2 }, 0.004, 0.07, 0.4),
      after(0.03, tick(0.22, 0, 2600)),
    ],
  },
  {
    id: "ship.gripSlip",
    family: "ship",
    blurb: "The line letting go. A downward scrape and nothing at the end of it.",
    status: "bound",
    use: "A grip lost — the creature gone, or the hand taken off.",
    level: 0.3,
    layers: [
      noise(2400, { type: "bandpass", freq: 2600, toFreq: 260, q: 1.2 }, 0.004, 0.16, 0.45),
      thud(120, 44, 0.14, 0.4),
    ],
  },
  {
    id: "ship.gripBoth",
    family: "ship",
    blurb: "Two hands on two things at once — the grab, doubled and briefly in tune.",
    status: "bound",
    // Written spare, with "if that is ever worth marking" against it, and THE
    // WEIGHT is the creature that made it worth marking: two hands on **one**
    // body at the same instant, which is the whole of how that body is beaten.
    // The doubling and the brief tuning are exactly the thing the pair just
    // achieved, and it is the only confirmation either of them gets that their
    // partner's thumb was down at all (`sim/weight.ts`).
    use: "THE WEIGHT giving: both seats pressing one body on the same tick.",
    level: 0.36,
    layers: [
      noise(1200, { type: "bandpass", freq: 1800, toFreq: 500, q: 1.6 }, 0.002, 0.04, 0.45),
      thud(180, 90, 0.12, 0.45),
      after(0.04, chime(4600, 0.22, 0.16)),
      after(0.04, chime(6900, 0.2, 0.11)),
    ],
  },
  {
    id: "ship.reload",
    family: "ship",
    blurb: "The cannon ready again: one small click, an octave over the fire.",
    status: "spare",
    use: "The reload gap ending, if the pair ever needs to hear the gun is free.",
    level: 0.18,
    layers: [tick(0.3, 0, 7200)],
  },
  {
    id: "ship.charge",
    family: "ship",
    blurb: "A shot held: a body swelling and tightening for a beat and a half.",
    status: "spare",
    use: "Charged shots (systems.md 5.4) — the trade the prototype does not make yet.",
    level: 0.3,
    layers: [
      {
        source: "triangle",
        freq: 70,
        toFreq: 190,
        gain: 0.5,
        attack: 0.5,
        hold: 0.2,
        release: 0.2,
        filter: { type: "lowpass", freq: 400, toFreq: 280, q: 2 },
        wobble: { rate: 7, cents: 25 },
      },
      soft(0.4, burst(tick(0.3, 0, 6800), 8, 0.09, 1.12)),
    ],
  },
  {
    id: "ship.merge",
    family: "ship",
    blurb: "Two bolts catching up with each other and becoming one, mid-flight.",
    status: "spare",
    use: "Bubble ammunition: two colours merging (systems.md 5.4).",
    level: 0.32,
    layers: [
      air(7000, 3600, 0.14, 0.2, 3),
      after(0.08, chime(5200, 0.3, 0.16, 900)),
      sub(90, 0.14, 0.3, 0.08),
    ],
  },
];
