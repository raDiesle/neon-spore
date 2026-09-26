import { ratchetBlindHand, ratchetHand } from "@neon-spore/hands";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE RATCHET's five states**, posed with a hand on the controls
 * (`boss-hands-ratchet.ts`): the still and the first lit window arrive by
 * themselves, the climb and the open are earned by the catch set before the
 * pawl, and the jam by a pawl pressed with no catch under it, three times.
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
    { hand: ratchetHand, hold: 6 },
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
