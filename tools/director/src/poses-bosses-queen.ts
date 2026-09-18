import type { World } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * THE BULB QUEEN's three states — the oldest boss, and the poses that stood
 * alone under BOSSES on the sheet from the day it had a BOSSES row until the
 * category was built (`poses-bosses.ts`). Moved here from `poses-field.ts`
 * unchanged in what they show, and stood on her own wave rather than on an
 * empty field with six petals: the picture is the encounter.
 */

/**
 * Her own column, a tile below her row. Her marks hang under her middle and
 * her wings reach two columns either side, so the frame is centred on the
 * whole reach rather than on the body.
 */
const queenAt = (w: World): { col: number; row: number } => {
  const q = w.creatures.find((c) => c.kind === "queen");
  return { col: q ? q.col : 3, row: (q ? q.row : 2) + 1 };
};

const queen = (w: World) => w.creatures.find((c) => c.kind === "queen");

export const QUEEN_POSES: Pose[] = [
  // `creature:queen` is judged shut: the armour is the whole of her while both
  // marks are blank, and it is the one state where nothing under it is asking
  // to be looked at instead.
  bossPose(
    "queen",
    "shut",
    "Armoured, holding her row, both marks blank. Nothing that reaches her while she is like this takes a petal.",
    {
      lookAt:
        "the armour across her back, between the two marks under her and the two rocks on her wings — whether it has a near side, and whether anything on it moves",
      crop: "tile",
      span: 8,
      at: queenAt,
      want: (w) => queen(w) !== undefined && !queen(w)?.color,
      hold: 12,
    },
  ),
  bossPose(
    "queen",
    "open",
    "A bloom. One of the two marks under her is real and the other is a lie that looks identical — one player is told which side, the other which colour, and neither can fire on their half alone.",
    { crop: "tile", span: 8, at: queenAt, want: (w) => Boolean(queen(w)?.color), hold: 6 },
  ),
  bossPose(
    "queen",
    "torch",
    "Every eight beats a torch falls straight out of its socket on one wing, and a new one grows in behind it. The fight is a boss and a rock at the same time.",
    {
      crop: "tile",
      span: 9,
      at: queenAt,
      want: (w) => w.creatures.some((c) => c.kind === "torch"),
      hold: 10,
    },
  ),
];
