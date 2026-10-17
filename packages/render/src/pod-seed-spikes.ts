import { faded } from "./pod-fade.js";
import { type Seed, tipOf, type V } from "./pod-seed.js";
import type { SeedPaint } from "./pod-seed-paint.js";

/**
 * **The seed's spikes** — what a pod drawn on the seed (`pod-seed.ts`) may
 * change and still be the pod, with `pod-seed-skins.ts` for its surface. The
 * owner asked on 16 October 2026 for different kinds of spikes and surfaces
 * on the seed's variants; the sphere, its seven directions, its tumble and
 * its seam stay the same in every one, so a player who has learned one knows
 * the others. `stud` is SMART's, `cap` BLINK's, `crystal` GLINT's, `thorn`
 * HOP's and `cone` ORBIT's (`pod-forms.ts`).
 *
 * **Every kind is batched by side.** A pod on the field is in the frame's op
 * budget (`wave-budget.test.ts`) and THE BULB QUEEN hangs several, so the
 * spikes on one side of the sphere are one or two paths filled or stroked
 * once each, and the side's depth is one alpha rather than seven.
 */

export type SpikeKind = "stud" | "cone" | "cap" | "crystal" | "thorn";

/** A spike on the screen: where it leaves the body, where it ends, and which way. */
interface Spike {
  d: V;
  bx: number;
  by: number;
  tx: number;
  ty: number;
  /** Its direction on the screen, and its length. */
  ux: number;
  uy: number;
  len: number;
}

function spikeOf(s: Seed, d: V, out: number): Spike {
  const bx = s.x + d.x * s.R * 0.85;
  const by = s.y + d.y * s.R * 0.85;
  const t = tipOf(s, d);
  const tx = bx + (t.x - bx) * out;
  const ty = by + (t.y - by) * out;
  const len = Math.hypot(tx - bx, ty - by) || 1;
  return { d, bx, by, tx, ty, ux: (tx - bx) / len, uy: (ty - by) / len, len };
}

/** Every spike on one side of the sphere — `back` for those turned away. */
export function drawSpikes(
  ctx: CanvasRenderingContext2D,
  s: Seed,
  back: boolean,
  flash: number,
  kind: SpikeKind,
  paint: SeedPaint,
) {
  // A pointed spike stands further out than a stud, or it reads as a nub;
  // a cap's disc sits a quarter short of the tip.
  const out = kind === "stud" ? 1 : kind === "cap" ? 0.75 : 1.35;
  const mine = s.studs.filter((d) => d.z < 0 === back).map((d) => spikeOf(s, d, out));
  const hot = flash > 0.5 ? paint.flashTip : paint.tip;
  ctx.globalAlpha = faded(back ? 0.4 : 0.95);
  if (kind === "stud" || kind === "cap") {
    ctx.strokeStyle = paint.spike;
    ctx.lineWidth = s.R * (kind === "cap" ? 0.14 : 0.2);
    ctx.beginPath();
    for (const k of mine) {
      ctx.moveTo(k.bx, k.by);
      ctx.lineTo(k.tx, k.ty);
    }
    ctx.stroke();
    ctx.fillStyle = hot;
    ctx.beginPath();
    for (const k of mine) {
      if (kind === "stud") {
        ctx.moveTo(k.tx + s.R * 0.12, k.ty);
        ctx.arc(k.tx, k.ty, s.R * 0.12, 0, Math.PI * 2);
      } else {
        // A round cap facing out along `d`: a disc seen at its own slant.
        const a = s.R * 0.3;
        const minor = Math.max(a * 0.3, a * Math.abs(k.d.z));
        const ang = Math.atan2(k.uy, k.ux);
        ctx.moveTo(k.tx + k.ux * minor, k.ty + k.uy * minor);
        ctx.ellipse(k.tx, k.ty, minor, a, ang, 0, Math.PI * 2);
      }
    }
    ctx.fill();
    return;
  }
  if (kind === "thorn") {
    // Curled the same way round on every spike, so the tumble reads as a pinwheel.
    const w = s.R * 0.2;
    ctx.fillStyle = paint.spike;
    ctx.beginPath();
    for (const k of mine) {
      const mx = (k.bx + k.tx) / 2 - k.uy * k.len * 0.45;
      const my = (k.by + k.ty) / 2 + k.ux * k.len * 0.45;
      ctx.moveTo(k.bx - k.uy * w, k.by + k.ux * w);
      ctx.quadraticCurveTo(mx, my, k.tx, k.ty);
      ctx.quadraticCurveTo(
        mx - k.uy * w * 1.6,
        my + k.ux * w * 1.6,
        k.bx + k.uy * w,
        k.by - k.ux * w,
      );
      ctx.closePath();
    }
    ctx.fill();
    ctx.fillStyle = hot;
    ctx.beginPath();
    for (const k of mine) {
      ctx.moveTo(k.tx + s.R * 0.1, k.ty);
      ctx.arc(k.tx, k.ty, s.R * 0.1, 0, Math.PI * 2);
    }
    ctx.fill();
    return;
  }
  // A cone or a crystal: a shape across the spike, filled in two lit halves.
  const w = s.R * (kind === "cone" ? 0.34 : 0.28);
  const mid = kind === "cone" ? 0 : 0.45;
  const halves: [number, string][] = [
    [1, kind === "crystal" ? hot : paint.spike],
    [-1, kind === "crystal" ? paint.spike : paint.spikeDark],
  ];
  for (const [side, fill] of halves) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    for (const k of mine) {
      const wx = k.bx + (k.tx - k.bx) * mid;
      const wy = k.by + (k.ty - k.by) * mid;
      ctx.moveTo(k.bx, k.by);
      ctx.lineTo(wx - k.uy * w * side, wy + k.ux * w * side);
      ctx.lineTo(k.tx, k.ty);
      ctx.closePath();
    }
    ctx.fill();
  }
}
