import { crystalPath, METEOR } from "@neon-spore/content";
import { type Creature, spanOf } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { keyAxis, METEOR_LOOK } from "./meteor-look.js";
import { rockRadius } from "./torch.js";

/**
 * The rock. Angular facets rather than a contour, because it does not live —
 * that is the fiction the indestructibility rests on (docs/spec/graphics.md).
 * Craters from shots are placed from the creature id, so both screens agree
 * without the simulation having to store an angle per hole.
 *
 * What the rock is *made of* is not here: it is `METEOR_LOOK`
 * (`meteor-look.ts`), which this file drives. This is the placing, the spin
 * and the wobble — everything that is true of any rock however it is painted.
 */
export function drawMeteor(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
): void {
  const r = rockRadius(l, spanOf(c));
  const spin = (c.id % 13) * 0.48;
  const wobble = Math.sin(time * 1.1 + spin) * l.tile * 0.06;
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

  const turn = spin + time * 0.12;
  ctx.save();
  ctx.translate(x + wobble, y);

  // The body and its holes turn with the rock; a shell around it does not.
  // Anything glued to a spinning stone reads as painted on, and a field is
  // the one part of a rock that has to read as *not* part of it.
  ctx.save();
  ctx.rotate(turn);
  METEOR_LOOK.body(ctx, path, r, turn, time);
  const { dx, dy } = keyAxis(turn);
  for (let k = 0; k < c.holes; k++) {
    const a = ((k * 2.399) % (Math.PI * 2)) + (c.id % 5) * 0.4;
    const dist = 0.3 + ((k * 7 + c.id) % 10) / 28;
    METEOR_LOOK.pit(ctx, Math.cos(a) * r * dist, Math.sin(a) * r * dist, r * 0.16, dx, dy);
  }
  ctx.restore();

  METEOR_LOOK.shell?.(ctx, r, time);
  ctx.restore();

  halo(ctx, x + wobble, y, r * METEOR_LOOK.haloMul, METEOR_LOOK.haloColor, METEOR_LOOK.haloAlpha);
}
