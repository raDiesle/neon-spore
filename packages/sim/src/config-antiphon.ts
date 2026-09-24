/**
 * THE ANTIPHON's numbers — how many contours the body can grow and how they
 * fall into families, how many pits end the fight, how long an organ takes
 * to push out and how long it is given once it has, how far a thumb pulls a
 * candidate off the rail, how wide the rail is
 * and how wide a wrong answer makes it, from which pit the rail closes in
 * on one family, from which the rejected candidates arrive as bodies, from
 * which two organs grow at once, from which an organ left alone fires, from
 * which a killed shape comes back, the rests, the still before the ship,
 * and the eruption (`antiphon.ts`, `docs/spec/bosses-choreographed.md` §12).
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
  /** Beats an organ takes to push out of the surface; it cannot be taken until it has. */
  antiphonGrowBeats: number;
  /** Beats a grown organ stands to be described and shot, while the pits are few. */
  antiphonWindowBeats: number;
  /** The window from `antiphonTightPits` on, and the ship's. */
  antiphonTightWindowBeats: number;
  /** Candidates on the rail for one organ, the organ among them. */
  antiphonRail: number;
  /** Candidates the rail never grows past, however many wrong answers. */
  antiphonRailMax: number;
  /** Pits from which the rail's decoys are the organ's own family and the window is tight. */
  antiphonTightPits: number;
  /** Pits from which every candidate rejected by a pit arrives as a body in its colour and column. */
  antiphonSpillPits: number;
  /** Pits from which two organs grow at once, the rail two wider. */
  antiphonTwinPits: number;
  /** Pits from which an organ whose window runs out fires a body down its own column before it sinks. */
  antiphonFirePits: number;
  /** Pits from which one organ a cycle is a shape already killed, grown again. */
  antiphonEchoPits: number;
  /** Beats between one cycle's end and the next organ pushing out; also the rise before the first. */
  antiphonRestBeats: number;
  /** Beats the surface goes still, full of pits, before the ship pushes out. */
  antiphonStillBeats: number;
  /** Ships on the rail at the end, one of them theirs. */
  antiphonShipRail: number;
  /** Beats the pits erupt for after the right ship, before the wave may end. */
  antiphonOutBeats: number;
  /** Beats one whole turn of the organ takes under a resting thumb. */
  antiphonTurnBeats: number;
  /** How far down a thumb must carry a candidate to pull it off the rail, in thousandths of a tile. */
  antiphonPullMilli: number;
}

/**
 * Sixteen contours in families of four, so a tight rail of four is one
 * family whole; six pits before the ship, which at a cycle of four beats'
 * growth, a window and a rest is four or five minutes of describing. Three
 * on the rail, six at most; the rail closes in from the second pit, the
 * rejected candidates arrive from the third, two organs from the fourth,
 * an organ left alone fires from the fourth, and a killed shape comes back
 * from the fifth — the design's four phases, one pit apart.
 *
 * **Doubled on the owner's rule, 24 September 2026**
 * (`docs/spec/choreographed-windows.md`): the window 14 → 28 and the tight
 * one 8 → 16, with the pull carried twice as far, 400 → 800 thousandths of a
 * tile — a longer window with the old count would be an ask that answers
 * itself. The window is THE SLOW (`antiphon-step.ts`).
 */
export const ANTIPHON_DEFAULTS: AntiphonConfig = {
  antiphonShapes: 16,
  antiphonFamily: 4,
  antiphonPits: 6,
  antiphonGrowBeats: 4,
  antiphonWindowBeats: 28,
  antiphonTightWindowBeats: 16,
  antiphonRail: 3,
  antiphonRailMax: 6,
  antiphonTightPits: 2,
  antiphonSpillPits: 3,
  antiphonTwinPits: 4,
  antiphonFirePits: 4,
  antiphonEchoPits: 5,
  antiphonRestBeats: 2,
  antiphonStillBeats: 4,
  antiphonShipRail: 3,
  antiphonOutBeats: 3,
  antiphonTurnBeats: 8,
  antiphonPullMilli: 800,
};
