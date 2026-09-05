import { CRAWLER, crawlerPath, crawlerSqueeze } from "@neon-spore/content";
import {
  type Color,
  type Creature,
  crawlerHeading,
  linkIsEnd,
  linkOrder,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { drawLinkMarks } from "./crawler-marks.js";
import { linkCenter, linkScale } from "./crawler-place.js";
import { drawFace, drawSlime } from "./crawler-skin.js";
import { drawnCol, hazed, nearness } from "./depth.js";
import { strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { PLATE, PLATE_RIM } from "./shell-plate.js";

/**
 * THE CRAWLER, drawn — a maggot lying along the ship's surface, its rings
 * overlapping, with a wave of contraction running back down it from the head.
 *
 * **The whole worm is drawn in one pass, and that is the shape.** It sat in
 * `creature-body.ts` beside the ordinary bodies for a version, one link at a
 * time with a bar drawn into the gap between them, and the owner's answer was
 * a picture of a real maggot: *the segments are attached together as they
 * belong together — no space in between.* That cannot be done body by body.
 * The rings **overlap**, each leading dome lying over the tucked tail of the
 * one behind it, which needs the run drawn back to front — and `byDepth` sorts
 * on the row, which every link of a worm shares. So `drawCreatures` routes a
 * crawler away the way it routes THE GYRE's hub, and this pass draws every
 * worm tail first.
 *
 * **Slime is three passes and none of them is a colour.** A belly shadow along
 * the underside, a specular running along the top, and one wet catchlight per
 * ring that slides with the contraction. Under them the ring is flat, which is
 * what makes the three read as *wet* rather than as a gradient: the light is
 * the thing that moves, and a body only looks alive when the light on it does
 * (`docs/alive.md`).
 *
 * **The two answers are two materials, and the pair has to tell them apart
 * across a room.** A colour ring is the red or the cyan they already say out
 * loud, lit and glowing. Everything colourless is `PLATE` and `PLATE_RIM` —
 * the same dead grey a shell and a lid wear, imported rather than picked
 * again — and that now includes the head and the tail, because they are the
 * shield's like any other plate. The ends wear their own *shapes* rather than
 * their own ink: material says which control, and the silhouette says which
 * way the animal is facing.
 *
 * Both screens draw all of it. Nothing about a crawler is withheld from either
 * seat — what they cannot see is each other's thumbs (`comms.ts`).
 */

/** How big a ring draws, as a share of the tile. `CRAWLER`'s figures are in
 * hundredths of a tile, so this is the whole conversion. */
const UNIT = 0.01;

/**
 * The head: **shorter and taller** than a ring, not simply bigger.
 *
 * A maggot's head is a rounded cap, and scaling a ring up gave a long
 * teardrop with a snout on it — the taper that reads as *this way round* on a
 * body ring reads as a beak on the one at the front. So the head keeps its own
 * proportions and almost none of the taper, and what says which way it faces
 * is the face.
 */
const HEAD = { rx: 0.66, ry: 1.34, taper: 0.05 };
/** And the tail, which is the same ring drawn smaller and tucked. */
const TAIL = { rx: 0.86, ry: 0.78, taper: 1 };

/**
 * A plate: dead material with a hard lit edge, exactly the grey a shell and a
 * lid wear. A pair who have learned that hard grey over a body means *not the
 * cannon* should not have to learn it twice in two greys.
 */
const PLATED = { fill: PLATE, rim: PLATE_RIM };

/** A ring's own ink. `null` is a plate — the one the shield answers. */
function linkInk(color: Color | null): { fill: string; rim: string } {
  if (color === "red") return { fill: PALETTE.red, rim: PALETTE.redRim };
  if (color === "cyan") return { fill: PALETTE.cyan, rim: PALETTE.cyanRim };
  return PLATED;
}

/**
 * Whether this link is standing anywhere the field can show it.
 *
 * A worm feeds itself onto the ship a link at a time (`growCrawler`), so for
 * the first several beats most of its body is in a column that is not on the
 * field at all — a negative one, or one past the last. No shot tests those
 * (`occupiesLane`) and nothing about them is a fact the pair can act on, so
 * they are not drawn: a ring hanging off the edge of a phone would be a body
 * the pilot can see and can never put the cannon under.
 */
export function linkOnField(cfg: SimConfig, c: Creature, beatPhase: number): boolean {
  const col = drawnCol(c, beatPhase);
  return col > -0.6 && col < cfg.cols - 0.4;
}

/**
 * One ring, at the size and place its rank and its part give it.
 *
 * **The depth transform is applied here, about this ring's own centre**, which
 * is the same thing `drawLiving` does to every other body (`creatures.ts`) and
 * for a reason this file learned the hard way. It used to be one transform
 * around the whole run, anchored at `x = 0` — and a scale about the canvas's
 * left edge does not merely enlarge a worm, it *slides* it: a link near the
 * right of the field was drawn better than a column past the column it was
 * standing in, so a pilot with the cannon under the segment they could see
 * fired into an empty lane. Per ring, about its own centre, the centres stay
 * on their columns and the picture and the hit test agree again.
 */
function drawLink(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  beats: number,
  beatPhase: number,
): void {
  const { x, y } = linkCenter(l, c, beatPhase);
  const near = nearness(l, world.cfg.rows - 2);
  const k = linkScale(world, l);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.translate(-x, -y);
  const dir = crawlerHeading(c);
  const end = linkIsEnd(world, c);
  const head = end && linkOrder(c) === 0;
  const flat = linkInk(c.color);
  const fill = hazed(world.cfg, flat.fill, near);
  const rim = hazed(world.cfg, flat.rim, near);
  const squeeze = crawlerSqueeze(beats, linkOrder(c));
  const part = head ? HEAD : end ? TAIL : { rx: 1, ry: 1, taper: 1 };
  const rx = l.tile * CRAWLER.rx * UNIT * part.rx;
  const ry = l.tile * CRAWLER.ry * UNIT * part.ry;
  const taper = CRAWLER.taper * part.taper;
  const body = new Path2D(crawlerPath(x, y, rx, ry, taper, CRAWLER.pulse, squeeze, dir));
  ctx.fillStyle = fill;
  ctx.fill(body);
  drawSlime(ctx, body, x, y, rx * (1 - CRAWLER.pulse * squeeze), ry, dir, squeeze);
  // A living ring throws light and a dead one does not, which is the fastest
  // read on the field: the plates the shield owes are the dark places along a
  // lit animal, and the two ends are darker again.
  if (c.color === null) {
    ctx.strokeStyle = rim;
    ctx.lineWidth = STROKE.outline;
    ctx.stroke(body);
  } else {
    strokeGlow(ctx, body, rim, STROKE.outline);
  }
  if (head) drawFace(ctx, x, y, rx, ry, dir, squeeze);
  ctx.restore();
}

/**
 * Every worm on the field, each drawn tail first so its rings overlap forward.
 *
 * Called from `drawCreatures` before the per-body pass, which skips every
 * `crawler` — THE GYRE's arrangement, and for the sharper version of its
 * reason: a wheel's rim has to be drawn as one thing because the spokes join
 * it, and a worm has to be drawn as one thing because there is nothing joining
 * its rings at all except the order they are painted in.
 *
 * The perspective transform is per ring, inside `drawLink`, and the reason it
 * is not one transform around the whole run is written down there.
 *
 * **The marks go on afterwards, over every ring**, so that a crosshair is
 * never painted under the leading dome of the link in front of it
 * (`crawler-marks.ts`).
 */
export function drawCrawlers(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beats: number,
  beatPhase: number,
): void {
  const links = world.creatures.filter(
    (c) => c.kind === "crawler" && linkOnField(world.cfg, c, beatPhase),
  );
  if (links.length === 0) return;
  // Back to front within each worm: the leading dome of a ring lies over the
  // tucked tail of the one behind it, which is the whole of "no space in
  // between". Sorted on the place along the body rather than on the column, so
  // a worm walking left overlaps the same way one walking right does.
  for (const c of [...links].sort((a, b) => linkOrder(b) - linkOrder(a))) {
    drawLink(ctx, l, world, c, beats, beatPhase);
  }
  for (const c of links) drawLinkMarks(ctx, l, world, c, beats, beatPhase);
}
