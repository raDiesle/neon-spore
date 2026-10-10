import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { parsePress } from "../press.js";

/**
 * PINBALL's nudge, a press from either seat since 10 October 2026: ◀ and ▶
 * on both panels, so a bumped ball can be driven rather than posed.
 */

const PINBALL = WAVES.findIndex((w) => w.boss?.kind === "pinball");

describe("--press, PINBALL's nudge", () => {
  it("bumps either way, from either seat", () => {
    expect(PINBALL).toBeGreaterThanOrEqual(0);
    expect(parsePress("900:1:pinNudge=left", PINBALL)[0]?.command).toEqual({
      kind: "pinNudge",
      dir: -1,
    });
    expect(parsePress("900:2:pinNudge=right", PINBALL)[0]?.command).toEqual({
      kind: "pinNudge",
      dir: 1,
    });
  });

  it("refuses a nudge with no way, or a way that is not one", () => {
    expect(() => parsePress("900:2:pinNudge", PINBALL)).toThrow(/takes a value/);
    expect(() => parsePress("900:2:pinNudge=up", PINBALL)).toThrow(/left or right/);
  });
});
