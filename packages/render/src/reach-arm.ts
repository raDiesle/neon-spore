import { reachOut, reachTipMilli, type World } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE CLAW's arm, drawn out of the swelling that was the gun.
 *
 * The panel is a control set on the **ordinary field**, so there is no round's
 * picture here and nothing replaces the grid: the arm rises out of the cannon
 * lobe, up the column the strip is standing in, and comes back into it. That
 * is the whole visual difference between this panel and every other one, and
 * it has to read as *the ship's own hand* rather than as a thing that arrived
 * — which is why it starts at the hull surface and is drawn in the ship's own
 * violet rather than in a colour of its own.
 *
 * **Machined, on a field of grown bodies.** Two straight rails and a pair of
 * fingers, corner to corner, with no wobble — the ship is a membrane and this
 * is the one part of it that is a mechanism, and a pair should be able to tell
 * at a glance that the thing climbing the column is not alive. It is the same
 * decision the shape sheet's own claw card made
 * (`tools/shape-sheet/src/drafts/machined.ts`).
 *
 * Everything it draws is read off `world` — where the arm is, and whether it
 * is holding something. Nothing here is remembered between frames, so there is
 * nothing for `Effects.reset()` to clear and a restart cannot carry a hand
 * halfway up a column into the next run.
 */

/** How wide the arm's shaft is, as a share of a tile. */
const SHAFT_TILES = 0.16;
/** And how far the fingers reach past the tip. */
const FINGER_TILES = 0.34;

export function drawReachArm(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  surfaceY: (x: number) => number,
): void {
  if (!reachOut(world)) return;
  const x = tileCX(l, world.reachCol);
  // From the skin rather than from the tile the hull nominally occupies: the
  // membrane breathes, and an arm that started at a fixed y would lift off the
  // ship every time it swelled (`hull-frame.ts`).
  const from = surfaceY(x);
  const to = tileCY(l, reachTipMilli(world) / 1000);
  const half = l.tile * SHAFT_TILES;

  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 2.2;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(x + side * half, from);
    ctx.lineTo(x + side * half, to);
    ctx.stroke();
  }

  drawFingers(ctx, l, x, to, half, world.reachHeld !== 0);
}

/**
 * The two fingers at the tip, open on the way up and shut on the way back.
 *
 * The gape is in the contour and never in a rotation, for the reason the shape
 * sheet's card gives: a finger that swung would be a hinge, and this is a
 * linkage. `shut` is read off whether the arm is *carrying* something rather
 * than off its direction, so an arm coming home empty comes home open — which
 * is the one frame that says the reach found nothing, without a word on screen.
 */
function drawFingers(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  half: number,
  shut: boolean,
): void {
  const reach = l.tile * FINGER_TILES;
  const out = shut ? half * 0.4 : half * 2.1;

  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(x - half * 1.6, y);
  ctx.lineTo(x + half * 1.6, y);
  ctx.stroke();

  ctx.lineWidth = 2.2;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(x + side * half * 1.4, y);
    ctx.lineTo(x + side * out, y - reach * 0.55);
    ctx.lineTo(x + side * out * 0.55, y - reach);
    ctx.stroke();
  }
}
