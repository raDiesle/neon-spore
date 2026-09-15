import { faultWindow, HARPOON_KINDS, type HarpoonKind, type World } from "@neon-spore/sim";
import type { HeldHarpoons } from "./harpoon-place.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * **WHAT IS ON THE CONTROL, WRITTEN ON IT.**
 *
 * The owner's point 2 of 14 September 2026: *on the cannon it is marked the way
 * a codex is — its code written above it, the radar square round it, and MOVE
 * CANNON! above the square* — with point 5's *a timer above it says how long it
 * stays* in the same stack.
 *
 * **The reading taken, said plainly because the sentence allows two.** From the
 * body upward: the square round it, the code immediately above the square, the
 * timer above the code, and the word at the top. He put the word above the
 * square and the timer above the body, and both of those are true of this
 * stack; what the stack decides is the order of the three lines among
 * themselves, and it puts the loudest furthest from the body — where nothing
 * can crowd it and where a glance at the top of the column finds it.
 *
 * **The square is `drawTargetLock` and not a rectangle of this file's.** That
 * is the marking this game uses for *an instrument has picked this body out*,
 * and it is drawn identically over a lure, a dart, a cloud and the queen's two
 * marks, on the owner's own instruction that four pictures for one idea is
 * three too many (`target-lock.ts`). A body a fault fired onto a control is
 * exactly that idea again.
 *
 * **The word is on both screens, and so is the one under the siren.** They are
 * not a duplicate of each other: the dial's word is what a seat *owes the other
 * one* and is under the seat's own name, and this one is nailed to the thing it
 * is about. The owner asked for both, in the same paragraph.
 */

/** The code each kind writes, and the word above it. */
const MARK = {
  leech: { code: "MF·LEECH", word: "MOVE CANNON!" },
  limpet: { code: "MF·LIMPET", word: "MOVE SHIELD!" },
} as const satisfies Record<HarpoonKind, { code: string; word: string }>;

/** The three lines, in pixels above the top of the square. */
const CODE_UP = 11;
const TIMER_UP = 24;
const WORD_UP = 40;
/** The instrument's own typeface — the lure's, for the lure's reason: a
 * readout off a machine rather than a thing drawn on the field. */
const CODE_FONT = '600 8px "Courier New",monospace';
const TIMER_FONT = '700 12px "Courier New",monospace';
const WORD_FONT = '700 11px "Courier New",monospace';

/**
 * How many beats of this placement are left, or null for one with no end
 * written.
 *
 * `faultWindow` rather than arithmetic here: where a placement starts and ends
 * is a rule with one owner (`sim/fault-placed.ts`), and a second copy of it is
 * how a timer comes to disagree with the reel it is counting down to. A
 * `TO_THE_END` pencil has an infinite `to` and gets no number at all — a
 * countdown that never reaches nought is worse than no countdown, because the
 * pair spends the wave waiting for it.
 */
export function harpoonBeatsLeft(world: World, kind: HarpoonKind): number | null {
  const window = faultWindow(world, kind);
  if (!window || !Number.isFinite(window.to)) return null;
  return Math.max(0, Math.ceil(window.to - Math.max(0, world.waveBeat - 1)));
}

/**
 * Every harpooned body on this screen, marked. Drawn on the finished ship,
 * over the body itself.
 *
 * `held` is where each one is *drawn* (`harpoon-place.ts`), which is the eased
 * lobe and not the body's own column: a square nailed to a column while the
 * lobe under it is still gliding is a square that misses what it is round.
 */
export function drawHarpoonMarks(
  ctx: CanvasRenderingContext2D,
  world: World,
  held: HeldHarpoons,
  time: number,
): void {
  // Nothing held costs nothing, `harpoon-line.ts`'s rule and the op budget's.
  if (held.size === 0) return;
  ctx.save();
  ctx.textAlign = "center";
  for (const kind of HARPOON_KINDS) {
    const at = held.get(kind);
    if (at) mark(ctx, world, kind, at, at.r, time);
  }
  ctx.textAlign = "left";
  ctx.restore();
}

function mark(
  ctx: CanvasRenderingContext2D,
  world: World,
  kind: HarpoonKind,
  at: { x: number; y: number },
  r: number,
  time: number,
): void {
  drawTargetLock(ctx, at.x, at.y, r * 1.25, r * 1.25, PALETTE.arc, time, 1, at.x);
  const top = at.y - r * 1.25;
  const of = MARK[kind];
  ctx.fillStyle = PALETTE.arc;
  ctx.font = CODE_FONT;
  ctx.fillText(of.code, at.x, top - CODE_UP);
  const left = harpoonBeatsLeft(world, kind);
  // Nothing when the pencil has no end written — see `harpoonBeatsLeft`.
  if (left !== null) {
    ctx.font = TIMER_FONT;
    ctx.fillStyle = PALETTE.arcRim;
    // Beats and not seconds: every clock the pair reads in this game is in
    // beats, and the pencil that placed this was authored in them.
    ctx.fillText(`${left}`, at.x, top - TIMER_UP);
  }
  ctx.font = WORD_FONT;
  ctx.fillStyle = PALETTE.arcRim;
  ctx.fillText(of.word, at.x, top - WORD_UP);
}
