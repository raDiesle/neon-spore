import { drawDrip, drawScales } from "./instar-hide.js";
import { drawHorn } from "./instar-horn.js";
import type { Point } from "./instar-place.js";
import { drawLamp, drawPlate, drawSeam, faded, type Look } from "./instar-plate.js";
import { SIDE_EYE } from "./instar-side-head.js";
import { drawLipTeeth, drawSideEye, hinged } from "./instar-side-parts.js";
import { PALETTE } from "./palette.js";
import { breath } from "./solid-motion.js";
import { splinePath } from "./spline.js";

/**
 * **THE INSTAR's head side-on as a drake**, snout to the left, in the shipped
 * profile's skin (`instar-side-head.ts`): plates and scales, the same horns,
 * teeth, venom, seam, lamp and eye — only the outline is a drake's. A crown
 * the horns sweep back off, a small brow over the eye with a dip between it
 * and the horn roots, a bridge falling to a narrow snout, and a jaw that
 * tapers to a chin under the snout and opens half as far as the shipped one.
 * The owner, 1 October 2026, of the rig drake: *the best and looks most
 * natural*, but smaller, in the old skin, the mouth smaller and opened less,
 * the brows smaller and clear of the horns.
 */

/** How far the crown's light-facing angle idles, and its period — the shipped profile's. */
const CROWN_WOBBLE = 0.09;
const CROWN_WOBBLE_PERIOD = 5.5;

/** The jaw's breath on its hinge, radians either side of rest, and its period. */
const JAW_BREATH = 0.025;
const JAW_BREATH_PERIOD = 3.3;

/** What the drake opens against the shipped profile's gape. */
const GAPE = 0.45;

/** The whole head against the shipped profile, drawn about the neck so it stays on it. */
const SIZE = 0.88;
const NECK = { x: 0.6, y: 0 } as const;

const SKULL: readonly (readonly [number, number])[] = [
  [0.74, -0.3],
  [0.45, -0.55],
  [0.18, -0.56],
  [0.04, -0.49],
  [-0.12, -0.53],
  [-0.24, -0.53],
  [-0.4, -0.42],
  [-0.7, -0.25],
  [-1.02, -0.14],
  [-1.22, -0.05],
  [-1.18, 0.05],
  [-0.6, 0.07],
  [0.1, 0.1],
  [0.5, 0.14],
  [0.82, 0.0],
];

const JAW: readonly (readonly [number, number])[] = [
  [0.36, 0.1],
  [-0.3, 0.1],
  [-0.98, 0.09],
  [-1.02, 0.16],
  [-0.6, 0.26],
  [0.05, 0.33],
  [0.55, 0.26],
];

/** The two horns, far first: root, tip, and which way the tip leans. */
const HORNS = [
  [0.22, -0.41, 1.25, -0.8, -0.3],
  [0.44, -0.36, 1.35, -0.52, 0.25],
] as const;

/** The drake's head in profile, snout to the left. */
export function drawDrakeSideHead(ctx: CanvasRenderingContext2D, look: Look): void {
  const { f, head, fade, hurt, time } = look;
  const r = look.r * SIZE;
  const base = { x: head.x + NECK.x * look.r * (1 - SIZE), y: head.y };
  const at = (x: number, y: number): Point => ({ x: base.x + x * r, y: base.y + y * r });
  const hinge = at(0.36, 0.1);
  const open =
    (0.15 + 0.55 * (f.jawUp + f.jawDown) * 0.5) * 0.8 * GAPE +
    JAW_BREATH * (1 + breath(time, JAW_BREATH_PERIOD, 0.35, 5));
  const turn = hinged(hinge, open);
  const jaw = (x: number, y: number): Point => turn(at(x, y));
  const lower = splinePath(
    JAW.map(([x, y]) => jaw(x, y)),
    true,
  );
  const mouth = new Path2D();
  for (const [i, p] of [hinge, at(-1.02, 0.06), jaw(-0.98, 0.09)].entries()) {
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
  const jawForm = { x: chin.x, y: chin.y, r: r * 0.7, ry: r * 0.14, angle: tilt };
  drawPlate(ctx, lower, fade, 0.6, hurt, jawForm);
  drawScales(ctx, lower, jawForm, r * 0.09, fade);
  drawDrip(ctx, jaw(-0.88, 0.15), r * 0.3, r * 0.03, time, 1, fade);
  drawDrip(ctx, jaw(-0.4, 0.28), r * 0.2, r * 0.025, time, 4, fade);
  const wobble = CROWN_WOBBLE * Math.sin((time * (Math.PI * 2)) / CROWN_WOBBLE_PERIOD);
  for (const [bx, by, tx, ty, lean] of HORNS) {
    const horn = {
      // Rooted a little inside the crown, so the root's round end is under it.
      base: at(bx + 0.04, by + 0.08),
      bend: at(bx + 0.45, by - 0.14),
      tip: at(tx, ty),
      width: r * 0.1,
      lean: lean * r,
    };
    drawHorn(ctx, horn, r, fade, wobble);
  }
  const skull = splinePath(
    SKULL.map(([x, y]) => at(x, y)),
    true,
  );
  const brow = at(-0.25, -0.22);
  const crown = { x: brow.x, y: brow.y, r: r * 0.95, ry: r * 0.3, angle: -0.25 + wobble };
  drawPlate(ctx, skull, fade, 0.7, hurt, crown);
  drawScales(ctx, skull, crown, r * 0.1, fade);
  const roots = [0, 1, 2, 3, 4].map((i) => at(-1.0 + i * 0.24, 0.06));
  drawLipTeeth(
    ctx,
    roots,
    roots.map((_, i) => r * (i === 1 ? 0.15 : 0.09)),
    r * 0.032,
    fade,
  );
  // The brow's own ridge, over the eye and stopping short of the crown's dip.
  drawSeam(ctx, at(-0.36, -0.38), at(-0.2, -0.45), at(-0.02, -0.42), fade, 0.6);
  drawSeam(ctx, at(-1.0, -0.08), at(-0.68, -0.18), at(-0.42, -0.3), fade, 0.5);
  drawLamp(ctx, at(-1.1, -0.06), r * 0.03, fade, 0.5 + 0.5 * Math.sin(time * 3));
  drawSideEye(ctx, { ...look, r }, at(SIDE_EYE.x, SIDE_EYE.y));
}
