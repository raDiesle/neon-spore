/**
 * THE CRAWLER's two: the worm taken by the beam, and the worm getting in.
 *
 * Its own file rather than two more arms of `events-creature.ts`, for the
 * reason `events-strand.ts` and `events-carom.ts` are next door to that one:
 * it is at its 250-line limit. What is here joins `CreatureEvent` as a single
 * arm.
 *
 * **There are only two, and the ones that are missing are the point.** A
 * segment shot off pushes a plain `destroy` and a segment warded off pushes a
 * plain `deflect`, because that is what each of them *is* — a body killed by
 * the matching colour, and a body turned at the dome. THE STRAND needed events
 * of its own because a shrivelled bead stays hanging and a wrong shot swells
 * one back, neither of which any existing event describes. Nothing about a
 * crawler's two answers is new; only its two endings are.
 */
export type CrawlerEvent =
  /**
   * Every segment is off and the ship has opened a lane for what is left. The
   * two ends cannot be shot and cannot be warded, so this is the only way a
   * pair ever finishes one — `col` and `row` are the head's, which is where
   * the beam comes down, and `links` is how much of the worm went up it, which
   * is two whenever the creature is played as designed.
   */
  | { type: "crawlerBeam"; col: number; row: number; links: number }
  /**
   * The head reached the far wall and the worm has eaten its way into the
   * hull. `col` and `row` are where it went in; `links` is how much body went
   * in with it, which is what the damage was reckoned from
   * (`damageCrawlerSegment`).
   *
   * Its own event rather than being left to the `breach`es it causes, for
   * `lureHit`'s reason: the ear has to tell this apart from an arrival. Every
   * other hole in the ship is something that fell on it, and this one is a
   * thing that walked the whole length of the deck while both players watched.
   */
  | { type: "crawlerBurrow"; col: number; row: number; links: number };
