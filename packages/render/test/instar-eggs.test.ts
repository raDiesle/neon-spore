import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, INSTAR_SCRIPT } from "@neon-spore/content";
import {
  createWorld,
  type InstarState,
  instarBoss,
  NO_BEARING,
  NOT_DONE,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { CLUTCH, NEST } from "../src/instar-eggs.js";
import { InstarFx } from "../src/instar-fx.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE INSTAR's two nests (`instar-eggs.ts`): the swiped one holds one egg
 * per swipe and each counted swipe drops one, which falls to the hull,
 * breaks, and is gone; the tapped one holds one per tap and each counted tap
 * bursts one where it lies — transients `Effects.reset()` clears like the
 * rest (`restart.test.ts`).
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const swiped = (m: { part: string; gesture: string }): boolean =>
  m.part === "eggs" && m.gesture === "swipeDown";
const EGGS_STEP = INSTAR_SCRIPT.findIndex((s) => s.marks.some(swiped));
const EGGS_MARK = INSTAR_SCRIPT[EGGS_STEP]?.marks.findIndex(swiped) ?? -1;
const answer = { type: "instarAnswer", mark: EGGS_MARK, part: "eggs", col: 7 } as const;

const tapped = (m: { part: string; gesture: string }): boolean =>
  m.part === "eggs" && m.gesture === "tap";

describe("THE INSTAR's nests", () => {
  it("holds one egg in the tapped nest for every tap its mark needs", () => {
    const needs = INSTAR_SCRIPT.flatMap((s) => s.marks)
      .filter(tapped)
      .map((m) => m.need);
    expect(needs.length).toBeGreaterThan(0);
    for (const need of needs) expect(need).toBe(NEST);
  });

  it("bursts a tapped egg where it lies rather than dropping it", () => {
    const world = hung();
    const s = acting(world);
    const tap = INSTAR_SCRIPT[EGGS_STEP]?.marks.findIndex(tapped) ?? -1;
    expect(tap).toBeGreaterThanOrEqual(0);
    const fx = new InstarFx();
    fx.place(L, s, { xMilli: 0, yMilli: 0 }, { x: 0, y: 0 }, 40);
    fx.ingest([{ type: "instarAnswer", mark: tap, part: "eggs", col: 3 }], L, () => {});
    expect(fx.eggs.count).toBe(1);
    // A burst is the splat alone, which is gone in well under the fall.
    for (let i = 0; i < 10; i++) fx.update(1 / 30);
    expect(fx.eggs.count).toBe(0);
  });

  it("holds one egg for every swipe its mark needs", () => {
    const needs = INSTAR_SCRIPT.flatMap((s) => s.marks)
      .filter(swiped)
      .map((m) => m.need);
    expect(needs.length).toBeGreaterThan(0);
    for (const need of needs) expect(need).toBe(CLUTCH);
  });

  it("drops an egg on a counted swipe and on nothing else, and lets it go", () => {
    const fx = new InstarFx();
    fx.ingest([{ type: "instarAnswer", mark: 0, part: "jaw", col: 3 }], L, () => {});
    expect(fx.eggs.count).toBe(0);
    fx.ingest([answer], L, () => {});
    expect(fx.eggs.count).toBe(1);
    for (let i = 0; i < 30; i++) fx.update(1 / 30);
    expect(fx.eggs.count).toBe(0);
    fx.ingest([answer], L, () => {});
    fx.clear();
    expect(fx.eggs.count).toBe(0);
  });

  it("draws the falling egg on the field", () => {
    const bile = (drop: boolean): number => {
      const world = hung();
      acting(world);
      const log: string[] = [];
      runFrames(world, "p2", 9, {
        every: 3,
        onCanvas: (c) => {
          c.log = log;
        },
        onTick: (tick, w) => {
          step(w, []);
          if (drop && tick === 0) w.events.push(answer);
        },
      });
      return log.join("|").split(PALETTE.bileRim).length;
    };
    expect(bile(true)).toBeGreaterThan(bile(false));
  });
});

function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("instar");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  return world;
}

/** The eggs step with its window open and nothing answered. */
function acting(world: World): InstarState {
  const s = instarBoss(world);
  if (s === null) throw new Error("the instar wave hung no body");
  s.cursor = EGGS_STEP;
  s.phase = "act";
  s.phaseBeat = world.beat;
  const n = s.steps[EGGS_STEP]?.marks.length ?? 0;
  s.progress = Array.from({ length: n }, () => 0);
  s.doneBeat = Array.from({ length: n }, () => NOT_DONE);
  s.ref = Array.from({ length: n }, () => NO_BEARING);
  s.thumbs = Array.from({ length: n }, () => 0);
  return s;
}
