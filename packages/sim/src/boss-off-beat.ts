import type { BossState } from "./boss-union.js";

/**
 * **The six bosses the field's beat never reaches**, and why each one is not
 * an oversight.
 *
 * `boss-others.ts` is the dispatch that steps everything that is not the
 * queen, and its own rule is that a boss doing nothing on the beat **says so
 * by name and with the reason** rather than falling off the end of the chain.
 * Six of them do, which was thirteen lines of branches that all did the same
 * nothing, on a page that has been at its 250-line limit since THE FLEET.
 * Gathered here the reasons are still written down, once each, and the
 * dispatch spends one line on all six.
 *
 * - **THE GAUGE, SNAKE and PINBALL** are stepped on the *tick*, from `step`'s
 *   own early return: the field's beat does not run at all while any of the
 *   three stands, because each of them replaces the field rather than sitting
 *   over it.
 * - **THE SCOUT** is the fourth of exactly that: the little ship is flown on
 *   the tick, and the field has no beat while it is out.
 * - **THE PULSE** is the fifth, two mirrored halves driven the same way.
 * - **THE REPRISE** is here for the opposite reason. What it does on the beat
 *   is put bodies on the field, so it is stepped from `onBeat` beside the only
 *   other thing that does and *before* it (`reprise.ts`) — reaching it here
 *   would be stepping it twice.
 */
export const OFF_THE_BEAT: readonly BossState["kind"][] = [
  "gauge",
  "snake",
  "pinball",
  "scout",
  "pulse",
  "reprise",
];

/** Whether this beat has anything to do for that boss. */
export function offBeat(kind: BossState["kind"]): boolean {
  return OFF_THE_BEAT.includes(kind);
}
