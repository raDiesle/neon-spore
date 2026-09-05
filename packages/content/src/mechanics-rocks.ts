/**
 * The seven rocks' rows, lifted out of `mechanics-table.ts` when THE VOLLEY took
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
    what: "A rock with a rider on it, coming down a row a beat like the plain one — and changing lane three times on the way, a tile at a time, at the same three rows every fall. Only one of you is shown which side the next change takes, and it is not the one holding the shield.",
    reach: "spawn",
    waveNames: true,
  },
  torch: {
    what: "Rock again, twice as wide, and the fastest thing in the field. It cannot be shot either.",
    reach: "spawn",
    carriedBy: "queen",
    waveNames: true,
  },
} as const;
