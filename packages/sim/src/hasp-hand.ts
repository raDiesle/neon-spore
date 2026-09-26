import { MAX_BEARING_STEP, NO_BEARING, TURN } from "./bearing.js";
import { midCol, type SimConfig } from "./config.js";
import { ticksPerBeat } from "./config-derived.js";
import { haspBoss, haspBurning, haspHeld, haspNeedMilli, haspWorking, NO_LATCH } from "./hasp.js";
import { haspSlow, openHasp } from "./hasp-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The two hands on THE HASP**, off the wire, on the tick — and the gate
 * between them, which is the whole boss.
 *
 * `haspLatch` is the pilot's and `haspWheel` the navigator's, always: each
 * seat is shown one of them and not the other, so the seat is checked
 * against the target's own name here rather than carried beside it
 * (`gimbal-hand.ts`' rule). The wrong seat's message does nothing, silently,
 * because there is no mark at that desk to refuse it on.
 *
 * **The gate is one line and no primitive** (§20, *Reusable*): before the
 * wheel is turned at all, `haspHeld` is asked. It is an ordinary read of the
 * other hand's depth on the same tick — the thing the simulation already
 * does for every hand on the field — and the finding this boss was written
 * to make is that a rule joining two hands needs nothing in the engine but
 * the boss remembering to ask.
 *
 * **On the tick rather than the beat** (`step.ts`), and here it is load
 * bearing rather than an optimisation: a wheel judged on the beat would keep
 * turning after the latch had let go, which is exactly the lie the pair is
 * playing against.
 *
 * **Her reference survives the seize.** A hand going round a seized wheel
 * still reports where it is, and the bearing it last reported is kept, so
 * the instant the latch comes back the wheel resumes from where it stood
 * rather than jumping to wherever her thumb has wandered in the meantime —
 * which is row 6's *resuming exactly where it seized*.
 */

export function haspHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target === "haspLatch") {
    if (player === 1) latchHeard(world, command);
    return;
  }
  if (command.target === "haspWheel" && player === 2) wheelHeard(world, command);
}

/**
 * The pilot's hand on the latch, read by depth and judged as a **level**:
 * what the wheel asks every tick is whether he is holding *now*.
 *
 * The heat is counted from the tick he took hold rather than from the tick
 * he touched it, so a thumb resting short of the grip costs him nothing and
 * a hand that slid off and back on is a fresh grip — the design's *let go
 * before it burns, then grip again*, and the whole of what he can do about
 * a clock he is never shown the end of. THE SLOW follows the grip, up as
 * it is taken and shut as it goes (`haspSlow`).
 */
function latchHeard(world: World, command: Extract<Command, { kind: "drag" }>): void {
  const s = haspBoss(world);
  if (s === null) return;
  const cfg = world.cfg;
  const mid = midCol(cfg);
  if (!command.on) {
    if (s.latchMilli === NO_LATCH) return;
    const was = haspHeld(s, cfg);
    s.latchMilli = NO_LATCH;
    if (!was) return;
    world.events.push({ type: "haspLet", col: mid });
    haspSlow(world, s);
    return;
  }
  // A latch still cooling takes no hand at all, and neither does one on a
  // hasp that is already swinging open.
  if (!haspWorking(s) || haspBurning(s)) return;
  const was = haspHeld(s, cfg);
  s.latchMilli = Math.max(0, Math.min(cfg.haspReachMilli, Math.round(command.fromYMilli ?? 0)));
  const now = haspHeld(s, cfg);
  if (now === was) return;
  if (now) {
    s.gripBeat = world.beat;
    world.events.push({ type: "haspGrip", col: mid });
  } else world.events.push({ type: "haspLet", col: mid });
  haspSlow(world, s);
}

/**
 * The navigator's hand round the wheel, carrying a **bearing** rather than a
 * displacement — `crank.ts`' gesture and `bearing.ts`' argument: a finger
 * four times round the same rim is back where it grabbed four times over, so
 * what it has to report is where it *is*.
 *
 * **What a step is worth is travel, either way round.** The hasp is wound
 * open by how far the wheel has been turned rather than by where it has been
 * turned *to*, which is §20's mark read as a distance: it gives her a thing
 * she can do without being told a number — keep turning — and it is what
 * makes a seize cost exactly the turning it stole and no more.
 */
function wheelHeard(world: World, command: Extract<Command, { kind: "drag" }>): void {
  const s = haspBoss(world);
  if (s === null) return;
  // The hand off the rim, or one that has just gone on: either way there is
  // no reference yet, and the wheel is left standing where it is.
  if (!command.on || command.fromMilli < 0) {
    s.handMilli = NO_BEARING;
    return;
  }
  if (!haspWorking(s)) return;
  const at = ((command.fromMilli % TURN) + TURN) % TURN;
  const was = s.handMilli;
  s.handMilli = at;
  if (was === NO_BEARING) return;
  const step = (at - was + TURN) % TURN;
  if (step === 0) return;
  // Signed: past half a turn between two samples the shorter way round is
  // the way the finger actually went.
  const turned = step <= MAX_BEARING_STEP ? step : step - TURN;
  // **The gate.** Her hand has already been recorded, so the seize costs her
  // the turning and not her place on the rim.
  if (!haspHeld(s, world.cfg)) return;
  s.wheelMilli = (((s.wheelMilli + turned) % TURN) + TURN) % TURN;
  s.woundMilli += Math.abs(turned);
  if (s.woundMilli >= haspNeedMilli(s, world.cfg)) openHasp(world, s);
}

/**
 * How far a hand with nothing to prove turns the wheel in one tick — **the
 * first hasp's wind inside half a grip**, and the half is the argument.
 *
 * Nothing else on this boss names a turning speed: the wheel has no drift and
 * no clock of its own, only a distance to be wound and a heat that ends the
 * grip it is wound under (`config-hasp.ts`). So the pace a rehearsal or a
 * desk turns at is read off those two, and half a grip is fast enough that
 * the first hasp opens with the latch still cool and slow enough that one
 * sample is a thirtieth of a turn, nowhere near the half a bearing reads as a
 * hand jumping back (`bearing.ts`).
 */
export function haspTurnPerTickMilli(cfg: SimConfig): number {
  const ticks = Math.max(1, Math.floor((cfg.haspHoldBeats * ticksPerBeat(cfg)) / 2));
  return Math.max(1, Math.ceil(cfg.haspWindMilli / ticks));
}
