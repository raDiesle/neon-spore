import type { ClientMessage, PlayerId, ServerMessage } from "../src/index.js";

/**
 * The relay, as a test holds it.
 *
 * `apps/server/src/room.ts` does one thing with a word from a seat: stamps the
 * seat on it and hands it to the other one — `input`, `confirm` and `hash`, and
 * nothing else crosses between the two devices. This is that, with the trip
 * spent in the air put in the test's hands, so "the peer is three ticks behind"
 * is a case that can be written down rather than one that has to be provoked.
 *
 * **Order is kept, and that is not decoration.** A `confirm` overtaking the
 * `input` it was sent after is the peer breaking its own promise, and the
 * scheduler is right to refuse the input; a WebSocket does not deliver past a
 * frame it is missing, so a test that let one overtake would be proving
 * something about a transport this game does not have.
 *
 * Shared by the three files that drive two worlds at once — the scheduler's
 * own run in `two-devices.test.ts`, the wave in `two-devices-wave.test.ts` and
 * the opening in `two-devices-opening.test.ts`. The
 * wires in `lockstep.test.ts` and `scheduler-faults.test.ts` are deliberately
 * not this one: theirs move packets by hand, one at a time, because what they
 * are about is a packet arriving at a moment of the test's choosing.
 */
export class Relay {
  private air: { due: number; to: PlayerId; message: ServerMessage }[] = [];
  private now = 0;

  /** Ticks a packet spends in the air. Shorter than the input delay, or nothing works. */
  constructor(readonly latency: number) {}

  post(from: PlayerId, message: ClientMessage): void {
    const to: PlayerId = from === 1 ? 2 : 1;
    const due = this.now + this.latency;
    if (message.t === "input") {
      this.air.push({
        due,
        to,
        message: { t: "input", player: from, tick: message.tick, commands: message.commands },
      });
    } else if (message.t === "confirm") {
      this.air.push({ due, to, message: { t: "confirm", player: from, tick: message.tick } });
    } else if (message.t === "hash") {
      this.air.push({
        due,
        to,
        message: { t: "hash", player: from, tick: message.tick, hash: message.hash },
      });
    }
  }

  /** Time passes and whatever is due lands — in the order it was sent. */
  advance(deliver: (to: PlayerId, message: ServerMessage) => void): void {
    this.now++;
    const landed = this.air.filter((p) => p.due <= this.now);
    this.air = this.air.filter((p) => p.due > this.now);
    for (const packet of landed) deliver(packet.to, packet.message);
  }
}
