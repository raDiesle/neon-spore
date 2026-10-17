import { PALETTE } from "./palette.js";
import { type Seed, tipOf, type V } from "./pod-seed.js";

/**
 * **The seed's spikes** — what a pod drawn on the seed (`pod-seed.ts`) may
 * change and still be the pod, with `pod-seed-skins.ts` for its surface. The
 * owner asked on 16 October 2026 for different kinds of spikes and surfaces
 * on the seed's variants; the sphere, its seven directions, its tumble and
 * its seam stay the same in every one, so a player who has learned one knows
 * the others. `stud` is SMART's own; the real pod wears `cap`.
 */

export type SpikeKind = "stud" | "cone" | "cap" | "crystal" | "thorn";

const DEEP = "#7A4C0C";

/** One spike along `d`, dimmer round the back. */
export function drawSpike(
  ctx: CanvasRenderingContext2D,
  s: Seed,
  d: V,
  flash: number,
  kind: SpikeKind,
) {
  const near = (d.z + 1) / 2;
  const bx = s.x + d.x * s.R * 0.85;
  const by = s.y + d.y * s.R * 0.85;
  const t0 = tipOf(s, d);
  // A pointed spike stands further out than a stud, or it reads as a nub.
  const out = kind === "stud" || kind === "cap" ? 1 : 1.35;
  const tip = { x: bx + (t0.x - bx) * out, y: by + (t0.y - by) * out };
  // The spike's direction on the screen, and across it.
  const len = Math.hypot(tip.x - bx, tip.y - by) || 1;
  const ux = (tip.x - bx) / len;
  const uy = (tip.y - by) / len;
  const hot = flash > 0.5 ? "#FFFFFF" : PALETTE.podRim;
  ctx.globalAlpha = 0.25 + 0.75 * near;
  ctx.fillStyle = PALETTE.pod;
  ctx.strokeStyle = PALETTE.pod;
  if (kind === "stud" || kind === "cap") {
    const end = kind === "cap" ? 0.75 : 1;
    ctx.lineWidth = s.R * (kind === "cap" ? 0.14 : 0.2);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + (tip.x - bx) * end, by + (tip.y - by) * end);
    ctx.stroke();
    ctx.fillStyle = hot;
    ctx.beginPath();
    if (kind === "stud") ctx.arc(tip.x, tip.y, s.R * 0.12, 0, Math.PI * 2);
    else {
      // A round cap facing out along `d`: a disc seen at its own slant.
      const a = s.R * 0.3;
      const cx = bx + (tip.x - bx) * end;
      const cy = by + (tip.y - by) * end;
      ctx.ellipse(
        cx,
        cy,
        Math.max(a * 0.3, a * Math.abs(d.z)),
        a,
        Math.atan2(uy, ux),
        0,
        Math.PI * 2,
      );
    }
    ctx.fill();
    return;
  }
  if (kind === "thorn") {
    // Curled the same way round on every spike, so the tumble reads as a pinwheel.
    const w = s.R * 0.2;
    const mx = (bx + tip.x) / 2 - uy * len * 0.45;
    const my = (by + tip.y) / 2 + ux * len * 0.45;
    ctx.beginPath();
    ctx.moveTo(bx - uy * w, by + ux * w);
    ctx.quadraticCurveTo(mx, my, tip.x, tip.y);
    ctx.quadraticCurveTo(mx - uy * w * 1.6, my + ux * w * 1.6, bx + uy * w, by - ux * w);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = hot;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, s.R * 0.1, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  // A cone or a crystal: a shape across the spike, filled in two lit halves.
  const w = s.R * (kind === "cone" ? 0.34 : 0.28);
  const mid = kind === "cone" ? 0 : 0.45;
  const wx = bx + (tip.x - bx) * mid;
  const wy = by + (tip.y - by) * mid;
  const sides: [number, string][] = [
    [1, kind === "crystal" ? hot : PALETTE.pod],
    [-1, kind === "crystal" ? PALETTE.pod : DEEP],
  ];
  for (const [side, fill] of sides) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(wx - uy * w * side, wy + ux * w * side);
    ctx.lineTo(tip.x, tip.y);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Every spike on one side of the sphere — `back` for those turned away. A
 * stud or a cap is batched, one stroke for the stalks and one fill for the
 * tips a side, because a pod on the field is in the frame's op budget
 * (`wave-budget.test.ts`) and THE BULB QUEEN hangs several at once; the
 * side's depth is one alpha rather than seven.
 */
export function drawSpikes(
  ctx: CanvasRenderingContext2D,
  s: Seed,
  back: boolean,
  flash: number,
  kind: SpikeKind,
) {
  const mine = s.studs.filter((d) => d.z < 0 === back);
  if (kind !== "stud" && kind !== "cap") {
    for (const d of mine) drawSpike(ctx, s, d, flash, kind);
    return;
  }
  const end = kind === "cap" ? 0.75 : 1;
  ctx.globalAlpha = back ? 0.4 : 0.95;
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = s.R * (kind === "cap" ? 0.14 : 0.2);
  ctx.beginPath();
  const tips = mine.map((d) => {
    const bx = s.x + d.x * s.R * 0.85;
    const by = s.y + d.y * s.R * 0.85;
    const t = tipOf(s, d);
    const x = bx + (t.x - bx) * end;
    const y = by + (t.y - by) * end;
    ctx.moveTo(bx, by);
    ctx.lineTo(x, y);
    return { x, y, d, ang: Math.atan2(t.y - by, t.x - bx) };
  });
  ctx.stroke();
  ctx.fillStyle = flash > 0.5 ? "#FFFFFF" : PALETTE.podRim;
  ctx.beginPath();
  for (const { x, y, d, ang } of tips) {
    if (kind === "stud") {
      ctx.moveTo(x + s.R * 0.12, y);
      ctx.arc(x, y, s.R * 0.12, 0, Math.PI * 2);
    } else {
      // A round cap facing out along `d`: a disc seen at its own slant.
      const a = s.R * 0.3;
      const minor = Math.max(a * 0.3, a * Math.abs(d.z));
      ctx.moveTo(x + Math.cos(ang) * minor, y + Math.sin(ang) * minor);
      ctx.ellipse(x, y, minor, a, ang, 0, Math.PI * 2);
    }
  }
  ctx.fill();
}
