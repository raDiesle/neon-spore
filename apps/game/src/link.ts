import type { LinkState, LinkStatus, PlayerId, ServerMessage } from "@neon-spore/net";
import { createRoomClock } from "./link-clock.js";
import { reclaimingSeat, stateAfterRefusal, turnedAway, worthReaching } from "./link-refusal.js";
import { report } from "./link-report.js";
import { createRun, type Run } from "./link-run.js";
import { openRoomSocket, type RoomSocket } from "./link-socket.js";
import type { Link, LinkOptions } from "./link-types.js";

export type { Link, LinkOptions } from "./link-types.js";

/**
 * Everything the game needs to be two devices instead of one, and nothing the
 * game needs to be one device: solo is the default and costs a boolean.
 *
 * This file is **the room**: a seat, a clock, a countdown, and the state a
 * player reads in the corner of the screen. Each of those clauses is now a
 * file of its own and this is what holds them together — `link-socket.ts` the
 * socket and its reconnection, `link-run.ts` the scheduler and the
 * fingerprints, `link-clock.ts` the clock and the countdown it decides,
 * `link-report.ts` the state the player reads. Several runs can pass over one
 * socket, since every phone that drops and returns makes the room stamp a
 * fresh beat zero, and that is exactly why they are not one file.
 *
 * The wall clock is measured in `link-clock.ts` and nowhere else; what stays
 * here is `now` itself, because the room is what owns it and hands it down.
 */
export function createLink(o: LinkOptions): Link {
  const now = o.now ?? (() => performance.now());
  const openSocket = o.openSocket ?? openRoomSocket;

  let socket: RoomSocket | null = null;
  let state: LinkState = "solo";
  let room = "";
  let player: 0 | 1 | 2 = 0;
  const clock = createRoomClock(now);
  let startMs = 0;
  /**
   * The beat zero this run began on. The room stamps a new one every time it
   * fills, so a value that has moved is a rejoin, seen from in here.
   */
  let startedAt = 0;
  let peers = 0;
  /** The seats the room says have pressed START. Cleared with the room. */
  let readySeats: PlayerId[] = [];

  const run: Run = createRun({
    cfg: o.cfg,
    world: o.world,
    buffer: o.buffer,
    send: (message) => socket?.send(message),
  });

  const status = (): LinkStatus =>
    report({ state, room, player, peers, readySeats, clock, run, socket, startMs });

  const settle = (next: LinkState): void => {
    if (state === next) return;
    state = next;
    o.onStatus(status());
  };

  const refused = (): boolean => turnedAway(state);
  const reclaiming = (): boolean => reclaimingSeat(state, player);

  const leave = (): void => {
    const old = socket;
    socket = null;
    old?.close();
    run.end();
    startMs = 0;
    startedAt = 0;
    peers = 0;
    readySeats = [];
    player = 0;
    room = "";
    clock.reset();
    settle("solo");
  };

  const join = (code: string): void => {
    leave();
    room = code;
    settle("connecting");
    socket = openSocket(code, {
      message: receive,
      // Fire the first ping the moment the socket is open rather than waiting
      // for `frame()`'s 700 ms timer — the 2100 ms three samples take would
      // otherwise eat into the 3000 ms countdown, and can miss it outright.
      opened: () => {
        socket?.send({ t: "ping", c1: now() });
        clock.pingSent();
      },
      worthRetrying: () => worthReaching(state, player, room),
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
        // A beat zero that is not this run's is the room saying the run is over
        // and the next starts here, which is what a rejoin looks like from this
        // side. Carrying on would leave the two devices counting from different
        // ticks: not lag, but two games with one fingerprint check between them.
        if (run.started && startMs !== startedAt) run.end();
        // A stamp is a new run, and the presses that bought it are spent.
        if (startMs !== 0) readySeats = [];
        settle(peers >= 2 ? (clock.ready ? "countdown" : "syncing") : "waiting");
        return;
      case "ready":
        readySeats = message.players;
        o.onStatus(status());
        return;
      case "peers":
        peers = message.peers;
        // Before beat zero the room is simply not full yet. After it, an empty
        // seat ends the run: a lockstep that waits for nobody waits for ever.
        if (peers < 2) settle(run.started ? "lost" : "waiting");
        return;
      case "pong":
        clock.add(message, run.started);
        return;
      case "error":
        settle(stateAfterRefusal(message.code));
        // Turned away on purpose, so there is nothing to reach for again —
        // unless this is the room holding a seat that is this device's own.
        if (!reclaiming()) socket?.surrender();
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
    if (clock.framePingDue(dtMs)) socket.send({ t: "ping", c1: now() });
    run.observeLink(clock.sampleCount > 0 ? clock.rttMs : -1, dtMs);
    if (state === "lost" || refused()) {
      o.onStatus(status());
      return;
    }
    if (run.started) {
      settle(run.pump(dtMs) ? "stalled" : "live");
    } else if (peers < 2) {
      settle("waiting");
    } else if (!clock.ready) {
      settle("syncing");
    } else if (startMs === 0) {
      // Both here, clocks agreed, waiting on the press — for as long as the
      // two people want it to.
      settle("ready");
    } else if (!clock.reached(startMs)) {
      settle("countdown");
    } else {
      begin();
    }
    o.onStatus(status());
  };

  /**
   * Beat zero, in the only order that works: the world's clock goes back to
   * zero first, and the scheduler is built after that. Built before, it would
   * spend the wait promising the peer that nothing is coming before tick 47 —
   * and keep that promise across the reset, so the first forty-seven ticks of
   * the real run would carry no commands while both devices called it in step.
   */
  const begin = (): void => {
    startedAt = startMs;
    if (player !== 0) o.onStart(player);
    run.begin(player);
    if (player !== 0) settle("live");
  };

  const mayTick = (): boolean => {
    // Solo: nothing to wait for. In a room the world holds still from the moment
    // the socket opens, because a device that plays on while it waits reaches
    // beat zero on a tick count that has to be thrown away — and one waiting out
    // a reconnection is in a room, not alone.
    if (!socket) return room === "";
    if (state === "lost" || refused()) return false;
    return run.mayTick();
  };

  const checkpoint = (): void => {
    if (run.checkpoint()) settle("desync");
  };

  /** A press, not a start: the room decides what two of them are worth. */
  const ready = (): void => socket?.send({ t: "ready" });

  return { join, leave, ready, mayTick, drain: run.drain, checkpoint, frame, status };
}
