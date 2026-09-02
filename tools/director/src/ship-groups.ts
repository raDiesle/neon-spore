import type { SimConfig } from "@neon-spore/sim";

/**
 * The cards the SHIP tab is divided into: their names, the order they are read
 * in, and the paragraph under each heading that says what the group *is*.
 *
 * Split out of `ship-fields.ts` when THE VEIL took that file past its 250-line
 * limit, along the seam the file already had in it. What stayed next door is
 * the exhaustive `Record<keyof SimConfig, GroupName>` — the machinery, and the
 * reason the whole arrangement exists: a field added to `SimConfig` and left
 * out of it is a compile error rather than a mechanic that landed invisible.
 * This is the other half, and it is the half that *grows*: every mechanic with
 * a dial of its own arrives here as one name and one paragraph, and nobody
 * reads it top to bottom. The same split `mechanics.ts` and
 * `mechanics-table.ts` already use, for the same reason.
 *
 * Every name is re-exported from `ship-fields.ts`, so nothing that already
 * reaches for one through that file had to move.
 */
export type GroupName =
  | "AIM — colour and column"
  | "GUARD — the shared defence"
  | "MAW — taking a pod in"
  | "POD — shot loose, then caught"
  | "LANCE — a column marked, then spent"
  | "GRIP — a hand on the field"
  | "HULL — damage and repair"
  | "RADAR — what is coming"
  | "THE BEAT"
  | "OPENING — the introduction, the guide and the ready gate"
  | "THE GAUGE — a round with no field in it"
  | "SNAKE — a round the ship is the body of"
  | "PINBALL — a table the ship is the bucket of"
  | "THROB — open for one beat in every few"
  | "THE LURE — a body only one of you can see through"
  | "THE VEIL — a cloud only one of you can see into"
  | "THE WISP — a body only one of you can see at all"
  | "THE GHOST — a body with no column on one screen"
  | "THE ECHO — one body that becomes eight"
  | "THE RIND — one body, three sizes"
  | "SCORE"
  | "WARDEN"
  | "VANE"
  | "MIRROR"
  | "MAZE"
  | "QUEEN"
  | "THE FLEET — a chart only one of you can read"
  | "PLUMBING — not a dial a person turns";

/** Display order. Read top to bottom the way the old, shorter list did. */
export const GROUP_ORDER: GroupName[] = [
  "AIM — colour and column",
  "GUARD — the shared defence",
  "MAW — taking a pod in",
  "POD — shot loose, then caught",
  "LANCE — a column marked, then spent",
  "GRIP — a hand on the field",
  "HULL — damage and repair",
  "RADAR — what is coming",
  "THE BEAT",
  "OPENING — the introduction, the guide and the ready gate",
  "THE GAUGE — a round with no field in it",
  "SNAKE — a round the ship is the body of",
  "PINBALL — a table the ship is the bucket of",
  "THROB — open for one beat in every few",
  "THE LURE — a body only one of you can see through",
  "THE VEIL — a cloud only one of you can see into",
  "THE WISP — a body only one of you can see at all",
  "THE GHOST — a body with no column on one screen",
  "THE ECHO — one body that becomes eight",
  "THE RIND — one body, three sizes",
  "SCORE",
  "WARDEN",
  "VANE",
  "MIRROR",
  "MAZE",
  "QUEEN",
  "THE FLEET — a chart only one of you can read",
  "PLUMBING — not a dial a person turns",
];

export const GROUP_NOTE: Record<GroupName, string> = {
  "PINBALL — a table the ship is the bucket of":
    "The third built round, and the first body in the game under an " +
    "acceleration. The ship folds into a bucket that is both the gun and the " +
    "glove: player 2 opens the aiming sweep and picks the strength, player 1 " +
    "slides the bucket and stops the needle — and then the same bucket has to " +
    "be under the ball when it falls back. A dropped ball costs the hull where " +
    "it fell; the clock running out costs it more. The ball is stepped on the " +
    "tick in thousandths of a tile, so every number here is per tick.",

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

/**
 * The exhaustive map itself. A `Record<keyof SimConfig, GroupName>` rather
 * than a `switch` — `SimConfig` is an object shape, not a union, so there is
 * no discriminant to switch on, and this is the object-shaped equivalent of
 * the `assertNever` `effects-spark.ts` uses for `SimEvent`.
 */

/**
 * Groups that describe the wave in front of you rather than the ship — the
 * four boss groups above, plus THE GAUGE, which only matters in a gap that
 * carries one. Every other group is the same ship on every wave; `SHIP_GROUPS`
 * below is the complement, so a group added to `GROUP_ORDER` and left off this
 * set defaults to the ship sheet rather than vanishing — the "show everything"
 * escape hatch the brief asks for is this default, not a separate view.
 */
export const WAVE_ONLY_GROUPS: ReadonlySet<GroupName> = new Set([
  "WARDEN",
  "VANE",
  "MIRROR",
  "MAZE",
  "QUEEN",
  "THE GAUGE — a round with no field in it",
  "THE FLEET — a chart only one of you can read",
  "SNAKE — a round the ship is the body of",
  "PINBALL — a table the ship is the bucket of",
]);

/** The ship's own dials — the same on every wave, and one click away on the topbar. */
export const SHIP_GROUPS: GroupName[] = GROUP_ORDER.filter((g) => !WAVE_ONLY_GROUPS.has(g));
