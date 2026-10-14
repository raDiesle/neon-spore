import { spoolHand, spoolWrongHand } from "@neon-spore/hands";
import { spoolBoss, type World } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE SPOOL's six earned states — three of the fight, and the story's
 * three between the ribs — are here rather than with the other
 * handle boss**, which is where a brake belongs by rights: THE BELLOWS's five
 * cards took `poses-bosses-hands-handles.ts` within a couple of dozen lines
 * of its limit, and a boss's cards are worth more kept in one block than
 * filed under the control they happen to use. Its other two — the spool
 * hanging taut and the line simply running — arrive with no hand on anything
 * and are with the unattended states in `poses-bosses-clocks.ts`.
 *
 * They were filed in `poses-bosses-hands-clocks.ts` until it reached its line
 * limit (14 October 2026), and are joined straight after its cards in
 * `poses-bosses.ts`, so the sheet's order is the same.
 */

export const SPOOL_HAND_POSES: Pose[] = [
  bossPose(
    "spool",
    "slip",
    "P1 held the brake at the wrong end and the line left its zone. P1 and P2 wait: the call starts again.",
    { hand: spoolWrongHand, want: spoolIn("slip"), hold: 6 },
  ),
  bossPose(
    "spool",
    "ease",
    "A whole call held inside the zone and a rib eases open. P1 keeps his depth; P2 reads the next zone.",
    { hand: spoolHand, want: spoolIn("ease"), hold: 6, budgetBeats: 120 },
  ),
  bossPose(
    "spool",
    "slack",
    "The fourth rib is open and the spool drifts off the top. P1 lets the brake go; P2 is done.",
    { hand: spoolHand, want: spoolIn("slack"), hold: 6, budgetBeats: 240 },
  ),
  bossPose(
    "spool",
    "snag",
    "The line caught dead, the casing shuddering. P1 lets the brake go, then grips again; P2 counts.",
    { hand: spoolHand, want: spoolIn("snag"), hold: 2, budgetBeats: 60 },
  ),
  bossPose(
    "spool",
    "whip",
    "The line thrown wide in a loop. P1 holds the brake full deep; P2 counts the beats.",
    { hand: spoolHand, want: spoolIn("whip"), hold: 2, budgetBeats: 90 },
  ),
  bossPose(
    "spool",
    "fray",
    "The line furred with fibres. P1 holds the brake featherlight; P2 says how light.",
    { hand: spoolHand, want: spoolIn("fray"), hold: 2, budgetBeats: 120 },
  ),
];

/** THE SPOOL in one of its named phases. */
function spoolIn(phase: string): (w: World) => boolean {
  return (w) => spoolBoss(w)?.phase === phase;
}
