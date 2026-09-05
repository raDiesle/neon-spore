import { CRAWLER, crawlerPath, crawlerSqueeze } from "@neon-spore/content";
import type { Color, Creature, SimConfig, World } from "@neon-spore/sim";
import { crawlerHeading, linkIsEnd, linkOrder } from "@neon-spore/sim";
import { drawnCol, hazed } from "./depth.js";
import { strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { PLATE, PLATE_RIM } from "./shell-plate.js";

/**
 * THE CRAWLER, drawn one link at a time — a maggot lying along the ship's
 * surface, with a wave of contraction running back down it from the head.
 *
 * **It is not a blob and it is not drawn by `drawLiving`.** A segment of a worm
 * is a ring that is taller across the body than it is long, joined to the next
 * one by a visible neck, and `blobRadiusMul` samples one radius all the way
 * round — every millimetre it gained at the sides it would gain fore and aft
 * too, so a chain drawn that way is a row of lumpy balls with no joints in it.
 * So this file is routed to from `drawCreatures` the way `lid.ts` and
 * `ghost.ts` are, and `living-look.ts` carries `null`.
 *
 * **The neck is drawn and not implied.** A link is one tile from its
 * neighbour, always — where a link stands is its rank among the living, so the
 * gap never changes even when a segment is taken off the middle
 * (`alignCrawler`). Each link that is not the head lays a bar forward into that
 * gap, so what the pair sees is one animal rather than a row of bodies that
 * happen to be level. It is also what makes the magnet legible: the necks
 * stretch for the rest of the beat while the body closes up, because a link
 * that has just snapped is still gliding out of `fromCol`.
 *
 * **The three answers are three materials, and the pair has to tell them apart
 * across a room.** A colour segment is the red or the cyan they already say out
 * loud, lit and glowing. A plate is `PLATE` and `PLATE_RIM` — the same dead
 * grey a shell and a lid wear, imported rather than picked again. The two ends
 * are darker still and edged in the field's own dim, so they recede and every
 * plate stands out of them as a thing the shield is owed (`CAPPED`).
 *
 * Both screens draw all of it. Nothing about a crawler is withheld from either
 * seat — what they cannot see is each other's thumbs (`comms.ts`).
 */

/**
 * How big a link draws, as a share of the tile: the shape's own `rx` and `ry`
 * scaled so the longer of the two — the width across the body — comes to about
 * nine tenths of a tile's half-width. The proportions themselves are
 * `CRAWLER`'s, in `content/crawler-shape.ts`, so the sheet and the field
 * measure one shape.
 */
const SIZE_MUL = 0.46;

/**
 * Whether this link is standing anywhere the field can show it.
 *
 * A worm feeds itself onto the ship a link at a time (`growCrawler`), so for
 * the first several beats most of its body is in a column that is not on the
 * field at all — a negative one, or one past the last. No shot tests those
 * (`occupiesLane`) and nothing about them is a fact the pair can act on, so
 * they are not drawn: a link hanging off the edge of a phone would be a body
 * the pilot can see and can never put the cannon under.
 */
export function linkOnField(cfg: SimConfig, c: Creature, beatPhase: number): boolean {
  const col = drawnCol(c, beatPhase);
  return col > -0.5 && col < cfg.cols - 0.5;
}

/**
 * A plate: dead material with a hard lit edge, exactly the grey a shell and a
 * lid wear. A pair who have learned that hard grey over a body means *not the
 * cannon* should not have to learn it twice in two greys.
 */
const PLATED = { fill: PLATE, rim: PLATE_RIM };

/**
 * An end, and it is deliberately **not** the plate's ink.
 *
 * Both are grey and both refuse the cannon, so for a frame they were one
 * colour — and that was wrong in the way that costs a wave: a pair looking at a
 * grey link has to know instantly whether the shield is owed there, and a head
 * that looked like a plate is a ward spent on the one thing in the game a ward
 * can never touch. So an end is darker and its edge is the field's own dim
 * rather than the plate's bright one: it recedes, and every plate on the body
 * stands out of it as a thing to be answered.
 */
const CAPPED = { fill: PALETTE.rockDark, rim: PALETTE.dim };

/** A segment's own ink. `null` is a plate — the one the shield answers. */
function linkInk(color: Color | null): { fill: string; rim: string } {
  if (color === "red") return { fill: PALETTE.red, rim: PALETTE.redRim };
  if (color === "cyan") return { fill: PALETTE.cyan, rim: PALETTE.cyanRim };
  return PLATED;
}

/**
 * How far through the contraction this link is, −1..1. `crawlerSqueeze` is
 * called rather than re-derived: the offset per link is what runs the wave from
 * the head backwards, and the shape sheet draws the same shape off the same
 * function, so the two can never come apart.
 */
function pulseAt(c: Creature, beats: number): number {
  return crawlerSqueeze(beats, linkOrder(c));
}

/**
 * The bar forward into the gap. Drawn under the body and in the link's own
 * material, so a plate's neck is grey and a cyan segment's glows — the joint
 * belongs to the thing behind it, which is what makes a run of one colour read
 * as a run rather than as three separate arrivals.
 */
function drawNeck(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  l: Layout,
  dir: number,
  ry: number,
  rim: string,
): void {
  const neck = new Path2D();
  neck.moveTo(x, y);
  neck.lineTo(x + dir * l.tile * 0.62, y);
  ctx.lineCap = "round";
  ctx.strokeStyle = rim;
  ctx.globalAlpha = 0.55;
  // A good share of the link's own width: at half of it the run read as beads
  // on a string, which is THE STRAND's picture and the one thing this creature
  // must not be mistaken for.
  ctx.lineWidth = ry * 0.9;
  ctx.stroke(neck);
  ctx.globalAlpha = 1;
}

/**
 * The mouth: a dark hole cut into the leading half of the head, widening and
 * closing on the same wave the body contracts on.
 *
 * **Inside the contour, and nothing outside it.** It sat centred on the leading
 * edge for a frame, with two mandibles hooked off the front — half the slot in
 * open field and the hooks a scribble, a picture that read as a fault rather
 * than as a face. It is the one part of this creature that says which way it is
 * going, so it has to survive the forty pixels a body actually draws at, and at
 * that size a hole is the whole of what a mouth can be.
 */
function drawMouth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: number,
  rx: number,
  ry: number,
  bite: number,
): void {
  const face = x + dir * rx * 0.36;
  const gape = ry * (0.34 + (bite + 1) * 0.1);
  const slot = new Path2D();
  slot.ellipse(face, y, rx * 0.42, gape, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.background;
  ctx.fill(slot);
  ctx.strokeStyle = PLATE_RIM;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(slot);
}

/** The hook on the tail: two short spines trailing off the back, which is what
 * makes the far end read as an end rather than as one more segment. */
function drawHook(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: number,
  rx: number,
  ry: number,
): void {
  ctx.strokeStyle = PLATE_RIM;
  ctx.lineWidth = STROKE.inner;
  for (const side of [-1, 1]) {
    const spine = new Path2D();
    spine.moveTo(x - dir * rx * 0.3, y + side * ry * 0.55);
    spine.quadraticCurveTo(x - dir * rx * 1.1, y + side * ry * 0.8, x - dir * rx * 1.25, y);
    ctx.stroke(spine);
  }
}

/**
 * One link. `ctx` is expected to be inside the perspective transform
 * `drawCreatures` puts every body in, so nothing here scales for distance —
 * only the colour is hazed, which is where distance is spent everywhere else.
 *
 * `beats` drives the contraction and nothing else moves, which is deliberate:
 * a worm the pair is counting links along must not wobble, because a wobble is
 * a column said wrong.
 */
export function drawCrawlerLink(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  x: number,
  y: number,
  beats: number,
  near: number,
): void {
  const cfg: SimConfig = world.cfg;
  const dir = crawlerHeading(c);
  const end = linkIsEnd(world, c);
  const head = end && linkOrder(c) === 0;
  const flat = end ? CAPPED : linkInk(c.color);
  const fill = hazed(cfg, flat.fill, near);
  const rim = hazed(cfg, flat.rim, near);
  // The contraction, as a number both halves of the body read: shorter along
  // the travel axis is fatter across it, so a link keeps its area and the wave
  // reads as a squeeze rather than as a throb.
  const squeeze = pulseAt(c, beats);
  const scale = (l.tile * SIZE_MUL) / CRAWLER.ry;
  const rx = CRAWLER.rx * scale * (1 - CRAWLER.pulse * squeeze);
  const ry = CRAWLER.ry * scale * (1 + CRAWLER.pulse * squeeze);

  if (!head) drawNeck(ctx, x, y, l, dir, ry, rim);

  const body = new Path2D(
    crawlerPath(x, y, CRAWLER.rx * scale, CRAWLER.ry * scale, CRAWLER.pulse, squeeze),
  );
  ctx.fillStyle = fill;
  ctx.fill(body);
  // A living segment throws light and a dead one does not, which is the fastest
  // read on the field: the plates the shield owes are the dark places along a
  // lit animal.
  if (end || c.color === null) {
    ctx.strokeStyle = rim;
    ctx.lineWidth = STROKE.outline;
    ctx.stroke(body);
  } else {
    strokeGlow(ctx, body, rim, STROKE.outline);
  }

  // The seam across the back of every link, which is what a segment *is*.
  const seam = new Path2D();
  seam.moveTo(x, y - ry * 0.82);
  seam.lineTo(x, y + ry * 0.82);
  ctx.strokeStyle = rim;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(seam);
  ctx.globalAlpha = 1;

  if (head) drawMouth(ctx, x, y, dir, rx, ry, pulseAt(c, beats));
  else if (end) drawHook(ctx, x, y, dir, rx, ry);
}
