import { drawFrontHead } from "./instar-head.js";
import type { Look } from "./instar-plate.js";
import { drawSideHead } from "./instar-side-head.js";
import { drawTurnedHead } from "./instar-turn.js";

/**
 * **THE INSTAR's head, as the one record both views draw it through**: the
 * face-on view's turned head (`drawTurnedHead` over `drawFrontHead`'s two
 * halves) and the profile's (`drawSideHead`). A record so VERSUS can offer
 * another head in both at once (`tools/versus/candidates/instar-head/`); the
 * draw paths call `INSTAR_HEAD.front` and `.side` every frame and never the
 * two drawings directly.
 */
export const INSTAR_HEAD: {
  front: (ctx: CanvasRenderingContext2D, look: Look) => void;
  side: (ctx: CanvasRenderingContext2D, look: Look) => void;
} = {
  front: (ctx, look) =>
    drawTurnedHead(ctx, look.head, look.r, { fade: look.fade, side: look.f.side }, (half) =>
      drawFrontHead(ctx, look, half),
    ),
  side: drawSideHead,
};
