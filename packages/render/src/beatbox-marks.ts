import { beatboxIsBox, beatboxWanted, type World } from "@neon-spore/sim";
import { beatboxSwell } from "./beatbox.js";
import { type BeatboxCount, beatboxCount } from "./beatbox-count.js";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * THE BEATBOX's marks: the **count** over the box on player 1's screen, the
 * **row of dots** on both, and the frame that says *there is a count and it is
 * not yours* on player 2's.
 *
 * THE VEER's arrangement (`veer-marks.ts`) with the sharpest split in the file
 * so far, because here the two screens are not being shown more and less of one
 * thing — one of them is shown a number and the other is shown that a number
 * exists.
 *
 * **Player 1 gets the target.** A numeral above the body, full weight, in the
 * field's own grey: *this one wants three*. The pilot has no thumb that reaches
 * a box, so the number is worth nothing to them except as a thing to say out
 * loud, which is the creature. Their row of dots carries every slot, with the
 * run lit inside it — which is what lets them say *one more* rather than only
 * *three*, the useful sentence late in a run.
 *
 * **Player 2 gets the row, a frame and an instruction with a hole in it.** The
 * same dots, but only as many as their own taps have lit — no numeral, no empty
 * slots, and therefore no way to work out where the row ends. A target lock
 * around the body, which is `dart-query.ts`'s vocabulary reused rather than
 * reinvented, so a pair who have met a dart or a veer already know that a frame
 * like this means *an instrument has found this and cannot tell you the rest*.
 * And under it, CLICK X TIMES TO BEAT. The X is an X and stays one, and the
 * last two words are the owner's — without them the line says how many presses
 * and not *when*, which on this creature is the whole of it. It is the only
 * words in this game written under a body rather than under the siren
 * (`duty.ts`), and it earns that by being the one creature where the seat with
 * the thumb has to be told the *shape* of the answer while being told none of
 * it.
 *
 * **The row and the arms say different things, which is why there are both.**
 * Every counted beat also grows an arm out of the rim
 * (`content/silhouettes-beatbox.ts`), and an arm is a fact about the body: it
 * reads across a room and can only ever say how far in the run is. A dot is a
 * slot in a row, and a row can say the things a body cannot — *that press was
 * not on the beat*, *all of this is now wrong*, *all of this is now right*.
 * `beatbox-count.ts` is which of those it is saying; this file is where they
 * go and what they are drawn with.
 *
 * The marks stand over the box for its whole fall. There is nothing to gate on
 * — a box is asking for the same number on the beat it arrives and on the beat
 * it lands.
 */

/** Whether this screen carries the count. Player 2 never does — that is the
 * whole creature — and `test` does, because it is both seats on one screen and
 * a rig that hid half the picture would be no rig. `showsVeerArrow`'s shape,
 * asked about the other number. */
export function showsBeatboxCount(l: Layout): boolean {
  return l.role !== "p2";
}

/** How far above the body the row of dots sits, in body radii — clear of the
 * swell at its largest and of the longest arm, so a box on the beat never grows
 * into its own marks. */
const PIP_LIFT = 2.5;
/** And the numeral, above the row. */
const NUMBER_LIFT = 3.5;
/** Pip radius and spacing, in body radii. */
const PIP_R = 0.2;
const PIP_GAP = 0.58;
/** And how far below the body the navigator's line sits. Under rather than
 * over, so the two screens' marks are never in the same place: a rig showing
 * both at once has to be readable as two seats' worth of picture. */
const WORDS_DROP = 2.5;
/** The frame's half-extent, in body radii: the square a lure, a dart and a veer
 * all wear, because four markings that mean *picked out* have to be one size. */
const BOX_MUL = 1.6;
/** The navigator's line, and how near the edge of the screen it may come. */
const WORDS = "CLICK X TIMES TO BEAT";
const WORDS_PAD = 8;

/** What a filled dot is filled with, for each of the three things that can be
 * happening to a run (`beatbox-count.ts`). */
const HUE = { plain: PALETTE.text, good: PALETTE.good, wrong: PALETTE.red } as const;

/**
 * The row, centred over the body.
 *
 * The **missed** slot is drawn on the end and is the one dot in this row that
 * is not a press: it is where the press that landed off the beat was reaching,
 * and it is red for well under a beat (`BeatboxCount.missed`).
 */
function drawPips(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  count: BeatboxCount,
): void {
  const total = count.shown;
  if (total <= 0) return;
  const gap = r * PIP_GAP;
  const left = x - ((total - 1) * gap) / 2;
  const fill = HUE[count.hue];
  ctx.save();
  ctx.lineWidth = Math.max(1, r * 0.06);
  for (let i = 0; i < total; i++) {
    // **The next slot, and only that one.** On player 2's screen it is the extra
    // one `beatboxCount` added; on player 1's it is the first of the empty
    // slots they already had. Either way it is the slot the press was reaching
    // for, so painting the rest of the row with it would say the whole run had
    // gone wrong when one press did.
    const missing = count.missed > 0 && i === count.lit;
    ctx.globalAlpha = missing ? count.missed : 1;
    ctx.beginPath();
    ctx.arc(left + i * gap, y, r * PIP_R, 0, Math.PI * 2);
    if (i < count.lit) {
      ctx.fillStyle = fill;
      ctx.fill();
    } else if (missing) {
      ctx.fillStyle = PALETTE.red;
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

/**
 * The navigator's line, under the frame. Smaller than the pilot's numeral and
 * dimmer, because it never changes: it is a standing instruction about how this
 * body is answered, not a reading off the field.
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
    drawPips(ctx, x, y - r * PIP_LIFT, r, beatboxCount(world, c, tell));
    if (tell) drawCount(ctx, x, y, r, beatboxWanted(c));
    // The rig gets both, because `test` is the two seats on one screen.
    if (tell && l.role !== "test") continue;
    drawTargetLock(ctx, x, y, r * BOX_MUL, r * BOX_MUL, PALETTE.text, time, 0.9, c.id);
    drawWords(ctx, l, x, y, r);
  }
}
