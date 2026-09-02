import type { SimConfig } from "./config.js";

/**
 * THE FLEET's chart, as arithmetic.
 *
 * The whole boss is one question asked of a square: is there a hull under it,
 * and has it been fired at before. Everything on this page answers that
 * question about an authored placement and a list of squares, and none of it
 * touches a world — so render/, the director and the tests can all ask where a
 * ship stands without pulling a boss in.
 *
 * Its own file and not `fleet.ts`, for the reason `vane-cycle.ts` is not
 * `vane.ts`: the choreography moves state and this does not.
 *
 * **A square is one integer.** `row * cols + col`, which is the only place
 * that formula is written. Two devices comparing lists of squares are
 * comparing lists of small whole numbers, and a fingerprint over them is a
 * fingerprint over the fight.
 */

/** The two ways a ship can lie. Its own list so a fingerprint can index it. */
export const FLEET_DIRS = ["h", "v"] as const;
export type FleetDir = (typeof FLEET_DIRS)[number];

/**
 * The lengths a ship may be, from the reference sheet: carrier, battleship,
 * cruiser and submarine both at three, patrol boat. A length is a number
 * rather than five named classes for the reason `RockSize` is a number rather
 * than five more kinds — the class is what the length *means*, and nothing in
 * the simulation acts on the meaning.
 */
export const FLEET_LEN_MIN = 2;
export const FLEET_LEN_MAX = 5;

/** The most ships one chart may carry. One is a fight; six is a search. */
export const FLEET_SHIPS_MAX = 5;

/**
 * One ship, where the wave's author put it: the square its head is in, how
 * many squares it is, and which way it lies from there.
 *
 * **Authored against the real field and not the seven columns**, which is the
 * one exception this game makes to "waves are authored for 7 and remapped"
 * (`mapCol`). A remap rounds, and a rounded run of squares is not a run: a
 * five-long hull authored across seven columns comes out of `mapCol` with
 * gaps in it, which is a ship the pair can shoot through the middle of. So a
 * fleet says exactly where it stands on the chart it is played on, and
 * `bossFromWave` hands it through untouched.
 *
 * It lives here rather than in `entries.ts` for the reason `MazeWheel` lives
 * in `maze-wheel.ts`: the shape a wave authors and the arithmetic that reads
 * it are one subject, and splitting them puts the meaning of `dir` a file
 * away from every function that acts on it.
 */
export interface FleetShip {
  /** The column its head is in. */
  col: number;
  /** The row its head is in. */
  row: number;
  /** How many squares long, `FLEET_LEN_MIN`..`FLEET_LEN_MAX`. */
  len: number;
  /** Which way it lies from the head: `h` to the right, `v` downwards. */
  dir: FleetDir;
}

/** How many squares across the chart is. The field's own width, never less. */
export function fleetCols(cfg: SimConfig): number {
  return cfg.cols;
}

/** How many squares down it is, counted from row 0. */
export function fleetRows(cfg: SimConfig): number {
  return Math.max(1, Math.min(cfg.rows - 1, cfg.fleetRows));
}

/** Whether a square is on the chart at all. The sights may never leave it. */
export function fleetOnBoard(cfg: SimConfig, col: number, row: number): boolean {
  return col >= 0 && col < fleetCols(cfg) && row >= 0 && row < fleetRows(cfg);
}

/**
 * A square as one integer. The only place `row * cols + col` is written, so
 * the list of squares already fired at cannot mean two different things on two
 * phones.
 */
export function fleetIndex(cfg: SimConfig, col: number, row: number): number {
  return row * fleetCols(cfg) + col;
}

export function fleetCol(cfg: SimConfig, index: number): number {
  return index % fleetCols(cfg);
}

export function fleetRow(cfg: SimConfig, index: number): number {
  return Math.floor(index / fleetCols(cfg));
}

/** The column of a ship's `i`th square, counting from its head. */
export function shipCol(ship: FleetShip, i: number): number {
  return ship.dir === "h" ? ship.col + i : ship.col;
}

/** The row of the same square. */
export function shipRow(ship: FleetShip, i: number): number {
  return ship.dir === "v" ? ship.row + i : ship.row;
}

/** Whether this ship has a hull under that square. */
export function shipCovers(ship: FleetShip, col: number, row: number): boolean {
  for (let i = 0; i < ship.len; i++) {
    if (shipCol(ship, i) === col && shipRow(ship, i) === row) return true;
  }
  return false;
}

/**
 * Which ship is under a square, by index into the fleet, or -1 for open water.
 * An index rather than the ship itself, because everything that follows a hit
 * — whether the ship went down, which beat it went down on — is kept in
 * arrays beside the placement (`FleetState`).
 */
export function fleetShipAt(ships: readonly FleetShip[], col: number, row: number): number {
  for (let i = 0; i < ships.length; i++) {
    if (shipCovers(ships[i]!, col, row)) return i;
  }
  return -1;
}

/** How many of a ship's squares have been fired at. */
export function shipHits(cfg: SimConfig, ship: FleetShip, struck: readonly number[]): number {
  let n = 0;
  for (let i = 0; i < ship.len; i++) {
    if (struck.includes(fleetIndex(cfg, shipCol(ship, i), shipRow(ship, i)))) n += 1;
  }
  return n;
}

/** Whether every square of it has been. */
export function shipSunk(cfg: SimConfig, ship: FleetShip, struck: readonly number[]): boolean {
  return shipHits(cfg, ship, struck) >= ship.len;
}

/**
 * What is wrong with an authored fleet, or `null` for one that is a fleet.
 *
 * The sibling of `mazeFault`, and it exists for the same reason: the placement
 * is written by hand in the director, and a chart with two hulls in one square
 * is not a chart with a mistake in it — it is a fight where one salvo sinks
 * two ships and the pair can never work out why. So the editor asks this and
 * says so, and `packages/content/test/waves.test.ts` asks it of every authored
 * wave.
 */
export function fleetFault(cfg: SimConfig, ships: readonly FleetShip[]): string | null {
  if (ships.length === 0) return "a fleet with no ships in it";
  if (ships.length > FLEET_SHIPS_MAX) return `${ships.length} ships; at most ${FLEET_SHIPS_MAX}`;
  const seen = new Set<number>();
  for (let s = 0; s < ships.length; s++) {
    const ship = ships[s]!;
    if (!Number.isInteger(ship.len) || ship.len < FLEET_LEN_MIN || ship.len > FLEET_LEN_MAX) {
      return `ship ${s} is ${ship.len} long; ${FLEET_LEN_MIN} to ${FLEET_LEN_MAX}`;
    }
    for (let i = 0; i < ship.len; i++) {
      const col = shipCol(ship, i);
      const row = shipRow(ship, i);
      if (!fleetOnBoard(cfg, col, row)) return `ship ${s} runs off the chart`;
      const at = fleetIndex(cfg, col, row);
      if (seen.has(at)) return `ship ${s} lies across another`;
      seen.add(at);
    }
  }
  return null;
}

/** Every square with a hull under it. The count the clock is written against. */
export function fleetSquares(ships: readonly FleetShip[]): number {
  let n = 0;
  for (const ship of ships) n += ship.len;
  return n;
}
