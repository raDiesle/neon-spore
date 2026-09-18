import { type SimConfig, type SurgeState, surgeHeld } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { cueSeen } from "./boss-cue.js";
import { drawCueText } from "./boss-cue-text.js";
import { drawHandleRing, handleRadius } from "./handle-draw.js";
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
    // **The cue** (`decisions.md` #34, `boss-cue-text.ts`): the word says the
    // gesture and the kind says it is a hold, which is the whole of this boss.
    // On the seat whose mark it is and not on the other's — what the pair must
    // see of each other here is the *thumb*, and the ring says that by filling.
    // Built here because the mark rides the bulb's swell and its sink, which
    // are the drawing's own.
    const cue: BossCue = {
      seat: player,
      kind: "HOLD",
      word: "HOLD",
      x,
      y,
      halfW: r,
      halfH: r,
      seed: 61 + player,
      framed: false,
    };
    if (cueSeen(cue, l.role)) drawCueText(ctx, cue, time);
  }
}
