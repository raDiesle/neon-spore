/**
 * THE ANTIPHON's numbers — how many contours the body can grow and how they
 * fall into families, how many pits end the fight, how long an organ takes
 * to push out and how long it is given once it has, how wide the rail is
 * and where it hangs, how far down the organ stands, how far a thumb must
 * carry a candidate and how far off its vein it may wander, from which pit
 * the rail closes in on one family and from which a killed shape comes back,
 * the rests, the still before the ship, and the eruption (`antiphon.ts`,
 * `docs/spec/bosses-choreographed.md` §12).
 *
 * Its own file for `config-scuttle.ts`' reason: `SimConfig` extends it
 * rather than nesting it, so every call site reads `cfg.antiphonPits`.
 *
 * **The contours are counted here and drawn elsewhere.** The simulation
 * never sees a shape: an organ is an index under `antiphonShapes`, and the
 * family an index belongs to is its quotient by `antiphonFamily`. What the
 * index looks like is `packages/content`'s table, the look lane's, and a
 * table shorter than this count is that lane's test to fail.
 */
export interface AntiphonConfig {
  /** Contours the body can grow, by index; the table of them is the content's. */
  antiphonShapes: number;
  /** Contours to a family — consecutive indices that differ by a lobe, which is what the rail closes in on. */
  antiphonFamily: number;
  /** Pits the body must carry before it goes still and grows the ship. */
  antiphonPits: number;
  /** Beats an organ takes to push out of the surface; nothing is carried until it has. */
  antiphonGrowBeats: number;
  /** Beats a grown organ stands to be described and carried to, while the pits are few. */
  antiphonWindowBeats: number;
  /** The window from `antiphonTightPits` on, and the ship's. */
  antiphonTightWindowBeats: number;
  /** Candidates on the rail, the organ among them. */
  antiphonRail: number;
  /** The field row the rail hangs on. */
  antiphonRailRow: number;
  /** Columns between two neighbours on the rail. */
  antiphonRailGap: number;
  /** Rows from the rail down to where the organ stands — every vein's drop. */
  antiphonVeinRows: number;
  /** How far down its vein a candidate must be carried to arrive, in thousandths of the vein. */
  antiphonReachMilli: number;
  /** How far off its vein a thumb may wander and still carry, in thousandths of a tile. */
  antiphonVeinSlackMilli: number;
  /** Pits from which the rail's decoys are the organ's own family and the window is tight. */
  antiphonTightPits: number;
  /** Pits from which the organ is a shape already killed, grown again. */
  antiphonEchoPits: number;
  /** Beats between one level's end and the next organ pushing out; also the rise before the first. */
  antiphonRestBeats: number;
  /** Beats the surface goes still, full of pits, before the ship pushes out. */
  antiphonStillBeats: number;
  /** Ships on the rail at the end, one of them theirs. */
  antiphonShipRail: number;
  /** Beats the pits erupt for after the right ship, before the wave may end. */
  antiphonOutBeats: number;
  /** Beats one whole turn of the organ takes under a resting thumb. */
  antiphonTurnBeats: number;
}

/**
 * Sixteen contours in families of four, so a tight rail is one family;
 * six pits before the ship. Three on the rail, three columns apart about the
 * middle, on the row a third of the way down the phone, and the organ two
 * rows under it (the owner, 5 October 2026: *the organ candidates … are
 * located in around ⅓ from top screen. then some tile rows below (2) there
 * is the original organ shape*). A candidate arrives nine tenths of the way
 * down, and the thumb may stray a tile off the vein. The rail closes in on
 * the family from the second pit and a killed shape comes back from the
 * fifth.
 *
 * **Doubled on the owner's rule, 24 September 2026**
 * (`docs/spec/choreographed-windows.md`): the window 14 → 28 and the tight
 * one 8 → 16. The window is THE SLOW (`antiphon-step.ts`).
 */
export const ANTIPHON_DEFAULTS: AntiphonConfig = {
  antiphonShapes: 16,
  antiphonFamily: 4,
  antiphonPits: 6,
  antiphonGrowBeats: 4,
  antiphonWindowBeats: 28,
  antiphonTightWindowBeats: 16,
  antiphonRail: 3,
  antiphonRailRow: 3,
  antiphonRailGap: 3,
  antiphonVeinRows: 2,
  antiphonReachMilli: 900,
  antiphonVeinSlackMilli: 1000,
  antiphonTightPits: 2,
  antiphonEchoPits: 5,
  antiphonRestBeats: 2,
  antiphonStillBeats: 4,
  antiphonShipRail: 3,
  antiphonOutBeats: 3,
  antiphonTurnBeats: 8,
};
