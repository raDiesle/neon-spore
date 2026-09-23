import { describe, expect, test } from "bun:test";
import type { ClientMessage, LinkStatus, ServerMessage } from "@neon-spore/net";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  step,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import { createLink } from "../src/link.js";
import { createRun, type Run } from "../src/link-run.js";
import type { RoomSocket, RoomSocketHandlers } from "../src/link-socket.js";

/**
 * **What the peer says before this device reaches beat zero.**
 *
 * The two clocks agree to a few milliseconds and not to none, so one phone is
 * always first, and the first thing it sends is its promise. Nothing else can
 * come that early: a phone ticks, and so presses and fingerprints, only on the
 * other's promise (`frame.ts`). The promise used to arrive at a run with no
 * scheduler and be dropped, and the first phone makes its next one only after
 * it has ticked — which it does on the later phone's word — so the later phone
 * stood on the field for a round trip at every beat zero. The run holds it now,
 * and the room decides what is worth holding: only what comes in the last
 * moments before beat zero, since anything earlier is the last run's, sent
 * before the peer heard the new stamp.
 */

const CFG: SimConfig = DEFAULT_CONFIG;

interface Device {
  run: Run;
  world: World;
  /** What this device's thumb pressed, by tick. */
  presses: Map<number, Command>;
  /** What went out, not yet handed to the other device. */
  outbox: ClientMessage[];
  /** The commands each tick ran with, in order. */
  played: TimedCommand[][];
  /** The fingerprint after each tick. */
  hashes: number[];
}

function device(player: 1 | 2, presses: [number, Command][]): Device {
  const world = createWorld(CFG, 7);
  const d: Device = {
    world,
    presses: new Map(presses),
    outbox: [],
    played: [],
    hashes: [],
    run: createRun({
      cfg: CFG,
      world,
      buffer: {
        drain: (tick) => {
          const command = d.presses.get(tick);
          return command ? [{ tick, player, command }] : [];
        },
      },
      send: (message) => d.outbox.push(message),
    }),
  };
  return d;
}

/** Hand everything `from` sent to `to`, with the seat stamped on the way the room does. */
function deliver(from: Device, player: 1 | 2, to: Device): boolean {
  let parted = false;
  for (const m of from.outbox.splice(0)) {
    if (to.run.receive({ ...m, player } as ServerMessage)) parted = true;
  }
  return parted;
}

/** One frame: a tick if the scheduler allows it, and the promise kept either way. */
function frame(d: Device): void {
  if (!d.run.started) return;
  d.run.pump(16);
  if (!d.run.mayTick()) return;
  const commands = d.run.drain();
  step(d.world, commands);
  d.played.push(commands);
  d.hashes.push(hashWorld(d.world));
  d.run.checkpoint();
}

describe("a device that reaches beat zero a few frames after its peer", () => {
  test("ticks on its first frame, on the promise the peer made before it began", () => {
    const a = device(1, [[0, { kind: "guard" }]]);
    const b = device(2, []);
    a.run.begin(1);
    // Seat 1 is on the field for three frames with nobody there. It promises
    // once and waits; the promise is held on the other phone.
    for (let i = 0; i < 3; i++) {
      frame(a);
      expect(deliver(a, 1, b)).toBe(false);
    }
    expect(a.played).toHaveLength(0);
    b.run.begin(2);
    frame(b);
    expect(b.played).toHaveLength(1);
  });

  test("plays the same ticks as the peer from there on", () => {
    const a = device(1, [[0, { kind: "guard" }]]);
    const b = device(2, []);
    a.run.begin(1);
    for (let i = 0; i < 3; i++) {
      frame(a);
      deliver(a, 1, b);
    }
    b.run.begin(2);
    for (let i = 0; i < 400; i++) {
      frame(a);
      frame(b);
      expect(deliver(a, 1, b)).toBe(false);
      expect(deliver(b, 2, a)).toBe(false);
    }
    const ran = Math.min(a.played.length, b.played.length);
    expect(ran).toBeGreaterThan(300);
    // Seat 1's press, on the one tick on both, and the worlds still one.
    expect(a.played.some((c) => c.length > 0)).toBe(true);
    expect(b.played.slice(0, ran)).toEqual(a.played.slice(0, ran));
    expect(b.hashes.slice(0, ran)).toEqual(a.hashes.slice(0, ran));
    expect(b.run.brokenPromises).toBe(0);
  });

  test("forgets what it held when the run is thrown away before it began", () => {
    const b = device(2, []);
    // The last run's promise, far out past anything a new run could reach.
    b.run.receive({ t: "confirm", player: 1, tick: 90_000 });
    b.run.end();
    b.run.begin(2);
    expect(b.run.receive({ t: "confirm", player: 1, tick: 20 })).toBe(false);
    expect(b.run.brokenPromises).toBe(0);
  });

  test("counts a held message that is not this run's, the moment it begins", () => {
    const b = device(2, []);
    b.run.receive({ t: "confirm", player: 1, tick: 90_000 });
    b.run.begin(2);
    expect(b.run.brokenPromises).toBe(1);
    expect(b.run.receive({ t: "confirm", player: 1, tick: 20 })).toBe(true);
  });
});

/** Beat zero on the room's clock. The room answers pings as if it stood there. */
const START_MS = 1000;

/**
 * A link in seat 1 with the room's clock learnt and beat zero one second off.
 * `at` moves this device's clock; `say` is the room talking.
 */
function counting() {
  let handlers: RoomSocketHandlers | null = null;
  let nowMs = 0;
  const socket: RoomSocket = {
    send: () => {},
    close: () => {},
    frame: () => {},
    rearm: () => {},
    surrender: () => {},
    present: true,
    awayMs: 0,
  };
  const link = createLink({
    cfg: CFG,
    world: createWorld(CFG, 1),
    buffer: { drain: () => [] },
    onStart: () => {},
    onStatus: (_: LinkStatus) => {},
    now: () => nowMs,
    openSocket: (_room, on) => {
      handlers = on;
      on.opened?.();
      return socket;
    },
  });
  link.join("ACDE");
  const say = (message: ServerMessage): void => handlers?.message(message);
  const stamp = (startMs: number): void =>
    say({
      t: "welcome",
      player: 1,
      room: "ACDE",
      peers: 2,
      startMs,
      names: ["", ""],
      best: null,
      level: null,
      host: 1,
    });
  // The room's clock stands at `START_MS` when this one stands at 0.
  stamp(START_MS + 1000);
  for (let i = 0; i < 3; i++) say({ t: "pong", c1: 0, s1: START_MS, s2: START_MS });
  link.frame(16);
  return {
    link,
    say,
    stamp,
    at: (ms: number) => {
      nowMs = ms;
    },
  };
}

describe("the room, before beat zero", () => {
  test("holds a peer's promise from the last moments before it", () => {
    const h = counting();
    h.at(850);
    h.say({ t: "confirm", player: 2, tick: 20 });
    h.at(1000);
    h.link.frame(16);
    expect(h.link.status().state).toBe("live");
    expect(h.link.mayTick()).toBe(true);
  });

  test("turns away one from long before it, which is the last run's", () => {
    const h = counting();
    h.say({ t: "confirm", player: 2, tick: 20 });
    h.at(1000);
    h.link.frame(16);
    expect(h.link.status().state).toBe("live");
    expect(h.link.mayTick()).toBe(false);
  });

  test("keeps what it held through a welcome with the same stamp", () => {
    const h = counting();
    h.at(850);
    h.say({ t: "confirm", player: 2, tick: 20 });
    h.stamp(START_MS + 1000);
    h.at(1000);
    h.link.frame(16);
    expect(h.link.mayTick()).toBe(true);
  });

  test("drops it when a welcome moves the stamp", () => {
    const h = counting();
    h.at(850);
    h.say({ t: "confirm", player: 2, tick: 20 });
    h.stamp(START_MS + 900);
    h.at(1000);
    h.link.frame(16);
    expect(h.link.status().state).toBe("live");
    expect(h.link.mayTick()).toBe(false);
  });
});
