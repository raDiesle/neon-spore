import type { ClientMessage, ServerMessage } from "@neon-spore/net";
import type { SimConfig, TimedCommand, World } from "@neon-spore/sim";
import type { CommandSource } from "./relay.js";

/**
 * The run's two shapes — what it is built from and what it answers — kept
 * apart from `link-run.ts` the way `link-types.ts` is from `link.ts`, so the
 * file that is the scheduler's life stays about that.
 */

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
  /** Throw the run away, and all it held. A new beat zero, or a socket that went. */
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
  /**
   * True when the run is no longer trustworthy — parted fingerprints, or a
   * broken promise. Held for `begin` before beat zero; `link.ts` says what.
   */
  receive(message: ServerMessage): boolean;
  readonly slack: number;
  readonly delayMs: number;
  /**
   * The same lay in ticks rather than milliseconds, and 0 while there is no
   * scheduler. One screen needs it as a count of ticks rather than as a
   * duration: THE PULSE's chart is drawn this far ahead of the simulation, so
   * a press on the line lands on the note (`ViewState.leadTicks`).
   */
  readonly delayTicks: number;
  readonly desyncTick: number | null;
  /**
   * Inputs the peer filed for a tick it had already promised to leave alone,
   * or so far ahead of this run that it is not in it. Non-zero means the two
   * worlds have already parted, whatever the fingerprints say yet.
   */
  readonly brokenPromises: number;
}
