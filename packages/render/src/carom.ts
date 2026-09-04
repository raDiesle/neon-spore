import { crystalPath, LIGHT_HALF, METEOR } from "@neon-spore/content";
import { type Creature, caromHeading, type SimConfig, spanOf } from "@neon-spore/sim";
import { depthScale, drawnRow, hazed } from "./depth.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { rockRadius } from "./torch.js";

/**
 * THE CAROM's crust: the rock shell a slick or a bulb is sealed inside, and
 * the streak it drags behind it across the field.
 *
 * The body underneath is not drawn here at all. `wornKind` already answers
 * "slick" or "bulb" for a carom, so `creatures.ts` draws an ordinary living
 * body with its ordinary colour and its ordinary own-motion, and this file
 * lays one more object over the top of it — THE RECOIL's cage arrangement
 * exactly, and for the cage's reason: what the pair has to read through the
 * shell is the colour, because the colour is the only thing either of them can
 * do about this body while it is still crossing.
 *
 * **It is a ring and not a lid, and that is the whole of the drawing
 * decision.** A rock shell filled in would be a rock — indistinguishable from
 * the meteor it is about to become, and drawn over the one thing the pair has
 * to read. So the crust is an annulus: the same faceted crystal `meteor.ts`
 * strokes, with a smaller one cut out of the middle of it, and the living
 * body burning out of the hole. Both facts are then true at once and neither
 * is a caption — *this is rock*, and *there is something alive in it*.
 *
 * **The streak is what says four lanes a beat.** Every other body on this
 * field either holds its lane or steps to a named tile; this one is somewhere
 * else before anybody has finished saying where it was, and a still picture of
 * it is a lie about the only thing that matters. So the crust drags a wedge of
 * its own colour behind it, along `caromHeading` — the direction the
 * simulation is actually going to move it — which means the picture and the
 * next beat can never point opposite ways. It is drawn *behind* the crust and
 * inside the perspective transform, so it grows down the field the way the
 * body does.
 *
 * Nothing here is remembered between frames. The heading comes off the world
 * and the shimmer off the wall clock spread by the body's own id, so a restart
 * cannot leave a stale streak behind and two caroms in two lanes are never one
 * drawing done twice (`docs/decisions.md`, and `restart.test.ts` is the gate).
 */

/**
 * The hole in the middle, as a share of the shell.
 *
 * The shell itself is **`rockRadius` at the body's own span** and not a
 * multiple of the living radius, which is the one number in this file that had
 * to be got right rather than chosen: a carom is two columns wide (`colSpan`)
 * and the rock it becomes keeps that width, so a crust drawn at one tile would
 * be a body the shield covers two columns of and the pair sees one of — and
 * the moment it cracked, the picture would jump to twice the size.
 *
 * Just under three quarters of it, so the living body inside — drawn at the
 * ordinary one tile by `drawLiving` — stands clear of the ring with a little
 * room around it, and what is left is a band of rock thick enough to read as
 * rock at the top of the field.
 */
const CORE_MUL = 0.72;
/** How far the streak reaches behind it, in shell radii. Two: about half a
 * lane at the top of the field and most of one at the bottom, which is the
 * distance that reads as speed without reaching into the column next door. */
const TRAIL_MUL = 2.0;
/** How much of the trail's own colour survives where it leaves the shell. */
const TRAIL_ALPHA = 0.5;

/**
 * The crust and its streak, over a body that is already drawn. `time` is
 * seconds, for the shell's own shimmer; `near` is `nearness`, so the far rows
 * dim with everything else.
 */
export function drawCaromCrust(
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
  // The rock's own radius at this body's width, times the row's perspective —
  // `drawMeteor` reads exactly the same two numbers, so the crust and the rock
  // that falls out of it are the same size and the crack changes nothing about
  // how much of the lane the thing covers.
  const r = rockRadius(l, spanOf(c)) * depthScale(cfg, l, drawnRow(c, beatPhase));
  const spin = sinHash(c.id) * 6.3;
  const turn = spin + time * 0.35;
  const dir = caromHeading(c);

  const metal = hazed(cfg, PALETTE.rock, near);
  const glow = hazed(cfg, c.color === "cyan" ? PALETTE.cyan : PALETTE.red, near);

  ctx.save();
  ctx.translate(x, y);

  drawTrail(ctx, r, dir, glow);

  ctx.rotate(turn);
  // Outer facets and inner facets in one path, wound so that `evenodd` leaves
  // the ring and takes the middle out. Two calls to `crystalPath` rather than
  // one scaled twice: the inner rim is a *break* rather than a smaller copy of
  // the shell, so it carries its own phase and turns against the outer one.
  const shell = new Path2D(
    crystalPath(0, 0, r, r, METEOR.sides, METEOR.depth, METEOR.wobble, time * 0.2, METEOR.seed),
  );
  shell.addPath(
    new Path2D(
      crystalPath(
        0,
        0,
        r * CORE_MUL,
        r * CORE_MUL,
        METEOR.sides,
        METEOR.depth * 1.6,
        METEOR.wobble,
        -time * 0.3,
        METEOR.seed + 2,
      ),
    ),
  );

  ctx.save();
  // The unlit mid-tone `meteor.ts` fills with, so a carom and the rock it
  // becomes are visibly the same material — the light supplies the ends.
  ctx.fillStyle = "#8A8F9C";
  ctx.fill(shell, "evenodd");
  ctx.clip(shell, "evenodd");
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  ctx.restore();

  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(shell);
  ctx.restore();

  // The light escaping out of the break, over the whole thing rather than
  // clipped to the hole: a body sealed in rock that leaked no light at all
  // would be a rock, and the colour is the sentence player 2 has to say.
  halo(ctx, x, y, r * 1.4, glow, 0.16);
}

/**
 * The wedge dragged behind it: widest at the shell, gone by the far end, and
 * pointing the way `caromHeading` says the body is going. Drawn in the body's
 * own colour rather than in rock, because what the streak is saying is *this
 * one is alive and it is already past you*.
 */
function drawTrail(ctx: CanvasRenderingContext2D, r: number, dir: number, glow: string): void {
  const back = -dir * r * TRAIL_MUL;
  const tip = -r * TRAIL_MUL * 0.5;
  // Along the wedge rather than across it. The gradient used to run down and
  // to the *right* while the wedge pointed up and to the left, so every point
  // in it sampled the transparent end and the streak was drawn invisibly.
  const grad = ctx.createLinearGradient(0, 0, back, tip);
  grad.addColorStop(0, glow);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalAlpha = TRAIL_ALPHA;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.7);
  ctx.lineTo(0, r * 0.7);
  // Behind and *above*: the body is falling as well as crossing, so a streak
  // laid flat along the row would describe a different creature. The wedge
  // leans back up the diagonal the simulation actually walked it down.
  ctx.lineTo(back, tip);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}
