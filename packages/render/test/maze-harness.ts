import {
  DEFAULT_CONFIG,
  type MazeState,
  type MazeWheel,
  mazeEntranceCol,
  mazeWheel,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawMaze } from "../src/maze-draw.js";
import { drawMazeAsked } from "../src/maze-marks.js";
import { stubCanvas } from "./canvas-stub.js";

/**
 * THE MAZE set rather than played to, for the render tests that pose it
 * (`maze-draw*.test.ts`, `maze-grip*.test.ts`, `maze-verdict.test.ts`): one
 * drum, the state round it, and the counting spy the wheel's pictures are
 * read through. Taken out of those files on 29 September 2026, when each kept
 * its own copy and three of them stood past the line ceiling.
 */

const CFG = DEFAULT_CONFIG;

export function layoutFor(role: ViewRole) {
  return computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, role);
}

/**
 * One small drum: three rings, each cut in half by a radial wall, two gaps in
 * the rim and two ways into the middle. Small enough to check by hand, and
 * walled enough that a picture which ignored the walls would show it.
 */
export function wheel(): MazeWheel {
  return mazeWheel(
    {
      rings: 3,
      coreMilli: 250,
      openMilli: 60,
      walls: [[], [0, 180_000], [0, 180_000], [0, 180_000]],
      openings: [
        [90_000, 270_000],
        [45_000, 225_000],
        [45_000, 225_000],
        [45_000, 225_000],
      ],
    },
    15_000,
  );
}

/** The round before the wheel is up: `lead` — or what `overrides` says. */
export function mazeState(overrides: Partial<MazeState> = {}): MazeState {
  return {
    kind: "maze",
    rounds: [wheel()],
    round: 0,
    phase: "lead",
    phaseBeat: 0,
    angleMilli: 15_000,
    turn: 0,
    dragging: false,
    dragFromMilli: 0,
    armed: true,
    lockedCol: -1,
    lockedWay: -1,
    way: -1,
    shotColor: -1,
    step: 0,
    tried: [],
    hullMilli: 100_000,
    scars: [],
    verdict: 0,
    verdictCol: -1,
    lost: null,
    gripSeats: 0,
    gripFromMilli: [0, 0, 0, 0],
    gripXMilli: 0,
    gripYMilli: 0,
    gripShookMilli: [0, 0],
    ...overrides,
  };
}

/** The right shot held in the heart: `grip`, no thumb on it yet. */
export const gripState = (overrides: Partial<MazeState> = {}) =>
  mazeState({ phase: "grip", phaseBeat: 4, way: 0, shotColor: 0, ...overrides });

/** An angle at which the first way in is standing on a column. */
export function clicked(): { angleMilli: number; col: number } {
  const w = wheel();
  for (let a = 0; a < 360_000; a += 25) {
    const col = mazeEntranceCol(CFG, w, a, 0);
    if (col >= 0) return { angleMilli: a, col };
  }
  throw new Error("the wheel never reaches a column");
}

/** Draws counted by shape: one line per `moveTo`, one dot per `arc`. Colours
 * are read straight off the two setters the draw actually writes through. */
export function watch(
  role: ViewRole,
  m: MazeState,
  beat: number,
  beatPhase = 0,
  askedOnly = false,
) {
  const l = layoutFor(role);
  const { ctx } = stubCanvas();
  let lines = 0;
  let arcs = 0;
  let segments = 0;
  const colours: string[] = [];
  const points: { x: number; y: number }[] = [];
  const spy = new Proxy(ctx, {
    get(target, prop, receiver) {
      if (prop === "moveTo") {
        lines++;
        return Reflect.get(target, prop, receiver);
      }
      if (prop === "lineTo") {
        segments++;
        return Reflect.get(target, prop, receiver);
      }
      if (prop === "arc") {
        arcs++;
        return (x: number, y: number, ...rest: number[]) => {
          points.push({ x, y });
          return (target.arc as (...a: number[]) => void)(x, y, ...rest);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value) {
      if ((prop === "fillStyle" || prop === "strokeStyle") && typeof value === "string") {
        colours.push(value);
      }
      return Reflect.set(target, prop, value);
    },
  }) as unknown as CanvasRenderingContext2D;
  if (askedOnly) drawMazeAsked(spy, l, CFG, m, 0);
  else drawMaze(spy, l, CFG, m, role, beat, beatPhase, 0);
  return { lines, arcs, segments, colours, points, l };
}
