import { markMoment } from "./balance.js";
import { hullRow, msToTicks, type SimConfig } from "./config.js";
import type { Creature } from "./creature-types.js";
import { mirrorBaitTaken } from "./mirror-round.js";
import type { Pod } from "./pod-types.js";
import { scuttlePodTaken } from "./scuttle-step.js";
import { failWave } from "./wave-fail.js";
import { MILLI, type World } from "./world.js";

/**
 * **The mouth**: whether it is open, and what happens to a cargo that reaches
 * it either way.
 *
 * Split out of `pods.ts` when THE MOULT arrived and needed the second half of
 * this file without needing any of the first. The seam is a real one and it is
 * the one the two files are named along: everything left next door is about a
 * *pod* — a thing that hangs, is knocked loose and sinks — and everything here
 * is about the **ship**, which does not care what shape the thing arriving at
 * it was. A moult is not a pod: it is a body that falls down a lane and is
 * wearing a pod for five beats when it lands. But what the pair has to do
 * about one is the same two conditions, and what it costs them to miss is the
 * same lost wave, so the rule is written once and both callers read it.
 *
 * `pods.ts` re-exports `mawOpen`, so nothing that already asked the package
 * index for it had to move.
 */

/** Ticks the maw stays open, from `intakeWindowMs` at this tick rate. */
export function intakeWindowTicks(cfg: SimConfig): number {
  return msToTicks(cfg, cfg.intakeWindowMs);
}

/**
 * Whether the maw is open this tick — the one place that decides it.
 *
 * `resolveIntake` asks it of an arriving pod, `moultArrives` of an arriving
 * body, and the button and the sound ask the same question rather than writing
 * the window out again. They used `<` where this uses `<=`, so the mouth drew
 * and sounded shut one tick before it stopped swallowing.
 */
export function mawOpen(world: World): boolean {
  const windowTicks = intakeWindowTicks(world.cfg);
  return world.tick - world.intakeTick <= windowTicks && world.intakeTick <= world.tick;
}

/**
 * Whether something reaching the hull in `col` is inside the maw's reach: the
 * cannon's own column or within `podCatchCols` of it, since the owner widened
 * the catch on 16 October 2026. Asked by a pod and a moult alike, and by the
 * band that draws the reach, so the three cannot disagree about where it ends.
 */
export function inMawReach(world: World, col: number): boolean {
  return Math.abs(world.cannonCol - col) <= world.cfg.podCatchCols;
}

/**
 * A body falling a tile a beat, steered at the mouth: inside `podHomeTiles` of
 * the hull it takes one column a beat toward the cannon, a freed pod's last
 * stretch at a whole tile instead of thousandths. The moult's steer, and THE
 * MORSEL's once it is limp — one rule, so the two cannot drift apart.
 */
export function steerAtMaw(world: World, c: Creature): void {
  if (hullRow(world.cfg) - c.row > world.cfg.podHomeTiles) return;
  if (c.col === world.cannonCol) return;
  c.col += c.col < world.cannonCol ? 1 : -1;
}

/**
 * Swallowed. A pod gives nothing — the purge and the ward it used to carry
 * were rejected by the owner on 16 October 2026 — so what lands on the tick of
 * the catch is the receipt and the debt paid: the wave can end without it.
 *
 * `col` is where it went in, which is the cannon's column by construction —
 * both callers only reach this after checking that — and it is passed rather
 * than read off the world so the event says where the picture happened rather
 * than where the cannon has since slid to.
 */
export function takeCargo(world: World, col: number): void {
  world.balance.podsTaken += 1;
  markMoment(world, true);
  // A boss may have been hanging this out as bait — see `mirrorBaitTaken`.
  mirrorBaitTaken(world);
  // Or throwing it as a part of itself — see `scuttlePodTaken`.
  scuttlePodTaken(world, col);
  world.events.push({ type: "podTaken", col });
}

/**
 * Not swallowed, at the hull or off the side: **the wave is lost.** The owner's
 * rule of 12 September 2026 lists *sucked* beside destroyed, evaded and
 * shielded as the ways a wave is passed, so a cargo that breaks on the skin,
 * gets away, or is still on the field when its clock runs out is a hit and not
 * a missed gift.
 */
export function cargoLost(world: World, col: number, row?: number): void {
  world.balance.podsLost += 1;
  markMoment(world, false);
  failWave(world);
  const lost = { type: "podLost" as const, col: clampCol(world, col) };
  world.events.push(row === undefined ? lost : { ...lost, row });
}

/**
 * **A husk swallowed: the wave is lost.** The receipt is inverted — a pod
 * gives and a husk takes the same thing away — and the price is the one a lure
 * costs for the same mistake, which is the whole of the shape: the reflex that
 * pays off against every other thing that reaches the maw is the mistake here,
 * and only one of the two can see which is which.
 *
 * `podsTaken` is not moved. That counter is *pods taken in, of every pod that
 * reached the maw* and feeds the sheet's own line; a husk is neither taken nor
 * a pod, and counting it there would put a lost wave in the column that says
 * the pair met each other.
 */
export function huskSwallowed(world: World, pod: Pod): void {
  world.balance.husksSwallowed += 1;
  markMoment(world, false);
  failWave(world);
  world.events.push({ type: "huskSwallowed", ...whereItWas(world, pod) });
}

/**
 * **A husk refused: nothing at all happens.** The maw was shut, or the cannon
 * was elsewhere, and the thing goes the way of a balloon let go — no damage,
 * no scar, no hit. It is still a joint moment and the best kind: the navigator
 * saw the lie and the pilot stayed out of its way, which is two people doing
 * two different things about one object.
 */
export function huskRefused(world: World, pod: Pod): void {
  world.balance.husksRefused += 1;
  markMoment(world, true);
  world.events.push({ type: "huskRefused", ...whereItWas(world, pod) });
}

/** Where a husk was standing, for the two events that are the only picture of
 * it there will be. */
function whereItWas(world: World, pod: Pod): { col: number; row: number } {
  return {
    col: clampCol(world, Math.round(pod.colMilli / MILLI)),
    row: Math.round(pod.rowMilli / MILLI),
  };
}

/** The column an event may name, which is one that exists. A cargo blown a
 * tile past the wall is still lost in the wall's own column. */
function clampCol(world: World, col: number): number {
  return Math.max(0, Math.min(world.cfg.cols - 1, col));
}
