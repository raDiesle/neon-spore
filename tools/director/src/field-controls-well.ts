import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE WELL's seam**, in a file of its own, the split every boss since
 * THE INSTAR has made.
 *
 * One target, `wellSeam`, and **two rows, because the face says which
 * gesture it is** — not the seat and not the thumb (`sim/well-hand.ts`).
 * While the clock is slipping a thumb on the seam holds it still; once it has
 * slipped as far as it goes the same thumb carries it home. Two rows rather
 * than one because they are two pictures and two poses, the way THE GORGE's
 * pinch and pry are.
 *
 * The seam is the one sector of the face that holds no column — where the
 * field's two walls meet when the row is rolled into a circle — so a hand on
 * it takes nothing away from the game the pair are already playing
 * (`render/touch-well.ts`, `docs/spec/bosses.md`).
 */
export const WELL_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE WELL'S SEAM",
    where:
      "the empty sector of the clock face, where the field's two walls meet " +
      "— the brightest line on the picture, and a wall to everything above " +
      "it, so no lobe and no body is ever in it — on player 1's screen " +
      "only, while the face is slipping",
    seat: "player 1 only — the seat the well is projected for; she has the flat field with plain columns on it",
    gesture: "hold",
    does:
      "Stops the slip under his thumb. The hours stay on the columns they " +
      "are on for as long as he holds, on a budget well-step.ts spends " +
      "rather than a window it deals — so a pair who need one more beat to " +
      "say which numeral is over which column may buy it, and a pair who " +
      "hold through every slip run out (sim/well-hand.ts). It is his thumb " +
      "and her reading: the face is drawn on one screen of the two, which is " +
      "why the answer is her saying the column out loud.",
    source: "touch.ts — wellSeamUnder() under wellUnder()",
    holdKind: "drag",
    dragTarget: "wellSeam",
    sends: ["drag"],
    pose: "THE WELL · HELD",
  },
  {
    name: "THE WELL'S WIND",
    where:
      "the same sector of the face, once the slip has stopped at the far end and the face wants turning back",
    seat: "player 1 only — the same thumb on the same seam, and the fight's one handle read a second way",
    gesture: "grab and drag",
    does:
      "Turns the face home. The carry is cumulative from the grab and one " +
      "tile of thumb is one sector of face, with no gearing in between on " +
      "purpose: he is putting a thing he can see back where he can see it " +
      "belongs (sim/well-hand.ts). At twelve the hours are the columns " +
      "again, the face is square, the hold is given back and the cycle " +
      "starts over. Nothing tells him when it is home except the picture, so " +
      "the four words are hers: turn it home.",
    source: "touch.ts — wellSeamUnder() under wellUnder()",
    holdKind: "drag",
    dragTarget: "wellSeam",
    sends: ["drag"],
    pose: "THE WELL · WOUND",
  },
];
