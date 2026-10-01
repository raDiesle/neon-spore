import { afterEach, beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { DEFAULT_CONFIG, hullRow, type RoundKind } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { RockImpactFx } from "../src/rock-impact.js";
import { ROUND_STRIKE_LOOK, type RoundStrikeFrame } from "../src/round-strike-look.js";
import { paintWindow } from "../src/round-strike-window.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The slot a round's timeout hit is painted through (`round-strike-look.ts`).
 * Empty, the hit must be the rock it always was, call for call; filled, the
 * rock must be gone and the hit's clock must still be the rock's. The game
 * fills it with the round's window (`round-strike-window.ts`, 1 October 2026).
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const BEAT = 60 / CFG.bpm;
const FROM = hullRow(CFG) - 3;
const skin = () => L.hullY;

beforeAll(installCanvasGlobals);
const SHIPPED = ROUND_STRIKE_LOOK.paint;
afterEach(() => {
  ROUND_STRIKE_LOOK.paint = SHIPPED;
});

/** The calls each of `frames` frames made, and how often the rock arrived. */
function run(round: RoundKind | undefined, frames: number): { calls: number[]; arrivals: number } {
  const fx = new RockImpactFx();
  const { ctx } = stubCanvas();
  let arrivals = 0;
  const hit = () => {
    arrivals += 1;
  };
  fx.spawn(400, L, 0, BEAT, "meteorFastest", 1, FROM, true, hit, true, 7, 0, round);
  const calls: number[] = [];
  for (let i = 1; i <= frames; i++) {
    fx.update(1 / 60, L);
    const before = ctx.calls;
    fx.draw(ctx as unknown as CanvasRenderingContext2D, L, i / 60, skin);
    calls.push(ctx.calls - before);
  }
  return { calls, arrivals };
}

describe("a round's timeout hit", () => {
  it("is the round's window in the game, not the rock", () => {
    expect(SHIPPED).toBe(paintWindow);
    const rock = run(undefined, 40);
    const round = run("pulse", 40);
    expect(round.arrivals).toBe(1);
    expect(round.calls).not.toEqual(rock.calls);
    expect(round.calls.some((n) => n > 0)).toBe(true);
  });

  it("is the rock it always was while the slot is empty", () => {
    ROUND_STRIKE_LOOK.paint = null;
    const rock = run(undefined, 40);
    const round = run("pulse", 40);
    expect(round.calls).toEqual(rock.calls);
    expect(round.arrivals).toBe(1);
    expect(rock.calls.some((n) => n > 0)).toBe(true);
  });

  it("draws the paint in the rock's place once the slot is filled", () => {
    const seen: RoundStrikeFrame[] = [];
    ROUND_STRIKE_LOOK.paint = (_ctx, f) => {
      seen.push({ ...f });
    };
    const { calls, arrivals } = run("pulse", 60);
    // Nothing of the rock: the paint drew nothing, and neither did anything else.
    expect(calls.every((n) => n === 0)).toBe(true);
    // The sparks and the crack still come, once, on the rock's clock.
    expect(arrivals).toBe(1);
    expect(seen.length).toBeGreaterThan(0);
    for (const f of seen) expect(f.round).toBe("pulse");
    // Down to the skin, then out, and then gone.
    expect(seen[0]?.reach).toBeLessThan(1);
    expect(seen.some((f) => f.reach === 1 && f.after > 0)).toBe(true);
    expect(seen.length).toBeLessThan(60);
    expect(seen.at(-1)?.to.y).toBe(L.hullY);
  });

  it("leaves a rock that names no round alone when the slot is filled", () => {
    let painted = 0;
    ROUND_STRIKE_LOOK.paint = () => {
      painted += 1;
    };
    const { calls } = run(undefined, 20);
    expect(painted).toBe(0);
    expect(calls.some((n) => n > 0)).toBe(true);
  });
});
