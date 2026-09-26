import {
  type InstarMark,
  instarActing,
  instarStep,
  instarWound,
  NO_BEARING,
} from "@neon-spore/sim";
import { instarMarkPoint, instarMarkRadius, type Point } from "./instar-place.js";
import { instarThreat } from "./instar-shape.js";
import { instarSway } from "./instar-sway.js";
import { hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * THE INSTAR's marks under a thumb — the hit test alone.
 *
 * Its own file because `instar-marks.ts` went over 250 lines when the swing
 * arrived (`instar-sway.ts`), and this is the seam that file already had: next
 * door is every stroke of a ring, and here is the one question the input layer
 * asks of them. The two read the same two functions, so a ring cannot be drawn
 * one place and found another.
 */

/**
 * **The nearest ring under the thumb**, with where it is drawn this frame.
 * The one reading, so the two questions below cannot answer about two
 * different marks: what a press takes hold of, and whose the ring is.
 */
function markUnder(
  l: Layout,
  x: number,
  y: number,
  field: Field,
): { id: number; mark: InstarMark; at: Point } | null {
  const s = bossOf(field, "instar");
  if (s === null || !instarActing(s)) return null;
  const step = instarStep(s);
  if (step === null) return null;
  const r = instarMarkRadius(l, field.cfg);
  const sway = instarSway(s, field.cfg, field.beat, field.beatPhase);
  const along = instarThreat(s, field.beat, field.beatPhase);
  let best: { id: number; mark: InstarMark; at: Point; d: number } | null = null;
  step.marks.forEach((mark, id) => {
    const at = instarMarkPoint(l, mark, sway, along);
    if (!hitCircle({ x: at.x, y: at.y, r }, x, y)) return;
    const d = (x - at.x) ** 2 + (y - at.y) ** 2;
    if (best === null || d < best.d) best = { id, mark, at, d };
  });
  return best;
}

/**
 * **Whose thumb the ring under this point is asking for**, and `undefined`
 * where there is no ring or it wants both.
 *
 * The one control on the field that names a seat and still answers either
 * thumb: every other handle a seat does not own is simply not there for it,
 * and a mark is there and **refused**, which is how a phone tells a player
 * the ring is their partner's (`sim/instar-hand.ts`). That refusal is the
 * reason the desk cannot find the seat by trying one and then the other, and
 * this is what it asks instead (`desk-grab.ts`). It reads the same nearest
 * ring `instarMarkUnder` takes hold of, so the mouse cannot be given one
 * mark's seat and then hold another.
 */
export function instarMarkSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const found = markUnder(l, x, y, field);
  if (found === null || found.mark.seat === "both") return undefined;
  return found.mark.seat === "p1" ? 1 : 2;
}

/**
 * **Whether the ring under this point wants both thumbs** — THE INSTAR's
 * `HOLD BOTH`, which counts only while the two seats are on it together
 * (`sim/instar-step.ts`). The desk's one mouse answers it as both hands
 * (`desk-grab.ts` `deskDownAll`); a phone never asks.
 */
export function instarMarkBoth(l: Layout, x: number, y: number, field: Field): boolean {
  return markUnder(l, x, y, field)?.mark.seat === "both";
}

/**
 * A press on one of the marks while they are up: the nearest ring under the
 * thumb, as a `drag` on `instarMark` with `id` naming which. A wound mark's
 * hold keeps the *mark's centre* as its origin and is flagged `turns`, so
 * every move after it reports a bearing round the ring rather than a carry
 * (`touch-drag.ts` `turnAbout`) — THE CLAW's crank, on the field.
 *
 * **Signed with the field's own seat, whosever mark it is.** A phone that
 * pressed its partner's ring is told so and counts nothing
 * (`sim/instar-hand.ts`), which is the one thing this boss says about whose
 * mark is whose; the desk picks the seat before the press instead
 * (`instarMarkSeat`).
 */
export function instarMarkUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const found = markUnder(l, x, y, field);
  if (found === null) return null;
  const { id, mark, at } = found;
  const turns = instarWound(mark.gesture);
  return {
    player: field.seat,
    command: {
      kind: "drag",
      target: "instarMark",
      on: true,
      fromMilli: turns ? NO_BEARING : 0,
      fromYMilli: 0,
      id,
    },
    hold: {
      kind: "drag",
      target: "instarMark",
      player: field.seat,
      originX: turns ? at.x : x,
      originY: turns ? at.y : y,
      id,
      ...(turns ? { turns: true as const } : {}),
    },
  };
}
