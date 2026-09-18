import type { QueenState } from "./boss-state.js";
import { queenGesture, queenMarkCol, queenPhase } from "./queen-mark.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **Player 1's thumb on THE BULB QUEEN's marks**, off the wire, on the tick.
 *
 * Two of her three phases are answered on her picture rather than on the
 * panel (`QUEEN_GESTURES`, `queen-mark.ts`), and both on the same target,
 * `queenMark`, with `id` 0 for the left mark and 1 for the right — two
 * gestures on one name, `instarMark`'s way, read off `on`:
 *
 * - **`pry`** is a press. From the announcement to `closeBeat` the real mark
 *   is armoured until his thumb lands on it; then it opens for the phase's
 *   `openBeats`, and player 2's colour is what it wants. The *other* mark
 *   pressed is a flinch: the window shuts on the next beat with nothing
 *   fired, and `queenFlinch` says so — the one punishment a miss has now.
 * - **`hold`** is where the thumb is. `holdSide` follows it on and off, and
 *   the beat reads it: on the real mark, a SCREAM bloom stands open past its
 *   one beat (`holdBloom`), up to `queenHoldBeats`; off, she shuts.
 *
 * **Only player 1's thumb**, and player 2's is ignored without a sound: the
 * seat that is shown the ring on the real mark cannot be the seat whose
 * thumb answers it, or the bloom is answered with nobody speaking. The look
 * lane never draws him the handle, so there is nothing to refuse.
 */
const P1 = 1;

export function queenHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "queenMark") return;
  if (player !== P1) return;
  const boss = world.boss;
  if (boss === null || boss.kind !== "queen") return;
  const side = command.id === 0 ? -1 : command.id === 1 ? 1 : 0;
  if (side === 0) return;
  const gesture = queenGesture(boss);
  if (gesture === "pry") pryMark(world, boss, side, command.on);
  else if (gesture === "hold") holdMark(boss, side, command.on);
}

/** A press on a mark during a `pry` window: open if it is the real one, flinch if not. */
function pryMark(world: World, boss: QueenState, side: -1 | 1, on: boolean): void {
  if (!on || boss.openBeat === -1 || boss.pryBeat !== -1) return;
  const queen = world.creatures.find((c) => c.id === boss.creatureId);
  if (queen === undefined || queen.color !== null) return;
  if (side === boss.weakSide) {
    queen.color = boss.tellColor;
    boss.pryBeat = world.beat;
    boss.closeBeat = world.beat + queenPhase(boss).openBeats;
    return;
  }
  boss.closeBeat = world.beat;
  world.events.push({ type: "queenFlinch", col: queenMarkCol(queen.col, side), side });
}

/** The thumb landing on, or leaving, a mark under `hold`. */
function holdMark(boss: QueenState, side: -1 | 1, on: boolean): void {
  if (on) boss.holdSide = side;
  else if (boss.holdSide === side) boss.holdSide = 0;
}
