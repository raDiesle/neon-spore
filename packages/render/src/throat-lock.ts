import {
  type SimConfig,
  type ThroatState,
  throatEvery,
  throatMouthCol,
  throatStride,
  throatToInhale,
} from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";
import { mouthY } from "./throat-shape.js";
import { showsThroatLock } from "./view-role-clocks.js";

/**
 * NEXT INHALE: the column the mouth will be standing in on the beat it next
 * takes something, and how long until that beat — said on player 2's screen
 * and nowhere else.
 *
 * **This is the navigator's whole half of the fight.** Every other boss gives
 * that seat a fact the other could have worked out; this gives a fact about *a
 * beat that has not happened*. The mouth's column is a pure function of the
 * beat for exactly this reason (`sim/throat.ts`) — a position stepped once a
 * beat could not be asked about the future at all — and the design asks for the
 * picture by name: `queen-drop.ts`'s, which is the target lock, words under it,
 * and a bar that fills as the beat comes on.
 *
 * **The lock stands on the inhale's column, not on the mouth** — and while the
 * mouth has no stride there is no bracket at all. That was the first frame's
 * lesson: in phase `still` the two columns are the same one, so the bracket
 * landed around the lip and read as a second highlight on a thing already drawn
 * on both screens. A bracket is the answer to *which column*, and until the
 * mouth walks there is no question; what is left is the count, and the words and
 * the bar carry that on their own.
 *
 * Once it does walk, the column it *will* be in is the whole point: a gum
 * crosses `gumFlingCols` a beat, so the seat with the thumb is aiming several
 * beats ahead of where the tube is pointing, and nothing on his screen says
 * where that is.
 *
 * **The bar fills rather than drains**, `queen-drop.ts`'s argument: the eye
 * reads a thing arriving rather than a thing running out, and what the bar is
 * full of is how much of the warning has already been spent.
 *
 * Nothing here is held between frames — every number is arithmetic over the
 * boss's phase and anchor.
 */

/** The bracket stands this much of a tile around the column it holds. */
const LOCK_W = 0.46;
const LOCK_H = 0.4;

/** The words, and how far under the box they sit. */
const LABEL = "NEXT INHALE";
const LABEL_GAP = 9;

/** The bar under them: its height, and how far under the words it runs. */
const BAR_H = 4;
const BAR_GAP = 6;

/** How near the edge of the screen the words and the bar may come. */
const EDGE = 6;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * How much of the wait is spent, 0..1 — 0 the beat the throat last inhaled, 1
 * the beat it next does. `dropShare`'s shape, one boss along.
 *
 * Off `throatEvery` and `throatToInhale` rather than off a remembered beat, so
 * the bar is right on the frame a phase changes: the inhale tightens from
 * `throatInhaleBeats` to `throatTightBeats` when the second ring goes, and a
 * bar reading the old stride would run past its own end.
 *
 * `throatToInhale` answers 0 on an inhale beat rather than the whole stride,
 * which is the right answer to *how long until the next one* and the wrong
 * number to fill a bar with — so it is turned into beats **since** the last
 * inhale here. A bar that read the query straight would stand full for the
 * whole of the beat the throat took something on and then drop to nothing,
 * which is a jump on the one beat the pair is watching hardest.
 */
export function inhaleShare(
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
): number {
  const every = throatEvery(cfg, b);
  if (every <= 0) return 1;
  const left = throatToInhale(cfg, b, beat);
  const since = left === 0 ? 0 : every - left;
  return clamp01((since + beatPhase) / every);
}

export function drawThroatLock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
  time: number,
  /**
   * The throat is holding a body right now, on player 2's own screen: `FIRE`
   * over one standing in the mouth or `BRAKE` over one climbing under it, both
   * close enough to this lock's own station that the two texts land on each
   * other rather than beside them (`throat-draw.ts`). Silent while either is
   * true, `throatCinched`'s own idiom: a word already answering this beat is
   * the count answered as well, so the label costs nothing to stand aside for.
   */
  crowded: boolean,
): void {
  if (!showsThroatLock(l.role) || crowded) return;
  const every = throatEvery(cfg, b);
  // Phase `everts` keeps no clock and phase `open` inhales every beat: in
  // neither case is there a column to arrive at that the mouth is not already
  // in, and a lock that sat on the mouth would be the second picture this file
  // exists not to draw.
  if (every <= 1) return;

  const at = beat + throatToInhale(cfg, b, beat);
  const x = tileCX(l, throatMouthCol(cfg, b, at));
  const y = mouthY(l, cfg);
  const halfW = l.tile * LOCK_W;
  const halfH = l.tile * LOCK_H;
  // Seeded off the anchor, so this frame and the mouth's own lip are not two
  // objects blinking in step on one screen.
  if (throatStride(cfg, b) > 0) {
    drawTargetLock(ctx, x, y, halfW, halfH, PALETTE.shieldRim, time, 1, b.mouthFrom + 3);
  }

  const size = Math.max(8, Math.round(l.tile * 0.24));
  const top = y + halfH + LABEL_GAP;
  ctx.save();
  ctx.font = `700 ${size}px "Courier New",monospace`;
  ctx.textAlign = "center";

  // The mouth turns at the walls, so the column it will be in is often the
  // first or the last one, and the words are wider than the screen has left
  // there. They slide in off the edge rather than being cut in half — the lock
  // is what says *which* column, and it has not moved (`queen-drop.ts`).
  const w = Math.max(halfW * 2, ctx.measureText(LABEL).width);
  const tx = Math.min(l.width - w / 2 - EDGE, Math.max(w / 2 + EDGE, x));

  ctx.fillStyle = PALETTE.shieldRim;
  ctx.globalAlpha = 0.9;
  ctx.fillText(LABEL, tx, top + size);
  ctx.globalAlpha = 1;

  const barY = top + size + BAR_GAP;
  const barX = tx - w / 2;
  ctx.fillStyle = PALETTE.dim;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(barX, barY, w, BAR_H);
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE.shieldRim;
  ctx.fillRect(barX, barY, w * inhaleShare(cfg, b, beat, beatPhase), BAR_H);
  ctx.restore();
}
