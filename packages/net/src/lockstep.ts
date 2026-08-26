import type { Command, TimedCommand } from "@neon-spore/sim";
import type { ClientMessage, PlayerId, ServerMessage } from "./protocol.js";
import { otherPlayer } from "./protocol.js";

export interface LockstepOptions {
  player: PlayerId;
  /**
   * Ticks between the screen being touched and the tick the command takes
   * effect on — the "delayed" in delayed lockstep. It has to be longer than
   * one trip to the peer, or every press arrives after the tick it was meant
   * for and the run stalls instead of playing.
   */
  delayTicks: number;
  send: (message: ClientMessage) => void;
}

/**
 * Delayed lockstep over a relay that never simulates anything.
 *
 * The whole model rests on one promise each device makes to the other: *I have
 * scheduled nothing before tick N.* A device may simulate tick T the moment
 * both promises reach T, and not a tick sooner. Its own promise is free — a
 * press is always scheduled `delayTicks` into the future, so by the time tick T
 * comes up for simulation nothing can still be added to it. The peer's promise
 * is the one that arrives over the wire, as a `confirm`.
 *
 * The timestamp is taken when the screen is touched, never when the packet
 * lands (docs/architecture.md, "Network"). That is what `press` means by
 * `head`: the tick the toucher was on, not the tick the peer happens to reach.
 */
export class Lockstep {
  readonly player: PlayerId;
  readonly peer: PlayerId;
  private readonly delayTicks: number;
  private readonly send: (m: ClientMessage) => void;

  /** Scheduled commands, by tick, for each seat. Cleared as ticks are consumed. */
  private readonly mine = new Map<number, Command[]>();
  private readonly theirs = new Map<number, Command[]>();
  /** Pressed but not yet sent, by the tick they were scheduled for. */
  private readonly outbox = new Map<number, Command[]>();

  /** The peer has promised nothing before this tick. -1 before the first word from it. */
  private peerHorizon = -1;
  private sentHorizon = -1;
  private head = 0;
  /**
   * Consecutive calls to `pump` that found the peer's promise short of `head`.
   * The network indicator reads this: a peer that has gone quiet is a different
   * picture from a socket that has closed (open question 10).
   */
  private stalled = 0;
  /** Frames the peer broke its own promise. Non-zero means the run is not trustworthy. */
  private violations = 0;

  constructor(options: LockstepOptions) {
    this.player = options.player;
    this.peer = otherPlayer(options.player);
    this.delayTicks = Math.max(1, Math.round(options.delayTicks));
    this.send = options.send;
  }

  /** The tick a press made now will take effect on, here and on the peer alike. */
  scheduleFor(head: number): number {
    return head + this.delayTicks;
  }

  /**
   * A local press. `head` is the tick the simulation is on at the moment of the
   * touch — not the tick it reaches by the time the peer hears about it.
   * Commands from the seat this device is not sitting in are dropped: the
   * keyboard can send both halves at a desk, and two of those arriving on one
   * device would be applied twice and relayed never.
   */
  press(player: PlayerId, command: Command, head: number): boolean {
    if (player !== this.player) return false;
    const tick = this.scheduleFor(head);
    append(this.mine, tick, command);
    append(this.outbox, tick, command);
    return true;
  }

  /**
   * Called once per attempted tick, whether or not the tick was simulated —
   * a stalled device still has to keep talking, or the two wait for each other
   * for good.
   */
  pump(head: number): void {
    this.head = head;
    for (const tick of [...this.outbox.keys()].sort((a, b) => a - b)) {
      const commands = this.outbox.get(tick);
      if (commands) this.send({ t: "input", tick, commands });
    }
    this.outbox.clear();

    // Everything through here is settled: a press arriving now lands later.
    const horizon = head + this.delayTicks - 1;
    if (horizon > this.sentHorizon) {
      this.sentHorizon = horizon;
      this.send({ t: "confirm", tick: horizon });
    }
    this.stalled = this.peerHorizon >= head ? 0 : this.stalled + 1;
  }

  /** Whether tick `tick` may be simulated: the peer has promised through it. */
  ready(tick: number): boolean {
    return this.peerHorizon >= tick;
  }

  /**
   * Everything scheduled for `tick`, in an order both devices agree on: seat 1
   * before seat 2, and within a seat the order that seat pressed them. Consumes
   * the tick — call it once, immediately before `step`.
   */
  commandsFor(tick: number): TimedCommand[] {
    const out: TimedCommand[] = [];
    const first = this.player === 1 ? this.mine : this.theirs;
    const second = this.player === 1 ? this.theirs : this.mine;
    for (const c of first.get(tick) ?? []) out.push({ tick, player: 1, command: c });
    for (const c of second.get(tick) ?? []) out.push({ tick, player: 2, command: c });
    this.mine.delete(tick);
    this.theirs.delete(tick);
    return out;
  }

  receive(message: ServerMessage): void {
    if (message.t === "input") {
      if (message.player !== this.peer) return;
      // The peer's scheduled ticks never decrease, so an input at or before a
      // tick it already promised to leave alone is a broken promise, not a
      // late packet. Applying it would desync the two worlds silently.
      if (message.tick <= this.peerHorizon) {
        this.violations++;
        return;
      }
      for (const c of message.commands) append(this.theirs, message.tick, c);
      // An input for tick K is itself a promise about everything before K.
      this.peerHorizon = Math.max(this.peerHorizon, message.tick - 1);
      return;
    }
    if (message.t === "confirm" && message.player === this.peer) {
      this.peerHorizon = Math.max(this.peerHorizon, message.tick);
    }
  }

  /** How far ahead of the simulation the peer's promise reaches, in ticks. */
  get slack(): number {
    return this.peerHorizon - this.head;
  }

  get stalledTicks(): number {
    return this.stalled;
  }

  get brokenPromises(): number {
    return this.violations;
  }
}

function append(map: Map<number, Command[]>, tick: number, command: Command): void {
  const list = map.get(tick);
  if (list) list.push(command);
  else map.set(tick, [command]);
}
