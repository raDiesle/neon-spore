import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type GrindstoneStep, midCol, type SimEvent, type World } from "@neon-spore/sim";
import { GrindstoneFx } from "../src/grindstone-fx.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";
import { posed, stood } from "./grindstone-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GRINDSTONE's every rub seen and counted (the owner, 7 October 2026:
 * *how much rubs required again should be indicated by green circle around
 * and also visual should change on any rub*): the flat being ground wears a
 * plain green arc that fills as its grit comes off, on both screens, and
 * every `grindstoneShave` flashes that face white, gone before the next
 * reversal.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const LEFT: GrindstoneStep = { ask: "left", color: "either", beats: 6 };
const SHAVE: SimEvent = { type: "grindstoneShave", side: 0, gritMilli: 600, col: midCol(CFG) };

function frame(role: ViewRole, grit: number, thrown?: SimEvent): string {
  const world: World = stood();
  posed(world, LEFT, (s) => {
    s.gritMilli = [grit, 1000];
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

describe("a pass on THE GRINDSTONE", () => {
  it.each(ROLES)("fills a green arc round the flat as its grit comes off, on %s", (role) => {
    expect(greens(frame(role, 600))).toBeGreaterThan(greens(frame(role, 1000)));
  });

  it.each(ROLES)("flashes the face on every reversal, on %s", (role) => {
    expect(frame(role, 600, SHAVE)).not.toBe(frame(role, 600));
  });

  it("throws grit, flashes the face it shaved, and forgets it on a clear", () => {
    const fx = new GrindstoneFx();
    const thrown: number[] = [];
    fx.ingest([SHAVE], L, CFG, 0.5, (_x, _y, n) => thrown.push(n));
    expect(thrown).toEqual([6]);
    expect(fx.shaved(0)).toBe(1);
    expect(fx.shaved(1)).toBe(0);
    for (let i = 0; i < 15; i++) fx.update(1 / 60);
    expect(fx.shaved(0)).toBe(0);
    fx.ingest([SHAVE], L, CFG, 0.5, () => {});
    fx.clear();
    expect(fx.shaved(0)).toBe(0);
  });
});
