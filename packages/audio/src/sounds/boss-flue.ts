/**
 * THE FLUE's six, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a sooted iron flue with an ember running along its slot**,
 * and everything here is draught and cinder: the enter is the flue drawing, a
 * low swell under a breath of air; the light is a level waking, one dry tick.
 * The hit is the ember struck, a bright ring and a knock, pitched up per
 * level; the miss is a shot spent, a dull scrape of cinder, and the last
 * one's blow is the hull's own heavy sound. The spent is the flue going cold,
 * and the out the field clearing. **Nothing follows the ember**: a sound
 * panned to it would show the navigator where it is. Low and soft under the
 * band, or short and high above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_FLUE_SOUNDS: SoundDef[] = [
  {
    id: "boss.flueEnter",
    family: "boss",
    blurb: "A flue drawing: a low swell under a breath of air.",
    status: "bound",
    use: "THE FLUE arriving, the ember waiting at the left end of its slot.",
    level: 0.42,
    layers: [swell(58, 1.1, 0.12), after(0.25, air(600, 1400, 0.5, 0.06, 1.8))],
  },
  {
    id: "boss.flueLight",
    family: "boss",
    blurb: "One dry tick: a level on the flue waking.",
    status: "bound",
    use: "A level lit: the ember sets off with three shots to meet it.",
    level: 0.34,
    layers: [tick(0.2, 0, 2300), after(0.07, tick(0.08, 0, 2700))],
  },
  {
    id: "boss.flueHit",
    family: "boss",
    blurb: "A flash: a bright ring and a knock into the ember.",
    status: "bound",
    use: "The ember met over the cannon in the level's shot and colour. Pitched up per level.",
    level: 0.44,
    layers: [glint(2600, 0.3, 0.18), after(0.02, thud(250, 120, 0.1, 0.22))],
  },
  {
    id: "boss.flueMiss",
    family: "boss",
    blurb: "A dull scrape of cinder: a shot spent.",
    status: "bound",
    use: "A shot wide of the ember, or in the wrong shot or colour. Pitched down as the level's shots run out.",
    level: 0.3,
    layers: [noise(500, { type: "bandpass", freq: 500, q: 1.5 }, 0.01, 0.12, 0.11)],
  },
  {
    id: "boss.flueSpent",
    family: "boss",
    blurb: "The flue going cold: a low fall under a rising hiss.",
    status: "bound",
    use: "Every level cleared — the ember gone out.",
    level: 0.46,
    layers: [sub(50, 0.7, 0.3), after(0.02, air(1000, 3400, 0.5, 0.14, 1.5))],
  },
  {
    id: "boss.flueOut",
    family: "boss",
    blurb: "The flue sliding away, and the field clearing.",
    status: "bound",
    use: "THE FLUE gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE BURGEE's own out (`sounds/boss-burgee.ts`).
    layers: [
      sub(48, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3100, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
