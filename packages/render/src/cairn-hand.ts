import { type Creature, gripsCreature, type World } from "@neon-spore/sim";
import { cairnUnits } from "./cairn-units.js";
import { drawHandAt } from "./grip.js";
import { handleRadius } from "./handle-draw.js";
import { seatIsMine } from "./handle-word.js";
import type { Circle, Layout } from "./layout.js";
import { drawPullArrow } from "./pull-knob.js";
import type { SeatNames } from "./seat-name.js";

/** How far outside the outermost stone the ring sits — a hand closed on the
 * pile, not a line through its rocks. */
const RING_OUT = 1.1;

/**
 * The hand on THE CAIRN, drawn by `boss-draw.ts` once the pile is — the same
 * ring and word every other hand gets, on top of the body it is on rather than
 * behind it. No beam and no lanes: the pull is what the finger's travel
 * spends, not a rope from the ship, and the puff where the unit comes out is
 * the picture of which side (`cairn.ts`). Inside the ring, on the screen
 * whose hand it is, the shared arrow says the pull goes sideways
 * (`pull-knob.ts`, 30 September 2026).
 */
export function drawPileHand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  body: Creature,
  units: number,
  time: number,
  /** `outlineHush`'s: the ring closes on the stones where they have rocked to. */
  hush: number,
  /** The two people's names, for the word under the ring (`grip.ts`). */
  names?: SeatNames,
): void {
  if (l.tile <= 0) return;
  const p1 = gripsCreature(world, 1, body.id);
  const p2 = gripsCreature(world, 2, body.id);
  if (!p1 && !p2) return;
  const ring = pileRing(l, body, units, time, hush);
  if (ring === null) return;
  drawHandAt(ctx, l, world, body, "pull", p1, p2, ring.x, ring.y, ring.r, time, names);
  // The way, on the screen whose hand it is: either side, so two heads — which
  // side the unit comes out is the finger's travel, not the pile's (`cairn.ts`).
  if ((p1 && seatIsMine(l.role, 1)) || (p2 && seatIsMine(l.role, 2))) {
    drawPullArrow(ctx, ring, handleRadius(l, world.cfg), SIDEWAYS, time, {
      alpha: 0.9,
      either: true,
    });
  }
}

const SIDEWAYS = { dx: 1, dy: 0 } as const;

/**
 * Where the ring round the pile stands this frame, or nothing once no stone
 * is. **The ring closes on the stack, not on the one tile the body is booked
 * at**: `creatureRadius` answers a tile for this kind and the pile is five
 * wide, so the ring is drawn round every stone still standing (`cairn.ts`).
 * The verdict stands on the same circle (`cairn-marks.ts`).
 */
export function pileRing(
  l: Layout,
  body: Creature,
  units: number,
  time: number,
  hush: number,
): Circle | null {
  const stack = cairnUnits(l, body, units, time, hush);
  if (stack.length === 0) return null;
  const xs = stack.map((u) => u.x);
  const ys = stack.map((u) => u.y);
  const x = (Math.min(...xs) + Math.max(...xs)) / 2;
  const y = (Math.min(...ys) + Math.max(...ys)) / 2;
  const r = Math.max(...stack.map((u) => Math.hypot(u.x - x, u.y - y) + u.r));
  return { x, y, r: r * RING_OUT };
}
