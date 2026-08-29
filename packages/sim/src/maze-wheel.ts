import { mazeWrap } from "./maze.js";

/**
 * THE MAZE's wheel as a *written-down thing*: what a round author types, and
 * what is wrong with it if they typed it wrong.
 *
 * The seam against `maze.ts` is the honest one. This file knows the drum has
 * rings, sectors and corridors and knows nothing about where any of it stands
 * over the field; `maze.ts` knows the angles and the columns and never asks
 * what a route is for. Neither knows about a world — that is `maze-round.ts`.
 *
 * **Wheels are authored, never generated.** Two devices have to be looking at
 * the same drum, and the cheapest way to guarantee that is for there to be
 * only one — the argument `mirror.ts` makes about its sequences, made again.
 * Nothing in THE MAZE draws from the rng, the opening angle included.
 */

/** One cell of the drum: which ring it is on, and which sector of that ring. */
export interface MazeCell {
  /** 0 is the middle. `rings - 1` is the ring just inside the rim. */
  ring: number;
  sector: number;
}

/** How a route is written: one step inward, or one sector round either way. */
export type MazeMove = "in" | "cw" | "ccw";

/**
 * One way in. `route` is every cell the shot stands on, rim inward, ending at
 * the middle or at whatever is at the end of a corridor that goes nowhere.
 */
export interface MazeEntrance {
  /** The sector of the rim this mouth opens on. */
  sector: number;
  route: MazeCell[];
}

/** One round: one wheel, and the wheel is the whole round (`maze-round.ts`). */
export interface MazeWheel {
  /** Rings between the middle and the rim, the middle counted as ring 0. */
  rings: number;
  /** Sectors the rim is divided into. Every way in sits on one. */
  sectors: number;
  /** Where the wheel stands when the round opens, in thousandths of a degree. */
  startMilli: number;
  entrances: MazeEntrance[];
}

/**
 * A route, written as moves rather than as cells. Content calls this instead
 * of listing coordinates: a hand-listed route is a second copy of where the
 * corridor runs, and the picture and the shot would drift apart on it.
 */
export function mazeRoute(
  wheel: Pick<MazeWheel, "rings" | "sectors">,
  sector: number,
  moves: readonly MazeMove[],
): MazeCell[] {
  let cell: MazeCell = { ring: wheel.rings - 1, sector };
  const cells = [cell];
  for (const move of moves) {
    const ring = move === "in" ? cell.ring - 1 : cell.ring;
    const turn = move === "cw" ? 1 : move === "ccw" ? -1 : 0;
    cell = { ring, sector: (cell.sector + turn + wheel.sectors) % wheel.sectors };
    cells.push(cell);
  }
  return cells;
}

/** Whether this way in ends in the middle. Everything else is a dead end. */
export function mazeReachesCore(entrance: MazeEntrance): boolean {
  return entrance.route.at(-1)?.ring === 0;
}

/** The one way in that reaches the middle, or -1 if the wheel is broken. */
export function mazeCoreEntrance(wheel: MazeWheel): number {
  return wheel.entrances.findIndex(mazeReachesCore);
}

/**
 * What is wrong with an authored wheel, or `null`. Content is data and gets no
 * type check for any of this: a route that steps through a wall is a shot
 * whose picture nobody can read, and two ways to the middle is a round with
 * nothing to choose.
 */
export function mazeFault(wheel: MazeWheel): string | null {
  if (wheel.rings < 2) return "a wheel with fewer than two rings";
  if (wheel.sectors < 4) return "a wheel with fewer than four sectors";
  if (wheel.entrances.length < 2) return "a wheel with fewer than two ways in";
  if (mazeWrap(wheel.startMilli) !== wheel.startMilli) return "the opening angle is not one turn";
  const seen = new Set<number>();
  for (const [i, entrance] of wheel.entrances.entries()) {
    if (entrance.sector < 0 || entrance.sector >= wheel.sectors) return `way ${i} is off the rim`;
    if (seen.has(entrance.sector)) return `two ways in share sector ${entrance.sector}`;
    seen.add(entrance.sector);
    const fault = routeFault(wheel, entrance, i);
    if (fault !== null) return fault;
  }
  const core = wheel.entrances.filter(mazeReachesCore).length;
  if (core !== 1) return `${core} ways in reach the middle`;
  return null;
}

function routeFault(wheel: MazeWheel, entrance: MazeEntrance, i: number): string | null {
  const first = entrance.route[0];
  if (first === undefined) return `way ${i} has no route`;
  if (first.ring !== wheel.rings - 1 || first.sector !== entrance.sector)
    return `way ${i} does not start at its own mouth`;
  for (const [step, cell] of entrance.route.entries()) {
    if (cell.ring < 0 || cell.ring >= wheel.rings) return `way ${i} leaves the wheel at ${step}`;
    if (cell.sector < 0 || cell.sector >= wheel.sectors)
      return `way ${i} leaves the rim at ${step}`;
    const prev = entrance.route[step - 1];
    if (prev === undefined) continue;
    const fwd = (cell.sector - prev.sector + wheel.sectors) % wheel.sectors;
    const round = fwd === 1 || fwd === wheel.sectors - 1;
    const inward = prev.ring - cell.ring === 1;
    if (!((inward && !round) || (prev.ring === cell.ring && round)))
      return `way ${i} steps through a wall at ${step}`;
  }
  return null;
}
