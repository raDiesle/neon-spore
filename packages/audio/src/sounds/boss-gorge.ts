/**
 * THE GORGE's nine, in a file of their own so `boss.ts` stays under its limit.
 *
 * The boss is **bubbles full of fluid**, and everything here is wet: a shot
 * going in is a swallow, a shot coming out is a gulp in reverse, a sated
 * bubble is a skin stretched thin, a level cleared is every skin giving.
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
      "A level of bubbles settling into the middle of the field: a slow, wet descent and small puckers.",
    status: "bound",
    use: "THE GORGE hanging a level, its bubbles empty.",
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
    use: "THE GORGE taking a shot of a colour a bubble wants. Pitched up a step per shot held.",
    level: 0.32,
    layers: [noise(0.12, { type: "lowpass", freq: 1400, toFreq: 260, q: 1.2 }, 0.01, 0.03, 0.4)],
  },
  {
    id: "boss.gorgeEmptied",
    family: "boss",
    blurb: "A bead coming back out: the gulp reversed, and a small wet drop.",
    status: "bound",
    use: "THE GORGE taking a colour a bubble does not want, and letting a shot go.",
    level: 0.32,
    layers: [
      noise(0.12, { type: "lowpass", freq: 260, toFreq: 1400, q: 1.2 }, 0.01, 0.03, 0.34),
      after(0.1, soft(0.6, tick(0.18, 0, 700))),
    ],
  },
  {
    id: "boss.gorgeFull",
    family: "boss",
    blurb: "A bubble sated: the skin stretched thin, a rising creak and a tone held.",
    status: "bound",
    use: "THE GORGE's bubble with every shot it wants; shut for good.",
    level: 0.4,
    layers: [air(3200, 7000, 0.5, 0.2, 3), after(0.35, spore(4400, 0.8, 0.1, 8))],
  },
  {
    id: "boss.gorgeCleared",
    family: "boss",
    blurb: "A level done: a wet tear, a thud, and the bubbles letting go.",
    status: "bound",
    use: "THE GORGE's every bubble of a level sated; the next is hung after a pause.",
    level: 0.5,
    layers: [
      noise(0.3, { type: "bandpass", freq: 3200, toFreq: 500, q: 1.5 }, 0.004, 0.02, 0.5),
      after(0.04, thud(140, 50, 0.3, 0.4)),
      after(0.14, burst(soft(0.5, tick(0.2, 0, 1100)), 4, 0.06, 0.7, -60)),
    ],
  },
  {
    id: "boss.gorgeSpit",
    family: "boss",
    blurb: "A shot refused: a short wet pop, spat back down.",
    status: "bound",
    use: "THE GORGE refusing a shot out of turn or into a shut bubble, sent back down its column as a body.",
    level: 0.38,
    layers: [
      noise(0.1, { type: "bandpass", freq: 900, toFreq: 2200, q: 2 }, 0.004, 0.02, 0.45),
      after(0.03, soft(0.5, thud(220, 90, 0.16, 0.3))),
    ],
  },
  {
    id: "boss.gorgeOut",
    family: "boss",
    blurb: "The last level gone: a long tear and every bubble leaving at once, upward.",
    status: "bound",
    use: "THE GORGE's last level sated — the bubbles leave, then the wave-end light.",
    level: 0.52,
    layers: [
      noise(0.5, { type: "bandpass", freq: 8000, toFreq: 4200, q: 1.2 }, 0.004, 0.05, 0.5),
      after(0.06, sub(55, 0.5, 0.4)),
      after(0.1, burst(glint(3600, 0.16, 0.1), 12, 0.045, 0.85, 40)),
      after(0.2, air(4200, 9000, 0.9, 0.16, 1.5)),
    ],
  },
  // The tap and the turn (`sim/gorge-hand.ts`, 1 October 2026). Wet like the
  // rest: a tap is a skin pressed and giving a little, a turn is the ring
  // sliding a step round.
  {
    id: "boss.gorgeTap",
    family: "boss",
    blurb: "A shut bubble pressed: a short squeeze, and the skin giving a little.",
    status: "bound",
    use: "THE GORGE — player 1's tap on the bubble at the bottom of the ring. Pitched up a step per tap; the last opens it.",
    level: 0.34,
    layers: [
      noise(0.1, { type: "lowpass", freq: 1200, toFreq: 300, q: 1.4 }, 0.006, 0.03, 0.45),
      after(0.05, soft(0.5, sub(80, 0.3, 0.35))),
    ],
  },
  {
    id: "boss.gorgeTurn",
    family: "boss",
    blurb: "The ring turning a step: a slow wet slide and a thin tone held above it.",
    status: "bound",
    use: "THE GORGE's ring turning, and a new bubble at the bottom to be opened.",
    level: 0.38,
    layers: [
      noise(0.28, { type: "bandpass", freq: 600, toFreq: 3400, q: 1.6 }, 0.02, 0.08, 0.4),
      after(0.15, spore(2200, 0.8, 0.1, 8)),
    ],
  },
];
