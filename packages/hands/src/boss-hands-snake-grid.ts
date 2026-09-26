import {
  type SnakeRound,
  type SnakeState,
  type SnakeTile,
  snakePointAt,
  type World,
} from "@neon-spore/sim";

/**
 * SNAKE's arena as the hand's search sees it (`boss-hands-snake.ts`): four
 * headings, and the tiles as flat arrays built once per call.
 */

export type Dir = { dc: -1 | 0 | 1; dr: -1 | 0 | 1 };
export const DIRS: Dir[] = [
  { dc: 0, dr: -1 },
  { dc: 1, dr: 0 },
  { dc: 0, dr: 1 },
  { dc: -1, dr: 0 },
];

/**
 * The arena as flat arrays, built once per call: the search asks the same
 * tile the same question up to twelve times, and asking the lists each time
 * made this hand the whole cost of posing SHED — 2 ms a tick on a fifteen-tile
 * body, four and a half seconds a build. One row below the floor is kept for
 * the gate (`snake-home.ts`), the one tile off the board a step may take.
 *
 * - `blocked`: a rock, a standing enemy, or the body, its tail spared on a
 *   tick it is vacating — `snake-arena.ts`'s `snakeOccupies`.
 * - `stopsShot`: what ends a shot short of a standing enemy — a rock, a
 *   struck enemy, or the body, as `snakeShotStop` reads them.
 * - `point`: an untaken point, from `snakePointAt` itself.
 */
export interface Grid {
  cols: number;
  rows: number;
  blocked: Uint8Array;
  live: Uint8Array;
  stopsShot: Uint8Array;
  point: Uint8Array;
}

export function gridOf(w: World, s: SnakeState, round: SnakeRound): Grid {
  const cols = w.cfg.snakeCols;
  const rows = w.cfg.snakeRows;
  const n = cols * (rows + 1);
  const g: Grid = {
    cols,
    rows,
    blocked: new Uint8Array(n),
    live: new Uint8Array(n),
    stopsShot: new Uint8Array(n),
    point: new Uint8Array(n),
  };
  const at = (t: SnakeTile): number =>
    t.col < 0 || t.row < 0 || t.col >= cols || t.row > rows ? -1 : t.row * cols + t.col;
  const mark = (arr: Uint8Array, t: SnakeTile | undefined): void => {
    const i = t ? at(t) : -1;
    if (i >= 0) arr[i] = 1;
  };
  for (const t of round.rocks) {
    mark(g.blocked, t);
    mark(g.stopsShot, t);
  }
  round.enemies.forEach((t, i) => {
    mark(g.stopsShot, t);
    if (s.struck.includes(i)) return;
    mark(g.blocked, t);
    mark(g.live, t);
  });
  const spareTail = s.grow === 0;
  for (let i = 0; i < s.body.length; i++) {
    if (spareTail && i === s.body.length - 1) continue;
    mark(g.blocked, s.body[i]);
    mark(g.stopsShot, s.body[i]);
  }
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (snakePointAt(s, col, row) !== -1) g.point[row * cols + col] = 1;
    }
  }
  return g;
}

/** Whether firing from `(col, row, dc, dr)` would find a standing enemy — mirrors `snakeShotStop`. */
export function wouldHit(g: Grid, reachTiles: number, col: number, row: number, d: Dir): boolean {
  let c = col;
  let r = row;
  for (let reach = 0; reach < reachTiles; reach++) {
    c += d.dc;
    r += d.dr;
    if (c < 0 || r < 0 || c >= g.cols || r >= g.rows) return false;
    const i = r * g.cols + c;
    if (g.live[i]) return true;
    if (g.stopsShot[i]) return false;
  }
  return false;
}
