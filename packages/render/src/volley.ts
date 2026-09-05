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
import { drawCracks } from "./volley-cracks.js";
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
 * **The count is how much of the stone is left, and the frame never goes.**
 * There is no health bar in this game and THE RECOIL's cage is the precedent
 * for why. A ward takes one sector of the *filling* away and nothing else: the
 * rim and all four seams are drawn whole on every frame, so a volley warded
 * twice is still round, still the size it was, and still unmistakably the same
 * body — a ball-shaped skeleton with the thing inside burning through it. The
 * owner asked for that, and it is also the better picture: a silhouette that
 * changed with the count would be a creature whose *shape* meant something,
 * and the shape is how the pair says the word "volley" to each other.
 *
 * **The gap faces the way it is going.** Sectors are laid from the leading
 * edge round, so the first one emptied is the face the shield actually hit: a
 * volley coming down is hollow underneath, and one climbing away from a ward
 * is hollow on top. The shell is worn where the work was done.
 *
 * Nothing here is remembered between frames. The count and the climb come off
 * the world and the tumble off the wall clock spread by the body's own id, so
 * a restart cannot leave a stale shell behind and two volleys in two lanes are
 * never one drawing done twice (`restart.test.ts` is the gate).
 */

/**
 * How far the ball stands off the body's own tile radius.
 *
 * It was one — `rockRadius` exactly, so a volley and the rocks it shares a
 * field with were the same size — and the owner's report was that the thing
 * inside was not *inside* it. He is right, and the arithmetic says why: a
 * living body is drawn at `l.tile * 0.4` on its longest axis and its contour
 * is a blob, so a slick's lobes reach `1 + SLICK.depth` past that before the
 * outline stroke and the glow have been added. A shell at the same radius is a
 * shell the body pokes out of on both flanks.
 *
 * Half again over, which clears a slick's widest lobe with room for the light
 * to escape between the two. It does make a volley visibly bigger than a plain
 * meteor, and that is the right trade: a rock is a rock whatever size it is,
 * and a ball with something sealed in it has to look like it could hold one.
 */
const BALL_MUL = 1.55;
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

  // One path for all three passes: the stone is filled from it, the skeleton
  // is stroked from it, and the seams are clipped to it. A seam drawn to the
  // full radius runs off the stone — the contour is faceted and is inside `r`
  // almost everywhere — and four lines overhanging a rock read as a scribble
  // over one rather than as panels on it.
  const ball = new Path2D(
    crystalPath(0, 0, r, r, METEOR.sides, METEOR.depth, METEOR.wobble, time * 0.15, METEOR.seed),
  );

  ctx.save();
  ctx.translate(x, y);
  // **The stone goes and the frame stays.** A ward takes a sector of the
  // *filling* away and nothing else: the outline and all four seams are drawn
  // whole on every frame, so what is left after two wards is a ball-shaped
  // skeleton with the body burning inside it rather than a shape with a bite
  // out of it. The owner asked for exactly that, and it is the better picture
  // as well — a silhouette that changed with the count would be a creature
  // whose *shape* meant something, and the shape is how the pair says "volley".
  ctx.save();
  if (plates < total) ctx.clip(remaining(lead, total, plates, r));
  fillRock(ctx, ball, r, turn);
  // And the damage on what is left of it. Inside the same clip as the stone,
  // because a crack is a fault in material and there is none where the
  // material has gone — a fracture drawn across the empty sector would be a
  // line hanging in front of the body.
  if (plates < total) drawCracks(ctx, ball, r, turn, total - plates, c.id, metal);
  ctx.restore();
  drawFrame(ctx, ball, turn, metal);
  drawSeams(ctx, ball, r, turn, glow);
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
 * The stone: `meteor.ts`'s own filling, so a volley and the rocks it shares a
 * field with are visibly one material. The mid-tone, and the key light handed
 * the rotation so the light stays where it is while the ball rolls under it.
 *
 * Drawn inside whatever clip the caller has set, which is what makes a ward
 * take material away. It is deliberately *only* the filling — the outline is
 * `drawFrame` below, and the whole point of the two being separate is that one
 * of them survives.
 */
function fillRock(ctx: CanvasRenderingContext2D, ball: Path2D, r: number, turn: number): void {
  ctx.save();
  ctx.rotate(turn);
  ctx.fillStyle = "#8A8F9C";
  ctx.fill(ball);
  ctx.clip(ball);
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  ctx.restore();
}

/**
 * The rim, drawn whole however much filling is left. It is the skeleton the
 * owner asked for: a volley that has been warded twice is still round, still
 * the size it was, and still unmistakably the same body — what has changed is
 * that you can see through it.
 */
function drawFrame(ctx: CanvasRenderingContext2D, ball: Path2D, turn: number, metal: string): void {
  ctx.save();
  ctx.rotate(turn);
  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(ball);
  ctx.restore();
}
