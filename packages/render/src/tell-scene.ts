import { TELL_REVEAL_BEATS, type TellState, type TellThrow, tellThrowAt } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { tellBody } from "./tell-body.js";
import { drawThrowGlyph } from "./tell-ring.js";

/**
 * The reveal: nine little scenes, one per ordered pair of throws, and not one
 * of them needs a noun the game does not already have.
 *
 * **The pair learns the ring by having it done to them.** A win and the
 * matching loss are the same scene with the ship and the boss swapped — the
 * bolt goes down somebody's throat, the plate peels off somebody's skin —
 * which means every exchange teaches the same arrow whichever way it went. A
 * round that only animated the wins would teach half a table.
 *
 * **The two glyphs come from `tell-ring.ts`**, so what is drawn in the middle
 * of the field at the reveal is the same drawing as the node it left. A second
 * set of shapes for the scene would be a second vocabulary learnt for three
 * beats.
 *
 * `outcome` is the simulation's, never re-derived here (`tellResolve`): a
 * picture that worked out the winner for itself is a second copy of the ring,
 * and the two would disagree the first time a bolt came out the wrong colour.
 */

/** Where the two throws meet, and how big they are drawn. */
function stage(l: Layout): { y: number; gap: number; r: number } {
  const body = tellBody(l);
  return {
    y: body.cy + body.r * 1.5,
    gap: Math.min(l.width * 0.22, l.playHeight * 0.14),
    r: Math.min(l.width * 0.1, l.playHeight * 0.07),
  };
}

/** 0..1 through the reveal, so every scene is written against one clock. */
function progress(view: ViewState, boss: TellState): number {
  const since = view.world.beat - boss.phaseBeat + view.beatPhase;
  return Math.max(0, Math.min(1, since / TELL_REVEAL_BEATS));
}

/**
 * The scene, once the window has run out.
 *
 * The boss's throw comes in from the left and the ship's from the right, they
 * meet in the middle, and what happens there is the arrow between them.
 */
export function drawTellScene(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: TellState,
): void {
  if (boss.phase !== "reveal" && boss.phase !== "verdict") return;
  const theirs = tellThrowAt(boss.bossThrow);
  if (theirs === null) return;
  const ours = tellThrowAt(boss.thrown);
  const { y, gap, r } = stage(l);
  const t = progress(view, boss);
  // They close over the first third and then the scene happens.
  const close = Math.min(1, t * 3);
  const after = Math.max(0, (t - 0.33) / 0.67);
  const mid = l.width / 2;

  if (ours === null) {
    // Nothing was thrown — a fumble, or a window nobody answered. The boss's
    // throw crosses the whole way and there is nothing to meet it, which is
    // the most legible thing this picture can say about the rule.
    drawSide(ctx, theirs, mid - gap + close * gap * 1.6, y, r, PALETTE.red, 1);
    return;
  }
  const win = boss.outcome === 1;
  const tie = boss.outcome === 2;
  const theirX = mid - gap * (1 - close * 0.75);
  const ourX = mid + gap * (1 - close * 0.75);

  if (tie) {
    // The bonk: they meet, bounce back, and wobble. Nothing is spent, which is
    // exactly what the rung did.
    const bounce = Math.sin(after * Math.PI * 3) * gap * 0.18 * (1 - after);
    drawSide(ctx, theirs, theirX - bounce, y, r, PALETTE.dim, 1);
    drawSide(ctx, ours, ourX + bounce, y, r, PALETTE.dim, 1);
    return;
  }

  const winner = win ? ours : theirs;
  const loser = win ? theirs : ours;
  const winX = win ? ourX : theirX;
  const loseX = win ? theirX : ourX;
  drawLoss(ctx, winner, loser, winX, loseX, y, r, after, win);
}

/**
 * What being beaten looks like, per arrow. Three scenes, and the loser's
 * behaviour is the whole of the joke.
 */
function drawLoss(
  ctx: CanvasRenderingContext2D,
  winner: TellThrow,
  loser: TellThrow,
  winX: number,
  loseX: number,
  y: number,
  r: number,
  after: number,
  ours: boolean,
): void {
  const good = ours ? PALETTE.good : PALETTE.red;
  const bad = ours ? PALETTE.red : PALETTE.good;
  if (winner === "bolt") {
    // A bolt down an open mouth: the mouth swells like a balloon, holds, and
    // vents sparks out of every notch at once.
    const swell = 1 + Math.min(1, after * 2) * 0.8;
    const burst = Math.max(0, (after - 0.6) / 0.4);
    drawSide(ctx, winner, winX - (winX - loseX) * Math.min(1, after * 2) * 0.8, y, r, good, 1);
    if (burst < 1) drawSide(ctx, loser, loseX, y, r * swell, bad, 1 - burst);
    sparks(ctx, loseX, y, r * swell, burst, bad);
    return;
  }
  if (winner === "plate") {
    // A bolt burst on a plate that snapped up: the plate rings, the bolt goes.
    const ring = 1 + Math.sin(Math.min(1, after * 3) * Math.PI) * 0.18;
    drawSide(ctx, winner, winX, y, r * ring, good, 1);
    const gone = Math.min(1, after * 2);
    if (gone < 1) drawSide(ctx, loser, loseX + (winX - loseX) * gone, y, r, bad, 1 - gone);
    sparks(ctx, winX + (loseX - winX) * 0.22, y, r, Math.max(0, (after - 0.4) / 0.6), bad);
    return;
  }
  // A mouth drinking a plate: the plate peels off and goes down in one slurp,
  // and the winner is left patting the bare patch.
  const slurp = Math.min(1, after * 1.6);
  drawSide(ctx, winner, winX, y, r * (1 + slurp * 0.16), good, 1);
  if (slurp < 1) {
    drawSide(
      ctx,
      loser,
      loseX + (winX - loseX) * slurp,
      y,
      r * (1 - slurp * 0.6),
      bad,
      1 - slurp * 0.6,
    );
  }
}

/** One throw, drawn where it stands. */
function drawSide(
  ctx: CanvasRenderingContext2D,
  t: TellThrow,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
): void {
  if (alpha <= 0.01) return;
  ctx.globalAlpha = alpha;
  drawThrowGlyph(ctx, t, x, y, r, color);
  ctx.globalAlpha = 1;
}

/** The vent: eight dots off a centre, out and fading. `sparks.ts` for one body. */
function sparks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  at: number,
  color: string,
): void {
  if (at <= 0 || at >= 1) return;
  ctx.fillStyle = color;
  ctx.globalAlpha = 1 - at;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const d = r * (0.6 + at * 1.8);
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(a) * d,
      y + Math.sin(a) * d,
      Math.max(1, r * 0.12 * (1 - at)),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
