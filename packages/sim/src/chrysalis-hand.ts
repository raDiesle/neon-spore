import { bastionTrackCarry, bastionTrackLen } from "./bastion-track.js";
import {
  type ChrysalisState,
  chrysalisBoss,
  chrysalisGone,
  chrysalisLitStep,
  chrysalisQuillOf,
  chrysalisRubsOf,
  chrysalisTrackOf,
} from "./chrysalis.js";
import { chrysalisTakes } from "./chrysalis-step.js";
import { midCol } from "./config.js";
import { type Pull, pullHeard } from "./pull.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CHRYSALIS's hands: a half each, `chrysalisRubLeft` and
 * `chrysalisQuillLeft` the pilot's, `chrysalisRubRight` and
 * `chrysalisQuillRight` the navigator's.
 *
 * **The slime is rubbed off**: the hand is a `RubCount` (`drag-targets-e.ts`),
 * `id` how many times the thumb has turned back since it went down, counted by
 * the host that owns the pointers (`render/rub-turns.ts`). Each count higher
 * than the last this seat sent is that many fresh turns, as THE CAPSTAN reads
 * its own; the lift starts the count again, **and the half keeps every turn
 * it has had** — the owner's rule for a boss's own count, 2 October 2026, on
 * THE OCULUS. At the skin's `rubs` the half is clear.
 *
 * **A quill is pulled along its track**, THE BASTION's plate exactly
 * (`bastionTrackCarry`): straight out along its way, or round a curve without
 * cutting across it; off the curve it slips and snaps back. At the track's end
 * it rips free on the tick — the one generic PULL (`pull.ts`) — and the thumb
 * holds nothing more until it lifts. **Let go short of that and it snaps
 * back**, only that quill starting over.
 *
 * **A thumb on the partner's half** takes hold of nothing and is said
 * (`chrysalisWrong`), THE BASTION's reason.
 */
export function chrysalisHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = chrysalisBoss(world);
  if (s === null || s.phase === "spent") return;
  const seat: 0 | 1 = player === 1 ? 0 : 1;
  const rub = rubSide(command.target);
  if (rub !== null) {
    if (rub !== seat) {
      if (command.on && (command.id ?? 0) === 0) wrong(world, seat);
      return;
    }
    rubbed(world, s, seat, command.on, command.id ?? 0);
    return;
  }
  const side = quillSide(command.target);
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
  if (s.tore[seat] || chrysalisLitStep(s)?.skin !== "quills") return;
  const i = chrysalisQuillOf(s, seat);
  if (i < 0 || !pulled(world, s, seat, i, command.fromMilli, command.fromYMilli ?? 0)) return;
  const { heard } = pullHeard(quillRope(world, s, i), false, true, s.pullMilli[seat]);
  if (heard !== "counted") return;
  s.pullMilli[seat] = 0;
  s.tore[seat] = true;
  world.events.push({ type: "chrysalisRip", seat, piece: i, col: sideCol(world, seat) });
  chrysalisTakes(world, s, i);
}

/**
 * A seat's rub on its half of the slime: fresh turns counted onto the half,
 * kept through a lift, and the half clear at the skin's `rubs`.
 */
function rubbed(world: World, s: ChrysalisState, seat: 0 | 1, on: boolean, id: number): void {
  if (!on) {
    s.rubAt[seat] = -1;
    return;
  }
  const count = Math.max(0, id);
  const was = s.rubAt[seat] < 0 ? 0 : s.rubAt[seat];
  s.rubAt[seat] = count;
  const fresh = Math.max(0, count - was);
  if (fresh === 0 || chrysalisLitStep(s)?.skin !== "slime" || chrysalisGone(s, seat)) return;
  const need = chrysalisRubsOf(s);
  s.rubbed[seat] = Math.min(need, s.rubbed[seat] + fresh);
  const col = sideCol(world, seat);
  world.events.push({ type: "chrysalisRub", seat, rubbed: s.rubbed[seat], col });
  if (s.rubbed[seat] < need) return;
  world.events.push({ type: "chrysalisWipe", seat, piece: seat, col });
  chrysalisTakes(world, s, seat);
}

/**
 * Quill `i` carried to where the thumb, `x` across and `y` down from where it
 * took hold, has it along its track. False when the thumb has strayed off a
 * curve: the quill has slipped, or — barely moved yet — stays put.
 */
function pulled(world: World, s: ChrysalisState, seat: 0 | 1, i: number, x: number, y: number) {
  const carry = bastionTrackCarry(world.cfg, chrysalisTrackOf(s, i), i, s.pullMilli[seat], x, y);
  if (carry === "stay") return false;
  if (carry !== "slip") {
    s.pullMilli[seat] = carry.along;
    return true;
  }
  s.pullMilli[seat] = 0;
  s.tore[seat] = true;
  world.events.push({ type: "chrysalisSnap", seat, piece: i, col: sideCol(world, seat) });
  return false;
}

function rubSide(target: string): 0 | 1 | null {
  if (target === "chrysalisRubLeft") return 0;
  if (target === "chrysalisRubRight") return 1;
  return null;
}

function quillSide(target: string): 0 | 1 | null {
  if (target === "chrysalisQuillLeft") return 0;
  if (target === "chrysalisQuillRight") return 1;
  return null;
}

/** The column a side's half hangs over, for the sound: three out from the middle. */
function sideCol(world: World, seat: 0 | 1): number {
  return midCol(world.cfg) + (seat === 0 ? -3 : 3);
}

/** A quill's track as the one generic PULL (`pull.ts`), the track's whole length long. */
function quillRope(world: World, s: ChrysalisState, i: number): Pull {
  return { way: "down", reachMilli: bastionTrackLen(world.cfg, chrysalisTrackOf(s, i)) };
}

/**
 * A quill let go: short of ripping, it snaps back and starts over — the
 * generic PULL's short lift, said as the quill's own snap. A quill barely
 * moved is a tap and says nothing; one ripped or slipped has nothing to say.
 */
function letGo(world: World, s: ChrysalisState, seat: 0 | 1): void {
  const was = s.pullMilli[seat];
  const spent = s.tore[seat];
  s.down[seat] = false;
  s.tore[seat] = false;
  s.pullMilli[seat] = 0;
  const piece = chrysalisQuillOf(s, seat);
  if (chrysalisLitStep(s)?.skin !== "quills" || piece < 0) return;
  if (pullHeard(quillRope(world, s, piece), spent, false, was).heard !== "short") return;
  world.events.push({ type: "chrysalisSnap", seat, piece, col: sideCol(world, seat) });
}

function wrong(world: World, seat: 0 | 1): void {
  world.events.push({ type: "chrysalisWrong", seat, col: midCol(world.cfg) });
}
