import { type InstarMark, instarActing, instarStep, NO_BEARING } from "@neon-spore/sim";
import { instarMarkPoint, instarMarkRadius } from "./instar-shape.js";
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
 * A press on one of the marks while they are up: the nearest ring under the
 * thumb, as a `drag` on `instarMark` with `id` naming which. A `turn` mark's
 * hold keeps the *mark's centre* as its origin and is flagged `turns`, so
 * every move after it reports a bearing round the ring rather than a carry
 * (`touch-drag.ts` `turnAbout`) — THE CLAW's crank, on the field.
 */
export function instarMarkUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "instar");
  if (s === null || !instarActing(s)) return null;
  const step = instarStep(s);
  if (step === null) return null;
  const r = instarMarkRadius(l, field.cfg);
  const sway = instarSway(s, field.cfg, field.beat, field.beatPhase);
  let best: { id: number; mark: InstarMark; d: number } | null = null;
  step.marks.forEach((mark, id) => {
    const at = instarMarkPoint(l, mark, sway);
    if (!hitCircle({ x: at.x, y: at.y, r }, x, y)) return;
    const d = (x - at.x) ** 2 + (y - at.y) ** 2;
    if (best === null || d < best.d) best = { id, mark, d };
  });
  if (best === null) return null;
  const { id, mark } = best as { id: number; mark: InstarMark };
  const turns = mark.gesture === "turn";
  const at = instarMarkPoint(l, mark, sway);
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
