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

/**
 * THE VOLLEY's shell: the rock plating a slick or a bulb is sealed inside, and
 * the count of wards still to come, drawn as the plating itself.
 *
 * The body underneath is not drawn here at all. `wornKind` already answers
 * "slick" or "bulb" for a volley, so `creatures.ts` draws an ordinary living
 * body with its ordinary colour and its ordinary own-motion, and this file
 * lays one more object over the top of it — THE CAROM's crust arrangement
 * exactly, and for the crust's reason: what the pair has to read through the
 * shell is the colour, because the colour is the sentence they need ready
 * before the last ward opens it.
 *
 * **It is plates and not a ring, and that is the whole of the drawing
 * decision.** A carom's crust is an annulus because a carom has one state and
 * the ring only has to say *this is rock, and something is alive in it*. This
 * one has to say a **number**, on both screens, at the moment it changes —
 * there is no health bar in this game and THE RECOIL's cage is the precedent
 * for why (`render/recoil.ts`). So the shell is `volleyPlates` wedges of the
 * same faceted crystal `meteor.ts` strokes, laid round the body and clipped to
 * their own sectors, and a ward simply takes one away: three plates is a rock,
 * two is a rock with a hole in it, one is a body wearing a shield, and none is
 * a body. Nothing is dimmed and nothing is labelled — what is left is a gap
 * the colour pours out of, which a phone in a bright room cannot throw away.
 *
 * **The gap leads the way it is going.** The plates are laid from the leading
 * edge round, so the first one lost is the one facing the way the body is
 * travelling: a volley coming down and to the right is bare on its lower right
 * flank, which is the face the shield hit. The shell is visibly worn where the
 * work was done rather than in an arbitrary place.
 *
 * Nothing here is remembered between frames. The count comes off the world,
 * the climb comes off the world, and the shimmer off the wall clock spread by
 * the body's own id — so a restart cannot leave a stale shell behind and two
 * volleys in two lanes are never one drawing done twice (`restart.test.ts` is
 * the gate).
 */

/**
 * How far the shell stands off the body's own tile radius. A little over one,
 * so the living body drawn at the ordinary size sits inside the plating with
 * room for the light to escape between them rather than pressing on it.
 */
const SHELL_MUL = 1.15;
/** How much of the shell's own radius the plating is thick, as a share. The
 * rest is the hole the body shows through — thick enough to read as rock at
 * the top of the field, thin enough that one plate left still reads as *one*. */
const PLATE_MUL = 0.4;
/**
 * The gap left between two neighbouring plates, in radians. A fifth of a
 * radian read as a hairline at the size a phone draws a body — three plates
 * looked like one ring, which is the one thing this shell must never look
 * like. A third of one is about four pixels of the body's own colour showing
 * through at the top of the field, so a whole shell is three bright slots in
 * grey and a shell with a plate off is a third of it plainly gone.
 */
const SEAM = 0.35;
/** How much the shell shudders while a ward is carrying it up, as a share of
 * its radius. Only while climbing: a shell under load looks like one. */
const SHUDDER = 0.05;

/**
 * The shell, over a body that is already drawn. `time` is seconds, for the
 * rock's own shimmer; `near` is `nearness`, so the far rows dim with
 * everything else.
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
  // has already thrown it off the tile it burst over, and what is left falling
  // is an ordinary slick or an ordinary bulb — which the pair has to be able
  // to *see* it is, rather than reading one last shard as something still in
  // the way.
  if (plates <= 0) return;

  const total = Math.max(1, cfg.volleyPlates);
  const r = rockRadius(l, spanOf(c)) * SHELL_MUL * depthScale(cfg, l, drawnRow(c, beatPhase));
  const spin = sinHash(c.id) * 6.3;
  // Which way the leading edge faces: down while it falls, up while a ward is
  // carrying it, and the same `volleyIsClimbing` the simulation steps by — so
  // the worn face and the direction of travel can never point opposite ways.
  const lead = volleyIsClimbing(c) ? -Math.PI / 2 : Math.PI / 2;
  const shudder = volleyIsClimbing(c) ? 1 + SHUDDER * Math.sin(time * 9 + spin) : 1;
  const shell = r * shudder;

  const metal = hazed(cfg, PALETTE.rock, near);
  const glow = hazed(cfg, c.color === "cyan" ? PALETTE.cyan : PALETTE.red, near);

  ctx.save();
  ctx.translate(x, y);
  const sweep = (Math.PI * 2) / total;
  for (let i = 0; i < plates; i++) {
    // Laid from the leading edge round, so plate zero is the one facing the
    // way the body is going and the gap opens on the face the shield hit.
    const from = lead + sweep * (i + 0.5) - sweep / 2 + SEAM / 2;
    drawPlate(ctx, shell, from, sweep - SEAM, spin + time * 0.2, metal, time);
  }
  ctx.restore();

  // The light escaping out of the seams, over the whole thing rather than
  // clipped to the gap: a body sealed in rock that leaked no light at all
  // would be a rock, and the colour is the sentence player 2 has to be
  // holding by the time the last plate goes. It brightens as the shell opens.
  halo(ctx, x, y, r * 1.4, glow, 0.12 + 0.12 * (1 - plates / total));
}

/**
 * One plate: a wedge of the rock's own faceted crystal, clipped to its sector
 * and hollowed out so the body inside is not painted over.
 *
 * The facets are `crystalPath` at the shell's radius rather than a smooth arc,
 * so a plate and the rock it came off are the same material — the pair reads
 * "meteor" from the silhouette before they read a count off it, which is the
 * order the sentence has to arrive in.
 */
function drawPlate(
  ctx: CanvasRenderingContext2D,
  r: number,
  from: number,
  sweep: number,
  turn: number,
  hex: string,
  time: number,
): void {
  const inner = r * (1 - PLATE_MUL);
  const wedge = new Path2D();
  wedge.arc(0, 0, r, from, from + sweep);
  wedge.arc(0, 0, inner, from + sweep, from, true);
  wedge.closePath();

  const rock = new Path2D(
    crystalPath(0, 0, r, r, METEOR.sides, METEOR.depth, METEOR.wobble, time * 0.2, METEOR.seed),
  );

  ctx.save();
  ctx.clip(wedge);
  ctx.save();
  // The unlit mid-tone `meteor.ts` fills with, so a plate and the rock every
  // other body on this field is made of are visibly one material — the light
  // supplies the ends.
  ctx.fillStyle = "#8A8F9C";
  ctx.fill(rock);
  ctx.clip(rock);
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  ctx.restore();
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(rock);
  ctx.restore();

  // The plate's own edges, drawn after the clip is lifted so the seam between
  // two of them is a line rather than a place where two fills meet. This is
  // what makes three plates count as three.
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(wedge);
}
