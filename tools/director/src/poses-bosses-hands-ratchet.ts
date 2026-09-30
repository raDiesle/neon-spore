import { ratchetBlindHand, ratchetHand } from "@neon-spore/hands";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE RATCHET's nine states**, posed with a hand on the controls
 * (`boss-hands-ratchet.ts`): the still and the first lit window arrive by
 * themselves, the climb and the open are earned by the catch set before the
 * pawl, and the jam by a pawl pressed with no catch under it, three times.
 * Between the clean teeth, the story (§22, *The story between the teeth*):
 * the slip held by her catch, the kick by his pawl, the bind by both, and
 * the wind by her catch set again and again.
 */
export const RATCHET_POSES: Pose[] = [
  bossPose(
    "ratchet",
    "still",
    "The rack of seven teeth hangs still over the field. P1 and P2 both wait: no pawl is lit yet.",
    { hold: 6 },
  ),
  bossPose(
    "ratchet",
    "work",
    "A pawl lit and the window open. P2 holds the catch and says set; P1 presses the pawl.",
    { hold: 6 },
  ),
  bossPose(
    "ratchet",
    "climb",
    "A clean tooth climbing, for good. P2 lifts the catch and holds it again; P1 waits for set.",
    {
      hand: ratchetHand,
      hold: 6,
      lookAt:
        "the spent plates above the pawl against the teeth still below it — whether slack reads as slack",
    },
  ),
  bossPose(
    "ratchet",
    "slip",
    "One clean tooth and the rack sagging back down past the pawl. P2 sets the catch and keeps it set; P1 waits.",
    { hand: ratchetHand, hold: 2, budgetBeats: 90 },
  ),
  bossPose(
    "ratchet",
    "kick",
    "Two clean teeth and the pawl sprung out of its seat. P1 presses the pawl and keeps it down; P2 waits.",
    { hand: ratchetHand, hold: 2, budgetBeats: 160 },
  ),
  bossPose(
    "ratchet",
    "bind",
    "Three clean teeth grinding on the pawl, sparks off the seam. P1 and P2 hold the pawl and the catch together.",
    { hand: ratchetHand, hold: 2, budgetBeats: 240 },
  ),
  bossPose(
    "ratchet",
    "wind",
    "Four clean teeth and the spring run down to slack coils. P2 sets the catch again and again; P1 waits.",
    {
      hand: ratchetHand,
      hold: 2,
      budgetBeats: 240,
      lookAt: "the spring — whether a set of the catch reads as a turn wound back into it",
    },
  ),
  bossPose("ratchet", "open", "Five clean teeth and the rack standing open. P1 and P2 are done.", {
    hand: ratchetHand,
    hold: 6,
    budgetBeats: 240,
  }),
  bossPose(
    "ratchet",
    "jam",
    "Three teeth burnt and the rack jammed into the hull. P1 pressed with no catch; P2 never held.",
    { hand: ratchetBlindHand, hold: 6, budgetBeats: 240 },
  ),
];
