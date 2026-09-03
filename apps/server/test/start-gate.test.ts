import { describe, expect, test } from "bun:test";
import { emptiedRoom, StartGate } from "../src/start-gate.js";

/**
 * The two presses between a full room and beat zero, away from the Durable
 * Object. `room.test.ts` drives the real thing over a real socket; this is the
 * rule underneath it, which is where the awkward cases are cheap to state.
 */

describe("the gate", () => {
  test("one press is not a start", () => {
    expect(new StartGate().press(1, 2)).toBe(false);
  });

  test("two presses from two seats are", () => {
    const gate = new StartGate();
    gate.press(1, 2);
    expect(gate.press(2, 2)).toBe(true);
  });

  test("a thumb that lands twice is one ready seat", () => {
    const gate = new StartGate();
    gate.press(1, 2);
    expect(gate.press(1, 2)).toBe(false);
    expect(gate.players()).toEqual([1]);
  });

  test("is not opened by a press from a seat whose partner has gone", () => {
    const gate = new StartGate();
    gate.press(1, 2);
    // Both presses, one seat: there is nobody to start with.
    expect(gate.press(2, 1)).toBe(false);
  });

  test("gives a seat back its press when it leaves", () => {
    const gate = new StartGate();
    gate.press(1, 2);
    gate.drop(1);
    expect(gate.players()).toEqual([]);
    // And the one still here is not one thumb from starting alone.
    expect(gate.press(2, 2)).toBe(false);
  });

  test("says who has pressed in seat order, whole set and never an edge", () => {
    const gate = new StartGate();
    gate.press(2, 2);
    expect(gate.players()).toEqual([2]);
    gate.press(1, 2);
    expect(gate.players()).toEqual([1, 2]);
  });

  test("is emptied by the run it started, so the next one needs its own two", () => {
    const gate = new StartGate();
    gate.press(1, 2);
    gate.press(2, 2);
    gate.clear();
    expect(gate.players()).toEqual([]);
    expect(gate.press(1, 2)).toBe(false);
  });
});

describe("a room that empties", () => {
  test("has no run left in it, whatever its stamp says", () => {
    expect(emptiedRoom(1, 12_345)).toBe(true);
    expect(emptiedRoom(0, 12_345)).toBe(true);
  });

  test("has nothing to throw away when it never started", () => {
    expect(emptiedRoom(1, 0)).toBe(false);
  });

  test("is not what a full room is", () => {
    expect(emptiedRoom(2, 12_345)).toBe(false);
  });
});
