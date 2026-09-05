import type { Color } from "./types.js";

/**
 * THE CRAWLER's three: a link coming apart, the worm cleared, and the worm
 * getting in.
 *
 * Its own file rather than three more arms of `events-creature.ts`, for the
 * reason `events-strand.ts` and `events-carom.ts` are next door to that one:
 * it is at its 250-line limit. What is here joins `CreatureEvent` as a single
 * arm.
 *
 * **A plate warded off is still a plain `deflect`**, because that is exactly
 * what it is — a body turned at the dome, and the pair has no reason to learn
 * a second word for it. A link *shot* off is not a plain `destroy` any more:
 * every ring of this animal is a sac of its own colour, and the owner asked
 * for the burst to say so.
 */
export type CrawlerEvent =
  /**
   * A ring taken off by the matching cannon. `color` is the ring's own, which
   * is what the burst and the splash are both thrown in.
   *
   * Its own event rather than the `destroy` it was, for `lureHit`'s reason
   * said about the eye instead of the ear: this is the one kill in the game
   * that bursts a *sac*, and the picture is a shower of the colour plus the
   * goo it lands in (`crawler-fx.ts`). The ear is deliberately unchanged and
   * shares `destroy`'s cue — a segment coming off should sound like a kill,
   * because it is one.
   */
  | { type: "crawlerBreak"; col: number; row: number; color: Color }
  /**
   * The last ring of a worm is off and the ship sweeps the lane clean. `col`
   * and `row` are where that last ring stood, which is where the light comes
   * down.
   *
   * Nothing on a crawler is armour to the pair any more — a colour wants the
   * cannon and a plate wants the shield, head and tail included — so this is
   * the receipt for a body taken apart rather than the ship rescuing what
   * could not be. It is pushed at the moment the run empties, by whichever of
   * the two controls emptied it.
   */
  | { type: "crawlerBeam"; col: number; row: number }
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
