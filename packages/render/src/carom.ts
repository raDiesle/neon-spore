import { crystalPath, LIGHT_HALF, METEOR } from "@neon-spore/content";
import { type Creature, caromHeading, type SimConfig, spanOf } from "@neon-spore/sim";
import { drawWindow } from "./carom-window.js";
import { depthScale, drawnRow, hazed } from "./depth.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { rockRadius } from "./torch.js";

/**
 * THE CAROM's crust: a meteor with a window cut in it, and the streak it drags
 * behind it across the field.
 *
 * The body underneath is not drawn here at all. `wornKind` already answers
 * "slick" or "bulb" for a carom, so `creatures.ts` draws an ordinary living
 * body with its ordinary colour and its ordinary own-motion, and this file
 * lays the rock over the top of it — THE RECOIL's cage arrangement, with the
 * one difference that a cage is a frame and this is a hull.
 *
 * **It is a meteor first.** The first version drew a thin faceted ring, and it
 * read as a plate with a body in the middle rather than as rock: the owner's
 * correction was that the thing should *start* as the meteor shape it is going
 * to become. So the outer contour is now `crystalPath` at the full `METEOR`
 * parameters, filled with the same unlit mid-tone `meteor.ts` fills with and
 * lit by the same key — the rock it cracks into is the identical drawing with
 * the window closed up, which is what makes the crack read as one object
 * changing rather than two objects swapped.
 *
 * **The window is glass, and round.** A hole is not a window: an angular gap
 * in a rock is damage, and what the pair has to read through this one is a
 * living body they are going to have to name a colour for. So it is a circle —
 * the one round thing on a body made entirely of facets, which is what says
 * *made* rather than *broken* — with a bezel around it, a tint across it and a
 * specular crescent up its top-left shoulder, so the colour behind it is
 * plainly behind something. `KEY` puts that crescent on the same side every
 * other lit body in this game takes its highlight from.
 *
 * **And there is a hatch across the top of it.** Two rivets and a seam, drawn
 * closed while the body is sealed in. It is the only part of this picture that
 * is a promise about the future rather than a description of the present: when
 * the shot lands, that is the line the body comes out of (`chute.ts`).
 *
 * **The streak is what says three lanes a beat.** Every other body on this
 * field either holds its lane or steps to a named tile; this one is somewhere
 * else before anybody has finished saying where it was, and a still picture of
 * it is a lie about the only thing that matters. So the crust drags a wedge of
 * its own colour behind it, along `caromHeading` — the direction the
 * simulation is actually going to move it — which means the picture and the
 * next beat can never point opposite ways.
 *
 * Nothing here is remembered between frames. The heading comes off the world
 * and the shimmer off the wall clock spread by the body's own id, so a restart
 * cannot leave a stale streak behind and two caroms in two lanes are never one
 * drawing done twice (`docs/decisions.md`, and `restart.test.ts` is the gate).
 */

/**
 * The window, as a share of the rock's radius.
 *
 * The rock itself is **`rockRadius` at the body's own span** and not a multiple
 * of the living radius, which is the one number in this file that had to be got
 * right rather than chosen: a carom is two columns wide (`colSpan`) and the
 * meteor it becomes keeps that width, so a crust drawn at one tile would be a
 * body the shield covers two columns of and the pair sees one of — and the
 * moment it cracked, the picture would double in size.
 *
 * Just under three fifths of it, which puts the glass a little wider than the
 * one-tile footprint `drawLiving` gives the body inside: the whole creature
 * shows through with a margin, and what is left all round is rock thick enough
 * to read as rock at the top of the field.
 */
const GLASS_MUL = 0.58;
/** How far the streak reaches behind it, in rock radii. Two: about half a lane
 * at the top of the field and most of one at the bottom, which is the distance
 * that reads as speed without reaching into the column next door. */
const TRAIL_MUL = 2.0;
/** How much of the trail's own colour survives where it leaves the rock. */
const TRAIL_ALPHA = 0.5;

/**
 * The crust and its streak, over a body that is already drawn. `time` is
 * seconds, for the rock's own tumble; `near` is `nearness`, so the far rows
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
  // `drawMeteor` reads exactly these two numbers, so the crust and the rock
  // that falls out of it are the same size and the crack changes nothing about
  // how much of the lane the thing covers.
  const r = rockRadius(l, spanOf(c)) * depthScale(cfg, l, drawnRow(c, beatPhase));
  const glass = r * GLASS_MUL;
  const spin = sinHash(c.id) * 6.3;
  const dir = caromHeading(c);

  const metal = hazed(cfg, PALETTE.rock, near);
  const glow = hazed(cfg, c.color === "cyan" ? PALETTE.cyan : PALETTE.red, near);
  const rim = hazed(cfg, c.color === "cyan" ? PALETTE.cyanRim : PALETTE.redRim, near);

  ctx.save();
  ctx.translate(x, y);
  drawTrail(ctx, r, dir, glow);

  // The rock turns and the window does not, which is the whole reason they are
  // two paths in two frames rather than one path with a hole in it. A porthole
  // that rolled with the stone would be a porthole nobody could look through,
  // and the body behind it is drawn upright by `drawLiving` either way — so a
  // turning frame would visibly slide across a body standing still.
  const turn = spin + time * 0.12;
  // The facets and the hole in one path, filled `evenodd`, so the window is
  // never painted at all and the body `drawLiving` already put down shows
  // through it. The first version punched the hole out afterwards with
  // `destination-out`, which took the body with it — the pair got a rock with
  // a grey disc in it and no colour to call.
  //
  // The circle is added inside the rotated frame and is right to be: it is
  // centred on the body, and a circle about the origin is the same circle
  // whichever way the frame is turned. That is what lets the stone roll while
  // the window stays where the eye left it.
  const shell = new Path2D(
    crystalPath(0, 0, r, r, METEOR.sides, METEOR.depth, METEOR.wobble, time * 0.15, METEOR.seed),
  );
  const hole = new Path2D();
  hole.arc(0, 0, glass, 0, Math.PI * 2);
  shell.addPath(hole);

  ctx.save();
  ctx.rotate(turn);
  ctx.fillStyle = "#8A8F9C";
  ctx.fill(shell, "evenodd");
  ctx.save();
  ctx.clip(shell, "evenodd");
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  ctx.restore();
  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(shell);
  ctx.restore();

  drawWindow(ctx, glass, metal, rim, glow);
  ctx.restore();

  // The light escaping past the glass. Small: most of it is behind something,
  // which is the difference between this and a body in the open.
  halo(ctx, x, y, r * 1.3, glow, 0.12);
}

/**
 * The wedge dragged behind it: widest at the rock, gone by the far end, and
 * pointing the way `caromHeading` says the body is going. Drawn in the body's
 * own colour rather than in rock, because what the streak is saying is *this
 * one is alive and it is already past you*.
 */
function drawTrail(ctx: CanvasRenderingContext2D, r: number, dir: number, glow: string): void {
  const back = -dir * r * TRAIL_MUL;
  const tip = -r * TRAIL_MUL * 0.5;
  // Along the wedge rather than across it: a gradient running the other way
  // samples the transparent end everywhere and draws nothing at all.
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
