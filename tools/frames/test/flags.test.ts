import { describe, expect, it } from "bun:test";
import { crankPresses } from "../crank.js";
import { collectHolds, tickLine } from "../flags.js";
import { parseHoldFlag } from "../hold.js";
import { parsePress } from "../press.js";

/**
 * The three things a command line could not say, and now can: two hands on one
 * body, a hold that goes on *before* a shot rather than after it, and a hand
 * turning THE CLAW's crank.
 */
describe("collectHolds", () => {
  it("takes every --hold, not the first — THE BALLOON is two hands at once", () => {
    const { hold } = collectHolds([
      "--wave",
      "21",
      "--hold",
      "balloonLeft=-1600,id=1",
      "--hold",
      "balloonRight=1600,id=1",
    ]);
    expect(hold).toHaveLength(4);
    expect(hold?.map((h) => h.player)).toEqual([1, 1, 2, 2]);
    expect(hold?.map((h) => h.command.fromMilli)).toEqual([0, -1600, 0, 1600]);
  });

  it("keeps a bare --hold off the press line", () => {
    const { hold, pressed } = collectHolds(["--hold", "mazeString=1400"]);
    expect(hold).toHaveLength(2);
    expect(pressed).toEqual([]);
  });

  it("sends a @TICK hold down the press line instead", () => {
    const { hold, pressed } = collectHolds(["--hold", "mazeString=1400@240"]);
    expect(hold).toBeUndefined();
    expect(pressed.map((p) => p.tick)).toEqual([240, 240]);
    expect(pressed.map((p) => p.command.fromMilli)).toEqual([0, 1400]);
  });

  it("reads the tick off the end, after a handle's own parts", () => {
    const { tick, commands } = parseHoldFlag("wardenTether=0,y=7000@60");
    expect(tick).toBe(60);
    expect(commands[1]?.command.fromYMilli).toBe(7000);
  });

  it("refuses a tick that is not a whole number of ticks", () => {
    expect(() => parseHoldFlag("mazeString=1400@later")).toThrow(/whole number of ticks/);
  });
});

describe("tickLine", () => {
  it("puts the wheel's turn before the shot it makes possible", () => {
    const { pressed } = collectHolds(["--hold", "mazeString=1400@240"]);
    const line = tickLine(parsePress("300:2:fire=cyan"), pressed);
    expect(line.map((p) => p.tick)).toEqual([240, 240, 300]);
    expect(line.at(-1)?.command.kind).toBe("fire");
  });

  it("keeps a hold ahead of a press written on the same tick", () => {
    const { pressed } = collectHolds(["--hold", "mazeString=1400@300"]);
    const line = tickLine(parsePress("300:2:fire=cyan"), pressed);
    expect(line.map((p) => p.command.kind)).toEqual(["drag", "drag", "fire"]);
  });
});

describe("crank", () => {
  it("expands one press into a grab, a bearing a tick, and a hand coming off", () => {
    const stream = crankPresses(200, 1, 1);
    expect(stream[0]?.command.fromMilli).toBe(-1);
    expect(stream.at(-1)?.command.on).toBe(false);
    // One a tick from the named one, and none of them before it.
    expect(Math.min(...stream.map((p) => p.tick))).toBe(200);
    const bearings = stream.slice(1, -1);
    expect(bearings.map((p) => p.tick)).toEqual(bearings.map((_, i) => 200 + i));
  });

  it("winds the other way round for a negative turn, and stays inside one turn", () => {
    const back = crankPresses(90, 1, -1)
      .slice(1, -1)
      .map((p) => Number(p.command.fromMilli));
    expect(back[0]).toBe(0);
    // Counting down through the modulus rather than into negative numbers: the
    // simulation reads the step between two bearings on a circle.
    expect(back[1]).toBeGreaterThan(500);
    expect(Math.min(...back)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...back)).toBeLessThan(1000);
  });

  it("takes twice as long for twice the turns", () => {
    const span = (turns: number): number => {
      const stream = crankPresses(0, 1, turns);
      return (stream.at(-1)?.tick ?? 0) - (stream[0]?.tick ?? 0);
    };
    expect(span(6)).toBe(span(3) * 2);
  });

  it("reaches the page through --press, on the pilot's seat", () => {
    const line = parsePress("240:1:crank=2");
    expect(line.length).toBeGreaterThan(10);
    expect(line.every((p) => p.player === 1)).toBe(true);
    expect(line.every((p) => p.command.target === "crank")).toBe(true);
  });

  it("refuses the navigator's seat, and a crank with no turns on it", () => {
    expect(() => parsePress("240:2:crank=2")).toThrow(/player 1/);
    expect(() => parsePress("240:1:crank")).toThrow(/turns of the drum/);
  });
});
