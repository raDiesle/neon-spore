import type { Point } from "@neon-spore/content";
import { ghostFront, passed } from "../../../../packages/render/src/goo-beat.js";
import { bodyPath, type GooBody } from "../../../../packages/render/src/goo-body.js";
import type { CallOver, CallPaint } from "../../../../packages/render/src/goo-call.js";
import { entering } from "../../../../packages/render/src/goo-enter.js";
import type { GooStyle } from "../../../../packages/render/src/goo-style.js";

/**
 * **How a CALL look draws** (`index.ts` names them): a halo in the drop's own
 * yellow, rings or sparks round it, and a white flash on the dots' beat.
 */
export interface CallMake {
  /** The halo's reach in drop radii, and how strong it is at the bottom and top of a breath. */
  readonly reach: number;
  readonly low: number;
  readonly high: number;
  /** The rings out of the drop: their colour (`null` the neon), how thick; none when 0. */
  readonly rings: number;
  readonly ringCore: string | null;
  /** A ring of dots round the drop with a light running round it. */
  readonly sparks: boolean;
  /** A white flash under and round the drop as the ghost sets off. */
  readonly flash: boolean;
}

const WHITE = "#FFFFFF";
const CLEAR = "rgba(0,0,0,0)";

/** How bright the white flash is: at once as the ghost sets off, as a dot is lit when
 * the ghost passes it, so the drop is the first light of the dots' run — never while
 * the path is still coming in. */
export function flashOf(time: number, enter: number): number {
  return entering(enter) ? 0 : passed(ghostFront(time), 0);
}

export function callUnder(make: CallMake): CallPaint {
  return (ctx, at, r, style, time, enter) => {
    const breathe = 0.5 + 0.5 * Math.sin(time * 4);
    const flash = make.flash ? flashOf(time, enter) : 0;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    disc(ctx, at, r * 0.7, r * make.reach, style.neon, make.low + (make.high - make.low) * breathe);
    if (flash > 0.01) disc(ctx, at, r * 0.8, r * 2, WHITE, 0.6 * flash);
    ctx.restore();
    ctx.save();
    if (make.rings > 0) rings(ctx, at, r, style, time, make);
    if (make.sparks) sparks(ctx, at, r, style, time, flash);
    ctx.restore();
  };
}

/** Over the drop: its rim lit white by the flash, as a dot is lit when the ghost passes. */
export function callOver(make: CallMake): CallOver {
  return (ctx, body, style, time, enter) => {
    const flash = make.flash ? flashOf(time, enter) : 0;
    if (flash < 0.01) return;
    whiteRim(ctx, body, style, time, flash);
  };
}

function whiteRim(
  ctx: CanvasRenderingContext2D,
  body: GooBody,
  style: GooStyle,
  time: number,
  flash: number,
): void {
  const rim = bodyPath(body, style, time);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = WHITE;
  ctx.globalAlpha = 0.45 * flash;
  ctx.lineWidth = body.r * 0.36;
  ctx.stroke(rim);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.9 * flash;
  ctx.lineWidth = body.r * 0.1;
  ctx.stroke(rim);
  ctx.restore();
}

function disc(
  ctx: CanvasRenderingContext2D,
  at: Point,
  inner: number,
  outer: number,
  colour: string,
  alpha: number,
): void {
  const g = ctx.createRadialGradient(at.x, at.y, inner, at.x, at.y, outer);
  g.addColorStop(0, colour);
  g.addColorStop(1, CLEAR);
  ctx.fillStyle = g;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(at.x, at.y, outer, 0, Math.PI * 2);
  ctx.fill();
}

/** Two rings out of the drop at a time, as the shipped call has them, thicker; a white
 * core inside a neon glow when `ringCore` says so. */
function rings(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  time: number,
  make: CallMake,
): void {
  for (const lag of [0, 0.5]) {
    const u = (time * 0.85 + lag) % 1;
    const p = bodyPath({ at, r: r * (1.12 + 0.9 * u), seed: 29 }, style, time);
    const w = r * make.rings * (1 - u) + 0.4;
    if (make.ringCore) {
      ctx.strokeStyle = style.neon;
      ctx.globalAlpha = 0.5 * (1 - u);
      ctx.lineWidth = w * 2.6;
      ctx.stroke(p);
    }
    ctx.strokeStyle = make.ringCore ?? style.neon;
    ctx.globalAlpha = 1 - u;
    ctx.lineWidth = w;
    ctx.stroke(p);
  }
}

/** Ten dots round the drop in its neon, a white light running round them, and every
 * one of them white with the flash. */
function sparks(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  time: number,
  flash: number,
): void {
  const n = 10;
  const run = (time * 1.6) % 1;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2 + time * 0.4;
    const q = { x: at.x + Math.cos(a) * r * 1.55, y: at.y + Math.sin(a) * r * 1.55 };
    const behind = (run - i / n + 1) % 1;
    const lit = Math.max(flash, 1 - Math.min(1, behind * 4));
    ctx.fillStyle = lit > 0.3 ? WHITE : style.neon;
    ctx.globalAlpha = 0.55 + 0.45 * lit;
    ctx.beginPath();
    ctx.arc(q.x, q.y, r * (0.1 + 0.05 * lit), 0, Math.PI * 2);
    ctx.fill();
  }
}
