/**
 * THE BROOD's eleven, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a sac of slime that grows the ordinary enemies**, so
 * everything here is wet and soft: the sac coming down a slow heave; a bud
 * beginning a small swelling spore; a pop a bright wet burst; a bud dropping
 * a sliding plop; the wrong colour a dull smack; a bolt into the hide a soft
 * thud; the sac beaten a long sag with a ring over it — the fight won — and
 * gone a breath. What it lays and how it sways (16 October 2026): a body
 * pushed out of its belly a squeezing squelch; the shudder before a lurch a
 * low tremble; the lurch itself a heavy slosh, panned to where it lands. Low and soft under the band, or short and high above it, as
 * ever (`docs/spec/audio.md` §1).
 */

import { after, air, burst, glint, spore, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_BROOD_SOUNDS: SoundDef[] = [
  {
    id: "boss.broodEnter",
    family: "boss",
    blurb: "A slow heave: a sac of slime coming down.",
    status: "bound",
    use: "THE BROOD coming down over the field, every bud still to grow.",
    level: 0.42,
    layers: [sub(52, 0.6, 0.3), after(0.12, air(800, 450, 0.5, 0.1, 1.6))],
  },
  {
    id: "boss.broodBud",
    family: "boss",
    blurb: "A small swelling: a bud beginning on the rim.",
    status: "bound",
    use: "A bud of THE BROOD begins to grow over its column; red a step lower than cyan.",
    level: 0.3,
    layers: [spore(700, 0.16, 0.1, 25), after(0.06, spore(950, 0.12, 0.08, 20))],
  },
  {
    id: "boss.broodPop",
    family: "boss",
    blurb: "A bright wet burst: a bud popped in its colour.",
    status: "bound",
    use: "A bud of THE BROOD shot in its colour; higher as the lobes run out.",
    level: 0.42,
    layers: [tick(0.24, 0, 2600), after(0.02, spore(1400, 0.14, 0.12, 30))],
  },
  {
    id: "boss.broodDrop",
    family: "boss",
    blurb: "A sliding plop: a ripe bud falling off the rim.",
    status: "bound",
    use: "A bud of THE BROOD left too long, falling as a slick or a bulb.",
    level: 0.38,
    layers: [air(1100, 500, 0.2, 0.1, 1.6), after(0.08, thud(420, 180, 0.06, 0.16))],
  },
  {
    id: "boss.broodSpoil",
    family: "boss",
    blurb: "A dull smack: a bud shot in the other colour.",
    status: "bound",
    use: "A bolt of the wrong colour into a bud of THE BROOD; the wave is lost.",
    level: 0.4,
    layers: [thud(320, 140, 0.1, 0.22)],
  },
  {
    id: "boss.broodHide",
    family: "boss",
    blurb: "A soft thud: a bolt into the sac where no bud hangs.",
    status: "bound",
    use: "A bolt met by THE BROOD's hide, which does nothing.",
    level: 0.28,
    layers: [thud(260, 180, 0.05, 0.12)],
  },
  {
    id: "boss.broodSpent",
    family: "boss",
    blurb: "A long sag, and a ring over it: the sac beaten.",
    status: "bound",
    use: "THE BROOD's last bud popped.",
    level: 0.44,
    layers: [sub(60, 0.4, 0.26), after(0.1, glint(2200, 0.3, 0.1))],
  },
  {
    id: "boss.broodOut",
    family: "boss",
    blurb: "A breath: the sac gone.",
    status: "bound",
    use: "THE BROOD gone and the wave ending.",
    level: 0.3,
    layers: [air(700, 500, 0.18, 0.1, 2)],
  },
  {
    id: "boss.broodLay",
    family: "boss",
    blurb: "A squeezing squelch: a body pushed out of the sac's belly.",
    status: "bound",
    use: "THE BROOD lays a slick or a bulb out of its hide; red a step lower than cyan.",
    level: 0.36,
    layers: [spore(380, 0.2, 0.14, 40), after(0.1, air(900, 380, 0.16, 0.12, 1.4))],
  },
  {
    id: "boss.broodShudder",
    family: "boss",
    blurb: "A low tremble: the sac about to lurch.",
    status: "bound",
    use: "THE BROOD shudders two beats before it lurches a column.",
    level: 0.34,
    layers: [burst(sub(48, 0.12, 0.22), 5, 0.07, 0.85)],
  },
  {
    id: "boss.broodLurch",
    family: "boss",
    blurb: "A heavy slosh: the sac swinging a column over.",
    status: "bound",
    use: "THE BROOD lurches one column, its buds and bodies with it.",
    level: 0.4,
    layers: [thud(200, 90, 0.14, 0.3), after(0.05, air(600, 300, 0.22, 0.12, 1.2))],
  },
];
