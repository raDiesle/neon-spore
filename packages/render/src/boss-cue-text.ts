import type { BossCue } from "./boss-cue.js";
import { saysKind } from "./boss-cue-shape.js";
import { PALETTE } from "./palette.js";

/**
 * **A cue's two lines, drawn**: the verb under the mark, the kind of action
 * over it. What is in a cue and why it is there at all is `boss-cue.ts`'s
 * header and `docs/decisions.md` #34; this file is the hand that writes it.
 *
 * **It is THE CHOIR's picture and not a new one.** The word is the same 11px
 * courier under the same gap as `SHAKE SCREEN` under a membrane, in the same
 * rock grey, breathing on the same wall clock (`choir-prompt.ts`) — because a
 * second picture for *the machine wants something here* is the mistake
 * `target-lock.ts` records the owner ending.
 *
 * **Rock grey, never an ammunition colour.** A cue in red or cyan would be the
 * one part of the frame promising the navigator a colour, and the colour is the
 * pair's to work out on every boss this is drawn over.
 *
 * The kind line is smaller, dimmer and above: it is the *grammar* of the
 * instruction and the verb is the instruction, so a pilot glancing down reads
 * the word first and learns how to hold his thumb second.
 *
 * **Why it is a file of its own.** Twelve bosses' cues are read off `World`
 * (`boss-cue.ts`) and three are not: THE SINEW's, THE SURGE's and THE
 * ANTIPHON's stand on handles whose place is the *drawing's* — a snap-back's
 * whip, a bulb's swell, a body sinking — so a reading that worked one out a
 * second time would be a word standing where the ring is not. Those three
 * build a `BossCue` where they draw it and call in here, which is how all
 * fifteen come to speak in one voice without one of them guessing at geometry.
 *
 * **THE INSTAR speaks the same two lines in a scanner box of its own**
 * (`instar-word.ts`) rather than through a `BossCue` and this file: its ring
 * wants up to two words up at once, one per seat, which this file's *one cue
 * at a time* was never built to hold. What it does take from here is the
 * vocabulary — `boss-cue.ts`'s `CueKind` — so the grammar a pilot learns on
 * one boss is the grammar he reads on the next.
 */

/** The verb, and the line over it. THE CHOIR's hand, and a smaller one.
 * The verb's is exported for a drawing that has to know how wide it is. */
export const WORD_FONT = '700 11px "Courier New",monospace';
const KIND_FONT = '700 8px "Courier New",monospace';

/** Pixels between the frame and each line of text. */
const WORD_GAP = 18;
const KIND_GAP = 9;

/**
 * The kind line never leaves the canvas, whatever the mark is standing on —
 * and never leaves the *picture* either: any boss whose mark stands high —
 * THE BATON's bead in the top socket, THE CANDLE's glow, THE GORGE's
 * intakes, THE SCUTTLE's lock at `gridTop` — would otherwise put PRESS or
 * HOLD under it.
 */
const TOP_EDGE = 10;

/** How dim the kind line is against the verb. */
const KIND_ALPHA = 0.7;

/** A line's height: the least the kind line stands off the verb, either side. */
const KIND_DROP = 11;

export function drawCueText(ctx: CanvasRenderingContext2D, cue: BossCue, time: number): void {
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.rock;
  // The same breath THE CHOIR's prompt has: a word that sat still would read
  // as part of the boss rather than as a thing the machine is saying now.
  const breath = 0.55 + 0.35 * ((Math.sin(time * 4.4) + 1) / 2);
  const floor = TOP_EDGE;
  ctx.globalAlpha = breath;
  ctx.font = WORD_FONT;
  const wordY = cueWordY(cue, floor);
  ctx.fillText(cue.word, cue.x, wordY);
  // **The kind line goes when it is the verb said twice.** THE SURGE asks for a
  // thumb that stays and THE ANTIPHON for a turn, so `HOLD` over `HOLD` and
  // `TURN` over `TURN` are a second line repeating the first — which is the
  // objection `bosses-choreographed.md` raised when those two were left out of
  // the cue altogether, and it is answered here rather than by keeping a second
  // prompt system for three bosses. #34 asks for one word and not for a form.
  // And `CARRY` never, since the verb under it is always the motion
  // (`saysKind`).
  if (saysKind(cue.kind, cue.word)) {
    ctx.globalAlpha = breath * KIND_ALPHA;
    ctx.font = KIND_FONT;
    ctx.fillText(cue.kind, cue.x, kindY(cue.y, cue.halfH, wordY, floor));
  }
  ctx.restore();
  ctx.textAlign = "left";
}

/**
 * The verb's own baseline: `WORD_GAP` under the frame, the canvas's top edge
 * when the mark stands higher than that, **no further down than
 * `BossCue.roomBelow`** where the reading gave one, and **over the mark
 * rather than under it when under it is inside the ship**.
 *
 * That last one is the only place the verb changes sides, and the ship is the
 * only thing that makes it: a mark standing on the hull line has nothing
 * under it but plating, and a word written there is unreadable whatever order
 * it is drawn in (`BossCue.wordFloor` has the eight bosses and the frames). The
 * kind line follows on its own — `kindY` already puts it under the verb when
 * there is no room over it — so the pair reads the instruction first and its
 * grammar second, which is the order the two lines take at the top edge too.
 *
 * The cap is the answer to a mark standing close under another of the boss's
 * own bodies rather than in clear field. The frame is two thirds of a tile
 * tall and THE BATON's sockets are one tile apart, so the pilot's `HOLD` hung
 * the full gap under his bead used to land on the navigator's — legible only
 * because it was drawn last, over the bead's fill. It is drawn tight under
 * the mark instead, which is still the side #34 puts the verb on: the cap
 * shortens the drop and never flips it, because a verb over the mark is the
 * kind line's place and the pilot would be reading the grammar as the
 * instruction.
 *
 * Exported for `boss-cue-baton.test.ts`, which proves the word clears what
 * stands under it rather than that a number was passed in.
 */
export function cueWordY(cue: BossCue, floor: number = TOP_EDGE): number {
  const under = cue.y + cue.halfH + WORD_GAP;
  const capped = cue.roomBelow === undefined ? under : Math.min(under, cue.y + cue.roomBelow);
  // Inside the ship, and so over the mark instead. The cap is asked first:
  // where a reading has already shortened the drop to clear something of the
  // boss's own, the shortened word is the one that has to fit.
  if (cue.wordFloor !== undefined && capped > cue.wordFloor) {
    return Math.max(cue.y - cue.halfH - WORD_GAP, floor);
  }
  return Math.max(capped, floor);
}

/**
 * Where the kind line goes: over the verb, or under it when there is no room
 * over it. The floor is the canvas's own top edge, and the line is over the
 * mark, which is where it belongs, unless the mark is close enough to that
 * edge that the line would run off screen:
 *
 * - a mark under it with its line poking in — THE GORGE's intakes — has the
 *   line pushed down to the floor and nothing else moves;
 * - a mark **inside** it — THE CANDLE's glow, THE DIASTOLE's bridge, THE
 *   SCUTTLE's borrowed lock box at the socket row — would have the line under
 *   the verb whatever it did, so it is put there on purpose, a line's height
 *   below, which reads in the order it is anyway learned in: the verb is the
 *   instruction and the kind is its grammar;
 * - and the verb itself takes the floor when the mark is high enough to put it
 *   out of sight. A cue nobody can read is the one thing `docs/decisions.md`
 *   #34 built the field to say covered over.
 */
function kindY(y: number, halfH: number, wordY: number, floor: number): number {
  const above = Math.max(y - halfH - KIND_GAP, floor);
  return above <= wordY - KIND_DROP ? above : wordY + KIND_DROP;
}
