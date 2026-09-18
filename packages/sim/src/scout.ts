/**
 * THE SCOUT: the ship puts something small out into the dark, and only one of
 * you is holding it.
 *
 * The mother ship opens and a little ship drifts out. **Player 1 flies it** —
 * the crank turns its nose and the reach button burns — and the arena is full
 * of motes it has to collect and hazards that are moving towards it. Take
 * every mote and the round is won. Let a hazard touch it and the hull is
 * broken, which is the wave lost (`wave-fail.ts`).
 *
 * **The split is that the pilot cannot see the arena.** Player 1 is shown the
 * scout, its nose and what it is carrying; player 2 is shown the motes and the
 * hazards and not the scout's heading. So the seat with the stick is flying on
 * somebody's word — "nose to the top left, burn twice" — and the seat that can
 * see cannot move anything at all. It is SNAKE's arrangement with the halves
 * swapped, and it is why a round about flying is still a round about talking.
 *
 * **Why the field's rule does not reach in here.** Nothing the players control
 * travels *on the field*, and this is not the field: there is no hull drawn,
 * no cannon and no column to name (`docs/decisions.md` #21,
 * `docs/spec/interludes.md`). The owner asked for this on 16 September 2026 as
 * a wave on the ordinary field, and on the field it is the one thing the game
 * cannot have — so it is a round with its own picture, which is exactly the
 * exemption decision 21 was written to describe. What is at stake is the same
 * hull as ever: `scout-arena.ts` breaks it on a touch and on the clock.
 *
 * **And the claw's panel comes with it.** The owner asked for this beside the
 * hand that catches pods, so the round's controls are the claw's controls
 * doing the same jobs on a different thing: the crank that winds the arm home
 * turns the scout, the button that sends the arm burns it, and player 2's maw
 * is where a full scout unloads. A pair that has played THE CLAW has already
 * learned the panel; what changed is what is on the end of the rope.
 *
 * This file is the shape of it and nothing else — the authored arena and every
 * field the round remembers between ticks. The flight is `scout-fly.ts`, what
 * the scout is touching is `scout-arena.ts`, and the clock the whole thing
 * hangs off is `scout-round.ts`. **There is no rng anywhere in the round**:
 * every mote and every hazard was placed by a person, which is what makes it a
 * thing two people can be told about.
 */

/** Where something stands in the arena, in thousandths of a tile. */
export interface ScoutPoint {
  colMilli: number;
  rowMilli: number;
}

/**
 * A mote: the round's own power-up, and the first one that is **flown to**
 * rather than caught.
 *
 * A pod is freed by a shot and falls towards the ship, which is the answer
 * `pods.ts` gives to a game with no flying in it. A mote does not move at all
 * and never comes to anybody: it hangs where it was placed, and the only way
 * to have it is to go and be next to it. That is the whole reason this round
 * exists, and it is why the motes are authored rather than spawned — a mote
 * nobody placed is a mote nobody can be told about.
 */
export type ScoutMote = ScoutPoint;

/**
 * A hazard: the thing that is moving, in a round where the players are the
 * ones who usually are not.
 *
 * It travels in a straight line and turns round at the walls, so its path is a
 * sentence one seat can say out loud — "the one on the left is coming down" —
 * and nothing about it is random. It is the only thing in the round that can
 * cost the hull.
 */
export interface ScoutHazard extends ScoutPoint {
  /** Its travel, in thousandths of a tile a beat. */
  vColMilli: number;
  vRowMilli: number;
}

/**
 * One arena, authored whole. Several make a round the way SNAKE's do: clear
 * one and the next opens, and only the last one won is the round won.
 */
export interface ScoutArena {
  /** Beats the pair have for this arena before the clock breaks the hull. */
  beats: number;
  /** Where the mother ship puts the scout down, in thousandths of a tile. */
  startColMilli: number;
  startRowMilli: number;
  /** The nose it is let go with, in thousandths of a degree. 0 is straight up. */
  startHeadingMilli: number;
  /** Every mote that has to be collected. All of them, or the arena is not won. */
  motes: readonly ScoutMote[];
  /** Everything that is moving and must not be touched. */
  hazards: readonly ScoutHazard[];
}

/**
 * The phases, in the order `scout-hash.ts` numbers them by.
 *
 * A list rather than a bare union for the reason `SNAKE_PHASES` is one: a
 * phase goes into `hashWorld` as its index, so the order is a wire value and a
 * name inserted in the middle would renumber the ones after it.
 */
export const SCOUT_PHASES = ["lead", "play", "verdict", "spent"] as const;

/**
 * **What the little ship has become, which is a second state and not a second
 * clock** (`docs/spec/interludes.md`, THE SCOUT's *Three loads, three hands*).
 *
 * The phases above are the round's clock — the lead, the flight, the verdict,
 * the picture held. This is the **load**, and it follows from how many motes
 * are aboard and nothing else: the number the pair is already deciding about
 * every time they pass one, because a mote is not had until it is banked.
 *
 * - `light`: the three verbs and the mouth as the round was built.
 * - `laden`: past `scoutLadenMotes` the ship is heavy on the turn, and player
 *   2 may put a line on it (`scoutLine`) and reel it home — straight, slowly,
 *   and with player 1's hands dead while it runs.
 * - `heavy`: past `scoutHeavyMotes` the thruster labours, and a burn does
 *   nothing at all unless player 1 has primed it (`scoutPrime`) inside the
 *   last `scoutPrimeTicks`.
 */
export const SCOUT_LOADS = ["light", "laden", "heavy"] as const;
export type ScoutLoad = (typeof SCOUT_LOADS)[number];

/** The three phases and the one after them, the shape `SnakePhase` has. */
export type ScoutPhase = (typeof SCOUT_PHASES)[number];

/** Everything THE SCOUT remembers between ticks. */
export interface ScoutState {
  kind: "scout";
  phase: ScoutPhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /** `world.beat` the round opened on. */
  openBeat: number;
  /** How it went. Only meaningful once the phase is `verdict`. */
  passed: boolean;
  /** The authored arenas, in order. Copied in, so content is never written to. */
  arenas: ScoutArena[];
  /** Which of them is being flown. */
  arena: number;
  /** `world.beat` this attempt began on — the clock it is judged against. */
  arenaBeat: number;
  /** Where the scout is, in thousandths of a tile. */
  colMilli: number;
  rowMilli: number;
  /** How it is travelling, in thousandths of a tile a beat. */
  vColMilli: number;
  vRowMilli: number;
  /** Where its nose points, in thousandths of a degree. 0 is straight up. */
  headingMilli: number;
  /**
   * Which way the crank is turning it: -1, 0 or 1.
   *
   * Held rather than pressed, and stored rather than queued: a heading is
   * absolute, so a finger that stays on the crank keeps turning the nose, and
   * one that comes off leaves it exactly where it stopped. That is the arm's
   * own contract in `crank.ts`, which is the point of putting this round on
   * the claw's panel.
   */
  turn: -1 | 0 | 1;
  /** Whether the burn is held. The one thing that adds speed. */
  burning: boolean;
  /**
   * Indices into this arena's `motes` the scout is **carrying**, and the ones
   * it has brought home.
   *
   * Two lists rather than one, because a mote is not had until it is banked:
   * flying over one picks it up, and only the mother ship's open mouth takes
   * it off the ship. That is THE CLAW's own rule — *a pod the claw brings home
   * is only caught if the maw is open when it arrives* — moved onto a thing
   * that flies, and it is what gives the seat that can see the arena something
   * to do with their hands rather than only with their voice.
   */
  carrying: number[];
  banked: number[];
  /** `world.tick` the mother ship's mouth was last opened. It stands for `scoutMawTicks`. */
  mawTick: number;
  /** Where each of this arena's hazards is now. Copied out at the open. */
  hazards: ScoutHazard[];
  /**
   * `world.tick` the scout was caught on, or -1 while it has not been.
   *
   * A tick and not a beat, for `snake.ts`'s reason: the scout moves on the
   * tick, so a picture drawn off a beat would start a fraction of a step late.
   * There is at most one — a touch is the wave lost, so nothing is stepped
   * after it.
   */
  caughtTick: number;
  /**
   * The index of the hazard that caught it, or -1. The picture wants to know
   * which one to draw the flash on, and a seat that is about to be told what
   * went wrong wants to be told the same thing the picture says.
   */
  caughtBy: number;
  /**
   * Whether player 2's thumb is on the line, under `laden`.
   *
   * While it is, the ship is pulled straight toward home at `scoutReelMilli`
   * and player 1's turn and burn do nothing — so the line is a way *back* and
   * never a way *there*, which is the whole of why it does not break the
   * round's split (`scout-hand.ts`).
   */
  reeling: boolean;
  /**
   * `world.tick` player 1 last primed the thruster, or -1. Under `heavy` a
   * burn does nothing outside `scoutPrimeTicks` of it.
   */
  primeTick: number;
}

/** The arena being flown, or the last one when the round is over. */
export function scoutCurrent(scout: ScoutState): ScoutArena {
  return scout.arenas[Math.min(scout.arena, scout.arenas.length - 1)] as ScoutArena;
}

/**
 * Whether every mote in the current arena has been brought home.
 *
 * Banked and not merely collected: a ship full of motes that never came back
 * is a round nobody finished, which is the whole of what the second seat's
 * hand is for.
 */
export function scoutCleared(scout: ScoutState): boolean {
  return scout.banked.length >= scoutCurrent(scout).motes.length;
}

/** How many motes are still to be banked — out there or aboard. What the picture counts. */
export function scoutLeft(scout: ScoutState): number {
  return Math.max(0, scoutCurrent(scout).motes.length - scout.banked.length);
}

/** Whether the mother ship's mouth is open on this tick. */
export function scoutMawOpen(scout: ScoutState, tick: number, mawTicks: number): boolean {
  return scout.mawTick >= 0 && tick - scout.mawTick < mawTicks;
}
