import { decodeCommands, isTick, isUint32 } from "./command-codec.js";
import { nameFromWire } from "./nickname.js";
import type { ClientMessage, PlayerId, RefusalCode, ServerMessage } from "./protocol.js";

/**
 * The distrusting half of the wire.
 *
 * `protocol.ts` says what a message *is*; this says what to believe. Split
 * when that file reached its line limit, along the seam it already described
 * in its own words: every message here is checked field by field, and anything
 * that is not a message this version knows comes back `null` rather than as a
 * half-built object. A malformed frame must fail here, where it is one dropped
 * packet, and not three layers down where it is a desync nobody can explain.
 */

const isRefusal = (n: unknown): n is RefusalCode =>
  n === "full" || n === "protocol" || n === "other";

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
    case "stats":
      return isTick(m.wave) && isTick(m.score)
        ? { t: "stats", wave: m.wave, score: m.score }
        : null;
    default:
      return null;
  }
}

/**
 * The two seats' names, clamped. Anything that is not a pair of names becomes
 * a pair of blanks rather than a refusal: a peer whose name is nonsense is a
 * peer with no name, which every screen already has a word for, and refusing
 * the whole message over it would drop a `welcome` and take the room with it.
 */
/** A pair's last result, or null. Anything that is not a pair of whole
 * numbers is null rather than a refusal: it is a line on a screen, and losing
 * a `welcome` over it would take the room with it. */
function bestFromWire(value: unknown): { wave: number; score: number } | null {
  const read = value as { wave?: unknown; score?: unknown } | null;
  if (!read || typeof read !== "object") return null;
  return isTick(read.wave) && isTick(read.score) ? { wave: read.wave, score: read.score } : null;
}

function namesFromWire(value: unknown): [string, string] {
  const list = Array.isArray(value) ? value : [];
  return [nameFromWire(list[0]), nameFromWire(list[1])];
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
            names: namesFromWire(m.names),
            best: bestFromWire(m.best),
          }
        : null;
    case "peers":
      return typeof m.peers === "number"
        ? { t: "peers", peers: m.peers, names: namesFromWire(m.names) }
        : null;
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
