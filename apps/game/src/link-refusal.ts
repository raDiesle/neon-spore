import type { LinkState, RefusalCode } from "@neon-spore/net";

/**
 * What a room turning this device away means, as three rules and no state.
 *
 * They were three expressions inside `createLink`, which is where they read
 * least well: each one is a claim about the room's behaviour rather than about
 * this device's, and the difference between them is the whole of the seat
 * reclaim. Pure, so `link-full.test.ts` can ask them directly.
 */

/** The state a refusal puts the link into. `full` is not a fault of the line. */
export function stateAfterRefusal(code: RefusalCode): LinkState {
  return code === "full" ? "full" : "lost";
}

/** The two states the room turned this device away in, and will again. */
export function turnedAway(state: LinkState): boolean {
  return state === "full" || state === "desync";
}

/**
 * `full` at a room this device already holds a seat in.
 *
 * A phone whose connection vanished — a locked screen, a tunnel, wifi handing
 * over to the mobile network — comes back 900 ms later, and for as long as the
 * room takes to notice the old socket is dead it answers `full`: to the very
 * device whose seat it is holding. That is a race, not a refusal. The room
 * evicts a seat silent for ten seconds (`apps/server/src/seat.ts`), and the
 * attempts `link-socket.ts` has left are the window in which that happens, so
 * the answer is to keep reaching rather than to give the seat up.
 *
 * Seat 0 is a device the room never answered, and for it `full` means what it
 * says: two other people are in there.
 */
export function reclaimingSeat(state: LinkState, player: 0 | 1 | 2): boolean {
  return state === "full" && player !== 0;
}

/** Whether reaching for the room again makes any sense at all. */
export function worthReaching(state: LinkState, player: 0 | 1 | 2, room: string): boolean {
  return room !== "" && (!turnedAway(state) || reclaimingSeat(state, player));
}
