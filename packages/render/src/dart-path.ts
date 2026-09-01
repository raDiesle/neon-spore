import { blobPath, livingSilhouette } from "@neon-spore/content";
import {
  type Creature,
  DART_ROWS,
  dartHeading,
  dartNextHeading,
  dartStepCol,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { contourClock, creatureCenter } from "./creature-place.js";
import { dartHex, drawDartArrow, LEAN_HOLD, showsDartArrow } from "./dart.js";
import { depthScale } from "./depth.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * Where a dart is going, drawn for the seat that is allowed to know: two
 * dotted legs and a hollow body standing on the tile it is about to occupy.
 *
 * **The arrow used to be the whole message, and it was on screen for half a
 * cycle.** It could only appear while the body hung, because until the body
 * landed nothing knew which way it would go next — so player 2 read a word,
 * said it, and then both of them watched a whole beat go by with nothing on
 * the screen to check it against. `dartNext` in sim/ moves the roll one beat
 * earlier, and this file is what that buys: the side of the next diagonal is
 * up *while the current one is still being flown*.
 *
 * Three marks, one statement, and deliberately not three signals:
 *
 *  - the **dotted legs** are the shape of the whole plan, the leg being flown
 *    and the one after it, bending once in the middle;
 *  - the **placeholder** is the near end of it — the tile the body will stand
 *    in, drawn as that body's own hollow contour, so that arriving *fits*
 *    rather than merely reaching;
 *  - the **arrow** sits where the move it names begins and points down that
 *    diagonal. It is the mark that was already here, unmoved.
 *
 * The arrow and the placeholder are continuous across the arrival, and that is
 * the point rather than an accident of the arithmetic. While the body runs,
 * both stand on the tile it is running to; it lands inside them; neither
 * moves. They step forward together on the beat it launches again. So the pair
 * watches one mark being *reached* and then one mark being *set*, instead of a
 * label blinking on and off twice a cycle.
 *
 * **This is the field's first trajectory line.** `field.ts` says there are
 * deliberately none (docs/spec/systems.md 5.8) and that still holds for every
 * other body: a rock's column is true from the radar to the hull, so a line
 * would only be reading the field out loud for the pair. A dart's column
 * expires while you are saying it. The line is on one screen, and player 1 —
 * who has to stand the cannon in that column — is still told nothing.
 */

/** Where the previewed path bends, and where it ends, in field tiles. */
export interface DartLegs {
  /** The tile the body will next stand on — the placeholder's home. */
  next: { col: number; row: number };
  /** And the one after it: the far end of the dotted line. */
  after: { col: number; row: number };
}

/**
 * The two legs a dart is committed to right now.
 *
 * While it hangs, both are ahead of it: the move it is aiming, and the one
 * rolled behind that. While it runs, the near leg is the run itself — its
 * landing tile is already `c.col`/`c.row`, because the simulation moves a
 * creature on the beat and render glides it there afterwards.
 *
 * `dartStepCol` rather than `col + DART_COLS * dir` written out, for the
 * reason purity.test.ts keeps a table: the clamp at the edge of the field is a
 * rule, and a preview that bent where the body will not is worse than no
 * preview at all.
 */
export function dartLegs(c: Creature, cols: number): DartLegs {
  const after = dartNextHeading(c);
  if (c.dartFloat) {
    const col = dartStepCol(c.col, cols, dartHeading(c));
    return {
      next: { col, row: c.row + DART_ROWS },
      after: { col: dartStepCol(col, cols, after), row: c.row + 2 * DART_ROWS },
    };
  }
  return {
    next: { col: c.col, row: c.row },
    after: { col: dartStepCol(c.col, cols, after), row: c.row + DART_ROWS },
  };
}

/** Dash pitch, in tiles. Long enough to still be a line at a 26 px tile. */
const DASH = 0.2;
/** The far leg's alpha. The near one carries this plus its own weight. */
const LEG_ALPHA = 0.3;

export function drawDartGuides(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  if (!showsDartArrow(l)) return;
  for (const c of world.creatures) {
    if (c.kind !== "dart") continue;
    const legs = dartLegs(c, world.cfg.cols);
    const from = creatureCenter(l, c, beatPhase);
    const bend = { x: tileCX(l, legs.next.col), y: tileCY(l, legs.next.row) };
    const end = { x: tileCX(l, legs.after.col), y: tileCY(l, legs.after.row) };
    const hex = dartHex(c);

    // Nothing about a plan is drawn outside the field the plan happens in: the
    // far leg of a dart near the hull runs off the bottom of the grid, and a
    // dotted line lying across the ship reads as something aimed at the ship.
    ctx.save();
    ctx.beginPath();
    ctx.rect(l.gridLeft, l.gridTop, l.cols * l.tile, l.rows * l.tile);
    ctx.clip();

    drawLegs(ctx, l, from, bend, end, hex, beatPhase);
    // Brightest at the instant of arrival, so the last thing to happen before
    // the body lands in the outline is the outline coming up to meet it.
    const settle = c.dartFloat ? 0.55 : 0.55 + 0.45 * beatPhase;
    drawPlaceholder(ctx, l, world.cfg, c, bend.x, bend.y, legs.next.row, hex, settle, time);
    ctx.restore();

    // The arrow, over the tile the move it names starts from: the body itself
    // while that body is standing still, the placeholder while the body is on
    // its way into it. Both its place and its direction are unchanged across
    // the arrival, which is the whole of why it does not blink.
    const at = c.dartFloat ? from : bend;
    const row = c.dartFloat ? c.row : legs.next.row;
    const dir = c.dartFloat ? dartHeading(c) : dartNextHeading(c);
    drawDartArrow(ctx, at.x, at.y, tileRadius(l, world.cfg, row), dir, hex);
  }
}

/** A body's drawn radius on a row nothing is standing on yet. */
function tileRadius(l: Layout, cfg: SimConfig, row: number): number {
  return l.tile * 0.4 * depthScale(cfg, l, row);
}

/**
 * The two legs. Dashed, in the body's own colour, and drifting toward the
 * target at the beat's own pace — a still dotted line reads as a wall, and the
 * one thing this line has to say is *this way*.
 */
function drawLegs(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: { x: number; y: number },
  bend: { x: number; y: number },
  end: { x: number; y: number },
  hex: string,
  beatPhase: number,
): void {
  const dash = l.tile * DASH;
  ctx.save();
  ctx.strokeStyle = hex;
  ctx.lineCap = "round";
  ctx.setLineDash([dash * 0.34, dash]);
  ctx.lineDashOffset = -beatPhase * dash * 1.34;

  // The leg being flown carries more weight than the one after it: the pair is
  // acting on the first and only listening to the second.
  ctx.lineWidth = Math.max(1.4, l.tile * 0.055);
  ctx.globalAlpha = LEG_ALPHA + 0.3;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(bend.x, bend.y);
  ctx.stroke();

  ctx.lineWidth = Math.max(1.2, l.tile * 0.04);
  ctx.globalAlpha = LEG_ALPHA;
  ctx.beginPath();
  ctx.moveTo(bend.x, bend.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  ctx.restore();
}

/**
 * The tile the body is about to stand in, drawn as the body: the contour
 * `creatures.ts` fills, at the size that row draws at, in the pose it will
 * hold when it gets there — hollow, so that what arrives is the thing that
 * fills it in.
 *
 * A ring or a square would have been less code and a different sentence. "A
 * dart is going to be here" is what the pair says out loud, and a dart-shaped
 * hole is the only mark that says it without a legend.
 */
function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  row: number,
  hex: string,
  alpha: number,
  time: number,
): void {
  // Through `livingSilhouette`, not the DART record by name: it is the rule
  // for which contour a kind wears, and `creatures.ts` fills what it returns.
  // A second answer here is an outline the body could stop fitting.
  const shape = livingSilhouette("dart");
  const scale = tileRadius(l, cfg, row) / Math.max(shape.rx, shape.ry);
  // The wobble the body itself will be wearing when it lands, so the outline
  // is that body's shape rather than a smoothed idea of one.
  const t = contourClock(c.id, time);
  const path = new Path2D(
    blobPath(0, 0, shape.rx, shape.ry, shape.lobes, shape.depth, shape.wobble, t, shape.seed, 28),
  );
  // Whichever beat it is on, the body will be *hanging* when it reaches this
  // tile, aiming the move `dartNext` names — so one call answers both cases,
  // and the outline leans the way the body will lean inside it.
  const dir = dartNextHeading(c);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(dir * LEAN_HOLD * 0.35);
  ctx.scale(scale * dir, scale);
  ctx.strokeStyle = hex;
  ctx.globalAlpha = alpha * 0.8;
  ctx.lineWidth = 2.2 / scale;
  // Fine enough that the contour survives being broken up. The first pitch
  // tried here was 9 and 7 px, which put eight dashes around a 130 px
  // perimeter: at that spacing the outline stops being a dart and becomes a
  // scatter of marks near a tile, which is a different sentence.
  ctx.setLineDash([4 / scale, 3.5 / scale]);
  ctx.stroke(path);
  ctx.setLineDash([]);
  ctx.restore();
}
