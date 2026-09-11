import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each **round's** card.
 *
 * Split out of `ship-notes.ts` when THE TELL's took that file past its
 * 250-line limit — a file that had been sitting exactly on the ceiling and
 * paying for it (`docs/queue.md`). The seam is the one `ship-fields-round.ts`
 * already cut next door and for the same reason: a round is a whole second
 * game with its own picture, its own panel and its own numbers, there are nine
 * more of them designed, and everything left in `ship-notes.ts` is a dial on
 * the field.
 *
 * Spread into `GROUP_NOTE` rather than read beside it, so the totality guard
 * still holds: a card added to `GroupName` and left without a paragraph in
 * *either* file is the same compile error it always was.
 */
export const ROUND_NOTES = {
  "THE GAUGE — a round with no field in it":
    "A boss wave with no field under it — off for the same reason as the one " +
    "above, since a headless caller has no second thumb to answer it with. On, " +
    "the gaps between acts may carry a round that is not the field: a needle " +
    "walked by drift and corrected by a valve. See gauge.ts, gauge-round.ts.",
  "THE FLEET — a chart only one of you can read":
    "A lattice of squares with ships hidden in it. Player 1 sees every hull and " +
    "holds the only trigger; player 2 walks the sights a square at a time and is " +
    "shown nothing but water. The clock is the whole of the danger — running out " +
    "of it breaks the hull. See fleet.ts, config-fleet.ts.",
  "SNAKE — a round the ship is the body of":
    "The other built round, and the first control that moves something. The " +
    "ship shrinks into a snake that never stops: player 2 turns it a quarter " +
    "turn at a time and is shown nothing standing in the arena, player 1 has a " +
    "shot and a mouth and cannot steer. Shoot every enemy and swallow every " +
    "point and the round is won; touch an enemy, take a point with the mouth " +
    "shut, hit a wall or your own back, and it starts over for a few points of " +
    "hull. The arenas are a map per round, edited on the wave that carries it " +
    "and stored in packages/content/src/snake-rounds.ts. See snake.ts, " +
    "snake-move.ts.",
  "PINBALL — a table the ship's cannon fires up into":
    "The third built round, and the first body in the game under an " +
    "acceleration. The ship stays a ship and its cannon is both the gun and " +
    "the glove: player 1 slides the cannon on the ordinary strip and stops the " +
    "needle, player 2 picks the strength and fires — and then the same cannon " +
    "has to be under the ball when it falls back. A dropped ball costs the " +
    "hull where it fell; the clock running out costs it more. The ball is " +
    "stepped on the tick in thousandths of a tile, so every number here is " +
    "per tick.",

  "THE PULSE — the same song on two screens":
    "Four lanes of arrows onto four buttons, and both seats have the same four. " +
    "The two windows say how forgiving a thumb on glass is; the meter numbers say " +
    "how many misses a stage survives. The chart itself is not here — it is bars of " +
    "text in packages/content/src/pulse-stages.ts.",
} satisfies Partial<Record<GroupName, string>>;
