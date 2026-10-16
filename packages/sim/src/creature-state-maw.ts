/**
 * **The state the maw's bodies carry**, for `creature-kinds-maw.ts`' family.
 *
 * Its own file rather than a field in `creature-state.ts`, for the reason
 * `creature-state-veer.ts` records: that file is near its limit, and the
 * family has more members coming. `CreatureState extends MawState`, so every
 * call site still reads `c.morselLimp` and nothing moved.
 */
export interface MawState {
  /**
   * Whether THE MORSEL has been shot in its colour and is falling limp, and
   * absent on every other kind. It decides three things at once: whether the
   * next shot is spent on it, whether the hull answers it as a body or as a
   * cargo, and whether it is drawn soft or amber.
   *
   * Read it through `morselIsLimp`, never directly. Absent and `false` mean
   * the same thing — a morsel enters whole — and a site that spelled the
   * fallback again is a site where the picture and the hull can disagree
   * about whether the maw is owed.
   */
  morselLimp?: boolean;
}
