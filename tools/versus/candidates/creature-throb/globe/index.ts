import * as throbLook from "../../../../../packages/render/src/throb-look.js";
import { patch, type Variant } from "../../../variant.js";
import { globe } from "./paint.js";

/**
 * `creature:throb` / `globe` — the one body in this game that already turns,
 * turning like a ball instead of like a coin.
 *
 * THE THROB is half one ammunition colour and half the other, and it turns
 * clockwise the whole way down: which half is pointing at the cannon is what a
 * shot meets, and that is the creature. The shipped picture draws the far
 * colour over everything above a straight seam and lets the transform's own
 * rotation carry it round. It is exactly right about the rule and it is a
 * **disc**: a diameter rotating in the picture plane, which is the shape a
 * spinning coin makes and not the shape a spinning ball makes.
 *
 * The difference is not decoration and `docs/dimensional.md` measures it. A
 * body turning about an axis it does not stand on repeats its **width twice**
 * per revolution — the seam swells to the body's full breadth as it comes round
 * to face you and shuts to nothing as it goes edge-on — where a rotation in the
 * picture plane has one period and no width change at all. GLOBE draws the seam
 * as what it actually is: the boundary meridian of the painted hemisphere,
 * projected, which is an ellipse arc whose half-width is `rx·sin α`. The
 * interior marks on the far half narrow with it, the lit rim follows it round
 * the contour, and the terminator sits over both halves in the value half only
 * and does not turn with the body.
 *
 * **Nothing about the rule moves.** `throbTurnMilli` is untouched, the far
 * colour still covers the hemisphere the cannon is not looking at, and the
 * instant the pair can shoot is the instant it was before — the picture argues
 * about what a turning body looks like, not about when a trigger lands.
 *
 * How it can lose, and the pair should be watching for exactly this. **The
 * seam is the readout, and this candidate makes it thin.** Twice a revolution
 * the boundary meridian goes edge-on and the cut narrows to a line a pixel or
 * two wide at 26 px, where the shipped seam is a full diameter at every angle.
 * If the pair find themselves unsure which half is facing them at the moment
 * they have to fire, that is this look, and no amount of thickening the cut
 * fixes it — the narrowing *is* the claim that the body is round.
 */
export const THROB_GLOBE: Variant = {
  slot: "creature:throb",
  name: "globe",
  sentence:
    "the seam is a meridian on a ball rather than a diameter on a coin — it swells to the body's full width and shuts to nothing, twice a turn",
  dir: "tools/versus/candidates/creature-throb/globe",
  patches: [
    patch({
      target: throbLook.THROB_LOOK,
      // No accessor: `drawLiving` reads the export itself. The module namespace
      // is the whole route there is.
      reached: () => throbLook.THROB_LOOK,
      where: {
        file: "packages/render/src/throb-look.ts",
        symbol: "THROB_LOOK",
        type: "ThrobLook",
      },
      fields: { half: globe },
    }),
  ],
};
