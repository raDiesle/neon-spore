import { beatboxIsBox, beatboxWanted, type World } from "@neon-spore/sim";
import { beatboxSwell } from "./beatbox.js";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * THE BEATBOX's two half-pictures: the **count** over the box on player 1's
 * screen, and the frame that says *there is a count and it is not yours* on
 * player 2's.
 *
 * THE VEER's arrangement (`veer-marks.ts`) with the sharpest split in the file
 * so far, because here the two screens are not being shown more and less of
 * one thing — one of them is shown a number and the other is shown that a
 * number exists.
 *
 * **Player 1 gets the target.** A numeral above the body, full weight, in the
 * field's own grey: *this one wants three*. The pilot has no thumb that
 * reaches a box, so the number is worth nothing to them except as a thing to
 * say out loud, which is the creature.
 *
 * **Player 2 gets a frame and an instruction with a hole in it.** A target
 * lock around the body — `dart-query.ts`'s vocabulary reused rather than
 * reinvented, so a pair who have met a dart or a veer already know that a
 * frame like this means *an instrument has found this and cannot tell you the
 * rest* — and under it, CLICK X TIMES. The X is an X and stays one. It is the
 * only words in this game written under a body rather than under the siren
 * (`duty.ts`), and it earns that by being the one creature where the seat with
 * the thumb needs to be told the *shape* of the answer while being told none
 * of it: a navigator meeting their first box has no way to guess that the
 * gesture is a run of presses rather than one.
 *
 * **The tally is gone from both screens, and that is where the arms came
 * from.** Both seats used to carry a row of pips — the pilot's showing the
 * target with the run lit inside it, the navigator's showing only their own
 * taps. The owner asked for the count to stop being a number floating over the
 * body and start being something the body *does*, so every beat that lands now
 * grows an arm out of the rim instead (`content/silhouettes-beatbox.ts`). It
 * reads at a glance from further away than a pip ever did, it cannot leak the
 * target because an arm only ever stands for a beat already spent, and it puts
 * the receipt on the thing the thumb is actually touching.
 *
 * Both marks stand over the box for its whole fall. There is nothing to gate
 * on — a box is asking for the same number on the beat it arrives and on the
 * beat it lands.
 */

/** Whether this screen carries the count. Player 2 never does — that is the
 * whole creature — and `test` does, because it is both seats on one screen and
 * a rig that hid half the picture would be no rig. `showsVeerArrow`'s shape,
 * asked about the other number. */
export function showsBeatboxCount(l: Layout): boolean {
  return l.role !== "p2";
}

/** How far above the body the numeral sits, in body radii — clear of the
 * swell at its largest and of the longest arm, so a box on the beat never
 * grows into its own marks. */
const NUMBER_LIFT = 2.6;
/** And how far below the body the navigator's line sits. Under rather than
 * over, so the two screens' marks are never in the same place: a rig showing
 * both at once has to be readable as two seats' worth of picture. */
const WORDS_DROP = 2.5;
/** The frame's half-extent, in body radii: the square a lure, a dart and a
 * veer all wear, because four markings that mean *picked out* have to be one
 * size. */
const BOX_MUL = 1.6;
/** The navigator's line, and how near the edge of the screen it may come. */
const WORDS = "CLICK X TIMES";
const WORDS_PAD = 8;

/**
 * The count itself, in the small monospace `coord-grid.ts` uses for its own
 * on-field labels — both are a short number read at a glance rather than a
 * headline — and sized off the body's own radius, so a box far up the field
 * wears a number that shrinks with it.
 */
function drawCount(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  want: number,
): void {
  const size = Math.max(10, Math.min(16, r * 0.95));
  ctx.save();
  ctx.font = `bold ${Math.round(size)}px "Courier New",monospace`;
  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(want), x, y - r * NUMBER_LIFT);
  ctx.restore();
}

/**
 * The navigator's line, under the frame. Smaller than the pilot's numeral and
 * dimmer, because it never changes: it is a standing instruction about how
 * this body is answered, not a reading off the field.
 */
function drawWords(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
): void {
  const size = Math.max(8, Math.min(11, r * 0.5));
  ctx.save();
  ctx.font = `bold ${Math.round(size)}px "Courier New",monospace`;
  ctx.fillStyle = PALETTE.dim;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Held inside the screen rather than centred on the body come what may, the
  // same clamp and for the same reason the siren's own word has: a box in the
  // outermost column is thirteen characters wide and half of them ran off the
  // edge of the phone, which is the one thing an instruction must not do
  // (`siren.ts`). The frame above it still says which body the line is about.
  const half = ctx.measureText(WORDS).width / 2;
  ctx.fillText(
    WORDS,
    Math.min(Math.max(x, half + WORDS_PAD), l.width - half - WORDS_PAD),
    y + r * WORDS_DROP,
  );
  ctx.restore();
}

export function drawBeatboxMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  /** The wall clock, for the lock's flicker (`target-lock.ts`). */
  time: number,
): void {
  const tell = showsBeatboxCount(l);
  for (const c of world.creatures) {
    if (!beatboxIsBox(c)) continue;
    const { x, y } = creatureCenter(l, c, beatPhase);
    // The body's drawn radius, swell and all, so the marks stand clear of the
    // box at its largest rather than being swallowed by it on every beat.
    const r = creatureRadius(l, c, beatPhase, world.cfg) * beatboxSwell(c, world.beat, beatPhase);
    if (tell) drawCount(ctx, x, y, r, beatboxWanted(c));
    // The rig gets both, because `test` is the two seats on one screen.
    if (tell && l.role !== "test") continue;
    drawTargetLock(ctx, x, y, r * BOX_MUL, r * BOX_MUL, PALETTE.text, time, 0.9, c.id);
    drawWords(ctx, l, x, y, r);
  }
}
