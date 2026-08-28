import { beforeAll, describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG,
  type MazeState,
  type MazeTangle,
  mazeGoodMouth,
  mazeNode,
  mazePath,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawMaze } from "../src/maze-draw.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * THE MAZE's split lives entirely in what each screen draws: the pilot's
 * frame names the arms a node has, the navigator's names the wall, and
 * neither role may draw enough of the other's half to answer the round
 * alone. These cases hold that shut, the way `queen-split.test.ts` holds the
 * Bulb Queen's split shut — by counting what actually reaches the canvas
 * rather than trusting the source to keep meaning what it says.
 */

const CFG = DEFAULT_CONFIG;

beforeAll(installCanvasGlobals);

function layoutFor(role: ViewRole) {
  return computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, role);
}

const n = (arms: readonly (-1 | 0 | 1)[], shut: -1 | 0 | 1) => mazeNode(arms, shut);

/**
 * One small tangle — two rows is enough to prove the split without dragging
 * the full authored content into a unit test. `core` is derived from mouth
 * 0's own forced path rather than picked by hand, so the fixture is always
 * answerable and these cases never quietly test an unwinnable round.
 */
function tangle(): MazeTangle {
  const nodes = [
    [n([0, 1], 0), n([-1, 1], 1), n([-1, 1], -1), n([0, 1], 1), n([-1, 0], 0)],
    [n([0, 1], 1), n([-1, 1], 1), n([-1, 1], -1), n([-1, 1], -1), n([-1, 0], 0)],
  ];
  const draft: MazeTangle = { core: 0, nodes };
  return { ...draft, core: mazePath(draft, 0).at(-1) ?? 0 };
}

function bossState(overrides: Partial<MazeState> = {}): MazeState {
  const base: MazeState = {
    kind: "maze",
    rounds: [tangle()],
    round: 0,
    phase: "lead",
    phaseBeat: 0,
    mouth: -1,
    probeRow: 0,
    probeLane: -1,
    hullMilli: 100000,
    scars: [],
    verdict: 0,
    verdictCol: -1,
  };
  return { ...base, ...overrides };
}

/** Draws counted by shape: one line per `moveTo`, one dot per `arc`. Colours
 * are read straight off the two setters the draw actually writes through. */
function watch(role: ViewRole, m: MazeState, beat: number, beatPhase = 0) {
  const l = layoutFor(role);
  const { ctx } = stubCanvas();
  let lines = 0;
  let arcs = 0;
  const colours: string[] = [];
  const spy = new Proxy(ctx, {
    get(target, prop, receiver) {
      if (prop === "moveTo") {
        lines++;
        return Reflect.get(target, prop, receiver);
      }
      if (prop === "arc") {
        arcs++;
        return Reflect.get(target, prop, receiver);
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
  return { lines, arcs, colours };
}

describe("THE MAZE's split", () => {
  const m = bossState({ phase: "read", phaseBeat: 0 });

  it("draws something on all three roles — nobody gets an empty frame", () => {
    for (const role of ["p1", "p2", "test"] as const) {
      const { lines, arcs } = watch(role, m, 3);
      expect(lines + arcs).toBeGreaterThan(0);
    }
  });

  it("gives the pilot more lines than the navigator — arms outnumber a single wall tick", () => {
    // Every node offers exactly two arms and shuts exactly one direction, so
    // a pilot frame draws two ticks per node where a navigator frame draws
    // one gate — the asymmetry the round depends on has to show up as a
    // difference in what is actually stroked, not just in a comment.
    const pilot = watch("p1", m, 3);
    const navigator = watch("p2", m, 3);
    expect(pilot.lines).toBeGreaterThan(navigator.lines);
  });

  it("draws the test role with at least as much as either single seat", () => {
    // `test` holds both halves at once, same as `showsQueenShape`/`showsQueenHint`.
    const pilot = watch("p1", m, 3);
    const navigator = watch("p2", m, 3);
    const solo = watch("test", m, 3);
    expect(solo.lines).toBeGreaterThanOrEqual(pilot.lines);
    expect(solo.lines).toBeGreaterThanOrEqual(navigator.lines);
  });

  it("never paints red — the ammunition colour — on the pilot's own frame", () => {
    // Red is spent by this file as the navigator's wall glyph, never as an
    // arm. A pilot screen naming it would be a leak of the other seat's half.
    const pilot = watch("p1", m, 3);
    expect(pilot.colours).not.toContain("#FF3B6B");
  });

  it("draws no travelling shot before the pair has fired", () => {
    const lead = bossState({ phase: "lead", phaseBeat: 0 });
    const before = watch("p1", lead, 1);
    const read = bossState({ phase: "read", phaseBeat: 0 });
    const during = watch("p1", read, 3);
    // Both phases draw the lattice; neither should add a shot marker, so the
    // two frames spend the same number of arcs.
    expect(before.arcs).toBeGreaterThan(0);
    expect(during.arcs).toBe(before.arcs);
  });

  it("draws a shot marker once travel starts, on top of the lattice", () => {
    const idle = watch("p1", bossState({ phase: "read", phaseBeat: 0 }), 3);
    const travelling = watch(
      "p1",
      bossState({ phase: "travel", phaseBeat: 3, probeRow: 0, probeLane: 1 }),
      3,
    );
    expect(travelling.arcs).toBeGreaterThan(idle.arcs);
  });

  it("fades the verdict mark to nothing after its own beats are up", () => {
    const fresh = watch(
      "p1",
      bossState({ phase: "verdict", phaseBeat: 0, verdict: 1, probeRow: 2, probeLane: 1 }),
      0,
    );
    const stale = watch(
      "p1",
      bossState({ phase: "verdict", phaseBeat: 0, verdict: 1, probeRow: 2, probeLane: 1 }),
      50,
    );
    expect(fresh.arcs).toBeGreaterThan(stale.arcs);
  });

  it("never throws at the field widths the game actually ships", () => {
    for (const cols of [7, 9, 12]) {
      const cfg = { ...CFG, cols };
      const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, cfg, "p1");
      const { ctx } = stubCanvas();
      const spy = ctx as unknown as CanvasRenderingContext2D;
      expect(() => drawMaze(spy, l, cfg, m, "p1", 3, 0)).not.toThrow();
    }
    // And the fixture tangle is answerable — otherwise the cases above are
    // proving something about a round nobody could ever win.
    expect(mazeGoodMouth(m.rounds[0]!)).toBeGreaterThanOrEqual(0);
  });

  it("draws nothing at all once the round is past its last authored tangle", () => {
    const done = bossState({ round: 1 });
    const { lines, arcs } = watch("p1", done, 3);
    expect(lines + arcs).toBe(0);
  });
});
