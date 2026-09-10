import * as throbLook from "../../../../../packages/render/src/throb-look.js";
import { patch, type Variant } from "../../../variant.js";
import { cap } from "./paint.js";

/**
 * `creature:throb` / `cap` — the far colour is a shell: a cap with a
 * thickness, and where it ends you see its cut edge.
 *
 * **What the shipped side is.** Paint. The far colour is laid on the ball
 * inside its meridian and has no edge, so nothing about the body says the two
 * halves are two *materials* — which is what a throb is: half a coloured
 * body and half a shell over it.
 *
 * **What this argues.** That the far half should be a cap — PLATE off the
 * shapes page, cut to the body's own contour as a second border and never a
 * ring round it — standing a little proud of the near half, and that the
 * wall where the cap stops should be drawn: a crescent of the cap's own dark
 * material along the meridian, as wide as the cap is thick times how
 * squarely the cut face is turned to us. That width is the whole claim. The
 * cut face is edge-on when the meridian runs down the middle and faces us
 * when the meridian is out at the limb, so the wall swells from nothing to
 * its full thickness and back twice a revolution, and takes a lit line on
 * the flank toward the key. The interior marks and the light pass are the
 * shipped ones.
 *
 * **How it can lose.** *The lip changes the silhouette.* A cap eight percent
 * larger than the body is a contour that breathes as the body turns, and a
 * contour is what a pair names a creature by. If at the pair the throb stops
 * reading as the same shape as the slick it is made of, the lip goes and the
 * wall alone has to carry it.
 */
export const THROB_CAP: Variant = {
  slot: "creature:throb",
  name: "cap",
  sentence:
    "the far colour as a shell cap standing proud of the body, its cut edge showing as a wall that swells from nothing to its full thickness and back twice a turn — a shell on a ball, not paint on one",
  dir: "tools/versus/candidates/creature-throb/cap",
  patches: [
    patch({
      target: throbLook.THROB_LOOK,
      // No accessor: `living-draw.ts` reads the export itself. The module
      // namespace is the whole route there is.
      reached: () => throbLook.THROB_LOOK,
      where: {
        file: "packages/render/src/throb-look.ts",
        symbol: "THROB_LOOK",
        type: "ThrobLook",
      },
      fields: { half: cap },
    }),
  ],
};
