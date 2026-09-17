import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { BEARING_TURN, DEFAULT_CONFIG, NO_BEARING, orreryTurnPerTickMilli } from "@neon-spore/sim";
import { parsePress } from "../press.js";
import { ringPresses } from "../ring.js";

/**
 * **THE ORRERY's ring, on the press line.**
 *
 * The crank's own tests one boss over (`flags.test.ts`) and the same three
 * questions, because the failures are the same three: a stream that starts with
 * a bearing rather than with a bare grab turns the ring by wherever the hand
 * "landed"; a bearing that walks into negative numbers reads as most of a lap
 * the other way; and a stream that is a tick short pays out one organ fewer
 * than the line asked for, which on this boss is the difference between a shot
 * that reaches the core and one that does not.
 *
 * The last of those is the one only a test can hold. The ring banks travel and
 * pays out **whole organs** (`sim/orrery-hand.ts`), so a rig that is a
 * thousandth short is not visibly wrong anywhere — the picture simply has the
 * gap in the old socket.
 */

const CFG = DEFAULT_CONFIG;
const ORRERY = WAVES.findIndex((w) => w.boss?.kind === "orrery");

/** Every bearing in the stream, with the grab and the release cut off. */
const turning = (organs: number): number[] =>
  ringPresses(0, 1, organs)
    .slice(1, -1)
    .map((p) => Number(p.command.fromMilli));

describe("ringPresses", () => {
  it("opens with a bare grab and closes with the hand coming off", () => {
    const stream = ringPresses(200, 1, 1);
    expect(stream[0]?.command).toEqual({
      kind: "drag",
      target: "orreryRing",
      on: true,
      fromMilli: NO_BEARING,
    });
    expect(stream.at(-1)?.command).toEqual({
      kind: "drag",
      target: "orreryRing",
      on: false,
      fromMilli: NO_BEARING,
    });
    expect(stream[0]?.tick).toBe(200);
  });

  it("carries a whole organ's worth of travel, and one more for one more organ", () => {
    // The rate is the simulation's and so is the gearing, so what this asserts
    // is the product: as far as the ring goes by itself in a beat, per organ.
    const travel = (organs: number): number => {
      const stream = ringPresses(0, 1, organs);
      const ticks = (stream.at(-1)?.tick ?? 0) - (stream[0]?.tick ?? 0);
      return ticks * orreryTurnPerTickMilli(CFG);
    };
    expect(travel(1)).toBeGreaterThanOrEqual(CFG.orreryHandMilliPerOrgan);
    expect(travel(1)).toBeLessThan(CFG.orreryHandMilliPerOrgan * 2);
    expect(travel(3)).toBeGreaterThanOrEqual(CFG.orreryHandMilliPerOrgan * 3);
    expect(travel(3)).toBeLessThan(CFG.orreryHandMilliPerOrgan * 4);
  });

  it("goes round the other way for a negative count, and stays inside one turn", () => {
    const back = turning(-1);
    expect(back[0]).toBe(0);
    // Counting down through the modulus rather than below nought: what the
    // simulation reads is the step between two bearings on a circle.
    expect(back[1]).toBeGreaterThan(BEARING_TURN / 2);
    expect(Math.min(...back)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...back)).toBeLessThan(BEARING_TURN);
  });

  it("never steps further in one tick than the ratchet reads as forward", () => {
    // Half a turn between two samples is a hand that has gone round the other
    // way as far as `orreryRingHeard` can tell, and a synthetic hand is written
    // to stay well inside it (`sim/bearing.ts`).
    expect(orreryTurnPerTickMilli(CFG)).toBeLessThan(BEARING_TURN / 2);
  });
});

describe("--press orreryRing", () => {
  it("reaches the page on the pilot's seat, whatever panel the wave carries", () => {
    const line = parsePress(`120:1:orreryRing=2`, ORRERY);
    expect(line.length).toBeGreaterThan(10);
    expect(line.every((p) => p.player === 1)).toBe(true);
    expect(line.every((p) => p.command.target === "orreryRing")).toBe(true);
  });

  it("refuses the navigator's seat, and a ring with no organs on it", () => {
    // The ring is the pilot's every beat of the fight, and the simulation
    // refuses her bearings outright — so a frame taken on her seat would come
    // back with the rings exactly where they were and no error anywhere.
    expect(() => parsePress("120:2:orreryRing=2", ORRERY)).toThrow(/player 1/);
    expect(() => parsePress("120:1:orreryRing", ORRERY)).toThrow(/whole organs/);
    expect(() => parsePress("120:1:orreryRing=0.5", ORRERY)).toThrow(/whole organs/);
  });
});
