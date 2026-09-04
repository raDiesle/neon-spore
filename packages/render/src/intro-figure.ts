import { blobPath, type IntroFigure } from "@neon-spore/content";
import { body, type FigureBox, hull, plate } from "./intro-parts.js";
import { twoScreens, voice } from "./intro-screens.js";
import { PALETTE } from "./palette.js";
import { P1_SKIN } from "./seat-skin.js";

/**
 * THE SIX PICTURES ON THE INTRO'S PAGES.
 *
 * Each one is the page's argument rather than an illustration of it: two
 * screens that plainly differ, a word crossing the gap between them, a column
 * with something coming down it, a panel changing under a thumb. They are
 * drawn out of the game's own parts — the hull's violet, the two seats'
 * tints, a blob with lobes — so the first screen a pair meets looks like the
 * screen they are about to play on.
 *
 * Everything is drawn inside the box the page hands it and scaled off that
 * box's own size, so one figure serves a phone and a desk without a second
 * set of numbers. `age` is seconds the page has been up: the only clock any
 * of this has, and finite by construction (`opening-fx.ts`).
 */

/** The field itself: columns, three creatures on their way down, the hull. */
function columns(ctx: CanvasRenderingContext2D, b: FigureBox, age: number): void {
  const cols = 7;
  for (let i = 0; i <= cols; i++) {
    const x = b.x + (b.w * i) / cols;
    ctx.beginPath();
    ctx.moveTo(x, b.y);
    ctx.lineTo(x, b.y + b.h * 0.82);
    ctx.strokeStyle = i % 2 === 0 ? PALETTE.gridBeat : PALETTE.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  const fall = [
    { col: 1, hex: PALETTE.red, phase: 0 },
    { col: 3, hex: PALETTE.cyan, phase: 0.45 },
    { col: 5, hex: PALETTE.rock, phase: 0.75 },
  ];
  for (const f of fall) {
    const t = (((age * 0.28 + f.phase) % 1) + 1) % 1;
    const cx = b.x + (b.w * (f.col + 0.5)) / cols;
    body(ctx, cx, b.y + b.h * (0.08 + 0.66 * t), b.w * 0.045, f.hex);
  }
  hull(ctx, b, 0.5, P1_SKIN.tint);
}

/** A panel with lobes on it, becoming a different panel. */
function panel(ctx: CanvasRenderingContext2D, b: FigureBox, age: number): void {
  // A slow crossfade rather than a cut: the point is that it changes under a
  // thumb, which a cut would read as two pictures instead of one changing.
  const t = 0.5 + 0.5 * Math.sin(age * 0.9);
  const y = b.y + b.h * 0.3;
  const h = b.h * 0.4;
  plate(ctx, b.x + b.w * 0.08, y, b.w * 0.84, h, PALETTE.hull);
  const cy = y + h / 2;
  ctx.globalAlpha = 1 - t;
  for (const [i, hex] of [PALETTE.hull, PALETTE.red, PALETTE.cyan].entries()) {
    ctx.beginPath();
    ctx.ellipse(b.x + b.w * (0.24 + i * 0.26), cy, b.h * 0.07, b.h * 0.07, 0, 0, Math.PI * 2);
    ctx.fillStyle = hex;
    ctx.fill();
  }
  ctx.globalAlpha = t;
  // What it turns into: two valves and a bar, which is a round's own panel.
  for (const at of [0.26, 0.74]) {
    plate(ctx, b.x + b.w * at - b.w * 0.09, cy - b.h * 0.09, b.w * 0.18, b.h * 0.18, PALETTE.pod);
  }
  ctx.beginPath();
  ctx.rect(b.x + b.w * 0.42, cy - b.h * 0.03, b.w * 0.16, b.h * 0.06);
  ctx.fillStyle = PALETTE.shield;
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** A boss, with a panel of its own under it. */
function boss(ctx: CanvasRenderingContext2D, b: FigureBox, age: number): void {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h * 0.38;
  const r = Math.min(b.w, b.h) * 0.3;
  const breath = 1 + 0.04 * Math.sin(age * 1.6);
  const path = new Path2D(
    blobPath(cx, cy, r * breath, r * 0.82 * breath, 5, 0.09, 0.03, 0, 2207, 48),
  );
  ctx.fillStyle = "rgba(60,26,104,.9)";
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = Math.max(1.5, r * 0.06);
  ctx.stroke(path);
  // One eye, opening and closing: the shape every boss has some version of.
  const open = 0.25 + 0.75 * Math.abs(Math.sin(age * 0.8));
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.34, r * 0.34 * open, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.pod;
  ctx.fill();
  // Its own two controls, which is what makes it a game of its own — and each
  // with a mark on it, because an empty box reads as a box rather than as
  // something a thumb goes to.
  for (const [i, at] of [0.32, 0.68].entries()) {
    const x = b.x + b.w * at;
    const y = b.y + b.h * 0.78;
    plate(ctx, x - b.w * 0.1, y, b.w * 0.2, b.h * 0.14, PALETTE.pod);
    ctx.beginPath();
    ctx.ellipse(x, y + b.h * 0.07, b.w * 0.035, b.w * 0.035, 0, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? PALETTE.pod : PALETTE.shield;
    ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(age * 1.3 + i * 1.7));
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/** Waves marching past, with the run's own count on the last of them. */
function run(ctx: CanvasRenderingContext2D, b: FigureBox, age: number): void {
  const n = 9;
  const y = b.y + b.h * 0.5;
  const step = b.w / (n + 1);
  for (let i = 0; i < n; i++) {
    const x = b.x + step * (i + 1);
    const lit = i <= (age * 1.1) % (n + 2);
    const h = b.h * (0.1 + 0.03 * ((i * 7) % 4));
    ctx.beginPath();
    ctx.rect(x - step * 0.18, y - h, step * 0.36, h * 2);
    ctx.fillStyle = lit ? PALETTE.hull : PALETTE.grid;
    ctx.globalAlpha = lit ? 0.9 : 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // The one that keeps going, past the authored end of the list.
  for (const [i, at] of [0.86, 0.92, 0.98].entries()) {
    ctx.beginPath();
    ctx.ellipse(b.x + b.w * at, y, b.h * 0.018, b.h * 0.018, 0, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.dim;
    ctx.globalAlpha = 0.8 - i * 0.2;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // And what a run is worth keeping: a mark that is not the field's colour.
  const mark = b.y + b.h * 0.16;
  ctx.beginPath();
  ctx.ellipse(b.x + b.w * 0.5, mark, b.h * 0.05, b.h * 0.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.pod;
  ctx.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(age * 2));
  ctx.fill();
  ctx.globalAlpha = 1;
}

const FIGURES: Record<IntroFigure, (c: CanvasRenderingContext2D, b: FigureBox, a: number) => void> =
  { twoScreens, voice, columns, panel, boss, run };

/** One page's picture, inside the box the page gives it. */
export function drawIntroFigure(
  ctx: CanvasRenderingContext2D,
  figure: IntroFigure,
  box: FigureBox,
  age: number,
): void {
  ctx.save();
  FIGURES[figure](ctx, box, age);
  ctx.restore();
}
