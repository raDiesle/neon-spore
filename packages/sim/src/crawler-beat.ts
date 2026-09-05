import { markMoment } from "./balance.js";
import {
  crawlerCrawls,
  crawlerHeading,
  crawlerIds,
  crawlerLinks,
  crawlerSegmentsLeft,
  linkIsArmoured,
} from "./crawler.js";
import { alignCrawler } from "./crawler-round.js";
import { removeCreature, removeCreatures } from "./field.js";
import { breachHull } from "./hull.js";
import { guardArmed } from "./hull-guard.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **A beat of every worm on the field**: the step it takes, the shield it may
 * walk into, and the two ways it stops existing.
 *
 * Its own file beside `crawler.ts` and `crawler-round.ts` because none of it
 * is a press. A bolt is answered where every other bolt is answered; this is
 * the clock, and it holds the four things the clock does to a crawler in the
 * order it does them.
 *
 * **The order is the fairness.** The beam is asked first, off the state the
 * last beat left, so a pair who took the final segment always get the beat
 * that shows the worm leaving rather than losing it to a burrow decided in the
 * same instant. Then the walk, which is what can put a link over the far wall.
 * Then the shield, so a segment that has just stepped into an armed dome is
 * turned there — the same order `resolveHull` gives a rock, which falls first
 * and is answered afterwards.
 */

/** Every worm, one beat. Called from `onBeat` before the fall loop, which
 * skips crawlers entirely: a link neither falls nor glides, so both of its
 * `from` fields are written here and nowhere else. */
export function stepCrawlers(world: World): void {
  for (const id of crawlerIds(world)) {
    if (leaveByBeam(world, id)) continue;
    for (const link of crawlerLinks(world, id)) {
      link.fromRow = link.row;
      link.fromCol = link.col;
    }
    if (crawlerCrawls(world.cfg, world.beat) && crawlOn(world, id)) continue;
    wardLink(world, id);
  }
}

/**
 * A worm with nothing left between its two ends, taken by the beam.
 *
 * The head and the tail are armour and neither can be shot off, so a worm the
 * pair has stripped is a creature with nothing left to do and no way to be
 * finished — it would walk the rest of the ship as scenery and then eat into
 * it, which would make taking every segment off worse than taking none. So the
 * ship opens a lane for it: a column of light over the hull, and the two ends
 * go up it.
 *
 * Asked on the beat rather than at the instant the last segment goes, and the
 * delay is the picture — `breakSpentStrands`' argument exactly. A whole beat
 * of two ends standing on the ship with nothing between them is what the pair
 * is owed for having read the order right.
 */
function leaveByBeam(world: World, crawlerId: number): boolean {
  const links = crawlerLinks(world, crawlerId);
  if (links.length === 0) return true;
  if (crawlerSegmentsLeft(world, crawlerId).length > 0) return false;
  world.score += world.cfg.scoreCrawlerBeam;
  const head = links[0]!;
  world.events.push({ type: "crawlerBeam", col: head.col, row: head.row, links: links.length });
  removeCreatures(
    world,
    links.map((l) => l.id),
  );
  return true;
}

/**
 * One column of walking, and the burrow when there is no column left to walk
 * into. Returns whether the worm has left the field.
 *
 * The head is the only link that is moved: everything behind it stands at its
 * own rank back along the heading, so `alignCrawler` is what carries the rest
 * of the body — the same one call the magnet makes when a segment is taken
 * off, so a worm that walks and a worm that closes up can never disagree about
 * where its links are.
 */
function crawlOn(world: World, crawlerId: number): boolean {
  const links = crawlerLinks(world, crawlerId);
  const head = links[0];
  if (!head) return true;
  const next = head.col + crawlerHeading(head);
  if (next < 0 || next > world.cfg.cols - 1) {
    burrowIn(world, links);
    return true;
  }
  head.col = next;
  alignCrawler(world, crawlerId);
  return false;
}

/**
 * The worm reached the far wall and ate its way in.
 *
 * **It breaks the hull in every column it still covers**, not in one. That is
 * the whole picture the owner asked for — a thing digging into sand throws it
 * up on both sides of itself — and it is also the honest arithmetic: what the
 * pair failed to take off the body is exactly what is left to go in, so a worm
 * stripped to one segment costs a fraction of a whole one. `breachHull` per
 * column, so the scars, the `breach` events and the picture at the hull are
 * the ones an arrival makes; nothing about a hole in the ship should depend on
 * what tore it.
 *
 * Columns off the edge are folded onto the wall the worm went through rather
 * than dropped, so a long body half off the field still bites as hard as a
 * short one standing wholly on it.
 */
function burrowIn(world: World, links: Creature[]): void {
  const cfg = world.cfg;
  const head = links[0]!;
  const segments = links.length - 2;
  const price = cfg.damageCrawlerBite + Math.max(0, segments) * cfg.damageCrawlerSegment;
  const cols: number[] = [];
  for (const link of links) {
    const col = Math.max(0, Math.min(cfg.cols - 1, link.col));
    if (!cols.includes(col)) cols.push(col);
  }
  // Before the breaches, because this is what happened and they are what it
  // cost: the ear and the eye both open on the body going in.
  world.events.push({ type: "crawlerBurrow", col: head.col, row: head.row, links: links.length });
  markMoment(world, false);
  const share = price / cols.length;
  for (const col of cols) breachHull(world, col, "crawler", head.row, share, null);
  removeCreatures(
    world,
    links.map((l) => l.id),
  );
}

/**
 * The shield, under an armoured segment, on the beat.
 *
 * It is the ordinary ward asked in the one place the ordinary ward cannot
 * reach. `resolveHull` answers a body that is *arriving*, and a crawler never
 * arrives — it is already standing on the row the dome covers, and it stays
 * there. So the question is put here instead, with the same two halves it
 * always has: player 2's column and player 1's trigger, and `guardArmed` is
 * the one place that second half is decided.
 *
 * What it produces is a plain `deflect`, and that is a decision rather than a
 * shortcut: a plate shrugged off the worm and thrown clear is the same picture
 * and the same sound as a rock turned at the dome, and the pair has no reason
 * to learn a second word for it.
 */
function wardLink(world: World, crawlerId: number): void {
  if (!guardArmed(world)) return;
  const hit = crawlerLinks(world, crawlerId).find(
    (c) => c.col === world.shieldCol && linkIsArmoured(world, c),
  );
  if (!hit) return;
  world.guard.tries += 1;
  world.guard.deflected += 1;
  markMoment(world, true);
  world.score += world.cfg.scoreDeflect;
  world.events.push({
    type: "deflect",
    col: hit.col,
    span: 1,
    kind: hit.kind,
    fromRow: hit.fromRow,
  });
  removeCreature(world, hit.id);
  alignCrawler(world, crawlerId);
}
