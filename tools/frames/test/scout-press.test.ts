import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { parsePress } from "../press.js";

/**
 * **THE SCOUT's three held controls, on the press line.**
 *
 * The failures this holds are the ones that made the round unphotographable in
 * the first place, and every one of them is *silent*: a thumb that goes down
 * and never comes up flies the ship out of the frame with nothing to say why;
 * a press on the wrong seat is dropped by a round that seat-checks nothing;
 * and a burn written as a tick count on a capture that stops before the lift
 * is a flame put out one tick before the picture.
 *
 * The commands themselves are not asserted against a literal of
 * `{ kind: "scoutTurn", on: true, dir: -1 }` — that is the second copy
 * `scout-press.ts` exists not to keep. What is asserted is the *shape*: which
 * control's own `down` and `up`, in that order, on the ticks the line named.
 */

const SCOUT = WAVES.findIndex((w) => w.boss?.kind === "scout");

describe("--press, THE SCOUT's held three", () => {
  it("sends the button's own down, then its own up, the named ticks apart", () => {
    const line = parsePress("246:1:scoutTurnLeft=7", SCOUT);
    expect(line.map((p) => p.tick)).toEqual([246, 253]);
    expect(line.every((p) => p.player === 1)).toBe(true);
    expect(line.map((p) => p.command.kind)).toEqual(["scoutTurn", "scoutTurn"]);
    expect(line.map((p) => p.command.on)).toEqual([true, false]);
    // The direction is the *button's*, both halves, and the other arrow is the
    // other way round: one `scoutTurn` between two controls.
    expect(line.map((p) => p.command.dir)).toEqual([-1, -1]);
    expect(parsePress("246:1:scoutTurnRight=7", SCOUT)[0]?.command.dir).toBe(1);
  });

  it("lifts the burn as well, which is what keeps the ship in the frame", () => {
    const line = parsePress("255:1:scoutBurn=20", SCOUT);
    expect(line.map((p) => p.tick)).toEqual([255, 275]);
    expect(line.map((p) => p.command)).toEqual([
      { kind: "scoutBurn", on: true },
      { kind: "scoutBurn", on: false },
    ]);
  });

  it("leaves the thumb down for on, and sends only the lift for off", () => {
    const on = parsePress("255:1:scoutBurn=on", SCOUT);
    expect(on).toHaveLength(1);
    expect(on[0]?.command).toEqual({ kind: "scoutBurn", on: true });
    const off = parsePress("300:1:scoutBurn=off", SCOUT);
    expect(off).toHaveLength(1);
    expect(off[0]?.command).toEqual({ kind: "scoutBurn", on: false });
  });

  it("refuses a hold with no ticks on it, and names the two words that mean one", () => {
    // A thumb down for nought ticks is a press the page would send twice on
    // the same tick, and the second would put it straight back up.
    expect(() => parsePress("255:1:scoutBurn", SCOUT)).toThrow(/ticks it stays down/);
    expect(() => parsePress("255:1:scoutBurn=0", SCOUT)).toThrow(/on and off/);
    expect(() => parsePress("255:1:scoutBurn=1.5", SCOUT)).toThrow(/ticks it stays down/);
  });

  it("keeps the flying on the pilot's seat and the mouth on the navigator's", () => {
    expect(() => parsePress("255:2:scoutBurn=20", SCOUT)).toThrow(/player 1/);
    expect(() => parsePress("246:2:scoutTurnLeft=7", SCOUT)).toThrow(/player 1/);
    expect(() => parsePress("992:1:scoutMaw", SCOUT)).toThrow(/player 2/);
  });

  it("takes her tap as a moment, with nothing to say about itself", () => {
    const line = parsePress("992:2:scoutMaw", SCOUT);
    expect(line).toEqual([{ tick: 992, player: 2, command: { kind: "scoutMaw" } }]);
    expect(() => parsePress("992:2:scoutMaw=20", SCOUT)).toThrow(/takes no value/);
  });

  it("sorts a whole flight onto one tick line, lifts and all", () => {
    const flight = parsePress(
      "246:1:scoutTurnLeft=7,255:1:scoutBurn=20,373:1:scoutTurnRight=7,382:1:scoutBurn=36",
      SCOUT,
    );
    expect(flight.map((p) => p.tick)).toEqual([246, 253, 255, 275, 373, 380, 382, 418]);
  });
});
