import type { Difficulty, LinkStatus, PlayerId, RunMark } from "@neon-spore/net";
import type { SimConfig, TimedCommand, World } from "@neon-spore/sim";
import type { RoomSocket, RoomSocketHandlers } from "./link-socket.js";
import type { CommandSource } from "./relay.js";

/**
 * What a link is asked for, and what it offers back.
 *
 * Split out of `link.ts` when that file reached its 250-line ceiling for the
 * second time, along the seam `tools/frames/spec.ts` already uses next door:
 * everything here is a *shape* and nothing here does anything. `link.ts`
 * re-exports both names, so a caller that reached for a `Link` through it did
 * not move.
 */

export interface LinkOptions {
  cfg: SimConfig;
  world: World;
  buffer: CommandSource;
  /**
   * Beat zero. The run starts over here, on both devices, at the same moment —
   * and on the same **wave**, which is the second argument and is the room's
   * decision rather than either device's.
   *
   * It is the furthest the *pair* reached, as the room has been keeping it
   * (`RunMark`, handed back on `welcome`): a phone that dropped out early holds
   * a lower figure of its own, and two devices each starting from what they
   * remember is two people playing two different games. 0 for a room that has
   * never been played in, which is the first wave.
   */
  onStart: (player: PlayerId, wave: number, level: Difficulty) => void;
  onStatus: (status: LinkStatus) => void;
  /**
   * The clock this link measures itself against. `performance.now()` by
   * default — monotonic, unlike `Date.now()`, which an NTP step or a phone's
   * owner nudging the time can move mid-countdown, taking beat zero with it on
   * that device alone. Everything measured against it is in `link-clock.ts`.
   */
  now?: () => number;
  /** How the room is reached. The real socket, except where a test hands over its own. */
  openSocket?: (room: string, handlers: RoomSocketHandlers) => RoomSocket;
}

export interface Link {
  /** The difficulty the pair has chosen, up to the room (`link.ts`). */
  setLevel: (level: Difficulty) => void;
  /**
   * The seat this phone would hold. Only the host's pick moves anybody — the
   * room swaps both seats and re-welcomes them — and only before beat zero; any
   * other is ignored where it lands (`apps/server/src/room-seat.ts`).
   */
  pickSeat: (seat: PlayerId) => void;
  /**
   * Join a room. Leaves any room already held.
   *
   * **No tempo goes in with it.** A room keeps its own and hands it to both
   * phones; the only device that may set one is the host, on the room screen,
   * before beat zero (`join-room.ts` `mayShape`, `apps/server/src/room-acts.ts`).
   * A join used to be able to carry a wish — the tempo a pair had settled on
   * this device behind a gear — and that went on 15 September 2026 with the
   * gear: a game that already exists does not change its difficulty.
   */
  join(room: string): void;
  leave(): void;
  /**
   * "I am ready." Beat zero is stamped by the room once **both** seats have
   * said it, so this is a press and not a start. Harmless at any other moment:
   * the room refuses one before the second phone is there and after a run is
   * already stamped.
   */
  ready(): void;
  /**
   * Tell the room how far this device has got, now and then. It stores the
   * better of the two seats' figures and hands it back on the next `welcome`,
   * without ever reading it into game state — see `apps/server/src/tally.ts`.
   */
  tally(mark: RunMark): void;
  /** Whether the simulation may advance one tick. Always true when playing solo. */
  mayTick(): boolean;
  /** The commands for the current tick. Consumes the local input buffer. */
  drain(): TimedCommand[];
  /** Called once per tick, after `step`. Exchanges fingerprints on the agreed ticks. */
  checkpoint(): void;
  /** Called once per frame, whether or not a tick ran. */
  frame(dtMs: number): void;
  status(): LinkStatus;
}
