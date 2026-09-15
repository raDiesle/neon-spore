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
   * Join a room. Leaves any room already held.
   *
   * `wanted` is a tempo to ask the room for once it answers — the level a pair
   * settled on this device, which nothing else could carry there: a room keeps
   * its own and hands it to both phones, so a wish written while off the wire
   * has exactly one moment to be said, and this is it (`link.ts`).
   */
  join(room: string, wanted?: Difficulty): void;
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
