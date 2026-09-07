import { beatboxHitsMade, beatboxIsBox, beatboxWanted, type World } from "@neon-spore/sim";
import { beatboxSwell } from "./beatbox.js";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * THE BEATBOX's two half-pictures: the **count** over the box on player 1's
 * screen, and the navigator's own running **tally** on player 2's.
 *
 * THE VEER's arrangement (`veer-marks.ts`) with the sharpest split in the file
 * so far, because here the two screens are not being shown more and less of
 * one thing — they are shown two different numbers.
 *
 * **Player 1 gets the target.** A numeral above the body, full weight, in the
 * field's own grey, with that many pips under it: *this one wants three*. The
 * pilot has no thumb that reaches a box, so the number is worth nothing to
 * them except as a thing to say out loud, which is the creature.
 *
 * **Player 2 gets the receipt.** The same row of pips, but only as many as
 * their own taps have lit — no numeral, no empty slots, and therefore no way
 * to work out where the row ends. A row of three lit pips says *you are three
 * in*; it never says *and three is the answer*. Empty slots would give the
 * count away at a glance, which is why the pips are drawn one at a time from
 * the middle outward rather than into a fixed frame.
 *
 * And a target lock around the body, which is `dart-query.ts`'s vocabulary
 * reused rather than reinvented: a pair who have met a dart or a veer already
 * know that a frame like this means *an instrument has found this and cannot
 * tell you the rest*, and here that is exactly true.
 *
 * Both marks stand over the box for its whole fall. There is nothing to gate
 * on — a box is asking for the same number on the beat it arrives and on the
 * beat it lands, and the pips are the pair's only account of a run that is
 * still open.
 */

/** Whether this screen carries the count. Player 2 never does — that is the
 * whole creature — and `test` does, because it is both seats on one screen and
 * a rig that hid half the picture would be no rig. `showsVeerArrow`'s shape,
 * asked about the other number. */
export function showsBeatboxCount(l: Layout): boolean {
  return l.role !== "p2";
}

/** How far above the body the pips sit, in body radii — clear of the swell at
 * its largest, so a box on the beat never grows into its own marks. */
const PIP_LIFT = 1.75;
/** And the numeral, above the pips. */
const NUMBER_LIFT = 2.9;
/** Pip radius and spacing, in body radii. */
const PIP_R = 0.14;
const PIP_GAP = 0.44;
/** The frame's half-extent, in body radii: the square a lure, a dart and a
 * veer all wear, because four markings that mean *picked out* have to be one
 * size. */
const BOX_MUL = 1.6;

/** The row of pips, centred over the body. `lit` of `shown` are filled; the
 * rest are drawn as outlines, and player 2 is handed `shown === lit` so no
 * outline ever appears on that screen. */
function drawPips(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  shown: number,
  lit: number,
): void {
  if (shown <= 0) return;
  const gap = r * PIP_GAP;
  const left = x - ((shown - 1) * gap) / 2;
  ctx.save();
  ctx.lineWidth = Math.max(1, r * 0.06);
  for (let i = 0; i < shown; i++) {
    ctx.beginPath();
    ctx.arc(left + i * gap, y, r * PIP_R, 0, Math.PI * 2);
    if (i < lit) {
      ctx.fillStyle = PALETTE.text;
      ctx.fill();
    } else {
      ctx.strokeStyle = PALETTE.dim;
      ctx.stroke();
    }
  }
  ctx.restore();
}

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
    const hits = beatboxHitsMade(c);
    const above = y - r * PIP_LIFT;
    if (tell) {
      const want = beatboxWanted(c);
      drawCount(ctx, x, y, r, want);
      // Every slot, with the run lit inside it: the pilot is the one seat that
      // can see both numbers at once, which is what lets them say *one more*
      // rather than only *three* — the useful sentence late in a run.
      drawPips(ctx, x, above, r, Math.max(want, hits), hits);
      continue;
    }
    // The navigator's own taps and nothing else. `hits` twice, so `drawPips`
    // has no empty slot to draw: an outline here would be the count leaking
    // onto the one screen that must not have it.
    drawPips(ctx, x, above, r, hits, hits);
    drawTargetLock(ctx, x, y, r * BOX_MUL, r * BOX_MUL, PALETTE.text, time, 0.9, c.id);
  }
}
