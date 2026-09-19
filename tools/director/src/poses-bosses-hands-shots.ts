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
  bossPose(
    "orrery",
    "seized",
    "A ring is cracked and stuck. P1 turns the ring until its gap is at the bottom; P2 waits.",
    // Held with nobody on the controls, which is the point of the state: a
    // jammed ring does not drift, so the picture stands still until a thumb
    // goes back on it (`sim/orrery-beat.ts`).
    { hand: orreryHand, hold: 6 },
  ),
  bossPose(
    "orrery",
    "spitting",
    "A ring gone and the core spitting down its column. P1 holds the cannon on it; P2 fires on the open beat.",
    { hand: orreryHand, hold: 12 },
  ),
  bossPose(
    "orrery",
    "naked",
    "Rings gone, core bare, and shots do nothing. P1 keeps the cannon still; P2 holds the colour down.",
    { hand: orreryHand, hold: 12 },
  ),
  bossPose(
    "orrery",
    "out",
    "The core is burst and its column clear. P1 aims at the wave again; P2 fires.",
    { hand: orreryHand, hold: 6 },
  ),
  bossPose(
    "candle",
    "eating",
    "The glow faces one column and eats what is fired there. P1 aims off it; P2 fires from any other.",
    { hand: candleHand, hold: 6 },
  ),
  bossPose(
    "candle",
    "last",
    "One step of glow left. P1 aims off the column it faces; P2 fires once and the candle is out.",
    { hand: candleHand, hold: 3 },
  ),
  bossPose(
    "candle",
    "out",
    "The glow is gone and the pair's own shots are the light. P1 aims at the wave; P2 fires.",
    { hand: candleHand, hold: 6 },
  ),
];
