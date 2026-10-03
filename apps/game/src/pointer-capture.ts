/**
 * **Capture a pointer if the browser will let us, and answer the press
 * either way.**
 *
 * `setPointerCapture` throws `NotFoundError` for a pointer id the browser has
 * no live pointer for — which is every synthetic `PointerEvent` but the
 * mouse's own `1`. Called bare in the `pointerdown` listener, the throw ended
 * the listener before the press reached `down()`, and nothing said so: a lane
 * verifying THE GRINDSTONE's hold by dispatching presses at the stage spent
 * fifteen minutes reading a dropped press as the fix not working.
 *
 * Capture is what keeps a drag answered once it leaves the canvas; without
 * it the press still lands, it is only not followed off the edge. So a
 * refusal costs the follow and never the press. Returns whether it took.
 */
export function capture(
  target: { setPointerCapture(id: number): void },
  pointerId: number,
): boolean {
  try {
    target.setPointerCapture(pointerId);
    return true;
  } catch {
    return false;
  }
}
