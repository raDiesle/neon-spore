import { describe, expect, test } from "bun:test";
import { SEAT_HELD_MS } from "@neon-spore/net";
import {
  openRoomSocket,
  RECLAIM_TRIES,
  RECONNECT_MS,
  RECONNECT_TRIES,
  type RoomSocketHandlers,
  WAITING_TRIES,
} from "../src/link-socket.js";
import { openRelay } from "../src/relay.js";

/**
 * A `WebSocket` with nothing in it but its listeners, so a test can fire the
 * events a real one fires. The point is the pair: a socket that fails to
 * connect, or dies abnormally, fires `error` and then `close` — and until
 * `openRelay` latched them, that pair spent two reconnection attempts on one
 * loss and `RECONNECT_TRIES = 6` was really three.
 */
class FakeSocket {
  readyState = 0;
  private readonly listeners = new Map<string, ((e: unknown) => void)[]>();

  addEventListener(type: string, fn: (e: unknown) => void): void {
    const list = this.listeners.get(type);
    if (list) list.push(fn);
    else this.listeners.set(type, [fn]);
  }

  send(): void {}
  close(): void {}

  fire(type: string): void {
    for (const fn of this.listeners.get(type) ?? []) fn({});
  }
}

/** The counts a caller of `openRoomSocket` sees, and every socket it opened. */
function room(gathering = false, reclaiming = false) {
  const sockets: FakeSocket[] = [];
  const counts = { waiting: 0, gone: 0, opened: 0 };
  const handlers: RoomSocketHandlers = {
    message: () => {},
    opened: () => {
      counts.opened++;
    },
    worthRetrying: () => true,
    reclaiming: () => reclaiming,
    waiting: () => {
      counts.waiting++;
    },
    gone: () => {
      counts.gone++;
    },
  };
  const socket = openRoomSocket("ACDE", handlers, (code, on) =>
    // The real `openRelay` over a socket the test owns: the latch under test
    // lives in there, so a fake relay would prove nothing about it.
    openRelay(code, on, () => {
      const s = new FakeSocket();
      sockets.push(s);
      return s as unknown as WebSocket;
    }),
  );
  /** One loss, the way a browser reports it: `error`, then `close`. */
  const die = (): void => {
    const last = sockets.at(-1);
    last?.fire("error");
    last?.fire("close");
  };
  // A socket that has never been welcomed is gathering by construction, so a
  // test that wants the pair's budget says so the way the room does.
  if (!gathering) socket.rearm(false);
  return { socket, sockets, counts, die };
}

describe("a room socket that keeps reaching", () => {
  test("a socket that errors and then closes costs one attempt, not two", () => {
    const r = room();
    expect(r.sockets.length).toBe(1);

    r.die();
    expect(r.counts.waiting).toBe(1);
    expect(r.counts.gone).toBe(0);

    // The wait runs out and a fresh socket is opened.
    r.socket.frame(RECONNECT_MS);
    expect(r.sockets.length).toBe(2);
  });

  test("it gives up on the seventh failure, not the fourth", () => {
    const r = room();
    for (let i = 0; i < RECONNECT_TRIES; i++) {
      r.die();
      expect(r.counts.waiting).toBe(i + 1);
      expect(r.counts.gone).toBe(0);
      r.socket.frame(RECONNECT_MS);
    }
    expect(r.sockets.length).toBe(RECONNECT_TRIES + 1);

    r.die();
    expect(r.counts.gone).toBe(1);
    expect(r.counts.waiting).toBe(RECONNECT_TRIES);
  });

  test("a welcome gives the attempts back", () => {
    const r = room();
    for (let i = 0; i < RECONNECT_TRIES; i++) {
      r.die();
      r.socket.frame(RECONNECT_MS);
    }
    r.socket.rearm(false);
    r.die();
    expect(r.counts.gone).toBe(0);
  });
});

/**
 * **A line that goes while the room is still waiting for its second phone.**
 *
 * Six tries at 900 ms is five and a half seconds, and that is what the owner
 * met as *the wait for the other player gives up too soon*: somebody opens a
 * room, reads the four characters down a voice call, their screen locks while
 * the other person is typing, and the phone gives up on a seat the room is
 * still holding — `SEAT_SILENT_MS` is ten seconds, nearly twice as long.
 *
 * The six are right for a pair. They are about a field that has stopped with a
 * person sitting in front of it, owed the truth quickly. Nobody is sitting in
 * front of anything before the room is full.
 */
describe("a room socket still waiting for the other phone", () => {
  test("keeps reaching long past the six a pair gets", () => {
    const r = room(true);
    for (let i = 0; i < RECONNECT_TRIES + 1; i++) {
      r.die();
      r.socket.frame(RECONNECT_MS);
    }
    expect(r.counts.gone).toBe(0);
    expect(r.counts.waiting).toBe(RECONNECT_TRIES + 1);
  });

  test("gives up in the end, because a phone put down is not a phone reconnecting", () => {
    const r = room(true);
    for (let i = 0; i < WAITING_TRIES; i++) {
      r.die();
      r.socket.frame(RECONNECT_MS);
    }
    expect(r.counts.gone).toBe(0);
    r.die();
    expect(r.counts.gone).toBe(1);
  });

  test("waits long enough for the room to have let the seat go first", () => {
    // The point of the number: the phone must not abandon a seat the room is
    // still holding. The room's own window is `SEAT_HELD_MS`, read here from
    // the one place both ends read it (`packages/net/src/seat-hold.ts`) rather
    // than written down again as a ten this file would not notice moving.
    expect(WAITING_TRIES * RECONNECT_MS).toBeGreaterThan(SEAT_HELD_MS);
  });

  test("is the state a socket starts in, before any welcome has spoken", () => {
    // A creator opening a room has been welcomed by nobody, and that is the
    // case the number exists for — so patience is the default rather than
    // something a caller has to remember to switch on.
    const r = room(true);
    for (let i = 0; i < RECONNECT_TRIES + 1; i++) {
      r.die();
      r.socket.frame(RECONNECT_MS);
    }
    expect(r.counts.gone).toBe(0);
  });

  test("goes back to the pair's six once the room says it is full", () => {
    const r = room(true);
    r.socket.rearm(false);
    for (let i = 0; i < RECONNECT_TRIES; i++) {
      r.die();
      r.socket.frame(RECONNECT_MS);
    }
    expect(r.counts.gone).toBe(0);
    r.die();
    expect(r.counts.gone).toBe(1);
  });

  test("is still refused outright when the room turned it away", () => {
    // Patience is about how long, never about whether: a room that said no is
    // not coming back however long anybody waits.
    const r = room(true);
    r.socket.surrender();
    r.die();
    expect(r.counts.gone).toBe(1);
    expect(r.counts.waiting).toBe(0);
  });
});

/**
 * **A line that goes mid-run, on a socket the room never saw close.**
 *
 * The third budget, and the case none of the others covered. A phone whose TCP
 * connection vanishes — a pocket, a tunnel, flight mode — leaves the room
 * holding its chair for `SEAT_HELD_MS`, and for every one of those ten seconds
 * the room answers the returning phone with `full`. `link-refusal.ts` reads
 * that as the race it is and keeps reaching; what it had to reach with was the
 * pair's six attempts, five and a half seconds, so the reaching stopped four
 * and a half seconds before the seat came free. The reclaim was written to win
 * that race and could not win it once.
 */
describe("a room socket reclaiming a seat the room has not let go of", () => {
  test("keeps reaching past the moment the room lets the seat go", () => {
    expect(RECLAIM_TRIES * RECONNECT_MS).toBeGreaterThan(SEAT_HELD_MS);
  });

  test("outlasts the six an ordinary drop is worth", () => {
    const r = room(false, true);
    for (let i = 0; i < RECONNECT_TRIES + 1; i++) {
      r.die();
      r.socket.frame(RECONNECT_MS);
    }
    expect(r.counts.gone).toBe(0);
    expect(r.counts.waiting).toBe(RECONNECT_TRIES + 1);
  });

  test("gives up in the end, because a held seat is not held for ever", () => {
    const r = room(false, true);
    for (let i = 0; i < RECLAIM_TRIES; i++) {
      r.die();
      r.socket.frame(RECONNECT_MS);
    }
    expect(r.counts.gone).toBe(0);
    r.die();
    expect(r.counts.gone).toBe(1);
  });

  test("a drop that is not a reclaim still gets the six, and no more", () => {
    // The six are right where they were argued for: a room that let the seat
    // go the moment the socket closed has nothing left to race, and a person
    // sitting in front of a stopped field is owed the truth quickly.
    const r = room(false, false);
    for (let i = 0; i < RECONNECT_TRIES; i++) {
      r.die();
      r.socket.frame(RECONNECT_MS);
    }
    r.die();
    expect(r.counts.gone).toBe(1);
  });
});
