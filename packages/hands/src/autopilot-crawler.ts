import {
  beatPhaseTicks,
  crawlerCrawls,
  crawlerHeading,
  guardArmed,
  guardWindowTicks,
  linkIsArmoured,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE CRAWLER, on AUTO**: a worm walking the shield's row, whose coloured
 * rings want the cannon and whose plates want the shield (`crawler.ts`).
 *
 * The coloured rings need nothing of their own: they wear a colour, so the
 * field hand's cannon takes them like any other body. A plate is answered by
 * the dome armed under it on the beat (`crawler-beat.ts`), which is asked
 * after the worm has walked, so player 2 carries the shield to the column the
 * nearest plate will stand in once the beat has moved it, and player 1
 * triggers in the last stretch before the beat, as under a rock.
 */

type Press = Omit<TimedCommand, "tick">;

/** The column the nearest plate stands in after the next beat's walk, or
 * `null` when no plate is on the field. */
function plateCol(w: World): number | null {
  const walks = crawlerCrawls(w.cfg, w.beat + 1);
  let best: number | null = null;
  for (const c of w.creatures) {
    if (!linkIsArmoured(c)) continue;
    const col = walks ? c.col + crawlerHeading(c) : c.col;
    if (col < 0 || col >= w.cfg.cols) continue;
    if (best === null || Math.abs(col - w.shieldCol) < Math.abs(best - w.shieldCol)) best = col;
  }
  return best;
}

/** The shield's presses at a worm's plate, or `null` when there is none. */
export function wardCrawler(w: World): Press[] | null {
  const col = plateCol(w);
  if (col === null) return null;
  if (w.shieldCol !== col) return [{ player: 2, command: { kind: "shieldCol", col } }];
  if (guardArmed(w)) return [];
  const toBeat = ticksPerBeat(w.cfg) - beatPhaseTicks(w.cfg, w.tick);
  return toBeat <= guardWindowTicks(w.cfg) / 2 ? [{ player: 1, command: { kind: "guard" } }] : [];
}
