/**
 * SNAKE: one of you drives it and the other one works it.
 *
 * The ship folds into a snake and the snake never stops. **Player 2 has the
 * whole of the steering** — LEFT and RIGHT turn the body a quarter turn each,
 * the way the arcade game has always been driven — and **player 1 has the two
 * things the body does when it gets there**: a shot straight out of the head,
 * and a mouth. The arena is authored: enemies to be shot and points to be
 * swallowed, placed on the grid by whoever wrote the round
 * (`packages/content/src/snake-rounds.ts`, `tools/director`). Clear both lists
 * and the round is won.
 *
 * **The split is that neither seat can see the other's half of it.** Player 1
 * is shown the enemies and the points and both ends of the body; player 2 is
 * shown the whole body and none of the things in the arena. So the seat with
 * the wheel is driving on somebody's word, and the seat with the trigger
 * cannot line a shot up on its own. That is the whole round, and it is what
 * makes a game famously played by one person a game for two.
 *
 * **Getting it wrong repeats the round.** A wall, its own body, a touched
 * enemy, or a point swallowed with the mouth shut: all four put the body back
 * where it started with every enemy and every point standing again. The clock
 * starts over with it and the hull pays a little, so a repeat costs something
 * without being the end of anything.
 *
 * **Why the field's rule does not reach in here.** Nothing the players control
 * travels *on the field*, and this is not the field: there is no hull, no
 * cannon and no column to talk about (`docs/decisions.md` #21,
 * `docs/spec/interludes.md`). What is at stake is the same hull as ever —
 * `snake-move.ts` breaks it on a repeat and `snake-round.ts` on the clock.
 *
 * This file is the shape of it and nothing else — the phases, the authored
 * map and every field the round remembers between ticks. Building one and
 * putting a body back where it started is `snake-open.ts`, which is the only
 * half of the state that needs the world. What is standing on a given tile is
 * `snake-arena.ts`, the step is `snake-move.ts`, the four verbs are
 * `snake-controls.ts`, and the clock the whole thing hangs off is
 * `snake-round.ts`. **There is no rng anywhere in the round**: every tile
 * that matters was placed by a person, which is what makes it a thing two
 * people can be told about.
 */

/**
 * The parts of the round. `morph` is the ship becoming the snake, which
 * is a picture rather than a rule and is exactly why it is a phase: the pair
 * needs the beats to read two screens that have stopped being the field.
 *
 * `spent` is the fourth and it draws nothing new: the round is over and
 * only being looked at, and it stays installed so the picture holds until
 * the next wave replaces it rather than dropping back to the field for the
 * beats of rest in between (`wave-end.ts`).
 *
 * Choreography rather than difficulty, so the beat counts beside them are
 * constants in `snake-round.ts` and not `SimConfig` fields — the argument
 * `gauge.ts` and `mirror.ts` already make.
 */
export const SNAKE_PHASES = ["morph", "play", "verdict", "spent"] as const;
export type SnakePhase = (typeof SNAKE_PHASES)[number];

/** One tile of the arena. Never a column of the field. */
export interface SnakeTile {
  col: number;
  row: number;
}

/**
 * One round of the round, authored rather than tuned.
 *
 * **The placement is the fight**, exactly as it is for THE FLEET: where the
 * enemies stand decides which way the body has to be driven and how long the
 * pair has to say it, where the points are decides when the mouth has to open,
 * and the meteors decide which of those two anybody can reach. None of that is
 * legible as a difficulty number, so there is no difficulty number — there is
 * a map.
 *
 * The two lists are read by index and never reordered: `struck` and `taken`
 * are indices into them, so an entry moved in the middle of a round would move
 * what has already been spent.
 */
export interface SnakeRound {
  /** Tiles the body must never touch, and the only things a shot can spend. */
  enemies: SnakeTile[];
  /** Tiles to be swallowed with the mouth open. Shut, they cost the round. */
  points: SnakeTile[];
  /**
   * Meteors: tiles that are neither. They cannot be shot, they cannot be
   * taken, and touching one starts the attempt over — the only thing in the
   * arena the pair can do nothing about but go round.
   *
   * They stop a shot as well, which is what makes them worth placing rather
   * than merely worth avoiding: a meteor in front of an enemy is a wall
   * between the trigger and its target, and the answer to it is the steering.
   */
  rocks: SnakeTile[];
  /** Beats one attempt lasts. Running out of them is how the round is lost. */
  beats: number;
  /** Ticks between two steps. Lower is faster — see `SnakeConfig` on the unit. */
  stepTicks: number;
}

/** Everything the round remembers between ticks. A `BossState` like the other seven. */
export interface SnakeState {
  kind: "snake";
  phase: SnakePhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /** `world.beat` the round opened on. */
  openBeat: number;
  /** How it went. Only meaningful once the phase is `verdict`. */
  passed: boolean;
  /** The authored rounds, in order. Copied in, so content is never written to. */
  rounds: SnakeRound[];
  /** Which of them is being played. */
  round: number;
  /** `world.beat` this attempt began on — the clock it is judged against. */
  roundBeat: number;
  /** The body, head first. Its length is the difficulty and the health bar at once. */
  body: SnakeTile[];
  /** The way the last step went. */
  dirCol: number;
  dirRow: number;
  /**
   * The quarter turn queued for the next step: -1 anticlockwise, 1 clockwise,
   * 0 straight on.
   *
   * Queued rather than applied, and one number rather than a heading: a turn
   * is *relative*, so two presses inside one tile are the last one winning
   * rather than a body that has quietly turned twice. It also makes the
   * reversal the arcade game forbids unreachable — a quarter turn cannot be a
   * half turn — without a rule anybody has to write.
   */
  turn: -1 | 0 | 1;
  /** `world.tick` of the last step. The whole of the clock the body moves on. */
  stepTick: number;
  /** Tiles still owed by a point already swallowed. */
  grow: number;
  /** Indices into this round's `enemies` that are down. */
  struck: number[];
  /** Indices into this round's `points` that are swallowed. */
  taken: number[];
  /** `world.tick` the mouth was last opened. It stands for `snakeMawTicks`. */
  mawTick: number;
  /** `world.beat` of the last shot, for the rest between two and for the picture. */
  shotBeat: number;
  /** Where that shot stopped, so the picture can draw the line it took. */
  shotCol: number;
  shotRow: number;
  /** Whether it found an enemy. Render only. */
  shotHit: boolean;
  /** Attempts spent on this round beyond the first. Each one cost the hull. */
  repeats: number;
  /** `world.beat` of the last one, so the picture can flinch. -1 before the first. */
  repeatBeat: number;
  /**
   * `world.tick` of the last one, and the clock the pause after it runs on.
   *
   * A beat is too coarse for it: the body steps on the tick, so the hold that
   * stops it stepping has to be counted in the same unit or the pause would be
   * a different length depending on where in the beat the crash landed.
   */
  repeatTick: number;
  /**
   * The tile the head was trying to enter when it went wrong, or -1 before
   * the first crash. A wall is off the board and that is deliberate: it is
   * where the head *went*, not where it is allowed to be, and the picture
   * bumps the nose against exactly that place.
   */
  bumpCol: number;
  bumpRow: number;
  /**
   * The body as it stood on the tick of the crash, head first, and the way it
   * was pointing.
   *
   * Kept because `resetBody` runs on the same tick: without it the only body
   * on the state during the pause is the one standing at the start, and there
   * would be nothing left to draw folding up. It is not read by any rule —
   * only the picture asks for it — and it is fingerprinted all the same,
   * because a field outside the fingerprint is a field that can desync two
   * devices silently (CLAUDE.md, rule 4).
   */
  ghost: SnakeTile[];
  ghostDirCol: number;
  ghostDirRow: number;
}

/** The round being played. Clamped, so a state read after the last one still answers. */
export function snakeCurrent(snake: SnakeState): SnakeRound {
  const round = snake.rounds[Math.min(snake.round, snake.rounds.length - 1)];
  if (!round) throw new Error("a snake round with no rounds left to play");
  return round;
}
