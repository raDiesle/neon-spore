import {
  encode,
  NAME_PARAM,
  nameFromWire,
  otherPlayer,
  type PlayerId,
  type RefusalCode,
  SEAT_HELD_MS,
  type ServerMessage,
} from "@neon-spore/net";

/**
 * A seat, and everything one does to a socket that holds one.
 *
 * Split from `room.ts` along the seam it already had: that file is the room —
 * who is in it, when the run starts, what gets relayed to whom — and this is
 * the handful of things done *to* a socket, none of which need to know any of
 * that. Every one of them swallows a socket that has already gone away, because
 * from here that is not an error: the close handler is on its way and it is the
 * one that tells the survivor.
 */

/**
 * How long a seat may go without a word before the room stops counting it.
 *
 * A socket whose TCP connection simply vanished — a screen locked, a train in a
 * tunnel, wifi handing over to the mobile network, which are exactly the cases
 * `link-socket.ts` reconnects for — stays open here until the edge times it
 * out, minutes later. The phone comes back 900 ms after it left, finds two
 * seats taken and is told the room is full: turned away from a seat that is
 * its own. Every seat pings every 700 ms, so more than a dozen missed pings is
 * a connection that is gone whatever the socket still says.
 *
 * **The figure is `SEAT_HELD_MS`, one package down**, because it is not this
 * room's private business: it is the window the turned-away phone has to keep
 * reaching across, and the two ends held two different readings of it until
 * there was one number to read (`packages/net/src/seat-hold.ts`).
 *
 * A `vars` binding of the same name overrides it, which is how the Durable
 * Object test proves the eviction without sitting still for ten seconds.
 */
export const SEAT_SILENT_MS = SEAT_HELD_MS;

export interface Seat {
  socket: WebSocket;
  player: PlayerId;
  /** What this player is called, or "" if they gave no name. */
  name: string;
  /** Whether this is the phone that opened the room — see `HOST_TAG`. */
  host: boolean;
}

/**
 * Which seat a socket holds, as a tag rather than a field: hibernation wakes
 * the object with nothing but its sockets, and a tag survives that where a Map
 * does not.
 *
 * **The tag is the chair the socket was given on arrival, not the seat it
 * holds.** A tag cannot be changed once the socket is accepted, and the pair
 * may swap seats on the room screen — so the room keeps one bit, `swapped`,
 * and every read of a seat goes through it (`room-seat.ts`). Both sockets
 * flip together, which is what a swap is.
 */
export const seatTag = (player: PlayerId): string => `p${player}`;

/**
 * The phone that opened the room, as a third tag: the one whose pick of seat
 * and tempo the room takes for both. Whoever arrives at a room nobody hosts
 * is its host, so a host that drops and comes back is the host again.
 */
export const HOST_TAG = "host";

/**
 * A player's name, as a second tag on the same socket and for the same reason
 * the seat is one: hibernation wakes this object holding nothing but sockets.
 *
 * The room carries the name and never reads it — a server with an opinion
 * about what a player is called is a server with an opinion about the game.
 * It is clamped on the way in by `nameFromWire`, which is the same rule both
 * clients apply on the way out, so nothing longer or stranger than a name can
 * be stored here at all.
 */
const NAME_PREFIX = "n:";
export const nameTag = (name: string): string => `${NAME_PREFIX}${name}`;
export const nameFromTags = (tags: string[]): string =>
  tags.find((tag) => tag.startsWith(NAME_PREFIX))?.slice(NAME_PREFIX.length) ?? "";

/**
 * The two seats' names in seat order, for the wire.
 *
 * Always a pair, whether or not both seats are filled: a screen that reads
 * `names[1]` for player 2 must not have to know how many people are in the
 * room to do it, and "" is what an empty seat is called.
 */
/**
 * The seat an arrival holds and the tags that say so.
 *
 * The first phone in is player 1 and the second player 2 — through the swap
 * bit, so the tag is the chair and the seat is what the room reads
 * (`seatTag`). The name rides the upgrade beside the version,
 * clamped on the way in by the same rule both clients apply on the way out.
 * The host tag goes to whoever arrives at a room nobody hosts.
 */
export function arrivalTags(
  seats: readonly Pick<Seat, "player" | "host">[],
  swapped: boolean,
  url: string,
): { player: PlayerId; tags: string[] } {
  const player: PlayerId = seats.some((s) => s.player === 1) ? 2 : 1;
  const name = nameFromWire(new URL(url).searchParams.get(NAME_PARAM));
  const tags = [tagFor(player, swapped), nameTag(name)];
  if (!seats.some((s) => s.host)) tags.push(HOST_TAG);
  return { player, tags };
}

/** The seat of the host, for the wire, or 0 when nobody here opened the room. */
export function hostOf(seats: readonly Seat[]): PlayerId | 0 {
  return seats.find((s) => s.host)?.player ?? 0;
}

export function namesOf(seats: readonly Seat[]): [string, string] {
  return [
    seats.find((s) => s.player === 1)?.name ?? "",
    seats.find((s) => s.player === 2)?.name ?? "",
  ];
}

/**
 * When this seat was last heard from. Kept as the socket's attachment rather
 * than in a field, for the reason the seat itself is a tag: hibernation wakes
 * this object with nothing but its sockets.
 */
export function stamp(socket: WebSocket): void {
  try {
    socket.serializeAttachment(Date.now());
  } catch {
    // A socket already on its way out. The close handler is next.
  }
}

export function lastSeen(socket: WebSocket): number {
  const seen = socket.deserializeAttachment();
  return typeof seen === "number" ? seen : 0;
}

/** Let go of this end. A socket already gone raises nothing worth catching. */
export function hangUp(socket: WebSocket): void {
  try {
    socket.close(1001, "gone");
  } catch {}
}

/**
 * A completed upgrade that says one sentence and hangs up.
 *
 * `accept()` and not `ctx.acceptWebSocket()`: this socket lives for one message
 * and must never be hibernated, tagged or counted among the seats. The close
 * code is in the private 4000 range so it cannot be mistaken for one of the
 * protocol's own.
 */
export function refuse(code: RefusalCode, why: string): Response {
  const pair = new WebSocketPair();
  const server = pair[1];
  server.accept();
  send(server, { t: "error", why, code });
  server.close(4000, code);
  return new Response(null, { status: 101, webSocket: pair[0] });
}

export function send(socket: WebSocket, message: ServerMessage): void {
  try {
    socket.send(encode(message));
  } catch {
    // A socket that has already gone away is not an error worth propagating:
    // the close handler is on its way and will tell the survivor.
  }
}

/**
 * Which seat a socket holds, read off its tags and through the room's one
 * swap bit (`seatTag`).
 *
 * These three live here rather than on `Room` because a tag is this file's
 * idea: hibernation wakes the object holding nothing but its sockets, so
 * "which seat is this" and "what is this player called" are both questions
 * only the tags can answer, and the room should not have to know that.
 */
export function playerOfSocket(
  ctx: DurableObjectState,
  socket: WebSocket,
  swapped: boolean,
): PlayerId | null {
  for (const tag of ctx.getTags(socket)) {
    if (tag === seatTag(1)) return swapped ? 2 : 1;
    if (tag === seatTag(2)) return swapped ? 1 : 2;
  }
  return null;
}

/** The chair to tag an arrival with so that it *holds* `player` (`seatTag`). */
export function tagFor(player: PlayerId, swapped: boolean): string {
  return seatTag(swapped ? otherPlayer(player) : player);
}

export function seatOfSocket(
  ctx: DurableObjectState,
  socket: WebSocket,
  swapped: boolean,
): Seat | null {
  const player = playerOfSocket(ctx, socket, swapped);
  return player ? seatAt(ctx, socket, player) : null;
}

function seatAt(ctx: DurableObjectState, socket: WebSocket, player: PlayerId): Seat {
  const tags = ctx.getTags(socket);
  return { socket, player, name: nameFromTags(tags), host: tags.includes(HOST_TAG) };
}

/**
 * The seats that are actually occupied. A socket that has not spoken in
 * `silentMs` is hung up on and left out of the count — a phone whose
 * connection vanished is not holding its seat against its own return.
 */
export function occupiedSeats(ctx: DurableObjectState, silentMs: number, swapped: boolean): Seat[] {
  const out: Seat[] = [];
  const now = Date.now();
  for (const socket of ctx.getWebSockets()) {
    const player = playerOfSocket(ctx, socket, swapped);
    if (!player) continue;
    if (now - lastSeen(socket) > silentMs) {
      hangUp(socket);
      continue;
    }
    out.push(seatAt(ctx, socket, player));
  }
  return out;
}
