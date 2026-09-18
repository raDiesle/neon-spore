import type { World } from "@neon-spore/sim";
import { bossCue } from "./boss-cue.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { headerTop } from "./round-header.js";
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

/**
 * The kind line never leaves the canvas, whatever the mark is standing on —
 * and never leaves the *picture* either. On the game itself the two are the
 * same edge; in a rehearsal the picture starts under the tutorial band, which
 * is 77 or 104 pixels deep depending on which `GUIDE_LOOK` is voted in, and a
 * film draws the cue like anything else (`guide-seat.ts` → `drawBodies`). So
 * the floor is `headerTop`, the same one a round's whole header drops off
 * (`round-header.ts`), rather than this constant on its own: any boss whose
 * mark stands high — THE BATON's bead in the top socket, THE CANDLE's glow,
 * THE GORGE's intakes, THE SCUTTLE's lock at `gridTop` — would otherwise put
 * PRESS or HOLD under the band.
 */
const TOP_EDGE = 10;

/** How dim the kind line is against the verb. */
const KIND_ALPHA = 0.7;

export function drawBossCue(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
  /** The plating without the cannon on it, for the one boss whose marks stand
   * on lobes coming up through it (`undertow-lobe.ts`). */
  skinY: SurfaceY = () => l.hullY,
  /** Where the picture starts, when something stands over it: a rehearsal's
   * band (`ViewState.clearTop`). Absent on the game itself. */
  clearTop?: number,
): void {
  const cue = bossCue(l, world, beatPhase, skinY);
  if (cue === null) return;
  // Only where nothing already marks the place: `BossCue.framed`.
  if (cue.framed !== false) {
    drawTargetLock(ctx, cue.x, cue.y, cue.halfW, cue.halfH, PALETTE.rock, time, 0.85, cue.seed);
  }
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.rock;
  // The same breath THE CHOIR's prompt has: a word that sat still would read
  // as part of the boss rather than as a thing the machine is saying now.
  const breath = 0.55 + 0.35 * ((Math.sin(time * 4.4) + 1) / 2);
  const floor = headerTop({ clearTop }, TOP_EDGE);
  ctx.globalAlpha = breath;
  ctx.font = WORD_FONT;
  const wordY = Math.max(cue.y + cue.halfH + WORD_GAP, floor);
  ctx.fillText(cue.word, cue.x, wordY);
  ctx.globalAlpha = breath * KIND_ALPHA;
  ctx.font = KIND_FONT;
  ctx.fillText(cue.kind, cue.x, kindY(cue.y, cue.halfH, wordY, floor));
  ctx.restore();
  ctx.textAlign = "left";
}

/**
 * Where the kind line goes: over the verb, or under it when there is no room
 * over it.
 *
 * On the game itself nothing stands over the picture, the floor is the
 * canvas's own edge and the line is over the mark, which is where it belongs.
 * A rehearsal puts a band across the top — TUTORIAL over PLAYER n · SCREEN,
 * 104 pixels of it — and draws the cue like anything else (`guide-seat.ts` →
 * `drawBodies`), so the floor is `headerTop`'s, the same drop a round's whole
 * header takes (`round-header.ts`). Three things come out of it:
 *
 * - a mark under the band with its line poking into it — THE GORGE's intakes —
 *   has the line pushed down to the floor and nothing else moves;
 * - a mark **inside** the band — THE CANDLE's glow, THE DIASTOLE's bridge, THE
 *   SCUTTLE's borrowed lock box at the socket row — would have the line under
 *   the verb whatever it did, so it is put there on purpose, a line's height
 *   below, which reads in the order it is anyway learned in: the verb is the
 *   instruction and the kind is its grammar;
 * - and the verb itself takes the floor when the mark is high enough to put it
 *   in the band. A cue nobody can read is the tutorial covering the one thing
 *   `docs/decisions.md` #34 built the field to say for it — the reason the
 *   words are on the field at all is that the briefing should not have to say
 *   them.
 */
function kindY(y: number, halfH: number, wordY: number, floor: number): number {
  const above = Math.max(y - halfH - KIND_GAP, floor);
  return above <= wordY - KIND_DROP ? above : wordY + KIND_DROP;
}

/** A line's height: the least the kind line stands off the verb, either side. */
const KIND_DROP = 11;
