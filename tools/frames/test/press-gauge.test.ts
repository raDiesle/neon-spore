import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { parsePress } from "../press.js";

/**
 * THE GAUGE's two commands, which `--press` refused until the claw needed a
 * frame turned off the middle to be looked at: the valve is one command with a
 * direction, held until a second press lets it go, and the call is a moment.
 */

const GAUGE = WAVES.findIndex((w) => w.boss?.kind === "gauge");

describe("--press, THE GAUGE's valve and call", () => {
  it("turns the valve either way and lets it go", () => {
    expect(parsePress("300:1:valve=right", GAUGE)[0]?.command).toEqual({
      kind: "valve",
      on: true,
      dir: 1,
    });
    expect(parsePress("300:1:valve=left", GAUGE)[0]?.command).toEqual({
      kind: "valve",
      on: true,
      dir: -1,
    });
    expect(parsePress("360:1:valve=off", GAUGE)[0]?.command).toMatchObject({
      kind: "valve",
      on: false,
    });
  });

  it("calls, and refuses a valve that names no way", () => {
    expect(parsePress("400:2:call", GAUGE)[0]?.command).toEqual({ kind: "call" });
    expect(() => parsePress("300:1:valve=up", GAUGE)).toThrow(/left or right/);
    expect(() => parsePress("300:1:valve", GAUGE)).toThrow(/takes a value/);
  });
});
