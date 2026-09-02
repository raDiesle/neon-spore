import {
  type ClientMessage,
  ClockSync,
  HashLedger,
  type LinkState,
  type LinkStatus,
  Lockstep,
  type PlayerId,
  type ServerMessage,
} from "@neon-spore/net";
import {
  hashWorld,
  type SimConfig,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type CommandSource, openRelay, type Relay } from "./relay.js";

/** Milliseconds between clock samples. Seven of them fill the median window in five seconds. */
const PING_EVERY_MS = 700;
/** Beats between fingerprint exchanges. Often enough to catch a split within a breath. */
const HASH_EVERY_BEATS = 4;

export interface LinkOptions {
  cfg: SimConfig;
  world: World;
  buffer: CommandSource;
  /** Beat zero. The run starts over here, on both devices, at the same moment. */
  onStart: (player: PlayerId) => void;
  onStatus: (status: LinkStatus) => void;
  /**
   * The clock this link measures itself against. Defaults to
   * `performance.now()` — monotonic, unlike `Date.now()`, which an NTP step
   * or a phone's owner nudging the time can move mid-countdown, taking beat
   * zero with it on that device alone. Injectable so a test can drive the
   * countdown and the clock-jump case without a real clock in the loop.
   *
   * `ClockSync`'s offset is "the server's clock minus this device's clock",
   * whichever clock that is — `toLocal` stays comparable to whatever `now`
   * returns as long as both sides of a comparison use the same one.
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
 * The rest is `packages/net` driven by a socket — a `Lockstep` for the inputs,
 * a `ClockSync` for beat zero and a `HashLedger` for the moment it all goes
 * wrong. This file holds the wall clock and the WebSocket, and nothing below
 * it holds either.
 */
export function createLink(o: LinkOptions): Link {
  const tpb = ticksPerBeat(o.cfg);
  const hashEvery = tpb * HASH_EVERY_BEATS;
  const now = o.now ?? (() => performance.now());

  let relay: Relay | null = null;
  let state: LinkState = "solo";
  let room = "";
  let player: 0 | 1 | 2 = 0;
  let clock = new ClockSync();
  let ledger = new HashLedger();
  let lockstep: Lockstep | null = null;
  let startMs = 0;
  let started = false;
  let peers = 0;
  let pingTimer = 0;

  const send = (message: ClientMessage): void => relay?.send(message);

  const status = (): LinkStatus => ({
    state,
    room,
    player,
    rttMs: clock.sampleCount > 0 ? Math.round(clock.rttMs) : -1,
    slack: lockstep?.slack ?? 0,
    countdownMs: started || startMs === 0 ? 0 : Math.max(0, clock.toLocal(startMs) - now()),
    desyncTick: ledger.desyncTick,
  });

  const settle = (next: LinkState): void => {
    if (state === next) return;
    state = next;
    o.onStatus(status());
  };

  const leave = (): void => {
    const old = relay;
    relay = null;
    old?.close();
    lockstep = null;
    started = false;
    startMs = 0;
    peers = 0;
    player = 0;
    room = "";
    clock = new ClockSync();
    ledger = new HashLedger();
    settle("solo");
  };

  const join = (code: string): void => {
    leave();
    room = code;
    settle("connecting");
    relay = openRelay(code, {
      message: receive,
      dropped: () => settle("lost"),
      // Fire the first ping the moment the socket is open rather than
      // waiting for `frame()`'s 700 ms timer — the three samples clock
      // acquisition needs (2100 ms) otherwise eat into the 3000 ms countdown
      // on a slow handshake, and can miss it outright.
      opened: () => {
        pingTimer = PING_EVERY_MS;
        send({ t: "ping", c1: now() });
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
        settle(peers >= 2 ? (clock.ready ? "countdown" : "syncing") : "waiting");
        return;
      case "peers":
        peers = message.peers;
        // Before beat zero the room is simply not full yet. After it, a seat
        // going empty ends the run: there is no one left to be in step with,
        // and a lockstep that waits for nobody waits for ever.
        if (peers < 2) settle(started ? "lost" : "waiting");
        return;
      case "pong":
        clock.add({ c1: message.c1, s1: message.s1, s2: message.s2, c2: now() });
        return;
      case "error":
        settle("lost");
        return;
      default:
        lockstep?.receive(message);
        if (message.t === "hash" && ledger.observe(message.tick, message.hash) === "mismatch") {
          settle("desync");
        }
    }
  };

  const frame = (dtMs: number): void => {
    if (!relay) return;
    clock.settle(dtMs);
    pingTimer -= dtMs;
    if (pingTimer <= 0) {
      pingTimer = PING_EVERY_MS;
      send({ t: "ping", c1: now() });
    }
    if (state === "lost" || state === "desync") {
      o.onStatus(status());
      return;
    }
    if (started && lockstep) {
      lockstep.pump(o.world.tick);
      settle(lockstep.stalledTicks > tpb ? "stalled" : "live");
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
    started = true;
    if (player === 0) return;
    o.onStart(player);
    lockstep = new Lockstep({ player, delayTicks: o.cfg.inputDelayTicks, send });
    settle("live");
  };

  const mayTick = (): boolean => {
    // Solo: nothing to wait for. In a room, the world holds still from the
    // moment the socket opens — a device that plays on while it waits arrives
    // at beat zero on a tick count that has to be thrown away.
    if (!relay) return true;
    if (state === "desync" || state === "lost") return false;
    if (!started || !lockstep) return false;
    return lockstep.ready(o.world.tick);
  };

  const drain = (): TimedCommand[] => {
    const pressed = o.buffer.drain(o.world.tick);
    if (!lockstep) return pressed;
    // The timestamp is the tick the screen was touched on, and the seat is this
    // device's. The keyboard can still send both halves at a desk; the half
    // this device does not hold is dropped rather than played twice.
    for (const p of pressed) lockstep.press(p.player, p.command, o.world.tick);
    return lockstep.commandsFor(o.world.tick);
  };

  const checkpoint = (): void => {
    if (!lockstep || !started) return;
    const tick = o.world.tick;
    if (tick % hashEvery !== 0) return;
    const hash = hashWorld(o.world);
    if (ledger.record(tick, hash) === "mismatch") settle("desync");
    send({ t: "hash", tick, hash });
  };

  return { join, leave, mayTick, drain, checkpoint, frame, status };
}
