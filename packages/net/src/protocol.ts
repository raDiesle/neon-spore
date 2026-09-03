import type { Command } from "@neon-spore/sim";
import { decodeCommands, isTick, isUint32 } from "./command-codec.js";

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

/**
 * The query parameter the version rides on, from `relay.ts` through the
 * worker's `fetch` to `Room.fetch`. It is on the upgrade rather than in a first
 * message because a message can only be read after the socket has been seated
 * and greeted — and, for the second phone, after beat zero has been stamped for
 * the peer. A room that cannot play with this build has to refuse before any of
 * that, which means before `acceptWebSocket`.
 */
export const VERSION_PARAM = "v";

/** 1 = pilot (cannon, trigger, maw), 2 = navigator (shield, colours). */
export type PlayerId = 1 | 2;

/** The other seat. */
export function otherPlayer(player: PlayerId): PlayerId {
  return player === 1 ? 2 : 1;
}

export type ClientMessage =
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
  | { t: "hash"; tick: number; hash: number }
  /**
   * "I have looked up from my screen and I am ready."
   *
   * Beat zero used to be stamped the moment the second phone landed, three
   * seconds ahead, and the pair was dropped onto a field whether or not either
   * of them had noticed. This is what replaced that: the room stamps nothing
   * until **both** seats have pressed.
   *
   * It carries no payload at all, which is the point — it is a tag, and the
   * room knows which seat sent it from the socket it arrived on. A press that
   * named its own seat would be a press one phone could send for the other.
   */
  | { t: "ready" };

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
  /**
   * Which seats have pressed START, whenever that changes.
   *
   * Both devices are told the whole set rather than "the other one pressed",
   * so a phone that reconnects is told the truth by the next one of these
   * instead of having to have heard every earlier edge.
   */
  | { t: "ready"; players: PlayerId[] }
  | { t: "input"; player: PlayerId; tick: number; commands: Command[] }
  | { t: "confirm"; player: PlayerId; tick: number }
  /** `s1` when the ping arrived, `s2` when the pong left — the four-timestamp measure. */
  | { t: "pong"; c1: number; s1: number; s2: number }
  | { t: "hash"; player: PlayerId; tick: number; hash: number }
  /**
   * The room is refusing. `why` is for a log and `code` is for the indicator:
   * a third phone arriving at a room that already has two people in it is not
   * a dropped connection, and telling a player it was one sends them to check
   * their signal over something their signal had nothing to do with.
   */
  | { t: "error"; why: string; code: RefusalCode };

/**
 * Why a room refused, as a closed list — `status.ts` has a word on screen for
 * each of these, and a code with no word is a player staring at a dead game.
 * `other` is what an unknown one decodes to, never what a room sends.
 */
export type RefusalCode = "full" | "protocol" | "other";

const isRefusal = (n: unknown): n is RefusalCode =>
  n === "full" || n === "protocol" || n === "other";

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
    case "input": {
      const commands = isTick(m.tick) ? decodeCommands(m.commands) : null;
      return commands ? { t: "input", tick: m.tick, commands } : null;
    }
    case "confirm":
      return isTick(m.tick) ? { t: "confirm", tick: m.tick } : null;
    case "ping":
      return typeof m.c1 === "number" ? { t: "ping", c1: m.c1 } : null;
    case "hash":
      return isTick(m.tick) && isUint32(m.hash) ? { t: "hash", tick: m.tick, hash: m.hash } : null;
    // No payload to check: the seat is the socket it came in on, and a press
    // that named its own seat would be a press one phone could send for the
    // other. There is nothing here to distrust.
    case "ready":
      return { t: "ready" };
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
    case "ready": {
      // A list of seats, and nothing else may be in it: an unknown number here
      // would become a seat the screen believes in and the room does not.
      const players = Array.isArray(m.players) ? m.players.filter(isPlayer) : null;
      return players && players.length === (m.players as unknown[]).length
        ? { t: "ready", players }
        : null;
    }
    case "input": {
      const commands = isPlayer(m.player) && isTick(m.tick) ? decodeCommands(m.commands) : null;
      return commands ? { t: "input", player: m.player, tick: m.tick, commands } : null;
    }
    case "confirm":
      return isPlayer(m.player) && isTick(m.tick)
        ? { t: "confirm", player: m.player, tick: m.tick }
        : null;
    case "pong":
      return typeof m.c1 === "number" && typeof m.s1 === "number" && typeof m.s2 === "number"
        ? { t: "pong", c1: m.c1, s1: m.s1, s2: m.s2 }
        : null;
    case "hash":
      return isPlayer(m.player) && isTick(m.tick) && isUint32(m.hash)
        ? { t: "hash", player: m.player, tick: m.tick, hash: m.hash }
        : null;
    case "error":
      return typeof m.why === "string"
        ? { t: "error", why: m.why, code: isRefusal(m.code) ? m.code : "other" }
        : null;
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

const isPlayer = (n: unknown): n is PlayerId => n === 1 || n === 2;
