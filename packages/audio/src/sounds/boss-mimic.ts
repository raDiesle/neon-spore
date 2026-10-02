/**
 * THE MIMIC's thirteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a soft mantle of wet skin**, and everything here is close and
 * damp: the enter is the wet slap of the mottle popping into shape; a sign
 * surfacing is a soft rising swell with a ring at the top, and a change the
 * same sinking and rising again. A peel is the spec's soft *thwip*, pitched
 * up as the signs come off; a wrong sign a low smear, and a lapse the skin
 * going back to mottle with a sigh. A reach is the low creak of an arm
 * stretching a step down, deeper as the arms near the hull. The roll is a
 * heavy wet turn, the core a ring with a pulse, the hit a shot into it, the
 * close a skin sealing, the spent a shapeless fall and the out the field
 * clearing. Low and soft under the band, or short and high above it, as ever
 * (`docs/spec/audio.md` §1).
 */

import { after, air, glint, metal, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_MIMIC_SOUNDS: SoundDef[] = [
  {
    id: "boss.mimicEnter",
    family: "boss",
    blurb: "A wet slap: the mottle pops into a round mantle.",
    status: "bound",
    use: "THE MIMIC slapping into shape at the top of the field.",
    level: 0.44,
    layers: [
      thud(300, 120, 0.04, 0.2),
      after(0.04, noise(700, { type: "lowpass", freq: 700, q: 1 }, 0.01, 0.18, 0.12)),
    ],
  },
  {
    id: "boss.mimicSign",
    family: "boss",
    blurb: "A soft rising swell with a ring: a sign surfacing on the skin.",
    status: "bound",
    use: "A sign on the skin: one of you sees it and says it, the other draws it.",
    level: 0.36,
    layers: [swell(330, 0.4, 0.08), after(0.35, glint(2200, 0.3, 0.1))],
  },
  {
    id: "boss.mimicChange",
    family: "boss",
    blurb: "The ring sinking and rising again: the sign changed.",
    status: "bound",
    use: "The sign sank and another rose in its place: draw the new one.",
    level: 0.38,
    layers: [
      glint(2200, 0.15, 0.1),
      after(0.18, glint(1800, 0.15, 0.1)),
      after(0.36, glint(2600, 0.25, 0.12)),
    ],
  },
  {
    id: "boss.mimicPeel",
    family: "boss",
    blurb: "A soft thwip: a sign peeling off the skin; the pitch climbs per sign.",
    status: "bound",
    use: "A sign drawn right, peeling off and falling down the field.",
    level: 0.36,
    layers: [air(900, 2800, 0.18, 0.12, 2.4), after(0.08, tick(0.14, 0, 3000))],
  },
  {
    id: "boss.mimicWrong",
    family: "boss",
    blurb: "A low smear: the skin wearing the wrong sign.",
    status: "bound",
    use: "A wrong sign drawn: the skin wears it for two beats, on both screens.",
    level: 0.4,
    layers: [
      metal(150, 0.3, 0.16, 200),
      noise(500, { type: "lowpass", freq: 500, q: 1 }, 0.02, 0.25, 0.08),
    ],
  },
  {
    id: "boss.mimicLapse",
    family: "boss",
    blurb: "A sigh: the sign sinking back into mottle undrawn.",
    status: "bound",
    use: "A sign's window run out with nothing drawn.",
    level: 0.32,
    layers: [air(1400, 500, 0.5, 0.08, 1.4)],
  },
  {
    id: "boss.mimicReach",
    family: "boss",
    blurb: "A low creak: an arm stretching a step down the field.",
    status: "bound",
    use: "An arm reaching toward the hull; three in a movement strike it.",
    level: 0.42,
    layers: [metal(110, 0.45, 0.18, 220), sub(52, 0.35, 0.2)],
  },
  {
    id: "boss.mimicRoll",
    family: "boss",
    blurb: "A heavy wet turn: the mimic rolling its other face round.",
    status: "bound",
    use: "Between movements: the seat that sees the sign changes.",
    level: 0.4,
    layers: [swell(64, 0.7, 0.12), after(0.3, thud(220, 110, 0.04, 0.14))],
  },
  {
    id: "boss.mimicCore",
    family: "boss",
    blurb: "A ring with a pulse: the core bare and lit.",
    status: "bound",
    use: "The core bared in a colour: shoot it.",
    level: 0.4,
    layers: [swell(78, 0.6, 0.1), after(0.25, glint(2400, 0.4, 0.14))],
  },
  {
    id: "boss.mimicHit",
    family: "boss",
    blurb: "A shot into the core; the pitch climbs per hit.",
    status: "bound",
    use: "The core shot in its colour.",
    level: 0.46,
    layers: [thud(420, 260, 0.04, 0.12), metal(240, 0.35, 0.18, 300)],
  },
  {
    id: "boss.mimicClose",
    family: "boss",
    blurb: "A skin sealing over the core.",
    status: "bound",
    use: "The core's window run out: the skin closes and splits again.",
    level: 0.36,
    layers: [
      noise(600, { type: "lowpass", freq: 600, q: 1 }, 0.02, 0.22, 0.1),
      after(0.12, thud(200, 120, 0.03, 0.12)),
    ],
  },
  {
    id: "boss.mimicSpent",
    family: "boss",
    blurb: "A shapeless fall, its arms trailing.",
    status: "bound",
    use: "THE MIMIC beaten, falling down the field as plain mottle.",
    level: 0.44,
    layers: [sub(42, 0.6, 0.36), after(0.2, air(1600, 400, 0.8, 0.08, 1.4))],
  },
  {
    id: "boss.mimicOut",
    family: "boss",
    blurb: "The mimic gone, and the field clearing.",
    status: "bound",
    use: "THE MIMIC gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE LAMPREY's own out (`sounds/boss-lamprey.ts`).
    layers: [
      sub(48, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3100, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
