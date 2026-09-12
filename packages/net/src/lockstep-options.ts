import type { ClientMessage, PlayerId } from "./protocol.js";

/**
 * What a `Lockstep` is built with, and the one bound it enforces on the peer.
 *
 * Cut out of `lockstep.ts` when that file reached the 250-line limit; the
 * scheduler itself is there, and this is the contract a caller holds.
 */
export interface LockstepOptions {
  player: PlayerId;
  /**
   * Ticks between the screen being touched and the tick the command takes
   * effect on — the "delayed" in delayed lockstep. It has to be longer than
   * one trip to the peer, or every press arrives after the tick it was meant
   * for and the run stalls instead of playing.
   *
   * The starting value only. `setDelayTicks` moves it as the link is measured,
   * and `InputDelay` decides where to move it to.
   */
  delayTicks: number;
  /**
   * How far past the simulation a peer's word is allowed to reach, in ticks.
   * Everything beyond it is refused — see `AHEAD_LIMIT_TICKS`. Defaults to ten
   * seconds at 60 Hz; the caller passes its own tick rate where it has one.
   */
  aheadLimitTicks?: number;
  send: (message: ClientMessage) => void;
}

/**
 * Ten seconds at 60 Hz, which is the default because that is the tick rate the
 * game runs at and a caller that knows better says so.
 *
 * The bound exists because `theirs` is a map the peer writes into. `receive`
 * files commands under whatever tick they name, up to 2**31, and `commandsFor`
 * frees only the tick it consumes — so commands filed under a tick the run
 * never reaches are never freed. One `input` at tick 2 000 000 000 is a leak
 * the run cannot drain, and a room code is four characters from a 25-letter
 * alphabet, so an uninvited seat is not exotic. A peer more than this far ahead
 * of the simulation is not a peer with a good connection; it is not playing
 * this run.
 */
export const AHEAD_LIMIT_SECONDS = 10;
export const AHEAD_LIMIT_TICKS = 60 * AHEAD_LIMIT_SECONDS;
