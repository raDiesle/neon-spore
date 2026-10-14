import { type PulseState, pulseBarAsks, pulseHeart, type SimConfig } from "@neon-spore/sim";
import { onlySeat } from "./desk-seat.js";
import { handleRadius } from "./handle-draw.js";
import { seatIsMine } from "./handle-word.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawSoakHold } from "./soak-hold.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE PULSE's hand on the bar**: the rectangle the meter is drawn in, the
 * box a thumb is answered in, and the outline that says the second is there —
 * one file for `gorge-grip.ts`' reason, that the shape a hand is answered at
 * is the shape the picture is drawn from.
 *
 * The rule shipped ahead of the picture (`sim/pulse-hand.ts`), and the wave's
 * own guide has been telling the pair about it the whole time — *Bar low: a
 * thumb on it carries them* — over a bar with nothing on it to take hold of.
 * That is the walk four handles made before it: the target was heard and
 * drawn nowhere, so `on-field-controls.test.ts` had it filed as `unbuilt` and
 * the ON THE FIELD tab had no row for it.
 *
 * **The handle is the bar itself, not a ring on it.** Every other handle in
 * this game is a circle, because every other one is a hand on a *body* and a
 * body has a place. This one is a hand on a reading — the one vessel both
 * seats feed and both drain (`pulse-meter.ts`) — and a ring hung on it would
 * be a second object over the one thing the round asks them to watch. So the
 * bar grows a box round it and the box is the button.
 *
 * **Which end sinks is which seat is holding**, which is the arrangement the
 * meter already had: the only per-seat thing on one vessel is the end each of
 * them last put something into. The pilot's is the left, the navigator's the
 * right, on both screens — so a thumb of his lights the same end on her phone
 * and the word `BOTH` is something either of them can see coming.
 *
 * **Nothing at all while the bar is steady**, which is exactly the rule's own
 * gate: a thumb on a full bar is refused in `pulseHandHeard`, so an outline
 * there would be a control that did nothing. The offer appears the tick the
 * bar drops under `pulseFlutterMilli` and goes again the tick it climbs back.
 */

/** The meter's own rectangle. `pulse-meter.ts` draws from this, so the vessel
 * and the box round it cannot drift apart. */
export function pulseMeterBar(l: Layout): { x: number; y: number; w: number; h: number } {
  const w = l.width * 0.72;
  const h = Math.max(10, l.playHeight * 0.022);
  return { x: (l.width - w) / 2, y: l.playHeight * 0.135, w, h };
}

/**
 * The box a thumb is answered in: the bar, grown to a handle's height.
 *
 * A meter is two per cent of the screen tall and a thumb is not, so the bar as
 * drawn would be a control nobody could take hold of twice running. It is
 * padded to `handleRadiusMilli` — the same figure every circle on this field
 * is cut to — rather than to a number of its own, so the one thing a player
 * learns about how big a handle is holds here too.
 */
export function pulseGripBox(
  l: Layout,
  cfg: SimConfig,
): { x: number; y: number; w: number; h: number } {
  const bar = pulseMeterBar(l);
  const pad = Math.max(0, handleRadius(l, cfg) - bar.h / 2);
  return { x: bar.x - pad, y: bar.y - pad, w: bar.w + pad * 2, h: bar.h + pad * 2 };
}

/** Whether the bar is offering a hand at all: the rule's gate, said once
 * (`sim/pulse-hand.ts`, `sim/pulse-round.ts`). */
export function pulseGrippable(cfg: SimConfig, state: PulseState): boolean {
  if (state.phase !== "play" && state.phase !== "count") return false;
  return pulseHeart(cfg, state) !== "steady";
}

/**
 * The grab, and **either seat's** — the second handle in the game both may
 * take and the first where both at once is the point rather than a collision
 * (`surgeBulb` was the first). It is signed with the seat this screen holds,
 * as every hand on the field is, and the rule reads the seat off the command
 * to decide which of `brace1` and `brace2` it moved.
 *
 * Answered in the box and nowhere near where the level has got to: the fill is
 * a reading, and a control that only answered the filled part would shrink as
 * the pair got into trouble.
 */
export function pulseMeterUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const p = bossOf(field, "pulse");
  if (p === null || !pulseGrippable(field.cfg, p)) return null;
  const b = pulseGripBox(l, field.cfg);
  if (x < b.x || x > b.x + b.w || y < b.y || y > b.y + b.h) return null;
  return {
    player: field.seat,
    command: { kind: "drag", target: "pulseMeter", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "pulseMeter", player: field.seat, originX: x, originY: y },
  };
}

/**
 * The offer, over the bar: an outline round the box, and at each end that
 * seat's hold, the HOLD LAB's drop (`soak-hold.ts`) — sunk while that seat is
 * holding, the partner's dimmed. Since 14 October 2026, as every hold is: the
 * owner, 13 October, *it should be our new standard button … why it still
 * stays text "hold"*. Until then each end was a cap lit under its thumb, and
 * a word in the bar — BRACE, HELD, BOTH — said what was missing; a hold says
 * no word now, and the partner's ring and clock over their end
 * (`pulse-marks.ts`) say BOTH under `arrest`. The drop has no water: a brace
 * is held for as long as the bar needs it, and has no share to be done.
 *
 * Drawn by `drawPulseMeter` rather than called from `pulse-round.ts`, so the
 * vessel and the hand on it are one drawing in the order they belong in — the
 * outline over the rim, the drops over the outline.
 */
export function drawPulseGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  state: PulseState,
  time: number,
): void {
  if (!pulseGrippable(cfg, state)) return;
  const arrest = pulseHeart(cfg, state) === "arrest";
  const color = arrest ? PALETTE.red : PALETTE.pod;
  const b = pulseGripBox(l, cfg);
  const held = state.brace1 || state.brace2;

  const box = new Path2D();
  box.roundRect(b.x, b.y, b.w, b.h, b.h / 2);
  ctx.save();
  ctx.strokeStyle = color;
  // Breathing while nobody is on it, which is what a ring does for the same
  // reason (`drawHandleRing`): empty and moving says *take hold of me*.
  ctx.globalAlpha = held ? 0.85 : 0.4 + 0.2 * Math.sin(time * 4);
  ctx.lineWidth = STROKE.inner;
  ctx.setLineDash(held ? [] : [b.h * 0.5, b.h * 0.4]);
  ctx.stroke(box);
  ctx.restore();

  for (const [seat, on] of [
    [1, state.brace1],
    [2, state.brace2],
  ] as const) {
    const end = pulseEnd(l, cfg, seat);
    drawSoakHold(ctx, end, end.r, { time, held: on, theirs: !seatIsMine(l.role, seat) });
  }
}

/** Seat `seat`'s end of the bar, as the circle its hold and its marks stand on. */
export function pulseEnd(
  l: Layout,
  cfg: SimConfig,
  seat: 1 | 2,
): { x: number; y: number; r: number } {
  const b = pulseGripBox(l, cfg);
  const r = b.h / 2;
  return { x: seat === 1 ? b.x + r : b.x + b.w - r, y: b.y + r, r };
}

/**
 * **Whose a desk press on the bar is** (`desk-grab.ts` `markSeat`): the seat
 * the bar asks for, when it asks one (`pulseBarAsks`). The bar is both
 * seats', so the test screen's mouse was always the pilot's brace, and the
 * navigator's end, haloed on its own, could not be braced without a key.
 */
export function pulseGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const p = bossOf(field, "pulse");
  if (p === null || pulseMeterUnder(l, x, y, field) === null) return undefined;
  return onlySeat((seat) => pulseBarAsks(field.cfg, p, seat));
}
