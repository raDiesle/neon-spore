/**
 * Draw a sheet for THE MAZE: the walls of one circular maze, in the shape
 * `packages/content/src/maze-rounds.ts` holds them.
 *
 * **This is how a sheet is drawn, not how one is played.** The game may never
 * generate a wheel — two devices have to be looking at the same drum and the
 * cheapest way to guarantee that is for there to be only one, which is why
 * nothing in `sim` or `content` touches an rng. So the randomness lives here,
 * out of the game, and what ships is the printed result: literal numbers,
 * committed, read by both devices as data. The owner asked for one more way in
 * each round and for the mazes to be drawn rather than searched for; this is
 * the pen.
 *
 * **The shape is the owner's sheet's shape.** Seven corridors round a middle,
 * every radial wall on an eighth of a turn, every gap the same arc wide. What
 * a generated sheet is free to choose is which walls stand and where the gaps
 * fall — the first by carving a spanning tree, the second by nudging each gap
 * off the centre of its sector so a drum does not read as a machine part.
 *
 * **A perfect maze, so every way in arrives.** The cells are carved into a
 * tree, which means any gap in the rim reaches the middle and no shot that
 * gets in is wasted. The owner chose that over a drum with dead ends in it.
 */

/** A cell of the carving grid: a ring, and one of the sectors of that ring. */
interface Cell {
  ring: number;
  sector: number;
}

/** The eighths every radial wall stands on, as the owner's own sheet has them. */
const SECTORS = 8;
const TURN = 360_000;
const SECTOR = TURN / SECTORS;

/**
 * A tiny deterministic stream. Not `sim`'s `Rng` — nothing here runs in the
 * game, and importing across into `sim` for a shuffle would be a dependency
 * bought for six lines. Same seed, same sheet, every time this tool is run.
 */
function stream(seed: number): () => number {
  let state = seed | 0 || 1;
  return () => {
    state = (state * 1_103_515_245 + 12_345) & 0x7fff_ffff;
    return state / 0x7fff_ffff;
  };
}

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
function carve(rings: number, next: () => number): Set<string> {
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
const isJoined = (joined: Set<string>, a: Cell, b: Cell) =>
  joined.has([key(a), key(b)].sort().join("|"));

/**
 * The gap between two cells of the same sector, nudged off the sector's centre
 * so the sheet reads as drawn rather than as stamped. It stays clear of both
 * radial walls by a quarter of a sector whatever the nudge, so no gap can ever
 * be cut into the wall beside it.
 */
function gapAt(sector: number, next: () => number): number {
  const slack = SECTOR / 2;
  return Math.round(sector * SECTOR + SECTOR / 2 + (next() - 0.5) * slack);
}

export interface Sheet {
  rings: number;
  coreMilli: number;
  openMilli: number;
  walls: number[][];
  openings: number[][];
}

/**
 * One sheet: `rings` corridors round a middle, with `ways` gaps in the rim.
 *
 * The rim's gaps are spread as evenly as eight sectors allow and then nudged
 * like every other gap, so two ways in are never within a pull of each other —
 * the pilot has to choose one and turn to it, which is the round.
 */
export function drawSheet(rings: number, ways: number, seed: number): Sheet {
  const next = stream(seed);
  const joined = carve(rings, next);

  const walls: number[][] = [[]];
  for (let ring = 1; ring <= rings; ring++) {
    const list: number[] = [];
    for (let sector = 0; sector < SECTORS; sector++) {
      const before = { ring, sector: (sector + SECTORS - 1) % SECTORS };
      if (!isJoined(joined, before, { ring, sector })) list.push(sector * SECTOR);
    }
    walls.push(list);
  }

  const openings: number[][] = [];
  for (let circle = 0; circle < rings; circle++) {
    const list: number[] = [];
    for (let sector = 0; sector < SECTORS; sector++) {
      const inner = circle === 0 ? { ring: 0, sector: 0 } : { ring: circle, sector };
      if (isJoined(joined, inner, { ring: circle + 1, sector })) list.push(gapAt(sector, next));
    }
    openings.push(list.sort((a, b) => a - b));
  }
  const rim: number[] = [];
  for (let i = 0; i < ways; i++) {
    rim.push(gapAt(Math.round((i * SECTORS) / ways) % SECTORS, next));
  }
  openings.push([...new Set(rim)].sort((a, b) => a - b));

  return { rings, coreMilli: 177, openMilli: 55, walls, openings };
}
