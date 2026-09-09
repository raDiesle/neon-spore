/**
 * Which way a control points, and which rig of keys answers it — read off what
 * *pressing* the control says rather than declared in a table beside it.
 *
 * Split out of `keys-desk.ts`, which is the rows of keys; this is the question
 * those rows ask about each control before they can fill a slot. The seam is
 * the honest one: next door is *which key*, and that is a panel and a seat,
 * while this is *what kind of thing this control is*, and that is a `Command`.
 *
 * A second table of directions here would be a copy of `controlPress`, and the
 * pair would drift the first time a round turned its needle the other way —
 * the drift `purity.test.ts` keeps a table against.
 */

import type { PulseLane } from "@neon-spore/sim";
import { controlPress } from "./control-command.js";
import type { ControlId } from "./controls.js";

/** A direction a control names, or `"column"` for a strip, which names none. */
export type Way = "left" | "right" | "up" | "down";
export type Aim = Way | PulseLane | "column" | null;

/**
 * Which way a control points, read off what pressing it *says* rather than
 * declared beside it.
 *
 * A second table of directions here would be a copy of `controlPress`, and the
 * pair would drift the first time a round turned its needle the other way —
 * the drift `purity.test.ts` keeps a table against. `null` is a control that
 * points nowhere and belongs in its seat's press row.
 */
export function aimOf(id: ControlId): Aim {
  const { down } = controlPress(id);
  switch (down.kind) {
    case "cannonCol":
    case "shieldCol":
      return "column";
    case "slide":
    case "valve":
      return down.dir < 0 ? "left" : "right";
    case "snakeTurn":
      return down.dir;
    case "pulseStep":
      return down.lane;
    case "aim":
      if (down.dcol !== 0) return down.dcol < 0 ? "left" : "right";
      if (down.drow !== 0) return down.drow < 0 ? "up" : "down";
      return null;
    default:
      return null;
  }
}

/**
 * Whether this control is one of the four-way's — a *step* across a chart or a
 * quarter turn — rather than a thing that slides along the hull.
 *
 * The two are told apart by whether the panel is the field's at all: a strip
 * and a held valve move something that is *on the ship*, which is what the
 * seat's own sideways pair is under the hand for, and an `aim` or a
 * `snakeTurn` walks something out on the field, which is what the arrows have
 * always been.
 */
export function onArrows(id: ControlId): boolean {
  const { kind } = controlPress(id).down;
  return kind === "aim" || kind === "snakeTurn";
}

/** Whether this control is one of a seat's *own* four-way — THE PULSE's lanes,
 * which both seats have all four of and which therefore cannot share one set
 * of arrow keys (`SEAT_WAYS`). */
export function onSeatWays(id: ControlId): boolean {
  return controlPress(id).down.kind === "pulseStep";
}
