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
 * **One way in arrives; the rest are dead ends.** The cells are carved into a
 * tree first, so the sheet is a real maze with exactly one walk between any
 * two rooms. Then every way in but one is *walled off* from the middle, a few
 * cells in, which is what turns the choice of gap into a gamble the pair has
 * to reason about rather than a choice of scenic route. The owner asked for
 * that in as many words: only the first sheet, which is his own and has a
 * single gap, is a drum where any way in would do.
 */

import { carve, isJoined, SECTOR, SECTORS, sever } from "./carve.js";

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
 * The rim's gaps are spread as evenly as eight sectors allow, so two ways in
 * are never within a pull of each other — the pilot has to choose one and turn
 * to it, which is the round. Exactly one of them reaches the middle; `sever`
 * above walls off the others.
 */
export function drawSheet(rings: number, ways: number, seed: number): Sheet {
  const next = stream(seed);
  const joined = carve(rings, next);
  const rimSectors: number[] = [];
  for (let i = 0; i < ways; i++) rimSectors.push(Math.round((i * SECTORS) / ways) % SECTORS);
  sever(rings, joined, rimSectors);

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
  // The rim's gaps stand on their sectors' own centres, unnudged. Five of them
  // over eight sectors leaves two of them a single sector apart, and a nudge
  // that big would put two ways in close enough that the pilot could fall into
  // the wrong one on the way to the right one — which is the one thing a rim
  // with several gaps has to not do (`content/test/maze-rounds.test.ts`).
  const rim = rimSectors.map((sector) => sector * SECTOR + SECTOR / 2);
  openings.push([...new Set(rim)].sort((a, b) => a - b));

  return { rings, coreMilli: 177, openMilli: 55, walls, openings };
}
