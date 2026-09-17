/**
 * THE CURTAIN's ten, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **sheet of fabric on a rail**, and everything here is dry
 * where THE GORGE's was wet: a shove is cloth dragged over a bar, a re-roll
 * is the same drag slower, a lobe coming off is a weight dropping out of a
 * hem, and the tear is the one long sound on the page. The core behind it is
 * the only hard thing — a hit on it rings, and its fire is a torch leaving.
 * Low and soft under the band, or short and high above it, as ever
 * (docs/spec/audio.md §1).
 */

import { after, air, burst, glint, noise, soft, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_CURTAIN_SOUNDS: SoundDef[] = [
  {
    id: "boss.curtainUnroll",
    family: "boss",
    blurb:
      "The sheet unrolling down its rail: a long dry slide and the hem's lobes settling one by one.",
    status: "bound",
    use: "THE CURTAIN arriving, every lobe standing.",
    level: 0.36,
    layers: [
      air(8000, 3800, 1.1, 0.2, 1.4),
      after(0.2, soft(0.6, swell(80, 1.2, 0.08))),
      after(0.8, burst(soft(0.5, tick(0.18, 0, 4800)), 7, 0.1, 0.9, 20)),
    ],
  },
  {
    id: "boss.curtainShadow",
    family: "boss",
    blurb: "The core settling behind the fabric: a low swell and a dim glint through it.",
    status: "bound",
    use: "THE CURTAIN's core taking a column and a colour, seen by one seat.",
    level: 0.34,
    layers: [swell(70, 0.9, 0.12), after(0.2, soft(0.5, glint(3400, 0.2, 0.1)))],
  },
  {
    id: "boss.curtainSoft",
    family: "boss",
    blurb: "A lobe going soft: one small high tick, the weight loosening.",
    status: "bound",
    use: "THE CURTAIN naming a lobe the cannon can take this cycle, on the pilot's screen.",
    level: 0.3,
    layers: [tick(0.2, 0, 5600)],
  },
  {
    id: "boss.curtainShove",
    family: "boss",
    blurb: "Cloth dragged over a bar: a short dry rasp and a thud as it stops.",
    status: "bound",
    use: "THE CURTAIN carried a column by two hands. Pitched up when it is light enough to go two.",
    level: 0.4,
    layers: [
      noise(0.16, { type: "highpass", freq: 3200, toFreq: 5000, q: 0.8 }, 0.01, 0.04, 0.4),
      after(0.14, thud(120, 60, 0.2, 0.4)),
    ],
  },
  {
    id: "boss.curtainReroll",
    family: "boss",
    blurb: "The same drag, slower and the other way: the sheet creeping back over the core.",
    status: "bound",
    use: "THE CURTAIN rolling a column back toward covered, with nobody holding it.",
    level: 0.34,
    layers: [
      noise(0.3, { type: "highpass", freq: 5000, toFreq: 3200, q: 0.8 }, 0.02, 0.1, 0.3),
      after(0.25, soft(0.5, sub(65, 0.3, 0.3))),
    ],
  },
  {
    id: "boss.curtainLobeOff",
    family: "boss",
    blurb: "A weight dropping out of the hem: a snap above and a small thud below.",
    status: "bound",
    use: "THE CURTAIN losing a lobe — shot soft, or dropped beside a core hit. Pitched up as fewer hang.",
    level: 0.4,
    layers: [tick(0.3, 0, 4600), after(0.05, thud(160, 70, 0.18, 0.35))],
  },
  {
    id: "boss.curtainCoreHit",
    family: "boss",
    blurb: "The core rung: a bright glint and a low knock under it.",
    status: "bound",
    use: "THE CURTAIN's core taking a shot in its own colour while it is bare.",
    level: 0.46,
    layers: [glint(4200, 0.3, 0.16), after(0.02, thud(180, 60, 0.22, 0.45))],
  },
  {
    id: "boss.curtainFire",
    family: "boss",
    blurb: "The core letting a rock go: a hiss out of a slot and a torch leaving.",
    status: "bound",
    use: "THE CURTAIN's core firing down its column — bare and unanswered, or hit in the wrong colour.",
    level: 0.44,
    layers: [
      noise(0.36, { type: "highpass", freq: 3000, toFreq: 6000, q: 0.8 }, 0.01, 0.06, 0.4),
      after(0.08, sub(60, 0.5, 0.3)),
    ],
  },
  {
    id: "boss.curtainTear",
    family: "boss",
    blurb: "The sheet tearing off its rail: a long dry rip and the whole weight of it coming down.",
    status: "bound",
    use: "THE CURTAIN shoved with no lobe left on its hem — the fabric goes, and the core hangs naked.",
    level: 0.52,
    layers: [
      noise(0.6, { type: "highpass", freq: 6000, toFreq: 3200, q: 1 }, 0.004, 0.1, 0.5),
      after(0.3, sub(50, 0.6, 0.45)),
      after(0.35, burst(soft(0.5, tick(0.2, 0, 4400)), 5, 0.07, 0.8, -40)),
    ],
  },
  {
    id: "boss.curtainOut",
    family: "boss",
    blurb: "The core going out: a bell above the band, a swell under it, and the air emptying.",
    status: "bound",
    use: "THE CURTAIN's core taking its last hit — then the wave-end light.",
    level: 0.5,
    layers: [
      glint(3600, 0.5, 0.16),
      after(0.04, swell(60, 1.2, 0.14)),
      after(0.1, burst(glint(4800, 0.16, 0.1), 8, 0.05, 0.85, 40)),
      after(0.2, air(4200, 9000, 0.9, 0.16, 1.5)),
    ],
  },
];
