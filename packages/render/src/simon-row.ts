import { type MirrorStep, mirrorListenBeats } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type SeatSkin, seatSkin } from "./seat-skin.js";
import { drawStepGlyph, stepHex, stepShort } from "./simon-glyph.js";

/**
 * The row of slots a Simon round lives in, above the field.
 *
 * There is always one slot per step of the round, from the first beat of the
 * demonstration to the last answer — the row never changes width or position,
 * so the pair can count what is left without reading anything. A slot holds
 * either the control it stands for or a question mark, and which of those it
 * is says exactly whose turn it is:
 *
 * - presenting: filled from the left as the mirror performs, the rest unknown
 * - answering: all unknown again, filled from the left as the pair gets them
 *
 * That is the whole readout. The progress dots it replaced said how *many*
 * were done and nothing about what, which is the one thing that was never in
 * question.
 */

/** Room the widest short label ("SHIELD") needs, in pixels. */
const LABEL_WIDTH = 40;
/** How long a slot flares green after the step it holds is answered. */
export const ANSWER_FLASH = 0.45;

export interface RowSlots {
  x0: number;
  gap: number;
  r: number;
}

/**
 * Where the slots sit, as numbers. Shared by the row and by the verdict that
 * throws it, so a glyph leaves from exactly where it was drawn.
 *
 * The row has to fit the phone, and the longest authored round is six steps.
 * Slot and spacing shrink together until the whole row plus its widest label
 * is inside the field.
 */
export function rowSlots(l: Layout, count: number): RowSlots {
  const n = Math.max(1, count);
  const room = l.gridWidth - LABEL_WIDTH;
  const gap = Math.min(l.tile * 2, room / n);
  const r = Math.min(l.tile * 0.6, 22, gap / 2.6);
  return { x0: l.width / 2 - ((n - 1) * gap) / 2, gap, r };
}

/** The plate every slot sits on, whatever it is holding. */
function plate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  hex: string,
  weight: number,
  alpha: number,
): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#0E0A22";
  ctx.beginPath();
  ctx.arc(x, y, r * 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = hex;
  ctx.lineWidth = weight;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * A step nobody is allowed to know yet. Drawn at full strength, not as a ghost
 * — an empty slot is a fact about the round, and a pair counting how many are
 * left should not have to squint to do it.
 */
function unknown(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  plate(ctx, x, y, r, "#5B5192", 1.5, 1);
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#8C82C4";
  ctx.font = `700 ${Math.round(r * 1.5)}px "Courier New",monospace`;
  ctx.fillText("?", x, y + r * 0.5);
  ctx.restore();
  ctx.textAlign = "left";
}

/** A step in the open: the band's own button, with the word under it. */
function known(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  step: MirrorStep,
  alpha: number,
  ring: string,
  weight: number,
  skin: SeatSkin,
): void {
  plate(ctx, x, y, r, ring, weight, alpha * 0.6);
  drawStepGlyph(ctx, x, y, r, step, alpha, skin);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = "center";
  ctx.font = '700 9px "Courier New",monospace';
  ctx.fillStyle = ring;
  ctx.fillText(stepShort(step), x, y + r * 1.15 + 11);
  ctx.restore();
  ctx.textAlign = "left";
}

/**
 * The row while THE MIRROR performs: `shown` slots open, the rest unknown, the
 * newest at full strength so the eye lands on the one that just happened.
 */
export function drawShowRow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  steps: readonly MirrorStep[],
  shown: number,
): void {
  const { x0, gap, r } = rowSlots(l, steps.length);
  const skin = seatSkin(l.role);
  for (const [i, step] of steps.entries()) {
    const x = x0 + i * gap;
    if (i >= shown) {
      unknown(ctx, x, y, r);
      continue;
    }
    const fresh = i === shown - 1;
    known(ctx, x, y, r, step, fresh ? 1 : 0.45, stepHex(step), fresh ? 2 : 1, skin);
  }
}

/**
 * The row while the pair answers: everything unknown again — a sequence still
 * on screen while it is repeated is reading aloud, not remembering — and every
 * slot they land turned green and open, so a correct step is unmissable at the
 * moment it happens rather than only when the round settles.
 */
export function drawListenRow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  steps: readonly MirrorStep[],
  matched: number,
  /** Seconds left of the flare on the slot just answered, 0 for none. */
  flash: number,
): void {
  const { x0, gap, r } = rowSlots(l, steps.length);
  const skin = seatSkin(l.role);
  for (const [i, step] of steps.entries()) {
    const x = x0 + i * gap;
    if (i >= matched) {
      unknown(ctx, x, y, r);
      continue;
    }
    const newest = i === matched - 1 && flash > 0;
    const pop = newest ? flash / ANSWER_FLASH : 0;
    if (pop > 0) halo(ctx, x, y, r * (1.6 + pop * 1.8), PALETTE.good, 0.8 * pop);
    known(ctx, x, y, r * (1 + pop * 0.18), step, 1, PALETTE.good, 2 + pop * 2, skin);
  }
}

/**
 * How long is left to answer, as a bar under the row.
 *
 * It runs on `mirrorListenBeats` — the simulation's own number, not a second
 * copy of it — so the bar empties on exactly the beat the round is lost. A
 * clock that ran a beat fast or slow would be worse than none at all: the pair
 * would learn to distrust it and then have nothing.
 *
 * `elapsed` is in beats and fractional, so it drains smoothly rather than in
 * steps; the beat is a thing you hear, and this is a thing you watch.
 */
export function drawListenClock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  steps: number,
  elapsed: number,
): void {
  const total = mirrorListenBeats(steps);
  const share = Math.max(0, Math.min(1, 1 - elapsed / total));
  const h = Math.max(5, l.tile * 0.2);
  const w = l.gridWidth * 0.72;
  const x = l.width / 2 - w / 2;

  // Green with most of it left, amber past halfway, red on the last quarter —
  // so the colour alone says how much trouble the pair is in.
  const hex = share > 0.5 ? PALETTE.good : share > 0.25 ? PALETTE.pod : PALETTE.red;
  ctx.save();
  ctx.fillStyle = "rgba(14,10,34,.85)";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = hex;
  ctx.fillRect(x, y, w * share, h);
  if (share < 0.25) halo(ctx, l.width / 2, y + h / 2, w * 0.5, PALETTE.red, 0.28);
  ctx.strokeStyle = hex;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  // The number too: a bar says "some", seconds say how many.
  ctx.textAlign = "center";
  ctx.fillStyle = hex;
  ctx.font = '700 9px "Courier New",monospace';
  ctx.fillText(`${Math.ceil(total - elapsed)}`, x + w + 12, y + h);
  ctx.restore();
  ctx.textAlign = "left";
}
