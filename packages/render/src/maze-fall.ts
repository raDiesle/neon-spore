import { MAZE_TURN, MAZE_VERDICT_BEATS, type MazeState } from "@neon-spore/sim";

/**
 * THE MAZE coming apart, which is what a failed attempt looks like — and, when
 * the clock is what failed, what lands on the ship.
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
 * **A clock that runs out brings it down onto the hull.** That failure used to
 * be answered by a meteor dropping on the ship from nowhere, and the owner
 * asked for the maze itself to be the thing that falls. So the pieces do not
 * drift off above the field: they let go, gather speed and come to rest on the
 * ship, and the hull is broken on the beat they get there rather than on the
 * beat the clock stopped (`sim/maze-verdict.ts`'s `mazeSettle`).
 *
 * **Nothing is stored.** How far the break has got is `world.beat` and the
 * frame's phase measured against the beat the verdict landed on, so both
 * phones break the same drum at the same moment and `Effects.reset()` has
 * nothing of this to clear. Which way each ring goes is a fixed function of
 * its own index — not a stream, so there is no order for two devices to get
 * into different places in.
 */

/** How a ring of the drum has moved while the drum is coming apart. */
export interface MazeFallen {
  /** Outward drift, as a share of the ring's own radius. */
  spread: number;
  /** How far it has turned on top of the drum's own angle. */
  spinMilli: number;
  /** How far it has sunk down the field, in drum radii. */
  sag: number;
  alpha: number;
}

/** The drum's state of collapse for one frame: how far it has come apart, how
 * far it has fallen towards the ship, and where the ship's skin is. */
export interface MazeBreakup {
  fall: number;
  crash: number;
  hullY: number;
}

/** A drum standing whole, which is every frame but a verdict's. */
export const MAZE_WHOLE: MazeBreakup = { fall: 0, crash: 0, hullY: 0 };

/**
 * How far the drum has come apart, 0 whole and 1 gone. It is 0 for a verdict
 * the walls had nothing to do with — a shot the heart refused for its colour
 * never touched them, so there is nothing for them to be shaken by.
 */
export function mazeFall(m: MazeState, beat: number, beatPhase: number): number {
  if (m.phase !== "verdict" || m.verdict === 1) return 0;
  if (m.lost !== "mouth" && m.lost !== "silence") return 0;
  const age = beat - m.phaseBeat + beatPhase;
  return Math.max(0, Math.min(1, age / MAZE_VERDICT_BEATS));
}

/**
 * How far the wreckage has fallen towards the ship, 0 let go and 1 landed.
 * Only the clock running out sends it down there; a dead end shakes the drum
 * apart where it hangs and the pieces drift off.
 */
export function mazeCrash(m: MazeState, beat: number, beatPhase: number): number {
  return m.lost === "silence" ? mazeFall(m, beat, beatPhase) : 0;
}

/**
 * Where circle `k` has got to: how far out it has drifted as a share of the
 * rim, how far round it has turned, and how much of it is left to see.
 *
 * The outer rings go furthest and turn least, which is the way a thing that
 * was spinning comes apart — and the sag is squared so the whole drum reads as
 * letting go rather than as sliding down at a constant rate.
 */
export function mazeFallen(k: number, fall: number): MazeFallen {
  const out = 0.06 + 0.035 * k;
  const way = k % 2 === 0 ? 1 : -1;
  return {
    spread: fall * out,
    spinMilli: way * fall * (MAZE_TURN / 40) * (1 + (7 - Math.min(7, k)) * 0.35),
    sag: fall * fall * 0.4,
    alpha: Math.max(0, 1 - fall * 1.15),
  };
}

/**
 * The same circle `k`, falling on the ship instead of drifting off it.
 *
 * `restSag` is how far this ring has to sink for its own lowest point to come
 * to rest on the hull's skin, in drum radii — worked out by the caller, which
 * is the one place that knows both the layout and the ring's radius.
 *
 * Three things separate this from the drift above, and each of them is the
 * difference between debris and a thing dissolving. It **gathers speed**, so
 * the drum lets go rather than descending at a rate. It **does not fade** —
 * something that lands has to be there when it lands. And the outer rings
 * **let go first**, so the drum arrives as a shower of pieces rather than as
 * one object sliding down the screen.
 */
export function mazeCrashed(k: number, crash: number, restSag: number): MazeFallen {
  const lead = Math.min(0.18, k * 0.03);
  const t = Math.max(0, Math.min(1, (crash - lead) / (1 - lead)));
  const way = k % 2 === 0 ? 1 : -1;
  return {
    spread: t * (0.04 + 0.03 * k),
    spinMilli: way * t * t * (MAZE_TURN / 14),
    // Weighted towards the end but nowhere near a free fall. A squared drop
    // put nine tenths of the journey in the last half beat, and what the pair
    // saw was a drum that sagged a little and then was not there — the fall
    // has to be *watched* all the way to the hull or it is not the thing that
    // replaced the meteor.
    sag: t ** 1.6 * restSag,
    alpha: 1,
  };
}
