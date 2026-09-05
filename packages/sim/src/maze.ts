import type { SimConfig } from "./config.js";
import type { MazeState } from "./maze-round.js";
import type { MazeWheel } from "./maze-wheel.js";

/**
 * THE MAZE's wheel, as arithmetic. No world, no events, no mutation — what the
 * pair plays against it is `maze-round.ts` next door, the same split
 * `shell.ts` and `shell-round.ts` make.
 *
 * **A drum of rings the pilot turns and the shot explores.** A real maze of
 * concentric rings hangs over the ship, with one gap cut in its rim. The pilot
 * pulls a string and the wheel turns; when the gap comes near a column it
 * **clicks onto it** and stops, and both screens light it. The cannon slides
 * under that column and player 2 fires. The shot goes in through the gap and
 * crawls the corridors where both of them watch it, turning where the walls
 * turn, and arrives in the middle. Firing at nothing is what costs the hull.
 *
 * **What this replaces.** The lattice that stood here split the two screens by
 * *layer* — the pilot saw a node's arms, the navigator saw its wall, and the
 * way through was the arm that was not walled. The owner was asked three times
 * whether the wheel should keep a split of that kind and said no three times:
 * the light is on both screens, the shot's journey is on both screens, and
 * neither of them knows what is in the middle. So **nothing here is knowledge
 * one player has and the other does not**, which the old header called the
 * failure to avoid. It is a decision, and this file builds it. What carries
 * the round instead is the *verbs* — one turns and cannot fire, the other
 * fires and cannot turn — and the hull a wrong way in costs, which is what
 * makes the sentence before the next attempt worth saying.
 *
 * **The stale-sentence objection is met rather than stepped over.** The old
 * lattice deliberately did not move, because a discrete fact — "left at the
 * third node" — goes out of date in the half second to two the voice channel
 * carries (`docs/spec/latency.md`). A held control with live feedback carries
 * no such fact: it is "more — more — there", which is THE GAUGE (`gauge.ts`)
 * and already works at this latency. The click is what makes it better than
 * the gauge here — a lock is discrete, countable and announceable, so the pair
 * goes back to saying *column seven* instead of describing an angle.
 *
 * **Wheels are authored, never generated** (`packages/content/src/maze-rounds.ts`),
 * the layout and the opening angle both. Nothing here draws from the rng.
 *
 * **Integers, in thousandths, and rotation is where a float would get in.**
 * The angle is whole thousandths of a degree, the sine is a table of whole
 * thousandths read with integer interpolation, and the click is integer
 * bisection. `Math.sin` is never called here: two engines are not obliged to
 * round it the same way, and two devices must never disagree about a rounding
 * step. Everything a picture needs is a call into this file.
 */

/** A whole turn, in thousandths of a degree. Every angle here is one of these. */
export const MAZE_TURN = 360_000;
const MAZE_QUARTER = MAZE_TURN / 4;
const MAZE_HALF = MAZE_TURN / 2;

/**
 * `sin` at whole degrees, in thousandths, 0° to 90°. A literal table rather
 * than `Math.sin` for the reason the header gives: this number decides which
 * column a way in clicks onto, and an engine that rounded it differently would
 * deal the two devices different answers to the same question.
 */
const MAZE_SIN: readonly number[] = [
  0, 17, 35, 52, 70, 87, 105, 122, 139, 156, 174, 191, 208, 225, 242, 259, 276, 292, 309, 326, 342,
  358, 375, 391, 407, 423, 438, 454, 469, 485, 500, 515, 530, 545, 559, 574, 588, 602, 616, 629,
  643, 656, 669, 682, 695, 707, 719, 731, 743, 755, 766, 777, 788, 799, 809, 819, 829, 839, 848,
  857, 866, 875, 883, 891, 899, 906, 914, 921, 927, 934, 940, 946, 951, 956, 961, 966, 970, 974,
  978, 982, 985, 988, 990, 993, 995, 996, 998, 999, 999, 1000, 1000,
];

/** An angle folded into one turn. Negative angles included, hence the twice. */
export function mazeWrap(angleMilli: number): number {
  return ((angleMilli % MAZE_TURN) + MAZE_TURN) % MAZE_TURN;
}

/**
 * `sin`, in thousandths, of an angle in thousandths of a degree. Whole degrees
 * come off the table and everything between two of them is one integer
 * interpolation — smooth enough that the wheel does not step, exact enough
 * that both devices step the same way.
 */
export function mazeSinMilli(angleMilli: number): number {
  const a = mazeWrap(angleMilli);
  if (a >= MAZE_HALF) return -mazeSinMilli(a - MAZE_HALF);
  const b = a > MAZE_QUARTER ? MAZE_HALF - a : a;
  const deg = Math.floor(b / 1000);
  const lo = MAZE_SIN[deg] ?? 0;
  const hi = MAZE_SIN[deg + 1] ?? lo;
  return lo + Math.round(((hi - lo) * (b % 1000)) / 1000);
}

/** `cos`, in thousandths. Positive is the half of the rim facing the ship. */
export function mazeCosMilli(angleMilli: number): number {
  return mazeSinMilli(angleMilli + MAZE_QUARTER);
}

/**
 * The rim's radius, in thousandths of a column. Derived from the field's own
 * width, so the wheel is the same share of it however wide the field is.
 */
export function mazeRadiusMilli(cfg: SimConfig): number {
  return Math.round((cfg.cols * cfg.mazeSpanMilli) / 2);
}

/** The column-space x the wheel is centred on, in thousandths of a column. */
export function mazeCenterMilli(cfg: SimConfig): number {
  return cfg.cols * 500;
}

/** The angle a way in stands at, 0 being straight down at the ship. */
export function mazeEntranceAngle(wheel: MazeWheel, angleMilli: number, index: number): number {
  return mazeWrap(angleMilli + (wheel.entrances[index]?.angleMilli ?? 0));
}

/** Where a way in stands across the field, in thousandths of a column. */
export function mazeEntranceX(
  cfg: SimConfig,
  wheel: MazeWheel,
  angleMilli: number,
  index: number,
): number {
  const theta = mazeEntranceAngle(wheel, angleMilli, index);
  return mazeCenterMilli(cfg) + Math.round((mazeRadiusMilli(cfg) * mazeSinMilli(theta)) / 1000);
}

/**
 * The column a way in has clicked onto, or -1.
 *
 * The bridge between an angle and the only word the pair has for a place. It
 * counts when the mouth is on the half of the rim facing the ship and within
 * `mazeSnapMilli` of a column's centre — narrow enough that a lit mouth reads
 * as standing *on* the column, wide enough that the wheel can never turn past
 * one between two ticks. Call this; a second copy of it is how a picture comes
 * to light a column the shot does not go up.
 */
export function mazeEntranceCol(
  cfg: SimConfig,
  wheel: MazeWheel,
  angleMilli: number,
  index: number,
): number {
  if (mazeCosMilli(mazeEntranceAngle(wheel, angleMilli, index)) <= 0) return -1;
  const x = mazeEntranceX(cfg, wheel, angleMilli, index);
  const col = Math.floor(x / 1000);
  if (col < 0 || col >= cfg.cols) return -1;
  return Math.abs(x - (col * 1000 + 500)) <= cfg.mazeSnapMilli ? col : -1;
}

/**
 * The angle that puts a way in exactly on a column, found by bisection on
 * whole thousandths of a degree. Integer arithmetic on a function that only
 * rises across the near half of the rim, so it lands in the same place on both
 * devices — which `Math.asin` would not promise.
 */
export function mazeClickAngle(
  cfg: SimConfig,
  wheel: MazeWheel,
  angleMilli: number,
  index: number,
  col: number,
): number {
  const target = col * 1000 + 500;
  const span = 4 * cfg.mazeSnapMilli + 4000;
  let lo = angleMilli - span;
  let hi = angleMilli + span;
  for (let i = 0; i < 24 && hi - lo > 1; i++) {
    const mid = Math.floor((lo + hi) / 2);
    if (mazeEntranceX(cfg, wheel, mid, index) < target) lo = mid;
    else hi = mid;
  }
  const off = (a: number) => Math.abs(mazeEntranceX(cfg, wheel, a, index) - target);
  return mazeWrap(off(lo) <= off(hi) ? lo : hi);
}

/**
 * Which part of a round the maze is in, in a fixed order so a fingerprint can
 * push one as a number. `lead` is the quiet before a fresh wheel, `read` is
 * the pair's turn to turn and aim, `travel` is the shot walking the corridor
 * where both of them watch it, `verdict` is what it found.
 */
export const MAZE_PHASES = ["lead", "read", "travel", "verdict"] as const;
export type MazePhase = (typeof MAZE_PHASES)[number];

/**
 * Everything about THE MAZE that goes into `hashWorld`, in a fixed order.
 *
 * The angle is the first of them and the most important: two devices that
 * disagree about where the wheel stands are lighting different columns, and
 * everything after it is downstream of that. The wheel itself is in there
 * although it is authored, because that is precisely the assumption worth
 * checking — a wave list that drifted by one entry would deal the pair
 * different drums and nothing else would say a word about it.
 */
export function mazeHashParts(m: MazeState): number[] {
  const parts = [
    m.round,
    MAZE_PHASES.indexOf(m.phase),
    m.phaseBeat,
    m.angleMilli,
    m.turn,
    m.armed ? 1 : 0,
    // The hand on the string, and where it grabbed. The wheel turns by the
    // change in this between two messages, so two devices that disagree about
    // the origin turn it by different amounts on the very next drag — THE
    // WARDEN's rope is hashed for this reason, field for field.
    m.dragging ? 1 : 0,
    m.dragFromMilli,
    m.lockedCol,
    m.lockedWay,
    m.way,
    m.step,
    m.hullMilli,
    m.verdict,
    m.verdictCol,
  ];
  // Every wheel, not only the one in front of the pair. `m.round` above says
  // which is current; what these cover is the assumption that both devices
  // were dealt the same drums, which is the one worth checking rather than the
  // one that is safe.
  parts.push(m.rounds.length);
  for (const wheel of m.rounds) {
    parts.push(wheel.rings, wheel.coreMilli, wheel.openMilli, wheel.startMilli);
    // The walls themselves, and not only the way through them: a drum whose
    // circles were dealt differently draws a different maze round the same
    // route, and the two screens would be arguing about which gap is which.
    for (const list of [...wheel.walls, ...wheel.openings]) {
      parts.push(list.length);
      for (const angle of list) parts.push(angle);
    }
    parts.push(wheel.entrances.length);
    for (const entrance of wheel.entrances) {
      parts.push(entrance.angleMilli, entrance.route.length);
      for (const cell of entrance.route) parts.push(cell.ring, cell.angleMilli);
    }
  }
  parts.push(m.tried.length);
  for (const way of m.tried) parts.push(way);
  parts.push(m.scars.length);
  for (const scar of m.scars) parts.push(scar.col, scar.beat);
  return parts;
}
