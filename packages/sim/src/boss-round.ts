import { mazeOpenRound } from "./maze-verdict.js";
import { mirrorOpenRound } from "./mirror-round.js";
import { pinballOpenRound } from "./pinball-round.js";
import { snakeOpenRound } from "./snake-open.js";
import type { World } from "./world.js";

/**
 * **Stand the boss on a numbered round**, whichever boss is installed.
 *
 * Four of the six fights are played in rounds — THE MAZE's five sheets, THE
 * MIRROR's sequences, SNAKE's arenas, PINBALL's boards — and until this there
 * was no way to reach any of them but the first. `jumpToWave` puts a boss on
 * the field at its opening round and the only thing that moves it on is
 * *winning*, which nothing headless can do. So `bun run frames` could
 * photograph the first sheet of THE MAZE and no other, and the first sheet is
 * the one with a single way in: the rim with five gaps and the drum coming
 * apart on a shot lost in a dead end were held by a unit test and by nothing
 * an eye had seen.
 *
 * **It goes through each fight's own way in.** `mazeOpenRound` and its three
 * siblings are what that fight's own settle calls, so a round reached from
 * here is the same round the pair would have reached by winning — the wheel
 * stands at the new sheet's `startMilli` with its lock off, the board is
 * copied out afresh, the body starts over. Writing `round` and leaving the
 * rest is how the drum comes up at the last round's angle with the last
 * round's lock still on it.
 *
 * The two fights with no rounds — the queen, THE WARDEN, THE VANE, THE GAUGE
 * and THE FLEET — say so by returning false rather than by doing nothing, so a
 * caller that asked for a round it cannot have is told.
 */
export function setBossRound(world: World, round: number): boolean {
  const boss = world.boss;
  if (!boss) return false;
  switch (boss.kind) {
    case "maze":
      mazeOpenRound(world, boss, round);
      return true;
    case "mirror":
      mirrorOpenRound(world, boss, round);
      return true;
    case "snake":
      snakeOpenRound(world, boss, round);
      return true;
    case "pinball":
      pinballOpenRound(world, boss, round);
      return true;
    default:
      return false;
  }
}
