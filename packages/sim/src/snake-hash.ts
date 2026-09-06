import { SNAKE_PHASES, type SnakeState } from "./snake.js";

/**
 * What SNAKE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `maze-hash.ts` and `claw-hash.ts` are ones:
 * `hash-boss.ts` grows by a whole boss at a time, this was the longest block
 * left in it, and every rule in here is about what two devices could come to
 * disagree about rather than about a snake. Moving it is also what makes the
 * file next door uniform — all four rounds delegate now, and a fifth has an
 * obvious place to go.
 */

/**
 * Everything about SNAKE that goes into `hashWorld`, in a fixed order.
 *
 * The body is where the fight is and everything after it is what the arena has
 * left in it. The authored rounds are in for THE MIRROR's reason: two phones on
 * two builds of `content` would be driving round different maps three rounds
 * in, and nothing else would say a word about it.
 */
export function snakeHashParts(b: SnakeState): number[] {
  const parts: number[] = [];
  const push = (n: number): void => {
    parts.push(n);
  };
  push(SNAKE_PHASES.indexOf(b.phase));
  push(b.phaseBeat);
  push(b.openBeat);
  push(b.passed ? 1 : 0);
  push(b.round);
  push(b.roundBeat);
  push(b.dirCol);
  push(b.dirRow);
  push(b.turn);
  push(b.stepTick);
  push(b.grow);
  push(b.mawTick);
  push(b.shotBeat);
  push(b.shotCol);
  push(b.shotRow);
  push(b.shotHit ? 1 : 0);
  push(b.repeats);
  push(b.repeatBeat);
  push(b.repeatTick);
  push(b.bumpCol);
  push(b.bumpRow);
  push(b.body.length);
  for (const tile of b.body) {
    push(tile.col);
    push(tile.row);
  }
  // The body as it stood on the tick of the last crash. Nothing but the
  // picture reads it, and it is in here anyway: rule 4 has no clause for a
  // field only the drawing wants, because a device that disagrees about one
  // is a device drawing a different round.
  push(b.ghostDirCol);
  push(b.ghostDirRow);
  push(b.ghost.length);
  for (const tile of b.ghost) {
    push(tile.col);
    push(tile.row);
  }
  // What has been spent, and then the map it was spent on. The lists of
  // indices are the fight itself — a device that thinks one more enemy is
  // down is a device drawing a different arena for the player who can see
  // it — and the placement is authored, so it is in for THE MIRROR's reason:
  // two phones on two builds of `content` would be driving round different
  // maps and nothing else here would say a word about it.
  push(b.struck.length);
  for (const at of b.struck) push(at);
  push(b.taken.length);
  for (const at of b.taken) push(at);
  push(b.rounds.length);
  for (const round of b.rounds) {
    push(round.beats);
    push(round.stepTicks);
    push(round.enemies.length);
    for (const tile of round.enemies) {
      push(tile.col);
      push(tile.row);
    }
    push(round.points.length);
    for (const tile of round.points) {
      push(tile.col);
      push(tile.row);
    }
    push(round.rocks.length);
    for (const tile of round.rocks) {
      push(tile.col);
      push(tile.row);
    }
  }
  return parts;
}
