import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { SimEvent, World } from "@neon-spore/sim";
import { mixHex } from "../src/hex.js";
import { FOLD_GAPE, FOLD_SHUT, LampreyChomp } from "../src/lamprey-chomp.js";
import { LampreyFx } from "../src/lamprey-fx.js";
import { lampreyPose } from "../src/lamprey-pose.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";
import { count, posed, stood } from "./lamprey-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE LAMPREY eating (`lamprey-chomp.ts`, drawn by `lamprey-jaws.ts`): the
 * head turns side-on and its jaws open for what it hunts; a body eaten is
 * carried into the middle of the mouth, the jaws shut on it once, chew, and
 * the head turns back to the sucker — with the crumbs and the burst thrown as
 * they shut, not as it is caught.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const MOUTH = { x: 200, y: 400 };
const FRAME = 1 / 60;
/** The rock between the teeth, as `lamprey-fx.ts` colours it. */
const ROCK = mixHex(PALETTE.ember, PALETTE.rockDark, 0.6);

/** The folds a bite shows, a frame at a time, and the frames the jaws closed on. */
function bitten(chomp: LampreyChomp, seconds: number): { folds: number[]; shut: number[] } {
  const folds: number[] = [];
  const shut: number[] = [];
  for (let i = 0; i < seconds / FRAME; i++) {
    if (chomp.update(FRAME)) shut.push(i);
    folds.push(chomp.fold);
  }
  return { folds, shut };
}

describe("THE LAMPREY's bite", () => {
  it("opens its jaws, shuts them once on the morsel, and turns back to the sucker", () => {
    const chomp = new LampreyChomp();
    chomp.bite({ x: MOUTH.x, y: MOUTH.y - L.tile }, ROCK, MOUTH, L.tile);
    const { folds, shut } = bitten(chomp, 1.5);
    const gaped = folds.findIndex((f) => f >= FOLD_GAPE - 1e-9);
    const closed = folds.findIndex((f) => f >= FOLD_SHUT - 1e-9);
    expect(gaped).toBeGreaterThanOrEqual(0);
    expect(closed).toBeGreaterThan(gaped);
    expect(shut).toHaveLength(1);
    expect(folds.at(-1)).toBe(0);
    expect(chomp.morsel).toBeNull();
  });

  it("carries the morsel into the mouth before the jaws crush it", () => {
    const chomp = new LampreyChomp();
    chomp.bite({ x: MOUTH.x, y: MOUTH.y - L.tile }, ROCK, MOUTH, L.tile);
    let inBeforeCrush = 0;
    for (let i = 0; i < 30; i++) {
      chomp.update(FRAME);
      const m = chomp.morsel;
      if (m !== null && m.crush === 0) inBeforeCrush = m.in;
    }
    expect(inBeforeCrush).toBe(1);
    expect(chomp.morsel?.crush).toBe(1);
  });

  it("faces what it caught", () => {
    const chomp = new LampreyChomp();
    chomp.bite({ x: MOUTH.x, y: MOUTH.y - L.tile }, ROCK, MOUTH, L.tile);
    expect(chomp.face).toBeCloseTo(-Math.PI / 2);
  });

  it("opens toward what it hunts as that falls near, and closes again once it is gone", () => {
    const chomp = new LampreyChomp();
    chomp.aim(FOLD_GAPE, Math.PI);
    bitten(chomp, 1);
    expect(chomp.fold).toBe(FOLD_GAPE);
    expect(chomp.face).toBeCloseTo(Math.PI);
    chomp.aim(0, 0);
    bitten(chomp, 1);
    expect(chomp.fold).toBe(0);
  });

  it("throws its crumbs and its burst as the jaws shut, in the colour of what it ate", () => {
    const world = stood();
    const s = posed(world, "feeding");
    const fx = new LampreyFx();
    fx.note(lampreyPose(L, CFG, s, world.beat, 0));
    const eat: SimEvent = { type: "lampreyEat", food: "meteor", col: s.col, row: s.row - 1 };
    const thrown: string[] = [];
    const ingest = (events: SimEvent[]) =>
      fx.ingest(events, L, CFG, 0.5, (_x, _y, _n, hex) => thrown.push(hex));
    ingest([eat]);
    expect(thrown).toEqual([]);
    for (let i = 0; i < 30; i++) {
      fx.update(FRAME);
      ingest([]);
    }
    expect(thrown).toEqual([ROCK]);
    fx.clear();
    expect(fx.chomp.fold).toBe(0);
    expect(fx.chomp.morsel).toBeNull();
  });

  it("is drawn side-on with the morsel between its jaws a few frames after the eat", () => {
    const log: string[] = [];
    const world: World = stood();
    const s = posed(world, "feeding");
    const eat: SimEvent = { type: "lampreyEat", food: "meteor", col: s.col, row: s.row - 1 };
    runFrames(world, "test", 12, {
      every: 1,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        if (tick === 0) w.events.push(eat);
      },
    });
    expect(count(log.join("|"), ROCK)).toBeGreaterThan(0);
  });
});
