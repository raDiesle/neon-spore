import type { LinkState, LinkStatus, PlayerId } from "@neon-spore/net";
import type { RoomClock } from "./link-clock.js";
import type { Run } from "./link-run.js";
import type { RoomSocket } from "./link-socket.js";

/**
 * What the screen is told about the link, gathered in one place.
 *
 * `link.ts` calls itself **the room** — a seat, a clock, a countdown, "and the
 * state a player reads in the corner of the screen". That last clause is this
 * file. It is the only part of the room nothing else in the room depends on:
 * every field here is read out of something that already holds it, and not one
 * of them is read back. Splitting it off is what keeps the room under the line
 * limit while the screen learns to say more.
 *
 * Every number is a fact about the link and never about the game. The
 * indicator's vocabulary belongs to the network layer and to nothing else, so
 * that a creature which blinds a player can never produce one of these states
 * — see `packages/net/src/status.ts`.
 */
export interface ReportParts {
  state: LinkState;
  room: string;
  player: 0 | 1 | 2;
  /** The room's own head count — see `LinkStatus.peers`. */
  peers: number;
  /** The seats the room says have pressed START. */
  readySeats: readonly PlayerId[];
  clock: RoomClock;
  run: Run;
  /** Null before a room is joined, and after one is left. */
  socket: RoomSocket | null;
  /** Beat zero, on the room's clock. 0 before the room has stamped one. */
  startMs: number;
}

export function report(p: ReportParts): LinkStatus {
  return {
    state: p.state,
    room: p.room,
    player: p.player,
    peers: p.peers,
    rttMs: p.clock.sampleCount > 0 ? Math.round(p.clock.rttMs) : -1,
    slack: p.run.slack,
    countdownMs: p.run.started || p.startMs === 0 ? 0 : p.clock.countdownMs(p.startMs),
    readyHere: p.player !== 0 && p.readySeats.includes(p.player),
    readyThere: p.readySeats.some((seat) => seat !== p.player),
    delayMs: p.run.delayMs,
    stalledMs: p.run.stalledMs,
    awayMs: p.socket?.awayMs ?? 0,
    desyncTick: p.run.desyncTick,
    brokenPromises: p.run.brokenPromises,
  };
}
