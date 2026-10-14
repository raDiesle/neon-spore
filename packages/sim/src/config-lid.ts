/**
 * **How far THE LID's cord bows** (`lid-bow.ts`). Its own file because
 * `config-creatures.ts`, where the cord's length and where it hangs are, is
 * on its line ceiling; `SimConfig` extends it rather than nesting it, so
 * every call site reads `cfg.lidBowMilli`.
 */
export interface LidHandConfig {
  /**
   * How far the cord's path bows to one side of its way, halfway along, in
   * thousandths of a tile. The owner, 13 October 2026: every straight pull
   * with room bends — *curves increase difficulty and are more exciting than
   * straight lines*. THE WARDEN's rope's tile and a half (`wardenBowMilli`),
   * because it is the same gesture on the same thumb: half a tile more than a
   * thumb may stray (`PULL_STRAY_MILLI`), so a cord pulled straight fails.
   */
  lidBowMilli: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`: a tile and a half. */
export const LID_HAND_DEFAULTS: LidHandConfig = {
  lidBowMilli: 1500,
};
