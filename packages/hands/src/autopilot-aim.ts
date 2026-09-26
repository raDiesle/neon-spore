import {
  type Creature,
  crystalMiddleCol,
  isWardable,
  SHELL_COLS,
  shellHasPiece,
} from "@neon-spore/sim";

/**
 * **Which column the cannon stands in to answer a body**, on an ordinary
 * wave. For most bodies that is the body's own column. A body wider than one
 * column is answered in a column of its own choosing, and this file is where
 * each of those is written down (`autopilot-field-hand.ts` asks it).
 *
 * THE SHELL: one piece of plating over each of its two columns, and a shot up
 * a column already bared does nothing (`shell.ts`). So the cannon stands under
 * a column that still has its piece, and under the body's own column once
 * both pieces are gone.
 *
 * THE CRYSTAL: only its middle breaks (`crystal.ts`), so the cannon stands
 * under the middle of its three columns.
 */
export function aimColumn(c: Creature): number {
  if (c.kind === "crystal") return crystalMiddleCol(c);
  if (c.kind === "shell") {
    for (let k = 0; k < SHELL_COLS; k++) if (shellHasPiece(c, c.col + k)) return c.col + k;
  }
  return c.col;
}

/**
 * **Whether the cannon answers this body at all**: a body with a colour that
 * the shield does not turn. A lure is not one. It wears a real colour, any shot
 * that lands on it costs the hull, and left alone it leaves by itself two rows
 * short of the ship (`lure-exit.ts`). So the hand leaves it alone. A clasp is
 * not one either until the shield has broken it: a shot at a shut one is spent
 * on nothing (`claspStruck`). A wisp wears no colour and is one all the same:
 * either colour lands it (`wispStruck`), so the shot it gets is red.
 */
export function cannonAnswers(c: Creature): boolean {
  if (c.kind === "wisp") return true;
  return c.color !== null && !isWardable(c.kind) && c.kind !== "lure" && c.kind !== "clasp";
}
