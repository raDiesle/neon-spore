/**
 * THE ORRERY's three, in a file of their own for `boss-undertow.ts`' reason.
 *
 * The fight is *when* and never *where*: the core sits in the middle column
 * for the whole of it and the pair's whole difficulty is a beat neither can
 * work out alone (`sim/orrery.ts`). So none of the three is a tell — the
 * shaft opening is the thing the ear must **not** be given, or the fight is
 * gone — and what they mark is the consequence of a beat already spent: a
 * ring off, the core answering, the core out. A ring is a circle of organs,
 * so it parts as a scatter rather than a tear; the core is an organ that
 * fires, so its spit is a puff and not a gun. The one long sound is the last,
 * because the picture takes `orreryOutBeats` to go dark from the centre out
 * and the ear should take as long (docs/spec/audio.md §1).
 */

import { after, air, burst, glint, metal, soft, sub, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_ORRERY_SOUNDS: SoundDef[] = [
  {
    id: "boss.orreryBreak",
    family: "boss",
    blurb:
      "A ring of organs parting at its gap: a snap, a scatter of glints, and the orbit's weight going.",
    status: "bound",
    use: "THE ORRERY's outermost standing ring taken by a shot on the beat — pitched up a step per ring gone, so the third is the highest.",
    level: 0.44,
    layers: [
      metal(170, 0.32, 0.3, 200),
      thud(150, 55, 0.38, 0.42),
      after(0.05, burst(glint(4800, 0.18, 0.12), 4, 0.06, 0.8, 5)),
    ],
  },
  {
    id: "boss.orrerySpit",
    family: "boss",
    blurb:
      "The core letting an organ go down a column: a short hard puff and the weight leaving it.",
    status: "bound",
    use: "THE ORRERY's core firing a rock, every few beats once a ring is off it — never down its own column.",
    level: 0.38,
    layers: [
      air(420, 90, 0.22, 0.26, 1.6),
      after(0.02, thud(180, 70, 0.22, 0.36)),
      glint(6000, 0.07, 0.1),
    ],
  },
  {
    id: "boss.orreryOut",
    family: "boss",
    blurb:
      "The core going out from the centre outward: a long fall under the voice, and the last glints leaving the orbits.",
    status: "bound",
    use: "THE ORRERY's naked core taken by the lance — the boss beaten, and the field going dark over five beats.",
    level: 0.5,
    layers: [
      { source: "sine", freq: 110, toFreq: 36, gain: 0.34, attack: 0.05, hold: 0.8, release: 1.6 },
      burst(soft(0.6, glint(5200, 0.3, 0.1)), 6, 0.22, 0.75, -4),
      after(0.6, sub(40, 1.4, 0.4)),
    ],
  },
];
