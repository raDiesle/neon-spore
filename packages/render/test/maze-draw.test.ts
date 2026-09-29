import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { DEFAULT_CONFIG, mazeCoreEntrance, mazeFault, mazeRadiusMilli } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { drawMaze } from "../src/maze-draw.js";
import { PALETTE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { clicked, layoutFor, mazeState, watch, wheel } from "./maze-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

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

/** The pilot's colours with the arrow's one ink taken out: the entry whose
 * removal leaves his list as long as hers and no more than the word apart. */
function withoutArrow(mine: readonly string[], hers: readonly string[]): string[] {
  for (let i = 0; i < mine.length; i++) {
    if (mine[i] !== PALETTE.text) continue;
    const rest = [...mine.slice(0, i), ...mine.slice(i + 1)];
    if (rest.length === hers.length && rest.filter((c, k) => c !== hers[k]).length <= 1)
      return rest;
  }
  return [...mine];
}

describe("THE MAZE's wheel", () => {
  /**
   * The round itself is on both screens — the light, the shot, the middle —
   * so the two seats see the same drum in the same places. The one thing that
   * is not shared is the word under the string's handle, because only the
   * pilot may turn the wheel: he is told PULL and she is told whose it is,
   * and the knob asks it of him with the halo and of her with his ring and
   * the clock (`maze-marks.ts`). With the asking taken out, the word is a
   * colour and nothing else, which is what these assertions separate — and
   * the knob's arrow, his too (`pull-knob.ts`): two heads while the string
   * is at rest, three lines and one ink.
   */
  it("draws the same frame for both seats, bar the word on the string and the asking", () => {
    const m = mazeState({ phase: "read", ...clicked(), lockedWay: 0 });
    const one = watch("p1", m, 3);
    const two = watch("p2", m, 3);
    const askedOne = watch("p1", m, 3, 0, true);
    const askedTwo = watch("p2", m, 3, 0, true);
    expect(one.arcs - askedOne.arcs).toBe(two.arcs - askedTwo.arcs);
    const ARROW_LINES = 3;
    expect(one.lines - askedOne.lines).toBe(two.lines - askedTwo.lines + ARROW_LINES);
    // The asking is one run of draws in the middle of the frame; take it out.
    const without = <T>(all: readonly T[], run: readonly T[]): T[] => {
      const same = (p: T, q: T) => JSON.stringify(p) === JSON.stringify(q);
      const at = all.findIndex((_, i) => run.every((q, k) => same(all[i + k] as T, q)));
      expect(at).toBeGreaterThanOrEqual(0);
      return [...all.slice(0, at), ...all.slice(at + run.length)];
    };
    expect(without(one.points, askedOne.points)).toEqual(without(two.points, askedTwo.points));
    const hers = without(two.colours, askedTwo.colours);
    const mine = withoutArrow(without(one.colours, askedOne.colours), hers);
    expect(mine).not.toEqual(hers);
    expect(mine.length).toBe(hers.length);
    // Exactly one of them differs, and it is the one the word is written in.
    const apart = mine.filter((c, i) => c !== hers[i]);
    expect(apart.length).toBe(1);
  });

  it("draws the maze's own walls, and nothing plugging the way in", () => {
    const w = wheel();
    const shut = watch("p1", mazeState({ phase: "read" }), 3);
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
    const dark = watch("p1", mazeState({ phase: "read", angleMilli }), 3);
    const lit = watch(
      "p1",
      mazeState({ phase: "read", angleMilli, lockedWay: 0, lockedCol: col }),
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

  it("survives every phase and a field of any width without throwing", () => {
    for (const phase of ["lead", "read", "travel", "verdict"] as const) {
      for (const cols of [7, 9, 11, 13]) {
        const cfg = { ...CFG, cols };
        const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, cfg, "p1");
        const { ctx } = stubCanvas();
        const m = mazeState({ phase, tried: [0, 1], way: 0, step: 1, verdict: -1 });
        const c = ctx as unknown as CanvasRenderingContext2D;
        expect(() => drawMaze(c, l, cfg, m, "p1", 3, 0, 0)).not.toThrow();
      }
    }
  });

  it("is drawn against a wheel that is a legal wheel", () => {
    expect(mazeFault(wheel())).toBeNull();
    expect(mazeCoreEntrance(wheel())).toBeGreaterThanOrEqual(0);
  });
});
