/**
 * THE SEAM's nine, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a shelled ridge with one crack down its spine**, and
 * everything here is shell and grit: the enter is the ridge rising, a low
 * grinding swell; the light is a point on the crack waking, one bright tick.
 * The dim is a point shot that does not close, a dull tap; the seal is one
 * that does, a hard click pitched up as the points close. The rock out is a
 * rock shot apart, a bright snap; the block is grit on the shield, a patter.
 * The miss is the hull's dull strike, the split the ridge cracking open, and
 * the out the field clearing. Low and soft under the band, or short and high
 * above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_SEAM_SOUNDS: SoundDef[] = [
  {
    id: "boss.seamEnter",
    family: "boss",
    blurb: "A shelled ridge rising into frame: a low grinding swell.",
    status: "bound",
    use: "THE SEAM arriving, the crack dark.",
    level: 0.42,
    layers: [
      swell(52, 1.0, 0.12),
      after(0.2, noise(400, { type: "lowpass", freq: 400, toFreq: 300, q: 1 }, 0.05, 0.3, 0.14)),
    ],
  },
  {
    id: "boss.seamLight",
    family: "boss",
    blurb: "One bright tick: a point on the crack waking.",
    status: "bound",
    use: "A step lit: a point, grit, a rock, or grit and a rock at once.",
    level: 0.36,
    layers: [glint(2000, 0.26, 0.14), after(0.04, tick(0.1, 0, 2600))],
  },
  {
    id: "boss.seamDim",
    family: "boss",
    blurb: "A dull tap: a point shot that goes dark without closing.",
    status: "bound",
    use: "A point shot in its colour that does not seal.",
    level: 0.34,
    layers: [tick(0.18, 0, 1600), after(0.02, thud(240, 160, 0.06, 0.18))],
  },
  {
    id: "boss.seamSeal",
    family: "boss",
    blurb: "A hard click and a low settle: a point shot shut.",
    status: "bound",
    use: "A point sealed. Pitched up as the points close.",
    level: 0.46,
    layers: [
      tick(0.26, 0, 3000),
      after(0.02, thud(280, 130, 0.1, 0.3)),
      after(0.08, sub(58, 0.35, 0.22)),
    ],
  },
  {
    id: "boss.seamRockOut",
    family: "boss",
    blurb: "A bright snap: a rock spat from the crack, shot apart.",
    status: "bound",
    use: "The rock shot out.",
    level: 0.4,
    layers: [glint(2600, 0.22, 0.16), after(0.03, air(2400, 900, 0.2, 0.1, 1.5))],
  },
  {
    id: "boss.seamBlock",
    family: "boss",
    blurb: "A patter of grit on the shield.",
    status: "bound",
    use: "Grit taken on the shield under the ridge.",
    level: 0.38,
    layers: [noise(2200, { type: "bandpass", freq: 2200, toFreq: 1400, q: 2 }, 0.01, 0.16, 0.2)],
  },
  {
    id: "boss.seamMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.seamSplit",
    family: "boss",
    blurb: "The ridge cracking open along its seam: a long tearing grind.",
    status: "bound",
    use: "Every step answered — the sealed ridge splits down its crack.",
    level: 0.44,
    layers: [
      sub(50, 0.8, 0.3),
      after(0.06, noise(200, { type: "bandpass", freq: 200, toFreq: 110, q: 2 }, 0.02, 0.6, 0.2)),
    ],
  },
  {
    id: "boss.seamOut",
    family: "boss",
    blurb: "The split ridge drifting away, and the field clearing.",
    status: "bound",
    use: "THE SEAM gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE VALVE's own out (`sounds/boss-valve.ts`).
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
