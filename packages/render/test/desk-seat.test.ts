import { describe, expect, it } from "bun:test";
import { bothKey, DeskSeat, pointerSeat, pointerSeats, seatKey } from "../src/desk-seat.js";

/**
 * One mouse, two seats: the test screen signs a press with whichever seat key
 * is held, and player 1 with none. The hosts' listeners are not driven here
 * (`bun test` has no DOM); what the game and the director each do with a key
 * is held by their own source tests, and the rule they both call is this.
 */
describe("the desk's seat keys", () => {
  it("names a seat on the number row and on the pad, and nothing else", () => {
    expect(seatKey("Digit1")).toBe(1);
    expect(seatKey("Numpad2")).toBe(2);
    expect(seatKey("KeyG")).toBeNull();
    expect(seatKey("Digit3")).toBeNull();
  });

  it("remembers the last one pressed until it lifts, and none after a blur", () => {
    const desk = new DeskSeat();
    expect(desk.seat()).toBeUndefined();
    expect(desk.down("KeyG")).toBe(false);
    expect(desk.down("Digit2")).toBe(true);
    expect(desk.seat()).toBe(2);
    desk.down("Digit1");
    expect(desk.seat()).toBe(1);
    desk.up("Digit1");
    expect(desk.seat()).toBe(2);
    desk.up("Digit2");
    expect(desk.seat()).toBeUndefined();
    desk.down("Numpad1");
    expect(desk.seat()).toBe(1);
    desk.clear();
    expect(desk.seat()).toBeUndefined();
  });

  it("reads 3 as both seats, on top of a seat key and under one", () => {
    expect(bothKey("Digit3")).toBe(true);
    expect(bothKey("Numpad3")).toBe(true);
    expect(bothKey("Digit1")).toBe(false);
    const desk = new DeskSeat();
    expect(desk.down("Digit1")).toBe(true);
    expect(desk.down("Digit3")).toBe(true);
    expect(desk.both()).toBe(true);
    expect(desk.seat()).toBeUndefined();
    expect(pointerSeats("test", desk.seat())).toEqual([1, 2]);
    desk.down("Digit2");
    expect(desk.both()).toBe(false);
    expect(desk.seat()).toBe(2);
    desk.up("Digit2");
    expect(desk.both()).toBe(true);
    desk.up("Digit3");
    expect(desk.seat()).toBe(1);
    desk.clear();
    expect(desk.both()).toBe(false);
  });

  it("moves only the test screen's pointer: a phone's seat is the role bar's", () => {
    expect(pointerSeat("p1", undefined)).toBe(1);
    expect(pointerSeat("p2", undefined)).toBe(2);
    expect(pointerSeat("p1", 2)).toBe(1);
    expect(pointerSeat("p2", 1)).toBe(2);
    expect(pointerSeat("test", undefined)).toBe(1);
    expect(pointerSeat("test", 1)).toBe(1);
    expect(pointerSeat("test", 2)).toBe(2);
  });
});
