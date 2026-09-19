import {
  type MirrorGesture,
  type MirrorState,
  mirrorGesture,
  type SimConfig,
} from "@neon-spore/sim";
import { drawGripDial, drawGripRing } from "./grip-rings.js";
import { type Circle, hitCircle, type Layout, tileCX } from "./layout.js";
import { mirrorHullY } from "./mirror.js";
import type { PlaceHand } from "./ship-hand.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { CANNON_R, CANNON_UP, SHIELD_R, SHIELD_UP } from "./touch-ship.js";
import { seatOf } from "./view-role.js";

/**
 * **THE MIRROR's two lobes as a control**, for the two gestures that ask a
 * thumb for them (`MIRROR_GESTURES`, `sim/simon.ts`): the last round given
 * back on its own ship, and the pin that brings it down.
 *
 * The circles are the pair's own grab circles (`touch-ship.ts`) turned
 * upside down at the mirror's hull line — the same radius, the same lift off
 * the surface, sent the other way — because the whole claim of this boss is
 * that it is *your ship*, and a lobe that answered a thumb at a different
 * size from the one below it would not be. Which seat a lobe answers is the
 * simulation's rule and is asked for here only to refuse a press the sim
 * would drop anyway, so nothing is drawn taking hold of a lobe that will not
 * answer: under `reflect` player 1 has both (a carry or a tap on its cannon,
 * a press on its shield) and player 2 its cannon (the muzzle swipe); under
 * `hold` player 1 its cannon and player 2 its shield, one each, because the
 * pin is both seats or nothing.
 *
 * What the rings say is read off the world every frame: under `reflect` a
 * breathing ring on each lobe this seat answers; under `hold` this seat's
 * own lobe, filled while the sim has its thumb (`holdThumbs`), and the dial
 * of `mirrorHoldBeats` round both once both have landed. **The other seat's
 * thumb is never drawn**: whether the partner is on is the partner's to say,
 * and that is the split.
 */

/** Outside the grab circle, clear of the lobe's own rim. */
const RING_MUL = 1.3;

/** Which lobes a seat answers under a gesture, as `mirrorLobe` ids: 0 its cannon, 1 its shield. */
export function mirrorLobesOf(gesture: MirrorGesture, seat: 1 | 2): readonly (0 | 1)[] {
  if (gesture === "answer") return [];
  if (gesture === "hold") return seat === 1 ? [0] : [1];
  return seat === 1 ? [0, 1] : [0];
}

/**
 * The lobes a seat may take hold of *now*: none while the last round is
 * still being performed. `mirrorHeard` drops a step made outside `listen`
 * (`sim/mirror.ts`), so a ring shown while the mirror demonstrates would be
 * asking for a thumb the sim will not hear — the same lock the panel is
 * under, WATCH — CONTROLS LOCKED (`simon-fx.ts`).
 */
function lobesNow(m: MirrorState, seat: 1 | 2): readonly (0 | 1)[] {
  const gesture = mirrorGesture(m);
  if (gesture === "reflect" && m.phase !== "listen") return [];
  return mirrorLobesOf(gesture, seat);
}

/** The pair's grab circle for a lobe, flipped about the mirror's hull line. */
export function mirrorLobeCircle(l: Layout, cfg: SimConfig, id: 0 | 1, col: number): Circle {
  const y = mirrorHullY(l, cfg);
  return id === 0
    ? { x: tileCX(l, col), y: y + l.tile * CANNON_UP, r: l.tile * CANNON_R }
    : { x: tileCX(l, col), y: y + l.tile * SHIELD_UP, r: l.tile * SHIELD_R };
}

/** The column each lobe stands in: its cannon's own, its shield over the pair's. */
function lobeCol(m: MirrorState, shieldCol: number, id: 0 | 1): number {
  return id === 0 ? m.cannonCol : shieldCol;
}

/**
 * A press on one of its lobes while it is asking for one: a `drag` on
 * `mirrorLobe` with the lobe's `id`, and a hold that carries what the lift
 * will need — the carry threshold under `reflect`, the pin under `hold`.
 */
export function mirrorLobeUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const m = bossOf(field, "mirror");
  if (m === null) return null;
  const gesture = mirrorGesture(m);
  let best: { id: 0 | 1; d: number } | null = null;
  for (const id of lobesNow(m, field.seat)) {
    const c = mirrorLobeCircle(l, field.cfg, id, lobeCol(m, field.shieldCol, id));
    if (!hitCircle(c, x, y)) continue;
    const d = (x - c.x) ** 2 + (y - c.y) ** 2;
    if (best === null || d < best.d) best = { id, d };
  }
  if (best === null) return null;
  const id = best.id;
  const player = field.seat;
  return {
    player,
    command: { kind: "drag", target: "mirrorLobe", on: true, fromMilli: 0, fromYMilli: 0, id },
    hold: {
      kind: "drag",
      target: "mirrorLobe",
      player,
      originX: x,
      originY: y,
      id,
      ...(gesture === "hold" ? { pin: true } : { carryMilli: field.cfg.mirrorCarryMilli }),
    },
  };
}

/** Where this device's hand on a lobe of the mirror is drawn: the flipped circle, upside down. */
export function mirrorHandPlace(cfg: SimConfig, m: MirrorState): PlaceHand {
  return (l, on, _cannonCol, shieldCol) => {
    const id = on === "shield" ? 1 : 0;
    return { at: mirrorLobeCircle(l, cfg, id, lobeCol(m, shieldCol, id)), turn: 0, flip: true };
  };
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Which of `holdThumbs`' bits is this seat's own lobe. */
function thumbBit(seat: 1 | 2): number {
  return seat === 1 ? 1 : 2;
}

/**
 * The rings, drawn after the mirror so they stand over its rim. Read off
 * the world and this screen's seat, nothing else — a frame test sets the
 * world and gets the picture.
 */
export function drawMirrorGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MirrorState,
  shieldCol: number,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const gesture = mirrorGesture(m);
  const seat = seatOf(l.role);
  for (const id of lobesNow(m, seat)) {
    const c = mirrorLobeCircle(l, cfg, id, lobeCol(m, shieldCol, id));
    const held = gesture === "hold" && (m.holdThumbs & thumbBit(seat)) !== 0;
    drawGripRing(ctx, c.x, c.y, c.r * RING_MUL, held, time);
  }
  // The count, once both thumbs are down, round both lobes: it is one count
  // and it is *ours*, so each seat sees it on the lobe under its own thumb
  // and on the other's — the one thing about the other thumb that is shown,
  // because it only exists while both are there.
  if (gesture !== "hold" || m.holdBeat === -1) return;
  const left = 1 - clamp01((beat - m.holdBeat + beatPhase) / cfg.mirrorHoldBeats);
  for (const id of [0, 1] as const) {
    const c = mirrorLobeCircle(l, cfg, id, lobeCol(m, shieldCol, id));
    drawGripDial(ctx, c.x, c.y, c.r * RING_MUL, left);
  }
}
