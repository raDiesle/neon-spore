import { breachHull } from "./hull.js";
import { type MazePhase, mazeWrap } from "./maze.js";
import { type MazeWheel, mazeReachesCore } from "./maze-wheel.js";
import type { Scar } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * The round the pair plays against THE MAZE, and what it costs them.
 *
 * `maze.ts` next door is the wheel as arithmetic and knows nothing about a
 * world; everything here is the fight — the four phases, the string, the shot
 * walking the corridor, and the two ways an attempt can end.
 *
 * **Nothing in this round travels.** The wheel turns in place and the cannon
 * slides on the hull as it always did, so `CLAUDE.md`'s field rule is not in
 * play and the next reader does not have to re-derive that.
 *
 * **The string is `valve`, THE GAUGE's own control** (`maze-controls.ts`). A
 * press sets the wheel turning and it turns until a way in clicks onto a
 * column, where it stops itself — so the pair counts clicks rather than
 * describing an angle, which is the only thing that survives half a second to
 * two of voice delay (`docs/spec/latency.md`).
 *
 * **Failure arrives through the door that already exists.** A shot down a way
 * in that dead-ends comes back out of the column it went up: `breachHull`, the
 * ordinary crater-and-crack every missed rock already is, which is how THE
 * MIRROR answers a wrong step. It is also what makes the *next* attempt worth
 * a sentence.
 *
 * **A dead end does not end the round.** The wheel stands, the failed route
 * stays drawn, and the pair goes again with one way in ruled out. Only the
 * middle finishes a wheel, and the next comes up harder.
 */

/** Why an attempt was lost: a dead end, or nothing fired at all. */
export type MazeVerdictReason = "mouth" | "silence";

/** Beats of quiet before a fresh wheel is up. */
export const MAZE_LEAD_BEATS = 3;

/**
 * How long the pair has for one attempt: this much per way in, plus a flat
 * allowance. Generous for the reason THE MIRROR's clock is — a pair still
 * saying "no, the *other* one" has not failed at what the boss is testing.
 */
export const MAZE_READ_PER_WAY = 10;
export const MAZE_READ_SLACK = 14;

export function mazeReadBeats(ways: number): number {
  return ways * MAZE_READ_PER_WAY + MAZE_READ_SLACK;
}

/** Beats the shot spends on each cell. One, so the walk reads at tempo. */
export const MAZE_TRAVEL_BEATS = 1;

/** Beats the verdict stands before the pair may go again. */
export const MAZE_VERDICT_BEATS = 3;

/**
 * Everything THE MAZE remembers between ticks. It carries a hull and scars for
 * the reason THE MIRROR does: a wheel finished breaks it exactly as an attempt
 * missed breaks the ship, out of two fields `render/` already draws from.
 */
export interface MazeState {
  kind: "maze";
  /** The authored wheels, one per round. */
  rounds: MazeWheel[];
  round: number;
  phase: MazePhase;
  /** The beat the current phase began on. */
  phaseBeat: number;
  /** Where the wheel stands, in thousandths of a degree. */
  angleMilli: number;
  /** Which way the string is pulling: -1, 0 or 1. Cleared by a click. */
  turn: -1 | 0 | 1;
  /** False from a click being broken until the rim is clear of every column,
   * so a fresh pull carries the mouth *on* rather than dropping straight back
   * into the detent it was just pulled out of. */
  armed: boolean;
  /** The column a way in has clicked onto, -1 for none. */
  lockedCol: number;
  /** Which way in is the one clicked, -1 for none. */
  lockedWay: number;
  /** The way in the shot went down, -1 while nothing is travelling. */
  way: number;
  /** How many cells it has walked, 0 while nothing is travelling. */
  step: number;
  /** Ways in already probed this wheel, in the order they were tried. */
  tried: number[];
  /** Its hull, in thousandths, 0..100000. The ship's own field again. */
  hullMilli: number;
  scars: Scar[];
  /** The last verdict: 1 right, -1 wrong, 0 none yet. */
  verdict: -1 | 0 | 1;
  /** The column that verdict landed in — the one the shot went up. */
  verdictCol: number;
}

/** The wheel of the round being played, or nothing past the last one. */
export function mazeCurrent(m: MazeState): MazeWheel | null {
  return m.rounds[m.round] ?? null;
}
/** Move to a phase and start its clock. `lead` is where a wheel is wiped. */
export function enterMazePhase(m: MazeState, phase: MazePhase, beat: number): void {
  m.phase = phase;
  m.phaseBeat = beat;
  if (phase !== "lead") return;
  m.angleMilli = mazeWrap(mazeCurrent(m)?.startMilli ?? 0);
  m.turn = 0;
  m.armed = true;
  m.lockedCol = -1;
  m.lockedWay = -1;
  m.way = -1;
  m.step = 0;
  m.tried = [];
}

/** A fresh maze, at full hull, on the round it is authored to open with. */
export function installMaze(world: World, rounds: MazeWheel[]): MazeState {
  const copies = rounds.map((w) => ({
    rings: w.rings,
    sectors: w.sectors,
    startMilli: w.startMilli,
    entrances: w.entrances.map((e) => ({
      sector: e.sector,
      route: e.route.map((c) => ({ ...c })),
    })),
  }));
  return {
    kind: "maze",
    rounds: copies,
    round: 0,
    phase: "lead",
    phaseBeat: world.beat,
    angleMilli: mazeWrap(copies[0]?.startMilli ?? 0),
    turn: 0,
    armed: true,
    lockedCol: -1,
    lockedWay: -1,
    way: -1,
    step: 0,
    tried: [],
    hullMilli: 100 * MILLI,
    scars: [],
    verdict: 0,
    verdictCol: -1,
  };
}

/** One beat of the boss. A phase that ends on this beat hands it straight to
 * the next rather than to the next beat, so the beat a shot sets off on is the
 * beat it takes its first cell — the same off-by-one `stepMirror` avoids, and
 * the same at-most-one-transition-per-hop loop that makes it safe. */
export function stepMaze(world: World, m: MazeState): void {
  const wheel = mazeCurrent(m);
  if (wheel === null) return;

  for (let hop = 0; hop < 4; hop++) {
    const since = world.beat - m.phaseBeat;

    if (m.phase === "lead") {
      if (since < MAZE_LEAD_BEATS) return;
      enterMazePhase(m, "read", world.beat);
      continue;
    }
    if (m.phase === "read") {
      // Silence is an answer too, and it is the wrong one.
      if (since >= mazeReadBeats(wheel.entrances.length)) wrong(world, m, "silence");
      return;
    }
    if (m.phase === "travel") {
      const route = wheel.entrances[m.way]?.route ?? [];
      const step = Math.floor(since / MAZE_TRAVEL_BEATS);
      if (step >= route.length) {
        // The end of the corridor: the middle, or whatever else was down there.
        if (mazeReachesCore(wheel.entrances[m.way]!)) right(world, m);
        else wrong(world, m, "mouth");
        continue;
      }
      // Cell 0 is the mouth, and the shot took it on the beat it was fired
      // (`mazeHeard`); this clock picks it up from the one after.
      if (step > 0 && since % MAZE_TRAVEL_BEATS === 0) advance(world, m, wheel, step);
      return;
    }
    if (since < MAZE_VERDICT_BEATS) return;
    settle(world, m);
    return;
  }
}

/** The shot, one cell further in. Where it stands is what both of them see. */
function advance(world: World, m: MazeState, wheel: MazeWheel, step: number): void {
  const route = wheel.entrances[m.way]?.route ?? [];
  const cell = route[step];
  if (cell === undefined) return;
  m.step = step;
  world.events.push({ type: "mazeProbe", row: cell.ring, lane: cell.sector, of: route.length });
}

/** A dead end, or nothing at all. It comes back out of the column it went up. */
function wrong(world: World, m: MazeState, reason: MazeVerdictReason): void {
  const col = m.lockedCol < 0 ? world.cannonCol : m.lockedCol;
  m.verdict = -1;
  m.verdictCol = col;
  enterMazePhase(m, "verdict", world.beat);
  breachHull(world, col, "meteorFastest", world.cfg.mazeRow, world.cfg.damageMaze);
  world.events.push({ type: "mazeVerdict", right: false, col, reason });
}

/** The shot reached the middle. It takes its share of the maze's hull — one
 * share per authored wheel, so the last wheel is the one that brings it down
 * however many there are, exactly as THE MIRROR's arithmetic works. */
function right(world: World, m: MazeState): void {
  const col = m.lockedCol;
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

/**
 * The verdict is over. The middle moves the fight to the next wheel; a dead
 * end goes back to the same one, which is standing exactly where it was left
 * with the route that failed still on it. That is the whole difference between
 * this boss and one the pair only waits out.
 */
function settle(world: World, m: MazeState): void {
  if (m.verdict !== 1) {
    m.way = -1;
    m.step = 0;
    m.phase = "read";
    m.phaseBeat = world.beat;
    return;
  }
  if (m.hullMilli <= 0) {
    world.score += world.cfg.scoreMazeDown;
    world.boss = null;
    world.events.push({ type: "mazeDown", col: m.verdictCol });
    return;
  }
  m.round += 1;
  enterMazePhase(m, "lead", world.beat);
}
