import {
  type SimConfig,
  type VaneState,
  vaneArmAsks,
  vaneHousingAsks,
  vanePinnedAt,
  vanePivotAt,
  vanePivotCol,
  vaneReachMilli,
  vaneTipAt,
  vaneTipCol,
} from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout, tileCX, tileCY } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE VANE's two hands**, and the geometry the drawing and the hit test
 * share: the pilot's thumb on the sweeping arm and the navigator's haul on the
 * seized housing (`sim/vane-hand.ts`, `docs/spec/bosses.md` §11.5).
 *
 * Both gestures shipped in the simulation on 18 September 2026 and neither had
 * anything drawn to take hold of, which made them the only two thirds of a
 * boss fight the pair could not reach: from VEER the housing stops splitting
 * on the cycle's clock, so a wave with no pin in it has no opening at all and
 * the fight cannot be finished. This is the look that was missing, and it is
 * exempt under *a look with no shipped alternative*.
 *
 * **The arm's ring moves and that is the gesture.** Every other handle on this
 * field is answered at its *rest* (`handles.ts`), because a circle that moved
 * under the finger would be a control you could only grab while it was doing
 * nothing. The vane inverts it: the arm has no rest until a thumb gives it
 * one, and the hold *is* the pin — so what this ring answers is the arm as
 * drawn, a beat ahead off the cycle, and catching a moving tip is the whole of
 * what VEER asks. The column it takes is the column the *arm* is in and never
 * the one the thumb is in (`vaneTipNow`), so the two cannot disagree, and a
 * lift lets it sweep on again (`releasePin`).
 *
 * **The housing's does not move while it asks**: it hangs over the pivot on
 * the arm's row, and it is asked only while a pin stands, when even the last
 * form's wandering pivot is held still (`vanePivotAt`). Her
 * knob rests just under the casing, clear of the hub, and she carries it
 * down, off the bearing (`sim/vane-hand.ts`).
 *
 * Both are drawn in `vane-hands.ts`; this file is where they stand and what
 * a press on them takes hold of.
 */

/** How far the tip dips below the bearing at mid-swing, in tiles. */
const DROOP = 0.85;

/**
 * The row the bearing hangs on — where the casing, its pins and the mouth of
 * the split all stand. Since 30 September 2026 that is the arm's own row
 * (`cfg.vaneArmRow`), a little above its centre so the tip's droop reaches the
 * row below: the simulation meets a shot there and folds a body as it crosses
 * it, and a bearing drawn at the top edge would be answered two rows from
 * where it is.
 *
 * Here rather than in `vane-draw.ts`, where it lived until the arm became
 * touchable, for the reason the header gives: a place the hit test and the
 * drawing must agree about belongs to neither of them. The cue's mark stands on
 * the mouth and reads it too (`boss-cue-read-x.ts`).
 */
export function vaneBearingY(l: Layout, cfg: SimConfig): number {
  return tileCY(l, cfg.vaneArmRow) - l.tile * 0.2;
}

/** Where the hub stands over `pivot`, a column or a tween of two, and how big it is. */
export function vaneHubAt(l: Layout, cfg: SimConfig, pivot = vanePivotCol(cfg)) {
  return { x: tileCX(l, pivot), y: vaneBearingY(l, cfg), r: l.tile * 0.34 };
}

/**
 * Where the arm's tip is standing between two beats, and how hard it is being
 * swung — one answer, so the spar, the ring and the press cannot be drawn or
 * tested against three.
 *
 * `lead` is columns per beat, which is exactly the whip `vane-draw.ts` hangs
 * off the spar: a pinned arm has none and hangs straight.
 */
export function vaneTipPoint(
  l: Layout,
  cfg: SimConfig,
  b: VaneState,
  beat: number,
  waveBeat: number,
  beatPhase: number,
): { x: number; y: number; lead: number } {
  const from = vaneTipAt(cfg, b, beat, waveBeat);
  const next = vanePivotAt(cfg, b, beat + 1, waveBeat + 1);
  const to = vanePinnedAt(cfg, b, beat) ? from : vaneTipCol(cfg, b.pins, waveBeat + 1, next);
  const mFrom = vaneReachMilli(waveBeat);
  const m = mFrom + (vaneReachMilli(waveBeat + 1) - mFrom) * beatPhase;
  return {
    x: tileCX(l, from + (to - from) * beatPhase),
    y: vaneBearingY(l, cfg) + l.tile * DROOP * (1 - Math.abs(m) / 1000),
    lead: to - from,
  };
}

/** The pilot's circle: the arm where it is drawn this instant. */
export function vaneArmCircle(
  l: Layout,
  cfg: SimConfig,
  b: VaneState,
  beat: number,
  waveBeat: number,
  beatPhase: number,
): Circle {
  const tip = vaneTipPoint(l, cfg, b, beat, waveBeat, beatPhase);
  return { x: tip.x, y: tip.y, r: handleRadius(l, cfg) };
}

/** The navigator's circle: under the casing, clear of the hub, where her knob starts. */
export function vaneHousingCircle(l: Layout, cfg: SimConfig, pivot = vanePivotCol(cfg)): Circle {
  const hub = vaneHubAt(l, cfg, pivot);
  const r = handleRadius(l, cfg);
  return { x: hub.x, y: hub.y + hub.r + r * 0.6, r };
}

/**
 * The press, answered for whichever of the two is asked under it. Whether each
 * is asked is the simulation's (`sim/vane-open.ts` `vaneArmAsks`,
 * `vaneHousingAsks`), read and never re-derived. The arm is the pilot's half
 * of VEER and the housing the navigator's half of SEIZE, and neither can do
 * the other's: a press from the other seat is handed to the sim with no hold,
 * so it is refused once and said (`vaneRefuse`), and the part is washed red
 * on both screens the way every mark answers a wrong thumb
 * (`.claude/skills/new-boss` §5).
 */
export function vaneGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const part = partUnder(l, x, y, field);
  if (part === null) return null;
  const owner = part === "vaneArm" ? 1 : 2;
  return grab(part, field.seat, x, y, field.seat === owner);
}

/**
 * Whose the part under a desk press is, so one mouse is signed with that seat
 * rather than refused as the other's (`desk-grab.ts` `markSeat`): the arm is
 * always the pilot's and the housing the navigator's.
 */
export function vaneGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const part = partUnder(l, x, y, field);
  return part === null ? undefined : part === "vaneArm" ? 1 : 2;
}

/** The asked part under a point. Never both: the housing is asked only while
 * a pin stands, and the arm only while none does. */
function partUnder(
  l: Layout,
  x: number,
  y: number,
  field: Field,
): "vaneArm" | "vaneHousing" | null {
  const b = bossOf(field, "vane");
  if (b === null) return null;
  const { cfg, beat } = field;
  const housing = vaneHousingCircle(l, cfg, vanePivotAt(cfg, b, beat, field.waveBeat));
  if (vaneHousingAsks(cfg, b, beat) && hitCircle(housing, x, y)) {
    return "vaneHousing";
  }
  if (!vaneArmAsks(cfg, b, beat)) return null;
  const arm = vaneArmCircle(l, cfg, b, beat, field.waveBeat, field.beatPhase);
  return hitCircle(arm, x, y) ? "vaneArm" : null;
}

function grab(
  target: "vaneArm" | "vaneHousing",
  player: 1 | 2,
  x: number,
  y: number,
  own: boolean,
): Touch {
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: own ? { kind: "drag", target, player, originX: x, originY: y } : null,
  };
}
