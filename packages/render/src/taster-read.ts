import {
  spentOver,
  type TasterState,
  tasterOrder,
  tasterWindow,
  type World,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsTasterNext, showsTasterTally } from "./view-role.js";

/**
 * **What is written about THE TASTER's fan, and which seat is shown it.**
 *
 * Its own file beside `taster-draw.ts`, the seam `gorge-draw.ts` keeps inside
 * one: the fan is a picture both seats see whole, and these two marks are the
 * sentence each of them has to say about it. Every other boss's split hides
 * *part of the body* from a seat; this one hides nothing at all — both screens
 * see every blade and every edge — and gives each seat one number the other
 * has not got. The encounter is what they do with that.
 *
 * Neither seat is ever shown the colour the beam has to be. It is the other
 * side of the count the navigator is already reading (`tasterWeak`), and a
 * picture that named it would answer the fight it was drawn to pose.
 */

/**
 * **The navigator's readout**: what the pair has spent of each colour over the
 * window the fan is tasting, as two counts under the middle of the crest.
 *
 * Hers because she owns the colours, and because this is the first fact in
 * this game that is about the two of *them* rather than about the field
 * (`sim/spend.ts`). It is the raw pair of numbers and nothing else: no bar, no
 * winner marked, no colour named. Which of the two is larger is the sentence
 * she says out loud — *nine red to four, give me cyan* — and a picture that
 * said it for her would take the whole conversation away. The boss's own rule
 * is the only thing in the stack allowed to read this ledger for anybody, and
 * `packages/sim/test/copies-table.ts` carries the row that keeps it that way.
 *
 * The window is the fan's own (`tasterWindow`), so the readout shortens with
 * the fight: the same two numbers over twelve beats instead of thirty, which
 * is the third movement arriving in her hands rather than in a message.
 */
export function drawTasterTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  t: TasterState,
  /** The crest's top, which both marks hang off (`tasterCrestY`). */
  y: number,
  /** The ridge's thickness this frame: the numbers are written *on* it. */
  thick: number,
): void {
  if (!showsTasterTally(l.role)) return;
  const beats = tasterWindow(t, world.cfg);
  const red = spentOver(world, beats, "red");
  const cyan = spentOver(world, beats, "cyan");
  const size = Math.max(8, Math.min(13, l.tile * 0.36));
  const x = tileCX(l, t.col + Math.floor(t.blades.length / 2));
  ctx.save();
  ctx.font = `600 ${Math.round(size)}px "Courier New",monospace`;
  // On the ridge rather than under it. Under it was the first drawing, and one
  // frame of the wave was enough to kill it: the middle column is where the
  // arrivals converge, so the two numbers were written over a falling slick
  // every few beats — in the one readout of this fight that has to be read.
  // The band is above row 0, so nothing on the field can cross them there.
  ctx.textBaseline = "middle";
  const mid = y + thick * 0.5;
  ctx.textAlign = "right";
  ctx.fillStyle = PALETTE.red;
  ctx.fillText(String(red), x - size * 0.3, mid);
  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.cyan;
  ctx.fillText(String(cyan), x + size * 0.3, mid);
  ctx.restore();
}

/**
 * **The pilot's mark**: a chevron on the ridge under the column the crest
 * opens next, taken from the fan's own order (`tasterOrder`).
 *
 * His because he owns the column: the seat that has to be standing under a
 * blade before it decides is the seat told where the next one is coming out.
 * It is one blade ahead of anything the world shows — a blade already growing
 * is on both screens — and it says nothing whatever about the colour, which
 * is hers.
 *
 * Only the first of them, and only while the fan has somewhere left to open:
 * once every blade has grown or gone there is no next column, and the ridge
 * carries no mark at all.
 */
export function drawTasterNext(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  t: TasterState,
  y: number,
  /** The crest's breath, so the mark moves with the thing it is drawn on. */
  breath: number,
): void {
  if (!showsTasterNext(l.role)) return;
  for (const i of tasterOrder(t.blades.length)) {
    const k = t.blades[i];
    if (k === undefined || k.shorn || k.growBeat >= 0) continue;
    const x = tileCX(l, t.col + i);
    const d = l.tile * (0.17 + 0.03 * breath);
    const mark = new Path2D();
    mark.moveTo(x - d, y + d * 0.9);
    mark.lineTo(x, y + d * 0.2);
    mark.lineTo(x + d, y + d * 0.9);
    strokeGlow(ctx, mark, PALETTE.hull, STROKE.inner, 0.45 + 0.25 * breath);
    return;
  }
}
