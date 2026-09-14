import { type MazePhase, mazeWrap } from "./maze.js";
import type { MazeVerdictReason } from "./maze-verdict.js";
import { type MazeWheel, mazeCopyWheel } from "./maze-wheel.js";
import type { Scar } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * What THE MAZE remembers between ticks, and the two ways it is set: fresh
 * for a wave and wiped for a phase. The round that moves it is
 * `maze-round.ts`; the controls that pull the string are `maze-controls.ts`;
 * every field here is in `maze-hash.ts`, which is what makes a field a field
 * rather than a note. Its own file because the state grows with every gesture
 * and verdict the round learns, a paragraph per field, and the round was at
 * the limit with it.
 */

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
  /**
   * Why the last attempt was lost, or `null` when the last one was not.
   *
   * State rather than an event because two things downstream have to know
   * after the fact: `mazeSettle` breaks the hull at the end of the verdict
   * for a silence and only for one, and the picture shakes the drum apart or
   * brings it down by the reason (`render/maze-fall.ts`). An event is gone by
   * the next tick, and both are asked on every tick of the verdict.
   */
  lost: MazeVerdictReason | null;
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
    lost: null,
  };
}
