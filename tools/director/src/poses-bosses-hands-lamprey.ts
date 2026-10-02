import { lampreyHand } from "@neon-spore/hands";
import { lampreyBoss, lampreyHeld, type World } from "@neon-spore/sim";
import { POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE LAMPREY's states**, posed with a hand on the controls
 * (`boss-hands-lamprey.ts`): the swim in arrives by itself, and every later
 * phase is reached by answering the ones before it, the way the pair would —
 * the pinner's thumb on the jaw, the tapper's on the lit tooth, the gullet
 * shot in its colour.
 *
 * **The bite is caught with a tooth already out**, so the card shows the
 * thing the fight is counted in: a socket on the ring, the light jumped two
 * places on from it, and the jaw held through a crawl.
 */

/** Whether a bite is on with at least one tooth cracked in it and the jaw held. */
function midBite(w: World): boolean {
  const s = lampreyBoss(w);
  return s !== null && s.phase === "bite" && s.pulled.length > 0 && lampreyHeld(w, s);
}

/** Ticks the eel has been in the phase it is in. */
function inPhase(w: World): number {
  const s = lampreyBoss(w);
  return s === null ? 0 : (w.beat - s.phaseBeat) * TPB;
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
    "The mouth bitten onto the hull, a tooth out. P1 keeps a thumb on the jaw as it crawls; P2 taps the one lit tooth.",
    { hand: lampreyHand, want: midBite, budgetBeats: 40 },
  ),
  bossPose(
    "lamprey",
    "loose",
    "Three teeth out, the mouth pulled off the hull, swimming to the far end. P1 and P2 wait; the next bite swaps them.",
    { hand: lampreyHand, want: (w) => lampreyBoss(w)?.phase === "loose" && inPhase(w) >= TPB },
  ),
  bossPose(
    "lamprey",
    "rearing",
    "Five teeth out, the eel reared over the middle, its gullet lit red. P1 lays the cannon under it; P2 fires red.",
    { hand: lampreyHand, budgetBeats: 120 },
  ),
  bossPose(
    "lamprey",
    "recoil",
    "The gullet shot, the eel jerked up and the gullet a step smaller. P1 and P2 wait for the next colour.",
    { hand: lampreyHand, budgetBeats: 140 },
  ),
  bossPose(
    "lamprey",
    "spent",
    "Three shots taken, the eel limp and falling away off the hull. P1 and P2 are done.",
    { hand: lampreyHand, hold: 6, budgetBeats: 220 },
  ),
];
