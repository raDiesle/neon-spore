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
import { DIRS, type Dir, type Grid, gridOf, wouldHit } from "./boss-hands-snake-grid.js";
import type { Hand } from "./hand.js";

/**
 * **SNAKE's own hand** — the body has no bearing to steer by, THE MAZE's or
 * THE SCOUT's kind: a heading only turns a quarter at a time and every step
 * is forced forward, so reaching `gorge` and `shed` (`docs/queue.md`, this
 * item) wants a real path found through the two things the body must not
 * touch, rather than a hand that merely points and hopes. `snakeEnemyAt`,
 * `snakeRockAt`, `snakeOnBoard`, `snakeOccupies` and `fireSnake` are not on
 * `@neon-spore/sim`'s public surface (`boss-surface-snake.ts` names what is),
 * so the small grid rules are this package's own (`boss-hands-snake-grid.ts`), built only from what is
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

/** The heading after a queued turn, the way `snake-move.ts`'s own `turned` reads. */
function turnedDir(dc: number, dr: number, turn: -1 | 0 | 1): Dir {
  const next = DIRS[(dirIndex(dc, dr) + turn + 4) % 4];
  if (!next) throw new Error("a heading this package does not have");
  return next;
}

function dirIndex(dc: number, dr: number): number {
  return DIRS.findIndex((d) => d.dc === dc && d.dr === dr);
}

/**
 * The turn to send this tick, or `null` when nothing reachable is worth
 * reaching — the head's own state counts, so a hand already aimed or already
 * standing on a point returns straight-on rather than circling for one.
 *
 * A state is `(tile * 4 + heading)`, a number, and the queue is an array read
 * from a moving front: the search visits the same states in the same order it
 * did with string keys and `shift`, so it chooses the same turns.
 */
function bfsFirstTurn(w: World, s: SnakeState, round: SnakeRound): -1 | 0 | 1 | null {
  const head = s.body[0];
  if (!head) return null;
  const g = gridOf(w, s, round);
  const { cols, rows } = g;
  const reachTiles = w.cfg.snakeShotTiles;
  // A cleared arena has one goal left, the mouth in the floor (`snake-home.ts`).
  const home = snakeGoingHome(s);
  const gate = snakeGate(w.cfg);
  const isGoal = (col: number, row: number, d: Dir): boolean =>
    home
      ? col === gate.col && row === gate.row
      : (row >= 0 && row < rows && col >= 0 && col < cols && g.point[row * cols + col] === 1) ||
        wouldHit(g, reachTiles, col, row, d);
  const headDir = dirIndex(s.dirCol, s.dirRow);
  const headDirOf = DIRS[headDir];
  if (!headDirOf) return null;
  if (isGoal(head.col, head.row, headDirOf)) return 0;
  // Below the gate on its way home, the one step the grid does not hold is
  // back up onto the gate itself.
  if (head.row > rows) return turnOntoGate(g, head, headDir, home, gate);

  const states = cols * (rows + 1) * 4;
  const from = new Int32Array(states).fill(-2);
  const turnOf = new Int8Array(states);
  const start = (head.row * cols + head.col) * 4 + headDir;
  from[start] = -1;
  const queue = new Int32Array(states);
  let front = 0;
  let back = 0;
  queue[back++] = start;
  let goal = -1;
  while (front < back && goal === -1) {
    const cur = queue[front++] as number;
    const cell = cur >> 2;
    const col = cell % cols;
    const row = (cell - col) / cols;
    for (const turn of [0, -1, 1] as const) {
      const nd = DIRS[((cur & 3) + turn + 4) % 4] as Dir;
      const nc = col + nd.dc;
      const nr = row + nd.dr;
      const off = nc < 0 || nr < 0 || nc >= cols || nr >= rows;
      const atGate = home && nc === gate.col && nr === gate.row;
      if (off && !atGate) continue;
      const i = nr * cols + nc;
      if (g.blocked[i] && !g.point[i]) continue;
      const nk = i * 4 + (((cur & 3) + turn + 4) % 4);
      if (from[nk] !== -2) continue;
      from[nk] = cur;
      turnOf[nk] = turn;
      queue[back++] = nk;
      if (isGoal(nc, nr, nd)) {
        goal = nk;
        break;
      }
    }
  }
  if (goal === -1) return null;
  let cur = goal;
  let firstTurn: -1 | 0 | 1 = 0;
  while ((from[cur] as number) >= 0) {
    firstTurn = turnOf[cur] as -1 | 0 | 1;
    cur = from[cur] as number;
  }
  return firstTurn;
}

/** The first turn, in the search's own order, that steps onto an open gate. */
function turnOntoGate(
  g: Grid,
  head: SnakeTile,
  headDir: number,
  home: boolean,
  gate: SnakeTile,
): -1 | 0 | 1 | null {
  if (!home) return null;
  for (const turn of [0, -1, 1] as const) {
    const nd = DIRS[(headDir + turn + 4) % 4] as Dir;
    if (head.col + nd.dc !== gate.col || head.row + nd.dr !== gate.row) continue;
    const i = gate.row * g.cols + gate.col;
    if (g.blocked[i] && !g.point[i]) continue;
    return turn;
  }
  return null;
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
