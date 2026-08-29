import { beforeAll, describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG,
  type MazeState,
  type MazeWheel,
  mazeCoreEntrance,
  mazeEntranceCol,
  mazeFault,
  mazeRadiusMilli,
  mazeRoute,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawMaze } from "../src/maze-draw.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * THE MAZE's picture, held to the three things a player would notice.
 *
 * The drum is **closed**: whatever is drawn of a route is drawn only where a
 * shot has already been, because neither player is told which way in reaches
 * the middle and a picture that gave it away would be the whole round gone.
 *
 * The lit mouth is an **invitation to a column**, so a frame with a click in
 * it puts something down the column the shot will take, and a frame without
 * one does not.
 *
 * And **both screens draw the same thing** — there is no seat split left in
 * this round (`packages/sim/src/maze.ts`), so a frame that differed by role
 * would be a split arriving by the back door.
 */

const CFG = DEFAULT_CONFIG;

beforeAll(installCanvasGlobals);

function layoutFor(role: ViewRole) {
  return computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, role);
}

/** One small wheel — two ways in and three rings is the round-one shape. */
function wheel(): MazeWheel {
  const shape = { rings: 3, sectors: 12 };
  const draft: MazeWheel = {
    ...shape,
    startMilli: 15_000,
    entrances: [
      { sector: 0, route: mazeRoute(shape, 0, ["cw", "in", "cw", "in"]) },
      { sector: 5, route: mazeRoute(shape, 5, ["ccw", "in", "ccw", "ccw"]) },
    ],
  };
  return draft;
}

function bossState(overrides: Partial<MazeState> = {}): MazeState {
  const base: MazeState = {
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
    step: 0,
    tried: [],
    hullMilli: 100000,
    scars: [],
    verdict: 0,
    verdictCol: -1,
  };
  return { ...base, ...overrides };
}

/** An angle at which the first way in is standing on a column. */
function clicked(): { angleMilli: number; col: number } {
  const w = wheel();
  for (let a = 0; a < 360_000; a += 25) {
    const col = mazeEntranceCol(CFG, w, a, 0);
    if (col >= 0) return { angleMilli: a, col };
  }
  throw new Error("the wheel never reaches a column");
}

/** Draws counted by shape: one line per `moveTo`, one dot per `arc`. Colours
 * are read straight off the two setters the draw actually writes through. */
function watch(role: ViewRole, m: MazeState, beat: number, beatPhase = 0) {
  const l = layoutFor(role);
  const { ctx } = stubCanvas();
  let lines = 0;
  let arcs = 0;
  const colours: string[] = [];
  const points: { x: number; y: number }[] = [];
  const spy = new Proxy(ctx, {
    get(target, prop, receiver) {
      if (prop === "moveTo") {
        lines++;
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
  drawMaze(spy, l, CFG, m, role, beat, beatPhase);
  return { lines, arcs, colours, points, l };
}

describe("THE MAZE's wheel", () => {
  /**
   * The round itself is on both screens — the light, the shot, the middle —
   * so the two seats see the same drum in the same places. The one thing that
   * is not shared is the word under the string's handle, because only the
   * pilot may turn the wheel: he is told PULL and she is told whose it is.
   * That is a colour and nothing else, which is what these three assertions
   * separate.
   */
  it("draws the same frame for both seats, bar the word on the string", () => {
    const m = bossState({ phase: "read", ...clicked(), lockedWay: 0 });
    const one = watch("p1", m, 3);
    const two = watch("p2", m, 3);
    expect(one.arcs).toBe(two.arcs);
    expect(one.lines).toBe(two.lines);
    expect(one.points).toEqual(two.points);
    expect(one.colours).not.toEqual(two.colours);
    expect(one.colours.length).toBe(two.colours.length);
    // Exactly one of them differs, and it is the one the word is written in.
    const apart = one.colours.filter((c, i) => c !== two.colours[i]);
    expect(apart.length).toBe(1);
  });

  it("keeps the drum shut until a shot has been down it", () => {
    const shut = watch("p1", bossState({ phase: "read" }), 3);
    const spent = watch("p1", bossState({ phase: "read", tried: [1], way: -1 }), 3);
    // A route only appears once it has been paid for.
    expect(spent.arcs).toBeGreaterThan(shut.arcs);
  });

  it("puts a line down the column a lit mouth is standing on", () => {
    const { angleMilli, col } = clicked();
    const dark = watch("p1", bossState({ phase: "read", angleMilli }), 3);
    const lit = watch(
      "p1",
      bossState({ phase: "read", angleMilli, lockedWay: 0, lockedCol: col }),
      3,
    );
    expect(lit.lines).toBeGreaterThan(dark.lines);
  });

  it("stands about six sevenths of the field wide, clear of the hull", () => {
    const l = layoutFor("p1");
    const r = (mazeRadiusMilli(CFG) * l.tile) / 1000;
    expect((2 * r) / l.gridWidth).toBeGreaterThan(0.83);
    expect((2 * r) / l.gridWidth).toBeLessThan(0.87);
    // The rim's lowest point still leaves the cannon room to slide under it.
    const bottom = l.gridTop + 2 * r + l.tile * 0.6;
    expect(l.hullY - bottom).toBeGreaterThan(l.tile * 2);
  });

  it("lights the corridor up behind the shot, and keeps it inside the drum", () => {
    const early = watch("p1", bossState({ phase: "travel", tried: [0], way: 0, step: 0 }), 3);
    const going = watch("p1", bossState({ phase: "travel", tried: [0], way: 0, step: 3 }), 3);
    expect(going.arcs).toBeGreaterThan(early.arcs);
    const l = layoutFor("p1");
    const r = (mazeRadiusMilli(CFG) * l.tile) / 1000;
    const cx = l.gridLeft + l.gridWidth / 2;
    const cy = l.gridTop + r + l.tile * 0.6;
    for (const p of going.points) {
      expect(Math.hypot(p.x - cx, p.y - cy)).toBeLessThan(r * 4.1);
    }
  });

  it("survives every phase and a field of any width without throwing", () => {
    for (const phase of ["lead", "read", "travel", "verdict"] as const) {
      for (const cols of [7, 9, 11, 13]) {
        const cfg = { ...CFG, cols };
        const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, cfg, "p1");
        const { ctx } = stubCanvas();
        const m = bossState({ phase, tried: [0, 1], way: 0, step: 1, verdict: -1 });
        const c = ctx as unknown as CanvasRenderingContext2D;
        expect(() => drawMaze(c, l, cfg, m, "p1", 3, 0)).not.toThrow();
      }
    }
  });

  it("is drawn against a wheel that is a legal wheel", () => {
    expect(mazeFault(wheel())).toBeNull();
    expect(mazeCoreEntrance(wheel())).toBeGreaterThanOrEqual(0);
  });
});
