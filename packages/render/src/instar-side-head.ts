import { drawDrip, drawScales } from "./instar-hide.js";
import { drawHorn } from "./instar-horn.js";
import type { Point } from "./instar-place.js";
import { drawLamp, drawPlate, drawSeam, faded, type Look } from "./instar-plate.js";
import { drawLipTeeth, drawSideEye, hinged } from "./instar-side-parts.js";
import { PALETTE } from "./palette.js";
import { breath } from "./solid-motion.js";
import { splinePath } from "./spline.js";

/**
 * **THE INSTAR's head side-on**, snout to the left: the skull and its horns,
 * the socket and the eye in it, the lower jaw hinged open under it with the
 * venom hanging off its lip. Split off `instar-profile.ts`, which lays the
 * body out behind it.
 */

/**
 * How far the skull's light-facing angle idles, in radians, and how long one
 * wobble takes there and back, in `look.time`'s own seconds — own-motion, so
 * wall-clock is the right clock for it (`renderer.ts`'s `ViewState.time`).
 *
 * The skull's pose does not otherwise change frame to frame, so the plate lit
 * by `lightHide` was a still life: rounded and shaded, but paired with no
 * motion, which reads as a photograph of a ball rather than a ball
 * (`docs/style-guide.md`, "Depth on a body that already ships"). This is
 * small enough that the pose still reads as still — only the wet shoulder
 * `lightHide` paints slides visibly across the plate.
 */
const CROWN_WOBBLE = 0.09;
const CROWN_WOBBLE_PERIOD = 5.5;

/** How far the jaw's breath opens it on its hinge, in radians either side of rest, and its period. */
const JAW_BREATH = 0.035;
const JAW_BREATH_PERIOD = 3.3;

/** Where the eye sits, in head radii about `look.head`: what another head in profile lines up on. */
export const SIDE_EYE = { x: -0.12, y: -0.27 } as const;

/** The lower jaw's outline, in head radii before its hinge turns it. */
const LOWER_JAW = [
  [0.3, 0.08],
  [-0.3, 0.1],
  [-0.95, 0.12],
  [-0.9, 0.24],
  [-0.3, 0.32],
  [0.45, 0.3],
] as const;

/** The skull's outline, in head radii. */
const SKULL = [
  [0.62, -0.38],
  [0.15, -0.56],
  [-0.3, -0.4],
  [-0.8, -0.24],
  [-1.15, -0.08],
  [-1.1, 0.05],
  [-0.4, 0.08],
  [0.35, 0.1],
  [0.78, 0.02],
] as const;

/** How far a head side-on has its jaw open on its hinge, in radians: by
 * the pose's two jaws, and breathing, never quite the same twice — a body
 * at rest, not a still. */
export function sideJawOpen(f: Look["f"], time: number): number {
  return (
    (0.15 + 0.55 * (f.jawUp + f.jawDown) * 0.5) * 0.8 +
    JAW_BREATH * (1 + breath(time, JAW_BREATH_PERIOD, 0.35, 5))
  );
}

/** Where a point in head radii lands in profile, how far the jaw is open on
 * its hinge this frame, and where a point of the jaw lands with it. */
function sideFrame(look: Look) {
  const { f, head, r, time } = look;
  const at = (x: number, y: number): Point => ({ x: head.x + x * r, y: head.y + y * r });
  const hinge = at(0.3, 0.08);
  const open = sideJawOpen(f, time);
  const turn = hinged(hinge, open);
  return { at, hinge, open, jaw: (x: number, y: number): Point => turn(at(x, y)) };
}

function outlineOf({ at, jaw }: ReturnType<typeof sideFrame>): { jaw: Point[]; skull: Point[] } {
  return { jaw: LOWER_JAW.map(([x, y]) => jaw(x, y)), skull: SKULL.map(([x, y]) => at(x, y)) };
}

/** The head in profile, snout to the left: the skull and its horns, the eye,
 * the lower jaw hinged open under it. */
export function drawSideHead(ctx: CanvasRenderingContext2D, look: Look): void {
  const { r, fade, hurt, time } = look;
  const frame = sideFrame(look);
  const { at, hinge, open, jaw } = frame;
  const { jaw: lowerJaw, skull: skullAt } = outlineOf(frame);
  const lower = splinePath(lowerJaw, true);
  const mouth = new Path2D();
  for (const [i, p] of [at(0.3, 0.08), at(-1.1, 0.05), jaw(-0.95, 0.12), hinge].entries()) {
    if (i === 0) mouth.moveTo(p.x, p.y);
    else mouth.lineTo(p.x, p.y);
  }
  mouth.closePath();
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(mouth);
  ctx.fillStyle = faded(PALETTE.ember, fade, 0.25);
  ctx.fill(mouth);
  ctx.restore();
  const chin = at(-0.3, 0.2);
  const tilt = -open * 0.6;
  drawPlate(ctx, lower, fade, 0.6, hurt, {
    x: chin.x,
    y: chin.y,
    r: r * 0.7,
    ry: r * 0.14,
    angle: tilt,
  });
  drawScales(
    ctx,
    lower,
    { x: chin.x, y: chin.y, r: r * 0.7, ry: r * 0.14, angle: tilt },
    r * 0.1,
    fade,
  );
  const lip = jaw(-0.9, 0.2);
  drawDrip(ctx, lip, r * 0.3, r * 0.03, time, 1, fade);
  drawDrip(ctx, jaw(-0.4, 0.3), r * 0.2, r * 0.025, time, 4, fade);
  const wobble = CROWN_WOBBLE * Math.sin((time * (Math.PI * 2)) / CROWN_WOBBLE_PERIOD);
  // The far horn first, standing back off the far brow; the near one toward the player.
  for (const [bx, by, tx, ty, lean] of [
    [0.15, -0.5, 0.75, -1.08, -0.35],
    [0.4, -0.42, 1.3, -0.98, 0.3],
  ] as const) {
    const horn = {
      // Rooted a little inside the skull, so the root's round end is under it.
      base: at(bx + 0.04, by + 0.08),
      bend: at(bx + 0.5, by - 0.1),
      tip: at(tx, ty),
      width: r * 0.11,
      lean: lean * r,
    };
    drawHorn(ctx, horn, r, fade, wobble);
  }
  const skull = splinePath(skullAt, true);
  const brow = at(-0.2, -0.2);
  const crown = { x: brow.x, y: brow.y, r: r * 0.95, ry: r * 0.3, angle: -0.2 + wobble };
  drawPlate(ctx, skull, fade, 0.7, hurt, crown);
  drawScales(ctx, skull, crown, r * 0.11, fade);
  // Teeth along the upper lip, over the open mouth.
  const roots = [0, 1, 2, 3, 4].map((i) => at(-0.95 + i * 0.25, 0.06));
  drawLipTeeth(
    ctx,
    roots,
    roots.map((_, i) => r * (i === 1 ? 0.2 : 0.11)),
    r * 0.035,
    fade,
  );
  drawSeam(ctx, at(-0.9, -0.16), at(-0.4, -0.3), at(0.1, -0.42), fade, 0.5);
  drawLamp(ctx, at(-1.02, -0.06), r * 0.03, fade, 0.5 + 0.5 * Math.sin(time * 3));
  drawSideEye(ctx, look, at(SIDE_EYE.x, SIDE_EYE.y));
}
