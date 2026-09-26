/**
 * **How far the shield pushes a creature back up the field** (`shield-push.ts`).
 *
 * Its own page for `config-volley.ts`'s reason: the ward that throws a body
 * back up is the same move, and a creature's numbers live beside the rule that
 * reads them. There is no count of pushes in here, and that is the rule rather
 * than a number left out — the owner's answer was **once per creature**
 * (25 September 2026), so the shield buys one more fall and never a stall.
 */
export interface PushConfig {
  /**
   * Rows a push throws the body back up the field each beat of the climb.
   * Three, THE VOLLEY's own speed: a thing hit back leaves faster than it
   * came, so the pair can see it is going away rather than hanging over the
   * dome.
   */
  shieldPushRows: number;
  /**
   * Beats the climb lasts. Three, so a push carries a body nine rows — from
   * the shield's own row to the top third of the field. "Very high" was the
   * owner's word: the pair needs a whole fall's worth of time to get the
   * cannon under it, because the shield will not answer it a second time.
   */
  shieldPushBeats: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const PUSH_DEFAULTS: PushConfig = {
  shieldPushRows: 3,
  shieldPushBeats: 3,
};
