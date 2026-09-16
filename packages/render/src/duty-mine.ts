import type { CreatureKind, World } from "@neon-spore/sim";

/**
 * THE MINE's word, which of the two dials it goes under decided by the field
 * rather than by the table.
 *
 * Every other row in `DUTY_WORD` is a fact about a kind: a veil hides its
 * colour from the navigator on every wave it is ever on, so the word "COLOUR"
 * is the pilot's for good. A mine is the one body whose split is **authored** —
 * a wave says which seat is drawn it (`SpawnEntry.sees`), so the same kind
 * can owe the pilot a tile on one wave and the navigator a tile on the next.
 * A fixed row would be right half the time and would tell the other half of
 * the pairs to say a thing they cannot see.
 *
 * So the seat that is drawn the body says **where it is**, and the seat that
 * is not puts the finger down. Both sentences are on the screen at once,
 * which is the point: they are the two halves of one instruction, and neither
 * seat can do the other's half.
 *
 * `duty-fence.ts`'s arrangement exactly, one file over, and the third of
 * these overrides rather than a new idea — `duty.ts`'s `wordsFor` reads it
 * beside the wall's and the clingers'.
 */

/** What the seat that can see one says, and what the seat that cannot does. */
const SEEING = "SAY THE TILE";
const BLIND = "TAP THE TILE";

export function mineWord(kind: CreatureKind, seat: "p1" | "p2", world: World): string | null {
  if (kind !== "mine") return null;
  // Every mine on the field, because two of them may be set opposite ways
  // round and a seat drawn one of the two owes both sentences — it has a tile
  // to say and a tile to find. `dutyWord` joins them.
  const sees = world.creatures.some((c) => c.kind === "mine" && seatOf(c.mineSees) === seat);
  const blind = world.creatures.some((c) => c.kind === "mine" && seatOf(c.mineSees) !== seat);
  if (sees && blind) return `${SEEING} · ${BLIND}`;
  return sees ? SEEING : blind ? BLIND : null;
}

/** The seat a mine is drawn on, with the default a body built without one
 * takes — the navigator's, which is the wisp's seat and the row `TALKER` and
 * `DUTY_WORD` are both written against. */
function seatOf(sees: 1 | 2 | undefined): "p1" | "p2" {
  return sees === 1 ? "p1" : "p2";
}
