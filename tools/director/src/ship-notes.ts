import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each card's heading, and nothing else.
 *
 * Split out of `ship-groups.ts` when THE CAROM took that file past its
 * 250-line limit, and along the seam that file's own doc has described since
 * it was itself cut out of `ship-fields.ts`: a name, an order and a note are
 * three things, and only the third is prose. What stayed next door is the
 * `GroupName` union and the order the cards are read in — a closed list a
 * reader can hold in one screen, and the thing every other file in the
 * director actually imports. This is the half nobody reads top to bottom: one
 * paragraph per mechanic with a dial of its own, arriving one at a time and
 * never revisited.
 *
 * `Record<GroupName, string>` is what makes the split safe. A card added to
 * the union next door and left without a paragraph here is a compile error,
 * exactly as a `SimConfig` field left out of `FIELD_GROUP` is — the same guard
 * one step along the same chain.
 *
 * Re-exported from `ship-groups.ts`, so nothing that already reaches for
 * `GROUP_NOTE` through that file had to move.
 *
 * A `Record<GroupName, string>` rather than a `switch`: a group name is a
 * union, but what is wanted here is a total map from it, which is the
 * object-shaped equivalent of the `assertNever` `effects-spark.ts` uses for
 * `SimEvent`.
 */
export const GROUP_NOTE: Record<GroupName, string> = {
  "THE LID — an armoured eye held open by a hand":
    "An armoured eye with a cord hanging off it. Player 1 takes the cord and " +
    "pulls it aside; the two plates over the lens part from the middle " +
    "outwards in proportion to the tension, and only while they stand fully " +
    "apart does a shot of the lens's own colour land. Let go and they shut, so " +
    "the pull and the shot are one moment in two hands rather than two things " +
    "done in an order. Nothing about it is hidden from either screen — what " +
    "the pair has to agree on is when. See lid.ts.",

  "PINBALL — a table the ship is the bucket of":
    "The third built round, and the first body in the game under an " +
    "acceleration. The ship folds into a bucket that is both the gun and the " +
    "glove: player 2 opens the aiming sweep and picks the strength, player 1 " +
    "slides the bucket and stops the needle — and then the same bucket has to " +
    "be under the ball when it falls back. A dropped ball costs the hull where " +
    "it fell; the clock running out costs it more. The ball is stepped on the " +
    "tick in thousandths of a tile, so every number here is per tick.",

  "THE GYRE — six bodies on a turning rim":
    "A wheel with six bodies bolted round its rim, alternating red and cyan. " +
    "It falls to the middle of the field and then walks a diamond there, " +
    "turning faster every beat and sinking a row every lap until the bottom of " +
    "it grinds along the ship. The colour standing in a column changes on the " +
    "beat, so the pair name a moment rather than a place — and player 1's maw " +
    "slows the turn for a few beats, from wherever the cannon is. See gyre.ts, " +
    "gyre-rim.ts.",
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
  MAZE:
    "A wheel of rings behind the ship, with ways in round its rim. Player 1 turns " +
    "it and clicks a way in onto a column; player 2 fires. Both screens see the " +
    "same light — the wheel is authored in packages/content/src/maze-rounds.ts.",
  "AIM — colour and column":
    "Player 2 fires the colour, player 1 holds the column. Both or nothing.",
  "GUARD — the shared defence":
    "Player 2 places the shield, player 1 triggers it. Position alone is not enough.",
  "MAW — taking a pod in": "Player 1 opens the cannon lobe inside out as the pod arrives.",
  "POD — shot loose, then caught":
    "Shot loose from a creature, it falls and drifts until the cannon catches it.",
  "LANCE — a column marked, then spent":
    "Player 1 holds the lance with the cannon still; player 2 has to not fire until it is full.",
  "GRIP — a hand on the field": "Either player holds anything falling and it falls slower.",
  "HULL — damage and repair":
    "What reaches the hull, what it costs, and what the hull earns back on its own.",
  "RADAR — what is coming":
    "The strip above the grid is how far ahead either player can talk about.",
  "THE BEAT": "The shared clock everything else in this list is measured against.",
  "OPENING — the introduction, the guide and the ready gate":
    "Off by default so a determinism run, a shape sheet and relay:check all get " +
    "the wave rather than the lesson — a headless caller has no thumbs. On, a " +
    "wave opens on its number, name and sentence, then on its guide if it " +
    "carries one, and that guide ends on two circles the pair hold until both " +
    "say READY. THE FORK used to be a second gate in the gap beside this one; " +
    "it retired into this one. See briefing.ts.",
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
  "THROB — open for one beat in every few": "A Throb can only be hit while it is open.",
  "THE LURE — a body only one of you can see through":
    "Player 1 sees a slick or a bulb; player 2 sees the same body inside a " +
    "white ring. A shot that lands costs the hull. Left alone it goes on its " +
    "own this many rows short of the ship, which is the only thing both " +
    "screens ever show identically.",
  "THE VEIL — a cloud only one of you can see into":
    "The lure's split, turned over. Both players see a thundercloud; player 1 " +
    "sees the slick or the bulb inside it and player 2 does not, so the seat " +
    "that knows the colour is the seat that cannot fire. The body morphs from " +
    "one to the other every few beats, which is what makes the call expire — " +
    "and a shot in the wrong colour shuts the cloud for a moment rather than " +
    "simply missing. See veil.ts.",
  "THE WISP — a body only one of you can see at all":
    "The veil's split again, and the whole body this time. Player 2 sees it " +
    "and player 1 does not — not dimmed, not ringed, simply absent — and it " +
    "stands on a tile for this many beats before it is somewhere else. It " +
    "never falls, so it never reaches the ship and never leaves: the wave " +
    "stays open until it is shot, and either colour does it. While one is on " +
    "the field both screens carry the lettered grid, which is the only way to " +
    "say where it is. See wisp.ts.",
  "THE GHOST — a body with no column on one screen":
    "Player 2 sees the body; player 1 is drawn a band across the row it is in " +
    "and nothing about the column — and player 1 holds the cannon, so the " +
    "column has to be said out loud as a number. A wave may also send one " +
    "*across*: it prowls one row sideways, turns at each wall, gets visibly " +
    "angrier each time, and after the last turn comes straight down at the " +
    "hull head first. See ghost.ts.",
  "THE ECHO — one body that becomes eight":
    "The one arrival that gets harder while you watch it. It steps down only " +
    "every second beat, so the hull is never what is pressing — but it divides " +
    "while it falls, and each wait is longer than the last: three beats, then " +
    "six, then nine. Every division turns a corner — sideways, then up and " +
    "down, then both at once — so the bodies stay in a knot instead of taking " +
    "the whole width of the field, and the last one is the one a pair playing " +
    "well never sees. Both players watch it strain and see which way it is " +
    "about to part. A shot pays for every body the one it killed would still " +
    "have become. See echo.ts, echo-split.ts.",
  "THE RIND — one body, three sizes":
    "The one arrival a landed shot does not finish. It comes down three " +
    "times the size of a slick and the matching colour takes a layer off " +
    "instead of killing it: three sizes, two sheds, and an ordinary body at " +
    "the end that dies to an ordinary shot. How big it is *is* how much is " +
    "left, so nothing is drawn over it and no number is shown. What it costs " +
    "the pair is the column they had already finished with. See rind.ts.",
  "THE RECOIL — a shot that sends it the wrong way":
    "The one arrival whose own answer undoes the answer. A slick or a bulb " +
    "in a sprung cage: the matching colour throws it two rows back up the " +
    "field and a lane to one side the seeded rng picks, turning the body " +
    "over on the way. Three times, then the fourth shot kills. See recoil.ts.",
  "THE CAROM — a rock with something alive in it":
    "The one arrival neither control can finish. A body sealed in rock, " +
    "crossing on a diagonal and turning at the walls twice before it lands. " +
    "The shield cannot touch it whole; the cannon cracks it, and what drops " +
    "out is a meteor that has to be warded. See carom.ts.",
  "THE VOLLEY — a rock you have to hit back three times":
    "The one arrival the shield does not finish. A ward hits it back up the " +
    "field instead of off it and takes a plate of shell with it, and it comes " +
    "down again in a column nobody agreed on. Three wards, and the shell " +
    "bursts in mid-air over a body the cannon has to take. See volley.ts.",
  SCORE: "What the run is worth, off the field's own events.",
  WARDEN: "The ring boss's own clocks, plates and worth.",
  VANE: "The arm boss's own pins and worth.",
  MIRROR: "The boss that throws a Simon sequence back, and its own worth.",
  QUEEN: "The petal boss's own row, regrowth and worth.",
  "PLUMBING — not a dial a person turns":
    "Real numbers — a lockstep buffer, a hit-test tolerance, a screen share — " +
    "but not something a person watching a wave decides by. Shown so nothing " +
    "in SimConfig is silently absent, not because it wants a slider.",
};
