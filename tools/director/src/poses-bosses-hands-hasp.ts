import { haspHand } from "@neon-spore/hands";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE HASP's story between the hasps**, posed with a hand on the controls
 * (`boss-hands-hasp.ts`, `sim/hasp-story.ts`): the rattle after the first
 * hasp swings, the backspin and the rust after the second, the sway after the
 * third. The hand answers each the way the pair does — his latch kept, her
 * wheel wound, rocked or held still — so each card is the state just opened,
 * a few ticks in, before the answer lands. The drawing is `hasp-story.ts`.
 *
 * On the test seat, which is shown both halves: the rattle's quieting is his
 * and the rust's thinning hers, and a card on one seat would show only one.
 */
export const HASP_STORY_POSES: Pose[] = [
  bossPose(
    "hasp",
    "rattle",
    "The first clasp swung, the next door shaking on its hinge. P1 grips the latch and keeps it; P2 waits.",
    {
      hand: haspHand,
      hold: 6,
      budgetBeats: 240,
      lookAt: "whether the shaking door reads as loose on its hinge rather than opening",
    },
  ),
  bossPose(
    "hasp",
    "backspin",
    "The second clasp swung, its wheel running back on the spring, the mark smeared. P1 waits; P2 winds it back.",
    {
      hand: haspHand,
      hold: 4,
      budgetBeats: 480,
      lookAt: "whether the ghost spokes read as the wheel spinning backward",
    },
  ),
  bossPose(
    "hasp",
    "rust",
    "The last clasp furred with rust and flaking. P1 holds the latch; P2 rocks the wheel back and forth.",
    {
      hand: haspHand,
      hold: 6,
      budgetBeats: 480,
      lookAt: "whether the rust reads as a crust on the seam rather than a burn",
    },
  ),
  bossPose(
    "hasp",
    "sway",
    "All three clasps swung and swaying half-shut. P1 holds the latch; P2 keeps her thumb still on the rim.",
    { hand: haspHand, hold: 12, budgetBeats: 720 },
  ),
];
