import {
  curtainBody,
  type DragTarget,
  haspWheelUp,
  hiveClenched,
  INNER,
  OUTER,
  type World,
} from "@neon-spore/sim";
import { burgeeDrawCircle, burgeeFreezeCircle } from "./burgee-grip.js";
import { capstanRubStanding, capstanTakesHand } from "./capstan-grip.js";
import { curtainHemAt } from "./curtain-grip.js";
import { cystStanding } from "./cyst-grip.js";
import { davitLooseCircle } from "./davit-grip.js";
import { gallPointCircle, gallTakesPinch } from "./gall-grip.js";
import { gimbalRingCircle } from "./gimbal-grip.js";
import { grindstoneStanding, grindstoneTakesHand } from "./grindstone-grip.js";
import { halterGripStanding } from "./halter-grip.js";
import { haspLatchCircle, haspLatchTakes, haspWheelCircle } from "./hasp-grip.js";
import { hiveHaulCircle } from "./hive-grip.js";
import { keelJointCircle } from "./keel-grip.js";
import type { Circle, Layout } from "./layout.js";
import { mantleCoreTarget, mantleKnobStanding, mantleTakesPull } from "./mantle-grip.js";
import { oculusHalfStanding, oculusTakesHold } from "./oculus-grip.js";
import { ratchetCatchCircle, ratchetPadCircle, ratchetTakesHand } from "./ratchet-grip.js";
import { sinewHandleAt } from "./sinew-handles.js";
import { slingDrawCircle } from "./sling-grip.js";
import { spoolKnobStanding, spoolTakesHand } from "./spool-grip.js";
import { surgeBulbCircle } from "./surge-shape.js";
import { trivetFootStanding, trivetTakesChord } from "./trivet-grip.js";
import { viseLobeStanding, viseTakesPinch } from "./vise-grip.js";

/**
 * **Where a boss's handle is standing** — `handle-place.ts`' question, asked
 * of the handles hung off the clock bosses rather than off a body.
 *
 * Cut from that file on 23 September 2026, when THE HASP's two took it to 220
 * lines, along the seam its branches already had: the ones left there find a
 * *creature* on the field (a balloon, a lid, the choir's membrane) or are the
 * two oldest boss handles, and every one moved here reads `world.boss` and
 * nothing else. Each answer is still the drawing's own, out of the file that
 * paints the handle, so the hand cannot stand where the handle is not.
 *
 * **`undefined` is "not mine" and `null` is "not now"**: a target this page
 * does not own falls back to `handleCircle`, and one it owns with no handle
 * on the field this frame is answered with nothing at all.
 */
export function bossHandleCircle(
  l: Layout,
  world: World,
  target: DragTarget,
  beatPhase: number,
): Circle | null | undefined {
  const cfg = world.cfg;
  if (target === "gimbalOuter" || target === "gimbalInner") {
    // THE GIMBAL's two, and the first pair of whole-circle handles the game
    // has had at once: the outer ring is the pilot's and the inner the
    // navigator's, so the target names the ring and nothing is read off the
    // role (`gimbal-grip.ts`). Where a hand on one *is* is the bearing the
    // simulation recorded, drawn on the face that grips it. Null between
    // alignments, when there is nothing to take hold of.
    const b = world.boss?.kind === "gimbal" ? world.boss : null;
    if (b === null) return null;
    return gimbalRingCircle(l, cfg, b, target === "gimbalOuter" ? OUTER : INNER);
  }
  if (target === "sinewLeft" || target === "sinewRight") {
    // THE SINEW's two, THE BALLOON's arrangement hung off a boss instead of
    // a body: one per seat, carried down to pull and sideways to sway, and
    // the drawing's own answer for where the ring is standing under a hand
    // (`sinew-handles.ts`). Null with no sinew on the field, and with no
    // whip: a caption points at a handle a hand can be on.
    const s = world.boss?.kind === "sinew" ? world.boss : null;
    if (s === null) return null;
    return sinewHandleAt(l, cfg, s, world.beat, beatPhase, target === "sinewLeft" ? -1 : 1, 0);
  }
  if (target === "surgeBulb") {
    // THE SURGE's one handle, held by both seats: the bulb itself, on the row
    // it hangs at — a row lower per notch open — and the same circle a thumb
    // is hit-tested against (`surge-grip.ts`). It does not travel under a
    // hand: the thumb charges it and the lift is the gesture. Null with no
    // bulb on the field.
    const s = world.boss?.kind === "surge" ? world.boss : null;
    return s === null ? null : surgeBulbCircle(l, cfg, s);
  }
  if (target === "curtainHem") {
    // THE CURTAIN's hem, and the one handle whose rest is not over the thing it
    // opens: the ring hangs in the middle of the sheet, and the gap it lifts is
    // over the core, which is the navigator's to find (`curtain-grip.ts`). Where
    // it is *standing* is that rest carried up by the pilot's own thumb. Null in
    // every phase but the jammed one — the rail gives only while a hit is
    // holding it — and null with the sheet torn off the rail, which is a hem
    // there is nothing left to hold.
    const b = world.boss?.kind === "curtain" ? world.boss : null;
    if (b === null || b.phase !== "pinned") return null;
    const body = curtainBody(world, b);
    return body === undefined ? null : curtainHemAt(l, cfg, b, body, beatPhase);
  }
  if (target === "hiveLobe") {
    // THE HIVE's underside, and the one handle that is a whole body: a
    // clenched mass is grabbed anywhere along it, so where it is standing is
    // the middle of it, carried down by however much of the haul is already
    // in (`hive-grip.ts`). Null with nothing clenched — the lobe a navigator
    // pinches is the same target read the other way and is not this circle
    // (`sim/hive-hand.ts`), and a mass hanging at rest is not a handle at all.
    const b = world.boss?.kind === "hive" ? world.boss : null;
    if (b === null || !hiveClenched(b)) return null;
    return hiveHaulCircle(l, cfg, b, world.beat, beatPhase);
  }
  if (target === "haspLatch" || target === "haspWheel") {
    // THE HASP's two, one per seat and the target says which. The bar stands
    // at the depth his thumb has it; the wheel has no place a hand stands, so
    // the answer is the hub it is turned about (`hasp-grip.ts`). Null where
    // the simulation would refuse the hand.
    const b = world.boss?.kind === "hasp" ? world.boss : null;
    if (b === null) return null;
    if (target === "haspWheel") return haspWheelUp(b) ? haspWheelCircle(l, cfg, b) : null;
    return haspLatchTakes(b) ? haspLatchCircle(l, cfg, b) : null;
  }
  if (target === "spoolBrake") {
    // THE SPOOL's one handle, the pilot's: the knob at the depth his thumb
    // has it, on the spool as it is placed this frame. Null once the casing
    // is slack, where no rail is drawn (`spool-grip.ts`).
    const b = world.boss?.kind === "spool" ? world.boss : null;
    if (b === null || !spoolTakesHand(b)) return null;
    return spoolKnobStanding(l, cfg, b, world.beat, beatPhase);
  }
  if (target === "ratchetCatch" || target === "ratchetPawl") {
    // THE RATCHET's two: her catch's bar at the depth her thumb has it, and
    // his pad on the pawl's pivot. Null once the rack is open or jammed,
    // where neither takes a hand (`ratchet-grip.ts`).
    const b = world.boss?.kind === "ratchet" ? world.boss : null;
    if (b === null || !ratchetTakesHand(b)) return null;
    return target === "ratchetCatch" ? ratchetCatchCircle(l, cfg, b) : ratchetPadCircle(l, cfg);
  }
  if (target === "mantleLeft" || target === "mantleRight") {
    // THE MANTLE's two knobs, each at the depth its seat's thumb has it, on
    // the shell as it hangs this frame. Null once the shell splits, where no
    // groove is drawn (`mantle-grip.ts`).
    const b = world.boss?.kind === "mantle" ? world.boss : null;
    if (b === null || !mantleTakesPull(b)) return null;
    return mantleKnobStanding(l, world, b, target === "mantleLeft" ? 1 : 2, beatPhase);
  }
  if (target === "mantleCore") {
    // And the vent while it hisses, then the ring round its bared core for
    // as long as the finish runs — the one target, two places (`mantle-grip.ts`).
    const b = world.boss?.kind === "mantle" ? world.boss : null;
    return b === null ? null : mantleCoreTarget(l, cfg, b);
  }
  if (target === "keelJoint") {
    // THE KEEL's ring round the lit joint, round the segment as it hangs this
    // frame. Null between joints, where no ring is drawn (`keel-grip.ts`).
    const b = world.boss?.kind === "keel" ? world.boss : null;
    return b === null ? null : keelJointCircle(l, cfg, b, world.beat, beatPhase);
  }
  if (target === "oculusLeafLeft" || target === "oculusLeafRight") {
    // THE OCULUS's two halves, the middle of each seat's side of the lens as
    // it stands this frame. Null once it shatters (`oculus-grip.ts`).
    const b = world.boss?.kind === "oculus" ? world.boss : null;
    if (b === null || !oculusTakesHold(b)) return null;
    return oculusHalfStanding(l, world, b, target === "oculusLeafLeft" ? 1 : 2, beatPhase);
  }
  if (target === "viseLobeLeft" || target === "viseLobeRight") {
    // THE VISE's two lobes, the middle of each seat's half-shell as it stands
    // this frame. Null once it splits (`vise-grip.ts`).
    const b = world.boss?.kind === "vise" ? world.boss : null;
    if (b === null || !viseTakesPinch(b)) return null;
    return viseLobeStanding(l, world, b, target === "viseLobeLeft" ? 1 : 2, beatPhase);
  }
  if (target.startsWith("cyst")) {
    // THE CYST's two flanks and two freeze marks, each where the sac stands
    // this frame. Null once it splits (`cyst-grip.ts`).
    const b = world.boss?.kind === "cyst" ? world.boss : null;
    if (b === null || b.phase === "split") return null;
    const side = target.endsWith("Left") ? 0 : 1;
    const what = target.startsWith("cystFreeze") ? "mark" : "flank";
    return cystStanding(l, world, b, what, side, beatPhase);
  }
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
  if (target === "capstanRub") {
    // THE CAPSTAN's bared face, or the one the lit band asks for, where the
    // cradle rocks it this frame. Null once the drum is spent (`capstan-grip.ts`).
    const b = world.boss?.kind === "capstan" ? world.boss : null;
    if (b === null || !capstanTakesHand(b)) return null;
    return capstanRubStanding(l, cfg, b, world.beat, beatPhase);
  }
  if (target === "gallPinch") {
    // THE GALL's nodule on the point it sits on. Null once the third close
    // pulls it under (`gall-grip.ts`).
    const b = world.boss?.kind === "gall" ? world.boss : null;
    if (b === null || !gallTakesPinch(b)) return null;
    return gallPointCircle(l, cfg, b.point);
  }
  return undefined;
}
