import { crystalPath, LIGHT_HALF, METEOR } from "@neon-spore/content";
import {
  type Creature,
  type SimConfig,
  spanOf,
  volleyIsClimbing,
  volleyPlatesLeft,
} from "@neon-spore/sim";
import { depthScale, drawnRow, hazed } from "./depth.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { rockRadius } from "./torch.js";
import { drawSeams } from "./volley-seams.js";

/**
 * THE VOLLEY's shell: **a basketball made of meteor**, and the count of wards
 * still to come drawn as how much of it is left.
 *
 * The owner asked for this one by name — a ball in the rock's own colours,
 * with the seams a basketball has, in the colour of the body sealed inside it,
 * and *nothing else of that body showing while the shell is whole*. So the
 * shell is the same `METEOR` contour `meteor.ts` strokes, filled with the same
 * unlit mid-tone and lit by the same key light, and the only colour on it is
 * the four seams a basketball has, which are `volley-seams.ts` next door.
 * Those seams *are* the sentence player 2 has to have ready — a red ball and a
 * cyan ball are the same rock with a different pattern painted on it, which is
 * exactly what a basketball is.
 *
 * **A whole shell is opaque, and the body inside is not drawn at all.**
 * `showsVolleyCore` is the gate `creatures.ts` reads, and it is THE VEIL's
 * arrangement rather than a new one: a halo, a rim and a glow pass all reach
 * outside the contour they belong to, so a body drawn under an opaque ball
 * would show as a ring of light around it and the shell would leak the one
 * thing it is holding back.
 *
 * **The count is how much of the ball is left.** There is no health bar in
 * this game and THE RECOIL's cage is the precedent for why: a ward knocks one
 * plate off, and what is drawn from then on is the ball minus that sector,
 * with the body burning out of the break. Three plates is a closed ball, two
 * is a ball with a bite out of it, one is a cap over a body, and none is a
 * body. Nothing is dimmed and nothing is labelled.
 *
 * **The break faces the way it is going.** Plates are laid from the leading
 * edge round, so the first one lost is the one the shield actually hit: a
 * volley coming down is broken open underneath, and one climbing away from a
 * ward is broken open on top. The shell is worn where the work was done.
 *
 * Nothing here is remembered between frames. The count and the climb come off
 * the world and the tumble off the wall clock spread by the body's own id, so
 * a restart cannot leave a stale shell behind and two volleys in two lanes are
 * never one drawing done twice (`restart.test.ts` is the gate).
 */

/**
 * How far the ball stands off the body's own tile radius. `rockRadius` at the
 * body's span, the number `drawMeteor` reads, so a volley and the rocks it
 * shares a field with are the same size and the pair reads "rock" before they
 * read anything else.
 */
const BALL_MUL = 1.0;
/** How much the ball shudders while a ward is carrying it up, as a share of
 * its radius. Only while climbing: a shell under load looks like one. */
const SHUDDER = 0.05;

/**
 * Whether the body sealed inside is drawn at all — false while every plate is
 * still on, which is the whole of the first state the owner asked for.
 *
 * A rule here rather than a comparison at the draw site, for `showsVeilCore`'s
 * reason: the gate and the shell are one fact, and a second spelling of it is
 * how a body comes to be drawn glowing through a ball that is meant to be shut.
 */
export function showsVolleyCore(cfg: SimConfig, c: Creature): boolean {
  return c.kind !== "volley" || volleyPlatesLeft(c) < cfg.volleyPlates;
}

/**
 * The shell, over a body that has been drawn only if `showsVolleyCore` allowed
 * it. `time` is seconds, for the ball's own tumble; `near` is `nearness`, so
 * the far rows dim with everything else.
 */
export function drawVolleyShell(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  beatPhase: number,
  near: number,
): void {
  const plates = volleyPlatesLeft(c);
  // Out of plates: the shell is gone rather than wrecked. `effects-spark.ts`
  // has already thrown the rock off the tile it burst over, and what is left
  // falling is an ordinary slick or an ordinary bulb — which the pair has to
  // be able to *see* it is, rather than reading one last shard as something
  // still in the way.
  if (plates <= 0) return;

  const total = Math.max(1, cfg.volleyPlates);
  const spin = sinHash(c.id) * 6.3;
  const climbing = volleyIsClimbing(c);
  const shudder = climbing ? 1 + SHUDDER * Math.sin(time * 9 + spin) : 1;
  const r =
    rockRadius(l, spanOf(c)) * BALL_MUL * depthScale(cfg, l, drawnRow(c, beatPhase)) * shudder;
  // The ball rolls, and the pattern rolls with it — which is the one thing a
  // basketball does that a porthole must not (`carom.ts` argues the opposite
  // case for the opposite reason). `drawMeteor`'s own rate, so a volley and a
  // rock beside it turn together.
  const turn = spin + time * 0.12;
  // Which way the break faces: down while it falls, up while a ward carries
  // it, off the same `volleyIsClimbing` the simulation steps by — so the worn
  // face and the direction of travel can never point opposite ways.
  const lead = climbing ? -Math.PI / 2 : Math.PI / 2;

  const glow = hazed(cfg, c.color === "cyan" ? PALETTE.cyan : PALETTE.red, near);
  const metal = hazed(cfg, PALETTE.rock, near);

  ctx.save();
  ctx.translate(x, y);
  ctx.save();
  // What is left of the ball, as a clip: the whole plane while every plate is
  // on, so a closed shell has no seam of its own to give it away, and one
  // sector short for every ward already spent.
  if (plates < total) ctx.clip(remaining(lead, total, plates, r));
  // One path for both halves: the ball is filled and lit from it, and the
  // seams are clipped to it. A seam drawn to the full radius runs off the
  // stone — the contour is faceted and is inside `r` almost everywhere — and
  // four lines overhanging a rock read as a scribble over it rather than as
  // panels on it.
  const ball = new Path2D(
    crystalPath(0, 0, r, r, METEOR.sides, METEOR.depth, METEOR.wobble, time * 0.15, METEOR.seed),
  );
  drawRock(ctx, ball, r, turn, metal);
  drawSeams(ctx, ball, r, turn, glow);
  ctx.restore();
  ctx.restore();

  // The light out of the break, and none at all while the ball is closed —
  // which is the whole of the first state. It grows as the shell opens,
  // because by then the colour is what the pair has to be saying out loud.
  const open = 1 - plates / total;
  if (open > 0) halo(ctx, x, y, r * 1.5, glow, 0.16 * open);
}

/**
 * The sectors still on, as one path. Laid from the leading edge round, so
 * sector zero is the face the shield meets and the break opens there first.
 */
function remaining(lead: number, total: number, plates: number, r: number): Path2D {
  const sweep = (Math.PI * 2) / total;
  const kept = new Path2D();
  // The gap is `total - plates` sectors wide and starts at the leading edge,
  // so what is kept is one arc rather than several — a ball with a bite out of
  // it, which is what a broken ball looks like.
  const from = lead + sweep * (total - plates);
  kept.moveTo(0, 0);
  kept.arc(0, 0, r * 1.4, from, from + sweep * plates);
  kept.closePath();
  return kept;
}

/**
 * The ball itself: `meteor.ts`'s own drawing, so a volley and the rocks it
 * shares a field with are visibly one material. The mid-tone fill, the key
 * light handed the rotation so the light stays where it is while the ball
 * rolls under it, and the rock's outline.
 */
function drawRock(
  ctx: CanvasRenderingContext2D,
  ball: Path2D,
  r: number,
  turn: number,
  metal: string,
): void {
  ctx.save();
  ctx.rotate(turn);
  ctx.fillStyle = "#8A8F9C";
  ctx.fill(ball);
  ctx.save();
  ctx.clip(ball);
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  ctx.restore();
  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(ball);
  ctx.restore();
}
