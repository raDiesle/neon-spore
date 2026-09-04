import { blobPath } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { body, drip, type FigureBox, hull, plate } from "./intro-parts.js";
import { PALETTE } from "./palette.js";
import { P1_SKIN, P2_SKIN } from "./seat-skin.js";

/**
 * The two pictures that are about the *pair* rather than about the field: two
 * screens carrying different things, and a word crossing the gap between them.
 *
 * Their own file beside `intro-figure.ts`, which was over the 250-line limit
 * with all six in it, and this is the seam that was already there: these two
 * draw phones and the other four draw the game. They are also the two the
 * whole pitch rests on — everything else the intro says is a consequence of
 * the pair being given different things to look at.
 */

/** Two screens, side by side, carrying different things. */
export function twoScreens(ctx: CanvasRenderingContext2D, b: FigureBox, age: number): void {
  const w = b.w * 0.36;
  const h = b.h * 0.86;
  const y = b.y + (b.h - h) / 2;
  // They breathe against each other rather than together, so the pair reads as
  // two people rather than as one picture cut down the middle.
  const lift = Math.sin(age * 1.3) * b.h * 0.03;
  const left = { x: b.x + b.w * 0.04, y: y - lift };
  const right = { x: b.x + b.w * 0.6, y: y + lift };

  plate(ctx, left.x, left.y, w, h, P1_SKIN.tint);
  for (const at of [0.3, 0.5, 0.7]) {
    ctx.beginPath();
    ctx.moveTo(left.x + w * at, left.y + h * 0.14);
    ctx.lineTo(left.x + w * at, left.y + h * 0.74);
    ctx.strokeStyle = PALETTE.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  const fall = 0.5 + 0.5 * Math.sin(age * 0.9);
  body(ctx, left.x + w * 0.5, left.y + h * (0.24 + 0.3 * fall), w * 0.13, PALETTE.red, age);
  hull(
    ctx,
    { x: left.x + w * 0.1, y: left.y + h * 0.2, w: w * 0.8, h: h * 0.7 },
    0.5,
    P1_SKIN.tint,
    age,
  );

  plate(ctx, right.x, right.y, w, h, P2_SKIN.tint);
  // The other seat holds the two colours, which the first one never sees.
  for (const [i, hex] of [PALETTE.red, PALETTE.cyan].entries()) {
    const cx = right.x + w * (0.32 + i * 0.36);
    const cy = right.y + h * 0.56;
    const r = w * 0.14 * (1 + 0.08 * Math.sin(age * 2 + i * 2.1));
    halo(ctx, cx, cy, r * 2.4, hex, 0.55);
    const lobe = new Path2D(blobPath(cx, cy, r, r * 0.92, 3, 0.07, 0.04, age, 1109 + i * 97, 26));
    ctx.fillStyle = mixHex(hex, "#0B0718", 0.7);
    ctx.fill(lobe);
    strokeGlow(ctx, lobe, hex, Math.max(1.2, r * 0.2), 1);
  }
  hull(
    ctx,
    { x: right.x + w * 0.1, y: right.y + h * 0.02, w: w * 0.8, h: h * 0.6 },
    0.62,
    P2_SKIN.tint,
    age,
  );
  // A run of goo off the bottom of each, because a phone in this game is a
  // thing in the same world as the slime on it.
  drip(ctx, left.x + w * 0.5, left.y + h, b.h * 0.1, P1_SKIN.tint, age * 1.1);
  drip(ctx, right.x + w * 0.5, right.y + h, b.h * 0.1, P2_SKIN.tint, age * 1.3 + 2);
}

/** The same two screens, with a word crossing the gap. */
export function voice(ctx: CanvasRenderingContext2D, b: FigureBox, age: number): void {
  const w = b.w * 0.28;
  const h = b.h * 0.66;
  const y = b.y + b.h * 0.18;
  const leftX = b.x + b.w * 0.03;
  const rightX = b.x + b.w * 0.69;
  plate(ctx, leftX, y, w, h, P1_SKIN.tint);
  plate(ctx, rightX, y, w, h, P2_SKIN.tint);

  // What one of them can see and the other cannot.
  body(ctx, leftX + w / 2, y + h * 0.45, w * 0.24, PALETTE.cyan, age, 733);
  // And what the other one is holding: two colours, one of them wrong.
  for (const [i, hex] of [PALETTE.red, PALETTE.cyan].entries()) {
    const cx = rightX + w * (0.3 + i * 0.4);
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.45, w * 0.11, w * 0.11, 0, 0, Math.PI * 2);
    ctx.fillStyle = hex;
    ctx.globalAlpha = 0.35 + 0.45 * Math.abs(Math.sin(age * 1.7 + i * 2.4));
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // The word, travelling: beads of the same slime everything else is made of.
  const from = leftX + w * 1.06;
  const to = rightX - w * 0.06;
  for (let i = 0; i < 5; i++) {
    const t = (((age * 0.5 + i * 0.16) % 1) + 1) % 1;
    const x = from + (to - from) * t;
    const r = b.h * 0.026 * (0.5 + Math.sin(t * Math.PI));
    if (r <= 0.4) continue;
    halo(ctx, x, y + h * 0.45 - Math.sin(t * Math.PI) * b.h * 0.1, r * 3, PALETTE.text, 0.35);
    ctx.beginPath();
    ctx.ellipse(
      x,
      y + h * 0.45 - Math.sin(t * Math.PI) * b.h * 0.1,
      r,
      r * 0.86,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = PALETTE.text;
    ctx.globalAlpha = 0.35 + 0.55 * Math.sin(t * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
