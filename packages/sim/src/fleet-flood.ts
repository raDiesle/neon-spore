import { fleetIndex, fleetShipAt, shipCol, shipRow, shipSunk } from "./fleet-board.js";
import { type FleetState, fleetAfloat, fleetStruck } from "./fleet-state.js";
import type { World } from "./world.js";

/**
 * **THE FLEET's second and third states, on the beat** — the flood a hit
 * opens, the wreck a finished rake leaves, and the plug that closes either
 * when its window runs out (`fleet-state.ts` says what the three are for).
 *
 * Its own file for the reason `fleet-board.ts` is: `fleet.ts` is the hunt and
 * was near its limit, and the hunt is what the pair does *between* these.
 * Nothing here hears a thumb — the thumbs are `fleet-hand.ts`, on the tick —
 * this is what the beat does with where the thumbs are.
 */

/** Beats left in the open window, `0` in `hunt` and never below it. */
export function fleetWindowLeft(world: World, b: FleetState): number {
  if (b.phase === "hunt") return 0;
  const span = b.phase === "flood" ? world.cfg.fleetFloodBeats : world.cfg.fleetWreckBeats;
  return Math.max(0, span - (world.beat - b.phaseBeat));
}

/** Back to the hunt, whatever happened to the hull: every thumb's mark cleared. */
function toHunt(world: World, b: FleetState): void {
  b.phase = "hunt";
  b.phaseBeat = world.beat;
  b.holed = -1;
  b.holeCol = -1;
  b.holeRow = -1;
  b.breachHeld = false;
  b.rakeOn = false;
  b.rakeCol = -1;
  b.rakeRow = -1;
  b.wreckPullMilli = 0;
}

/**
 * A shell that found a hull: the hull is holed at that square and the water
 * comes. Called from `fleet.ts`'s salvo on the tick of the hit, after the hit
 * itself has been said, so the plume rides beside the mark.
 *
 * A hull of one square would be raked already; the chart refuses one
 * (`FLEET_LEN_MIN`), but the check is made here rather than assumed, because
 * the wreck is what a wholly struck hull *is* and not what a rake did.
 */
export function openFlood(world: World, b: FleetState, at: number, col: number, row: number): void {
  b.phase = "flood";
  b.phaseBeat = world.beat;
  b.holed = at;
  b.holeCol = col;
  b.holeRow = row;
  b.breachHeld = false;
  b.rakeOn = false;
  b.rakeCol = -1;
  b.rakeRow = -1;
  b.rakeBeat = world.beat;
  b.wreckPullMilli = 0;
  world.events.push({ type: "fleetFlood", col, row });
  if (shipSunk(world.cfg, b.ships[at]!, b.struck)) openWreck(world, b);
}

/** The hull raked end to end: it lies on the water until it is pulled under. */
function openWreck(world: World, b: FleetState): void {
  b.phase = "wreck";
  b.phaseBeat = world.beat;
  b.wreckPullMilli = 0;
  world.events.push({ type: "fleetWreck", col: b.holeCol, row: b.holeRow });
}

/**
 * The sea healing: every mark on the holed hull taken back, the hole with
 * them, and the hunt for that hull begun again. The one time `struck` shrinks
 * — a splash beside the hull stays, because open water does not heal.
 */
export function plugFleet(world: World, b: FleetState): void {
  const ship = b.ships[b.holed];
  if (ship === undefined) return;
  const own = new Set<number>();
  for (let i = 0; i < ship.len; i++) {
    own.add(fleetIndex(world.cfg, shipCol(ship, i), shipRow(ship, i)));
  }
  b.struck = b.struck.filter((i) => !own.has(i));
  world.events.push({ type: "fleetPlug", col: b.holeCol, row: b.holeRow });
  toHunt(world, b);
}

/**
 * The wreck going under: the ship is sunk on this beat, the way a salvo used
 * to sink it, and the fight is over when it was the last. Called from the
 * navigator's pull on the tick it reaches (`fleet-hand.ts`).
 */
export function sinkFleetWreck(world: World, b: FleetState): void {
  const ship = b.ships[b.holed];
  if (ship === undefined) return;
  b.sunkBeat[b.holed] = world.beat;
  const left = fleetAfloat(b);
  const col = b.holeCol;
  const row = b.holeRow;
  world.events.push({ type: "fleetSunk", col, row, len: ship.len, left });
  toHunt(world, b);
  if (left > 0) return;
  world.events.push({ type: "fleetDown", col, row });
  world.boss = null;
}

/**
 * One beat of the flood or the wreck. The window first, so a rake on the
 * closing beat is a rake too late — the clock is the navigator's to watch
 * and the pilot's to be told about, and a square struck as the plug went in
 * would be a mark on a hull that was already whole again.
 *
 * Then the rake: the pilot's thumb on a square of the holed hull that is not
 * yet struck, with the navigator's on the plume, strikes it after
 * `fleetRakeBeats` on it. Both thumbs, on the beat — the pair's one shared
 * moment in this state, and the reason the flood is the two of them rather
 * than the pilot alone (he can see the hull; she can see the clock).
 */
export function stepFleetFlood(world: World, b: FleetState): void {
  if (b.phase === "hunt") return;
  if (fleetWindowLeft(world, b) <= 0) {
    plugFleet(world, b);
    return;
  }
  if (b.phase !== "flood" || !b.breachHeld || !b.rakeOn) return;
  if (world.beat - b.rakeBeat < world.cfg.fleetRakeBeats) return;
  const col = b.rakeCol;
  const row = b.rakeRow;
  if (fleetShipAt(b.ships, col, row) !== b.holed) return;
  if (fleetStruck(world, b, col, row)) return;
  b.struck.push(fleetIndex(world.cfg, col, row));
  b.rakeBeat = world.beat;
  world.events.push({ type: "fleetRake", col, row });
  if (shipSunk(world.cfg, b.ships[b.holed]!, b.struck)) openWreck(world, b);
}
