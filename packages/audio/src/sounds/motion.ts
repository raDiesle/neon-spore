/**
 * The grid behaving oddly, and things ending.
 *
 * Two families. `motion` is a field that is not doing what a field does —
 * teleports, a lane change, a wave from below, the grid itself going out of
 * true. `ruin` is what is left afterwards, which the game currently spends in
 * one sound and could spend much better.
 */

import {
  after,
  air,
  burst,
  chime,
  glint,
  metal,
  noise,
  soft,
  spore,
  sub,
  swell,
  thud,
  tick,
} from "../grain.js";
import type { SoundDef } from "../types.js";

export const MOTION_SOUNDS: SoundDef[] = [
  {
    id: "motion.teleport",
    family: "motion",
    blurb: "Something leaving a tile and being in another one. Two clicks and a hole between them.",
    status: "bound",
    use: "THE CRAWLER taken by the beam once its last segment is off (`crawlerBeam`).",
    level: 0.32,
    layers: [
      tick(0.5, 0, 6800),
      { source: "sine", freq: 5200, toFreq: 260, gain: 0.3, attack: 0.004, release: 0.07 },
      after(0.1, {
        source: "sine",
        freq: 260,
        toFreq: 5200,
        gain: 0.3,
        attack: 0.004,
        release: 0.07,
      }),
      after(0.17, tick(0.5, 0, 6800)),
    ],
  },
  {
    id: "motion.laneShift",
    family: "motion",
    blurb: "A creature changing column: a body sliding sideways, panned as it goes.",
    status: "spare",
    use: "Any kind that does not hold its lane.",
    level: 0.22,
    layers: [
      {
        source: "triangle",
        freq: 200,
        toFreq: 230,
        gain: 0.35,
        attack: 0.04,
        release: 0.2,
        filter: { type: "lowpass", freq: 600, q: 2 },
        pan: -0.6,
      },
      after(0.06, soft(0.5, air(1800, 3400, 0.2, 0.16, 2.4))),
    ],
  },
  {
    id: "motion.reverse",
    family: "motion",
    blurb: "The field's direction inverted: a sweep that runs the wrong way.",
    status: "spare",
    use: "The reverse wave (ideas.md) — from below.",
    level: 0.34,
    layers: [
      air(3600, 9000, 1, 0.18, 2.2),
      { source: "sine", freq: 40, toFreq: 110, gain: 0.5, attack: 0.7, release: 0.5 },
      after(0.9, soft(0.6, glint(7400, 0.3))),
    ],
  },
  {
    id: "motion.gridPulse",
    family: "motion",
    blurb: "The grid itself, once. Very short, very high, almost inaudible.",
    status: "spare",
    use: "The crossing points lighting on the beat, if the picture ever wants an ear.",
    level: 0.12,
    layers: [glint(9600, 0.03, 0.4)],
  },
  {
    id: "motion.gridBend",
    family: "motion",
    blurb: "The grid going out of true for a moment.",
    status: "spare",
    use: "Bearing waves, and anything that changes what a column means.",
    level: 0.26,
    layers: [
      {
        source: "triangle",
        freq: 3400,
        toFreq: 3900,
        gain: 0.24,
        attack: 0.1,
        release: 0.4,
        ring: { freq: 800, depth: 0.5 },
        wobble: { rate: 3, cents: 80 },
      },
      soft(0.4, sub(58, 0.5, 0.4)),
    ],
  },
  {
    id: "motion.slowField",
    family: "motion",
    blurb: "Everything at three quarters speed, including the sound of it.",
    status: "spare",
    use: "THE GRIP holding something, heard from the other player's device.",
    level: 0.24,
    layers: [
      { source: "sine", freq: 96, toFreq: 72, gain: 0.45, attack: 0.3, hold: 0.4, release: 0.5 },
      soft(0.4, air(2200, 900, 0.9, 0.16, 1.4)),
    ],
  },
  {
    id: "motion.driftIn",
    family: "motion",
    blurb: "Something arriving from off the top of the field, taking its time.",
    status: "spare",
    use: "The first creature of a wave, so its column can be called before it is seen.",
    level: 0.2,
    layers: [air(6000, 1400, 1.4, 0.2, 1), soft(0.4, spore(180, 0.6, 0.3, 40, 0.9))],
  },
  {
    id: "ruin.emberFall",
    family: "ruin",
    blurb: "What is left of something, going past the hull without touching it.",
    status: "spare",
    use: "Debris after a kill — the part of a destroy that outlives the burst.",
    level: 0.2,
    layers: [
      burst(soft(0.5, tick(0.3, 0, 7400)), 5, 0.11, 0.8, -8),
      soft(0.4, air(2600, 700, 0.5, 0.14, 1.6)),
    ],
  },
  {
    id: "ruin.wreck",
    family: "ruin",
    blurb: "A pod burning out where it landed. Low, uneven, and going nowhere.",
    status: "spare",
    use: "The pod wreck already drawn in render/pods.ts.",
    level: 0.22,
    layers: [
      noise(500, { type: "lowpass", freq: 420, toFreq: 140, q: 1.2 }, 0.2, 1.2, 0.4, {
        rate: 2.4,
        cents: 100,
      }),
      soft(0.5, metal(52, 0.8, 0.35, 110)),
    ],
  },
  {
    id: "ruin.collapse",
    family: "ruin",
    blurb: "Something structural failing over a second and a half.",
    status: "bound",
    use: "THE GYRE's wheel, a beat after the last body has come off its rim.",
    level: 0.4,
    layers: [
      metal(70, 1.2, 0.5, 120),
      after(0.3, burst(soft(0.6, thud(160, 50, 0.24, 0.5)), 4, 0.24, 0.76)),
      after(1.2, soft(0.5, air(1400, 200, 0.8, 0.18, 1.2))),
    ],
  },
  {
    id: "ruin.silenceAfter",
    family: "ruin",
    blurb: "The field with nothing on it, held slightly too long.",
    status: "spare",
    use: "The beat after a boss dies, before the next wave opens.",
    level: 0.16,
    layers: [swell(44, 3, 0.5), soft(0.3, glint(7200, 1.4, 0.2, 1))],
  },
  {
    id: "ruin.runEnd",
    family: "ruin",
    blurb: "The last thing a run says: one low note, and the room going with it.",
    status: "spare",
    use: "Under the balance sheet, after `hull.dead` has finished.",
    level: 0.3,
    layers: [
      {
        source: "sine",
        freq: 55,
        gain: 0.6,
        attack: 0.7,
        hold: 1,
        release: 2,
        wobble: { rate: 0.4, cents: 12 },
      },
      soft(0.4, air(300, 120, 2.4, 0.14, 1)),
    ],
  },
  {
    id: "ruin.runSurvived",
    family: "ruin",
    blurb: "The same note, resolved upward instead. It costs one interval to say you lived.",
    status: "spare",
    use: "A run that ends by being finished rather than by the hull going.",
    level: 0.34,
    layers: [
      { source: "sine", freq: 55, toFreq: 82.5, gain: 0.55, attack: 0.8, hold: 0.8, release: 1.6 },
      after(1.2, soft(0.6, chime(4400, 1, 0.18, 1100))),
      after(1.6, soft(0.5, chime(6600, 1.2, 0.14, 1600))),
    ],
  },
];
