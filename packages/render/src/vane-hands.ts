import {
  type SimConfig,
  type VaneState,
  vanePhase,
  vanePinnedAt,
  vanePivotCol,
} from "@neon-spore/sim";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob, PULL_SIZE } from "./pull-knob.js";
import { PULL_DOWN, straightPullTrack } from "./pull-line.js";
import { drawPullTrack, pullTrackPoint } from "./pull-track.js";
import { vaneHousingCircle } from "./vane-grip.js";

/**
 * **THE VANE's two hands, drawn** — where they stand and what a press on them
 * takes hold of is `vane-grip.ts`'s; this is the picture of them.
 *
 * **The pilot's pin is a hold and keeps its ring.** **The navigator's haul is
 * the field's pull** (`pull-knob.ts`, `pull-track.ts`), the owner, 13 October
 * 2026: until then it was a ring too, which read as a press. It goes straight
 * down off the bearing, `vaneHaulMilli` long (`sim/vane-hand.ts`), so its
 * channel and arrow point down. The round keeps no more of the carry than
 * whether it has counted (`hauled`), so the knob stands at the top of its
 * channel until then and at the bottom after, and the count is said by the
 * track's own `counted`. The knob is drawn the size of the circle a press is
 * answered in rather than `PULL_SIZE` larger: a bigger grab would reach up
 * over the hub, which is the pilot's part of the picture.
 */

/**
 * Both hands, drawn from `drawVane` so the mechanism and the hands on it are
 * one drawing in the order they belong in — the arm's ring under the tip it
 * circles, the housing's knob under the casing it hangs off.
 *
 * **Each is drawn on both screens, yours bright and theirs dim**, the bargain
 * `sinew-handles.ts` made for the same reason: the last pin of the fight needs
 * both their hands on the picture at once, and neither can feel the other's.
 * The housing's channel and arrow are on her screen alone; his has the knob
 * dim, to see her hand come.
 *
 * **The dim copy fills nothing** (`theirs`, `handle-draw.ts`, 22 September
 * 2026). A ring fills its circle with the background before its own colour, to
 * read over whatever is behind it — and the arm's ring is *on* the tip. The
 * seat that may not press it cannot see the wash inside, so its copy came out
 * a hole bored through the mechanism. Theirs is its rim and its wash over the
 * metal now, and only the seat that may take hold of it cuts.
 *
 * **The arm's ring stays up while the pin stands, drawn `held`** — which is
 * the ordinary convention and not an exception to it: the pin *is* his thumb,
 * held until he lifts it or the sweep tears it out `vanePinBeats` later
 * (`stepVanePin`). It is `vaneArmAsks` that says no there, because a
 * second press cannot start a pin that has already started, and the ring is
 * showing the one it did. A ring that vanished on the press would take the
 * fold line off both screens on the beat it began to matter, and the housing's
 * knob beside it would be hanging off nothing.
 */
export function drawVaneGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: VaneState,
  beat: number,
  tip: { x: number; y: number },
  time: number,
  pivot = vanePivotCol(cfg),
): void {
  const asks = vanePhase(b.pins).asks;
  if (asks === "shoot") return;
  const pinned = vanePinnedAt(cfg, b, beat);
  ring(ctx, { x: tip.x, y: tip.y, r: handleRadius(l, cfg) }, l, pinned, time);
  if (asks !== "haul" || !pinned) return;
  drawVaneHaul(ctx, l, cfg, vaneHousingCircle(l, cfg, pivot), b.hauled, time);
}

/** Her haul, down off the bearing from `at`. */
function drawVaneHaul(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  at: Circle,
  hauled: boolean,
  time: number,
): void {
  const mine = isMine(l, 2);
  const r = at.r / PULL_SIZE;
  const len = (Math.max(1, cfg.vaneHaulMilli) * l.tile) / 1000;
  const track = straightPullTrack({ from: at, r, way: PULL_DOWN, len });
  const along = hauled ? 1 : 0;
  const look = mine
    ? { hex: PALETTE.rock, rim: PALETTE.text, theirs: false }
    : { hex: PALETTE.dim, rim: PALETTE.rock, theirs: true };
  const o = { ...look, held: hauled, counted: hauled, time, key: "vane:haul" };
  if (mine) drawPullTrack(ctx, track, { ...o, origin: 0, at: along });
  const knob = pullTrackPoint(track, along);
  drawPullKnob(ctx, { x: knob.x, y: knob.y }, r, { ...o, way: mine ? PULL_DOWN : null });
}

function isMine(l: Layout, player: 1 | 2): boolean {
  return l.role === "test" || (l.role === "p1") === (player === 1);
}

/** The pilot's ring on the arm. */
function ring(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  l: Layout,
  held: boolean,
  time: number,
): void {
  const mine = isMine(l, 1);
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
