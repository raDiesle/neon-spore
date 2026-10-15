import { blisterLeverDepth, blisterLeverHeld, blisterLeverInBand } from "@neon-spore/sim";
import type { BlisterFrame } from "./blister-bodies.js";
import type { Body } from "./creature-body-in.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

const TAU = Math.PI * 2;

/** How much bigger than the clover BELL is drawn (the owner, 15 October 2026: *some bigger*). */
const BELL_SIZE = 1.4;

/**
 * BELL: a brass bell comes up out of the pore mouth down, and the knob is its
 * clapper — a cord runs out of the bell's mouth, down the groove, to wherever
 * the thumb has carried the knob. Held in the band, the bell swings and rings:
 * it tips from side to side and sound rings come off its shoulders. On the
 * partner's screen, where no groove is drawn, the cord alone says how far down
 * the clapper is.
 */
export function drawBellBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r * BELL_SIZE;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const ringing = blisterLeverHeld(b.c) && blisterLeverInBand(b.world, b.c);
  const tip = ringing ? Math.sin(b.time * 9) * 0.14 : 0;
  ctx.save();
  ctx.translate(x, y - r * 1.5);
  ctx.rotate(tip);
  ctx.translate(-x, -(y - r * 1.5));
  const bell = new Path2D();
  bell.moveTo(x - r * 1.45, f.poreY);
  bell.bezierCurveTo(
    x - r * 1.05,
    f.poreY - r * 0.2,
    x - r * 1.05,
    y - r * 0.4,
    x - r * 0.95,
    y - r * 0.9,
  );
  bell.bezierCurveTo(
    x - r * 0.85,
    y - r * 1.6,
    x + r * 0.85,
    y - r * 1.6,
    x + r * 0.95,
    y - r * 0.9,
  );
  bell.bezierCurveTo(
    x + r * 1.05,
    y - r * 0.4,
    x + r * 1.05,
    f.poreY - r * 0.2,
    x + r * 1.45,
    f.poreY,
  );
  bell.closePath();
  const g = ctx.createLinearGradient(x - r * 1.4, 0, x + r * 1.4, 0);
  g.addColorStop(0, PALETTE.podDark);
  g.addColorStop(0.35, PALETTE.pod);
  g.addColorStop(0.5, PALETTE.podRim);
  g.addColorStop(0.7, PALETTE.pod);
  g.addColorStop(1, PALETTE.podDark);
  ctx.fillStyle = g;
  ctx.fill(bell);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.podRim, 0.9);
  ctx.stroke(bell);
  // The loop it hangs by, and a band round its waist.
  ctx.beginPath();
  ctx.arc(x, y - r * 1.48, r * 0.24, Math.PI, 0);
  ctx.lineWidth = r * 0.14;
  ctx.strokeStyle = PALETTE.pod;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - r * 1.0, y - r * 0.55);
  ctx.quadraticCurveTo(x, y - r * 0.35, x + r * 1.0, y - r * 0.55);
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.strokeStyle = rgba(PALETTE.podDark, 0.7);
  ctx.stroke();
  ctx.restore();
  if (ringing) rings(ctx, x, y - r * 0.9, r, b.time);
}

/** The cord from the bell's mouth to the clapper, wherever the thumb put it. */
export function drawBellCord(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r * BELL_SIZE;
  const knob = knobY(b);
  if (knob < f.poreY) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(b.x, f.poreY - r * 0.1);
  ctx.lineTo(b.x, knob);
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.22;
  ctx.strokeStyle = PALETTE.podDark;
  ctx.stroke();
  ctx.lineWidth = r * 0.12;
  ctx.strokeStyle = PALETTE.pod;
  ctx.stroke();
  // The clapper's ball, under the knob, so the partner sees it too.
  ctx.beginPath();
  ctx.arc(b.x, knob, r * 0.42, 0, TAU);
  ctx.fillStyle = PALETTE.pod;
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.strokeStyle = PALETTE.podRim;
  ctx.stroke();
  ctx.restore();
}

/** Two sound rings off each shoulder, going out as they fade. */
function rings(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number): void {
  ctx.save();
  ctx.lineWidth = Math.max(1, r * 0.09);
  for (let k = 0; k < 2; k++) {
    const t = (time * 2.2 + k / 2) % 1;
    ctx.strokeStyle = rgba(PALETTE.podRim, 0.8 * (1 - t));
    for (const side of [-1, 1] as const) {
      ctx.beginPath();
      const a = side === 1 ? 0 : Math.PI;
      ctx.arc(x, y, r * (1.3 + t * 0.7), a - 0.5, a + 0.5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** Where the knob stands on screen, as `blister-lever-help.ts` lays its groove. */
function knobY(b: Body): number {
  const length = (b.world.cfg.blisterLeverMilli * b.l.tile) / 1000;
  return b.y + blisterLeverDepth(b.world, b.c) * length;
}
