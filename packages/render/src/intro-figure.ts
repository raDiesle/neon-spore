import { blobPath, type IntroFigure } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { body, drip, type FigureBox, hull, plate } from "./intro-parts.js";
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
    body(ctx, cx, b.y + b.h * (0.08 + 0.66 * t), b.w * 0.05, f.hex, age, 401 + f.col * 53);
  }
  hull(ctx, b, 0.5, P1_SKIN.tint, age);
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
    const x = b.x + b.w * (0.24 + i * 0.26);
    const r = b.h * 0.085;
    halo(ctx, x, cy, r * 2.2, hex, 0.5);
    const lobe = new Path2D(blobPath(x, cy, r, r * 0.94, 3, 0.06, 0.04, age, 811 + i * 61, 24));
    ctx.fillStyle = mixHex(hex, "#0B0718", 0.7);
    ctx.fill(lobe);
    strokeGlow(ctx, lobe, hex, Math.max(1.2, r * 0.2), 1);
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
  const breath = 1 + 0.05 * Math.sin(age * 1.6);
  halo(ctx, cx, cy, r * 2.6, PALETTE.hull, 0.45);
  const path = new Path2D(
    blobPath(cx, cy, r * breath, r * 0.82 * breath, 5, 0.11, 0.06, age * 0.6, 2207, 48),
  );
  ctx.fillStyle = mixHex(PALETTE.hull, "#0B0718", 0.74);
  ctx.fill(path);
  strokeGlow(ctx, path, PALETTE.hull, Math.max(1.5, r * 0.1), 1);
  // One eye, blinking — and looking about, because a boss that watches the
  // reader is the friendliest a thing this size gets.
  const blink = Math.abs(Math.sin(age * 0.55)) > 0.06 ? 1 : 0.12;
  const look = Math.sin(age * 0.7) * r * 0.1;
  halo(ctx, cx + look, cy, r * 0.9, PALETTE.pod, 0.6);
  ctx.beginPath();
  ctx.ellipse(cx + look, cy, r * 0.36, r * 0.36 * blink, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.pod;
  ctx.fill();
  if (blink > 0.5) {
    ctx.beginPath();
    ctx.ellipse(cx + look - r * 0.12, cy - r * 0.12, r * 0.1, r * 0.08, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.fill();
  }
  // Goo off its underside, so the thing is plainly made of the same stuff.
  for (const [i, at] of [0.38, 0.5, 0.62].entries()) {
    drip(ctx, b.x + b.w * at, cy + r * 0.7, b.h * 0.09, PALETTE.hull, age * 1.2 + i * 1.9);
  }
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
  const head = (age * 1.1) % (n + 2);
  for (let i = 0; i < n; i++) {
    const x = b.x + step * (i + 1);
    const lit = i <= head;
    const h = b.h * (0.11 + 0.035 * ((i * 7) % 4));
    const hex = lit ? PALETTE.hull : PALETTE.grid;
    if (lit) halo(ctx, x, y, h * 1.8, hex, i > head - 1.2 ? 0.7 : 0.3);
    const bar = new Path2D(blobPath(x, y, step * 0.2, h, 3, 0.05, 0.05, age + i, 907 + i * 31, 22));
    ctx.fillStyle = lit ? mixHex(hex, "#0B0718", 0.68) : "rgba(14,10,30,.8)";
    ctx.fill(bar);
    strokeGlow(ctx, bar, hex, Math.max(1, step * 0.06), lit ? 1 : 0.4);
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
  // And what a run is worth keeping, hanging over the lot of it.
  body(ctx, b.x + b.w * 0.5, b.y + b.h * 0.14, b.h * 0.07, PALETTE.pod, age, 613);
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
