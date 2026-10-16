/**
 * THE MATRON's seven, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a mother slime with pods on her lobes**, and everything here
 * is wet and heavy: the enter a deep heave with a gurgle over it; a clutch
 * hung a soft swell of sacs filling; a throw a wet spit; a lobe gone with its
 * pod a pop and a slap; a clutch cleared a falling moan with a bright ring
 * after it — the level won. Low and soft under the band, or short and high
 * above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, spore, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_MATRON_SOUNDS: SoundDef[] = [
  {
    id: "boss.matronEnter",
    family: "boss",
    blurb: "A deep heave, and a gurgle over it.",
    status: "bound",
    use: "THE MATRON coming down over the field, every pod still on her.",
    level: 0.44,
    layers: [sub(46, 0.6, 0.3), after(0.12, spore(520, 0.4, 0.14, 40))],
  },
  {
    id: "boss.matronHang",
    family: "boss",
    blurb: "Sacs filling: a clutch of pods hung.",
    status: "bound",
    use: "A clutch of THE MATRON's pods hung off her lobes.",
    level: 0.36,
    layers: [spore(700, 0.3, 0.16, 30), after(0.1, spore(900, 0.3, 0.12, 30))],
  },
  {
    id: "boss.matronThrow",
    family: "boss",
    blurb: "A wet spit: something thrown down.",
    status: "bound",
    use: "THE MATRON throws a body, a rock or a torch down a column.",
    level: 0.3,
    layers: [air(1400, 700, 0.14, 0.12, 2)],
  },
  {
    id: "boss.matronLobe",
    family: "boss",
    blurb: "A pop and a slap: a lobe gone with its pod.",
    status: "bound",
    use: "A pod of THE MATRON's swallowed; its lobe goes. Climbs as she empties.",
    level: 0.42,
    layers: [tick(0.2, 0, 2200), thud(560, 220, 0.06, 0.18)],
  },
  {
    id: "boss.matronCleared",
    family: "boss",
    blurb: "A falling moan and a bright ring: a clutch taken.",
    status: "bound",
    use: "THE MATRON's lit clutch all swallowed; she rears back.",
    level: 0.46,
    layers: [
      air(1200, 450, 0.5, 0.14, 1.2),
      sub(50, 0.45, 0.2),
      after(0.25, glint(3000, 0.5, 0.12)),
    ],
  },
  {
    id: "boss.matronSpent",
    family: "boss",
    blurb: "The matron beaten: a crack, a deep fall, a long sigh.",
    status: "bound",
    use: "THE MATRON beaten: her last pod swallowed.",
    level: 0.46,
    layers: [
      tick(0.28, 0, 2600),
      after(0.06, sub(42, 0.6, 0.34)),
      after(0.2, air(1100, 400, 0.8, 0.08, 1.4)),
    ],
  },
  {
    id: "boss.matronOut",
    family: "boss",
    blurb: "The matron gone, and the field clearing.",
    status: "bound",
    use: "THE MATRON gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE HYDRA's own out (`sounds/boss-hydra.ts`).
    layers: [
      sub(48, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3100, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
