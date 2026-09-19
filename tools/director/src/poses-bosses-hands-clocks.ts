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
    "The beam went through the closed fan and the taster is out. P1 aims at the wave again; P2 fires.",
    { hand: tasterHand, want: tasterIs("out"), hold: 6 },
  ),
  bossPose(
    "ledger",
    "paying",
    "The cord is rooted and the seam paying out. P1 stands the plate on the socket; P2 fires the colour it wants.",
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
    "The seam is open the whole way and the cord taut. P1 steps the plate off the socket; P2 lets the last one through.",
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
];

/** THE TASTER in one of its named phases. */
function tasterIs(phase: string): (w: World) => boolean {
  return (w) => w.boss?.kind === "taster" && tasterPhase(w.boss, w.cfg) === phase;
}

/** THE LEDGER in one of its named phases. */
function ledgerIs(phase: string): (w: World) => boolean {
  return (w) => w.boss?.kind === "ledger" && ledgerPhase(w.boss, w.cfg, w.beat) === phase;
}
