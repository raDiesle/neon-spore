import { midCol } from "./config.js";
import { type MantleState, mantleLeaking } from "./mantle.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * **THE MANTLE fighting back** (§23 rows 7 to 12): the four beats the fuller
 * story put between the third shear and the bared core, each a picture the
 * shell has not shown before and each under THE SLOW.
 *
 * - **The buckle** (row 7): the weakened valve bulges out. Both thumbs down
 *   on their handles and **eased off** — held, but above the floor rather
 *   than pulling — for `mantleBuckleBeats` presses it flat. Left bulging for
 *   `mantleBuckleWindowBeats`, it tears, and a spark leaks from the tear.
 * - **The vent** (row 8): a seam aperture hisses open. One tap on it, from
 *   either seat, shuts it; left open for `mantleVentBeats`, it feeds a spark.
 * - **The crosswise crack** (row 9): a picture beat, asking nothing, for
 *   `mantleCrossBeats`, and then the brace (`glowMantle`).
 * - **The turn** (row 12): after the last shear the halves swing on their
 *   hinges. Both handles pulled once more past the floor guides them open and
 *   bares the core; the window run out swings them back to try again.
 *
 * **Two departures from the page, argued.** A torn buckle leaks one spark
 * rather than *shearing the next pair for free and doubling the spark row*:
 * a free shear would skip the brace the whole third movement builds to, and
 * two sparks on one column is one spark. A vent missed while a spark is
 * already leaking feeds nothing more, for the same reason. The page's row 17,
 * a closing beat of sending nothing, is not built (`docs/queue.md`).
 */

/** The third shear left one pair: the weakened valve bulges. */
export function buckleMantle(world: World, s: MantleState): void {
  enter(world, s, "buckle");
  openSlow(world, world.cfg.mantleBuckleWindowBeats + 1, "ask");
  world.events.push({ type: "mantleBuckle", col: midCol(world.cfg) });
}

/** A beat of the buckle: pressed flat, torn, or still bulging. */
export function stepBuckle(world: World, s: MantleState): void {
  const cfg = world.cfg;
  const eased = (i: 0 | 1): boolean => s.held[i] && s.depthMilli[i] < cfg.mantleFloorMilli;
  s.braceBeats = eased(0) && eased(1) ? s.braceBeats + 1 : 0;
  if (s.braceBeats >= cfg.mantleBuckleBeats) {
    closeSlow(world);
    world.events.push({ type: "mantleFlat", col: midCol(cfg) });
    vent(world, s);
    return;
  }
  if (world.beat - s.phaseBeat < cfg.mantleBuckleWindowBeats) return;
  closeSlow(world);
  leak(world, s);
  vent(world, s);
}

/** The vent hisses open along the crack. */
function vent(world: World, s: MantleState): void {
  enter(world, s, "vent");
  openSlow(world, world.cfg.mantleVentBeats + 1, "ask");
  world.events.push({ type: "mantleVent", col: midCol(world.cfg) });
}

/** A beat of the vent: left open its beats, it feeds a spark. */
export function stepVent(world: World, s: MantleState): void {
  if (world.beat - s.phaseBeat < world.cfg.mantleVentBeats) return;
  closeSlow(world);
  leak(world, s);
  cross(world, s);
}

/** A tap on the open vent, from either seat: it shuts. */
export function sealMantle(world: World, s: MantleState): void {
  closeSlow(world);
  world.events.push({ type: "mantleSeal", col: midCol(world.cfg) });
  cross(world, s);
}

/** The second crack crosses the first, and the core's light pushes through. */
function cross(world: World, s: MantleState): void {
  enter(world, s, "cross");
  openSlow(world, world.cfg.mantleCrossBeats, "show");
  world.events.push({ type: "mantleCross", col: midCol(world.cfg) });
}

/** A beat of the crosswise crack: then the brace. */
export function stepCross(world: World, s: MantleState): void {
  if (world.beat - s.phaseBeat >= world.cfg.mantleCrossBeats) glowMantle(world, s);
}

/** The seam glows and the shell shudders: hold both handles, from nought.
 * `mantleSlip` when a lift mid-brace sent it back here. */
export function glowMantle(
  world: World,
  s: MantleState,
  why: "mantleGlow" | "mantleSlip" = "mantleGlow",
): void {
  enter(world, s, "brace");
  openSlow(world, world.cfg.mantleBraceBeats + 1, "ask");
  world.events.push({ type: why, col: midCol(world.cfg) });
}

/** The last shear: the halves swing on their hinges, waiting to be guided. */
export function turnMantle(world: World, s: MantleState): void {
  enter(world, s, "turn");
  openSlow(world, world.cfg.mantleTurnBeats + 1, "ask");
  world.events.push({ type: "mantleTurn", col: midCol(world.cfg) });
}

/** A beat of the turn: guided open, or swung wide and asked again. */
export function stepTurn(world: World, s: MantleState): void {
  const cfg = world.cfg;
  const [left, right] = s.depthMilli;
  if (left >= cfg.mantleFloorMilli && right >= cfg.mantleFloorMilli) {
    closeSlow(world);
    world.events.push({ type: "mantleTurned", col: midCol(cfg) });
    s.phase = "heartbeat";
    s.phaseBeat = world.beat;
    s.heartbeatNext = 0;
    s.heartbeatDone = 0;
    return;
  }
  if (world.beat - s.phaseBeat < cfg.mantleTurnBeats) return;
  s.phaseBeat = world.beat;
  openSlow(world, cfg.mantleTurnBeats + 1, "ask");
  world.events.push({ type: "mantleSwing", col: midCol(cfg) });
}

/** A phase begun: its clock from now, both handles back to nought. */
function enter(world: World, s: MantleState, phase: MantleState["phase"]): void {
  s.phase = phase;
  s.phaseBeat = world.beat;
  s.braceBeats = 0;
  s.depthMilli = [0, 0];
}

/** A spark leaks from the middle of the seam, unless one already is. */
function leak(world: World, s: MantleState): void {
  if (mantleLeaking(s)) return;
  s.sparkCol = midCol(world.cfg);
  s.sparkBeat = world.beat;
  world.events.push({ type: "mantleLeak", col: s.sparkCol });
}
