import { keelHand } from "@neon-spore/hands";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE KEEL's eleven states**, posed with a hand on the controls
 * (`boss-hands-keel.ts`): the still and the first lit joint arrive by
 * themselves, and the rest are earned by each joint tapped by the seat whose
 * half it sits over, the socket shot in its colour, the flip held by both,
 * the marrow shot in both colours, and the rock shot out.
 */
export const KEEL_POSES: Pose[] = [
  bossPose(
    "keel",
    "still",
    "The spine drops in over the field. P1 and P2 wait: no joint is lit yet.",
    { hold: 6 },
  ),
  bossPose(
    "keel",
    "joint",
    "The leftmost joint lit over P1's half. P1 taps its ring; P2 does nothing.",
    { hold: 6 },
  ),
  bossPose("keel", "rest", "A segment locked and the spine resting. P1 and P2 wait.", {
    hand: keelHand,
    hold: 6,
  }),
  bossPose("keel", "split", "Four locked, the midpoint hinging open. P1 and P2 wait.", {
    hand: keelHand,
    hold: 6,
    budgetBeats: 120,
  }),
  bossPose(
    "keel",
    "socket",
    "The socket flashing its colour. P1 aims the middle; P2 fires that colour.",
    { hand: keelHand, hold: 6, budgetBeats: 120 },
  ),
  bossPose(
    "keel",
    "flip",
    "The spine bows the wrong way. P1 holds the left end joint; P2 holds the right, together.",
    { hand: keelHand, hold: 2, budgetBeats: 160 },
  ),
  bossPose(
    "keel",
    "marrow",
    "A seam lit down the middle. P1 aims the middle; P2 fires red, then cyan.",
    { hand: keelHand, hold: 1, budgetBeats: 160 },
  ),
  bossPose(
    "keel",
    "rigid",
    "Every joint answered at tempo, the spine held rigid. P1 and P2 wait.",
    {
      hand: keelHand,
      hold: 6,
      budgetBeats: 200,
    },
  ),
  bossPose("keel", "rock", "The tail whips a rock down its column. P1 aims under it; P2 fires.", {
    hand: keelHand,
    hold: 6,
    budgetBeats: 200,
  }),
  bossPose("keel", "cool", "The spine banks from white to iron. P1 and P2 keep their hands off.", {
    hand: keelHand,
    hold: 2,
    budgetBeats: 240,
  }),
  bossPose(
    "keel",
    "straight",
    "The rock shot out, the spine snapped straight. P1 and P2 are done.",
    {
      hand: keelHand,
      hold: 6,
      budgetBeats: 240,
    },
  ),
];
