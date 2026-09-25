import type { World } from "@neon-spore/sim";

/**
 * **The same world with every unseen body somewhere else, and the other
 * colour.**
 *
 * THE REPRISE counts the unseen bodies still falling (`reprise-brood.ts`, the
 * owner's ask of 25 September 2026), so a frame with the echo lifted off the
 * field is no longer the same picture as one with it standing — it is short a
 * ring per body, on purpose. What must still hold is that the count is *how
 * many* and never *where* or *which*: so the proof is now the same tick drawn
 * twice, the second time with every unseen body moved three columns and a row
 * and its colour turned over, and the two ordered logs of every canvas call
 * have to be identical. A single mark put where a body is, or in its colour,
 * shows up as a line that differs.
 */
export function displaced(world: World): World {
  const { cols, rows } = world.cfg;
  return {
    ...world,
    creatures: world.creatures.map((c) =>
      c.unseen === true
        ? {
            ...c,
            col: (c.col + 3) % cols,
            fromCol: c.fromCol === undefined ? undefined : (c.fromCol + 3) % cols,
            row: Math.min(rows - 2, c.row + 1),
            fromRow: Math.min(rows - 2, c.fromRow + 1),
            color: c.color === "red" ? "cyan" : c.color === "cyan" ? "red" : c.color,
          }
        : c,
    ),
  };
}
