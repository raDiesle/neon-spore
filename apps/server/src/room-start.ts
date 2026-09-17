import type { PlayerId } from "@neon-spore/net";
import type { RoomFacts } from "./room-tell.js";
import { hostOf, namesOf, type Seat, send } from "./seat.js";
import type { StartGate } from "./start-gate.js";

/**
 * The gate's two sockets-facing halves: telling both phones who has pressed,
 * and stamping beat zero when the second press lands.
 *
 * Split from `start-gate.ts` because that file is the *rule* and this one
 * touches a `WebSocket`: the gate is a set of presses and a table of cases, and
 * nothing it decides needs a socket to say it. The typecheck used to insist on
 * the same split as well — the root config took this package's tests without
 * workerd's globals — and it does not any more: `apps/server` is checked once,
 * by itself, so a test may import any file in it
 * (`apps/server/tsconfig.json`, `test/seat.test.ts`).
 */

/** Which seats have pressed, to both devices. The whole set, never an edge. */
export function tellReady(gate: StartGate, seats: Seat[]): void {
  const players = gate.players();
  for (const seat of seats) send(seat.socket, { t: "ready", players });
}

/**
 * What `pressStart` needs of the room, so the gate need not know the rest: the
 * four facts a welcome is made of (`room-tell.ts`), the seats to send it to,
 * and the one write.
 */
export interface StartRoom extends RoomFacts {
  seats: Seat[];
  /** Write the new beat zero down, so a hibernating room keeps it. */
  persist: (startMs: number) => Promise<void>;
}

/**
 * A seat says it is ready.
 *
 * Answers the room's new beat zero, or 0 when this press did not complete the
 * pair — the caller keeps its own field, because the room is what owns it.
 *
 * **A run already stamped is restarted rather than protected**, and that is a
 * change of 13 September 2026. A single press used to be refused outright once
 * beat zero existed, on the ground that one arriving mid-game would restart the
 * game under two people playing it — but the gate has never been able to start
 * anything on one press, and two presses from two seats are not an accident,
 * they are the pair agreeing. What made the old refusal wrong is the case it
 * left with no answer at all: two phones whose worlds have parted
 * (`packages/net`'s fingerprints) are each holding a game the other is not
 * playing, and the only way out was for somebody to leave the room. Now both
 * hold READY on the room screen and the room stamps a fresh beat zero, with
 * `best` on the welcome so the two of them come back on the same wave.
 *
 * The guard against a stray thumb is on the phone rather than here: a READY
 * circle can be held only while both seats are connected, and only when the
 * run has not started, has parted, or was quit
 * (`apps/game/src/join-room.ts` `mayHold`).
 */
export async function pressStart(
  gate: StartGate,
  player: PlayerId,
  room: StartRoom,
  leadMs: number,
): Promise<number> {
  if (gate.has(player)) return 0;
  if (!gate.press(player, room.seats.length)) {
    tellReady(gate, room.seats);
    return 0;
  }
  const startMs = Date.now() + leadMs;
  await room.persist(startMs);
  gate.clear();
  for (const seat of room.seats) {
    send(seat.socket, {
      t: "welcome",
      player: seat.player,
      room: room.code,
      startMs,
      peers: room.seats.length,
      names: namesOf(room.seats),
      best: room.best,
      level: room.level,
      host: hostOf(room.seats),
    });
  }
  return startMs;
}
