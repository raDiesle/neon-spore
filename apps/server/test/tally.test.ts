import { describe, expect, test } from "bun:test";
import { bestOf, NOTHING_YET, runIsOver, tallyFromWire, worthSaying } from "../src/tally.js";

/**
 * What a pair got to, and when a room gives up on a run.
 *
 * The rule half, away from the Durable Object — `room.test.ts` drives the real
 * thing over a real socket, and this is where the awkward cases are cheap to
 * state.
 */

describe("the better of two tallies", () => {
  test("is taken field by field, not whole", () => {
    // One seat may hold the furthest wave and the other the higher score — a
    // run where the hull broke on wave nine after a good wave eight is
    // exactly that shape — and taking the better record whole throws one of
    // the two facts away.
    expect(bestOf({ wave: 9, score: 100 }, { wave: 8, score: 12_300 })).toEqual({
      wave: 9,
      score: 12_300,
    });
  });

  test("keeps what is held when nothing arriving beats it", () => {
    const held = { wave: 9, score: 12_300 };
    expect(bestOf(held, { wave: 2, score: 40 })).toEqual(held);
  });

  test("starts from nothing", () => {
    expect(bestOf(NOTHING_YET, { wave: 3, score: 700 })).toEqual({ wave: 3, score: 700 });
  });
});

describe("a tally off the wire", () => {
  test("is read when it is one", () => {
    expect(tallyFromWire({ wave: 9, score: 12_300 })).toEqual({ wave: 9, score: 12_300 });
  });

  test("is zeroes rather than a refusal when it is not", () => {
    // It is a line on a screen. Refusing the message over it would be worse
    // than showing nothing.
    for (const raw of [null, undefined, 7, "nine", {}, { wave: -1, score: "x" }]) {
      expect(tallyFromWire(raw)).toEqual(NOTHING_YET);
    }
  });

  test("takes the whole of a number and nothing after the point", () => {
    expect(tallyFromWire({ wave: 3.9, score: 12.5 })).toEqual({ wave: 3, score: 12 });
  });
});

describe("whether there is anything to say", () => {
  test("says nothing about a room never played in", () => {
    expect(worthSaying(NOTHING_YET)).toBe(false);
  });

  test("says something once either figure has moved", () => {
    expect(worthSaying({ wave: 1, score: 0 })).toBe(true);
    expect(worthSaying({ wave: 0, score: 40 })).toBe(true);
  });
});

describe("when a run is over", () => {
  const WINDOW = 30_000;

  test("is when the room has been empty and quiet past the window", () => {
    expect(runIsOver(WINDOW + 1, WINDOW, 0, 12_345)).toBe(true);
  });

  test("is not while somebody is still in the room", () => {
    // One seat left alone is a wait, not an ending — its partner may be back.
    expect(runIsOver(WINDOW + 1, WINDOW, 1, 12_345)).toBe(false);
  });

  test("is not before the window has run", () => {
    // Ending a run because a lift went through a tunnel is worse than waiting.
    expect(runIsOver(WINDOW - 1, WINDOW, 0, 12_345)).toBe(false);
  });

  test("is not a thing that can happen to a room with no run in it", () => {
    expect(runIsOver(WINDOW * 10, WINDOW, 0, 0)).toBe(false);
  });
});
