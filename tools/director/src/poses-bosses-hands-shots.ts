import { vaneHand, wardenHand } from "@neon-spore/hands";
import { vanePhase, wardenPhase } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The states a shot earns** on the clock bosses — THE WARDEN's plates,
 * THE VANE's pins — each posed by
 * running the boss's own wave with a hand on the controls
 * (`boss-hands-shots.ts`) until the state comes, the same rule as every
 * other card in the category (`poses-bosses-kit.ts`). Nothing here sets a
 * plate or a pin by assignment: a plate that no longer comes off inside
 * the budget is this file red in `test/poses.test.ts`.
 *
 * Every wait is the fight's own: a plate takes the cycle to lower its rope
 * and the eye to open, so NARROW is a dozen beats in and GLARE nearer forty.
 */

export const SHOT_HAND_POSES: Pose[] = [
  bossPose(
    "warden",
    "narrow",
    "Two plates off, the eye's drift one column wide. P1 hauls the rope; P2 pins the eye and fires up its column.",
    {
      hand: wardenHand,
      want: (w) => w.boss?.kind === "warden" && wardenPhase(w.boss.plates).name === "NARROW",
      hold: 6,
    },
  ),
  bossPose(
    "warden",
    "glare",
    "One plate left, the eye pinned, and no rope. P1 swipes the hatch open; P2 fires through the window.",
    {
      hand: wardenHand,
      want: (w) => w.boss?.kind === "warden" && wardenPhase(w.boss.plates).name === "GLARE",
      hold: 6,
    },
  ),
  bossPose(
    "vane",
    "veer",
    "Two pins out and the sweep splits nothing. P1 holds the arm still; P2 fires up the split it makes.",
    {
      hand: vaneHand,
      want: (w) => w.boss?.kind === "vane" && vanePhase(w.boss.pins).name === "VEER",
      hold: 6,
    },
  ),
  bossPose(
    "vane",
    "seize",
    "One pin left and the bearing seized. P1 pins the arm; P2 hauls the housing off it, then fires.",
    {
      hand: vaneHand,
      want: (w) => w.boss?.kind === "vane" && vanePhase(w.boss.pins).name === "SEIZE",
      hold: 6,
    },
  ),
];
