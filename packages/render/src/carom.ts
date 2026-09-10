import { type Creature, caromHeading, type SimConfig, spanOf } from "@neon-spore/sim";
import { CAROM_LOOK, type CrustDraw } from "./carom-look.js";
import { drawWindow } from "./carom-window.js";
import { depthScale, drawnRow, hazed } from "./depth.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
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
 * **The rock and the streak are both drawn through `CAROM_LOOK`**, which is
 * where their code now lives: `carom-look.ts` is the one record a candidate
 * crust patches, and this file gathers the lengths and the colours and hands
 * the record a `CrustDraw`. Nothing about what ships moved with it.
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
  const dark = hazed(cfg, PALETTE.rockDark, near);
  const ember = hazed(cfg, PALETTE.ember, near);

  // The rock turns and the window does not, which is the whole reason they are
  // two drawings rather than one path with a hole in it. A porthole that rolled
  // with the stone would be a porthole nobody could look through, and the body
  // behind it is drawn upright by `drawLiving` either way — so a turning frame
  // would visibly slide across a body standing still.
  const d: CrustDraw = {
    ctx,
    r,
    glass,
    dir,
    turn: spin + time * 0.12,
    time,
    metal,
    glow,
    rim,
    x,
    y,
    phase: spin,
    dark,
    ember,
  };

  ctx.save();
  ctx.translate(x, y);
  // The streak first, so the rock stands on top of what it has left behind.
  CAROM_LOOK.travel(d);
  CAROM_LOOK.shell(d);
  // The window is not in the record and is not in the question: it is what the
  // pair reads a *colour* through, and a slot that moved it would be asking two
  // things at once (`carom-look.ts`).
  drawWindow(ctx, glass, metal, rim, glow);
  ctx.restore();

  // The light escaping past the glass. Small: most of it is behind something,
  // which is the difference between this and a body in the open.
  halo(ctx, x, y, r * 1.3, glow, 0.12);
}
