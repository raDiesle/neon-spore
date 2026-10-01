import type { PinballState, SimConfig } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { PALETTE } from "./palette.js";
import type { Table } from "./pinball-table.js";

/**
 * **While the ball is up, the cannon is a funnel waiting for it.**
 *
 * The owner, 1 October 2026: *the "move" helper is stupid. Better change the
 * visual of the cannon when the ball is shot, so it looks like a funnel which
 * can collect it again, with some visual, e.g. a green light sucking in, and an
 * arrow pointing down in the middle.* Until then a flight drew the cannon as it
 * is between shots, an empty muzzle, and a word over it told the pilot to MOVE
 * (`boss-cue-read-h.ts` records why the word went).
 *
 * The cup is as wide as the catch itself, `pinballCatchReachMilli` either side
 * of the mouth (`sim/pinball-shot.ts`'s `pinCaught`), so the picture says
 * exactly how much of the floor brings the ball home. Inside it a green light
 * breathes at the neck, sparks slide down both walls into it, and an arrow
 * stands in the middle pointing at the mouth. Green, the colour the game says
 * *good* in, because the cheer for a catch (`pinball-catch.ts`) is green too:
 * the funnel promises it and the cheer pays it.
 *
 * Exempt as *a look the owner asked for by name*. Nothing outlives a frame;
 * every motion is read off `time`.
 */

/** How deep the cup is above the mouth, and how wide its neck stays, in tiles. */
const CUP_TILES = 1.45;
const NECK_TILES = 0.26;

/**
 * How far the neck reaches down into the muzzle, in tiles: the mouth is drawn a
 * third of a tile above the skin (`pinball-round.ts`), and a cup that stopped
 * there floated over the cannon instead of being it.
 */
const SINK_TILES = 0.22;

/** Sparks sliding down each wall, and how long one takes to reach the neck, in seconds. */
const SPARKS = 4;
const SLIDE_SECONDS = 0.9;

/** Chevrons falling down the middle, and how long one takes, in seconds. */
const CHEVRONS = 3;
const FALL_SECONDS = 1.1;

/** Whether the mouth is open: a ball in the air, in a round still being played. */
export function pinMouthShown(boss: PinballState): boolean {
  return boss.phase === "play" && boss.shot === "flight";
}

/** Half the width of the cup's rim in pixels: the catch's own reach, on this table. */
export function pinMouthHalfWidth(t: Table, cfg: SimConfig): number {
  return (cfg.pinballCatchReachMilli * t.tile) / 1000;
}

/**
 * One wall of the bowl, as its three points: the rim, the bend and the neck.
 * A quadratic whose bend sits low and wide, so the wall comes down nearly
 * straight and rounds into the neck — a bowl that holds, rather than the
 * flared prongs a bend placed high made of the first frame.
 */
interface Wall {
  rim: number;
  bend: number;
  bendY: number;
  neck: number;
  top: number;
  bottom: number;
}

function wallOf(t: Table, cfg: SimConfig, y: number): Wall {
  const rim = pinMouthHalfWidth(t, cfg);
  const neck = t.tile * NECK_TILES;
  return {
    rim,
    neck,
    bend: neck + (rim - neck) * 0.35,
    bendY: y,
    top: y - t.tile * CUP_TILES,
    bottom: y + t.tile * SINK_TILES,
  };
}

function bowl(path: Path2D, x: number, w: Wall, closed: boolean): void {
  path.moveTo(x - w.rim, w.top);
  path.quadraticCurveTo(x - w.bend, w.bendY, x - w.neck, w.bottom);
  // The fill runs across the neck; the stroke leaves it open for the ball.
  if (closed) path.lineTo(x + w.neck, w.bottom);
  else path.moveTo(x + w.neck, w.bottom);
  path.quadraticCurveTo(x + w.bend, w.bendY, x + w.rim, w.top);
}

/** The funnel, its light and its chevrons, over the mouth at `(x, y)`. */
export function drawPinMouth(
  ctx: CanvasRenderingContext2D,
  t: Table,
  cfg: SimConfig,
  x: number,
  y: number,
  time: number,
): void {
  const tile = t.tile;
  const w = wallOf(t, cfg, y);
  const breath = 0.5 + 0.5 * Math.sin(time * 5);

  // The light first, so the walls stand in front of it.
  halo(ctx, x, y - tile * 0.3, tile * (1.4 + 0.4 * breath), PALETTE.good, 0.3 + 0.3 * breath);
  halo(ctx, x, w.bottom, tile * 0.5, PALETTE.goodRim, 0.55 + 0.4 * breath);

  const cup = new Path2D();
  bowl(cup, x, w, true);
  cup.closePath();
  ctx.save();
  const fill = ctx.createLinearGradient(x, w.top, x, w.bottom);
  fill.addColorStop(0, "rgba(59,255,158,0.10)");
  fill.addColorStop(1, "rgba(59,255,158,0.45)");
  ctx.fillStyle = fill;
  ctx.fill(cup);
  ctx.restore();

  // The walls, and a lip turned out at each rim so the top reads as an
  // opening and not as two prongs.
  const walls = new Path2D();
  bowl(walls, x, w, false);
  const lip = tile * 0.22;
  walls.moveTo(x - w.rim - lip, w.top - lip * 0.35);
  walls.lineTo(x - w.rim, w.top);
  walls.moveTo(x + w.rim + lip, w.top - lip * 0.35);
  walls.lineTo(x + w.rim, w.top);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  strokeGlow(ctx, walls, PALETTE.good, Math.max(1.5, tile * 0.12), 1, 0.95);
  ctx.restore();

  drawSlide(ctx, x, w, time);
  drawChevrons(ctx, x, w, tile, time);
}

/** Sparks running down both walls into the neck: the *sucking in*. */
function drawSlide(ctx: CanvasRenderingContext2D, x: number, w: Wall, time: number): void {
  ctx.save();
  ctx.fillStyle = PALETTE.goodRim;
  const r0 = Math.max(1, (w.rim - w.neck) * 0.09);
  for (let i = 0; i < SPARKS; i++) {
    const run = (time / SLIDE_SECONDS + i / SPARKS) % 1;
    // The wall's own curve, sampled, so a spark rides the wall rather than
    // the air beside it.
    const a = (1 - run) * (1 - run);
    const b = 2 * (1 - run) * run;
    const c = run * run;
    const out = a * w.rim + b * w.bend + c * w.neck;
    const sy = a * w.top + b * w.bendY + c * w.bottom;
    ctx.globalAlpha = Math.min(1, run * 4) * (1 - run * 0.6);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + side * out, sy, r0 * (1 - 0.5 * run), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Chevrons falling down the middle of the cup into the neck: the arrow the
 * owner asked for, pointing down, and moving the way the ball should.
 */
function drawChevrons(
  ctx: CanvasRenderingContext2D,
  x: number,
  w: Wall,
  tile: number,
  time: number,
): void {
  const half = tile * 0.24;
  const drop = tile * 0.18;
  const span = w.bottom - tile * 0.15 - (w.top - tile * 0.1);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < CHEVRONS; i++) {
    const run = (time / FALL_SECONDS + i / CHEVRONS) % 1;
    const tip = w.top - tile * 0.1 + span * run;
    const v = new Path2D();
    v.moveTo(x - half, tip - drop);
    v.lineTo(x, tip);
    v.lineTo(x + half, tip - drop);
    const alpha = Math.sin(run * Math.PI);
    strokeGlow(ctx, v, PALETTE.goodRim, Math.max(1.5, tile * 0.11), 1, alpha);
  }
  ctx.restore();
}
