import { describe, expect, it } from "bun:test";
import { parseFrameSpec } from "../flags.js";
import { DEFAULT_UNTIL_TICKS, parseUntil } from "../until-flags.js";

/**
 * **`--until-on N`: the rest after an event**, `--until-back`'s other half.
 *
 * The lost wave's own screen comes up about 150 ticks after `waveFailed` and
 * its whole arrival is 31 ticks long; photographing it meant four runs of
 * `--ticks` bisecting for the window. `--frames` and `--stride` already
 * counted forward from the event, so the workaround was a wide sweep and forty
 * pictures to throw away. The browser half — that the picture really is taken
 * N ticks on — is `opening.test.ts`'s.
 */

const waves = [{ name: "THE DRIFT" }, { name: "THE SHELL" }];

describe("--until-on", () => {
  it("rides on the event, as a number of ticks after it", () => {
    const { spec } = parseFrameSpec(
      ["<sha>", "--wave", "1", "--until", "waveFailed", "--until-on", "150"],
      waves,
    );
    expect(spec.until).toEqual({ event: "waveFailed", cap: DEFAULT_UNTIL_TICKS, on: 150 });
  });

  it("refuses to be written without an event to count on from", () => {
    expect(() => parseFrameSpec(["<sha>", "--wave", "1", "--until-on", "150"], waves)).toThrow(
      /--until-on 150 needs an event/,
    );
  });

  it("refuses a step on of nothing, or of a word", () => {
    for (const on of ["0", "-3", "later"]) {
      expect(() => parseUntil("waveFailed", DEFAULT_UNTIL_TICKS, { ticks: false, on })).toThrow(
        new RegExp(`--until-on ${on}: at least one tick`),
      );
    }
  });

  it("refuses a step on longer than the look it rides on", () => {
    expect(() => parseUntil("waveFailed", 100, { ticks: false, on: "150" })).toThrow(
      /Raise --until-ticks/,
    );
  });

  it("refuses to go both ways from one event", () => {
    expect(() =>
      parseUntil("waveFailed", DEFAULT_UNTIL_TICKS, { ticks: false, back: "20", on: "150" }),
    ).toThrow(/opposite directions/);
  });
});
