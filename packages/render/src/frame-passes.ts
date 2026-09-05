/**
 * The four passes `Canvas2DRenderer.draw` assembles a frame from, in the
 * order a reader looks for them: the field's back, the bodies on it, the
 * ship and its controls, and the overlays on top of a finished frame. Every
 * call here is one this file's caller used to make directly — the split
 * moves lines, not behaviour, so nothing about what is drawn or when may
 * change without also changing `packages/render/test/frame.test.ts`.
 *
 * **The barrel, and only the barrel.** The passes themselves are next door in
 * `frame-field.ts` and `frame-ship.ts`: this file reached the 250-line ceiling
 * when THE LOCK's dotted line wanted one parameter and four lines of comment,
 * and paying for them took two rounds of shaving sentences out of a comment
 * belonging to something else. The cut is where the four already read as two —
 * two about the field, two about the ship, sharing nothing but their arguments
 * — and it stays a barrel so that nothing reaching for a pass through it moved.
 */

export { drawBodies, drawFieldBack } from "./frame-field.js";
export { drawOverlays, drawShip, type OverlayState } from "./frame-ship.js";
