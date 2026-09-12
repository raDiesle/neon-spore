import { crystalPath, METEOR } from "@neon-spore/content";
import { type Creature, spanOf } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { keyAxis, type MeteorLook } from "./meteor-look.js";
import { meteorLookFor } from "./meteor-looks.js";
import { rockRadius } from "./torch.js";

/**
 * The rock. Angular facets rather than a contour, because it does not live —
 * that is the fiction the indestructibility rests on (docs/spec/graphics.md).
 * Craters from shots are placed from the creature id, so both screens agree
 * without the simulation having to store an angle per hole.
 *
 * What the rock is *made of* is not here: it is one of the three `MeteorLook`s
 * in `meteor-looks.ts`, picked by the rock's own seed, which this file drives.
 * This is the placing, the spin and the wobble — everything that is true of
 * any rock however it is painted.
 */
export function drawMeteor(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
): void {
  const spin = (c.id % 13) * 0.48;
  const wobble = Math.sin(time * 1.1 + spin) * l.tile * 0.06;
  drawRockBody(ctx, x + wobble, y, rockRadius(l, spanOf(c)), time, c.id, c.holes);
}

/**
 * The rock itself, at a place and a size somebody else chose.
 *
 * Split out of `drawMeteor` so a rock can be drawn where there is no
 * `Creature` and no `Layout` row to be in — THE PULSE's meteor lane, where one
 * falls down a chart rather than down a column, and the button under it, which
 * wears the same stone. `seed` stands in for the creature id: it is what
 * places the pits and starts the spin, and both devices agree on it because it
 * is a number out of the simulation either way.
 *
 * `look` is what the rock is made of, and left out it is the rock's own pick
 * (`meteorLookFor`) — which is every rock on the field and THE PULSE's chart.
 * PINBALL hands in the grey `STONE_LOOK`: its obstacles are meant to be the
 * boring thing on the table, by the owner's own instruction, and a burning
 * rock is not boring (`pinball-piece.ts`).
 */
export function drawRockBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
  seed: number,
  holes: number,
  look: MeteorLook = meteorLookFor(seed),
): void {
  const d = crystalPath(
    0,
    0,
    r,
    r,
    METEOR.sides,
    METEOR.depth,
    METEOR.wobble,
    time * 0.15,
    METEOR.seed,
  );
  const path = new Path2D(d);

  const turn = (seed % 13) * 0.48 + time * 0.12;
  ctx.save();
  ctx.translate(x, y);

  // The body and its holes turn with the rock; a shell around it does not.
  // Anything glued to a spinning stone reads as painted on, and a field is
  // the one part of a rock that has to read as *not* part of it.
  ctx.save();
  ctx.rotate(turn);
  look.body(ctx, path, r, turn, time);
  const { dx, dy } = keyAxis(turn);
  for (let k = 0; k < holes; k++) {
    const a = ((k * 2.399) % (Math.PI * 2)) + (seed % 5) * 0.4;
    const dist = 0.3 + ((k * 7 + seed) % 10) / 28;
    look.pit(ctx, Math.cos(a) * r * dist, Math.sin(a) * r * dist, r * 0.16, dx, dy);
  }
  ctx.restore();

  look.shell?.(ctx, r, time);
  ctx.restore();

  halo(ctx, x, y, r * look.haloMul, look.haloColor, look.haloAlpha);
}
