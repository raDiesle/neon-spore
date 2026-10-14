import { autoThumb } from "./pull-lab-auto.js";
import { freshPull, type LabPull, lift, move, press, tick } from "./pull-lab-rule.js";
import { LAB_KNOB, LAB_TILE, type LabShape } from "./pull-lab-shapes.js";
import type { Stray } from "./pull-lab-stray.js";

/**
 * **A moment of the PULL LAB, with no page round it**: the pull as AUTO leaves
 * it, or as a drop left alone leaves it, so many seconds in, and the box round
 * the shape's travel. Cut out of `pull-lab-sheet.ts`, which builds DOM, so
 * `drop-sheet.ts` can paint the same moments through Skia with no browser.
 */

/** The moments, in seconds of AUTO's loop (`pull-lab-auto.ts`), and what each shows —
 * with the sheet's OFF PATH rule on, so its second pull strays (`SHEET_STRAY`). */
export const MOMENTS: readonly { at: number; label: string }[] = [
  { at: 0.04, label: "COMING IN · THE DROP" },
  { at: 0.27, label: "COMING IN · THE PATH" },
  { at: 0.42, label: "COMING IN · THE PLACE" },
  { at: 0.75, label: "WAITING" },
  { at: 1.6, label: "HELD · OFF THE MIDDLE" },
  { at: 2.2, label: "COUNTED · FIZZING" },
  { at: 2.45, label: "COUNTED · BOILING AWAY" },
  { at: 3.05, label: "A FRESH DROP COMING IN" },
  { at: 3.5, label: "THE PATH IN" },
  { at: 5.0, label: "NEAR THE EDGE" },
  { at: 5.12, label: "OFF THE PATH" },
  { at: 5.5, label: "DRAGGED HOME" },
  { at: 5.85, label: "SETTLING" },
];

/** The lab's frame step: sixty a second, as the page runs it. */
export const STEP = 1 / 60;
/** The sheet's OFF PATH rule, the lab's: half a tile, so its second pull strays and
 * the band is drawn. */
export const SHEET_STRAY: Stray = "half";

/** The pull as AUTO leaves it `seconds` into its loop, short pulls refused. */
export function pullAt(
  shape: LabShape,
  seconds: number,
  stray: Stray = SHEET_STRAY,
): { pull: LabPull; down: boolean } {
  const pull = freshPull(shape);
  let down = false;
  for (let t = 0; t < seconds; t += STEP) {
    const th = autoThumb(shape, t, stray !== "free");
    if (th.down && !down) press(shape, pull, th.at);
    if (th.down) move(shape, pull, th.at, stray);
    if (!th.down && down) lift(shape, pull, "refuse");
    down = th.down;
    tick(shape, pull, STEP);
  }
  return { pull, down };
}

/** The pull with AUTO off and no thumb, `seconds` after the drop came in: a drop waiting. */
export function waitAt(shape: LabShape, seconds: number): LabPull {
  const pull = freshPull(shape);
  for (let t = 0; t < seconds; t += STEP) tick(shape, pull, STEP);
  return pull;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The box round the shape's whole travel, with room for a knob's rings. */
export function cropOf(shape: LabShape, stray: Stray = SHEET_STRAY): Box {
  // Room for a knob's rings, and for one let go a tile and more off the path.
  const pad = LAB_KNOB * 3.4 + (stray === "free" ? 0 : LAB_TILE);
  const pts = shape.track.pts;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  return { x, y, w: Math.max(...xs) + pad - x, h: Math.max(...ys) + pad - y };
}
