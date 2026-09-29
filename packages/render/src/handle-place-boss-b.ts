import { type DragTarget, valveTurning, type World } from "@neon-spore/sim";
import { burgeeDrawCircle, burgeeFreezeCircle } from "./burgee-grip.js";
import { capstanRubStanding, capstanSteerStanding, capstanTakesHand } from "./capstan-grip.js";
import { davitLooseCircle } from "./davit-grip.js";
import { flueTapCircle } from "./flue-grip.js";
import { gallPointCircle, gallTakesPinch } from "./gall-grip.js";
import { grindstoneStanding, grindstoneTakesHand } from "./grindstone-grip.js";
import { halterGripStanding } from "./halter-grip.js";
import type { Circle, Layout } from "./layout.js";
import { plumbStoneStanding, plumbTakesHand } from "./plumb-grip.js";
import { slingDrawCircle } from "./sling-grip.js";
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
  if (target.startsWith("grind")) {
    // THE GRINDSTONE's two flats and two jaws, each where the wheel stands and
    // the caliper swings this frame. Null once it spins free (`grindstone-grip.ts`).
    const b = world.boss?.kind === "grindstone" ? world.boss : null;
    if (b === null || !grindstoneTakesHand(b)) return null;
    const t = target as "grindFlatLeft" | "grindFlatRight" | "grindJawLeft" | "grindJawRight";
    return grindstoneStanding(l, cfg, b, t, world.beat, beatPhase);
  }
  if (target === "halterChordLeft" || target === "halterChordRight") {
    // THE HALTER's two grips on the lit segment's seam, either seat's. Null
    // while no rest-and-chord step is lit (`halter-grip.ts`).
    const b = world.boss?.kind === "halter" ? world.boss : null;
    if (b === null) return null;
    const side = target === "halterChordLeft" ? 0 : 1;
    return halterGripStanding(l, cfg, b, side, world.beat, beatPhase);
  }
  if (target === "davitLooseLeft" || target === "davitLooseRight") {
    // THE DAVIT's hook, the one shared rest handle either seat's loose takes
    // it at — the boom itself never moves for a hand (`davit-grip.ts`).
    const b = world.boss?.kind === "davit" ? world.boss : null;
    if (b === null) return null;
    return davitLooseCircle(l, cfg, b, target === "davitLooseLeft" ? 0 : 1, world.beat, beatPhase);
  }
  if (target === "burgeeFreeze" || target === "burgeeDraw") {
    // THE BURGEE's ring over the lit column and the tail of its track, where
    // the fixture hangs still to be caught. Null between catches (`burgee-grip.ts`).
    const b = world.boss?.kind === "burgee" ? world.boss : null;
    if (b === null) return null;
    return target === "burgeeFreeze" ? burgeeFreezeCircle(l, cfg, b) : burgeeDrawCircle(l, cfg, b);
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
  if (target === "gallPinch") {
    // THE GALL's nodule on the point it sits on. Null once the third close
    // pulls it under (`gall-grip.ts`).
    const b = world.boss?.kind === "gall" ? world.boss : null;
    if (b === null || !gallTakesPinch(b)) return null;
    return gallPointCircle(l, cfg, b.point);
  }
  if (target === "flueTap") {
    // THE FLUE's ember, where the simulation holds it. Null while no vent is
    // lit (`flue-grip.ts`).
    const b = world.boss?.kind === "flue" ? world.boss : null;
    if (b === null) return null;
    return flueTapCircle(l, cfg, b);
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
  return undefined;
}
