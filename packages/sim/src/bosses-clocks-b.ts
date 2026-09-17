/**
 * **The bosses that are a clock, the second page** — the clock half of the
 * boss barrel from THE SCUTTLE on.
 *
 * Cut when THE SCUTTLE's seventeen names would have put `bosses-clocks.ts`
 * eight lines over its 250-line limit, the way `ship-fields-choreo-b.ts` was
 * cut off the director's page the day before: the seam is the order the
 * bosses were built in and nothing depends on it. `bosses-clocks.ts`
 * re-exports the whole of it, so nothing that reaches for a name through
 * `@neon-spore/sim` knows there are two pages.
 *
 * THE SCUTTLE is a clock in the plainest sense on the page: its whole
 * difficulty is the beats a part hangs before it is thrown, which is a count
 * one seat says out loud and the other shoots on (`scuttle.ts`).
 */

// The entry is next door to the other entries; `entries.ts` is at 250 lines
// exactly, so it is re-exported from the file that declares it instead.
export type { ScuttleEntry } from "./boss-entries.js";
export {
  type ScuttlePart,
  type ScuttlePartKind,
  type ScuttleState,
  scuttleAttached,
  scuttleBoss,
  scuttleCadence,
  scuttleFast,
  scuttleLeft,
  scuttleLeftCol,
  scuttleNextCol,
  scuttleShootable,
  scuttleSocketCol,
  scuttleSocketRow,
  scuttleThrowBeat,
  scuttleTwins,
  scuttleWindBeats,
  scuttleWinding,
} from "./scuttle.js";
