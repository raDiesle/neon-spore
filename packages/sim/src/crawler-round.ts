import { metColor, missedColor } from "./balance.js";
import {
  type CrawlerSide,
  crawlerEntryCol,
  crawlerHeadingFor,
  crawlerLinks,
  crawlerOf,
  crawlerSegmentCount,
  crawlerSide,
  crawlRow,
  linkCol,
  segmentColor,
} from "./crawler.js";
import { removeCreature } from "./field.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **How a worm comes on, how its body closes up, and what a shot into one
 * does.** Its own file beside `crawler.ts`, the split `shell.ts` and
 * `shell-round.ts` already make and for their reason: next door is what a
 * crawler *is* — where its links stand, what answers each of them, which way
 * it walks — and none of it touches a world. This is the half that mutates
 * one, and the half a reviewer opens to find out what a press costs.
 *
 * The beat is a third file (`crawler-beat.ts`): the walk, the shield, the beam
 * and the burrow are all things that happen *to* a worm on the clock rather
 * than because somebody pressed something, and putting them here would have
 * put four endings inside the file that answers a bullet.
 */

/**
 * Grow the rest of a worm behind the link that has just arrived, and settle
 * that link's own place on it.
 *
 * The queue entry becomes the **head** — `spawnArrivals` has already pushed it
 * — and this hangs the segments and the tail out behind it, one column apart,
 * walking away from the wall it came over. It mutates that first body rather
 * than returning a replacement for it, because `world.nextId` is spent inside
 * the object literal next door and a worm's name *is* its head's id.
 *
 * **The body starts off the field on purpose.** Only the head is on a column
 * anybody can reach on the beat it enters; every link behind it stands in a
 * negative column (or one past the last), which no shot tests and no draw
 * reaches. So the worm feeds itself onto the ship a link at a time, the pair
 * gets the order to read before they get the whole of it to answer, and the
 * head has the field's full width of steps in front of it whatever length the
 * wave asked for.
 */
export function growCrawler(
  world: World,
  head: Creature,
  asked: number | undefined,
  side: CrawlerSide | undefined,
): Creature[] {
  const cfg = world.cfg;
  const from = crawlerSide(cfg.cols, head.col, side);
  const dir = crawlerHeadingFor(from);
  const col = crawlerEntryCol(cfg.cols, from);
  const row = crawlRow(cfg);
  const segments = crawlerSegmentCount(cfg, asked);
  head.col = col;
  head.fromCol = col;
  head.row = row;
  head.color = null;
  head.crawlerId = head.id;
  head.crawlerOrder = 0;
  head.crawlerDir = dir;
  const born: Creature[] = [];
  // The segments, then the tail: one order, so `linkIsEnd` reads the last of
  // the run as the tail without anything having to say so.
  for (let order = 1; order <= segments + 1; order++) {
    const place = order - 1;
    const behind = linkCol(col, dir, order);
    born.push({
      id: world.nextId++,
      kind: "crawler",
      col: behind,
      row,
      // Out of the wall rather than out of the head: the whole body is off the
      // field on this beat, so what the first frame draws is a worm still
      // coming over the edge.
      fromRow: row,
      fromCol: behind,
      color: order === segments + 1 ? null : segmentColor(place),
      holes: 0,
      petals: 0,
      dragMilli: 0,
      shell: 0,
      crawlerId: head.id,
      crawlerOrder: order,
      crawlerDir: dir,
    });
  }
  return born;
}

/**
 * Close the body up behind whatever has been taken off it.
 *
 * **This is the magnet, and it is one line of arithmetic rather than an
 * animation.** Where a link stands is its rank among the living
 * (`linkCol`), so a gap anywhere in the run pulls everything behind it a
 * column forward the instant the gap exists. Called after every change to the
 * run and after every step of the head, which are the only two things that can
 * move a link at all.
 *
 * `fromCol` is deliberately left where it was. A link that snapped with its
 * origin rewritten would jump between two frames; left alone, render glides it
 * into its new column over the rest of the beat and the hit test follows it
 * there (`creatureLane`), so what the eye sees and what a bolt meets are the
 * same body.
 */
export function alignCrawler(world: World, crawlerId: number): void {
  const links = crawlerLinks(world, crawlerId);
  const head = links[0];
  if (!head) return;
  const dir = head.crawlerDir ?? 1;
  for (let rank = 1; rank < links.length; rank++) {
    links[rank]!.col = linkCol(head.col, dir, rank);
  }
}

/**
 * A shot met a link. Returns whether the bullet goes on, the same contract
 * `resolve` has — and it never does: what stopped it is a body, and a lance
 * that tore the length of a worm would answer in one press the order this
 * creature exists to make the pair say out loud.
 *
 * Three answers, and the two that are not kills are deliberately the same one
 * a rock gives. An end is armour and an armoured segment is armour, so the
 * bolt leaves a crater on either and nothing else — the rule made visible, and
 * the same picture the pair already reads off a meteor. There is no colour to
 * be wrong about on either, so neither is booked as a colour miss: what the
 * pair got wrong was the *control*, and the shield is still standing by.
 */
export function linkStruck(world: World, b: Bullet, hit: Creature): boolean {
  if (hit.color === null) {
    hit.holes = Math.min(world.cfg.maxHoles, hit.holes + 1);
    world.events.push({ type: "hole", col: hit.col, row: hit.row });
    return false;
  }
  if (hit.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }

  // The ordinary kill, and deliberately the ordinary event: the segment leaves
  // the field and the column it was holding is open, which is exactly what a
  // `destroy` means everywhere else. THE STRAND needed one of its own because
  // a shrivelled bead stays hanging; nothing stays hanging here.
  metColor(world);
  world.score += world.cfg.scoreDestroy;
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: hit.color });
  const crawlerId = crawlerOf(hit);
  removeCreature(world, hit.id);
  alignCrawler(world, crawlerId);
  return false;
}
