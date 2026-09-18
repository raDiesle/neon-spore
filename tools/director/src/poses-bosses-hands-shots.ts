import { vanePhase, wardenPhase } from "@neon-spore/sim";
import { candleHand, orreryHand, vaneHand, wardenHand } from "./boss-hands-shots.js";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The states a shot earns** on the clock bosses — THE WARDEN's plates,
 * THE VANE's pins, THE ORRERY's rings, THE CANDLE's glow — each posed by
 * running the boss's own wave with a hand on the controls
 * (`boss-hands-shots.ts`) until the state comes, the same rule as every
 * other card in the category (`poses-bosses-kit.ts`). Nothing here sets a
 * plate or a ring by assignment: a plate that no longer comes off inside
 * the budget is this file red in `test/poses.test.ts`.
 *
 * Every wait is the fight's own: a plate takes the cycle to lower its rope
 * and the eye to open, so NARROW is a dozen beats in and GLARE nearer forty.
 */

export const SHOT_HAND_POSES: Pose[] = [
  bossPose(
    "warden",
    "narrow",
    "Two plates off: the eye's drift has narrowed to a column either side of the rim, and the rope comes down on the same control it did before. The shot through the hole is the same shot, with less room to miss it.",
    {
      hand: wardenHand,
      want: (w) => w.boss?.kind === "warden" && wardenPhase(w.boss.plates).name === "NARROW",
      hold: 6,
    },
  ),
  bossPose(
    "warden",
    "glare",
    "One plate left and the eye pinned to its column: no drift at all, and the last rope. This is the plate the pair has to take with the whole rim closing on the pupil.",
    {
      hand: wardenHand,
      want: (w) => w.boss?.kind === "warden" && wardenPhase(w.boss.plates).name === "GLARE",
      hold: 6,
    },
  ),
  bossPose(
    "vane",
    "veer",
    "Two pins out and the ends of the sweep splitting nothing: the only window now is the arm held still under the pilot's thumb, which stops the fold line with it and puts the split on the side away from the load.",
    {
      hand: vaneHand,
      want: (w) => w.boss?.kind === "vane" && vanePhase(w.boss.pins).name === "VEER",
      hold: 6,
    },
  ),
  bossPose(
    "vane",
    "seize",
    "One pin holding and the bearing seized: the arm pinned under his thumb is no longer a window on its own, and the navigator has to haul the housing off it before the last shot counts.",
    {
      hand: vaneHand,
      want: (w) => w.boss?.kind === "vane" && vanePhase(w.boss.pins).name === "SEIZE",
      hold: 6,
    },
  ),
  bossPose(
    "orrery",
    "spitting",
    "A ring taken and the orrery spitting: what the standing rings let through is coming down the core's column, and the pair's shot has to leave on the beat every ring left is open on.",
    { hand: orreryHand, hold: 12 },
  ),
  bossPose(
    "orrery",
    "naked",
    "Every ring gone and the core bare. Shots do nothing to it now; only a beam filled in its column takes it, which is the navigator's thumb held and the pilot's cannon still.",
    { hand: orreryHand, hold: 12 },
  ),
  bossPose(
    "orrery",
    "out",
    "The core burst under the beam: the orbits gone, the column clear, and the wave's own creatures the only thing left to answer.",
    { hand: orreryHand, hold: 6 },
  ),
  bossPose(
    "candle",
    "eating",
    "The glow low and turned to one column, eating what is fired from it: a flash made in the column it faces is swallowed and puts the glow a step back up. The pair fires from anywhere but there.",
    { hand: candleHand, hold: 6 },
  ),
  bossPose(
    "candle",
    "last",
    "The last step of the glow: one more flash in any column but the one it faces and the candle is out. This is the frame the whole fight has been dimming toward.",
    { hand: candleHand, hold: 3 },
  ),
  bossPose(
    "candle",
    "out",
    "The glow gone and the field lit again by nothing at all: what the pair's own shots throw is still all the light there is, and the wave runs on under it.",
    { hand: candleHand, hold: 6 },
  ),
];
