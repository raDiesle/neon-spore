import { handedOver, type World } from "@neon-spore/sim";
import { type CommsCall, commsCall } from "./comms.js";
import { bossDuty } from "./comms-boss.js";
import { dutyWord } from "./duty.js";
import { handedLayout } from "./handover.js";
import type { Layout } from "./layout.js";
import type { SeatNames } from "./seat-name.js";
import { BAR_HALF_W, drawLightbar, type SirenState } from "./siren-lightbar.js";
import { barX, DUTY_DROP, GAP, sirenBottom, sirenCentre } from "./siren-place.js";
import { drawSeat, PILL_H, pillWidth, SIREN_PAD, seatChip } from "./siren-seats.js";
import { torchWarning } from "./torch-alarm.js";
import type { ViewRole } from "./view-role.js";

export { sirenBottom, sirenCentre, sirenHit } from "./siren-place.js";

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
 * **Three states, and the bar is always there** (the owner, 17 October 2026):
 * idle, a call, a torch on its way. It was drawn only while a call was on;
 * now it stands quietly at the top of every field, so the pair know where it
 * lives before it has anything to say, and the chips and the word come with
 * a call. A player who does not want it taps it away, and taps the same place
 * to bring it back (`sirenHit`, `ViewState.sirenOff`).
 *
 * The bar itself is `siren-lightbar.ts` and the chips are `siren-seats.ts`;
 * this file places them and writes the duty word under them.
 */

const DUTY_FONT = '700 8px "Courier New",monospace';
/** The word's colour, the dial's tick colour before it. */
const DUTY_INK = "#5B5486";

/**
 * The lowest row the whole cluster claims — the duty word's, under the bar —
 * or null when no call is on and only the idle bar is drawn, which is no
 * lower than the run's own line and pushes nothing down.
 */
export function sirenFoot(l: Layout, world: World): number | null {
  if (!commsCall(world)) return null;
  // The duty word's row is held whether or not this seat owes one *this*
  // beat: `dutyWord` answers per beat, and a row that came and went with it
  // would walk everything stacked under it up and down a beat at a time
  // (`ship-top-rows.ts`). The siren lighting at all is the visible event; the
  // rows under it move once, with that.
  //
  return sirenBottom(l);
}

/**
 * The word or words this seat owes the other about whatever split body is on
 * the field, under the bar. Nothing else on the field writes a word here
 * (`duty.ts`). The word is the panel's, which is what it is about. Exported
 * for the director's HELPERS page, which prints what each seat reads.
 */
export function sirenWord(role: ViewRole, world: World): string | null {
  return bossDuty(role, world) ?? dutyWord(role, world);
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
  /** This player tapped the bar away (`ViewState.sirenOff`). */
  off = false,
): void {
  const call = commsCall(world);
  const x = barX(l, world, names);
  if (!call || off) {
    // Idle, or put away: the bar alone, and no chips or word whatever is on.
    drawLightbar(ctx, x, sirenCentre(l).y, time, off ? "off" : "idle");
    return;
  }
  const word = sirenWord(l.role, world);
  // **The chips are people, and a traded panel is not a traded person.** The
  // call is worked out by panel — the pilot's panel sees through a veil, and
  // THE FLUE's ember — so while the panels are traded (THE HANDOVER, or THE
  // FLUE's every other level) the mouth it lights belongs to the other person,
  // whose name the other chip carries; and the ring that says *you* goes round
  // this device's own seat, which is the frame's role traded back
  // (`handover.ts`). Without it the pilot holding the navigator's panel was
  // circled on the navigator's name.
  // A torch on its way is the alarm at its loudest, and the same window
  // `commsCall` lit the bar for.
  const state = torchWarning(world, world.cfg.radarLead) !== null ? "torch" : "call";
  if (handedOver(world)) {
    const swapped = { p1: call.p2, p2: call.p1 };
    drawSiren(ctx, handedLayout(l, world), swapped, word, time, names, x, state);
  } else drawSiren(ctx, l, call, word, time, names, x, state);
}

/**
 * **The instrument itself, for a call somebody else has worked out** — the
 * field's is `commsCall`'s, and a round that draws its own stage (THE GAUGE,
 * `gauge-crown.ts`) says its own, so the one thing that means *talk* is the
 * same picture on both.
 */
export function drawSiren(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  call: CommsCall,
  word: string | null,
  time: number,
  names?: SeatNames,
  /** The bar's middle across, where a boss pins the cluster right; the
   * middle of the screen otherwise. */
  atX?: number,
  /** A call, a torch on its way, or put away by the player: the bar alone. */
  state: SirenState = "call",
): void {
  // P1 on the left of the bar and P2 on its right, which is the order the
  // band already reads in — the cannon strip above the shield strip, player 1
  // before player 2 everywhere else on the screen. Stacking both chips under
  // the bar put them in a column, and a column has no left and no right, so
  // there was nothing to line either of them up with.
  const { x: mid, y: cy } = sirenCentre(l, names);
  const cx = atX ?? mid;
  // Each chip is as wide as the word in it, so the two reaches are worked out
  // one at a time rather than shared: a pair called Bo and Anne-Marie have
  // chips of two different widths and the bar stays between them.
  const left = BAR_HALF_W + GAP + pillWidth(seatChip("p1", names)) / 2;
  const right = BAR_HALF_W + GAP + pillWidth(seatChip("p2", names)) / 2;

  ctx.save();
  drawLightbar(ctx, cx, cy, time, state);
  if (state === "off" || state === "idle") {
    ctx.restore();
    return;
  }
  drawSeat(ctx, l, "p1", call.p1, cx - left, cy, time, names);
  drawSeat(ctx, l, "p2", call.p2, cx + right, cy, time, names);
  if (word !== null) drawDuty(ctx, l, word, cx, cy + PILL_H / 2 + DUTY_DROP);
  ctx.restore();
}

/** The word this seat owes, centred under the bar, or nothing. */
function drawDuty(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  word: string,
  cx: number,
  y: number,
): void {
  ctx.font = DUTY_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = DUTY_INK;
  // Pulled back inside the screen when it is too wide to be centred under the
  // bar. THE FENCE's own word is nineteen characters — FIND GAP FOR SHIELD,
  // the owner's wording — and two kinds owing a word at once join theirs with
  // a dot, so the line outgrew the corner it was first written for. The bar
  // is in the middle now and the clamp is rarely reached, but it stays:
  // the words are the instruction, and the one thing that must not happen is
  // half of one running off the edge of the phone.
  const half = ctx.measureText(word).width / 2;
  const x = Math.min(Math.max(cx, SIREN_PAD + half), l.width - SIREN_PAD - half);
  ctx.fillText(word, x, y);
}
