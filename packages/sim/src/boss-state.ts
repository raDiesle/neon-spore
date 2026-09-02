import type { FleetShip } from "./fleet-board.js";
import type { GaugeState } from "./gauge.js";
import type { MazeState } from "./maze-round.js";
import type { PinballState } from "./pinball.js";
import type { MirrorState } from "./simon.js";
import type { SnakeState } from "./snake.js";
import type { Color } from "./types.js";

/**
 * Everything the Bulb Queen encounter remembers between beats. It lives in
 * its own file rather than in `types.ts` because it is not a shared shape:
 * `boss.ts` and `queen-mark.ts` own every field here between them, and
 * nothing else may write one.
 */

export interface QueenState {
  kind: "queen";
  /** The id of the queen in `world.creatures`. */
  creatureId: number;
  /** 0-based phase index. */
  phase: number;
  /** The world beat the current phase started on. */
  phaseBeat: number;
  /** The column the announced bloom will open in, -1 when nothing is announced. */
  tellCol: number;
  /** The colour that bloom is vulnerable to. */
  tellColor: Color | null;
  /**
   * Which of the two marks — one tile either side of her own column — is
   * real this bloom. The other looks identical the whole time it is open
   * and never takes a hit (`queen-mark.ts`).
   */
  weakSide: -1 | 1;
  /**
   * The beat `tellColor` and `weakSide` were last chosen on. render/ runs the
   * mark's morph from one creature into the other off this, so the animation
   * needs no state of its own that a restart could carry over.
   */
  pickBeat: number;
  /**
   * The mark that stayed shut on the bloom that just closed — the one render/
   * balls up and then grows back into the next creature. 0 until the first
   * bloom has closed, which is what keeps a wave from opening on a mark
   * already halfway through shrinking.
   */
  spentSide: -1 | 0 | 1;
  /** The beat the announced bloom opens on, -1 for none. */
  openBeat: number;
  /** The first beat it is closed again, -1 for none. */
  closeBeat: number;
  /** Petals she started the fight with, so a drop in petals can be measured. */
  startPetals: number;
  /** The side her next scripted rock will emerge from: -1 left, 1 right, 0 none pending. */
  dropSide: -1 | 0 | 1;
  /** The beat her last torch broke off her, -1 before the first one has. */
  releaseBeat: number;
  /** Which side it broke off: -1 left, 1 right, 0 none yet. */
  releaseSide: -1 | 0 | 1;
  /** Integers owned by `boss.ts`. Nothing outside it reads them. */
  scratch: number[];
}

/**
 * Everything the Warden encounter remembers between beats — which is
 * deliberately little. Its cycle number, the rim's colour and the phase are all
 * *derived* from `world.waveBeat` and the plates (`warden-cycle.ts`), because a
 * fight with nothing random in it should have nothing to disagree about either.
 *
 * What is left is what cannot be derived: which line is live, where the pupil
 * has drifted to, and where the pulling hand is. The last of those is stored
 * rather than derived for a reason a phone makes plain — a finger held perfectly
 * still sends no messages at all, so tension that was recomputed from the last
 * command would go slack every time somebody stopped moving.
 */
export interface WardenState {
  kind: "warden";
  /** The id of the ring in `world.creatures`. */
  creatureId: number;
  /** The id of the live tether, or `0` while nothing is hanging. */
  tetherId: number;
  /** The column the pupil is in. It drifts; the body never moves. */
  pupilCol: number;
  /** Which way the pupil is drifting: 1 right, -1 left. */
  pupilDir: -1 | 1;
  /** Plates left on the rim. The silhouette is the health bar. */
  plates: number;
  /**
   * Whether this line's opening has already taken its one hit. It is also what
   * `stepWardenTether` reads to snap the rope back, so it is cleared at the
   * attach that replaces the line and nowhere else.
   */
  eyeSpent: boolean;
  /** Whether a hand is on the handle at all. */
  pulling: boolean;
  /**
   * Where that hand was when it grabbed, in thousandths of a tile of its own
   * device's displacement. The origin never crosses the wire (`Command` in
   * `types.ts`); this is the sim's copy of the one the pulling device resolved.
   */
  pullOriginMilli: number;
  /**
   * How far the handle has been carried off its column, in thousandths of a
   * tile, clamped to `wardenTautMilli` either way.
   *
   * **Signed**, and the sign is the picture rather than the rule: the tension
   * is its magnitude, so a gate on a block and tackle does not care which way
   * you lean — but the rope has to be drawn swinging the way the hand actually
   * went, or the one thing player 2 can see about their partner's hand is a
   * mirror image of it.
   */
  pullMilli: number;
}

/**
 * Everything THE VANE remembers between beats, which is four integers.
 *
 * Where the arm is standing, how far it reaches, whether the bearing is split
 * and which side of it, what colour that side carries — all of it is derived
 * from the wave's beat and the pins (`vane-cycle.ts`). What cannot be derived
 * is how many pins are left, which opening has already spent its one shot, and
 * the last thing the arm threw, which is render/'s to draw and nobody else's.
 */
export interface VaneState {
  kind: "vane";
  /** Pins left in the bearing. Each one gone lets the arm slip further out. */
  pins: number;
  /**
   * The opening whose one shot has been spent, -1 for none yet. An index and
   * not a flag: openings are numbered from the start of the wave, so "already
   * spent" is one integer against another and nothing has to remember to clear
   * itself when the housing shuts.
   */
  spentOpening: number;
  /** The beat the arm last threw an arrival, -1 before the first. render/ only. */
  throwBeat: number;
  /** The column that arrival was thrown into, -1 before the first. render/ only. */
  throwCol: number;
}

/**
 * Everything THE FLEET remembers between beats: an authored chart, the squares
 * already fired at, and where the sights are standing.
 *
 * **`ships` never changes for the whole fight.** A hull that has been hit does
 * not move and does not shrink — what changes is the list of squares somebody
 * has fired into, and everything else about the fight is read off those two
 * (`fleet-board.ts`). That is why a ship has no `hits` of its own: a count
 * beside the placement would be a second copy of `struck` and the two would
 * disagree the first time a salvo landed on a square that had already taken
 * one.
 */
export interface FleetState {
  kind: "fleet";
  /** Where the ships are, as the wave authored them. Never written. */
  ships: FleetShip[];
  /**
   * Every square fired at, as chart indices (`fleetIndex`), in the order they
   * were struck. Both a hit and a splash go in: the chart is the shared record
   * and a square nobody may spend twice.
   */
  struck: number[];
  /**
   * The beat each ship went down on, `-1` while it is still afloat. One entry
   * per ship, in `ships` order — render/ runs the sinking off it, so the
   * animation needs no state of its own that a restart could carry over, and
   * the simulation needs no separate count of what is left.
   */
  sunkBeat: number[];
  /** The column the sights stand in. Player 2's, and only player 2's. */
  aimCol: number;
  /** The row they stand in. */
  aimRow: number;
  /** The beat the fight opened on — the round's own clock. */
  openBeat: number;
  /** The beat of the most recent salvo, for the rest between two of them. */
  firedBeat: number;
  /** Where that salvo landed, `-1` before the first. render/ only. */
  lastCol: number;
  lastRow: number;
  /** Whether it found a hull. render/ only. */
  lastHit: boolean;
}

/**
 * The boss a wave installed, whichever one it is. A tagged union rather than
 * one widening interface: the six bosses share the slot and nothing else,
 * and a single struct carrying every set of fields would let `boss.ts` read a
 * `tellColor` off a mirror and get `undefined` at runtime with a clean type
 * check behind it.
 *
 * `GaugeState` is in here and its fields are in `gauge.ts` rather than beside
 * the other four, for the reason the maze's and the mirror's are in theirs:
 * one file owns a fight's state and nothing else writes it.
 */
export type BossState =
  | QueenState
  | MirrorState
  | WardenState
  | VaneState
  | MazeState
  | GaugeState
  | FleetState
  | SnakeState
  | PinballState;
