import {
  type SnakeRound,
  type SnakeState,
  type SnakeTile,
  snakeGate,
  snakeGoingHome,
  snakePointAt,
  snakeResting,
  snakeRound,
  snakeShotStop,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **SNAKE's own hand** — the body has no bearing to steer by, THE MAZE's or
 * THE SCOUT's kind: a heading only turns a quarter at a time and every step
 * is forced forward, so reaching `gorge` and `shed` (`docs/queue.md`, this
 * item) wants a real path found through the two things the body must not
 * touch, rather than a hand that merely points and hopes. `snakeEnemyAt`,
 * `snakeRockAt`, `snakeOnBoard`, `snakeOccupies` and `fireSnake` are not on
 * `@neon-spore/sim`'s public surface (`boss-surface-snake.ts` names what is),
 * so the small grid rules below are this file's own, built only from what is
 * — `SnakeRound`'s own lists, `SnakeState.struck`, `snakePointAt` and
 * `snakeShotStop`, both exported.
 *
 * A tile is free unless a rock, a *still-standing* enemy, or the body itself
 * (its own tail excepted, the tick it is vacating) stands on it — a struck
 * enemy is gone and a point is never an obstacle, since walking onto one only
 * ever helps. `bfsFirstTurn` searches breadth-first over `(col, row, heading)`
 * states, the shape a queued quarter-turn actually has, for the nearest tile
 * that is either an untaken point or a heading a shot would carry to a
 * standing enemy from — replanned fresh every tick, so a struck enemy or a
 * banked point drops out of the search the moment it is gone.
 */

type Press = Omit<TimedCommand, "tick">;
type Dir = { dc: -1 | 0 | 1; dr: -1 | 0 | 1 };
const DIRS: Dir[] = [
  { dc: 0, dr: -1 },
  { dc: 1, dr: 0 },
  { dc: 0, dr: 1 },
  { dc: -1, dr: 0 },
];

function key(col: number, row: number, dc: number, dr: number): string {
  return `${col},${row},${dc},${dr}`;
}

/** The heading after a queued turn, the way `snake-move.ts`'s own `turned` reads. */
function turnedDir(dc: number, dr: number, turn: -1 | 0 | 1): Dir {
  const idx = DIRS.findIndex((d) => d.dc === dc && d.dr === dr);
  const next = DIRS[(idx + turn + 4) % 4];
  if (!next) throw new Error("a heading this package does not have");
  return next;
}

function liveEnemyAt(round: SnakeRound, struck: number[], col: number, row: number): boolean {
  return round.enemies.some((t, i) => t.col === col && t.row === row && !struck.includes(i));
}

/** A rock, a standing enemy, or the body — mirrors `snake-arena.ts`'s `snakeOccupies`. */
function occupied(
  round: SnakeRound,
  struck: number[],
  body: SnakeTile[],
  grow: number,
  col: number,
  row: number,
): boolean {
  if (round.rocks.some((t) => t.col === col && t.row === row)) return true;
  if (liveEnemyAt(round, struck, col, row)) return true;
  const spareTail = grow === 0;
  for (let i = 0; i < body.length; i++) {
    if (spareTail && i === body.length - 1) continue;
    const t = body[i];
    if (t && t.col === col && t.row === row) return true;
  }
  return false;
}

/** Whether firing from `(col, row, dc, dr)` would find a standing enemy — mirrors `snakeShotStop`. */
function wouldHit(
  round: SnakeRound,
  struck: number[],
  body: SnakeTile[],
  grow: number,
  cfg: World["cfg"],
  col: number,
  row: number,
  dc: number,
  dr: number,
): boolean {
  let c = col;
  let r = row;
  for (let reach = 0; reach < cfg.snakeShotTiles; reach++) {
    c += dc;
    r += dr;
    if (c < 0 || r < 0 || c >= cfg.snakeCols || r >= cfg.snakeRows) return false;
    if (liveEnemyAt(round, struck, c, r)) return true;
    if (round.rocks.some((t) => t.col === c && t.row === r)) return false;
    if (occupied(round, [], body, grow, c, r)) return false;
  }
  return false;
}

/**
 * The turn to send this tick, or `null` when nothing reachable is worth
 * reaching — the head's own state counts, so a hand already aimed or already
 * standing on a point returns straight-on rather than circling for one.
 */
function bfsFirstTurn(w: World, s: SnakeState, round: SnakeRound): -1 | 0 | 1 | null {
  const head = s.body[0];
  if (!head) return null;
  const start = key(head.col, head.row, s.dirCol, s.dirRow);
  const prev = new Map<string, { turn: -1 | 0 | 1; from: string } | null>();
  prev.set(start, null);
  const queue: string[] = [start];
  // A cleared arena has one goal left, the mouth in the floor (`snake-home.ts`).
  const home = snakeGoingHome(s);
  const gate = snakeGate(w.cfg);
  const atGate = (col: number, row: number): boolean =>
    home && col === gate.col && row === gate.row;
  const isGoal = (col: number, row: number, dc: number, dr: number): boolean =>
    home
      ? atGate(col, row)
      : snakePointAt(s, col, row) !== -1 ||
        wouldHit(round, s.struck, s.body, s.grow, w.cfg, col, row, dc, dr);
  let goal = isGoal(head.col, head.row, s.dirCol, s.dirRow) ? start : null;
  while (queue.length > 0 && goal === null) {
    const cur = queue.shift();
    if (cur === undefined) break;
    const [col, row, dc, dr] = cur.split(",").map(Number) as [number, number, number, number];
    for (const turn of [0, -1, 1] as const) {
      const nd = turnedDir(dc, dr, turn);
      const nc = col + nd.dc;
      const nr = row + nd.dr;
      const off = nc < 0 || nr < 0 || nc >= w.cfg.snakeCols || nr >= w.cfg.snakeRows;
      if (off && !atGate(nc, nr)) continue;
      if (occupied(round, s.struck, s.body, s.grow, nc, nr) && snakePointAt(s, nc, nr) === -1)
        continue;
      const nk = key(nc, nr, nd.dc, nd.dr);
      if (prev.has(nk)) continue;
      prev.set(nk, { turn, from: cur });
      queue.push(nk);
      if (isGoal(nc, nr, nd.dc, nd.dr)) {
        goal = nk;
        break;
      }
    }
  }
  if (goal === null) return null;
  let cur = goal;
  let firstTurn: -1 | 0 | 1 = 0;
  for (;;) {
    const p = prev.get(cur);
    if (p === null || p === undefined) break;
    firstTurn = p.turn;
    cur = p.from;
  }
  return firstTurn;
}

/**
 * SNAKE: steer toward the nearest untaken point or the nearest heading a shot
 * would carry to a standing enemy from, fire whenever one is actually lined
 * up, and feed the mouth just ahead of walking onto a point.
 *
 * **Firing only when aimed, never on a held trigger.** `fireSnake` stamps
 * `shotBeat` on a miss exactly as it does on a hit, so a hand that fires
 * every idle tick keeps resetting its own rest on empty air and can starve
 * the one tick it is actually lined up — found by tracing a run that walked
 * straight into an enemy it was already facing.
 *
 * **The mouth is asked for on demand, not held.** Its window and its rest are
 * the same length (`snakeMawTicks`, `snakeMawRestTicks`), so a press sent
 * every tick reopens on a fixed clock of its own with one tick genuinely
 * closed each cycle — and a run that presses without cause can walk a step
 * onto that exact tick by coincidence, which is what the first version of
 * this hand did. Asking only when the next planned step is a point leaves the
 * whole window as slack in front of the step that needs it.
 */
export const snakeHand: Hand = (w) => {
  const s = snakeRound(w);
  if (s === null || s.phase !== "play") return [];
  const round = s.rounds[Math.min(s.round, s.rounds.length - 1)];
  if (!round) return [];
  const out: Press[] = [];
  const aimed = snakeShotStop(w, s);
  if (aimed && aimed.enemy !== -1 && !snakeResting(w, s)) {
    out.push({ player: 1, command: { kind: "snakeFire" } });
  }
  const turn = bfsFirstTurn(w, s, round);
  const head = s.body[0];
  if (head && turn !== null) {
    const nd = turnedDir(s.dirCol, s.dirRow, turn);
    if (snakePointAt(s, head.col + nd.dc, head.row + nd.dr) !== -1) {
      out.push({ player: 1, command: { kind: "snakeMaw" } });
      out.push({
        player: 1,
        command: {
          kind: "drag",
          target: "snakeJaws",
          on: false,
          fromMilli: 0,
          fromYMilli: w.cfg.snakeJawsMilli,
        },
      });
    }
  }
  if (turn !== null && turn !== 0) {
    out.push({ player: 2, command: { kind: "snakeTurn", dir: turn === 1 ? "right" : "left" } });
  }
  return out;
};
