import { markMoment } from "./balance.js";
import { crawlerIds, crawlerLinks } from "./crawler.js";
import { linkIsSucked } from "./crawler-part.js";
import { alignCrawler, crawlerCleared } from "./crawler-round.js";
import { removeCreature } from "./field.js";
import { mawOpen } from "./pod-intake.js";
import type { World } from "./world.js";

/**
 * **The maw, under a suck segment of THE CRAWLER**: the cannon in the
 * segment's column and SUCK pressed — the two halves a pod is taken with, on a
 * body that is standing on the ship's surface rather than falling at it.
 *
 * Asked twice, the way the shield is asked once. On the press, for the ring
 * already under the cannon (`commands.ts`); and on every beat the mouth is
 * still open (`crawler-beat.ts`), so a ring that walks or snaps into the
 * cannon's column inside the window is taken as a pod arriving there would be.
 *
 * Exactly the cannon's column rather than `inMawReach`: a worm's rings stand
 * a column apart, and a mouth that reached two either side would take the
 * wrong one as readily as the right.
 */
export function suckCrawlers(world: World): void {
  for (const id of crawlerIds(world)) suckLink(world, id);
}

/** The same, on the beat, while the mouth a press opened is still open. */
export function suckCrawlersOnBeat(world: World, crawlerId: number): void {
  if (mawOpen(world)) suckLink(world, crawlerId);
}

function suckLink(world: World, crawlerId: number): void {
  const hit = crawlerLinks(world, crawlerId).find(
    (c) => c.col === world.cannonCol && linkIsSucked(c),
  );
  if (!hit) return;
  markMoment(world, true);
  world.events.push({ type: "crawlerSwallow", col: hit.col, row: hit.row });
  removeCreature(world, hit.id);
  alignCrawler(world, crawlerId);
  crawlerCleared(world, crawlerId, hit.col, hit.row);
}
