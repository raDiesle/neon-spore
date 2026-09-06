/**
 * THE BARB's two numbers: what a ward caught on one costs, and how long the
 * dome is torn open afterwards.
 *
 * Both are argued against the shield rather than against the body, because
 * that is what this creature is about — nothing here says how a barb falls or
 * what it is worth, since a barb falls like a slick and is worth what a slick
 * is worth (`config-creature-scores.ts`). What it has of its own is the price
 * of the one mistake it exists to punish.
 */
export interface BarbConfig {
  /**
   * What the hull loses when the trigger is pressed with a barb in the
   * shield's column.
   *
   * `damageMeteor`'s figure and not `damageCreature`'s, and the argument is
   * the same one `fenceDamage` makes: this is not a body that merely arrived,
   * it is the pair's own defence turned against them. A number below a rock's
   * would make the mistake cheaper than doing nothing at all, and a rule that
   * rewards standing still is not a rule anybody plays around.
   */
  barbTearDamage: number;
  /**
   * Beats the dome wards nothing at all after a barb has caught it.
   *
   * The tail is the whole creature. A cost paid once, on the beat of the
   * mistake, would be a bad trade and nothing more; a shield that is *gone*
   * for the next three beats is the next rock as well, and the one after it.
   * Three rather than one, so the pair has to say something to each other
   * about it, and short enough that the wave is still winnable from inside it.
   *
   * In beats for `MalfunctionConfig`'s reason: it is a length the pair counts.
   */
  barbScarBeats: number;
}

export const BARB_DEFAULTS: BarbConfig = {
  barbTearDamage: 20,
  barbScarBeats: 3,
};
