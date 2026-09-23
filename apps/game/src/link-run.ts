import {
  AHEAD_LIMIT_SECONDS,
  HashLedger,
  InputDelay,
  Lockstep,
  type PlayerId,
  type ServerMessage,
} from "@neon-spore/net";
import { hashWorld, ticksPerBeat } from "@neon-spore/sim";
import type { Run, RunOptions } from "./link-run-types.js";
import { ticksAhead } from "./tick-rate.js";

export type { Run, RunOptions } from "./link-run-types.js";

/** Beats between fingerprint exchanges. Often enough to catch a split within a breath. */
const HASH_EVERY_BEATS = 4;

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

  let lockstep: Lockstep | null = null;
  let ledger = new HashLedger();
  let started = false;
  let stalledMs = 0;
  /**
   * What the peer said before this device reached beat zero — its first
   * promise, since the clocks agree to a few milliseconds and not to none.
   * Dropped, it cost this device a round trip standing on the field: the peer
   * promises again only once it has ticked, and it ticks on this one's word.
   */
  let early: ServerMessage[] = [];
  /**
   * Outlives any one run on purpose. What the link costs is a fact about the
   * two phones, not about the run they happen to be on, and a rejoin should
   * not go back to the configured floor and re-learn it.
   */
  const delay = new InputDelay({ tickHz: o.cfg.tickHz, floorTicks: o.cfg.inputDelayTicks });

  const take = (message: ServerMessage): boolean => {
    lockstep?.receive(message);
    // A dropped input is a parting the fingerprints have not caught up with:
    // the two worlds already differ, and `HashLedger` will not say so for up
    // to four beats — and when it does, it names a tick that says nothing
    // about the cause. So the promise is the report, and it is immediate.
    if (lockstep && lockstep.brokenPromises > 0) return true;
    return message.t === "hash" && ledger.observe(message.tick, message.hash) === "mismatch";
  };

  return {
    begin(player) {
      started = true;
      const held = early;
      early = [];
      // Seat 0 is a device the room has not answered yet. It is past beat zero
      // like the other one, but it has nothing to schedule commands as.
      if (player === 0) return;
      // The delay starts where the link already says it should rather than at
      // the configured floor: by beat zero the clock has been measured for
      // seconds, and opening a run at 100 ms on a link that needs 200 would
      // stall the first bar of it before a frame could correct anything.
      lockstep = new Lockstep({
        player: player as PlayerId,
        delayTicks: ticksAhead(delay, o.world),
        aheadLimitTicks: o.cfg.tickHz * AHEAD_LIMIT_SECONDS,
        send: o.send,
      });
      // In order. A wrong one is counted, and the next `receive` reports it.
      for (const message of held) take(message);
    },

    end() {
      started = false;
      stalledMs = 0;
      lockstep = null;
      ledger = new HashLedger();
      // An old run's ticks, fed to the next scheduler, are broken promises.
      early = [];
    },

    get started() {
      return started;
    },

    observeLink(rttMs, dtMs) {
      delay.observe(rttMs);
      delay.settle(dtMs);
      // **The tick count is recomputed every frame, not only when the link
      // moves.** What `InputDelay` holds is milliseconds, and how many ticks
      // that is changes the moment a boss opens one of THE SLOW's windows —
      // with nothing about the link having changed at all — and again for
      // every tick the window has left to run (`tick-rate.ts`).
      lockstep?.setDelayTicks(ticksAhead(delay, o.world));
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
      if (!started) {
        early.push(message);
        return false;
      }
      return take(message);
    },

    get stalledMs() {
      return stalledMs;
    },

    get slack() {
      return lockstep?.slack ?? 0;
    },

    get delayMs() {
      // Read off the delay itself rather than multiplied back out of the
      // scheduler's tick count: inside a slow window those ticks are longer,
      // and this is the number in the hand.
      return lockstep ? Math.round(delay.ms) : 0;
    },

    get delayTicks() {
      return lockstep?.delay ?? 0;
    },

    get desyncTick() {
      return ledger.desyncTick;
    },

    get brokenPromises() {
      return lockstep?.brokenPromises ?? 0;
    },
  };
}
