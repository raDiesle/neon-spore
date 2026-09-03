import type { ClientMessage, ServerMessage } from "@neon-spore/net";
import { openRelay, type Relay, type RelayHandlers } from "./relay.js";

/** Milliseconds before a socket that went away is reached for again. */
export const RECONNECT_MS = 900;
/**
 * How many times. A handset that locks its screen, goes through a tunnel or
 * hands over from wifi to the mobile network drops the socket and gets it back
 * within a second or two; one that has been away longer than this is a player
 * who has put the phone down, and telling them the truth beats reaching for a
 * room forever.
 */
export const RECONNECT_TRIES = 6;

export interface RoomSocketHandlers {
  message: (message: ServerMessage) => void;
  /** A socket is open. The first clock ping goes out from here. */
  opened: () => void;
  /**
   * Whether reaching for the room again makes any sense. The caller knows
   * things this does not — a room that refused on purpose is not coming back
   * however many times it is asked, and neither is one the player has left.
   */
  worthRetrying: () => boolean;
  /** No socket at the moment; another attempt is armed. */
  waiting: () => void;
  /** No socket, and none coming. */
  gone: () => void;
}

export interface RoomSocket {
  /** Dropped silently when there is no socket. Nothing here is worth queueing. */
  send(message: ClientMessage): void;
  close(): void;
  /** Time passing. Reopens the socket when a pending wait runs out. */
  frame(dtMs: number): void;
  /** Give the attempts back. A `welcome` means the room is answering again. */
  rearm(): void;
  /** Stop reaching for it, whatever is left. */
  surrender(): void;
  /** Whether a socket exists right now. */
  readonly present: boolean;
  /**
   * How long there has been no socket, in milliseconds, and 0 while there is
   * one. Counted here because this is where the absence is: the reconnection
   * is quiet by design, and this is the number that lets the screen stop being
   * quiet about it once it has gone on too long to be a tunnel.
   */
  readonly awayMs: number;
}

/**
 * A socket to a room that reaches for it again when it goes away.
 *
 * On a phone a dropped socket is the ordinary case and not the exceptional
 * one — a screen locks, a train enters a tunnel, wifi hands over to the mobile
 * network — so a few quiet attempts come before the player is told anything is
 * wrong. Reconnecting deliberately does *not* rebuild anything above it: the
 * clock offset measured before the drop is the same server's clock afterwards,
 * and re-acquiring it would spend two seconds inside the room's three-second
 * countdown.
 */
export function openRoomSocket(
  room: string,
  on: RoomSocketHandlers,
  /** How a socket is opened. The real one, except where a test hands over its own. */
  connect: (code: string, handlers: RelayHandlers) => Relay = openRelay,
): RoomSocket {
  let relay: Relay | null = null;
  let retryIn = 0;
  let triesLeft = RECONNECT_TRIES;
  let closed = false;
  let awayMs = 0;

  const open = (): void => {
    retryIn = 0;
    awayMs = 0;
    relay = connect(room, { message: on.message, opened: on.opened, dropped: drop });
  };

  const drop = (): void => {
    relay = null;
    if (closed) return;
    if (triesLeft <= 0 || !on.worthRetrying()) {
      on.gone();
      return;
    }
    triesLeft--;
    retryIn = RECONNECT_MS;
    on.waiting();
  };

  open();

  return {
    send(message) {
      relay?.send(message);
    },
    close() {
      closed = true;
      retryIn = 0;
      const old = relay;
      relay = null;
      old?.close();
    },
    frame(dtMs) {
      // Counted before the early return: a socket that has run out of attempts
      // has `retryIn` at 0 and is the most gone of all.
      if (!relay) awayMs += dtMs;
      if (retryIn <= 0 || closed) return;
      retryIn -= dtMs;
      if (retryIn <= 0) open();
    },
    rearm() {
      triesLeft = RECONNECT_TRIES;
    },
    surrender() {
      triesLeft = 0;
      retryIn = 0;
    },
    get present() {
      return relay !== null;
    },
    get awayMs() {
      return relay ? 0 : awayMs;
    },
  };
}
