/**
 * The walls of THE MAZE's grid: which of them are opened, and which of them
 * are closed again to leave a way in going nowhere.
 *
 * Split out of `draw.ts`, which was past the ceiling `CLAUDE.md` sets, along
 * the seam that was already there. This file is the *graph* — cells, the edges
 * between them, a spanning tree over them and the few edges taken back out of
 * it — and knows nothing about an angle, a radius or a sheet. Next door turns
 * what comes out of here into the numbers the game reads.
 *
 * None of it runs in the game (`draw.ts` has why at length): the randomness
 * lives out here and what ships is its printed result.
 */

/** A cell of the carving grid: a ring, and one of the sectors of that ring. */
interface Cell {
  ring: number;
  sector: number;
}

/** The eighths every radial wall stands on, as the owner's own sheet has them. */
export const SECTORS = 8;
const TURN = 360_000;
export const SECTOR = TURN / SECTORS;

const key = (c: Cell) => `${c.ring}:${c.sector}`;

/** Every wall the grid could open: round a ring, or across into the next one. */
function allEdges(rings: number): { a: Cell; b: Cell }[] {
  const out: { a: Cell; b: Cell }[] = [];
  for (let sector = 0; sector < SECTORS; sector++) {
    out.push({ a: { ring: 0, sector: 0 }, b: { ring: 1, sector } });
  }
  for (let ring = 1; ring <= rings; ring++) {
    for (let sector = 0; sector < SECTORS; sector++) {
      out.push({ a: { ring, sector }, b: { ring, sector: (sector + 1) % SECTORS } });
      if (ring < rings) out.push({ a: { ring, sector }, b: { ring: ring + 1, sector } });
    }
  }
  return out;
}

/**
 * The carving itself: every wall in the grid shuffled, then opened in turn
 * unless it would close a loop. What comes out is a spanning tree, so every
 * way in is a way through and there is exactly one walk to the middle.
 *
 * Shuffle-and-union rather than a growing walk, and the difference is the whole
 * character of the sheet. A depth-first carve is one long snake: it left the
 * middle with a single door and put the rim twenty-odd crossings away. A
 * frontier grown from the middle is the opposite failure — the inward wall is
 * always the first to reach a cell, so every route ran dead straight in and
 * every one of them was eight crossings with not a single turn. Taking the
 * walls in a random order plays no favourites in either direction, which is
 * what leaves the middle several doors and the walk something to do.
 */
export function carve(rings: number, next: () => number): Set<string> {
  const edges = allEdges(rings);
  for (let i = edges.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const a = edges[i];
    const b = edges[j];
    if (a !== undefined && b !== undefined) {
      edges[i] = b;
      edges[j] = a;
    }
  }
  const parent = new Map<string, string>();
  const find = (k: string): string => {
    let at = k;
    while ((parent.get(at) ?? at) !== at) at = parent.get(at) ?? at;
    return at;
  };
  const joined = new Set<string>();
  for (const { a, b } of edges) {
    const ra = find(key(a));
    const rb = find(key(b));
    if (ra === rb) continue;
    parent.set(ra, rb);
    joined.add([key(a), key(b)].sort().join("|"));
  }
  return joined;
}

/** Whether the carving joined these two cells. */
export const isJoined = (joined: Set<string>, a: Cell, b: Cell) =>
  joined.has([key(a), key(b)].sort().join("|"));

/**
 * Every cell, and the wall it hangs off on the way back to the middle. The
 * carving is a tree, so there is exactly one such wall per cell and the whole
 * of the structure below is which of them to close.
 */
function hangings(rings: number, joined: Set<string>): Map<string, string> {
  const near = new Map<string, string[]>();
  const join = (from: string, to: string) => {
    const list = near.get(from);
    if (list === undefined) near.set(from, [to]);
    else list.push(to);
  };
  for (const { a, b } of allEdges(rings)) {
    if (!isJoined(joined, a, b)) continue;
    join(key(a), key(b));
    join(key(b), key(a));
  }
  const up = new Map<string, string>();
  const middle = key({ ring: 0, sector: 0 });
  const seen = new Set<string>([middle]);
  const queue = [middle];
  while (queue.length > 0) {
    const here = queue.shift() ?? middle;
    for (const there of near.get(here) ?? []) {
      if (seen.has(there)) continue;
      seen.add(there);
      up.set(there, here);
      queue.push(there);
    }
  }
  return up;
}

/** The whole way back from a cell to the middle, the cell itself included. */
function backToMiddle(up: Map<string, string>, from: string): string[] {
  const chain = [from];
  for (let at = up.get(from); at !== undefined; at = up.get(at)) chain.push(at);
  return chain;
}

/**
 * How far into its own region a false way in runs before the wall. Three
 * crossings: far enough that the shot is properly lost — it turns, it doubles
 * back, it looks for a while like it is getting somewhere — and near enough
 * that the pair is not watching it for twenty beats to be told no.
 */
const DEAD_END_DEPTH = 3;

/**
 * Wall every way in but one off from the middle.
 *
 * The one left open is the way in **nearest** the middle through the corridors,
 * which is not a choice of taste: nothing else on the rim can then be an
 * ancestor of it, so no wall closed for a dead end can be a wall on the true
 * walk. Everything the pair can see is untouched by that reasoning — the gaps
 * are the same distance apart on the rim and the true one is not the shortest
 * to look at, only the shortest to walk.
 *
 * Each false way is followed a few cells inward and the wall goes in behind
 * it, so what it opens onto is a region of the maze with corridors and turns
 * of its own rather than a cupboard. The region is cut off from the middle and
 * from nothing else, which is exactly what a dead end is.
 */
export function sever(rings: number, joined: Set<string>, sectors: readonly number[]): void {
  const up = hangings(rings, joined);
  const cell = (sector: number) => key({ ring: rings, sector });
  const depth = (sector: number) => backToMiddle(up, cell(sector)).length;
  let open = sectors[0] ?? 0;
  for (const sector of sectors) if (depth(sector) < depth(open)) open = sector;
  const spine = new Set(backToMiddle(up, cell(open)));

  for (const sector of sectors) {
    if (sector === open) continue;
    let at = cell(sector);
    for (let i = 0; i < DEAD_END_DEPTH; i++) {
      const above = up.get(at);
      if (above === undefined || spine.has(above)) break;
      at = above;
    }
    const above = up.get(at);
    if (above !== undefined) joined.delete([at, above].sort().join("|"));
  }
}
