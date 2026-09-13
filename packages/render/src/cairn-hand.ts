import { type Creature, gripsCreature, type World } from "@neon-spore/sim";
import { cairnUnits } from "./cairn.js";
import { drawHandAt } from "./grip.js";
import type { Layout } from "./layout.js";

/** How far outside the outermost stone the ring sits — a hand closed on the
 * pile, not a line through its rocks. */
const RING_OUT = 1.1;

/**
 * The hand on THE CAIRN, drawn by `boss-draw.ts` once the pile is — the same
 * ring and word every other hand gets, on top of the body it is on rather than
 * behind it. No beam and no lanes: the pull is what the finger's travel
 * spends, not a rope from the ship, and the puff where the unit comes out is
 * the picture of which side (`cairn.ts`).
 */
export function drawPileHand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  body: Creature,
  units: number,
  time: number,
): void {
  if (l.tile <= 0) return;
  const p1 = gripsCreature(world, 1, body.id);
  const p2 = gripsCreature(world, 2, body.id);
  if (!p1 && !p2) return;
  // The ring closes on the stack, not on the one tile the body is booked at:
  // `creatureRadius` answers a tile for this kind and the pile is five wide,
  // so the ring is drawn round every stone still standing (`cairn.ts`).
  const stack = cairnUnits(l, body, units, time);
  if (stack.length === 0) return;
  const xs = stack.map((u) => u.x);
  const ys = stack.map((u) => u.y);
  const x = (Math.min(...xs) + Math.max(...xs)) / 2;
  const y = (Math.min(...ys) + Math.max(...ys)) / 2;
  const r = Math.max(...stack.map((u) => Math.hypot(u.x - x, u.y - y) + u.r));
  drawHandAt(ctx, l, world, body, "pull", p1, p2, x, y, r * RING_OUT, time);
}
