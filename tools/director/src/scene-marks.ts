import { type Layout, PALETTE, strokeGlow, tileCX, tileCY } from "@neon-spore/render";
import type { Scene } from "@neon-spore/shape-sheet";

/**
 * The marks: everything a scene draws that is not a body.
 *
 * Cut out of `scene-art.ts` when THE WEIGHT's two new kinds took that file
 * past the 250-line ceiling, along the seam that was already there — one file
 * places contours and animates them, this one draws static furniture over a
 * held frame and knows nothing about the catalogue.
 *
 * Drawn once with the frame rather than every animation frame: none of these
 * is a body and none has an own-motion, and a static line redrawn sixty times
 * a second is sixty copies of the same picture.
 */

/** Canvas coordinates from field coordinates, as `scene-panel.ts` supplies it. */
type ToCard = (x: number, y: number) => { x: number; y: number };

/**
 * A hand, drawn as the field draws one: an amber ring a little wider than the
 * body it has closed on, with the seat named under it.
 *
 * Amber and not bone, which is the draft colour, because a hand is not a
 * proposal — it is the control the pair already has, and `render/grip.ts`
 * gives it `PALETTE.pod` for the reason that file states: the two things in
 * this game that are on the players' side. A hand drawn in the draft colour
 * would read as one more thing nobody has built.
 */
function hand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  player: 1 | 2,
): void {
  const ring = new Path2D();
  ring.arc(x, y, tile * 0.42, 0, Math.PI * 2);
  strokeGlow(ctx, ring, PALETTE.pod, tile * 0.06, 0.9);
  ctx.save();
  ctx.font = `${Math.max(8, tile * 0.28)}px ui-monospace, "IBM Plex Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = PALETTE.pod;
  ctx.fillText(`P${player}`, x, y + tile * 0.5);
  ctx.restore();
}

/**
 * A depth across the field, dashed.
 *
 * Dashed rather than solid, and that is the whole of the difference between
 * this and a tether: a tether is a thing on the field with a body on the end
 * of it, and this is a threshold nobody can see. A solid rule across eleven
 * columns would be read as a floor.
 */
function depth(ctx: CanvasRenderingContext2D, l: Layout, to: ToCard, row: number, s: number): void {
  const a = to(tileCX(l, 0) - l.tile / 2, tileCY(l, row));
  const b = to(tileCX(l, l.cols - 1) + l.tile / 2, tileCY(l, row));
  ctx.save();
  ctx.setLineDash([6 * s, 5 * s]);
  const line = new Path2D();
  line.moveTo(a.x, a.y);
  line.lineTo(b.x, b.y);
  strokeGlow(ctx, line, PALETTE.ember, 1.2 * s, 0.6);
  ctx.restore();
}

/** A scar: a chevron cut into the hull row, in the colour damage already has.
 * Not `scars.ts` — that draws a scar the simulation is carrying, and this one
 * is a claim about a field nobody has played. */
function scar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number): void {
  const cut = new Path2D();
  cut.moveTo(x - w, y - w * 0.5);
  cut.lineTo(x, y + w * 0.6);
  cut.lineTo(x + w, y - w * 0.5);
  strokeGlow(ctx, cut, PALETTE.ember, 1.6, 0.9);
}

export function drawMarks(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  l: Layout,
  toCard: ToCard,
  cardScale: number,
  dpr: number,
): void {
  ctx.save();
  ctx.scale(dpr, dpr);
  const tile = l.tile * cardScale;
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
    if (mark.kind === "line") {
      depth(ctx, l, toCard, mark.row, cardScale);
      continue;
    }
    if (mark.kind === "hand") {
      const at = toCard(tileCX(l, mark.col), tileCY(l, mark.row));
      hand(ctx, at.x, at.y, tile, mark.player);
      continue;
    }
    const at = toCard(tileCX(l, mark.col), tileCY(l, l.rows - 1));
    scar(ctx, at.x, at.y, tile / 2);
  }
  ctx.restore();
}
