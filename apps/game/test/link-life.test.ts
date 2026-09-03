import { describe, expect, test } from "bun:test";
import type { LinkStatus, ServerMessage } from "@neon-spore/net";
import { createWorld, DEFAULT_CONFIG } from "@neon-spore/sim";
import { createLink } from "../src/link.js";
import type { RoomSocket, RoomSocketHandlers } from "../src/link-socket.js";

/**
 * The life of a run inside a room: how it starts, and the two ways it ends
 * that are the room's doing rather than the line's.
 *
 * `link-socket.ts` covers a line that drops and comes back, and
 * `link-full.test.ts` covers a room that turns a phone away. What was untested
 * is the middle — the part that decides a run is over and the next one starts
 * here, which is what a rejoin looks like from inside `link.ts`. Getting it
 * wrong does not throw: the two devices simply count from different ticks and
 * every fingerprint between them is compared against the wrong one.
 */

/** A `RoomSocket` the test speaks through, as in `link-full.test.ts`. */
function fakeSocket() {
  let handlers: RoomSocketHandlers | null = null;
  const sent: unknown[] = [];
  const socket: RoomSocket = {
    send: (message) => {
      sent.push(message);
    },
    close: () => {},
    frame: () => {},
    rearm: () => {},
    surrender: () => {},
    present: true,
    awayMs: 0,
  };
  return {
    sent,
    open: (_room: string, on: RoomSocketHandlers): RoomSocket => {
      handlers = on;
      on.opened?.();
      return socket;
    },
    say: (message: ServerMessage) => handlers?.message(message),
  };
}

/** Beat zero on the room's clock. The device's own clock stands at 0. */
const START_MS = 1000;

function joined() {
  const wire = fakeSocket();
  const seen: LinkStatus[] = [];
  const starts: number[] = [];
  const link = createLink({
    cfg: DEFAULT_CONFIG,
    world: createWorld(DEFAULT_CONFIG, 1),
    buffer: { drain: () => [] },
    onStart: (player) => starts.push(player),
    onStatus: (status) => seen.push(status),
    // Stopped, so beat zero arrives only when the room's stamp is behind it.
    now: () => 0,
    openSocket: wire.open,
  });
  link.join("ACDE");
  return { link, wire, seen, starts, state: () => link.status().state };
}

/**
 * Take a joined link all the way to a running game: both seats present, the
 * clock settled, and beat zero already behind this device.
 */
function running() {
  const h = joined();
  h.wire.say({
    t: "welcome",
    player: 1,
    room: "ACDE",
    peers: 2,
    startMs: START_MS,
    names: ["", ""],
  });
  // Three samples is what `ClockSync` wants before it believes an offset. The
  // server answers instantly at `START_MS`, so the offset is `START_MS` and
  // beat zero lands on this device's tick 0 — already reached.
  for (let i = 0; i < 3; i++) {
    h.wire.say({ t: "pong", c1: 0, s1: START_MS, s2: START_MS });
  }
  h.link.frame(16);
  return h;
}

describe("getting to beat zero", () => {
  test("waits for the second phone before it counts down to anything", () => {
    const h = joined();
    h.wire.say({ t: "welcome", player: 1, room: "ACDE", peers: 1, startMs: 0, names: ["", ""] });
    expect(h.state()).toBe("waiting");
  });

  test("starts once both phones are there and the clocks agree", () => {
    const h = running();
    expect(h.state()).toBe("live");
    expect(h.starts).toEqual([1]);
  });
});

describe("a welcome that stamps a different beat zero", () => {
  test("ends the run, because that is a rejoin seen from in here", () => {
    const h = running();
    // The room fills again and stamps a fresh beat zero. Carrying on would
    // leave the two devices counting from different ticks: not lag, but two
    // games with one fingerprint check between them.
    h.wire.say({
      t: "welcome",
      player: 1,
      room: "ACDE",
      peers: 2,
      startMs: START_MS + 5000,
      names: ["", ""],
    });
    // The frame is what tells the two apart. A run that was ended has to count
    // down to the new stamp; one that was not simply reports itself live, and
    // that is the bug — a live run on a beat zero the other phone is not on.
    h.link.frame(16);
    expect(h.state()).toBe("countdown");
  });

  test("begins again when the new beat zero arrives", () => {
    const h = running();
    h.wire.say({
      t: "welcome",
      player: 1,
      room: "ACDE",
      peers: 2,
      startMs: START_MS + 5000,
      names: ["", ""],
    });
    h.link.frame(16);
    expect(h.starts).toEqual([1]);
    // The device's clock is stopped at 0, so the new beat zero is reached by
    // moving the room's stamp back to one this device has already passed.
    h.wire.say({
      t: "welcome",
      player: 1,
      room: "ACDE",
      peers: 2,
      startMs: START_MS,
      names: ["", ""],
    });
    h.link.frame(16);
    expect(h.starts).toEqual([1, 1]);
  });

  test("carries on when the stamp is the one this run already began on", () => {
    const h = running();
    // A welcome is re-sent whenever the room has something to say. The same
    // beat zero is the same run, and ending it would restart the game under
    // two people who were playing it.
    h.wire.say({
      t: "welcome",
      player: 1,
      room: "ACDE",
      peers: 2,
      startMs: START_MS,
      names: ["", ""],
    });
    h.link.frame(16);
    expect(h.state()).toBe("live");
    expect(h.starts).toEqual([1]);
  });
});

describe("a seat that empties", () => {
  test("ends the run once it has started, because lockstep waits for nobody", () => {
    const h = running();
    h.wire.say({ t: "peers", peers: 1, names: ["", ""] });
    expect(h.state()).toBe("lost");
  });

  test("is only waiting when it happens before beat zero", () => {
    const h = joined();
    h.wire.say({
      t: "welcome",
      player: 1,
      room: "ACDE",
      peers: 2,
      startMs: START_MS,
      names: ["", ""],
    });
    h.wire.say({ t: "peers", peers: 1, names: ["", ""] });
    // Nothing has started, so nobody has been dropped out of anything: the
    // room is simply not full yet.
    expect(h.state()).toBe("waiting");
  });
});

describe("leaving", () => {
  test("puts the link back to solo with nothing remembered", () => {
    const h = running();
    h.link.leave();
    const status = h.link.status();
    expect(status.state).toBe("solo");
    expect(status.room).toBe("");
    expect(status.player).toBe(0);
    expect(status.peers).toBe(0);
  });

  test("lets the world tick again, because there is nobody to wait for", () => {
    const h = running();
    h.link.leave();
    expect(h.link.mayTick()).toBe(true);
  });
});
