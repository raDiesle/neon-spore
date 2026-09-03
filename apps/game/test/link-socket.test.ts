import { describe, expect, test } from "bun:test";
import {
  openRoomSocket,
  RECONNECT_MS,
  RECONNECT_TRIES,
  type RoomSocketHandlers,
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
function room() {
  const sockets: FakeSocket[] = [];
  const counts = { waiting: 0, gone: 0, opened: 0 };
  const handlers: RoomSocketHandlers = {
    message: () => {},
    opened: () => {
      counts.opened++;
    },
    worthRetrying: () => true,
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
    r.socket.rearm();
    r.die();
    expect(r.counts.gone).toBe(0);
  });
});
