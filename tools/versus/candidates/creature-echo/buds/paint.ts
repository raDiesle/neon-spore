import { KEY } from "../../../../../packages/content/src/light.js";
import type { SeamDraw } from "../../../../../packages/render/src/echo-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";

/**
 * BUDS — two lit nuclei under one skin, pulling apart along the axis, with
 * the seam as the dark between them.
 *
 * The shipped furrow says *where* the body will part. It says nothing about
 * *what* is parting: the body is one blob with a line on it until the beat
 * it becomes two. This puts the two inside it from the start. Two cores of
 * the body's own colour, each a ball lit from `KEY` — bright toward the
 * light, dark away from it, the same corner as everything on the field
 * however the body leans — sitting on top of each other on the first frame
 * and drawn apart along the axis as the strain gathers, so what the pair
 * sees over three beats is one heart becoming two. The seam is what is left
 * between them: the shipped furrow, cut across the axis, and it deepens as
 * the cores separate and the skin between them thins.
 *
 * The cores are the *placed* half of this look and the furrow is the posed
 * half. A core moves along the field axis the halves will actually step
 * along (`echoAxis`), so the picture cannot point one way while the bodies
 * go another — which is the rule the shipped seam obeys, kept.
 *
 * **How it can lose.** *Two eyes.* Two bright discs side by side on a small
 * round body is a face, and this game already has a body whose two bright
 * discs are a face. At the size an echo is drawn the cores may read as
 * exactly that, and a body that looks at the pair is a different creature
 * from one that is about to divide.
 */

/** The furrow's own numbers for the seam between the cores. */
const SEAM_MIN = 0.22;
const SEAM_MAX = 0.85;
const SEAM_WIDTH = 0.16;

/** A core's reach as a share of the body's smaller radius, and how far
 * along the axis each has travelled at full strain, as a share of the same. */
const CORE = 0.62;
const APART = 0.5;

/** How far a core's light sits off its centre, toward the key, in core radii,
 * and how much of the core the lit patch fills. */
const LIT_OFFSET = 0.4;
const LIT_REACH = 1.1;

/** The core's strength at rest and at full strain: faint under the skin on
 * the first frame, and nearly the body's own colour a beat from parting. */
const CORE_MIN = 0.3;
const CORE_MAX = 0.9;

export function buds(d: SeamDraw): void {
  const { ctx, angle, phase, rx, ry, rot, dark, hex, rim } = d;
  const r = Math.min(rx, ry);
  const core = r * CORE;
  const apart = r * APART * phase;
  const reach = Math.max(rx, ry) * 1.05;
  // The key in this frame: the lean and the axis taken back out, so the cores
  // are lit from the field's corner and not from one glued to the body.
  const a = -(rot + angle);
  const kx = KEY.x * Math.cos(a) - KEY.y * Math.sin(a);
  const ky = KEY.x * Math.sin(a) + KEY.y * Math.cos(a);
  const strength = CORE_MIN + (CORE_MAX - CORE_MIN) * phase;

  ctx.save();
  ctx.rotate(angle);
  // The cores, along the axis — which after the rotation is x — one each way.
  for (const side of [-1, 1]) {
    const cx = side * apart;
    const lx = cx + kx * LIT_OFFSET * core;
    const ly = ky * LIT_OFFSET * core;
    const ball = ctx.createRadialGradient(lx, ly, 0, cx, 0, core * LIT_REACH);
    ball.addColorStop(0, rgba(rim, strength));
    ball.addColorStop(0.35, rgba(hex, strength * 0.8));
    ball.addColorStop(0.8, rgba(dark, strength * 0.6));
    ball.addColorStop(1, rgba(dark, 0));
    ctx.fillStyle = ball;
    ctx.beginPath();
    ctx.arc(cx, 0, core * LIT_REACH, 0, Math.PI * 2);
    ctx.fill();
  }
  // The seam between them: the shipped furrow, across the axis.
  ctx.globalAlpha = SEAM_MIN + (SEAM_MAX - SEAM_MIN) * phase;
  ctx.strokeStyle = dark;
  ctx.lineCap = "round";
  ctx.lineWidth = r * SEAM_WIDTH * (1 + phase);
  ctx.beginPath();
  ctx.moveTo(0, -reach);
  ctx.lineTo(0, reach);
  ctx.stroke();
  ctx.restore();
}
