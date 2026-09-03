/**
 * Whether the world ticks, and who is holding it still.
 *
 * There are four things that stop the game and they arrive from four places:
 * a thumb on the pause control, the menu being up, the tuning panel being
 * open, and the tab going away. Each of them used to set one boolean, which
 * meant the last one to speak won — closing the panel resumed a game the menu
 * was still covering, and coming back to the tab resumed one somebody had
 * deliberately paused.
 *
 * So a hold is named and the run is the absence of all of them. Nothing here
 * knows what a menu is; it only knows that four names can each be down.
 */
export type Hold =
  /** A thumb on the pause control, or P at a keyboard. Deliberate. */
  | "hand"
  /** The main menu is up. */
  | "menu"
  /** The tuning panel is open. */
  | "panel"
  /** The tab is in the background. Resumes on its own. */
  | "hidden";

export interface RunState {
  running: () => boolean;
  held: (reason: Hold) => boolean;
  /** Put a hold down or take it off. Reports only when the answer changes. */
  hold: (reason: Hold, on: boolean) => void;
  /** Take every hold off. Beat zero in a room is not a moment to argue with. */
  release: () => void;
  /**
   * Told whenever the answer changes.
   *
   * Registered rather than passed in, because the thing that wants to hear it
   * — the pause glyph on the test rig — is built *after* the state it is about,
   * and a callback handed over at construction reached it before it existed.
   */
  onChange: (fn: (running: boolean) => void) => void;
}

export function createRunState(): RunState {
  const holds = new Set<Hold>();
  const listeners: ((running: boolean) => void)[] = [];
  let last = true;

  const settle = (): void => {
    const now = holds.size === 0;
    if (now === last) return;
    last = now;
    for (const fn of listeners) fn(now);
  };

  return {
    running: () => holds.size === 0,
    held: (reason) => holds.has(reason),
    hold: (reason, on) => {
      if (on) holds.add(reason);
      else holds.delete(reason);
      settle();
    },
    release: () => {
      holds.clear();
      settle();
    },
    onChange: (fn) => {
      listeners.push(fn);
    },
  };
}
