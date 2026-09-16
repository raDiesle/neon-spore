/**
 * The paragraph under each **boss's** card — the ones played on the field.
 *
 * Split out of `ship-notes.ts` when THE WELL's took that file past its 250-line
 * limit, and along the seam the director has now cut three times for the same
 * growth: `ship-fields-round.ts`, `ship-notes-round.ts` and `ship-notes-hold.ts`
 * are each the half that grows, and this is the fourth. What is left next door
 * is a dial on the field itself — a creature, a rock, a fault — and every name
 * here is a *fight* installed above one, which `mechanics-bosses.ts` in
 * `packages/content` already treats as its own group for the same reason.
 *
 * The rounds are not in here: a round takes the field away and brings its own
 * picture, and its notes went next door first (`ship-notes-round.ts`). These
 * are the bosses with a body, or a mechanism, standing over the real grid.
 *
 * Spread into `GROUP_NOTE` rather than read beside it, so the totality guard
 * still holds: a card added to `GroupName` and left without a paragraph in any
 * of these files is the same compile error it always was.
 */
export const BOSS_NOTES = {
  WARDEN: "The ring boss's own clocks, plates and worth.",
  "THE CAIRN — a pile of rocks taken apart by hand": "Its row, its rocks, and its patience.",
  "THE WELL — the field drawn inside out on one screen":
    "Nothing to turn. The projection is render's own (well.ts), and the only " +
    "thing a dial here could move is how the picture reads — which is what a " +
    "VERSUS candidate is for, not a slider.",
  "THE SPLICE — straws fed in the order the numbers say":
    "How far over the plating the mouths stand, what row the numbers sit on, " +
    "and how long a number takes to come down its straw. How many straws a " +
    "round has and where they run are not here: the count follows from the " +
    "round and the tangle is laid from the run's own seed (sim/splice-tangle.ts).",
  VANE: "The arm boss's own pins and worth.",
  MIRROR: "The boss that throws a Simon sequence back, and its own worth.",
  QUEEN: "The petal boss's own row, regrowth and worth.",
  MAZE:
    "A wheel of rings behind the ship, with ways in round its rim. Player 1 turns " +
    "it and clicks a way in onto a column; player 2 fires. Both screens see the " +
    "same light — the wheel is authored in packages/content/src/maze-rounds.ts.",
} as const;
