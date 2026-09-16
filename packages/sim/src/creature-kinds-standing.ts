/**
 * **The two bodies that stand on a tile**, and the only two whose answer is a
 * square rather than a column.
 *
 * Cut out of `creature-kinds.ts` for `creature-kinds-handed.ts`' reason and at
 * the moment that file predicted once more: the roster was left with room for
 * the next creature, and the next creature filled it. The seam is one the game
 * already draws in three other places — neither of these falls, so neither
 * reaches the hull by arriving; each is drawn on one seat and not the other;
 * and each turns the lettered grid on for **both** of them
 * (`render/coord-grid.ts`), which is the only switch in the game that exists
 * so a player can say a tile out loud.
 *
 * What separates them is what the tile is *for*. A wisp's tile is a target and
 * a wisp is answered by a bolt, so the pair's sentence is a place the cannon
 * has to be. A mine's tile is answered by a finger on the tile itself, so the
 * sentence is a place a hand has to go — and the seat that cannot see it is
 * the seat that has to put the hand there.
 *
 * One arm of `CreatureKind` and not a type anything switches on by itself:
 * every consumer still walks the whole roster, which is what keeps a new kind a
 * compile error (`creature-roster.ts`, `kind-code.ts`).
 */
export type StandingKind =
  /**
   * Drawn on player 2's screen and on nobody else's, and never in the same
   * tile twice: every `wispDwellBeats` it stands somewhere else on the field,
   * drawn from the seeded rng. It does not fall, so it never reaches the hull
   * and never leaves on its own — the wave stays open until it is shot. The
   * whole of it is in `wisp.ts`, and it carries no state of its own beyond the
   * tile it is going to: where it is *is* `col` and `row`, and when it moves
   * is the shared beat.
   */
  | "wisp"
  /**
   * A wisp standing still, answered by a thumb instead of a bolt. It appears
   * on a tile and never moves; one seat is drawn it and the other, looking at
   * an empty field, has to tap the exact tile. A tap on one of the four
   * neighbouring tiles is a hull hit in its colour; a tap farther off costs no
   * damage but takes a beat off its fuse, so feeling around is never free; and
   * the fuse running out is a hull hit and the body gone. Which seat sees it
   * is the wave's to choose, not this file's. `Creature.mineFuse` and
   * `Creature.mineSees` are its state, and `mine.ts` is the whole of it.
   */
  | "mine";
