import { strokeGlow } from "./glow.js";
import type { Point } from "./instar-place.js";
import { faded, type Look, toward } from "./instar-plate.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE INSTAR's wings**: a bat's, membrane stretched between an arm and
 * three long fingers, the bones lit like the ribs of a hull. One wing is one
 * shape in its own frame of head radii — the arm out to the left and up, the
 * fingers fanning down — and each view says where that frame points: face-on
 * the two wings spread left and right of the shoulders, side-on the near one
 * stands up off the back and the far one shows behind it
 * (`instar-front.ts`, `instar-profile.ts`).
 *
 * They beat slowly, all the time: the body is flying, and the flight is what
 * makes THE SLOW visible on it (`instar-sway.ts`).
 */

/** The cool the far skin goes to, never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";

/** The wing in its own frame, in head radii: elbow, wrist, three fingertips. */
const ELBOW: Point = { x: -0.7, y: -0.75 };
const WRIST: Point = { x: -1.45, y: -1.05 };
const TIPS: readonly Point[] = [
  { x: -2.1, y: -0.05 },
  { x: -1.55, y: 0.6 },
  { x: -0.8, y: 0.8 },
];

/** Where one unit along the wing's own x and y lands, in pixels. */
export interface WingFrame {
  ex: Point;
  ey: Point;
}

export function drawWing(
  ctx: CanvasRenderingContext2D,
  look: Look,
  shoulder: Point,
  root: Point,
  frame: WingFrame,
  dark = 0,
): void {
  const { f, time, fade } = look;
  const spread = 0.35 + 0.65 * f.wing;
  const flap = Math.sin(time * 1.7) * 0.14 * (0.4 + f.wing);
  const cos = Math.cos(flap);
  const sin = Math.sin(flap);
  const at = (q: Point): Point => {
    // Folded, the wing draws in to the arm; beating, it turns on the shoulder.
    const x = q.x * spread;
    const y = q.y * (0.6 + 0.4 * spread);
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return {
      x: shoulder.x + rx * frame.ex.x + ry * frame.ey.x,
      y: shoulder.y + rx * frame.ex.y + ry * frame.ey.y,
    };
  };
  const elbow = at(ELBOW);
  const wrist = at(WRIST);
  const tips = TIPS.map(at);
  const membrane = new Path2D();
  membrane.moveTo(shoulder.x, shoulder.y);
  membrane.lineTo(elbow.x, elbow.y);
  membrane.lineTo(wrist.x, wrist.y);
  let last = wrist;
  for (const t of [...tips, root]) {
    // Each scallop of skin sags in toward the wrist between two bones.
    const c = toward(toward(last, t, 0.5), wrist, last === wrist ? 0 : 0.3);
    membrane.quadraticCurveTo(c.x, c.y, t.x, t.y);
    last = t;
  }
  membrane.closePath();
  const skin = 1 - 0.45 * dark;
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade, 0.85);
  ctx.fill(membrane);
  ctx.fillStyle = faded(PALETTE.sheenDeep, fade, 0.75 * skin);
  ctx.fill(membrane);
  // Skin thin enough to glow: lit through near the bones at the wrist, going
  // to the cool dark out at the scalloped hem.
  const hem = toward(tips[1] as Point, root, 0.3);
  const through = ctx.createLinearGradient(wrist.x, wrist.y, hem.x, hem.y);
  through.addColorStop(0, faded(PALETTE.sheenMid, fade, 0.3 * skin));
  through.addColorStop(0.55, faded(PALETTE.hull, fade, 0.1 * skin));
  through.addColorStop(1, faded(SHADOW, fade, 0.5));
  ctx.fillStyle = through;
  ctx.fill(membrane);
  // Veins, from each bone into the skin, forking as they go.
  ctx.clip(membrane);
  ctx.strokeStyle = faded(PALETTE.sheenCold, fade, 0.35 * skin);
  ctx.lineWidth = STROKE.inner;
  ctx.beginPath();
  for (const t of tips) {
    for (const u of [0.35, 0.6, 0.82]) {
      const m = toward(wrist, t, u);
      const out = toward(m, root, 0.22);
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(out.x, out.y);
      const fork = toward(m, out, 0.55);
      const twig = toward(out, t, 0.35);
      ctx.moveTo(fork.x, fork.y);
      ctx.lineTo(twig.x, twig.y);
    }
  }
  ctx.stroke();
  ctx.restore();
  strokeGlow(ctx, membrane, faded(PALETTE.sheenMid, fade, skin), STROKE.inner, 0.3 * fade);
  const bones = new Path2D();
  bones.moveTo(shoulder.x, shoulder.y);
  bones.lineTo(elbow.x, elbow.y);
  bones.lineTo(wrist.x, wrist.y);
  for (const t of tips) {
    bones.moveTo(wrist.x, wrist.y);
    bones.lineTo(t.x, t.y);
  }
  strokeGlow(ctx, bones, faded(PALETTE.hull, fade, skin), STROKE.outline * 1.6, 0.6 * fade);
  // The claw on the wrist.
  const claw = new Path2D();
  claw.moveTo(wrist.x, wrist.y);
  const hook = at({ x: WRIST.x - 0.12, y: WRIST.y - 0.3 });
  claw.lineTo(hook.x, hook.y);
  strokeGlow(ctx, claw, faded(PALETTE.rock, fade, skin), STROKE.outline, 0.3 * fade);
}
