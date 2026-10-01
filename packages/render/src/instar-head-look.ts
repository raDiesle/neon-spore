import { drawFrontHead } from "./instar-head.js";
import type { Look } from "./instar-plate.js";
import { drawRigSideHead } from "./instar-rig-head-draw.js";
import { drawSideHead } from "./instar-side-head.js";
import { drawTurnedHead } from "./instar-turn.js";

/**
 * **THE INSTAR's head, as the one record every view draws it through**: the
 * face-on view's turned head (`drawTurnedHead` over `drawFrontHead`'s two
 * halves), the profile's (`drawSideHead`), and the profile's head turned on
 * the idle drift (`turned`, the rig head at `yaw`, `instar-drift.ts`). A
 * record so VERSUS can offer another head in all of them at once
 * (`tools/versus/candidates/instar-head/`); the draw paths call
 * `INSTAR_HEAD.front`, `.side` and `.turned` every frame and never the
 * drawings directly.
 */
export const INSTAR_HEAD: {
  front: (ctx: CanvasRenderingContext2D, look: Look) => void;
  side: (ctx: CanvasRenderingContext2D, look: Look) => void;
  turned: (ctx: CanvasRenderingContext2D, look: Look, yaw: number) => void;
} = {
  front: drawInstarFront,
  side: drawSideHead,
  turned: (ctx, look, yaw) => drawRigSideHead(ctx, look, yaw),
};

/** The shipped face-on head, turned — named so a candidate can keep it. */
export function drawInstarFront(ctx: CanvasRenderingContext2D, look: Look): void {
  drawTurnedHead(ctx, look.head, look.r, { fade: look.fade, side: look.f.side }, (half) =>
    drawFrontHead(ctx, look, half),
  );
}
