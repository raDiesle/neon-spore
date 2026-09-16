import { metColor, missedColor } from "./balance.js";
import {
  type BatonState,
  batonBaseCol,
  batonBeadCol,
  batonBeadRowMilli,
  batonDark,
  batonLocked,
} from "./baton.js";
import { batonBoss } from "./baton-step.js";
import { clampCol } from "./config-derived.js";
import { reachesShip } from "./ship-verbs.js";
import type { Bullet, TimedCommand } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * THE BATON's presses: the launch, the strike, the take and the lock.
 *
 * All four happen on the **tick**, from wherever the press arrives —
 * `commands.ts`, `bullets.ts`, `pods.ts` — because a press that waited for
 * the next beat would put a queue between *going* and the going. The clock
 * that answers them is `baton-step.ts`.
 */

function enter(world: World, b: BatonState, stage: BatonState["stage"]): void {
  b.stage = stage;
  b.stageBeat = world.beat;
}

/**
 * **Player 1's trigger, while the bead sits.** Called from `commands.ts` on
 * the `guard` press beside `armShield`, which still runs — a dome coming up
 * under a bead in flight costs nothing and the trigger is the one verb that
 * seat has with nothing under it while the arm hangs. A no-op unless THE
 * BATON is installed and the bead is sitting.
 *
 * Once enough sockets are dark the arm swings: the bead lands a column off
 * the one it left, so the flight crosses a column and the cannon has to
 * follow it between player 1's own turns — which are the only beats he can.
 */
export function batonLaunch(world: World): void {
  const b = batonBoss(world);
  if (b === null || b.stage !== "sitting") return;
  const cfg = world.cfg;
  b.fromCol = b.col;
  if (batonDark(b) >= cfg.batonSwingAfter) {
    // Right, back, left, back — from the first swung flight on, so the first
    // one *is* a swing and the pair meets it the beat the arm starts moving.
    const swing = [1, 0, -1, 0][(b.handovers - cfg.batonSwingAfter) % 4] ?? 0;
    b.col = clampCol(cfg, batonBaseCol(cfg) + swing);
  }
  b.flightTick = world.tick;
  b.struck = false;
  enter(world, b, "flying");
  b.lockUntil[0] = world.beat + cfg.batonLockBeats;
  world.events.push({ type: "batonLaunch", col: b.fromCol, socket: b.socket });
}

/**
 * Where the bead is in this bolt's column and sweep, in thousandths of a row,
 * or -1 when the bolt cannot meet it this tick. Asked by `bullets.ts` beside
 * the bodies and pods in the same segment, so the lowest of the three is the
 * one the shot reaches first. A sitting bead is not there for a shot at all,
 * and neither is one already struck this flight.
 */
export function batonBeadAlong(world: World, bullet: Bullet, from: number, to: number): number {
  const b = batonBoss(world);
  if (b === null || b.stage !== "flying" || b.struck) return -1;
  if (bullet.col !== batonBeadCol(world.cfg, b, world.tick)) return -1;
  const milli = batonBeadRowMilli(world.cfg, b, world.tick);
  return milli >= to && milli <= from ? milli : -1;
}

/**
 * **Player 2's shot, through the bead in flight.** The bolt is spent either
 * way; the bead's colour decides whether it took. Right, and the handover is
 * made and she is locked out for the beat after — the other half of the turn.
 * Wrong, and it is a miss like any other: the bead is still in the air and
 * player 1 is still locked, so the next shot is still hers.
 */
export function batonStruck(world: World, bullet: Bullet, milli: number): void {
  const b = batonBoss(world);
  if (b === null) return;
  if (bullet.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: bullet.col, row: Math.round(milli / MILLI) });
    return;
  }
  b.struck = true;
  metColor(world);
  b.lockUntil[1] = world.beat + world.cfg.batonLockBeats;
  world.events.push({ type: "batonStruck", col: bullet.col, socket: b.socket });
}

/**
 * The maw took the bead. Called from `pods.ts` for every pod taken and a
 * no-op unless it is this one — a purge pod the wave's author hung is the
 * wave's own and means what it always means.
 */
export function batonBeadTaken(world: World, podId: number): void {
  const b = batonBoss(world);
  if (b === null || b.stage !== "falling" || b.podId !== podId) return;
  enter(world, b, "down");
  world.events.push({ type: "batonDown", col: b.col });
}

/**
 * **The TurnLock**, asked in `applyCommand` above the switch beside
 * `stareBreaks`. A seat that acted is dead for the beat after: every verb
 * that reaches the ship is swallowed, and — unlike THE STARE — swallowed
 * silently, because the seat was not warned off, it was told *not yet*. The
 * picture says which (`docs/spec/bosses-choreographed.md` §10, the grey
 * panel). The other seat is untouched, which is the whole of the alternation.
 */
export function batonLocks(world: World, timed: TimedCommand): boolean {
  const b = batonBoss(world);
  if (b === null || b.stage === "unfolding" || b.stage === "down") return false;
  if (!batonLocked(b, timed.player, world.beat)) return false;
  return reachesShip(timed.command);
}
