import { metColor, missedColor } from "./balance.js";
import {
  type BatonBead,
  type BatonState,
  batonBaseCol,
  batonDark,
  batonLead,
  batonLocked,
} from "./baton.js";
import { batonBeadCol, batonBeadRowMilli, batonLaunchable, batonSocketCol } from "./baton-bead.js";
import { batonAct, batonActor, batonCrossLaunch, batonCrossStruck } from "./baton-cross.js";
import { batonBoss } from "./baton-step.js";
import { clampCol } from "./config-derived.js";
import { reachesShip } from "./ship-verbs.js";
import type { Bullet, TimedCommand } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * THE BATON's presses: the launch, the shot, the strike, the take and the
 * lock.
 *
 * All five happen on the **tick**, from wherever the press arrives —
 * `commands.ts`, `bullets.ts`, `lance-burn.ts`, `pods.ts` — because a press
 * that waited for the next beat would put a queue between *going* and the
 * going. The clock that answers them is `baton-step.ts`.
 */

function enter(world: World, b: BatonState, stage: BatonState["stage"]): void {
  b.stage = stage;
  b.stageBeat = world.beat;
}

/**
 * **Player 1's trigger, while a bead sits.** Called from `commands.ts` on
 * the `guard` press beside `armShield`, which still runs — a dome coming up
 * under a bead in flight costs nothing and the trigger is the one verb that
 * seat has with nothing under it while the arm hangs. A no-op unless THE
 * BATON is installed and a bead is there to send (`batonLaunchable`).
 *
 * Once enough sockets are dark the arm swings: the bead lands a column off
 * the one it left, so the flight crosses a column and the cannon has to
 * follow it between player 1's own turns — which are the only beats he can.
 */
export function batonLaunch(world: World): void {
  const b = batonBoss(world);
  if (b === null) return;
  const cfg = world.cfg;
  // On the crossing the trigger is his act, when it is his; out of turn it
  // is a press on nothing.
  if (b.stage === "crossing") {
    if (batonActor(b) !== 1) return;
    batonAct(world, b);
    b.lockUntil[0] = world.beat + cfg.batonLockBeats;
    return;
  }
  if (b.stage !== "passing") return;
  const bead = batonLaunchable(cfg, b);
  if (bead === null) return;
  bead.fromCol = batonSocketCol(b, bead.socket);
  bead.col = bead.fromCol;
  // The merged bead's flight out of the last socket is the crossing.
  if (b.merged && bead.socket === cfg.batonSockets - 1) batonCrossLaunch(world, b, bead);
  // Only the lead bead swings the arm: the other flies straight down the
  // column of the socket it sat in, riding the arm wherever the lead is.
  else if (bead === batonLead(b) && batonDark(b) >= cfg.batonSwingAfter) {
    // Right, back, left, back — from the first swung flight on, so the first
    // one *is* a swing and the pair meets it the beat the arm starts moving.
    // Counted in dark sockets rather than handovers: only the lead darkens a
    // new one, so the twin's turns in between do not skip the arm a step.
    const swing = [1, 0, -1, 0][(batonDark(b) - cfg.batonSwingAfter) % 4] ?? 0;
    bead.col = clampCol(cfg, batonBaseCol(cfg) + swing);
    b.col = bead.col;
  }
  bead.flying = true;
  bead.flightTick = world.tick;
  bead.struck = false;
  b.lockUntil[0] = world.beat + cfg.batonLockBeats;
  world.events.push({ type: "batonLaunch", col: bead.fromCol, socket: bead.socket });
}

/**
 * The bead a bolt in `col` at `milli` is going through: the lowest one in
 * the air there, not yet struck this flight, between `to` and `from`.
 */
function beadAlong(
  world: World,
  b: BatonState,
  col: number,
  from: number,
  to: number,
): BatonBead | null {
  let pick: BatonBead | null = null;
  let pickMilli = -1;
  for (const bead of b.beads) {
    if (!bead.flying || bead.struck || batonBeadCol(world.cfg, b, bead, world.tick) !== col)
      continue;
    const milli = batonBeadRowMilli(world.cfg, bead, world.tick);
    if (milli < to || milli > from || milli <= pickMilli) continue;
    pick = bead;
    pickMilli = milli;
  }
  return pick;
}

/**
 * Where a bead is in this bolt's column and sweep, in thousandths of a row,
 * or -1 when the bolt cannot meet one this tick. Asked by `bullets.ts` beside
 * the bodies and pods in the same segment, so the lowest of the three is the
 * one the shot reaches first. A sitting bead is not there for a shot at all,
 * and neither is one already struck this flight; with two in the air in one
 * column it is the lower, which is the one the bolt reaches first.
 */
export function batonBeadAlong(world: World, bullet: Bullet, from: number, to: number): number {
  const b = batonBoss(world);
  if (b === null || (b.stage !== "passing" && b.stage !== "crossing")) return -1;
  const bead = beadAlong(world, b, bullet.col, from, to);
  return bead === null ? -1 : batonBeadRowMilli(world.cfg, bead, world.tick);
}

/**
 * **Player 2's shot, wherever it went.** The act is the shot leaving, not
 * the hit: a bolt at a creature is her turn spent, the beam she filled is
 * her turn spent, and so is a bolt that meets nothing (the design's step 7 —
 * *answering one **is** the act*). Called from `bullets.ts` and
 * `lance-burn.ts` on the tick the shot goes out, so a seat that fires at
 * the field while the bead sits has to watch the launch through a grey
 * panel: that is the choice the step puts to her, the bead or the field.
 * A no-op while there is no turn to spend — before the bead first sits and
 * once the arm is down, the two stages `batonLocks` ignores too.
 */
export function batonShotSpends(world: World): void {
  const b = batonBoss(world);
  if (b === null || b.stage === "unfolding" || b.stage === "down") return;
  b.lockUntil[1] = Math.max(b.lockUntil[1], world.beat + world.cfg.batonLockBeats);
}

/**
 * **Player 2's shot, through a bead in flight.** The bolt is spent either
 * way, and so was her turn when it left (`batonShotSpends`); the bead's
 * colour decides whether it took — and with two in the air, *which* bead the
 * bolt met decides which colour was right. Right, and the handover is made. Wrong,
 * and it is a miss like any other: the bead is still in the air, player 1 is
 * still locked, and the flight is longer than her lock, so the next shot is
 * still hers.
 */
export function batonStruck(world: World, bullet: Bullet, milli: number): void {
  const b = batonBoss(world);
  if (b === null) return;
  const bead = beadAlong(world, b, bullet.col, milli, milli);
  if (bead === null) return;
  if (bullet.color !== bead.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: bullet.col, row: Math.round(milli / MILLI) });
    return;
  }
  if (b.stage === "crossing") {
    batonCrossStruck(world, b, bead);
    return;
  }
  bead.struck = true;
  metColor(world);
  world.events.push({ type: "batonStruck", col: bullet.col, socket: bead.socket });
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
  // **The arm is not the ship.** A thumb on a swelling socket is the one thing
  // the locked seat is *for* — the lock is what says which of them may strip
  // it — so a rule that swallowed it would take the gesture away from the only
  // seat allowed to make it (`baton-hand.ts`).
  if (timed.command.kind === "drag" && timed.command.target === "batonSocket") return false;
  return reachesShip(timed.command);
}
