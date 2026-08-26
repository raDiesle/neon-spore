import { describe, expect, it } from "bun:test";
import { ClockSync, sampleOffset, sampleRtt } from "../src/index.js";

/** One round trip: `trip` milliseconds each way, the server `offset` ahead. */
function trip(c1: number, oneWay: number, offset: number, handlingMs = 0) {
  return {
    c1,
    s1: c1 + oneWay + offset,
    s2: c1 + oneWay + handlingMs + offset,
    c2: c1 + 2 * oneWay + handlingMs,
  };
}

describe("clock sync", () => {
  it("recovers the offset from a symmetric trip", () => {
    expect(sampleOffset(trip(1000, 25, 4000))).toBe(4000);
    expect(sampleRtt(trip(1000, 25, 4000))).toBe(50);
  });

  it("takes the server's own handling time back out of the round trip", () => {
    const s = trip(0, 30, 0, 12);
    expect(sampleRtt(s)).toBe(60);
    expect(sampleOffset(s)).toBe(0);
  });

  it("acquires the first offset outright and is then ready", () => {
    const clock = new ClockSync();
    expect(clock.ready).toBe(false);
    for (let i = 0; i < 3; i++) clock.add(trip(i * 700, 20, 5000));
    expect(clock.ready).toBe(true);
    expect(clock.offsetMs).toBe(5000);
  });

  it("takes the median, so one bad trip does not move it", () => {
    const clock = new ClockSync();
    clock.add(trip(0, 20, 5000));
    clock.add(trip(700, 20, 5000));
    clock.add(trip(1400, 20, 5000));
    // A packet that sat in a queue for a second: a wrong sample, not a real drift.
    clock.add({ c1: 2100, s1: 2100 + 900 + 5000, s2: 2100 + 900 + 5000, c2: 2100 + 940 });
    expect(clock.target).toBe(5000);
  });

  it("walks to a new offset instead of jumping to it", () => {
    const clock = new ClockSync();
    for (let i = 0; i < 3; i++) clock.add(trip(i * 700, 20, 5000));
    for (let i = 0; i < 7; i++) clock.add(trip(3000 + i * 700, 20, 5100));
    expect(clock.target).toBe(5100);
    expect(clock.offsetMs).toBe(5000);

    // A beat that moved 100 ms in one frame would be heard. This one does not.
    clock.settle(1000);
    expect(clock.offsetMs).toBeGreaterThan(5000);
    expect(clock.offsetMs).toBeLessThan(5010);

    // It does arrive, given enough seconds.
    for (let i = 0; i < 60; i++) clock.settle(1000);
    expect(clock.offsetMs).toBe(5100);
  });

  it("turns the room's beat zero into this device's own clock", () => {
    const clock = new ClockSync();
    for (let i = 0; i < 3; i++) clock.add(trip(i * 700, 20, 5000));
    expect(clock.toLocal(20_000)).toBe(15_000);
  });

  it("settles nothing before the first acquisition", () => {
    const clock = new ClockSync();
    clock.settle(10_000);
    expect(clock.offsetMs).toBe(0);
  });
});
