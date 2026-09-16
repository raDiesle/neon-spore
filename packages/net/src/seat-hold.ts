/**
 * **How long a room holds a seat for a socket that has stopped answering.**
 *
 * One number, in the one package both ends of the wire already share, because
 * both ends have to act on it and they were acting on two different readings
 * of it. The room evicts a seat silent this long (`apps/server/src/seat.ts`)
 * and refuses everybody until it does — including the very phone whose seat it
 * is. The phone, for its part, reaches for the room again while it waits, and
 * the window it reaches across has to be *this* one
 * (`apps/game/src/link-socket.ts`, `RECLAIM_TRIES`).
 *
 * It was six attempts at 900 ms, which is five and a half seconds, against a
 * hold of ten: every reclaim ran out of tries four and a half seconds before
 * the seat it was reaching for came free, so a phone whose connection vanished
 * mid-run — a locked screen, a tunnel, wifi handing over — was told its
 * connection was gone while the room was still keeping its chair. Two numbers
 * in two packages could not be held to each other; one can.
 *
 * A socket whose TCP connection simply vanished stays open at the edge for
 * minutes, and every seat speaks every 700 ms, so more than a dozen missed
 * pings is a connection that is gone whatever the socket still says.
 */
export const SEAT_HELD_MS = 10_000;
