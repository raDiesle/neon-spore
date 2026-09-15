import type { Difficulty, PlayerId, RunMark } from "@neon-spore/net";
import type { RoomSocket } from "./link-socket.js";
import type { Link } from "./link-types.js";

/**
 * **What a phone asks the room for**, and nothing it is told.
 *
 * Four of `Link`'s methods are one message each up the socket and no state on
 * this side: the room answers every one of them on its own messages, which
 * `link.ts` reads. They are here because that file is the room — the clock,
 * the seat, the countdown — and had reached its line limit the day the seat
 * pick joined the three before it. A pick made off the wire is dropped, the
 * way a press is: there is no room to hear it.
 */
export type Asks = Pick<Link, "ready" | "setLevel" | "pickSeat" | "tally">;

export function roomAsks(socket: () => RoomSocket | null): Asks {
  return {
    /** A press, not a start: the room decides what two of them are worth. */
    ready: (): void => socket()?.send({ t: "ready" }),
    /** The difficulty the pair has chosen, up to the room, which hands it back
     * to both phones — so the one that chose and the one that did not take
     * their tempo from the same answer (`sim/difficulty.ts`). */
    setLevel: (next: Difficulty): void => socket()?.send({ t: "level", level: next }),
    /** The seat this phone wants; the room swaps both if it is the host's to
     * ask, and says so on a fresh welcome (`apps/server/src/room-seat.ts`). */
    pickSeat: (seat: PlayerId): void => socket()?.send({ t: "seat", seat }),
    /** How far this device has got, for the room to keep. Stored, never read. */
    tally: (mark: RunMark): void => socket()?.send({ t: "stats", ...mark }),
  };
}
