/**
 * WIPE A WHOLE SURFACE, WHATEVER TRANSFORM IS ON IT.
 *
 * Every overlay in this repository is sized in device pixels and then drawn in
 * CSS pixels: `canvas.width = w * dpr`, followed by `setTransform(dpr, 0, 0,
 * dpr, 0, 0)` so the drawing code can go on thinking in the units the layout
 * is in. Clearing it is the one call that must not think in those units —
 * `clearRect` is transformed like anything else, so
 *
 *     ctx.clearRect(0, 0, canvas.width, canvas.height)
 *
 * asks for a rectangle `width × dpr` device pixels across. Above a ratio of
 * one that is merely wasteful. **Below one it does not cover the surface**: a
 * desk zoomed out to 80% reports `devicePixelRatio` 0.8, the wipe reaches 64%
 * of the way across, and everything drawn in the right-hand strip and the
 * bottom band survives every frame — the mouse's ink was found stuck there,
 * on the right of the director's field and along the bottom of it, with no
 * frame able to take it off again.
 *
 * So the wipe is done in device pixels, under the identity transform, and the
 * caller's own transform is put back. Three surfaces clear themselves this way
 * (`apps/game/src/trail.ts`, `tools/director/src/stage-trail.ts` and
 * `tools/director/src/scene-art.ts`); it is one function so that the rule is
 * called rather than re-derived a fourth time.
 */
export function clearSurface(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}
