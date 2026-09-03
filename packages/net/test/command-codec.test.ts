import { describe, expect, it } from "bun:test";
import type { Command } from "@neon-spore/sim";
import { decodeCommand, decodeCommands } from "../src/command-codec.js";

const ACCEPTED: Command[] = [
  { kind: "cannonCol", col: 3 },
  { kind: "shieldCol", col: 0 },
  { kind: "fire", color: "red" },
  { kind: "guard" },
  { kind: "intake" },
  { kind: "grip", id: 12 },
  { kind: "prime", on: true },
  { kind: "brief" },
  { kind: "brief", on: false },
  { kind: "valve", on: true, dir: 1 },
  { kind: "call" },
  { kind: "snakeTurn", dir: "left" },
  { kind: "snakeFire" },
  { kind: "snakeMaw" },
  { kind: "drag", target: "mazeString", on: true, fromMilli: 1500 },
  { kind: "drag", target: "lidString", on: true, fromMilli: -1500, id: 4 },
  { kind: "restart" },
];

describe("decodeCommand: one accepted example per variant", () => {
  for (const command of ACCEPTED) {
    it(command.kind, () => {
      expect(decodeCommand(command)).toEqual(command);
    });
  }
});

describe("decodeCommand: rejections", () => {
  it("refuses a colour that is not in the set", () => {
    expect(decodeCommand({ kind: "fire", color: "purple" })).toBeNull();
  });

  it("refuses a fractional column", () => {
    expect(decodeCommand({ kind: "cannonCol", col: 3.5 })).toBeNull();
  });

  it("refuses NaN", () => {
    expect(decodeCommand({ kind: "cannonCol", col: Number.NaN })).toBeNull();
  });

  it("refuses a negative id", () => {
    expect(decodeCommand({ kind: "grip", id: -1 })).toBeNull();
  });

  it("refuses a missing required field", () => {
    expect(decodeCommand({ kind: "fire" })).toBeNull();
    expect(decodeCommand({ kind: "valve", on: true })).toBeNull();
  });

  it("refuses a wrong-typed optional field", () => {
    expect(decodeCommand({ kind: "brief", on: "yes" })).toBeNull();
  });

  it("refuses a turn that is not one of the two", () => {
    expect(decodeCommand({ kind: "snakeTurn", dir: "widdershins" })).toBeNull();
    expect(decodeCommand({ kind: "snakeTurn" })).toBeNull();
  });

  it("refuses an unknown kind", () => {
    expect(decodeCommand({ kind: "teleport" })).toBeNull();
  });

  it("accepts an object carrying keys the variant does not declare", () => {
    expect(decodeCommand({ kind: "guard", extra: "from a newer peer" })).toEqual({
      kind: "guard",
    });
  });

  it("refuses a non-object", () => {
    expect(decodeCommand("guard")).toBeNull();
    expect(decodeCommand(null)).toBeNull();
    expect(decodeCommand(undefined)).toBeNull();
  });

  /**
   * A drag reports a **displacement** from where the finger grabbed, so half of
   * every pull is negative — and a codec that took only non-negative numbers
   * dropped exactly those frames, which is a rope that worked on the device it
   * was pulled on and never crossed the wire.
   */
  it("keeps a pull to the left, which is a negative displacement", () => {
    const left = { kind: "drag", target: "wardenTether", on: true, fromMilli: -2400 };
    expect(decodeCommand(left)).toEqual(left as Command);
  });

  it("refuses a pull wider than any screen", () => {
    expect(
      decodeCommand({ kind: "drag", target: "lidString", on: true, fromMilli: -1e12 }),
    ).toBeNull();
  });

  /** The id names *which* cord, for the one drag target that is a creature.
   * Absent is legal — the two fixtures need none — and a broken one is not. */
  it("refuses a drag whose id is not a whole non-negative number", () => {
    const bad = { kind: "drag", target: "lidString", on: true, fromMilli: 0, id: -1 };
    expect(decodeCommand(bad)).toBeNull();
    expect(decodeCommand({ ...bad, id: 1.5 })).toBeNull();
  });

  it("refuses infinities", () => {
    expect(
      decodeCommand({ kind: "drag", target: "mazeString", on: true, fromMilli: Infinity }),
    ).toBeNull();
  });
});

describe("decodeCommands", () => {
  it("refuses a non-array", () => {
    expect(decodeCommands({ kind: "guard" })).toBeNull();
    expect(decodeCommands(null)).toBeNull();
  });

  it("accepts an empty array", () => {
    expect(decodeCommands([])).toEqual([]);
  });

  it("drops the whole frame when one command among good ones is bad", () => {
    const commands = [{ kind: "guard" }, { kind: "fire", color: "purple" }, { kind: "call" }];
    expect(decodeCommands(commands)).toBeNull();
  });

  it("passes through a frame where every command is good", () => {
    const commands: Command[] = [{ kind: "guard" }, { kind: "call" }];
    expect(decodeCommands(commands)).toEqual(commands);
  });
});
