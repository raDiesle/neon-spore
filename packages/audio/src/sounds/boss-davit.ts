/**
 * THE DAVIT's thirteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a steel boom on a slack chain**, and everything here is iron
 * swung and caught: the enter is the boom settling on its pivot, a low swell
 * under a chain's rattle; the light is a step waking, one bright tick. The
 * drift is the steering lean sliding off its mark, a thin falling whine; the
 * slack is a draw loosed wrong, an empty thud with no snap (§35's own
 * picture). The loose is a swing landed, a taut snap into the hook; the sway
 * is a swing run out, the boom creaking loose. The pivot is both swings home
 * and the pivot lighting, a hum with a glint; the hit is a shot into it — a
 * flash. The reland is the boom caught back under the pivot, a firm clank;
 * the dim is the pivot going dark, a dull fall. The miss is the hull's dull
 * strike, the spent the boom slammed hard over, and the out the field
 * clearing. Low and soft under the band, or short and high above it, as ever
 * (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_DAVIT_SOUNDS: SoundDef[] = [
  {
    id: "boss.davitEnter",
    family: "boss",
    blurb: "A boom settling on its pivot: a low swell and a chain's rattle.",
    status: "bound",
    use: "THE DAVIT arriving, both swings empty and the pivot dark.",
    level: 0.42,
    layers: [
      swell(52, 1.0, 0.12),
      after(0.3, noise(2400, { type: "bandpass", freq: 2400, q: 3 }, 0.01, 0.3, 0.05)),
    ],
  },
  {
    id: "boss.davitLight",
    family: "boss",
    blurb: "One bright tick: a step on the boom waking.",
    status: "bound",
    use: "A step lit: a swing to steer and loose, a reland, or the pivot to shoot.",
    level: 0.36,
    layers: [tick(0.24, 0, 2700), after(0.05, tick(0.1, 0, 3300))],
  },
  {
    id: "boss.davitDrift",
    family: "boss",
    blurb: "A thin falling whine: the steering lean sliding off its mark.",
    status: "bound",
    use: "The lean steering the boom left its target; the draw it steered starts again.",
    level: 0.3,
    layers: [air(2600, 1400, 0.18, 0.1, 1.5)],
  },
  {
    id: "boss.davitSlack",
    family: "boss",
    blurb: "An empty thud with no snap: a draw loosed wrong.",
    status: "bound",
    use: "A draw lifted too soon, unsteered or the wrong way; the step stays lit.",
    level: 0.34,
    layers: [thud(170, 120, 0.05, 0.14)],
  },
  {
    id: "boss.davitLoose",
    family: "boss",
    blurb: "A taut snap into the hook. Pitched up per loose on its swing.",
    status: "bound",
    use: "A draw loosed true while the other seat's lean held the boom on target.",
    level: 0.42,
    layers: [
      noise(3200, { type: "highpass", freq: 3200, q: 1 }, 0.002, 0.04, 0.12),
      after(0.02, thud(260, 130, 0.05, 0.14)),
    ],
  },
  {
    id: "boss.davitSway",
    family: "boss",
    blurb: "A creak: the boom swinging free.",
    status: "bound",
    use: "A swing's window ran out unloosed; the step is tried again after a rest.",
    level: 0.34,
    layers: [air(900, 600, 0.3, 0.1, 3), after(0.1, thud(140, 110, 0.05, 0.1))],
  },
  {
    id: "boss.davitPivot",
    family: "boss",
    blurb: "A low hum and a glint: the pivot lighting.",
    status: "bound",
    use: "Both swings landed twice; the pivot is lit to a shot.",
    level: 0.44,
    layers: [sub(62, 0.35, 0.16), after(0.04, glint(2300, 0.25, 0.12))],
  },
  {
    id: "boss.davitHit",
    family: "boss",
    blurb: "A flash: a bright ring and a knock into the pivot.",
    status: "bound",
    use: "A shot in the step's colour into the lit pivot. Pitched up per hit.",
    level: 0.44,
    layers: [glint(3000, 0.3, 0.18), after(0.02, thud(250, 115, 0.1, 0.22))],
  },
  {
    id: "boss.davitReland",
    family: "boss",
    blurb: "A firm clank: the boom caught back under the pivot.",
    status: "bound",
    use: "A reland loosed true; the pivot stays lit.",
    level: 0.4,
    layers: [thud(240, 110, 0.07, 0.18), after(0.03, glint(1900, 0.18, 0.08))],
  },
  {
    id: "boss.davitDim",
    family: "boss",
    blurb: "A dull fall: the pivot going dark.",
    status: "bound",
    use: "A reland ran out; the pivot dims until the reland is asked again and loosed.",
    level: 0.36,
    layers: [
      thud(160, 100, 0.06, 0.18),
      after(0.03, noise(800, { type: "lowpass", freq: 800, toFreq: 400, q: 1 }, 0.02, 0.25, 0.08)),
    ],
  },
  {
    id: "boss.davitMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.davitSpent",
    family: "boss",
    blurb: "A boom slammed hard over: a low fall under a rising hiss.",
    status: "bound",
    use: "Every step answered — the boom swings over, spent.",
    level: 0.46,
    layers: [sub(50, 0.7, 0.3), after(0.02, air(1400, 3600, 0.5, 0.14, 1.5))],
  },
  {
    id: "boss.davitOut",
    family: "boss",
    blurb: "The spent boom falling away, and the field clearing.",
    status: "bound",
    use: "THE DAVIT gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE CYST's own out (`sounds/boss-cyst.ts`).
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
