import { beforeAll, describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG,
  type MazeState,
  type MazeWheel,
  mazeCoreEntrance,
  mazeEntranceCol,
  mazeFault,
  mazeRadiusMilli,
  mazeWheel,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawMaze } from "../src/maze-draw.js";
import { PALETTE } from "../src/palette.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * THE MAZE's picture, held to the three things a player would notice.
 *
 * The drum is a **maze**, and its walls are drawn: the circles broken where
 * the sheet breaks them and the radial walls between them. What is drawn only
 * where a shot has already been is the *trail*, which is what the pair reasons
 * from and the one thing that has been paid for.
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

/**
 * One small drum: three rings, each cut in half by a radial wall, two gaps in
 * the rim and two ways into the middle. Small enough to check by hand, and
 * walled enough that a picture which ignored the walls would show it.
 */
function wheel(): MazeWheel {
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
    shotColor: -1,
    step: 0,
    tried: [],
    hullMilli: 100000,
    scars: [],
    verdict: 0,
    verdictCol: -1,
    lost: null,
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
  drawMaze(spy, l, CFG, m, role, beat, beatPhase);
  return { lines, arcs, segments, colours, points, l };
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

  it("draws the maze's own walls, and nothing plugging the way in", () => {
    const w = wheel();
    const shut = watch("p1", bossState({ phase: "read" }), 3);
    // Every circle is broken into as many pieces as it has gaps, and every
    // radial wall is a line — so the picture is the sheet and not a target.
    const pieces = w.openings.reduce((n, o) => n + Math.max(1, o.length), 0);
    const bars = w.walls.reduce((n, list) => n + list.length, 0);
    expect(shut.arcs).toBeGreaterThanOrEqual(pieces);
    expect(shut.lines).toBeGreaterThanOrEqual(bars);
    // An unlit way in is the break in the line and two pips on its cut ends,
    // never a disc filling the hole: the owner read a circle there as
    // something blocking the entrance, which is exactly what it looked like.
    const ways = w.entrances.length;
    const noDoors = shut.arcs - ways * 2;
    expect(noDoors).toBeGreaterThanOrEqual(pieces);
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

  it("draws one shot, in the colour it was fired in, and keeps it in the drum", () => {
    const red = watch("p1", bossState({ phase: "travel", way: 0, step: 2, shotColor: 0 }), 3, 0.9);
    const cyan = watch("p1", bossState({ phase: "travel", way: 0, step: 2, shotColor: 1 }), 3, 0.9);
    // The shot is the shot player 2 loaded — the drum swallowed the bullet, so
    // a gold stand-in beside a red one is two shots for one trigger.
    expect(red.colours).toContain(PALETTE.red);
    expect(red.colours).not.toContain(PALETTE.cyan);
    expect(cyan.colours).toContain(PALETTE.cyan);
    // And nothing is drawn along the corridors it has already walked: a trail
    // is the route, and the route is the one thing the shot is there to find.
    expect(red.segments).toBe(watch("p1", bossState({ phase: "read" }), 3).segments);

    const l = layoutFor("p1");
    const r = (mazeRadiusMilli(CFG) * l.tile) / 1000;
    const cx = l.gridLeft + l.gridWidth / 2;
    const cy = l.gridTop + r + l.tile * 0.6;
    for (const p of red.points) {
      expect(Math.hypot(p.x - cx, p.y - cy)).toBeLessThan(r * 4.1);
    }
  });

  /**
   * The one verdict that is drawn loudly. A shot lost in a dead end brings the
   * whole drum down over the ship — the rings drift out, turn and fade — and a
   * shot the heart merely refused for its colour leaves the walls standing,
   * because it never touched them. Both cost the hull the same, so the picture
   * is the only place the difference is visible at all.
   */
  it("takes the drum apart when the shot was lost, and not when it was refused", () => {
    const { angleMilli, col } = clicked();
    const base = {
      phase: "verdict",
      phaseBeat: 0,
      angleMilli,
      lockedWay: 0,
      lockedCol: col,
      way: 0,
      step: 2,
      verdict: -1,
    } as const;
    const stood = watch("p1", bossState({ ...base, lost: "color" }), 2);
    const fell = watch("p1", bossState({ ...base, lost: "mouth" }), 2);

    // Every circle of a standing drum is struck about the drum's own centre;
    // a falling one has let go of it, so none of them are any more. Counting
    // the arcs still centred there is the cheapest way to say that without
    // knowing which ring went where.
    const l = layoutFor("p1");
    const r = (mazeRadiusMilli(CFG) * l.tile) / 1000;
    const cx = l.gridLeft + l.gridWidth / 2;
    const cy = l.gridTop + r + l.tile * 0.6;
    const onCentre = (points: { x: number; y: number }[]) =>
      points.filter((p) => Math.abs(p.x - cx) < 0.5 && Math.abs(p.y - cy) < 0.5).length;
    const pieces = wheel().openings.reduce((n, o) => n + Math.max(1, o.length), 0);
    expect(onCentre(stood.points) - onCentre(fell.points)).toBeGreaterThanOrEqual(pieces);

    // And there are no doors in a wall that is coming down.
    expect(stood.colours).toContain(PALETTE.good);
    expect(fell.colours).not.toContain(PALETTE.good);
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
