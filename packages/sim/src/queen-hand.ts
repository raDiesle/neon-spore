import type { QueenState } from "./boss-state.js";
import { type QueenGesture, queenGesture, queenMarkCol, queenPhase } from "./queen-mark.js";
import type { Command, Creature } from "./types.js";
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
 * **Only player 1's thumb.** The seat that is shown the ring on the real mark
 * cannot be the seat whose thumb answers it, or the bloom is answered with
 * nobody speaking. Player 2's press on a mark that is asking is refused, and
 * said (`queenRefuse`), so the mark she touched answers it in red the way
 * every mark does (`render/mark-feedback.ts`); it moves nothing.
 *
 * Each verdict is said once per press, never per move of the thumb: a flinch
 * shuts the window, and a second press inside the beat before it closes is
 * not a second flinch; a hold is said when the thumb comes onto a mark, not
 * while it rests there.
 */
const P1 = 1;

export function queenHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "queenMark") return;
  const boss = world.boss;
  if (boss === null || boss.kind !== "queen") return;
  const side = command.id === 0 ? -1 : command.id === 1 ? 1 : 0;
  if (side === 0) return;
  const queen = world.creatures.find((c) => c.id === boss.creatureId);
  if (queen === undefined) return;
  const gesture = queenGesture(boss);
  if (player !== P1) {
    if (command.on && queenAsks(boss, queen) !== null) {
      world.events.push({ type: "queenRefuse", ...markAt(queen, side), player });
    }
    return;
  }
  if (gesture === "pry") pryMark(world, boss, queen, side, command.on);
  else if (gesture === "hold") holdMark(world, boss, queen, side, command.on);
}

/**
 * What her picture is asking of player 1's thumb, or `null` between windows:
 * a pry while a window is announced or open under `pry` and nobody has pried
 * it yet, a hold for any window under `hold`. Player 2's press is refused on
 * exactly these beats, and the picture rings the marks on them
 * (`render/queen-grip.ts`, `render/queen-marks.ts`).
 */
export function queenAsks(boss: QueenState, queen: Creature): QueenGesture | null {
  if (boss.openBeat === -1) return null;
  const gesture = queenGesture(boss);
  if (gesture === "pry") return boss.pryBeat === -1 && queen.color === null ? "pry" : null;
  return gesture === "hold" ? "hold" : null;
}

/** Where a mark's event is said: its own column, under her row. */
function markAt(queen: Creature, side: -1 | 1): { col: number; row: number; side: -1 | 1 } {
  return { col: queenMarkCol(queen.col, side), row: queen.row, side };
}

/** A press on a mark during a `pry` window: open if it is the real one, flinch if not. */
function pryMark(world: World, boss: QueenState, queen: Creature, side: -1 | 1, on: boolean): void {
  if (!on || boss.openBeat === -1 || boss.pryBeat !== -1 || queen.color !== null) return;
  // Flinched already: the window is shut and waiting for the beat to close it.
  if (boss.closeBeat <= world.beat) return;
  if (side === boss.weakSide) {
    queen.color = boss.tellColor;
    boss.pryBeat = world.beat;
    boss.closeBeat = world.beat + queenPhase(boss).openBeats;
    world.events.push({ type: "queenPry", ...markAt(queen, side) });
    return;
  }
  boss.closeBeat = world.beat;
  world.events.push({ type: "queenFlinch", ...markAt(queen, side) });
}

/** The thumb landing on, or leaving, a mark under `hold`; said as it lands on one. */
function holdMark(
  world: World,
  boss: QueenState,
  queen: Creature,
  side: -1 | 1,
  on: boolean,
): void {
  if (!on) {
    if (boss.holdSide === side) boss.holdSide = 0;
    return;
  }
  if (boss.holdSide === side) return;
  boss.holdSide = side;
  if (boss.openBeat === -1) return;
  world.events.push({ type: "queenHold", ...markAt(queen, side), real: side === boss.weakSide });
}
