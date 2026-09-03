import { describe, expect, it } from "bun:test";
import type { Command } from "@neon-spore/sim";
import {
  AHEAD_LIMIT_SECONDS,
  type ClientMessage,
  Lockstep,
  type PlayerId,
  type ServerMessage,
} from "../src/index.js";

/**
 * Two `Lockstep`s wired to each other, with a queue in between that only moves
 * when it is told to. That queue is the whole point: latency in this test is a
 * thing the test decides, so "the peer is three ticks behind" is a case that
 * can be written down rather than one that has to be provoked.
 */
class Wire {
  private readonly inflight: { to: PlayerId; message: ServerMessage }[] = [];
  readonly p1: Lockstep;
  readonly p2: Lockstep;

  constructor(delayTicks: number) {
    this.p1 = new Lockstep({ player: 1, delayTicks, send: (m) => this.post(1, m) });
    this.p2 = new Lockstep({ player: 2, delayTicks, send: (m) => this.post(2, m) });
  }

  private post(from: PlayerId, message: ClientMessage): void {
    if (message.t === "input") {
      this.inflight.push({
        to: from === 1 ? 2 : 1,
        message: { t: "input", player: from, tick: message.tick, commands: message.commands },
      });
    } else if (message.t === "confirm") {
      this.inflight.push({
        to: from === 1 ? 2 : 1,
        message: { t: "confirm", player: from, tick: message.tick },
      });
    }
  }

  /** Everything currently in the air lands. */
  deliver(): void {
    const pending = this.inflight.splice(0, this.inflight.length);
    for (const p of pending) (p.to === 1 ? this.p1 : this.p2).receive(p.message);
  }

  /** Nothing lands — the packets are simply lost, as a stalled link loses them. */
  drop(): void {
    this.inflight.length = 0;
  }
}

const CANNON = (col: number): Command => ({ kind: "cannonCol", col });
const FIRE: Command = { kind: "fire", color: "red" };

describe("lockstep", () => {
  it("holds a tick until the peer has promised it", () => {
    const wire = new Wire(4);
    wire.p1.pump(0);
    expect(wire.p1.ready(0)).toBe(false);

    wire.p2.pump(0);
    wire.deliver();
    // A peer at head 0 with a delay of 4 has settled everything through tick 3.
    expect(wire.p1.ready(3)).toBe(true);
    expect(wire.p1.ready(4)).toBe(false);
  });

  it("applies a press on the same tick on both devices", () => {
    const wire = new Wire(4);
    wire.p1.press(1, CANNON(6), 10);
    wire.p1.pump(10);
    wire.p2.pump(10);
    wire.deliver();

    expect(wire.p1.commandsFor(14)).toEqual([{ tick: 14, player: 1, command: CANNON(6) }]);
    expect(wire.p2.commandsFor(14)).toEqual([{ tick: 14, player: 1, command: CANNON(6) }]);
    // And nowhere else: the press belongs to the tick it was scheduled for.
    expect(wire.p1.commandsFor(10)).toEqual([]);
  });

  it("orders both seats the same way on both devices", () => {
    const wire = new Wire(2);
    wire.p2.press(2, FIRE, 5);
    wire.p1.press(1, { kind: "guard" }, 5);
    wire.p1.pump(5);
    wire.p2.pump(5);
    wire.deliver();

    const seats = (list: { player: PlayerId }[]): PlayerId[] => list.map((c) => c.player);
    expect(seats(wire.p1.commandsFor(7))).toEqual([1, 2]);
    expect(seats(wire.p2.commandsFor(7))).toEqual([1, 2]);
  });

  it("drops a press for the seat this device does not hold", () => {
    const wire = new Wire(2);
    // The keyboard sends both halves at a desk. Seat 1 keeps only its own.
    expect(wire.p1.press(1, { kind: "guard" }, 0)).toBe(true);
    expect(wire.p1.press(2, FIRE, 0)).toBe(false);
    wire.p1.pump(0);
    wire.p2.pump(0);
    wire.deliver();
    expect(wire.p2.commandsFor(2)).toEqual([{ tick: 2, player: 1, command: { kind: "guard" } }]);
  });

  it("counts a stall while the peer is silent, and stops once it speaks", () => {
    const wire = new Wire(2);
    for (let tick = 0; tick < 6; tick++) {
      wire.p1.pump(tick);
      wire.p2.pump(tick);
      wire.drop();
    }
    expect(wire.p1.stalledTicks).toBeGreaterThan(0);
    expect(wire.p1.slack).toBeLessThan(0);

    wire.p1.pump(6);
    wire.p2.pump(6);
    wire.deliver();
    wire.p1.pump(6);
    expect(wire.p1.stalledTicks).toBe(0);
    expect(wire.p1.ready(6)).toBe(true);
  });

  it("refuses an input for a tick the peer already promised to leave alone", () => {
    const wire = new Wire(2);
    wire.p1.receive({ t: "confirm", player: 2, tick: 20 });
    wire.p1.receive({ t: "input", player: 2, tick: 20, commands: [FIRE] });
    expect(wire.p1.brokenPromises).toBe(1);
    expect(wire.p1.commandsFor(20)).toEqual([]);
  });

  it("reads an input as a promise about everything before it", () => {
    const wire = new Wire(2);
    wire.p1.receive({ t: "input", player: 2, tick: 9, commands: [FIRE] });
    expect(wire.p1.ready(8)).toBe(true);
    expect(wire.p1.ready(9)).toBe(false);
  });

  it("refuses an input a fixed window past the head, and frees nothing", () => {
    // `theirs` is a map the peer writes into and `commandsFor` frees only the
    // tick it consumes, so a frame filed under a tick the run never reaches is
    // a leak that never drains. One `input` near 2**31 used to be enough.
    const wire = new Wire(2);
    wire.p1.pump(100);
    const far = 100 + 60 * AHEAD_LIMIT_SECONDS + 1;
    wire.p1.receive({ t: "input", player: 2, tick: far, commands: [FIRE] });
    expect(wire.p1.brokenPromises).toBe(1);
    expect(wire.p1.commandsFor(far)).toEqual([]);
    // And the refusal is not itself a promise: the horizon has not moved.
    expect(wire.p1.ready(101)).toBe(false);

    // The edge of the window is still a peer with a long lay, not an attack.
    const near = 100 + 60 * AHEAD_LIMIT_SECONDS;
    wire.p1.receive({ t: "input", player: 2, tick: near, commands: [FIRE] });
    expect(wire.p1.brokenPromises).toBe(1);
    expect(wire.p1.commandsFor(near)).toEqual([{ tick: near, player: 2, command: FIRE }]);
  });

  it("refuses a confirm past the same window, so the run cannot be raced ahead", () => {
    // A horizon out at 2**31 makes `ready` true for every tick this run will
    // ever reach, and the device leaves the peer it is meant to be in step with.
    const wire = new Wire(2);
    wire.p1.pump(0);
    wire.p1.receive({ t: "confirm", player: 2, tick: 2 ** 31 - 1 });
    expect(wire.p1.brokenPromises).toBe(1);
    expect(wire.p1.ready(1)).toBe(false);
  });

  it("keeps a press out of a tick that has already been simulated", () => {
    // The guarantee the whole model rests on: at head H nothing can still be
    // added to any tick at or before H, because a press lands at H + delay.
    const wire = new Wire(1);
    for (let head = 0; head < 20; head++) {
      wire.p1.press(1, CANNON(head), head);
      expect(wire.p1.scheduleFor(head)).toBeGreaterThan(head);
    }
  });
});
