import { type MirrorState, mirrorAsks, mirrorGesture, type SimConfig } from "@neon-spore/sim";
import { cueFrame } from "./boss-cue-frame.js";
import { holdDropR } from "./cue-helper.js";
import { drawGripRing } from "./grip-rings.js";
import { seatIsMine } from "./handle-word.js";
import { type Circle, hitCircle, type Layout, tileCX } from "./layout.js";
import { drawMarkTheirs } from "./mark-feedback.js";
import { mirrorHullY } from "./mirror.js";
import type { PlaceHand } from "./ship-hand.js";
import { drawSoakHold } from "./soak-hold.js";
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
 * simulation's rule (`sim/mirror-hand.ts` `mirrorAsks`): under `reflect`
 * player 1 has both (a carry or a tap on its cannon, a press on its shield)
 * and player 2 its cannon (the muzzle swipe); under `hold` player 1 its
 * cannon and player 2 its shield, one each, because the pin is both seats or
 * nothing. A press on a lobe asked only of the other seat is handed to the
 * sim with no hold, so it is refused once and said (`mirrorRefuse`), the
 * way every mark answers the wrong thumb.
 *
 * What the marks say is read off the world every frame: under `reflect` a
 * breathing ring on each lobe this seat answers; under `hold` the HOLD LAB's
 * drop (`soak-hold.ts`) where the cue stands, at the hull under this seat's
 * own lobe — since 14 October 2026, as every hold is; it was a ring round
 * the lobe and a dial until then. It sinks while the sim has its thumb
 * (`holdThumbs`), and once both have landed its water rises with the count
 * of `mirrorHoldBeats`, and the partner's drop stands dimmed under theirs,
 * filling with it. **The other seat's thumb is never drawn alone**: whether
 * the partner is on is the partner's to say, and that is the split; the
 * count is the one thing shown, because it only exists while both are there.
 * Whose each lobe is, and the verdict of a touch, are `mirror-marks.ts`'s.
 */

/** Outside the grab circle, clear of the lobe's own rim. */
const RING_MUL = 1.3;

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

/** The nearest of `ids` under a point, or nothing. */
function nearestUnder(
  l: Layout,
  x: number,
  y: number,
  field: Field,
  m: MirrorState,
  ids: readonly (0 | 1)[],
): 0 | 1 | null {
  let best: { id: 0 | 1; d: number } | null = null;
  for (const id of ids) {
    const c = mirrorLobeCircle(l, field.cfg, id, lobeCol(m, field.shieldCol, id));
    if (!hitCircle(c, x, y)) continue;
    const d = (x - c.x) ** 2 + (y - c.y) ** 2;
    if (best === null || d < best.d) best = { id, d };
  }
  return best === null ? null : best.id;
}

/**
 * The lobe under a press from `seat`: its own first, since its cannon over
 * the pair's shield stands its two lobes one inside the other, and a thumb
 * on its own lobe there is never refused for touching the other seat's.
 */
function lobeUnder(l: Layout, x: number, y: number, field: Field, m: MirrorState): 0 | 1 | null {
  const own = mirrorAsks(m, field.seat);
  const other = mirrorAsks(m, field.seat === 1 ? 2 : 1).filter((id) => !own.includes(id));
  return nearestUnder(l, x, y, field, m, own) ?? nearestUnder(l, x, y, field, m, other);
}

/**
 * A press on one of its lobes while it is asking for one: a `drag` on
 * `mirrorLobe` with the lobe's `id`, and a hold that carries what the lift
 * will need — the carry threshold under `reflect`, the pin under `hold`. A
 * lobe asked only of the other seat is handed through with no hold, for the
 * sim to refuse.
 */
export function mirrorLobeUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const m = bossOf(field, "mirror");
  if (m === null) return null;
  const id = lobeUnder(l, x, y, field, m);
  if (id === null) return null;
  const player = field.seat;
  const command = {
    kind: "drag",
    target: "mirrorLobe",
    on: true,
    fromMilli: 0,
    fromYMilli: 0,
    id,
  } as const;
  if (!mirrorAsks(m, player).includes(id)) return { player, command, hold: null };
  return {
    player,
    command,
    hold: {
      kind: "drag",
      target: "mirrorLobe",
      player,
      originX: x,
      originY: y,
      id,
      ...(mirrorGesture(m) === "hold" ? { pin: true } : { carryMilli: field.cfg.mirrorCarryMilli }),
    },
  };
}

/**
 * Whose the lobe under a desk press is, when only one seat is asked for it,
 * so one mouse is signed with that seat rather than refused as the other's
 * (`desk-grab.ts` `markSeat`). A lobe both seats answer — its cannon under
 * `reflect` — names nobody, and the desk's first seat takes it.
 */
export function mirrorGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const m = bossOf(field, "mirror");
  if (m === null) return undefined;
  const id = nearestUnder(l, x, y, field, m, [
    ...new Set([...mirrorAsks(m, 1), ...mirrorAsks(m, 2)]),
  ]);
  if (id === null) return undefined;
  const one = mirrorAsks(m, 1).includes(id);
  const two = mirrorAsks(m, 2).includes(id);
  return one === two ? undefined : one ? 1 : 2;
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
export function thumbBit(seat: 1 | 2): number {
  return seat === 1 ? 1 : 2;
}

/**
 * The rings and drops, drawn after the mirror so they stand over its rim.
 * Read off the world and this screen's seat, nothing else — a frame test sets
 * the world and gets the picture.
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
  const seat = seatOf(l.role);
  if (mirrorGesture(m) !== "hold") {
    for (const id of mirrorAsks(m, seat)) {
      const c = mirrorLobeCircle(l, cfg, id, lobeCol(m, shieldCol, id));
      drawGripRing(ctx, c.x, c.y, c.r * RING_MUL, false, time);
    }
    return;
  }
  // The pin: the count once both thumbs are down, on both drops — it is one
  // count and it is *ours*, so each seat sees it on its own and the other's.
  const both = m.holdBeat !== -1;
  const fill = both ? clamp01((beat - m.holdBeat + beatPhase) / cfg.mirrorHoldBeats) : 0;
  const r = holdDropR(cueFrame(l));
  const y = mirrorHullY(l, cfg);
  for (const player of [1, 2] as const) {
    const mine = seatIsMine(l.role, player);
    if (!mine && !both) continue;
    for (const id of mirrorAsks(m, player)) {
      const at = { x: tileCX(l, lobeCol(m, shieldCol, id)), y };
      const held = (m.holdThumbs & thumbBit(player)) !== 0;
      drawSoakHold(ctx, at, r, { time, held, fill, theirs: !mine });
      if (!mine) drawMarkTheirs(ctx, at.x, at.y, r, time);
    }
  }
}
