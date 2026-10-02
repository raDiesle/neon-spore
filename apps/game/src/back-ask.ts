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
 * **Back walks out one screen at a time: the question, then the menu.** The
 * owner, 29 September 2026: *"when i click back browser button in game
 * playing it, it first should open ideally the overlay menu, then again back
 * the game menu, not leave the game completely."* So a pop over the field
 * asks, a pop over the question is BACK TO MENU, and a pop over the menu stays
 * on the menu — it is the game's front door. Every other screen over the
 * field (the room screen, the intro, the bad-line card) gets the question.
 *
 * **A device in the rig goes straight to the wave list.** The owner, 2 October
 * 2026: *"when i am in game app, and i press back, i want to directly see list
 * of waves."* A tester's back is a wish for another wave, never to quit one,
 * so with test mode on (`test-mode.ts`) every pop opens JUMP TO WAVE — over
 * the field, over the question, over any other page of the menu — and the
 * question is never asked. A player's back is unchanged: the rig is the only
 * place a wave list exists.
 *
 * **The entries are pushed from inside a press, never from a pop.** This file
 * used to push one at load and push it straight back on every pop, and Chrome
 * reads both as a page trapping its visitor: an entry added without the
 * player's own press marks the one under it to be skipped by the back button
 * (the "history manipulation intervention"). So the first back could leave,
 * and the second always did. Now each press the browser counts as the
 * player's tops the stack up to `GUARD_DEPTH` entries above the page's own,
 * and a pop only spends one: the question and the menu are two presses of
 * back that stay in the game. The player taps the glass all run long, so the
 * stack is full again long before the next back.
 *
 * **Which entry the page is on is written in it** (`history.state`), not
 * counted here: a reload keeps the stack, and a count kept in memory would
 * push a second set on top of the first.
 *
 * `sign-in.ts`'s `history.replaceState` stays a replace and keeps the state it
 * replaces: pushing there would put a sign-in nobody can return to in the
 * stack, and dropping the state would lose the count.
 */

/** Two backs stay in the game — the question, then the menu. */
export const GUARD_DEPTH = 2;

/**
 * The browser's history, behind a seam — the way `confirm.ts` puts one in
 * front of the clock. A test drives a stack of its own rather than a browser,
 * and this file never touches a global.
 */
export interface BackStack {
  /** How many of this page's entries are under the one it is on. */
  depth: () => number;
  /** Put one more entry on top, the `depth`-th. */
  push: (depth: number) => void;
  /** Told whenever the gesture popped one. */
  onPop: (fn: () => void) => void;
  /** Told after every press the browser counts as the player's own — the only
   * moment a push is not one the back button skips. */
  onPress: (fn: () => void) => void;
}

/** The events that give a page user activation in Chrome: a touch counts at
 * its end, not its start, and Escape never counts. */
const PRESSES = ["pointerup", "click", "keydown"] as const;

/** The real one. `location.href` and no title: the address does not change —
 * what is pushed is somewhere to go back *from*. */
export function browserStack(): BackStack {
  return {
    depth: () => {
      const at = (history.state as { neonBack?: unknown } | null)?.neonBack;
      return typeof at === "number" ? at : 0;
    },
    push: (depth) => history.pushState({ neonBack: depth }, "", location.href),
    onPop: (fn) => window.addEventListener("popstate", fn),
    onPress: (fn) => {
      for (const type of PRESSES) {
        window.addEventListener(
          type,
          (e) => {
            if (e instanceof KeyboardEvent && e.key === "Escape") return;
            fn();
          },
          { capture: true, passive: true },
        );
      }
    },
  };
}

export interface BackAskParts {
  /** Whether the menu is up: a pop over it stays on it. */
  menuOpen: () => boolean;
  openMenu: () => void;
  /** Whether this device is in the rig (`test-mode.ts`): its pop is the list. */
  testMode: () => boolean;
  /** The menu, on JUMP TO WAVE. */
  openWaves: () => void;
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
export type BackAnswer = "ask" | "menu" | "stay" | "waves";

export function backAnswer(asking: boolean, menuOpen: boolean, testMode = false): BackAnswer {
  if (testMode) return "waves";
  if (asking) return "menu";
  if (menuOpen) return "stay";
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

  stack.onPress(() => {
    for (let at = stack.depth(); at < GUARD_DEPTH; at++) stack.push(at + 1);
  });
  stack.onPop(() => {
    // Nothing is pushed back here: a push from a pop is the one the back
    // button skips. The next press puts it back.
    const what = backAnswer(asking, p.menuOpen(), p.testMode());
    if (what === "waves") answer(p.openWaves);
    else if (what === "menu") answer(p.openMenu);
    else if (what === "ask") ask();
  });

  return { isOpen: () => asking, close };
}
