import { type FleetShip, fleetIndex } from "./fleet-board.js";
import type { World } from "./world.js";

/**
 * **THE FLEET's three states, and what the pair does in each.**
 *
 * Moved out of `boss-state.ts` with the second and third states, for the
 * reason `maze-state.ts` and `gauge-state.ts` left it: a boss with more than
 * one state is a subject of its own, and that file was at its limit.
 *
 * - **`hunt`** — the fight as it shipped: the navigator steps the sights a
 *   square a press, the pilot fires when she has arrived (`fleet.ts`).
 * - **`flood`** — a shell that found a hull *holes* it, and the water comes.
 *   The navigator's thumb on the plume (`fleetBreach`, on the picture) keeps
 *   the hole open; while it is there the pilot rakes the sights along the
 *   hull (`fleetRake`) and every square his thumb rests on for
 *   `fleetRakeBeats` is struck (`fleet-flood.ts`). The window is
 *   `fleetFloodBeats`; a hull not wholly raked when it closes is *plugged* —
 *   every mark on it, the hole included, is taken back, and the hunt for it
 *   starts over.
 * - **`wreck`** — the hull is raked end to end and lies on the water. The
 *   navigator drags it under (`fleetWreck`, down by `fleetWreckPullMilli`)
 *   while the pilot's thumb is still on it; a wreck not pulled under within
 *   `fleetWreckBeats` refloats, plugged the same way (`fleet-hand.ts`).
 *
 * **The seats change hands between the states.** In `hunt` the navigator
 * moves and the pilot presses; in `flood` the navigator holds and the pilot
 * moves; in `wreck` the pilot holds and the navigator pulls. Which is the
 * §6.2 ask — several states, a different gesture in each, two of them on the
 * picture rather than the panel — answered without a third control.
 *
 * **The three clocks.** The round's own (`fleetRoundBeats`) runs through all
 * of it; the flood's and the wreck's are windows opened by `phaseBeat`, and
 * what the undone part does when either closes is the plug.
 */
export const FLEET_PHASES = ["hunt", "flood", "wreck"] as const;
export type FleetPhase = (typeof FLEET_PHASES)[number];

/**
 * Everything THE FLEET remembers between beats: an authored chart, the squares
 * already fired at, where the sights are standing, and which hull is holed.
 *
 * **`ships` never changes for the whole fight.** A hull that has been hit does
 * not move and does not shrink — what changes is the list of squares somebody
 * has fired into, and everything else about the fight is read off those two
 * (`fleet-board.ts`). That is why a ship has no `hits` of its own: a count
 * beside the placement would be a second copy of `struck` and the two would
 * disagree the first time a salvo landed on a square that had already taken
 * one. A plug *removes* from `struck`, which is the one time the list shrinks.
 */
export interface FleetState {
  kind: "fleet";
  /** Where the ships are, as the wave authored them. Never written. */
  ships: FleetShip[];
  /**
   * Every square fired at, as chart indices (`fleetIndex`), in the order they
   * were struck. Both a hit and a splash go in: the chart is the shared record
   * and a square nobody may spend twice.
   */
  struck: number[];
  /**
   * The beat each ship went down on, `-1` while it is still afloat. One entry
   * per ship, in `ships` order — render/ runs the sinking off it, so the
   * animation needs no state of its own that a restart could carry over, and
   * the simulation needs no separate count of what is left.
   */
  sunkBeat: number[];
  /** The column the sights stand in. Player 2's, and only player 2's. */
  aimCol: number;
  /** The row they stand in. */
  aimRow: number;
  /** The beat the fight opened on — the round's own clock. */
  openBeat: number;
  /** The beat of the most recent salvo, for the rest between two of them. */
  firedBeat: number;
  /** Where that salvo landed, `-1` before the first. render/ only. */
  lastCol: number;
  lastRow: number;
  /** Whether it found a hull. render/ only. */
  lastHit: boolean;
  /** Which of the three the fight is in. */
  phase: FleetPhase;
  /** The beat the phase opened on: the flood's and the wreck's window run from it. */
  phaseBeat: number;
  /** The ship that is holed or wrecked, as an index into `ships`; `-1` in `hunt`. */
  holed: number;
  /** The square the shell went in at — where the plume stands. `-1` in `hunt`. */
  holeCol: number;
  holeRow: number;
  /** Whether the navigator's thumb is on the plume. */
  breachHeld: boolean;
  /** Whether the pilot's thumb is on the hull. */
  rakeOn: boolean;
  /** The square under the pilot's thumb, `-1` when it is off the chart or lifted. */
  rakeCol: number;
  rakeRow: number;
  /** The beat the rake last struck a square, for the dwell between two. */
  rakeBeat: number;
  /** How far down the navigator has dragged the wreck, in thousandths of a tile. */
  wreckPullMilli: number;
}

/** Whether that square has already been fired at, hit or splash. */
export function fleetStruck(world: World, b: FleetState, col: number, row: number): boolean {
  return b.struck.includes(fleetIndex(world.cfg, col, row));
}

/** Ships still afloat. The silhouette of the chart is the health bar. */
export function fleetAfloat(b: FleetState): number {
  return b.sunkBeat.filter((beat) => beat === -1).length;
}
