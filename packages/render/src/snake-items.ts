import { blobPath, livingPath, livingSilhouette, POD } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import { PALETTE } from "./palette.js";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";

/**
 * What is standing in SNAKE's arena to be spent: the things to shoot and the
 * things to swallow.
 *
 * **Both of them are borrowed rather than invented**, and the owner asked for
 * exactly that. A thing to collect is drawn as the pod the field already has —
 * the same amber contour, the same lit core — because the pair has spent five
 * acts learning that an amber blob with a light in it is a thing to take in,
 * and a round is not the place to teach a second vocabulary. A thing to shoot
 * is drawn as a slick or a bulb, the two bodies the field is mostly made of,
 * for the same reason one step on: the seat with the trigger should not have
 * to be told what an enemy looks like.
 *
 * They were a barbed square and an amber ring before this, which read as
 * *machinery* — right for a round that is not the field, wrong for the two
 * things in it a player already knows by sight.
 *
 * **Which enemy is which is the index and nothing else.** Even is a slick, odd
 * a bulb. It has to be a fact about the authored list rather than a random
 * one: `packages/render` may not roll a die and two devices have to draw the
 * same arena, and an enemy that changed body between two frames would be a
 * body player 1 could not describe out loud. Which *shape* each of those two
 * words means is `livingSilhouette`'s answer and not this file's, so an arena
 * enemy and a body on the field can never come to be different slicks.
 *
 * Its own file because `snake-draw.ts` is the arena — the floor, the wall, the
 * meteors and where a tile is — and this is what is standing on it.
 */

/** How much of a tile a body fills. Under a whole one, so the grid still reads. */
const BODY = 0.34;

/** One enemy: a slick or a bulb, in the red the field spends on a thing to shoot. */
export function drawSnakeEnemy(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  col: number,
  row: number,
  index: number,
  pulse: number,
): void {
  const slick = index % 2 === 0;
  const shape = livingSilhouette(slick ? "slick" : "bulb");
  const x = arenaX(arena, col) + arena.tile / 2;
  const y = arenaY(arena, row) + arena.tile / 2;
  const r = arena.tile * BODY;
  const scale = r / Math.max(shape.rx, shape.ry);
  // The contour's own wobble phase, taken off the beat the caller handed in
  // and the tile the body stands on: no wall clock, no rng, and two bodies on
  // two tiles that are never caught at the same moment of the same breath.
  const t = pulse + (col * 3 + row) * 0.37;
  const path = new Path2D(livingPath(shape, t));

  ctx.save();
  ctx.translate(x, y);
  // The slick tilts and the bulb pumps, which is what each of them does on the
  // field. Both are read out of the same number, so neither needs a clock.
  if (slick) ctx.rotate((pulse - 0.5) * 0.34);
  else ctx.scale(1 + (pulse - 0.5) * 0.1, 1 - (pulse - 0.5) * 0.1);
  ctx.scale(scale, scale);
  ctx.fillStyle = PALETTE.redDark;
  ctx.fill(path);
  strokeGlow(ctx, path, PALETTE.red, Math.max(1, r * 0.12) / scale, 0.8 + 0.3 * pulse);
  // One lit core, so a body the size of a tile still has an inside.
  ctx.globalAlpha = 0.5 + 0.3 * pulse;
  ctx.fillStyle = PALETTE.redRim;
  ctx.beginPath();
  ctx.arc(0, 0, Math.min(shape.rx, shape.ry) * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** One point: the field's own pod, breathing where it was placed. */
export function drawSnakePoint(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  col: number,
  row: number,
  pulse: number,
): void {
  const x = arenaX(arena, col) + arena.tile / 2;
  const y = arenaY(arena, row) + arena.tile / 2;
  const r = arena.tile * 0.32;
  const scale = r / Math.max(POD.rx, POD.ry);
  const t = pulse + (col + row * 2) * 0.53;
  const path = new Path2D(
    blobPath(0, 0, POD.rx, POD.ry, POD.lobes, POD.depth, POD.wobble, t, POD.seed),
  );

  // The wide calm halo a moored pod carries. It is what says "this is not
  // coming for you", which in here is what says "drive over it".
  halo(ctx, x, y, r * (1.9 + 0.3 * pulse), PALETTE.pod, 0.12 + 0.08 * pulse);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((pulse - 0.5) * 0.16);
  ctx.scale(scale, scale);
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill(path);
  strokeGlow(ctx, path, PALETTE.pod, Math.max(1, r * 0.11) / scale, 0.8 + 0.4 * pulse);
  ctx.globalAlpha = 0.55 + 0.45 * pulse;
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(0, 0, POD.rx * (0.26 + 0.05 * pulse), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}
