import { describe, expect, it } from "bun:test";
import type { ClientMessage } from "../src/index.js";
import { InputDelay, Lockstep } from "../src/index.js";

/** 120 Hz, so a tick is 8⅓ ms and the arithmetic below is the game's own. */
const TICK_HZ = 120;
const FLOOR = 12;

const make = (): InputDelay => new InputDelay({ tickHz: TICK_HZ, floorTicks: FLOOR });

describe("input delay", () => {
  it("sits at the configured floor until the link says otherwise", () => {
    const delay = make();
    expect(delay.ticks).toBe(FLOOR);
    // -1 is `ClockSync` before it has a median worth believing. A delay that
    // moved on that would open every run at its floor whatever the link is.
    delay.observe(-1);
    delay.settle(5000);
    expect(delay.ticks).toBe(FLOOR);
  });

  it("does not drop below the floor on a link that is better than the tuning", () => {
    const delay = make();
    delay.observe(1);
    delay.settle(10_000);
    expect(delay.ticks).toBe(FLOOR);
  });

  it("rises at once when the trip gets longer", () => {
    const delay = make();
    // 150 ms of trip plus the 45 ms margin is 195 ms, which is 24 ticks.
    delay.observe(150);
    expect(delay.ticks).toBe(24);
    // No time has to pass. A delay that eased upwards would spend the easing
    // stalled, which is the one thing the whole class exists to avoid.
    expect(delay.ticks).toBe(24);
  });

  it("gives a tick back at a time, and only while the link stays good", () => {
    const delay = make();
    delay.observe(150);
    const high = delay.ticks;
    delay.observe(10);
    // Still the high value: falling is what time does, not what a sample does.
    expect(delay.ticks).toBe(high);
    delay.settle(1000);
    expect(delay.ticks).toBe(high - 1);
    delay.settle(2500);
    expect(delay.ticks).toBe(high - 3);
    // One bad sample stops the descent where it stands.
    delay.observe(150);
    delay.settle(5000);
    expect(delay.ticks).toBe(high);
  });

  it("refuses to carry more lag than a game to a beat can survive", () => {
    const delay = make();
    delay.observe(4000);
    // 400 ms is the ceiling, which is 48 ticks at 120 Hz. Past that the link
    // is allowed to stall and say so rather than hide behind lag.
    expect(delay.ticks).toBe(48);
  });
});

describe("a scheduler whose delay moves", () => {
  const confirms = (sent: ClientMessage[]): number[] =>
    sent.filter((m) => m.t === "confirm").map((m) => m.tick);

  it("never schedules before a promise it has already made", () => {
    const sent: ClientMessage[] = [];
    const lock = new Lockstep({ player: 1, delayTicks: 30, send: (m) => sent.push(m) });

    lock.pump(0);
    expect(confirms(sent)).toEqual([29]);

    // The link improves and the delay is handed back. The promise already on
    // the wire — "nothing before tick 29" — outlives the number that made it,
    // so a press now may not land on tick 4 however short the delay has got.
    lock.setDelayTicks(4);
    lock.press(1, { kind: "guard" }, 0);
    lock.flush();
    expect(sent.filter((m) => m.t === "input")).toEqual([
      { t: "input", tick: 30, commands: [{ kind: "guard" }] },
    ]);
  });

  it("sends no confirmation until the head catches up with the promise", () => {
    const sent: ClientMessage[] = [];
    const lock = new Lockstep({ player: 1, delayTicks: 30, send: (m) => sent.push(m) });
    lock.pump(0);
    lock.setDelayTicks(4);

    // Twenty-six ticks of head movement are covered by what was already
    // promised, so there is nothing new to say — and the peer is not held up
    // by the silence, because it already has a promise reaching past it.
    for (let tick = 1; tick <= 26; tick++) lock.pump(tick);
    expect(confirms(sent)).toEqual([29]);
    lock.pump(27);
    expect(confirms(sent)).toEqual([29, 30]);
  });

  it("takes a longer delay into the next promise it makes", () => {
    const sent: ClientMessage[] = [];
    const lock = new Lockstep({ player: 1, delayTicks: 6, send: (m) => sent.push(m) });
    lock.pump(0);
    lock.setDelayTicks(20);
    lock.pump(1);
    expect(confirms(sent)).toEqual([5, 20]);
  });
});
