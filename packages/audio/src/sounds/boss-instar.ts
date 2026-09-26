/**
 * THE INSTAR's twelve, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **body over the field that changes shape**, and everything
 * here is the sound of chitin and what is under it: the enter is a weight
 * settling and a shell creaking; the morph is the shell splitting and the
 * new pose sliding out of it, a long wet slide; the show is the marks
 * lighting, a short bright click per pose — the one sound that says *now*;
 * the refuse is a dry knock, flat, the boss's *not yours*; the answer is the
 * part giving a little, a slap or a pull's creak; the shove is the jaw
 * forcing itself open under a thumb, a low grinding heave on the beat; the done is the part
 * giving whole, a snap and a release; the slip is it clamping back, a wet
 * suck; the land is the beat landed, a chord for the pair, pitched up as the
 * steps go by; the strike is the part hitting the hull, the one heavy thing
 * here. The down is the last landing under THE SLOW, the whole body
 * loosening; the out is it dropping away. Low and soft under the band, or
 * short and high above it, as ever (docs/spec/audio.md §1).
 */

import { after, air, burst, glint, noise, soft, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_INSTAR_SOUNDS: SoundDef[] = [
  {
    id: "boss.instarEnter",
    family: "boss",
    blurb: "A weight settling over the field and a shell creaking under it.",
    status: "bound",
    use: "THE INSTAR arriving, its first pose still to take.",
    level: 0.36,
    layers: [swell(56, 1.3, 0.1), after(0.3, soft(0.5, spore(240, 0.5, 0.14, 40)))],
  },
  {
    id: "boss.instarMorph",
    family: "boss",
    blurb: "The shell splitting and the next pose sliding out of it: a long wet slide.",
    status: "bound",
    use: "THE INSTAR morphing into a pose, marks hidden while it does.",
    level: 0.34,
    layers: [
      noise(0.12, { type: "bandpass", freq: 700, toFreq: 400, q: 2 }, 0.004, 0.08, 0.4),
      after(0.1, air(600, 1800, 0.5, 0.12, 1.8)),
      after(0.2, soft(0.5, sub(70, 0.4, 0.3))),
    ],
  },
  {
    id: "boss.instarShow",
    family: "boss",
    blurb: "The marks lighting: a short bright click, and the window is open.",
    status: "bound",
    use: "THE INSTAR's marks up for a pose — the one sound that says now.",
    level: 0.4,
    layers: [tick(0.24, 0, 3400), after(0.05, glint(2800, 0.25, 0.14))],
  },
  {
    id: "boss.instarRefuse",
    family: "boss",
    blurb: "A dry knock, flat: not yours.",
    status: "bound",
    use: "A thumb from the wrong seat on one of THE INSTAR's marks.",
    level: 0.28,
    layers: [thud(260, 140, 0.06, 0.3), after(0.02, soft(0.3, tick(0.1, 0, 2400)))],
  },
  {
    id: "boss.instarAnswer",
    family: "boss",
    blurb: "The part giving a little: a slap landing, an egg coming away, a notch of a turn.",
    status: "bound",
    use: "One unit of a mark's need on THE INSTAR — a tap, a swipe lifted, a quarter turn, a pull halfway.",
    level: 0.3,
    layers: [thud(300, 160, 0.08, 0.3), after(0.02, soft(0.4, spore(420, 0.12, 0.1, 30)))],
  },
  {
    id: "boss.instarShove",
    family: "boss",
    blurb: "The jaw forcing itself open under the thumb: a low grinding heave, on the beat.",
    status: "bound",
    use: "THE INSTAR pushing back against a thumb on a pull, once a beat — louder and lower the harder it pushes.",
    level: 0.38,
    layers: [
      noise(0.14, { type: "bandpass", freq: 260, toFreq: 180, q: 3 }, 0.01, 0.1, 0.45),
      after(0.02, thud(140, 70, 0.14, 0.34)),
      after(0.06, soft(0.5, sub(52, 0.3, 0.3))),
    ],
  },
  {
    id: "boss.instarDone",
    family: "boss",
    blurb: "The part giving whole: a snap and a release of air.",
    status: "bound",
    use: "A mark of THE INSTAR reaching its need — the hand opens, the tail lifts.",
    level: 0.42,
    layers: [
      tick(0.2, 0, 3000),
      after(
        0.03,
        noise(0.06, { type: "highpass", freq: 2600, toFreq: 3600, q: 0.9 }, 0.002, 0.03, 0.4),
      ),
      after(0.08, air(2400, 900, 0.3, 0.12, 1.5)),
    ],
  },
  {
    id: "boss.instarSlip",
    family: "boss",
    blurb: "The part clamping back: a wet suck, and the count gone.",
    status: "bound",
    use: "A done mark of THE INSTAR slipping — its partner too late, or a pull let go of.",
    level: 0.34,
    layers: [
      air(1600, 500, 0.2, 0.12, 1.6),
      after(0.1, thud(200, 90, 0.1, 0.3)),
      after(0.14, soft(0.4, sub(70, 0.25, 0.3))),
    ],
  },
  {
    id: "boss.instarLand",
    family: "boss",
    blurb: "The beat landed: a chord for the pair, higher as the steps go by.",
    status: "bound",
    use: "Every mark of a step of THE INSTAR done together. Pitched up per step.",
    level: 0.44,
    layers: [
      glint(2600, 0.3, 0.16),
      after(0.04, glint(3200, 0.3, 0.14)),
      after(0.1, tick(0.16, 0, 3600)),
    ],
  },
  {
    id: "boss.instarStrike",
    family: "boss",
    blurb: "The part hitting the hull: one heavy blow, and the plating going.",
    status: "bound",
    use: "THE INSTAR's window closing on an undone mark — the strike, and the wave.",
    level: 0.5,
    layers: [
      thud(160, 50, 0.24, 0.5),
      after(0.02, burst(tick(0.14, 0, 3000), 3, 0.04, 0.8, 30)),
      after(0.1, sub(48, 0.5, 0.4)),
    ],
  },
  {
    id: "boss.instarDown",
    family: "boss",
    blurb: "The last landing: the whole body loosening, and the beat slowing under it.",
    status: "bound",
    use: "THE INSTAR's last step landed — under THE SLOW.",
    level: 0.5,
    layers: [
      noise(0.1, { type: "highpass", freq: 3400, toFreq: 4600, q: 0.9 }, 0.002, 0.04, 0.5),
      after(0.05, air(5200, 7400, 0.4, 0.16, 1.4)),
      after(0.15, sub(44, 0.6, 0.4)),
    ],
  },
  {
    id: "boss.instarOut",
    family: "boss",
    blurb: "The body dropping away: a weight going, and the field clearing.",
    status: "bound",
    use: "THE INSTAR gone — then the wave-end light.",
    level: 0.5,
    layers: [
      sub(56, 0.5, 0.35),
      after(0.1, air(4200, 7000, 0.6, 0.14, 1.5)),
      after(0.4, glint(3200, 0.5, 0.14)),
      after(0.5, air(4200, 9000, 0.9, 0.16, 1.5)),
    ],
  },
];
