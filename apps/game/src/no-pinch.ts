/**
 * **Two fingers never zoom the page.** Safari has ignored `user-scalable=no`
 * since iOS 10, so the viewport tag in `index.html` asks and is not obeyed,
 * and `touch-action: none` in `game.css` is read by the pointer path but not
 * by WebKit's own pinch. A pinch that scales the page mid-wave leaves the stage
 * the renderer measured half off the glass, and several creatures are played
 * with two thumbs down at once.
 *
 * WebKit's `gesturestart` and `gesturechange` are the pinch itself, and a
 * `preventDefault` on them is the one refusal it honours — from a listener that
 * is not passive, or the call is ignored. The long-press callout is the other
 * half of the same leak and is refused in the stylesheet
 * (`-webkit-touch-callout`, `game.css`).
 */

/** The part of a `document` this needs, so a test can hand in a stub. */
export interface GestureTarget {
  addEventListener: (
    type: string,
    fn: (e: { preventDefault: () => void }) => void,
    options: { passive: false },
  ) => void;
}

export function refusePinch(target: GestureTarget = document): void {
  const refuse = (e: { preventDefault: () => void }): void => e.preventDefault();
  target.addEventListener("gesturestart", refuse, { passive: false });
  target.addEventListener("gesturechange", refuse, { passive: false });
}
