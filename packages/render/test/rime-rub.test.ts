import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol, type RimeStep, type SimEvent, type World } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { RimeFx } from "../src/rime-fx.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";
import { posed, stood } from "./rime-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE RIME's every rub seen and counted (the owner, 7 October 2026: *how
 * much rubs required again should be indicated by green circle around and
 * also visual should change on any rub*): the half being wiped wears a plain
 * green arc that fills as its frost comes off, on both screens, and every
 * `rimeShave` flashes that half white, gone before the next reversal.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const LEFT: RimeStep = { ask: "left", color: "either", beats: 4 };
const SHAVE: SimEvent = { type: "rimeShave", side: 0, rimeMilli: 600, col: midCol(CFG) };

function frame(role: ViewRole, frost: number, thrown?: SimEvent): string {
  const world: World = stood();
  posed(world, LEFT, (s) => {
    s.rimeMilli = [frost, 0];
  });
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 1,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      if (tick === 0 && thrown) w.events.push(thrown);
    },
  });
  return log.join("|");
}

const greens = (text: string) => text.split(PALETTE.good).length - 1;

describe("a wipe on THE RIME", () => {
  it.each(ROLES)("fills a green arc round the half as its frost comes off, on %s", (role) => {
    expect(greens(frame(role, 1000))).toBe(greens(frame(role, 0)));
    expect(greens(frame(role, 600))).toBeGreaterThan(greens(frame(role, 1000)));
  });

  it.each(ROLES)("flashes the half on every reversal, on %s", (role) => {
    expect(frame(role, 600, SHAVE)).not.toBe(frame(role, 600));
  });

  it("throws flakes, flashes the half it shaved, and forgets it on a reset", () => {
    const fx = new RimeFx();
    const thrown: number[] = [];
    fx.ingest([SHAVE], L, CFG, 0.5, (_x, _y, n) => thrown.push(n));
    expect(thrown).toEqual([6]);
    expect(fx.shaved(0)).toBe(1);
    expect(fx.shaved(1)).toBe(0);
    for (let i = 0; i < 15; i++) fx.update(1 / 60);
    expect(fx.shaved(0)).toBe(0);
    fx.ingest([SHAVE], L, CFG, 0.5, () => {});
    fx.reset();
    expect(fx.shaved(0)).toBe(0);
  });
});
