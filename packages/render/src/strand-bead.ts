import { blobPath } from "@neon-spore/content";
import type { Creature, SimConfig } from "@neon-spore/sim";
import { contourClock } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The two bodies THE STRAND draws that are **not** a slick or a bulb: the
 * sealed bead player 2 sees in place of one, and the raisin either seat sees
 * once it has been shot.
 *
 * Its own file beside `strand.ts`, which is the thread and the mark on it.
 * These are contours; that is a line between them, and the two change for
 * different reasons.
 *
 * **The sealed bead has to say nothing at all about colour, and the shape is
 * half of that.** Drawing the real body in grey would not do it: a slick is
 * flat and wide and a bulb is round with nine lobes, so the silhouette alone
 * names the colour to anybody who has played one wave — "one kind, one colour,
 * one shape" cuts both ways. So the navigator's bead is a shape neither of
 * them is, and it is deliberately the plainest one this game has: a smooth
 * ovoid with a wet socket in it, which reads as *a thing with a lid on* and
 * cannot be mistaken for a body that is merely far away.
 *
 * **The raisin is the same bead with the life taken out of it.** Small, dark,
 * deeply lobed, no glow — and drawn on *both* screens, because how far along
 * the thread the pair has got is the one fact about this creature that is not
 * split. It is also the only readout either of them has: a shot at the wrong
 * bead swells one of these back, so a pair who cannot see them cannot see the
 * mistake either (`strand-round.ts`).
 */

/** How much of a body's footprint a sealed bead takes. A shade under one, so a
 * thread of them reads as beads on a line rather than as a row of bodies that
 * happen to be touching. */
const SEALED_MUL = 0.86;

/** And a raisin: less than half. The step is what says *this one is done*, and
 * it is a step rather than an ease for `RIND_LAYER_MUL`'s reason — a size that
 * eases is a body breathing, and a size that jumps is an event. */
const RAISIN_MUL = 0.42;

/** The sealed bead's shell, and the socket in it. Violet, which is the palette's
 * own "no colour" — `wisp` was chosen for a body either shot kills, and this is
 * a body neither seat may name a shot for yet. */
const SHELL = PALETTE.wisp;
const SHELL_RIM = PALETTE.wispRim;

/** A spent bead: the rock's dark, which is the one neutral in the palette that
 * is plainly not alive. */
const DEAD = PALETTE.rockDark;
const DEAD_RIM = PALETTE.sparkDim;

/** The contour both of them are cut from: six shallow lobes on an ovoid a
 * little taller than it is wide. Six is free — slick is 2, dart 3, wisp 5,
 * throb 6 — and a throb is round while this is not, which is the whole of what
 * separates them at the size a phone draws. */
const LOBES = 6;

/**
 * One bead with its lid on, as player 2 sees every live bead on a thread.
 *
 * `beats` is unused on purpose and is not taken: a sealed bead does not
 * breathe on the beat. Everything else on this field that is alive does, and
 * a bead that held still is the one picture that says *this is a container and
 * not a creature* without saying anything about what is in it.
 */
export function drawSealedBead(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  near: number,
): void {
  const haze = (h: string): string => hazed(cfg, h, near);
  const r = l.tile * 0.4 * SEALED_MUL;
  const t = contourClock(c.id, time);
  const shell = new Path2D(blobPath(x, y, r * 0.9, r, LOBES, 0.09, 0.03, t, 4.5));
  ctx.fillStyle = haze(PALETTE.background);
  ctx.fill(shell);
  strokeGlow(ctx, shell, haze(SHELL), STROKE.outline);
  // The socket: a smaller loop set high in the shell, the same wet opening the
  // ship's own controls carry. It is what makes a bead read as a thing that
  // could open rather than a pebble — and it is drawn in the rim colour so
  // that the one bright thing on a sealed bead is plainly not a body's colour.
  const socket = new Path2D(blobPath(x, y - r * 0.18, r * 0.42, r * 0.34, LOBES, 0.14, 0.05, t, 9));
  ctx.fillStyle = haze(PALETTE.background);
  ctx.fill(socket);
  strokeGlow(ctx, socket, haze(SHELL_RIM), STROKE.inner);
}

/**
 * One bead that has been shot: shrivelled, dark, and still hanging on the
 * thread. Drawn on both screens.
 */
export function drawRaisin(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  near: number,
): void {
  const haze = (h: string): string => hazed(cfg, h, near);
  const r = l.tile * 0.4 * RAISIN_MUL;
  const t = contourClock(c.id, time);
  // Deep lobes and a slow wobble: a body that has lost its water pulls in
  // between its own ribs rather than staying round, and the creases are the
  // only thing this shape has to say.
  const body = new Path2D(blobPath(x, y, r, r * 0.86, LOBES, 0.34, 0.02, t, 2.5));
  ctx.fillStyle = haze(DEAD);
  ctx.fill(body);
  ctx.strokeStyle = haze(DEAD_RIM);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(body);
  // The one thing left of it, and it is barely there: a spent bead throws no
  // light of its own, so what stands in for the glow every living body has is
  // the faintest lift off the thread it is hanging on.
  halo(ctx, x, y, r * 1.6, haze(DEAD_RIM), 0.1);
}
