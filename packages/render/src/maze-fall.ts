import { MAZE_TURN, MAZE_VERDICT_BEATS, type MazeState } from "@neon-spore/sim";

/**
 * THE MAZE coming apart, which is what a dead end looks like.
 *
 * **A shot that gets lost brings the drum down.** Exactly one gap in each rim
 * reaches the middle; a shot sent down any of the others crawls a region of
 * corridors that simply does not join it, and when it runs out of maze the
 * whole wheel breaks up over the ship and the same stage is built again from
 * the top (`sim/maze-verdict.ts`). The owner asked for that in as many words,
 * and the reason it is worth drawing loudly is that it is the round's only
 * real punishment: the hull it costs is one crater like any other, while this
 * is the pair watching a minute of turning fall to pieces.
 *
 * **Nothing is stored.** How far the break has got is `world.beat` and the
 * frame's phase measured against the beat the verdict landed on, so both
 * phones break the same drum at the same moment and `Effects.reset()` has
 * nothing of this to clear. Which way each ring goes is a fixed function of
 * its own index — not a stream, so there is no order for two devices to get
 * into different places in.
 */

/**
 * How far the drum has come apart, 0 whole and 1 gone. It is 0 for every
 * verdict but a dead end, including a shot the heart refused for its colour:
 * that one never touched the walls, so there is nothing for them to be shaken
 * by.
 */
export function mazeFall(m: MazeState, beat: number, beatPhase: number): number {
  if (m.phase !== "verdict" || m.verdict === 1 || m.lost !== "mouth") return 0;
  const age = beat - m.phaseBeat + beatPhase;
  return Math.max(0, Math.min(1, age / MAZE_VERDICT_BEATS));
}

/**
 * Where circle `k` has got to: how far out it has drifted as a share of the
 * rim, how far round it has turned, and how much of it is left to see.
 *
 * The outer rings go furthest and turn least, which is the way a thing that
 * was spinning comes apart — and the sag is squared so the whole drum reads as
 * letting go rather than as sliding down at a constant rate.
 */
export function mazeFallen(
  k: number,
  fall: number,
): { spread: number; spinMilli: number; sag: number; alpha: number } {
  const out = 0.06 + 0.035 * k;
  const way = k % 2 === 0 ? 1 : -1;
  return {
    spread: fall * out,
    spinMilli: way * fall * (MAZE_TURN / 40) * (1 + (7 - Math.min(7, k)) * 0.35),
    sag: fall * fall * 0.4,
    alpha: Math.max(0, 1 - fall * 1.15),
  };
}
