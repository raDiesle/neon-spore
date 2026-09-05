import { type MazePhase, mazeWrap } from "./maze.js";
import {
  MAZE_APPROACH_BEATS,
  MAZE_LEAD_BEATS,
  MAZE_TRAVEL_BEATS,
  MAZE_VERDICT_BEATS,
  mazeReadBeats,
} from "./maze-clock.js";
import { mazeRight, mazeSettle, mazeWrong } from "./maze-verdict.js";
import { type MazeWheel, mazeCopyWheel, mazeReachesCore } from "./maze-wheel.js";
import type { Color, Scar } from "./types.js";
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
 * **The string has two gestures and one detent** (`maze-controls.ts`). The
 * pilot drags the handle on it, or holds `valve` — THE GAUGE's own control, and
 * the keyboard's. Either way the wheel turns until a way in clicks onto a
 * column, where it stops itself, so the pair counts clicks rather than
 * describing an angle — the only thing that survives half a second to two of
 * voice delay (`docs/spec/latency.md`).
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

/**
 * Why an attempt was lost: a dead end, the wrong colour at the heart, or
 * nothing fired at all. All three cost the hull the same; what they are for is
 * the sentence the pair says before the next attempt, which is different in
 * each case.
 */
export type MazeVerdictReason = "mouth" | "color" | "silence";

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
  /**
   * A hand on the string's handle, and how far it has come from where it
   * grabbed, in thousandths of a tile (`Command` in `types.ts`). One number
   * rather than an origin and a distance: the wheel moves by the change in it
   * between two messages, so a click leaves the snapped angle standing as the
   * new zero with nothing to re-anchor. It is also what puts the handle under
   * the finger on **both** screens, which is how the navigator watches the
   * pilot pull.
   */
  dragging: boolean;
  dragFromMilli: number;
  /** The column a way in has clicked onto, -1 for none. */
  lockedCol: number;
  /** Which way in is the one clicked, -1 for none. */
  lockedWay: number;
  /** The way in the shot went down, -1 while nothing is travelling. */
  way: number;
  /**
   * The colour of the shot the drum took: 0 red, 1 cyan, -1 for none.
   *
   * The drum swallows the shot rather than letting an ordinary one go up an
   * empty column past it (`mazeHeard`), so what climbs the field and crawls
   * the corridors is the maze's own picture of that shot — and a picture in
   * the wrong colour would be a different shot arriving than the one player 2
   * loaded. Hashed for that reason: it is what the pair is watching.
   */
  shotColor: number;
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

/**
 * The colour the heart is running this round, and therefore the only colour a
 * shot that reaches it counts in.
 *
 * **It alternates, and that is the round's second half.** A slick's red, then
 * a bulb's cyan, then red again — the two colours the field already carries,
 * so player 2 is choosing between the two she has rather than learning a third.
 * The heart is drawn in it (`render/maze-heart.ts`), so neither player is
 * being asked to remember anything: the answer is in the middle of the drum,
 * beating, on both screens.
 *
 * A rule rather than a look, which is why it is here. The picture calls this;
 * a second copy of it in `render/` is how a heart comes to be drawn one colour
 * and to accept the other.
 */
export function mazeHeartColor(round: number): Color {
  return round % 2 === 0 ? "red" : "cyan";
}

/** That colour as `MazeState.shotColor` records one: 0 red, 1 cyan. */
export function mazeHeartShot(round: number): number {
  return mazeHeartColor(round) === "red" ? 0 : 1;
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
  m.dragging = false;
  m.dragFromMilli = 0;
  m.lockedCol = -1;
  m.lockedWay = -1;
  m.way = -1;
  m.shotColor = -1;
  m.step = 0;
  m.tried = [];
}

/** A fresh maze, at full hull, on the round it is authored to open with. */
export function installMaze(world: World, rounds: MazeWheel[]): MazeState {
  const copies = rounds.map(mazeCopyWheel);
  return {
    kind: "maze",
    rounds: copies,
    round: 0,
    phase: "lead",
    phaseBeat: world.beat,
    angleMilli: mazeWrap(copies[0]?.startMilli ?? 0),
    turn: 0,
    armed: true,
    dragging: false,
    dragFromMilli: 0,
    lockedCol: -1,
    lockedWay: -1,
    way: -1,
    shotColor: -1,
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
      if (since >= mazeReadBeats(wheel.entrances.length)) mazeWrong(world, m, "silence");
      return;
    }
    if (m.phase === "travel") {
      // The climb up the column. The shot is not in the drum yet and there is
      // nothing to report about where it stands inside one.
      if (since < MAZE_APPROACH_BEATS) return;
      const inside = since - MAZE_APPROACH_BEATS;
      const route = wheel.entrances[m.way]?.route ?? [];
      const step = Math.floor(inside / MAZE_TRAVEL_BEATS);
      if (step >= route.length) {
        // The end of the walk, and two ways to have got it wrong: a corridor
        // that went nowhere, or the wrong colour arriving at a heart that only
        // takes its own. Both cost the hull; only the right colour in the
        // middle takes a share of the boss.
        const home = mazeReachesCore(wheel.entrances[m.way]!);
        if (home && m.shotColor === mazeHeartShot(m.round)) mazeRight(world, m);
        else mazeWrong(world, m, home ? "color" : "mouth");
        continue;
      }
      if (inside % MAZE_TRAVEL_BEATS === 0) advance(world, m, wheel, step);
      return;
    }
    if (since < MAZE_VERDICT_BEATS) return;
    mazeSettle(world, m);
    return;
  }
}

/** The shot, one corridor further along. Where it stands is what both see. */
function advance(world: World, m: MazeState, wheel: MazeWheel, step: number): void {
  const route = wheel.entrances[m.way]?.route ?? [];
  const cell = route[step];
  if (cell === undefined) return;
  m.step = step;
  world.events.push({
    type: "mazeProbe",
    ring: cell.ring,
    angleMilli: cell.angleMilli,
    of: route.length,
  });
}
