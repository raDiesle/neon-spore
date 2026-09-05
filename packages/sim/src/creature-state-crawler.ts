/**
 * **THE CRAWLER's three fields**, and the whole of what one link remembers.
 *
 * Its own file beside `creature-state-strand.ts` and for that file's reason:
 * `creature-state.ts` was at its 250-line limit the day this creature was
 * written, and these three only mean anything against each other. An identity
 * with no place says nothing about which link is which, a place with no
 * identity says nothing about which body it belongs to, and neither says which
 * way the thing is walking.
 *
 * `CreatureState extends CrawlerState`, so every call site still reads
 * `c.crawlerOrder` and nothing moved.
 *
 * **Absent is a value here, as it is everywhere in `creature-state.ts`.** A
 * body that is not a link carries none of the three, so every wave written
 * before this creature is byte-for-byte the same world. None of them may be
 * read directly — `crawlerOf`, `linkOrder` and `crawlerHeading` in
 * `crawler.ts` are the rules, and a second spelling of a fallback is how the
 * worm render draws and the worm the simulation walks come apart.
 */
export interface CrawlerState {
  /**
   * Which crawler this link belongs to, and **its presence is being one**. The
   * id of the head, which is a name that outlives every segment on the body,
   * because the head is one of the two links nothing can take off.
   *
   * Read it through `crawlerOf`. Render groups a worm by this field and
   * `crawlerLinks` counts the same one to decide where each body stands, so a
   * second spelling of the fallback is a picture and a rule about two
   * different creatures.
   */
  crawlerId?: number;
  /**
   * Where this link sits **along the body**: 0 at the head, counting back to
   * the tail. It is a place and not a position — where a link actually stands
   * is its *rank among the living* (`linkCol`), and that is what closes up
   * when a segment is taken off.
   *
   * It fixes what the link is and what answers it: 0 is the head, the greatest
   * is the tail, and everything between is a segment whose answer cycles red,
   * cyan, armour along the body (`segmentColor`). So the order the pair reads
   * off the worm is a fact about this number and never authored per segment.
   */
  crawlerOrder?: number;
  /**
   * Which way the worm is walking: `1` to the right, `-1` to the left. On
   * every link rather than on the head alone, because it is what each body is
   * *facing* as well as where the head is going, and a link that had to look
   * its head up to be drawn would be a body that cannot be drawn without the
   * world.
   *
   * Fixed when the worm comes on and never turned. Read it through
   * `crawlerHeading`.
   */
  crawlerDir?: 1 | -1;
}
