import type { SimConfig } from "./config.js";
import type { ScoutLoad, ScoutState } from "./scout.js";
import { scoutHome } from "./scout-open.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/** The two counts `scoutLoad` reads, as little of `SimConfig` as it needs. */
export interface ScoutLoadBounds {
  scoutLadenMotes: number;
  scoutHeavyMotes: number;
}

/**
 * The load the motes aboard put the ship in. Never stored — what it is
 * carrying is the whole of it, the way `snakeGrip` reads a body's length and
 * `vanePhase` reads a bearing's pins.
 */
export function scoutLoad(cfg: ScoutLoadBounds, scout: ScoutState): ScoutLoad {
  if (scout.carrying.length > cfg.scoutHeavyMotes) return "heavy";
  if (scout.carrying.length > cfg.scoutLadenMotes) return "laden";
  return "light";
}

/**
 * Whether a burn takes this tick: always, until the ship is `heavy`, and then
 * only inside `scoutPrimeTicks` of a prime. One place, because the flight and
 * the picture must not disagree about whether the thruster is lit.
 */
export function scoutPrimed(
  cfg: ScoutLoadBounds & { scoutPrimeTicks: number },
  scout: ScoutState,
  tick: number,
): boolean {
  if (scoutLoad(cfg, scout) !== "heavy") return true;
  return scout.primeTick >= 0 && tick - scout.primeTick < cfg.scoutPrimeTicks;
}

/**
 * **THE SCOUT's two hands on its own picture**: player 2's line on the little
 * ship and player 1's prime on its thruster (`docs/spec/interludes.md`, THE
 * SCOUT's *Three loads, three hands*).
 *
 * Both are entered by the pair's **own last answer** — every mote they decide
 * to pick up rather than bank is what puts the ship in the next load — which
 * is the shape THE GAUGE's and PINBALL's states take for the same brief.
 *
 * **The line is player 2's**, and it is the split of `laden`. She is the seat
 * that can see the arena and cannot move the ship by a thousandth of a tile,
 * and that stays true: the line pulls **straight home**, at under half the
 * ship's own top speed, and player 1's turn and burn do nothing while it runs.
 * She chooses *when*, never *where*; the one place it goes is the place the
 * whole round is aiming at. What makes it a sentence rather than a button is
 * that the line runs through whatever is in the way — a hazard on that
 * straight line is a hazard the ship is being dragged into, and only she can
 * see it.
 *
 * **The prime is player 1's**, and it is the split of `heavy`. Three motes
 * aboard and the thruster labours: a burn does nothing at all unless he has
 * carried the ship inside the last `scoutPrimeTicks`. The ship is the one
 * thing his screen shows him, so it is a gesture he can make without her word
 * — and it costs him the hand that holds the burn, on the load where every
 * burn matters most.
 *
 * Nothing here can hurt them. A carry too short, a line on a ship that is not
 * laden, a prime on one that is not heavy — each does nothing, and the wave is
 * still lost only by a hazard's touch and by the clock (`scout-arena.ts`).
 */
export function scoutHandHeard(
  world: World,
  scout: ScoutState,
  player: 1 | 2,
  command: Command,
): void {
  if (command.kind !== "drag") return;
  if (command.target === "scoutLine") {
    if (player !== 2 || scoutLoad(world.cfg, scout) === "light") return;
    if (scout.reeling === command.on) return;
    scout.reeling = command.on;
    world.events.push({ type: command.on ? "scoutReel" : "scoutSlip" });
    return;
  }
  if (command.target !== "scoutPrime" || player !== 1) return;
  if (scoutLoad(world.cfg, scout) !== "heavy") return;
  // The press says nothing; the prime is the lift, and only one that
  // travelled — a thumb resting on the ship is not a thruster being lit.
  if (command.on) return;
  if (Math.abs(command.fromYMilli ?? 0) < world.cfg.scoutPrimeMilli) return;
  scout.primeTick = world.tick;
  world.events.push({ type: "scoutPrime" });
}

/**
 * One tick of the line, run from the flight step before anything else moves.
 *
 * It replaces the flight rather than adding to it: velocity is set straight at
 * home rather than accumulated, so a reeled ship arrives at a speed the pair
 * can predict and stops being a ship they are flying. `true` when it ran, and
 * the caller skips the burn and the drag on the ticks it did.
 */
export function stepScoutReel(cfg: SimConfig, scout: ScoutState, tick: number): boolean {
  if (!scout.reeling || scoutLoad(cfg, scout) === "light") return false;
  const home = scoutHome(cfg.cols, cfg.rows);
  const dCol = home.colMilli - scout.colMilli;
  const dRow = home.rowMilli - scout.rowMilli;
  // The larger of the two legs stands in for the length of the line. No square
  // root in this package (`scout-fly.ts` says so about the speed cap), and a
  // line that is a little fast on the diagonal is a line, not a flight.
  const span = Math.max(1, Math.max(Math.abs(dCol), Math.abs(dRow)));
  scout.vColMilli = Math.round((dCol * cfg.scoutReelMilli) / span);
  scout.vRowMilli = Math.round((dRow * cfg.scoutReelMilli) / span);
  // `tick` is taken and unused on purpose: every other step in this round is a
  // function of it, and a signature that hid that would be the one place a
  // reader had to check.
  void tick;
  return true;
}
