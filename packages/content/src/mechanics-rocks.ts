/**
 * The rocks' rows, lifted out of `mechanics-table.ts` when THE VOLLEY took
 * that file past its 250-line limit — the same seam `creatures-hazards.ts`
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
    what: "A rock with a rider. Every three rows it jumps up to four columns sideways. The player on the shield never sees which way.",
    reach: "spawn",
    waveNames: true,
  },
  coil: {
    what: "A domed rock crossing wall to wall. Trigger the shield under it and a torch drops out. The charge jumps on, dome to dome. Only Player 1 sees where.",
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
    what: "A rock that crosses one row, from wall to wall. Any shot that meets it dies. Only Player 1 sees the arrow that shows its row and side.",
    reach: "spawn",
  },
  torch: {
    what: "Rock again, twice as wide, and the fastest thing in the field. It cannot be shot either.",
    reach: "spawn",
    carriedBy: "queen",
    waveNames: true,
  },
} as const;
