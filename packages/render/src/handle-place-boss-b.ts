import { type DragTarget, valveTurning, type World } from "@neon-spore/sim";
import { capstanRubStanding, capstanSteerStanding, capstanTakesHand } from "./capstan-grip.js";
import { gallPointCircle, gallTakesPress } from "./gall-grip.js";
import { governorTapCircle } from "./governor-grip.js";
import { lampreyHeadCircle, lampreyTailCircle, lampreyToothCircle } from "./lamprey-grip.js";
import { latchKnobStanding, latchTakesHand } from "./latch-grip.js";
import type { Circle, Layout } from "./layout.js";
import { plumbStoneStanding, plumbTakesHand } from "./plumb-grip.js";
import { rimeHalfStanding, rimeTakesHand } from "./rime-grip.js";
import {
  scoutLineCircle,
  scoutLineGrippable,
  scoutPrimeCircle,
  scoutPrimeGrippable,
} from "./scout-grip.js";
import { slingDrawCircle } from "./sling-grip.js";
import { trapezeAlienCircle, trapezeZoneCircle } from "./trapeze-grip.js";
import { trivetFootStanding, trivetTakesChord } from "./trivet-grip.js";
import { valvePinHandle, valveWheelCircle } from "./valve-grip.js";

/**
 * **Where the later clock bosses' handles are standing** — the second page of
 * `handle-place-boss.ts`, from THE SLING on. Cut from it on 27 September 2026,
 * when THE VALVE's two would have taken it past 250 lines; its rules are that
 * file's: `undefined` is "not mine", `null` is "not now", and every answer is
 * the circle the grip hit-tests a finger against.
 */
export function laterBossHandleCircle(
  l: Layout,
  world: World,
  target: DragTarget,
  beatPhase: number,
): Circle | null | undefined {
  const cfg = world.cfg;
  if (target === "slingDrawLeft" || target === "slingDrawRight") {
    // THE SLING's two cords, each at the rest handle where its own seat's
    // thumb takes it — the fork's own tines never move (`sling-grip.ts`).
    const b = world.boss?.kind === "sling" ? world.boss : null;
    if (b === null) return null;
    return slingDrawCircle(l, cfg, b, target === "slingDrawLeft" ? 0 : 1, world.beat, beatPhase);
  }
  if (target === "trivetPadFront" || target === "trivetPadRear") {
    // THE TRIVET's two feet, each where its leg has it swung this frame. Null
    // once the stand collapses (`trivet-grip.ts`).
    const b = world.boss?.kind === "trivet" ? world.boss : null;
    if (b === null || !trivetTakesChord(b)) return null;
    return trivetFootStanding(l, world, b, target === "trivetPadFront" ? 1 : 2, beatPhase);
  }
  if (target === "rimeHalfLeft" || target === "rimeHalfRight") {
    // THE RIME's half of the lens, where its clear patch opens from, dropped
    // in as the lens arrives. Null once it shatters (`rime-grip.ts`).
    const b = world.boss?.kind === "rime" ? world.boss : null;
    if (b === null || !rimeTakesHand(b)) return null;
    return rimeHalfStanding(l, cfg, b, target, world.beat, beatPhase);
  }
  if (target === "trapezePushLeft" || target === "trapezePushRight" || target === "trapezeLock") {
    // THE TRAPEZE's two zones, the middle of each, null outside a swipe level;
    // and the alien where it swings this frame, the pilot's lock (`trapeze-grip.ts`).
    const b = world.boss?.kind === "trapeze" ? world.boss : null;
    if (b === null) return null;
    if (target === "trapezeLock") return trapezeAlienCircle(l, cfg, b);
    return trapezeZoneCircle(l, cfg, b, target === "trapezePushLeft" ? -1 : 1);
  }
  if (target === "plumbLevelLeft" || target === "plumbLevelRight") {
    // THE PLUMB's two stones, each hanging where the beam holds it this
    // frame. Null once the bob falls away (`plumb-grip.ts`).
    const b = world.boss?.kind === "plumb" ? world.boss : null;
    if (b === null || !plumbTakesHand(b)) return null;
    const side = target === "plumbLevelLeft" ? 0 : 1;
    return plumbStoneStanding(l, cfg, b, side, world.beat, beatPhase);
  }
  if (target === "capstanRub") {
    // THE CAPSTAN's bared face, or the one the lit band asks for, where the
    // cradle rocks it this frame. Null once the drum is spent (`capstan-grip.ts`).
    const b = world.boss?.kind === "capstan" ? world.boss : null;
    if (b === null || !capstanTakesHand(b)) return null;
    return capstanRubStanding(l, cfg, b, world.beat, beatPhase);
  }
  if (target === "capstanSteer") {
    // THE CAPSTAN's middle, where a steering thumb goes down, rocked with the
    // cradle. Null once the drum is spent (`capstan-grip.ts`).
    const b = world.boss?.kind === "capstan" ? world.boss : null;
    if (b === null || !capstanTakesHand(b)) return null;
    return capstanSteerStanding(l, cfg, b, world.beat, beatPhase);
  }
  if (target === "gallPress") {
    // THE GALL's nodule on the point it sits on. Null once the third close
    // pulls it under (`gall-grip.ts`).
    const b = world.boss?.kind === "gall" ? world.boss : null;
    if (b === null || !gallTakesPress(b)) return null;
    return gallPointCircle(l, cfg, b.point);
  }
  if (target === "governorTap") {
    // THE GOVERNOR's first open mark while a tap is asked (`governor-grip.ts`).
    const b = world.boss?.kind === "governor" ? world.boss : null;
    return b === null ? null : governorTapCircle(l, cfg, b, world.beat, beatPhase);
  }
  if (target === "valveWheel" || target === "valvePin") {
    // THE VALVE's wheel while it answers the pilot, and its pin — the live
    // plate while frozen, the socket in the other pin phases — each turned
    // with the drum's list this frame. Null outside them (`valve-grip.ts`).
    const b = world.boss?.kind === "valve" ? world.boss : null;
    if (b === null) return null;
    if (target === "valvePin") return valvePinHandle(l, cfg, b, world.beat, beatPhase);
    return valveTurning(b) ? valveWheelCircle(l, cfg, b, world.beat, beatPhase) : null;
  }
  if (target === "lampreyTail" || target === "lampreyHead" || target === "lampreyTooth") {
    // THE LAMPREY's tail, its head on the tile, and its lit tooth, each only
    // while a bite asks for it (`lamprey-grip.ts`).
    const b = world.boss?.kind === "lamprey" ? world.boss : null;
    if (b === null) return null;
    if (target === "lampreyTooth") return lampreyToothCircle(l, cfg, b, world.beat, beatPhase);
    if (target === "lampreyHead") return lampreyHeadCircle(l, cfg, b);
    return lampreyTailCircle(l, cfg, b);
  }
  if (target === "scoutLine" || target === "scoutPrime") {
    // THE SCOUT's two hands on its own ship: the line on the ship's middle,
    // the prime off its stern, each only while its load offers it (`scout-grip.ts`).
    const b = world.boss?.kind === "scout" ? world.boss : null;
    if (b === null) return null;
    if (target === "scoutLine")
      return scoutLineGrippable(cfg, b) ? scoutLineCircle(l, cfg, b) : null;
    return scoutPrimeGrippable(cfg, b) ? scoutPrimeCircle(l, cfg, b) : null;
  }
  if (target === "latchGripLeft" || target === "latchGripRight") {
    // THE LATCH's two grips, each at the depth its thumb has it, until the
    // colony is torn loose (`latch-grip.ts`).
    const b = world.boss?.kind === "latch" ? world.boss : null;
    if (b === null || !latchTakesHand(b)) return null;
    return latchKnobStanding(l, world, b, target === "latchGripLeft" ? 0 : 1);
  }
  return undefined;
}
