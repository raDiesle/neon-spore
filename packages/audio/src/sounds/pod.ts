/**
 * Pods: hanging, shot loose, falling, taken in, lost — and the two a husk
 * makes, which are this family's own vocabulary turned against itself.
 *
 * A pod is the only friendly thing on the field, so it is the only family with
 * a consonant interval in it — everything else in the catalogue is ring
 * modulated and deliberately out of tune. The moment a pod is taken in is the
 * one moment the game sounds like it agrees with you.
 *
 * **Which is exactly what a husk borrows.** It hangs silently like a pod and
 * parts from its mooring with `pod.loose` like a pod, because up to the mouth
 * it *is* one (`sim/pod-types.ts`); the two sounds below are the only ones in
 * the game that are a husk's. One of them is the funniest thing the catalogue
 * has and the other is the sourest, and they are the two ends of the one
 * moment the pair decides together.
 */

import { after, air, burst, chime, glint, noise, soft, spore, sub, thud, tick } from "../grain.js";
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
    id: "pod.huskFlight",
    family: "pod",
    blurb: "A balloon let go: a squeal that climbs, loses its nerve and runs out of air.",
    status: "bound",
    use: "A husk refused at a shut maw — the one moment in the game that is funny.",
    level: 0.34,
    layers: [
      // The neck: a narrow band of air, wide open and closing, wobbling far
      // harder than anything else in the catalogue. A balloon's note is its
      // own neck flapping, and the flap is the joke.
      //
      // **Wholly above the speech band**, which is where the joke had to move
      // to: a real balloon squeals at one to three kilohertz, which is a voice,
      // and this wave is one the pair spends talking over
      // (`test/catalogue.test.ts`, `judgeBand`). A balloon does whistle up
      // there too, and the shrieking end of it is the funnier end anyway.
      noise(4200, { type: "bandpass", freq: 3300, toFreq: 6400, q: 7 }, 0.006, 0.4, 0.4, {
        rate: 14,
        cents: 700,
      }),
      // And the pitch that goes with it: up, because the thing is getting away,
      // and then nowhere. It is the only rising line in a family whose every
      // other answer settles, which is what says *this one did not pay*.
      {
        source: "triangle",
        freq: 3200,
        toFreq: 5900,
        gain: 0.26,
        attack: 0.01,
        release: 0.46,
        wobble: { rate: 11, cents: 260 },
      },
      // The last of the air, thinner, as it drops out of the sky.
      after(0.42, air(5200, 3400, 0.22, 0.2, 2.4)),
    ],
  },
  {
    id: "pod.huskTaken",
    family: "pod",
    blurb: "The swallow, and then nothing arrives: the answer falls in on itself.",
    status: "bound",
    use: "A husk swallowed — the wave is lost on the same tick.",
    level: 0.46,
    layers: [
      // The first fifth of a second is `pod.taken*` note for note, because for
      // the first fifth of a second the pair believes it worked.
      spore(180, 0.14, 0.4, 30),
      // Then the interval that should have opened closes instead: a purge's two
      // chimes step down and *land*, and this one slides the whole way and is
      // pulled flat by a ring three times deeper than any other pod's, which is
      // the one gesture this family never otherwise makes.
      //
      // It falls to 4600 and not to a purge's 4400, and the eighty cycles
      // between them are not taste: the ring puts sidebands at f±1300, so a
      // carrier that ended any lower would be sitting on a voice for the last
      // third of a second (`band.ts`, `spectrumAt`).
      after(0.08, {
        source: "triangle",
        freq: 6300,
        toFreq: 4600,
        gain: 0.28,
        attack: 0.01,
        release: 0.36,
        ring: { freq: 1300, depth: 0.7 },
      }),
      // And the floor drops out under it.
      after(0.12, thud(150, 38, 0.6, 0.55)),
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
