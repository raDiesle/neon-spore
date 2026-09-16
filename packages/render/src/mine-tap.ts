import { mineSeenBy } from "@neon-spore/sim";
import { colFromX, type Layout, rowFromY } from "./layout.js";
import type { Field, Touch } from "./touch.js";

/**
 * **A finger on a bare square of the field**, from the seat that cannot see
 * what is standing on it — THE MINE's whole answer (`sim/mine.ts`).
 *
 * Every other hit test in this package is a circle round something drawn: a
 * lobe, a handle, a body, a soundbox. This one has nothing to be round. The
 * seat sending it is looking at an empty field by design, so there is no
 * target to be near and no radius to be generous with — what is answered is
 * the tile the thumb came down in, and that is the whole of it.
 *
 * Which makes it the **last** question asked, and not merely by convention: it
 * answers everywhere at once, so anything that is a press on a *thing* has to
 * have been offered the point first. `touch.ts` asks the handles, the ship,
 * the soundboxes and then a hand on a body, and only a point that none of
 * those wanted arrives here.
 *
 * **Only while this seat owes one.** A press on an empty field on a wave with
 * no mine on it is nothing, and a press from the seat that *can* see the body
 * is nothing too — that seat has a square to say, not one to find. Both are
 * checked here as well as in the simulation, for `beatboxUnder`'s reason: a
 * press answered here and refused there is a control that looks live on one
 * screen and does nothing at all.
 *
 * There is no `hold`. A tap is a moment and a moment cannot be released, which
 * is the soundbox's argument one file over — and here it has a second half:
 * the four tiles round a mine break the hull, so a press that went on meaning
 * something while the thumb slid would be a mistake made by the finger rather
 * than by the pair.
 */
export function mineUnder(l: Layout, field: Field, x: number, y: number): Touch | null {
  const owes = field.creatures.some((c) => c.kind === "mine" && mineSeenBy(c) !== field.seat);
  if (!owes) return null;
  return {
    player: field.seat,
    command: { kind: "tapTile", col: colFromX(l, x), row: rowFromY(l, y) },
    hold: null,
  };
}
