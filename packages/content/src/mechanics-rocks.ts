/**
 * The rocks' rows, lifted out of `mechanics-table.ts` when THE VOLLEY took
 * that file past its 250-line limit — the same seam `creatures-rocks.ts`
 * already cuts in the bestiary next door, and for the same reason: five speed
 * tiers and a torch are one fact said six times, and they are the longest run
 * of rows in that table that nobody reads one at a time.
 *
 * `as const` rather than a type annotation, because `MECHANICS` next door is
 * `as const satisfies` and `WaveKind` is read back out of it — a spread that
 * widened `waveNames` to `boolean` would quietly empty that union of every
 * rock, and a wave could no longer name one.
 */
export const ROCK_MECHANICS = {
  meteor: {
    what: "Dead rock. It cannot be shot, and it stops a shot of yours going up its column.",
    reach: "spawn",
    waveNames: true,
  },
  meteorMedium: {
    what: "The same rock, falling two rows a beat instead of one.",
    reach: "spawn",
    waveNames: true,
  },
  meteorFast: { what: "The same rock again, three rows a beat.", reach: "spawn", waveNames: true },
  meteorFaster: {
    what: "Four rows a beat. It crosses the field in the time a bulb takes to fall a quarter of it.",
    reach: "spawn",
    waveNames: true,
  },
  meteorFastest: {
    what: "Five rows a beat, and nothing in the field is quicker except a torch.",
    reach: "spawn",
    waveNames: true,
  },
  veer: {
    what: "A rock with a rider on it, coming down a row a beat like the plain one — and changing lane every three rows, up to four tiles at a time, all the way to the ship. Only one of you is shown which side the next change takes, and it is not the one holding the shield.",
    reach: "spawn",
    waveNames: true,
  },
  coil: {
    what: "A rock inside a dome, crossing the field from the right wall to the left instead of falling and sinking two rows at every wall it turns at. Nothing reaches it while the dome is on; the shield standing in its column opens it wherever it is, and what drops out is a torch. The charge then jumps to another dome still standing and opens that one too, and on again — so one trigger frees the whole field, one at a time, and only the pilot can see which is next.",
    reach: "spawn",
    waveNames: true,
  },
  /**
   * **The one row here that is not a kind.** Every other id in this table is a
   * creature, a boss or a pod the simulation already publishes a union for;
   * this one is a *route* a wave puts a plain rock on (`WaveEntry.cross`), so
   * it carries no `waveNames` — there is nothing for an entry's `kind` to say
   * — and `mechanicsInWave` finds it by reading the queue's own `cross` rather
   * than by matching a kind.
   *
   * It is a mechanic by this table's own test all the same: it is a rule the
   * pair has to learn, and the game is a smaller game without it rather than
   * no game at all. And it is the one hazard in the game that costs the hull
   * *nothing* — it is a window rather than an arrival, and what it takes away
   * is the lane, for as long as the crossing lasts.
   */
  rockCross: {
    what: "A rock that comes over one of the side walls instead of the top, holds that row for the whole of its life and leaves the field at the far side. Nothing turns it away and it never reaches the ship — what it does is stand in front of the cannon on its way past, a lane at a time, and a bolt that meets it dies there. Player 1 alone is shown the arrow: the row it will hold, the side it comes over, and the way it will fly.",
    reach: "spawn",
  },
  torch: {
    what: "Rock again, twice as wide, and the fastest thing in the field. It cannot be shot either.",
    reach: "spawn",
    carriedBy: "queen",
    waveNames: true,
  },
} as const;
