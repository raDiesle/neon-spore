/**
 * The room. Quiet, long, and never in the foreground.
 *
 * There is no soundtrack — `docs/spec/systems.md` 5.3 rules one out, and the
 * reason is the voice channel, not taste. What is allowed is a floor: slow
 * movement under 200 Hz that tells a player whether the field is empty or
 * full without ever being a thing you listen to. Every sound here is a
 * one-shot the host repeats; nothing loops, because a loop that has to be
 * stopped is state, and state in audio is where the leaks are.
 */

import { after, air, burst, glint, soft, spore, swell, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const AMBIENT_SOUNDS: SoundDef[] = [
  {
    id: "ambient.void",
    family: "ambient",
    blurb: "Four seconds of almost nothing, drifting a little flat.",
    status: "spare",
    use: "The floor under an empty field.",
    level: 0.22,
    layers: [swell(46, 4, 0.5), soft(0.4, swell(69, 4, 0.3, 0.6))],
  },
  {
    id: "ambient.swarmNear",
    family: "ambient",
    blurb: "The same floor with something moving in it. Many small wobbles, no pitch.",
    status: "spare",
    use: "A field with a lot on it — pitched by creature count.",
    level: 0.24,
    layers: [
      swell(52, 3, 0.45),
      burst(soft(0.35, spore(200, 0.5, 0.3, 80)), 5, 0.5, 0.9, -6),
      soft(0.4, air(300, 900, 3, 0.12, 1)),
    ],
  },
  {
    id: "ambient.hullBreath",
    family: "ambient",
    blurb: "The hull's own note, in and out over three seconds.",
    status: "spare",
    use: "Under everything, always. It is what silence sounds like here.",
    level: 0.18,
    layers: [swell(58, 3, 0.5), soft(0.3, air(180, 420, 2.6, 0.14, 1.2))],
  },
  {
    id: "ambient.driftHigh",
    family: "ambient",
    blurb: "One far-off tone above the range everything else uses.",
    status: "spare",
    use: "The top of the field, so up there is not simply absent.",
    level: 0.14,
    layers: [
      {
        source: "sine",
        freq: 6200,
        gain: 0.3,
        attack: 1.2,
        hold: 0.6,
        release: 1.6,
        wobble: { rate: 0.2, cents: 20 },
      },
    ],
  },
  {
    id: "ambient.starWind",
    family: "ambient",
    blurb: "Filtered noise moving very slowly across the stereo field.",
    status: "spare",
    use: "Between waves, and behind the menu.",
    level: 0.16,
    layers: [air(200, 1400, 5, 0.22, 0.8), soft(0.5, air(1400, 200, 5, 0.18, 0.8, 2))],
  },
  {
    id: "ambient.pressure",
    family: "ambient",
    blurb: "A floor that is slightly too low and getting lower.",
    status: "spare",
    use: "A boss on the field, replacing the ordinary floor.",
    level: 0.24,
    layers: [
      { source: "sine", freq: 44, toFreq: 36, gain: 0.55, attack: 1.5, hold: 1, release: 2 },
      soft(0.4, swell(66, 4, 0.3)),
    ],
  },
  {
    id: "ambient.emberField",
    family: "ambient",
    blurb: "Small clicks scattered over four seconds, like something cooling.",
    status: "spare",
    use: "After a boss dies, before the next wave opens.",
    level: 0.18,
    layers: [burst(soft(0.5, tick(0.3, 0, 7000)), 9, 0.42, 0.88, -9), soft(0.5, swell(50, 4, 0.4))],
  },
  {
    id: "ambient.signalBloom",
    family: "ambient",
    blurb: "One slow chord opening from a single note. The old working title, as a sound.",
    status: "spare",
    use: "The title screen, or the end of a run that went well.",
    level: 0.26,
    layers: [
      swell(55, 4, 0.5),
      after(0.8, soft(0.6, swell(82.5, 3.2, 0.4))),
      after(1.6, soft(0.5, swell(110, 2.4, 0.35))),
      after(2.4, soft(0.6, glint(4400, 1.6, 0.16))),
    ],
  },
];
