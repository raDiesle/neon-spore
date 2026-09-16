import type { World } from "@neon-spore/sim";
import { commsCall } from "./comms.js";
import { dutyWord } from "./duty.js";
import type { Layout } from "./layout.js";
import { headerLift, headerTop } from "./round-header.js";
import type { SeatNames } from "./seat-name.js";
import { DIAL_R, drawDial, TICK } from "./siren-dial.js";
import { drawSeat, pillWidth, SIREN_PAD, seatChip } from "./siren-seats.js";

/**
 * The warning siren, top centre of the field, and the two seats' jobs either
 * side of it.
 *
 * **It replaces five private markings with one.** Every creature with a split
 * secret used to announce itself over its own body — a shut eye above a cloud
 * being the one this was built out of — so the pair had to learn where to look
 * per creature, and had to look *into the field* to find out that they were
 * supposed to be talking at all. Both are now one place: the strip says
 * *which* blip (`drawEyeGlyph` over it), and this says *that a call is on and
 * whose turn it is to open their mouth*. `comms.ts` owns the roster; this file
 * owns the picture and knows nothing about creatures.
 *
 * **Deliberately unlike everything else on this screen, which is the check it
 * owes.** `torch-alarm.ts` is a grey band across the strip; `lure-alarm.ts` is
 * a white ring in the field; `veil-marks.ts` is an off-white ring above a
 * body. This is a lit instrument in the two ammunition colours, and it never
 * moves. Nothing about where it is depends on where the creature is, because
 * the answer it gives — *talk* — is the same wherever the body happens to be
 * standing.
 *
 * **Top centre, since 13 September 2026.** It stood in the top right corner
 * until the two people's names went on its chips; a cluster that grows with a
 * name and is pinned to one edge grows *towards* the middle, and the owner
 * asked for it in the middle to begin with, with the beat dots that held the
 * top left taken away. The run's line keeps the left and the ☰ keeps the
 * right; the instrument has the width between them.
 *
 * **Both seats are shown and the local one is lit.** The alternative was to
 * draw only your own job, which is less to look at and costs the thing the
 * whole instrument is for: knowing that your partner has been told to listen
 * is what makes a person start talking. The two phones therefore draw the same
 * two chips in the same order, and only the brightness differs.
 *
 * The dial itself is `siren-dial.ts` and the chips are `siren-seats.ts`; this
 * file places them and writes the duty word under them.
 */

/** Clear of the run's line, which ends at y = 23. */
const TOP = 24;
/** Between a chip and the dial. */
const GAP = 3;

/** How far under the dial the duty word sits, and how it is drawn. Clear of
 * the two seat chips, which are level with the dial's own middle. */
const DUTY_DROP = 12;
const DUTY_FONT = '700 8px "Courier New",monospace';
/** Half the duty word's own height, which is what hangs under its middle. */
const DUTY_HALF = 4;

/**
 * Where the dial's middle is on this screen. Exported for the director's
 * WORDINGS page, which points a label at it — from these numbers rather than
 * a copy of them, so the label follows the dial if it ever moves.
 *
 * The dial is the middle of the screen, whatever the names measure: a chip
 * grows outward from it on its own side. `clearTop` is a rehearsal's corner
 * plate (`ViewState.clearTop`): the plate is top left and a long name's chip
 * reaches under it, so the cluster drops beneath the plate the way a round's
 * header does (`round-header.ts`), by the same rule.
 */
export function sirenCentre(
  l: Layout,
  _names?: SeatNames,
  clearTop?: number,
): { x: number; y: number } {
  return { x: l.width / 2, y: headerTop({ clearTop }, TOP + DIAL_R) };
}

/**
 * How far the whole top-centre cluster has dropped under a rehearsal's plate.
 *
 * Two rows hang directly off this cluster and are drawn by other files —
 * TORCH's call and THE MAGNET's (`torch-alarm.ts`, `magnet-alarm.ts`), both
 * right-aligned to `SIREN_PAD` because they finish the sentence the dial's
 * chips start. They are placed at their own fixed offsets, so they have to
 * move by the same amount the dial did rather than work out a clearance of
 * their own: `headerTop` at each would clamp all three to one line and stack
 * the two calls on the dial itself.
 */
export function sirenDrop(clearTop: number | undefined): number {
  return headerLift({ clearTop }, TOP + DIAL_R);
}

/**
 * The lowest the whole cluster reaches — the dial, or the duty word under it
 * where this seat owes one — or null when no call is on and nothing is drawn.
 */
export function sirenFoot(l: Layout, world: World, clearTop: number | undefined): number | null {
  if (!commsCall(world)) return null;
  const { y } = sirenCentre(l, undefined, clearTop);
  if (dutyWord(l.role, world) === null) return y + DIAL_R;
  // The word is drawn on its middle, so half of it hangs under its baseline.
  return y + DIAL_R + DUTY_DROP + DUTY_HALF;
}

export function drawCommsSiren(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
  /** The two people's names, where the room knows them: the chips say who has
   * to talk, and a name is what the other one would actually be called
   * (`siren-seats.ts`). */
  names?: SeatNames,
  /** The bottom of a plate over the top left, when a rehearsal has one up. */
  clearTop?: number,
): void {
  const call = commsCall(world);
  if (!call) return;
  // P1 on the left of the dial and P2 on its right, which is the order the
  // band already reads in — the cannon strip above the shield strip, player 1
  // before player 2 everywhere else on the screen. Stacking both chips under
  // the dial put them in a column, and a column has no left and no right, so
  // there was nothing to line either of them up with.
  const { x: cx, y: cy } = sirenCentre(l, names, clearTop);
  // Each chip is as wide as the word in it, so the two reaches are worked out
  // one at a time rather than shared: a pair called Bo and Anne-Marie have
  // chips of two different widths and the dial stays between them.
  const left = DIAL_R + GAP + pillWidth(seatChip("p1", names)) / 2;
  const right = DIAL_R + GAP + pillWidth(seatChip("p2", names)) / 2;

  ctx.save();
  drawDial(ctx, cx, cy, time);
  drawSeat(ctx, l, "p1", call.p1, cx - left, cy, time, names);
  drawSeat(ctx, l, "p2", call.p2, cx + right, cy, time, names);
  // And, under it, the word or words this seat owes the other about whatever
  // split body is on the field. Nothing else in the game writes a word here
  // (`duty.ts`).
  drawDuty(ctx, l, world, cx, cy + DIAL_R + DUTY_DROP);
  ctx.restore();
}

/** The word this seat owes, centred under the dial, or nothing. */
function drawDuty(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  cx: number,
  y: number,
): void {
  const word = dutyWord(l.role, world);
  if (word === null) return;
  ctx.font = DUTY_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = TICK;
  // Pulled back inside the screen when it is too wide to be centred under the
  // dial. THE FENCE's own word is nineteen characters — FIND GAP FOR SHIELD,
  // the owner's wording — and two kinds owing a word at once join theirs with
  // a dot, so the line outgrew the corner it was first written for. The dial
  // is in the middle now and the clamp is rarely reached, but it stays:
  // the words are the instruction, and the one thing that must not happen is
  // half of one running off the edge of the phone.
  const half = ctx.measureText(word).width / 2;
  const x = Math.min(Math.max(cx, SIREN_PAD + half), l.width - SIREN_PAD - half);
  ctx.fillText(word, x, y);
}
