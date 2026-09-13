import type { Difficulty, LinkState, LinkStatus, PlayerId, RunMark } from "@neon-spore/net";
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
/**
 * **What the room has told this device**, in one record.
 *
 * Four facts arrive on the room's own messages and are kept until it says
 * otherwise: who has pressed START, what the two of them are called, what they
 * got to last time, and the tempo they play at. They are one object rather than
 * four variables because they are one subject — the room's word — and because
 * `link.ts` passes them all to `report` on a line that had run out of room.
 *
 * A room that is left says none of it, which is `NOTHING_SAID`.
 */
export interface RoomSaid {
  /** The seats the room says have pressed START. */
  readySeats: readonly PlayerId[];
  /** What the two people are called, by seat. "" for a seat with no name. */
  names: readonly [string, string];
  /** What this pair got to last time, or null. */
  best: RunMark | null;
  /** The room's difficulty, or null before it has one (`sim/difficulty.ts`). */
  level: Difficulty | null;
}

export const NOTHING_SAID: RoomSaid = {
  readySeats: [],
  names: ["", ""],
  best: null,
  level: null,
};

export interface ReportParts {
  state: LinkState;
  room: string;
  player: 0 | 1 | 2;
  /** The room's own head count — see `LinkStatus.peers`. */
  peers: number;
  said: RoomSaid;
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
    readyHere: p.player !== 0 && p.said.readySeats.includes(p.player),
    readyThere: p.said.readySeats.some((seat) => seat !== p.player),
    names: p.said.names,
    best: p.said.best,
    level: p.said.level,
    delayMs: p.run.delayMs,
    delayTicks: p.run.delayTicks,
    stalledMs: p.run.stalledMs,
    awayMs: p.socket?.awayMs ?? 0,
    desyncTick: p.run.desyncTick,
    brokenPromises: p.run.brokenPromises,
  };
}
