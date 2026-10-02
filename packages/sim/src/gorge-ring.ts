import { midCol, type SimConfig } from "./config.js";
import {
  type GorgeState,
  gorgeBottom,
  gorgeDue,
  gorgeLevelOf,
  gorgePhase,
  gorgeSated,
} from "./gorge.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * **Where THE GORGE takes a shot, and how its ring turns**: the column and
 * row a bubble is met on, the step round to the next bubble still wanting,
 * and THE SLOW held over the bubble at the bottom. Cut off `gorge-step.ts`,
 * which keeps the level hung, the shot met and the beat's clock.
 */

/** The column bubble `i` can be shot in, or `-1`: on a ring only the bottom one, in the middle. */
export function gorgeColOf(cfg: SimConfig, g: GorgeState, i: number): number {
  if (!gorgeLevelOf(g).ring) return i >= 0 && i < g.intakes.length ? g.col + i : -1;
  return i === gorgeBottom(g) ? midCol(cfg) : -1;
}

/** The row, from the top, a shot meets bubble `i` on. */
export function gorgeRowOf(cfg: SimConfig, g: GorgeState): number {
  return gorgeLevelOf(g).ring ? cfg.gorgeRow + cfg.gorgeRingRows : cfg.gorgeRow;
}

/**
 * **THE SLOW spans the ask exactly**: on a ring, while the bubble at the
 * bottom is the one due and still wants shots, out to the beat it turns
 * away; shut the tick it is sated, turns, or the level clears. Opened once
 * per bubble rather than every beat, so the fuse counts from its arrival.
 */
export function gorgeSlow(world: World, g: GorgeState): void {
  const k = g.intakes[gorgeBottom(g)];
  const asks = gorgePhase(g) === "ring" && k !== undefined && !gorgeSated(k);
  const end = g.turnBeat + world.cfg.gorgeTurnBeats;
  if (!asks || !gorgeDue(g, gorgeBottom(g))) closeSlow(world);
  else if (world.slowToBeat !== end) openSlow(world, end - world.beat, "ask");
}

/** One step of the ring, on to the next bubble still wanting shots; the taps on the one leaving are lost. */
export function turnRing(world: World, g: GorgeState): void {
  const n = g.intakes.length;
  const leaving = g.intakes[gorgeBottom(g)];
  if (leaving !== undefined) leaving.taps = 0;
  g.turnFrom = g.turn;
  for (let step = 1; step <= n; step++) {
    const k = g.intakes[(g.turn + step) % n];
    if (k !== undefined && !gorgeSated(k)) {
      g.turn += step;
      break;
    }
  }
  g.turnBeat = world.beat;
  world.events.push({ type: "gorgeTurn", row: gorgeRowOf(world.cfg, g), col: midCol(world.cfg) });
}
