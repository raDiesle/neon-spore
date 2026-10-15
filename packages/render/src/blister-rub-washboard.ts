import { blisterRubbing } from "@neon-spore/sim";
import type { BlisterFrame } from "./blister-bodies.js";
import type { Body } from "./creature-body-in.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

const TAU = Math.PI * 2;

/** Ridges across the board's face, top to bottom. */
const RIDGES = 7;

/**
 * WASHBOARD, one of RUB's three bodies (`blister-rub.ts`): a washboard stands up out of the pore — a square-shouldered frame
 * with a ridged face, the rub's drop in the middle of it to be scrubbed; under
 * a thumb, suds bubble off its sides. One blow and it is gone, so no ridge is
 * ever lit (until 15 October 2026 a blow lit a third of them, `blister.ts`).
 */
export function drawWashboardBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const top = y - r * 1.55;
  const bottom = f.poreY + r * 0.3;
  const w = r * 1.2;
  ctx.save();
  // The frame: two posts and a crossbar, rounded at the shoulders.
  const frame = new Path2D();
  frame.roundRect(
    x - w - r * 0.2,
    top - r * 0.25,
    (w + r * 0.2) * 2,
    bottom - top + r * 0.25,
    r * 0.35,
  );
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill(frame);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.pod, 0.9);
  ctx.stroke(frame);
  const face = new Path2D();
  face.rect(x - w, top + r * 0.25, w * 2, bottom - top);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(face);
  ctx.save();
  ctx.clip(face);
  ctx.lineCap = "round";
  for (let i = 0; i < RIDGES; i++) {
    const ry = top + r * 0.45 + ((bottom - top - r * 0.2) * i) / (RIDGES - 1);
    ctx.beginPath();
    ctx.moveTo(x - w, ry);
    ctx.lineTo(x + w, ry);
    ctx.lineWidth = r * 0.16;
    ctx.strokeStyle = PALETTE.rock;
    ctx.stroke();
    ctx.lineWidth = r * 0.05;
    ctx.strokeStyle = rgba(PALETTE.text, 0.6);
    ctx.stroke();
  }
  ctx.restore();
  if (blisterRubbing(b.c)) suds(ctx, x, y, w, r, b.time);
  ctx.restore();
}

/** Bubbles rising off either side of the board while it is scrubbed. */
function suds(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  r: number,
  time: number,
): void {
  ctx.lineWidth = Math.max(1, r * 0.06);
  for (let i = 0; i < 6; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const t = (time * 1.6 + i / 6) % 1;
    const bx = x + side * (w + r * 0.35 + Math.sin(t * 6 + i) * r * 0.12);
    const by = y + r * 0.3 - t * r * 1.6;
    ctx.beginPath();
    ctx.arc(bx, by, r * (0.12 + 0.08 * (i % 3)), 0, TAU);
    ctx.fillStyle = rgba(PALETTE.text, 0.25 * (1 - t));
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.text, 0.85 * (1 - t));
    ctx.stroke();
  }
}
