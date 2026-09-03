/**
 * Pods: hanging, shot loose, falling, taken in, lost.
 *
 * A pod is the only friendly thing on the field, so it is the only family with
 * a consonant interval in it — everything else in the catalogue is ring
 * modulated and deliberately out of tune. The moment a pod is taken in is the
 * one moment the game sounds like it agrees with you.
 */

import { after, air, burst, chime, glint, noise, soft, spore, sub, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const POD_SOUNDS: SoundDef[] = [
  {
    id: "pod.blink",
    family: "pod",
    blurb: "A tiny high pip on the beat — the blinking core, heard.",
    status: "spare",
    use: "A pod hanging, once every few beats, so the navigator hears one is up there.",
    level: 0.16,
    layers: [glint(6800, 0.05, 0.5)],
  },
  {
    id: "pod.loose",
    family: "pod",
    blurb: "A tether parting and the capsule dropping away from it.",
    status: "bound",
    use: "A pod shot loose from its mooring.",
    level: 0.38,
    layers: [
      tick(0.45, 0, 4600),
      noise(2600, { type: "bandpass", freq: 3000, toFreq: 700, q: 1.6 }, 0.002, 0.09, 0.4),
      after(0.04, {
        source: "sine",
        freq: 420,
        toFreq: 190,
        gain: 0.4,
        attack: 0.01,
        release: 0.3,
      }),
    ],
  },
  {
    id: "pod.fall",
    family: "pod",
    blurb: "A capsule tumbling: a wobbling tone that keeps sinking.",
    status: "spare",
    use: "A loose pod on its way down, once per beat, so its column can be called.",
    level: 0.18,
    layers: [spore(340, 0.3, 0.4, 45)],
  },
  {
    id: "pod.takenMend",
    family: "pod",
    blurb: "Taken in and answered by a rising fifth. Warm, and over quickly.",
    status: "bound",
    use: "A mend pod swallowed.",
    level: 0.42,
    layers: [
      spore(180, 0.14, 0.4, 30),
      after(0.08, chime(4400, 0.26, 0.2, 900)),
      after(0.14, chime(6600, 0.3, 0.16, 1300)),
      sub(80, 0.2, 0.4),
    ],
  },
  {
    id: "pod.takenPurge",
    family: "pod",
    blurb: "Taken in and answered downward — relief, not reward.",
    status: "bound",
    use: "A purge pod swallowed.",
    level: 0.42,
    layers: [
      spore(180, 0.14, 0.4, 30),
      after(0.08, chime(6600, 0.26, 0.18, 1300)),
      after(0.15, chime(4400, 0.3, 0.18, 900)),
      sub(72, 0.24, 0.4),
    ],
  },
  {
    id: "pod.takenWard",
    family: "pod",
    blurb: "Taken in and held: the answer does not decay, it sits there.",
    status: "bound",
    use: "A ward pod swallowed.",
    level: 0.42,
    layers: [
      spore(180, 0.14, 0.4, 30),
      after(0.08, {
        source: "triangle",
        freq: 5200,
        gain: 0.16,
        attack: 0.02,
        hold: 0.4,
        release: 0.3,
        ring: { freq: 1500, depth: 0.4 },
      }),
      sub(96, 0.5, 0.4),
    ],
  },
  {
    id: "pod.lost",
    family: "pod",
    blurb: "It goes past. A falling tone that does not land on anything.",
    status: "bound",
    use: "A pod reaching the bottom untaken.",
    level: 0.3,
    layers: [
      {
        source: "triangle",
        freq: 620,
        toFreq: 150,
        gain: 0.4,
        attack: 0.02,
        release: 0.5,
        wobble: { rate: 4, cents: 40 },
      },
      after(0.3, soft(0.5, air(1800, 300, 0.24, 0.16, 2))),
    ],
  },
  {
    id: "pod.chew",
    family: "pod",
    blurb: "The maw working: three soft closes, slower each time.",
    status: "spare",
    use: "The swallow's two-part clock. Needs the middle of the swallow, which only render/ tracks.",
    level: 0.22,
    layers: [
      burst(
        noise(700, { type: "lowpass", freq: 520, toFreq: 180, q: 2.2 }, 0.01, 0.05, 0.4),
        3,
        0.14,
        0.82,
      ),
    ],
  },
  {
    id: "pod.refused",
    family: "pod",
    blurb: "It touches the maw and is not taken. A short damped knock.",
    status: "spare",
    use: "An intake opened on the wrong column, or a pod kind the hull cannot use yet.",
    level: 0.26,
    layers: [
      noise(500, { type: "lowpass", freq: 300, q: 2 }, 0.002, 0.05, 0.5),
      sub(64, 0.07, 0.4),
    ],
  },
  {
    id: "pod.overcharge",
    family: "pod",
    blurb: "A second pod on top of one still working: the answer stacks and goes sharp.",
    status: "spare",
    use: "Two pods taken inside one window, if that ever becomes a thing worth doing.",
    level: 0.4,
    layers: [
      spore(200, 0.12, 0.4, 30),
      after(0.06, chime(4400, 0.3, 0.18, 900)),
      after(0.1, chime(5200, 0.3, 0.16, 1000)),
      after(0.14, chime(6200, 0.34, 0.16, 1200)),
    ],
  },
];
