import type { PlayerId } from "@neon-spore/net";
import { namesOf, type Seat, send } from "./seat.js";
import type { StartGate } from "./start-gate.js";

/**
 * The gate's two sockets-facing halves: telling both phones who has pressed,
 * and stamping beat zero when the second press lands.
 *
 * Split from `start-gate.ts` because that file is the *rule* and this one
 * touches a `WebSocket`. The repository's root type check excludes
 * `apps/server/src` — it has no Cloudflare Workers types in it — so a test
 * that wanted the rule could not reach it while the rule imported a socket.
 * Now it can: `start-gate.ts` imports nothing but a `PlayerId`.
 */

/** Which seats have pressed, to both devices. The whole set, never an edge. */
export function tellReady(gate: StartGate, seats: Seat[]): void {
  const players = gate.players();
  for (const seat of seats) send(seat.socket, { t: "ready", players });
}

/** What `pressStart` needs of the room, so the gate need not know the rest. */
export interface StartRoom {
  code: string;
  /** Beat zero as it stands: non-zero means a run is already stamped. */
  startMs: number;
  seats: Seat[];
  /** What this pair got to, handed back untouched. See `tally.ts`. */
  best: { wave: number; score: number } | null;
  /** Write the new beat zero down, so a hibernating room keeps it. */
  persist: (startMs: number) => Promise<void>;
}

/**
 * A seat says it is ready.
 *
 * Answers the room's new beat zero, or 0 when this press did not complete the
 * pair — the caller keeps its own field, because the room is what owns it.
 * A press is refused outright once a run is stamped: one arriving mid-game
 * would otherwise restart the game under two people playing it.
 */
export async function pressStart(
  gate: StartGate,
  player: PlayerId,
  room: StartRoom,
  leadMs: number,
): Promise<number> {
  if (room.startMs !== 0 || gate.has(player)) return 0;
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
    });
  }
  return startMs;
}
