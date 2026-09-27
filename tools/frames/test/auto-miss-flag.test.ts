import { describe, expect, it } from "bun:test";
import { parseFrameSpec } from "../flags.js";

/**
 * **`--auto-miss`: AUTO's hands off every other ask** (`auto.ts`), so
 * `--until breach` reaches a boss's timeout blow. That the hands really stay
 * off, and that the blow really comes, is `apps/game/test/auto-miss.test.ts`;
 * this is the flag.
 */

const waves = [{ name: "THE DRIFT" }, { name: "THE OCULUS" }];

describe("--auto-miss", () => {
  it("rides on --auto", () => {
    const argv = ["<sha>", "--wave", "2", "--auto", "both", "--auto-miss", "--until", "breach"];
    const { spec } = parseFrameSpec(argv, waves);
    expect(spec.auto).toBe("both");
    expect(spec.autoMiss).toBe(true);
  });

  it("is absent from every capture that does not write it", () => {
    const { spec } = parseFrameSpec(["<sha>", "--wave", "2", "--auto", "both"], waves);
    expect("autoMiss" in spec).toBe(false);
  });

  it("is refused without AUTO, where it would change nothing", () => {
    expect(() => parseFrameSpec(["<sha>", "--wave", "2", "--auto-miss"], waves)).toThrow(
      /needs --auto both\|p1\|p2/,
    );
  });
});
