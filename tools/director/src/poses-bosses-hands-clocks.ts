import {
  leadHolding,
  leadPassing,
  leadRunning,
  leadStill,
  ledgerPhase,
  spoolBoss,
  tasterPhase,
  type World,
  wellHeldNow,
} from "@neon-spore/sim";
import {
  leadHand,
  leadHandLate,
  leadHoldHand,
  ledgerHand,
  tasterHand,
} from "./boss-hands-clocks.js";
import { spoolHand, spoolWrongHand } from "./boss-hands-spool.js";
import { wellHoldHand, wellWindHand } from "./boss-hands-well.js";
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
 *
 * THE WELL's three are here too, and its ledger is the odd one: not a count
 * the pair keeps but the angle its own face stands at, which is a clock all
 * the same and reached the same way — a hand on the one handle it has
 * (`boss-hands-well.ts`). Its fourth state, the square face it opens on, is
 * a boss standing still and is posed with the rest of those in
 * `poses-bosses-first.ts`.
 *
 * **THE SPOOL's three earned states are here rather than with the other
 * handle boss**, which is where a brake belongs by rights: THE BELLOWS's five
 * cards took `poses-bosses-hands-handles.ts` within a couple of dozen lines
 * of its limit, and a boss's cards are worth more kept in one block than
 * filed under the control they happen to use. Its other two — the spool
 * hanging taut and the line simply running — arrive with no hand on anything
 * and are with the unattended states in `poses-bosses-clocks.ts`.
 */

export const CLOCK_HAND_POSES: Pose[] = [
  bossPose(
    "well",
    "rolling",
    "The face has begun to slip: the hours are leaving their columns. P1 reads the numerals; P2 says which column.",
    { crop: "full", role: "p1", want: wellIs("rolling"), hold: 6 },
  ),
  bossPose(
    "well",
    "held",
    "P1's thumb is on the seam and the slip has stopped under it, for four beats and no more. P2 counts them down.",
    { crop: "full", role: "p1", hand: wellHoldHand, want: wellHeld, hold: 6 },
  ),
  bossPose(
    "well",
    "wound",
    "Three sectors from the top and stopped: it wants turning back. P1 sweeps the seam up to twelve; P2 says when it is home.",
    { crop: "full", role: "p1", hand: wellWindHand, want: wellIs("wound"), hold: 6 },
  ),
  bossPose(
    "taster",
    "fanning",
    "The fan is edged in the colour the pair leans on. P1 aims at a standing blade; P2 fires the other colour.",
    { hand: tasterHand, want: tasterIs("fanning"), hold: 6 },
  ),
  bossPose(
    "taster",
    "hurrying",
    "The crest is cut and the fan hurries, a blade a beat. P1 aims up a shorn column; P2 fires into it.",
    { hand: tasterHand, want: tasterIs("hurrying"), hold: 6 },
  ),
  bossPose(
    "taster",
    "closed",
    "The fan is closed and only the colour spent least opens it. P1 aims at the crest; P2 holds that colour down.",
    { hand: tasterHand, want: tasterIs("closed"), hold: 6 },
  ),
  bossPose(
    "taster",
    "out",
    "Two beams went through the closed fan and the taster is out. P1 aims at the wave again; P2 fires.",
    { hand: tasterHand, want: tasterIs("out"), hold: 6 },
  ),
  bossPose(
    "ledger",
    "paying",
    "The cord is rooted and the seam paying out. P1 aims at the seam; P2 stands the plate on the socket and fires.",
    { hand: ledgerHand, want: ledgerIs("paying"), hold: 6 },
  ),
  bossPose(
    "ledger",
    "whipping",
    "The cord whips and every bolt bills a return. P1 triggers the beat one lands; P2 holds her fire.",
    { hand: ledgerHand, want: ledgerIs("whipping"), hold: 6 },
  ),
  bossPose(
    "ledger",
    "taut",
    "The seam is open the whole way and the cord taut. P2 steps the plate two columns off; P1 keeps off the trigger.",
    { hand: ledgerHand, want: ledgerIs("taut"), hold: 6 },
  ),
  bossPose(
    "ledger",
    "out",
    "The cord is torn from its root and the ledger out. P1 aims at the wave again; P2 fires.",
    { hand: ledgerHand, want: ledgerIs("out"), hold: 6 },
  ),
  bossPose(
    "lead",
    "running",
    "The body runs two columns a beat. P1 aims where it will be, not where it is; P2 fires on that beat.",
    { hand: leadHand, want: (w) => w.boss?.kind === "lead" && leadRunning(w.boss, w.cfg), hold: 6 },
  ),
  bossPose(
    "lead",
    "still",
    "One segment left and the body stopped dead. P1 aims at the column its pass starts from; P2 primes.",
    { hand: leadHand, want: (w) => w.boss?.kind === "lead" && leadStill(w.boss), hold: 6 },
  ),
  bossPose(
    "lead",
    "held",
    "P2's thumb is on the stalk and the still is not running out. P1 puts the cannon where the pass starts.",
    { hand: leadHoldHand, want: (w) => w.boss?.kind === "lead" && leadHolding(w.boss), hold: 6 },
  ),
  bossPose(
    "lead",
    "passing",
    "The body passes three columns a beat. P1 holds the cannon still; P2's fill stands up in its way.",
    { hand: leadHandLate(2), want: (w) => w.boss?.kind === "lead" && leadPassing(w.boss), hold: 6 },
  ),
  bossPose(
    "lead",
    "down",
    "The beam stood in the pass's own column and the lead is down. P1 aims at the wave again; P2 fires.",
    { hand: leadHand, want: (w) => w.boss?.kind === "lead" && w.boss.downBeat >= 0, hold: 6 },
  ),
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
];

/** THE WELL's face in one of its three phases. */
function wellIs(phase: string): (w: World) => boolean {
  return (w) => w.boss?.kind === "well" && w.boss.phase === phase;
}

/** The slip stopped under a thumb — a phase and a grip together, not a phase. */
/** A declaration rather than a const, because the cards above name it and a
 * `const` is not hoisted — the same reason `wellIs` is one. */
function wellHeld(w: World): boolean {
  return w.boss?.kind === "well" && w.boss.phase === "rolling" && wellHeldNow(w.boss);
}

/** THE TASTER in one of its named phases. */
function tasterIs(phase: string): (w: World) => boolean {
  return (w) => w.boss?.kind === "taster" && tasterPhase(w.boss, w.cfg) === phase;
}

/** THE LEDGER in one of its named phases. */
function ledgerIs(phase: string): (w: World) => boolean {
  return (w) => w.boss?.kind === "ledger" && ledgerPhase(w.boss, w.cfg, w.beat) === phase;
}

/** THE SPOOL in one of its named phases. */
function spoolIn(phase: string): (w: World) => boolean {
  return (w) => spoolBoss(w)?.phase === phase;
}
