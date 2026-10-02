import { type SimConfig, type ThroatState, throatHomeCol } from "@neon-spore/sim";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullArrow } from "./pull-knob.js";
import { PULL_DOWN } from "./pull-line.js";
import { mouthX, mouthY } from "./throat-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE THROAT's two hands**, and the two circles the drawing and the hit test
 * share: the navigator's carry on the mouth itself and the pilot's pump on a
 * handle beside the gullet's root (`sim/throat-hand.ts`, `docs/spec/bosses.md`
 * §11.19).
 *
 * **The mouth is the navigator's handle.** She takes it anywhere on the field
 * and the gullet follows, kept inside the box the simulation leaves round the
 * walls and the top (`throatAimBox`). The ring sits on the lip, because the
 * mouth is the thing being carried and a handle a tile away from it would be
 * a handle on nothing.
 *
 * **The pump is the pilot's**, standing on the hull beside the root where the
 * cannon would have stood — the gullet is fixed to the ship the way the cannon
 * is — and only the height his thumb travels matters. Up and down, quickly,
 * and the circle round the mouth opens (`throatRadiusMilli`).
 *
 * Both are on offer for the whole of `sucks`, and neither once the tube
 * everts. A press on the other seat's handle is handed through with no hold,
 * and the simulation hears nothing from it: neither hand can do the other's.
 */

/** How far beside the gullet's root the pump stands, in tiles, and how far
 * over the hull — clear of the root's widest ring (`TOP_RX` in
 * `throat-shape.ts`) and of the hull's own skin. */
const PUMP_ASIDE = 2;
const PUMP_ABOVE = 1.1;

/** The navigator's circle: on the mouth, travelling with it. */
export function throatAimCircle(l: Layout, cfg: SimConfig, b: ThroatState): Circle {
  return { x: mouthX(l, b), y: mouthY(l, b), r: handleRadius(l, cfg) };
}

/** The pilot's circle: on the hull, beside the root, never moving. */
export function throatPumpCircle(l: Layout, cfg: SimConfig): Circle {
  return {
    x: tileCX(l, throatHomeCol(cfg) + PUMP_ASIDE),
    y: l.hullY - l.tile * PUMP_ABOVE,
    r: handleRadius(l, cfg),
  };
}

/** Whether the carry is running: a thumb is down on the mouth. */
export const throatCarrying = (b: ThroatState): boolean => b.aimFromXMilli >= 0;

/** Whether the pump is running: a stroke is under way. */
export const throatPumping = (b: ThroatState): boolean => b.pumpDir !== 0;

interface Hand {
  target: "throatAim" | "throatPump";
  seat: 1 | 2;
  c: Circle;
}

/** The handles under a point, this seat's own first where they overlap. */
function handsUnder(l: Layout, x: number, y: number, field: Field, b: ThroatState): Hand[] {
  if (b.phase !== "sucks") return [];
  const hands: Hand[] = [
    { target: "throatAim", seat: 2, c: throatAimCircle(l, field.cfg, b) },
    { target: "throatPump", seat: 1, c: throatPumpCircle(l, field.cfg) },
  ];
  return hands
    .filter((h) => hitCircle(h.c, x, y))
    .sort((a, c) => Number(c.seat === field.seat) - Number(a.seat === field.seat));
}

/** The press on whichever handle is under the thumb, from either seat. */
export function throatGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = bossOf(field, "throat");
  if (b === null) return null;
  const hand = handsUnder(l, x, y, field, b)[0];
  if (hand === undefined) return null;
  return grab(hand.target, field.seat, hand.seat === field.seat, x, y);
}

/**
 * The seat a press on a handle belongs to, so one mouse at a desk takes the
 * navigator's carry rather than having it dropped as the pilot's
 * (`desk-grab.ts` `markSeat`).
 */
export function throatGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const b = bossOf(field, "throat");
  if (b === null) return undefined;
  return handsUnder(l, x, y, field, b)[0]?.seat;
}

function grab(
  target: "throatAim" | "throatPump",
  player: 1 | 2,
  owns: boolean,
  x: number,
  y: number,
): Touch {
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: owns ? { kind: "drag", target, player, originX: x, originY: y } : null,
  };
}

/**
 * Both handles, drawn from `drawThroat` over the tube and the mouth.
 *
 * **Each is drawn on both screens, yours bright and theirs dim**, the bargain
 * `sinew-handles.ts` made: neither seat can feel the other's thumb, and the
 * pump is the reason the mouth she is carrying is pulling at all. **The dim
 * copy fills nothing** (`theirs`, `handle-draw.ts`), so his copy of her ring
 * leaves the lip and the body standing in it showing.
 *
 * Each is drawn `held` while its gesture runs.
 */
export function drawThroatGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  time: number,
): void {
  if (b.phase !== "sucks") return;
  const pump = throatPumpCircle(l, cfg);
  ring(ctx, pump, l, 1, throatPumping(b), time);
  // The pump's way inside its ring, on the pilot's screen: up and down, so two
  // heads — every handle that is pulled carries its arrow (`way-arrow.ts`).
  if (mine(l, 1)) drawPullArrow(ctx, pump, pump.r, PULL_DOWN, time, { alpha: 0.9, either: true });
  ring(ctx, throatAimCircle(l, cfg, b), l, 2, throatCarrying(b), time);
}

/** Whether this screen's seat is `player` — the test screen is both. */
const mine = (l: Layout, player: 1 | 2): boolean =>
  l.role === "test" || (l.role === "p1") === (player === 1);

function ring(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  l: Layout,
  player: 1 | 2,
  held: boolean,
  time: number,
): void {
  const own = mine(l, player);
  drawHandleRing(ctx, {
    x: at.x,
    y: at.y,
    r: at.r,
    hex: own ? PALETTE.rock : PALETTE.dim,
    rim: own ? PALETTE.text : PALETTE.rock,
    held,
    pull: held ? 1 : 0,
    time,
    theirs: !own,
  });
}
