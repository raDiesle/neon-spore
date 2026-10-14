import { type BastionState, bastionBoss, bastionLitStep, bastionPlateOf } from "./bastion.js";
import { bastionTakes } from "./bastion-step.js";
import {
  bastionPlateWay,
  bastionTrackLen,
  bastionTrackOf,
  bastionTrackPoints,
} from "./bastion-track.js";
import { midCol } from "./config.js";
import { curveNearest } from "./curve.js";
import { type Pull, pullHeard, pullTravelMilli } from "./pull.js";
import { rimLapMilli, rimTurnMilli } from "./rim-turn.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE BASTION's hands: a plate on each side, `bastionPlateLeft` the pilot's
 * and `bastionPlateRight` the navigator's, and the rim, `bastionSpin`, the
 * pilot's alone.
 *
 * **A plate is pulled along its track** (`bastion-track.ts`). The drag is
 * carried in any direction (`fromMilli` the x, `fromYMilli` the y). On a
 * straight track what counts is how far it has come along the plate's own
 * way out: sideways is nothing, and back towards the core is nothing. On a
 * curve it is the point of the curve nearest the thumb, looked for no more
 * than `bastionStrideMilli` either side of where the plate is, so a thumb
 * cannot cut across a bend; **a thumb more than `bastionSlackMilli` off the
 * curve loses the plate**, which slips and snaps back, said, and the thumb
 * holds nothing more until it lifts. At the track's end the plate tears off
 * on the tick — the one generic PULL (`pull.ts`), counted the moment it
 * gets there — and the thumb holds nothing more until it lifts. **Let go
 * before that and the plate snaps back** — said, and only that plate starts
 * over; the other side keeps every plate it has taken (the owner, 8 October
 * 2026, from THE GRINDSTONE).
 *
 * **A thumb on the partner's side** takes hold of nothing and is said
 * (`bastionWrong`), THE LATCH's reason (`latch-hand.ts`).
 *
 * **The rim is THE MAZE's lever** (`rim-turn.ts`): `fromMilli` how far round
 * the rim the thumb has come since it took hold, the step from the last
 * reading taken the short way round, and the moon turned by it, either way.
 * The guns ride round with it; the one at the front is the one a shot meets.
 */
export function bastionHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = bastionBoss(world);
  if (s === null || s.phase === "spent") return;
  const seat: 0 | 1 = player === 1 ? 0 : 1;
  if (command.target === "bastionSpin") {
    if (seat === 0) spun(world, s, command.on, command.fromMilli);
    else if (command.on && command.fromMilli === 0) wrong(world, seat);
    return;
  }
  const side = sideOf(command.target);
  if (side === null) return;
  if (side !== seat) {
    if (command.on && command.fromMilli === 0 && (command.fromYMilli ?? 0) === 0) {
      wrong(world, seat);
    }
    return;
  }
  if (!command.on) {
    letGo(world, s, seat);
    return;
  }
  s.down[seat] = true;
  if (s.tore[seat] || bastionLitStep(s)?.layer !== "plates") return;
  const i = bastionPlateOf(s, seat);
  if (i < 0 || !pulled(world, s, seat, i, command.fromMilli, command.fromYMilli ?? 0)) return;
  const { heard } = pullHeard(plateRope(world, s, i), false, true, s.pullMilli[seat]);
  if (heard !== "counted") return;
  s.pullMilli[seat] = 0;
  s.tore[seat] = true;
  world.events.push({ type: "bastionTear", seat, piece: i, col: plateCol(world, seat) });
  bastionTakes(world, s, i);
}

/**
 * Plate `i` carried to where the thumb, `x` across and `y` down from where
 * it took hold, has it along its track. False when the thumb has strayed off
 * a curve: the plate has slipped, or — barely moved yet — stays put.
 */
function pulled(world: World, s: BastionState, seat: 0 | 1, i: number, x: number, y: number) {
  const cfg = world.cfg;
  const track = bastionTrackOf(s, i);
  if (track === "straight") {
    const [wx, wy] = bastionPlateWay(i);
    s.pullMilli[seat] = pullTravelMilli(plateRope(world, s, i), (x * wx + y * wy) / 1000);
    return true;
  }
  const at = s.pullMilli[seat];
  const len = bastionTrackLen(cfg, track);
  const pts = bastionTrackPoints(cfg, track, i);
  const near = curveNearest(
    pts,
    len,
    x,
    y,
    at - cfg.bastionStrideMilli,
    at + cfg.bastionStrideMilli,
  );
  if (near.offSq <= cfg.bastionSlackMilli * cfg.bastionSlackMilli) {
    s.pullMilli[seat] = near.along;
    return true;
  }
  if (at < cfg.bastionSnapMilli) return false;
  s.pullMilli[seat] = 0;
  s.tore[seat] = true;
  world.events.push({ type: "bastionSnap", seat, piece: i, col: plateCol(world, seat) });
  return false;
}

function sideOf(target: string): 0 | 1 | null {
  if (target === "bastionPlateLeft") return 0;
  if (target === "bastionPlateRight") return 1;
  return null;
}

/** The column a side's plates hang over, for the sound: three out from the middle. */
function plateCol(world: World, seat: 0 | 1): number {
  return midCol(world.cfg) + (seat === 0 ? -3 : 3);
}

/**
 * A plate's track as the one generic PULL (`pull.ts`): out along it, the
 * track's whole length long. What the plate has come is measured along the
 * track, straight or curved, so the rule only ever sees one number.
 */
function plateRope(world: World, s: BastionState, i: number): Pull {
  return { way: "down", reachMilli: bastionTrackLen(world.cfg, bastionTrackOf(s, i)) };
}

/**
 * A plate let go: short of tearing, it snaps back and starts over — the
 * generic PULL's short lift, said as the plate's own snap. A plate barely
 * moved is a tap and says nothing; one torn or slipped has nothing to say.
 */
function letGo(world: World, s: BastionState, seat: 0 | 1): void {
  const was = s.pullMilli[seat];
  const spent = s.tore[seat];
  s.down[seat] = false;
  s.tore[seat] = false;
  s.pullMilli[seat] = 0;
  const piece = bastionPlateOf(s, seat);
  if (bastionLitStep(s)?.layer !== "plates" || piece < 0) return;
  if (pullHeard(plateRope(world, s, piece), spent, false, was).heard !== "short") return;
  world.events.push({ type: "bastionSnap", seat, piece, col: plateCol(world, seat) });
}

/**
 * The pilot's thumb on the rim. Taking hold marks where; carried, the moon
 * turns by the way round it has come, at the rim's own gearing, so the gun
 * under the thumb stays under it.
 */
function spun(world: World, s: BastionState, on: boolean, from: number): void {
  if (!on) {
    s.spinning = false;
    return;
  }
  if (!s.spinning) {
    s.spinning = true;
    s.spinAtMilli = from;
    return;
  }
  const radius = world.cfg.bastionRimMilli;
  const lap = rimLapMilli(radius);
  let moved = (from - s.spinAtMilli) % lap;
  if (moved > lap / 2) moved -= lap;
  if (moved < -lap / 2) moved += lap;
  s.spinAtMilli += moved;
  if (bastionLitStep(s)?.layer !== "ring") return;
  const turn = 360_000;
  s.yawMilli = (((s.yawMilli + rimTurnMilli(moved, radius)) % turn) + turn) % turn;
}

function wrong(world: World, seat: 0 | 1): void {
  world.events.push({ type: "bastionWrong", seat, col: midCol(world.cfg) });
}
