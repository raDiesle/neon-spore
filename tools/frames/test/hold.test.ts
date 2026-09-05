import { describe, expect, it } from "bun:test";
import { parseHold, parsePress } from "../hold.js";

/**
 * `--hold` is the only flag on this tool that builds a `Command` rather than a
 * number, and a wrong one is a picture of a control nobody pressed — the sim
 * drops a command it does not recognise and the frame comes back released,
 * which is exactly what the flag exists to stop. So every shape it accepts and
 * every shape it refuses is written down here.
 */
describe("parseHold", () => {
  it("a thumb on the lance is a held prime, from the pilot", () => {
    expect(parseHold("prime")).toEqual([{ player: 1, command: { kind: "prime", on: true } }]);
  });

  it("a handle is the grab and then the pull, in thousandths of a tile", () => {
    expect(parseHold("wardenTether=900")).toEqual([
      { player: 1, command: { kind: "drag", target: "wardenTether", on: true, fromMilli: 0 } },
      { player: 1, command: { kind: "drag", target: "wardenTether", on: true, fromMilli: 900 } },
    ]);
  });

  it("a rope carried down says so with y, and the grab is at zero on both axes", () => {
    expect(parseHold("wardenTether=0,y=7000")).toEqual([
      {
        player: 1,
        command: { kind: "drag", target: "wardenTether", on: true, fromMilli: 0, fromYMilli: 0 },
      },
      {
        player: 1,
        command: {
          kind: "drag",
          target: "wardenTether",
          on: true,
          fromMilli: 0,
          fromYMilli: 7000,
        },
      },
    ]);
  });

  it("no distance is one whole tile — a hand that has plainly pulled", () => {
    expect(parseHold("mazeString")).toEqual([
      { player: 1, command: { kind: "drag", target: "mazeString", on: true, fromMilli: 0 } },
      { player: 1, command: { kind: "drag", target: "mazeString", on: true, fromMilli: 1000 } },
    ]);
  });

  it("a cord says which body it hangs off, on the grab as well as the pull", () => {
    expect(parseHold("lidString=800,id=3")).toEqual([
      {
        player: 1,
        command: { kind: "drag", target: "lidString", on: true, fromMilli: 0, id: 3 },
      },
      {
        player: 1,
        command: { kind: "drag", target: "lidString", on: true, fromMilli: 800, id: 3 },
      },
    ]);
  });

  it("a cord without an id is refused rather than guessed at", () => {
    expect(() => parseHold("lidString=800")).toThrow(/id=N/);
  });

  it("an id on a handle there is only one of is a mistake, not a no-op", () => {
    expect(() => parseHold("wardenTether=900,id=3")).toThrow(/only lidString/);
  });

  it("a control that does not exist names the ones that do", () => {
    expect(() => parseHold("wheel=900")).toThrow(/mazeString/);
  });

  it("a distance that is not a number is refused", () => {
    expect(() => parseHold("mazeString=far")).toThrow(/thousandths of a tile/);
  });

  it("a y that is not a number is refused the same way", () => {
    expect(() => parseHold("wardenTether=0,y=down")).toThrow(/thousandths of a tile/);
  });

  it("prime takes nothing else", () => {
    expect(() => parseHold("prime=900")).toThrow(/no distance/);
  });
});

describe("parsePress", () => {
  it("reads a shot as two presses on one tick line", () => {
    expect(parsePress("60:1:cannonCol=3,64:2:fire=red")).toEqual([
      { tick: 60, player: 1, command: { kind: "cannonCol", col: 3 } },
      { tick: 64, player: 2, command: { kind: "fire", color: "red" } },
    ]);
  });

  it("sorts them, so they may be written in whatever order reads best", () => {
    const sorted = parsePress("64:2:fire=cyan,60:1:cannonCol=0");
    expect(sorted.map((p) => p.tick)).toEqual([60, 64]);
  });

  it("reads the two presses that have nothing to say about themselves", () => {
    expect(parsePress("40:1:guard")).toEqual([{ tick: 40, player: 1, command: { kind: "guard" } }]);
    expect(parsePress("0:1:intake")).toEqual([{ tick: 0, player: 1, command: { kind: "intake" } }]);
  });

  it("refuses a press from the seat that does not hold that control", () => {
    // The round would refuse it too, and the frame would come back with
    // nothing in it and nothing said anywhere.
    expect(() => parsePress("60:2:cannonCol=3")).toThrow(/player 1's/);
    expect(() => parsePress("60:1:fire=red")).toThrow(/player 2's/);
  });

  it("refuses a shot that is neither colour", () => {
    expect(() => parsePress("60:2:fire=green")).toThrow(/red or cyan/);
  });

  it("refuses a control it does not know", () => {
    expect(() => parsePress("60:1:wiggle")).toThrow(/unknown control/);
  });

  it("refuses a seat that is not a seat, and a tick that is not one", () => {
    expect(() => parsePress("60:3:guard")).toThrow(/seat is 1 or 2/);
    expect(() => parsePress("-1:1:guard")).toThrow(/whole number of ticks/);
    expect(() => parsePress("x:1:guard")).toThrow(/whole number of ticks/);
  });

  it("refuses a value where none belongs, and none where one does", () => {
    expect(() => parsePress("60:1:guard=3")).toThrow(/takes no value/);
    expect(() => parsePress("60:1:cannonCol")).toThrow(/takes a value/);
  });

  it("refuses an empty press rather than pressing nothing", () => {
    expect(() => parsePress("")).toThrow(/nothing to press/);
  });

  it("takes the grip from either seat, because it is the one that is not split", () => {
    expect(parsePress("10:1:grip=4")[0]?.command).toEqual({ kind: "grip", id: 4 });
    expect(parsePress("10:2:grip=4")[0]?.player).toBe(2);
  });
});
