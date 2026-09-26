import { queenHand } from "@neon-spore/hands";
import { queenGesture, type World } from "@neon-spore/sim";
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
    "Armoured, both marks blank. Nothing that reaches her takes a petal. P1 aims; P2 holds her fire.",
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
    "A bloom: one mark is real, one a lie. P2 is told which side; P1 is told the colour. Neither fires alone.",
    { crop: "tile", span: 8, at: queenAt, want: (w) => Boolean(queen(w)?.color), hold: 6 },
  ),
  // BROOD: P1 presses the real mark to open it. P2 says which.
  bossPose("queen", "pried", "P1: press the real mark — a ring on both. P2: say which side.", {
    lookAt:
      "the ring on each mark and the armour thrown off the one just pried — whether the pried one reads as opened by a thumb rather than by her",
    crop: "tile",
    span: 8,
    at: queenAt,
    hand: queenHand,
    want: (w) => w.boss?.kind === "queen" && w.boss.pryBeat !== -1 && Boolean(queen(w)?.color),
    hold: 4,
    budgetBeats: 90,
  }),
  // SCREAM: P1 holds the real mark to keep it open. P2 fires.
  bossPose(
    "queen",
    "held",
    "P1: hold the real mark — she shuts in a beat otherwise. P2: fire its colour.",
    {
      lookAt:
        "the filled ring on the held mark and the dial closing round it — whether the beats left read off it without a number",
      crop: "tile",
      span: 8,
      at: queenAt,
      hand: queenHand,
      want: (w) =>
        w.boss?.kind === "queen" &&
        queenGesture(w.boss) === "hold" &&
        w.boss.holdSide === w.boss.weakSide &&
        Boolean(queen(w)?.color),
      hold: 12,
      budgetBeats: 140,
    },
  ),
  bossPose(
    "queen",
    "torch",
    "Every eight beats a torch drops out of a wing socket. P1 slides the cannon off its column; P2 fires at it.",
    {
      crop: "tile",
      span: 9,
      at: queenAt,
      want: (w) => w.creatures.some((c) => c.kind === "torch"),
      hold: 10,
    },
  ),
];
