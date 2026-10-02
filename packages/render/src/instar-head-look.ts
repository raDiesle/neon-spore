import { drawFrontHead } from "./instar-head.js";
import type { Look } from "./instar-plate.js";
import { drawSideHead } from "./instar-side-head.js";
import { drawTurnedHead } from "./instar-turn.js";

/**
 * **THE INSTAR's head, as the one record every view draws it through**: the
 * face-on view's turned head (`drawTurnedHead` over `drawFrontHead`'s two
 * halves) and the profile's (`drawSideHead`). A record so VERSUS can offer
 * another head in both at once; the draw paths call `INSTAR_HEAD.front` and
 * `.side` every frame and never the drawings directly.
 *
 * **The head side-on is drawn bigger than the body's unit** — the owner,
 * 1 October 2026, on the four heads VERSUS offered: *keep current, all
 * alternatives look worse. it altogether should be increased.* The body's
 * girth, wings and tail are all in head radii, so it is the profile's head
 * alone that grows (`SIDE_GROW`), by as much of it as the turn has reached:
 * the face-on head keeps its size, for the eye and fire marks are pinned to
 * it (`instar-eye.test.ts`), and through the cross-fade the two heads are
 * the same size where they meet.
 */
export const INSTAR_HEAD: {
  front: (ctx: CanvasRenderingContext2D, look: Look) => void;
  side: (ctx: CanvasRenderingContext2D, look: Look) => void;
} = {
  front: drawInstarFront,
  side: (ctx, look) => drawSideHead(ctx, grown(look)),
};

/** How much bigger the head is side-on than the body's head radius. */
export const SIDE_GROW = 1.3;

/** The look with its head radius grown by as far as the head has turned side-on. */
export function grown(look: Look): Look {
  return { ...look, r: look.r * (1 + (SIDE_GROW - 1) * look.f.side) };
}

/** The shipped face-on head, turned — named so a candidate can keep it. */
export function drawInstarFront(ctx: CanvasRenderingContext2D, look: Look): void {
  drawTurnedHead(ctx, look.head, look.r, { fade: look.fade, side: look.f.side }, (half) =>
    drawFrontHead(ctx, look, half),
  );
}
