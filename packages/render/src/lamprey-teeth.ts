import { LAMPREY_TEETH, type LampreyState, lampreyBiting, lampreyToothIn } from "@neon-spore/sim";
import { strokeGlowFaded } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { drawLampreyGums } from "./lamprey-disc.js";
import { drawFang, type Fang } from "./lamprey-fang.js";
import { type LampreyPose, lampreySocket, type Point } from "./lamprey-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The ring of teeth round THE LAMPREY's sucker**: nine hooked bone fangs
 * standing in their gums, the lit one bright and glowing, a socket where one
 * is out — and inside them a second row of small dim rasps, the throat's,
 * never lit and never knocked out, so the nine are still what counts its
 * health by eye.
 */

/** Where a ring fang's root and tip stand, in mouth radii from the middle. */
const ROOT = 0.92;
const TIP = 0.46;
/** A ring fang's root, as a share of the gap between two, and how far its tip hooks. */
const WIDE = 0.46;
const HOOK = 0.16;
/** The inner row: where its roots and tips stand, how wide its rasps are, in radii. */
const RASP_ROOT = 0.42;
const RASP_TIP = 0.28;
const RASP_HALF = 0.045;

/** A unit vector along `(x, y)`. */
function unit(x: number, y: number): Point {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

/** A fang on the ring at `angle`, from `root` radii in to `tip`, its root `half` wide. */
export function ringFang(
  p: LampreyPose,
  angle: number,
  root: number,
  tip: number,
  half: number,
  hook: number,
): Fang {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle) * p.tilt;
  const from = { x: p.x + p.r * root * cos, y: p.y + p.r * root * sin };
  const to = { x: p.x + p.r * tip * cos, y: p.y + p.r * tip * sin };
  const dir = unit(to.x - from.x, to.y - from.y);
  return {
    root: from,
    dir,
    side: { x: -dir.y, y: dir.x },
    len: Math.hypot(to.x - from.x, to.y - from.y),
    half,
    hook,
  };
}

/** Tooth `t`'s fang on the ring, the first at the top. */
export function lampreyFang(p: LampreyPose, t: number): Fang {
  const gap = (Math.PI * 2) / LAMPREY_TEETH;
  const half = p.r * ROOT * gap * WIDE * 0.5;
  return ringFang(p, -Math.PI / 2 + t * gap, ROOT, TIP, half, HOOK);
}

const DULL = mixHex(PALETTE.lampreyTooth, PALETTE.lampreyHide, 0.3);
const RASP = mixHex(PALETTE.lampreyTooth, PALETTE.lampreyThroat, 0.55);

/** The ring: the rasps, the gums, every fang still in or its socket. */
export function drawLampreyTeeth(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  s: LampreyState,
): void {
  const gap = (Math.PI * 2) / LAMPREY_TEETH;
  for (let t = 0; t < LAMPREY_TEETH; t++) {
    const a = -Math.PI / 2 + (t + 0.5) * gap;
    drawFang(ctx, ringFang(p, a, RASP_ROOT, RASP_TIP, p.r * RASP_HALF, 0.2), RASP, false);
  }
  const lit = lampreyBiting(s) ? s.litTooth : -1;
  drawLampreyGums(ctx, p, (t) => lampreyToothIn(s, t));
  for (let t = 0; t < LAMPREY_TEETH; t++) {
    if (!lampreyToothIn(s, t)) {
      const socket = lampreySocket(p, t);
      ctx.fillStyle = PALETTE.lampreyMouth;
      ctx.fill(socket);
      ctx.lineWidth = STROKE.inner;
      ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.9);
      ctx.stroke(socket);
      continue;
    }
    const tooth = drawFang(ctx, lampreyFang(p, t), t === lit ? PALETTE.lampreyTooth : DULL);
    if (t === lit) strokeGlowFaded(ctx, tooth, PALETTE.lampreyTooth, STROKE.inner, 1, 1);
  }
}
