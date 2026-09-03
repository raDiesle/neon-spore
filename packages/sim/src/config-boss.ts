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
  /** Rows below the rim the line's handle hangs. It is lowered once and then
   * hangs there: nothing about this line falls, and nothing about it can hurt
   * the ship (docs/spec/bosses.md 11.4). Far enough down that the rope reads as
   * a rope rather than as a stub under the ring. */
  wardenHangRows: number;
  /**
   * How far the hand has to carry the handle before the line is fully taut, in
   * thousandths of a tile. It is a **distance**, not a duration, and that is
   * the fight: the hatch opens in proportion to how far the handle has come, so
   * the pulling seat's hand is a dial the other seat can read off the picture.
   *
   * Sideways, because the handle hangs under the middle of the ring and swinging
   * it aside is what clears the shot lane it was standing in.
   *
   * **Seven tiles, and it was two and a half.** The owner asked for three times
   * the travel on every handle that opens a gate, and `lidTautMilli` next door
   * carries the same number for the same reason: at a quarter of the field's
   * width the pull was a flick that never took the hand out of the column it
   * began in, so a gate could be held open at almost no cost.
   *
   * **Seven and not seven and a half, and the half tile is the boundary's.** A
   * pull may not carry the handle off the field (`handle-pull.ts`), and this
   * rope hangs at `wardenRow + wardenHangRows` with 7.2 tiles of field above it
   * and 7.2 below. At 7500 no straight pull reached taut from there — only a
   * diagonal did, and *which* diagonal changed as the pupil drifted, so the
   * obvious gesture failed for a reason nothing on the screen explained. Seven
   * is the longest pull the field can hold straight, with a fifth of a tile in
   * hand.
   */
  wardenTautMilli: number;
  /** Plates the ring wears. One comes off per opened eye, and the gap never fills. */
  wardenPlates: number;
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
  /**
   * The row THE MAZE's mouths hang on — where a wrong answer comes back out of
   * the field and starts falling, the same job `mirrorRow` does.
   */
  mazeRow: number;
  /** Damage a shot down a way in that goes nowhere costs. */
  damageMaze: number;
  /**
   * How wide THE MAZE's wheel stands across the field, in thousandths of the
   * field's width. About six sevenths, so the rim clears the hull and the
   * cannon still slides under it.
   */
  mazeSpanMilli: number;
  /**
   * How far the wheel turns in a tick while the string is pulled, in
   * thousandths of a degree. A whole turn at 200 is twenty-four beats.
   */
  mazeTurnMilli: number;
  /**
   * How far the wheel turns for one tile of hand travel while the string's
   * handle is dragged, in thousandths of a degree. Forty-five degrees: the
   * handle can be pulled about a third of the field's width in one gesture and
   * carry a way in the whole distance between two of them, so a pull is one
   * hand movement rather than a series of them.
   *
   * It is the drag's counterpart to `mazeTurnMilli`, which is per *tick* and
   * belongs to the thumb — the two are the two gestures and neither replaces
   * the other (`maze-controls.ts`).
   */
  mazeDragMilliPerTile: number;
  /**
   * How far the hand has to carry on past a click before it breaks, in
   * thousandths of a tile. The detent needs hysteresis and a thumb does not: a
   * press under `valve` is a decision, while a hand resting on the handle
   * jitters by a pixel a frame, and without this the click a pair had just
   * agreed on came off again before either of them said the column out loud.
   * Wider than the snap window is worth in hand travel, narrow enough that
   * pulling on is still one movement.
   */
  mazeDragBreakMilli: number;
  /**
   * How near a column's centre a way in has to come before it clicks onto it,
   * in thousandths of a column. It has to be wider than the furthest the rim
   * moves in one tick or a column could be turned straight past, and narrow
   * enough that a lit mouth reads as standing on the column — `test/maze-bridge.test.ts`
   * holds both ends of that against these two numbers.
   */
  mazeSnapMilli: number;
  /** Score for finding the mouth that reaches the core. */
  scoreMazeRound: number;
  /** Score for bringing THE MAZE down. */
  scoreMazeDown: number;
  /** Score for stripping a petal from the queen. */
  scoreQueenPetal: number;
  /** Score for bringing the queen down. */
  scoreQueenDown: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG` the way `GAUGE_DEFAULTS` and
 * `SHOT_DEFAULTS` already are. They live beside the interface that names them
 * rather than in `config.ts`, because that file had reached the 250-line limit
 * and the next boss to want a number would have had to move them anyway —
 * "split rather than grow", one file earlier than it was forced.
 */
export const BOSS_DEFAULTS: BossConfig = {
  queenRow: 2,
  queenEggGrowShare: 0.5,
  scoreQueenPetal: 400,
  scoreQueenDown: 2000,
  wardenRow: 2,
  wardenCycleBeats: 12,
  wardenHangRows: 5,
  wardenTautMilli: 7000,
  wardenPlates: 5,
  scoreWardenPlate: 500,
  scoreWardenDown: 2500,
  mirrorRow: 3,
  damageEcho: 15,
  scoreMirrorRound: 500,
  scoreMirrorDown: 2500,
  vanePins: 5,
  scoreVanePin: 500,
  scoreVaneDown: 2500,
  mazeRow: 3,
  damageMaze: 15,
  mazeSpanMilli: 857,
  mazeTurnMilli: 600,
  mazeDragMilliPerTile: 45_000,
  mazeDragBreakMilli: 80,
  mazeSnapMilli: 180,
  scoreMazeRound: 500,
  scoreMazeDown: 2500,
};
