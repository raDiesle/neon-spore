/**
 * THE GORGE's fourteen, in a file of their own so `boss.ts` stays under its limit.
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
    id: "boss.gorgeNick",
    family: "boss",
    blurb: "A full skin pricked and holding: a short wet prick, and a small give under it.",
    status: "bound",
    use: "THE GORGE's full intake taking a shot short of the rupture — the pierce landed, and one more is owed.",
    level: 0.34,
    // The rupture's opening with the tear taken off it: the same skin, not
    // yet giving, so the two read as one act in two halves.
    layers: [
      noise(0.08, { type: "bandpass", freq: 3200, toFreq: 1800, q: 2 }, 0.003, 0.015, 0.45),
      after(0.03, soft(0.5, thud(150, 90, 0.12, 0.3))),
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
  // The two thumbs, and the beam refused (`sim/gorge-hand.ts`, 18 September
  // 2026). Wet like the rest: a pinch is a skin squeezed and holding, a pry
  // is a lip levered open, a clench is the lip snapping shut on nothing.
  {
    id: "boss.gorgePinch",
    family: "boss",
    blurb: "A full intake pinched shut under a thumb: a short squeeze, and the skin holding.",
    status: "bound",
    use: "THE GORGE — player 1's thumb closing on a full intake; the vent waits while it stays.",
    level: 0.34,
    layers: [
      noise(0.1, { type: "lowpass", freq: 1200, toFreq: 300, q: 1.4 }, 0.006, 0.03, 0.45),
      after(0.05, soft(0.5, sub(80, 0.3, 0.35))),
    ],
  },
  {
    id: "boss.gorgePry",
    family: "boss",
    blurb: "The mouth levered open: a slow wet parting and a thin tone held above it.",
    status: "bound",
    use: "THE GORGE — player 2's thumb prying the mouth open, the window the beam ends it in.",
    level: 0.38,
    layers: [
      noise(0.28, { type: "bandpass", freq: 600, toFreq: 3400, q: 1.6 }, 0.02, 0.08, 0.4),
      after(0.15, spore(2200, 0.8, 0.1, 8)),
    ],
  },
  {
    id: "boss.gorgePryFill",
    family: "boss",
    blurb: "A beam going into the held-open mouth: a deep wet gulp, and a tone left rising.",
    status: "bound",
    use: "THE GORGE — a beam in the pried mouth short of the last; one more ends the fight.",
    level: 0.4,
    // The swallow's gulp made slow and low, with the fill's tone left hanging
    // above the band as the thing still owed.
    layers: [
      noise(0.16, { type: "lowpass", freq: 900, toFreq: 220, q: 1.2 }, 0.01, 0.04, 0.42),
      after(0.1, spore(3000, 0.6, 0.1, 10)),
    ],
  },
  {
    id: "boss.gorgeClench",
    family: "boss",
    blurb: "The mouth snapping shut on the beam: a hard wet clap, and nothing going in.",
    status: "bound",
    use: "THE GORGE — the beam on an unpried mouth, refused; or a pry held past its window, thrown off.",
    level: 0.4,
    layers: [
      noise(0.06, { type: "bandpass", freq: 3200, toFreq: 5200, q: 2 }, 0.002, 0.01, 0.5),
      after(0.02, thud(180, 60, 0.18, 0.4)),
    ],
  },
];
