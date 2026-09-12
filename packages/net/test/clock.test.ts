import { describe, expect, it } from "bun:test";
import { sampleOffset, sampleRtt } from "../src/clock.js";
import { ClockSync } from "../src/index.js";

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

  it("snaps to the measured offset while nothing has started", () => {
    const clock = new ClockSync();
    for (let i = 0; i < 3; i++) clock.add(trip(i * 700, 20, 0));
    expect(clock.offsetMs).toBe(0);

    // A minute asleep: `performance.now()` stood still and the room's clock
    // did not, so every fresh trip reads a minute of offset. Four of them
    // carry the seven-sample median outright.
    for (let i = 0; i < 4; i++) clock.add(trip(60_000 + i * 700, 20, 60_000));
    expect(clock.target).toBe(60_000);
    expect(clock.offsetMs).toBe(0);

    clock.snap();
    expect(clock.offsetMs).toBe(60_000);
  });

  it("reads each trip from its own four timestamps, not from the order they land in", () => {
    // A pong that overtakes one sent before it is ordinary: two pings are in
    // the air at once whenever a trip is longer than the gap between them, and
    // the room answers each where it stands rather than in the order they were
    // asked. Every trip carries the four timestamps it is measured from, so
    // which one lands first has to decide nothing — the alternative is a beat
    // that moves depending on how two packets raced.
    const at = (i: number) => trip(i * 700, 20 + i, 5000);
    const inOrder = new ClockSync();
    for (const i of [0, 1, 2, 3, 4, 5, 6]) inOrder.add(at(i));
    const jumbled = new ClockSync();
    for (const i of [3, 0, 5, 1, 6, 2, 4]) jumbled.add(at(i));

    expect(jumbled.offsetMs).toBe(inOrder.offsetMs);
    expect(jumbled.target).toBe(inOrder.target);
    expect(jumbled.rttMs).toBe(inOrder.rttMs);
    // And it is the right answer, not the same wrong one twice.
    expect(jumbled.offsetMs).toBe(5000);
    expect(jumbled.rttMs).toBe(46);

    // The far end of the same case: a ping that sat in a queue on the way up
    // and is answered after the two sent behind it. It is one sample of seven
    // and it reads 450 ms of offset that is not there, so the median outvotes
    // it — and the applied offset does not move for it at all, because nothing
    // but `settle` and `snap` ever moves that.
    const c1 = 4900;
    jumbled.add({ c1, s1: c1 + 920 + 5000, s2: c1 + 920 + 5000, c2: c1 + 940 });
    expect(jumbled.target).toBe(5000);
    expect(jumbled.offsetMs).toBe(5000);
  });

  it("snaps nothing before the first acquisition", () => {
    const clock = new ClockSync();
    clock.add(trip(0, 20, 5000));
    clock.snap();
    expect(clock.ready).toBe(false);
    expect(clock.offsetMs).toBe(0);
  });
});

/**
 * `link.ts` never reads `Date.now()` — it takes a `now` it was handed
 * (`performance.now()` by default) and compares everything, beat zero
 * included, against that. These scenarios drive the same arithmetic
 * `link.ts`'s `frame()` and `status()` do — `clock.toLocal(startMs)` against
 * an injected clock — without pulling `apps/game` into this package: the
 * shape is the same, only the source of `now` is a variable this test moves
 * by hand instead of a real clock.
 */
describe("link-shaped scenario: an injected, monotonic clock", () => {
  it("follows the injected clock for its countdown, not a wall clock", () => {
    let fakeNow = 50_000;
    const now = () => fakeNow;

    const clock = new ClockSync();
    for (let i = 0; i < 3; i++) {
      clock.add(trip(fakeNow, 20, 5000));
      fakeNow += 700;
    }
    expect(clock.ready).toBe(true);

    // Beat zero, three seconds out in server time.
    const startMs = fakeNow + clock.offsetMs + 3000;
    const countdown = () => Math.max(0, clock.toLocal(startMs) - now());

    expect(countdown()).toBe(3000);
    fakeNow += 1000;
    expect(countdown()).toBe(2000);
    fakeNow += 2000;
    expect(countdown()).toBe(0);
  });

  it("does not move an acquired beat zero by more than the drift limit, even when a sample implies a big jump", () => {
    let fakeNow = 0;
    const clock = new ClockSync();
    for (let i = 0; i < 3; i++) {
      clock.add(trip(fakeNow, 20, 5000));
      fakeNow += 700;
    }
    const startMs = fakeNow + clock.offsetMs + 10_000;
    const beatZeroLocalBefore = clock.toLocal(startMs);

    // Enough fresh samples to actually move the median (one outlier alone
    // would not) — the shape of a real offset step, the case `settle`
    // exists to keep from reaching a beat unannounced.
    for (let i = 0; i < 7; i++) {
      clock.add(trip(fakeNow, 20, 9000));
      fakeNow += 700;
    }
    expect(clock.target).toBe(9000);
    clock.settle(1000);

    const beatZeroLocalAfter = clock.toLocal(startMs);
    // MAX_DRIFT_MS_PER_SECOND in clock.ts, mirrored here rather than
    // imported: one second of `settle` moves the applied offset by at most
    // that much, so beat zero cannot have moved further than it either.
    const maxDriftMs = 4;
    expect(Math.abs(beatZeroLocalAfter - beatZeroLocalBefore)).toBeLessThanOrEqual(maxDriftMs);
  });
});
