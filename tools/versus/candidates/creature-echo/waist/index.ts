import * as echoLook from "../../../../../packages/render/src/echo-look.js";
import { patch, type Variant } from "../../../variant.js";
import { waist } from "./paint.js";

/**
 * `creature:echo` / `waist` — the seam is a meridian on a ball, seen a little
 * off square, that pinches into a waist as the parting comes.
 *
 * **What the shipped side is.** One straight dark line across the body — the
 * seam of a sphere from exactly one angle, and a scratch on a disc from
 * every other.
 *
 * **What this argues.** THE THROB's move, on the body it was made for: the
 * seam as a circle of longitude, bowed because the ball is seen at a tilt,
 * with a near half stroked as the shipped furrow was and a far half thin and
 * faint going round the back. The tilt opens as the strain gathers, so the
 * ring visibly pinches — the necking the contour already does, drawn on the
 * surface too. At rest it is the shipped mark with a bow in it.
 *
 * **How it can lose.** *A ring is a different mark* — a belt or a mouth
 * rather than a furrow — and the far arc is a pixel at 26 px.
 */
export const ECHO_WAIST: Variant = {
  slot: "creature:echo",
  name: "waist",
  sentence:
    "the seam is a meridian on a ball rather than a line on a coin — bowed, with a faint far half going round the back, and pinching into a waist as the parting comes",
  dir: "tools/versus/candidates/creature-echo/waist",
  patches: [
    patch({
      target: echoLook.ECHO_LOOK,
      // No accessor: `drawEchoSeam` reads the export itself. The module
      // namespace is the whole route there is.
      reached: () => echoLook.ECHO_LOOK,
      where: {
        file: "packages/render/src/echo-look.ts",
        symbol: "ECHO_LOOK",
        type: "EchoLook",
      },
      fields: { seam: waist },
    }),
  ],
};
