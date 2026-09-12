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
 * What the scheduler survives, one failure mode per test.
 *
 * `lockstep.test.ts` next door is about the promise being kept: two devices on
 * a link that works, and what each one is then allowed to simulate. This file
 * is about the link not working — a frame that arrives after its tick has run,
 * a frame lost and sent again, the relay handing a device its own word back,
 * and a phone that came back mid-round while its partner kept playing. Each of
 * those is a way two worlds part silently if the scheduler gets it wrong, which
 * is why they are written down rather than left to `two-devices.test.ts` to
 * happen to provoke.
 */

interface Packet {
  to: PlayerId;
  message: ServerMessage;
}

/**
 * Two schedulers and the packets between them, in a list the test moves by
 * hand. Nothing lands until it says so, and what is in the air can be taken out
 * of it — which is the whole of what a lost frame is.
 */
class Link {
  private air: Packet[] = [];
  readonly p1: Lockstep;
  readonly p2: Lockstep;

  constructor(delayTicks: number) {
    this.p1 = new Lockstep({ player: 1, delayTicks, send: (m) => this.post(1, m) });
    this.p2 = new Lockstep({ player: 2, delayTicks, send: (m) => this.post(2, m) });
  }

  private post(from: PlayerId, message: ClientMessage): void {
    const to: PlayerId = from === 1 ? 2 : 1;
    if (message.t === "input") {
      this.air.push({
        to,
        message: { t: "input", player: from, tick: message.tick, commands: message.commands },
      });
    } else if (message.t === "confirm") {
      this.air.push({ to, message: { t: "confirm", player: from, tick: message.tick } });
    }
  }

  /** Everything in the air lands, in the order it was sent. */
  flush(): void {
    this.deliver(this.air.splice(0, this.air.length));
  }

  /**
   * Take packets out of the air and hand them to the test — a frame the link
   * lost. Give them back with `resend`.
   */
  hold(match: (packet: Packet) => boolean): Packet[] {
    const held = this.air.filter(match);
    this.air = this.air.filter((p) => !match(p));
    return held;
  }

  resend(held: Packet[]): void {
    this.deliver(held);
  }

  private deliver(packets: Packet[]): void {
    for (const p of packets) (p.to === 1 ? this.p1 : this.p2).receive(p.message);
  }
}

const FIRE: Command = { kind: "fire", color: "red" };
const GUARD: Command = { kind: "guard" };

describe("a scheduler on a link that is not working", () => {
  it("never changes a tick it has already simulated, however late the input arrives", () => {
    const link = new Link(2);
    // Seat 2 presses on tick 3, so the command belongs to tick 5 on both
    // devices. Its frame is lost and the `confirm` sent a tick later is not.
    link.p2.press(2, FIRE, 3);
    link.p2.pump(3);
    const lost = link.hold((p) => p.message.t === "input");
    link.flush();
    link.p2.pump(4);
    link.flush();

    // Seat 1 is now allowed to simulate tick 5 and does, with nothing on it.
    expect(link.p1.ready(5)).toBe(true);
    expect(link.p1.commandsFor(5)).toEqual([]);

    // And here is the frame, a tick late. Filing it now would put a command on
    // a tick this device has already run — two worlds, and neither of them able
    // to say so. It is refused and counted instead, and `link-run.ts` reads
    // that count as a desync on the spot rather than waiting four beats for the
    // fingerprints to disagree.
    link.resend(lost);
    expect(link.p1.brokenPromises).toBe(1);
    expect(link.p1.commandsFor(5)).toEqual([]);
  });

  it("plays a frame that was lost and sent again on its own tick, late rather than wrong", () => {
    const link = new Link(6);
    link.p2.press(2, FIRE, 0);

    // Everything seat 2 says is in the air and stays there, while seat 1's own
    // promises go through. That is the whole of a lost frame on a socket: a
    // stream does not deliver past the segment it is missing, so the frames
    // sent after the lost one wait with it rather than overtaking it — and the
    // `confirm` that would make this device refuse the re-send is one of the
    // frames waiting behind it.
    const lost: Packet[] = [];
    for (let tick = 0; tick <= 5; tick++) {
      // Seat 1's head does not move: it has heard nothing, so it may simulate
      // nothing. Seat 2's does, because seat 1's promises are arriving.
      link.p1.pump(0);
      link.p2.pump(tick);
      lost.push(...link.hold((p) => p.to === 1));
      link.flush();
    }
    expect(link.p1.ready(0)).toBe(false);
    expect(link.p1.stalledTicks).toBeGreaterThan(0);

    link.resend(lost);
    // The press is on the tick it was made for, not on the tick it turned up.
    expect(link.p1.ready(6)).toBe(true);
    expect(link.p1.commandsFor(6)).toEqual([{ tick: 6, player: 2, command: FIRE }]);
    expect(link.p1.brokenPromises).toBe(0);
  });

  it("does not play this device's own word back when the relay hands it over", () => {
    const link = new Link(2);
    link.p1.press(1, FIRE, 0);
    // A relay that echoed to the whole room rather than to the other seat: the
    // same input, attributed to the seat this device is sitting in. Applying it
    // would fire twice here and once there.
    link.p1.receive({ t: "input", player: 1, tick: 2, commands: [FIRE] });
    expect(link.p1.commandsFor(2)).toEqual([{ tick: 2, player: 1, command: FIRE }]);
    // Nor is such a frame a promise: this device's own horizon says nothing
    // about what the peer has scheduled.
    link.p1.receive({ t: "confirm", player: 1, tick: 40 });
    expect(link.p1.ready(0)).toBe(false);
    expect(link.p1.brokenPromises).toBe(0);
  });

  it("keeps a seat's two presses on one tick in the order that seat made them", () => {
    const link = new Link(2);
    // Two thumbs on one tick, and the wrong order is a desync no fingerprint
    // can be traced back to a press: both devices have both commands.
    link.p2.press(2, GUARD, 3);
    link.p2.press(2, FIRE, 3);
    link.p1.pump(3);
    link.p2.pump(3);
    link.flush();

    const order = (l: Lockstep): Command[] => l.commandsFor(5).map((c) => c.command);
    expect(order(link.p1)).toEqual([GUARD, FIRE]);
    expect(order(link.p2)).toEqual([GUARD, FIRE]);
  });

  it("cannot be brought back into step by a peer still playing the run it left", () => {
    // The phone that dropped comes back and builds a fresh scheduler on a
    // world back at tick 0; its partner never left and is ten seconds in. This
    // is what `emptiedRoom` in apps/server/src/start-gate.ts exists to prevent,
    // and the reason it has to be prevented above the scheduler rather than
    // inside it: there is no resynchronisation in delayed lockstep, so a run
    // one side has restarted is not a run the two can meet in again.
    const delay = 12;
    const ahead = 60 * AHEAD_LIMIT_SECONDS;
    const sent: ClientMessage[] = [];
    const staying = new Lockstep({ player: 2, delayTicks: delay, send: (m) => sent.push(m) });
    staying.receive({ t: "confirm", player: 1, tick: ahead + delay - 1 });
    staying.pump(ahead);
    const returning = new Lockstep({ player: 1, delayTicks: delay, send: () => {} });
    returning.pump(0);

    // A promise ten seconds past anything this run could reach is not a peer on
    // a long link; it is a peer in a different run, and it is refused.
    for (const m of sent) {
      if (m.t === "confirm") returning.receive({ t: "confirm", player: 2, tick: m.tick });
    }
    expect(returning.brokenPromises).toBeGreaterThan(0);
    expect(returning.ready(0)).toBe(false);

    // And what the returning device promises is behind where its partner
    // already is, so that one waits too. Both of them, for ever.
    for (let frame = 0; frame < 120; frame++) {
      staying.receive({ t: "confirm", player: 1, tick: delay - 1 });
      staying.pump(ahead);
      returning.pump(0);
    }
    expect(returning.ready(0)).toBe(false);
    expect(staying.ready(ahead + delay)).toBe(false);
  });

  it("comes back into step when both sides build a scheduler on the same new beat zero", () => {
    // The room's answer to the case above: beat zero is thrown away, the pair
    // presses again, and both devices start from nothing — which they can,
    // because a scheduler holds no history of the run before it.
    const link = new Link(12);
    link.p1.pump(0);
    link.p2.pump(0);
    link.flush();
    expect(link.p1.ready(0)).toBe(true);
    expect(link.p2.ready(0)).toBe(true);
    expect(link.p1.brokenPromises).toBe(0);
    expect(link.p2.brokenPromises).toBe(0);
  });
});
