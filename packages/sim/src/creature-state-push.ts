/**
 * **The shield's push, as two fields**, and `shield-push.ts` is the whole of
 * what they mean.
 *
 * Its own file for `creature-state-veer.ts`'s reason: `creature-state.ts` is
 * at its limit, and these two only mean anything against each other.
 * `CreatureState extends PushState`, so every call site reads `c.pushRise`.
 *
 * Unlike the rest of that list, they are not one kind's: any body
 * `isPushable` names may carry them.
 */
export interface PushState {
  /**
   * Beats of climb a push has just bought this body, absent while it is
   * falling. `volleyRise`'s shape exactly, and read through `pushRiseLeft`
   * for its reason: the step and the picture have to agree about which way
   * the body is going.
   */
  pushRise?: number;
  /**
   * True once the shield has pushed this body back, and from then on the
   * shield has nothing more to say to it — the owner's *once per creature*
   * (25 September 2026). Absent on a body never pushed. Read through
   * `pushOffered`, which is the one place that says whether the next push is
   * still owed.
   */
  pushed?: true;
}
