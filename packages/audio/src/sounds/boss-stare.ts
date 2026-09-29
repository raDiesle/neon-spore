/**
 * THE STARE's eight, in a file of their own for `boss-gorge.ts`' reason.
 *
 * **The beats are the music the pair learns.** The owner, 29 September 2026:
 * *every level should have a predefined beats kind of music which players
 * need to learn*. So every beat of a pattern is heard — a soft low knock on a
 * shut beat, a bright hard blink on an open one — and the blue pass sounds
 * exactly like the live passes after it, because what is learnt by ear has to
 * be the same thing twice. Each level is pitched a step higher
 * (`bind-stare.ts`), so a level is also a key.
 *
 * The catch is the one sound in the game that means *that was you*. The
 * charge is a rise, the vent its breath let out to the sides, and the blast
 * the beam arriving. Low and soft under the band, or short and high above it
 * (`docs/spec/audio.md` §1).
 */

import { after, air, glint, soft, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_STARE_SOUNDS: SoundDef[] = [
  {
    id: "boss.stareBeat",
    family: "boss",
    blurb: "A soft low knock: a beat the eye stays shut on.",
    status: "bound",
    use: "THE STARE's pattern, on a shut beat — safe to move, and the eye can be shot.",
    level: 0.34,
    layers: [thud(110, 70, 0.16, 0.5), tick(0.08, 0, 3000)],
  },
  {
    id: "boss.stareBlink",
    family: "boss",
    blurb: "A bright hard blink over a low thump: a beat the eye opens on.",
    status: "bound",
    use: "THE STARE's pattern, on an open beat — both seats touch nothing.",
    level: 0.46,
    layers: [thud(170, 60, 0.22, 0.6), glint(3200, 0.2, 0.18), after(0.02, tick(0.14, 0, 4200))],
  },
  {
    id: "boss.stareCaught",
    family: "boss",
    blurb: "A thumb landing under a thing that was watching, and the room going out from under it.",
    status: "bound",
    use: "THE STARE catching a seat pressing something on an open beat.",
    // Loud, because it is the one sound in the game that means *that was you*.
    level: 0.55,
    layers: [
      thud(180, 34, 0.7, 0.7),
      after(0.12, sub(36, 0.9, 0.55)),
      after(0.06, glint(3400, 0.28, 0.16)),
    ],
  },
  {
    id: "boss.stareHit",
    family: "boss",
    blurb: "A shot into a shut eye, and the eye reeling.",
    status: "bound",
    use: "A bolt hitting THE STARE's shut eye — the level is over.",
    level: 0.5,
    layers: [
      thud(240, 50, 0.45, 0.6),
      after(0.05, glint(2600, 0.4, 0.16)),
      after(0.1, sub(48, 0.6, 0.4)),
    ],
  },
  {
    id: "boss.stareCharge",
    family: "boss",
    blurb: "Something under a lid drawing breath: a slow rise.",
    status: "bound",
    use: "THE STARE charging its beam after a pass with no hit — pull the lid.",
    level: 0.42,
    layers: [swell(52, 1.2, 0.12), air(4200, 6400, 1.1, 0.12), soft(0.6, spore(72, 0.9, 0.3, 50))],
  },
  {
    id: "boss.stareVent",
    family: "boss",
    blurb: "A lid coming down and a held breath let out to either side.",
    status: "bound",
    use: "THE STARE's lid pulled in time — the charge vents out to the sides.",
    level: 0.42,
    layers: [thud(140, 60, 0.3, 0.45), after(0.05, soft(0.5, air(1400, 300, 0.6, 0.16)))],
  },
  {
    id: "boss.stareBlast",
    family: "boss",
    blurb: "A beam arriving straight down: a searing hiss with the floor under it.",
    status: "bound",
    use: "THE STARE's beam coming down the middle onto the hull — nobody pulled the lid.",
    level: 0.5,
    layers: [air(6400, 4200, 0.5, 0.2), sub(40, 0.8, 0.5)],
  },
  {
    id: "boss.stareOut",
    family: "boss",
    blurb: "An eye going out: a long fall into nothing.",
    status: "bound",
    use: "THE STARE's last level hit — the eye is out and the wave is won.",
    level: 0.44,
    layers: [swell(46, 1.4, 0.1), after(0.1, glint(1600, 0.9, 0.08))],
  },
];
