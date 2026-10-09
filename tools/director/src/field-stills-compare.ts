import type { FieldControlDef } from "./field-control-def.js";
import { stillsStrip } from "./field-stills-art.js";
import { text } from "./gestures-page.js";
import type { Pose } from "./pose-kit.js";

/**
 * **Every use of one control type, stills under stills** — the view a type's
 * ▤ COMPARE ALL USES opens (`field-action-cards.ts`). One row a use: who it
 * is, and its strip from a beat before the press to three beats after the
 * lift (`field-stills-art.ts`), all at one size, so the same moment of every
 * use reads down a column. The owner, 9 October 2026: the page is for
 * choosing one look per control, and that is a comparison.
 */

export interface StillsUse {
  user: string;
  pose: Pose;
  rows: readonly FieldControlDef[];
}

/** Room left of the strips for the use's name, in CSS pixels. */
const NAME = 150;
/** Stills in a strip. */
const STILLS = 6;
/** Tallest a still is drawn in the comparison. */
const CAP = 200;

export function compareStills(uses: readonly StillsUse[], width: number): HTMLElement {
  const box = document.createElement("div");
  box.className = "stills-compare";
  const frame = Math.floor((width - NAME) / STILLS) - 8;
  for (const u of uses) {
    const row = document.createElement("div");
    row.className = "stills-row";
    const name = text("h4", u.user);
    name.appendChild(text("span", u.rows.map((r) => r.name).join(" · ")));
    row.append(name, stillsStrip(u.pose, u.rows, frame, CAP));
    box.appendChild(row);
  }
  return box;
}
