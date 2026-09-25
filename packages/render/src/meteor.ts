import { crystalPath, METEOR } from "@neon-spore/content";
import { type Creature, type CreatureKind, isMeteorKind, spanOf } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { keyAxis, type MeteorLook, type RockHit } from "./meteor-look.js";
import { meteorLookFor } from "./meteor-looks.js";
import { rockRadius } from "./rock-size.js";
import { WHOLE, type Window } from "./rock-window.js";

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
 * Whether a body of this kind is drawn by `drawMeteor` on the field — every
 * rock but the torch, which has a flame and a draw of its own (`torch.ts`).
 * The fall replay and the bounce ask this so that what leaves the field is
 * painted by the same hand that painted it coming down: a blaze that turned
 * into a plain grey stone at the shield was the owner's own report.
 */
export function wearsRockLook(kind: CreatureKind): boolean {
  return isMeteorKind(kind) && kind !== "torch";
}

/**
 * Where this rock's holes are, from its own seed — the same arrangement it has
 * had since the craters were written, lifted out of the drawing loop and
 * worked out **before** the body is painted.
 *
 * That is the whole of the move: the places were computed one at a time in the
 * loop that marked them, so a look was told about a hole only after it had
 * already laid down the stone the hole is in, and the most a `pit` could ever
 * be was paint on a finished face. A list built first can be handed to
 * `MeteorLook.body` as well, which is what lets a look answer with material
 * that is missing rather than with a mark (`meteor-look.ts`).
 *
 * The numbers are untouched: the golden angle, the seed's own offset, and a
 * distance that walks out from a third of the radius. Both devices agree on
 * them because `seed` is a number out of the simulation.
 */
function rockHits(seed: number, holes: number, r: number): readonly RockHit[] {
  const out: RockHit[] = [];
  for (let k = 0; k < holes; k++) {
    const a = ((k * 2.399) % (Math.PI * 2)) + (seed % 5) * 0.4;
    const dist = 0.3 + ((k * 7 + seed) % 10) / 28;
    out.push({ x: Math.cos(a) * r * dist, y: Math.sin(a) * r * dist, pr: r * 0.16 });
  }
  return out;
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
 *
 * `within` is where the fire may show when a clip round the rock lets only
 * part of it through — THE CAIRN's pile, and nothing else so far — so the
 * marks that could not show are never built (`rock-window.ts`). In the
 * rock-centred screen frame; the whole screen when left out.
 *
 * `roll` is an extra turn on top of the rock's own slow spin, in radians — a
 * rock rolling off the hull turns by the distance it covered over its radius
 * (`rock-impact.ts`). The body and its pits turn with it; the light does not,
 * because `keyAxis` is taken from the same total turn.
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
  within: Window = WHOLE,
  roll = 0,
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

  const turn = (seed % 13) * 0.48 + time * 0.12 + roll;
  const hits = rockHits(seed, holes, r);
  ctx.save();
  ctx.translate(x, y);

  // The body and its holes turn with the rock; a shell around it does not.
  // Anything glued to a spinning stone reads as painted on, and a field is
  // the one part of a rock that has to read as *not* part of it.
  ctx.save();
  ctx.rotate(turn);
  look.body(ctx, path, r, turn, time, within, hits);
  const { dx, dy } = keyAxis(turn);
  for (const h of hits) look.pit(ctx, h.x, h.y, h.pr, dx, dy, r, time);
  ctx.restore();

  look.shell?.(ctx, r, time);
  ctx.restore();

  halo(ctx, x, y, r * look.haloMul, look.haloColor, look.haloAlpha);
}
