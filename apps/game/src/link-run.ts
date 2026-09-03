import {
  AHEAD_LIMIT_SECONDS,
  type ClientMessage,
  HashLedger,
  InputDelay,
  Lockstep,
  type PlayerId,
  type ServerMessage,
} from "@neon-spore/net";
import {
  hashWorld,
  type SimConfig,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { CommandSource } from "./relay.js";

/** Beats between fingerprint exchanges. Often enough to catch a split within a breath. */
const HASH_EVERY_BEATS = 4;

export interface RunOptions {
  cfg: SimConfig;
  world: World;
  buffer: CommandSource;
  send: (message: ClientMessage) => void;
}

export interface Run {
  /**
   * Beat zero. The caller has already put the world's clock back to zero; this
   * builds the scheduler on top of that and not a moment before.
   */
  begin(player: 0 | 1 | 2): void;
  /** Throw the run away. A new beat zero, or a socket that went and took it. */
  end(): void;
  /** Whether beat zero has passed. Not the same as having a scheduler. */
  readonly started: boolean;
  /**
   * The measured round trip, and the time since the last frame. What comes of
   * it is the lay between a touch and the tick it lands on — see
   * `packages/net/src/delay.ts`. Pass -1 for a link not measured yet.
   */
  observeLink(rttMs: number, dtMs: number): void;
  /** Once a frame, whether or not a tick ran. True when the peer has gone quiet. */
  pump(dtMs: number): boolean;
  /**
   * How long the peer has been quiet, in milliseconds, and 0 while it is not.
   * A stall is the one fault a player can answer — wait it out, or leave the
   * room and pick the game up later — and neither answer can be offered
   * without a number to make it on.
   */
  readonly stalledMs: number;
  mayTick(): boolean;
  drain(): TimedCommand[];
  /** After `step`. True when the two fingerprints have parted. */
  checkpoint(): boolean;
  /** True when the run is no longer trustworthy — parted fingerprints, or a broken promise. */
  receive(message: ServerMessage): boolean;
  readonly slack: number;
  readonly delayMs: number;
  readonly desyncTick: number | null;
  /**
   * Inputs the peer filed for a tick it had already promised to leave alone,
   * or so far ahead of this run that it is not in it. Non-zero means the two
   * worlds have already parted, whatever the fingerprints say yet.
   */
  readonly brokenPromises: number;
}

/**
 * The run: the scheduler, the fingerprints and the ticks.
 *
 * Split from `link.ts` along the seam the two halves already had. That file is
 * about **the room** — a socket, a seat, a clock and a countdown, all of which
 * exist before a single tick does and outlive any one run. This is about **the
 * run** the room eventually starts, and there can be several of those on one
 * socket: every time a dropped phone comes back, the room stamps a fresh beat
 * zero and this is thrown away and built again while the socket above it never
 * moves.
 *
 * Nothing here reads a clock or holds a `WebSocket`. Both are the caller's, and
 * that is what keeps this side testable and that side small.
 */
export function createRun(o: RunOptions): Run {
  const tpb = ticksPerBeat(o.cfg);
  const hashEvery = tpb * HASH_EVERY_BEATS;
  const msPerTick = 1000 / o.cfg.tickHz;

  let lockstep: Lockstep | null = null;
  let ledger = new HashLedger();
  let started = false;
  let stalledMs = 0;
  /**
   * Outlives any one run on purpose. What the link costs is a fact about the
   * two phones, not about the run they happen to be on, and a rejoin should
   * not go back to the configured floor and re-learn it.
   */
  const delay = new InputDelay({ tickHz: o.cfg.tickHz, floorTicks: o.cfg.inputDelayTicks });

  return {
    begin(player) {
      started = true;
      // Seat 0 is a device the room has not answered yet. It is past beat zero
      // like the other one, but it has nothing to schedule commands as.
      if (player === 0) return;
      // The delay starts where the link already says it should rather than at
      // the configured floor: by beat zero the clock has been measured for
      // seconds, and opening a run at 100 ms on a link that needs 200 would
      // stall the first bar of it before a frame could correct anything.
      lockstep = new Lockstep({
        player: player as PlayerId,
        delayTicks: delay.ticks,
        aheadLimitTicks: o.cfg.tickHz * AHEAD_LIMIT_SECONDS,
        send: o.send,
      });
    },

    end() {
      started = false;
      stalledMs = 0;
      lockstep = null;
      ledger = new HashLedger();
    },

    get started() {
      return started;
    },

    observeLink(rttMs, dtMs) {
      delay.observe(rttMs);
      delay.settle(dtMs);
      lockstep?.setDelayTicks(delay.ticks);
    },

    pump(dtMs) {
      if (!lockstep || !started) return false;
      lockstep.pump(o.world.tick);
      const quiet = lockstep.stalledTicks > tpb;
      // Wall-clock, not `stalledTicks`: that counts calls to this, which is
      // once a frame, and a frame is not a tick — least of all during a stall,
      // when no tick runs at all.
      stalledMs = quiet ? stalledMs + dtMs : 0;
      return quiet;
    },

    mayTick() {
      if (!started || !lockstep) return false;
      return lockstep.ready(o.world.tick);
    },

    drain() {
      const pressed = o.buffer.drain(o.world.tick);
      if (!lockstep) return pressed;
      // The timestamp is the tick the screen was touched on, and the seat is
      // this device's. The keyboard can still send both halves at a desk; the
      // half this device does not hold is dropped rather than played twice.
      for (const p of pressed) lockstep.press(p.player, p.command, o.world.tick);
      // On the wire now, not at the end of the frame. A frame is up to sixteen
      // milliseconds and every press was paying them on top of the trip it
      // still had to make — a sixth of the whole delay budget, spent on
      // nothing.
      lockstep.flush();
      return lockstep.commandsFor(o.world.tick);
    },

    checkpoint() {
      if (!lockstep || !started) return false;
      const tick = o.world.tick;
      if (tick % hashEvery !== 0) return false;
      const hash = hashWorld(o.world);
      const parted = ledger.record(tick, hash) === "mismatch";
      o.send({ t: "hash", tick, hash });
      return parted;
    },

    receive(message) {
      lockstep?.receive(message);
      // A dropped input is a parting the fingerprints have not caught up with:
      // the two worlds already differ, and `HashLedger` will not say so for up
      // to four beats — and when it does, it names a tick that says nothing
      // about the cause. So the promise is the report, and it is immediate.
      if (lockstep && lockstep.brokenPromises > 0) return true;
      return message.t === "hash" && ledger.observe(message.tick, message.hash) === "mismatch";
    },

    get stalledMs() {
      return stalledMs;
    },

    get slack() {
      return lockstep?.slack ?? 0;
    },

    get delayMs() {
      return lockstep ? Math.round(lockstep.delay * msPerTick) : 0;
    },

    get desyncTick() {
      return ledger.desyncTick;
    },

    get brokenPromises() {
      return lockstep?.brokenPromises ?? 0;
    },
  };
}
