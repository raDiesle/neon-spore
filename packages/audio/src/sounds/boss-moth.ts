/**
 * THE MOTH's twelve, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a great soft moth drawn to the cannon's light**, so
 * everything here is dry and papery, wings and dust rather than THE BROOD's
 * wet: coming in a fluttering breath; a step lit a soft rising glow; a flit
 * a short wing-beat, panned to where it goes; sinking a low hum that will
 * land; a wing torn a papery rip with a bright edge; the belly hit a hollow
 * pop as it reels up; the hide a dusty pat; the wrong colour a dull smack; a
 * slick shaken off a sift of dust; landing on the cannon a heavy flump;
 * beaten a long falling flutter with a ring over it; gone a breath. Low and
 * soft under the band, or short and high above it, as ever
 * (`docs/spec/audio.md` §1).
 */

import { after, air, burst, glint, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_MOTH_SOUNDS: SoundDef[] = [
  {
    id: "boss.mothEnter",
    family: "boss",
    blurb: "A fluttering breath: a great moth coming in.",
    status: "bound",
    use: "THE MOTH fluttering in over the middle of the field.",
    level: 0.4,
    layers: [burst(air(900, 600, 0.08, 0.14, 1.2), 6, 0.09, 0.85), after(0.1, sub(70, 0.4, 0.18))],
  },
  {
    id: "boss.mothStep",
    family: "boss",
    blurb: "A soft rising glow: spots lit on its wings.",
    status: "bound",
    use: "A step of THE MOTH begins: red spots lit on its wings, or its belly ready.",
    level: 0.32,
    layers: [swell(620, 0.4, 0.08), after(0.18, glint(1500, 0.2, 0.08))],
  },
  {
    id: "boss.mothFlit",
    family: "boss",
    blurb: "A short wing-beat: the moth moving a column.",
    status: "bound",
    use: "THE MOTH drifts toward the still cannon, or hops away from it.",
    level: 0.3,
    layers: [burst(air(1200, 700, 0.05, 0.12, 1.4), 2, 0.06, 0.8)],
  },
  {
    id: "boss.mothSettle",
    family: "boss",
    blurb: "A low hum coming down: the moth sinking over the cannon.",
    status: "bound",
    use: "THE MOTH begins to sink over the cannon; it lands unless the cannon moves.",
    level: 0.36,
    layers: [swell(330, 0.6, 0.1), after(0.1, burst(air(700, 420, 0.06, 0.08, 1.2), 4, 0.1, 0.9))],
  },
  {
    id: "boss.mothTear",
    family: "boss",
    blurb: "A papery rip with a bright edge: a wing spot hit.",
    status: "bound",
    use: "A red bolt hits a spot on THE MOTH's wing and tears it; higher as it runs out of parts.",
    level: 0.42,
    layers: [air(2400, 900, 0.12, 0.2, 2), after(0.02, tick(0.22, 0, 2600))],
  },
  {
    id: "boss.mothBelly",
    family: "boss",
    blurb: "A hollow pop: the belly hit, the moth reeling up.",
    status: "bound",
    use: "A red bolt into THE MOTH's open belly as it sinks; it reels up and away.",
    level: 0.44,
    layers: [thud(600, 300, 0.08, 0.22), after(0.03, spore(1200, 0.14, 0.12, 30))],
  },
  {
    id: "boss.mothHide",
    family: "boss",
    blurb: "A dusty pat: a bolt into the moth where nothing is lit.",
    status: "bound",
    use: "A bolt met by THE MOTH's body or a wing with no spot, which does nothing.",
    level: 0.26,
    layers: [thud(380, 260, 0.04, 0.1), after(0.01, air(1600, 1100, 0.06, 0.06, 1))],
  },
  {
    id: "boss.mothSpoil",
    family: "boss",
    blurb: "A dull smack: a lit part shot in another colour.",
    status: "bound",
    use: "A bolt of a colour other than red into a lit part of THE MOTH; the wave is lost.",
    level: 0.4,
    layers: [thud(320, 140, 0.1, 0.22)],
  },
  {
    id: "boss.mothDust",
    family: "boss",
    blurb: "A sift of dust: a slick shaken off a wing.",
    status: "bound",
    use: "THE MOTH shakes a slick off its wing, which falls like any other.",
    level: 0.34,
    layers: [air(2000, 700, 0.22, 0.12, 1.2), after(0.08, spore(500, 0.14, 0.1, 35))],
  },
  {
    id: "boss.mothLand",
    family: "boss",
    blurb: "A heavy flump: the moth landing on the cannon.",
    status: "bound",
    use: "THE MOTH sank all the way and landed on the cannon; the hull is hit.",
    level: 0.48,
    layers: [thud(240, 90, 0.2, 0.34), after(0.04, air(800, 360, 0.24, 0.14, 1.2))],
  },
  {
    id: "boss.mothSpent",
    family: "boss",
    blurb: "A long falling flutter, and a ring over it: the moth beaten.",
    status: "bound",
    use: "THE MOTH's last part hit.",
    level: 0.44,
    layers: [burst(air(900, 400, 0.1, 0.12, 1.2), 7, 0.11, 0.8), after(0.2, glint(2200, 0.3, 0.1))],
  },
  {
    id: "boss.mothOut",
    family: "boss",
    blurb: "A breath: the moth gone.",
    status: "bound",
    use: "THE MOTH gone and the wave ending.",
    level: 0.3,
    layers: [air(700, 500, 0.18, 0.1, 2)],
  },
];
