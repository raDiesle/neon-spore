import { describe, expect, it } from "bun:test";
import { createRoomClock, PING_EVERY_MS, type RoomClock } from "../src/link-clock.js";

/**
 * The room's clock, run by hand.
 *
 * It is the only part of the game that asks what time it is, and everything it
 * decides — when to ping, how long the countdown has left, whether beat zero
 * has arrived — is measured against one injected `now`. So it can be tested
 * without a socket, a room or a wall clock, which is most of the reason it is
 * a file rather than eight lines inside `link.ts`.
 */

function held() {
  let ms = 0;
  const clock = createRoomClock(() => ms);
  return { clock, tick: (by: number) => (ms += by), at: (v: number) => (ms = v) };
}

/**
 * Three pongs saying the server answered instantly at `serverMs`, which is one
 * more than `ClockSync` needs before it believes an offset at all.
 */
function syncTo(clock: RoomClock, serverMs: number, deviceMs = 0): void {
  for (let i = 0; i < 3; i++) {
    clock.add({ t: "pong", c1: deviceMs, s1: serverMs, s2: serverMs }, false);
  }
}

describe("the ping timer", () => {
  it("is not due before the interval has run", () => {
    const { clock } = held();
    clock.pingSent();
    expect(clock.framePingDue(PING_EVERY_MS - 1)).toBe(false);
  });

  it("is due once the interval has run, and starts the next one", () => {
    const { clock } = held();
    clock.pingSent();
    expect(clock.framePingDue(PING_EVERY_MS)).toBe(true);
    expect(clock.framePingDue(PING_EVERY_MS - 1)).toBe(false);
    expect(clock.framePingDue(1)).toBe(true);
  });

  it("counts the ping the socket sends on opening as that interval's", () => {
    // Three samples take 2100 ms and the countdown is 3000 ms, so `link.ts`
    // sends one the moment the socket opens rather than waiting for the first
    // `framePingDue`. `pingSent` is how it says so, and without it the two
    // would both think they owned the interval.
    const { clock } = held();
    clock.pingSent();
    expect(clock.framePingDue(1)).toBe(false);
  });
});

describe("the countdown to the room's beat zero", () => {
  it("has nothing measured before a pong lands", () => {
    const { clock } = held();
    expect(clock.ready).toBe(false);
    expect(clock.sampleCount).toBe(0);
  });

  it("counts down to a beat zero on the room's clock, not on this device's", () => {
    const { clock, tick } = held();
    // This device is at 0 while the room's clock reads 10_000: an offset of
    // 10_000, which `snap` takes whole because nothing has started.
    syncTo(clock, 10_000);
    expect(clock.ready).toBe(true);
    expect(clock.countdownMs(13_000)).toBe(3000);
    tick(1000);
    expect(clock.countdownMs(13_000)).toBe(2000);
  });

  it("never counts below zero, and says beat zero has been reached there", () => {
    const { clock, at } = held();
    syncTo(clock, 10_000);
    expect(clock.reached(13_000)).toBe(false);
    at(3000);
    expect(clock.countdownMs(13_000)).toBe(0);
    expect(clock.reached(13_000)).toBe(true);
    at(9000);
    expect(clock.countdownMs(13_000)).toBe(0);
  });
});

describe("leaving a room", () => {
  it("throws the measurements away, so the next room starts from nothing", () => {
    const { clock } = held();
    syncTo(clock, 10_000);
    expect(clock.sampleCount).toBe(3);
    clock.reset();
    expect(clock.sampleCount).toBe(0);
    expect(clock.ready).toBe(false);
  });
});
