import type { SimConfig } from "./config.js";
import type { MazeState } from "./maze-round.js";

/**
 * THE MAZE's tangle, as arithmetic. No world, no events, no mutation — what
 * the pair plays against it is `maze-round.ts` next door, the same split
 * `shell.ts` and `shell-round.ts` make: the shape of the labyrinth is a
 * question about a lattice, a shot arriving at the wrong end of one is a
 * question about the hull, and a test can ask the first without a world.
 *
 * **Three mouths open above the ship and one of them goes somewhere.** Behind
 * them is a tangle: a lattice of nodes, one row under the next, and a strand
 * entering a node leaves it by exactly one way. Follow the strand from a mouth
 * and it arrives at the bottom on some lane; on one of those lanes is the
 * core, and a shot down that mouth takes a share of the boss. A shot down
 * either of the others arrives at something that comes back out of the same
 * mouth, and the hull pays.
 *
 * **The tangle is split across the two screens, and that is the whole boss.**
 * A labyrinth both players can see is a solo puzzle with an audience — one of
 * them traces it, says "left one", and the other presses. So the split is by
 * *layer*, the one of the three that cannot be separated: the **pilot** sees
 * which ways out a node has and nothing about which is fused; the
 * **navigator** sees which direction is walled and nothing about whether there
 * was an arm there to wall. The way out is the arm that is not walled, so
 * *every node on the path needs a sentence from each of them.* Neither half is
 * a rule the other could be told once — both are per-node facts, and a
 * read-out of either is a read-out of the whole lattice while the clock runs.
 * A split by region gives each half a self-contained stretch of path and one
 * relay ends the round; a split by end is `THE SPLICE` in `docs/spec/ideas.md`
 * in a different coat, and is not built here for that reason.
 *
 * **The tangle does not move while the pair is talking about it.** Firing
 * could have re-tangled it, and that is a better *system* — but a different
 * round: the voice channel carries half a second to two
 * (`docs/spec/latency.md`), and a lattice that changes between her sentence and
 * his thumb makes the sentence wrong on arrival. So a round is one fixed
 * question, and the rounds are **authored**, not generated
 * (`packages/content/src/maze-rounds.ts`) — nothing here draws from the rng,
 * exactly as THE MIRROR does not.
 */

/** Mouths above the hull. Three, because the owner's boss has three. */
export const MAZE_MOUTHS = 3;

/** Lanes across the tangle. Wider than the mouths, so the strands can cross. */
export const MAZE_LANES = 5;

/** The three ways out of a node, as a player would point at them. */
export type MazeDir = -1 | 0 | 1;
export const MAZE_DIRS: readonly MazeDir[] = [-1, 0, 1];

/** One direction as a bit. The masks below are sets of these and nothing else. */
export function mazeDirBit(dir: MazeDir): number {
  return 1 << (dir + 1);
}

/** The directions that stay inside the tangle from `lane`. */
export function mazeOnBoard(lane: number): number {
  let mask = 0;
  for (const dir of MAZE_DIRS) {
    if (lane + dir >= 0 && lane + dir < MAZE_LANES) mask |= mazeDirBit(dir);
  }
  return mask;
}

/** The directions in a mask, in the order a screen would draw them. */
export function mazeDirsOf(mask: number): MazeDir[] {
  return MAZE_DIRS.filter((dir) => (mask & mazeDirBit(dir)) !== 0);
}

/**
 * One node: a fork with two arms, one of which is fused. Two masks rather than
 * one direction, because the two masks *are* the two screens.
 */
export interface MazeNode {
  /** The ways out this node offers. The pilot's half. */
  branches: number;
  /** The directions walled off here. The navigator's half. */
  blocked: number;
}

/** One round's tangle: `nodes[row][lane]`, and the lane the core sits on. */
export interface MazeTangle {
  nodes: MazeNode[][];
  core: number;
}

/** A node written the way content authors one: two arms and the fused one. */
export function mazeNode(arms: readonly MazeDir[], shut: MazeDir): MazeNode {
  let branches = 0;
  for (const dir of arms) branches |= mazeDirBit(dir);
  return { branches, blocked: mazeDirBit(shut) };
}

/**
 * The one way out of a node. Call this rather than writing the intersection out
 * by hand: a second copy is how the strand a screen draws and the lane a shot
 * arrives on come to disagree, with neither picture showing it.
 */
export function mazeWayOut(node: MazeNode): MazeDir | null {
  const open = mazeDirsOf(node.branches & ~node.blocked);
  return open.length === 1 ? open[0]! : null;
}

/** The lane a mouth drops into. The mouths are spread across the tangle. */
export function mazeMouthLane(mouth: number): number {
  return mouth * 2;
}

/**
 * The column a mouth hangs over. Derived from the field's width rather than
 * authored, for the reason THE WARDEN has no column: three mouths placed by
 * hand would be three mouths one of which the cannon is further from, and the
 * round would be about reach instead of about reading.
 */
export function mazeMouthCol(cfg: SimConfig, mouth: number): number {
  return Math.round(((2 * mouth + 1) * (cfg.cols - 1)) / (2 * MAZE_MOUTHS));
}

/** Which mouth stands over this column, or -1 for a column between them. */
export function mazeMouthAt(cfg: SimConfig, col: number): number {
  for (let mouth = 0; mouth < MAZE_MOUTHS; mouth++) {
    if (mazeMouthCol(cfg, mouth) === col) return mouth;
  }
  return -1;
}

/**
 * The lanes the strand from `mouth` stands on, ending with the one it leaves
 * the tangle on — one entry longer than the tangle is deep.
 */
export function mazePath(tangle: MazeTangle, mouth: number): number[] {
  let lane = mazeMouthLane(mouth);
  const lanes = [lane];
  for (const row of tangle.nodes) {
    const dir = mazeWayOut(row[lane]!);
    if (dir === null) return lanes;
    lane += dir;
    lanes.push(lane);
  }
  return lanes;
}

/** The mouth that reaches the core, or -1 if the tangle is broken. */
export function mazeGoodMouth(tangle: MazeTangle): number {
  for (let mouth = 0; mouth < MAZE_MOUTHS; mouth++) {
    const path = mazePath(tangle, mouth);
    if (path.length === tangle.nodes.length + 1 && path.at(-1) === tangle.core) return mouth;
  }
  return -1;
}

/**
 * What one seat can see at a node, as a mask of directions the strand might
 * take. Seat 0 is both screens at once, which is nobody: it is the answer.
 */
export function mazeSeatMask(node: MazeNode, lane: number, seat: 0 | 1 | 2): number {
  if (seat === 1) return node.branches;
  if (seat === 2) return mazeOnBoard(lane) & ~node.blocked;
  return node.branches & ~node.blocked;
}

/** Every lane a seat could believe the strand from `mouth` comes out on. */
export function mazeReach(tangle: MazeTangle, mouth: number, seat: 0 | 1 | 2): number[] {
  let lanes = [mazeMouthLane(mouth)];
  for (const row of tangle.nodes) {
    const next = new Set<number>();
    for (const lane of lanes) {
      for (const dir of mazeDirsOf(mazeSeatMask(row[lane]!, lane, seat))) next.add(lane + dir);
    }
    lanes = [...next].sort((a, b) => a - b);
  }
  return lanes;
}

/**
 * The mouths a seat cannot rule out on its own. With `seat` 0 it has exactly one
 * entry, with 1 or 2 at least two, and that inequality *is* the round.
 */
export function mazeMouthsFor(tangle: MazeTangle, seat: 0 | 1 | 2): number[] {
  const mouths: number[] = [];
  for (let mouth = 0; mouth < MAZE_MOUTHS; mouth++) {
    if (mazeReach(tangle, mouth, seat).includes(tangle.core)) mouths.push(mouth);
  }
  return mouths;
}

/**
 * What is wrong with an authored tangle, or `null`. Content is data and gets no
 * type check for any of this: a node with two ways out is a round with no
 * answer, and a tangle either seat can solve alone is the failure the boss is.
 */
export function mazeFault(tangle: MazeTangle): string | null {
  if (tangle.nodes.length === 0) return "a tangle with no rows";
  for (const [row, lanes] of tangle.nodes.entries()) {
    if (lanes.length !== MAZE_LANES) return `row ${row} is not ${MAZE_LANES} lanes wide`;
    for (const [lane, node] of lanes.entries()) {
      if (mazeDirsOf(node.branches).length < 2) return `node ${row},${lane} is not a fork`;
      if ((node.branches & ~mazeOnBoard(lane)) !== 0)
        return `node ${row},${lane} leaves the tangle`;
      if (mazeWayOut(node) === null) return `node ${row},${lane} has no single way out`;
    }
  }
  if (tangle.core < 0 || tangle.core >= MAZE_LANES) return "the core is off the tangle";
  if (mazeGoodMouth(tangle) < 0) return "no mouth reaches the core";
  if (mazeMouthsFor(tangle, 1).length < 2) return "the pilot can solve it alone";
  if (mazeMouthsFor(tangle, 2).length < 2) return "the navigator can solve it alone";
  return null;
}

/**
 * Which part of a round the maze is in, in a fixed order so a fingerprint can
 * push one as a number. `lead` is the quiet before a fresh tangle, `read` is
 * the pair's turn to talk, `travel` is the shot going down the lattice where
 * both of them watch it, `verdict` is what it found.
 */
export const MAZE_PHASES = ["lead", "read", "travel", "verdict"] as const;
export type MazePhase = (typeof MAZE_PHASES)[number];

/**
 * Everything about THE MAZE that goes into `hashWorld`, in a fixed order.
 *
 * The mouth and the shot's place on the path are state: two devices that
 * disagree about either are watching different answers to the same question.
 * The tangle is in it although it is authored, because that is precisely the
 * assumption worth checking — a wave list that drifted by one entry would deal
 * the pair different labyrinths and nothing else would say a word about it.
 */
export function mazeHashParts(m: MazeState): number[] {
  const tangle = m.rounds[m.round];
  const parts = [
    m.round,
    MAZE_PHASES.indexOf(m.phase),
    m.phaseBeat,
    m.mouth,
    m.probeRow,
    m.probeLane,
    m.hullMilli,
    m.verdict,
    m.verdictCol,
    tangle === undefined ? -1 : tangle.core,
  ];
  for (const row of tangle?.nodes ?? []) {
    for (const node of row) parts.push(node.branches, node.blocked);
  }
  parts.push(m.scars.length);
  for (const scar of m.scars) parts.push(scar.col, scar.beat);
  return parts;
}
