import { describe, expect, it } from "bun:test";
import type { Driver } from "../drive.js";
import { parseFrameSpec } from "../flags.js";
import { reachFirstFrame } from "../reach.js";
import { type Fired, firesUntil, missedNote, type UntilWant } from "../until.js";
import { DEFAULT_UNTIL_TICKS, parseUntil } from "../until-flags.js";

/**
 * **`--until event:key=value` picks which firing.** A boss fires one
 * `instarShow` a step, and the first is the only one a bare `--until` could
 * stop on: a shield window open for one tick under AUTO took eight runs
 * bisecting `--until-back` to photograph (27 September 2026). The fields are
 * the ones a miss already prints, so what a person reads is what they type.
 */

const waves = [{ name: "THE INSTAR" }];

/** A driver whose script fires `type` on each tick given, each with its own fields. */
function firing(type: string, at: { tick: number; detail: string }[]): Driver & { at: number } {
  const heard: Fired[] = [];
  const state = {
    at: 0,
    async advance(n: number, until?: UntilWant): Promise<number | null> {
      const end = state.at + n;
      for (const one of at) {
        if (one.tick <= state.at || one.tick > end) continue;
        heard.push({ tick: one.tick, type, detail: one.detail });
        if (until && firesUntil(until, type, one.detail)) {
          state.at = one.tick;
          return one.tick;
        }
      }
      state.at = end;
      return null;
    },
    async press(): Promise<void> {},
    async tick(): Promise<number> {
      return state.at;
    },
    heard: (): readonly Fired[] => heard,
    sent: () => [],
  };
  return state;
}

const shows = [
  { tick: 600, detail: "step=0 col=5" },
  { tick: 2328, detail: "step=4 col=5" },
];

describe("--until with fields", () => {
  it("reads the fields after a colon, and leaves a bare event without any", () => {
    const { spec } = parseFrameSpec(
      ["<sha>", "--wave", "1", "--until", "instarShow:step=4,col=5"],
      waves,
    );
    expect(spec.until).toEqual({
      event: "instarShow",
      where: ["step=4", "col=5"],
      cap: DEFAULT_UNTIL_TICKS,
    });
    expect(parseUntil("breach", 100, { ticks: false })).toEqual({ event: "breach", cap: 100 });
  });

  it("refuses a field that is not key=value", () => {
    for (const bad of ["instarShow:", "instarShow:step", "instarShow:step=4,=5"]) {
      expect(() => parseUntil(bad, 100, { ticks: false }), bad).toThrow(/key=value/);
    }
  });

  it("matches a firing only when it says every field", () => {
    const want = { event: "instarShow", where: ["step=4"] };
    expect(firesUntil(want, "instarShow", "step=4 col=5")).toBe(true);
    expect(firesUntil(want, "instarShow", "step=0 col=5")).toBe(false);
    expect(firesUntil(want, "instarLand", "step=4 col=5")).toBe(false);
    // Not a prefix: step=4 is not step=40.
    expect(firesUntil(want, "instarShow", "step=40 col=5")).toBe(false);
    expect(firesUntil({ event: "instarShow" }, "instarShow", undefined)).toBe(true);
  });

  it("stops on the second of two firings, not the first", async () => {
    const d = firing("instarShow", shows);
    const until = { event: "instarShow", where: ["step=4"], cap: 3000 };
    const at = await reachFirstFrame(d, 0, { advanceBy: 0, until });
    expect(at).toBe(2328);
    expect(d.at).toBe(2328);
  });

  it("names the fields it waited for when none of the firings said them", () => {
    const until = { event: "instarShow", where: ["step=9"], cap: 3000 };
    const log = shows.map((s) => ({ ...s, type: "instarShow" }));
    expect(missedNote(until, 1, log)).toMatch(/^--until instarShow:step=9: nothing of that kind/);
  });
});
