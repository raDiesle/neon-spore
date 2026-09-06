/**
 * THE MAGNET's one number: how steeply a shot has to be climbing before it
 * clears the plate slung under the body.
 *
 * It is argued against the *field* rather than against the creature, which is
 * why there is only one of it. Nothing here says how a magnet falls or what it
 * is worth — a magnet falls like a slick, and what it pays is
 * `scoreMagnetKill` next door with the other prices it has to be read against.
 * What it has of its own is the angle, and the angle is the creature.
 */
export interface MagnetConfig {
  /**
   * Thousandths of a column a shot must be crossing for every tile it climbs
   * before the plate lets it past — the slope of its approach, signed away.
   *
   * A fifth of a column per tile. That is not a difficulty knob dressed up as
   * geometry: it is the distance between *standing under a body and shooting
   * it*, which every wave since the first has rewarded, and standing somewhere
   * else on purpose. At a fifth, a magnet five tiles up is answered from one
   * column over and one ten tiles up needs two, so the pair is asked for a
   * position **and** a moment rather than for a habit — wait for it to come
   * down, or walk the cannon further out.
   *
   * Read through `magnetLetsThrough` (`magnet.ts`) and nowhere else: the
   * picture render draws of a bolt glancing off the plate and the rule that
   * turned it away are one comparison, and a second copy of it is how a shot
   * comes to bounce off a plate the pair can see it has cleared.
   */
  magnetSlantMilli: number;
}

export const MAGNET_DEFAULTS: MagnetConfig = {
  magnetSlantMilli: 200,
};
