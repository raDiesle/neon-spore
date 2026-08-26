import type { Command } from "@neon-spore/sim";

/**
 * Every message that crosses the wire, in one file, so the Durable Object and
 * the browser cannot drift apart about what a field means.
 *
 * The relay never inspects a `Command`. It forwards bytes, hands out the beat
 * zero point and answers clock syncs — see docs/architecture.md, "Network".
 * That is deliberate: a server that understood the game would be a second
 * implementation of the rules, and the whole point of lockstep is that there
 * is only one.
 */
export const PROTOCOL_VERSION = 1;

/** 1 = pilot (cannon, trigger, maw), 2 = navigator (shield, colours). */
export type PlayerId = 1 | 2;

/** The other seat. */
export function otherPlayer(player: PlayerId): PlayerId {
  return player === 1 ? 2 : 1;
}

export type ClientMessage =
  | { t: "join"; v: number }
  /**
   * Commands the sender has scheduled for `tick`. Scheduled ticks from one
   * sender never decrease, so receiving this is also a promise that nothing
   * further will arrive for any earlier tick.
   */
  | { t: "input"; tick: number; commands: Command[] }
  /** "Nothing more from me through `tick`." The heartbeat that keeps the peer ticking. */
  | { t: "confirm"; tick: number }
  /** `c1` is the sender's clock when it left. It comes back untouched in `pong`. */
  | { t: "ping"; c1: number }
  /** The sender's world fingerprint at `tick`, for desync detection. */
  | { t: "hash"; tick: number; hash: number };

export type ServerMessage =
  | {
      t: "welcome";
      player: PlayerId;
      room: string;
      /**
       * Beat zero, on the *server's* clock. Both devices convert it into their
       * own with the offset from `ping`/`pong`, which is why the room hands out
       * one timestamp rather than each device picking its own.
       */
      startMs: number;
      peers: number;
    }
  /** Someone joined or left. Two is a game; one is a wait. */
  | { t: "peers"; peers: number }
  | { t: "input"; player: PlayerId; tick: number; commands: Command[] }
  | { t: "confirm"; player: PlayerId; tick: number }
  /** `s1` when the ping arrived, `s2` when the pong left — the four-timestamp measure. */
  | { t: "pong"; c1: number; s1: number; s2: number }
  | { t: "hash"; player: PlayerId; tick: number; hash: number }
  | { t: "error"; why: string };

export function encode(message: ClientMessage | ServerMessage): string {
  return JSON.stringify(message);
}

/**
 * Parse without trusting. Anything that is not a message this version knows
 * comes back as `null` rather than as a half-built object: a malformed frame
 * must fail here, where it is one dropped packet, and not three layers down
 * where it is a desync nobody can explain.
 */
export function decodeClient(raw: string): ClientMessage | null {
  const m = parse(raw);
  if (!m) return null;
  switch (m.t) {
    case "join":
      return typeof m.v === "number" ? { t: "join", v: m.v } : null;
    case "input":
      return isTick(m.tick) && Array.isArray(m.commands)
        ? { t: "input", tick: m.tick, commands: m.commands as Command[] }
        : null;
    case "confirm":
      return isTick(m.tick) ? { t: "confirm", tick: m.tick } : null;
    case "ping":
      return typeof m.c1 === "number" ? { t: "ping", c1: m.c1 } : null;
    case "hash":
      return isTick(m.tick) && typeof m.hash === "number"
        ? { t: "hash", tick: m.tick, hash: m.hash }
        : null;
    default:
      return null;
  }
}

export function decodeServer(raw: string): ServerMessage | null {
  const m = parse(raw);
  if (!m) return null;
  switch (m.t) {
    case "welcome":
      return isPlayer(m.player) && typeof m.startMs === "number" && typeof m.room === "string"
        ? {
            t: "welcome",
            player: m.player,
            room: m.room,
            startMs: m.startMs,
            peers: Number(m.peers) || 0,
          }
        : null;
    case "peers":
      return typeof m.peers === "number" ? { t: "peers", peers: m.peers } : null;
    case "input":
      return isPlayer(m.player) && isTick(m.tick) && Array.isArray(m.commands)
        ? { t: "input", player: m.player, tick: m.tick, commands: m.commands as Command[] }
        : null;
    case "confirm":
      return isPlayer(m.player) && isTick(m.tick)
        ? { t: "confirm", player: m.player, tick: m.tick }
        : null;
    case "pong":
      return typeof m.c1 === "number" && typeof m.s1 === "number" && typeof m.s2 === "number"
        ? { t: "pong", c1: m.c1, s1: m.s1, s2: m.s2 }
        : null;
    case "hash":
      return isPlayer(m.player) && isTick(m.tick) && typeof m.hash === "number"
        ? { t: "hash", player: m.player, tick: m.tick, hash: m.hash }
        : null;
    case "error":
      return typeof m.why === "string" ? { t: "error", why: m.why } : null;
    default:
      return null;
  }
}

// biome-ignore lint/suspicious/noExplicitAny: the wire is untyped by definition.
function parse(raw: string): any | null {
  try {
    const m = JSON.parse(raw);
    return m && typeof m === "object" && typeof m.t === "string" ? m : null;
  } catch {
    return null;
  }
}

const isTick = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0;
const isPlayer = (n: unknown): n is PlayerId => n === 1 || n === 2;
