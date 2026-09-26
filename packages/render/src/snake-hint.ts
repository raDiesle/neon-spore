import {
  type SnakeState,
  type SnakeTile,
  snakeEnemyAt,
  snakePointAt,
  snakeRockAt,
} from "@neon-spore/sim";

/**
 * **Which item the field's hint stands on**, and whether it is eaten or shot.
 *
 * The owner, 25 September 2026: *have a hint if to eat or to shoot, if the
 * snake looks on it or if its the most near item next to snake head.* So the
 * hint is on one item and never on more:
 *
 * 1. **The one the head is looking at**: the first point or enemy straight
 *    ahead on the heading, before the wall or a meteor. That is the item the
 *    next press is about, so it comes first even when another is closer.
 * 2. **Otherwise the nearest one**, counted in steps (a column and a row each
 *    one), because a step is what the body spends to get there. On a tie the
 *    enemy wins, and then the lower index, so the hint does not flicker
 *    between two items the same distance away.
 *
 * Nothing while the body is going home: the arena is clear by then, and the
 * way home has its own mark (`snake-home.ts`).
 */

export interface SnakeHint extends SnakeTile {
  /** `true` on a point, which is eaten. `false` on an enemy, which is shot. */
  eat: boolean;
}

export function snakeHint(cols: number, rows: number, s: SnakeState): SnakeHint | null {
  const head = s.body[0];
  if (head === undefined) return null;
  return ahead(cols, rows, s, head) ?? nearest(s, head);
}

function ahead(cols: number, rows: number, s: SnakeState, head: SnakeTile): SnakeHint | null {
  if (s.dirCol === 0 && s.dirRow === 0) return null;
  let col = head.col + s.dirCol;
  let row = head.row + s.dirRow;
  while (col >= 0 && col < cols && row >= 0 && row < rows) {
    if (snakeRockAt(s, col, row)) return null;
    if (snakeEnemyAt(s, col, row) !== -1) return { col, row, eat: false };
    if (snakePointAt(s, col, row) !== -1) return { col, row, eat: true };
    col += s.dirCol;
    row += s.dirRow;
  }
  return null;
}

function nearest(s: SnakeState, head: SnakeTile): SnakeHint | null {
  const round = s.rounds[s.round];
  if (round === undefined) return null;
  let best: SnakeHint | null = null;
  let bestSteps = Number.POSITIVE_INFINITY;
  const consider = (at: SnakeTile, eat: boolean): void => {
    const steps = Math.abs(at.col - head.col) + Math.abs(at.row - head.row);
    if (steps < bestSteps) {
      best = { col: at.col, row: at.row, eat };
      bestSteps = steps;
    }
  };
  round.enemies.forEach((at, i) => {
    if (!s.struck.includes(i)) consider(at, false);
  });
  round.points.forEach((at, i) => {
    if (!s.taken.includes(i)) consider(at, true);
  });
  return best;
}
