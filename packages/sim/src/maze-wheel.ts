import { MAZE_TURN, mazeWrap } from "./maze.js";

/**
 * THE MAZE's wheel as a *written-down thing*: the drum's own walls, and what
 * is wrong with them if they were typed wrong.
 *
 * The seam against `maze.ts` is the honest one. This file knows the drum has
 * circles, radial walls and openings and knows nothing about where any of it
 * stands over the field; `maze.ts` knows the angles and the columns and never
 * asks what an opening is for. Neither knows about a world — that is
 * `maze-round.ts`. The route through the walls is `maze-solve.ts`, next door,
 * because a maze and the way through it are two subjects and only one of them
 * is data.
 *
 * **The drum is a real maze, drawn as one.** It used to be a set of plain
 * circles with mouths on the rim and a route authored beside them, which meant
 * the picture and the shot were two copies of the same claim and the screen
 * showed no walls at all. Now the walls *are* the content: circles broken by
 * openings, radial walls between them, and one gap in the rim to come in by.
 * Where the shot goes is **solved** from those walls rather than typed, so a
 * shot cannot walk through something the picture draws.
 *
 * **How the drum is indexed.** `rings` is how many corridors lie between the
 * middle and the rim; ring 0 *is* the middle. Circle `k` closes ring `k` on
 * the outside, so circle 0 is the wall round the middle and circle `rings` is
 * the rim. `walls[k]` is ring `k`'s radial walls and `walls[0]` is empty — the
 * middle is one room. `openings[k]` is the gaps in circle `k`, which is what
 * joins ring `k` to ring `k + 1`.
 *
 * **Zero is the angle that points at the ship**, and angles rise the way
 * `maze.ts` turns — a stored angle is fed straight to `mazeSinMilli`. A drum
 * copied off a printed sheet is therefore mirrored on the way in, once, where
 * it is authored (`packages/content/src/maze-rounds.ts`).
 *
 * **Wheels are authored, never generated.** Two devices have to be looking at
 * the same drum, and the cheapest way to guarantee that is for there to be
 * only one — the argument `mirror.ts` makes about its sequences. Nothing in
 * THE MAZE draws from the rng, the opening angle included.
 */

/** One place the shot stands: which ring it is in, and where round it. */
export interface MazeStep {
  /** 0 is the middle. `rings` is the corridor just inside the rim. */
  ring: number;
  /** Where round the drum, in thousandths of a degree, in the drum's own frame. */
  angleMilli: number;
}

/** One way in: a gap in the rim, and every place the shot stands after it. */
export interface MazeEntrance {
  /** The rim opening this way in comes through, in the drum's own frame. */
  angleMilli: number;
  route: MazeStep[];
}

/** The drum's walls, and nothing about where it stands or what goes through it. */
export interface MazeGeometry {
  /** Corridors between the middle and the rim. Ring 0 is the middle itself. */
  rings: number;
  /** The middle's radius, in thousandths of the rim's. */
  coreMilli: number;
  /** How wide every opening is, as an arc, in thousandths of the rim's radius. */
  openMilli: number;
  /** Each ring's radial walls, ascending. `walls[0]` is the middle's, and empty. */
  walls: number[][];
  /** Each circle's openings, ascending. `openings[rings]` is the rim's. */
  openings: number[][];
}

/** One round: one wheel, and the wheel is the whole round (`maze-round.ts`). */
export interface MazeWheel extends MazeGeometry {
  /** Where the wheel stands when the round opens, in thousandths of a degree. */
  startMilli: number;
  entrances: MazeEntrance[];
}

/**
 * The radius of circle `k`, in thousandths of the rim's — circle `rings` being
 * the rim itself. The middle is wider than a corridor, so the corridors share
 * out what is left of the radius rather than all of it.
 */
export function mazeCircleMilli(geo: MazeGeometry, k: number): number {
  return geo.coreMilli + Math.round((k * (1000 - geo.coreMilli)) / geo.rings);
}

/** Where the shot rides in ring `k`: the middle of its corridor, or the centre. */
export function mazeRingMilli(geo: MazeGeometry, k: number): number {
  if (k <= 0) return 0;
  return Math.round((mazeCircleMilli(geo, k - 1) + mazeCircleMilli(geo, k)) / 2);
}

/**
 * Which arc of ring `k` an angle falls in — the stretch of corridor between
 * two radial walls, which is the piece the shot can travel without crossing
 * one. A ring with no walls is a single arc all the way round.
 *
 * This is the rule that says what a wall *is*, so call it. A second copy of it
 * is how a route comes to step through one and a picture comes to draw it
 * open.
 */
export function mazeArc(geo: MazeGeometry, k: number, angleMilli: number): number {
  const walls = geo.walls[k] ?? [];
  if (walls.length === 0) return 0;
  const a = mazeWrap(angleMilli);
  let best = 0;
  for (let i = 1; i < walls.length; i++) {
    if (mazeWrap(a - (walls[i] ?? 0)) < mazeWrap(a - (walls[best] ?? 0))) best = i;
  }
  return best;
}

/**
 * How far round ring `k` the shot turns to get from one angle to another, in
 * thousandths of a degree, signed. It goes the way that stays inside the arc
 * it is already in, which on a ring with walls is the only way there is; a
 * ring with none is a full circle, and it takes the short way round.
 */
export function mazeSweep(
  geo: MazeGeometry,
  k: number,
  fromMilli: number,
  toMilli: number,
): number {
  const forward = mazeWrap(toMilli - fromMilli);
  const walls = geo.walls[k] ?? [];
  if (walls.length === 0) return forward <= MAZE_TURN / 2 ? forward : forward - MAZE_TURN;
  const start = walls[mazeArc(geo, k, fromMilli)] ?? 0;
  const already = mazeWrap(fromMilli - start);
  const wanted = mazeWrap(toMilli - start);
  return wanted >= already ? forward : forward - MAZE_TURN;
}

/**
 * A wheel of one's own, sharing nothing with the authored one. `installMaze`
 * takes one per round: the drum is data a wave hands over, and a boss that
 * wrote through to it would leave the next run of the same wave playing a
 * wheel the last pair had already turned.
 */
export function mazeCopyWheel(wheel: MazeWheel): MazeWheel {
  return {
    rings: wheel.rings,
    coreMilli: wheel.coreMilli,
    openMilli: wheel.openMilli,
    startMilli: wheel.startMilli,
    walls: wheel.walls.map((list) => [...list]),
    openings: wheel.openings.map((list) => [...list]),
    entrances: wheel.entrances.map((e) => ({
      angleMilli: e.angleMilli,
      route: e.route.map((cell) => ({ ...cell })),
    })),
  };
}

/** Whether this way in reaches the middle. In a real maze every one of them
 * does — the walls are a tree, so any gap in the rim and the middle are joined
 * — but a drum may be authored with a gap that is walled off from it, and that
 * is the dead end the round costs the hull for. */
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
 * whose picture nobody can read, and a rim with no gap in it is a round with
 * nothing to do.
 */
export function mazeFault(wheel: MazeWheel): string | null {
  const shape = shapeFault(wheel);
  if (shape !== null) return shape;
  if (wheel.entrances.length < 1) return "a wheel with no way in";
  for (const [i, entrance] of wheel.entrances.entries()) {
    const fault = routeFault(wheel, entrance, i);
    if (fault !== null) return fault;
  }
  if (mazeCoreEntrance(wheel) < 0) return "no way in reaches the middle";
  return null;
}

function shapeFault(wheel: MazeWheel): string | null {
  if (wheel.rings < 2) return "a wheel with fewer than two rings";
  if (wheel.coreMilli < 1 || wheel.coreMilli >= 1000) return "a middle that is not inside the rim";
  if (wheel.openMilli < 1) return "openings with no width";
  if (mazeWrap(wheel.startMilli) !== wheel.startMilli) return "the opening angle is not one turn";
  if (wheel.walls.length !== wheel.rings + 1) return "a wall list that is not one per ring";
  if (wheel.openings.length !== wheel.rings + 1)
    return "an opening list that is not one per circle";
  if ((wheel.walls[0] ?? []).length !== 0) return "the middle has been cut into arcs";
  for (const [k, list] of [...wheel.walls, ...wheel.openings].entries()) {
    const which = k < wheel.walls.length ? "wall" : "opening";
    const at = k % (wheel.rings + 1);
    for (const [i, angle] of list.entries()) {
      if (mazeWrap(angle) !== angle) return `${which} ${i} of ${at} is not one turn`;
      if (i > 0 && angle <= (list[i - 1] ?? 0)) return `the ${which}s of ${at} are not in order`;
    }
  }
  return null;
}

/**
 * Whether a route is one the drum actually allows: it comes in by its own gap,
 * every step crosses a circle at an opening, and every turn along a ring stays
 * inside one arc of it. That last line is the whole of "it does not hit the
 * walls", checked rather than promised.
 */
function routeFault(wheel: MazeWheel, entrance: MazeEntrance, i: number): string | null {
  const first = entrance.route[0];
  if (first === undefined) return `way ${i} has no route`;
  if (first.ring !== wheel.rings || first.angleMilli !== entrance.angleMilli)
    return `way ${i} does not start at its own gap in the rim`;
  if (!(wheel.openings[wheel.rings] ?? []).includes(entrance.angleMilli))
    return `way ${i} is not a gap in the rim`;
  for (const [step, cell] of entrance.route.entries()) {
    if (cell.ring < 0 || cell.ring > wheel.rings) return `way ${i} leaves the wheel at ${step}`;
    const prev = entrance.route[step - 1];
    if (prev === undefined) continue;
    if (Math.abs(prev.ring - cell.ring) !== 1) return `way ${i} skips a ring at ${step}`;
    const circle = Math.min(prev.ring, cell.ring);
    if (!(wheel.openings[circle] ?? []).includes(cell.angleMilli))
      return `way ${i} crosses circle ${circle} where it is closed, at ${step}`;
    if (mazeArc(wheel, prev.ring, prev.angleMilli) !== mazeArc(wheel, prev.ring, cell.angleMilli))
      return `way ${i} steps through a wall at ${step}`;
  }
  return null;
}
