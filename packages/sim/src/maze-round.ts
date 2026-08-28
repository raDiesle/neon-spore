import { breachHull } from "./hull.js";
import {
  MAZE_MOUTHS,
  type MazePhase,
  type MazeTangle,
  mazeMouthAt,
  mazeMouthCol,
  mazeMouthLane,
  mazePath,
} from "./maze.js";
import type { Scar } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * The round the pair plays against THE MAZE, and what it costs them.
 *
 * `maze.ts` next door is the tangle as arithmetic and knows nothing about a
 * world; everything here is the fight — the four phases, the shot going down
 * the lattice, and the two ways a round can end.
 *
 * **Failure arrives through the door that already exists.** A shot into a
 * mouth that does not reach the core finds something that comes back out of
 * the same mouth: `breachHull`, in that mouth's column, which is the ordinary
 * crater-and-crack every missed rock already is. THE MIRROR answers a wrong
 * step the same way and for the same reason (`mirror-round.ts`) — a boss that
 * invented a second kind of damage would be teaching the pair a second
 * vocabulary for the one thing they already understand. It is also why this is
 * a boss and not a round the pair only waits out.
 *
 * **The column is the mouth, not wherever the cannon has wandered since.** The
 * pair chose that mouth out loud, together, and the thing that comes back
 * comes back out of it — a verdict under the cannon would punish a thumb.
 *
 * **A missed round is asked again, exactly as it was.** THE MIRROR's rule, and
 * the same argument: the pair failed to read the tangle, not to keep up with
 * it. Guessing is therefore possible and bounded — three mouths, and the two
 * wrong ones cost `damageMaze` each, which is most of a run for a pair who
 * would rather not talk.
 */

/** Why a round was lost: the wrong mouth, or no mouth at all. */
export type MazeVerdictReason = "mouth" | "silence";

/** Beats of quiet before a fresh tangle is up. Three beats, three numbers. */
export const MAZE_LEAD_BEATS = 3;

/**
 * How long the pair has to read the tangle: this much per row, plus a flat
 * allowance. Generous for the reason THE MIRROR's clock is — the fight is a
 * conversation over a channel carrying half a second to two
 * (`docs/spec/latency.md`), and a pair still saying "no, the *left* arm" has
 * not failed at anything the boss is testing.
 */
export const MAZE_READ_PER_ROW = 10;
export const MAZE_READ_SLACK = 14;

export function mazeReadBeats(rows: number): number {
  return rows * MAZE_READ_PER_ROW + MAZE_READ_SLACK;
}

/** Beats the shot spends on each node. Two, so it is a journey and not a jump. */
export const MAZE_TRAVEL_BEATS = 2;

/** Beats the verdict stands before the next round begins. */
export const MAZE_VERDICT_BEATS = 3;

/**
 * Everything THE MAZE remembers between beats. It carries a hull and scars for
 * the reason THE MIRROR does: a round answered breaks it exactly as a round
 * missed breaks the ship, out of the two fields `render/` already draws damage
 * from.
 */
export interface MazeState {
  kind: "maze";
  /** The authored tangles, one per round. */
  rounds: MazeTangle[];
  round: number;
  phase: MazePhase;
  /** The beat the current phase began on. */
  phaseBeat: number;
  /** The mouth the pair fired into, -1 while they have not. */
  mouth: number;
  /** Rows the shot has already travelled, 0 while nothing is travelling. */
  probeRow: number;
  /** The lane it stands on, -1 while nothing is travelling. */
  probeLane: number;
  /** Its hull, in thousandths, 0..100000. The ship's own field again. */
  hullMilli: number;
  scars: Scar[];
  /** The last verdict: 1 right, -1 wrong, 0 none yet. */
  verdict: -1 | 0 | 1;
  /** The column that verdict landed in — the mouth it came back out of. */
  verdictCol: number;
}

/** The tangle of the round being played, or nothing past the last one. */
export function mazeCurrent(m: MazeState): MazeTangle | null {
  return m.rounds[m.round] ?? null;
}

/** Move to a phase and start its clock. `lead` is where a round is wiped. */
export function enterMazePhase(m: MazeState, phase: MazePhase, beat: number): void {
  m.phase = phase;
  m.phaseBeat = beat;
  if (phase === "lead") {
    m.mouth = -1;
    m.probeRow = 0;
    m.probeLane = -1;
  }
}

/** A fresh maze, at full hull, on the round it is authored to open with. */
export function installMaze(world: World, rounds: MazeTangle[]): MazeState {
  return {
    kind: "maze",
    rounds: rounds.map((t) => ({
      core: t.core,
      nodes: t.nodes.map((r) => r.map((n) => ({ ...n }))),
    })),
    round: 0,
    phase: "lead",
    phaseBeat: world.beat,
    mouth: -1,
    probeRow: 0,
    probeLane: -1,
    hullMilli: 100 * MILLI,
    scars: [],
    verdict: 0,
    verdictCol: -1,
  };
}

/**
 * One beat of the boss. A phase that ends on this beat hands it straight to
 * the next one rather than to the next beat, so the beat a shot sets off on is
 * the beat it takes its first node — the same off-by-one `stepMirror` avoids,
 * and the same at-most-one-transition-per-hop loop that makes it safe.
 */
export function stepMaze(world: World, m: MazeState): void {
  const tangle = mazeCurrent(m);
  if (tangle === null) return;

  for (let hop = 0; hop < 4; hop++) {
    const since = world.beat - m.phaseBeat;

    if (m.phase === "lead") {
      if (since < MAZE_LEAD_BEATS) return;
      enterMazePhase(m, "read", world.beat);
      continue;
    }
    if (m.phase === "read") {
      // Silence is an answer too, and it is the wrong one.
      if (since >= mazeReadBeats(tangle.nodes.length)) wrong(world, m, "silence");
      return;
    }
    if (m.phase === "travel") {
      const path = mazePath(tangle, m.mouth);
      const step = Math.floor(since / MAZE_TRAVEL_BEATS);
      if (step >= path.length) {
        // The end of the strand: the core, or whatever else was down there.
        if (path.at(-1) === tangle.core) right(world, m);
        else wrong(world, m, "mouth");
        continue;
      }
      if (since % MAZE_TRAVEL_BEATS === 0) advance(world, m, path, step);
      return;
    }
    if (since < MAZE_VERDICT_BEATS) return;
    settle(world, m);
    return;
  }
}

/** The shot, one node further down. The lane it stands on is what both see. */
function advance(world: World, m: MazeState, path: number[], step: number): void {
  m.probeRow = step;
  m.probeLane = path[step] ?? -1;
  world.events.push({ type: "mazeProbe", row: step, lane: m.probeLane, of: path.length - 1 });
}

/**
 * The pair fired. Called from `applyCommand` for every shot, whether or not the
 * ship let one out — a shot swallowed by the cooldown was still a shot they
 * meant to take, and judging the ship's reaction instead of the players' intent
 * would end a round for a reason nobody at either screen can see. THE MIRROR
 * makes the same argument in `mirrorHeard`.
 *
 * A shot from a column between the mouths is not a wrong answer and not an
 * answer at all: there is nothing above the cannon for it to go into, and the
 * only pressure in this round is the clock.
 */
export function mazeHeard(world: World): void {
  const m = world.boss;
  if (m === null || m.kind !== "maze" || m.phase !== "read") return;
  const mouth = mazeMouthAt(world.cfg, world.cannonCol);
  if (mouth < 0 || mouth >= MAZE_MOUTHS) return;
  m.mouth = mouth;
  m.probeRow = 0;
  m.probeLane = mazeMouthLane(mouth);
  enterMazePhase(m, "travel", world.beat);
  world.events.push({ type: "mazeCommit", mouth, col: mazeMouthCol(world.cfg, mouth) });
}

/** The wrong mouth, or none. It comes back out of the mouth it went down. */
function wrong(world: World, m: MazeState, reason: MazeVerdictReason): void {
  const col = m.mouth < 0 ? world.cannonCol : mazeMouthCol(world.cfg, m.mouth);
  m.verdict = -1;
  m.verdictCol = col;
  enterMazePhase(m, "verdict", world.beat);
  breachHull(world, col, "meteorFastest", world.cfg.mazeRow, world.cfg.damageMaze);
  world.events.push({ type: "mazeVerdict", right: false, col, reason });
}

/**
 * The shot reached the core. It takes its share of the maze's hull — one share
 * per authored round, so the last round is the one that brings it down however
 * many rounds there are, exactly as THE MIRROR's arithmetic works.
 */
function right(world: World, m: MazeState): void {
  const col = mazeMouthCol(world.cfg, m.mouth);
  m.verdict = 1;
  m.verdictCol = col;
  enterMazePhase(m, "verdict", world.beat);

  const done = m.round + 1;
  const total = Math.max(1, m.rounds.length);
  m.hullMilli = Math.max(0, 100 * MILLI - Math.round((done * 100 * MILLI) / total));
  m.scars.push({ col, beat: world.beat, kind: "meteorFastest" });
  if (m.scars.length > world.cfg.maxScars) m.scars.shift();
  world.score += world.cfg.scoreMazeRound;
  world.events.push({ type: "mazeVerdict", right: true, col, reason: "mouth" });
}

/** The verdict is over. Answered moves on; missed asks the same tangle again. */
function settle(world: World, m: MazeState): void {
  if (m.verdict === 1) {
    if (m.hullMilli <= 0) {
      world.score += world.cfg.scoreMazeDown;
      world.boss = null;
      world.events.push({ type: "mazeDown", col: m.verdictCol });
      return;
    }
    m.round += 1;
  }
  enterMazePhase(m, "lead", world.beat);
}
