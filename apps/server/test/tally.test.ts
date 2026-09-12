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
  test("is taken whole: the further wave, with the clock it was reached on", () => {
    // The clock and the retries are read at the wave, so mixing one seat's
    // wave with the other's clock would describe a moment that never was.
    const further = { wave: 9, seconds: 400, retries: 3 };
    expect(bestOf({ wave: 8, seconds: 100, retries: 0 }, further)).toBe(further);
  });

  test("keeps the earlier arrival at the same wave: fewer retries, then less time", () => {
    // A seat sends these every few seconds of one run; at the same wave the
    // first heard is the arrival, and a later run that gets there cleaner
    // takes the record.
    const held = { wave: 9, seconds: 200, retries: 2 };
    expect(bestOf(held, { wave: 9, seconds: 240, retries: 2 })).toBe(held);
    expect(bestOf(held, { wave: 9, seconds: 300, retries: 1 })).toEqual({
      wave: 9,
      seconds: 300,
      retries: 1,
    });
    expect(bestOf(held, { wave: 9, seconds: 180, retries: 2 })).toEqual({
      wave: 9,
      seconds: 180,
      retries: 2,
    });
  });

  test("keeps what is held when nothing arriving beats it", () => {
    const held = { wave: 9, seconds: 200, retries: 2 };
    expect(bestOf(held, { wave: 2, seconds: 40, retries: 0 })).toBe(held);
  });

  test("starts from nothing", () => {
    const first = { wave: 3, seconds: 70, retries: 1 };
    expect(bestOf(NOTHING_YET, first)).toBe(first);
  });
});

describe("a tally off the wire", () => {
  test("is read when it is one", () => {
    expect(tallyFromWire({ wave: 9, seconds: 222, retries: 2 })).toEqual({
      wave: 9,
      seconds: 222,
      retries: 2,
    });
  });

  test("is zeroes rather than a refusal when it is not", () => {
    // It is a line on a screen. Refusing the message over it would be worse
    // than showing nothing.
    for (const raw of [null, undefined, 7, "nine", {}, { wave: -1, seconds: "x", retries: -2 }]) {
      expect(tallyFromWire(raw)).toEqual(NOTHING_YET);
    }
  });

  test("takes the whole of a number and nothing after the point", () => {
    expect(tallyFromWire({ wave: 3.9, seconds: 12.5, retries: 1.5 })).toEqual({
      wave: 3,
      seconds: 12,
      retries: 1,
    });
  });
});

describe("whether there is anything to say", () => {
  test("says nothing about a room never played in", () => {
    expect(worthSaying(NOTHING_YET)).toBe(false);
  });

  test("says something once either figure has moved", () => {
    expect(worthSaying({ wave: 1, seconds: 0, retries: 0 })).toBe(true);
    expect(worthSaying({ wave: 0, seconds: 40, retries: 0 })).toBe(true);
    expect(worthSaying({ wave: 0, seconds: 0, retries: 1 })).toBe(true);
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
