import { afterEach, describe, expect, it } from "bun:test";
import type { Page } from "playwright-core";
import { clockTo, freezeClocks } from "../draw-clock.js";
import { parseFrameSpec, parseTime } from "../flags.js";

/**
 * `--time` (`draw-clock.ts`): the paint after `clockTo(12.5)` reads 12500 ms
 * off `performance.now`, the paints after it carry on a sixtieth at a time, and
 * a build that kept its own clock says so instead of pretending.
 */

/** A page whose `evaluate` runs the function here, against the stub window. */
const stubPage = { evaluate: (fn: (arg: unknown) => unknown, arg: unknown) => fn(arg) };
const page = stubPage as unknown as Page;

const g = globalThis as unknown as { window?: unknown };
const realNow = performance.now.bind(performance);
afterEach(() => {
  delete g.window;
  performance.now = realNow;
});

/** A game handle whose paint writes down the clock it was drawn at. */
function stubGame(seen: number[], opening = true) {
  g.window = {
    neonSpore: {
      paint: () => {
        seen.push(performance.now());
      },
      ...(opening ? { advanceOpening: () => undefined } : {}),
    },
  };
  return g.window as { neonSpore: { paint: (dt?: number) => void } };
}

describe("clockTo", () => {
  it("puts the next paint at the time asked for, and the next after it one frame on", async () => {
    const seen: number[] = [];
    const w = stubGame(seen);
    expect(await freezeClocks(page)).toBe(true);
    w.neonSpore.paint();
    w.neonSpore.paint();
    expect(await clockTo(page, 12.5)).toBe(true);
    w.neonSpore.paint();
    w.neonSpore.paint();
    expect(seen[2]).toBeCloseTo(12500, 9);
    expect((seen[3] as number) - (seen[2] as number)).toBeCloseTo(1000 / 60, 9);
  });

  it("is refused on a build whose clock is still its own", async () => {
    stubGame([], false);
    expect(await freezeClocks(page)).toBe(false);
    expect(await clockTo(page, 3)).toBe(false);
  });
});

describe("--time", () => {
  it("is absent unless given, and takes seconds", () => {
    const waves = [{ name: "THE CAIRN" }];
    expect(parseFrameSpec(["<sha>", "--wave", "1"], waves).spec.time).toBeUndefined();
    expect(parseFrameSpec(["<sha>", "--wave", "1", "--time", "12.5"], waves).spec.time).toBe(12.5);
  });

  it("refuses a time that is not a number, or before the clock starts", () => {
    for (const bad of [undefined, "", "soon", "-1"]) expect(() => parseTime(bad)).toThrow(/--time/);
  });
});
