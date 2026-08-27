/**
 * The numbers the bosses own.
 *
 * `SimConfig` extends this rather than nesting it, so every call site still
 * reads `cfg.wardenRow` — a boss's tunable is a tunable like any other, and the
 * split is about how much of one file a reader has to hold at once, never about
 * introducing a second place a number can live.
 *
 * A boss's *choreography* is deliberately not here. Which beat a bloom opens
 * on, how far a pupil drifts and how long a sequence stands are written in
 * `queen-mark.ts`, `warden-cycle.ts` and `simon.ts`, because changing one of
 * those writes a different fight rather than a different difficulty.
 */
export interface BossConfig {
  /** The row the queen holds at full health. She sinks a tile per petal lost — see `queenRow` in `boss.ts`. */
  queenRow: number;
  /**
   * Share of a beat the queen takes to grow a torch back into the socket the
   * last one broke off from. 1 means the whole beat, 0 means it is simply
   * there again. The rock that left is never redrawn here — it is the
   * creature now (`spit` in boss.ts); this is only how fast the next egg
   * comes in behind it. Read by render/.
   */
  queenEggGrowShare: number;
  /**
   * The row the Warden's ring holds. It never walks and never sinks, so this
   * is the only row it ever has — and it is what makes its two clocks line up:
   * a plain meteor takes exactly `wardenCycleBeats` to reach the hull from
   * here, and the tether exactly half of that (docs/spec/bosses.md 11.4).
   */
  wardenRow: number;
  /** Beats between one tether and the next. One cycle is one whole encounter in miniature. */
  wardenCycleBeats: number;
  /**
   * Beats of hold — accumulated, not unbroken — that tear a tether out of the
   * rim. Deliberately well under the six the line takes to reach the hull: the
   * question the fight asks is *when* the other player can spare their hand,
   * never whether they can hold it steady on a phone.
   */
  wardenPullBeats: number;
  /** Plates the ring wears. One comes off per opened eye, and the gap never fills. */
  wardenPlates: number;
  /** Damage a tether that reaches the hull costs. */
  damageWarden: number;
  /** Score for taking a plate off the Warden. */
  scoreWardenPlate: number;
  /** Score for bringing the Warden down. */
  scoreWardenDown: number;
  /** The row THE MIRROR's own hull surface sits on — the ship's, upside down. */
  mirrorRow: number;
  /** Damage a wrong step in a Simon sequence costs, thrown back by THE MIRROR. */
  damageEcho: number;
  /** Score for answering one of THE MIRROR's sequences in full. */
  scoreMirrorRound: number;
  /** Score for breaking THE MIRROR. */
  scoreMirrorDown: number;
  /**
   * Pins holding THE VANE's bearing. One comes out per opening answered, and
   * the arm slips a phase further out as they go — so this is both how long the
   * fight is and how much of the field it ends up folding.
   *
   * There is no `vaneRow` beside it and no `vaneCycleBeats`. The arm sweeps the
   * row bodies arrive on, which is the top of the field by definition, and its
   * cycle is the table in `vane-cycle.ts` rather than a number a table would
   * then have to agree with.
   */
  vanePins: number;
  /** Score for taking a pin out of THE VANE's bearing. */
  scoreVanePin: number;
  /** Score for bringing THE VANE down. */
  scoreVaneDown: number;
  /** Score for stripping a petal from the queen. */
  scoreQueenPetal: number;
  /** Score for bringing the queen down. */
  scoreQueenDown: number;
}
