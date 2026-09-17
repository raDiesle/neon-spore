import { type SimConfig, type SurgeState, surgeHeld } from "@neon-spore/sim";
import { drawHandleHint, drawHandleRing, type HintStyle, handleRadius } from "./handle-draw.js";
import { hitCircle, type Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type Point, surgeBulbCircle } from "./surge-shape.js";
import type { Field, Touch } from "./touch.js";

/**
 * **THE SURGE's one handle, taken by both seats**: the bulb itself.
 *
 * Every handle before it belonged to a seat — the pilot's rope, the
 * balloon's and the sinew's one each side — and this is the first the pair
 * share: `surgeBulb` is one `DragTarget` and either seat's `drag` on it is
 * that seat's thumb on the glass (`sim/surge-hand.ts`). So the hit test is
 * one circle, the bulb at rest, answered for whichever seat is asking, and
 * what is drawn is not a ring to reach for but two **grip marks** on the
 * bulb's lower flank — the left the pilot's, the right the navigator's,
 * THE BALLOON's sides — so each seat can see the other's thumb land and,
 * which is the whole boss, see it come off.
 *
 * The grip marks carry no pull arc: a ring that filled with the pressure
 * would put the navigator's number on the pilot's screen
 * (`view-role-clocks.ts`). Held is held, and that is all a mark says.
 *
 * The **rest** a thumb is tested against is the bulb's circle on the row
 * the simulation hangs it at (`surge-shape.ts`), never the eased or swollen
 * body: by the time it has moved the pointer is captured and nothing is
 * hit-tested again. Whether the bulb *takes* the thumb — not while it
 * re-seals after a burst, not while it everts — is the simulation's to
 * refuse, exactly as THE SINEW's swing is.
 */

/** Where the marks sit on the bulb, as shares of its radii. */
const GRIP_OUT = 0.5;
const GRIP_DOWN = 0.42;
/** How big a mark is, in handle radii. */
const GRIP_R = 0.75;

const HINT_SURGE: HintStyle = { fontTiles: 0.22, mine: 0.8, theirs: 0.35 };

/** Which seat owns which side. Asked by the drawing; the hit test asks neither. */
export function surgeGripSeat(side: -1 | 1): 1 | 2 {
  return side === -1 ? 1 : 2;
}

/**
 * The press: anywhere on the bulb, from either seat. `field.surge` is `null`
 * on every wave without the boss, and a press then falls through to
 * whatever is behind it exactly as if no bulb were there.
 */
export function surgeBulbUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = field.surge;
  if (s === null) return null;
  if (!hitCircle(surgeBulbCircle(l, field.cfg, s), x, y)) return null;
  const target = "surgeBulb";
  return {
    player: field.seat,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: field.seat, originX: x, originY: y },
  };
}

export function drawSurgeGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SurgeState,
  c: Point,
  rx: number,
  ry: number,
  time: number,
  /** Whether the bulb takes no thumb now — sealing or everting: no word. */
  refusing: boolean,
): void {
  const r = handleRadius(l, cfg) * GRIP_R;
  for (const side of [-1, 1] as const) {
    const player = surgeGripSeat(side);
    const held = surgeHeld(s, player);
    const mine = l.role === "test" || (l.role === "p1") === (player === 1);
    const x = c.x + side * rx * GRIP_OUT;
    const y = c.y + ry * GRIP_DOWN;
    drawHandleRing(ctx, {
      x,
      y,
      r,
      hex: refusing ? PALETTE.dim : mine ? PALETTE.rock : PALETTE.dim,
      rim: refusing ? PALETTE.rock : mine ? PALETTE.text : PALETTE.rock,
      held,
      pull: 0,
      time,
    });
    if (held || refusing) continue;
    // The word says the gesture, not the owner: both seats hold the same
    // thing, and the only thing to be told is that a thumb belongs here.
    drawHandleHint(ctx, l, l.role, x, y + r * 2.2, HINT_SURGE, {
      seat: player,
      mine: "HOLD",
      theirs: "HOLD",
    });
  }
}
