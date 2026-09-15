import type { ClientMessage, ServerMessage } from "@neon-spore/net";
import { openRelay, type Relay, type RelayHandlers } from "./relay.js";

/** Milliseconds before a socket that went away is reached for again. */
export const RECONNECT_MS = 900;
/**
 * How many times, **once there is somebody in the room with you**. A handset
 * that locks its screen, goes through a tunnel or hands over from wifi to the
 * mobile network drops the socket and gets it back within a second or two; one
 * that has been away longer than this is a player who has put the phone down,
 * and telling them the truth beats reaching for a room forever.
 */
export const RECONNECT_TRIES = 6;

/**
 * And how many times **while the room is still waiting for its second phone**.
 *
 * Six tries at `RECONNECT_MS` is five and a half seconds, and that is the
 * number the owner met as *the wait for the other player gives up too soon*.
 * The case is the one the room screen is built around: somebody opens a room,
 * reads the four characters down a voice call, and their screen locks or their
 * line hiccups while the other person is still typing. Five and a half seconds
 * later their phone has given up on the room altogether — and it has given up
 * on a seat the room is *still holding for it*, since `SEAT_SILENT_MS` in
 * `apps/server/src/seat.ts` is ten.
 *
 * The argument above is about a **pair**, and it is right about one: a field
 * that has stopped is a person sitting in front of nothing, owed the truth
 * quickly. Nobody is sitting in front of anything here. There is no run to
 * stall, no partner to leave hanging, and the thing being waited for is a
 * person reading characters aloud — which takes tens of seconds and sometimes
 * a second go. So the budget is a hundred and twenty, which is a hundred and
 * eight seconds: longer than reading a code out twice, shorter than a phone
 * somebody has put down and walked away from.
 */
export const WAITING_TRIES = 120;

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
  /**
   * Give the attempts back, and say whether the room is still gathering — a
   * `welcome` means the room is answering again, and it is the one moment its
   * head count changes. Which budget a later drop is spent against follows
   * from it (`WAITING_TRIES`).
   */
  rearm(stillGathering: boolean): void;
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
  /**
   * Attempts *made*, counted up rather than down, because the budget they are
   * spent against is not fixed: a drop while the room is still waiting for its
   * second phone is allowed far more of them than a drop mid-run
   * (`WAITING_TRIES`), and a counter that had already been decremented against
   * one budget could not be read against the other.
   */
  let tries = 0;
  /** Turned away on purpose: no budget at all, whatever the state says. */
  let surrendered = false;
  /**
   * Whether the room is still gathering, which is what `WAITING_TRIES` is for.
   *
   * **True until a welcome says otherwise**, because a socket that has never
   * been welcomed is in a room that has not spoken — a creator opening one, or
   * a phone still reaching for its first answer. `rearm` carries the room's
   * own count every time it speaks, so the budget follows the room rather than
   * being a thing this file guesses at.
   */
  let gathering = true;
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
    // Asked at the moment of the drop rather than held, so a line that goes
    // while the pair is still gathering gets the patient budget and one that
    // goes mid-run does not — and a room that fills between two drops moves
    // from one to the other without anything having to be reset.
    const budget = surrendered ? 0 : gathering ? WAITING_TRIES : RECONNECT_TRIES;
    if (tries >= budget || !on.worthRetrying()) {
      on.gone();
      return;
    }
    tries++;
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
    rearm(stillGathering) {
      tries = 0;
      surrendered = false;
      gathering = stillGathering;
    },
    surrender() {
      surrendered = true;
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
