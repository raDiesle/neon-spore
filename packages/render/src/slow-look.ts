import { slowing, type World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import type { ViewState } from "./renderer.js";
import { intakeWindow } from "./slow-intake.js";

/**
 * **The one moment in this game that exists purely to be felt, and the seam
 * where a picture of it can be argued about.**
 *
 * THE SLOW writes two beats into `World` and `apps/game/src/tick-rate.ts`
 * stretches `tickMs` across them (`sim/slow.ts`). That is the whole of it:
 * nothing in this package asked `slowing` at all, so a pair who has not
 * noticed the frame rate change does not know a window is open or when it
 * shuts — and the owner asked on 19 September 2026 for the pressure to be
 * *seen*, on THE INSTAR, whose marks are the gesture it is pressing on
 * (`docs/queue.md`).
 *
 * **What ships is `slow-intake.ts`**, taken out of the slot on 22 September
 * 2026: soft streams of light running inward all the way round the boss and
 * stopping at its skin, and since 25 September a fuse along the top of the
 * screen that says how much window is left (`slow-fuse.ts`). It is still one field on a record and not a drawing in this
 * file, because that is the seam a later answer is argued at
 * (`tools/versus/README.md`, `tools/versus/DECIDED.md`).
 *
 * Two rules hold whichever answer is in the field, and they are why this file
 * holds a record and not a drawing. **Nothing here may touch the simulation**: the
 * window's boundaries are hashed fields both phones already agree about, and a
 * paint that wrote one would be a picture deciding a rule. And **nothing may
 * outlive a frame** without going in `Effects` and being cleared in
 * `Effects.reset()` — `slowWindow` is read fresh from the world every frame
 * for exactly that reason, so a window that ended leaves nothing behind
 * (`test/restart.test.ts`).
 */

/**
 * How far through the window this frame stands, for a paint that wants to
 * spend it rather than only know it is open.
 *
 * Beats and not seconds. A window is `slowRateMilli` slower in the hand than
 * on the tick line, so wall-clock seconds would be a second clock disagreeing
 * with the one the pair is hearing; `through` runs at the rate the *beats* do,
 * which is the rate a border closing or a marker guttering has to keep.
 */
export interface SlowWindow {
  /** How long the window runs, in beats — its whole width. */
  readonly beats: number;
  /** 0 on the beat it opened, 1 on the beat it shuts. */
  readonly through: number;
  /** Beats left, fractional, and never negative. */
  readonly left: number;
}

/**
 * The window this frame is inside, or `null` for an ordinary frame.
 *
 * `world.beat + beatPhase` is the drawn beat, the way every other pass in this
 * package spells it: `world.beat` is a label that runs behind the tick line
 * and the phase is the only interpolation the simulation allows
 * (`renderer.ts`). A window that has been re-opened simply reads wider —
 * `openSlow` moves the end and keeps the start, so two dramatic beats in a row
 * are one border closing and not two (`sim/slow.ts`).
 */
export function slowWindow(world: World, beatPhase: number): SlowWindow | null {
  if (!slowing(world)) return null;
  const beats = world.slowToBeat - world.slowFromBeat;
  if (beats <= 0) return null;
  const now = world.beat + beatPhase;
  const through = Math.min(1, Math.max(0, (now - world.slowFromBeat) / beats));
  return { beats, through, left: Math.max(0, world.slowToBeat - now) };
}

/**
 * One record, one field, patched by every candidate in the slot.
 *
 * A whole function rather than a handful of numbers because the four answers
 * worth drawing do not share a shape — a border thickening at the field's edge
 * and a wash that leaves the marks coloured have no field in common to argue
 * over, and a record holding the union of both would be a record where each
 * candidate silently ignores half of it. `Patch.fields` takes a function
 * (`poseAt` is one), and `bun run versus adopt` takes it by moving the file it
 * was written in, which is why a candidate keeps its paint in `paint.ts`.
 */
export interface SlowLook {
  /**
   * Over the field and under the ship, for the length of the window.
   *
   * The station is the argument: the window is about the *field*, and the band
   * is how the pair answers it — a wash that dimmed the panel would dim the
   * thing being hurried toward. It sits over every body on the field and under
   * the hull for that reason alone (`canvas2d.ts`).
   */
  paint(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    world: World,
    view: ViewState,
    win: SlowWindow,
  ): void;
}

export const SLOW_LOOK: SlowLook = {
  paint: intakeWindow,
};

/**
 * The pass, as the renderer calls it. A file of its own and not a line inside
 * `drawBodies` for `boss-cue-field.ts`' reason: `frame-field.ts` is at its
 * 250-line limit and had nothing to grow onto.
 *
 * THE WELL is not asked about here, where the boss cue has to ask: a window is
 * drawn in the layout's own coordinates and not on a tile, so it lands the
 * same way on a field that has been rolled into a clock face (`well-draw.ts`).
 */
export function drawFieldSlow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
): void {
  const win = slowWindow(world, view.beatPhase);
  if (win === null) return;
  SLOW_LOOK.paint(ctx, l, world, view, win);
}
