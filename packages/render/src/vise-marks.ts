import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { heartLight } from "./heartbeat.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { lightWithin } from "./part-light.js";
import { stepColour } from "./step-colour.js";
import { viseKernel, viseKernelPath, viseRadius, viseSeamPath } from "./vise-shape.js";

/**
 * **THE VISE's marks**: the two things that say what a step asks — the lit
 * seam, which is *pinch this lobe shut*, and the lit kernel, which is *shoot
 * here, in this colour*. Cut from `vise-draw.ts` the day it was written, along
 * the line its second half grew on: the flashes `vise-fx.ts` times are drawn
 * here too. The words over the marks are the cue's, every boss's way
 * (`boss-cue-read-zf.ts`).
 */

/**
 * The lit seam, drawn in the lobe's own frame: the whole run of it glowing
 * white — a pinch is one seat's, but neither colour is its answer — and the
 * crack already spread down it by the share held, in the paler dry white the
 * cracks are drawn in.
 */
export function drawViseLitSeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  seam: number,
  held: number,
  beatPhase: number,
): void {
  const pulse = 0.8 + 0.2 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlow(ctx, viseSeamPath(l, side, seam), PALETTE.hullRim, STROKE.outline, pulse, 0.7);
  if (held <= 0) return;
  ctx.lineWidth = STROKE.outline * 1.4;
  ctx.strokeStyle = rgba(PALETTE.viseCrack, 0.95);
  ctx.stroke(viseSeamPath(l, side, seam, held));
}

/**
 * How the kernel turns in its hollow and what its dull face carries, as a
 * record so a second answer can stand beside it on VERSUS. `turn` is an angle
 * about the kernel's centre at `time` seconds, and 0 draws it with no
 * transform at all; `sheen` is drawn over the dull fill between fire steps,
 * in the turned frame.
 */
export interface ViseKernelIdle {
  turn: (time: number) => number;
  sheen: (
    ctx: CanvasRenderingContext2D,
    l: Layout,
    core: Path2D,
    size: number,
    bare: boolean,
    time: number,
  ) => void;
}

/** How far the kernel rocks each way, in radians — about five degrees. */
const TURN = 0.09;
/** Its rate in radians a second, off the light's 0.5. */
const TURN_RATE = 0.37;
/** The highlight's round the face, in radians a second. */
const SHEEN_RATE = 0.83;
/** The highlight at its brightest, in shadow and bared. */
const SHEEN = { shadow: 0.1, bare: 0.25 };

/**
 * The kernel rocks a few degrees about its own centre on a slow period, never
 * leaving its column, and between fire steps a soft highlight wanders round
 * its face: faint while the lobes are over it, brighter once they stand open
 * off it. The owner's pick on VERSUS `vise:kernel`, 27 September 2026: *a
 * little bit better*. The lit kernel turns too, so a fire step lighting it is
 * not a snap back to square.
 */
export const VISE_KERNEL: ViseKernelIdle = {
  turn: (time) => TURN * Math.sin(time * TURN_RATE),
  sheen: (ctx, l, core, size, bare, time) => {
    const k = viseKernel(l);
    const r = k.r * size;
    const a = time * SHEEN_RATE;
    const x = k.x + Math.cos(a) * r * 0.4;
    const y = k.y + Math.sin(a) * r * 0.5;
    const alpha = bare ? SHEEN.bare : SHEEN.shadow;
    ctx.save();
    ctx.clip(core);
    // Three rings, widest faintest, so the spot is soft rather than a sticker.
    for (const [w, strength] of [
      [0.5, 0.3],
      [0.32, 0.5],
      [0.16, 0.8],
    ] as const) {
      const spot = new Path2D();
      spot.arc(x, y, Math.max(0.5, r * w), 0, Math.PI * 2);
      ctx.fillStyle = rgba(PALETTE.hullRim, alpha * strength);
      ctx.fill(spot);
    }
    ctx.restore();
  },
};

/**
 * The kernel in its hollow: dull brown between fire steps, in shadow while
 * the lobes are over it and catching the light once they stand open off it;
 * lit in the step's colour while one is owed, brighter for every hit it has taken, with a ring
 * round it closing as the step's beats run out. Turned by `VISE_KERNEL`.
 */
export function drawViseKernel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  size: number,
  bright: number,
  bare: boolean,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
  time: number,
): void {
  const turn = VISE_KERNEL.turn(time);
  if (turn === 0) {
    paintKernel(ctx, l, size, bright, bare, lit, beatPhase, time);
    return;
  }
  const k = viseKernel(l);
  ctx.save();
  ctx.translate(k.x, k.y);
  ctx.rotate(turn);
  ctx.translate(-k.x, -k.y);
  paintKernel(ctx, l, size, bright, bare, lit, beatPhase, time);
  ctx.restore();
}

function paintKernel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  size: number,
  bright: number,
  bare: boolean,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
  time: number,
): void {
  const core = viseKernelPath(l, size);
  ctx.fillStyle = rgba(PALETTE.viseCase, bare ? 0.75 : 0.35);
  ctx.fill(core);
  VISE_KERNEL.sheen(ctx, l, core, size, bare, time);
  if (lit !== null) {
    // Lit from inside, beating like a heart, and nothing past its edge (`part-light.ts`).
    const { body } = stepColour(lit.color);
    const k = viseKernel(l);
    const light = heartLight(beatPhase) * (0.6 + 0.4 * bright);
    lightWithin(ctx, core, body, light, { x: k.x, y: k.y, r: k.r * size });
    const ring = new Path2D();
    ring.arc(k.x, k.y, k.r * 1.45, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(body, 0.75);
    ctx.stroke(ring);
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.viseCaseDark, 0.9);
  ctx.stroke(core);
}

/**
 * A kernel hit's flash — white over the hollow, a thin flare the first time
 * and the whole hollow by the third — and the split's, over the whole case.
 * Laid in the case's own frame, over the lobes.
 */
export function drawViseFlash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  flash: { now: number; hits: number },
  split: number,
): void {
  if (flash.now > 0 && flash.hits > 0) {
    const hits = Math.min(3, flash.hits);
    const k = viseKernel(l);
    const r = k.r * (0.4 + 0.45 * hits) * (1.4 - 0.4 * flash.now);
    const p = new Path2D();
    p.arc(k.x, k.y, Math.max(0.5, r), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hullRim, flash.now * (0.35 + 0.2 * hits));
    ctx.fill(p);
    strokeGlow(ctx, p, PALETTE.hullRim, STROKE.inner, flash.now * (0.6 + 0.4 * hits));
  }
  if (split > 0) {
    const { rx, ry } = viseRadius(l);
    const p = new Path2D();
    p.ellipse(0, 0, rx * (1.1 - 0.3 * split), ry * (1.1 - 0.3 * split), 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.viseCrack, 0.5 * split);
    ctx.fill(p);
  }
}
