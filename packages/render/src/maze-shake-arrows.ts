import type { Circle, Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE MAZE's heart, told it may go any way**: eight chevrons round the room,
 * pointing out, rocking a little outward and back as a shake does.
 *
 * The owner, 29 September 2026, on the old pull: *it's not clear how it
 * should pull and in which direction*. The answer is every direction, so the
 * picture offers eight, the way THE PUSH's arrows offer its two
 * (`grip-arrows.ts`) — white, the colour the field uses for an instruction to
 * a player rather than a fact about the world, and **green once this seat's
 * thumb is on**, the colour of an answer taken. They stay the whole hold: the
 * shake is not one move, and a thumb that has landed still has to be told to
 * keep going. Each is stroked twice, dark under light, because they stand
 * over the drum's own spokes, which are pale too, and a first frame read
 * them as more of the wall.
 */

/** How far outside the room's wall the arrow's tip stands, in tiles: clear of
 * the green count round it, which a first frame ran them into. */
const GAP_TILES = 0.85;
/** Half the chevron's width, and how far it reaches out. */
const HALF_TILES = 0.3;
const REACH_TILES = 0.24;
/** How far the arrows rock, in tiles, and how fast. */
const ROCK_TILES = 0.08;
const ROCK_HZ = 2.4;

export function drawShakeArrows(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Circle,
  held: boolean,
  time: number,
): void {
  const rock = Math.sin(time * ROCK_HZ * Math.PI * 2) * ROCK_TILES * l.tile;
  const out = c.r + l.tile * GAP_TILES + rock;
  const half = l.tile * HALF_TILES;
  const reach = l.tile * REACH_TILES;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  const d = Math.SQRT1_2;
  for (const [ux, uy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [d, d],
    [-d, d],
    [d, -d],
    [-d, -d],
  ] as const) {
    // The tip at `out`, the two arms back towards the room and either side.
    const tx = c.x + ux * out;
    const ty = c.y + uy * out;
    const bx = tx - ux * reach;
    const by = ty - uy * reach;
    ctx.moveTo(bx - uy * half, by + ux * half);
    ctx.lineTo(tx, ty);
    ctx.lineTo(bx + uy * half, by - ux * half);
  }
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = Math.max(2, l.tile * 0.2);
  ctx.stroke();
  ctx.strokeStyle = held ? PALETTE.good : PALETTE.text;
  ctx.lineWidth = Math.max(1, l.tile * 0.1);
  ctx.stroke();
  ctx.restore();
}
