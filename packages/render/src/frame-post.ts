/**
 * **What runs over a finished frame, after everything else is drawn.**
 *
 * Nothing, in the game. The record is here so that a pass over the whole
 * frame — a bloom, a grade — can be tried as a VERSUS candidate
 * (`tools/versus/candidates/frame-glow/`) by patching `after`, the way every
 * other candidate patches a field, without the renderer growing a flag, a
 * branch or an optional argument for it. `Canvas2DRenderer.draw` calls it
 * once, last, with the context back at its own transform; the shipped `after`
 * does nothing and so draws nothing, and every frame test is unchanged by it.
 */
export interface FramePost {
  /** Called once per frame, after the stage seam, on the renderer's context. */
  after(ctx: CanvasRenderingContext2D): void;
}

export const FRAME_POST: FramePost = {
  after() {},
};
