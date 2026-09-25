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
import { CLUTCH } from "../src/instar-eggs.js";
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
 * The eggs a swipe takes off THE INSTAR's clutch (`instar-eggs.ts`): the
 * clutch holds one per swipe, each counted swipe drops one, and the dropped
 * egg falls to the hull, breaks, and is gone — a transient `Effects.reset()`
 * clears like the rest (`restart.test.ts`).
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const swiped = (m: { part: string; gesture: string }): boolean =>
  m.part === "eggs" && m.gesture === "swipeDown";
const EGGS_STEP = INSTAR_SCRIPT.findIndex((s) => s.marks.some(swiped));
const EGGS_MARK = INSTAR_SCRIPT[EGGS_STEP]?.marks.findIndex(swiped) ?? -1;
const answer = { type: "instarAnswer", mark: EGGS_MARK, part: "eggs", col: 7 } as const;

describe("THE INSTAR's clutch", () => {
  it("holds one egg for every swipe its mark needs", () => {
    const needs = INSTAR_SCRIPT.flatMap((s) => s.marks)
      .filter(swiped)
      .map((m) => m.need);
    expect(needs.length).toBeGreaterThan(0);
    for (const need of needs) expect(need).toBe(CLUTCH);
  });

  it("drops an egg on a counted swipe and on nothing else, and lets it go", () => {
    const fx = new InstarFx();
    fx.ingest([{ type: "instarAnswer", mark: 0, part: "hand", col: 3 }], L, () => {});
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
