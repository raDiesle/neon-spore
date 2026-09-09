import { describe, expect, it } from "bun:test";
import { crankPresses } from "../crank.js";
import { collectHolds, parseFrameSpec, tickLine } from "../flags.js";
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

/**
 * The whole command line, in one call. What is checked here is the part a
 * capture cannot tell you about afterwards: a flag written with nothing after
 * it, a name resolved against the wrong list, and a press taken after the
 * photograph — each of which used to hand back an honest-looking picture of
 * something nobody asked for.
 */
describe("parseFrameSpec", () => {
  const waves = [{ name: "THE DRIFT" }, { name: "THE SHELL" }, { name: "THE MAZE" }];

  it("takes the HUD's own number and the defaults every capture has had", () => {
    const { spec, waveValue } = parseFrameSpec(["<sha>", "--wave", "2"], waves);
    expect(waveValue).toBe("2");
    expect(spec.wave).toBe(1);
    expect(spec.ticks).toBe(120);
    expect(spec.frames).toBe(1);
    expect(spec.strideTicks).toBe(4);
    expect(spec.settle).toBe(0);
    expect(spec.zoom).toBe(1);
    expect(spec.raster).toBe(false);
    expect(spec.seat).toBeUndefined();
    expect(spec.press).toBeUndefined();
    expect(spec.hold).toBeUndefined();
    expect(spec.opening).toBeUndefined();
  });

  it("resolves a name against the list it is handed, not the working tree's", () => {
    expect(parseFrameSpec(["<sha>", "--wave", "THE MAZE"], waves).spec.wave).toBe(2);
    expect(() => parseFrameSpec(["<sha>", "--wave", "THE GRATE"], waves)).toThrow(/no wave with/);
  });

  it("will not pick a wave for you", () => {
    expect(() => parseFrameSpec(["<sha>"], waves)).toThrow(/--wave is required/);
    expect(() => parseFrameSpec(["<sha>", "--wave"], waves)).toThrow(/--wave is required/);
  });

  it("leaves the round and the page out unless somebody asked for one", () => {
    const plain = parseFrameSpec(["<sha>", "--wave", "1"], waves).spec;
    expect("bossRound" in plain).toBe(false);
    expect("guidePage" in plain).toBe(false);
    const asked = parseFrameSpec(
      ["<sha>", "--wave", "1", "--boss-round", "3", "--guide-page", "0"],
      waves,
    ).spec;
    expect(asked.bossRound).toBe(3);
    expect(asked.guidePage).toBe(0);
  });

  it("refuses a flag written with nothing after it, rather than ignoring it", () => {
    expect(() => parseFrameSpec(["<sha>", "--wave", "1", "--opening"], waves)).toThrow(
      /one of intro, guide/,
    );
    expect(() => parseFrameSpec(["<sha>", "--wave", "1", "--seat"], waves)).toThrow(
      /one of p1, p2 or test/,
    );
  });

  it("refuses a seat nobody sits in", () => {
    expect(() => parseFrameSpec(["<sha>", "--wave", "1", "--seat", "p3"], waves)).toThrow(
      /--seat p3/,
    );
    expect(parseFrameSpec(["<sha>", "--wave", "1", "--seat", "p2"], waves).spec.seat).toBe("p2");
  });

  it("puts the ticked hold and the press on one line, in tick order", () => {
    const { spec } = parseFrameSpec(
      [
        "<sha>",
        "--wave",
        "1",
        "--ticks",
        "400",
        "--hold",
        "mazeString=1400@240",
        "--press",
        "300:2:fire=cyan",
      ],
      waves,
    );
    expect(spec.press?.map((p) => p.tick)).toEqual([240, 240, 300]);
    expect(spec.hold).toBeUndefined();
  });

  it("refuses a press taken after the photograph", () => {
    expect(() =>
      parseFrameSpec(
        ["<sha>", "--wave", "1", "--ticks", "100", "--press", "300:2:fire=cyan"],
        waves,
      ),
    ).toThrow(/after --ticks 100/);
  });

  it("keeps the crop it is given, and reads --raster off the line", () => {
    const { spec } = parseFrameSpec(
      ["<sha>", "--wave", "1", "--at", "120,400,150,150", "--zoom", "3", "--raster"],
      waves,
    );
    expect(spec.at).toEqual({ x: 120, y: 400, width: 150, height: 150 });
    expect(spec.zoom).toBe(3);
    expect(spec.raster).toBe(true);
  });
});
