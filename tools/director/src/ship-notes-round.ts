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
  "THE DIASTOLE — two hearts on two cadences, one each":
    "Designed on 16 September 2026 in docs/spec/bosses-choreographed.md §7, " +
    "and the safe version of the boss THE CONDUCTOR was deferred for: the " +
    "tempo never bends, but there are two counts on it and neither player can " +
    "see both. The left chamber contracts every diastoleLeftBeats and is " +
    "player 1's; the right every diastoleRightBeats and is player 2's; the " +
    "far chamber is a still grey mass on the other screen, and geometry says " +
    "whose. Three against five meet every fifteen beats and on no beat " +
    "between — a pair of numbers that stopped being coprime would quietly " +
    "stop being the boss. While the left beats alone an ordinary shot of its " +
    "colour takes it on one of its contractions; from the moment the right " +
    "wakes the only thing that lands is the LANCE beam standing in the " +
    "bridge column on a beat every standing chamber is contracting on. " +
    "diastoleChamberHits is each chamber's health and the fight's shape. The " +
    "coincidence and the burst both open one of THE SLOW's windows, whose own " +
    "two dials are under THE BEAT. Nothing about it is authored per wave. " +
    "See sim/diastole.ts, sim/config-diastole.ts, docs/decisions.md #33.",
  "THE BATON — a bead passed down an arm, one seat a beat":
    "Designed on 16 September 2026 in docs/spec/bosses-choreographed.md §10: " +
    "an arm of batonSockets sockets hangs from the top of the middle column " +
    "with one bead in the topmost, and the bead is passed down it by strict " +
    "alternation. Player 1's trigger launches it, and it is in the air for " +
    "batonFlightBeats — THE DRAG, not THE SLOW: the clock never bends, the " +
    "bead is slow — during which a shot of its colour up its column from " +
    "player 2 lands it a socket lower and darkens the one it left. The seat " +
    "that acted is locked out of every control for batonLockBeats. A bead " +
    "nobody hits lands back where it was and relights the socket; a bead left " +
    "sitting batonTurnBeats (batonTightTurnBeats once batonTightenAfter " +
    "handovers are made) settles back to the top. After batonSwingAfter dark " +
    "sockets the arm swings a column either side of the middle; after " +
    "batonShedAfter it sheds its topmost dark socket as a rock every " +
    "batonShedBeats. Out of the last socket the bead falls as a pod, the maw " +
    "takes it, and the arm folds away in batonDownBeats. Nothing about it is " +
    "authored per wave. See sim/baton.ts, sim/config-baton.ts.",
  "THE STARE — an eye that freezes whoever it looks at":
    "The owner asked for this on 16 September 2026: when the boss looks at " +
    "you, you may not shoot, move or use the shield. The eye is away for " +
    "stareAwayBeats, turns for stareTellBeats — that turn is the whole " +
    "fairness of it, and it is one spoken sentence long — then watches one " +
    "seat, rolled from the wave's own rng and shown only to the *other* " +
    "screen. A watched seat that presses anything breaks the hull, which is " +
    "the wave lost. Every look is stareLookGrowBeats longer than the last, to " +
    "stareLookMaxBeats. It is not the whole wave: the arrivals underneath are " +
    "the ones its author wrote, and the seat that is not watched plays on " +
    "alone. Nothing about it is authored per wave.",
  "THE SCOUT — a little ship one of you flies":
    "The round the owner asked for on 16 September 2026, and the first thing " +
    "in the game that flies. The ship opens and puts a little one out: player " +
    "1 turns its nose and burns, and coasts — the drag is what makes it read " +
    "as a ship rather than a cursor. Player 2 is shown every mote and every " +
    "hazard and has no button at all, so the flying is done on their word. " +
    "Collect every mote and the wave is over; a hazard's touch or the clock " +
    "running out costs the hull, which is the wave lost. The arenas are " +
    "authored in packages/content/src/scout-arenas.ts; these dials are how it " +
    "flies, and the top three are the whole feel of it.",
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
