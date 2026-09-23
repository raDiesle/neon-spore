import type { RunState } from "./run-state.js";

/**
 * **The tab going away is a hold** (`run-state.ts`), and this is where it is
 * put down and taken off.
 *
 * Pausing when the tab goes away keeps a returning player from being buried
 * under a burst of catch-up ticks — and coming back resumes on its own, unless
 * another hold is still down, which is the point of naming them.
 *
 * It lived in `bindTestControls` until 23 September 2026, which made the
 * game's own pause a side effect of the tuning panel being wired: a build
 * without the rig would have ticked in a background tab. It is bound from
 * `main.ts` beside the run it holds.
 *
 * **An agent's browser pane reports `hidden` while the pane is not on
 * screen**, so a preview opened there does not tick until it is shown —
 * `document.visibilityState` in the page says which (`docs/working-with-claude.md`).
 */
export function bindHiddenHold(run: RunState, doc: Document = document): void {
  const follow = (): void => run.hold("hidden", doc.hidden);
  doc.addEventListener("visibilitychange", follow);
  follow();
}
