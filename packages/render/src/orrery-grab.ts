import {
  BEARING_TURN,
  NO_BEARING,
  NO_RING,
  type OrreryState,
  orreryHandHolds,
  orreryHandRing,
  orreryOrbit,
  type SimConfig,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { ORRERY_FLATTEN, orreryCorePoint, orreryOrganR, orreryPoint } from "./orrery-shape.js";
import { PALETTE, STROKE } from "./palette.js";
import type { Field, Hold, Touch } from "./touch.js";
import { showsOrreryGrip } from "./view-role-clocks.js";

/**
 * **The ring under the pilot's thumb**: where he may take hold of it, what a
 * turn of it says, and the knurl that tells him it can be turned.
 *
 * The drawing and the hit test are in one file on purpose, which is
 * `layout.ts`'s standing rule — a control is never drawn in one place and
 * answered in another — and it matters more here than for any handle before
 * it. Every other handle in the game is a small circle hanging off a body
 * (`handles.ts`); this one is a **whole ellipse the width of the field**, and
 * the two halves of that fact would drift apart the first time either was
 * touched on its own.
 *
 * **A bearing, and the ellipse is unsquashed before it is read.** The rings
 * are drawn flattened to `ORRERY_FLATTEN`, so a finger tracing the line an
 * eye follows would race through whole quadrants across the top and crawl up
 * the sides if its angle were taken off the pixels. Dividing the vertical
 * offset by the flattening first gives the **slot** under the finger — the
 * same parameter `orreryPoint` draws an organ at — so what a thumb reports is
 * *which organ it is over*, and a hand that tracks an organ round the ring
 * turns the ring at exactly the rate the picture says it is going.
 *
 * **The fold reaches the finger here, and it is the only control in the game
 * where it does.** A strip is answered by column and never mirrored, because a
 * seat whose finger turned with its eye is a seat for which nothing happened
 * (`field-flip.ts`). But this hand is following a *body* rather than pointing
 * at a column: on a turned screen the organs run the other way round, so the
 * bearing is mirrored with them and a thumb chasing an organ chases the one it
 * can see. What is sent is still the ring's own slot, identical on both
 * devices, so nothing on the wire knows the difference.
 *
 * **One turn of the thumb is one lap of the ring**, whichever ring it is on.
 * `orreryHandMilliPerOrgan` 1500 is then a turn and a half of a circle that is
 * ten columns wide for the outer ring and a third of that for the inner —
 * which is the gearing getting *lighter* exactly as the pair's information
 * gets worse, and is the honest reading of the number rather than a second one
 * invented for the field.
 */

/** How far from the line a thumb still has hold of the ring, in pixels — a
 * little over an organ's own width, because the ring is a hair-thin ellipse
 * and a thumb is not. */
export function orreryGrabR(l: Layout): number {
  return orreryOrganR(l) * 2.4;
}

/**
 * Where round the hand's ring a point is, in thousandths of a turn from the
 * bottom of it — or `NO_BEARING` for a point too near the core to have one.
 *
 * Nought is slot 0, the bottom, which is the only slot a shot can pass and the
 * sim's own zero (`orreryGapSlot`); a quarter turn is the right-hand side of
 * an unturned screen. The dead spot is the crank's and for the crank's reason:
 * a finger that has wandered in to the core swings through whole quadrants on
 * a pixel of movement, and every one of those swings would be organs. Inside
 * it there is no bearing, which is the same thing as no hand — and the next
 * sample outside it is a fresh reference rather than a step from wherever the
 * finger last was (`sim/orrery-hand.ts`).
 */
function bearing(l: Layout, cx: number, cy: number, x: number, y: number): number {
  const dx = (l.flip ? -1 : 1) * (x - cx);
  // Unsquashed, so the angle is the slot rather than the pixel (see header).
  const dy = (y - cy) / ORRERY_FLATTEN;
  const dead = l.tile * 0.35;
  if (dx * dx + dy * dy < dead * dead) return NO_BEARING;
  // From the bottom: `y` grows downwards on a screen, so the pair goes in as
  // (across, down) and slot 0 comes out where the sim puts it.
  const turn = Math.atan2(dx, dy) / (Math.PI * 2);
  return Math.round((turn - Math.floor(turn)) * BEARING_TURN) % BEARING_TURN;
}

/**
 * The screen point of a bearing on a ring — the inverse of the function above,
 * and the one piece of arithmetic in this file with two callers.
 *
 * The hit test needs it to ask *is the finger near the line at the slot it
 * claims*, and the ghost hand needs it to stand where the ring says the hand
 * is. Written once, because a hand drawn at a bearing the finger would have
 * missed is exactly the disagreement this file exists to make impossible.
 */
function pointAt(l: Layout, cfg: SimConfig, ring: number, at: number): { x: number; y: number } {
  const orbit = Math.max(1, orreryOrbit(cfg, ring));
  return orreryPoint(l, cfg, ring, (at * orbit) / BEARING_TURN);
}

/**
 * **Where a hand on the ring is standing**, for the ghost thumb of a rehearsal
 * and for a caption pointing at it (`handle-place.ts`).
 *
 * Every other handle in the game answers this with the place it hangs, held or
 * not. A ring has no such place — the line is the whole control — so what this
 * answers is the **bearing the simulation has recorded**, which is where the
 * hand that is on it last reported itself (`orreryRingHeard`). With no hand on
 * it, the bottom: slot 0 is the only slot a shot passes and is where every
 * synthetic hand starts from, so a thumb about to go on is drawn where it is
 * about to go on rather than at a corner of the ellipse nothing is about.
 *
 * Null once every ring is off the boss, which is the same answer the hit test
 * gives and for the same reason: there is nothing left to take hold of.
 */
export function orreryRingCircle(
  l: Layout,
  cfg: SimConfig,
  b: OrreryState,
): { x: number; y: number; r: number } | null {
  const ring = orreryHandRing(b);
  if (ring === NO_RING) return null;
  const at = orreryHandHolds(b) ? b.handAtMilli : 0;
  const on = pointAt(l, cfg, ring, at);
  return { x: on.x, y: on.y, r: orreryGrabR(l) };
}

/**
 * A thumb going on the ring, and only the pilot's: the hand is his every beat
 * of the fight (`orreryRingHeard`), so a press from her seat falls through to
 * whatever is behind the line.
 *
 * **The ring's resting line, not its organs.** Every other handle is
 * hit-tested where it rests rather than where it has swung to, and the same
 * rule reads differently here: the line never moves at all, and what runs
 * round it is the sockets. So a hand takes hold of the *ring* anywhere on it,
 * which is also the only honest answer — the ring turns as a whole, and there
 * is nothing on it that is more of a handle than the rest of it.
 *
 * The grab carries no bearing. The first sample is a starting point, and a
 * grab that claimed to be at the bottom of the circle would turn the ring by
 * however far round the finger happened to land (`sim/orrery-hand.ts`).
 */
export function orreryRingUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = field.orrery;
  if (b === null || field.seat !== 1) return null;
  const ring = orreryHandRing(b);
  if (ring === NO_RING) return null;
  const core = orreryCorePoint(l, field.cfg);
  const at = bearing(l, core.x, core.y, x, y);
  if (at === NO_BEARING) return null;
  const on = pointAt(l, field.cfg, ring, at);
  const r = orreryGrabR(l);
  if ((x - on.x) ** 2 + (y - on.y) ** 2 > r * r) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "orreryRing", on: true, fromMilli: NO_BEARING },
    hold: { kind: "drag", target: "orreryRing", player: 1, originX: core.x, originY: core.y },
  };
}

/**
 * The same thumb, moved: where round the core it now is.
 *
 * The hold carries the core's own point in place of the origin a carried
 * handle keeps, exactly as the crank carries its button's centre — a circle
 * has no use for where a hand grabbed (`touch-drag.ts`).
 */
export function orreryRingTurn(
  l: Layout,
  hold: Extract<Hold, { kind: "drag" }>,
  x: number,
  y: number,
): Touch {
  const command = {
    kind: "drag",
    target: "orreryRing",
    on: true,
    fromMilli: bearing(l, hold.originX, hold.originY, x, y),
  } as const;
  return { player: hold.player, command, hold };
}

/**
 * The knurl: short ticks across the ring the hand is on, so the pilot can see
 * which of the three answers his thumb.
 *
 * Three to an organ, which is a texture rather than a count — a tick per
 * socket would be a second set of organs and the pair would try to read it.
 * `PALETTE.hullRim` at rest and `PALETTE.pod` while a hand is on it, which is
 * THE MAZE's string's own arrangement (`maze-string.ts`) and the one piece of
 * feedback this control cannot do without: the bearing is silent until it has
 * banked a whole organ, so without it a pilot turning short of a detent would
 * have no way to know his thumb was being heard at all.
 */
export function drawOrreryGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: OrreryState,
): void {
  if (!showsOrreryGrip(l.role)) return;
  const ring = orreryHandRing(b);
  if (ring === NO_RING) return;
  const orbit = Math.max(1, orreryOrbit(cfg, ring));
  const held = orreryHandHolds(b);
  const path = new Path2D();
  const ticks = orbit * 3;
  for (let i = 0; i < ticks; i++) {
    const at = (i * orbit) / ticks;
    const inner = orreryPoint(l, cfg, ring, at, 0.9);
    const outer = orreryPoint(l, cfg, ring, at, 1.1);
    path.moveTo(inner.x, inner.y);
    path.lineTo(outer.x, outer.y);
  }
  strokeGlow(ctx, path, held ? PALETTE.pod : PALETTE.hullRim, STROKE.inner, held ? 0.8 : 0.4);
}
