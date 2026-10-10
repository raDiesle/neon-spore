import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { parsePress } from "../press.js";

/**
 * SNAKE's steering, which `--press` refused until 23 September 2026: a body
 * that turned could only be posed turned with `--boss`, never driven, so a
 * sequence of one turning could not be taken. The turn is the navigator's and
 * relative; the spit and the mouth are the pilot's and say nothing.
 */

const SNAKE = WAVES.findIndex((w) => w.boss?.kind === "snake");

describe("--press, SNAKE's three", () => {
  it("turns the body either way, on the navigator's seat", () => {
    expect(SNAKE).toBeGreaterThanOrEqual(0);
    expect(parsePress("300:2:snakeTurn=left", SNAKE)[0]?.command).toEqual({
      kind: "snakeTurn",
      dir: "left",
    });
    expect(parsePress("300:2:snakeTurn=right", SNAKE)[0]?.command).toEqual({
      kind: "snakeTurn",
      dir: "right",
    });
  });

  it("refuses a turn with no way, a way that is not a turn, and the wrong seat", () => {
    expect(() => parsePress("300:2:snakeTurn", SNAKE)).toThrow(/takes a value/);
    expect(() => parsePress("300:2:snakeTurn=up", SNAKE)).toThrow(/left or right/);
    expect(() => parsePress("300:1:snakeTurn=left", SNAKE)).toThrow(/player 2's/);
  });

  it("spits and opens the mouth from the pilot's seat", () => {
    expect(parsePress("300:1:snakeFire", SNAKE)[0]?.command).toEqual({ kind: "snakeFire" });
    expect(parsePress("300:1:snakeMaw", SNAKE)[0]?.command).toEqual({ kind: "snakeMaw" });
  });
});
