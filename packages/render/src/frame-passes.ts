/**
 * The five passes `Canvas2DRenderer.draw` assembles a frame from, in the
 * order a reader looks for them: the field's back, the bodies on it, the
 * ship and its controls, what is stuck to the finished ship, and the overlays
 * on top of a finished frame. Every
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
 * The fifth, `frame-on-ship.ts`, came later and from the renderer itself: the
 * bodies that stick to the finished ship, one call per creature, had taken
 * `canvas2d.ts` to the same ceiling.
 */

export { drawBodies, drawFieldBack } from "./frame-field.js";
export { drawOnShip } from "./frame-on-ship.js";
export { drawOverlays, drawShip, type OverlayState } from "./frame-ship.js";
// And the one question that takes two of the four away: THE WELL replaces the
// field's back and its bodies on the screen it is drawn on, and the renderer
// has to ask the same question the passes do to place the bursts it ingests
// (`well.ts`).
export { wellShown } from "./well.js";
