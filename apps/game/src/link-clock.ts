import { ClockSync, type ServerMessage } from "@neon-spore/net";

/**
 * The room's wall clock: the only part of the game that asks what time it is.
 *
 * `link.ts` calls itself the room — "a seat, **a clock**, a countdown, and the
 * state a player reads in the corner of the screen" — and this is that clause,
 * lifted out whole. Everything here measures against one injected `now`, so
 * the file has no wall clock of its own to disagree with, and a test can run
 * it by hand.
 *
 * Why the countdown lives with the samples rather than beside beat zero: the
 * room stamps beat zero on *its* clock, and the only thing that can turn that
 * into a moment on this device is the offset `ClockSync` measured. Keeping the
 * two apart would mean spelling `clock.toLocal(startMs)` out at every place
 * that wants to know whether the count has run down — a rule re-derived in
 * four spots rather than called in one.
 */

/** Milliseconds between clock samples. Seven of them fill the median window in five seconds. */
export const PING_EVERY_MS = 700;

export interface RoomClock {
  /** Whether enough samples have landed to place beat zero at all. */
  readonly ready: boolean;
  /** The round trip, in milliseconds. Meaningless until `sampleCount` is above zero. */
  readonly rttMs: number;
  readonly sampleCount: number;
  /**
   * A `pong` came back. `started` says whether the run is under way: before it
   * is, a fresh offset is taken whole rather than eased in, because a phone
   * back from a locked screen has an offset stale by however long it slept and
   * four milliseconds a second would still be walking it off long after beat
   * zero.
   */
  add: (message: Extract<ServerMessage, { t: "pong" }>, started: boolean) => void;
  /** Ease the offset towards its measured value. Once per frame. */
  settle: (dtMs: number) => void;
  /**
   * Count the frame down and say whether a ping is due now, restarting the
   * interval when it is. The caller sends it, because the socket is the
   * caller's. A clock nobody has pinged yet says yes on the first ask, which
   * costs nothing: `link.ts` does not reach this until a socket is present,
   * and by then `pingSent` has started the interval.
   */
  framePingDue: (dtMs: number) => boolean;
  /** Milliseconds left of the countdown to the room's beat zero, never below 0. */
  countdownMs: (startMs: number) => number;
  /** Whether this device has reached the room's beat zero. */
  reached: (startMs: number) => boolean;
  /** Start again with nothing measured, which is what leaving a room means. */
  reset: () => void;
  /**
   * A ping was sent outside `framePingDue` — start the interval from here.
   *
   * The socket opening is the one moment worth a ping out of turn: waiting for
   * the first `framePingDue` would put the three samples 2100 ms away, which
   * eats into the 3000 ms countdown and can miss it outright. So the caller
   * sends one the moment the socket opens and says so here, rather than having
   * two places that both think they own the interval.
   */
  pingSent: () => void;
}

export function createRoomClock(now: () => number): RoomClock {
  let sync = new ClockSync();
  let pingTimer = 0;

  return {
    get ready(): boolean {
      return sync.ready;
    },
    get rttMs(): number {
      return sync.rttMs;
    },
    get sampleCount(): number {
      return sync.sampleCount;
    },
    add: (message, started) => {
      sync.add({ c1: message.c1, s1: message.s1, s2: message.s2, c2: now() });
      if (!started) sync.snap();
    },
    settle: (dtMs) => sync.settle(dtMs),
    framePingDue: (dtMs) => {
      pingTimer -= dtMs;
      if (pingTimer > 0) return false;
      pingTimer = PING_EVERY_MS;
      return true;
    },
    countdownMs: (startMs) => Math.max(0, sync.toLocal(startMs) - now()),
    reached: (startMs) => now() >= sync.toLocal(startMs),
    reset: () => {
      sync = new ClockSync();
    },
    pingSent: () => {
      pingTimer = PING_EVERY_MS;
    },
  };
}
