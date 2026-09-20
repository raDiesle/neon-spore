/**
 * THE WELL's four, in a file of their own for `boss-gauge.ts`'s reason: the
 * round had no sounds at all until its face was given something to do, because
 * until then it had nothing to report — it was a projection of the field and
 * the field's own sounds were the whole of it.
 *
 * All four are about **one thing turning**, so all four are built out of the
 * same low metal, and what tells them apart is direction. The slip starts
 * with a bearing letting go and a tone sliding up out of true; a beat of the
 * hold is one dull catch, the same catch every beat, so the pair can count the
 * budget down by ear without either of them looking away. The far end is that
 * slide arriving and stopping dead. Home is the one bright thing in the set —
 * the seam back at twelve, the hours back on their columns, and the pilot able
 * to read his own screen again.
 */

import { after, glint, metal, soft, sub, swell } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_WELL_SOUNDS: SoundDef[] = [
  {
    id: "boss.wellRoll",
    family: "boss",
    blurb: "A bearing letting go: a low tone sliding up out of true, iron under it.",
    status: "bound",
    use: "THE WELL: the clock face has started to slip off twelve.",
    level: 0.32,
    layers: [
      { source: "triangle", freq: 64, toFreq: 104, gain: 0.24, attack: 0.04, release: 0.4 },
      after(0.02, metal(72, 0.3, 0.26, 220)),
    ],
  },
  {
    id: "boss.wellHeld",
    family: "boss",
    blurb: "A dull catch: the turn stopped for one beat, and nothing behind it.",
    status: "bound",
    use: "THE WELL: a thumb on the seam held the slip still for a beat.",
    level: 0.28,
    layers: [metal(58, 0.16, 0.3, 180), after(0.01, soft(0.5, sub(88, 0.14, 0.2)))],
  },
  {
    id: "boss.wellWound",
    family: "boss",
    blurb: "The slide arriving and stopping dead: a rise cut off against iron.",
    status: "bound",
    use: "THE WELL: the face has slipped as far as it slips, and wants turning back.",
    level: 0.36,
    layers: [
      { source: "triangle", freq: 96, toFreq: 132, gain: 0.22, attack: 0.02, release: 0.14 },
      after(0.14, metal(66, 0.34, 0.34, 190)),
    ],
  },
  {
    id: "boss.wellHome",
    family: "boss",
    blurb: "A seam back at the top: one clear pip, and the room opening under it.",
    status: "bound",
    use: "THE WELL: the hours are the columns again.",
    level: 0.34,
    layers: [glint(5200, 0.07, 0.34), after(0.03, swell(120, 0.5, 0.12))],
  },
];
