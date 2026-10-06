import { lampreyHand } from "@neon-spore/hands";
import { lampreyBoss, lampreyTailHeld, type World } from "@neon-spore/sim";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE LAMPREY's states**, posed with a hand on the controls
 * (`boss-hands-lamprey.ts`): the crawl in, the meal and the way out of the
 * picture arrive by themselves, and every later
 * phase is reached by answering the ones before it, the way the pair would —
 * the holder's thumb on the tail, the other's on the head or the lit tooth,
 * the gullet shot in its colour.
 *
 * **The bite is caught in a `teeth` with a tap already on the lit tooth**,
 * so the card shows the thing the stay is counted in: the run of taps begun,
 * and the tail held.
 */

/** Whether a `teeth` is on with a tap on the lit tooth and the tail held. */
function midBite(w: World): boolean {
  const s = lampreyBoss(w);
  return s !== null && s.phase === "bite" && s.toothTaps > 0 && lampreyTailHeld(s);
}

export const LAMPREY_POSES = [
  bossPose(
    "lamprey",
    "entering",
    "The eel crawls in from the side of the field like a worm, hungry. P1 and P2 wait: nothing is asked yet.",
    { want: (w) => lampreyBoss(w)?.phase === "entering" && w.beat >= 1 },
  ),
  bossPose(
    "lamprey",
    "feeding",
    "Food falls and the eel's head goes up to eat it; crumbs where it bit. P1 and P2 watch it eat.",
    { want: (w) => lampreyBoss(w)?.phase === "feeding" && lampreyBoss(w)?.prey !== -1 },
  ),
  bossPose(
    "lamprey",
    "away",
    "Fed, the eel crawls out of the picture by the side. P1 and P2 wait for it to come back.",
    { want: (w) => lampreyBoss(w)?.phase === "away" && lampreyBoss(w)?.leg === 1 },
  ),
  bossPose(
    "lamprey",
    "roam",
    "Between levels the eel crawls the field side to side and drops dung. P2 carries the shield under it; P1 raises it.",
    { hand: lampreyHand, want: (w) => (lampreyBoss(w)?.dung.length ?? 0) > 0, budgetBeats: 200 },
  ),
  bossPose(
    "lamprey",
    "bite",
    "The mouth bitten into a tile, the lit tooth tapped once of three. P2 keeps a thumb on the tail; P1 taps on.",
    { hand: lampreyHand, want: midBite, budgetBeats: 100 },
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
    "The first level won, the eel reared on its tile, its gullet lit red. P1 lays the cannon under it; P2 fires red.",
    { hand: lampreyHand, budgetBeats: 160 },
  ),
  bossPose(
    "lamprey",
    "recoil",
    "The gullet shot, the eel jerked up on its tile and the gullet a step smaller. P1 and P2 wait for it to leap on.",
    { hand: lampreyHand, budgetBeats: 180 },
  ),
  bossPose(
    "lamprey",
    "spent",
    "The last stay won, the eel limp and falling away down the field. P1 and P2 are done.",
    { hand: lampreyHand, hold: 6, budgetBeats: 500 },
  ),
];
