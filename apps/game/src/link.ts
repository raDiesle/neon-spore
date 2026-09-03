import {
  ClockSync,
  type LinkState,
  type LinkStatus,
  type PlayerId,
  type ServerMessage,
} from "@neon-spore/net";
import type { SimConfig, TimedCommand, World } from "@neon-spore/sim";
import { createRun, type Run } from "./link-run.js";
import { openRoomSocket, type RoomSocket } from "./link-socket.js";
import type { CommandSource } from "./relay.js";

/** Milliseconds between clock samples. Seven of them fill the median window in five seconds. */
const PING_EVERY_MS = 700;

export interface LinkOptions {
  cfg: SimConfig;
  world: World;
  buffer: CommandSource;
  /** Beat zero. The run starts over here, on both devices, at the same moment. */
  onStart: (player: PlayerId) => void;
  onStatus: (status: LinkStatus) => void;
  /**
   * The clock this link measures itself against. Defaults to
   * `performance.now()` — monotonic, unlike `Date.now()`, which an NTP step or
   * a phone's owner nudging the time can move mid-countdown, taking beat zero
   * with it on that device alone. Injectable so a test can drive the countdown
   * and the clock-jump case without a real clock in the loop; `ClockSync`'s
   * offset is against whichever clock this is, so `toLocal` stays comparable
   * as long as both sides of a comparison use the same one.
   */
  now?: () => number;
}

export interface Link {
  /** Join a room. Leaves any room already held. */
  join(room: string): void;
  leave(): void;
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

/**
 * Everything the game needs to be two devices instead of one, and nothing the
 * game needs to be one device: solo is the default and costs a boolean.
 *
 * This file is **the room**: a seat, a clock, a countdown, and the state a
 * player reads in the corner of the screen. Either side of it is one thing
 * each — `link-socket.ts` the socket and its reconnection, `link-run.ts` the
 * scheduler and the fingerprints. Several runs can pass over one socket, since
 * every phone that drops and returns makes the room stamp a fresh beat zero,
 * and that is exactly why they are not one file.
 *
 * The wall clock is held here and nowhere below it.
 */
export function createLink(o: LinkOptions): Link {
  const now = o.now ?? (() => performance.now());

  let socket: RoomSocket | null = null;
  let state: LinkState = "solo";
  let room = "";
  let player: 0 | 1 | 2 = 0;
  let clock = new ClockSync();
  let startMs = 0;
  /**
   * The beat zero this run actually began on. The room stamps a new one every
   * time it fills, so a value that has moved is it saying "that run is over,
   * here is the next" — which is what a rejoin looks like from in here.
   */
  let startedAt = 0;
  let peers = 0;
  let pingTimer = 0;

  const run: Run = createRun({
    cfg: o.cfg,
    world: o.world,
    buffer: o.buffer,
    send: (message) => socket?.send(message),
  });

  const status = (): LinkStatus => ({
    state,
    room,
    player,
    rttMs: clock.sampleCount > 0 ? Math.round(clock.rttMs) : -1,
    slack: run.slack,
    countdownMs: run.started || startMs === 0 ? 0 : Math.max(0, clock.toLocal(startMs) - now()),
    delayMs: run.delayMs,
    desyncTick: run.desyncTick,
  });

  const settle = (next: LinkState): void => {
    if (state === next) return;
    state = next;
    o.onStatus(status());
  };

  /** The two states the room turned this device away in, and will again. */
  const refused = (): boolean => state === "full" || state === "desync";

  const leave = (): void => {
    const old = socket;
    socket = null;
    old?.close();
    run.end();
    startMs = 0;
    startedAt = 0;
    peers = 0;
    player = 0;
    room = "";
    clock = new ClockSync();
    settle("solo");
  };

  const join = (code: string): void => {
    leave();
    room = code;
    settle("connecting");
    socket = openRoomSocket(code, {
      message: receive,
      // Fire the first ping the moment the socket is open rather than waiting
      // for `frame()`'s 700 ms timer — the 2100 ms three samples take would
      // otherwise eat into the 3000 ms countdown, and can miss it outright.
      opened: () => {
        pingTimer = PING_EVERY_MS;
        socket?.send({ t: "ping", c1: now() });
      },
      worthRetrying: () => room !== "" && !refused(),
      waiting: () => {
        run.end();
        settle("connecting");
      },
      gone: () => {
        run.end();
        if (!refused()) settle("lost");
      },
    });
  };

  const receive = (message: ServerMessage): void => {
    switch (message.t) {
      case "welcome":
        player = message.player;
        room = message.room;
        peers = message.peers;
        startMs = message.startMs;
        socket?.rearm();
        // A beat zero that is not the one this run began on is the room saying
        // the run is over and the next one starts here — which is what a phone
        // rejoining after a drop looks like from this side. Carrying on instead
        // would leave the two devices counting from different ticks, and that
        // is not lag, it is two different games with one fingerprint check
        // between them.
        if (run.started && startMs !== startedAt) run.end();
        settle(peers >= 2 ? (clock.ready ? "countdown" : "syncing") : "waiting");
        return;
      case "peers":
        peers = message.peers;
        // Before beat zero the room is simply not full yet. After it, a seat
        // going empty ends the run: there is no one left to be in step with,
        // and a lockstep that waits for nobody waits for ever.
        if (peers < 2) settle(run.started ? "lost" : "waiting");
        return;
      case "pong":
        clock.add({ c1: message.c1, s1: message.s1, s2: message.s2, c2: now() });
        return;
      case "error":
        // Turned away on purpose, so there is nothing to reach for again —
        // and "full" is not a fault of the line, so it is not dressed as one.
        socket?.surrender();
        settle(message.code === "full" ? "full" : "lost");
        return;
      default:
        if (run.receive(message)) settle("desync");
    }
  };

  const frame = (dtMs: number): void => {
    if (!socket) return;
    socket.frame(dtMs);
    // Waiting out a reconnection: no clock to settle, nothing to send.
    if (!socket.present) {
      o.onStatus(status());
      return;
    }
    clock.settle(dtMs);
    pingTimer -= dtMs;
    if (pingTimer <= 0) {
      pingTimer = PING_EVERY_MS;
      socket.send({ t: "ping", c1: now() });
    }
    run.observeLink(clock.sampleCount > 0 ? clock.rttMs : -1, dtMs);
    if (state === "lost" || refused()) {
      o.onStatus(status());
      return;
    }
    if (run.started) {
      settle(run.pump() ? "stalled" : "live");
    } else if (peers < 2) {
      settle("waiting");
    } else if (!clock.ready) {
      settle("syncing");
    } else if (now() < clock.toLocal(startMs)) {
      settle("countdown");
    } else {
      begin();
    }
    o.onStatus(status());
  };

  /**
   * Beat zero, in the only order that works: the host puts its clock back to
   * zero first, and the scheduler is built after that.
   *
   * Built before, it would spend the wait pumping promises about a tick count
   * from the run that is about to be thrown away — and then keep them. The peer
   * would be told that nothing is coming before tick 47, the clock would go
   * back to 0, and the first forty-seven ticks of the real run would carry no
   * commands at all while both devices insisted they were in step.
   */
  const begin = (): void => {
    startedAt = startMs;
    if (player !== 0) o.onStart(player);
    run.begin(player);
    if (player !== 0) settle("live");
  };

  const mayTick = (): boolean => {
    // Solo: nothing to wait for. In a room the world holds still from the
    // moment the socket opens, because a device that plays on while it waits
    // arrives at beat zero on a tick count that has to be thrown away — and a
    // device waiting out a reconnection is in a room, not alone.
    if (!socket) return room === "";
    if (state === "lost" || refused()) return false;
    return run.mayTick();
  };

  const checkpoint = (): void => {
    if (run.checkpoint()) settle("desync");
  };

  return { join, leave, mayTick, drain: run.drain, checkpoint, frame, status };
}
