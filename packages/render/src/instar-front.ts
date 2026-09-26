import { FRONT, view } from "@neon-spore/content";
import { halo } from "./glow.js";
import { drawFrontBody, seeFrontBody } from "./instar-front-body.js";
import { drawFrontHead } from "./instar-head.js";
import { instarFarEnd } from "./instar-place.js";
import { faded, type Look } from "./instar-plate.js";
import { drawTurnedHead, instarNeck, instarTurn } from "./instar-turn.js";
import { drawWing } from "./instar-wings.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE INSTAR face-on**: a living ship coming at the screen. The body runs
 * back and up behind the head into the dark — a lit tube of the rig going
 * into depth, seamed and lit with gold lamps (`instar-front-body.ts`), two
 * engines burning at the far end — and the wings spread wide off the
 * shoulders behind the head. Then the head (`instar-head.ts`).
 *
 * All of it a third of the way round at rest and further round as it turns
 * toward the profile (`instar-turn.ts`), and drawn back to
 * front: the engines, the far wing hazed toward the field, the body, the near
 * wing over it, the head over all.
 */

/** How far off the eye is for the wings, in head radii: near enough that the tips swept back go small. */
const WING_LENS = 10;
/** How far the far wing is hazed toward the field, behind the body. */
const FAR_WING = 0.3;

export function drawFront(ctx: CanvasRenderingContext2D, l: Layout, look: Look): void {
  const { f, head, r, fade, time } = look;
  const neck = instarNeck(head, r);
  const turn = instarTurn(f.side);
  const seen = seeFrontBody(look, neck, instarFarEnd(l, f), turn);
  const end = seen[seen.length - 1];
  if (end) drawEngines(ctx, { x: neck.x + end.c.x, y: neck.y + end.c.y }, r, time, fade);
  const shoulder = { x: neck.x, y: neck.y + r * 0.05 };
  const w = view(FRONT - turn, 0, r * WING_LENS);
  const wing = (s: 1 | -1, dark: number) =>
    drawWing(ctx, look, shoulder, w, { x: 0, y: 0, z: s * r * 0.55 }, s, dark);
  wing(-1, FAR_WING);
  drawFrontBody(ctx, look, neck, seen);
  wing(1, 0);
  drawTurnedHead(ctx, head, r, { fade, side: f.side }, (half) => drawFrontHead(ctx, look, half));
}

/** The two engines at the far end: a steady burn, flickering. */
function drawEngines(
  ctx: CanvasRenderingContext2D,
  rear: { x: number; y: number },
  r: number,
  time: number,
  fade: number,
): void {
  const flick = 0.75 + 0.25 * Math.sin(time * 21);
  const size = Math.max(4, Math.round((r * 0.32) / 4) * 4);
  for (const s of [-1, 1]) {
    const x = rear.x + s * r * 0.18;
    const y = rear.y - r * 0.05;
    halo(ctx, x, y, size, PALETTE.ember, 0.7 * flick * fade);
    // The nozzle: a ring of hide round the burn, and its white-hot core.
    ctx.save();
    ctx.strokeStyle = faded(PALETTE.rockDark, fade);
    ctx.lineWidth = Math.max(1, r * 0.035);
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.09, r * 0.06, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = faded(PALETTE.emberRim, fade, 0.8 * flick);
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.045, r * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
