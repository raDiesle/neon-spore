import { describe, expect, test } from "bun:test";
import type { LinkStatus, ServerMessage } from "@neon-spore/net";
import { createWorld, DEFAULT_CONFIG } from "@neon-spore/sim";
import { createLink } from "../src/link.js";
import type { RoomSocket, RoomSocketHandlers } from "../src/link-socket.js";

/**
 * A `RoomSocket` the test speaks through. The rules under test are about what
 * the room *says* and what the link does about it, and saying it needs no
 * network — so the socket is a record of what was asked of it.
 */
function fakeSocket() {
  let handlers: RoomSocketHandlers | null = null;
  const calls = { surrender: 0, rearm: 0, close: 0 };
  const socket: RoomSocket = {
    send: () => {},
    close: () => {
      calls.close++;
    },
    frame: () => {},
    rearm: () => {
      calls.rearm++;
    },
    surrender: () => {
      calls.surrender++;
    },
    present: true,
    // Never away: these rules are about what the room says, not about a line
    // that dropped.
    awayMs: 0,
  };
  return {
    calls,
    open: (_room: string, on: RoomSocketHandlers): RoomSocket => {
      handlers = on;
      return socket;
    },
    say: (message: ServerMessage) => handlers?.message(message),
    worthRetrying: () => handlers?.worthRetrying() ?? false,
  };
}

function linked() {
  const wire = fakeSocket();
  const seen: LinkStatus[] = [];
  const link = createLink({
    cfg: DEFAULT_CONFIG,
    world: createWorld(DEFAULT_CONFIG, 1),
    buffer: { drain: () => [] },
    onStart: () => {},
    onStatus: (status) => seen.push(status),
    now: () => 0,
    openSocket: wire.open,
  });
  link.join("ACDE");
  return { link, wire, seen };
}

const FULL: ServerMessage = { t: "error", why: "two already", code: "full" };

describe("a room that says it is full", () => {
  test("a phone that never had a seat stops reaching for it", () => {
    const { link, wire } = linked();
    wire.say(FULL);
    expect(link.status().state).toBe("full");
    expect(wire.calls.surrender).toBe(1);
    expect(wire.worthRetrying()).toBe(false);
  });

  test("a phone whose seat it is keeps reaching, because that is a race", () => {
    const { link, wire } = linked();
    // It was seated once. Then the connection vanished — a locked screen, a
    // tunnel — and the room has not noticed the dead socket yet.
    wire.say({ t: "welcome", player: 2, room: "ACDE", startMs: 0, peers: 1 });
    expect(link.status().player).toBe(2);

    wire.say(FULL);
    expect(link.status().state).toBe("full");
    // Not surrendered: the attempts left are the window the room needs to
    // notice, and giving them up here is what told a phone its own seat was
    // somebody else's.
    expect(wire.calls.surrender).toBe(0);
    expect(wire.worthRetrying()).toBe(true);
  });

  test("the reaching still stops when the room means it", () => {
    // `worthRetrying` only says the attempt is worth making. Running out of
    // attempts is `link-socket.ts`'s job and stays its job.
    const { link, wire } = linked();
    wire.say({ t: "welcome", player: 1, room: "ACDE", startMs: 0, peers: 1 });
    wire.say(FULL);
    expect(link.status().state).toBe("full");
    link.leave();
    expect(link.status().state).toBe("solo");
    expect(wire.worthRetrying()).toBe(false);
  });

  test("a refusal that is not about the room being busy is surrendered to", () => {
    // A build the room cannot play with is not coming back however many times
    // it asks. `surrender` is what stops it — the attempts are given up rather
    // than the room being judged not worth reaching.
    const { link, wire } = linked();
    wire.say({ t: "welcome", player: 1, room: "ACDE", startMs: 0, peers: 1 });
    wire.say({ t: "error", why: "protocol version 1 expected", code: "protocol" });
    expect(link.status().state).toBe("lost");
    expect(wire.calls.surrender).toBe(1);
  });
});
