import {
  leadPassing,
  leadRunning,
  leadStill,
  ledgerPhase,
  tasterPhase,
  type World,
} from "@neon-spore/sim";
import { leadHand, leadHandLate, ledgerHand, tasterHand } from "./boss-hands-clocks.js";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The states the pair's hands bring on the bosses that keep a ledger of
 * their own** — THE TASTER's fan, THE LEDGER's cord, THE LEAD's pass —
 * posed the way `poses-bosses-hands-field.ts` poses the field bosses': the
 * boss's wave, a hand on the controls (`boss-hands-clocks.ts`), the run held
 * until the state is there.
 *
 * THE LEAD's pass is the one posed with a hand that plays it *late*: the
 * beam standing on the pass's first beat is the fight played straight, and
 * it ends the body before a pass is ever seen, so `passing` stands the beam
 * on the second beat instead (`leadHandLate`).
 */

export const CLOCK_HAND_POSES: Pose[] = [
  bossPose(
    "taster",
    "fanning",
    "The fan grown out along the wall, every blade edged in the colour the pair has been leaning on: the shot that counts now is the other colour, into the edge it set.",
    { hand: tasterHand, want: tasterIs("fanning"), hold: 6 },
  ),
  bossPose(
    "taster",
    "hurrying",
    "The crest cut through and the fan hurrying: the window shorter, a blade a beat, and the shorn columns the only ones a shot goes up.",
    { hand: tasterHand, want: tasterIs("hurrying"), hold: 6 },
  ),
  bossPose(
    "taster",
    "closed",
    "The fan closed on the colour the pair spent most: nothing single lands, and only a beam in the colour it is *not* leaning on — the one nobody is shown — opens it.",
    { hand: tasterHand, want: tasterIs("closed"), hold: 6 },
  ),
  bossPose(
    "taster",
    "out",
    "The beam in the weak colour through the closed fan, and the taster out: the blades fallen and the wall bare where it grew.",
    { hand: tasterHand, want: tasterIs("out"), hold: 6 },
  ),
  bossPose(
    "ledger",
    "paying",
    "The cord rooted and the seam paying out: the colour it wants up the seam's column widens it, and every hit is billed as a bead the pilot's plate has to meet.",
    { hand: ledgerHand, want: ledgerIs("paying"), hold: 6 },
  ),
  bossPose(
    "ledger",
    "whipping",
    "The cord whipping: a return on its way down the cord, the plate under the socket it lands in, and the trigger owed the beat it arrives.",
    { hand: ledgerHand, want: ledgerIs("whipping"), hold: 6 },
  ),
  bossPose(
    "ledger",
    "taut",
    "The seam open the whole way and the cord taut: the last return billed, the plate stepped off its socket to let it through, and the tear one beat off.",
    { hand: ledgerHand, want: ledgerIs("taut"), hold: 6 },
  ),
  bossPose(
    "ledger",
    "out",
    "The last return let through and the cord torn from its root: the ledger out, the socket dark, the field under it the wave's own.",
    { hand: ledgerHand, want: ledgerIs("out"), hold: 6 },
  ),
  bossPose(
    "lead",
    "running",
    "Down to the fast segments and running two columns a beat, a torch dropped behind it and a rock in the column a shot has to be put in: the sum is two beats ahead now.",
    { hand: leadHand, want: (w) => w.boss?.kind === "lead" && leadRunning(w.boss, w.cfg), hold: 6 },
  ),
  bossPose(
    "lead",
    "still",
    "One segment left and the body stopped dead, stalk upright and nothing able to touch it: the pass comes after the still, and only the beam standing in its way ends it.",
    { hand: leadHand, want: (w) => w.boss?.kind === "lead" && leadStill(w.boss), hold: 6 },
  ),
  bossPose(
    "lead",
    "passing",
    "The still run out and the body on its pass toward the far wall, three columns a beat, with the navigator's fill standing up in a column it has still to cross.",
    { hand: leadHandLate(2), want: (w) => w.boss?.kind === "lead" && leadPassing(w.boss), hold: 6 },
  ),
  bossPose(
    "lead",
    "down",
    "The beam standing in the column the pass went through, and the lead down where it stood: the stalk gone, the wave allowed to end under it.",
    { hand: leadHand, want: (w) => w.boss?.kind === "lead" && w.boss.downBeat >= 0, hold: 6 },
  ),
];

/** THE TASTER in one of its named phases. */
function tasterIs(phase: string): (w: World) => boolean {
  return (w) => w.boss?.kind === "taster" && tasterPhase(w.boss, w.cfg) === phase;
}

/** THE LEDGER in one of its named phases. */
function ledgerIs(phase: string): (w: World) => boolean {
  return (w) => w.boss?.kind === "ledger" && ledgerPhase(w.boss, w.cfg, w.beat) === phase;
}
