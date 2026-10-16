/**
 * **The bodies the maw finishes**, rather than the cannon or the shield.
 *
 * Its own file for `creature-kinds-standing.ts`' reason: `creature-kinds.ts`
 * was at its 250-line limit when THE MORSEL arrived, and the owner's SUCK page
 * (`docs/spec/suck-ideas.md`) names two more bodies of the same family behind
 * it. What they share is the one control most waves never ask for — the
 * mouth, open, within `podCatchCols` of the cannon — and the price of
 * forgetting it, which is the pod's lost wave rather than a scar.
 *
 * One arm of `CreatureKind` and not a type anything switches on by itself
 * (`creature-roster.ts`, `kind-code.ts`).
 */
export type MawKind =
  /**
   * A soft body in one colour, which a shot in that colour does **not** kill:
   * it turns limp and amber and goes on falling, and only the maw finishes
   * it. Limp, it steers at the cannon on the last stretch as a freed pod does
   * and is taken in or lost at the hull exactly as a cargo is — swallowed, or
   * the wave is lost. Unshot, it breaks the hull like any slick. `morselLimp`
   * is the whole of its state (`morsel.ts`).
   */
  "morsel";
