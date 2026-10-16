/**
 * THE GEODE's nine, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a stone with a crystal in it**, and everything here is rock
 * and glass: the enter a deep grinding rumble; the cracks lighting a dry
 * crackle; a cleave a crack and a heavy split with a glint of crystal after
 * it; a chip a small knock; the wrong colour a dull scrape; a level broken
 * apart a falling groan with a bright ring — the step won — and the strike a
 * rock on the hull. The heart's shatter is glass bursting over a deep fall.
 * Low and soft under the band, or short and high above it, as ever
 * (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_GEODE_SOUNDS: SoundDef[] = [
  {
    id: "boss.geodeEnter",
    family: "boss",
    blurb: "A deep grinding rumble: the stone sinking in.",
    status: "bound",
    use: "THE GEODE sinking in over the field, whole.",
    level: 0.44,
    layers: [sub(44, 0.7, 0.32), after(0.1, air(900, 500, 0.6, 0.1, 1.6))],
  },
  {
    id: "boss.geodeCracks",
    family: "boss",
    blurb: "A dry crackle: cracks lighting in the stone.",
    status: "bound",
    use: "A level of THE GEODE's cracks lights; pitched higher the deeper the level.",
    level: 0.34,
    layers: [
      noise(500, { type: "bandpass", freq: 640, q: 3 }, 0.02, 0.24, 0.1),
      after(0.08, noise(700, { type: "bandpass", freq: 900, q: 3 }, 0.02, 0.2, 0.08)),
    ],
  },
  {
    id: "boss.geodeCleave",
    family: "boss",
    blurb: "A crack and a heavy split, a glint of crystal after.",
    status: "bound",
    use: "A beam down a crack of THE GEODE in its colour: the piece breaks in two.",
    level: 0.46,
    layers: [tick(0.3, 0, 2600), thud(480, 140, 0.08, 0.24), after(0.05, glint(2200, 0.3, 0.1))],
  },
  {
    id: "boss.geodeChip",
    family: "boss",
    blurb: "A small knock: a chip off the stone.",
    status: "bound",
    use: "A bolt, or a beam where no crack runs, met THE GEODE's stone and did nothing.",
    level: 0.28,
    layers: [tick(0.16, 0, 2200), thud(600, 400, 0.03, 0.1)],
  },
  {
    id: "boss.geodeWrong",
    family: "boss",
    blurb: "A dull scrape: the wrong colour down a crack.",
    status: "bound",
    use: "A beam down a crack of THE GEODE in the other colour; the wave is lost.",
    level: 0.32,
    layers: [air(700, 500, 0.18, 0.1, 2)],
  },
  {
    id: "boss.geodeSplit",
    family: "boss",
    blurb: "A falling groan and a bright ring: the stone broken apart.",
    status: "bound",
    use: "THE GEODE's lit cracks all burnt; its pieces fly apart.",
    level: 0.46,
    layers: [
      air(1300, 450, 0.5, 0.14, 1.2),
      sub(50, 0.45, 0.2),
      after(0.2, glint(3100, 0.5, 0.12)),
      after(0.3, glint(3800, 0.45, 0.1)),
    ],
  },
  {
    id: "boss.geodeStrike",
    family: "boss",
    blurb: "A rock on the hull: the stone landed.",
    status: "bound",
    use: "A level of THE GEODE ran out; a piece still whole lands on the hull.",
    level: 0.48,
    layers: [tick(0.3, 0, 2600), thud(380, 100, 0.1, 0.26)],
  },
  {
    id: "boss.geodeShatter",
    family: "boss",
    blurb: "Glass bursting over a deep fall: the heart shattered.",
    status: "bound",
    use: "THE GEODE's heart broken by its last crack: the fight won.",
    level: 0.46,
    layers: [
      tick(0.28, 0, 2600),
      after(0.04, glint(2600, 0.4, 0.12)),
      after(0.1, glint(2900, 0.4, 0.1)),
      after(0.2, sub(42, 0.6, 0.3)),
    ],
  },
  {
    id: "boss.geodeOut",
    family: "boss",
    blurb: "The shards gone, and the field clearing.",
    status: "bound",
    use: "THE GEODE gone — then the wave-end light.",
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
