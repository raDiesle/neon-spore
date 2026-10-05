import { lampreyHand } from "@neon-spore/hands";
import { lampreyBoss, lampreyTailHeld, type World } from "@neon-spore/sim";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE LAMPREY's states**, posed with a hand on the controls
 * (`boss-hands-lamprey.ts`): the swim in arrives by itself, and every later
 * phase is reached by answering the ones before it, the way the pair would —
 * the holder's thumb on the tail, the other's on the head or the lit tooth,
 * the gullet shot in its colour.
 *
 * **The bite is caught in a `teeth` with a tooth already out**, so the card
 * shows the thing the fight is counted in: a socket on the ring, the light
 * jumped two places on from it, and the tail held.
 */

/** Whether a `teeth` is on with at least one tooth cracked in it and the tail held. */
function midBite(w: World): boolean {
  const s = lampreyBoss(w);
  return s !== null && s.phase === "bite" && s.pulled.length > 0 && lampreyTailHeld(s);
}

export const LAMPREY_POSES = [
  bossPose(
    "lamprey",
    "entering",
    "The eel swims in from the nearer side in an S, its sucker turned to the hull. P1 and P2 wait: nothing is asked yet.",
    { want: (w) => lampreyBoss(w)?.phase === "entering" && w.beat >= 1 },
  ),
  bossPose(
    "lamprey",
    "bite",
    "The mouth bitten into a tile, a tooth out. P2 keeps a thumb on the tail; P1 taps the one lit tooth.",
    { hand: lampreyHand, want: midBite, budgetBeats: 40 },
  ),
  bossPose(
    "lamprey",
    "leap",
    "A stay won, the eel in the air on its way to the next tile, its tail trailing. P1 and P2 wait for it to land.",
    { hand: lampreyHand, want: (w) => lampreyBoss(w)?.phase === "leap" },
  ),
  bossPose(
    "lamprey",
    "rearing",
    "Three stays won, the eel reared on its tile, its gullet lit red. P1 lays the cannon under it; P2 fires red.",
    { hand: lampreyHand, budgetBeats: 120 },
  ),
  bossPose(
    "lamprey",
    "recoil",
    "The gullet shot, the eel jerked up on its tile and the gullet a step smaller. P1 and P2 wait for it to leap on.",
    { hand: lampreyHand, budgetBeats: 140 },
  ),
  bossPose(
    "lamprey",
    "spent",
    "The last stay won, the eel limp and falling away down the field. P1 and P2 are done.",
    { hand: lampreyHand, hold: 6, budgetBeats: 220 },
  ),
];
