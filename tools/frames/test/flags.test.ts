import { describe, expect, it } from "bun:test";
import { controlSetForWave, WAVES } from "@neon-spore/content";
import { MALFUNCTION_KINDS } from "@neon-spore/sim";
import { crankPresses } from "../crank.js";
import { FAULT_FLAG_KINDS, parseFault, TO_THE_END } from "../fault.js";
import { collectHolds, tickLine } from "../flag-lists.js";
import { parseFrameSpec } from "../flags.js";
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

/** The panels these presses are checked against — `hold.test.ts` says why a
 * wave rather than a number (`press.ts`). */
const waveOn = (setId: string): number => {
  const i = WAVES.findIndex((_, at) => controlSetForWave(at).id === setId);
  if (i === -1) throw new Error(`no wave is played on the ${setId} panel`);
  return i;
};
const FIELD = waveOn("default");
const CLAW = waveOn("claw");

describe("tickLine", () => {
  it("puts the wheel's turn before the shot it makes possible", () => {
    const { pressed } = collectHolds(["--hold", "mazeString=1400@240"]);
    const line = tickLine(parsePress("300:2:fire=cyan", FIELD), pressed);
    expect(line.map((p) => p.tick)).toEqual([240, 240, 300]);
    expect(line.at(-1)?.command.kind).toBe("fire");
  });

  it("keeps a hold ahead of a press written on the same tick", () => {
    const { pressed } = collectHolds(["--hold", "mazeString=1400@300"]);
    const line = tickLine(parsePress("300:2:fire=cyan", FIELD), pressed);
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
    const line = parsePress("240:1:crank=2", CLAW);
    expect(line.length).toBeGreaterThan(10);
    expect(line.every((p) => p.player === 1)).toBe(true);
    expect(line.every((p) => p.command.target === "crank")).toBe(true);
  });

  it("refuses the navigator's seat, and a crank with no turns on it", () => {
    expect(() => parsePress("240:2:crank=2", CLAW)).toThrow(/player 1/);
    expect(() => parsePress("240:1:crank", CLAW)).toThrow(/turns of the drum/);
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

  it("keeps every --press, not the first one", () => {
    // The finding this fixes: a capture written with one flag per gesture ran
    // with one of them and dropped the other without a word, so the picture
    // came back as a wave playing itself.
    const { spec } = parseFrameSpec(
      [
        "<sha>",
        "--wave",
        "1",
        "--ticks",
        "400",
        "--press",
        "320:2:fire=red",
        "--press",
        "300:1:cannonCol=5",
      ],
      waves,
    );
    expect(spec.press?.map((p) => p.command.kind)).toEqual(["cannonCol", "fire"]);
    // Sorted onto one tick line, so the order the flags were typed in is not
    // the order they are sent.
    expect(spec.press?.map((p) => p.tick)).toEqual([300, 320]);
  });

  it("still takes a whole line of gestures in one comma-joined flag", () => {
    const { spec } = parseFrameSpec(
      ["<sha>", "--wave", "1", "--ticks", "400", "--press", "300:1:cannonCol=5,320:2:fire=red"],
      waves,
    );
    expect(spec.press?.map((p) => p.tick)).toEqual([300, 320]);
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

  it("puts a fault on a wave that carries none, and leaves one off otherwise", () => {
    const plain = parseFrameSpec(["<sha>", "--wave", "1"], waves).spec;
    expect(plain.fault).toBeUndefined();
    const { spec } = parseFrameSpec(["<sha>", "--wave", "1", "--fault", "handover:4,3,6"], waves);
    expect(spec.fault?.malfunction).toEqual({ kind: "handover", at: 4, beats: 3, every: 6 });
  });
});

/**
 * The flag THE HANDOVER's cycle needed. Verifying it meant a scratch script
 * that wrote `world.malfunction` by hand, because no wave in the tree repeats
 * the trade — so what is checked here is that each kind gets the grammar its
 * own arm of the union has, and that a number a kind has no field for is
 * refused rather than dropped.
 */
describe("parseFault", () => {
  it("takes the director's three boxes in order, and each of them alone", () => {
    expect(parseFault("handover:4,3,6")?.malfunction).toEqual({
      kind: "handover",
      at: 4,
      beats: 3,
      every: 6,
    });
    expect(parseFault("handover:4")?.malfunction).toEqual({
      kind: "handover",
      at: 4,
      beats: TO_THE_END,
    });
    // Bare is a pencil across the whole wave at the shipped period.
    expect(parseFault("handover")?.malfunction).toEqual({
      kind: "handover",
      at: 0,
      beats: TO_THE_END,
    });
  });

  it("refuses a fourth number, and one that is not a whole number of beats", () => {
    expect(() => parseFault("handover:4,3,6,9")).toThrow(/handover takes 3/);
    expect(() => parseFault("handover:soon")).toThrow(/whole number of beats/);
    expect(() => parseFault("handover:-1")).toThrow(/whole number of beats/);
  });

  it("will not pick a runaway cannon's ammunition for you", () => {
    expect(() => parseFault("cannon")).toThrow(/one of red, cyan, alternating/);
    expect(() => parseFault("cannon:green")).toThrow(/one of red, cyan, alternating/);
    expect(parseFault("cannon:alternating")?.malfunction).toEqual({
      kind: "cannon",
      color: "alternating",
      at: 0,
      beats: TO_THE_END,
    });
  });

  it("names the fault clock for the two faults that read it off the config", () => {
    expect(parseFault("cannon:red,2")).toEqual({
      malfunction: { kind: "cannon", color: "red", at: 0, beats: TO_THE_END },
      everyBeats: 2,
    });
    expect(parseFault("shield:3")).toEqual({
      malfunction: { kind: "shield", at: 0, beats: TO_THE_END },
      everyBeats: 3,
    });
    // Nothing written unless the flag asked: a capture that names no period is
    // the shipped clock.
    expect(parseFault("shield")).toEqual({
      malfunction: { kind: "shield", at: 0, beats: TO_THE_END },
    });
  });

  it("gives every other kind the pencil's own two numbers", () => {
    // **Which is what a fault is now.** They used to be refused outright —
    // *codex carries no numbers* — because a fault was one field on the wave
    // and only THE HANDOVER could say when. Every kind is placed on a beat row
    // since, so every kind takes `at` and `beats`, and a flag that refused them
    // could not photograph the one thing a placed fault does that a whole-wave
    // one could not: start in the middle and stop.
    expect(parseFault("codex:4")?.malfunction).toEqual({ kind: "codex", at: 4, beats: TO_THE_END });
    expect(parseFault("leech:2,6")?.malfunction).toEqual({ kind: "leech", at: 2, beats: 6 });
    expect(parseFault("steer")?.malfunction).toEqual({ kind: "steer", at: 0, beats: TO_THE_END });
    expect(() => parseFault("limpet:1,2,3")).toThrow(/limpet takes 2/);
  });

  it("knows the kinds the simulation knows, and no others", () => {
    // The list is spelled out in `fault.ts` because what crosses into the page
    // is JSON, so it is the sort of list that goes stale: it said `leak` for a
    // day after the owner took that kind off, and said nothing about THE LEECH
    // or THE LIMPET for a day after he added them.
    expect(new Set(FAULT_FLAG_KINDS)).toEqual(new Set(MALFUNCTION_KINDS));
  });

  it("refuses a fault the simulation has never heard of, and reads nothing as nothing", () => {
    expect(() => parseFault("leak")).toThrow(/one of cannon, shield, steer, codex/);
    expect(() => parseFault("wobble")).toThrow(/one of cannon, shield, steer, codex/);
    expect(() => parseFault("")).toThrow(/one of cannon, shield, steer, codex/);
    expect(parseFault(undefined)).toBeUndefined();
  });
});
