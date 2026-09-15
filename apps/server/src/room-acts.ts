import type { PlayerId } from "@neon-spore/net";
import type { RoomMemory } from "./room-memory.js";
import type { RoomActs } from "./room-route.js";
import { seatSwap } from "./room-seat.js";
import { type RoomFacts, tellSeats } from "./room-tell.js";
import type { Seat } from "./seat.js";
import type { StartGate } from "./start-gate.js";

/**
 * **The three acts that change what the room remembers** — a tempo, a seat,
 * a tally — and the fresh welcome the first two owe both phones.
 *
 * `room-route.ts` decides which act a message is; `room.ts` keeps the two that
 * are about sockets, because relaying a message and taking a press are things
 * done *to* the seats. These three are done to `room-memory.ts` instead, and
 * they were the last of `room.ts` that had nothing to do with a socket: nine
 * lines of the object literal it handed the switch, each reading a field,
 * writing it and telling both phones what it now says.
 *
 * They take what they need rather than the room, the way `room-tell.ts` and
 * `room-start.ts` do: the room's own fields are private and a function given
 * the memory and three verbs cannot reach past them.
 */

/**
 * What these acts need of the room beside its memory: the one sentence it says
 * about itself (`room-tell.ts`), and the gate a swap empties.
 */
export interface Retelling {
  gate: StartGate;
  seats(): Seat[];
  facts(): RoomFacts;
}

export function roomActs(
  me: Seat,
  mem: RoomMemory,
  room: Retelling,
): Pick<RoomActs, "level" | "seat" | "stats"> {
  // Both phones read a tempo and a seat off a welcome, so both get one.
  const retell = () => tellSeats(room.seats(), room.facts(), room.gate);
  return {
    level: (level) => {
      // **A game that already exists does not change its difficulty** (the
      // owner, 15 September 2026). The tempo is picked once, on the room screen
      // while the game is being made, and beat zero is when it stops being made
      // — so a phone that reaches that screen again mid-run cannot re-tempo the
      // run underneath it. The screen already refuses (`join-room.ts`
      // `mayShape`); this is the half that does not depend on the phone.
      if (mem.startMs !== 0) return;
      // The field is set before the write is awaited, so the welcome that goes
      // out on the next line already says the new tempo (`room-memory.ts`).
      void mem.setLevel(level);
      retell();
    },
    seat: (seat: PlayerId) => {
      const swapped = seatSwap(me, seat, mem.startMs, mem.swapped);
      if (swapped === null) return;
      void mem.setSwapped(swapped);
      // A press was for a seat that is now somebody else's.
      room.gate.clear();
      retell();
    },
    stats: (tally) => {
      void mem.takeStats(tally);
    },
  };
}
