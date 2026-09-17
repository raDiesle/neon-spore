import type { World } from "@neon-spore/sim";
import { bossCue } from "./boss-cue.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * **The cue, drawn**: the frame on the mark, the word under it, the kind of
 * action over it. What is in it and why any of it is there at all is
 * `boss-cue.ts`'s header and `docs/decisions.md` #34; this file is the hand.
 *
 * **It is THE CHOIR's picture and not a new one.** The frame is
 * `drawTargetLock` in `PALETTE.rock`, the word is the same 11px courier under
 * the same gap, and it breathes on the same wall clock — because the pair has
 * already met this exact thing over a membrane with `SHAKE SCREEN` under it
 * (`choir-prompt.ts`), and a second picture for *the machine wants something
 * here* is the mistake `target-lock.ts` records the owner ending.
 *
 * **Rock grey, never an ammunition colour.** A cue in red or cyan would be
 * the one part of the frame promising the navigator a colour, and the colour
 * is the pair's to work out on every boss this is drawn over.
 *
 * The kind line is smaller, dimmer and above: it is the *grammar* of the
 * instruction and the verb is the instruction, so a pilot glancing down reads
 * the word first and learns how to hold his thumb second.
 */

/** The verb, and the line over it. THE CHOIR's hand, and a smaller one. */
const WORD_FONT = '700 11px "Courier New",monospace';
const KIND_FONT = '700 8px "Courier New",monospace';

/** Pixels between the frame and each line of text. */
const WORD_GAP = 18;
const KIND_GAP = 9;

/** The kind line never leaves the canvas, whatever the mark is standing on. */
const TOP_EDGE = 10;

/** How dim the kind line is against the verb. */
const KIND_ALPHA = 0.7;

export function drawBossCue(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
  /** The plating without the cannon on it, for the one boss whose marks stand
   * on lobes coming up through it (`undertow-lobe.ts`). */
  skinY: SurfaceY = () => l.hullY,
): void {
  const cue = bossCue(l, world, skinY);
  if (cue === null) return;
  drawTargetLock(ctx, cue.x, cue.y, cue.halfW, cue.halfH, PALETTE.rock, time, 0.85, cue.seed);
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.rock;
  // The same breath THE CHOIR's prompt has: a word that sat still would read
  // as part of the boss rather than as a thing the machine is saying now.
  const breath = 0.55 + 0.35 * ((Math.sin(time * 4.4) + 1) / 2);
  ctx.globalAlpha = breath;
  ctx.font = WORD_FONT;
  ctx.fillText(cue.word, cue.x, cue.y + cue.halfH + WORD_GAP);
  ctx.globalAlpha = breath * KIND_ALPHA;
  ctx.font = KIND_FONT;
  ctx.fillText(cue.kind, cue.x, Math.max(TOP_EDGE, cue.y - cue.halfH - KIND_GAP));
  ctx.restore();
  ctx.textAlign = "left";
}
