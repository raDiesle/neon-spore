import { body, type FigureBox, hull, plate } from "./intro-parts.js";
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
  const w = b.w * 0.34;
  const h = b.h * 0.82;
  const y = b.y + (b.h - h) / 2;
  const lift = Math.sin(age * 1.4) * b.h * 0.02;
  const left = { x: b.x + b.w * 0.06, y: y - lift };
  const right = { x: b.x + b.w * 0.6, y: y + lift };

  plate(ctx, left.x, left.y, w, h, P1_SKIN.tint);
  // Player 1's screen: a column, and something coming down it.
  for (const at of [0.3, 0.5, 0.7]) {
    ctx.beginPath();
    ctx.moveTo(left.x + w * at, left.y + h * 0.12);
    ctx.lineTo(left.x + w * at, left.y + h * 0.78);
    ctx.strokeStyle = PALETTE.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  body(
    ctx,
    left.x + w * 0.5,
    left.y + h * (0.22 + 0.34 * (0.5 + 0.5 * Math.sin(age))),
    w * 0.11,
    PALETTE.red,
  );
  hull(
    ctx,
    { x: left.x + w * 0.1, y: left.y + h * 0.2, w: w * 0.8, h: h * 0.7 },
    0.5,
    P1_SKIN.tint,
  );

  plate(ctx, right.x, right.y, w, h, P2_SKIN.tint);
  // Player 2's screen: the two colours, which player 1 never holds.
  for (const [i, hex] of [PALETTE.red, PALETTE.cyan].entries()) {
    ctx.beginPath();
    ctx.ellipse(
      right.x + w * (0.34 + i * 0.32),
      right.y + h * 0.6,
      w * 0.11,
      w * 0.11,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = hex;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  hull(
    ctx,
    { x: right.x + w * 0.1, y: right.y + h * 0.05, w: w * 0.8, h: h * 0.6 },
    0.6,
    P2_SKIN.tint,
  );
}

/** The same two screens, with a word crossing the gap. */
export function voice(ctx: CanvasRenderingContext2D, b: FigureBox, age: number): void {
  const w = b.w * 0.26;
  const h = b.h * 0.62;
  const y = b.y + b.h * 0.2;
  plate(ctx, b.x + b.w * 0.04, y, w, h, P1_SKIN.tint);
  plate(ctx, b.x + b.w * 0.7, y, w, h, P2_SKIN.tint);
  // What one of them can see and the other cannot: a colour, on the left only.
  ctx.beginPath();
  ctx.ellipse(b.x + b.w * 0.04 + w / 2, y + h * 0.45, w * 0.2, w * 0.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.cyan;
  ctx.fill();
  // The word, travelling. Four beads on one line, the front one brightest.
  const from = b.x + b.w * 0.34;
  const to = b.x + b.w * 0.68;
  for (let i = 0; i < 4; i++) {
    const t = (((age * 0.55 + i * 0.18) % 1) + 1) % 1;
    const x = from + (to - from) * t;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y + h * 0.45 - Math.sin(t * Math.PI) * b.h * 0.08,
      b.h * 0.022,
      b.h * 0.022,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = PALETTE.text;
    ctx.globalAlpha = 0.25 + 0.6 * Math.sin(t * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
