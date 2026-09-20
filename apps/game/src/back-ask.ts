/**
 * **The phone's back gesture asks rather than leaves.**
 *
 * The owner, 18 September 2026: *"When in game (no director) website I press
 * back button, It should not go back to previous website, but open as if menu
 * button was pressed, so it should ask: do you want to go back to menu or quit
 * game, or continue playing."* On a handset back is an edge swipe, which is to
 * say it is easy to do by accident with both thumbs on the glass — and what it
 * did was leave the page mid-run, with the room still open on the other phone.
 *
 * **Three buttons over the field, and not the menu**, the owner's own answer
 * of 19 September 2026 against this file's first recommendation. The three are
 * three different things: CONTINUE PLAYING puts the question away, BACK TO
 * MENU opens the menu over a run that is still there, and QUIT GAME ends the
 * run — on both phones, since 20 September 2026 the `quit` command is read on
 * a live wave and not only on the lost screen (`sim/commands.ts`), and the
 * screen after it is the one a quit always led to (`quit.ts`, `shell.ts`).
 *
 * **The objection, and the answer to it.** `confirm.ts`: *"A dialog is an
 * overlay to dismiss, it steals the back gesture"* — a question the gesture
 * opened cannot also be a question the gesture closes without a second entry
 * to burn. So there is no second entry: **every pop pushes the guard straight
 * back**, and the player is parked on it for as long as the page is open. The
 * stack is two entries deep and stays two deep — a pop truncates whatever was
 * forward of it and the push puts one back — so the gesture works the second
 * time, and the hundredth.
 *
 * **What a pop means is one step out**, which is why the menu is asked first:
 * back with the menu up closes the menu, the way its own ✕ does, rather than
 * standing a question behind it. Every other screen over the field — the room
 * screen, the intro, the bad-line card — gets the question over it, and
 * CONTINUE PLAYING puts it away with nothing lost.
 *
 * `sign-in.ts`'s `history.replaceState` stays a replace: pushing there would
 * put a sign-in nobody can return to in the stack.
 */

/**
 * The browser's history, behind a seam — the way `confirm.ts` puts one in
 * front of the clock. A test drives a stack of its own rather than a browser,
 * and this file never touches a global.
 */
export interface BackStack {
  /** Put the entry the gesture pops back on top of the stack. */
  push: () => void;
  /** Told whenever the gesture popped one. */
  onPop: (fn: () => void) => void;
}

/** The real one. `location.href` and no title: the address does not change —
 * what is pushed is somewhere to go back *from*. */
export function browserStack(): BackStack {
  return {
    push: () => history.pushState({ neonBack: 1 }, "", location.href),
    onPop: (fn) => window.addEventListener("popstate", fn),
  };
}

export interface BackAskParts {
  /** Whether the menu is up, and the way to put it down: a pop with the menu
   * open is the menu's own ✕ rather than a question behind it. */
  menuOpen: () => boolean;
  closeMenu: () => void;
  openMenu: () => void;
  /** End the run on both seats — the same command the lost screen's QUIT
   * gives (`lost.ts`), which the simulation now reads mid-wave too. */
  quit: () => void;
  /** The world's hold while the question stands. Off the wire only: in a room
   * the tick is the pair's shared clock and one device may not stop it
   * (`menu.ts` keeps the same rule for the same reason). */
  hold: (on: boolean) => void;
  inRoom: () => boolean;
  /** Swappable for a test. */
  stack?: BackStack;
}

export interface BackAsk {
  /** Whether the question stands. */
  isOpen: () => boolean;
  /** CONTINUE PLAYING, by any road. */
  close: () => void;
}

/** What a pop means, given what is already on the screen. Pure, so the rule
 * can be read and tested without a history to pop. */
export type BackAnswer = "continue" | "closeMenu" | "ask";

export function backAnswer(asking: boolean, menuOpen: boolean): BackAnswer {
  if (asking) return "continue";
  if (menuOpen) return "closeMenu";
  return "ask";
}

export function bindBackAsk(p: BackAskParts): BackAsk {
  const stack = p.stack ?? browserStack();
  const root = document.getElementById("backAsk");
  let asking = false;

  const close = (): void => {
    if (!asking) return;
    asking = false;
    root?.classList.remove("on");
    p.hold(false);
  };
  const ask = (): void => {
    asking = true;
    root?.classList.add("on");
    p.hold(!p.inRoom());
  };
  /** Every answer puts the question away first: the field is behind it, and
   * whatever the press opens is about to be in front of it. */
  const answer = (then: () => void): void => {
    close();
    then();
  };

  document.getElementById("backStay")?.addEventListener("click", () => close());
  document.getElementById("backMenu")?.addEventListener("click", () => answer(p.openMenu));
  document.getElementById("backQuit")?.addEventListener("click", () => answer(p.quit));

  stack.onPop(() => {
    // The entry goes back before anything is decided, so the gesture is live
    // again whatever this press turns out to have meant.
    stack.push();
    const what = backAnswer(asking, p.menuOpen());
    if (what === "continue") close();
    else if (what === "closeMenu") p.closeMenu();
    else ask();
  });
  stack.push();

  return { isOpen: () => asking, close };
}
