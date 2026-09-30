import type { PinballState } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { signedHash } from "./hash.js";
import { PALETTE } from "./palette.js";
import type { Table } from "./pinball-table.js";
import type { ViewState } from "./renderer.js";

/**
 * **A ball caught back in the cannon is said out loud: YEAH.**
 *
 * The owner, 30 September 2026: *make a nicer success yeah animation when ball
 * was collected correct again with cannon.* Until then a catch was the one
 * outcome of a shot with no picture at all — the ball simply reappeared in the
 * muzzle, which reads the same as a shot that never left — while a drop had a
 * blast and a target had a take (`pinball-blast.ts`).
 *
 * So the mouth flashes the colour the game says *good* in, two rings run up
 * out of it, a spray of sparks goes up and falls back, and the word itself
 * jumps out of the cannon, overshoots, settles and floats off. Green and
 * white rather than the take's amber, so the eye can tell *we caught it* from
 * *we took one* on the same shot.
 *
 * Drawn at the cannon as it stands now, not where the catch happened: the ball
 * is in the mouth, and a cheer left hanging where the cannon was would be
 * about a place nothing is. Nothing is held between frames — `catchTick` is on
 * the world, the blast's arrangement — so a restart has nothing to lose.
 */

/** Ticks the whole of it lasts. Just under a second at 120 Hz: the word has
 * to be read, and it has to be gone before the next shot is fired. */
const CATCH_TICKS = 110;

/** Sparks in the spray, how high one is thrown in tiles, and the fall. */
const SPARKS = 18;
const SPARK_TILES = 3.2;
const SPARK_FALL = 2.4;

/** The word, its size in tiles, and how far it rises over its life. */
const WORD = "YEAH!";
const WORD_TILES = 1.05;
const RISE_TILES = 2.2;

/** How far through the cheer the picture is: 1 on the catch, 0 when it is
 * over or there has not been one. A tick counter that went backwards (a
 * restart) is no catch, rather than one far in the future. */
export function pinCatch01(view: ViewState, boss: PinballState): number {
  if (boss.catchTick < 0) return 0;
  const since = view.world.tick - boss.catchTick;
  if (since < 0) return 0;
  return Math.max(0, 1 - since / CATCH_TICKS);
}

/**
 * The word's scale at `grown`, 0 to 1 through the cheer: out of nothing to a
 * quarter oversize in the first sixth, back to its size by a third, and held.
 * The overshoot is the whole of *pop* — a word that eased up to its size would
 * be a caption.
 */
export function pinCatchScale(grown: number): number {
  if (grown <= 0) return 0;
  if (grown < 1 / 6) return 1.25 * (grown * 6);
  if (grown < 1 / 3) return 1.25 - 0.25 * ((grown - 1 / 6) * 6);
  return 1;
}

/** The cheer, at the mouth `(x, y)` — where the resting ball is drawn. */
export function drawPinCatch(
  ctx: CanvasRenderingContext2D,
  t: Table,
  view: ViewState,
  boss: PinballState,
  x: number,
  y: number,
): void {
  const life = pinCatch01(view, boss);
  if (life <= 0) return;
  const grown = 1 - life;
  const tile = t.tile;

  // The flash: the mouth lit green and a white heart in it, gone first.
  halo(ctx, x, y, tile * (0.8 + 2.6 * grown), PALETTE.good, life * 0.9);
  halo(ctx, x, y, tile * (0.35 + 0.6 * grown), PALETTE.goodRim, life ** 3);

  // Two rings up out of the mouth, the second a beat behind the first.
  for (const lag of [0, 0.18]) {
    const run = Math.max(0, grown - lag) / (1 - lag);
    if (run <= 0) continue;
    const fade = 1 - run;
    const ring = new Path2D();
    ring.arc(x, y, Math.max(1, tile * (0.4 + 2.8 * Math.sqrt(run))), Math.PI, Math.PI * 2);
    ctx.save();
    strokeGlow(ctx, ring, PALETTE.goodRim, Math.max(1, tile * 0.1 * fade), 0.9, fade);
    ctx.restore();
  }

  drawSparks(ctx, tile, x, y, grown, life);
  drawWord(ctx, t, x, y, grown, life);
}

/** Thrown up in a fan out of the mouth, arcing over and falling back. */
function drawSparks(
  ctx: CanvasRenderingContext2D,
  tile: number,
  x: number,
  y: number,
  grown: number,
  life: number,
): void {
  const colours = [PALETTE.good, PALETTE.goodRim, PALETTE.pod];
  ctx.save();
  ctx.globalAlpha = Math.min(1, life * 1.6);
  for (let i = 0; i < SPARKS; i++) {
    // A fan from ten o'clock to two, each a little off its place and speed.
    const a = -Math.PI * (0.18 + 0.64 * ((i + 0.5) / SPARKS)) + signedHash(i, 5, 0) * 0.12;
    const speed = tile * SPARK_TILES * (0.55 + 0.45 * Math.abs(signedHash(i, 6, 0)));
    const sx = x + Math.cos(a) * speed * grown;
    const sy = y + Math.sin(a) * speed * grown + tile * SPARK_FALL * grown * grown;
    const r = Math.max(0.8, tile * (0.07 + 0.05 * Math.abs(signedHash(i, 7, 0))) * life);
    ctx.fillStyle = colours[i % colours.length] ?? PALETTE.good;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** The word: out of the cannon, oversize, settled, rising and gone. */
function drawWord(
  ctx: CanvasRenderingContext2D,
  t: Table,
  x: number,
  y: number,
  grown: number,
  life: number,
): void {
  const scale = pinCatchScale(grown);
  if (scale <= 0) return;
  const size = Math.max(8, t.tile * WORD_TILES * scale);
  // Held inside the table, so a catch in the corner column is not half a word.
  const half = t.tile * WORD_TILES * 1.9;
  const left = t.x + half;
  const right = t.x + t.tile * t.cols - half;
  const wx = Math.max(left, Math.min(right, x));
  const wy = y - t.tile * (1.1 + RISE_TILES * Math.sqrt(grown));
  // Full until the last two fifths, then out.
  const alpha = Math.min(1, life / 0.4);

  halo(ctx, wx, wy, size * 1.7, PALETTE.good, alpha * 0.45);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `800 ${Math.round(size)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(2, size * 0.16);
  ctx.strokeStyle = PALETTE.good;
  ctx.strokeText(WORD, wx, wy);
  ctx.fillStyle = PALETTE.goodRim;
  ctx.fillText(WORD, wx, wy);
  ctx.restore();
}
