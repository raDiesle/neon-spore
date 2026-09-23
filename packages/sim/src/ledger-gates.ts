import type { SimConfig } from "./config.js";
import { type LedgerBead, type LedgerState, ledgerNext, ledgerPhase } from "./ledger.js";

/**
 * **What THE LEDGER's four hands are offering, this tick** — one question per
 * movement, asked by the rule and by the ring drawn on it.
 *
 * Its own page for the reason the handles themselves have one: a gate written
 * out a second time in `render/ledger-grip.ts` is a handle that goes on saying
 * *take hold of me* after somebody has changed one of the two copies. Each of
 * these is called from `ledger-hand.ts`'s own handler **and** from the
 * drawing, so there is one reading of every phase in this fight.
 *
 * Cut off `ledger-hand.ts` when the pilot's two were lifted out of `pull` and
 * `haul` and that file went past its 250-line limit. `ledgerPlugs` is the one
 * that is not here: it is asked by `ledger-step.ts` on the beat as well, so it
 * lives with the state in `ledger.ts` and this page names it rather than
 * moving it.
 *
 * **None of them says anything about the seat, and none about a thumb already
 * down.** Whose hand it is belongs with the command (`ledgerHandsHeard`), and
 * a hand on a thing is not a reason to stop drawing the thing.
 */

/** The foot: a cord still paying out, which is the only time it can be walked. */
export function ledgerFootable(t: LedgerState, cfg: SimConfig, beat: number): boolean {
  return ledgerPhase(t, cfg, beat) === "rooting";
}

/**
 * **The return his thumb may haul a beat down**, or `null` — the soonest one,
 * because that is the one he is looking at and the one the pair is talking
 * about (`pull`).
 *
 * The bead itself rather than a boolean, because the drawing wants the same
 * one: his ring rides it down the cord, so a ring that agreed the gesture was
 * on offer but disagreed about *which* return would be the whole of the
 * mistake this file exists to make impossible.
 *
 * Four refusals, and each is the movement's own: only in `whipping`, where a
 * warded return is thrown back for free and the cord is the weapon; never the
 * last, which is the one return nobody is meant to answer; never twice, which
 * is what `pulled` remembers; and never on its own last beat, which has
 * nothing left to be hauled out of.
 *
 * **Two returns never end up on one beat from here**, and no refusal is needed
 * to say so: the bead is the soonest on the cord, so the beat it is hauled
 * onto is earlier than every other return's. The root slides between two
 * landings, and a pull that could stack two bills on one beat would be a trap —
 * it cannot, which `ledger-hand.test.ts` holds.
 */
export function ledgerPullable(t: LedgerState, cfg: SimConfig, beat: number): LedgerBead | null {
  if (ledgerPhase(t, cfg, beat) !== "whipping") return null;
  const b = ledgerNext(t);
  if (b === null || b.last || b.pulled) return null;
  // A return already on its last beat has nothing left to be hauled out of.
  if (b.beat - 1 <= beat) return null;
  return b;
}

/**
 * **The haul: a `taut` cord, and nothing else** — deliberately *not* the
 * plate's column, which `haul` checks for itself.
 *
 * The rule refuses the tear while she is standing in the socket's column, and
 * that refusal is **silent on purpose**: the movement is *let it through*, he
 * cannot see the column he is being refused for, and she can. A ring that went
 * out while she was covering the socket would be the game saying her half of
 * the sentence for her, on the one gesture the fight ends with both of them
 * saying something. So the handle stands for the whole of `taut` and what he
 * gets back for pulling on a covered socket is a dial that will not fill —
 * which is the moment he has to ask her.
 */
export function ledgerHaulable(t: LedgerState, cfg: SimConfig, beat: number): boolean {
  return ledgerPhase(t, cfg, beat) === "taut";
}
