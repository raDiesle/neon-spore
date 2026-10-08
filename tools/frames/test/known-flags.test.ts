import { describe, expect, it } from "bun:test";
import { parseFrameSpec } from "../flags.js";
import { KNOWN_FLAGS, nearestFlag } from "../known-flags.js";
import { RECIPES } from "../recipes.js";

/**
 * **A flag the tool does not read is refused** (`known-flags.ts`): `--after 6`
 * and `--bogus-flag 3` used to take a picture as though they were not there.
 */

const waves = [{ name: "THE DRIFT" }];

describe("a flag bun run frames does not read", () => {
  it("is refused by name, not quietly dropped", () => {
    expect(() => parseFrameSpec(["<sha>", "--wave", "1", "--bogus-flag", "3"], waves)).toThrow(
      /--bogus-flag: not a flag/,
    );
  });

  it("names the nearest flag it does read when one is misspelt", () => {
    expect(() => parseFrameSpec(["<sha>", "--wave", "1", "--untl-on", "6"], waves)).toThrow(
      /did you mean --until-on\?/,
    );
    expect(nearestFlag("boss-jsn")).toBe("boss-json");
  });

  it("names none when nothing it reads is near, rather than a wrong one", () => {
    expect(nearestFlag("after")).toBeNull();
    expect(() => parseFrameSpec(["<sha>", "--wave", "1", "--after", "6"], waves)).toThrow(
      /--after: not a flag bun run frames reads\. Every flag/,
    );
  });

  it("knows every flag a recipe writes", () => {
    const written = RECIPES.flatMap((r) => r.argv.match(/--[a-z-]+/g) ?? []);
    expect(written.filter((f) => !KNOWN_FLAGS.includes(f.slice(2)))).toEqual([]);
  });
});
