import {
  type MazeEntrance,
  type MazeGeometry,
  type MazeStep,
  type MazeWheel,
  mazeArc,
} from "./maze-wheel.js";

/**
 * The way through THE MAZE's drum, worked out from the walls rather than typed
 * beside them.
 *
 * **This is the file that answers the owner's complaint.** The drum used to
 * carry a hand-listed route per way in, and the picture drew no walls at all,
 * so nothing anywhere could disagree with anything — and nothing did, because
 * there was nothing to disagree with. A drum copied off a real maze has walls,
 * and the moment it does, "the shot must not hit them" becomes a claim that
 * can be false. So the route is derived from the same `walls` and `openings`
 * the picture draws, once, and `mazeFault` re-checks the result against them.
 *
 * **A room is an arc, not a cell.** Two angles in the same ring are the same
 * room when no radial wall stands between them (`mazeArc`), and two rooms in
 * neighbouring rings are joined when a gap in the circle between them falls in
 * both. That is the whole graph; the shortest walk across it is the route.
 *
 * **Integers, and a fixed order, because two devices walk it separately.** The
 * search visits openings in the order they are authored — ascending, which
 * `mazeFault` insists on — so the route is the same list on both screens even
 * where a drum has more than one way to somewhere. Nothing here reads a clock
 * or the rng.
 */

/** Rooms per ring the key packing allows. Far past any drum worth drawing. */
const ROOMS_PER_RING = 1024;
/** The room outside the rim. The shot starts there and may never go back. */
const OUTSIDE = -1;

/** Which room an angle stands in — the number the search is over. */
function room(geo: MazeGeometry, ring: number, angleMilli: number): number {
  if (ring > geo.rings) return OUTSIDE;
  return ring * ROOMS_PER_RING + mazeArc(geo, ring, angleMilli);
}

/** Every step the drum allows, as `from room → the step it lands on`. */
function crossings(geo: MazeGeometry): { from: number; to: number; step: MazeStep }[] {
  const out: { from: number; to: number; step: MazeStep }[] = [];
  for (let k = 0; k <= geo.rings; k++) {
    for (const angleMilli of geo.openings[k] ?? []) {
      const inner = room(geo, k, angleMilli);
      const outer = room(geo, k + 1, angleMilli);
      out.push({ from: inner, to: outer, step: { ring: k + 1, angleMilli } });
      out.push({ from: outer, to: inner, step: { ring: k, angleMilli } });
    }
  }
  return out;
}

/**
 * The shot's whole journey in by one gap in the rim: where it stands when it
 * is through the gap, and every ring it crosses into after that, ending in the
 * middle — or, where a drum has walled that gap off from the middle, at the
 * far end of the dead end instead.
 *
 * Breadth first, so what comes back is the shortest walk — and in a real maze,
 * whose walls are a tree, it is the only one.
 */
export function mazeSolveRoute(geo: MazeGeometry, angleMilli: number): MazeStep[] {
  const edges = crossings(geo);
  const start = room(geo, geo.rings, angleMilli);
  const middle = room(geo, 0, 0);
  // The rim is behind the shot from the first tick: it came in by *this* gap,
  // and a search free to leave again would hand back a walk out and round.
  const routes = new Map<number, MazeStep[]>([[start, [{ ring: geo.rings, angleMilli }]]]);
  const seen = new Set<number>([OUTSIDE, start]);
  const queue: number[] = [start];
  // Where the shot ends up when the middle is walled off from this gap: as far
  // in as the corridors let it, which is what a dead end looks like from the
  // outside. First found at that depth, so the two devices pick the same one.
  let deepest = start;
  while (queue.length > 0) {
    const here = queue.shift() ?? OUTSIDE;
    if (here === middle) break;
    const walked = routes.get(here) ?? [];
    if (walked.length > (routes.get(deepest) ?? []).length) deepest = here;
    for (const edge of edges) {
      if (edge.from !== here || seen.has(edge.to)) continue;
      seen.add(edge.to);
      routes.set(edge.to, [...walked, edge.step]);
      queue.push(edge.to);
    }
  }
  return routes.get(middle) ?? routes.get(deepest) ?? [];
}

/** Every way in the rim has, each with the route the walls give it. */
export function mazeEntrances(geo: MazeGeometry): MazeEntrance[] {
  return (geo.openings[geo.rings] ?? []).map((angleMilli) => ({
    angleMilli,
    route: mazeSolveRoute(geo, angleMilli),
  }));
}

/**
 * A drum, ready to be played: the walls as authored, standing at `startMilli`,
 * with the way through each gap in its rim already solved.
 *
 * Content calls this instead of listing steps, for the reason the old
 * `mazeRoute` existed and this one replaces: a hand-listed route is a second
 * copy of where the corridors run, and the picture and the shot drift apart on
 * it. Here there is no second copy to drift — the walls are the only thing
 * written down.
 */
export function mazeWheel(geo: MazeGeometry, startMilli: number): MazeWheel {
  return { ...geo, startMilli, entrances: mazeEntrances(geo) };
}
