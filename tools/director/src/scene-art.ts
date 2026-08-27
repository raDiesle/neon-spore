import { type Layout, PALETTE, STROKE, strokeGlow, tileCX, tileCY } from "@neon-spore/render";
import {
  boundsOver,
  CATALOGUE,
  type CatalogueEntry,
  contourAt,
  type Scene,
  type SceneTint,
  type Subject,
} from "@neon-spore/shape-sheet";
import { FIT_TIMES } from "./shape-figure.js";

/**
 * The unbuilt half of a scene, drawn over a real frame of the game.
 *
 * Two canvases, stacked, and the split is the argument. Underneath is
 * `frameWorld` — the shipping renderer against a real `World`, so the ship,
 * the band, the radar strip and every creature the game already has are the
 * game and not an impression of it. On top is this: the contours nothing in
 * the simulation can draw, because a draft has no `CreatureKind` and no entry
 * in `CREATURES`, placed at the same tile the frame underneath was drawn with.
 *
 * What is built is drawn by the game; what is proposed is drawn as a proposal.
 * A picture that blurred that line would be the worst kind of reference — one
 * a reader cannot tell the difference in.
 *
 * The overlay moves and the frame under it does not. That is not laziness: the
 * frame is a *state*, one moment held, the same claim the STATES sheet makes,
 * while a draft's own-motion is most of what is being asked about. Redrawing
 * the whole world at sixty frames for every open scene would spend the
 * director's budget on the half that is already decided.
 */

/**
 * What an unbuilt body is drawn in.
 *
 * `draft` is bone rather than any of the field's own colours, and that is
 * deliberate: cyan is a bulb and red is a slick, so a proposal wearing either
 * would be claiming a kind it has not been given. Bone appears nowhere on the
 * field as a body, so it reads as a drawing laid over a photograph — which is
 * exactly what it is. A scene names a real colour only where the mechanic is
 * about colour, and then it gets the game's own value.
 */
/**
 * How much of its lane a body takes unless a scene says otherwise. The game's
 * own number: `tile * 0.4` of radius is `tile * 0.8` across, and `torchRadius`
 * gives a two-column torch exactly twice that.
 */
const LANE_FILL = 0.8;

const TINT: Record<SceneTint, string> = {
  draft: PALETTE.text,
  red: PALETTE.red,
  cyan: PALETTE.cyan,
  rock: PALETTE.rock,
  pod: PALETTE.pod,
};

export interface Placed {
  /** Canvas pixels per contour pixel — the fit that makes a body creature-sized. */
  scale: number;
  centre: { x: number; y: number };
  tile: number;
  color: string;
  /** Radians clockwise, applied before the own-motion's own rotation. */
  turn: number;
  /**
   * The contour's own middle, which is not its origin. A blob is sampled about
   * (0, 0) and an arm is sampled hanging off a pivot, so placing both by their
   * origin puts the arm half a body to one side of the column it was given —
   * and a scene's whole vocabulary is columns. Everything is placed by the
   * middle of what it draws, the same pivot `shape-figure.ts` fits a card to.
   */
  mid: { x: number; y: number };
  ghost: boolean;
  label?: string;
  entry: CatalogueEntry;
}

/**
 * How big an unbuilt body draws, in the frame's own pixels.
 *
 * `render/creatures.ts` fits a living creature into a circle of `tile * 0.4`
 * by scaling its longest half-axis to that radius, and `torchRadius` answers
 * the same question for something wider: a torch spans two columns and draws
 * at `tile * 0.8`. So `span * tile * 0.4` is the game's own rule for a body
 * `span` columns wide, called rather than re-derived — which is why a boss
 * five columns wide draws four lanes across here and not five. Nothing in the
 * game fills its own lane edge to edge.
 *
 * A draft has no declared half-axes — several of them are traced rather than
 * parameterised — so the longest half of the sampled contour stands in for
 * one. It runs a hair small against a lobed blob, whose sampled edge bulges
 * past its nominal `rx`, and small is the right direction to be wrong in on a
 * page whose whole question is whether something is legible.
 */
function bodyScale(subject: Subject, tile: number, span: number, fill: number): number {
  const b = boundsOver(subject, FIT_TIMES);
  const half = Math.max(b.x1 - b.x0, b.y1 - b.y0) / 2;
  return half > 0 ? (span * tile * fill) / 2 / half : 1;
}

/** Every body in a scene, resolved against the catalogue and the frame's layout. */
export function placeBodies(
  scene: Scene,
  l: Layout,
  toCard: (x: number, y: number) => { x: number; y: number },
  cardScale: number,
): Placed[] {
  const out: Placed[] = [];
  for (const body of scene.bodies) {
    const entry = CATALOGUE.find((e) => e.subject.name === body.shape);
    if (!entry) continue;
    const span = body.span ?? 1;
    // A wide body is centred on the lanes it covers, the way `spanCenterCol`
    // centres a torch — a boss drawn from its leftmost column would stand half
    // off the field.
    const centre = toCard(tileCX(l, body.col + (span - 1) / 2), tileCY(l, body.row));
    const b = boundsOver(entry.subject, FIT_TIMES);
    out.push({
      scale: bodyScale(entry.subject, l.tile, span, body.fill ?? LANE_FILL) * cardScale,
      centre,
      tile: l.tile * cardScale,
      color: TINT[body.tint ?? "draft"],
      turn: ((body.turn ?? 0) * Math.PI) / 180,
      mid: { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 },
      ghost: body.ghost === true,
      label: body.label,
      entry,
    });
  }
  return out;
}

/**
 * One frame of the overlay.
 *
 * The own-motion is applied exactly as `render/creatures.ts` applies it —
 * offsets in tiles multiplied by the frame's own tile, then rotation and
 * scale about the body's centre. A draft that swayed by a different rule here
 * would be a draft nobody could compare to the bulb standing next to it.
 */
export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  placed: Placed[],
  t: number,
  dpr: number,
): void {
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const p of placed) {
    const pose = p.entry.motion?.poseAt(t) ?? { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 };
    ctx.save();
    ctx.translate(p.centre.x + pose.dx * p.tile, p.centre.y + pose.dy * p.tile);
    ctx.rotate(p.turn + pose.rot);
    ctx.scale(p.scale * pose.sx, p.scale * pose.sy);
    ctx.translate(-p.mid.x, -p.mid.y);
    const path = new Path2D(contourAt(p.entry.subject, t));
    if (p.ghost) {
      // No glow and a thin line: a copy the other screen holds is not a thing
      // in this field, and drawing it as brightly as the body would say it is.
      ctx.globalAlpha = 0.34;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = STROKE.outline / p.scale;
      ctx.setLineDash([6 / p.scale, 5 / p.scale]);
      ctx.stroke(path);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    } else {
      strokeGlow(ctx, path, p.color, STROKE.outline / p.scale, 0.8);
    }
    ctx.restore();
    if (p.label) label(ctx, p.centre.x, p.centre.y + p.tile * 0.5, p.label);
  }
  ctx.restore();
}

function label(ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void {
  ctx.save();
  ctx.font = '9px ui-monospace, "IBM Plex Mono", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(text, x, y + 4);
  ctx.restore();
}

/**
 * The marks: a tether down a column, a scar at one, a lane called out.
 *
 * Drawn once with the frame rather than every animation frame — none of them
 * is a body and none of them has an own-motion, and a static line redrawn
 * sixty times a second is sixty copies of the same picture.
 */
export function drawMarks(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  l: Layout,
  toCard: (x: number, y: number) => { x: number; y: number },
  cardScale: number,
  dpr: number,
): void {
  ctx.save();
  ctx.scale(dpr, dpr);
  for (const mark of scene.marks ?? []) {
    if (mark.kind === "lane") {
      const span = mark.span ?? 1;
      const a = toCard(tileCX(l, mark.col) - l.tile / 2, tileCY(l, 0) - l.tile / 2);
      const b = toCard(tileCX(l, mark.col + span - 1) + l.tile / 2, tileCY(l, l.rows - 1));
      ctx.fillStyle = "rgba(242,233,220,.06)";
      ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
      continue;
    }
    if (mark.kind === "tether") {
      const a = toCard(tileCX(l, mark.col), tileCY(l, mark.fromRow));
      const b = toCard(tileCX(l, mark.col), tileCY(l, mark.toRow));
      const line = new Path2D();
      line.moveTo(a.x, a.y);
      line.lineTo(b.x, b.y);
      strokeGlow(ctx, line, PALETTE.text, 1.6 * cardScale, 0.7);
      continue;
    }
    // A scar: a chevron cut into the hull row, in the colour damage already
    // has. Not `scars.ts` — that draws a scar the simulation is carrying, and
    // this one is a claim about a field nobody has played.
    const at = toCard(tileCX(l, mark.col), tileCY(l, l.rows - 1));
    const w = (l.tile * cardScale) / 2;
    const cut = new Path2D();
    cut.moveTo(at.x - w, at.y - w * 0.5);
    cut.lineTo(at.x, at.y + w * 0.6);
    cut.lineTo(at.x + w, at.y - w * 0.5);
    strokeGlow(ctx, cut, PALETTE.ember, 1.6 * cardScale, 0.9);
  }
  ctx.restore();
}
