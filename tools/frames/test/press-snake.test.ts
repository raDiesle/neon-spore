import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { parsePress } from "../press.js";

/**
 * SNAKE's steering, which `--press` refused until 23 September 2026: a body
 * that turned could only be posed turned with `--boss`, never driven, so a
 * sequence of one turning could not be taken. The turn is the navigator's and
 * relative; the spit and the mouth are the pilot's and say nothing, and the two hands on
 * the body — the jaws prised, the tail held up — are one seat's each.
 */

const SNAKE = WAVES.findIndex((w) => w.boss?.kind === "snake");

describe("--press, SNAKE's three and its two hands", () => {
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

  it("prises the jaws on a lift that travelled, from the pilot's seat only", () => {
    const [down, up] = parsePress("700:1:snakeJaws", SNAKE);
    expect(down).toMatchObject({
      tick: 700,
      command: { kind: "drag", target: "snakeJaws", on: true },
    });
    expect(up).toMatchObject({
      tick: 701,
      command: { kind: "drag", target: "snakeJaws", on: false },
    });
    const travel = Number(up?.command.fromYMilli ?? 0);
    expect(travel).toBeGreaterThanOrEqual(DEFAULT_CONFIG.snakeJawsMilli);
    expect(() => parsePress("700:2:snakeJaws", SNAKE)).toThrow(/player 1's/);
    expect(() => parsePress("700:1:snakeJaws=3", SNAKE)).toThrow(/no value/);
  });

  it("holds the tail up for the ticks asked, or leaves it up, from the navigator's seat", () => {
    const held = parsePress("700:2:snakeTail=30", SNAKE);
    expect(held.map((p) => [p.tick, p.command.on])).toEqual([
      [700, true],
      [730, false],
    ]);
    expect(parsePress("700:2:snakeTail=on", SNAKE)).toHaveLength(1);
    expect(() => parsePress("700:1:snakeTail=30", SNAKE)).toThrow(/player 2's/);
    expect(() => parsePress("700:2:snakeTail", SNAKE)).toThrow(/ticks the tail/);
  });
});
