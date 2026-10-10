import { DRAG_TYPES } from "./field-actions-drag.js";
import { OTHER_ACTIONS } from "./field-actions-other.js";

/**
 * Where every row of `FIELD_CONTROLS` stands on the CONTROLS sheet — the
 * owner's order of 6 October 2026: **the action first** (GRAB AND DRAG, HOLD,
 * PRESS, …), then the **control type** inside it, then **one card per enemy
 * or boss wave** that uses it, each drawn its own way. Actions and types are
 * sorted by how many enemies and boss waves use them, most first.
 *
 * The rows reached on every wave have a tab of their own, EVERY WAVE, beside
 * ON THE FIELD. A row the owner took off the page is in `OFF_THE_PAGE` with
 * the reason, so `test/field-page.test.ts` can still hold every row to
 * exactly one place — but a row of many steps, one card under each type a
 * step of it uses (`ControlType.steps`).
 *
 * Rows are named, never re-described: the row itself is `FIELD_CONTROLS`
 * (`field-controls-page.ts`).
 */

export interface ControlType {
  key: string;
  title: string;
  /** What every use of it has in common, in a sentence or two. */
  says: string;
  /** The decision this lane would take about the type as a whole. */
  suggest?: string;
  /** The gestures in `GESTURES` this type is built from, drawn first under
   * its title — the generic picture before its uses. */
  gestures?: readonly string[];
  /** The PULL LAB shape this type opens on (`pull-lab-shapes.ts`): the one
   * generic control, tried on an empty field before any of its uses. */
  lab?: string;
  rows: readonly string[];
  /** For a row whose one mark asks a different gesture step by step (THE
   * INSTAR's, THE MIRROR's, THE QUEEN's, THE GALL's): which of its steps is
   * this type. Such a row is filed under every type one of its steps uses —
   * the owner, 10 October 2026: STEP BY STEP is how a control is used, not
   * a kind of action — and only such a row may be on more than one. */
  steps?: Readonly<Record<string, string>>;
}

export interface FieldAction {
  key: string;
  title: string;
  /** What the finger does, in one sentence. */
  says: string;
  /** The gesture every type under it starts from, drawn first under the
   * heading (the owner, 9 October 2026: the generic picture, then its uses). */
  gestures?: readonly string[];
  /** As a type's `lab`: the bare gesture, tried on an empty field. */
  lab?: string;
  types: readonly ControlType[];
}

/** The EVERY WAVE tab: reached on every wave, whatever the wave is. */
export const EVERY_WAVE_ROWS: readonly string[] = [
  "GRIP",
  "THE PUSH",
  "THE CANNON",
  "THE MAW TAP",
  "THE SHIELD PLATE",
  "THE SHIELD TRIGGER",
  "THE MUZZLE SWIPE",
  "THE GUIDE'S HOLD",
];

/** Rows kept in `FIELD_CONTROLS` — the game still answers them — but not
 * drawn on the sheet, each with the owner's reason. */
export const OFF_THE_PAGE: Readonly<Record<string, string>> = {
  "THE SCOUT'S LINE":
    "the owner, 6 October 2026: not a control on the screen but a sign that " +
    "the control set's suck reaches wider — it stays in THE SCOUT's wave.",
};

export const FIELD_ACTIONS: readonly FieldAction[] = [
  {
    key: "drag",
    title: "GRAB AND DRAG",
    says: "A finger put on a thing and moved.",
    gestures: ["DRAG, AS A DISPLACEMENT"],
    lab: "rope",
    types: DRAG_TYPES,
  },
  ...OTHER_ACTIONS,
];

/**
 * The wave or enemy a row belongs to — the part of its name before `'S`,
 * which is a wave's own name for every row but two.
 * `test/field-page.test.ts` holds each answer to a name in `WAVES`.
 */
const USER_OF: Readonly<Record<string, string>> = {
  "THE QUEEN'S MARKS": "BULB QUEEN",
  "THE LIGHT": "THE DARK",
};

export function userOf(row: string): string {
  return USER_OF[row] ?? row.split("'S ")[0] ?? row;
}

/** The enemies and boss waves a list of rows is used by, each once, in the
 * order first met. */
export function usersOf(rows: readonly string[]): string[] {
  return [...new Set(rows.map(userOf))];
}

export const typeUses = (t: ControlType): number => usersOf(t.rows).length;
const actionUses = (a: FieldAction): number => usersOf(a.types.flatMap((t) => t.rows)).length;

/** Most uses first; a tie keeps the order it was written in. */
export function byUse<T>(items: readonly T[], uses: (x: T) => number): T[] {
  return [...items].sort((a, b) => uses(b) - uses(a));
}

/** The page's order: actions by use, and inside each its types by use. */
export function sortedActions(): { action: FieldAction; uses: number; types: ControlType[] }[] {
  return byUse(FIELD_ACTIONS, actionUses).map((action) => ({
    action,
    uses: actionUses(action),
    types: byUse(action.types, typeUses),
  }));
}
