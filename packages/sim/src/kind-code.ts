import { CREATURE_KINDS, type CreatureKind } from "./creature-kinds.js";

/**
 * **A kind as a number**, and the compile-time proof that every kind has one.
 *
 * Cut out of `creature-kinds.ts` when THE CRAWLER took that file over its
 * 250-line limit, and the seam is real rather than a place to cut. Next door
 * is the *roster*: the names a body can have and the fixed order they are
 * written in, and nothing else — the one file in the simulation with no
 * dependencies at all. This is what that order is *for*, which is a second
 * question and the only one either export answers.
 *
 * Both are re-exported through `types.ts` the way they always were, so nothing
 * that reaches for `kindCode` had to move.
 */

/** Compile-time proof that `CREATURE_KINDS` names every member of the union. */
type ListedKind = (typeof CREATURE_KINDS)[number];
export type KindsAreExhaustive = CreatureKind extends ListedKind ? true : never;
const KINDS_ARE_EXHAUSTIVE: KindsAreExhaustive = true;
void KINDS_ARE_EXHAUSTIVE;

/**
 * A kind as a stable small integer, for the world fingerprint. Never a ternary
 * chain at the call site: a kind added to the union and not to a chain would
 * hash as whatever the chain fell through to.
 */
export function kindCode(kind: CreatureKind): number {
  return CREATURE_KINDS.indexOf(kind);
}
