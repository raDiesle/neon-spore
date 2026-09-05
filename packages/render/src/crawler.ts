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
import { drawFace, drawSlime } from "./crawler-skin.js";
import { creatureCenter } from "./creature-place.js";
import { depthScale, drawnCol, hazed, nearness } from "./depth.js";
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
 * **The three answers are three materials, and the pair has to tell them apart
 * across a room.** A colour ring is the red or the cyan they already say out
 * loud, lit and glowing. A plate is `PLATE` and `PLATE_RIM` — the same dead
 * grey a shell and a lid wear, imported rather than picked again. The two ends
 * are darker still and edged in the field's own dim, so they recede and every
 * plate stands out of them as a thing the shield is owed.
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
 * How far below its tile's centre a ring is drawn, as a share of a tile.
 *
 * A crawler stands on `crawlRow` — the row the shield reaches, one above the
 * ship's own — because that is the only row both the cannon and the dome can
 * answer (`sim/crawler.ts`). Drawn on the centre of it, the worm floats a whole
 * tile clear of the hull and reads as a thing flying alongside the ship rather
 * than crawling on it. So the picture comes down to meet the plating while the
 * rule stays where the two controls can reach it — the same licence
 * `shieldRow` itself takes, and the reason it exists.
 */
const SIT = 0.52;

/**
 * A plate: dead material with a hard lit edge, exactly the grey a shell and a
 * lid wear. A pair who have learned that hard grey over a body means *not the
 * cannon* should not have to learn it twice in two greys.
 */
const PLATED = { fill: PLATE, rim: PLATE_RIM };

/**
 * An end, and it is deliberately **not** the plate's ink.
 *
 * Both are grey and both refuse the cannon, so for a version they were one
 * colour — and that was wrong in the way that costs a wave: a pair looking at a
 * grey ring has to know instantly whether the shield is owed there, and a head
 * that looked like a plate is a ward spent on the one thing in the game a ward
 * can never touch.
 */
const CAPPED = { fill: PALETTE.rockDark, rim: PALETTE.dim };

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

/** One ring, at the size and place its rank and its part give it. */
function drawLink(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  beats: number,
  beatPhase: number,
): void {
  const { x, y: tileY } = creatureCenter(l, c, beatPhase);
  const y = tileY + l.tile * SIT;
  const near = nearness(l, world.cfg.rows - 2);
  const dir = crawlerHeading(c);
  const end = linkIsEnd(world, c);
  const head = end && linkOrder(c) === 0;
  const flat = end ? CAPPED : linkInk(c.color);
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
  if (end || c.color === null) {
    ctx.strokeStyle = rim;
    ctx.lineWidth = STROKE.outline;
    ctx.stroke(body);
  } else {
    strokeGlow(ctx, body, rim, STROKE.outline);
  }
  if (head) drawFace(ctx, x, y, rx, ry, dir, squeeze);
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
 * The perspective transform is applied once around the whole run rather than
 * per body: every link of a worm stands on the same row, so `depthScale`
 * answers the same number for all of them, and one transform is one save.
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
  const row = world.cfg.rows - 2;
  const k = depthScale(world.cfg, l, row);
  const { y } = creatureCenter(l, links[0]!, beatPhase);
  ctx.save();
  ctx.translate(0, y);
  ctx.scale(k, k);
  ctx.translate(0, -y);
  // Back to front within each worm: the leading dome of a ring lies over the
  // tucked tail of the one behind it, which is the whole of "no space in
  // between". Sorted on the place along the body rather than on the column, so
  // a worm walking left overlaps the same way one walking right does.
  for (const c of [...links].sort((a, b) => linkOrder(b) - linkOrder(a))) {
    drawLink(ctx, l, world, c, beats, beatPhase);
  }
  ctx.restore();
}
