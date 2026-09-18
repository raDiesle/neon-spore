import { type FleetState, fleetShipAt, fleetStruck, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { chartOf, chartX, chartY } from "./fleet-chart.js";
import type { Layout } from "./layout.js";

/**
 * **What the rounds drawn as a chart are asking for** — page seven of the
 * readings, opened for THE FLEET.
 *
 * A chart round has no field and no body: the picture is a grid of squares and
 * a cursor standing in one of them, and what the pair is arguing about is
 * *which square*. So the one thing a cue may never become here is a coordinate,
 * and the rule that decides every line below is #34's second — **it says the
 * verb and never the answer** — read against a fight whose whole content is
 * the answer.
 *
 * It is a page of its own rather than more of page five because page five is
 * at its limit and these have their own geometry: everything here hangs off
 * `chartOf` and a square's centre, never off the hull row or a tile of the
 * field (`fleet-chart.ts`).
 */

/** THE FLEET's sights, in chart squares: the brackets the verb hangs off, read
 * from `drawFleetSights` rather than guessed at. */
const SIGHTS_HALF = 0.46;

/**
 * THE FLEET. One word, the pilot's, and the navigator gets none — the same
 * finding THE GAUGE's reading came to, arrived at from the opposite side of
 * the split.
 *
 * **She cannot be told anything true.** Her screen is water and the sights,
 * and the only word the field could put on her arrows is `MOVE`: said always,
 * it is not a cue but a fixture; said at the moment the sights are *not* on a
 * hull, it is the map — the one thing this fight exists to make the pilot get
 * out of his mouth, one square at a time. There is no third moment. So the
 * field says nothing at all to her for the whole round, and her page in the
 * film is the only thing that tells her anything.
 *
 * **He is told his own verb, at the moment it will land.** `PRESS` / `FIRE` on
 * the sights while they stand in a square that carries a hull and has not been
 * fired at. Both of those are on his screen already (`showsFleetHulls`, and
 * the marks are drawn on both), so the mark stands on nothing he is not shown
 * and the word says what his thumb does rather than which square it is. It is
 * not the round's difficulty either: seeing that the sights have arrived is
 * the easy half of his job, and the hard half — walking her there a coordinate
 * at a time before the clock runs out — happens in the beats when there is no
 * cue at all.
 *
 * **It draws no frame of its own.** The sights are four corner brackets
 * already (`fleet-marks.ts`), which is the cue's own picture, and a second box
 * round one square is the four-pictures-for-one-idea mistake `target-lock.ts`
 * records the owner ending. The half-extents are the sights' own, so the verb
 * hangs off the brackets rather than off a box nobody drew.
 *
 * **And it goes out while the salvo is resting.** The rest is the shell's own
 * flight (`config-fleet.ts`), so a word over a trigger that is refusing would
 * be an invitation to press nothing — THE MAZE's argument about a handle the
 * ship has taken away, on a button instead.
 */
export function fleetCues(
  l: Layout,
  world: World,
  f: FleetState,
  clearTop: number | undefined,
): readonly BossCue[] {
  if (world.beat - f.firedBeat < world.cfg.fleetSalvoRestBeats) return [];
  if (fleetStruck(world, f, f.aimCol, f.aimRow)) return [];
  if (fleetShipAt(f.ships, f.aimCol, f.aimRow) === -1) return [];
  const c = chartOf(l, world, clearTop);
  if (c.tile <= 0) return [];
  const half = c.tile * SIGHTS_HALF;
  return [
    {
      seat: 1,
      kind: "PRESS",
      word: "FIRE",
      x: chartX(c, f.aimCol),
      y: chartY(c, f.aimRow),
      halfW: half,
      halfH: half,
      seed: 72,
      framed: false,
    },
  ];
}
