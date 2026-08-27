/**
 * The hull taking it.
 *
 * The one family allowed to be ugly. Everything else in the game is neon and
 * glass; damage is a sawtooth with the top filtered off, which is the same
 * material the rocks are made of — the hull and the thing that broke it are
 * heard to be the same stuff, and only the ship's is answered by an alarm.
 *
 * `hull.alarm` and `hull.dead` are the two sounds allowed into the speech band
 * (`band.ts`), and the rule they satisfy is not loudness but timing: nobody is
 * mid-sentence at the moment the run ends.
 */

import { after, air, burst, glint, metal, soft, spore, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const HULL_SOUNDS: SoundDef[] = [
  {
    id: "hull.breachLight",
    family: "hull",
    blurb: "A knock on the plate. It held.",
    status: "bound",
    use: "An arrival costing little hull.",
    level: 0.44,
    layers: [thud(140, 44, 0.2, 0.7), metal(64, 0.16, 0.4, 110), soft(0.5, tick(0.4, 0, 3400))],
  },
  {
    id: "hull.breachHeavy",
    family: "hull",
    blurb: "The plate going. A long low tear with the room shaking after it.",
    status: "bound",
    use: "An arrival costing real hull — a rock, or a wide creature.",
    level: 0.55,
    layers: [
      thud(180, 30, 0.5, 0.85),
      metal(52, 0.34, 0.55, 120),
      {
        source: "noise",
        freq: 600,
        gain: 0.4,
        attack: 0.004,
        release: 0.3,
        filter: { type: "lowpass", freq: 500, toFreq: 90, q: 1.2 },
      },
      after(0.12, soft(0.5, burst(metal(70, 0.1, 0.3, 100), 3, 0.09, 0.7))),
    ],
  },
  {
    id: "hull.crack",
    family: "hull",
    blurb: "A scar opening further, without anything having hit it.",
    status: "spare",
    use: "A crater growing after the impact that made it — waiting on a scar event to hang off.",
    level: 0.26,
    layers: [
      {
        source: "noise",
        freq: 1600,
        gain: 0.5,
        attack: 0.001,
        release: 0.06,
        filter: { type: "bandpass", freq: 2400, toFreq: 900, q: 3.2 },
      },
      sub(70, 0.1, 0.35),
    ],
  },
  {
    id: "hull.alarm",
    family: "hull",
    blurb: "Two tones a semitone apart, alternating. Deliberately hard to talk over.",
    status: "bound",
    use: "Hull below the last quarter. It repeats until the hull is mended.",
    level: 0.34,
    pierce: "Below a quarter hull there is one thing left to say, and this is it saying it.",
    layers: [
      {
        source: "triangle",
        freq: 740,
        gain: 0.35,
        attack: 0.01,
        hold: 0.1,
        release: 0.08,
        repeat: { times: 2, every: 0.31, decay: 1 },
      },
      {
        source: "triangle",
        freq: 700,
        gain: 0.32,
        at: 0.155,
        attack: 0.01,
        hold: 0.1,
        release: 0.08,
        repeat: { times: 2, every: 0.31, decay: 1 },
      },
      sub(58, 0.5, 0.45),
    ],
  },
  {
    id: "hull.mend",
    family: "hull",
    blurb: "Something knitting: a rising body and a run of small clicks closing over it.",
    status: "bound",
    use: "Hull repaired — the mend pod taken in.",
    level: 0.4,
    layers: [
      { source: "sine", freq: 90, toFreq: 210, gain: 0.5, attack: 0.1, hold: 0.1, release: 0.3 },
      burst(tick(0.28, 0, 6200), 7, 0.055, 0.9, 4),
      after(0.24, soft(0.7, glint(5600, 0.3))),
    ],
  },
  {
    id: "hull.dead",
    family: "hull",
    blurb: "Everything at once, then everything gone: a fall from the top of the range to nothing.",
    status: "bound",
    use: "The run ending.",
    level: 0.6,
    pierce: "The run is over. There is no sentence left for it to be in the way of.",
    layers: [
      {
        source: "sawtooth",
        freq: 400,
        toFreq: 34,
        gain: 0.55,
        attack: 0.01,
        release: 1.5,
        filter: { type: "lowpass", freq: 2600, toFreq: 90, q: 1.4 },
      },
      {
        source: "noise",
        freq: 4000,
        gain: 0.4,
        attack: 0.02,
        release: 1.2,
        filter: { type: "bandpass", freq: 3600, toFreq: 200, q: 0.8 },
      },
      after(0.9, soft(0.6, spore(64, 0.9, 0.4, 60))),
    ],
  },
  {
    id: "hull.holdOut",
    family: "hull",
    blurb: "The hull at one hit left, ringing on its own. Thin and very low.",
    status: "spare",
    use: "The last sliver of hull, if the alarm ever needs a floor under it.",
    level: 0.24,
    layers: [
      {
        source: "triangle",
        freq: 44,
        gain: 0.5,
        attack: 0.4,
        hold: 0.6,
        release: 0.9,
        wobble: { rate: 1.6, cents: 30 },
      },
    ],
  },
  {
    id: "hull.cockpitCrack",
    family: "hull",
    blurb: "Glass giving way somewhere behind you, one line at a time.",
    status: "spare",
    use: "Cracks in the cockpit (ideas.md, deliberately deferred).",
    level: 0.3,
    layers: [
      burst(
        {
          source: "noise",
          freq: 3000,
          gain: 0.45,
          attack: 0.001,
          release: 0.05,
          filter: { type: "bandpass", freq: 3800, toFreq: 2600, q: 4 },
        },
        5,
        0.13,
        0.78,
        -6,
      ),
      sub(50, 0.5, 0.3),
    ],
  },
  {
    id: "hull.purge",
    family: "hull",
    blurb: "Everything docked being thrown off at once: a hard sheet of air outward.",
    status: "spare",
    use: "The purge pod, if the answer should be the hull rather than the pod. `pod.takenPurge` carries it today.",
    level: 0.42,
    layers: [
      air(700, 9000, 0.3, 0.28, 1.2),
      thud(200, 48, 0.2, 0.6),
      after(0.14, soft(0.5, burst(tick(0.3, 0, 5400), 4, 0.06, 0.7))),
    ],
  },
  {
    id: "hull.ward",
    family: "hull",
    blurb: "The shield staying up by itself: a body settling and refusing to decay.",
    status: "spare",
    use: "The ward pod, likewise. `pod.takenWard` carries it today; this is the hull's half of the same moment.",
    level: 0.38,
    layers: [
      { source: "sine", freq: 150, gain: 0.5, attack: 0.06, hold: 0.5, release: 0.4 },
      soft(0.6, air(3600, 5200, 0.5, 0.16, 2.2)),
      after(0.06, soft(0.6, glint(4400, 0.5))),
    ],
  },
];
