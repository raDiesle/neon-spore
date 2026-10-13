import { type Creature, choirOnField } from "@neon-spore/sim";
import type { Circle, Layout } from "./layout.js";
import { hitCircle } from "./layout.js";
import type { Field, Touch } from "./touch.js";

/**
 * **THE CHOIR's rub**: one mark in the middle of the field, on both screens,
 * that both seats scrub at once to open a membrane on a device that cannot
 * tell it has been shaken — and on a desk, where nothing can be. It took the
 * place of the two arrows against the walls on 13 October 2026, the owner:
 * *instead of the left and right side shake alternative controls on pc, we
 * will reuse the "rub" control, which is somewhere in the center of the screen
 * and related player ( or both) needs to use it at the same time.*
 *
 * There is no reliable way to ask a browser whether a shake is available, so
 * **both ways in are drawn, always** — the owner's own decision when that
 * question was put to him — and the shake stays the pilot's (`shake.ts`).
 *
 * **It is a handle, not a button**: a press on it takes hold and says
 * nothing, flagged `rub`, and the turns are counted by whoever owns the
 * pointers (`rub-turns.ts`), as THE CAPSTAN's and THE BLISTER's are. How it
 * looks is `choir-rub-draw.ts`.
 */

/** Where it stands: the middle of the field across, and a little under the
 * middle of the play area down, so the membrane falling in from the top is
 * seen before it reaches it. */
const RUB_Y = 0.58;
/** The grab circle, as a share of the screen width: big, for two thumbs. */
const RUB_R = 0.13;
/** The drawn drop, as a share of the grab circle — the grab reaches past it. */
export const RUB_DROP = 0.62;

/** Whether this screen draws and answers the rub at all. One call, asked by
 * the drawing and by the hit test, so a mark can never be drawn where nothing
 * answers it. Both seats: the rub counts only when both are on it. */
export function showsChoirRub(creatures: readonly Creature[]): boolean {
  return choirOnField(creatures);
}

/** Where the rub rests. It does not travel, so its resting circle is its grab circle. */
export function choirRubCircle(l: Layout): Circle {
  return { x: l.width / 2, y: l.bandTop * RUB_Y, r: l.width * RUB_R };
}

/** A press on the rub: either seat's thumb, taken hold of, saying nothing
 * until it turns (`rub-turns.ts`). */
export function choirRubUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  if (!showsChoirRub(field.creatures)) return null;
  if (!hitCircle(choirRubCircle(l), x, y)) return null;
  const seat = field.seat;
  return {
    player: seat,
    command: null,
    hold: { kind: "drag", target: "choirRub", player: seat, originX: x, originY: y, rub: true },
  };
}
