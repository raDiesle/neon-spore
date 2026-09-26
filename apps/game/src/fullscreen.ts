import { atADesk } from "./at-a-desk.js";
import { readSettings } from "./settings.js";

/**
 * **The browser's own furniture, off the screen** — one call, and the whole of
 * its difficulty is where it is made from.
 *
 * The owner, 19 September 2026: *the game screen is always the core focus for
 * the player to use and 100% fitting.* The manifest has said
 * `"display": "fullscreen"` and `"orientation": "portrait"` for as long as
 * there has been one, and both are right — **and both apply only to the
 * installed shortcut**. A pair who opened a link and never pressed INSTALL,
 * which is the pair the join flow is built for, played inside a tab: an
 * address bar over the picture, a navigation bar under it, and a stage the
 * renderer had to fit into whatever was left.
 *
 * **`requestFullscreen` is refused outside a user gesture**, so this cannot be
 * called from the place that would be tidiest — `onStart`, where both phones
 * arrive at beat zero — because on one of the two phones that moment is a
 * message off the relay and not a thumb. It hangs off the last press this
 * device makes on its own way onto the field instead: the thumb coming *off*
 * its READY circle (`join-room-step.ts`). Not the hold finishing, because the
 * hold finishes inside a `requestAnimationFrame` and a frame callback carries
 * no activation; and not the thumb going down, because the HTML spec counts a
 * `pointerdown` as activation only when its `pointerType` is `"mouse"` — on a
 * phone it is the `pointerup` that grants it, which is why the motion
 * permission was already asked there (`shake.ts`).
 *
 * **Two things ride along and cannot be had any other way.**
 * `screen.orientation.lock` is refused outside fullscreen, and a phone turned
 * sideways mid-wave is a field re-laid-out under four thumbs; and a fullscreen
 * document is the one state in which the platform's edge gestures stop being
 * the first thing a thumb at the edge does.
 *
 * **Nothing here is load-bearing**, for `install.ts`'s reason one floor down:
 * every path fails quietly, because a game that will not start without a
 * fullscreen request is worse than a game with an address bar. iOS Safari on a
 * phone has no element fullscreen at all and will simply never take it.
 */

/**
 * Whether this device can be asked at all. The toggle's `available`, and the
 * guard before every request: a browser without it gets no row, for the reason
 * BUZZ has none where nothing vibrates (`menu-toggles.ts`).
 */
export function canFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  return typeof document.documentElement?.requestFullscreen === "function";
}

/**
 * Whether the press that is about to happen should take the screen.
 *
 * Pure in its arguments so the rule can be read without a DOM. **A desk says
 * no** even with the switch on: a fullscreen desktop window is a hull drawn
 * two feet wide with a column of nothing either side of it, and it is where
 * the game is tested from. `atADesk` is the same `pointer: fine` question the
 * keyboard page and the splash trail ask.
 */
export function wantsFullscreen(on: boolean, atDesk: boolean): boolean {
  return on && !atDesk;
}

/** Whether the document is already showing without the browser around it. */
function alreadyFull(): boolean {
  return document.fullscreenElement !== null;
}

/**
 * Take the screen, from inside a press. Does nothing it is not allowed to do,
 * and says nothing when it is refused.
 */
export function goFullscreen(): void {
  if (!canFullscreen() || alreadyFull()) return;
  if (!wantsFullscreen(readSettings().fullscreen, atADesk())) return;
  void document.documentElement
    .requestFullscreen({ navigationUI: "hide" })
    .then(lockPortrait)
    .catch(() => {});
}

/**
 * Give it back, for the switch going off — the one way out a player who cannot
 * find the platform's own is left with.
 */
export function leaveFullscreen(): void {
  if (typeof document === "undefined" || !alreadyFull()) return;
  unlockPortrait();
  void document.exitFullscreen().catch(() => {});
}

/**
 * Portrait, while the screen is ours. Behind a guard rather than a `try`
 * because `screen.orientation` is absent on desktop Safari entirely, and
 * `lock` is absent where the rest of it is present.
 */
function lockPortrait(): void {
  const orientation = screen.orientation as ScreenOrientation | undefined;
  if (typeof orientation?.lock !== "function") return;
  void orientation.lock("portrait").catch(() => {});
}

function unlockPortrait(): void {
  const orientation = screen.orientation as ScreenOrientation | undefined;
  if (typeof orientation?.unlock !== "function") return;
  try {
    orientation.unlock();
  } catch {
    // A browser that will not unlock never locked.
  }
}
