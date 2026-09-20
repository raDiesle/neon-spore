import {
  briefingHolds,
  guideHolds,
  guidePage,
  lostAsks,
  onReadyPage,
  type World,
} from "@neon-spore/sim";
import { seatOf, type ViewRole } from "./layout.js";

/**
 * Which page of a wave's opening is up, as a string nobody reads: `OpeningFx`
 * only ever compares it with the last one, and restarts its clocks when it
 * changes. A wave, whether the guide or the introduction is standing, and how
 * far this seat has read — the three things that make one page a different page
 * from the last, and the reason paging back replays the drop rather than
 * arriving with the words already settled.
 *
 * **Its own file**, beside the clocks it drives rather than inside them: it is
 * the only thing in that subject that reads the world, and `opening-fx.ts` was
 * at its limit the day the band grew a clock of its own (`guide-tide.ts`).
 */
export function openingKey(world: World, role: ViewRole): string {
  // The lost screen is a page too, and one that has to replay its entrance on
  // every loss: keyed by the count so a second loss of one wave is a new page.
  if (lostAsks(world)) return `${world.wave}|lost|${world.retries}`;
  if (!briefingHolds(world)) return "";
  const seat: 1 | 2 = seatOf(role);
  if (!guideHolds(world)) return `${world.wave}|intro`;
  const page = guidePage(world, seat);
  return `${world.wave}|${page}${onReadyPage(world, seat) ? "|ready" : ""}`;
}
