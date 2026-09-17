/**
 * THE GORGE's nine, in a file of their own for `boss-candle.ts`' reason.
 *
 * The boss is a **sack full of fluid**, and everything here is wet: a bead
 * going in is a swallow, a bead coming out is a gulp in reverse, a full
 * intake is a skin stretched thin, a rupture is that skin giving. Nothing is
 * hard-edged but the vent, which is a torch and sounds like one leaving.
 * Low and soft under the band, or short and high above it: the swallow is
 * the one the pair hears dozens of times, and it is the shortest of them
 * (docs/spec/audio.md §1).
 */

import { after, air, burst, glint, noise, soft, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_GORGE_SOUNDS: SoundDef[] = [
  {
    id: "boss.gorgeSettle",
    family: "boss",
    blurb:
      "The sack settling into the top of the frame: a slow, wet descent and seven small puckers.",
    status: "bound",
    use: "THE GORGE arriving, its intakes empty.",
    level: 0.36,
    // The descent stays above the band and the weight of it below: a slow
    // sound through 300–3000 Hz is a voice covered for the whole of it.
    layers: [
      air(9000, 4200, 1.2, 0.2, 1.4),
      after(0.3, soft(0.6, swell(90, 1.2, 0.08))),
      after(0.9, burst(soft(0.5, tick(0.18, 0, 5200)), 7, 0.09, 0.9, 30)),
    ],
  },
  {
    id: "boss.gorgeSwallow",
    family: "boss",
    blurb: "A shot swallowed: one short gulp, the bead going in.",
    status: "bound",
    use: "THE GORGE taking a shot that reached the top of its column. Pitched up a step per bead held.",
    level: 0.32,
    layers: [noise(0.12, { type: "lowpass", freq: 1400, toFreq: 260, q: 1.2 }, 0.01, 0.03, 0.4)],
  },
  {
    id: "boss.gorgeEmptied",
    family: "boss",
    blurb: "A bead coming back out: the gulp reversed, and a small wet drop.",
    status: "bound",
    use: "THE GORGE taking the wrong colour and letting a bead go.",
    level: 0.32,
    layers: [
      noise(0.12, { type: "lowpass", freq: 260, toFreq: 1400, q: 1.2 }, 0.01, 0.03, 0.34),
      after(0.1, soft(0.6, tick(0.18, 0, 700))),
    ],
  },
  {
    id: "boss.gorgeFull",
    family: "boss",
    blurb: "An intake full: the skin stretched thin, a rising creak and a tone held.",
    status: "bound",
    use: "THE GORGE's intake at four beads, clear and about to vent — the pierce window.",
    level: 0.4,
    layers: [air(3200, 7000, 0.5, 0.2, 3), after(0.35, spore(4400, 0.8, 0.1, 8))],
  },
  {
    id: "boss.gorgeRupture",
    family: "boss",
    blurb: "The skin giving: a wet tear, a thud, and the beads spilling.",
    status: "bound",
    use: "THE GORGE's full intake pierced, for good.",
    level: 0.5,
    layers: [
      noise(0.3, { type: "bandpass", freq: 3200, toFreq: 500, q: 1.5 }, 0.004, 0.02, 0.5),
      after(0.04, thud(140, 50, 0.3, 0.4)),
      after(0.14, burst(soft(0.5, tick(0.2, 0, 1100)), 4, 0.06, 0.7, -60)),
    ],
  },
  {
    id: "boss.gorgeVent",
    family: "boss",
    blurb: "An intake letting go: a hiss out of a pinched throat and a torch leaving.",
    status: "bound",
    use: "THE GORGE's full intake nobody pierced, venting a torch down its column.",
    level: 0.46,
    layers: [
      noise(0.4, { type: "highpass", freq: 3000, toFreq: 6000, q: 0.8 }, 0.01, 0.06, 0.4),
      after(0.08, sub(60, 0.5, 0.3)),
    ],
  },
  {
    id: "boss.gorgeSpit",
    family: "boss",
    blurb: "A bead spat back: a short wet pop out of the sack.",
    status: "bound",
    use: "THE GORGE returning a swallowed bead down its column as a body.",
    level: 0.38,
    layers: [
      noise(0.1, { type: "bandpass", freq: 900, toFreq: 2200, q: 2 }, 0.004, 0.02, 0.45),
      after(0.03, soft(0.5, thud(220, 90, 0.16, 0.3))),
    ],
  },
  {
    id: "boss.gorgeMouth",
    family: "boss",
    blurb: "The last intake taking over: a low swell under the field and a thin tone above it.",
    status: "bound",
    use: "THE GORGE gorged — the mouth chosen, filling itself, waiting for the beam.",
    level: 0.42,
    layers: [swell(70, 1.6, 0.16), after(0.5, spore(1760, 1.2, 0.1, 6))],
  },
  {
    id: "boss.gorgeOut",
    family: "boss",
    blurb:
      "The sack rupturing along its whole width: a long tear and every bead leaving at once, upward.",
    status: "bound",
    use: "THE GORGE ended by the beam — the beads leave, then the wave-end light.",
    level: 0.52,
    layers: [
      noise(0.5, { type: "bandpass", freq: 8000, toFreq: 4200, q: 1.2 }, 0.004, 0.05, 0.5),
      after(0.06, sub(55, 0.5, 0.4)),
      after(0.1, burst(glint(3600, 0.16, 0.1), 12, 0.045, 0.85, 40)),
      after(0.2, air(4200, 9000, 0.9, 0.16, 1.5)),
    ],
  },
];
