/**
 * THE BURGEE's fifteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a canvas pennant on a steel boom, swinging on its own**, and
 * everything here is cloth and metal: the enter is the boom swinging in, a
 * low swell under a creak of air; the light is a step waking, one dry tick.
 * The freeze is the flag stopped dead, a taut snap; the flap is a tap that
 * missed it, a loose slap of cloth; the lapse is the flag let go, a soft
 * fall of air. The flutter is a loose that caught nothing, limp and with no
 * snap, as §39 asks; the catch is the snap and a knock, pitched up per
 * catch. The spindle is the only lit thing on the body, a hum with a glint;
 * the recatch a shorter snap, the sway and the dim a flag falling slack and
 * a light going down. The hit is a shot into the spindle, the miss the
 * hull's dull strike, the spent the flag swinging free, and the out the
 * field clearing. Low and soft under the band, or short and high above it,
 * as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_BURGEE_SOUNDS: SoundDef[] = [
  {
    id: "boss.burgeeEnter",
    family: "boss",
    blurb: "A boom swinging in: a low swell under a creak of air.",
    status: "bound",
    use: "THE BURGEE arriving, the flag loose over the middle.",
    level: 0.42,
    layers: [
      swell(62, 1.0, 0.12),
      after(0.3, noise(900, { type: "bandpass", freq: 900, q: 2 }, 0.03, 0.3, 0.04)),
    ],
  },
  {
    id: "boss.burgeeLight",
    family: "boss",
    blurb: "One dry tick: a step on the boom waking.",
    status: "bound",
    use: "A step lit: a column to catch the flag over, or the spindle to shoot.",
    level: 0.34,
    layers: [tick(0.2, 0, 2500), after(0.06, tick(0.08, 0, 2900))],
  },
  {
    id: "boss.burgeeFreeze",
    family: "boss",
    blurb: "A taut snap: the flag stopped dead.",
    status: "bound",
    use: "A tap stilled the flag over the lit column; the other seat may loose.",
    level: 0.36,
    layers: [noise(3200, { type: "highpass", freq: 3200, q: 1 }, 0.004, 0.05, 0.12)],
  },
  {
    id: "boss.burgeeFlap",
    family: "boss",
    blurb: "A loose slap of cloth: a tap that missed the flag.",
    status: "bound",
    use: "A tap came while the flag was off the lit column; it swings on.",
    level: 0.28,
    layers: [noise(700, { type: "bandpass", freq: 700, q: 1.2 }, 0.01, 0.12, 0.1)],
  },
  {
    id: "boss.burgeeLapse",
    family: "boss",
    blurb: "A soft fall of air: the flag let go.",
    status: "bound",
    use: "The freeze ran out before a catch; the flag swings again.",
    level: 0.3,
    layers: [air(1400, 600, 0.25, 0.1, 2)],
  },
  {
    id: "boss.burgeeFlutter",
    family: "boss",
    blurb: "A limp flutter with no snap.",
    status: "bound",
    use: "A loose that caught nothing: not drawn, not frozen, or the wrong way.",
    level: 0.28,
    layers: [air(500, 1100, 0.2, 0.08, 3)],
  },
  {
    id: "boss.burgeeCatch",
    family: "boss",
    blurb: "A snap and a knock: the flag caught taut.",
    status: "bound",
    use: "A catch landed; panned to the lit column. Pitched up per catch.",
    level: 0.42,
    layers: [glint(1900, 0.12, 0.12), after(0.05, thud(260, 140, 0.05, 0.14))],
  },
  {
    id: "boss.burgeeSpindle",
    family: "boss",
    blurb: "A low hum and a glint: the spindle lighting.",
    status: "bound",
    use: "Both catches in; the spindle lit and the flag held on it.",
    level: 0.44,
    layers: [sub(66, 0.35, 0.16), after(0.04, glint(2300, 0.25, 0.12))],
  },
  {
    id: "boss.burgeeRecatch",
    family: "boss",
    blurb: "A short snap: the creeping flag caught back.",
    status: "bound",
    use: "The flag caught again under the spindle; it stays lit.",
    level: 0.38,
    layers: [glint(2100, 0.1, 0.1), after(0.03, thud(280, 160, 0.04, 0.1))],
  },
  {
    id: "boss.burgeeSway",
    family: "boss",
    blurb: "The flag falling slack: a slow sigh of cloth.",
    status: "bound",
    use: "A catch window ran out; the same catch is asked again.",
    level: 0.32,
    layers: [air(900, 400, 0.3, 0.1, 2), after(0.1, thud(170, 120, 0.05, 0.1))],
  },
  {
    id: "boss.burgeeDim",
    family: "boss",
    blurb: "A hum sinking: the spindle going dark.",
    status: "bound",
    use: "A recatch window ran out; the spindle dims until the flag is caught back.",
    level: 0.36,
    layers: [sub(58, 0.4, 0.2)],
  },
  {
    id: "boss.burgeeHit",
    family: "boss",
    blurb: "A flash: a bright ring and a knock into the spindle.",
    status: "bound",
    use: "A shot in the step's colour into the lit spindle. Pitched up per hit.",
    level: 0.44,
    layers: [glint(2800, 0.3, 0.18), after(0.02, thud(240, 115, 0.1, 0.22))],
  },
  {
    id: "boss.burgeeMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.burgeeSpent",
    family: "boss",
    blurb: "The flag swinging free: a low fall under a rising hiss.",
    status: "bound",
    use: "Every step answered — the spindle spent, the flag loose once more.",
    level: 0.46,
    layers: [sub(52, 0.7, 0.3), after(0.02, air(1200, 3200, 0.5, 0.14, 1.5))],
  },
  {
    id: "boss.burgeeOut",
    family: "boss",
    blurb: "The boom swinging away, and the field clearing.",
    status: "bound",
    use: "THE BURGEE gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE GALL's own out (`sounds/boss-gall.ts`).
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
