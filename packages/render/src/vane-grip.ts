import {
  type SimConfig,
  type VaneState,
  vanePhase,
  vanePinnedAt,
  vanePivotCol,
  vaneReachMilli,
  vaneTipAt,
  vaneTipCol,
} from "@neon-spore/sim";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
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
 * **The housing's does not move**, because the bearing never does: it hangs
 * over the pivot column above row 0 where nothing else in the game is. Her
 * ring rests just under the casing, clear of the hub, and she carries it up.
 */

/** How far the tip dips below the bearing at mid-swing, in tiles. */
const DROOP = 0.85;

/**
 * The row the bearing hangs on, above the field's first row — where the casing,
 * its pins and the mouth of the split all stand.
 *
 * Here rather than in `vane-draw.ts`, where it lived until the arm became
 * touchable, for the reason the header gives: a place the hit test and the
 * drawing must agree about belongs to neither of them. The cue's mark stands on
 * the mouth and reads it too (`boss-cue-read-x.ts`).
 */
export function vaneBearingY(l: Layout): number {
  return tileCY(l, 0) - l.tile * 0.2;
}

/** Where the hub stands, and how big it is. */
export function vaneHubAt(l: Layout, cfg: SimConfig): { x: number; y: number; r: number } {
  return { x: tileCX(l, vanePivotCol(cfg)), y: vaneBearingY(l), r: l.tile * 0.34 };
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
  const to = vanePinnedAt(cfg, b, beat) ? from : vaneTipCol(cfg, b.pins, waveBeat + 1);
  const mFrom = vaneReachMilli(waveBeat);
  const m = mFrom + (vaneReachMilli(waveBeat + 1) - mFrom) * beatPhase;
  return {
    x: tileCX(l, from + (to - from) * beatPhase),
    y: vaneBearingY(l) + l.tile * DROOP * (1 - Math.abs(m) / 1000),
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

/** The navigator's circle: under the casing, clear of the hub. */
export function vaneHousingCircle(l: Layout, cfg: SimConfig): Circle {
  const hub = vaneHubAt(l, cfg);
  const r = handleRadius(l, cfg);
  return { x: hub.x, y: hub.y + hub.r + r * 0.6, r };
}

/**
 * Whether the arm is offering the pilot a hand: the rule's gate said once
 * (`sim/vane-hand.ts`'s `armHeard`). SWING asks for a shot and nothing else,
 * and an arm already pinned refuses a second thumb.
 */
export function vaneArmGrippable(cfg: SimConfig, b: VaneState, beat: number): boolean {
  if (vanePhase(b.pins).asks === "shoot") return false;
  return !vanePinnedAt(cfg, b, beat);
}

/**
 * Whether the housing is offering the navigator one, which is the whole of
 * `housingHeard`: only SEIZE jams it, only a standing arm can be hauled, and
 * one haul is all an opening gets.
 */
export function vaneHousingGrippable(cfg: SimConfig, b: VaneState, beat: number): boolean {
  if (vanePhase(b.pins).asks !== "haul" || b.hauled) return false;
  return vanePinnedAt(cfg, b, beat);
}

/**
 * The press, answered for whichever of the two this seat owns. A press from
 * the wrong seat falls through to whatever is behind it, exactly as if no ring
 * were there — the arm is the pilot's half of VEER and the housing is the
 * navigator's half of SEIZE, and neither can do the other's.
 */
export function vaneGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = bossOf(field, "vane");
  if (b === null) return null;
  const { cfg, seat } = field;
  if (seat === 1 && vaneArmGrippable(cfg, b, field.beat)) {
    const arm = vaneArmCircle(l, cfg, b, field.beat, field.waveBeat, field.beatPhase);
    if (hitCircle(arm, x, y)) return grab("vaneArm", 1, x, y);
  }
  if (seat === 2 && vaneHousingGrippable(cfg, b, field.beat)) {
    if (hitCircle(vaneHousingCircle(l, cfg), x, y)) return grab("vaneHousing", 2, x, y);
  }
  return null;
}

function grab(target: "vaneArm" | "vaneHousing", player: 1 | 2, x: number, y: number): Touch {
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player, originX: x, originY: y },
  };
}

/**
 * Both rings, drawn from `drawVane` so the mechanism and the hands on it are
 * one drawing in the order they belong in — the arm's ring under the tip it
 * circles, the housing's under the casing it hangs off.
 *
 * **Each is drawn on both screens, yours bright and theirs dim**, the bargain
 * `sinew-handles.ts` made for the same reason: the last pin of the fight needs
 * both their hands on the picture at once, and neither can feel the other's.
 *
 * **The dim copy fills nothing** (`theirs`, `handle-draw.ts`, 22 September
 * 2026). A ring fills its circle with the background before its own colour, to
 * read over whatever is behind it — and the arm's ring is *on* the tip and the
 * housing's is on the casing. The seat that may not press one cannot see the
 * wash inside, so its copy came out a hole bored through the mechanism. Theirs
 * is its rim and its wash over the metal now, and only the seat that may take
 * hold of it cuts.
 *
 * **The arm's ring stays up while the pin stands, drawn `held`** — which is
 * the ordinary convention and not an exception to it: the pin *is* his thumb,
 * held until he lifts it or the sweep tears it out `vanePinBeats` later
 * (`stepVanePin`). It is `vaneArmGrippable` that says no there, because a
 * second press cannot start a pin that has already started, and the ring is
 * showing the one it did. A ring that vanished on the press would take the
 * fold line off both screens on the beat it began to matter, and the housing's
 * ring beside it would be hanging off nothing.
 */
export function drawVaneGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: VaneState,
  beat: number,
  tip: { x: number; y: number },
  time: number,
): void {
  const asks = vanePhase(b.pins).asks;
  if (asks === "shoot") return;
  const pinned = vanePinnedAt(cfg, b, beat);
  ring(ctx, { x: tip.x, y: tip.y, r: handleRadius(l, cfg) }, l, 1, pinned, time);
  if (asks !== "haul" || !pinned) return;
  ring(ctx, vaneHousingCircle(l, cfg), l, 2, b.hauled, time);
}

function ring(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  l: Layout,
  player: 1 | 2,
  held: boolean,
  time: number,
): void {
  const mine = l.role === "test" || (l.role === "p1") === (player === 1);
  drawHandleRing(ctx, {
    x: at.x,
    y: at.y,
    r: at.r,
    hex: mine ? PALETTE.rock : PALETTE.dim,
    rim: mine ? PALETTE.text : PALETTE.rock,
    held,
    pull: held ? 1 : 0,
    time,
    theirs: !mine,
  });
}
