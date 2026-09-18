import type { PinBall, PinPiece } from "./pinball-contact.js";

/**
 * PINBALL: the ship's cannon is both the gun and the glove.
 *
 * One ball, fired upward out of the cannon, falling back down through a table
 * of pegs and blocks — and the same cannon has to be under it when it comes
 * back or the hull pays. That doubling is the whole design and it is what
 * makes a Peggle table into a round for two people: where you fire *from* is
 * where you must not be a second later, so the seat holding the cannon is
 * spending the shot undoing the position they took to aim it.
 *
 * **The ship stays a ship, and that is the owner's correction.** It used to
 * fold into a bucket — a shape invented for this round, slid by two slabs of
 * its own, on a table in a violet case with the field thrown away. He asked for
 * the round to look like the game it is part of: the hull on the screen, the
 * band under it, the real background behind it, and the cannon moved by the
 * strip at the strip's own speed. So there is no bucket and no position of its
 * own here; `world.cannonCol` is where the catcher is, and it is the field's
 * own vocabulary the pair talk in — columns.
 *
 * **The two presses.** The needle walks the arc from the moment a shot resets
 * and player 1 latches it; a power bar then grows and shrinks and player 2
 * launches on it. So one seat owns *where from* and *which way*, the other
 * owns *when* and *how hard*, and neither half of an aim is a shot on its own.
 * The sweep takes six and a half seconds on purpose — a spoken exchange in
 * this game runs 2.1–3.6 s (`docs/spec/latency.md`), and a needle that could
 * not be talked over would be a test of two thumbs.
 *
 * **There used to be a third press**, player 2's, which opened the sweep
 * before player 1 was allowed to latch it. It bought the order and cost the
 * round its shape: the needle was already walking when it was pressed, so the
 * press changed nothing either player could see except the colour of a line,
 * and the seat that pressed it then had to press the same button again to
 * fire. Taken out on the owner's call. The alternation is still there and it
 * is now carried by the two presses that do something.
 *
 * **Nothing here is the field.** No hull is drawn, no column is named and the
 * ball travels — which the field forbids and a round does not
 * (`docs/decisions.md` #21). What is still at stake is the same hull as ever:
 * `pinball-round.ts` breaks it on a dropped ball and on the clock.
 *
 * **And since 18 September 2026 each shot asks for a hand on the table**
 * (`docs/spec/interludes.md`, PINBALL's *Three shots, three hands*): a launch
 * above `pinballHardMilli` leaves the spring slack and the bar will not run
 * until player 1 winds the plunger, and through a flight player 2 may nudge
 * the table once before a second shove tilts it. Both are entered by the
 * pair's own last answer, which is THE GAUGE's shape for the same brief.
 *
 * This file is the shape of it and nothing else. Building one and standing the
 * board up for a round is `pinball-open.ts`, which is the only half of the
 * state that needs the world — SNAKE's seam, cut here the day the round gained
 * two hands and took this file over its limit. The table's arithmetic is
 * `pinball-board.ts`, the
 * ball itself is `pinball-physics.ts`, one shot of it is `pinball-shot.ts`,
 * the verbs are `pinball-controls.ts`, the two hands on the table are
 * `pinball-hand.ts`, and the clock the whole thing hangs off is
 * `pinball-round.ts`.
 */

/**
 * The parts of the round. `morph` is the table arriving over the field, which
 * is a picture rather than a rule and is exactly why it is a phase: the pair
 * needs beats to read a screen that has stopped being the field. SNAKE's
 * argument, and the beat counts beside it are constants in `pinball-round.ts`
 * rather than `SimConfig` fields for the same reason.
 *
 * `spent` is the last and it draws nothing new: the round is over and only
 * being looked at, and it stays installed so the picture holds until the next
 * wave replaces it rather than dropping back to the field for the beats of
 * rest in between (`wave-end.ts`).
 */
export const PINBALL_PHASES = ["morph", "play", "verdict", "spent"] as const;
export type PinballPhase = (typeof PINBALL_PHASES)[number];

/**
 * Where one shot has got to. Three states, in a fixed order, and every one of
 * them is waiting for a different thumb — which is what makes the round a
 * conversation rather than three people's worth of buttons on two devices.
 */
export const PIN_SHOTS = ["aim", "power", "flight"] as const;
export type PinShot = (typeof PIN_SHOTS)[number];

/**
 * One round of the round, authored rather than tuned.
 *
 * The board *is* the fight — where the targets are, what stands between them
 * and the cannon, whether there is a lane down the middle — so it is the thing
 * authored, exactly as THE FLEET's placement is. How long there is beside it,
 * because a board and a clock are the only two numbers that change between one
 * of these and the next.
 */
export interface PinballRound {
  pieces: PinPiece[];
  /** Beats it lasts. Running out of them is how the whole round is lost. */
  beats: number;
}

/** Everything the round remembers between ticks. A `BossState` like the rest. */
export interface PinballState {
  kind: "pinball";
  phase: PinballPhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /** `world.beat` the round opened on. */
  openBeat: number;
  /** How it went. Only meaningful once the phase is `verdict`. */
  passed: boolean;
  /** The authored rounds, in order. Copied in, so content is never written to. */
  rounds: PinballRound[];
  /** Which of them is being played. */
  round: number;
  /** `world.beat` that round opened on — the clock it is judged against. */
  roundBeat: number;
  /** This round's board. Copied out of `rounds`, and never written either. */
  pieces: PinPiece[];
  /**
   * Which pieces are still standing, one entry per piece in board order.
   *
   * A parallel array rather than a flag on the piece, because the piece is the
   * *authored* thing: a board played twice has to start the same way both
   * times, and a boolean living on it would have to be copied back out.
   */
  alive: boolean[];
  /**
   * What this shot has touched so far, as board indices.
   *
   * **Lit now, cleared when the shot ends** — Peggle's rule, and it is a
   * physics decision before it is a scoring one. A piece that vanished under
   * the ball would let it fly through the space it had just bounced off, so a
   * cluster would collapse instead of cascading. So a hit lights, and what was
   * lit goes when the ball does.
   */
  lit: number[];
  shot: PinShot;
  /** The needle, in thousandths of a degree either side of straight up. */
  angleMilli: number;
  /** Which way it is sweeping. It turns at each end and never wraps. */
  angleDir: -1 | 1;
  /** The power bar, 0 to 1000. */
  powerMilli: number;
  powerDir: -1 | 1;
  /** The ball. Meaningless unless `shot` is `flight`. */
  ball: PinBall;
  /** `world.beat` the current flight began, for the stuck-ball clock. */
  flightBeat: number;
  /** Balls the cannon was not under. Each one cost the hull. */
  drops: number;
  /** `world.beat` of the last one, so the picture can flinch. -1 before the first. */
  dropBeat: number;
  /**
   * Where across the table the last one came down, in thousandths of a tile.
   *
   * Kept because the blast is drawn where the ball actually struck the hull and
   * not in the middle of it: damage is drawn where it landed, and by the time
   * the picture is drawn the ball has been put back on the cannon.
   */
  dropXMilli: number;
  /** `world.beat` of the last catch, for the same reason. */
  catchBeat: number;
  /**
   * `world.tick` a **target** was last struck, and where it stood.
   *
   * A tick rather than a beat, because what is drawn off it is the one big
   * moment of the round — a target taken — and a beat is 75 ticks, which is
   * most of a second of not knowing whether the press landed. -1 before the
   * first one of the run.
   */
  hitTick: number;
  hitXMilli: number;
  hitYMilli: number;
  /** How many targets this one shot has taken, counting the one above. */
  hitRun: number;
  /**
   * Whether the spring is slack, because the last launch went out above
   * `pinballHardMilli`.
   *
   * While it is, the power bar does not run at all and player 2 has nothing to
   * launch: player 1 has to wind the plunger first (`pinPlunger`,
   * `pinball-hand.ts`). It is the round's own bargain with itself — a shot
   * fired at the top of the bar is the one that reaches the far corner of the
   * board, and it costs the pair a gesture on the shot after it.
   */
  slack: boolean;
  /**
   * Nudges spent on this flight. The table takes `pinballNudges` of them and
   * **tilts** on the next, which kills her hand for the rest of the flight —
   * the arcade rule, and the one place this round could take it whole.
   */
  nudges: number;
  /** Whether this flight has been tilted. Cleared when the shot resets. */
  tilted: boolean;
}
